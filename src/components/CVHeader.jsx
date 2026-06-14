import React from 'react';

/**
 * CVHeader — top section with name, title, contact links.
 * @param {{ profile: { name, title, email, github, linkedin, website, location } }} props
 */
export default function CVHeader({ profile = {} }) {
  const { name, title, email, github, linkedin, website, location } = profile;

  return (
    <header className="cv-header">
      <div className="cv-header__name">
        <h1>{name || 'Sergio Afanou'}</h1>
        {title && <p className="cv-header__title">{title}</p>}
      </div>
      <div className="cv-header__contact">
        {location && (
          <span className="cv-contact-item">
            <span className="cv-contact-icon">📍</span> {location}
          </span>
        )}
        {email && (
          <a href={`mailto:${email}`} className="cv-contact-item">{email}</a>
        )}
        {github && (
          <a href={github} className="cv-contact-item" target="_blank" rel="noreferrer">
            GitHub
          </a>
        )}
        {linkedin && (
          <a href={linkedin} className="cv-contact-item" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        )}
        {website && (
          <a href={website} className="cv-contact-item" target="_blank" rel="noreferrer">
            {website.replace(/^https?:\/\//, '')}
          </a>
        )}
      </div>
    </header>
  );
}
