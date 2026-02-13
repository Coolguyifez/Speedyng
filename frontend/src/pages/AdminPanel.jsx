import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Car, Plus, Edit, Trash2, X, CheckCircle, Loader2, CircleGauge } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
// KEEPING YOUR DESIGN - BUT ADDING API CALLS
import { vehicleAPI } from '../services/api';

const categories = [
  { name: 'Subcompact Sedan' },
  { name: 'Compact Sedan' },
  { name: 'Mid-size Sedan' },
  { name: 'Full-Size Sedan' },
  { name: 'Luxury Sedan' },
  { name: 'Sport Sedan' },
  { name: 'Subcompact SUV' },
  { name: 'Compact SUV' },
  { name: 'Mid-size SUV' },
  { name: 'Full-size SUV' },
  { name: 'Coupe SUV' },
  { name: 'CUV' },
  { name: 'Luxury SUV' },
  { name: 'Sport Compact' },
  { name: 'Hatchback' },
  { name: 'Exotic' },
  { name: 'Box Truck' },
  { name: 'Dump Truck' },
  { name: 'Flatbed Truck' },
  { name: 'Tanker Truck' },
  { name: 'Refrigerator Truck' },
  { name: 'Tow Truck' },
  { name: 'Trailer Head' },
  { name: 'Single Cabin Pickup' },
  { name: 'Double Cabin Pickup' },
  { name: 'Compact Pickup' },
  { name: 'Full-Size Pickup' },
  { name: 'Heavy-Duty Pickup (Dually)' },
  { name: 'Off-Road Pickup' },
  { name: 'Mini-Bus' },
  { name: 'Coaster Bus' },
  { name: 'School Bus' },
  { name: 'Luxury Coach' },
  { name: 'Cargo Van' },
  { name: 'Passenger Van' },
  { name: 'Minivan' },
  { name: 'Panel Van' },
  { name: 'Sport Bike' },
  { name: 'Cruiser' },
  { name: 'Touring Bike' },
  { name: 'Standard Motorcycle' },
  { name: 'Passenger Keke' },
  { name: 'Cargo Tricycle' },
  { name: 'Delivery Tricycle' },
];
const locations = ['Lagos', 'Abuja', 'Port Harcourt', 'Benin', 'Warri', 'Asaba'];

