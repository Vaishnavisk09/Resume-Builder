import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Zap, ArrowRight, CheckCircle, Star, ChevronDown,
  Sparkles, Target, FileCheck, Download, Shield,
  TrendingUp, Layout, Users, Award, ChevronUp
} from 'lucide-react';

const features = [
  { icon: Sparkles, title: 'AI-Powered Writing', desc: 'Intelligent suggestions to elevate your resume content with professional language.' },
  { icon: Target, title: 'ATS Optimization', desc: 'Score your resume against ATS systems and get actionable improvement tips.' },
  { icon: Layout, title: '5 Premium Templates', desc: 'Professionally designed templates that stand out and stay ATS-friendly.' },
  { icon: FileCheck, title: 'Job Description Matching', desc: 'Analyze how well your resume matches any job description in seconds.' },
  { icon: Download, title: 'Instant PDF Export', desc: 'Download pixel-perfect PDFs that preserve your chosen template exactly.' },
  { icon: Shield, title: 'Secure & Private', desc: 'Your data is encrypted and never shared. You own your resume, always.' },
];

const steps = [
  { num: '01', title: 'Create Your Profile', desc: 'Enter your work experience, education, and skills using our smart editor.' },
  { num: '02', title: 'Choose a Template', desc: 'Select from 5 professionally crafted templates designed for different industries.' },
  { num: '03', title: 'Get AI Suggestions', desc: 'Let our AI enhance your content with stronger action verbs and impact metrics.' },
  { num: '04', title: 'Analyze & Optimize', desc: 'Run ATS analysis and job matching to fine-tune your resume for each role.' },
  { num: '05', title: 'Download & Apply', desc: 'Export a beautiful PDF and start applying with confidence.' },
];

const templates = [
  { name: 'Modern Professional', color: '#7155E8', desc: 'Clean sidebar layout with purple accents' },
  { name: 'Minimalist', color: '#1a1a1a', desc: 'Pure white with subtle typography' },
  { name: 'Corporate', color: '#1e40af', desc: 'Traditional two-column structure' },
  { name: 'Creative', color: '#0891b2', desc: 'Bold headers with teal highlights' },
  { name: 'Student / Fresher', color: '#059669', desc: 'Clean one-column academic style' },
];

const testimonials = [
  { name: 'Priya Sharma', role: 'Software Engineer at Google', text: 'ResumeIQ helped me land my dream job. The ATS analyzer caught issues I never would have noticed.', rating: 5 },
  { name: 'Rahul Verma', role: 'Data Scientist at Microsoft', text: "The AI suggestions transformed my resume from average to exceptional. Got 3x more interview calls.", rating: 5 },
  { name: 'Aisha Patel', role: 'Product Manager at Flipkart', text: 'Finally a resume builder that actually understands what recruiters want. The templates are gorgeous.', rating: 5 },
];

const faqs = [
  { q: 'Is ResumeIQ free to use?', a: 'Yes, you can create and manage resumes for free. All core features including AI suggestions, ATS analysis, and PDF download are included.' },
  { q: 'Will my resume pass ATS systems?', a: 'Our ATS analyzer checks for common issues like keyword density, formatting, and section structure. While no tool can guarantee 100% ATS compatibility, our guidelines significantly improve your chances.' },
  { q: 'How does the AI work?', a: 'Our AI analyzes your resume content and suggests improvements based on industry best practices. It never fabricates experience or qualifications - it only helps you express what you already have more effectively.' },
  { q: 'Can I have multiple resumes?', a: 'Absolutely! Create as many tailored resumes as you need - one for each job type or industry.' },
  { q: 'What format is the PDF export?', a: 'Resumes are exported as properly formatted A4 PDFs that exactly match the selected template, ready to submit to any company.' },
];

