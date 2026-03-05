import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Car, Plus, Edit, Trash2, X, CheckCircle, Loader2, CircleGauge, Search, Upload, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { vehicleAPI } from '../services/api';

const categories = [
  { name: 'Sedan' }, { name: 'SUV' }, { name: 'Hatchback' }, { name: 'Exotic' },
  { name: 'Box Truck' }, { name: 'Dump Truck' }, { name: 'Flatbed Truck' },
  { name: 'Tanker Truck' }, { name: 'Refrigerator Truck' }, { name: 'Tow Truck' },
  { name: 'Trailer Head' }, { name: 'Single Cabin Pickup' }, { name: 'Double Cabin Pickup' },
  { name: 'Compact Pickup' }, { name: 'Full-Size Pickup' }, { name: 'Heavy-Duty Pickup (Dually)' },
  { name: 'Off-Road Pickup' }, { name: 'Mini-Bus' }, { name: 'Coaster Bus' },
  { name: 'School Bus' }, { name: 'Luxury Coach' }, { name: 'Cargo Van' },
  { name: 'Passenger Van' }, { name: 'Minivan' }, { name: 'Panel Van' },
  { name: 'Sport Bike' }, { name: 'Cruiser' }, { name: 'Touring Bike' },
  { name: 'Standard Motorcycle' }, { name: 'Passenger Keke' }, { name: 'Cargo Tricycle' },
  { name: 'Delivery Tricycle' },
];

const locations = ['Lagos', 'Abuja', 'Port Harcourt', 'Benin', 'Warri', 'Asaba'];

// --- MEMORY SAFE IMAGE PREVIEW COMPONENT ---
const SafeImagePreview = ({ file, onRemove, isGallery = false }) => {
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!file) return;
    const blobUrl = typeof file === 'string' ? file : URL.createObjectURL(file);
    setUrl(blobUrl);
    return () => { if (typeof file !== 'string') URL.revokeObjectURL(blobUrl); };
  }, [file]);

  return (
    <div className={`relative rounded-lg overflow-hidden border border-gray-200 shadow-sm group ${isGallery ? 'h-20' : 'w-full h-32'}`}>
      <img src={url} className="w-full h-full object-cover" alt="Preview" />
      <button 
        type="button" 
        onClick={onRemove}
        className="absolute top-1 right-1 bg-red-600/90 text-white p-1 rounded-full hover:bg-red-700 transition-all scale-0 group-hover:scale-100 shadow-lg"
      >
        <X className={isGallery ? "w-3 h-3" : "w-4 h-4"} />
      </button>
    </div>
  );
};

