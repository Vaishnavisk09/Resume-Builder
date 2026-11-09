import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { useResume } from '../../../context/ResumeContext';
import { generateId } from '../../../utils/helpers';

const emptyEntry = () => ({
  id: generateId(), institution: '', degree: '', fieldOfStudy: '',
  startDate: '', endDate: '', grade: '', description: '',
});

export default function EducationSection() {
  const { resumeData, updateResume } = useResume();
  const education = resumeData.education || [];
  const [openItems, setOpenItems] = useState({ 0: true });

  const addEntry = () => {
    const newEdu = [emptyEntry(), ...education];
    updateResume({ education: newEdu });
    setOpenItems({ 0: true });
  };

  const deleteEntry = (id) => updateResume({ education: education.filter(e => e.id !== id) });
  const updateEntry = (id, field, value) => updateResume({
    education: education.map(e => e.id === id ? { ...e, [field]: value } : e)
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="section-title">Education</h2>
        <button onClick={addEntry} className="btn-primary text-xs py-1.5 px-3">
          <Plus size={14} /> Add
        </button>
      </div>

      {education.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <p className="text-4xl mb-3">🎓</p>
          <p className="text-main-text font-semibold mb-1">No education added</p>
          <p className="text-secondary-text text-sm mb-4">Add your educational background</p>
          <button onClick={addEntry} className="btn-primary text-sm"><Plus size={16} /> Add Education</button>
        </div>
      ) : (
        <div className="space-y-3">
          {education.map((edu, i) => (
            <div key={edu.id} className="border border-border rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setOpenItems(o => ({ ...o, [i]: !o[i] }))}>
                <GripVertical size={16} className="text-gray-300" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-main-text truncate">
                    {edu.degree || 'Degree'} {edu.institution ? `· ${edu.institution}` : ''}
                  </p>
                </div>
                <button onClick={e => { e.stopPropagation(); deleteEntry(edu.id); }}
                  className="text-secondary-text hover:text-red-500 p-1 rounded transition-colors"><Trash2 size={14} /></button>
                {openItems[i] ? <ChevronUp size={16} className="text-secondary-text" /> : <ChevronDown size={16} className="text-secondary-text" />}
              </div>
              {openItems[i] && (
                <div className="p-4 space-y-3 animate-fade-in">
                  <div>
                    <label className="label">Institution Name *</label>
                    <input className="input" placeholder="MIT, IIT Bombay, etc."
                      value={edu.institution} onChange={e => updateEntry(edu.id, 'institution', e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Degree *</label>
                      <input className="input" placeholder="B.Tech / M.Sc / MBA"
                        value={edu.degree} onChange={e => updateEntry(edu.id, 'degree', e.target.value)} />
                    </div>
                    <div>
                      <label className="label">Field of Study</label>
                      <input className="input" placeholder="Computer Science"
                        value={edu.fieldOfStudy} onChange={e => updateEntry(edu.id, 'fieldOfStudy', e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Start Date</label>
                      <input type="month" className="input"
                        value={edu.startDate} onChange={e => updateEntry(edu.id, 'startDate', e.target.value)} />
                    </div>
                    <div>
                      <label className="label">End Date</label>
                      <input type="month" className="input"
                        value={edu.endDate} onChange={e => updateEntry(edu.id, 'endDate', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="label">CGPA / Grade / Percentage</label>
                    <input className="input" placeholder="8.5 / 10 or 85%"
                      value={edu.grade} onChange={e => updateEntry(edu.id, 'grade', e.target.value)} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