const ResumePreview = () => (
  <div className="relative flex items-center justify-center">
    {/* Background glow */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-300/10 rounded-3xl blur-3xl" />

    {/* Floating resume card */}
    <div className="relative w-72 bg-white rounded-2xl shadow-2xl overflow-hidden border border-border">
      {/* Resume header */}
      <div className="bg-navy p-5">
        <div className="w-12 h-12 rounded-full bg-primary/30 mb-3 flex items-center justify-center">
          <span className="text-white font-bold text-lg">AS</span>
        </div>
        <h3 className="text-white font-bold text-lg leading-tight">Ananya Singh</h3>
        <p className="text-slate-400 text-sm">Senior Product Designer</p>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-xs bg-white/10 text-slate-300 px-2 py-0.5 rounded">📧 ananya@email.com</span>
          <span className="text-xs bg-white/10 text-slate-300 px-2 py-0.5 rounded">📍 Mumbai, IN</span>
        </div>
      </div>

      {/* Resume body */}
      <div className="p-4 space-y-3">
        <div>
          <p className="text-xs font-bold text-secondary-text uppercase tracking-wider mb-1">Experience</p>
          <p className="text-sm font-semibold text-main-text">Product Designer · Google</p>
          <p className="text-xs text-secondary-text">2022 – Present</p>
          <div className="mt-1 space-y-0.5">
            <div className="h-1.5 bg-gray-100 rounded w-full" />
            <div className="h-1.5 bg-gray-100 rounded w-4/5" />
            <div className="h-1.5 bg-gray-100 rounded w-5/6" />
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-secondary-text uppercase tracking-wider mb-1">Skills</p>
          <div className="flex flex-wrap gap-1">
            {['Figma', 'React', 'UX Research', 'Prototyping'].map(s => (
              <span key={s} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">{s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Floating ATS score card */}
    <div className="absolute -right-4 top-8 bg-white rounded-xl shadow-xl p-3 border border-border animate-pulse-slow">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-green-500" />
        </div>
        <div>
          <p className="text-xs text-secondary-text">ATS Score</p>
          <p className="text-lg font-bold text-green-500">92%</p>
        </div>
      </div>
    </div>

    {/* Floating AI suggestion */}
    <div className="absolute -left-6 bottom-12 bg-white rounded-xl shadow-xl p-3 border border-border max-w-[180px]">
      <div className="flex items-start gap-2">
        <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
        <div>
          <p className="text-xs font-semibold text-main-text">AI Suggestion</p>
          <p className="text-xs text-secondary-text mt-0.5">Add quantified metrics to your impact statements</p>
        </div>
      </div>
    </div>
  </div>
);

export default function LandingPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled ? 'bg-white/90 backdrop-blur-md border-b border-border shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-main-text tracking-tight">ResumeIQ</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-secondary-text hover:text-main-text text-sm font-medium transition-colors">Features</a>
            <a href="#how-it-works" className="text-secondary-text hover:text-main-text text-sm font-medium transition-colors">How It Works</a>
            <a href="#templates" className="text-secondary-text hover:text-main-text text-sm font-medium transition-colors">Templates</a>
            <a href="#faq" className="text-secondary-text hover:text-main-text text-sm font-medium transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-secondary-text hover:text-main-text text-sm font-medium transition-colors hidden md:block">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-5">Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Sparkles size={14} />
              AI-Powered Resume Builder
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-main-text leading-tight mb-6">
              Your Next Opportunity{' '}
              <span className="text-primary">Starts With a Better Resume.</span>
            </h1>
            <p className="text-secondary-text text-lg leading-relaxed mb-8 max-w-lg">
              Create professional, ATS-friendly resumes with intelligent AI assistance.
              Build, customize, analyze, and download your resume in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="btn-primary text-base py-3 px-8">
                Build My Resume
                <ArrowRight size={18} />
              </Link>
              <a href="#templates" className="btn-secondary text-base py-3 px-8">
                Explore Templates
              </a>
            </div>
            <div className="flex items-center gap-6 mt-10">
              {[
                { icon: CheckCircle, text: 'ATS Optimized' },
                { icon: CheckCircle, text: 'AI-Enhanced' },
                { icon: CheckCircle, text: 'Free to Use' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-secondary-text text-sm">
                  <Icon size={16} className="text-primary" />
                  {text}
                </div>
              ))}
            </div>
          </div>
          <div className="lg:flex justify-center hidden">
            <ResumePreview />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-navy">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '50,000+', label: 'Resumes Created' },
              { value: '85%', label: 'Interview Rate' },
              { value: '5', label: 'Premium Templates' },
              { value: '< 5 min', label: 'Setup Time' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-bold text-white mb-1">{value}</p>
                <p className="text-slate-400 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-main-text mb-4">Everything You Need to Land the Job</h2>
          <p className="text-secondary-text text-lg max-w-2xl mx-auto">
            A complete career toolkit designed to give you every advantage in your job search.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6 hover:shadow-card-hover transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4
                group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                <Icon className="w-6 h-6 text-primary group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-bold text-main-text mb-2">{title}</h3>
              <p className="text-secondary-text text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-6 bg-navy">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-4">How ResumeIQ Works</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              From blank page to job-ready resume in just a few steps.
            </p>
          </div>
          <div className="grid md:grid-cols-5 gap-6">
            {steps.map(({ num, title, desc }, i) => (
              <div key={num} className="text-center relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-px bg-white/10" />
                )}
                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center
                  mx-auto mb-4 relative z-10">
                  <span className="text-primary font-bold text-lg">{num}</span>
                </div>
                <h3 className="text-white font-bold text-sm mb-2">{title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates */}
      <section id="templates" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-main-text mb-4">5 Professional Templates</h2>
          <p className="text-secondary-text text-lg max-w-2xl mx-auto">
            Each template is crafted for a different career stage and industry style.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {templates.map(({ name, color, desc }) => (
            <div key={name} className="group cursor-pointer" onClick={() => navigate('/register')}>
              {/* Template thumbnail */}
              <div className="aspect-[3/4] rounded-xl overflow-hidden border-2 border-border
                group-hover:border-primary group-hover:shadow-card-hover transition-all duration-300 relative bg-white">
                {/* Simulated template preview */}
                <div className="h-1/3" style={{ backgroundColor: color }}>
                  <div className="p-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 mb-2" />
                    <div className="h-2 w-2/3 bg-white/60 rounded mb-1" />
                    <div className="h-1.5 w-1/2 bg-white/40 rounded" />
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  <div className="h-1.5 bg-gray-100 rounded w-full" />
                  <div className="h-1.5 bg-gray-100 rounded w-4/5" />
                  <div className="h-1.5 bg-gray-100 rounded w-5/6" />
                  <div className="h-px bg-gray-100 my-2" />
                  <div className="h-1.5 bg-gray-100 rounded w-2/3" />
                  <div className="h-1.5 bg-gray-100 rounded w-full" />
                  <div className="h-1.5 bg-gray-100 rounded w-3/4" />
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-white text-primary text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                    Use Template
                  </span>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-sm font-semibold text-main-text text-center">{name}</p>
                <p className="text-xs text-secondary-text text-center mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/register" className="btn-primary py-3 px-8 text-base">
            Start Building for Free
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* AI Features Highlight */}
      <section className="py-20 px-6 bg-lavender">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-semibold mb-6">
                <Sparkles size={14} />
                AI-Powered Features
              </div>
              <h2 className="text-3xl font-bold text-main-text mb-6">
                Your Personal AI Career Coach
              </h2>
              <div className="space-y-6">
                {[
                  { title: 'Smart Content Enhancement', desc: 'AI rewrites your experience descriptions with stronger action verbs and measurable impact language.' },
                  { title: 'Instant Grammar & Clarity', desc: 'Catch grammatical errors and improve readability with one click.' },
                  { title: 'Keyword Intelligence', desc: 'Automatically suggests relevant skills and keywords based on your target industry.' },
                  { title: 'Job Description Matching', desc: 'Paste any job posting and get an instant compatibility score with missing keyword suggestions.' },
                ].map(({ title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle size={14} className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-main-text mb-1">{title}</p>
                      <p className="text-secondary-text text-sm">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-elevated border border-border space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-bold text-main-text text-sm">AI Resume Assistant</p>
                  <p className="text-xs text-secondary-text">Suggestion ready</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-secondary-text uppercase tracking-wide mb-2">Original</p>
                <p className="text-sm text-secondary-text bg-gray-50 rounded-lg p-3 leading-relaxed">
                  "Worked on features for the company website and fixed some bugs."
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">✨ AI Improved</p>
                <p className="text-sm text-main-text bg-primary/5 rounded-lg p-3 leading-relaxed border border-primary/20">
                  "Developed and shipped 8 product features for the company website, reducing page load time by 40% and resolving 23 critical bugs that improved user retention by 12%."
                </p>
              </div>
              <div className="flex gap-2">
                <button className="btn-primary flex-1 text-xs py-2">Accept</button>
                <button className="btn-secondary flex-1 text-xs py-2">Regenerate</button>
                <button className="btn-ghost text-xs py-2">Reject</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-main-text mb-4">Loved by Job Seekers</h2>
          <p className="text-secondary-text text-lg">Join thousands who landed their dream jobs with ResumeIQ.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map(({ name, role, text, rating }) => (
            <div key={name} className="card p-6">
              <div className="flex gap-0.5 mb-4">
                {[...Array(rating)].map((_, i) => (
                  <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-secondary-text text-sm leading-relaxed mb-6">"{text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                  {name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold text-main-text text-sm">{name}</p>
                  <p className="text-secondary-text text-xs">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6 bg-lavender">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-main-text mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map(({ q, a }, i) => (
              <div key={i} className="card overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-main-text text-sm">{q}</span>
                  {openFaq === i
                    ? <ChevronUp size={18} className="text-primary flex-shrink-0" />
                    : <ChevronDown size={18} className="text-secondary-text flex-shrink-0" />
                  }
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-secondary-text text-sm leading-relaxed animate-fade-in border-t border-border pt-4">
                    {a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-navy">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Build Your Perfect Resume?
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Join 50,000+ professionals who've used ResumeIQ to land better jobs, faster.
          </p>
          <Link to="/register" className="btn-primary text-base py-4 px-10 inline-flex">
            Start Building for Free
            <ArrowRight size={20} />
          </Link>
          <p className="text-slate-500 text-sm mt-4">No credit card required · Free forever</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white">ResumeIQ</span>
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed">
                AI-powered resume builder and career assistant for modern professionals.
              </p>
            </div>
            {[
              { title: 'Product', links: ['Dashboard', 'Resume Builder', 'ATS Analyzer', 'Job Matcher', 'Templates'] },
              { title: 'Company', links: ['About', 'Blog', 'Privacy Policy', 'Terms of Service'] },
              { title: 'Support', links: ['Help Center', 'Contact Us', 'Report a Bug'] },
            ].map(({ title, links }) => (
              <div key={title}>
                <p className="text-white font-semibold text-sm mb-4">{title}</p>
                <ul className="space-y-2">
                  {links.map(link => (
                    <li key={link}>
                      <Link to="/register" className="text-slate-400 hover:text-white text-sm transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">© 2024 ResumeIQ. All rights reserved.</p>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <span>Built with</span>
              <Zap size={14} className="text-primary" />
              <span>for career success</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
