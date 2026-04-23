import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [myDonations, setMyDonations] = useState([]);
  const [myClaims, setMyClaims] = useState([]);

  useEffect(() => {
    if (!user) navigate('/login');
    fetchMyDonations();
    fetchMyClaims();
  }, [user, token]);

  const fetchMyDonations = async () => {
    const res = await fetch('http://localhost:5000/api/donations/my', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setMyDonations(data);
  };

  const fetchMyClaims = async () => {
    const res = await fetch('http://localhost:5000/api/claims/my', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setMyClaims(data);
  };

  return (
    <div className="page-container">
      <h1>Welcome, {user?.name} 👋</h1>
      <button onClick={logout} className="btn btn-outline" style={{ float: 'right' }}>Logout</button>

      <h2 style={{ marginTop: '40px' }}>Your Donation Requests</h2>
      <div className="listings-grid">
        {myDonations.map(d => (
          <div key={d._id} style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
            <strong>{d.foodName}</strong> — {d.quantity} {d.unit}<br />
            Status: <span style={{ color: d.status === 'approved' ? 'green' : d.status === 'rejected' ? 'red' : 'orange' }}>
              {d.status.toUpperCase()}
            </span>
            {d.adminReason && <p><strong>Reason:</strong> {d.adminReason}</p>}
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: '40px' }}>Your Claim Requests</h2>
      <div className="listings-grid">
        {myClaims.map(c => (
          <div key={c._id} style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
            <strong>{c.donationId?.foodName || 'Food Item'}</strong><br />
            Status: <span style={{ color: c.status === 'approved' ? 'green' : c.status === 'rejected' ? 'red' : 'orange' }}>
              {c.status.toUpperCase()}
            </span>
            {c.adminReason && <p><strong>Reason:</strong> {c.adminReason}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserDashboard;