import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './StepForm.css';

const StepForm = () => {
  const { token, user } = useContext(AuthContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  const [formData, setFormData] = useState({
    foodName: '', category: '', quantity: '', unit: 'portions',
    expiryTime: '', pickupAddress: '', city: '', pickupTime: '',
    contactNumber: '', confirmed: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
  if (
    !formData.foodName ||
    !formData.category ||
    !formData.quantity ||
    !formData.expiryTime ||
    !formData.pickupAddress ||
    !formData.city ||
    !formData.pickupTime ||
    !formData.contactNumber ||
    !formData.confirmed
  ) {
    setShake(true);
    setTimeout(() => setShake(false), 500);
    return false;
  }
  return true;
};


  const handleSubmit = async (e) => {

    console.log("SUBMIT CLICKED");
    console.log("TOKEN:", token);
    console.log("FORM DATA:", formData);
  
    e.preventDefault();
    if (!token) {
      alert('Please login to send a donation request');
      return;
    }
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      console.log("SENDING REQUEST...");
      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          quantity: Number(formData.quantity),
          expiryTime: new Date(formData.expiryTime),
          pickupTime: new Date(formData.pickupTime)
        })
      });

    const data = await res.json();

  if (res.ok) {
    setIsSuccess(true);
  } else {
  console.error(data);
  alert(data.message || 'Failed to submit');
}
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="success-screen">
        <svg className="success-icon" viewBox="0 0 52 52">...</svg>
        <h2>Request Sent! 🎉</h2>
        <p>Thank you! Admin will review your donation shortly.</p>
        <button className="btn btn-primary mt-20" onClick={() => window.location.reload()}>
          Donate More Food
        </button>
      </div>
    );
  }

 return (
  <div className="step-form-container">
    {!user && (
      <p style={{ color: 'red', textAlign: 'center' }}>
        Please login to donate
      </p>
    )}

    <form className="step-form" onSubmit={handleSubmit}>

  <h3 className="step-title">What are you donating?</h3>

  <div className="form-group">
    <label>Food Name</label>
    <input type="text" name="foodName" value={formData.foodName} onChange={handleChange} required />
  </div>

  <div className="form-group">
    <label>Category</label>
    <select name="category" value={formData.category} onChange={handleChange} required>
      <option value="">Select</option>
      <option value="Cooked Meal">Cooked Meal</option>
      <option value="Raw Vegetables">Raw Vegetables</option>
      <option value="Packaged Food">Packaged Food</option>
      <option value="Bakery">Bakery</option>
    </select>
  </div>

  <div className="form-group">
    <label>Quantity</label>
    <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required />
  </div>

  <div className="form-group">
    <label>Expiry Time</label>
    <input type="datetime-local" name="expiryTime" value={formData.expiryTime} onChange={handleChange} required />
  </div>

  {/* ✅ NEW FIELD */}
  <div className="form-group">
    <label>Pickup Address</label>
    <input type="text" name="pickupAddress" value={formData.pickupAddress} onChange={handleChange} required />
  </div>

  <div className="form-group">
    <label>City</label>
    <input type="text" name="city" value={formData.city} onChange={handleChange} required />
  </div>

  <div className="form-group">
    <label>Pickup Time</label>
    <input type="datetime-local" name="pickupTime" value={formData.pickupTime} onChange={handleChange} required />
  </div>

  <div className="form-group">
    <label>Contact Number</label>
    <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} required />
  </div>

  <div className="form-group checkbox-group">
    <input type="checkbox" name="confirmed" checked={formData.confirmed} onChange={handleChange} required />
    <label>I confirm the food is safe</label>
  </div>

  <button type="submit" className="btn btn-primary">
    {isSubmitting ? 'Sending...' : 'Send Donation Request'}
  </button>

</form>
  </div>
);
};

export default StepForm;