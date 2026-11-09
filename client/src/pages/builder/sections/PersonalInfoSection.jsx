import React from 'react';
import { useResume } from '../../../context/ResumeContext';

export default function PersonalInfoSection() {
  const { resumeData, updateResume } = useResume();
  const info = resumeData.personalInfo || {};

  const set = (field, value) => {
    updateResume({ personalInfo: { ...info, [field]: value } });
  };

  const fields = [
    { key: 'fullName', label: 'Full Name', placeholder: 'Jane Smith', type: 'text' },
    { key: 'professionalTitle', label: 'Professional Title', placeholder: 'Software Engineer', type: 'text' },
    { key: 'email', label: 'Email', placeholder: 'jane@example.com', type: 'email' },
    { key: 'phone', label: 'Phone', placeholder: '+91 98765 43210', type: 'tel' },
    { key: 'location', label: 'Location', placeholder: 'Mumbai, Maharashtra', type: 'text' },
    { key: 'linkedin', label: 'LinkedIn URL', placeholder: 'linkedin.com/in/janesmith', type: 'url' },
    { key: 'github', label: 'GitHub URL', placeholder: 'github.com/janesmith', type: 'url' },
    { key: 'portfolio', label: 'Portfolio URL', placeholder: 'janesmith.dev', type: 'url' },
  ];

  return (
    <div>
      <h2 className="section-title mb-5">Personal Information</h2>
      <div className="space-y-4">
        {fields.map(({ key, label, placeholder, type }) => (
          <div key={key}>
            <label className="label">{label}</label>
            <input
              type={type}
              className="input"
              placeholder={placeholder}
              value={info[key] || ''}
              onChange={e => set(key, e.target.value)}
            />
          </div>
        ))}
        <div>
          <label className="label">Professional Summary</label>
          <textarea
            className="textarea"
            rows={5}
            placeholder="Write a compelling 2-3 sentence summary highlighting your key experience, skills, and career goals..."
            value={info.summary || ''}
            onChange={e => set('summary', e.target.value)}
          />
          <p className="text-xs text-secondary-text mt-1">{(info.summary || '').length}/500 characters</p>
        </div>
      </div>
    </div>
  );
}
