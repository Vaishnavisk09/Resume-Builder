import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles, Upload, FileText, ArrowRight, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { resumeAPI } from '../services/api';

/* ─────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────── */
const ACCEPTED = '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/* ─────────────────────────────────────────────────────────────
   Main Modal
───────────────────────────────────────────────────────────── */
export default function NewResumeModal({ onClose }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState('choose'); // 'choose' | 'upload'
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadState, setUploadState] = useState('idle'); // 'idle' | 'parsing' | 'done' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef(null);

  /* ── Go to builder fresh ── */
  const handleScratch = () => {
    onClose();
    navigate('/builder');
  };

  /* ── File selection ── */
  const handleFile = useCallback((f) => {
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(ext)) {
      toast.error('Please upload a PDF or Word document.');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error('File too large. Max size is 5 MB.');
      return;
    }
    setFile(f);
    setUploadState('idle');
    setErrorMsg('');
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  /* ── Parse & navigate ── */
  const handleParse = async () => {
    if (!file) return;
    setUploadState('parsing');
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const res = await resumeAPI.parseUpload(formData);
      const parsed = res.data.resumeData;

      setUploadState('done');

      // Short success flash, then navigate with pre-filled data
      setTimeout(() => {
        onClose();
        navigate('/builder', { state: { prefill: parsed } });
      }, 900);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Could not parse the resume. You can still fill in details manually.';
      setUploadState('error');
      setErrorMsg(msg);
    }
  };

  /* ── Skip parsing, just go to builder empty ── */
  const handleSkipParsing = () => {
    onClose();
    navigate('/builder');
  };

  /* ────────────────── Render ────────────────── */
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(23,21,45,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl animate-slide-up relative overflow-hidden"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Gradient accent bar */}
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #7155E8, #a78bfa, #60a5fa)' }} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            <h2 className="text-xl font-bold text-main-text">Create New Resume</h2>
            <p className="text-secondary-text text-sm mt-0.5">
              {mode === 'choose' ? 'Choose how you want to start' : 'Upload your existing resume'}
            </p>
          </div>
          <button
            onClick={onClose}
            id="new-resume-modal-close"
            className="w-8 h-8 rounded-lg text-secondary-text hover:text-main-text hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 pb-7">
          {/* ── CHOICE SCREEN ── */}
          {mode === 'choose' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              {/* Start from scratch */}
              <button
                id="new-resume-scratch-btn"
                onClick={handleScratch}
                className="group relative flex flex-col items-center text-center gap-4 p-6 rounded-2xl border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 bg-white"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ background: 'linear-gradient(135deg, #f0ecff 0%, #e0d9ff 100%)' }}
                >
                  <Sparkles size={28} style={{ color: '#7155E8' }} />
                </div>
                <div>
                  <p className="font-bold text-main-text text-base mb-1">Start from Scratch</p>
                  <p className="text-secondary-text text-xs leading-relaxed">
                    Build a fresh resume with AI-powered suggestions and beautiful templates
                  </p>
                </div>
                <span className="flex items-center gap-1 text-primary text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Get started <ArrowRight size={13} />
                </span>
              </button>

              {/* Upload existing */}
              <button
                id="new-resume-upload-btn"
                onClick={() => setMode('upload')}
                className="group relative flex flex-col items-center text-center gap-4 p-6 rounded-2xl border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 bg-white"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ background: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)' }}
                >
                  <Upload size={28} style={{ color: '#0891b2' }} />
                </div>
                <div>
                  <p className="font-bold text-main-text text-base mb-1">Upload Resume</p>
                  <p className="text-secondary-text text-xs leading-relaxed">
                    Import your existing PDF or Word resume and auto-fill your builder
                  </p>
                </div>
                <span className="flex items-center gap-1 text-cyan-600 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Upload file <ArrowRight size={13} />
                </span>
              </button>
            </div>
          )}

          {/* ── UPLOAD SCREEN ── */}
          {mode === 'upload' && (
            <div className="mt-2 space-y-4">
              {/* Back link */}
              <button
                onClick={() => { setMode('choose'); setFile(null); setUploadState('idle'); }}
                className="text-xs text-secondary-text hover:text-primary transition-colors flex items-center gap-1"
              >
                ← Back
              </button>

              {/* Drop zone */}
              <div
                id="resume-dropzone"
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300
                  ${dragOver ? 'border-primary bg-primary/5 scale-[1.01]' : file ? 'border-green-400 bg-green-50' : 'border-border hover:border-primary/60 hover:bg-gray-50'}`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept={ACCEPTED}
                  className="hidden"
                  id="resume-file-input"
                  onChange={(e) => handleFile(e.target.files[0])}
                />

                {file ? (
                  /* File selected state */
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">
                      <FileText size={26} className="text-green-600" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-main-text text-sm">{file.name}</p>
                      <p className="text-secondary-text text-xs mt-0.5">{formatBytes(file.size)} · Click to change file</p>
                    </div>
                  </>
                ) : (
                  /* Empty drop zone */
                  <>
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #f0ecff, #e0d9ff)' }}
                    >
                      <Upload size={26} style={{ color: '#7155E8' }} />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-main-text text-sm">
                        {dragOver ? 'Drop your resume here' : 'Drag & drop your resume'}
                      </p>
                      <p className="text-secondary-text text-xs mt-1">or <span className="text-primary font-semibold">browse files</span></p>
                    </div>
                    <p className="text-[11px] text-secondary-text">PDF, DOC, DOCX · Max 5 MB</p>
                  </>
                )}
              </div>

              {/* Supported formats */}
              <div className="flex items-center gap-2 flex-wrap">
                {['PDF', 'DOC', 'DOCX'].map(fmt => (
                  <span key={fmt} className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-secondary-text">
                    {fmt}
                  </span>
                ))}
                <span className="text-[11px] text-secondary-text ml-1">formats supported</span>
              </div>

              {/* Error message */}
              {uploadState === 'error' && (
                <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
                  <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-600 text-xs font-semibold">Parsing failed</p>
                    <p className="text-red-500 text-xs mt-0.5">{errorMsg}</p>
                    <button onClick={handleSkipParsing} className="text-primary text-xs font-semibold mt-1 hover:underline">
                      Start empty builder instead →
                    </button>
                  </div>
                </div>
              )}

              {/* Success message */}
              {uploadState === 'done' && (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-100">
                  <CheckCircle size={16} className="text-green-500" />
                  <p className="text-green-600 text-xs font-semibold">Resume parsed! Opening builder…</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  id="resume-parse-btn"
                  onClick={handleParse}
                  disabled={!file || uploadState === 'parsing' || uploadState === 'done'}
                  className="btn-primary flex-1 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadState === 'parsing' ? (
                    <><Loader2 size={16} className="animate-spin" /> Parsing resume…</>
                  ) : uploadState === 'done' ? (
                    <><CheckCircle size={16} /> Done!</>
                  ) : (
                    <><Upload size={16} /> Parse & Fill Builder</>
                  )}
                </button>
                <button
                  id="resume-skip-parse-btn"
                  onClick={handleSkipParsing}
                  className="btn-secondary py-2.5 px-4 text-sm"
                >
                  Skip
                </button>
              </div>

              <p className="text-[11px] text-secondary-text text-center leading-relaxed">
                We'll extract your details and pre-fill the builder. You can review and edit everything before saving.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
