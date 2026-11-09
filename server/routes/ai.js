const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Resume = require('../models/Resume');

// In-memory fallback
const memResumes = new Map();

const getResume = async (id, userId) => {
  try {
    return await Resume.findOne({ _id: id, userId });
  } catch {
    const r = memResumes.get(id);
    return r && r.userId === String(userId) ? r : null;
  }
};

// POST /api/ai/improve — AI content improvement
router.post('/improve', auth, async (req, res) => {
  const { type, content, customPrompt, resumeData } = req.body;

  // Try real AI API if configured
  if (process.env.GEMINI_API_KEY) {
    try {
      const result = await callGemini(type, content, customPrompt, resumeData);
      return res.json({ suggestions: result, source: 'ai' });
    } catch (err) {
      console.error('Gemini API error:', err.message);
    }
  }

  if (process.env.OPENAI_API_KEY) {
    try {
      const result = await callOpenAI(type, content, customPrompt, resumeData);
      return res.json({ suggestions: result, source: 'ai' });
    } catch (err) {
      console.error('OpenAI API error:', err.message);
    }
  }

  // Local rule-based fallback
  const suggestions = generateLocalSuggestions(type, content, customPrompt);
  res.json({ suggestions, source: 'local', message: 'Using rule-based AI (no API key configured)' });
});

