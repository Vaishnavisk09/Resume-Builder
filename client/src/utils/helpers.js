// Calculate resume completion percentage
export const calculateCompletion = (resumeData) => {
  if (!resumeData) return 0;
  
  const checks = [
    // Personal info (30%)
    { weight: 5, check: () => !!resumeData.personalInfo?.fullName },
    { weight: 5, check: () => !!resumeData.personalInfo?.email },
    { weight: 5, check: () => !!resumeData.personalInfo?.phone },
    { weight: 5, check: () => !!resumeData.personalInfo?.professionalTitle },
    { weight: 5, check: () => !!resumeData.personalInfo?.location },
    { weight: 5, check: () => !!resumeData.personalInfo?.summary },
    // Experience (20%)
    { weight: 20, check: () => resumeData.experience?.length > 0 },
    // Education (15%)
    { weight: 15, check: () => resumeData.education?.length > 0 },
    // Skills (15%)
    { weight: 15, check: () => (resumeData.skills?.technical?.length || 0) > 0 },
    // Projects (10%)
    { weight: 10, check: () => resumeData.projects?.length > 0 },
    // Extras (10%)
    { weight: 5, check: () => (resumeData.certifications?.length || 0) > 0 },
    { weight: 5, check: () => !!resumeData.personalInfo?.linkedin },
  ];

  const total = checks.reduce((sum, c) => sum + c.weight, 0);
  const earned = checks.filter(c => c.check()).reduce((sum, c) => sum + c.weight, 0);
  return Math.round((earned / total) * 100);
};

// Format date for display
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  if (dateStr === 'Present') return 'Present';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

// Generate unique ID
export const generateId = () => {
  return Math.random().toString(36).substring(2, 11);
};

// Get initials from name
export const getInitials = (name = '') => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Truncate text
export const truncate = (str, length = 50) => {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
};

// Format relative time
export const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// ATS Score color
export const getScoreColor = (score) => {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#f59e0b';
  return '#ef4444';
};

export const getScoreLabel = (score) => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Work';
};

// Debounce
export const debounce = (fn, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};
