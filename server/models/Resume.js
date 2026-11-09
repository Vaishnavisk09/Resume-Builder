const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, default: 'Untitled Resume', trim: true },
  selectedTemplate: { type: String, default: 'modern' },
  personalInfo: {
    fullName: String, professionalTitle: String, email: String,
    phone: String, location: String, linkedin: String, github: String,
    portfolio: String, summary: String,
  },
  experience: [{ type: mongoose.Schema.Types.Mixed }],
  education: [{ type: mongoose.Schema.Types.Mixed }],
  skills: {
    technical: [String], soft: [String], languages: [String],
  },
  projects: [{ type: mongoose.Schema.Types.Mixed }],
  certifications: [{ type: mongoose.Schema.Types.Mixed }],
  achievements: [{ type: mongoose.Schema.Types.Mixed }],
  languages: [{ type: mongoose.Schema.Types.Mixed }],
  customSections: [{ type: mongoose.Schema.Types.Mixed }],
  atsScore: { type: Number, min: 0, max: 100 },
  aiSuggestionsApplied: { type: Number, default: 0 },
  downloadCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
