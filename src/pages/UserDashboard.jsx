import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const UserDashboard = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [myDonations, setMyDonations] = useState([]);
  const [myClaims, setMyClaims] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchMyDonations();
    fetchMyClaims();
  }, [user, token, navigate]);

  const fetchMyDonations = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/donations/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if(Array.isArray(data)) setMyDonations(data);
    } catch(e) {}
  };

  const fetchMyClaims = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/claims/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if(Array.isArray(data)) setMyClaims(data);
    } catch(e) {}
  };

  const getStatusClass = (status) => {
    if(status === 'approved') return 'status-approved';
    if(status === 'rejected') return 'status-rejected';
    return 'status-pending';
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome, {user?.name} 👋</h1>
      </div>

      <div className="dashboard-section">
        <h2>Your Donation Requests</h2>
        {myDonations.length === 0 ? (
          <p>You haven't made any donations yet.</p>
        ) : (
          <div className="listings-grid">
            {myDonations.map(d => (
              <div key={d._id} className="dashboard-card">
                <h3>{d.foodName}</h3>
                <p>Quantity: {d.quantity} {d.unit}</p>
                <div style={{ marginTop: '12px' }}>
                  Status: <span className={`status-badge ${getStatusClass(d.status)}`}>{d.status}</span>
                </div>
                {d.adminReason && <div className="reason-box"><strong>Note from Admin:</strong> {d.adminReason}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <h2>Your Claim Requests</h2>
        {myClaims.length === 0 ? (
          <p>You haven't requested any food yet.</p>
        ) : (
          <div className="listings-grid">
            {myClaims.map(c => (
              <div key={c._id} className="dashboard-card">
                <h3>{c.donationId?.foodName || 'Unknown Item'}</h3>
                <div style={{ marginTop: '12px' }}>
                  Status: <span className={`status-badge ${getStatusClass(c.status)}`}>{c.status}</span>
                </div>
                {c.adminReason && <div className="reason-box"><strong>Note from Admin:</strong> {c.adminReason}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;