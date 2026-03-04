import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Scale, ShieldCheck, MessageSquare, Lock, CalendarCheck, Eye } from 'lucide-react';

const TermsOfService = () => {
  const lastUpdated = "March 4, 2026";

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans">
      <Header />

      <section className="bg-slate-900 py-20 text-white border-b-4 border-red-600">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Terms of Service</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Rules for browsing, AI interaction, and vehicle inspections on Speedy.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm space-y-12">
            
            {/* 1. Scope of Service */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="shrink-0">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <Eye className="text-red-600" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-3">1. Scope of Service</h2>
                <p className="text-gray-600 leading-relaxed">
                  <strong>Speedy</strong> is a curated automotive brokerage. All vehicle listings are managed exclusively by <strong>Speedy Agents</strong>. Users may browse, favorite, and chat with our AI, but cannot post their own listings.
                </p>
              </div>
            </div>

            {/* 2. Vehicle Inspections - NEW SECTION */}
            <div className="flex flex-col md:flex-row gap-6 border-t border-gray-100 pt-10">
              <div className="shrink-0">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <CalendarCheck className="text-red-600" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-3">2. Booking Inspections</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Users can request a physical inspection for any vehicle. By booking an inspection, you agree to the following:
                </p>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span><strong>No Obligation:</strong> Payment of an inspection fee does not mandate a full purchase of the vehicle, but it does guarantee a professional walkthrough of the vehicle's condition (e.g features, mileage, etc.) and verifying vehicle documentation.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span><strong>Inspection Fee:</strong> A non-refundable inspection fee may apply based on your location and the vehicle's location (as stored in our database). This fee covers the logistics of the Speedy Agent and securing the viewing slot. </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span><strong>Agent Coordination:</strong> Once a request is made via our platform or AI, a Speedy Agent will contact you to confirm the time and location.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span><strong>Safety:</strong> For your safety, all inspections must take place at the verified addresses listed in our database or as specified by our official agents.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 3. AI Chatbot Interaction */}
            <div className="flex flex-col md:flex-row gap-6 border-t border-gray-100 pt-10">
              <div className="shrink-0">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <MessageSquare className="text-red-600" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-3">3. AI Assistant Usage</h2>
                <p className="text-gray-600 leading-relaxed">
                  Our AI ChatWidget is designed to help you filter our inventory. Conversation logs (text and timestamps) are stored and linked to your <code>User ID</code> to facilitate better service during your inspection.
                </p>
              </div>
            </div>

            {/* 4. Verification & Liability */}
            <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="text-red-600 w-6 h-6" />
                <h2 className="text-xl font-bold text-gray-900">Final Verification</h2>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                While Speedy Agents verify vehicles before listing, the physical inspection is the final step. Users are encouraged to perform mechanical checks during the inspection. Speedy is not liable for faults discovered after the user has physically inspected and paid for a vehicle.
              </p>
            </div>

            {/* 5. Account Security */}
            <div className="flex flex-col md:flex-row gap-6 border-t border-gray-100 pt-10">
              <div className="shrink-0">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <Lock className="text-red-600" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-3">4. User Accounts</h2>
                <p className="text-gray-600 leading-relaxed text-sm">
                  User accounts are intended for personal use to track <strong>Favorites</strong> and <strong>Inspection History</strong>. Any attempt to use account features for data scraping or fraudulent inquiries will lead to immediate termination.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TermsOfService;
