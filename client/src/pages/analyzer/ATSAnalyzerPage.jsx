import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BarChart2, CheckCircle, AlertTriangle, XCircle, ChevronRight, Loader2, RefreshCw, Info } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { resumeAPI, aiAPI } from '../../services/api';
import { getScoreColor, getScoreLabel } from '../../utils/helpers';
import toast from 'react-hot-toast';

const ScoreGauge = ({ score }) => {
  const color = getScoreColor(score);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-44 h-44">
        <svg className="w-full h-full" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r={radius} fill="none" stroke="#EBE9F2" strokeWidth="14" />
          <circle cx="80" cy="80" r={radius} fill="none" stroke={color} strokeWidth="14"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            strokeLinecap="round" className="score-ring transition-all duration-1000"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '80px 80px' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black" style={{ color }}>{score}</span>
          <span className="text-xs text-secondary-text font-semibold">/ 100</span>
        </div>
      </div>
      <span className="text-sm font-bold mt-1" style={{ color }}>{getScoreLabel(score)}</span>
    </div>
  );
};

const CheckItem = ({ label, passed, details }) => (
  <div className={`flex items-start gap-3 p-3 rounded-lg ${passed ? 'bg-green-50' : 'bg-red-50'}`}>
    {passed
      ? <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
      : <XCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
    }
    <div>
      <p className={`text-sm font-semibold ${passed ? 'text-green-700' : 'text-red-600'}`}>{label}</p>
      {details && <p className="text-xs text-secondary-text mt-0.5">{details}</p>}
    </div>
  </div>
);

