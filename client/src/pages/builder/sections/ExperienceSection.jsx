import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { useResume } from '../../../context/ResumeContext';
import { generateId } from '../../../utils/helpers';

const emptyEntry = () => ({
  id: generateId(),
  jobTitle: '',
  company: '',
  location: '',
  startDate: '',
  endDate: '',
  current: false,
  responsibilities: '',
  achievements: '',
});

const EntryCard = ({ entry, index, onUpdate, onDelete, onMove, total }) => {
  const [open, setOpen] = useState(index === 0);

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div
        className="flex items-center gap-2 px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <GripVertical size={16} className="text-gray-300" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-main-text truncate">
            {entry.jobTitle || 'Job Title'} {entry.company ? `· ${entry.company}` : ''}
          </p>
          {!open && entry.startDate && (
            <p className="text-xs text-secondary-text mt-0.5">
              {entry.startDate} – {entry.current ? 'Present' : entry.endDate}
            </p>
          )}
        </div>
        <button onClick={e => { e.stopPropagation(); onDelete(entry.id); }}
          className="text-secondary-text hover:text-red-500 p-1 rounded transition-colors">
          <Trash2 size={14} />
        </button>
        {open ? <ChevronUp size={16} className="text-secondary-text" /> : <ChevronDown size={16} className="text-secondary-text" />}
      </div>

      {open && (
        <div className="p-4 space-y-3 animate-fade-in">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Job Title *</label>
              <input className="input" placeholder="Software Engineer"
                value={entry.jobTitle} onChange={e => onUpdate(entry.id, 'jobTitle', e.target.value)} />
            </div>
            <div>
              <label className="label">Company *</label>
              <input className="input" placeholder="Acme Inc."
                value={entry.company} onChange={e => onUpdate(entry.id, 'company', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">Location</label>
            <input className="input" placeholder="Mumbai, India"
              value={entry.location} onChange={e => onUpdate(entry.id, 'location', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start Date</label>
              <input type="month" className="input"
                value={entry.startDate} onChange={e => onUpdate(entry.id, 'startDate', e.target.value)} />
            </div>
            <div>
              <label className="label">End Date</label>
              <input type="month" className="input" disabled={entry.current}
                value={entry.endDate} onChange={e => onUpdate(entry.id, 'endDate', e.target.value)} />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={entry.current}
              onChange={e => onUpdate(entry.id, 'current', e.target.checked)}
              className="w-4 h-4 rounded text-primary border-border" />
            <span className="text-sm text-main-text">Currently working here</span>
          </label>

          <div>
            <label className="label">Responsibilities & Achievements</label>
            <textarea className="textarea" rows={5}
              placeholder={`• Led development of a microservices architecture\n• Reduced API response time by 40%\n• Mentored 3 junior developers`}
              value={entry.responsibilities}
              onChange={e => onUpdate(entry.id, 'responsibilities', e.target.value)}
            />
            <p className="text-xs text-secondary-text mt-1">Use bullet points (•) for each responsibility</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default function ExperienceSection() {
  const { resumeData, updateResume } = useResume();
  const experience = resumeData.experience || [];

  const addEntry = () => {
    updateResume({ experience: [emptyEntry(), ...experience] });
  };

  const deleteEntry = (id) => {
    updateResume({ experience: experience.filter(e => e.id !== id) });
  };

  const updateEntry = (id, field, value) => {
    updateResume({
      experience: experience.map(e => e.id === id ? { ...e, [field]: value } : e)
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="section-title">Work Experience</h2>
        <button onClick={addEntry} className="btn-primary text-xs py-1.5 px-3">
          <Plus size={14} /> Add Entry
        </button>
      </div>

      {experience.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <p className="text-4xl mb-3">💼</p>
          <p className="text-main-text font-semibold mb-1">No experience added yet</p>
          <p className="text-secondary-text text-sm mb-4">Add your work history to strengthen your resume</p>
          <button onClick={addEntry} className="btn-primary text-sm">
            <Plus size={16} /> Add Experience
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {experience.map((entry, i) => (
            <EntryCard key={entry.id} entry={entry} index={i} total={experience.length}
              onUpdate={updateEntry} onDelete={deleteEntry} onMove={() => {}} />
          ))}
        </div>
      )}
    </div>
  );
}
