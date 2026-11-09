import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useResume } from '../../../context/ResumeContext';
import { generateId } from '../../../utils/helpers';

const PROFICIENCY_LEVELS = ['Native', 'Fluent', 'Professional', 'Conversational', 'Basic'];

export default function LanguagesSection() {
  const { resumeData, updateResume } = useResume();
  const languages = resumeData.languages || [];
  const add = () => updateResume({ languages: [...languages, { id: generateId(), name: '', proficiency: 'Professional' }] });
  const remove = (id) => updateResume({ languages: languages.filter(l => l.id !== id) });
  const update = (id, field, value) => updateResume({ languages: languages.map(l => l.id === id ? { ...l, [field]: value } : l) });

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="section-title">Languages</h2>
        <button onClick={add} className="btn-primary text-xs py-1.5 px-3"><Plus size={14} /> Add</button>
      </div>
      {languages.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <p className="text-4xl mb-3">🌐</p>
          <p className="text-main-text font-semibold mb-1">No languages added</p>
          <p className="text-secondary-text text-sm mb-4">Multilingual skills can stand out to employers</p>
          <button onClick={add} className="btn-primary text-sm"><Plus size={16} /> Add Language</button>
        </div>
      ) : (
        <div className="space-y-3">
          {languages.map(lang => (
            <div key={lang.id} className="border border-border rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input className="input" placeholder="English, Hindi, French..."
                    value={lang.name} onChange={e => update(lang.id, 'name', e.target.value)} />
                </div>
                <select className="input w-36" value={lang.proficiency} onChange={e => update(lang.id, 'proficiency', e.target.value)}>
                  {PROFICIENCY_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <button onClick={() => remove(lang.id)} className="text-secondary-text hover:text-red-500 transition-colors p-1"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