const AdminPanel = () => {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'Car',          
    service: 'For Sale',
    category: 'Sedan',
    price: '',
    condition: 'Foreign Used',
    location: 'Lagos',
    acceleration: '',
    color: '',
    owner_name: '',
    address: '',       
    phone_number: '',
    image: '',
    images: '',
    year: new Date().getFullYear(),
    mileage: '',
    transmission: 'Automatic',
    fuel_type: 'Petrol',
    description: '',
    features: ''
  });

  // Fetch data from real database on load
  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await vehicleAPI.getAll();
      setVehicles(response.data);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Database connection failed. Check backend logs.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function for the 80K / 8M formatting
  const formatPrice = (price) => {
    if (price === undefined || price === null || price === "") return "₦0";
    const num = parseFloat(price);
    
    if (num >= 1000000) {
      return `₦${(num / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    }
    if (num >= 1000) {
      return `₦${(num / 1000).toFixed(0)}K`;
    }
    return `₦${num.toLocaleString()}`;
  };

  const resetForm = () => {
    setEditingVehicle(null);
    setFormData({
      name: '',
      type: 'Car',           
      service: 'For Sale',
      category: 'Sedan',
      price: '',
      condition: 'Foreign Used',
      location: 'Lagos',
      acceleration: '',
      color: '',
      owner_name: '',
      address: '',
      phone_number: '',
      image: '',
      images: '',
      year: new Date().getFullYear(),
      mileage: '',
      transmission: 'Automatic',
      fuel_type: 'Petrol',
      description: '',
      features: ''
    });
  };
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const processedData = {
      ...formData,
      // Ensure these are numbers for the database
      price: parseFloat(formData.price),
      year: parseInt(formData.year),
      acceleration: formData.acceleration ? parseFloat(formData.acceleration) : null,
      verified: true,
      images: typeof formData.images === 'string' 
        ? formData.images.split(',').map(img => img.trim()).filter(img => img !== "") 
        : formData.images,
      // Ensure features is an array, as backend expects a list
      features: typeof formData.features === 'string' 
        ? formData.features.split(',').map(f => f.trim()).filter(f => f !== "") 
        : formData.features
    };
  
    try {
      if (editingVehicle) {
        await vehicleAPI.update(editingVehicle.id, processedData);
        toast.success('Vehicle Updated successful!');
      } else {
        await vehicleAPI.create(processedData);
        toast.success('Vehicle added to inventory!');
      }
      setIsDialogOpen(false);
      fetchInventory(); // Refreshes your table
      resetForm();
    } catch (error) {
      // This will now catch the 500 or CORS error and show details
      console.error("Submission error details:", error.response?.data);
      toast.error(error.response?.data?.detail?.[0]?.msg || "Server Error: Check field names");
    }
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Permanently delete this vehicle?')) {
      try {
        await vehicleAPI.delete(id);
        toast.success('Vehicle removed from database');
        setVehicles(vehicles.filter(v => v.id !== id));
      } catch (error) {
        toast.error("Delete failed");
      }
    }
  };

  const handleEdit = (v) => {
    setEditingVehicle(v);
    setFormData({
      ...v,
      acceleration: v.acceleration || '',
      color: v.color || '',
      address: v.address || '',           // Ensure value is captured
      phone_number: v.phone_number || '', // Ensure value is captured
      fuel_type: v.fuel_type || 'Petrol', // Mapping to match state
      features: Array.isArray(v.features) ? v.features.join(', ') : v.features,
      images: Array.isArray(v.images) ? v.images.join(', ') : v.images
    });
    setIsDialogOpen(true);
  };

  // YOUR ORIGINAL LOADING UI DESIGN
  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-4" />
      <p className="text-gray-500">Loading Adminpanel...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
               <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-300">
                    <span className="text-white font-bold text-xl">S</span>
                  </div>
                  <div className="absolute -right-1 -bottom-1 w-4 h-4 bg-black rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <span className="text-2xl font-bold">Speedy Admin</span>
              </Link>
            </div>
            <Link to="/">
              <Button variant="ghost" className="text-white hover:text-red-400">
                Back to Site
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Vehicle</p>
                  <p className="text-3xl font-bold text-gray-900">{vehicles.length}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Car className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Brand New</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {vehicles.filter(v => v.condition === 'Brand New').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Foreign Used</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {vehicles.filter(v => v.condition === 'Foreign Used').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <LayoutDashboard className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Nigerian Used</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {vehicles.filter(v => v.condition === 'Nigerian Used').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CircleGauge className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Categories</p>
                  <p className="text-3xl font-bold text-gray-900">{categories.length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <LayoutDashboard className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vehicles Management */}
        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Manage Vehicles</h2>
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-red-600 hover:bg-red-700 text-white transition-all duration-300">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Vehicle
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
                    <DialogDescription>
                      Fill out the details below to update the inventory.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle model</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="Toyota Camry 2024"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <Select 
                          value={formData.category} 
                          onValueChange={(value) => setFormData({...formData, category: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat, index) => (
                              <SelectItem key={index} value={cat.name}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Price (₦)</label>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="18500000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                        <Select value={formData.condition} onValueChange={(value) => setFormData({...formData, condition: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Brand New">Brand New</SelectItem>
                            <SelectItem value="Foreign Used">Foreign Used</SelectItem>
                            <SelectItem value="Nigerian Used">Nigerian Used</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                        <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Car">Car</SelectItem>
                            <SelectItem value="Truck">Truck</SelectItem>
                            <SelectItem value="Van">Van</SelectItem>
                            <SelectItem value="Bus">Bus</SelectItem>
                            <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                            <SelectItem value="Tricycle">Tricycle</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
                        <Select value={formData.service} onValueChange={(value) => setFormData({...formData, service: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Service" />
                          </SelectTrigger>
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
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <Select value={formData.location} onValueChange={(value) => setFormData({...formData, location: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.filter(l => l !== 'All Locations').map((loc, index) => (
                              <SelectItem key={index} value={loc}>{loc}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Acceleration (0-100 km/h)</label>
                        <input
                          type="number"
                          name="acceleration"
                          step="0.1"
                          value={formData.acceleration}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="e.g. 6.2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Exterior Color</label>
                        <input
                          type="text"
                          name="color"
                          value={formData.color}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="e.g. Metallic Silver"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                        <input
                          type="number"
                          name="year"
                          value={formData.year}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Dealer's/Seller's Name</label>
                        <input
                          type="text"
                          name="owner_name"
                          value={formData.owner_name}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="Enter owner's full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="e.g. 123 Lekki Phase 1, Lagos"
                        />
                      </div>  
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input
                          type="text"
                          name="phone_number"
                          value={formData.phone_number}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="09012345678"
                        />
                      </div>
                    </div>
                      
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mileage</label>
                        <input
                          type="text"
                          name="mileage"
                          value={formData.mileage}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="15,000 km"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Transmission</label>
                        <Select value={formData.transmission} onValueChange={(value) => setFormData({...formData, transmission: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Automatic">Automatic</SelectItem>
                            <SelectItem value="Manual">Manual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type</label>
                      <Select value={formData.fuel_type} onValueChange={(value) => setFormData({...formData, fuel_type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Petrol">Petrol</SelectItem>
                          <SelectItem value="Diesel">Diesel</SelectItem>
                          <SelectItem value="Electric">Electric</SelectItem>
                          <SelectItem value="Hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                      <input
                        type="url"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Images URL</label>
                      <input
                        type="url"
                        name="images"
                        value={formData.images}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="https://example.com/image.jpg, https://example.com/image.jpg "
                      />
                    </div>
                    

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                        placeholder="Brief description of the car"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Features (comma separated)</label>
                      <textarea
                        name="features"
                        value={formData.features}
                        onChange={handleChange}
                        required
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                        placeholder="Leather Seats, Sunroof, Navigation System"
                      />
                    </div>

                    <div className="flex justify-end space-x-3">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">
                        {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Cars Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Vehicle</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Exterior Color</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Service</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Condition</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Location</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Dealer's/Seller's Name</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Address</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Phone Number</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((v) => (
                    <tr key={v.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img src={v.image} alt={v.name} className="w-12 h-12 rounded object-cover" />
                          <span className="font-medium text-gray-900">{v.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{v.type}</td>
                      <td className="py-3 px-4 text-gray-700">{v.color}</td>
                      <td className="py-3 px-4 text-gray-700">{v.service}</td>
                      <td className="py-3 px-4 text-gray-700">{v.category}</td>
                      <td className="py-3 px-4 text-gray-900 font-semibold">{formatPrice(v.price)}</td>
                      <td className="py-3 px-4">
                        <span className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium">
                          {v.condition}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{v.location}</td>
                      <td className="py-3 px-4 text-gray-700">{v.owner_name}</td>
                      <td className="py-3 px-4 text-gray-700">{v.address}</td>
                      <td className="py-3 px-4 text-gray-700">{v.phone_number}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(v)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(v.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
