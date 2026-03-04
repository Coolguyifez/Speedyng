import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Car, Plus, Edit, Trash2, X, CheckCircle, Loader2, CircleGauge, Search } from 'lucide-react';
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

const AdminPanel = () => {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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

  const formatPrice = (price) => {
    if (!price) return "₦0";
    const num = parseFloat(price);
    if (num >= 1000000) return `₦${(num / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    if (num >= 1000) return `₦${(num / 1000).toFixed(0)}K`;
    return `₦${num.toLocaleString()}`;
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
  const removeGalleryImage = (idx) => setFormData({ ...formData, images: formData.images.filter((_, i) => i !== idx) });

  const handleDelete = async (id) => {
    if (window.confirm("Remove this vehicle from Speedy?")) {
      try {
        await vehicleAPI.delete(id);
        toast.success("Vehicle removed");
        fetchInventory();
      } catch (error) { toast.error("Delete failed"); }
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    const sLower = searchQuery.toLowerCase();
    const matchesSearch = v.name.toLowerCase().includes(sLower) || (v.owner_name?.toLowerCase().includes(sLower));
    const matchesCond = filterCondition === 'All' || v.condition === filterCondition;
    return matchesSearch && matchesCond;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    
    // Append fields
    Object.keys(formData).forEach(key => {
        if (key === 'image' || key === 'images' || key === 'features') return;
        data.append(key, formData[key]);
    });

    // Handle Features properly for Backend
    const featureArray = typeof formData.features === 'string' 
      ? formData.features.split(',').map(f => f.trim()).filter(Boolean)
      : formData.features;
    data.append('features', JSON.stringify(featureArray));

    if (formData.image instanceof File) data.append('image', formData.image);
    formData.images.forEach((file) => { if (file instanceof File) data.append('images', file); });

    try {
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
      toast.error(error.response?.data?.detail || "Operation failed");
    }
  };

  const handleEdit = (v) => {
    setEditingVehicle(v);
    setFormData({
      ...v,
      features: Array.isArray(v.features) ? v.features.join(', ') : v.features,
      images: Array.isArray(v.images) ? v.images : []
    });
    setIsDialogOpen(true);
  };

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
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">S</div>
            Speedy Admin
          </Link>
          <Link to="/"><Button variant="ghost">Back to Site</Button></Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Vehicles" val={vehicles.length} icon={<Car className="text-red-600"/>} bg="bg-red-100" />
          <StatCard title="Brand New" val={vehicles.filter(v => v.condition === 'Brand New').length} icon={<CheckCircle className="text-green-600"/>} bg="bg-green-100" />
          <StatCard title="Foreign Used" val={vehicles.filter(v => v.condition === 'Foreign Used').length} icon={<LayoutDashboard className="text-blue-600"/>} bg="bg-blue-100" />
          <StatCard title="Nigerian Used" val={vehicles.filter(v => v.condition === 'Nigerian Used').length} icon={<CircleGauge className="text-yellow-600"/>} bg="bg-yellow-100" />
        </div>

        <Card className="shadow-xl">
          <CardContent className="p-0">
            <div className="p-6 border-b flex flex-col md:flex-row justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Inventory Management</h2>
                <p className="text-sm text-gray-500">Manage Speedy's active listings</p>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input 
                    className="pl-10 pr-4 py-2 border rounded-lg text-sm" 
                    placeholder="Search vehicles..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) resetForm(); }}>
                  <DialogTrigger asChild>
                    <Button className="bg-red-600 hover:bg-red-700"><Plus className="w-4 h-4 mr-2"/>Add New</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>{editingVehicle ? 'Edit' : 'Add'} Vehicle</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="Name" name="name" val={formData.name} onChange={handleChange} />
                        <InputGroup label="Make" name="make" val={formData.make} onChange={handleChange} />
                        <InputGroup label="Model" name="model" val={formData.model} onChange={handleChange} />
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category</label>
                            <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>{categories.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                      </div>
                      {/* ... other fields remain similar, ensuring price is type="number" ... */}
                      <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="Price (₦)" name="price" type="number" val={formData.price} onChange={handleChange} />
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Condition</label>
                            <Select value={formData.condition} onValueChange={(v) => setFormData({...formData, condition: v})}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Brand New">Brand New</SelectItem>
                                    <SelectItem value="Foreign Used">Foreign Used</SelectItem>
                                    <SelectItem value="Nigerian Used">Nigerian Used</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Main Image</label>
                        <input type="file" onChange={handleMainImageChange} className="block w-full text-sm"/>
                        {formData.image && <p className="text-xs text-green-600">Image selected</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Features (Comma separated)</label>
                        <textarea name="features" value={formData.features} onChange={handleChange} className="w-full p-2 border rounded" rows="2" />
                      </div>

                      <Button type="submit" className="w-full bg-red-600">Save Vehicle</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4 text-left">Vehicle</th>
                    <th className="p-4 text-left">Price</th>
                    <th className="p-4 text-left">Condition</th>
                    <th className="p-4 text-left">Location</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.map((v) => (
                    <tr key={v.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 flex items-center gap-3">
                        <img src={v.image} className="w-10 h-10 rounded object-cover" alt=""/>
                        <span className="font-medium">{v.name}</span>
                      </td>
                      <td className="p-4 font-bold">{formatPrice(v.price)}</td>
                      <td className="p-4"><span className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs">{v.condition}</span></td>
                      <td className="p-4 text-gray-600">{v.location}</td>
                      <td className="p-4 text-right space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(v)}><Edit className="w-4 h-4 text-blue-600"/></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(v.id)}><Trash2 className="w-4 h-4 text-red-600"/></Button>
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

const StatCard = ({ title, val, icon, bg }) => (
  <Card className="border-none shadow-md">
    <CardContent className="p-6 flex justify-between items-center">
      <div><p className="text-sm text-gray-500">{title}</p><p className="text-2xl font-bold">{val}</p></div>
      <div className={`w-12 h-12 ${bg} rounded-lg flex items-center justify-center`}>{icon}</div>
    </CardContent>
  </Card>
);

const InputGroup = ({ label, name, val, onChange, type="text" }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-gray-600 uppercase">{label}</label>
    <input type={type} name={name} value={val} onChange={onChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-red-500 outline-none" required />
  </div>
);

export default AdminPanel;
