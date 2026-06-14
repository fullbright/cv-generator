import React from 'react';

/**
 * CVEntry — single work/achievement entry card.
 * @param {{ entry: object }} props
 */
export default function CVEntry({ entry }) {
  const {
    title = '',
    role = '',
    company = '',
    period = '',
    type = 'project',
    skills = [],
    summary = '',
    achievements = [],
    learnings = []
  } = entry;

  return (
    <article className="cv-entry">
      <div className="cv-entry__header">
        <div className="cv-entry__meta-left">
          <h3 className="cv-entry__title">{title}</h3>
          {(role || company) && (
            <p className="cv-entry__role">
              {role}{role && company ? ' · ' : ''}{company}
            </p>
          )}
        </div>
        <div className="cv-entry__meta-right">
          {period && <span className="cv-entry__period">{period}</span>}
          {type && <span className="cv-entry__type-badge">{type}</span>}
        </div>
      </div>

      {summary && <p className="cv-entry__summary">{summary}</p>}

      {achievements.length > 0 && (
        <ul className="cv-entry__achievements">
          {achievements.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      )}

      {skills.length > 0 && (
        <div className="cv-entry__skills">
          {skills.map(s => (
            <span key={s} className="cv-skill-tag">{s}</span>
          ))}
        </div>
      )}
    </article>
  );
}
