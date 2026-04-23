import React, { useState, useEffect, useContext } from 'react';
import FoodCard from '../components/FoodCard';
import Modal from '../components/Modal';
import { AuthContext } from '../context/AuthContext';
import './FindFood.css';

const FindFood = () => {
  const [listings, setListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedFood, setSelectedFood] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { token, user } = useContext(AuthContext);
  const [claimsMap, setClaimsMap] = useState({});

  const filters = ['All', 'Cooked Meal', 'Raw Vegetables', 'Packaged Food', 'Bakery'];

  useEffect(() => {
    const fetchData = async () => {
      // Fetch approved donations
      const donationsRes = await fetch('http://localhost:5000/api/donations?status=approved&isClaimed=false');
      const donationsData = await donationsRes.json();

      // Fetch user's claims
      let userClaims = [];
      if (token) {
        const claimsRes = await fetch('http://localhost:5000/api/claims/my', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (claimsRes.ok) {
          userClaims = await claimsRes.json();
        }
      }

      // Build claimsMap
      const map = {};
      userClaims.forEach(c => {
        map[c.donationId] = c.status;
      });
      setClaimsMap(map);

      // 🔥 MERGE CLAIM STATUS INTO LISTINGS (this fixes refresh issue)
      const mapped = donationsData.map(d => {
        const claimStatus = map[d._id] || null;
        return {
          id: d._id,
          name: d.foodName,
          category: d.category,
          quantity: `${d.quantity} ${d.unit}`,
          location: d.city,
          timePosted: 'just now',
          expiryText: new Date(d.expiryTime).toLocaleString(),
          isUrgent: new Date(d.expiryTime) < new Date(Date.now() + 86400000),
          claimStatus,                    // ← NEW
          isRequested: claimStatus === 'pending'
        };
      });

      setListings(mapped);
    };

    fetchData();
  }, [token]);

  const filteredListings = listings.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          food.location.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (activeFilter === 'All') return true;
    return food.category === activeFilter;
  });

  const handleRequestClick = (food) => {
    if (!user) {
      alert('Please login to request food');
      return;
    }
    // Prevent clicking if already pending
    if (food.claimStatus === 'pending') {
      alert('You already have a pending request for this food.');
      return;
    }
    setSelectedFood(food);
    setIsModalOpen(true);
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!token || !selectedFood) return;

    try {
      const res = await fetch('http://localhost:5000/api/claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ donationId: selectedFood.id })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.msg || 'Failed to send request');
        return;
      }

      // Update local state so UI updates instantly
      setClaimsMap(prev => ({ ...prev, [selectedFood.id]: 'pending' }));

      setListings(prev =>
        prev.map(item =>
          item.id === selectedFood.id
            ? { ...item, claimStatus: 'pending', isRequested: true }
            : item
        )
      );

      alert(`Request sent for ${selectedFood.name}!`);
      setIsModalOpen(false);

    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="find-food-page page-container">
      {/* Your original header, search, filters stay exactly the same */}
      <div className="find-header">
        <h1>Find Food Near You</h1>
        <p>Browse available food listings in your area and claim them before they expire.</p>
        
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search by city or food type..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="btn btn-primary search-btn">Search</button>
        </div>
        
        <div className="filter-chips">
          {filters.map(filter => (
            <button 
              key={filter}
              className={`chip ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="listings-container">
        <div className="listings-grid">
          {filteredListings.map(food => (
            <FoodCard 
              key={food.id} 
              food={food} 
              onRequestClick={handleRequestClick} 
            />
          ))}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Request Food">
        {selectedFood && (
          <div className="request-modal-content">
            <div className="request-summary">
              <strong>Requesting:</strong> {selectedFood.name} ({selectedFood.quantity})
            </div>
            <form onSubmit={handleRequestSubmit} className="request-form">
              <button type="submit" className="btn btn-primary full-width">Send Request to Admin</button>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FindFood;