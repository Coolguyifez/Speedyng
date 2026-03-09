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

    const getSlug = (name) => name.toLowerCase().replaceAll(' ', '-');

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
            {filtered.slice(0, 20).map(v => (
              <button key={v.id} onClick={() => navigate(`/vehicles/${getSlug(v.name)}/${v.id}`)} className="text-red-700 underline block text-xs mt-1 font-semibold text-left">
                {v.name} - {isLeaseQuery ? "View Terms" : `₦${v.price.toLocaleString()}/month`}
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
        // 1. Strictly filter for vehicles labeled "for budget sale"
        v.service?.toLowerCase().includes("for budget sale") &&
        // 2. Ensure they fit the price threshold
        v.price < 50000000
      ).sort((a, b) => a.price - b.price);
      
      if (budgetVehicles.length > 0) {
        const names = budgetVehicles.slice(0, 40).map(v => v.name).join(", ");
        return formatResponse(
          <span>
            <strong className="text-red-600">Speedy Budget Sales 💰</strong><br/>
            Affordable options for purchase:
            {budgetVehicles.slice(0, 20).map(v => (
              <button key={v.id} onClick={() => navigate(`/vehicles/${getSlug(v.name)}/${v.id}`)} className="text-red-700 underline block text-xs mt-1 text-left font-semibold">
                {v.name} at ₦{aiFormatPrice(v.price)} 
              </button>
            ))}
          </span>,
          `Speedy Budget Sales 💰: ${names}`
        );
       } else {
        return formatResponse("We don't have any vehicles listed under 'Budget Sale' at the moment. Would you like to see our standard inventory?");
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
      return formatResponse("Currently, we mostly accept full payments only especially for the rental and lease vehicles. Ask agent for any further options");
    }

    if (input.match(/thank you|wow|wonderful|love you|you are the best|what will i do without you/)) {
      return formatResponse(
        <span>
          Smile, you're welcome..I would love for you to help us with this
          <a 
            href="https://forms.gle/sEEdrwkZh77X9XQ78" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-red-600 underline font-semibold ml-1"
          >
            feedback form
          </a>, So we can serve you even better.
        </span>,
        "Smile, you welcome..I would love for you to help me with this feedback form at: https://forms.gle/sEEdrwkZh77X9XQ78, so we can serve you better."
      );
    }

    if (input.match(/sell|agent|list my/)) {
      return formatResponse("Yes! We help you sell faster and bring the right buyer to you. Contact us at 08135877104 or 07056117175 to list your vehicle.");
    }

    if (input.match(/services|service|guys do|what do you do|what can you do|offer/)) {
      return formatResponse(
        <span>
          <strong className="text-red-600">Speedy Services:</strong><br/>
          • 🚗 <b>Vehicle Vetting/Sales:</b> Verified Brand new, Foreign and Nigeria used vehicles.<br/>
          • 🏢 <b>Brokerage:</b> We connect serious buyers with vetted Dealers.<br/>
          • 🛠️ <b>Inspection:</b> Document verification & physical vehicle checks.<br/>
          • 🚲 <b>Logistics:</b> Sales of vetted dealers/personer sellers(cars, Trucks, Vans, and Motorcycles, Tricycles<br/>
          • 📄 <b>Leasing & Renting:</b> Flexible options for corporate and personal use.
          You can also check our <button onClick={() => navigate(`/about`)} className="text-red-600 underline font-bold mx-1">Aboutus</button> page for more information!!!
        </span>,
        "Speedy offers Sales, Brokerage, Inspections, Logistics, and Leasing. Visit our About Us page for more info!"
      );
    }
    
    if (input.match(/foreign used|nigeria used|brand new|tokunbo|local used|new/)) {
      return formatResponse(
        <span>
          I'd be happy to help! We have many vehicles in stock. Check out our 
          <button 
            onClick={() => navigate('/vehicles?condition=Brand New')} 
            className="text-red-600 underline font-bold mx-1"
          >
            brand new
          </button>, 
          <button 
            onClick={() => navigate('/vehicles?condition=Foreign Used')} 
            className="text-red-600 underline font-bold mx-1"
          >
            foreign used
          </button>, and 
          <button 
            onClick={() => navigate('/vehicles?condition=Nigeria Used')} 
            className="text-red-600 underline font-bold mx-1"
          >
            Nigeria used
          </button> vehicles.
        </span>,
        "I'd be happy to help! We have many Brand New, Foreign Used, and Nigeria Used vehicles in stock."
      );
    }

    // CATEGORY SEARCH ( Cars, Trucks,Bus, Vans, Motorcycles, Tricycles)
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
            These are what we have in our inventory:
            {foundVehicles.slice(0, 40).map(v => (
              <button 
                key={v.id} 
                onClick={() => navigate(`/vehicles/${getSlug(v.name)}/${v.id}`)} 
                className="text-red-700 underline block text-xs mt-2 font-semibold text-left"
              >
                {v.name} - ₦{aiFormatPrice(v.price)} - {v.service}
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
        const budget = (input.includes('m') || input.includes('million')) || rawNumber < 1000 
                       ? rawNumber * 1000000 
                       : rawNumber;
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
            const exactSlug = exactMatch.name.replaceAll(' ', '-').toLowerCase();
            return formatResponse(
              <span>
                Oh well, we have the <b>{exactMatch.name}</b> 
                <button onClick={() => navigate(`/vehicles/${exactSlug}/${exactMatch.id}`)} className="text-red-600 underline font-bold mx-1">
                  link here
                </button> 
                at ₦{aiFormatPrice(exactMatch.price)} ({exactMatch.service}).
              </span>, // FIXED: Added missing comma here
              `Oh well, we have the ${exactMatch.name} at ₦${aiFormatPrice(exactMatch.price)} (${exactMatch.service}).`
            );
          }
          return formatResponse(
            <span>
              Based on your budget, check these out:
              {results.slice(0, 40).map(v => (
                <button key={v.id} onClick={() => navigate(`/vehicles/${getSlug(v.name)}/${v.id}`)} className="text-red-600 underline block text-xs mt-1 text-left">
                  {v.name} at ₦{aiFormatPrice(v.price)} {v.service}
                </button>
              ))}
            </span>,
            `Based on your budget, I found ${results.length} vehicles available.`
          );
        } else {
          const brandCloseMatches = availableVehicles.filter(v => 
            v.name.toLowerCase().includes(brandName.toLowerCase()) && 
            v.price <= budget
          ).sort((a, b) => b.price - a.price);

          if (brandCloseMatches.length > 0) {
            return formatResponse(
              <span>
                I couldn't find a <b>{modelName}</b> under ₦{aiFormatPrice(budget)}, but here are other <b>{brandName.toUpperCase()}</b> deals in your range:
                {brandCloseMatches.slice(0, 20).map(v => (
                  <button key={v.id} onClick={() => navigate(`/vehicles/${getSlug(v.name)}/${v.id}`)} className="text-red-600 underline block text-xs mt-2 text-left font-semibold">
                    {v.name} at ₦{aiFormatPrice(v.price)}
                  </button>
                ))}
              </span>,
              `No ${modelName} available in that budget, but I found other ${brandName} options.`
            );
          }

          setChatState({ ...chatState, stage: 'suggesting_alternatives' });
          return formatResponse(`We don't have any ${brandName} vehicles within that budget right now. Would you like to try a different brand?`);
        }
      }
    }
      
    

    //MODEL FLOW: IF AWAITING MODEL NAME
    if (chatState.stage === 'awaiting_model') {
      const isDeclining = input === 'no' || input === 'none' || input === 'not really' || input.includes('no I don't');
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
              <button key={v.id} onClick={() => navigate(`/vehicles/${getSlug(v.name)}/${v.id}`)} className="text-red-600 underline block text-xs mt-1 font-semibold text-left">
                {v.name} - Features: {featureText.substring(0, 40)}...
              </button>
            );
          })}
        </span>,
        `We don't have that particular brand. I suggest checking out these alternatives: ${otherNames}.`
      );
    }
    return formatResponse(
      <span>
        Thank you for choosing Speedy today! For more options, type <b>'hello'</b> or kindly help us by filling out this 
        <a 
          href="https://forms.gle/sEEdrwkZh77X9XQ78" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-red-600 underline font-semibold ml-1"
        >
          feedback form
        </a>.
      </span>,
      "Thank you for choosing Speedy! Type 'hello' for more options or fill out our feedback form at: https://forms.gle/sEEdrwkZh77X9XQ78"
    );
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
   <>
      {/* 1. Toggle Button - Only rendered when the window is CLOSED */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in zoom-in duration-300">
          <Button
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
          >
            <LuMessageCircleMore className="w-7 h-7" />
          </Button>
        </div>
      )}

      {/* 2. Chat Window - Only rendered when the window is OPEN */}
      {isOpen && (
        <div className="fixed z-50 bottom-4 left-4 right-4 sm:bottom-6 sm:right-6 sm:left-auto sm:w-96 h-[550px] max-h-[85vh] flex flex-col bg-white rounded-2xl shadow-2xl animate-in slide-in-from-bottom-5 duration-300 overflow-hidden border border-gray-100">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <LuMessageCircleMore className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Speedy Assist</h3>
                <p className="text-[10px] text-white/80 uppercase tracking-widest font-medium">AI Agent Advisor</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button 
                onClick={handleClearChat} 
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
                </svg>
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
      
          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 scrollbar-hide">
            {messages.map((message, index) => (
              <div key={message.id || index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${
                    message.sender === 'user' ? 'bg-red-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                  }`}>
                  <div className="whitespace-pre-wrap">{message.text}</div>
                  <p className="text-[10px] mt-1 opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none p-3 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
      
          {/* Quick Replies */}
          {!inputValue && !isTyping && (
            <div className="px-4 py-2 flex overflow-x-auto space-x-2 bg-white border-t border-gray-50 no-scrollbar">
              {["vehicles for Rent", "Vehicles for Lease", "Budget vehicles", "Sell my car", "Office location"].map((query) => (
                <button
                  key={query}
                  onClick={() => handleSendMessage(query)}
                  className="whitespace-nowrap text-[11px] bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full hover:bg-red-50 hover:text-red-600 transition-all"
                >
                  {query}
                </button>
              ))}
            </div>
          )}
      
          {/* Input Area */}
          <div className="p-3 border-t border-gray-100 bg-white">
            <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 px-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask Speedy..."
                className="flex-1 bg-transparent px-2 py-3 text-sm focus:outline-none"
              />
              <Button onClick={() => handleSendMessage()} size="sm" className="bg-red-600 text-white rounded-lg h-8 w-8 p-0 shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
