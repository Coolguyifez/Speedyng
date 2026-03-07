import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Camera, MapPin, ChevronRight, CheckCircle2, Loader2, X, Plus } from 'lucide-react';
import { TbCurrencyNaira } from "react-icons/tb";
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { toast } from 'sonner';

const SellVehiclePage = () => {
  const FORMINIT_ID = "6hcg5d1pqeb"; 

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]); 

  // PERSISTENT DATA STATE
  const [vehicleData, setVehicleData] = useState({
    make: '', model: '', year: '', vin: '',
    price: '', location: '', condition: '',
    name: '', phone: '', email: '', _gotcha: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVehicleData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 10) {
      toast.error("Speedy listings allow a maximum of 10 vehicle photos.");
      return;
    }
    const newPreviews = files.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));
    setImages(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) return toast.error("Please upload at least one vehicle photo.");
    setLoading(true);

    const formData = new FormData();
    
    // 1. Append text data from our persistent state
    Object.keys(vehicleData).forEach(key => {
      formData.append(key, vehicleData[key]);
    });

    // 2. Append images - Using 'photos[]' so Forminit sees it as an array
    images.forEach((imgObj) => {
      formData.append("photos[]", imgObj.file); 
    });

    try {
      const response = await fetch(`https://forminit.com/f/${FORMINIT_ID}`, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        setStep(4);
      } else {
        const errorData = await response.json();
        console.error("Forminit Rejected:", errorData);
        toast.error("Submission rejected. Check your image sizes.");
      }
    } catch (error) {
      toast.error("Connection error. Try again.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 font-sans">
      <div className="max-w-2xl mx-auto">
        
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href="/"}>
            <img src="https://i.imgur.com/niaQKv1.png" alt="Speedy Logo" className="h-10 w-auto" />
            <span className="text-2xl font-bold tracking-tighter text-slate-900">Speedy</span>
          </div>
        </div>

        <Card className="border-none shadow-2xl rounded-3xl bg-white overflow-hidden">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit}>
              
              {/* STEP 1: VEHICLE & PHOTOS */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Truck className="text-red-600"/> Vehicle Photos
                    </h2>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{images.length}/10</span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {images.map((img, index) => (
                      <div key={index} className="relative h-32 rounded-xl overflow-hidden group shadow-md">
                        <img src={img.url} className="h-full w-full object-cover" alt="Preview" />
                        <button onClick={() => removeImage(index)} type="button" className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    {images.length < 10 && (
                      <label className="h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-red-500 hover:bg-red-50 transition-all">
                        <Plus className="text-gray-400" />
                        <span className="text-xs text-gray-500 mt-1">Add Photo</span>
                        <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                      </label>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <input name="make" value={vehicleData.make} onChange={handleInputChange} placeholder="Vehicle Make" className="input-field" required />
                    <input name="model" value={vehicleData.model} onChange={handleInputChange} placeholder="Vehicle Model" className="input-field" required />
                    <input name="year" value={vehicleData.year} onChange={handleInputChange} placeholder="Vehicle Year" className="input-field" required />
                    <input name="vin" value={vehicleData.vin} onChange={handleInputChange} placeholder="Vehicle Vin Number" className="input-field" required />
                  </div>
                  <Button type="button" onClick={() => images.length > 0 ? setStep(2) : toast.error("Please add a photo")} className="w-full bg-red-600 py-6 text-lg font-bold shadow-lg shadow-red-200">
                    Next: Location & Price <ChevronRight className="ml-2"/>
                  </Button>
                </div>
              )}

              {/* STEP 2: LOCATION & PRICE */}
              {step === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <h2 className="text-2xl font-bold flex items-center gap-2"><MapPin className="text-red-600"/> Location & <TbCurrencyNaira className="text-red-600"/> Price</h2>
                  <input name="price" value={vehicleData.price} onChange={handleInputChange} type="number" placeholder="Asking Price (₦)" className="input-field" required />
                  <input name="location" value={vehicleData.location} onChange={handleInputChange} placeholder="City / State" className="input-field" required />
                  <textarea name="condition" value={vehicleData.condition} onChange={handleInputChange} placeholder="Vehicle condition..." className="input-field h-32" />
                  <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-1/2 py-6">Back</Button>
                    <Button type="button" onClick={() => setStep(3)} className="w-1/2 bg-red-600 py-6 text-white">Next</Button>
                  </div>
                </div>
              )}

              {/* STEP 3: CONTACT */}
              {step === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <h2 className="text-2xl font-bold text-slate-900">Seller Contact</h2>
                  <input name="name" value={vehicleData.name} onChange={handleInputChange} placeholder="Full Name" className="input-field" required />
                  <input name="phone" value={vehicleData.phone} onChange={handleInputChange} placeholder="WhatsApp / Phone Number" className="input-field" required />
                  <input name="email" value={vehicleData.email} onChange={handleInputChange} type="email" placeholder="Email Address" className="input-field" required />
                  <input type="text" name="_gotcha" value={vehicleData._gotcha} onChange={handleInputChange} style={{ display: 'none' }} />
                  <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={() => setStep(2)} className="w-1/3 py-6">Back</Button>
                    <Button disabled={loading} type="submit" className="w-2/3 bg-red-600 py-6 font-bold text-white">
                      {loading ? <Loader2 className="animate-spin" /> : "Submit Vehicle Listing"}
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 4: SUCCESS */}
              {step === 4 && (
                <div className="text-center py-10 animate-in zoom-in-95 duration-500">
                  <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
                  <h2 className="text-3xl font-bold">Sent to Agents!</h2>
                  <p className="text-gray-600 mt-4">A Speedy agent will review your vehicle shortly & get back to you.</p>
                  <Button type="button" onClick={() => window.location.href="/"} className="mt-10 bg-gray-900 px-10 py-6 rounded-xl text-white">Return Home</Button>
                </div>
              )}
            </form>
            {step < 4 && (
                <div className="mt-8 text-center border-t border-gray-50 pt-8">
                    <Link to="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">
                        Cancel and return home
                    </Link>
                </div>
            )}
          </CardContent>
        </Card>
      </div>

      <style>{`
        .input-field { 
          width: 100%; padding: 16px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 16px; outline: none; transition: all 0.3s; 
        }
        .input-field:focus { border-color: #dc2626; background: white; }
      `}</style>
    </div>
  );
};

export default SellVehiclePage;
