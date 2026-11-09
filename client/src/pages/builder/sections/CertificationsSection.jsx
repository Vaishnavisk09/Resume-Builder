import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useResume } from '../../../context/ResumeContext';
import { generateId } from '../../../utils/helpers';

export default function CertificationsSection() {
  const { resumeData, updateResume } = useResume();
  const certs = resumeData.certifications || [];
  const add = () => updateResume({ certifications: [...certs, { id: generateId(), name: '', issuer: '', date: '', url: '' }] });
  const remove = (id) => updateResume({ certifications: certs.filter(c => c.id !== id) });
  const update = (id, field, value) => updateResume({ certifications: certs.map(c => c.id === id ? { ...c, [field]: value } : c) });

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="section-title">Certifications</h2>
        <button onClick={add} className="btn-primary text-xs py-1.5 px-3"><Plus size={14} /> Add</button>
      </div>
      {certs.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <p className="text-4xl mb-3">📜</p>
          <p className="text-main-text font-semibold mb-1">No certifications added</p>
          <p className="text-secondary-text text-sm mb-4">Add professional certifications</p>
          <button onClick={add} className="btn-primary text-sm"><Plus size={16} /> Add Certification</button>
        </div>
      ) : (
        <div className="space-y-3">
          {certs.map(cert => (
            <div key={cert.id} className="border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm text-main-text">{cert.name || 'Certification'}</p>
                <button onClick={() => remove(cert.id)} className="text-secondary-text hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
              </div>
              <div>
                <label className="label">Certification Name *</label>
                <input className="input" placeholder="AWS Solutions Architect" value={cert.name} onChange={e => update(cert.id, 'name', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Issuing Organization</label>
                  <input className="input" placeholder="Amazon Web Services" value={cert.issuer} onChange={e => update(cert.id, 'issuer', e.target.value)} />
                </div>
                <div>
                  <label className="label">Date Earned</label>
                  <input type="month" className="input" value={cert.date} onChange={e => update(cert.id, 'date', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Certificate URL</label>
                <input className="input" placeholder="https://credential.link" value={cert.url} onChange={e => update(cert.id, 'url', e.target.value)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
