import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useResume } from '../../../context/ResumeContext';
import { generateId } from '../../../utils/helpers';

const emptyProject = () => ({
  id: generateId(), name: '', description: '', technologies: [], url: '', startDate: '', endDate: '',
});

export default function ProjectsSection() {
  const { resumeData, updateResume } = useResume();
  const projects = resumeData.projects || [];
  const [openItems, setOpenItems] = useState({ 0: true });
  const [techInputs, setTechInputs] = useState({});

  const addProject = () => {
    updateResume({ projects: [emptyProject(), ...projects] });
    setOpenItems({ 0: true });
  };

  const deleteProject = (id) => updateResume({ projects: projects.filter(p => p.id !== id) });
  const updateProject = (id, field, value) => updateResume({
    projects: projects.map(p => p.id === id ? { ...p, [field]: value } : p)
  });
  const addTech = (id, tech) => {
    const proj = projects.find(p => p.id === id);
    if (tech && !proj.technologies.includes(tech)) {
      updateProject(id, 'technologies', [...proj.technologies, tech]);
    }
    setTechInputs(t => ({ ...t, [id]: '' }));
  };
  const removeTech = (id, i) => {
    const proj = projects.find(p => p.id === id);
    updateProject(id, 'technologies', proj.technologies.filter((_, idx) => idx !== i));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="section-title">Projects</h2>
        <button onClick={addProject} className="btn-primary text-xs py-1.5 px-3">
          <Plus size={14} /> Add
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <p className="text-4xl mb-3">🚀</p>
          <p className="text-main-text font-semibold mb-1">No projects added</p>
          <p className="text-secondary-text text-sm mb-4">Showcase your best work</p>
          <button onClick={addProject} className="btn-primary text-sm"><Plus size={16} /> Add Project</button>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((proj, i) => (
            <div key={proj.id} className="border border-border rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setOpenItems(o => ({ ...o, [i]: !o[i] }))}>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-main-text truncate">{proj.name || 'Project Name'}</p>
                </div>
                <button onClick={e => { e.stopPropagation(); deleteProject(proj.id); }}
                  className="text-secondary-text hover:text-red-500 p-1 rounded"><Trash2 size={14} /></button>
                {openItems[i] ? <ChevronUp size={16} className="text-secondary-text" /> : <ChevronDown size={16} className="text-secondary-text" />}
              </div>
              {openItems[i] && (
                <div className="p-4 space-y-3 animate-fade-in">
                  <div>
                    <label className="label">Project Name *</label>
                    <input className="input" placeholder="My Awesome Project"
                      value={proj.name} onChange={e => updateProject(proj.id, 'name', e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Description</label>
                    <textarea className="textarea" rows={3}
                      placeholder="Describe what the project does, your role, and key achievements..."
                      value={proj.description} onChange={e => updateProject(proj.id, 'description', e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Technologies Used</label>
                    <div className="border border-border rounded-lg p-2 bg-white">
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {proj.technologies.map((t, j) => (
                          <span key={j} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
                            {t}
                            <button onClick={() => removeTech(proj.id, j)}><X size={11} /></button>
                          </span>
                        ))}
                      </div>
                      <input className="w-full text-sm outline-none placeholder-secondary-text"
                        placeholder="React, Node.js... (press Enter)"
                        value={techInputs[proj.id] || ''}
                        onChange={e => setTechInputs(t => ({ ...t, [proj.id]: e.target.value }))}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTech(proj.id, techInputs[proj.id]?.trim()); } }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">Project URL</label>
                    <input className="input" placeholder="https://github.com/you/project"
                      value={proj.url} onChange={e => updateProject(proj.id, 'url', e.target.value)} />
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
