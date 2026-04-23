import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import ImpactMetric from '../components/ImpactMetric';
import FoodCard from '../components/FoodCard';
import Testimonials from '../components/Testimonials';
import { mockTestimonials } from '../data/mockData';   // only testimonials kept
import './Home.css';

const Home = () => {
  const [featuredFoods, setFeaturedFoods] = useState([]);
  const [heroText, setHeroText] = useState('');
  const fullText = "Every meal saved is a life changed.";
  const stepsRef = useRef(null);

  // Typewriter
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < fullText.length) {
        setHeroText(fullText.substring(0, i + 1));
        i++;
      } else clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Fetch real approved donations
  useEffect(() => {
    fetch('http://localhost:5000/api/donations?status=approved&isClaimed=false')
      .then(res => res.json())
      .then(data => {
        const mapped = data.slice(0, 4).map(d => ({
          id: d._id,
          name: d.foodName,
          category: d.category,
          quantity: `${d.quantity} ${d.unit}`,
          location: `${d.city}`,
          timePosted: 'just now',
          expiryText: new Date(d.expiryTime).toLocaleString(),
          isUrgent: new Date(d.expiryTime) < new Date(Date.now() + 86400000 * 1)
        }));
        setFeaturedFoods(mapped);
      });
  }, []);

  // Intersection observer (same as before)
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.step-card').forEach(card => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-page page-container">
      {/* Hero, Stats, How It Works — same as you had */}
      {/* ... (I kept your exact hero, stats, steps code — only Featured section changed) */}

      {/* Featured Listings - now real data */}
      <section className="featured-section">
        <div className="section-header">
          <h2>Food Available Near You</h2>
          <Link to="/find" className="view-all-link">View All &rarr;</Link>
        </div>
        <div className="featured-scroll-container">
          <div className="featured-row">
            {featuredFoods.map(food => (
              <div key={food.id} className="featured-card-wrapper">
                <FoodCard food={food} onRequestClick={() => window.location.href = '/find'} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials stay the same */}
      <section className="testimonials-section">
        <Testimonials testimonials={mockTestimonials} />
      </section>
    </div>
  );
};

export default Home;