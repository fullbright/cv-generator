import React from 'react';

/**
 * CVSummary — 2-3 sentence professional summary.
 * @param {{ summary: string }} props
 */
export default function CVSummary({ summary }) {
  if (!summary) return null;
  return (
    <section className="cv-section cv-summary">
      <h2 className="cv-section__title">Summary</h2>
      <p className="cv-summary__text">{summary}</p>
    </section>
  );
}
