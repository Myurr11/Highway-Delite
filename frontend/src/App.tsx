import React, { useState, useEffect } from 'react';
import { MapPin, Check, ChevronLeft, ChevronRight } from 'lucide-react';

// Types
interface Experience {
  id: string;
  title: string;
  location: string;
  price: number;
  image: string;
  description: string;
  fullDescription: string;
  badge?: string;
  minAge: number;
}

interface TimeSlot {
  time: string;
  available: number;
  soldOut: boolean;
}

interface BookingData {
  experience: Experience;
  date: Date | null;
  time: string | null;
  quantity: number;
  subtotal: number;
  taxes: number;
  total: number;
}

// API Service
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const API = {
  async getExperiences(search = ''): Promise<Experience[]> {
    try {
      const url = search 
        ? `${API_BASE_URL}/experiences?search=${encodeURIComponent(search)}`
        : `${API_BASE_URL}/experiences`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch experiences');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return getMockExperiences(search);
    }
  },

  async getExperience(id: string): Promise<Experience | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/experiences/${id}`);
      if (!response.ok) throw new Error('Failed to fetch experience');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      const experiences = getMockExperiences();
      return experiences.find(exp => exp.id === id) || null;
    }
  },

  async getAvailability(id: string, date: Date): Promise<TimeSlot[]> {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const response = await fetch(`${API_BASE_URL}/availability/${id}?date=${dateStr}`);
      if (!response.ok) throw new Error('Failed to fetch availability');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return getMockAvailability();
    }
  },

  async validatePromo(code: string): Promise<{ discount: number; type: string } | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/promo/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      const promos: Record<string, { discount: number; type: string }> = {
        'SAVE10': { discount: 0.10, type: 'percentage' },
        'FLAT100': { discount: 100, type: 'fixed' }
      };
      return promos[code.toUpperCase()] || null;
    }
  },

  async createBooking(data: any): Promise<{ success: boolean; refId: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create booking');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: true,
        refId: 'HUF' + Math.random().toString(36).substr(2, 5).toUpperCase()
      };
    }
  }
};

// Mock data fallbacks
function getMockExperiences(search = ''): Experience[] {
  const experiences = [
    {
      id: 'kayak-udupi',
      title: 'Kayaking',
      location: 'Udupi',
      price: 999,
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
      description: 'Curated small-group experience. Certified guide. Safety first with gear included.',
      fullDescription: 'Helmet and Life jackets along with an expert will accompany in kayaking.',
      badge: '280 Fill × 170',
      minAge: 10
    },
    {
      id: 'kayak-karnataka',
      title: 'Kayaking',
      location: 'Udupi, Karnataka',
      price: 999,
      image: 'https://images.unsplash.com/photo-1597423244036-ef5020e83f3c?w=800',
      description: 'Curated small-group experience. Certified guide. Safety first with gear included.',
      fullDescription: 'Helmet and Life jackets along with an expert will accompany in kayaking.',
      badge: 'Kapil',
      minAge: 10
    },
    {
      id: 'nandi-hills',
      title: 'Nandi Hills Sunrise',
      location: 'Bangalore',
      price: 899,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      description: 'Curated small-group experience. Certified guide. Safety first with gear included.',
      fullDescription: 'Early morning trip to witness breathtaking sunrise views.',
      minAge: 5
    },
    {
      id: 'coffee-trail',
      title: 'Coffee Trail',
      location: 'Coorg',
      price: 1299,
      image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800',
      description: 'Curated small-group experience. Certified guide. Safety first with gear included.',
      fullDescription: 'Explore coffee plantations and learn about coffee cultivation.',
      minAge: 8
    },
    {
      id: 'boat-cruise',
      title: 'Boat Cruise',
      location: 'Sunderban',
      price: 999,
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
      description: 'Curated small-group experience. Certified guide. Safety first with gear included.',
      fullDescription: 'Scenic boat ride through pristine waters.',
      minAge: 5
    },
    {
      id: 'bunjee-jumping',
      title: 'Bunjee Jumping',
      location: 'Manali',
      price: 99,
      image: 'https://images.unsplash.com/photo-1534172420014-447a97c44e8d?w=800',
      description: 'Curated small-group experience. Certified guide. Safety first with gear included.',
      fullDescription: 'Experience the ultimate adrenaline rush.',
      minAge: 18
    }
  ];
  
  if (search.toLowerCase()) {
    return experiences.filter(exp => 
      exp.title.toLowerCase().includes(search.toLowerCase()) ||
      exp.location.toLowerCase().includes(search.toLowerCase())
    );
  }
  return experiences;
}

function getMockAvailability(): TimeSlot[] {
  return [
    { time: '07:00 am', available: 4, soldOut: false },
    { time: '09:00 am', available: 2, soldOut: false },
    { time: '11:00 am', available: 5, soldOut: false },
    { time: '01:00 pm', available: 0, soldOut: true }
  ];
}

// Components
const HomePage: React.FC<{
  onSelectExperience: (id: string) => void;
}> = ({ onSelectExperience }) => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalExperiences, setTotalExperiences] = useState(0);
  const experiencesPerPage = 8;

  useEffect(() => {
    loadExperiences();
  }, [currentPage]);

  const loadExperiences = async () => {
    setLoading(true);
    // For now, we'll use the existing API and handle pagination client-side
    // since the current API doesn't support pagination parameters
    const data = await API.getExperiences(search);
    
    // Client-side pagination
    const startIndex = (currentPage - 1) * experiencesPerPage;
    const endIndex = startIndex + experiencesPerPage;
    const paginatedExperiences = data.slice(startIndex, endIndex);
    
    setExperiences(paginatedExperiences);
    setTotalExperiences(data.length);
    setLoading(false);
  };

  const handleSearch = async () => {
    setCurrentPage(1);
    setLoading(true);
    const data = await API.getExperiences(search);
    
    // Client-side pagination
    const startIndex = 0;
    const endIndex = experiencesPerPage;
    const paginatedExperiences = data.slice(startIndex, endIndex);
    
    setExperiences(paginatedExperiences);
    setTotalExperiences(data.length);
    setLoading(false);
  };

  const totalPages = Math.ceil(totalExperiences / experiencesPerPage);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div className="leading-tight">
                <div className="font-bold text-base">highway</div>
                <div className="text-[10px] text-gray-600">delite</div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex items-center gap-2 flex-1 max-w-md mx-8">
              <input
                type="text"
                placeholder="Search experiences"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-md text-sm focus:outline-none focus:bg-white focus:border-gray-300"
              />
              <button 
                onClick={handleSearch}
                className="px-6 py-2.5 bg-[#FACC15] text-black rounded-md font-medium text-sm hover:bg-[#EAB308] transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {experiences.map(exp => (
                <div 
                  key={exp.id} 
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => onSelectExperience(exp.id)}
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gray-100">
                    <img 
                      src={exp.image} 
                      alt={exp.title} 
                      className="w-full h-full object-cover" 
                    />
                    {exp.badge && (
                      <div className="absolute top-3 right-3 bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium">
                        {exp.badge}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Title and Location */}
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-base">{exp.title}</h3>
                      <span className="text-xs text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md ml-2 whitespace-nowrap">
                        {exp.location}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                      {exp.description}
                    </p>

                    {/* Price and Button */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-gray-500">From </span>
                        <span className="font-bold text-base">₹{exp.price}</span>
                      </div>
                      <button className="px-4 py-2 bg-[#FACC15] text-black rounded-lg text-sm font-medium hover:bg-[#EAB308] transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({totalExperiences} total experiences)
                  </span>
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

const DetailsPage: React.FC<{
  experienceId: string;
  onBack: () => void;
  onConfirm: (data: BookingData) => void;
}> = ({ experienceId, onBack, onConfirm }) => {
  const [experience, setExperience] = useState<Experience | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availability, setAvailability] = useState<TimeSlot[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExperience();
  }, [experienceId]);

  useEffect(() => {
    if (selectedDate) {
      loadAvailability();
    }
  }, [selectedDate]);

  const loadExperience = async () => {
    const data = await API.getExperience(experienceId);
    setExperience(data);
    setLoading(false);
    
    const today = new Date();
    setSelectedDate(today);
  };

  const loadAvailability = async () => {
    if (selectedDate) {
      const data = await API.getAvailability(experienceId, selectedDate);
      setAvailability(data);
    }
  };

  const dates = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const formatDate = (date: Date) => {
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  if (loading || !experience) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  const subtotal = experience.price * quantity;
  const taxes = Math.round(subtotal * 0.059);
  const total = subtotal + taxes;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <button 
              onClick={onBack} 
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="font-medium text-sm">Details</span>
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div className="leading-tight">
                <div className="font-bold text-base">highway</div>
                <div className="text-[10px] text-gray-600">delite</div>
              </div>
            </div>

            {/* Search Button */}
            <button className="px-6 py-2.5 bg-[#FACC15] text-black rounded-md font-medium text-sm hover:bg-[#EAB308] transition-colors">
              Search
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2">
            {/* Main Image */}
            <div className="relative w-full h-[400px] rounded-xl overflow-hidden border-4 border-[#FACC15] mb-6">
              <img 
                src={experience.image} 
                alt={experience.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Title and Description */}
            <h1 className="text-3xl font-bold mb-2">{experience.title}</h1>
            <p className="text-sm text-gray-600 mb-6">{experience.fullDescription}</p>

            {/* Choose Date */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Choose date</h2>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {dates.map((date, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(date)}
                    className={`px-6 py-3 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                      selectedDate?.toDateString() === date.toDateString()
                        ? 'bg-[#FACC15] text-black'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {idx === 0 ? 'Oct 22' : formatDate(date)}
                  </button>
                ))}
              </div>
            </div>

            {/* Choose Time */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Choose time</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {availability.map((slot, idx) => (
                  <button
                    key={idx}
                    onClick={() => !slot.soldOut && setSelectedTime(slot.time)}
                    disabled={slot.soldOut}
                    className={`p-3 rounded-lg font-medium text-sm text-center transition-colors ${
                      slot.soldOut
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : selectedTime === slot.time
                        ? 'bg-[#FACC15] text-black border-2 border-[#FACC15]'
                        : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-semibold">{slot.time}</div>
                    <div className="text-xs mt-1">
                      {slot.soldOut ? (
                        <span className="text-red-600">Sold out</span>
                      ) : (
                        <span className="text-gray-600">{slot.available} left</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-4">All times are in IST (GMT +5:30)</p>
            </div>

            {/* About */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-2">About</h2>
              <p className="text-sm text-gray-600">
                Scenic routes, trained guides, and safety briefing. Minimum age {experience.minAge}.
              </p>
            </div>
          </div>

          {/* Right Column - Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-xl p-6 sticky top-24 border border-gray-200">
              {/* Price */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <span className="text-sm text-gray-600">Starts at</span>
                <span className="text-2xl font-bold">₹{experience.price}</span>
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <span className="text-sm text-gray-600">Quantity</span>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-100 flex items-center justify-center text-lg font-semibold"
                  >
                    −
                  </button>
                  <span className="font-medium w-8 text-center">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-100 flex items-center justify-center text-lg font-semibold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taxes</span>
                  <span className="font-medium">₹{taxes}</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mb-6 pt-4 border-t border-gray-200">
                <span className="text-xl font-bold">Total</span>
                <span className="text-2xl font-bold">₹{total}</span>
              </div>

              {/* Confirm Button */}
              <button 
                onClick={() => onConfirm({
                  experience,
                  date: selectedDate,
                  time: selectedTime,
                  quantity,
                  subtotal,
                  taxes,
                  total
                })}
                disabled={!selectedDate || !selectedTime}
                className="w-full py-3 bg-[#FACC15] text-black rounded-lg font-medium text-sm hover:bg-[#EAB308] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const CheckoutPage: React.FC<{
  bookingData: BookingData;
  onBack: () => void;
  onSubmit: (data: any) => void;
}> = ({ bookingData, onBack, onSubmit }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    promoCode: ''
  });
  const [agreed, setAgreed] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePromoApply = async () => {
    if (!formData.promoCode) return;
    
    setLoading(true);
    const promo = await API.validatePromo(formData.promoCode);
    
    if (promo) {
      const discount = promo.type === 'percentage' 
        ? bookingData.subtotal * promo.discount
        : promo.discount;
      setPromoDiscount(Math.round(discount));
      setPromoError('');
    } else {
      setPromoDiscount(0);
      setPromoError('Invalid promo code');
    }
    setLoading(false);
  };

  const finalTotal = Math.max(0, bookingData.total - promoDiscount);

  const handleSubmit = () => {
    if (!formData.fullName || !formData.email || !agreed) {
      alert('Please fill all required fields and agree to terms');
      return;
    }
    onSubmit({ ...formData, finalTotal });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <button 
              onClick={onBack} 
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="font-medium text-sm">Checkout</span>
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div className="leading-tight">
                <div className="font-bold text-base">highway</div>
                <div className="text-[10px] text-gray-600">delite</div>
              </div>
            </div>

            {/* Search Button */}
            <button className="px-6 py-2.5 bg-[#FACC15] text-black rounded-md font-medium text-sm hover:bg-[#EAB308] transition-colors">
              Search
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              {/* Name and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Full name
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-200 border-0 rounded-md text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-200 border-0 rounded-md text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>

              {/* Promo Code */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Promo code"
                  value={formData.promoCode}
                  onChange={(e) => setFormData({...formData, promoCode: e.target.value})}
                  className="flex-1 px-4 py-2.5 bg-gray-200 border-0 rounded-md text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-yellow-400"
                />
                <button 
                  onClick={handlePromoApply}
                  disabled={loading}
                  className="px-6 py-2.5 bg-black text-white rounded-md font-medium text-sm hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
                >
                  Apply
                </button>
              </div>

              {/* Promo Messages */}
              {promoError && (
                <p className="text-xs text-red-600 mb-4">{promoError}</p>
              )}
              {promoDiscount > 0 && (
                <p className="text-xs text-green-600 mb-4">Promo applied! You saved ₹{promoDiscount}</p>
              )}

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-yellow-600 focus:ring-yellow-400"
                />
                <label htmlFor="terms" className="text-xs text-gray-600">
                  I agree to the Terms of Service and Privacy Policy
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-xl p-6 sticky top-24 border border-gray-200">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              {/* Experience Details */}
              <div className="flex gap-3 mb-4 pb-4 border-b border-gray-200">
                <img 
                  src={bookingData.experience.image} 
                  alt={bookingData.experience.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-sm">{bookingData.experience.title}</h3>
                  <p className="text-xs text-gray-600">{bookingData.experience.location}</p>
                  <p className="text-xs text-gray-600">
                    {bookingData.date && bookingData.date.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })} • {bookingData.time}
                  </p>
                  <p className="text-xs text-gray-600">Qty: {bookingData.quantity}</p>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{bookingData.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taxes</span>
                  <span className="font-medium">₹{bookingData.taxes}</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Promo Discount</span>
                    <span className="font-medium text-green-600">-₹{promoDiscount}</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mb-6 pt-4 border-t border-gray-200">
                <span className="text-xl font-bold">Total</span>
                <span className="text-2xl font-bold">₹{finalTotal}</span>
              </div>

              {/* Pay Button */}
              <button 
                onClick={handleSubmit}
                className="w-full py-3 bg-[#FACC15] text-black rounded-lg font-medium text-sm hover:bg-[#EAB308] transition-colors"
              >
                Pay Now
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const ConfirmationPage: React.FC<{
  bookingRef: string;
  onBackToHome: () => void;
}> = ({ bookingRef, onBackToHome }) => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-6">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        
        {/* Success Message */}
        <h1 className="text-3xl font-bold mb-4">Booking Confirmed!</h1>
        <p className="text-gray-600 mb-6">
          Your booking has been successfully confirmed. Your reference number is:
        </p>
        
        {/* Reference Number */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg py-4 px-6 mb-6">
          <span className="font-mono font-bold text-lg">{bookingRef}</span>
        </div>
        
        {/* Additional Info */}
        <p className="text-sm text-gray-500 mb-8">
          A confirmation email has been sent to your email address with all the details.
        </p>
        
        {/* Back to Home Button */}
        <button 
          onClick={onBackToHome}
          className="w-full py-3 bg-[#FACC15] text-black rounded-lg font-medium text-sm hover:bg-[#EAB308] transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'details' | 'checkout' | 'confirmation'>('home');
  const [selectedExperienceId, setSelectedExperienceId] = useState<string>('');
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [bookingRef, setBookingRef] = useState<string>('');

  const handleSelectExperience = (id: string) => {
    setSelectedExperienceId(id);
    setCurrentPage('details');
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    setSelectedExperienceId('');
    setBookingData(null);
  };

  const handleBackFromDetails = () => {
    setCurrentPage('home');
    setSelectedExperienceId('');
  };

  const handleBackFromCheckout = () => {
    setCurrentPage('details');
  };

  const handleConfirmBooking = (data: BookingData) => {
    setBookingData(data);
    setCurrentPage('checkout');
  };

  const handleSubmitBooking = async (checkoutData: any) => {
    try {
      const bookingPayload = {
        ...bookingData,
        customerInfo: {
          fullName: checkoutData.fullName,
          email: checkoutData.email
        },
        promoCode: checkoutData.promoCode,
        finalTotal: checkoutData.finalTotal
      };

      const result = await API.createBooking(bookingPayload);
      
      if (result.success) {
        setBookingRef(result.refId);
        setCurrentPage('confirmation');
      } else {
        alert('Failed to create booking. Please try again.');
      }
    } catch (error) {
      console.error('Booking submission error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="App">
      {currentPage === 'home' && (
        <HomePage onSelectExperience={handleSelectExperience} />
      )}
      
      {currentPage === 'details' && selectedExperienceId && (
        <DetailsPage
          experienceId={selectedExperienceId}
          onBack={handleBackFromDetails}
          onConfirm={handleConfirmBooking}
        />
      )}
      
      {currentPage === 'checkout' && bookingData && (
        <CheckoutPage
          bookingData={bookingData}
          onBack={handleBackFromCheckout}
          onSubmit={handleSubmitBooking}
        />
      )}
      
      {currentPage === 'confirmation' && (
        <ConfirmationPage
          bookingRef={bookingRef}
          onBackToHome={handleBackToHome}
        />
      )}
    </div>
  );
};

export default App;