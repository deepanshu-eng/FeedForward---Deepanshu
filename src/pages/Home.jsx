import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import ImpactMetric from '../components/ImpactMetric';
import FoodCard from '../components/FoodCard';
import Testimonials from '../components/Testimonials';
import { mockTestimonials } from '../data/mockData';
import './Home.css';

const headlines = [
  "Every meal saved is a life changed.",
  "Share your surplus, nourish a community.",
  "Zero waste today for a hunger-free tomorrow.",
  "Your leftover could be someone's feast."
];

const Home = () => {
  const stepsRef = useRef(null);
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 350; // card width + gap
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const [featuredFoods, setFeaturedFoods] = useState([]);
  const [heroText, setHeroText] = useState('');
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Rotate quotes every 15 seconds
  useEffect(() => {
    const rotateInterval = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % headlines.length);
    }, 15000);
    return () => clearInterval(rotateInterval);
  }, []);

  // Typewriter effect for current headline
  useEffect(() => {
    let i = 0;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHeroText(''); // clear text before typing new one
    const textToType = headlines[quoteIndex];
    
    const typeInterval = setInterval(() => {
      if (i < textToType.length) {
        setHeroText(textToType.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typeInterval);
      }
    }, 50);
    
    return () => clearInterval(typeInterval);
  }, [quoteIndex]);

  // Fetch real approved donations
  useEffect(() => {
    fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/donations?status=approved&isClaimed=false')
      .then(res => res.json())
      .then(data => {
        const mapped = data.slice(0, 10).map(d => {
          const expiryTime = new Date(d.expiryTime).getTime();
          const now = Date.now();
          const timeLeft = expiryTime - now;

          return {
            id: d._id,
            name: d.foodName,
            category: d.category,
            quantity: `${d.quantity} ${d.unit}`,
            location: `${d.city}`,
            pickupText: d.pickupTime ? new Date(d.pickupTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'short', timeStyle: 'short' }) : 'N/A',
            expiryText: new Date(d.expiryTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }),
            isExpired: timeLeft <= 0,
            isUrgent: timeLeft > 0 && timeLeft <= 6 * 60 * 60 * 1000
          };
        });
        setFeaturedFoods(mapped);
      })
      .catch(err => console.error("Failed to fetch featured donations", err));
  }, []);

  // Intersection observer for How It Works cards
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1 });
    const cards = document.querySelectorAll('.step-card');
    cards.forEach(card => observer.observe(card));
    return () => {
      cards.forEach(card => observer.unobserve(card));
      observer.disconnect();
    };
  }, []);

  return (
    <div className="home-page page-container">
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-headline">
            {heroText}
            <span className="cursor">|</span>
          </h1>
          <p className="hero-subheadline">
            Connecting surplus food with people who need it most — in real time. 
            Join the movement to end food waste and build stronger communities.
          </p>
          <div className="hero-actions">
            <Link to="/donate" className="btn btn-primary">Donate Food</Link>
            <Link to="/find" className="btn btn-outline">Find Food Near Me</Link>
          </div>
        </div>
        
        {/* Decorative Wave */}
        <div className="wave-divider">
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="shape-fill"></path>
          </svg>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="stats-section">
        <div className="stats-container">
          <ImpactMetric end={12400} label="Meals Donated" icon="🍛" />
          <ImpactMetric end={340} label="Donors Registered" icon="🤝" />
          <ImpactMetric end={28} label="Cities Active" icon="🏙️" />
        </div>
      </section>

      {/* Why FeedForward Section (More Information & Boxes) */}
      <section className="why-section">
        <div className="section-header">
          <h2>Why FeedForward?</h2>
          <p>More than just a platform, it's a movement towards zero hunger.</p>
        </div>
        <div className="why-grid">
          <div className="why-card">
            <div className="why-icon">🌍</div>
            <h3>Eco-Friendly</h3>
            <p>Reducing food waste helps lower greenhouse gas emissions and protects our environment.</p>
          </div>
          <div className="why-card">
            <div className="why-icon">❤️</div>
            <h3>Community First</h3>
            <p>We build stronger communities by connecting neighbors and local organizations.</p>
          </div>
          <div className="why-card">
            <div className="why-icon">⚡</div>
            <h3>Real-Time Alerts</h3>
            <p>Get notified instantly when food becomes available in your area so nothing goes to waste.</p>
          </div>
          <div className="why-card">
            <div className="why-icon">🛡️</div>
            <h3>Safe & Verified</h3>
            <p>All users and organizations are verified to ensure safe and hygienic food redistribution.</p>
          </div>
        </div>
      </section>

      {/* Inspirational Quote Section */}
      <section className="quote-section">
        <div className="quote-content">
          <div className="quote-mark">“</div>
          <blockquote>
            If you can't feed a hundred people, then feed just one. Small acts of kindness can change the world.
          </blockquote>
          <cite>- Mother Teresa</cite>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section" ref={stepsRef}>
        <div className="section-header">
          <h2>How It Works</h2>
          <p>A simple, transparent process to ensure zero food waste.</p>
        </div>
        
        <div className="steps-container">
          <div className="step-card" style={{ animationDelay: '0s' }}>
            <div className="step-icon">📦</div>
            <h3>1. List Your Surplus</h3>
            <p>Tell us what you have, how much, and when it expires.</p>
          </div>
          
          <div className="step-card" style={{ animationDelay: '0.2s' }}>
            <div className="step-icon">🤝</div>
            <h3>2. We Match It</h3>
            <p>Our platform instantly connects your listing with nearby NGOs or individuals in need.</p>
          </div>
          
          <div className="step-card" style={{ animationDelay: '0.4s' }}>
            <div className="step-icon">🏡</div>
            <h3>3. Food Reaches Families</h3>
            <p>Food is picked up and distributed before it goes bad, feeding those who need it most.</p>
          </div>
        </div>
      </section>

      {/* Featured Listings - Real data */}
      <section className="featured-section">
        <div className="section-header featured-header">
          <h2>Food Available Near You</h2>
          <div className="header-actions">
            <div className="scroll-buttons">
              <button className="scroll-btn" onClick={() => scroll('left')} aria-label="Scroll left">&#8592;</button>
              <button className="scroll-btn" onClick={() => scroll('right')} aria-label="Scroll right">&#8594;</button>
            </div>
            <Link to="/find" className="view-all-link">View All &rarr;</Link>
          </div>
        </div>
        <div className="featured-scroll-container" ref={scrollRef}>
          {featuredFoods.length > 0 ? (
            <div className="featured-row">
              {featuredFoods.map(food => (
                <div key={food.id} className="featured-card-wrapper">
                  <FoodCard food={food} onRequestClick={() => window.location.href = '/find'} />
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
              No available food near you at the moment. Check back later!
            </p>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="section-header">
          <h2>Community Stories</h2>
          <p>Hear from the people making a difference every day.</p>
        </div>
        <Testimonials testimonials={mockTestimonials} />
      </section>
    </div>
  );
};

export default Home;