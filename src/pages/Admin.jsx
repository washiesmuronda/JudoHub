import { useState } from 'react';
import { supabase } from "../lib/supabase";

function Admin({ 
  user,
  announcements, setAnnouncements,
  athletes, setAthletes,
  events, setEvents,
  tournaments, setTournaments,
  rankings, setRankings,
  eventRegistrations,
  tournamentRegistrations,
  clubs, setClubs,
  coaches, setCoaches,
  siteSettings, setSiteSettings,
  setCurrentPage,
  refreshAllData,
}) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [provinceFilter, setProvinceFilter] = useState('all');
  
  // Local state for settings form
  const [settingsForm, setSettingsForm] = useState(siteSettings);
  
  // Announcement Form State
  const initialAnnForm = { text: '', active: true, order: announcements.length + 1, expiryDate: '', pinned: false };
  const [annForm, setAnnForm] = useState(initialAnnForm);
  const [editingAnnId, setEditingAnnId] = useState(null);

  // Tournament Form State
  const initialTourForm = { name: '', location: '', date: '', status: 'Scheduled' };
  const [tourForm, setTourForm] = useState(initialTourForm);
  const [editingTourId, setEditingTourId] = useState(null);

  // Rankings Form State
  const initialRankForm = { athlete_name: '', club: '', points: 0, rank: 0, category: 'Senior' };
  const [rankForm, setRankForm] = useState(initialRankForm);
  const [editingRankId, setEditingRankId] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEditAnn = (ann) => {
    setEditingAnnId(ann.id);
    setAnnForm({ ...ann });
  };

  const resetAnnForm = () => {
    setEditingAnnId(null);
    setAnnForm(initialAnnForm);
  };

  const resetTourForm = () => {
    setEditingTourId(null);
    setTourForm(initialTourForm);
  };

  const resetRankForm = () => {
    setEditingRankId(null);
    setRankForm(initialRankForm);
  };

  // Access Control Check
  const isAdmin = user && (user.email === 'admin@jaz.co.zw' || user.email === 'washiesmuronda@gmail.com');

  if (!isAdmin) {
    return (
      <div className="home-page" style={{ padding: '100px 20px', textAlign: 'center' }}>
        <h1 style={{ color: 'var(--zim-red)' }}>Access Denied</h1>
        <p>You do not have permission to access the management console.</p>
        <button className="btn-premium btn-primary" onClick={() => setCurrentPage('home')}>Return Home</button>
      </div>
    );
  }

  // Helper to delete items
  const handleDelete = async (id, table) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setIsSubmitting(true);
      const { error } = await supabase.from(table).delete().eq('id', id);
      setIsSubmitting(false);
      if (!error) refreshAllData();
      else alert('Delete failed: ' + error.message);
    }
  };

  // Helper to download athlete documents from Supabase Storage
  const handleDownloadDoc = async (path, athleteName, bucket = 'identity-documents') => {
    if (!path) return alert('No document found for this athlete.');
    try {
      const { data, error } = await supabase.storage.from(bucket).download(path);
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      const fileExt = path.split('.').pop();
      link.download = `AthleteDoc_${athleteName.replace(/\s+/g, '_')}.${fileExt}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Download failed: ' + err.message);
    }
  };

  // Helper to update status (Approve/Reject)
  const handleStatusUpdate = async (id, table, newStatus) => {
    setIsSubmitting(true);
    const { error } = await supabase.from(table).update({ status: newStatus }).eq('id', id);
    setIsSubmitting(false);
    if (!error) refreshAllData();
    else alert('Update failed: ' + error.message);
  };

  // Calculate unique counts for stats
  const uniqueProvinces = [...new Set(athletes.map(a => a.province_currently_participating_in).filter(Boolean))].length;
  const uniqueClubs = [...new Set(athletes.map(a => a.club_or_school).filter(Boolean))].length;
  const pendingCount = athletes.filter(a => a.status === 'pending').length;

  const renderDashboard = () => (
    <div className="admin-overview">
      <h2 style={{ marginBottom: '20px' }}>System Overview</h2>
      <div className="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-0">
        <div className="stat-card">
          <div className="stat-content">
            <h3>Total Athletes</h3>
            <p className="stat-number">{athletes.length}</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderBottomColor: 'var(--zim-red)' }}>
          <div className="stat-content">
            <h3>Pending Registrations</h3>
            <p className="stat-number" style={{ color: 'var(--zim-red)' }}>{pendingCount}</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderBottomColor: 'var(--zim-gold)' }}>
          <div className="stat-content">
            <h3>Represented Provinces</h3>
            <p className="stat-number">{uniqueProvinces}</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderBottomColor: 'var(--zim-gold)' }}>
          <div className="stat-content">
            <h3>Affiliated Clubs</h3>
            <p className="stat-number">{uniqueClubs}</p>
          </div>
        </div>
      </div>
      <div className="content-wrap" style={{ padding: '0', marginTop: '30px' }}>
        <div className="compact-event-card" style={{ borderLeft: '5px solid var(--zim-gold)', padding: '30px' }}>
          <h4 className="text-lg font-semibold mb-4">Quick Actions</h4>
          <div className="action-btns" style={{ margin: '20px 0 0', justifyContent: 'flex-start' }}>
            <button className="btn-premium btn-primary" onClick={() => setActiveTab('announcements')}>Post Announcement</button>
            <button className="btn-premium btn-gold" onClick={() => setActiveTab('events')}>New Event</button>
            <button className="btn-premium btn-dark">Generate Report</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAthletes = () => (
    <div className="admin-section">
      <div className="section-header">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--zim-dark)' }}>Manage Athletes</h2>
        <button className="btn-premium btn-primary text-sm px-3 py-2 md:px-4 md:py-2">+ Add Athlete</button>
      </div>

      <div className="filters-grid flex flex-wrap gap-4 mb-6">
        <input 
          type="text" 
          placeholder="Search by name..." 
          className="search-field flex-1 min-w-[200px] p-2 border rounded" 
          style={{ border: '1px solid #ddd' }}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="p-2 border rounded bg-white min-w-[150px]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select 
          className="p-2 border rounded bg-white min-w-[150px]"
          value={provinceFilter}
          onChange={(e) => setProvinceFilter(e.target.value)}
        >
          <option value="all">All Provinces</option>
          {[...new Set(athletes.map(a => a.province_currently_participating_in).filter(Boolean))].map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="rankings-table-compact w-full text-sm md:text-base">
        <thead style={{ backgroundColor: 'var(--zim-dark)' }}>
          <tr>
            <th>Name</th>
            <th>Age Group</th>
            <th>Weight Cat</th>
            <th>Province</th>
            <th>Club</th>
            <th>Status</th>
            <th style={{ textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {athletes.filter(a => {
            const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
            const matchesProvince = provinceFilter === 'all' || a.province_currently_participating_in === provinceFilter;
            return matchesSearch && matchesStatus && matchesProvince;
          }).map(a => (
            <tr key={a.id}>
              <td style={{ fontWeight: 'bold', color: 'var(--zim-dark)' }}>{a.name}</td>
              <td className="whitespace-nowrap">{a.age_group}</td>
              <td className="whitespace-nowrap">{a.weight_category}</td>
              <td className="whitespace-nowrap">{a.province_currently_participating_in}</td>
              <td className="whitespace-nowrap">{a.club_or_school}</td>
              <td>
                <span style={{ 
                  padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                  fontWeight: '600',
                  backgroundColor: a.status === 'approved' ? '#e8f5e9' : a.status === 'rejected' ? '#ffebee' : '#fff3e0',
                  color: a.status === 'approved' ? '#2e7d32' : a.status === 'rejected' ? '#c62828' : '#e65100'
                }}>{a.status}</span>
              </td>
              <td className="whitespace-nowrap" style={{ textAlign: 'right' }}>
                <div className="flex justify-end gap-2">
                  {a.status === 'pending' && <button onClick={() => handleStatusUpdate(a.id, 'athletes', 'approved')} className="text-green-600 hover:text-green-800 font-bold" style={{ border: 'none', background: 'none', cursor: 'pointer' }}>Approve</button>}
                  {a.status === 'pending' && <button onClick={() => handleStatusUpdate(a.id, 'athletes', 'rejected')} className="text-red-600 hover:text-red-800 font-bold" style={{ border: 'none', background: 'none', cursor: 'pointer' }}>Reject</button>}
                  {a.document_url && <button onClick={() => handleDownloadDoc(a.document_url, a.name, 'identity-documents')} title="Download ID" style={{ color: 'var(--zim-gold)', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>📄 ID</button>}
                  <button style={{ color: '#666', border: 'none', background: 'none', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => handleDelete(a.id, 'athletes')} style={{ color: 'var(--zim-red)', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </div>
  );

  const renderRegistrations = () => (
    <div className="admin-section">
      <h2 className="text-2xl font-bold">Pending Event & Tournament Registrations</h2>
      <h4 className="text-xl font-semibold mt-6 mb-3">Event Registrations</h4>
      <div className="overflow-x-auto">
        <table className="rankings-table-compact w-full text-sm md:text-base">
        <thead><tr><th>Athlete</th><th>Event</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {eventRegistrations.map(r => (
            <tr key={r.id}>
              <td>{r.athlete_name}</td>
              <td>{events.find(e => e.id === r.event_id)?.title || 'Unknown'}</td>
              <td>{r.status}</td>
              <td className="whitespace-nowrap">
                {r.status === 'pending' && <button onClick={() => handleStatusUpdate(r.id, 'event_registrations', 'approved')} style={{color: 'green', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold'}}>Approve</button>}
                {r.status === 'pending' && <button onClick={() => handleStatusUpdate(r.id, 'event_registrations', 'rejected')} style={{color: 'red', background: 'none', border: 'none', cursor: 'pointer', marginLeft: '10px'}}>Reject</button>}
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
      <h4 className="text-xl font-semibold mt-6 mb-3">Tournament Registrations</h4>
      <div className="overflow-x-auto">
        <table className="rankings-table-compact w-full text-sm md:text-base">
        <thead><tr><th>Athlete</th><th>Tournament</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {tournamentRegistrations.map(r => (
            <tr key={r.id}>
              <td>{r.athlete_name}</td>
              <td>{tournaments.find(t => t.id === r.tournament_id)?.name || 'Unknown'}</td>
              <td>{r.status}</td>
              <td className="whitespace-nowrap">
                {r.status === 'pending' && <button onClick={() => handleStatusUpdate(r.id, 'tournament_registrations', 'approved')} style={{color: 'green', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold'}}>Approve</button>}
                {r.status === 'pending' && <button onClick={() => handleStatusUpdate(r.id, 'tournament_registrations', 'rejected')} style={{color: 'red', background: 'none', border: 'none', cursor: 'pointer', marginLeft: '10px'}}>Reject</button>}
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </div>
  );

  const renderEvents = () => (
    <div className="admin-section">
      <div className="section-header flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Events & Tournaments</h2>
        <button className="btn-premium btn-gold text-sm px-3 py-2 md:px-4 md:py-2">+ New Event</button>
      </div>
      <div className="overflow-x-auto">
        <table className="rankings-table-compact w-full text-sm md:text-base">
        <thead>
          <tr>
            <th>Title</th>
            <th>Location</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map(e => (
            <tr key={e.id}>
              <td style={{ fontWeight: 'bold' }}>{e.title}</td>
              <td>{e.loc}</td>
              <td className="whitespace-nowrap">{e.date}</td>
              <td>
                <select 
                  value={e.status} 
                  onChange={(ev) => setEvents(events.map(item => item.id === e.id ? {...item, status: ev.target.value} : item))}
                  className="p-1 rounded text-sm"
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Open for registration">Open for registration</option>
                  <option>Closed</option>
                  <option>Completed</option>
                </select>
              </td>
              <td>
                <button style={{ color: '#666', border: 'none', background: 'none', marginRight: '10px', cursor: 'pointer' }}>Edit</button>
                <button onClick={() => handleDelete(e.id, 'events')} style={{ color: 'var(--zim-red)', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </div>
  );

  const renderAnnouncements = () => (
    <div className="admin-section">
      <div className="section-header flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Manage Announcements</h2>
      </div>

      <div className="compact-event-card" style={{ padding: '20px', marginBottom: '30px', borderLeft: '5px solid var(--zim-green)' }}>
        <h4>{editingAnnId ? 'Edit Announcement' : 'Add New Announcement'}</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Message Text</label>
            <input 
              type="text" 
              className="search-field" 
              style={{ width: '100%', border: '1px solid #ddd' }}
              value={annForm.text}
              onChange={e => setAnnForm({...annForm, text: e.target.value})}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Order</label>
            <input 
              type="number" 
              className="search-field" 
              style={{ width: '100%', border: '1px solid #ddd' }}
              value={annForm.order}
              onChange={e => setAnnForm({...annForm, order: parseInt(e.target.value) || 0})}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Expiry Date</label>
            <input 
              type="date" 
              className="search-field" 
              style={{ width: '100%', border: '1px solid #ddd' }}
              value={annForm.expiryDate}
              onChange={e => setAnnForm({...annForm, expiryDate: e.target.value})}
            />
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
             <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
                <input type="checkbox" checked={annForm.pinned} onChange={e => setAnnForm({...annForm, pinned: e.target.checked})} /> Pin to Top
             </label>
             <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
                <input type="checkbox" checked={annForm.active} onChange={e => setAnnForm({...annForm, active: e.target.checked})} /> Active
             </label>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
            <button 
              className="btn-premium btn-primary" 
              disabled={isSubmitting}
              onClick={async () => {
                if (!annForm.text) return alert('Please enter message text');
                setIsSubmitting(true);
                if (editingAnnId) {
                  await supabase.from('announcements').update({
                    text: annForm.text,
                    active: annForm.active,
                    order: annForm.order,
                    expiryDate: annForm.expiryDate,
                    pinned: annForm.pinned
                  }).eq('id', editingAnnId);
                } else {
                  await supabase.from('announcements').insert([{ ...annForm, date: new Date().toISOString().split('T')[0] }]);
                }
                setIsSubmitting(false);
                refreshAllData();
                resetAnnForm();
              }}
            >
              {editingAnnId ? 'Update' : 'Save'}
            </button>
            {editingAnnId && <button className="btn-premium btn-outline" onClick={resetAnnForm}>Cancel</button>}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="rankings-table-compact w-full text-sm md:text-base">
        <thead>
          <tr>
            <th>Order</th>
            <th>Announcement Message</th>
            <th>Expiry</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {announcements.sort((a,b) => {
            if (a.pinned !== b.pinned) return b.pinned ? 1 : -1;
            return a.order - b.order;
          }).map(a => {
            const isExpired = a.expiryDate && new Date(a.expiryDate) < new Date();
            return (
            <tr key={a.id} style={{ opacity: a.active ? 1 : 0.6 }}>
              <td className="whitespace-nowrap">{a.pinned && '📌 '} {a.order}</td>
              <td style={{ fontWeight: a.pinned ? 'bold' : 'normal' }}>{a.text}</td>
              <td>{a.expiryDate || 'Never'}</td>
              <td>
                <button 
                  onClick={async () => {
                    await supabase.from('announcements').update({ active: !a.active }).eq('id', a.id);
                    refreshAllData();
                  }}
                  style={{ 
                    padding: '4px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                    backgroundColor: a.active ? 'var(--zim-green)' : '#ccc', color: 'white'
                  }}
                >
                  {isExpired ? 'Expired' : (a.active ? 'Active' : 'Inactive')}
                </button>
              </td>
              <td>
                <button onClick={() => handleEditAnn(a)} style={{ color: '#666', border: 'none', background: 'none', marginRight: '10px', cursor: 'pointer' }}>Edit</button>
                <button onClick={() => handleDelete(a.id, 'announcements')} style={{ color: 'var(--zim-red)', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
              </td>
            </tr>
            )
          })}
        </tbody>
        </table>
      </div>
    </div>
  );

  const renderTournaments = () => (
    <div className="admin-section">
      <div className="section-header flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Manage Tournaments</h2>
      </div>

      <div className="compact-event-card" style={{ padding: '20px', marginBottom: '30px', borderLeft: '5px solid var(--zim-gold)' }}>
        <h4>{editingTourId ? 'Edit Tournament' : 'Add New Tournament'}</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Tournament Name</label>
            <input type="text" className="search-field" style={{ width: '100%', border: '1px solid #ddd' }} value={tourForm.name} onChange={e => setTourForm({...tourForm, name: e.target.value})} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Location</label>
            <input type="text" className="search-field" style={{ width: '100%', border: '1px solid #ddd' }} value={tourForm.location} onChange={e => setTourForm({...tourForm, location: e.target.value})} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Date</label>
            <input type="date" className="search-field" style={{ width: '100%', border: '1px solid #ddd' }} value={tourForm.date} onChange={e => setTourForm({...tourForm, date: e.target.value})} />
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', justifyContent: 'flex-end', gridColumn: 'span 2' }}>
            <button className="btn-premium btn-primary" disabled={isSubmitting} onClick={async () => {
              setIsSubmitting(true);
              if (editingTourId) await supabase.from('tournaments').update(tourForm).eq('id', editingTourId);
              else await supabase.from('tournaments').insert([tourForm]);
              setIsSubmitting(false); refreshAllData(); resetTourForm();
            }}> {editingTourId ? 'Update' : 'Save'} </button>
            {editingTourId && <button className="btn-premium btn-outline" onClick={resetTourForm}>Cancel</button>}
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="rankings-table-compact w-full text-sm md:text-base">
        <thead>
          <tr><th>Name</th><th>Location</th><th>Date</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {tournaments.map(t => (
            <tr key={t.id}>
              <td style={{ fontWeight: 'bold' }}>{t.name}</td>
              <td>{t.location}</td>
              <td className="whitespace-nowrap">{t.date}</td>
              <td>{t.status}</td>
              <td className="whitespace-nowrap">
                <button onClick={() => { setEditingTourId(t.id); setTourForm(t); }} style={{ color: '#666', border: 'none', background: 'none', marginRight: '10px', cursor: 'pointer' }}>Edit</button>
                <button onClick={() => handleDelete(t.id, 'tournaments')} style={{ color: 'var(--zim-red)', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </div>
  );

  const renderRankings = () => (
    <div className="admin-section">
      <div className="section-header flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Manage Rankings</h2>
      </div>

      <div className="compact-event-card" style={{ padding: '20px', marginBottom: '30px', borderLeft: '5px solid var(--zim-zim-red)' }}>
        <h4>{editingRankId ? 'Edit Ranking' : 'Add Ranking Entry'}</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Athlete Name</label>
            <input type="text" className="search-field" style={{ width: '100%', border: '1px solid #ddd' }} value={rankForm.athlete_name} onChange={e => setRankForm({...rankForm, athlete_name: e.target.value})} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Club</label>
            <input type="text" className="search-field" style={{ width: '100%', border: '1px solid #ddd' }} value={rankForm.club} onChange={e => setRankForm({...rankForm, club: e.target.value})} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Points</label>
            <input type="number" className="search-field" style={{ width: '100%', border: '1px solid #ddd' }} value={rankForm.points} onChange={e => setRankForm({...rankForm, points: parseInt(e.target.value)})} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Rank #</label>
            <input type="number" className="search-field" style={{ width: '100%', border: '1px solid #ddd' }} value={rankForm.rank} onChange={e => setRankForm({...rankForm, rank: parseInt(e.target.value)})} />
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', justifyContent: 'flex-end', gridColumn: 'span 2' }}>
            <button className="btn-premium btn-primary" disabled={isSubmitting} onClick={async () => {
              setIsSubmitting(true);
              if (editingRankId) await supabase.from('rankings').update(rankForm).eq('id', editingRankId);
              else await supabase.from('rankings').insert([rankForm]);
              setIsSubmitting(false); refreshAllData(); resetRankForm();
            }}> {editingRankId ? 'Update' : 'Save'} </button>
            {editingRankId && <button className="btn-premium btn-outline" onClick={resetRankForm}>Cancel</button>}
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="rankings-table-compact w-full text-sm md:text-base">
        <thead>
          <tr><th>Rank</th><th>Athlete</th><th>Club</th><th>Points</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {rankings.map(r => (
            <tr key={r.id}>
              <td>#{r.rank}</td>
              <td style={{ fontWeight: 'bold' }}>{r.athlete_name}</td>
              <td>{r.club}</td>
              <td className="whitespace-nowrap">{r.points} pts</td>
              <td className="whitespace-nowrap">
                <button onClick={() => { setEditingRankId(r.id); setRankForm(r); }} style={{ color: '#666', border: 'none', background: 'none', marginRight: '10px', cursor: 'pointer' }}>Edit</button>
                <button onClick={() => handleDelete(r.id, 'rankings')} style={{ color: 'var(--zim-red)', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="admin-section">
      <div className="section-header flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Site Settings</h2>
      </div>

      <div className="compact-event-card" style={{ padding: '30px', background: '#fcfcfc', border: '1px solid #eee' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Hero Title</label>
          <input 
            type="text" 
            className="search-field" 
            style={{ width: '100%', border: '1px solid #ddd', padding: '10px' }}
            value={settingsForm.heroTitle}
            onChange={(e) => setSettingsForm({...settingsForm, heroTitle: e.target.value})}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Hero Subtitle</label>
          <input 
            type="text" 
            className="search-field" 
            style={{ width: '100%', border: '1px solid #ddd', padding: '10px' }}
            value={settingsForm.heroSubtitle}
            onChange={(e) => setSettingsForm({...settingsForm, heroSubtitle: e.target.value})}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Homepage Slogan</label>
          <textarea 
            className="search-field" 
            style={{ width: '100%', border: '1px solid #ddd', minHeight: '80px', padding: '10px', fontFamily: 'inherit' }}
            value={settingsForm.slogan}
            onChange={(e) => setSettingsForm({...settingsForm, slogan: e.target.value})}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Announcement Ticker Speed</label>
          <select 
            className="search-field" 
            style={{ width: '100%', border: '1px solid #ddd', padding: '10px' }}
            value={settingsForm.announcementTickerSpeed}
            onChange={(e) => setSettingsForm({...settingsForm, announcementTickerSpeed: e.target.value})}
          >
            <option value="slow">Slow (6 seconds)</option>
            <option value="normal">Normal (4 seconds)</option>
            <option value="fast">Fast (2 seconds)</option>
          </select>
        </div>
        <button 
          className="btn-premium btn-primary" 
          onClick={async () => {
            const { error } = await supabase.from('site_settings').update({
              hero_title: settingsForm.heroTitle,
              hero_subtitle: settingsForm.heroSubtitle,
              slogan: settingsForm.slogan,
              ticker_speed: settingsForm.announcementTickerSpeed
            }).eq('id', 1);
            
            if (!error) { setSiteSettings(settingsForm); alert('Settings saved!'); }
          }}
        >
          Save Settings
        </button>
      </div>
    </div>
  );

  return (
    <div className="admin-page min-h-screen bg-gray-100 flex flex-col md:flex-row">
      <div className="admin-container flex flex-col md:flex-row w-full max-w-7xl mx-auto">
        {/* Sidebar */}
        <aside className="admin-sidebar bg-gray-800 text-white w-full md:w-64 p-4 md:p-6 flex flex-col">
          <h3 className="text-xl font-bold mb-6 border-b border-gray-700 pb-4">Admin Console</h3>
          {/* Mobile toggle for sidebar */}
          {/* This will be handled by a global state in App.jsx for consistency with mobile menu */}
          <button className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>📊 Dashboard</button>
          <button className={`admin-nav-item ${activeTab === 'athletes' ? 'active' : ''}`} onClick={() => setActiveTab('athletes')}>👥 Athletes</button>
          <button className={`admin-nav-item ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>📅 Events</button>
          <button className={`admin-nav-item ${activeTab === 'registrations' ? 'active' : ''}`} onClick={() => setActiveTab('registrations')}>📝 Registrations</button>
          <button className={`admin-nav-item ${activeTab === 'tournaments' ? 'active' : ''}`} onClick={() => setActiveTab('tournaments')}>🏆 Tournaments</button>
          <button className={`admin-nav-item ${activeTab === 'rankings' ? 'active' : ''}`} onClick={() => setActiveTab('rankings')}>📈 Rankings</button>
          <button className={`admin-nav-item ${activeTab === 'clubs' ? 'active' : ''}`} onClick={() => setActiveTab('clubs')}>🏢 Clubs & Coaches</button>
          <button className={`admin-nav-item ${activeTab === 'announcements' ? 'active' : ''}`} onClick={() => setActiveTab('announcements')}>📣 Announcements</button>
          <button className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>⚙️ Site Settings</button>
          
          <div className="mt-auto p-4 text-sm text-gray-400">
            Logged in as:<br/>
            <strong>{user.email}</strong>
          </div>
        </aside>

        {/* Main Content */}
        <main className="admin-main flex-1 p-4 md:p-8 bg-white shadow-lg rounded-lg md:ml-4 mt-4 md:mt-0">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'athletes' && renderAthletes()}
          {activeTab === 'events' && renderEvents()}
          {activeTab === 'registrations' && renderRegistrations()}
          {activeTab === 'tournaments' && renderTournaments()}
          {activeTab === 'rankings' && renderRankings()}
          {activeTab === 'announcements' && renderAnnouncements()}
          {activeTab === 'settings' && renderSettings()}
          {activeTab === 'clubs' && (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <h3>Module Coming Soon</h3>
              <p>This section is currently under development.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Admin;