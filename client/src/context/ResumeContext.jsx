import React, { createContext, useContext, useState } from 'react';

const ResumeContext = createContext(null);

export const useResume = () => {
  const ctx = useContext(ResumeContext);
  if (!ctx) throw new Error('useResume must be used within ResumeProvider');
  return ctx;
};

export const defaultResumeData = {
  title: 'Untitled Resume',
  selectedTemplate: 'modern',
  personalInfo: {
    fullName: '',
    professionalTitle: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
    summary: '',
  },
  experience: [],
  education: [],
  skills: { technical: [], soft: [], languages: [] },
  projects: [],
  certifications: [],
  achievements: [],
  languages: [],
  customSections: [],
};

export const ResumeProvider = ({ children }) => {
  const [resumeData, setResumeData] = useState(defaultResumeData);
  const [history, setHistory] = useState([defaultResumeData]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const updateResume = (updates) => {
    setResumeData(prev => {
      const next = typeof updates === 'function' ? updates(prev) : { ...prev, ...updates };
      // Push to history
      setHistory(h => {
        const newHistory = h.slice(0, historyIndex + 1);
        newHistory.push(next);
        return newHistory.slice(-50); // keep last 50
      });
      setHistoryIndex(i => Math.min(i + 1, 49));
      setIsDirty(true);
      return next;
    });
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setResumeData(history[newIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setResumeData(history[newIndex]);
    }
  };

  const loadResume = (data) => {
    const merged = { ...defaultResumeData, ...data };
    setResumeData(merged);
    setHistory([merged]);
    setHistoryIndex(0);
    setIsDirty(false);
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <ResumeContext.Provider value={{
      resumeData, updateResume, loadResume,
      undo, redo, canUndo, canRedo,
      isDirty, setIsDirty, isSaving, setIsSaving
    }}>
      {children}
    </ResumeContext.Provider>
  );
};
