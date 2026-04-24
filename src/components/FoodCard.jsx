import React from 'react';
import './FoodCard.css';

const FoodCard = ({ food, onRequestClick }) => {
  const getStripColor = (category) => {
    return category === 'Cooked Meal' ? 'var(--color-primary)' : 'var(--color-secondary)';
  };

  let buttonText = "Request This";
  let buttonDisabled = false;
  let buttonClass = "btn btn-primary request-btn";

  if (food.isExpired) {
    buttonText = "Expired";
    buttonDisabled = true;
    buttonClass = "btn request-btn";
    // We can override styling inline or via CSS for expired button
  } else if (food.claimStatus === 'pending') {
    buttonText = "Request Pending ⏳";
    buttonDisabled = true;
  } else if (food.claimStatus === 'approved') {
    buttonText = "Claim Approved ✓";
    buttonDisabled = true;
    buttonClass = "btn btn-success request-btn";
  } else if (food.claimStatus === 'rejected') {
    buttonText = "Request Rejected — Try Again";
  }

  return (
    <div className="food-card">
      <div 
        className="card-strip" 
        style={{ backgroundColor: getStripColor(food.category) }}
      ></div>
      
      <div className="card-content">
        <div className="card-header">
          <span className="category-badge">{food.category}</span>
          {food.isExpired ? (
            <span className="urgent-badge" style={{ backgroundColor: '#d32f2f', color: '#fff' }}>Expired</span>
          ) : food.isUrgent ? (
            <span className="urgent-badge">Urgent</span>
          ) : null}
        </div>
        
        <h3 className="food-name">{food.name}</h3>
        
        <div className="food-details">
          <div className="detail-item">
            <span className="icon">📦</span> {food.quantity}
          </div>
          <div className="detail-item">
            <span className="icon">📍</span> {food.location}
          </div>
          <div className="detail-item">
            <span className="icon">🕔</span> Pickup: {food.pickupText}
          </div>
        </div>
        
        <div className={`expiry-tag ${food.isExpired ? 'text-expired' : food.isUrgent ? 'text-urgent' : ''}`} style={food.isExpired ? {color: '#d32f2f', backgroundColor: 'rgba(211, 47, 47, 0.1)', borderColor: 'rgba(211, 47, 47, 0.2)'} : {}}>
          Expires: {food.expiryText}
        </div>
        
        <button 
          className={buttonClass}
          onClick={() => onRequestClick(food)}
          disabled={buttonDisabled}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default FoodCard;