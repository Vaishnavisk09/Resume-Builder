import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Save, Undo, Redo, Download, Eye, EyeOff, ChevronLeft,
  Layout, Sparkles, Plus, Minus, ZoomIn, ZoomOut, Check,
  Loader2, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useResume } from '../../context/ResumeContext';
import { resumeAPI } from '../../services/api';
import { ResumePreviewPanel, useResumeExport } from '../../components/templates/ResumePreview';
import { TEMPLATES } from '../../components/templates/ResumeTemplates';
import { calculateCompletion, debounce } from '../../utils/helpers';
import PersonalInfoSection from './sections/PersonalInfoSection';
import ExperienceSection from './sections/ExperienceSection';
import EducationSection from './sections/EducationSection';
import SkillsSection from './sections/SkillsSection';
import ProjectsSection from './sections/ProjectsSection';
import CertificationsSection from './sections/CertificationsSection';
import AchievementsSection from './sections/AchievementsSection';
import LanguagesSection from './sections/LanguagesSection';
import AIAssistantPanel from './AIAssistantPanel';

const SECTIONS = [
  { id: 'personal', label: 'Personal Info', icon: '👤' },
  { id: 'experience', label: 'Experience', icon: '💼' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'skills', label: 'Skills', icon: '⚡' },
  { id: 'projects', label: 'Projects', icon: '🚀' },
  { id: 'certifications', label: 'Certifications', icon: '📜' },
  { id: 'achievements', label: 'Achievements', icon: '🏆' },
  { id: 'languages', label: 'Languages', icon: '🌐' },
];

