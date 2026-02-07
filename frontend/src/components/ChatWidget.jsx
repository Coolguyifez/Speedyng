import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { LuMessageCircleMore } from "react-icons/lu";
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { vehicleAPI } from '../services/api';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const navigate = useNavigate();
  
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  
  // State Machine for Multi-turn Conversation
  const [chatState, setChatState] = useState({
    stage: 'general', // Stages: 'general', 'awaiting_model', 'awaiting_budget'
    tempBrand: null,
    tempModel: null
  });

  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm Speedy Assist, your AI Automotive advisor. How can I help you find your perfect Vehicle today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  
  
  // Get logged-in user info safely
  const user = JSON.parse(localStorage.getItem('user'));
  
 

  // 1. Fetch real cars and Load Chat History on mount
  useEffect(() => {
    const initData = async () => {
      try {
        const response = await vehicleAPI.getAll();
        setAvailableVehicles(response.data || []);
  
        if (user) {
          const historyResponse = await vehicleAPI.getChatHistory(user.id);
          if (historyResponse.data && historyResponse.data.length > 0) {
            // Map 'content' from database back to 'text' for display
            const formattedHistory = historyResponse.data.map(msg => ({
              ...msg,
              text: msg.content // Ensure the UI sees the 'text' property
            }));
            setMessages(formattedHistory);
          }
        }
      } catch (error) {
        console.error("Initialization error:", error);
      }
    };
    initData();
  }, [user?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Listen for signal from Contact Page
  useEffect(() => {
    const handleExternalOpen = () => {
      setIsOpen(true);
      setTimeout(scrollToBottom, 500);
    };

    window.addEventListener('open-speedy-chat', handleExternalOpen);
    return () => window.removeEventListener('open-speedy-chat', handleExternalOpen);
  }, []);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  // 2. THE AI ENGINE (Keywords + Budget Search)
  const getLegitResponse = (text) => {
    const input = text.toLowerCase();
    
    // Helper to separate UI from DB Text
    const formatResponse = (ui, dbText) => ({
      ui: ui,
      text: dbText || ui 
    });

    // 1. RENTAL VEHICLE LOGIC
    if (input.includes('rent') || input.includes('hiring')) {
      const rentalVehicles = availableVehicles.filter(v => 
        v.category?.toLowerCase() === 'rent' || v.type?.toLowerCase() === 'rent'
      );

      if (rentalVehicles.length > 0) {
        const names = rentalVehicle.map(v => v.name).join(", ");
        return formatResponse(
          <span>
            Yes, we have vehicles available for rent! 🚗 <br />
            <strong>Note:</strong> The prices listed for rental vehicles are <b>strictly non-negotiable</b>. 
            Here are our available options:
            {rentalVehicles.map(v => (
              <button key={v.id} onClick={() => navigate(`/vehicle/${v.id}`)} className="text-red-600 underline block text-xs mt-1 font-semibold">
                {v.name} - ₦{v.price.toLocaleString()}/day
              </button>
            ))}
          </span>
          `Yes, we have vehicles available for rent! Note: The Prices listed for rental vehicle are strictly non-negotiable. Here are our available options: ${names}.`
        );
      }
      return formatResponse("Currently, we don't have any vehicles listed for rent. Please check back later or browse our vehicles for sale!");
      }
    }

    // 2. BUDGET VEHICLE LOGIC (Searching for a specific category)
    if (input.includes('budget car') || input.includes('budget Vehicle') || input.includes('cheap') || input.includes('affordable')) {
      const budgetVehicles = availableVehicles.filter(v => 
        v.category?.toLowerCase() === 'budget' || v.price < 5000000 // Example: Under 5M is "budget"
      ).sort((a, b) => a.price - b.price);

      if (budgetVehicles.length > 0) {
        const names = budgetVehicles.slice(0, 3).map(v => v.name).join(", ");
        return formatResponse(
          <span>
            I found some great budget-friendly options for you:
            {budgetVehicles.slice(0, 3).map(v => (
              <button key={v.id} onClick={() => navigate(`/vehicle/${v.id}`)} className="text-red-600 underline block text-xs mt-1">
                {v.name} - ₦{(v.price / 1000000).toFixed(1)}M
              </button>
            ))}
          </span>
          `I found some great budget-friendly options for you: ${names}.`
        );
      }
    }

    // 3. EXISTING BUDGET FLOW: IF AWAITING BUDGET (Stage 3)
    if (chatState.stage === 'awaiting_budget') {
      const moneyMatch = input.match(/(\d+)\s*(million|m|000,000)/i) || input.match(/₦?\s*(\d+)/);
      if (moneyMatch) {
        const rawNumber = parseInt(moneyMatch[1]);
        const budget = rawNumber < 1000 ? rawNumber * 1000000 : rawNumber;
        const modelName = chatState.tempModel;
        const brandName = chatState.tempBrand;

        setChatState({ stage: 'general', tempBrand: null, tempModel: null });
        
        const results = availableVehicles.find(v => 
          v.name.toLowerCase().includes(brandName.toLowerCase()) && 
          (modelName === 'vehicle' ? true : v.name.toLowerCase().includes(modelName.toLowerCase())) &&
          v.price <= budget                                       
        ).sort((a, b) => b.price - a.price);

        if (results.lenghth > 0) {
          const exactMatch = results.find(v => modelName !== 'vehicle' && v.name.toLowerCase().includes(modelName.toLowerCase()));
          if (exactMatch) {
            return formatResponse(
              <span>
                Oh well, we have the <b>{exactMatch.name}</b> 
                <button onClick={() => navigate(`/vehicle/${exactMatch.id}`)} className="text-red-600 underline font-bold mx-1">
                  link here
                </button> 
                at ₦{(exactMatch.price / 1000000).toFixed(1)}M.
              </span>
              `Oh well, we have the ${exactMatch.name} at ₦{(exactMatch.price / 1000000).toFixed(1)}M.`
            );
          }
          return formatResponse(
            <span>
              Based on your budget, check these out:
              {results.slice(0, 3).map(v => (
                <button key={v.id} onClick={() => navigate(`/vehicle/${v.id}`)} className="text-red-600 underline block text-xs mt-1">
                  {v.name} - ₦{(v.price/1000000).toFixed(1)}M
                </button>
              ))}
            </span>,
            `Based on your budget, I found ${results.length} vehicles available.`
          );
        } else {
          return formatResponse(`We don't have any ${brandName} vehicles within that budget right now. Would you like to try a different brand?`);
        }
      }
    }
      
    

    //MODEL FLOW: IF AWAITING MODEL NAME
    if (chatState.stage === 'awaiting_model') {
      // If user said "no", "none", etc.
      if (input.includes('no') || input.includes('none') || input.includes('not really')) {
        // We still need their budget! 
        // We set tempModel to 'vehicle' so Stage 3 knows to search the whole brand.
        setChatState({ ...chatState, stage: 'awaiting_budget', tempModel: 'vehicle' });
        
        return formatResponse(
          `No problem! I can show you all our available ${chatState.tempBrand}s. What is your budget for this purchase?`
        );
      }
      // If they gave a specific name (e.g., "Camry")
      setChatState({ ...chatState, stage: 'awaiting_budget', tempModel: input });
      return formatResponse(`Got it, a ${input}. What is your budget for that?`);
    }

    // 3. STARTING FLOW: GENERAL BRAND & FEATURE SEARCH
    if (input.match(/budget|cost|price/) && !input.match(/(\d+)/)) {
      return formatResponse("What specific brand are you looking for?");
    }

    const knownBrands = [...new Set(availableVehicles.map(v => v.name.split(' ')[0].toLowerCase()))];
    const foundBrand = knownBrands.find(b => input.includes(b));

    if (foundBrand) {
      const brandVehicles = availableVehicles.filter(v => v.name.toLowerCase().startsWith(foundBrand));
      const specificMatch = brandVehicles.find(v => input.includes(v.name.toLowerCase()));
      
      if (specificMatch) {
        return formatResponse(
          <span>
            Yes! Check the <button onClick={() => navigate(`/vehicle/${specificMatch.id}`)} className="text-red-600 underline font-bold mx-1">{specificMatch.name}</button> 
            Features: {specificMatch.features || "High performance and verified condition."}
          </span>,
          `Yes! Check the ${specificMatch.name}. Features: ${specificMatch.features || "High performance and verified condition."}`
        );
      }

      setChatState({ stage: 'awaiting_model', tempBrand: foundBrand });
      return formatResponse(`We have ${brandVehicles.length} ${foundBrand.toUpperCase()} models. Do you have a specific vehicle name in mind (Make and Model)?`);
    }

    // 4. BRAND NOT FOUND
    if (input.includes('brand')) {
      const others = availableVehicles.slice(0, 3);
      const otherNames = others.map(v => v.name).join(", ");
      return formatResponse(
        <span>
          We don't have that particular brand. I suggest these other brands we have:
          {others.map(v => (
             <button key={v.id} onClick={() => navigate(`/vehicle/${v.id}`)} className="text-red-600 underline block text-xs mt-1 font-semibold">
             {v.name} - Features: {v.features?.substring(0, 40)}...
           </button>
          ))}
        </span>,
        `We don't have that particular brand. I suggest checking out these alternatives: ${otherNames}.`
      );
    }
    // KEYWORD LOGIC
    if (input.includes('scam') || input.includes('legit') || input.includes('safe') || input.includes('fraud')) return "Speedy is a verified  broker platform. We inspect every vehicle before listing!";
    if (input.includes('installment') || input.includes('payment plan') || input.includes('credit')) return "Currently, we mostly accept full payments only. Check back soon for 'Pay on credit' options!";
    if (input.includes('location') || input.includes('where') || input.includes('see')) return "Our Offices are in Benin and Warri, but we are available nationwide! Check our contact page for more information.";
    if (
      input.includes('inspect') || 
      input.includes('see the car') || 
      input.includes('see the vehicle') || 
      input.includes('see the truck') || 
      input.includes('see the bus') || 
      input.includes('see the tricycle') || 
      input.includes('see the pick up truck') || 
      input.includes('see the van') || 
      input.includes('see the motorcycle') || 
      input.includes('see the bike') ||
    ) {
      return "We arrange inspections before payment. A small inspection fee may apply based on your location, but note that there's no refund after inspection.";
    }
    if (input.includes('sell') || input.includes('agent')) return "Yes! We help you sell faster and bring the right buyer to you. Contact us now at 0901254080 or 07056117175 to list your car and make arrangements.";
    if (input.includes('foreign used') || input.includes('nigeria used') || input.includes('brand new')) return "I'd be happy to help! We have many vehicles in stock. Check out the 'Condition' filter on our vehicle page to see everything from brand new to Nigeria used.";
    if (input.includes('hello') || input.includes('hi') || input.includes('Yes')) return "Hi there! I'm Speedy Assist. I can help you find your specific Vehicle brand or type base on your budget. just ask me!😉";
    return "Thank you for Choosing speedy today for any more information type "hello";
  };

  // 3. HANDLE SEND & SAVE
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const currentInput = inputValue;
    const userTimestamp = new Date().toISOString();

    // 1. UI Update for User
    setMessages(prev => [...prev, {
      text: currentInput,
      sender: 'user',
      timestamp: userTimestamp
    }]);
    setInputValue('');

    // 2. Save User Message
    try {
      await vehicleAPI.saveChatMessage({
        content: currentInput,
        sender: 'user',
        timestamp: userTimestamp
      });
    } catch (err) {
      console.error("Failed to save user message:", err);
    }

    // 3. Generate, Display, and Save Bot Response
    setTimeout(async () => {
      const botReplyContent = getLegitResponse(currentInput);
      const botTimestamp = new Date().toISOString();

      // Show in UI immediately (allows JSX/Buttons to work)
      setMessages(prev => [...prev, { 
        text: botReplyContent, 
        sender: 'bot', 
        timestamp: botTimestamp 
      }]);

      // --- NEW LOGIC TO CAPTURE ACTUAL WORDS ---
      let dbContent = "";

      if (typeof botReplyContent === 'string') {
        dbContent = botReplyContent;
      } else if (React.isValidElement(botReplyContent)) {
        // If it's JSX (like the search results), we try to extract the main text
        // This looks for the text inside the <span> tags you used in getLegitResponse
        try {
          const children = botReplyContent.props.children;
          // We flatten the children to get the text parts specifically
          dbContent = React.Children.toArray(children)
            .filter(child => typeof child === 'string')
            .join(' ') || `Results for ${currentInput}`;
        } catch (e) {
          dbContent = `Found vehicles matching: ${currentInput}`;
        }
      }

      try {
        await vehicleAPI.saveChatMessage({
          content: dbContent.trim(), // Saves the actual words found
          sender: 'bot',
          timestamp: botTimestamp
        });
      } catch (err) {
        console.error("Save bot msg error:", err);
      }
    }, 800);
  };
  const handleToggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  };

   // IF NO USER has signed in, DO NOT RENDER(Show) ANYTHING
 if (!user) {
    return null;
  }
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={handleToggleChat}
          className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        >
          <LuMessageCircleMore className="w-6 h-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-2xl w-96 h-[500px] flex flex-col animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <LuMessageCircleMore className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Speedy Assist</h3>
                <p className="text-xs text-white/80">AI Vehicle Advisor</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={message.id || index}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-red-600 text-white'
                      : 'bg-white text-gray-800 shadow-sm border border-gray-200'
                  }`}
                >
                 <div className="text-sm leading-relaxed">
                         {/* This is the key: it handles strings from DB 
                    and JSX from the live engine automatically 
                */}
                   
                    {message.text}
                  </div>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-white/70' : 'text-gray-400'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about vehicles, prices, features or budget..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
              <Button
                onClick={handleSendMessage}
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white transition-colors duration-300"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
