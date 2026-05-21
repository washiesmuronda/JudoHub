import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';

function Athletes({ athletes = [], refreshAllData }) {
  const initialForm = {
    first_name: '',
    surname: '',
    gender: '',
    date_of_birth: '',
    age_group: '', // Auto-calculated
    nationality: '', // No default
    id_or_passport_number: '',
    document_type: '',
    province_currently_participating_in: '',
    club_or_school: '',
    contact_number: '',
    email_address: '',
    belt_grade: '',
    weight_kg: '',
    weight_category: '',
    coach_name: '',
    competition_level: '',
    competition_age: '',
    competition_year: new Date().getFullYear(),
  };

  const [form, setForm] = useState(initialForm);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [regResult, setRegResult] = useState(null);
  const [toast, setToast] = useState(null);

  const currentYear = new Date().getFullYear();

  const getCompetitionAge = (dateOfBirth, competitionYear = new Date().getFullYear()) => {
    if (!dateOfBirth) return "";
    const birthDate = new Date(dateOfBirth);
    const endOfYear = new Date(competitionYear, 11, 31);
    return endOfYear.getFullYear() - birthDate.getFullYear();
  };

  const getAgeGroup = (age) => {
    if (age >= 5 && age <= 6) return "5–6 Years";
    if (age >= 7 && age <= 8) return "7–8 Years";
    if (age >= 9 && age <= 10) return "9–10 Years";
    if (age >= 11 && age <= 12) return "11–12 Years";
    if (age >= 13 && age <= 14) return "Pre-Cadets (13–14 Years)";
    if (age >= 15 && age <= 17) return "Cadets";
    if (age >= 18 && age <= 20) return "Juniors";
    if (age >= 21) return "Seniors";
    return "";
  };

  // Helper function for capitalization
  const capitalizeWords = (value) => {
    return value
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const ageGroups = [
    '5–6 Years', '7–8 Years', '9–10 Years', '11–12 Years',
    'Pre-Cadets (13–14 Years)', 'Cadets', 'Juniors', 'Seniors'
  ];

  const weightCategories = {
    "5–6 Years": {
      Female: ["-22kg", "-25kg", "-28kg", "-32kg", "-36kg", "+36kg"],
      Male: ["-21kg", "-24kg", "-27kg", "-30kg", "-34kg", "-38kg", "+38kg"]
    },
    "7–8 Years": {
      Female: ["-22kg", "-25kg", "-28kg", "-32kg", "-36kg", "-40kg", "+40kg"],
      Male: ["-21kg", "-24kg", "-27kg", "-30kg", "-34kg", "-38kg", "-42kg", "+42kg"]
    },
    "9–10 Years": {
      Female: ["-22kg", "-25kg", "-28kg", "-32kg", "-36kg", "-40kg", "-44kg", "+44kg"],
      Male: ["-24kg", "-27kg", "-30kg", "-34kg", "-38kg", "-42kg", "-46kg", "-50kg", "+50kg"]
    },
    "11–12 Years": {
      Female: ["-28kg", "-32kg", "-36kg", "-40kg", "-44kg", "-48kg", "-52kg", "-57kg", "+57kg"],
      Male: ["-24kg", "-27kg", "-30kg", "-34kg", "-38kg", "-42kg", "-46kg", "-50kg", "-55kg", "-60kg", "+60kg"]
    },
    "Pre-Cadets (13–14 Years)": {
      Female: ["-40kg", "-44kg", "-48kg", "-52kg", "-57kg", "-63kg", "-70kg", "+70kg"],
      Male: ["-50kg", "-55kg", "-60kg", "-66kg", "-73kg", "-81kg", "-90kg", "+90kg"]
    },
    Cadets: {
      Male: ['-50kg', '-55kg', '-60kg', '-66kg', '-73kg', '-81kg', '-90kg', '+90kg'],
      Female: ['-40kg', '-44kg', '-48kg', '-52kg', '-57kg', '-63kg', '-70kg', '+70kg']
    },
    Juniors: {
      Female: ["-44kg", "-48kg", "-52kg", "-57kg", "-63kg", "-70kg", "-78kg", "+78kg"],
      Male: ["-55kg", "-60kg", "-66kg", "-73kg", "-81kg", "-90kg", "-100kg", "+100kg"]
    },
    Seniors: {
      Female: ["-48kg", "-52kg", "-57kg", "-63kg", "-70kg", "-78kg", "+78kg"],
      Male: ["-60kg", "-66kg", "-73kg", "-81kg", "-90kg", "-100kg", "+100kg"]
    }
  };

  const getAutoWeightCategory = (ageGroup, gender, weight) => {
    if (!ageGroup || !gender || !weight || String(weight).trim() === "") return "";

    const categories = weightCategories[ageGroup]?.[gender];
    if (!categories || categories.length === 0) return "";

    const actualWeight = parseFloat(weight);
    if (isNaN(actualWeight)) return "";

    // Get only categories with upper limits (starting with '-') to check thresholds
    const limitCats = categories.filter(c => c.startsWith("-"));
    
    for (const cat of limitCats) {
      const limitValue = parseFloat(cat.replace("-", "").replace("kg", ""));
      if (actualWeight <= limitValue) {
        return cat;
      }
    }

    // If the weight exceeds all '-' limits, assign it to the last category (the '+' one)
    return categories[categories.length - 1];
  };

  const getWeightOptions = () => {
    const group = form.age_group;
    const gender = form.gender;
    if (weightCategories[group] && gender) {
      return weightCategories[group][gender];
    }
    return [];
  };

  const provinceOptions = [
    'Bulawayo',
    'Harare',
    'Manicaland',
    'Mashonaland Central',
    'Mashonaland East',
    'Mashonaland West',
    'Masvingo',
    'Matabeleland North',
    'Matabeleland South',
    'Midlands'
  ];


  useEffect(() => {
    const age = getCompetitionAge(form.date_of_birth);
    const group = getAgeGroup(age);
    const autoWeight = getAutoWeightCategory(group, form.gender, form.weight_kg);
    
    setForm(prev => ({
      ...prev,
      competition_age: age,
      age_group: group,
      weight_category: autoWeight
    }));
  }, [form.date_of_birth, form.gender, form.weight_kg]);

  const validateFile = (selected) => {
    if (!selected) return false;
    const isImage = selected.type.startsWith('image/');
    const isPDF = selected.type === 'application/pdf';

    if (!isImage && !isPDF) {
      alert('Only PDF, JPG, and PNG are allowed.');
      return false;
    }

    if (selected.size > 5 * 1024 * 1024) {
      alert('File exceeds 5MB limit.');
      return false;
    }
    return true;
  };

  const triggerToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let timeoutId;

    try {
      setLoading(true);
      setError(null);
      console.log("Starting registration...");

      // Timeout protection
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          console.error("Submission timed out after 15s");
          reject(new Error("Request timeout"));
        }, 15000);
      });

      const registrationPromise = (async () => {
        // 1. Check for duplicates manually for better UX
        console.log("Checking for existing records...");
        const { data: existing, error: checkError } = await supabase
          .from('athletes')
          .select('id')
          .eq('first_name', form.first_name)
          .eq('surname', form.surname)
          .eq('date_of_birth', form.date_of_birth)
          .eq('club_or_school', form.club_or_school)
          .maybeSingle();

        if (checkError) throw checkError;
        if (existing) {
          throw new Error('An athlete with this name, DOB, and club is already registered.');
        }

        let document_url = null;

        // 2. Upload Document
        if (file) {
          console.log("Uploading document...");
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${form.surname}.${fileExt}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('athlete-documents')
            .upload(fileName, file);

          if (uploadError) throw uploadError;
          document_url = uploadData.path;
        }

        // 3. Insert Record
        console.log("Saving athlete...");
        const { data: insertedData, error: insertError } = await supabase.from('athletes').insert([{
          ...form,
          name: `${form.first_name} ${form.surname}`, // maintain compatibility with existing components
          status: 'pending',
          document_url
        }]).select();

        if (insertError) throw insertError;
        if (!insertedData || insertedData.length === 0) throw new Error("No data returned from server");

        return insertedData[0];
      })();

      const athlete = await Promise.race([registrationPromise, timeoutPromise]);
      
      console.log("Registration successful");
      alert("✅ Athlete Registration Submitted Successfully");

      setRegResult({
        id: athlete.id,
        name: athlete.name,
        category: athlete.weight_category
      });

      setShowSuccessModal(true);
      triggerToast("Athlete registered successfully!", "success");
      
      // Clear form data
      setForm(initialForm);
      setFile(null);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (refreshAllData) refreshAllData();

    } catch (err) {
      console.error("Registration error:", err);
      alert(`❌ Registration Failed: ${err.message}`);
      setError(err.message);
      setShowErrorModal(true);
      triggerToast("Registration Failed", "error");
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  return (
    <div className="registration-page" style={{ 
      paddingTop: '100px', 
      paddingBottom: '60px', 
      backgroundImage: 'linear-gradient(to bottom right, #f8f9fa, #e0e0e0)', // Subtle gradient
      minHeight: '100vh'
    }}>
      <div className="content-wrap" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div className="registration-header" style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '900', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Athlete Registration</h1>
          <p style={{ fontSize: '1.3rem', color: '#555', fontWeight: '400' }}>Register athletes for the Judo Association of Zimbabwe database</p>
          <div style={{ width: '100px', height: '5px', backgroundColor: 'var(--zim-gold)', margin: '25px auto' }}></div>
        </div>

        <div className="registration-card" style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '16px', 
          boxShadow: '0 12px 40px rgba(0,0,0,0.1)', 
          overflow: 'hidden',
          border: '1px solid #eee',
          position: 'relative',
          // Zimbabwe color strip at the top
          '::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '10px',
            background: 'linear-gradient(to right, var(--zim-green) 33%, var(--zim-gold) 33%, var(--zim-gold) 66%, var(--zim-red) 66%)',
            borderRadius: '16px 16px 0 0',
          }
        }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '80px 40px' }}>
              <div style={{ fontSize: '5rem', marginBottom: '24px' }}>✅</div>
              <h2 style={{ color: 'var(--zim-green)', fontSize: '2.2rem', marginBottom: '16px' }}>Registration Submitted Successfully</h2>
              <p style={{ color: '#666', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 30px' }}>
                Your application is currently <strong>Pending Approval</strong>. Our administrators will verify your details and documents shortly.
              </p>
              <button className="btn-premium btn-gold" onClick={() => setSubmitted(false)}>Register Another Athlete</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ padding: '0' }}>
              {error && <div className="error-banner" style={{ margin: '20px', borderRadius: '8px' }}>{error}</div>}
              
              {/* SECTION 1: Personal Details */}
              <div className="form-section" style={{ padding: '40px', borderBottom: '1px solid #f0f0f0', paddingTop: '50px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                  <span style={{ width: '36px', height: '36px', backgroundColor: 'var(--zim-gold)', color: '#1a1a1a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px', fontWeight: 'bold', fontSize: '1.2rem' }}>1</span>
                  <h3 style={{ margin: '0', fontSize: '1.5rem', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Personal Details</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
                  <div className="form-group">
                    <label className="form-label">First Name <span style={{color: 'red'}}>*</span></label>
                    <input type="text" className="form-input" required value={form.first_name} onChange={e => setForm({...form, first_name: capitalizeWords(e.target.value)})} placeholder="Enter first name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Surname <span style={{color: 'red'}}>*</span></label>
                    <input type="text" className="form-input" required value={form.surname} onChange={e => setForm({...form, surname: capitalizeWords(e.target.value)})} placeholder="Enter surname" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender <span style={{color: 'red'}}>*</span></label>
                    <select className="form-input" required value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date of Birth <span style={{color: 'red'}}>*</span></label> {/* DOB is required for age calculation */}
                    <input type="date" className="form-input" required value={form.date_of_birth} onChange={e => setForm({...form, date_of_birth: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Competition Age</label>
                    <div className="read-only-field">
                      {form.competition_age || "—"}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '6px', fontStyle: 'italic' }}>Age is calculated as at 31 December of the competition year.</p>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Age Group</label>
                    <div className="read-only-field">
                      {form.age_group || "Select DOB first"}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nationality</label>
                    <input type="text" className="form-input" value={form.nationality} onChange={e => setForm({...form, nationality: capitalizeWords(e.target.value)})} placeholder="e.g., Zimbabwean" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ID / Passport Number</label>
                    <input type="text" className="form-input" value={form.id_or_passport_number} onChange={e => setForm({...form, id_or_passport_number: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Document Type <span style={{color: 'red'}}>*</span></label>
                    <select className="form-input" value={form.document_type} onChange={e => setForm({...form, document_type: e.target.value})}>
                      <option value="">Select Type</option>
                      <option value="Birth Certificate">Birth Certificate</option>
                      <option value="National ID">National ID</option>
                      <option value="Passport">Passport</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Province Currently Participating In <span style={{color: 'red'}}>*</span></label>
                    <select className="form-input" required value={form.province_currently_participating_in} onChange={e => setForm({...form, province_currently_participating_in: e.target.value})}>
                      <option value="">Select Province</option>
                      {provinceOptions.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Club or School <span style={{color: 'red'}}>*</span></label>
                    <input type="text" className="form-input" required value={form.club_or_school} onChange={e => setForm({...form, club_or_school: capitalizeWords(e.target.value)})} placeholder="Enter your current club or school" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Number <span style={{color: 'red'}}>*</span></label>
                    <input type="tel" className="form-input" required value={form.contact_number} onChange={e => setForm({...form, contact_number: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address <span style={{color: 'red'}}>*</span></label>
                    <input type="email" className="form-input" required value={form.email_address} onChange={e => setForm({...form, email_address: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Judo Details */}
              <div className="form-section" style={{ padding: '40px', borderBottom: '1px solid #f0f0f0', backgroundColor: '#fafafa' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                  <span style={{ width: '36px', height: '36px', backgroundColor: 'var(--zim-gold)', color: '#1a1a1a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px', fontWeight: 'bold', fontSize: '1.2rem' }}>2</span>
                  <h3 style={{ margin: '0', fontSize: '1.5rem', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Judo Details</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
                  <div className="form-group">
                    <label className="form-label">Belt / Grade</label>
                    <input type="text" className="form-input" placeholder="e.g. Yellow Belt / 5th Kyu" value={form.belt_grade} onChange={e => setForm({...form, belt_grade: capitalizeWords(e.target.value)})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Weight (kg) <span style={{color: 'red'}}>*</span></label>
                    <input type="number" step="0.1" className="form-input" required value={form.weight_kg} onChange={e => setForm({...form, weight_kg: e.target.value})} placeholder="0.0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Weight Category</label>
                    <div className="read-only-field" style={{ 
                      backgroundColor: form.weight_category ? 'var(--zim-gold)' : '#f9f9f9',
                      color: form.weight_category ? 'var(--zim-dark)' : '#333',
                      fontWeight: '700',
                      border: form.weight_category ? '1px solid var(--zim-gold)' : '1px solid #ddd',
                      transition: 'all 0.3s ease'
                    }}>
                      {form.weight_category || "Enter Weight..."}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '6px', fontStyle: 'italic' }}>Automatically selected from age group, gender and weight.</p>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Coach Name</label>
                    <input type="text" className="form-input" value={form.coach_name} onChange={e => setForm({...form, coach_name: capitalizeWords(e.target.value)})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Competition Level</label>
                    <select className="form-input" value={form.competition_level} onChange={e => setForm({...form, competition_level: e.target.value})}>
                      <option value="">Select Level</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Novice">Novice</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Elite">Elite</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Documents */}
              <div className="form-section" style={{ padding: '40px', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}> 
                  <span style={{ width: '36px', height: '36px', backgroundColor: 'var(--zim-gold)', color: '#1a1a1a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px', fontWeight: 'bold', fontSize: '1.2rem' }}>3</span>
                  <h3 style={{ margin: '0', fontSize: '1.5rem', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Documents</h3>
                </div>
                
                <div style={{ backgroundColor: '#fff8e1', padding: '20px', borderRadius: '12px', border: '1px solid #ffe082', marginBottom: '25px' }}>
                  <p style={{ margin: '0', fontSize: '0.95rem', color: '#856404', lineHeight: '1.5' }}>
                    Please upload a clear digital copy of your <strong>National ID, Birth Certificate, or Passport</strong>.
                    <br /><span style={{fontSize: '0.85rem'}}>Max Size: 5MB. Accepted: PDF, JPG, PNG.</span>
                  </p>
                </div>

                <div 
                  className="upload-zone"
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const droppedFile = e.dataTransfer.files[0];
                    if (validateFile(droppedFile)) setFile(droppedFile);
                  }}
                  onClick={() => document.getElementById('identity-upload').click()}
                  style={{
                    border: isDragging ? '2px solid var(--zim-gold)' : '2px dashed #ccc',
                    borderRadius: '16px',
                    padding: '50px 20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: isDragging ? '#fffcf0' : '#fafafa',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                >
                  <input 
                    id="identity-upload"
                    type="file" 
                    required 
                    accept=".pdf, .jpg, .jpeg, .png" 
                    onChange={(e) => {
                      const selected = e.target.files[0];
                      if (validateFile(selected)) setFile(selected);
                      else e.target.value = '';
                    }} 
                    style={{ display: 'none' }}
                  />
                  <div style={{ fontSize: '3.5rem', marginBottom: '15px' }}>📤</div>
                  <h4 style={{ margin: '0 0 10px', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {file ? 'Document Selected' : 'Click or Drag & Drop to Upload'}
                  </h4>
                  <p style={{ margin: '0', color: '#666', fontSize: '1rem', fontWeight: '500' }}>
                    {file ? file.name : 'Birth Certificate / National ID / Passport'}
                  </p>
                  {file && (
                    <div style={{ marginTop: '15px', color: 'var(--zim-green)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                      Verified: {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 4: Submit */}
              <div className="form-actions" style={{ padding: '40px', textAlign: 'center', backgroundColor: '#ffffff' }}>
                <button 
                  type="submit"
                  className="btn-premium btn-gold" // Changed to gold
                  style={{ minWidth: '320px', padding: '18px', fontSize: '1.2rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', color: '#1a1a1a' }}
                  disabled={loading}
                >
                  {loading ? 'Processing Registration...' : 'Submit Official Registration'}
                </button>
                <p style={{ marginTop: '20px', fontSize: '0.9rem', color: '#888' }}>By submitting, you agree to the Judo Association of Zimbabwe terms and conditions.</p>
              </div>
            </form>
          )}
        </div>

        {/* Roster Table Section */}
        <div style={{ marginTop: '80px' }}>
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '2.5rem', color: '#1a1a1a', fontWeight: '800' }}>Verified National Roster</h2>
            <p style={{ color: '#666' }}>Only athletes with verified associations are listed in the official database.</p>
          </div>
          
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflowX: 'auto', border: '1px solid #eee' }}>
            <table className="rankings-table-compact" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#1a1a1a', color: '#fff' }}>
                <tr>
                  <th style={{ padding: '18px 20px', textAlign: 'left' }}>Athlete Name</th>
                  <th style={{ padding: '18px 20px', textAlign: 'left' }}>Gender</th>
                  <th style={{ padding: '18px 20px', textAlign: 'left' }}>Comp. Age</th>
                  <th style={{ padding: '18px 20px', textAlign: 'left' }}>Age Group</th>
                  <th style={{ padding: '18px 20px', textAlign: 'left' }}>Weight Category</th>
                  <th style={{ padding: '18px 20px', textAlign: 'left' }}>Club / School</th>
                </tr> 
              </thead>
              <tbody>
                {athletes.filter(a => a.status === 'approved').length > 0 ? (
                  athletes.filter(a => a.status === 'approved').map(a => (
                    <tr key={a.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '16px 20px', fontWeight: '700', color: '#1a1a1a' }}>{a.first_name} {a.surname}</td>
                      <td style={{ padding: '16px 20px' }}>{a.gender}</td>
                      <td style={{ padding: '16px 20px' }}>{a.competition_age}</td>
                      <td style={{ padding: '16px 20px' }}>{a.age_group}</td>
                      <td style={{ padding: '16px 20px' }}><span style={{ backgroundColor: '#f0f0f0', padding: '4px 10px', borderRadius: '6px', fontWeight: '600' }}>{a.weight_category}</span></td>
                      <td style={{ padding: '16px 20px' }}>{a.club_or_school}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '60px', color: '#999', fontSize: '1.1rem' }}>No approved athletes found in the registry.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Athletes;