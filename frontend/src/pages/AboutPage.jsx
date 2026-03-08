import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MdOutlineSell } from "react-icons/md";
import { ShieldCheck, Users, Zap, CheckCircle, Wrench, Target, Briefcase, Car, Search, Eye, MessageSquare } from 'lucide-react';
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
            committed to bringing transparency and speed to the Nigerian vehicle market.
          </p>
        </div>
      </section>
      
      {/* Our Mission & Vision Statement */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-10 rounded-[2.5rem] bg-red-600 text-white shadow-2xl shadow-red-200 relative overflow-hidden group">
              <Target className="absolute -right-4 -bottom-4 w-32 h-32 text-red-500 opacity-50 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                Our Mission
              </h3>
              <p className="text-red-50 text-lg leading-relaxed relative z-10">
                To bridge the trust gap in the Nigerian automotive industry by providing an agent-vetted ecosystem where quality is guaranteed and transactions are seamless.
              </p>
            </div>
            <div className="p-10 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl shadow-slate-200 relative overflow-hidden group">
              <Eye className="absolute -right-4 -bottom-4 w-32 h-32 text-slate-800 opacity-50 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                Our Vision
              </h3>
              <p className="text-slate-300 text-lg leading-relaxed relative z-10">
                To become Africa's most trusted automotive brokerage, defined by our integrity, technological innovation, and the expertise of our elite agent network.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Brokerage Difference */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <img 
                src="https://i.imgur.com/Y7DMlo9.png" 
                alt="Agent" 
                className="rounded-3xl shadow-2xl shadow-gray-200 border border-gray-100"
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

       {/* Our Services */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Professional Services</h2>
            <p className="text-gray-500">How our agents add value to your journey.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: <Search className="text-red-600" />, 
                title: "Custom Sourcing", 
                desc: "Tell us what you want, and our agents will find it, vet it, and bring it to you." 
              },
              { 
                icon: <Wrench className="text-red-600" />, 
                title: "Physical Vetting", 
                desc: "We don't trust words; we trust inspections. Every Vehicle undergoes a 150-point diagnostic report for absolute peace of mind." 
              },
              { 
                icon: <Briefcase className="text-red-600" />, 
                title: "Corporate Fleet", 
                desc: "Professional liquidation and acquisition services for businesses and organizations." 
              },
              { 
                icon: <MdOutlineSell className="text-red-600 w-6 h-6" />, 
                title: "Managed Sales", 
                desc: "Let our agents handle the calls, vetting, and negotiations while you sit back." 
              }
            ].map((service, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 hover:shadow-xl transition-all group">
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-600 group-hover:text-white transition-colors">
                  {service.icon}
                </div>
                <h4 className="font-bold text-xl mb-3">{service.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    

      {/* Key Stats / Why Us */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose Speedy?</h2>
            <div className="w-20 h-1.5 bg-red-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Vetting */}
            <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="text-red-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Rigorous Vetting</h3>
              <p className="text-gray-500 leading-relaxed">
                Our agents physically inspect every engine, transmission, and body panel before a Vehicle is cleared for our platforms.
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
      <section className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-16">Our Work Process</h2>
          
          <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-4">
            {[
              { icon: <Car />, title: "Sourcing" },
              { icon: <ShieldCheck />, title: "Vetting" },
              { icon: <MessageSquare />, title: "Matching" },
              { icon: <MdOutlineSell />, title: "Selling" },
              { icon: <CheckCircle />, title: "Closing" }
            ].map((step, index) => (
              <React.Fragment key={index}>
                {/* Step Circle */}
                <div className="flex-1 px-4 relative group">
                  <div className="w-16 h-16 bg-white text-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-red-600 group-hover:scale-110 transition-transform z-10 relative">
                    {step.icon}
                  </div>
                  <h4 className="font-bold text-lg mb-2">{step.title}</h4>
                </div>
      
                {/* Broken Arrow Connector */}
                {index < 4 && (
                  <div className="flex items-center justify-center py-4 md:py-0 md:h-16">
                    {/* Laptop Arrow (Horizontal) */}
                    <svg 
                      className="hidden md:block w-12 lg:w-20 h-8 text-red-600/50" 
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
      
                    {/* Mobile Arrow (Vertical) */}
                    <svg 
                      className="block md:hidden w-8 h-12 text-red-600/50" 
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 13l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                )}
              </React.Fragment>
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
