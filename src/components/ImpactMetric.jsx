import React, { useState, useEffect, useRef } from 'react';
import './ImpactMetric.css';

const ImpactMetric = ({ end, label, icon, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const counterRef = useRef(null);

  useEffect(() => {
    // Setup IntersectionObserver to trigger animation when in view
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = counterRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasAnimated]);

  useEffect(() => {
    // Animation logic
    if (hasAnimated) {
      let start = 0;
      // How often to update the state (in ms)
      const incrementTime = 20;
      // Calculate how much to increment each time
      const increment = Math.ceil(end / (duration / incrementTime));

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, incrementTime);

      return () => clearInterval(timer);
    }
  }, [hasAnimated, end, duration]);

  // Format number with commas
  const formattedCount = new Intl.NumberFormat().format(count);

  return (
    <div className="impact-metric" ref={counterRef}>
      <div className="impact-icon">{icon}</div>
      <div className="impact-value">{formattedCount}+</div>
      <div className="impact-label">{label}</div>
    </div>
  );
};

export default ImpactMetric;
