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
        const expiryTime = new Date(d.expiryTime).getTime();
        const now = Date.now();
        const timeLeft = expiryTime - now;

        return {
          id: d._id,
          name: d.foodName,
          category: d.category,
          quantity: `${d.quantity} ${d.unit}`,
          location: d.city,
          pickupText: d.pickupTime ? new Date(d.pickupTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'short', timeStyle: 'short' }) : 'N/A',
          expiryText: new Date(d.expiryTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }),
          isExpired: timeLeft <= 0,
          isUrgent: timeLeft > 0 && timeLeft <= 6 * 60 * 60 * 1000,
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

      {/* --- NEW CUSTOM SECTIONS --- */}
      <section className="safety-section">
        <div className="section-inner">
          <h2>Safety Guidelines</h2>
          <p className="section-subtitle">Your health and safety are our top priority. Please follow these rules when claiming food.</p>
          <div className="safety-grid">
            <div className="safety-card">
              <span className="safety-icon">👀</span>
              <h4>Inspect First</h4>
              <p>Always inspect the food upon pickup. Ensure it smells, looks, and feels fresh before consuming.</p>
            </div>
            <div className="safety-card">
              <span className="safety-icon">🌡️</span>
              <h4>Check Temperatures</h4>
              <p>Ensure perishable items were stored correctly. Hot food should be hot, and cold food cold.</p>
            </div>
            <div className="safety-card">
              <span className="safety-icon">⏳</span>
              <h4>Mind the Expiry</h4>
              <p>Consume the claimed food before the listed expiry time. When in doubt, throw it out.</p>
            </div>
            <div className="safety-card">
              <span className="safety-icon">🤝</span>
              <h4>Meet Safely</h4>
              <p>Pick up food in public, well-lit areas or at verified centers during daylight hours.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="how-claim-section">
        <div className="section-inner">
          <div className="text-center">
            <h2>How to Claim Food</h2>
            <p className="section-subtitle">Three simple steps to rescue food and prevent waste.</p>
          </div>
          <div className="claim-steps-container">
            <div className="claim-step">
              <div className="step-number">1</div>
              <h4>Browse & Request</h4>
              <p>Find what you need and click "Request". The donor will be notified instantly.</p>
            </div>
            <div className="claim-step">
              <div className="step-number">2</div>
              <h4>Wait for Approval</h4>
              <p>Once the admin approves your claim, you'll receive the pickup confirmation.</p>
            </div>
            <div className="claim-step">
              <div className="step-number">3</div>
              <h4>Pickup & Enjoy</h4>
              <p>Head to the location at the agreed time. Enjoy your meal and help reduce waste!</p>
            </div>
          </div>
        </div>
      </section>
      {/* --- END CUSTOM SECTIONS --- */}

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