export default function ATSAnalyzerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [selectedId, setSelectedId] = useState(id || '');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingResumes, setLoadingResumes] = useState(true);

  useEffect(() => {
    resumeAPI.getAll().then(res => {
      setResumes(res.data.resumes || []);
      if (!selectedId && res.data.resumes?.[0]) setSelectedId(res.data.resumes[0]._id);
    }).finally(() => setLoadingResumes(false));
  }, []);

  useEffect(() => {
    if (id) { setSelectedId(id); }
  }, [id]);

  const runAnalysis = async () => {
    if (!selectedId) { toast.error('Please select a resume to analyze'); return; }
    setLoading(true);
    setAnalysis(null);
    try {
      const res = await aiAPI.analyze(selectedId);
      setAnalysis(res.data.analysis);
    } catch {
      // Fallback: analyze based on resume data
      const resume = resumes.find(r => r._id === selectedId);
      if (resume) setAnalysis(generateLocalAnalysis(resume));
      else toast.error('Could not analyze resume');
    } finally {
      setLoading(false);
    }
  };

  const sectionData = analysis?.sections ? Object.entries(analysis.sections).map(([name, data]) => ({
    name, score: data.score, fill: getScoreColor(data.score)
  })) : [];

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-title">ATS Resume Analyzer</h1>
        <p className="text-secondary-text mt-1">
          Get a transparent compatibility score and actionable improvement recommendations.
        </p>
        <div className="flex items-start gap-2 mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
          <Info size={14} className="flex-shrink-0 mt-0.5" />
          <span>ATS scores are estimates based on resume best practices, not a guarantee of actual ATS performance. Different companies use different ATS software with varying algorithms.</span>
        </div>
      </div>

      {/* Resume selector */}
      <div className="card p-5">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="label">Select Resume to Analyze</label>
            {loadingResumes ? (
              <div className="input flex items-center gap-2 text-secondary-text">
                <Loader2 size={14} className="animate-spin" /> Loading resumes...
              </div>
            ) : (
              <select className="input" value={selectedId} onChange={e => { setSelectedId(e.target.value); setAnalysis(null); }}>
                <option value="">Select a resume...</option>
                {resumes.map(r => <option key={r._id} value={r._id}>{r.title}</option>)}
              </select>
            )}
          </div>
          <div className="flex items-end gap-2">
            <button onClick={runAnalysis} disabled={loading || !selectedId}
              className="btn-primary disabled:opacity-60 whitespace-nowrap">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</> : <><BarChart2 size={16} /> Run Analysis</>}
            </button>
            {analysis && (
              <button onClick={runAnalysis} className="btn-secondary" title="Re-analyze">
                <RefreshCw size={16} />
              </button>
            )}
          </div>
        </div>

        {resumes.length === 0 && !loadingResumes && (
          <div className="mt-4 text-center py-6">
            <p className="text-secondary-text text-sm mb-3">No resumes found. Create a resume first.</p>
            <button onClick={() => navigate('/builder')} className="btn-primary text-sm">Create Resume</button>
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="card p-12 text-center animate-fade-in">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
          <p className="font-semibold text-main-text">Analyzing your resume...</p>
          <p className="text-secondary-text text-sm mt-1">Checking ATS compatibility, keywords, and structure</p>
        </div>
      )}

      {/* Results */}
      {analysis && !loading && (
        <div className="space-y-6 animate-fade-in">
          {/* Score overview */}
          <div className="card p-6">
            <div className="grid md:grid-cols-3 gap-6 items-center">
              <div className="flex justify-center">
                <ScoreGauge score={analysis.overallScore} />
              </div>
              <div className="md:col-span-2">
                <h2 className="text-lg font-bold text-main-text mb-4">Analysis Overview</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Contact Info', value: analysis.checks?.contactInfo },
                    { label: 'Section Structure', value: analysis.checks?.sectionStructure },
                    { label: 'Keyword Density', value: analysis.checks?.keywordDensity },
                    { label: 'Work Experience', value: analysis.checks?.hasExperience },
                    { label: 'Education Listed', value: analysis.checks?.hasEducation },
                    { label: 'Skills Section', value: analysis.checks?.hasSkills },
                    { label: 'No Vague Bullets', value: analysis.checks?.noVagueBullets },
                    { label: 'Proper Length', value: analysis.checks?.properLength },
                  ].map(({ label, value }) => (
                    <CheckItem key={label} label={label} passed={value} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section scores */}
          {analysis.sections && (
            <div className="card p-6">
              <h2 className="section-title mb-5">Section-by-Section Analysis</h2>
              <div className="space-y-3">
                {Object.entries(analysis.sections).map(([name, data]) => (
                  <div key={name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-main-text capitalize">{name}</span>
                      <span className="text-sm font-bold" style={{ color: getScoreColor(data.score) }}>{data.score}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill transition-all duration-700"
                        style={{ width: `${data.score}%`, background: getScoreColor(data.score) }} />
                    </div>
                    {data.feedback && <p className="text-xs text-secondary-text mt-1">{data.feedback}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Keywords */}
          {analysis.keywords && (
            <div className="card p-6">
              <h2 className="section-title mb-4">Keyword Analysis</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {analysis.keywords.present?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <CheckCircle size={13} /> Found Keywords ({analysis.keywords.present.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.keywords.present.map(kw => (
                        <span key={kw} className="badge badge-success">{kw}</span>
                      ))}
                    </div>
                  </div>
                )}
                {analysis.keywords.missing?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <AlertTriangle size={13} /> Consider Adding
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.keywords.missing.map(kw => (
                        <span key={kw} className="badge badge-warning">{kw}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {analysis.recommendations?.length > 0 && (
            <div className="card p-6">
              <h2 className="section-title mb-4">Improvement Recommendations</h2>
              <div className="space-y-3">
                {analysis.recommendations.map((rec, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${rec.priority === 'high' ? 'bg-red-50 border border-red-100' : 'bg-amber-50 border border-amber-100'}`}>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${rec.priority === 'high' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                      {rec.priority === 'high' ? 'High' : 'Medium'}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-main-text">{rec.title}</p>
                      <p className="text-xs text-secondary-text mt-0.5">{rec.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="card p-6 bg-primary/5 border-primary/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-bold text-main-text">Ready to improve your resume?</p>
                <p className="text-secondary-text text-sm mt-0.5">Apply the AI suggestions directly in the builder.</p>
              </div>
              <button onClick={() => navigate(`/builder/${selectedId}`)} className="btn-primary whitespace-nowrap">
                Edit Resume <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Local analysis fallback
function generateLocalAnalysis(resume) {
  const data = resume;
  const hasName = !!data.personalInfo?.fullName;
  const hasEmail = !!data.personalInfo?.email;
  const hasPhone = !!data.personalInfo?.phone;
  const hasLocation = !!data.personalInfo?.location;
  const hasLinkedIn = !!data.personalInfo?.linkedin;
  const hasSummary = !!data.personalInfo?.summary;
  const hasExperience = (data.experience?.length || 0) > 0;
  const hasEducation = (data.education?.length || 0) > 0;
  const hasTechSkills = (data.skills?.technical?.length || 0) > 0;
  const hasProjects = (data.projects?.length || 0) > 0;

  const expText = data.experience?.map(e => e.responsibilities || '').join(' ') || '';
  const hasVagueBullets = /\b(worked on|helped with|assisted in|did some|was involved in)\b/i.test(expText);
  const hasActionVerbs = /\b(led|developed|built|designed|managed|created|implemented|optimized|delivered)\b/i.test(expText);

  const contactScore = [hasName, hasEmail, hasPhone, hasLocation, hasLinkedIn].filter(Boolean).length * 20;
  const contentScore = [hasSummary, hasExperience, hasEducation, hasTechSkills].filter(Boolean).length * 25;
  const qualityScore = hasActionVerbs ? 80 : 40;

  const overallScore = Math.round((contactScore * 0.25 + contentScore * 0.5 + qualityScore * 0.25));

  const technicalKeywords = data.skills?.technical || [];
  const commonKeywords = ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Git', 'Docker', 'AWS', 'Agile', 'REST API'];
  const present = commonKeywords.filter(k => technicalKeywords.includes(k));
  const missing = commonKeywords.filter(k => !technicalKeywords.includes(k)).slice(0, 5);

  const recommendations = [];
  if (!hasSummary) recommendations.push({ priority: 'high', title: 'Add a Professional Summary', description: 'A concise summary at the top of your resume helps ATS systems and recruiters quickly understand your profile.' });
  if (!hasActionVerbs) recommendations.push({ priority: 'high', title: 'Use Strong Action Verbs', description: 'Start each bullet point with powerful action verbs like "Led", "Developed", "Optimized", or "Delivered".' });
  if (hasVagueBullets) recommendations.push({ priority: 'high', title: 'Remove Vague Language', description: 'Replace phrases like "worked on" or "helped with" with specific accomplishments and quantified results.' });
  if (!hasLinkedIn) recommendations.push({ priority: 'medium', title: 'Add LinkedIn Profile', description: 'Including your LinkedIn URL makes it easy for recruiters to verify and learn more about you.' });
  if (!hasProjects) recommendations.push({ priority: 'medium', title: 'Add Projects Section', description: 'Projects demonstrate practical skills, especially important for freshers or career changers.' });

  return {
    overallScore,
    checks: {
      contactInfo: hasName && hasEmail && hasPhone,
      sectionStructure: hasExperience || hasEducation,
      keywordDensity: technicalKeywords.length >= 5,
      hasExperience,
      hasEducation,
      hasSkills: hasTechSkills,
      noVagueBullets: !hasVagueBullets,
      properLength: true,
    },
    sections: {
      'Contact Information': { score: contactScore, feedback: `${[hasName, hasEmail, hasPhone, hasLocation, hasLinkedIn].filter(Boolean).length}/5 contact fields filled` },
      'Professional Summary': { score: hasSummary ? 90 : 0, feedback: hasSummary ? 'Summary present' : 'No summary found. Add a 2-3 sentence professional summary.' },
      'Work Experience': { score: hasExperience ? (hasActionVerbs ? 85 : 50) : 0, feedback: hasExperience ? (hasActionVerbs ? 'Good use of action verbs' : 'Consider adding action verbs') : 'No work experience found.' },
      'Education': { score: hasEducation ? 90 : 20, feedback: hasEducation ? 'Education section present' : 'Add your educational background.' },
      'Skills': { score: hasTechSkills ? Math.min(100, technicalKeywords.length * 8) : 0, feedback: `${technicalKeywords.length} technical skills listed` },
      'Projects': { score: hasProjects ? 85 : 30, feedback: hasProjects ? 'Projects section present' : 'Consider adding relevant projects.' },
    },
    keywords: { present, missing },
    recommendations,
  };
}
