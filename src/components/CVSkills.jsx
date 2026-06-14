import React from 'react';

/**
 * CVSkills — aggregated skills section, auto-built from all entry skill arrays.
 * @param {{ skills: string[] }} props
 */
export default function CVSkills({ skills = [] }) {
  if (skills.length === 0) return null;

  return (
    <section className="cv-section cv-skills">
      <h2 className="cv-section__title">Technical Skills</h2>
      <div className="cv-skills__tags">
        {skills.map(skill => (
          <span key={skill} className="cv-skill-tag cv-skill-tag--large">{skill}</span>
        ))}
      </div>
    </section>
  );
}
