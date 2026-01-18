import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from './ui/button';
import { carAPI } from '../services/api'; // Import your API to see the cars
const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [availableCars, setAvailableCars] = useState([]);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm Speedy Assist, your AI car advisor. How can I help you find your perfect car today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  
  // Get logged-in user info
  const user = JSON.parse(localStorage.getItem('user'));


  // 1. Fetch real cars and Load Chat History on mount
  useEffect(() => {
    const initData = async () => {
      try {
        const carsData = await carAPI.getCars();
        setAvailableCars(carsData);

        if (user) {
          // Fetch previous messages from database if user is logged in
          const history = await carAPI.getChatHistory(user.id);
          if (history && history.length > 0) {
            setMessages(history);
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

//--- Listen for the signal from Contact Page ---
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


  // 3. THE "LEGIT" AI ENGINE (Keywords + Budget Search)
  const getLegitResponse = (text) => {
    const input = text.toLowerCase();

    // 1. DYNAMIC BRAND SEARCH
    const brandMatch = availableCars.find(car => 
      input.includes(car.name.split(' ')[0].toLowerCase())
    );

    if (brandMatch && !input.match(/(\d+)/)) {
      const brandName = brandMatch.name.split(' ')[0];
      const brandCars = availableCars.filter(car => 
        car.name.toLowerCase().includes(brandName.toLowerCase())
      );

      if (brandCars.length > 0) {
        // We take the first match and provide a direct link
        const topMatch = brandCars[0];
        return (
          <span>
            Yes! We have {brandCars.length} {brandName} models. The best one right now is the 
            <a href={`/car/${topMatch.id}`} className="text-blue-200 underline ml-1 font-bold">
              {topMatch.name}
            }
            </a>. Would you like to see its full details?
          </span>
        );
      }
    }

    // --- BUDGET SEARCH LOGIC ---
    // Detects numbers like "10", "10m", "10 million"
    const moneyMatch = input.match(/(\d+)\s*(million|m|000,000)/i) || input.match(/₦?\s*(\d+)/);
    if (moneyMatch) {
      const rawNumber = parseInt(moneyMatch[1]);
      const budgetAmount = rawNumber < 1000 ? rawNumber * 1000000 : rawNumber;
      
      // Look for cars in your state 'availableCars'
      const affordableCars = availableCars
        .filter(car => car.price <= budgetAmount)
        .sort((a, b) => b.price - a.price); // Get the best car closest to their budget

      if (affordableCars.length > 0) {
        const match = affordableCars[0];
        return (
          <span>
            I found a great match! The 
            <a href={`/car/${match.id}`} className="text-blue-200 underline mx-1 font-bold">
              {match.name}
            </a> 
            is only ₦{(match.price / 1000000).toFixed(1)}M. Click the name to see photos and specs!
          </span>
        );
      } else {
        return `I don't have any cars under ₦${(budgetAmount/1000000).toFixed(1)}M right now. Check our 'Cars' page for the latest arrivals!`;
      }
    }

    // --- KEYWORD LOGIC ---
    if (input.includes('scam') || input.includes('legit') || input.includes('safe')) return "Speedy is a verified Car agent platform . We always inspect the car before making full payment!";
    if (input.includes('installment') || input.includes('payment plan') || input.includes('credit')) return "Currently, we mostly accept full payments, Check back soon for the 'Pay Small Small' option!";
    if (input.includes('location') || input.includes('where')) || input.includes('see')) return "Our office is at Benin city, Nigeria. Check our contact page for our address, but we are available nationwide! You can book an inspection via our Contact page or call us";
    if (input.includes('inspect') || input.includes('see the car')) return "We do inspection before any full payment is made. But a comission fee is attached depending on your loacation and if you don't like the car there is always a 5%-10% returns. Just let me know which car you are interested in; By booking an inspection and calling us ";
    if (input.includes('sell') || input.includes('agent')) return "Speedy is a car agents app! we help people who wants to sell thier car faster by marketing them online and bringing only serious buyers. just call us or chat us on whatsapp with this number "08154675347", so we can start uploading your car(s) immediately.";
    if (input.includes('foreign used') || input.includes('Nigeria used')) || input.includes('Brand new')) return "Yes we do have, but check our car page for such options where we have (Conditions) or call us if you seem confuse or lost via the contact page";
    if (input.includes('hello') || input.includes('hi')) return "Hi there! I'm Speedy Assist. I can help you find a car based on your budget. How much are you looking to spend?";

    return "That sounds interesting! To give you the best advice, could you tell me your budget or the specific brand you are looking for?. or If there's no any other issue. then i want to say a big thank you for choosing Speedy!!";
  };
  
  
  // 3. HANDLE SEND & SAVE TO DB
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      text: inputValue,
      sender: 'user',
      timestamp: new Date().toISOString() // Fixed parentheses
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');

    if (user) {
      try {
        await carAPI.saveChatMessage(userMessage);
      } catch (err) {
        console.error("Failed to save user message:", err);
      }
    }

    setTimeout(async () => {
      const botReplyContent = getLegitResponse(currentInput);
      const botResponse = {
        text: botReplyContent,
        sender: 'bot',
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, botResponse]);
      
      if (user) {
        try {
          await carAPI.saveChatMessage({
            text: typeof botReplyContent === 'string' ? botReplyContent : "Recommended a car link",
            sender: 'bot',
            timestamp: botResponse.timestamp
          });
        } catch (err) {
          console.error("Failed to save bot message:", err);
        }
      }
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-2xl w-96 h-[500px] flex flex-col animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Speedy Assist</h3>
                <p className="text-xs text-white/80">AI Car Advisor</p>
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
            {messages.map((message) => (
              <div
                key={message.id}
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
                    {message.text}
                  </div>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-white/70' : 'text-gray-500'
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
                placeholder="Ask about cars, prices, features or budget..."
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
