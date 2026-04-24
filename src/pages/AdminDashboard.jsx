import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [pendingDonations, setPendingDonations] = useState([]);
  const [pendingClaims, setPendingClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🚫 block non-admin users
    if (!user) return;
    if (user.role !== 'admin') {
      navigate('/login');
      return;
    }

    // ✅ only fetch when token exists
    if (token) {
      fetchPending();
    }
  }, [user, token]);

  const fetchPending = async () => {
    try {
      setLoading(true);

      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/admin/pending', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("ADMIN FETCH ERROR:", text);
        return;
      }

      const data = await res.json();

      console.log("ADMIN DATA:", data);

      setPendingDonations(data.pendingDonations || []);
      setPendingClaims(data.pendingClaims || []);

    } catch (err) {
      console.error("FETCH FAILED:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDonation = async (id) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/donations/${id}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPending();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectDonation = async (id) => {
    const reason = prompt('Rejection reason?');
    if (!reason) return;

    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/donations/${id}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      fetchPending();
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ CLAIM HANDLERS (NEW)
  const handleApproveClaim = async (id) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/claims/${id}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPending();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectClaim = async (id) => {
  const reason = prompt('Rejection reason?');

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/claims/${id}/reject`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ reason })   // 🔥 THIS WAS MISSING
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("REJECT ERROR:", data);
    }

    fetchPending();

  } catch (err) {
    console.error(err);
  }
};

  if (loading) {
    return <p style={{ padding: '20px' }}>Loading admin data...</p>;
  }

  return (
    <div className="page-container">
      <h1>Admin Dashboard</h1>

      <button
        onClick={logout}
        className="btn btn-outline"
        style={{ float: 'right' }}
      >
        Logout
      </button>

      {/* ================= DONATIONS ================= */}
      <h2>Pending Donation Requests</h2>

      {pendingDonations.length === 0 && <p>No pending donations</p>}

      {pendingDonations.map(d => (
        <div key={d._id} style={cardStyle}>
          <strong>{d.foodName}</strong> by {d.userId?.name} ({d.city})
          <br />

          <button
            onClick={() => handleApproveDonation(d._id)}
            className="btn btn-primary"
            style={{ marginRight: '8px' }}
          >
            Approve
          </button>

          <button
            onClick={() => handleRejectDonation(d._id)}
            className="btn btn-outline"
          >
            Reject
          </button>
        </div>
      ))}

      {/* ================= CLAIMS ================= */}
      <h2 style={{ marginTop: '40px' }}>Pending Claim Requests</h2>

      {pendingClaims.length === 0 && <p>No pending claims</p>}

      {pendingClaims.map(c => (
        <div key={c._id} style={cardStyle}>
          <strong>{c.donationId?.foodName}</strong>
          <br />
          Requested by: {c.userId?.name}

          <br />

          <button
            onClick={() => handleApproveClaim(c._id)}
            className="btn btn-primary"
            style={{ marginRight: '8px' }}
          >
            Approve
          </button>

          <button
            onClick={() => handleRejectClaim(c._id)}
            className="btn btn-outline"
          >
            Reject
          </button>
        </div>
      ))}
    </div>
  );
};

const cardStyle = {
  border: '1px solid #ddd',
  padding: '16px',
  marginBottom: '16px',
  borderRadius: '8px'
};

export default AdminDashboard;