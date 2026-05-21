function Competition() {
  return (
    <div className="home-page">
      <div className="content-wrap" style={{ textAlign: 'left', paddingTop: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '10px' }}>Competition</h1>
        <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '40px' }}>
          Competition management and event operations for Judo Association of Zimbabwe.
        </p>
        
        <div className="quick-access-grid">
          <div className="access-tile"><span className="tile-icon">📝</span><span>Competition Entries</span></div>
          <div className="access-tile"><span className="tile-icon">📊</span><span>Draws</span></div>
          <div className="access-tile"><span className="tile-icon">⚖️</span><span>Weigh-In</span></div>
          <div className="access-tile"><span className="tile-icon">🏅</span><span>Results</span></div>
          <div className="access-tile"><span className="tile-icon">🥇</span><span>Medal Table</span></div>
          <div className="access-tile"><span className="tile-icon">👨‍⚖️</span><span>Officials</span></div>
          <div className="access-tile"><span className="tile-icon">📑</span><span>Reports</span></div>
        </div>
      </div>
    </div>
  );
}

export default Competition;