export default function ResumeBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { resumeData, updateResume, loadResume, undo, redo, canUndo, canRedo, isDirty, setIsDirty, isSaving, setIsSaving } = useResume();
  const { downloadPDF } = useResumeExport();

  const [resumeId, setResumeId] = useState(id || null);
  const [activeSection, setActiveSection] = useState('personal');
  const [previewScale, setPreviewScale] = useState(0.62);
  const [showPreview, setShowPreview] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'unsaved' | 'saving'

  // Load existing resume
  useEffect(() => {
    if (id) {
      resumeAPI.getById(id)
        .then(res => {
          loadResume(res.data.resume);
          setResumeId(id);
        })
        .catch(() => {
          toast.error('Could not load resume');
          navigate('/resumes');
        })
        .finally(() => setInitialLoading(false));
    }
  }, [id]);

  // Load prefilled data from upload modal
  useEffect(() => {
    if (!id && location.state?.prefill) {
      loadResume({ ...location.state.prefill });
      // Clear location state so refreshing doesn't re-load
      window.history.replaceState({}, document.title);
    }
  }, []);

  // Track dirty state
  useEffect(() => {
    if (isDirty) setSaveStatus('unsaved');
  }, [isDirty]);

  // Autosave debounced
  const autosave = useCallback(
    debounce(async (data, rid) => {
      if (!rid) return;
      try {
        setSaveStatus('saving');
        await resumeAPI.update(rid, data);
        setSaveStatus('saved');
        setIsDirty(false);
      } catch {
        setSaveStatus('unsaved');
      }
    }, 3000),
    []
  );

  useEffect(() => {
    if (isDirty && resumeId) {
      autosave(resumeData, resumeId);
    }
  }, [resumeData, isDirty, resumeId]);

  const handleManualSave = async () => {
    setSaveStatus('saving');
    try {
      if (resumeId) {
        await resumeAPI.update(resumeId, resumeData);
      } else {
        const res = await resumeAPI.create(resumeData);
        setResumeId(res.data.resume._id);
        navigate(`/builder/${res.data.resume._id}`, { replace: true });
      }
      setSaveStatus('saved');
      setIsDirty(false);
      toast.success('Resume saved!');
    } catch {
      setSaveStatus('unsaved');
      toast.error('Save failed. Please try again.');
    }
  };

  const handleDownload = async () => {
    // Save first if unsaved
    if (isDirty) await handleManualSave();
    await downloadPDF(resumeData);
    // Track download
    if (resumeId) {
      try { await resumeAPI.update(resumeId, { ...resumeData, downloadCount: (resumeData.downloadCount || 0) + 1 }); } catch {}
    }
  };

  const completion = calculateCompletion(resumeData);

  const renderSection = () => {
    switch (activeSection) {
      case 'personal': return <PersonalInfoSection />;
      case 'experience': return <ExperienceSection />;
      case 'education': return <EducationSection />;
      case 'skills': return <SkillsSection />;
      case 'projects': return <ProjectsSection />;
      case 'certifications': return <CertificationsSection />;
      case 'achievements': return <AchievementsSection />;
      case 'languages': return <LanguagesSection />;
      default: return <PersonalInfoSection />;
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-secondary-text text-sm">Loading resume...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Toolbar */}
      <div className="bg-white border-b border-border px-4 py-3 flex items-center gap-3 flex-wrap z-10 shadow-sm">
        {/* Back button */}
        <button onClick={() => navigate('/resumes')} className="btn-ghost p-2" title="Back to resumes">
          <ChevronLeft size={18} />
        </button>

        {/* Resume title */}
        <input
          type="text"
          value={resumeData.title || ''}
          onChange={e => updateResume({ title: e.target.value })}
          className="text-sm font-semibold text-main-text bg-transparent border-0 outline-none focus:bg-gray-50 px-2 py-1 rounded-lg transition-colors min-w-[160px] max-w-[240px]"
          placeholder="Resume title..."
        />

        {/* Save status */}
        <div className="flex items-center gap-1.5 text-xs">
          {saveStatus === 'saving' && (
            <span className="text-secondary-text flex items-center gap-1">
              <Loader2 size={12} className="animate-spin" /> Saving...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-green-500 flex items-center gap-1">
              <Check size={12} /> Saved
            </span>
          )}
          {saveStatus === 'unsaved' && (
            <span className="text-amber-500">● Unsaved</span>
          )}
        </div>

        {/* Completion badge */}
        <div className="flex items-center gap-1.5">
          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${completion}%` }} />
          </div>
          <span className="text-xs text-secondary-text">{completion}%</span>
        </div>

        <div className="flex-1" />

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button onClick={undo} disabled={!canUndo} className="p-2 text-secondary-text hover:text-main-text disabled:opacity-30 rounded-lg hover:bg-gray-100 transition-colors" title="Undo (Ctrl+Z)">
            <Undo size={16} />
          </button>
          <button onClick={redo} disabled={!canRedo} className="p-2 text-secondary-text hover:text-main-text disabled:opacity-30 rounded-lg hover:bg-gray-100 transition-colors" title="Redo">
            <Redo size={16} />
          </button>

          <div className="w-px h-6 bg-border" />

          <button onClick={() => setShowAI(!showAI)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${showAI ? 'bg-primary text-white' : 'text-secondary-text hover:text-primary hover:bg-primary/5'}`}>
            <Sparkles size={15} />
            <span className="hidden sm:inline">AI</span>
          </button>

          <button onClick={() => setShowTemplates(!showTemplates)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${showTemplates ? 'bg-primary text-white' : 'text-secondary-text hover:text-primary hover:bg-primary/5'}`}>
            <Layout size={15} />
            <span className="hidden sm:inline">Template</span>
          </button>

          <button onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-secondary-text hover:text-primary hover:bg-primary/5 transition-colors">
            {showPreview ? <EyeOff size={15} /> : <Eye size={15} />}
            <span className="hidden sm:inline">Preview</span>
          </button>

          <button onClick={handleManualSave}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-main-text hover:bg-gray-200 transition-colors">
            <Save size={15} />
            <span className="hidden sm:inline">Save</span>
          </button>

          <button onClick={handleDownload} className="btn-primary py-1.5 px-4 text-sm">
            <Download size={15} />
            <span className="hidden sm:inline">Download PDF</span>
          </button>
        </div>
      </div>

      {/* Template picker dropdown */}
      {showTemplates && (
        <div className="bg-white border-b border-border px-4 py-4 animate-slide-up">
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {Object.values(TEMPLATES).map(tmpl => (
              <button key={tmpl.id}
                onClick={() => { updateResume({ selectedTemplate: tmpl.id }); setShowTemplates(false); }}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all flex-shrink-0
                  ${resumeData.selectedTemplate === tmpl.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}>
                <div className="w-20 h-24 rounded-lg overflow-hidden bg-white border border-gray-100 shadow-sm">
                  <div className="h-1/3 w-full" style={{ backgroundColor: tmpl.accent }} />
                  <div className="p-1 space-y-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-1 bg-gray-100 rounded" style={{ width: `${60 + i * 10}%` }} />
                    ))}
                  </div>
                </div>
                <span className="text-xs font-semibold text-main-text whitespace-nowrap">{tmpl.name}</span>
                {resumeData.selectedTemplate === tmpl.id && (
                  <span className="badge badge-primary text-[10px] py-0.5">Active</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Section nav + editor */}
        <div className="flex flex-shrink-0">
          {/* Section navigator */}
          <div className="w-[56px] bg-white border-r border-border flex flex-col py-3 gap-1 items-center overflow-y-auto">
            {SECTIONS.map(sec => (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                title={sec.label}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-base transition-all relative group
                  ${activeSection === sec.id ? 'bg-primary shadow-sm' : 'hover:bg-primary/10'}`}
              >
                {sec.icon}
                <div className="absolute left-full ml-2 px-2 py-1 bg-navy text-white text-xs rounded-lg
                  opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                  {sec.label}
                </div>
              </button>
            ))}
          </div>

          {/* Editor panel */}
          <div className="w-[380px] bg-white border-r border-border overflow-y-auto">
            <div className="p-5 animate-fade-in">
              {renderSection()}
            </div>
          </div>
        </div>

        {/* AI Panel */}
        {showAI && (
          <div className="w-[320px] bg-white border-r border-border overflow-y-auto flex-shrink-0 animate-slide-up">
            <AIAssistantPanel resumeData={resumeData} onClose={() => setShowAI(false)} />
          </div>
        )}

        {/* Right: Preview */}
        {showPreview && (
          <div className="flex-1 bg-gray-100 overflow-auto flex flex-col">
            {/* Zoom controls */}
            <div className="flex items-center justify-center gap-3 py-3 bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
              <button onClick={() => setPreviewScale(s => Math.max(0.3, s - 0.1))}
                className="w-7 h-7 rounded-lg bg-white border border-border flex items-center justify-center hover:border-primary transition-colors">
                <ZoomOut size={14} />
              </button>
              <span className="text-xs text-secondary-text font-medium w-12 text-center">{Math.round(previewScale * 100)}%</span>
              <button onClick={() => setPreviewScale(s => Math.min(1.2, s + 0.1))}
                className="w-7 h-7 rounded-lg bg-white border border-border flex items-center justify-center hover:border-primary transition-colors">
                <ZoomIn size={14} />
              </button>
            </div>

            {/* A4 preview */}
            <div className="flex-1 flex justify-center p-8 overflow-auto">
              <div style={{ height: `${297 * previewScale * 3.78}px` }} className="relative">
                <ResumePreviewPanel data={resumeData} scale={previewScale} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
