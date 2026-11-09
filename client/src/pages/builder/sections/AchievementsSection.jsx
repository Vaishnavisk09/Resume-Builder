import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useResume } from '../../../context/ResumeContext';
import { generateId } from '../../../utils/helpers';

export default function AchievementsSection() {
  const { resumeData, updateResume } = useResume();
  const achievements = resumeData.achievements || [];
  const add = () => updateResume({ achievements: [...achievements, { id: generateId(), title: '', description: '', date: '' }] });
  const remove = (id) => updateResume({ achievements: achievements.filter(a => a.id !== id) });
  const update = (id, field, value) => updateResume({ achievements: achievements.map(a => a.id === id ? { ...a, [field]: value } : a) });

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="section-title">Achievements</h2>
        <button onClick={add} className="btn-primary text-xs py-1.5 px-3"><Plus size={14} /> Add</button>
      </div>
      {achievements.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <p className="text-4xl mb-3">🏆</p>
          <p className="text-main-text font-semibold mb-1">No achievements added</p>
          <p className="text-secondary-text text-sm mb-4">Highlight your awards and recognitions</p>
          <button onClick={add} className="btn-primary text-sm"><Plus size={16} /> Add Achievement</button>
        </div>
      ) : (
        <div className="space-y-3">
          {achievements.map(ach => (
            <div key={ach.id} className="border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm text-main-text truncate">{ach.title || 'Achievement'}</p>
                <button onClick={() => remove(ach.id)} className="text-secondary-text hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
              </div>
              <div>
                <label className="label">Achievement Title *</label>
                <input className="input" placeholder="First Place – National Hackathon" value={ach.title} onChange={e => update(ach.id, 'title', e.target.value)} />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="textarea" rows={2} placeholder="Brief description of the achievement and its significance"
                  value={ach.description} onChange={e => update(ach.id, 'description', e.target.value)} />
              </div>
              <div>
                <label className="label">Date</label>
                <input type="month" className="input" value={ach.date} onChange={e => update(ach.id, 'date', e.target.value)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
