import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';

const About = () => {
  return (
    <div className="about-page page-container">
      
      {/* Mission Section */}
      <section className="mission-section">
        <div className="mission-content">
          <h1 className="mission-statement">
            "We believe no food should go to waste while people go hungry."
          </h1>
          <p className="mission-sub">
            FeedForward was born from a simple observation: there is enough food for everyone, 
            it's just not in the right place. We use technology to bridge the gap between 
            abundance and need.
          </p>
        </div>
      </section>

      {/* Why It Matters Section */}
      <section className="impact-section">
        <div className="section-header">
          <h2>Why It Matters</h2>
          <p>The scale of the problem demands immediate action.</p>
        </div>
        <div className="impact-grid">
          <div className="impact-card">
            <div className="impact-icon">🗑️</div>
            <h3>40%</h3>
            <p>Of food produced in India is wasted every year, from farms to plates.</p>
          </div>
          <div className="impact-card">
            <div className="impact-icon">🍽️</div>
            <h3>190M</h3>
            <p>People in India go to sleep hungry every single night.</p>
          </div>
          <div className="impact-card">
            <div className="impact-icon">🌍</div>
            <h3>8-10%</h3>
            <p>Of global greenhouse gas emissions are associated with food waste.</p>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="timeline-section">
        <div className="section-header">
          <h2>Our Journey</h2>
          <p>How a small idea grew into a movement.</p>
        </div>
        
        <div className="timeline">
          <div className="timeline-item left">
            <div className="timeline-content">
              <h3>2023: The Idea</h3>
              <p>Witnessing massive food waste at a local wedding sparked the idea for a real-time redistribution platform.</p>
            </div>
          </div>
          <div className="timeline-item right">
            <div className="timeline-content">
              <h3>Mid-2023: The Prototype</h3>
              <p>Built the first version of FeedForward, connecting just 5 local restaurants with 2 shelters.</p>
            </div>
          </div>
          <div className="timeline-item left">
            <div className="timeline-content">
              <h3>2024: Scaling Up</h3>
              <p>Launched the mobile-friendly web app, expanding to 10 cities and registering over 100 donors.</p>
            </div>
          </div>
          <div className="timeline-item right">
            <div className="timeline-content">
              <h3>2025: Nationwide Reach</h3>
              <p>Operating in 28 cities, saving over 10,000 meals daily with a strong network of volunteers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="section-header">
          <h2>Meet the Team</h2>
          <p>The people driving the mission forward.</p>
        </div>
        
        <div className="team-grid">
          <div className="team-card">
            <div className="team-avatar">DT</div>
            <h3>Deepanshu Thakur</h3>
            <p className="team-role">Co-Founder</p>
            <p className="team-bio">Former logistics expert passionate about solving supply chain inefficiencies for social good.</p>
          </div>
          <div className="team-card">
            <div className="team-avatar">AS</div>
            <h3>Arighna Sadhu</h3>
            <p className="team-role">Co-Founder</p>
            <p className="team-bio">Full-stack developer who believes technology should be used to uplift communities.</p>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <h2>Join the movement. Start donating today.</h2>
        <p>Whether you're a restaurant, an event organizer, or an individual—your surplus can save a life.</p>
        <Link to="/donate" className="btn btn-primary mt-20">List Your Food Now</Link>
      </section>

    </div>
  );
};

export default About;
