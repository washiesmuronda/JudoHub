import { useState, useEffect } from 'react';

const AnnouncementBar = ({ announcements = [], tickerSpeed = 'normal' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fading, setFading] = useState(false); // State to control fade effect

  // Auto-rotate every 4 seconds
  useEffect(() => {
    if (announcements.length === 0) return;
    
    const speeds = { slow: 6000, normal: 4000, fast: 2000 };
    const duration = speeds[tickerSpeed] || 4000;

    const timer = setInterval(() => {
      setFading(true); // Start fade out
      const fadeOutTimer = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length);
        setFading(false); // Start fade in
      }, 300); // Match CSS fade-out duration

      return () => clearTimeout(fadeOutTimer);
    }, duration);
    return () => clearInterval(timer);
  }, [announcements.length, tickerSpeed]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
  };

  // Handle manual navigation with fade effect
  const handleManualNav = (newIndex) => {
    setFading(true);
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setFading(false);
    }, 300); // Match CSS fade-out duration
  };


  return (
    <div className="announcement-bar">
      <div className="live-indicator">
        <div className="live-dot"></div>
        <span className="live-text">LIVE</span>
      </div>
      
      <div className="announcement-slider">
        {announcements.length > 0 ? (
          <div className="announcement-content">
            <button className="nav-arrow" onClick={() => handleManualNav((currentIndex - 1 + announcements.length) % announcements.length)}>&lsaquo;</button>
            <span className={`announcement-text ${fading ? 'fade-out' : 'fade-in'}`} key={announcements[currentIndex]?.id}>
              {currentIndex + 1}. {announcements[currentIndex]?.text || ""}
            </span>
            <button className="nav-arrow" onClick={() => handleManualNav((currentIndex + 1) % announcements.length)}>&rsaquo;</button>
          </div>
        ) : (
          <span className="announcement-text">No live announcements at the moment.</span>
        )}
      </div>
    </div>
  );
};

export default AnnouncementBar;