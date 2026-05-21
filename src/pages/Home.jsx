import { useEffect } from 'react';
import AnnouncementBar from "../components/AnnouncementBar";

function Home({ setCurrentPage, announcements = [], athletesCount, clubsCount, eventsCount, upcomingEvents = [], siteSettings, tournamentsCount }) {
  useEffect(() => {
  }, []);

  return (
    <div className="home-page min-h-screen">
      <AnnouncementBar announcements={announcements} tickerSpeed={siteSettings?.announcementTickerSpeed} />
      
      {/* Hero Banner */}
      <div className="hero-banner-container relative w-full h-64 sm:h-80 md:h-96 overflow-hidden">
        <img src="/judo-hero.jpg" alt="Judo Banner" className="hero-banner-img w-full h-full object-cover" />
      </div>

      {/* Action Buttons */}
      <div className="action-btns flex flex-col sm:flex-row justify-center gap-4 p-4 sm:p-6 bg-gray-100 shadow-inner">
        <button className="btn-premium btn-primary" onClick={() => setCurrentPage('athletes')}>Register Athlete</button>
        <button className="btn-premium btn-gold" onClick={() => setCurrentPage('events')}>View Events</button>
        <button className="btn-premium btn-dark" onClick={() => setCurrentPage('admin')}>Admin Dashboard</button>
      </div>

      <div className="content-wrap">
        {/* Statistics Grid */}
        <section className="stats-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 sm:p-6 lg:p-8">
          <div className="stat-card bg-white rounded-lg shadow-md p-6 text-center border-b-4 border-blue-500">
            <h3 className="text-lg font-semibold text-gray-700">Registered Athletes</h3>
            <p className="stat-number text-4xl font-bold text-blue-600 mt-2">{athletesCount ?? '—'}</p>
          </div>
          <div className="stat-card bg-white rounded-lg shadow-md p-6 text-center border-b-4 border-green-500">
            <h3 className="text-lg font-semibold text-gray-700">Active Clubs</h3>
            <p className="stat-number text-4xl font-bold text-green-600 mt-2">{clubsCount ?? '—'}</p>
          </div>
          <div className="stat-card bg-white rounded-lg shadow-md p-6 text-center border-b-4 border-yellow-500">
            <h3 className="text-lg font-semibold text-gray-700">Upcoming Events</h3>
            <p className="stat-number text-4xl font-bold text-yellow-600 mt-2">{eventsCount ?? '—'}</p>
          </div>
          <div className="stat-card bg-white rounded-lg shadow-md p-6 text-center border-b-4 border-red-500">
            <h3 className="text-lg font-semibold text-gray-700">National Rankings</h3>
            <p className="stat-number text-4xl font-bold text-red-600 mt-2 cursor-pointer" onClick={() => setCurrentPage('rankings')}>View</p>
          </div>
        </section>

        {/* Featured Upcoming Events */}
        <section className="upcoming-events-section p-4 sm:p-6 lg:p-8">
          <div className="section-header flex justify-between items-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Featured Upcoming Events</h2>
            <button className="btn-premium btn-outline text-sm px-3 py-2 sm:px-4 sm:py-2" onClick={() => setCurrentPage('events')}>See All</button>
          </div>
          <div className="upcoming-compact-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.slice(0, 5).map(event => {
                const d = new Date(event.date);
                return (
                  <div key={event.id} className="compact-event-card bg-white rounded-lg shadow-md p-4 flex items-center space-x-4">
                    <div className="event-date-box flex-shrink-0 text-center bg-blue-100 text-blue-700 rounded-md p-2">
                      <span className="day">{d.getDate()}</span>
                      <span className="month">{d.toLocaleString('default', { month: 'short' })}</span>
                    </div>
                    <div className="event-details">
                      <h4>{event.title}</h4>
                      <p>{event.loc} • {d.getFullYear()} • <span style={{color: 'var(--zim-green)', fontWeight: 'bold'}}>{event.status}</span></p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-500 p-6 bg-white rounded-lg shadow-sm">
                No upcoming events are currently scheduled.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;