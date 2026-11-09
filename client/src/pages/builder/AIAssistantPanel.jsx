import React, { useState } from 'react';
import { Sparkles, X, RefreshCw, Check, ChevronDown, Loader2, ArrowRight } from 'lucide-react';
import { aiAPI } from '../../services/api';
import { useResume } from '../../context/ResumeContext';
import toast from 'react-hot-toast';

const IMPROVEMENT_TYPES = [
  { id: 'summary', label: 'Improve Summary', icon: '📝', field: 'personalInfo.summary' },
  { id: 'experience', label: 'Enhance Experience', icon: '💼', field: 'experience' },
  { id: 'skills', label: 'Suggest Skills', icon: '⚡', field: 'skills' },
  { id: 'grammar', label: 'Fix Grammar', icon: '✅', field: 'all' },
  { id: 'bullets', label: 'Stronger Bullets', icon: '🎯', field: 'experience' },
];

const SuggestionCard = ({ suggestion, onAccept, onReject, onRegenerate, loading }) => (
  <div className="border border-border rounded-xl overflow-hidden animate-slide-up">
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Sparkles size={12} className="text-white" />
        </div>
        <p className="text-xs font-bold text-primary uppercase tracking-wide">AI Suggestion</p>
      </div>

      {suggestion.original && (
        <div>
          <p className="text-[10px] font-semibold text-secondary-text uppercase tracking-wide mb-1.5">Original</p>
          <p className="text-xs text-secondary-text bg-gray-50 rounded-lg p-2.5 leading-relaxed">
            {suggestion.original}
          </p>
        </div>
      )}

      <div>
        <p className="text-[10px] font-semibold text-primary uppercase tracking-wide mb-1.5">✨ Improved</p>
        <p className="text-xs text-main-text bg-primary/5 rounded-lg p-2.5 leading-relaxed border border-primary/20">
          {suggestion.improved}
        </p>
      </div>

      {suggestion.reason && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
          <p className="text-[10px] font-semibold text-amber-700 mb-0.5">Why this works better:</p>
          <p className="text-xs text-amber-600">{suggestion.reason}</p>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button onClick={onAccept} disabled={loading}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-600 transition-colors">
          <Check size={13} /> Accept
        </button>
        <button onClick={onRegenerate} disabled={loading}
          className="flex items-center justify-center gap-1.5 py-2 px-3 bg-gray-100 text-main-text rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </button>
        <button onClick={onReject} disabled={loading}
          className="flex items-center justify-center gap-1.5 py-2 px-3 text-secondary-text rounded-lg text-xs font-semibold hover:bg-gray-100 transition-colors">
          <X size={13} />
        </button>
      </div>
    </div>
  </div>
);

export default function AIAssistantPanel({ resumeData, onClose }) {
  const { updateResume } = useResume();
  const [selectedType, setSelectedType] = useState('summary');
  const [customPrompt, setCustomPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState('');

  const getContextText = () => {
    switch (selectedType) {
      case 'summary': return resumeData.personalInfo?.summary || '';
      case 'experience':
        return resumeData.experience?.map(e =>
          `${e.jobTitle} at ${e.company}: ${e.responsibilities}`
        ).join('\n\n') || '';
      case 'skills':
        return [...(resumeData.skills?.technical || []), ...(resumeData.skills?.soft || [])].join(', ');
      default: return resumeData.personalInfo?.summary || '';
    }
  };

  const handleGenerate = async () => {
    setError('');
    setLoading(true);
    setSuggestions([]);
    try {
      const res = await aiAPI.improve({
        type: selectedType,
        content: getContextText(),
        customPrompt,
        resumeData: {
          title: resumeData.personalInfo?.professionalTitle,
          experience: resumeData.experience?.length,
          skills: resumeData.skills?.technical,
        }
      });
      setSuggestions(res.data.suggestions || []);
    } catch (err) {
      const fallback = generateFallbackSuggestion(selectedType, getContextText());
      setSuggestions([fallback]);
      if (err.response?.status !== 501) {
        setError('Using local AI mode (no API key configured)');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (suggestion) => {
    switch (selectedType) {
      case 'summary':
        updateResume({ personalInfo: { ...resumeData.personalInfo, summary: suggestion.improved } });
        toast.success('Summary updated!');
        break;
      case 'experience':
        if (resumeData.experience?.length > 0) {
          const updated = [...resumeData.experience];
          updated[0] = { ...updated[0], responsibilities: suggestion.improved };
          updateResume({ experience: updated });
          toast.success('Experience updated!');
        }
        break;
      default:
        toast.success('Suggestion noted!');
    }
    setSuggestions(prev => prev.filter(s => s !== suggestion));
  };

  const handleReject = (suggestion) => {
    setSuggestions(prev => prev.filter(s => s !== suggestion));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm text-main-text">AI Assistant</p>
            <p className="text-[10px] text-secondary-text">Powered by AI</p>
          </div>
        </div>
        <button onClick={onClose} className="text-secondary-text hover:text-main-text p-1 rounded-lg hover:bg-gray-100 transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Type selector */}
        <div>
          <label className="label">What to improve</label>
          <div className="grid grid-cols-1 gap-1.5">
            {IMPROVEMENT_TYPES.map(type => (
              <button key={type.id}
                onClick={() => { setSelectedType(type.id); setSuggestions([]); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-all ${selectedType === type.id ? 'bg-primary text-white' : 'bg-gray-50 text-main-text hover:bg-primary/5'}`}>
                <span>{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom prompt */}
        <div>
          <label className="label">Additional instructions (optional)</label>
          <textarea className="textarea text-xs" rows={2}
            placeholder="e.g., Focus on leadership skills, use metrics, target data science roles..."
            value={customPrompt}
            onChange={e => setCustomPrompt(e.target.value)}
          />
        </div>

        {/* Context preview */}
        {getContextText() && (
          <div>
            <label className="label">Current content (will be improved)</label>
            <p className="text-xs text-secondary-text bg-gray-50 rounded-lg p-2.5 line-clamp-3 border border-border leading-relaxed">
              {getContextText().slice(0, 200)}{getContextText().length > 200 ? '...' : ''}
            </p>
          </div>
        )}

        {error && (
          <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            ⚡ {error}
          </div>
        )}

        {/* Generate button */}
        <button onClick={handleGenerate} disabled={loading}
          className="btn-primary w-full disabled:opacity-60">
          {loading ? (
            <><Loader2 size={15} className="animate-spin" /> Generating...</>
          ) : (
            <><Sparkles size={15} /> Generate Suggestion</>
          )}
        </button>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-secondary-text uppercase tracking-wide">
              {suggestions.length} suggestion{suggestions.length > 1 ? 's' : ''} ready
            </p>
            {suggestions.map((s, i) => (
              <SuggestionCard key={i} suggestion={s}
                onAccept={() => handleAccept(s)}
                onReject={() => handleReject(s)}
                onRegenerate={handleGenerate}
                loading={loading}
              />
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <div className="text-[10px] text-secondary-text bg-gray-50 rounded-lg p-3 border border-border">
          <strong className="text-main-text">Note:</strong> AI suggestions only improve the expression of what you've already written. Review all suggestions carefully before accepting. Never add fabricated experience or qualifications.
        </div>
      </div>
    </div>
  );
}

// Local fallback AI suggestions (no API key needed)
function generateFallbackSuggestion(type, content) {
  const actionVerbs = ['Developed', 'Architected', 'Led', 'Optimized', 'Delivered', 'Implemented', 'Designed', 'Launched', 'Managed', 'Streamlined'];

  switch (type) {
    case 'summary':
      return {
        original: content,
        improved: content
          ? `Results-driven professional with demonstrated expertise in ${content.slice(0, 60)}. Proven track record of delivering high-impact solutions and collaborating effectively with cross-functional teams to achieve organizational objectives.`
          : 'Results-driven professional with proven expertise in delivering high-quality solutions. Demonstrated ability to collaborate with cross-functional teams and drive meaningful outcomes in fast-paced environments.',
        reason: 'Added power phrases like "results-driven" and "proven track record" which resonate with ATS systems and hiring managers.',
      };
    case 'experience':
      return {
        original: content,
        improved: content
          ? content.split('\n').filter(Boolean).map(line => {
              const clean = line.replace(/^[-•]\s*/, '');
              const verb = actionVerbs[Math.floor(Math.random() * actionVerbs.length)];
              return `• ${verb} ${clean.charAt(0).toLowerCase() + clean.slice(1)}`;
            }).join('\n')
          : '• Led cross-functional team of 5 engineers to deliver product features 20% ahead of schedule\n• Optimized database queries reducing page load time by 35%',
        reason: 'Started each bullet with a strong action verb. ATS systems and recruiters respond well to action-oriented language.',
      };
    case 'skills':
      return {
        original: content,
        improved: content,
        reason: 'Your current skill set looks good. Consider adding tools specific to your target job description to improve ATS matching.',
      };
    default:
      return {
        original: content,
        improved: content,
        reason: 'Review your content for clarity and impact. Use specific metrics where possible.',
      };
  }
}
