import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MdOutlineSell } from "react-icons/md";
import { ShieldCheck, Users, Zap, CheckCircle, Car, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <Header />

      {/* Hero Section */}
      <section className="relative py-24 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1653777191717-3dcfbbdd330a?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
            alt="Luxury background" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter">
            WE ARE <span className="text-red-600">SPEEDY.</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            More than just a platform. We are a team of dedicated automotive agents 
            committed to bringing transparency and speed to the Nigerian car market.
          </p>
        </div>
      </section>

      {/* Our Story / Mission */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <img 
                src="https://i.imgur.com/Y7DMlo9.png" 
                alt="Agent" 
                className="rounded-3xl shadow-2xl shadow-gray-200"
              />
            </div>
            <div className="lg:w-1/2 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                The Brokerage Difference
              </h2>
              <p className="text-gray-600 text-lg">
                Unlike open marketplaces where anyone can post anything, <strong>Speedy is a closed ecosystem.</strong> Every vehicle you see on our platform has been sourced, vetted, and listed by our professional agents.
              </p>
              <p className="text-gray-600 text-lg">
                We founded Speedy to solve the "Trust Gap." By controlling the inventory and managing the inspection process ourselves, we ensure that what you see in the photos is exactly what you get in person.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-red-600 w-5 h-5" />
                  <span className="font-bold">100% Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-red-600 w-5 h-5" />
                  <span className="font-bold">Agent-Led</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Stats / Why Us */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose Speedy?</h2>
            <div className="w-20 h-1 bg-red-600 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Vetting */}
            <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="text-red-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Rigorous Vetting</h3>
              <p className="text-gray-500 leading-relaxed">
                Our agents physically inspect every engine, transmission, and body panel before a car is cleared for our website.
              </p>
            </div>

            {/* AI Integration */}
            <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="text-red-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">AI-Powered Search</h3>
              <p className="text-gray-500 leading-relaxed">
                Use our proprietary AI Assistant to find vehicles that match your specific lifestyle and budget constraints instantly.
              </p>
            </div>

            {/* Support */}
            <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
                <Users className="text-red-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Expert Guidance</h3>
              <p className="text-gray-500 leading-relaxed">
                From booking the inspection to final paperwork, a Speedy Agent is by your side to ensure a smooth transaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Process Diagram Flow */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12">How We Work</h2>
          
          <div className="flex flex-col md:flex-row justify-center items-start gap-8 md:gap-4">
            {[
              { icon: <Car />, title: "Sourcing", desc: "Agents find the best vehicles across the country." },
              { icon: <MdOutlineSell />, title: "Selling", desc: "Our Agents recieves your vehicle details and vet it before listing." },
              { icon: <ShieldCheck />, title: "Vetting", desc: "Rigorous mechanical and legal background checks." },
              { icon: <MessageSquare />, title: "Matching", desc: "AI and Agents help you find the right fit." },
              { icon: <CheckCircle />, title: "Closing", desc: "Secure payment and handover of ownership." }
            ].map((step, index) => (
              <div key={index} className="flex-1 px-4 relative">
                <div className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-red-600">
                  {step.icon}
                </div>
                <h4 className="font-bold text-lg mb-2">{step.title}</h4>
                <p className="text-sm text-gray-500">{step.desc}</p>
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 -right-4 w-8 border-t-2 border-dashed border-gray-300"></div>
                )}
              </div>
            ))}
          </div>
          
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-red-600 rounded-[3rem] p-12 text-center text-white relative overflow-hidden">
            <h2 className="text-3xl md:text-5xl font-black mb-6">Ready to find your next Vehicle?</h2>
            <p className="text-red-100 text-lg mb-10 max-w-xl mx-auto">
              Join thousands of Nigerians who trust Speedy for their automotive needs.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/vehicles">
                <button className="px-8 py-4 bg-white text-red-600 font-bold rounded-xl hover:bg-gray-100 transition-all">
                  Browse Inventory
                </button>
              </Link>
              <Link to="/register">
                <button className="px-8 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-all">
                  Create Account
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
