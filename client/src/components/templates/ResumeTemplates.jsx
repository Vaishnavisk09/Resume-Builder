import React from 'react';
import { formatDate } from '../../utils/helpers';

// ─── Shared helpers ──────────────────────────────────────────────────────────
const Section = ({ title, children, accent = '#7155E8' }) => (
  <div className="mb-5">
    <div className="flex items-center gap-2 mb-2">
      <h3 style={{ color: accent }} className="text-xs font-bold uppercase tracking-widest">{title}</h3>
      <div className="flex-1 h-px" style={{ backgroundColor: accent, opacity: 0.2 }} />
    </div>
    {children}
  </div>
);

const SkillTag = ({ skill, accent }) => (
  <span className="text-xs px-2 py-0.5 rounded font-medium mr-1.5 mb-1.5 inline-block"
    style={{ background: `${accent}15`, color: accent }}>
    {skill}
  </span>
);

// ─── TEMPLATE 1: Modern Professional ─────────────────────────────────────────
export const ModernTemplate = ({ data }) => {
  const { personalInfo = {}, experience = [], education = [], skills = {}, projects = [], certifications = [], achievements = [] } = data || {};
  const accent = '#7155E8';

  return (
    <div className="flex h-full text-gray-800 text-[10px] leading-snug">
      {/* Sidebar */}
      <div className="w-[35%] flex-shrink-0 text-white p-5" style={{ backgroundColor: '#17152D' }}>
        {/* Avatar / Name */}
        <div className="mb-6">
          {personalInfo.fullName && (
            <div className="w-14 h-14 rounded-full mb-3 flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: accent }}>
              {personalInfo.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
          )}
          <h1 className="text-sm font-bold text-white leading-tight mb-0.5">
            {personalInfo.fullName || 'Your Name'}
          </h1>
          <p className="text-xs text-purple-300">{personalInfo.professionalTitle || 'Professional Title'}</p>
        </div>

        {/* Contact */}
        <div className="mb-5">
          <p className="text-[9px] font-bold uppercase tracking-widest text-purple-300 mb-2">Contact</p>
          <div className="space-y-1.5">
            {personalInfo.email && <p className="text-[9px] text-slate-300 break-all">📧 {personalInfo.email}</p>}
            {personalInfo.phone && <p className="text-[9px] text-slate-300">📞 {personalInfo.phone}</p>}
            {personalInfo.location && <p className="text-[9px] text-slate-300">📍 {personalInfo.location}</p>}
            {personalInfo.linkedin && <p className="text-[9px] text-slate-300 break-all">🔗 {personalInfo.linkedin}</p>}
            {personalInfo.github && <p className="text-[9px] text-slate-300 break-all">💻 {personalInfo.github}</p>}
            {personalInfo.portfolio && <p className="text-[9px] text-slate-300 break-all">🌐 {personalInfo.portfolio}</p>}
          </div>
        </div>

        {/* Skills */}
        {(skills.technical?.length > 0 || skills.soft?.length > 0) && (
          <div className="mb-5">
            <p className="text-[9px] font-bold uppercase tracking-widest text-purple-300 mb-2">Skills</p>
            {skills.technical?.length > 0 && (
              <div className="mb-2">
                <p className="text-[8px] text-slate-400 mb-1 uppercase">Technical</p>
                <div className="flex flex-wrap gap-1">
                  {skills.technical.map((s, i) => (
                    <span key={i} className="text-[8px] bg-white/10 text-white px-1.5 py-0.5 rounded">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {skills.soft?.length > 0 && (
              <div>
                <p className="text-[8px] text-slate-400 mb-1 uppercase">Soft Skills</p>
                <div className="flex flex-wrap gap-1">
                  {skills.soft.map((s, i) => (
                    <span key={i} className="text-[8px] bg-white/10 text-white px-1.5 py-0.5 rounded">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Languages */}
        {data?.languages?.length > 0 && (
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-purple-300 mb-2">Languages</p>
            {data.languages.map((l, i) => (
              <p key={i} className="text-[9px] text-slate-300">{l.name} {l.proficiency && `— ${l.proficiency}`}</p>
            ))}
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 p-5 overflow-hidden">
        {/* Summary */}
        {personalInfo.summary && (
          <Section title="Professional Summary" accent={accent}>
            <p className="text-[9.5px] text-gray-600 leading-relaxed">{personalInfo.summary}</p>
          </Section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <Section title="Work Experience" accent={accent}>
            {experience.map((exp, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-[10px] text-gray-800">{exp.jobTitle || 'Job Title'}</p>
                    <p className="text-[9px] font-semibold" style={{ color: accent }}>{exp.company}</p>
                  </div>
                  <p className="text-[8.5px] text-gray-500 whitespace-nowrap ml-2">
                    {formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </p>
                </div>
                {exp.location && <p className="text-[8.5px] text-gray-400 mt-0.5">{exp.location}</p>}
                {exp.responsibilities && (
                  <ul className="mt-1 space-y-0.5 list-disc list-inside">
                    {exp.responsibilities.split('\n').filter(Boolean).map((r, j) => (
                      <li key={j} className="text-[9px] text-gray-600">{r.replace(/^[-•]\s*/, '')}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </Section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <Section title="Education" accent={accent}>
            {education.map((edu, i) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-[10px] text-gray-800">{edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}</p>
                    <p className="text-[9px]" style={{ color: accent }}>{edu.institution}</p>
                  </div>
                  <p className="text-[8.5px] text-gray-500 whitespace-nowrap ml-2">
                    {formatDate(edu.startDate)} – {formatDate(edu.endDate)}
                  </p>
                </div>
                {edu.grade && <p className="text-[8.5px] text-gray-400">GPA / Grade: {edu.grade}</p>}
              </div>
            ))}
          </Section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <Section title="Projects" accent={accent}>
            {projects.map((proj, i) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between items-start">
                  <p className="font-bold text-[10px] text-gray-800">{proj.name}</p>
                  {proj.url && <a href={proj.url} className="text-[8.5px] text-blue-500">🔗 Link</a>}
                </div>
                {proj.description && <p className="text-[9px] text-gray-600 mt-0.5">{proj.description}</p>}
                {proj.technologies?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {proj.technologies.map((t, j) => (
                      <span key={j} className="text-[8px] px-1.5 py-0.5 rounded" style={{ background: `${accent}15`, color: accent }}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </Section>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <Section title="Certifications" accent={accent}>
            {certifications.map((cert, i) => (
              <div key={i} className="flex justify-between mb-1">
                <div>
                  <p className="font-semibold text-[9.5px] text-gray-800">{cert.name}</p>
                  {cert.issuer && <p className="text-[8.5px] text-gray-500">{cert.issuer}</p>}
                </div>
                {cert.date && <p className="text-[8.5px] text-gray-400">{formatDate(cert.date)}</p>}
              </div>
            ))}
          </Section>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <Section title="Achievements" accent={accent}>
            {achievements.map((ach, i) => (
              <div key={i} className="mb-1">
                <p className="font-semibold text-[9.5px] text-gray-800">{ach.title}</p>
                {ach.description && <p className="text-[9px] text-gray-500">{ach.description}</p>}
              </div>
            ))}
          </Section>
        )}
      </div>
    </div>
  );
};

// ─── TEMPLATE 2: Minimalist ───────────────────────────────────────────────────
export const MinimalistTemplate = ({ data }) => {
  const { personalInfo = {}, experience = [], education = [], skills = {}, projects = [], certifications = [] } = data || {};

  return (
    <div className="p-8 text-gray-800 text-[10px] leading-relaxed">
      {/* Header */}
      <div className="border-b-2 border-gray-800 pb-4 mb-5">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          {personalInfo.fullName || 'Your Name'}
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">{personalInfo.professionalTitle}</p>
        <div className="flex flex-wrap gap-4 mt-2 text-[9px] text-gray-500">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
          {personalInfo.github && <span>{personalInfo.github}</span>}
        </div>
      </div>

      {personalInfo.summary && (
        <div className="mb-5">
          <p className="text-[9.5px] text-gray-600 leading-relaxed">{personalInfo.summary}</p>
        </div>
      )}

      {experience.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-900 mb-3">Experience</h2>
          {experience.map((exp, i) => (
            <div key={i} className="mb-3 flex gap-4">
              <div className="w-24 flex-shrink-0 text-[8.5px] text-gray-400 pt-0.5">
                {formatDate(exp.startDate)} –<br />{exp.current ? 'Present' : formatDate(exp.endDate)}
              </div>
              <div className="flex-1">
                <p className="font-bold text-[10px]">{exp.jobTitle}</p>
                <p className="text-gray-500 text-[9px]">{exp.company}{exp.location ? `, ${exp.location}` : ''}</p>
                {exp.responsibilities && (
                  <ul className="mt-1 list-disc list-inside space-y-0.5">
                    {exp.responsibilities.split('\n').filter(Boolean).map((r, j) => (
                      <li key={j} className="text-[9px] text-gray-600">{r.replace(/^[-•]\s*/, '')}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-900 mb-3">Education</h2>
          {education.map((edu, i) => (
            <div key={i} className="mb-2 flex gap-4">
              <div className="w-24 flex-shrink-0 text-[8.5px] text-gray-400 pt-0.5">
                {formatDate(edu.startDate)} –<br />{formatDate(edu.endDate)}
              </div>
              <div>
                <p className="font-bold text-[10px]">{edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}</p>
                <p className="text-gray-500 text-[9px]">{edu.institution}</p>
                {edu.grade && <p className="text-gray-400 text-[8.5px]">GPA: {edu.grade}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {(skills.technical?.length > 0 || skills.soft?.length > 0) && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-900 mb-3">Skills</h2>
          <div className="flex gap-8">
            {skills.technical?.length > 0 && (
              <div>
                <p className="text-[8.5px] text-gray-400 uppercase mb-1">Technical</p>
                <p className="text-[9.5px] text-gray-700">{skills.technical.join(' · ')}</p>
              </div>
            )}
            {skills.soft?.length > 0 && (
              <div>
                <p className="text-[8.5px] text-gray-400 uppercase mb-1">Soft</p>
                <p className="text-[9.5px] text-gray-700">{skills.soft.join(' · ')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {projects.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-900 mb-3">Projects</h2>
          {projects.map((proj, i) => (
            <div key={i} className="mb-2">
              <p className="font-bold text-[10px]">{proj.name} {proj.url && <span className="text-blue-500 font-normal">↗</span>}</p>
              {proj.description && <p className="text-[9px] text-gray-600">{proj.description}</p>}
              {proj.technologies?.length > 0 && (
                <p className="text-[8.5px] text-gray-400 mt-0.5">{proj.technologies.join(', ')}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {certifications.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-900 mb-3">Certifications</h2>
          {certifications.map((cert, i) => (
            <p key={i} className="text-[9.5px] text-gray-700 mb-0.5">
              {cert.name} {cert.issuer && `— ${cert.issuer}`} {cert.date && `(${formatDate(cert.date)})`}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── TEMPLATE 3: Corporate ────────────────────────────────────────────────────
export const CorporateTemplate = ({ data }) => {
  const { personalInfo = {}, experience = [], education = [], skills = {}, projects = [], certifications = [] } = data || {};
  const accent = '#1e40af';

  return (
    <div className="text-[10px] leading-snug">
      {/* Blue header bar */}
      <div className="p-6 text-white" style={{ backgroundColor: accent }}>
        <h1 className="text-xl font-bold tracking-wide mb-1">{personalInfo.fullName || 'Your Name'}</h1>
        <p className="text-blue-200 text-sm mb-3">{personalInfo.professionalTitle}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9px] text-blue-100">
          {personalInfo.email && <span>✉ {personalInfo.email}</span>}
          {personalInfo.phone && <span>☎ {personalInfo.phone}</span>}
          {personalInfo.location && <span>⊙ {personalInfo.location}</span>}
          {personalInfo.linkedin && <span>in {personalInfo.linkedin}</span>}
          {personalInfo.github && <span>⊙ {personalInfo.github}</span>}
        </div>
      </div>

      <div className="flex">
        {/* Left column */}
        <div className="w-[62%] p-5 border-r border-gray-100">
          {personalInfo.summary && (
            <div className="mb-5">
              <h2 className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: accent }}>Profile</h2>
              <p className="text-[9.5px] text-gray-600 leading-relaxed">{personalInfo.summary}</p>
            </div>
          )}

          {experience.length > 0 && (
            <div className="mb-5">
              <h2 className="text-[9px] font-bold uppercase tracking-widest mb-3" style={{ color: accent }}>Professional Experience</h2>
              {experience.map((exp, i) => (
                <div key={i} className="mb-4 border-l-2 pl-3" style={{ borderColor: accent }}>
                  <p className="font-bold text-[10.5px] text-gray-800">{exp.jobTitle}</p>
                  <p className="text-[9px] font-semibold text-gray-600">{exp.company} {exp.location && `| ${exp.location}`}</p>
                  <p className="text-[8.5px] text-gray-400 mb-1">
                    {formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </p>
                  {exp.responsibilities && (
                    <ul className="list-disc list-inside space-y-0.5">
                      {exp.responsibilities.split('\n').filter(Boolean).map((r, j) => (
                        <li key={j} className="text-[9px] text-gray-600">{r.replace(/^[-•]\s*/, '')}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {projects.length > 0 && (
            <div>
              <h2 className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: accent }}>Projects</h2>
              {projects.map((proj, i) => (
                <div key={i} className="mb-2">
                  <p className="font-bold text-[10px] text-gray-800">{proj.name}</p>
                  {proj.description && <p className="text-[9px] text-gray-600">{proj.description}</p>}
                  {proj.technologies?.length > 0 && (
                    <p className="text-[8.5px] text-gray-400 mt-0.5">Stack: {proj.technologies.join(', ')}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="flex-1 p-5 bg-gray-50">
          {education.length > 0 && (
            <div className="mb-5">
              <h2 className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: accent }}>Education</h2>
              {education.map((edu, i) => (
                <div key={i} className="mb-3">
                  <p className="font-bold text-[10px] text-gray-800">{edu.degree}</p>
                  {edu.fieldOfStudy && <p className="text-[9px] text-gray-600">{edu.fieldOfStudy}</p>}
                  <p className="text-[9px] font-medium text-gray-700">{edu.institution}</p>
                  <p className="text-[8.5px] text-gray-400">{formatDate(edu.startDate)} – {formatDate(edu.endDate)}</p>
                  {edu.grade && <p className="text-[8.5px] text-gray-500">GPA: {edu.grade}</p>}
                </div>
              ))}
            </div>
          )}

          {skills.technical?.length > 0 && (
            <div className="mb-5">
              <h2 className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: accent }}>Technical Skills</h2>
              <div className="flex flex-wrap gap-1">
                {skills.technical.map((s, i) => (
                  <span key={i} className="text-[8px] px-1.5 py-0.5 rounded text-white font-medium"
                    style={{ backgroundColor: accent }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {skills.soft?.length > 0 && (
            <div className="mb-5">
              <h2 className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: accent }}>Core Competencies</h2>
              <div className="space-y-0.5">
                {skills.soft.map((s, i) => (
                  <p key={i} className="text-[9px] text-gray-600 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full inline-block" style={{ backgroundColor: accent }} /> {s}
                  </p>
                ))}
              </div>
            </div>
          )}

          {certifications.length > 0 && (
            <div>
              <h2 className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: accent }}>Certifications</h2>
              {certifications.map((cert, i) => (
                <div key={i} className="mb-1">
                  <p className="font-semibold text-[9.5px] text-gray-800">{cert.name}</p>
                  {cert.issuer && <p className="text-[8.5px] text-gray-500">{cert.issuer}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── TEMPLATE 4: Creative ─────────────────────────────────────────────────────
export const CreativeTemplate = ({ data }) => {
  const { personalInfo = {}, experience = [], education = [], skills = {}, projects = [], certifications = [], achievements = [] } = data || {};
  const accent = '#0891b2';

  return (
    <div className="text-[10px] leading-snug">
      {/* Header */}
      <div className="relative overflow-hidden" style={{ backgroundColor: '#0c1a2e' }}>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: accent, transform: 'translate(30%, -30%)' }} />
        <div className="p-6 relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">{personalInfo.fullName || 'Your Name'}</h1>
              <p className="font-semibold text-sm mt-1" style={{ color: accent }}>{personalInfo.professionalTitle}</p>
            </div>
            <div className="text-right text-[8.5px] text-slate-400 mt-1 space-y-0.5">
              {personalInfo.email && <p>{personalInfo.email}</p>}
              {personalInfo.phone && <p>{personalInfo.phone}</p>}
              {personalInfo.location && <p>{personalInfo.location}</p>}
              {personalInfo.github && <p>{personalInfo.github}</p>}
            </div>
          </div>
          {personalInfo.summary && (
            <p className="text-[9px] text-slate-300 mt-3 leading-relaxed max-w-lg">{personalInfo.summary}</p>
          )}
        </div>
      </div>

      <div className="flex">
        {/* Main */}
        <div className="flex-1 p-5">
          {experience.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: accent }} />
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-800">Experience</h2>
              </div>
              {experience.map((exp, i) => (
                <div key={i} className="mb-3 pl-4 border-l" style={{ borderColor: `${accent}40` }}>
                  <div className="flex justify-between">
                    <div>
                      <p className="font-black text-[10.5px] text-gray-800">{exp.jobTitle}</p>
                      <p className="text-[9px] font-bold" style={{ color: accent }}>{exp.company}</p>
                    </div>
                    <p className="text-[8px] text-gray-400">
                      {formatDate(exp.startDate)} – {exp.current ? 'Now' : formatDate(exp.endDate)}
                    </p>
                  </div>
                  {exp.responsibilities && (
                    <ul className="mt-1 space-y-0.5">
                      {exp.responsibilities.split('\n').filter(Boolean).map((r, j) => (
                        <li key={j} className="text-[9px] text-gray-600 flex items-start gap-1.5">
                          <span className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: accent }} />
                          {r.replace(/^[-•]\s*/, '')}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {projects.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: accent }} />
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-800">Projects</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {projects.map((proj, i) => (
                  <div key={i} className="p-2.5 rounded-lg border" style={{ borderColor: `${accent}30` }}>
                    <p className="font-bold text-[9.5px] text-gray-800">{proj.name}</p>
                    {proj.description && <p className="text-[8.5px] text-gray-500 mt-0.5 leading-tight">{proj.description}</p>}
                    {proj.technologies?.length > 0 && (
                      <div className="flex flex-wrap gap-0.5 mt-1">
                        {proj.technologies.slice(0, 4).map((t, j) => (
                          <span key={j} className="text-[7.5px] px-1 py-0.5 rounded text-white" style={{ backgroundColor: accent }}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {achievements.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: accent }} />
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-800">Achievements</h2>
              </div>
              {achievements.map((ach, i) => (
                <div key={i} className="mb-1">
                  <p className="font-semibold text-[9.5px] text-gray-800">{ach.title}</p>
                  {ach.description && <p className="text-[9px] text-gray-500">{ach.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-[32%] p-4 bg-gray-50">
          {education.length > 0 && (
            <div className="mb-4">
              <h2 className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: accent }}>Education</h2>
              {education.map((edu, i) => (
                <div key={i} className="mb-2">
                  <p className="font-bold text-[9.5px] text-gray-800">{edu.degree}</p>
                  {edu.fieldOfStudy && <p className="text-[8.5px] text-gray-600">{edu.fieldOfStudy}</p>}
                  <p className="text-[9px] font-medium text-gray-700">{edu.institution}</p>
                  <p className="text-[8px] text-gray-400">{formatDate(edu.endDate)}</p>
                </div>
              ))}
            </div>
          )}

          {skills.technical?.length > 0 && (
            <div className="mb-4">
              <h2 className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: accent }}>Tech Stack</h2>
              <div className="flex flex-wrap gap-1">
                {skills.technical.map((s, i) => (
                  <span key={i} className="text-[8px] px-1.5 py-0.5 rounded font-medium"
                    style={{ background: `${accent}15`, color: accent }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {skills.soft?.length > 0 && (
            <div className="mb-4">
              <h2 className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: accent }}>Soft Skills</h2>
              {skills.soft.map((s, i) => (
                <p key={i} className="text-[9px] text-gray-600 mb-0.5">{s}</p>
              ))}
            </div>
          )}

          {certifications.length > 0 && (
            <div>
              <h2 className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: accent }}>Certifications</h2>
              {certifications.map((cert, i) => (
                <p key={i} className="text-[9px] text-gray-700 mb-0.5 font-medium">{cert.name}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── TEMPLATE 5: Student / Fresher ───────────────────────────────────────────
export const StudentTemplate = ({ data }) => {
  const { personalInfo = {}, experience = [], education = [], skills = {}, projects = [], certifications = [], achievements = [] } = data || {};
  const accent = '#059669';

  return (
    <div className="p-6 text-[10px] leading-snug">
      {/* Header */}
      <div className="text-center mb-5 pb-4" style={{ borderBottom: `2px solid ${accent}` }}>
        <h1 className="text-2xl font-bold text-gray-900">{personalInfo.fullName || 'Your Name'}</h1>
        <p className="font-semibold mt-0.5" style={{ color: accent }}>{personalInfo.professionalTitle || 'Computer Science Graduate'}</p>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 text-[9px] text-gray-500">
          {personalInfo.email && <span>📧 {personalInfo.email}</span>}
          {personalInfo.phone && <span>📞 {personalInfo.phone}</span>}
          {personalInfo.location && <span>📍 {personalInfo.location}</span>}
          {personalInfo.linkedin && <span>🔗 {personalInfo.linkedin}</span>}
          {personalInfo.github && <span>💻 {personalInfo.github}</span>}
          {personalInfo.portfolio && <span>🌐 {personalInfo.portfolio}</span>}
        </div>
      </div>

      {personalInfo.summary && (
        <div className="mb-4">
          <h2 className="text-[9px] font-bold uppercase tracking-widest mb-1.5" style={{ color: accent }}>Objective</h2>
          <p className="text-[9.5px] text-gray-600 leading-relaxed">{personalInfo.summary}</p>
        </div>
      )}

      {education.length > 0 && (
        <div className="mb-4">
          <h2 className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: accent }}>Education</h2>
          {education.map((edu, i) => (
            <div key={i} className="flex justify-between mb-2">
              <div>
                <p className="font-bold text-[10.5px] text-gray-800">{edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}</p>
                <p className="text-[9.5px] text-gray-600">{edu.institution}</p>
                {edu.grade && <p className="text-[8.5px] text-gray-500">CGPA: {edu.grade}</p>}
              </div>
              <p className="text-[8.5px] text-gray-400 text-right">
                {formatDate(edu.startDate)}<br />– {formatDate(edu.endDate)}
              </p>
            </div>
          ))}
        </div>
      )}

      {(skills.technical?.length > 0 || skills.soft?.length > 0) && (
        <div className="mb-4">
          <h2 className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: accent }}>Technical Skills</h2>
          <div className="grid grid-cols-2 gap-2">
            {skills.technical?.length > 0 && (
              <div>
                <p className="text-[8.5px] text-gray-400 mb-1">Languages & Frameworks</p>
                <div className="flex flex-wrap gap-1">
                  {skills.technical.map((s, i) => (
                    <span key={i} className="text-[8px] px-1.5 py-0.5 rounded font-medium border"
                      style={{ color: accent, borderColor: `${accent}40` }}>{s}</span>
                  ))}
                </div>
              </div>
            )}
            {skills.soft?.length > 0 && (
              <div>
                <p className="text-[8.5px] text-gray-400 mb-1">Soft Skills</p>
                <p className="text-[9px] text-gray-600">{skills.soft.join(' • ')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {projects.length > 0 && (
        <div className="mb-4">
          <h2 className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: accent }}>Academic Projects</h2>
          {projects.map((proj, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between">
                <p className="font-bold text-[10px] text-gray-800">{proj.name}</p>
                {proj.url && <span className="text-[8.5px] text-blue-500">🔗 View</span>}
              </div>
              {proj.description && <p className="text-[9px] text-gray-600 mt-0.5">{proj.description}</p>}
              {proj.technologies?.length > 0 && (
                <p className="text-[8.5px] text-gray-400 mt-0.5">Technologies: {proj.technologies.join(', ')}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {experience.length > 0 && (
        <div className="mb-4">
          <h2 className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: accent }}>Internship / Experience</h2>
          {experience.map((exp, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between">
                <div>
                  <p className="font-bold text-[10px] text-gray-800">{exp.jobTitle}</p>
                  <p className="text-[9px] font-medium" style={{ color: accent }}>{exp.company}</p>
                </div>
                <p className="text-[8.5px] text-gray-400">{formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}</p>
              </div>
              {exp.responsibilities && (
                <ul className="mt-1 list-disc list-inside space-y-0.5">
                  {exp.responsibilities.split('\n').filter(Boolean).map((r, j) => (
                    <li key={j} className="text-[9px] text-gray-600">{r.replace(/^[-•]\s*/, '')}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {certifications.length > 0 && (
          <div>
            <h2 className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: accent }}>Certifications</h2>
            {certifications.map((cert, i) => (
              <p key={i} className="text-[9px] text-gray-700 mb-0.5">• {cert.name} {cert.issuer && `— ${cert.issuer}`}</p>
            ))}
          </div>
        )}
        {achievements.length > 0 && (
          <div>
            <h2 className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: accent }}>Achievements</h2>
            {achievements.map((ach, i) => (
              <p key={i} className="text-[9px] text-gray-700 mb-0.5">• {ach.title}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Template registry
export const TEMPLATES = {
  modern: { id: 'modern', name: 'Modern Professional', Component: ModernTemplate, accent: '#7155E8' },
  minimalist: { id: 'minimalist', name: 'Minimalist', Component: MinimalistTemplate, accent: '#1a1a1a' },
  corporate: { id: 'corporate', name: 'Corporate', Component: CorporateTemplate, accent: '#1e40af' },
  creative: { id: 'creative', name: 'Creative', Component: CreativeTemplate, accent: '#0891b2' },
  student: { id: 'student', name: 'Student / Fresher', Component: StudentTemplate, accent: '#059669' },
};

export const getTemplate = (id) => TEMPLATES[id] || TEMPLATES.modern;
