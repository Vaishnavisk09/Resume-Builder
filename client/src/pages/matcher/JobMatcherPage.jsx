import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Loader2, ChevronRight, AlertTriangle, CheckCircle, Info, BarChart2 } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { resumeAPI, aiAPI } from '../../services/api';
import { getScoreColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function JobMatcherPage() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingResumes, setLoadingResumes] = useState(true);

  useEffect(() => {
    resumeAPI.getAll().then(res => {
      const list = res.data.resumes || [];
      setResumes(list);
      if (list[0]) setSelectedId(list[0]._id);
    }).finally(() => setLoadingResumes(false));
  }, []);

  const handleMatch = async () => {
    if (!selectedId) { toast.error('Select a resume first'); return; }
    if (jobDescription.trim().length < 50) { toast.error('Please paste a complete job description (min 50 characters)'); return; }
    setLoading(true);
    setResult(null);
    try {
      const res = await aiAPI.matchJob({ resumeId: selectedId, jobDescription });
      setResult(res.data.result);
    } catch {
      const resume = resumes.find(r => r._id === selectedId);
      if (resume) setResult(generateLocalMatch(resume, jobDescription));
      else toast.error('Could not analyze. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = result ? [
    { name: 'Overall Match', value: result.overallMatch },
    { name: 'Skills Match', value: result.skillsMatch },
    { name: 'Experience Fit', value: result.experienceFit },
    { name: 'Keywords', value: result.keywordMatch },
  ] : [];

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Job Description Matcher</h1>
        <p className="text-secondary-text mt-1">Paste any job description and see how well your resume matches it.</p>
        <div className="flex items-start gap-2 mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
          <Info size={14} className="flex-shrink-0 mt-0.5" />
          Only skills and experience present in your resume are analyzed. We never fabricate qualifications.
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input panel */}
        <div className="card p-5 space-y-4">
          <h2 className="section-title">Analysis Setup</h2>
          <div>
            <label className="label">Select Your Resume</label>
            <select className="input" value={selectedId} onChange={e => setSelectedId(e.target.value)}>
              {loadingResumes ? <option>Loading...</option> : resumes.map(r => <option key={r._id} value={r._id}>{r.title}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Paste Job Description *</label>
            <textarea className="textarea" rows={12}
              placeholder="Paste the full job description here...&#10;&#10;Example:&#10;We are looking for a Senior Software Engineer to join our team. The ideal candidate has 3+ years of experience with React, Node.js, and TypeScript. You will be responsible for..."
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
            />
            <p className="text-xs text-secondary-text mt-1">{jobDescription.length} characters · Min 50 required</p>
          </div>
          <button onClick={handleMatch} disabled={loading || !selectedId || jobDescription.length < 50}
            className="btn-primary w-full disabled:opacity-60">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Analyzing match...</> : <><Target size={16} /> Analyze Match</>}
          </button>
        </div>

        {/* Results panel */}
        <div className="space-y-4">
          {!result && !loading && (
            <div className="card p-12 text-center h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <p className="font-semibold text-main-text mb-2">Ready to Match</p>
              <p className="text-secondary-text text-sm max-w-xs">Select your resume and paste a job description to see how well you match</p>
            </div>
          )}

          {loading && (
            <div className="card p-12 text-center">
              <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
              <p className="font-semibold text-main-text">Matching your profile...</p>
              <p className="text-secondary-text text-sm mt-1">Comparing skills, experience, and keywords</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-4 animate-fade-in">
              {/* Score card */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="section-title">Match Score</h2>
                  <span className="text-3xl font-black" style={{ color: getScoreColor(result.overallMatch) }}>
                    {result.overallMatch}%
                  </span>
                </div>
                <div className="space-y-3">
                  {chartData.map(({ name, value }) => (
                    <div key={name}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-secondary-text">{name}</span>
                        <span className="text-xs font-bold" style={{ color: getScoreColor(value) }}>{value}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${value}%`, background: getScoreColor(value) }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Matched skills */}
              {result.matchedSkills?.length > 0 && (
                <div className="card p-5">
                  <h3 className="text-sm font-bold text-green-600 flex items-center gap-1.5 mb-3">
                    <CheckCircle size={15} /> Matched Skills ({result.matchedSkills.length})
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {result.matchedSkills.map(s => <span key={s} className="badge badge-success">{s}</span>)}
                  </div>
                </div>
              )}

              {/* Missing skills */}
              {result.missingSkills?.length > 0 && (
                <div className="card p-5">
                  <h3 className="text-sm font-bold text-amber-600 flex items-center gap-1.5 mb-3">
                    <AlertTriangle size={15} /> Skills Gap ({result.missingSkills.length})
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {result.missingSkills.map(s => <span key={s} className="badge badge-warning">{s}</span>)}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {result.suggestions?.length > 0 && (
                <div className="card p-5">
                  <h3 className="section-title mb-3">How to Improve Your Match</h3>
                  <div className="space-y-2">
                    {result.suggestions.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-primary font-bold">{i + 1}.</span>
                        <p className="text-secondary-text">{s}</p>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => navigate(`/builder/${selectedId}`)} className="btn-primary mt-4 text-sm">
                    Update Resume <ChevronRight size={15} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function generateLocalMatch(resume, jd) {
  const jdLower = jd.toLowerCase();
  const techSkills = resume.skills?.technical || [];
  const matchedSkills = techSkills.filter(s => jdLower.includes(s.toLowerCase()));

  // Extract keywords from JD
  const commonTech = ['javascript', 'python', 'react', 'node.js', 'typescript', 'java', 'c++', 'sql', 'mongodb', 'docker', 'kubernetes', 'aws', 'git', 'rest api', 'graphql', 'redux', 'next.js', 'vue', 'angular'];
  const jdKeywords = commonTech.filter(k => jdLower.includes(k));
  const missingSkills = jdKeywords.filter(k => !techSkills.some(s => s.toLowerCase().includes(k))).slice(0, 8);

  const skillsMatch = jdKeywords.length > 0 ? Math.round((matchedSkills.length / Math.max(jdKeywords.length, 1)) * 100) : 50;
  const hasExp = (resume.experience?.length || 0) > 0;
  const hasSummary = !!resume.personalInfo?.summary;
  const overallMatch = Math.round(skillsMatch * 0.4 + (hasExp ? 70 : 30) * 0.3 + (hasSummary ? 75 : 40) * 0.3);

  return {
    overallMatch: Math.min(100, overallMatch),
    skillsMatch: Math.min(100, skillsMatch),
    experienceFit: hasExp ? 75 : 35,
    keywordMatch: jdKeywords.length > 0 ? Math.round((matchedSkills.length / jdKeywords.length) * 100) : 50,
    matchedSkills,
    missingSkills: missingSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
    suggestions: [
      ...(missingSkills.length > 0 ? [`Consider learning or highlighting: ${missingSkills.slice(0, 3).join(', ')}`] : []),
      'Tailor your professional summary to mirror language used in the job description.',
      'Quantify your achievements with numbers (e.g., "improved performance by 30%").',
      !hasSummary ? 'Add a professional summary targeting this role.' : null,
    ].filter(Boolean),
  };
}
