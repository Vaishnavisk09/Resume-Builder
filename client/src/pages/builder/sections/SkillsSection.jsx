import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useResume } from '../../../context/ResumeContext';

const TagInput = ({ label, tags, onAdd, onRemove, placeholder }) => {
  const [input, setInput] = useState('');

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      onAdd(input.trim());
      setInput('');
    }
  };

  return (
    <div>
      <label className="label">{label}</label>
      <div className="border border-border rounded-lg p-2 bg-white focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tags.map((tag, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-lg text-xs font-medium">
              {tag}
              <button onClick={() => onRemove(i)} className="hover:text-primary-600 transition-colors">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          className="w-full text-sm outline-none text-main-text placeholder-secondary-text bg-transparent"
          placeholder={tags.length === 0 ? placeholder : 'Add more...'}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (input.trim()) { onAdd(input.trim()); setInput(''); } }}
        />
      </div>
      <p className="text-xs text-secondary-text mt-1">Press Enter or comma to add</p>
    </div>
  );
};

export default function SkillsSection() {
  const { resumeData, updateResume } = useResume();
  const skills = resumeData.skills || { technical: [], soft: [], languages: [] };

  const update = (field, fn) => updateResume({ skills: { ...skills, [field]: fn(skills[field] || []) } });

  const addTag = (field, tag) => {
    if (!(skills[field] || []).includes(tag)) update(field, tags => [...tags, tag]);
  };
  const removeTag = (field, i) => update(field, tags => tags.filter((_, idx) => idx !== i));

  const suggestedTechnical = ['JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'SQL', 'Git', 'Docker', 'AWS', 'Java'];
  const suggestedSoft = ['Team Leadership', 'Problem Solving', 'Communication', 'Agile/Scrum', 'Time Management'];

  return (
    <div>
      <h2 className="section-title mb-5">Skills</h2>

      <div className="space-y-5">
        <TagInput
          label="Technical Skills"
          tags={skills.technical || []}
          onAdd={tag => addTag('technical', tag)}
          onRemove={i => removeTag('technical', i)}
          placeholder="React, Python, Node.js..."
        />

        {/* Quick suggestions */}
        <div>
          <p className="text-xs text-secondary-text mb-2">Quick add:</p>
          <div className="flex flex-wrap gap-1.5">
            {suggestedTechnical.filter(s => !(skills.technical || []).includes(s)).slice(0, 8).map(s => (
              <button key={s} onClick={() => addTag('technical', s)}
                className="text-xs px-2.5 py-1 border border-border rounded-lg text-secondary-text hover:border-primary hover:text-primary transition-colors flex items-center gap-1">
                <Plus size={11} /> {s}
              </button>
            ))}
          </div>
        </div>

        <div className="divider" />

        <TagInput
          label="Soft Skills"
          tags={skills.soft || []}
          onAdd={tag => addTag('soft', tag)}
          onRemove={i => removeTag('soft', i)}
          placeholder="Leadership, Communication..."
        />

        <div>
          <p className="text-xs text-secondary-text mb-2">Quick add:</p>
          <div className="flex flex-wrap gap-1.5">
            {suggestedSoft.filter(s => !(skills.soft || []).includes(s)).map(s => (
              <button key={s} onClick={() => addTag('soft', s)}
                className="text-xs px-2.5 py-1 border border-border rounded-lg text-secondary-text hover:border-primary hover:text-primary transition-colors flex items-center gap-1">
                <Plus size={11} /> {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
