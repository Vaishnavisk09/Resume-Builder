import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus, FileText, TrendingUp, Download, Sparkles,
  BarChart2, Clock, ArrowRight, ChevronRight,
  Target, Zap, Award, BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { resumeAPI } from '../../services/api';
import { timeAgo, getScoreColor, calculateCompletion } from '../../utils/helpers';
import toast from 'react-hot-toast';
import NewResumeModal from '../../components/NewResumeModal';

const StatCard = ({ icon: Icon, label, value, color, trend }) => (
  <div className="card p-5 hover:shadow-card-hover transition-all duration-300">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center`} style={{ background: `${color}15` }}>
        <Icon size={20} style={{ color }} />
      </div>
      {trend && <span className="text-xs text-green-500 font-medium bg-green-50 px-2 py-0.5 rounded-full">{trend}</span>}
    </div>
    <p className="text-2xl font-bold text-main-text mb-1">{value}</p>
    <p className="text-secondary-text text-sm">{label}</p>
  </div>
);

const ResumeCard = ({ resume, onDelete, onDuplicate }) => {
  const completion = calculateCompletion(resume);
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="card p-5 hover:shadow-card-hover transition-all duration-300 group">
      {/* Mini preview */}
      <div className="aspect-[3/4] bg-gradient-to-br from-primary/5 to-lavender rounded-lg mb-4 overflow-hidden relative
        flex items-center justify-center border border-border">
        <div className="w-full h-full p-3">
          <div className="h-3 bg-primary/20 rounded w-3/4 mb-2" />
          <div className="h-2 bg-gray-100 rounded w-1/2 mb-3" />
          <div className="space-y-1.5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-1.5 bg-gray-100 rounded" style={{ width: `${70 + (i % 3) * 10}%` }} />
            ))}
          </div>
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-navy/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button onClick={() => navigate(`/builder/${resume._id}`)}
            className="bg-white text-main-text text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-colors">
            Edit
          </button>
          <button onClick={() => onDuplicate(resume._id)}
            className="bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-white/30 transition-colors">
            Duplicate
          </button>
        </div>
      </div>

      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-main-text text-sm truncate">{resume.title || 'Untitled Resume'}</h3>
          <p className="text-xs text-secondary-text mt-0.5 capitalize">{resume.selectedTemplate || 'modern'} template</p>
        </div>
        {resume.atsScore && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ml-2"
            style={{ color: getScoreColor(resume.atsScore), background: `${getScoreColor(resume.atsScore)}15` }}>
            {resume.atsScore}%
          </span>
        )}
      </div>

      {/* Completion bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-secondary-text">Completion</span>
          <span className="text-xs font-semibold text-main-text">{completion}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${completion}%` }} />
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <span className="text-xs text-secondary-text flex items-center gap-1">
          <Clock size={11} />
          {timeAgo(resume.updatedAt)}
        </span>
        <div className="flex items-center gap-1">
          <button onClick={() => navigate(`/analyzer/${resume._id}`)}
            className="text-xs text-secondary-text hover:text-primary p-1 rounded hover:bg-primary/5 transition-colors" title="Analyze ATS">
            <BarChart2 size={14} />
          </button>
          <button onClick={() => onDelete(resume._id)}
            className="text-xs text-secondary-text hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors" title="Delete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ onNew }) => {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <FileText className="w-10 h-10 text-primary" />
      </div>
      <h3 className="text-xl font-bold text-main-text mb-3">No resumes yet</h3>
      <p className="text-secondary-text text-sm mb-8 max-w-xs leading-relaxed">
        Create your first resume and let AI help you craft the perfect document for your dream job.
      </p>
      <button onClick={onNew} className="btn-primary">
        <Plus size={18} /> Create My First Resume
      </button>
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, avgScore: 0, suggestions: 0, downloads: 0 });
  const [showNewModal, setShowNewModal] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const res = await resumeAPI.getAll();
      const data = res.data.resumes || [];
      setResumes(data);
      const scored = data.filter(r => r.atsScore);
      setStats({
        total: data.length,
        avgScore: scored.length ? Math.round(scored.reduce((s, r) => s + r.atsScore, 0) / scored.length) : 0,
        suggestions: data.reduce((s, r) => s + (r.aiSuggestionsApplied || 0), 0),
        downloads: data.reduce((s, r) => s + (r.downloadCount || 0), 0),
      });
    } catch (err) {
      // Silently handle - user may just have no resumes
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resume? This cannot be undone.')) return;
    try {
      await resumeAPI.delete(id);
      setResumes(prev => prev.filter(r => r._id !== id));
      toast.success('Resume deleted');
    } catch {
      toast.error('Could not delete resume');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await resumeAPI.duplicate(id);
      setResumes(prev => [res.data.resume, ...prev]);
      toast.success('Resume duplicated');
    } catch {
      toast.error('Could not duplicate resume');
    }
  };

  const firstName = user?.name?.split(' ')[0] || 'there';

  const quickActions = [
    { icon: Plus, label: 'New Resume', desc: 'Start from scratch', color: '#7155E8', action: () => setShowNewModal(true) },
    { icon: BarChart2, label: 'ATS Analyzer', desc: 'Score your resume', color: '#0891b2', path: '/analyzer' },
    { icon: Target, label: 'Job Matcher', desc: 'Match to job posting', color: '#059669', path: '/job-matcher' },
    { icon: Award, label: 'Templates', desc: 'Browse designs', color: '#f59e0b', path: '/templates' },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-main-text">
            Welcome back, <span className="text-primary">{firstName}!</span>
          </h1>
          <p className="text-secondary-text mt-1">Your career journey starts with a stronger resume.</p>
        </div>
        <button id="dashboard-new-resume-btn" onClick={() => setShowNewModal(true)} className="btn-primary whitespace-nowrap">
          <Plus size={18} />
          New Resume
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Total Resumes" value={loading ? '—' : stats.total} color="#7155E8" />
        <StatCard icon={TrendingUp} label="Avg. ATS Score" value={loading ? '—' : stats.avgScore ? `${stats.avgScore}%` : 'N/A'} color="#0891b2" />
        <StatCard icon={Sparkles} label="AI Suggestions Applied" value={loading ? '—' : stats.suggestions} color="#059669" />
        <StatCard icon={Download} label="Total Downloads" value={loading ? '—' : stats.downloads} color="#f59e0b" />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="section-title mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map(({ icon: Icon, label, desc, color, path, action }) => (
            <button key={label} onClick={() => action ? action() : navigate(path)}
              className="card p-4 text-left hover:shadow-card-hover transition-all duration-300 group">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                style={{ background: `${color}15` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <p className="font-semibold text-main-text text-sm">{label}</p>
              <p className="text-secondary-text text-xs mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Resumes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Recent Resumes</h2>
          {resumes.length > 0 && (
            <Link to="/resumes" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
              View all <ChevronRight size={14} />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card p-5">
                <div className="skeleton aspect-[3/4] rounded-lg mb-4" />
                <div className="skeleton h-4 w-3/4 rounded mb-2" />
                <div className="skeleton h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : resumes.length === 0 ? (
          <div className="card">
            <EmptyState onNew={() => setShowNewModal(true)} />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {resumes.slice(0, 4).map(resume => (
              <ResumeCard key={resume._id} resume={resume} onDelete={handleDelete} onDuplicate={handleDuplicate} />
            ))}
          </div>
        )}
      </div>

      {/* AI Recommendations */}
      <div>
        <h2 className="section-title mb-4">AI Recommendations</h2>
        <div className="card p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              <Sparkles size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-main-text mb-1">Strengthen Your Resume Impact</h3>
              <p className="text-secondary-text text-sm leading-relaxed mb-4">
                Based on industry best practices, here are high-impact improvements for your resume:
              </p>
              <div className="space-y-3">
                {[
                  { tip: 'Add quantified metrics to your experience bullet points (e.g., "increased revenue by 25%")', priority: 'High' },
                  { tip: 'Include a professional summary tailored to each job application', priority: 'High' },
                  { tip: 'List 8–12 relevant technical skills matching your target roles', priority: 'Medium' },
                  { tip: 'Add project links or GitHub URLs to demonstrate practical skills', priority: 'Medium' },
                ].map(({ tip, priority }) => (
                  <div key={tip} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                      {priority}
                    </span>
                    <p className="text-sm text-main-text">{tip}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowNewModal(true)} className="btn-primary mt-4 text-sm py-2">
                Apply Suggestions <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showNewModal && <NewResumeModal onClose={() => setShowNewModal(false)} />}
    </div>
  );
}