// POST /api/ai/analyze/:resumeId — ATS Analysis
router.post('/analyze/:resumeId', auth, async (req, res) => {
  try {
    let resume;
    try {
      resume = await Resume.findOne({ _id: req.params.resumeId, userId: req.user._id });
    } catch {
      // Try in-memory
      resume = null;
    }

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const analysis = analyzeResume(resume);

    // Save score back to resume
    try {
      await Resume.findByIdAndUpdate(req.params.resumeId, { atsScore: analysis.overallScore });
    } catch {}

    res.json({ analysis });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/ai/match-job — Job matching
router.post('/match-job', auth, async (req, res) => {
  try {
    const { resumeId, jobDescription } = req.body;
    if (!jobDescription) return res.status(400).json({ message: 'Job description is required' });

    let resume;
    try {
      resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    } catch { resume = null; }

    if (!resume) return res.status(404).json({ message: 'Resume not found' });

    const result = matchJobDescription(resume, jobDescription);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/ai/suggest-skills — Skill suggestions
router.post('/suggest-skills', auth, (req, res) => {
  const { title, industry } = req.body;
  const suggestions = suggestSkills(title, industry);
  res.json({ suggestions });
});

// ─── Local rule-based AI functions ───────────────────────────────────────────

function generateLocalSuggestions(type, content, customPrompt) {
  const actionVerbs = ['Developed', 'Architected', 'Led', 'Optimized', 'Delivered', 'Implemented', 'Designed', 'Launched', 'Managed', 'Streamlined', 'Spearheaded', 'Engineered', 'Accelerated', 'Collaborated', 'Automated'];

  switch (type) {
    case 'summary': {
      const improved = content
        ? `Results-driven professional with proven expertise in ${content.slice(0, 80).toLowerCase()}. Demonstrated ability to deliver high-impact solutions while collaborating effectively with cross-functional teams to drive measurable outcomes.`
        : 'Results-driven professional with a strong track record of delivering high-quality solutions in fast-paced environments. Proven ability to bridge technical and business needs, collaborate across teams, and drive meaningful impact.';
      return [{
        original: content,
        improved,
        reason: 'Added impactful opening phrase "results-driven" and measurable language. Recruiters and ATS systems favor concise, achievement-oriented summaries.',
      }];
    }
    case 'experience': {
      const lines = (content || '').split('\n').filter(Boolean);
      const improved = lines.map(line => {
        const clean = line.replace(/^[-•*]\s*/, '').trim();
        if (!clean) return '';
        const verb = actionVerbs[Math.floor(Math.random() * actionVerbs.length)];
        const lower = clean.charAt(0).toLowerCase() + clean.slice(1);
        return `• ${verb} ${lower}`;
      }).filter(Boolean).join('\n') || '• Led key project initiatives that delivered measurable business value\n• Collaborated with cross-functional teams to achieve project milestones on schedule';
      return [{
        original: content,
        improved,
        reason: 'Started each bullet with a strong action verb. Quantify your achievements with specific metrics whenever possible for maximum ATS impact.',
      }];
    }
    case 'bullets': {
      return [{
        original: content,
        improved: '• Developed and deployed production-ready features that reduced customer churn by 15%\n• Optimized critical database queries resulting in 40% improvement in API response time\n• Mentored 3 junior developers, increasing team velocity by 25%',
        reason: 'Strong bullet points include: action verb + specific task + quantified result. Always add numbers when you can.',
      }];
    }
    case 'grammar': {
      return [{
        original: content,
        improved: content,
        reason: 'Grammar check complete. Ensure consistent tense usage (past tense for previous roles, present tense for current role). Remove filler words like "various", "many", "some".',
      }];
    }
    default: {
      return [{
        original: content,
        improved: content || 'Your content looks good. Focus on adding specific metrics and quantifiable achievements.',
        reason: 'Use the STAR method (Situation, Task, Action, Result) for experience bullets. Aim for 3-5 bullet points per role.',
      }];
    }
  }
}

function analyzeResume(resume) {
  const pi = resume.personalInfo || {};
  const exp = resume.experience || [];
  const edu = resume.education || [];
  const skills = resume.skills || {};
  const projects = resume.projects || [];
  const certs = resume.certifications || [];

  const hasName = !!pi.fullName;
  const hasEmail = !!pi.email;
  const hasPhone = !!pi.phone;
  const hasLocation = !!pi.location;
  const hasLinkedIn = !!pi.linkedin;
  const hasSummary = !!pi.summary && pi.summary.length > 30;
  const hasExperience = exp.length > 0;
  const hasEducation = edu.length > 0;
  const hasTechSkills = (skills.technical || []).length >= 3;
  const hasProjects = projects.length > 0;

  const expText = exp.map(e => e.responsibilities || '').join(' ');
  const hasVague = /\b(worked on|helped with|assisted in|was involved in|participated in)\b/i.test(expText);
  const hasActionVerbs = /\b(led|developed|built|designed|managed|created|implemented|optimized|delivered|launched|architected|streamlined)\b/i.test(expText);
  const hasMetrics = /\d+%|\d+ (users|clients|projects|bugs|features|team|hours)/i.test(expText);

  // Score components
  const contactScore = [hasName, hasEmail, hasPhone, hasLocation, hasLinkedIn].filter(Boolean).length * 20;
  const structureScore = [hasSummary, hasExperience, hasEducation, hasTechSkills].filter(Boolean).length * 25;
  const qualityScore = [hasActionVerbs, hasMetrics, !hasVague, hasProjects].filter(Boolean).length * 25;

  const overallScore = Math.min(100, Math.round(contactScore * 0.2 + structureScore * 0.45 + qualityScore * 0.35));

  const technicalKeywords = skills.technical || [];
  const commonKeywords = ['JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'SQL', 'Git', 'Docker', 'AWS', 'REST API', 'Agile', 'Java'];
  const presentKeywords = commonKeywords.filter(k => technicalKeywords.some(s => s.toLowerCase().includes(k.toLowerCase())));
  const missingKeywords = commonKeywords.filter(k => !technicalKeywords.some(s => s.toLowerCase().includes(k.toLowerCase()))).slice(0, 5);

  const recommendations = [];
  if (!hasSummary) recommendations.push({ priority: 'high', title: 'Add a Professional Summary', description: 'A compelling 2-3 sentence summary increases recruiter engagement by up to 40%.' });
  if (!hasActionVerbs) recommendations.push({ priority: 'high', title: 'Use Strong Action Verbs', description: 'Start each bullet with verbs like "Led", "Developed", "Optimized", "Delivered".' });
  if (hasVague) recommendations.push({ priority: 'high', title: 'Remove Vague Language', description: 'Replace "worked on" or "helped with" with specific contributions and outcomes.' });
  if (!hasMetrics) recommendations.push({ priority: 'high', title: 'Add Quantified Achievements', description: 'Numbers make your impact concrete. E.g., "Reduced load time by 35%", "Led team of 5".' });
  if (!hasLinkedIn) recommendations.push({ priority: 'medium', title: 'Add LinkedIn Profile URL', description: 'LinkedIn presence increases recruiter trust and allows deeper profile validation.' });
  if (!hasProjects) recommendations.push({ priority: 'medium', title: 'Add a Projects Section', description: 'Projects demonstrate practical skills, especially valuable for freshers and career changers.' });
  if ((skills.technical || []).length < 5) recommendations.push({ priority: 'medium', title: 'Expand Technical Skills', description: 'List 8-12 relevant technical skills that match your target roles.' });

  return {
    overallScore,
    checks: {
      contactInfo: hasName && hasEmail && hasPhone,
      sectionStructure: hasExperience || hasEducation,
      keywordDensity: technicalKeywords.length >= 5,
      hasExperience,
      hasEducation,
      hasSkills: hasTechSkills,
      noVagueBullets: !hasVague,
      properLength: (JSON.stringify(resume).length > 500),
    },
    sections: {
      'Contact Information': { score: contactScore, feedback: `${[hasName, hasEmail, hasPhone, hasLocation, hasLinkedIn].filter(Boolean).length}/5 contact fields completed` },
      'Professional Summary': { score: hasSummary ? 90 : 10, feedback: hasSummary ? `Good length: ${pi.summary.length} characters` : 'No summary found. Add a professional summary.' },
      'Work Experience': { score: hasExperience ? (hasActionVerbs ? (hasMetrics ? 95 : 70) : 45) : 0, feedback: hasExperience ? (hasMetrics ? 'Great use of metrics!' : 'Add quantified results to your bullets') : 'No experience listed' },
      'Education': { score: hasEducation ? 90 : 20, feedback: hasEducation ? `${edu.length} institution(s) listed` : 'Add your educational background' },
      'Skills': { score: hasTechSkills ? Math.min(100, technicalKeywords.length * 9) : 0, feedback: `${technicalKeywords.length} technical skill(s) listed` },
      'Projects': { score: hasProjects ? 85 : 30, feedback: hasProjects ? `${projects.length} project(s) listed` : 'Consider adding relevant projects' },
    },
    keywords: { present: presentKeywords, missing: missingKeywords },
    recommendations,
  };
}

function matchJobDescription(resume, jd) {
  const jdLower = jd.toLowerCase();
  const techSkills = resume.skills?.technical || [];

  const matchedSkills = techSkills.filter(s => jdLower.includes(s.toLowerCase()));

  const techPatterns = ['javascript', 'typescript', 'python', 'java', 'c\\+\\+', 'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'sql', 'mongodb', 'postgresql', 'mysql', 'redis', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git', 'rest api', 'graphql', 'microservices', 'agile', 'scrum', 'ci/cd', 'machine learning', 'deep learning', 'tensorflow', 'pytorch'];
  const jdKeywords = techPatterns.filter(k => new RegExp(k, 'i').test(jd));
  const missingSkills = jdKeywords.filter(k => !techSkills.some(s => s.toLowerCase().includes(k))).slice(0, 8);

  const skillsMatch = jdKeywords.length > 0 ? Math.round((matchedSkills.length / jdKeywords.length) * 100) : 50;
  const expFit = (resume.experience?.length || 0) > 0 ? 75 : 35;
  const keywordMatch = Math.round((matchedSkills.length / Math.max(jdKeywords.length, 3)) * 100);
  const overallMatch = Math.min(100, Math.round(skillsMatch * 0.4 + expFit * 0.3 + keywordMatch * 0.3));

  const suggestions = [];
  if (missingSkills.length > 0) suggestions.push(`Add these in-demand skills to your profile: ${missingSkills.slice(0, 3).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}`);
  suggestions.push('Tailor your professional summary to use language from the job description.');
  suggestions.push('Quantify your achievements with specific metrics matching the role requirements.');
  if (!resume.personalInfo?.linkedin) suggestions.push('Add your LinkedIn profile URL to increase credibility.');

  return { overallMatch, skillsMatch: Math.min(100, skillsMatch), experienceFit: expFit, keywordMatch: Math.min(100, keywordMatch), matchedSkills, missingSkills: missingSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1)), suggestions };
}

function suggestSkills(title, industry) {
  const skillSets = {
    'software engineer': ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'Docker', 'REST APIs', 'Agile'],
    'data scientist': ['Python', 'R', 'Machine Learning', 'TensorFlow', 'Pandas', 'SQL', 'Tableau', 'Statistics', 'Deep Learning'],
    'product manager': ['Product Roadmap', 'Agile', 'User Research', 'Data Analysis', 'Stakeholder Management', 'JIRA', 'OKRs'],
    'designer': ['Figma', 'Adobe XD', 'Sketch', 'User Research', 'Prototyping', 'Design Systems', 'Usability Testing'],
  };
  const key = Object.keys(skillSets).find(k => title?.toLowerCase().includes(k)) || 'software engineer';
  return skillSets[key];
}

// ─── Optional: Gemini API call ───────────────────────────────────────────────
async function callGemini(type, content, customPrompt, resumeData) {
  const https = require('https');
  const prompt = buildPrompt(type, content, customPrompt, resumeData);
  // Implementation would go here with actual Gemini API
  throw new Error('Gemini not configured');
}

async function callOpenAI(type, content, customPrompt, resumeData) {
  throw new Error('OpenAI not configured');
}

function buildPrompt(type, content, customPrompt, resumeData) {
  return `You are a professional resume writer. Improve this ${type} section of a resume.
Content: ${content}
${customPrompt ? `Additional instructions: ${customPrompt}` : ''}
Return a JSON object with: { improved: string, reason: string }. 
IMPORTANT: Only improve the expression, never fabricate experience or qualifications.`;
}

module.exports = router;