const AdminPanel = () => {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // Fixed: renamed from searchTerm
  const [filterCondition, setFilterCondition] = useState('All');
  
  const [formData, setFormData] = useState({
    name: '', make: '', model: '', type: 'Car', service: 'For Sale',
    category: 'Sedan', price: '', condition: 'Foreign Used', location: 'Lagos',
    acceleration: '', color: '', owner_name: '', address: '', phone_number: '',
    image: null, images: [], year: new Date().getFullYear(), mileage: '',
    transmission: 'Automatic', fuel_type: 'Petrol', description: '', features: ''
  });

  useEffect(() => { fetchInventory(); }, []);

  const fetchInventory = async () => {
    try {
      const response = await vehicleAPI.getAll();
      setVehicles(response.data);
    } catch (error) {
      toast.error("Database connection failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEditingVehicle(null);
    setFormData({
      name: '', make: '', model: '', type: 'Car', service: 'For Sale',
      category: 'Sedan', price: '', condition: 'Foreign Used', location: 'Lagos',
      acceleration: '', color: '', owner_name: '', address: '', phone_number: '',
      image: null, images: [], year: new Date().getFullYear(), mileage: '',
      transmission: 'Automatic', fuel_type: 'Petrol', description: '', features: ''
    });
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleMainImageChange = (e) => {
    if (e.target.files && e.target.files[0]) setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleGalleryChange = (e) => {
    if (e.target.files) setFormData({ ...formData, images: [...formData.images, ...Array.from(e.target.files)] });
  };

  const removeMainImage = () => setFormData({ ...formData, image: null });
  const removeGalleryImage = (idx) => { setFormData({ ...formData, images: formData.images.filter((_, i) => i !== idx) });};

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this vehicle")) {
      try {
        await vehicleAPI.delete(id);
        toast.success("Vehicle removed");
        fetchInventory();
      } catch (error) { toast.error("Delete failed"); }
    }
  };
  
  const handleEdit = (v) => {
    setEditingVehicle(v);
    setFormData({
      ...v,
      features: Array.isArray(v.features) ? v.features.join(', ') : (v.features || ''),
      images: Array.isArray(v.images) ? v.images : []
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    // 1. Sanitize numeric fields to ensure they are NEVER empty strings
    const cleanPrice = formData.price === "" || formData.price === null ? "0" : String(formData.price);
    const cleanYear = formData.year === "" || formData.year === null ? "2026" : String(formData.year);
    const cleanAccel = formData.acceleration === "" || formData.acceleration === null ? "0.0" : String(formData.acceleration);
  
    const featureArray = typeof formData.features === 'string'
      ? formData.features.split(',').map(f => f.trim()).filter(Boolean)
      : (Array.isArray(formData.features) ? formData.features : []);
  
    try {
      const data = new FormData();
  
      // Mandatory & Text Fields
      data.append('name', formData.name || '');
      data.append('make', formData.make || '');
      data.append('model', formData.model || '');
      data.append('type', formData.type || 'Car');
      data.append('service', formData.service || 'For Sale');
      data.append('category', formData.category || 'Sedan');
      data.append('price', cleanPrice); // Used sanitized value
      data.append('condition', formData.condition || 'Foreign Used');
      data.append('location', formData.location || 'Lagos');
      data.append('year', cleanYear); // Used sanitized value
      data.append('acceleration', cleanAccel); // Used sanitized value
      data.append('color', formData.color || '');
      data.append('owner_name', formData.owner_name || '');
      data.append('address', formData.address || '');
      data.append('phone_number', formData.phone_number || '');
      data.append('mileage', formData.mileage || '0 km');
      data.append('transmission', formData.transmission || 'Automatic');
      data.append('fuel_type', formData.fuel_type || 'Petrol');
      data.append('description', formData.description || '');
      
      data.append('features', JSON.stringify(featureArray));
  
      // 2. IMAGE FIX: If it's a File (new upload), append it. 
      // If it's a String (existing URL during Edit), 
      // you may need to append it as a string OR handle it differently on the backend.
      if (formData.image instanceof File) {
        data.append('image', formData.image);
      } else if (typeof formData.image === 'string' && editingVehicle) {
        // If your backend allows 'image' to be a string URL during update:
        data.append('image', formData.image);
      }
  
      // 3. Gallery Images
      formData.images.forEach((file) => {
        if (file instanceof File) {
          data.append('images', file);
        }
        // Note: If you want to keep existing gallery images during an edit,
        // you must also send the existing URLs back to the server.
      });
  
      if (editingVehicle) {
        await vehicleAPI.update(editingVehicle.id, data);
        toast.success('Vehicle Updated!');
      } else {
        await vehicleAPI.create(data);
        toast.success('Vehicle Added!');
      }
  
      setIsDialogOpen(false);
      fetchInventory();
      resetForm();
    } catch (error) {
      // LOG THE ACTUAL ERROR DETAIL
      console.error("Backend Validation Error:", error.response?.data?.detail);
      toast.error("Validation Error: Check the console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    const sLower = searchQuery.toLowerCase();
    const matchesSearch = v.name.toLowerCase().includes(sLower) || (v.owner_name?.toLowerCase().includes(sLower));
    const matchesCond = filterCondition === 'All' || v.condition === filterCondition;
    return matchesSearch && matchesCond;
  });

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-4" />
      <p className="text-gray-500">Loading Admin Panel...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold flex items-center gap-2">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div className="absolute -right-1 -bottom-1 w-4 h-4 bg-black rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <span className="text-2xl font-bold text-white ml-2">Speedy Admin</span>
          </Link>
          <Link to="/"><Button variant="ghost">Back to Site</Button></Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Inventory" val={vehicles.length} icon={<Car className="text-red-600"/>} bg="bg-red-100" />
          <StatCard title="Brand New" val={vehicles.filter(v => v.condition === 'Brand New').length} icon={<CheckCircle className="text-green-600"/>} bg="bg-green-100" />
          <StatCard title="Foreign Used" val={vehicles.filter(v => v.condition === 'Foreign Used').length} icon={<LayoutDashboard className="text-blue-600"/>} bg="bg-blue-100" />
          <StatCard title="Nigerian Used" val={vehicles.filter(v => v.condition === 'Nigerian Used').length} icon={<CircleGauge className="text-yellow-600"/>} bg="bg-yellow-100" />
        </div>

        <Card className="shadow-xl">
          <CardContent className="p-0">
            {/* SEARCH & ADD SECTION - MOBILE OPTIMIZED */}
            <div className="p-4 sm:p-6 border-b flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="w-full sm:w-auto text-center sm:text-left">
                <h2 className="text-xl font-bold">Inventory</h2>
                <p className="text-xs text-gray-500">Manage listings</p>
              </div>
              
              <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input 
                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none" 
                    placeholder="Search..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) resetForm(); }}>
                  <DialogTrigger asChild>
                    <Button className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">
                      <Plus className="w-4 h-4 mr-2"/> Add New
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>{editingVehicle ? 'Edit' : 'Add'} Full Vehicle Details</DialogTitle>
                      <DialogDescription className="text-xs text-gray-500">
                        Provide specifications for the vehicle listing.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      
                      {/* Section: Basic Info */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold text-red-600 border-b pb-1">Basic Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <InputGroup label="Vehicle Name" name="name" val={formData.name} onChange={handleChange} placeholder="e.g. Toyota Camry 2026" />
                          <InputGroup label="Make" name="make" val={formData.make} onChange={handleChange} placeholder="Toyota" />
                          <InputGroup label="Model" name="model" val={formData.model} onChange={handleChange} placeholder="Camry" />
                          <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase">Type</label>
                            <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                              <SelectTrigger className="h-9"><SelectValue/></SelectTrigger>
                              <SelectContent>
                                {['Car', 'Truck', 'Pickup', 'Bus', 'Van', 'Motorcycle', 'Tricycle'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase">Category</label>
                            <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                              <SelectTrigger className="h-9"><SelectValue/></SelectTrigger>
                              <SelectContent>
                                {categories.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <InputGroup label="Year" name="year" type="number" val={formData.year} onChange={handleChange} />
                        </div>
                      </div>

                      {/* Section: Specs & Pricing */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold text-red-600 border-b pb-1">Specifications & Pricing</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <InputGroup label="Price (₦)" name="price" type="number" val={formData.price} onChange={handleChange} placeholder="e.g. 45000000" />
                          <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase">Condition</label>
                            <Select value={formData.condition} onValueChange={(v) => setFormData({...formData, condition: v})}>
                              <SelectTrigger className="h-9"><SelectValue/></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Brand New">Brand New</SelectItem>
                                <SelectItem value="Foreign Used">Foreign Used</SelectItem>
                                <SelectItem value="Nigerian Used">Nigerian Used</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase">Service</label>
                            <Select value={formData.service} onValueChange={(v) => setFormData({...formData, service: v})}>
                              <SelectTrigger className="h-9"><SelectValue/></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="For Sale">For Sale</SelectItem>
                                <SelectItem value="For Rent">For Rent</SelectItem>
                                <SelectItem value="For Lease">For Lease</SelectItem>
                                <SelectItem value="For Budget Sale">For Budget Sale</SelectItem>
                                <SelectItem value="Under Inspection">Under Inspection</SelectItem>
                                <SelectItem value="Sold">Sold</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase">Location</label>
                            <Select value={formData.location} onValueChange={(v) => setFormData({...formData, location: v})}>
                              <SelectTrigger className="h-9"><SelectValue/></SelectTrigger>
                              <SelectContent>
                                {locations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <InputGroup label="Mileage" name="mileage" val={formData.mileage} onChange={handleChange} placeholder="e.g. 45,000 km" />
                          <InputGroup label="Color" name="color" val={formData.color} onChange={handleChange} placeholder="e.g. Metallic Black" />
                          <InputGroup label="Acceleration (0-100)km/h" name="acceleration" val={formData.acceleration} onChange={handleChange} placeholder="e.g. 4.5" />
                          <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase">Transmission</label>
                            <Select value={formData.transmission} onValueChange={(v) => setFormData({...formData, transmission: v})}>
                              <SelectTrigger className="h-9"><SelectValue/></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Automatic">Automatic</SelectItem>
                                <SelectItem value="Manual">Manual</SelectItem>
                                <SelectItem value="CVT">CVT</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase">Fuel Type</label>
                            <Select value={formData.fuel_type} onValueChange={(v) => setFormData({...formData, fuel_type: v})}>
                              <SelectTrigger className="h-9"><SelectValue/></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Petrol">Petrol</SelectItem>
                                <SelectItem value="Diesel">Diesel</SelectItem>
                                <SelectItem value="Electric">Electric</SelectItem>
                                <SelectItem value="Hybrid">Hybrid</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Section: Seller Info */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold text-red-600 border-b pb-1">Seller / Dealer Info</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <InputGroup label="Owner/Dealer's/Company's Name" name="owner_name" val={formData.owner_name} onChange={handleChange} placeholder="e.g. Iyke Motor's Ltd." />
                          <InputGroup label="Phone Number" name="phone_number" val={formData.phone_number} onChange={handleChange} placeholder="+234....." />
                          <div className="sm:col-span-2">
                            <InputGroup label="Address" name="address" val={formData.address} onChange={handleChange} placeholder="e.g. 123, Lekki, Lagos" />
                          </div>
                        </div>
                      </div>

                      {/* Section: Media & Description */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold text-red-600 border-b pb-1">Media (Cancel uploads by clicking X)</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {/* Main Image */}
                          <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase">Main Image</label>
                            {formData.image ? (
                              <SafeImagePreview file={formData.image} onRemove={removeMainImage} />
                            ) : (
                              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <Upload className="w-8 h-8 text-gray-400 mb-2"/>
                                <span className="text-xs text-gray-500">Click to upload main image</span>
                                <input type="file" onChange={handleMainImageChange} className="hidden" accept="image/*"/>
                              </label>
                            )}
                          </div>

                          {/* Gallery Images */}
                          <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase">Gallery ({formData.images.length})</label>
                            <div className="grid grid-cols-3 gap-2">
                               {formData.images.map((img, idx) => (
                                 <SafeImagePreview key={idx} file={img} isGallery={true} onRemove={() => removeGalleryImage(idx)} />
                               ))}
                               <label className="flex items-center justify-center h-20 border-2 border-dashed rounded cursor-pointer hover:bg-gray-50">
                                 <Plus className="w-6 h-6 text-gray-400"/>
                                 <input type="file" multiple onChange={handleGalleryChange} className="hidden" accept="image/*"/>
                               </label>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold uppercase">Features (Comma separated)</label>
                          <textarea name="features" value={formData.features} onChange={handleChange} className="w-full p-2 border rounded-md text-sm" placeholder="Sunroof, Leather Seats, Navigation..." rows="2" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold uppercase">Description</label>
                          <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded-md text-sm" placeholder="Detailed vehicle history or notes..." rows="3" />
                        </div>
                      </div>

                      <Button type="submit" disabled={isSubmitting} className="w-full bg-red-600 py-6 text-lg font-bold">
                        {isSubmitting ? <Loader2 className="animate-spin mr-2"/> : null}
                        {editingVehicle ? 'Update Listing' : 'Add to Inventory'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* TABLE - SCROLLABLE ON MOBILE */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4 text-left">Vehicle</th>
                    <th className="p-4 text-left">Body Color</th>
                    <th className="p-4 text-left">Price</th>
                    <th className="p-4 text-left">Seller</th>
                    <th className="p-4 text-left">Address</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.map((v) => (
                    <tr key={v.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 flex items-center gap-3">
                        <img src={v.image} className="w-10 h-10 rounded object-cover" alt=""/>
                        <div>
                          <p className="font-medium">{v.name}</p>
                          <p className="text-[10px] text-gray-400">{v.location}-{v.service}</p>
                        </div>
                      </td>
                      <td className="p-4 font-bold">{v.color}</td>
                      <td className="p-4 font-bold">₦{parseInt(v.price).toLocaleString()}</td>
                      <td className="p-4 text-gray-600">{v.owner_name || 'N/A'}</td>
                      <td className="p-4 text-gray-600">{v.address || 'N/A'}</td>
                      <td className="p-4 text-right space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(v)}><Edit className="w-4 h-4 text-blue-600"/></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(v.id)}><Trash2 className="w-4 h-4 text-red-600"/></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredVehicles.length === 0 && (
                <div className="py-20 flex flex-col items-center text-gray-400">
                   <AlertCircle size={40} className="mb-2 opacity-20" />
                   <p>No listings found matches your search.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const InputGroup = ({ label, name, val, onChange, type="text", placeholder="" }) => (
  <div className="space-y-1">
    <label className="">{label}</label>
    <input 
      type={type} 
      name={name} 
      value={val} 
      onChange={onChange} 
      placeholder={placeholder}
      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-red-500 outline-none h-9 text-sm" 
      required={name === 'name' || name === 'price'} 
    />
  </div>
);

const StatCard = ({ title, val, icon, bg, color }) => (
  <Card className="border-none shadow-md">
    <CardContent className="p-6 flex justify-between items-center">
      <div><p className="text-sm text-gray-500">{title}</p><p className="text-2xl font-bold">{val}</p></div>
      <div className={`w-12 h-12 ${bg} ${color} rounded-lg flex items-center justify-center`}>{icon}</div>
    </CardContent>
  </Card>
);
export default AdminPanel;
