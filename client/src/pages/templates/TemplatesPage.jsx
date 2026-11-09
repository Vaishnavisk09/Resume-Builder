import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Zap } from 'lucide-react';
import { TEMPLATES } from '../../components/templates/ResumeTemplates';

const templateDetails = {
  modern: { badge: 'Most Popular', desc: 'A clean two-column design with a dark navy sidebar and purple accents. Perfect for tech and design roles.', best: ['Software Engineers', 'Product Designers', 'Data Scientists'] },
  minimalist: { badge: 'Clean', desc: 'Pure white canvas with elegant typography. Timeless and ATS-friendly for all industries.', best: ['Marketing', 'Finance', 'Consulting'] },
  corporate: { badge: 'Professional', desc: 'Traditional two-column layout with a blue header. Trusted by enterprise and corporate applicants.', best: ['Banking', 'Law', 'Operations'] },
  creative: { badge: 'Bold', desc: 'Dark header with teal accents and a card-based project grid. Makes a strong visual impression.', best: ['UX/UI Designers', 'Content Creators', 'Developers'] },
  student: { badge: 'Fresher', desc: 'Clean one-column academic layout highlighting education and projects. Ideal for campus placements.', best: ['Students', 'Fresh Graduates', 'Interns'] },
};

export default function TemplatesPage() {
  const navigate = useNavigate();

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="page-title">Resume Templates</h1>
        <p className="text-secondary-text mt-1">
          5 professionally crafted templates — each with a distinct layout. Choose one and apply it instantly.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(TEMPLATES).map(({ id, name, accent }) => {
          const details = templateDetails[id] || {};
          return (
            <div key={id} className="card overflow-hidden hover:shadow-card-hover transition-all duration-300 group">
              {/* Template preview */}
              <div className="aspect-[4/3] relative overflow-hidden bg-gray-50 border-b border-border">
                <div className="absolute inset-0 p-4 flex gap-2">
                  {id === 'modern' ? (
                    <>
                      <div className="w-1/3 rounded-lg h-full" style={{ backgroundColor: accent }} />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 rounded w-3/4 bg-gray-200" />
                        <div className="h-2 rounded w-1/2 bg-gray-100" />
                        {[...Array(5)].map((_, i) => <div key={i} className="h-1.5 rounded bg-gray-100" style={{ width: `${60 + i * 8}%` }} />)}
                      </div>
                    </>
                  ) : id === 'corporate' ? (
                    <div className="w-full">
                      <div className="h-10 rounded-lg mb-2 w-full" style={{ backgroundColor: accent }} />
                      <div className="flex gap-2">
                        <div className="flex-1 space-y-1.5">
                          {[...Array(5)].map((_, i) => <div key={i} className="h-1.5 rounded bg-gray-100" />)}
                        </div>
                        <div className="w-1/3 space-y-1.5">
                          {[...Array(5)].map((_, i) => <div key={i} className="h-1.5 rounded bg-gray-100" />)}
                        </div>
                      </div>
                    </div>
                  ) : id === 'creative' ? (
                    <div className="w-full">
                      <div className="h-14 rounded-lg mb-2 w-full" style={{ backgroundColor: '#0c1a2e' }}>
                        <div className="h-full p-2 flex items-end">
                          <div className="h-2 rounded w-1/2" style={{ backgroundColor: accent }} />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 space-y-1.5">
                          {[...Array(4)].map((_, i) => <div key={i} className="h-1.5 rounded bg-gray-100" />)}
                        </div>
                        <div className="w-1/3 space-y-1.5">
                          {[...Array(4)].map((_, i) => <div key={i} className="h-1.5 rounded bg-gray-100" />)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full space-y-2">
                      <div className="pb-2 border-b-2" style={{ borderColor: accent }}>
                        <div className="h-4 rounded w-1/2 bg-gray-800 mb-1" />
                        <div className="flex gap-3">
                          {[...Array(3)].map((_, i) => <div key={i} className="h-1.5 rounded w-20 bg-gray-100" />)}
                        </div>
                      </div>
                      {[...Array(5)].map((_, i) => <div key={i} className="h-1.5 rounded bg-gray-100" style={{ width: `${65 + i * 7}%` }} />)}
                    </div>
                  )}
                </div>
                {details.badge && (
                  <div className="absolute top-3 right-3">
                    <span className="badge badge-primary text-[10px]">{details.badge}</span>
                  </div>
                )}
              </div>

              {/* Card content */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: accent }} />
                  <h3 className="font-bold text-main-text">{name}</h3>
                </div>
                <p className="text-secondary-text text-sm leading-relaxed mb-4">{details.desc}</p>

                {details.best && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-secondary-text uppercase tracking-wide mb-2">Best for</p>
                    <div className="flex flex-wrap gap-1.5">
                      {details.best.map(b => (
                        <span key={b} className="text-xs bg-gray-100 text-secondary-text px-2 py-0.5 rounded-full">{b}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate('/builder')}
                    className="btn-primary flex-1 text-sm py-2"
                  >
                    Use Template <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* CTA card */}
        <div className="card p-6 bg-navy flex flex-col items-center justify-center text-center min-h-[300px]">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
            <Zap className="w-7 h-7 text-primary" />
          </div>
          <h3 className="font-bold text-white text-lg mb-2">Not sure which one?</h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Start with the Modern template — our most popular. You can switch templates anytime in the builder without losing your data.
          </p>
          <button onClick={() => navigate('/builder')} className="btn-primary">
            Start Building <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
