import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Shield, Database, Lock, MessageSquare, Car, User } from 'lucide-react';

const PrivacyPolicy = () => {
  const lastUpdated = "March 4, 2026"; 

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Header />

      {/* Hero Section */}
      <section className="bg-slate-900 py-20 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute transform rotate-45 -left-20 -top-20 w-96 h-96 bg-red-600 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Transparent data management for the Speedy automotive ecosystem.
          </p>
          <div className="mt-6 inline-block bg-red-600/20 border border-red-600/30 px-4 py-1 rounded-full text-red-500 text-sm font-medium">
            Version 2.0 • Last Updated: {lastUpdated}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Sidebar Navigation (Sticky) */}
            <div className="hidden lg:block">
              <div className="sticky top-24 space-y-4">
                <h3 className="font-bold text-gray-900 uppercase tracking-wider text-sm">Contents</h3>
                <nav className="flex flex-col gap-2 border-l-2 border-gray-200 pl-4">
                  <a href="#collection" className="text-gray-500 hover:text-red-600 transition-colors">Data Collection</a>
                  <a href="#ai" className="text-gray-500 hover:text-red-600 transition-colors">AI Chat Logs</a>
                  <a href="#security" className="text-gray-500 hover:text-red-600 transition-colors">Security & Tokens</a>
                </nav>
              </div>
            </div>

            {/* Policy Body */}
            <div className="lg:col-span-2 space-y-16">
              
              {/* 1. Data Collection Mapping */}
              <div id="collection">
                <div className="flex items-center gap-3 mb-6">
                  <Database className="w-8 h-8 text-red-600" />
                  <h2 className="text-3xl font-bold">1. Information We Collect</h2>
                </div>
                <p className="mb-6 leading-relaxed">
                  To operate the <strong>Speedy</strong> platform effectively as a broker, we store specific data points within our relational database.
                </p>

                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h4 className="font-bold flex items-center gap-2 mb-3 text-red-600">
                      <User size={18} /> User & Agent Profile
                    </h4>
                    <p className="text-sm text-gray-600">
                      We store your <strong>Name, Email, Phone Number</strong>, and <strong>Account Role</strong>. For your convenience, we also maintain a <strong>Favorites List</strong> (Car IDs) so you can easily return to vehicles you've liked.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h4 className="font-bold flex items-center gap-2 mb-3 text-red-600">
                      <Car size={18} /> Vehicle Inventory Data
                    </h4>
                    <p className="text-sm text-gray-600">
                      For every listing, we collect <strong>Price, Location, Year, Mileage, Transmission, Fuel Type,</strong> and technical specs like <strong>Acceleration</strong>. We also store <strong>Owner Name</strong> and <strong>Physical Address</strong> to facilitate inspections.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. AI and Messaging */}
              <div id="ai">
                <div className="flex items-center gap-3 mb-6">
                  <MessageSquare className="w-8 h-8 text-red-600" />
                  <h2 className="text-3xl font-bold">2. AI & Communication</h2>
                </div>
                <p className="leading-relaxed mb-4">
                  Our platform uses an integrated AI assistant. To provide a personalized experience:
                </p>
                <ul className="list-disc ml-6 space-y-3 text-gray-600">
                  <li><strong>Chat Logs:</strong> We store chat history (Text, Sender, and Timestamps) linked to your <code>User ID</code> to improve bot responses.</li>
                  <li><strong>Contact Forms:</strong> When you use our contact system, we store your message and status (e.g., "pending" or "resolved") to ensure no inquiry is ignored.</li>
                </ul>
              </div>

              {/* 3. Data Security & Schema Logic */}
              <div id="security">
                <div className="flex items-center gap-3 mb-6">
                  <Lock className="w-8 h-8 text-red-600" />
                  <h2 className="text-3xl font-bold">3. Security & Retention</h2>
                </div>
                <p className="mb-6 leading-relaxed">
                  We employ strict logic to protect your data within our Database-powered infrastructure:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <span className="font-bold block text-sm mb-1 uppercase text-gray-500">Encryption</span>
                    <p className="text-sm">Passwords are hashed before storage. We never see your raw password.</p>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <span className="font-bold block text-sm mb-1 uppercase text-gray-500">Temporary Tokens</span>
                    <p className="text-sm">Reset tokens for password recovery are temporary and expire automatically.</p>
                  </div>
                </div>
              </div>

              {/* 4. Contact Information */}
              <div className="border-t border-gray-200 pt-10">
                <div className="bg-slate-900 p-8 rounded-2xl text-white">
                  <h3 className="text-2xl font-bold mb-4">Exercise Your Rights</h3>
                  <p className="text-gray-400 mb-6">
                    You have the right to request a copy of your data or ask for the deletion of your account and chat history, 
                    and if you have any questions about this Privacy Policy, please contact our data protection team.
                  </p>
                  <div className="space-y-2">
                    <p className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-gray-500 text-sm">Support Email</span>
                      <span className="font-medium">infospeedyng360@gmail.com</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
