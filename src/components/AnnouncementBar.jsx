import { useState, useEffect } from 'react';

// Announcement data - Easy to update for Admin
const announcements = [
  "National Ranking Tournament entries now open",
  "SA Open registration closes soon",
  "Technical Course at Alexandra Sports Club",
  "Cadet and Junior training camp dates to be confirmed"
];

const AnnouncementBar = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fading, setFading] = useState(false); // State to control fade effect

  // Auto-rotate every 4 seconds
  useEffect(() => {
    if (announcements.length === 0) return;
    const timer = setInterval(() => {
      setFading(true); // Start fade out
      const fadeOutTimer = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length);
        setFading(false); // Start fade in
      }, 300); // Match CSS fade-out duration

      return () => clearTimeout(fadeOutTimer);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

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
            <span className={`announcement-text ${fading ? 'fade-out' : 'fade-in'}`}>
              <span className="counter">{currentIndex + 1}/{announcements.length}</span> {announcements[currentIndex]}
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