import { useState, useEffect } from 'react';
import AnnouncementBar from "../components/AnnouncementBar";

function Home({ setCurrentPage }) {
  const [athletesCount] = useState(null);
  const [clubsCount] = useState(null);
  const [eventsCount] = useState(null);
  
  // Compact Preview Data
  const upcomingEventsPreview = [
    { id: 1, day: '12', month: 'Jun', title: 'National Junior Open', loc: 'Harare' },
    { id: 2, day: '25', month: 'Jun', title: 'Zim Masters Cup', loc: 'Bulawayo' },
    { id: 3, day: '05', month: 'Jul', title: 'Kyu Grade Tournament', loc: 'Mutare' },
    { id: 4, day: '15', month: 'Jul', title: 'Inter-Club Challenge', loc: 'Gweru' },
    { id: 5, day: '01', month: 'Aug', title: 'National Selection Trials', loc: 'Harare' }
  ];

  useEffect(() => {
  }, []);

  return (
    <div className="home-page">
      <AnnouncementBar />
      
      {/* Hero Banner */}
      <div className="hero-banner-container">
        <img src="/judo-hero.jpg" alt="Judo Banner" className="hero-banner-img" />
      </div>

      {/* Action Buttons */}
      <div className="action-btns">
        <button className="btn-premium btn-primary" onClick={() => setCurrentPage('athletes')}>Register Athlete</button>
        <button className="btn-premium btn-gold" onClick={() => setCurrentPage('events')}>View Events</button>
        <button className="btn-premium btn-dark" onClick={() => setCurrentPage('admin')}>Admin Dashboard</button>
      </div>

      <div className="content-wrap">
        {/* Statistics Grid */}
        <section className="stats-grid">
          <div className="stat-card athlete-card">
            <h3>Registered Athletes</h3>
            <p className="stat-number">{athletesCount ?? '—'}</p>
          </div>
          <div className="stat-card club-card">
            <h3>Active Clubs</h3>
            <p className="stat-number">{clubsCount ?? '—'}</p>
          </div>
          <div className="stat-card event-card">
            <h3>Upcoming Events</h3>
            <p className="stat-number">{eventsCount ?? '—'}</p>
          </div>
          <div className="stat-card ranking-card">
            <h3>National Rankings</h3>
            <p className="stat-number" onClick={() => setCurrentPage('rankings')} style={{cursor: 'pointer'}}>View</p>
          </div>
        </section>

        {/* Featured Upcoming Events */}
        <section className="upcoming-events-section">
          <div className="section-header">
            <h2>Featured Upcoming Events</h2>
            <button className="btn-premium btn-outline" style={{color: '#777', borderColor: '#ddd'}} onClick={() => setCurrentPage('events')}>See All</button>
          </div>
          <div className="upcoming-compact-list">
            {upcomingEventsPreview.map(event => (
              <div key={event.id} className="compact-event-card">
                <div className="event-date-box">
                  <span className="day">{event.day}</span>
                  <span className="month">{event.month}</span>
                </div>
                <div className="event-details">
                  <h4>{event.title}</h4>
                  <p>{event.loc} • 2026</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;