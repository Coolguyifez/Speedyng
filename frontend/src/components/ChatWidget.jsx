import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { LuMessageCircleMore } from "react-icons/lu";
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { vehicleAPI } from '../services/api';
const SPEEDY_SERVICES = {
  RENTAL: ['rent', 'rental', 'hiring'],
  LEASE: ['lease', 'leasing'],
  BUDGET: ['budget', 'cheap', 'affordable']
};
const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
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
  }, [messages, isOpen, isTyping]);

  // 2. THE AI ENGINE (Keywords + Budget Search)
  const getLegitResponse = (text) => {
    // SAFEGUARD: Ensure 'text' is a valid string before processing
    const safeText = typeof text === 'string' ? text : "";
    const input = safeText.toLowerCase().trim();
    
    // Helper to separate UI from DB Text
    const formatResponse = (ui, dbText) => ({
      ui: ui,
      text: dbText || ui 
    });

    // Price shorthand helper for AI text
    const aiFormatPrice = (num) => {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
      return num.toLocaleString();
    };

    // If input is empty after trimming
    if (!input) return formatResponse("I'm here to help! What kind of vehicle are you looking for?");

    const isLeaseQuery = SPEEDY_SERVICES.LEASE.some(k => input.includes(k));
    const isRentQuery = SPEEDY_SERVICES.RENTAL.some(k => input.includes(k));
    const isBudgetQuery = SPEEDY_SERVICES.BUDGET.some(k => input.includes(k));

    // 1. RENT & LEASE LOGIC
    if (isLeaseQuery || isRentQuery) {
      const filtered = availableVehicles.filter(v => {
        const vService = (v.service || "").toLowerCase();
        return isLeaseQuery 
          ? SPEEDY_SERVICES.LEASE.some(s => vService.includes(s))
          : SPEEDY_SERVICES.RENTAL.some(s => vService.includes(s));
      });

      if (filtered.length > 0) {
        const title = isLeaseQuery ? "Speedy Lease Service 📄" : "Speedy Rental Service 🚗";
        return formatResponse(
          <span>
            <strong className="text-red-600">{title}</strong><br/>
            {filtered.slice(0, 5).map(v => (
              <button key={v.id} onClick={() => navigate(`/vehicle/${v.id}`)} className="text-red-700 underline block text-xs mt-1 font-semibold text-left">
                {v.name} - {isLeaseQuery ? "View Lease Terms" : `₦${v.price.toLocaleString()}/month`}
              </button>
            ))}
          </span>,
          `I found ${filtered.length} vehicles available for ${isLeaseQuery ? 'lease' : 'rent'}.`
        );
      }
      return formatResponse(`We don't have any vehicles listed for ${isLeaseQuery ? 'lease' : 'rent'} at the moment.`);
    }
    // 2. BUDGET VEHICLE LOGIC (Searching for a specific category)
    if (isBudgetQuery && chatState.stage === 'general') {
      const budgetVehicles = availableVehicles.filter(v => 
        SPEEDY_SERVICES.BUDGET.includes(v.category?.toLowerCase()) || v.price < 50000000
      ).sort((a, b) => a.price - b.price);

      if (budgetVehicles.length > 0) {
        const names = budgetVehicles.slice(0, 40).map(v => v.name).join(", ");
        return formatResponse(
          <span>
            <strong className="text-red-600">Speedy Budget Sales 💰</strong><br/>
            Affordable options for purchase:
            {budgetVehicles.slice(0, 3).map(v => (
              <button key={v.id} onClick={() => navigate(`/vehicle/${v.id}`)} className="text-red-700 underline block text-xs mt-1 text-left font-semibold">
                {v.name} - ₦{aiFormatPrice(v.price)}
              </button>
            ))}
          </span>,
          `Speedy Budget Sales 💰: ${names}`
        );
      }
    }
    //TOP PRIORITY: FAQ & TRUST KEYWORDS
    if (input.match(/scam|legit|safe|fraud|trust/)) {
      return formatResponse("Speedy is a verified broker platform. We physically inspect every vehicle and verify documents before listing to ensure your safety!");
    }

    if (input.match(/location|where|office|address/)) {
      return formatResponse("Our main offices are in Benin and Warri, but we are available nationwide! Check our contact page for more information.");
    }

    if (input.match(/inspect|see the|check the/)) {
      return formatResponse("We arrange physical inspections before payment. A small inspection fee may apply based on your location (non-refundable).");
    }

    if (input.match(/installment|payment plan|credit|pay small/)) {
      return formatResponse("Currently, we mostly accept full payments only especially for the rental and lease vehicles. Check back soon for 'Pay on credit' options!");
    }

    if (input.match(/sell|agent|list my car/)) {
      return formatResponse("Yes! We help you sell faster and bring the right buyer to you. Contact us at 08135877104 or 07056117175 to list your vehicle.");
    }

    if (input.match(/services|what do you do|what can you do|help me with/)) {
      return formatResponse(
        <span>
          <strong className="text-red-600">Speedy Services:</strong><br/>
          • 🚗 <b>Vehicle Sales:</b> Verified Brand new, Foreign and Nigeria used vehicles.<br/>
          • 🏢 <b>Brokerage:</b> We connect serious buyers with vetted Dealers.<br/>
          • 🛠️ <b>Inspection:</b> Document verification & physical vehicle checks.<br/>
          • 🚲 <b>Logistics:</b> Sales of vetted dealers(cars, Trucks, Vans, and Motorcycles, Tricycles<br/>
          • 📄 <b>Leasing & Renting:</b> Flexible options for corporate and personal use.
        </span>,
        "Speedy offers Vehicle Sales, Brokerage, Inspections, Logistics, and Leasing/Rental services."
      );
    }
    
    if (input.match(/foreign used|nigeria used|brand new|tokunbo/)) {
        return formatResponse("I'd be happy to help! We have many vehicles in stock. Check out the 'Condition' filter on our vehicle page.");
    }

    // CATEGORY SEARCH (Trucks, Vans, Motorcycles, Tricycles)
    const categoryMatch = input.match(/truck|car|van|motorcycle|bike|tricycle|bus|keke|pickup/i);

    if (categoryMatch) {
      const typeQuery = categoryMatch[0].toLowerCase();
      
      const foundVehicles = availableVehicles.filter(v => {
        // 2. Search across .type, .category, AND .name to be safe
        const vType = (v.type || "").toLowerCase();
        const vCategory = (v.category || "").toLowerCase();
        const vName = (v.name || "").toLowerCase();
    
        return vType.includes(typeQuery) || 
               vCategory.includes(typeQuery) || 
               vName.includes(typeQuery);
      });
    
      if (foundVehicles.length > 0) {
        return formatResponse(
          <span>
            <strong className="text-red-600">Available {typeQuery.charAt(0).toUpperCase() + typeQuery.slice(1)}s:</strong><br/>
            I found these matches in our inventory:
            {foundVehicles.slice(0, 40).map(v => (
              <button 
                key={v.id} 
                onClick={() => navigate(`/vehicle/${v.id}`)} 
                className="text-red-700 underline block text-xs mt-2 font-semibold text-left"
              >
                {v.name} - ₦{aiFormatPrice(v.price)}
              </button>
            ))}
          </span>,
          `I found ${foundVehicles.length} ${typeQuery}s available in our inventory.`
        );
      }
      return formatResponse(`We currently don't have any ${typeQuery}s in stock, but we update our inventory daily! Check back soon.`);
    }


    // 3. EXISTING BUDGET FLOW: IF AWAITING BUDGET (Stage 3)
    if (chatState.stage === 'awaiting_budget') {
      const moneyMatch = input.match(/(\d+)\s*(million|m|000,000)/i) || input.match(/₦?\s*(\d+)/);
      if (moneyMatch) {
        const rawNumber = parseInt(moneyMatch[1]);
        const budget = (input.includes('m') || input.includes('million')) && rawNumber < 1000 
                     ? rawNumber * 1000000 
                     : (rawNumber < 1000 ? rawNumber * 1000000 : rawNumber);
        const modelName = chatState.tempModel;
        const brandName = chatState.tempBrand;

        setChatState({ stage: 'general', tempBrand: null, tempModel: null });
        
        const results = availableVehicles.filter(v => 
          v.name.toLowerCase().includes(brandName.toLowerCase()) && 
          (modelName === 'vehicle' ? true : v.name.toLowerCase().includes(modelName.toLowerCase())) &&
          v.price <= budget                                       
        ).sort((a, b) => b.price - a.price);

        if (results.length > 0) {
          const exactMatch = results.find(v => modelName !== 'vehicle' && v.name.toLowerCase().includes(modelName.toLowerCase()));
          if (exactMatch) {
            return formatResponse(
              <span>
                Oh well, we have the <b>{exactMatch.name}</b> 
                <button onClick={() => navigate(`/vehicle/${exactMatch.id}`)} className="text-red-600 underline font-bold mx-1">
                  link here
                </button> 
                at ₦{aiFormatPrice(exactMatch.price)}.
              </span>
              `Oh well, we have the ${exactMatch.name} at ₦${aiFormatPrice(exactMatch.price)}.`
            );
          }
          return formatResponse(
            <span>
              Based on your budget, check these out:
              {results.slice(0, 3).map(v => (
                <button key={v.id} onClick={() => navigate(`/vehicle/${v.id}`)} className="text-red-600 underline block text-xs mt-1">
                  {v.name} - ₦{aiFormatPrice(v.price)}
                </button>
              ))}
            </span>,
            `Based on your budget, I found ${results.length} vehicles available.`
          );
        } else {
          setChatState({ ...chatState, stage: 'suggesting_alternatives' });
          return formatResponse(`We don't have any ${brandName} vehicles within that budget right now. Would you like to try a different brand?`);
        }
      }
    }
      
    

    //MODEL FLOW: IF AWAITING MODEL NAME
    if (chatState.stage === 'awaiting_model') {
      const isDeclining = input === 'no' || input === 'none' || input.includes('not really');
      // If user says "Toyota Camry", we strip the brand "Toyota" to get just the model "Camry"
      const modelClean = input.replace(chatState.tempBrand, '').trim();
      const modelName = isDeclining ? 'vehicle' : (modelClean || input);

      setChatState({ ...chatState, stage: 'awaiting_budget', tempModel: modelName });
      
      return formatResponse(
        isDeclining 
          ? `No problem! I'll look at all available ${chatState.tempBrand.toUpperCase()} models. What is your maximum budget for this?`
          : `Got it, the ${chatState.tempBrand.toUpperCase()} ${modelName}. What is your maximum budget for this?`
      );
    }

    if (chatState.stage === 'suggesting_alternatives') {
      const isAgreeing = input === 'yes' || input === 'ok' || input === 'sure' || input.includes('show me');
      if (isAgreeing) {
        setChatState({ stage: 'general', tempBrand: null, tempModel: null });
        return formatResponse("Great! What other brand are you interested in? Or type 'budget' to see cheap deals.");
      }
      if (input.includes('no') || input.includes('none')) {
        setChatState({ stage: 'general', tempBrand: null, tempModel: null });
        return formatResponse("No problem! What other brand or type of vehicle are you interested in?");
      }
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
      return formatResponse(`We have ${brandVehicles.length} ${foundBrand.toUpperCase()} models. Do you have a specific ${foundBrand.toUpperCase()} model in mind?. if yes just type the ${foundBrand.toUpperCase()} model not the make`);
    }

    // 4. BRAND NOT FOUND
    const isGreeting = ['hello', 'hi', 'hey', 'good morning', 'good evening', 'yo'].some(g => input === g);
    if (isGreeting) return formatResponse("Hi there! I'm Speedy Assist. Ask about our Vehicle brand or our services!"); 
    
    if (input.length > 3) { 
      const others = availableVehicles.slice(0, 30);
      const otherNames = others.map(v => v.name).join(", ");
      setChatState({ ...chatState, stage: 'suggesting_alternatives' });
      return formatResponse(
        <span>
          We don't have that particular brand. I suggest these other brands we have:
          {others.map(v => {
            //  Create a safe string first
            const featureText = String(v.features || "High performance and verified condition.")
            return (
              <button key={v.id} onClick={() => navigate(`/vehicle/${v.id}`)} className="text-red-600 underline block text-xs mt-1 font-semibold text-left">
                {v.name} - Features: {featureText.substring(0, 40)}...
              </button>
            );
          })}
        </span>,
        `We don't have that particular brand. I suggest checking out these alternatives: ${otherNames}.`
      );
    }
    return formatResponse("Thank you for Choosing speedy today for any more information type 'hello' for more option.");
  };

  // HANDLE CLEAR CHAT IN THE UI 
  const handleClearChat = () => {
    // 1. Reset the UI messages to just the initial greeting
    setMessages([
      {
        id: Date.now(),
        text: "Conversation reset! This Speedy Assit. How can I help you find your perfect vehicle now?",
        sender: 'bot',
        timestamp: new Date().toISOString()
      }
    ]);

    // 2. Reset the internal State Machine logic
    setChatState({ 
      stage: 'general', 
      tempBrand: null, 
      tempModel: null 
    });
  };
  

  // 3. HANDLE SEND & SAVE
  const handleSendMessage = async (clickedQuery = null) => {
    const messageToSend = clickedQuery || inputValue;
    if (typeof messageToSend !== 'string' || !messageToSend.trim()) return;

    const currentInput = messageToSend;
    const userTimestamp = new Date().toISOString();

    // 1. UI Update for User
    setMessages(prev => [...prev, {
      text: currentInput,
      sender: 'user',
      timestamp: userTimestamp 
    }]);
    setInputValue('');
    setIsTyping(true); // START LOADING

    // 2. Save User Message to DB
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
      const botResponse = getLegitResponse(currentInput);
      const botTimestamp = new Date().toISOString();

      // ----- Extract values from the response object ---
      // If botResponse is an object {ui, text}, use them. If it's just a string, use it for both.
      const displayContent = botResponse.ui || botResponse; 
      const dbContent = botResponse.text || botResponse;

      //  ----Show UI (JSX) in the chat bubble ---
      setMessages(prev => [...prev, { 
        text: displayContent, 
        sender: 'bot', 
        timestamp: botTimestamp 
      }]);
      setIsTyping(false); // STOP LOADING

      // --- FIX #3: Save clean STRING to the Database ---
      try {
        await vehicleAPI.saveChatMessage({
          content: typeof dbContent === 'string' ? dbContent : "Vehicle Search Results",
          sender: 'bot',
          timestamp: botTimestamp
        });
      } catch (err) {
        console.error("Save bot msg error (422 fix):", err);
      }
    }, 1000);
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
            <div className="flex items-center space-x-2">
              {/* RESTART BUTTON */}
              <button 
                onClick={handleClearChat}
                title="Restart Conversation"
                className="p-1.5 hover:bg-white/20 rounded-md transition-colors duration-200"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                </svg>
              </button>
              <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
            </div>
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
                  <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-white/70' : 'text-gray-400'}`}>
                    {new Date(message.timestamp).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* TYPING INDICATOR */}
            {isTyping && (
              <div className="flex justify-start animate-in fade-in duration-300">
                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                  <div className="flex space-x-1 items-center h-4">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* QUICK REPLIES */}
          {!inputValue && !isTyping && (
            <div className="px-4 py-2 flex flex-wrap gap-2 bg-white border-t border-gray-100 animate-in slide-in-from-bottom-2">
              {["Rent a car", "Budget vehicles", "Sell my car", "Office location"].map((query) => (
                <button
                  key={query}
                  onClick={() => handleSendMessage(query)}
                  className="text-[10px] bg-gray-50 border border-gray-200 text-gray-600 px-2 py-1 rounded-full hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
                >
                  {query}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about vehicles, prices, features or budget..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
              <Button
                onClick={() => handleSendMessage()}
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
