import { useState, useEffect } from 'react';
import { supabase } from "./lib/supabase";
import './App.css'; // Import the CSS file
import Home from './pages/Home';
import Athletes from './pages/Athletes';
import Events from './pages/Events';
import Competition from './pages/Competition';
import Tournaments from './pages/Tournaments';
import Rankings from './pages/Rankings';
import Clubs from './pages/Clubs';
import Coaches from './pages/Coaches';
import Admin from './pages/Admin';
import Login from './pages/Login';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jazLogoError, setJazLogoError] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Centralized State for Admin Management
  const [announcements, setAnnouncements] = useState([]);
  const [athletes, setAthletes] = useState([]);
  const [events, setEvents] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [eventRegistrations, setEventRegistrations] = useState([]);
  const [tournamentRegistrations, setTournamentRegistrations] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [coaches, setCoaches] = useState([]);

  const [siteSettings, setSiteSettings] = useState({
    heroTitle: "Forging Champions",
    heroSubtitle: "Official Platform of the Judo Association of Zimbabwe",
    slogan: "More Than a Sport — Building Character, Discipline and National Pride",
    announcementTickerSpeed: "normal"
  });

  // Fetch all data from Supabase
  const fetchData = async () => {
    try {
      setLoading(true);
      const [annRes, athRes, evRes, tourRes, rankRes, clRes, coRes, setRes, evRegRes, tourRegRes] = await Promise.all([
        supabase.from('announcements').select('*').order('pinned', { ascending: false }).order('order', { ascending: true }),
        supabase.from('athletes').select('*').order('rank', { ascending: true }),
        supabase.from('events').select('*').order('date', { ascending: true }),
        supabase.from('tournaments').select('*').order('date', { ascending: true }),
        supabase.from('rankings').select('*').order('rank', { ascending: true }),
        supabase.from('clubs').select('*'),
        supabase.from('coaches').select('*'),
        supabase.from('site_settings').select('*').single(),
        supabase.from('event_registrations').select('*'),
        supabase.from('tournament_registrations').select('*')
      ]);

      if (annRes.data) setAnnouncements(annRes.data);
      if (athRes.data) setAthletes(athRes.data);
      if (evRes.data) setEvents(evRes.data);
      if (tourRes.data) setTournaments(tourRes.data);
      if (rankRes.data) setRankings(rankRes.data);
      if (clRes.data) setClubs(clRes.data);
      if (coRes.data) setCoaches(coRes.data);
      if (evRegRes.data) setEventRegistrations(evRegRes.data);
      if (tourRegRes.data) setTournamentRegistrations(tourRegRes.data);
      if (setRes.data) {
        setSiteSettings({
          heroTitle: setRes.data.hero_title,
          heroSubtitle: setRes.data.hero_subtitle,
          slogan: setRes.data.slogan,
          announcementTickerSpeed: setRes.data.ticker_speed
        });
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to sync with database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Set up real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Handle Site Settings Update
  const updateSiteSettings = async (newSettings) => {
    setLoading(true);
    const { error } = await supabase
      .from('site_settings')
      .update({
        hero_title: newSettings.heroTitle,
        hero_subtitle: newSettings.heroSubtitle,
        slogan: newSettings.slogan,
        ticker_speed: newSettings.announcementTickerSpeed
      })
      .eq('id', 1); // Assuming a single row with ID 1
    
    if (!error) {
      setSiteSettings(newSettings);
      setLoading(false);
      return true;
    }
    setLoading(false);
    return false;
  };

  // Generic refresh function passed to Admin
  const refreshAllData = () => fetchData();

  // Mock Authenticated User
  const [user] = useState({ email: 'washiesmuronda@gmail.com', role: 'admin' });

  const handleJazLogoError = () => {
    setJazLogoError(true);
  };

  // Process announcements for Homepage (Active, Not Expired, Sorted by Pinned then Order)
  const processedAnnouncements = announcements
    .filter(a => a.active && (!a.expiryDate || new Date(a.expiryDate) >= new Date()))
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return b.pinned ? -1 : 1;
      return (a.order || 0) - (b.order || 0);
    });

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home 
        setCurrentPage={setCurrentPage}
        announcements={processedAnnouncements} 
        athletesCount={athletes.filter(a => a.status === 'approved').length} 
        clubsCount={clubs.length} 
        eventsCount={events.length}
        upcomingEvents={events}
        siteSettings={siteSettings}
      />;
      case 'athletes': return <Athletes athletes={athletes} refreshAllData={refreshAllData} />;
      case 'events': return <Events events={events} />;
      case 'competition': return <Competition events={events} tournaments={tournaments} />;
      case 'tournaments': return <Tournaments tournaments={tournaments} />;
      case 'rankings': return <Rankings />;
      case 'clubs': return <Clubs />;
      case 'coaches': return <Coaches />;
      case 'admin': return <Admin 
        user={user}
        announcements={announcements} setAnnouncements={setAnnouncements}
        athletes={athletes} setAthletes={setAthletes}
        events={events} setEvents={setEvents}
        tournaments={tournaments} setTournaments={setTournaments}
        rankings={rankings} setRankings={setRankings}
        clubs={clubs} setClubs={setClubs}
        coaches={coaches} setCoaches={setCoaches}
        refreshAllData={refreshAllData}
        siteSettings={siteSettings} setSiteSettings={setSiteSettings}
        setCurrentPage={setCurrentPage}
      />;
      case 'login': return <Login />;
      default: return <Home />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="top-nav bg-gray-800 text-white p-4 flex justify-between items-center fixed w-full z-50 shadow-md">
        <div className="nav-brand flex items-center cursor-pointer" onClick={() => { setCurrentPage('home'); setIsMobileMenuOpen(false); }}>
          <img
            src="/judo-logo.jpg"
            alt="JAZ Logo"
            className="jaz-logo h-10 w-10 rounded-full mr-3"
            onError={handleJazLogoError}
          />
          <h2 className="text-2xl font-bold">JudoHub</h2>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex nav-links space-x-4">
          <button className={`nav-btn ${currentPage === 'home' ? 'active' : ''}`} onClick={() => setCurrentPage('home')}>Home</button>
          <button className={`nav-btn ${currentPage === 'athletes' ? 'active' : ''}`} onClick={() => setCurrentPage('athletes')}>Athletes</button>
          <button className={`nav-btn ${currentPage === 'events' ? 'active' : ''}`} onClick={() => setCurrentPage('events')}>Events</button>
          <button className={`nav-btn ${currentPage === 'competition' ? 'active' : ''}`} onClick={() => setCurrentPage('competition')}>Competition</button>
          <button className={`nav-btn ${currentPage === 'tournaments' ? 'active' : ''}`} onClick={() => setCurrentPage('tournaments')}>Tournaments</button>
          <button className={`nav-btn ${currentPage === 'rankings' ? 'active' : ''}`} onClick={() => setCurrentPage('rankings')}>Rankings</button>
          <button className={`nav-btn ${currentPage === 'clubs' ? 'active' : ''}`} onClick={() => setCurrentPage('clubs')}>Clubs</button>
          <button className={`nav-btn ${currentPage === 'coaches' ? 'active' : ''}`} onClick={() => setCurrentPage('coaches')}>Coaches</button>
          <button className={`nav-btn ${currentPage === 'admin' ? 'active' : ''}`} onClick={() => setCurrentPage('admin')}>Admin</button>
          <button className={`nav-btn ${currentPage === 'login' ? 'active' : ''}`} onClick={() => setCurrentPage('login')}>Login</button>
        </div>

        {/* Mobile Hamburger Icon */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white focus:outline-none">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-95 z-40 flex flex-col items-center justify-center md:hidden">
          <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-4 right-4 text-white text-4xl">&times;</button>
          <div className="flex flex-col space-y-6 text-xl">
            {['home', 'athletes', 'events', 'competition', 'tournaments', 'rankings', 'clubs', 'coaches', 'admin', 'login'].map(page => (
              <button key={page} className={`nav-btn text-white ${currentPage === page ? 'active' : ''}`} onClick={() => { setCurrentPage(page); setIsMobileMenuOpen(false); }}>{page.charAt(0).toUpperCase() + page.slice(1)}</button>
            ))}
          </div>
        </div>
      )}

      <main className="flex-1 pt-16"> {/* Add padding-top to prevent content from being covered by fixed navbar */}
        {loading && <div className="loading-overlay">Syncing with JudoHub...</div>}
        {error && <div className="error-banner">{error}</div>}
        {renderPage()}
      </main>
      <footer className="app-footer">
        <div className="footer-grid">
          <div className="footer-col">
            <span>Email: office@judozimbabwe.org</span>
            <span>+263 770 000 000</span>
            <div className="social-icons">
              <div className="social-icon-placeholder">f</div>
              <div className="social-icon-placeholder">t</div>
              <div className="social-icon-placeholder">i</div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 Judo Association of Zimbabwe.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;