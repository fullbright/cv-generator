import React from 'react';
import CVEntry from './CVEntry.jsx';

/**
 * CVExperience — "Selected Work & Achievements" section.
 * Entries sorted newest first by date (from period string).
 * @param {{ entries: Array }} props
 */
function parseStartYear(period) {
  if (!period) return 0;
  const m = period.match(/(\d{4})/);
  return m ? parseInt(m[1], 10) : 0;
}

export default function CVExperience({ entries = [] }) {
  if (entries.length === 0) return null;

  const sorted = [...entries].sort(
    (a, b) => parseStartYear(b.period) - parseStartYear(a.period)
  );

  return (
    <section className="cv-section cv-experience">
      <h2 className="cv-section__title">Selected Work &amp; Achievements</h2>
      <div className="cv-experience__entries">
        {sorted.map((entry, i) => (
          <CVEntry key={entry.title + i} entry={entry} />
        ))}
      </div>
    </section>
  );
}
