import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Copy, Trash2, Download, BarChart2, Clock, Grid, List } from 'lucide-react';
import { resumeAPI } from '../../services/api';
import { timeAgo, calculateCompletion, getScoreColor } from '../../utils/helpers';
import { useResumeExport } from '../../components/templates/ResumePreview';
import toast from 'react-hot-toast';
import NewResumeModal from '../../components/NewResumeModal';

const TEMPLATES = ['all', 'modern', 'minimalist', 'corporate', 'creative', 'student'];

export default function MyResumesPage() {
  const navigate = useNavigate();
  const { downloadPDF } = useResumeExport();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTemplate, setFilterTemplate] = useState('all');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [viewMode, setViewMode] = useState('grid');
  const [showNewModal, setShowNewModal] = useState(false);

  useEffect(() => { fetchResumes(); }, []);

  const fetchResumes = async () => {
    try {
      const res = await resumeAPI.getAll();
      setResumes(res.data.resumes || []);
    } catch { toast.error('Could not load resumes'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resume? This cannot be undone.')) return;
    try {
      await resumeAPI.delete(id);
      setResumes(prev => prev.filter(r => r._id !== id));
      toast.success('Resume deleted');
    } catch { toast.error('Delete failed'); }
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await resumeAPI.duplicate(id);
      setResumes(prev => [res.data.resume, ...prev]);
      toast.success('Resume duplicated!');
    } catch { toast.error('Duplicate failed'); }
  };

  const handleDownload = async (resume) => {
    await downloadPDF(resume);
  };

  const filtered = resumes
    .filter(r => {
      if (search && !r.title?.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterTemplate !== 'all' && r.selectedTemplate !== filterTemplate) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'updatedAt') return new Date(b.updatedAt) - new Date(a.updatedAt);
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'score') return (b.atsScore || 0) - (a.atsScore || 0);
      return 0;
    });

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">My Resumes</h1>
          <p className="text-secondary-text mt-1">{resumes.length} resume{resumes.length !== 1 ? 's' : ''} in your library</p>
        </div>
        <button id="my-resumes-new-btn" onClick={() => setShowNewModal(true)} className="btn-primary whitespace-nowrap">
          <Plus size={18} /> New Resume
        </button>
      </div>

      {/* Filters bar */}
      <div className="card p-4 mb-6 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" />
          <input className="input pl-9 py-2" placeholder="Search resumes..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-secondary-text" />
          <select className="input py-2 w-36" value={filterTemplate} onChange={e => setFilterTemplate(e.target.value)}>
            {TEMPLATES.map(t => <option key={t} value={t}>{t === 'all' ? 'All Templates' : t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>
        <select className="input py-2 w-40" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="updatedAt">Recently Updated</option>
          <option value="title">Name (A-Z)</option>
          <option value="score">ATS Score</option>
        </select>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-secondary-text'}`}>
            <Grid size={15} />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-secondary-text'}`}>
            <List size={15} />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-3'}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-5">
              <div className="skeleton aspect-[3/4] rounded-lg mb-4" />
              <div className="skeleton h-4 w-3/4 rounded mb-2" />
              <div className="skeleton h-3 w-1/2 rounded" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-primary" />
          </div>
          <p className="font-semibold text-main-text mb-2">
            {resumes.length === 0 ? 'No resumes yet' : 'No matching resumes'}
          </p>
          <p className="text-secondary-text text-sm mb-6 max-w-xs mx-auto">
            {resumes.length === 0 ? 'Create your first resume to get started.' : 'Try adjusting your search or filters.'}
          </p>
          {resumes.length === 0 && (
            <button onClick={() => setShowNewModal(true)} className="btn-primary mx-auto">
              <Plus size={16} /> Create Resume
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(resume => (
            <div key={resume._id} className="card group hover:shadow-card-hover transition-all duration-300">
              {/* Mini preview */}
              <div className="aspect-[3/4] bg-gradient-to-br from-primary/5 to-lavender rounded-t-xl overflow-hidden relative
                flex items-start justify-center p-3 border-b border-border">
                <div className="w-full">
                  <div className="h-3 bg-primary/30 rounded w-3/4 mb-2" />
                  <div className="h-2 bg-gray-100 rounded w-1/2 mb-3" />
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="h-1.5 bg-gray-100 rounded mb-1.5" style={{ width: `${65 + (i % 4) * 9}%` }} />
                  ))}
                </div>
                {/* Actions overlay */}
                <div className="absolute inset-0 bg-navy/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => navigate(`/builder/${resume._id}`)}
                    className="bg-white text-main-text text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-colors">Edit</button>
                  <button onClick={() => handleDownload(resume)}
                    className="bg-white/20 text-white text-xs font-semibold px-2 py-1.5 rounded-lg hover:bg-white/30 transition-colors"><Download size={13} /></button>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-main-text truncate">{resume.title || 'Untitled'}</h3>
                    <p className="text-xs text-secondary-text capitalize mt-0.5">{resume.selectedTemplate || 'modern'}</p>
                  </div>
                  {resume.atsScore && (
                    <span className="text-xs font-bold ml-2" style={{ color: getScoreColor(resume.atsScore) }}>
                      {resume.atsScore}%
                    </span>
                  )}
                </div>

                {/* Completion */}
                <div className="mb-3">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${calculateCompletion(resume)}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-secondary-text flex items-center gap-1">
                    <Clock size={11} /> {timeAgo(resume.updatedAt)}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => navigate(`/analyzer/${resume._id}`)} title="ATS Analysis" className="p-1 text-secondary-text hover:text-primary rounded transition-colors"><BarChart2 size={13} /></button>
                    <button onClick={() => handleDuplicate(resume._id)} title="Duplicate" className="p-1 text-secondary-text hover:text-primary rounded transition-colors"><Copy size={13} /></button>
                    <button onClick={() => handleDelete(resume._id)} title="Delete" className="p-1 text-secondary-text hover:text-red-500 rounded transition-colors"><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(resume => (
            <div key={resume._id} className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-all group">
              <div className="w-10 h-12 bg-gradient-to-br from-primary/10 to-lavender rounded-lg flex-shrink-0 flex items-center justify-center border border-border">
                <div className="space-y-1">
                  {[...Array(3)].map((_, i) => <div key={i} className="h-1 bg-gray-200 rounded w-6" />)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-main-text truncate">{resume.title || 'Untitled'}</h3>
                <p className="text-xs text-secondary-text capitalize">{resume.selectedTemplate || 'modern'} · Updated {timeAgo(resume.updatedAt)}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {resume.atsScore && (
                  <span className="badge text-xs font-bold px-2 py-1 rounded-full"
                    style={{ color: getScoreColor(resume.atsScore), background: `${getScoreColor(resume.atsScore)}15` }}>
                    ATS: {resume.atsScore}%
                  </span>
                )}
                <button onClick={() => navigate(`/builder/${resume._id}`)} className="btn-secondary text-xs py-1.5 px-3">Edit</button>
                <button onClick={() => handleDownload(resume)} className="p-2 text-secondary-text hover:text-primary rounded-lg hover:bg-primary/5 transition-colors"><Download size={14} /></button>
                <button onClick={() => navigate(`/analyzer/${resume._id}`)} className="p-2 text-secondary-text hover:text-primary rounded-lg hover:bg-primary/5 transition-colors"><BarChart2 size={14} /></button>
                <button onClick={() => handleDuplicate(resume._id)} className="p-2 text-secondary-text hover:text-primary rounded-lg hover:bg-primary/5 transition-colors"><Copy size={14} /></button>
                <button onClick={() => handleDelete(resume._id)} className="p-2 text-secondary-text hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showNewModal && <NewResumeModal onClose={() => setShowNewModal(false)} />}
    </div>
  );
}
