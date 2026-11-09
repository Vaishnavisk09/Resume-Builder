const express = require('express');
const router = express.Router();
const Resume = require('../models/Resume');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const pdfParse = require('pdf-parse');

// Multer — memory storage, 5 MB limit, PDF/DOC/DOCX only
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF and Word documents are accepted'));
  },
});

// In-memory fallback store
const memResumes = new Map(); // id -> resume

const genId = () => `mem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const getUserResumes = (userId) =>
  [...memResumes.values()].filter(r => r.userId === String(userId));

// GET /api/resumes — get all resumes for user
router.get('/', auth, async (req, res) => {
  try {
    try {
      const resumes = await Resume.find({ userId: req.user._id }).sort({ updatedAt: -1 });
      return res.json({ resumes });
    } catch {
      const resumes = getUserResumes(req.user._id).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      return res.json({ resumes });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/resumes/:id
router.get('/:id', auth, async (req, res) => {
  try {
    try {
      const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
      if (!resume) return res.status(404).json({ message: 'Resume not found' });
      return res.json({ resume });
    } catch {
      const resume = memResumes.get(req.params.id);
      if (!resume || resume.userId !== String(req.user._id)) return res.status(404).json({ message: 'Resume not found' });
      return res.json({ resume });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/resumes — create new
router.post('/', auth, async (req, res) => {
  try {
    const data = { ...req.body, userId: req.user._id };
    try {
      const resume = await Resume.create(data);
      return res.status(201).json({ resume });
    } catch {
      const id = genId();
      const resume = { _id: id, ...data, userId: String(req.user._id), createdAt: new Date(), updatedAt: new Date() };
      memResumes.set(id, resume);
      return res.status(201).json({ resume });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/resumes/:id — update
router.put('/:id', auth, async (req, res) => {
  try {
    const update = { ...req.body, updatedAt: new Date() };
    delete update._id;
    delete update.userId;
    try {
      const resume = await Resume.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        update,
        { new: true, runValidators: false }
      );
      if (!resume) return res.status(404).json({ message: 'Resume not found' });
      return res.json({ resume });
    } catch {
      const existing = memResumes.get(req.params.id);
      if (!existing || existing.userId !== String(req.user._id)) return res.status(404).json({ message: 'Resume not found' });
      const updated = { ...existing, ...update, _id: req.params.id, userId: existing.userId };
      memResumes.set(req.params.id, updated);
      return res.json({ resume: updated });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/resumes/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    try {
      const result = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
      if (!result) return res.status(404).json({ message: 'Resume not found' });
    } catch {
      const existing = memResumes.get(req.params.id);
      if (!existing || existing.userId !== String(req.user._id)) return res.status(404).json({ message: 'Resume not found' });
      memResumes.delete(req.params.id);
    }
    res.json({ message: 'Resume deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/resumes/:id/duplicate
router.post('/:id/duplicate', auth, async (req, res) => {
  try {
    try {
      const original = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
      if (!original) return res.status(404).json({ message: 'Resume not found' });
      const copy = original.toObject();
      delete copy._id;
      copy.title = `${copy.title || 'Resume'} (Copy)`;
      const newResume = await Resume.create(copy);
      return res.status(201).json({ resume: newResume });
    } catch {
      const original = memResumes.get(req.params.id);
      if (!original || original.userId !== String(req.user._id)) return res.status(404).json({ message: 'Resume not found' });
      const id = genId();
      const copy = { ...original, _id: id, title: `${original.title || 'Resume'} (Copy)`, createdAt: new Date(), updatedAt: new Date() };
      memResumes.set(id, copy);
      return res.status(201).json({ resume: copy });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/resumes/parse-upload — parse an uploaded resume file
router.post('/parse-upload', auth, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    let text = '';

    // Extract text from PDF
    if (req.file.mimetype === 'application/pdf') {
      const data = await pdfParse(req.file.buffer);
      text = data.text || '';
    } else {
      // For DOC/DOCX — basic extraction (text embedded in XML)
      text = req.file.buffer.toString('utf-8').replace(/<[^>]+>/g, ' ');
    }

    // ── Regex heuristics ─────────────────────────────────────────────────
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = text.match(/(\+?[\d\s\-().]{7,16})/);
    const linkedinMatch = text.match(/linkedin\.com\/in\/([\w-]+)/i);
    const githubMatch = text.match(/github\.com\/([\w-]+)/i);
    const portfolioMatch = text.match(/(?:portfolio|website|web)[\s:]+([^\s,\n]+)/i);

    // Name — usually the first non-empty line
    const fullName = lines[0] || '';

    // Professional title — second line often contains title
    const titleLine = lines[1] || '';

    // Location — looks for City, State or City, Country pattern
    const locationMatch = text.match(/([A-Z][a-z]+(?: [A-Z][a-z]+)?,\s*[A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/);

    // Summary — paragraph after "summary" / "objective" / "about" heading
    const summaryMatch = text.match(/(?:summary|objective|about me|profile)[:\s\n]+([^]*?)(?:\n\n|\n[A-Z]{2,}|$)/i);
    const summary = summaryMatch ? summaryMatch[1].replace(/\s+/g, ' ').trim().slice(0, 500) : '';

    // Skills — lines after "skills" heading up to next section
    const skillsMatch = text.match(/(?:skills?|technical skills?|core competencies)[:\s\n]+([^]*?)(?:\n\n|\n[A-Z]{2,}|$)/i);
    const skillsRaw = skillsMatch ? skillsMatch[1] : '';
    const technicalSkills = skillsRaw
      .split(/[,•\n|\/]/)
      .map(s => s.replace(/[^a-zA-Z0-9+#.\s]/g, '').trim())
      .filter(s => s.length > 1 && s.length < 30)
      .slice(0, 20);

    // Experience — rough section extraction
    const expMatch = text.match(/(?:experience|work history|employment)[:\s\n]+([^]*?)(?:\n\n(?:[A-Z]{2,}|\s*$)|education|skills)/i);
    const expRaw = expMatch ? expMatch[1] : '';
    const experience = expRaw
      ? [{
          id: `exp-${Date.now()}`,
          jobTitle: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          responsibilities: expRaw.replace(/\s+/g, ' ').trim().slice(0, 1000),
        }]
      : [];

    // Education — rough section extraction
    const eduMatch = text.match(/(?:education|academic|qualification)[:\s\n]+([^]*?)(?:\n\n(?:[A-Z]{2,}|\s*$)|experience|skills|work)/i);
    const eduRaw = eduMatch ? eduMatch[1] : '';
    const education = eduRaw
      ? [{
          id: `edu-${Date.now()}`,
          degree: '',
          institution: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          description: eduRaw.replace(/\s+/g, ' ').trim().slice(0, 500),
        }]
      : [];

    const resumeData = {
      title: fullName ? `${fullName}'s Resume` : 'Uploaded Resume',
      selectedTemplate: 'modern',
      personalInfo: {
        fullName,
        professionalTitle: titleLine.length < 80 ? titleLine : '',
        email: emailMatch ? emailMatch[0] : '',
        phone: phoneMatch ? phoneMatch[1].trim() : '',
        location: locationMatch ? locationMatch[1] : '',
        linkedin: linkedinMatch ? `linkedin.com/in/${linkedinMatch[1]}` : '',
        github: githubMatch ? `github.com/${githubMatch[1]}` : '',
        portfolio: portfolioMatch ? portfolioMatch[1] : '',
        summary,
      },
      experience,
      education,
      skills: { technical: technicalSkills, soft: [], languages: [] },
      projects: [],
      certifications: [],
      achievements: [],
      languages: [],
      customSections: [],
    };

    res.json({ resumeData, message: 'Resume parsed successfully' });
  } catch (err) {
    console.error('Parse error:', err);
    res.status(500).json({ message: 'Failed to parse resume: ' + err.message });
  }
});

module.exports = router;
