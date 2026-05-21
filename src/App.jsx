import { useState } from 'react';
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

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [jazLogoError, setJazLogoError] = useState(false); // New state for logo error

  const handleJazLogoError = () => {
    setJazLogoError(true);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home setCurrentPage={setCurrentPage} />;
      case 'athletes': return <Athletes />;
      case 'events': return <Events />;
      case 'competition': return <Competition />;
      case 'tournaments': return <Tournaments />;
      case 'rankings': return <Rankings />;
      case 'clubs': return <Clubs />;
      case 'coaches': return <Coaches />;
      case 'admin': return <Admin />;
      case 'login': return <Login />;
      default: return <Home />;
    }
  };

  return (
    <div>
      <nav className="top-nav">
        <div className="nav-brand" onClick={() => setCurrentPage('home')}>
          <img 
            src="/judo-logo.jpg" 
            alt="JAZ Logo" 
            className="jaz-logo" 
            onError={() => handleJazLogoError()}
          />
          <h2>JudoHub</h2>
        </div>
        <div className="nav-links">
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
      </nav>

      <main>
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