import React, { useEffect, useState } from 'react';
import CVHeader from './components/CVHeader.jsx';
import CVSummary from './components/CVSummary.jsx';
import CVExperience from './components/CVExperience.jsx';
import CVSkills from './components/CVSkills.jsx';

/**
 * Root component. Loads cv-data.json from /public/ and renders the full CV.
 * In print mode (window.matchMedia('print')) all sections are visible.
 */
export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/cv-data.json')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch(err => setError(err.message));
  }, []);

  if (error) return (
    <div style={{ padding: '2rem', color: '#c0392b', fontFamily: 'Inter, sans-serif' }}>
      <strong>CV data not found.</strong> Run <code>npm run prepare-cv-data</code> first.
      <pre style={{ fontSize: 12 }}>{error}</pre>
    </div>
  );

  if (!data) return (
    <div style={{ padding: '2rem', fontFamily: 'Inter, sans-serif', color: '#6c757d' }}>
      Loading CV data…
    </div>
  );

  // Aggregate skills from all entries
  const allSkills = [...new Set(
    (data.entries || []).flatMap(e => e.skills || [])
  )].sort();

  return (
    <div className="cv-document" id="cv-root">
      <CVHeader profile={data.profile} />
      {data.profile?.summary && <CVSummary summary={data.profile.summary} />}
      <CVExperience entries={data.entries || []} />
      <CVSkills skills={allSkills} />
    </div>
  );
}
