import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Plus, X, Download, Trash2, Loader2, Save,
  Briefcase, Code2, Globe, Link2, FileText, LogOut,
  User, AlignLeft, GraduationCap, Award, Tag, Languages, Contact,
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const LEVEL_LABELS = {
  SSC: 'SSC (10th)',
  HSC: 'HSC (12th)',
  Diploma: 'Diploma',
  Bachelors: "Bachelor's",
  Masters: "Master's",
  PhD: 'PhD',
  Other: 'Education',
};

function linkIcon(label) {
  const l = (label || '').toLowerCase();
  if (l.includes('linkedin')) return Briefcase;
  if (l.includes('github')) return Code2;
  if (l.includes('portfolio') || l.includes('website')) return Globe;
  return Link2;
}

let idCounter = 0;
const nextId = () => `id-${++idCounter}-${Date.now()}`;

const blankExperience = () => ({ id: nextId(), title: '', company: '', dates: '', bullets: [{ id: nextId(), raw: '', forged: '', status: 'idle' }] });
const blankEducation = () => ({ id: nextId(), level: '', institution: '', fieldOfStudy: '', dates: '', grade: '' });
const blankLanguage = () => ({ id: nextId(), name: '', proficiency: '' });
const blankReference = () => ({ id: nextId(), name: '', company: '', email: '', phone: '' });

const PROFICIENCY_OPTIONS = ['Basic', 'Conversational', 'Professional', 'Fluent', 'Native speaker'];

function hydrateFromResume(resume) {
  return {
    basics: {
      fullName: resume.fullName || '',
      email: resume.email || '',
      phone: resume.phone || '',
      targetRole: resume.targetRole || '',
    },
    summary: { raw: resume.summary || '', forged: resume.summary || '', status: resume.summary ? 'done' : 'idle' },
    links: (resume.links || []).map((l) => ({ id: nextId(), label: l.label, url: l.url })),
    experience:
      Array.isArray(resume.experience) && resume.experience.length > 0
        ? resume.experience.map((exp) => ({
            id: nextId(),
            title: exp.title || '',
            company: exp.company || '',
            dates: exp.dates || '',
            bullets:
              exp.bullets && exp.bullets.length > 0
                ? exp.bullets.map((b) => ({
                    id: nextId(),
                    raw: b.raw || '',
                    forged: b.forged || '',
                    status: b.forged ? 'done' : 'idle',
                  }))
                : [{ id: nextId(), raw: '', forged: '', status: 'idle' }],
          }))
        : [blankExperience()],
    education:
      (resume.education || []).length > 0
        ? resume.education.map((e) => ({
            id: nextId(),
            level: e.level || '',
            institution: e.institution || '',
            fieldOfStudy: e.fieldOfStudy || '',
            dates: e.dates || '',
            grade: e.grade || '',
          }))
        : [blankEducation()],
    certificates: (resume.certificates || []).map((c) => ({ id: c.id, title: c.title, fileUrl: c.fileUrl })),
    languages:
      (resume.languages || []).length > 0
        ? resume.languages.map((l) => ({ id: nextId(), name: l.name || '', proficiency: l.proficiency || '' }))
        : [blankLanguage()],
    references:
      (resume.references || []).length > 0
        ? resume.references.map((r) => ({ id: nextId(), name: r.name || '', company: r.company || '', email: r.email || '', phone: r.phone || '' }))
        : [blankReference()],
    skills: resume.skills || [],
  };
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="ff-mono text-[10px] uppercase tracking-wider text-[#6B7080]">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full border border-[#D8D4CB] rounded-md px-3 py-2 text-[14px] ff-body outline-none focus:border-[#C08A3E] focus:ring-2 focus:ring-[#C08A3E]/20 transition-shadow placeholder:text-[#B0B4BD]"
      />
    </label>
  );
}

function CardHeading({ icon: Icon, children }) {
  return (
    <h3 className="flex items-center gap-1.5 ff-display text-[15px] font-semibold text-[#22252B]">
      <Icon size={14} className="text-[#C08A3E]" /> {children}
    </h3>
  );
}

export default function ResumeBuilder() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [resumeId, setResumeId] = useState(null);
  const [loadingResume, setLoadingResume] = useState(true);
  const [bannerError, setBannerError] = useState('');
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const [basics, setBasics] = useState({ fullName: '', email: '', phone: '', targetRole: '' });
  const [summary, setSummary] = useState({ raw: '', forged: '', status: 'idle' });
  const [links, setLinks] = useState([]);
  const [experience, setExperience] = useState([blankExperience()]);
  const [education, setEducation] = useState([blankEducation()]);
  const [certificates, setCertificates] = useState([]);
  const [languages, setLanguages] = useState([blankLanguage()]);
  const [references, setReferences] = useState([blankReference()]);
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');

  // Load the user's resume on mount — create one if they don't have one yet
  useEffect(() => {
    (async () => {
      try {
        const { resumes } = await api.getResumes();
        let resume;
        if (resumes.length > 0) {
          const full = await api.getResume(resumes[0].id);
          resume = full.resume;
        } else {
          const created = await api.createResume({ title: 'My Resume' });
          resume = created.resume;
        }
        setResumeId(resume.id);
        const hydrated = hydrateFromResume(resume);
        setBasics(hydrated.basics);
        setSummary(hydrated.summary);
        setLinks(hydrated.links);
        setExperience(hydrated.experience);
        setEducation(hydrated.education);
        setCertificates(hydrated.certificates);
        setLanguages(hydrated.languages);
        setReferences(hydrated.references);
        setSkills(hydrated.skills);
      } catch (err) {
        setBannerError(err.message || 'Failed to load your resume');
      } finally {
        setLoadingResume(false);
      }
    })();
  }, []);

  const serializeForSave = useCallback(
    () => ({
      title: 'My Resume',
      fullName: basics.fullName,
      email: basics.email,
      phone: basics.phone,
      targetRole: basics.targetRole,
      summary: summary.forged || summary.raw,
      experience: experience.map((exp) => ({
        title: exp.title,
        company: exp.company,
        dates: exp.dates,
        bullets: exp.bullets.map((b) => ({ raw: b.raw, forged: b.forged })),
      })),
      skills,
      links: links.filter((l) => l.url.trim()).map(({ label, url }) => ({ label, url })),
      education: education
        .filter((e) => e.level && e.institution.trim())
        .map(({ level, institution, fieldOfStudy, dates, grade }) => ({ level, institution, fieldOfStudy, dates, grade })),
      languages: languages
        .filter((l) => l.name.trim())
        .map(({ name, proficiency }) => ({ name, proficiency })),
      references: references
        .filter((r) => r.name.trim())
        .map(({ name, company, email, phone }) => ({ name, company, email, phone })),
    }),
    [basics, summary, experience, skills, links, education, languages, references]
  );

  const handleSave = async () => {
    if (!resumeId) return;
    setSaving(true);
    setBannerError('');
    try {
      await api.updateResume(resumeId, serializeForSave());
      setLastSaved(new Date());
    } catch (err) {
      setBannerError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    if (!resumeId) return;
    setDownloading(true);
    setBannerError('');
    try {
      await api.updateResume(resumeId, serializeForSave()); // save latest edits first
      const blob = await api.downloadResume(resumeId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${basics.fullName || 'resume'}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setLastSaved(new Date());
    } catch (err) {
      setBannerError(err.message || 'Failed to download resume');
    } finally {
      setDownloading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const updateBasics = (field, value) => setBasics((b) => ({ ...b, [field]: value }));

  // Summary
  const updateSummaryRaw = (value) => setSummary({ raw: value, forged: '', status: 'idle' });
  const forgeSummary = async () => {
    setSummary((s) => ({ ...s, status: 'forging' }));
    setBannerError('');
    try {
      const { rewrittenSummary } = await api.rewriteSummary({ rawSummary: summary.raw, targetRole: basics.targetRole });
      setSummary((s) => ({ ...s, status: 'done', forged: rewrittenSummary }));
    } catch (err) {
      setSummary((s) => ({ ...s, status: 'idle' }));
      setBannerError(err.message || 'AI rewrite failed');
    }
  };

  // Links
  const addLink = (presetLabel = '') => setLinks((ls) => [...ls, { id: nextId(), label: presetLabel, url: '' }]);
  const updateLink = (id, field, value) => setLinks((ls) => ls.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  const removeLink = (id) => setLinks((ls) => ls.filter((l) => l.id !== id));

  // Experience
  const updateExperienceField = (expId, field, value) =>
    setExperience((exps) => exps.map((e) => (e.id === expId ? { ...e, [field]: value } : e)));
  const updateBulletRaw = (expId, bulletId, value) =>
    setExperience((exps) =>
      exps.map((e) =>
        e.id !== expId ? e : { ...e, bullets: e.bullets.map((b) => (b.id === bulletId ? { ...b, raw: value, status: 'idle', forged: '' } : b)) }
      )
    );

  const forgeBullet = async (expId, bulletId, rawText) => {
    setExperience((exps) =>
      exps.map((e) =>
        e.id !== expId ? e : { ...e, bullets: e.bullets.map((b) => (b.id === bulletId ? { ...b, status: 'forging' } : b)) }
      )
    );
    setBannerError('');
    try {
      const { rewrittenBullets } = await api.rewriteBullets({ rawBullets: [rawText], targetRole: basics.targetRole });
      const forged = rewrittenBullets[0];
      setExperience((exps) =>
        exps.map((e) =>
          e.id !== expId ? e : { ...e, bullets: e.bullets.map((b) => (b.id === bulletId ? { ...b, status: 'done', forged } : b)) }
        )
      );
    } catch (err) {
      setExperience((exps) =>
        exps.map((e) =>
          e.id !== expId ? e : { ...e, bullets: e.bullets.map((b) => (b.id === bulletId ? { ...b, status: 'idle' } : b)) }
        )
      );
      setBannerError(err.message || 'AI rewrite failed');
    }
  };

  const addBullet = (expId) =>
    setExperience((exps) =>
      exps.map((e) => (e.id === expId ? { ...e, bullets: [...e.bullets, { id: nextId(), raw: '', forged: '', status: 'idle' }] } : e))
    );
  const removeBullet = (expId, bulletId) =>
    setExperience((exps) => exps.map((e) => (e.id === expId ? { ...e, bullets: e.bullets.filter((b) => b.id !== bulletId) } : e)));
  const addExperience = () => setExperience((exps) => [...exps, blankExperience()]);
  const removeExperience = (expId) => setExperience((exps) => exps.filter((e) => e.id !== expId));

  // Education
  const addEducation = () => setEducation((eds) => [...eds, blankEducation()]);
  const updateEducationField = (eduId, field, value) => setEducation((eds) => eds.map((e) => (e.id === eduId ? { ...e, [field]: value } : e)));
  const removeEducation = (eduId) => setEducation((eds) => eds.filter((e) => e.id !== eduId));

  // Certificates
  const addCertificateFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !resumeId) return;
    e.target.value = '';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('resumeId', resumeId);
    formData.append('title', file.name.replace(/\.pdf$/i, ''));

    setBannerError('');
    try {
      const { certificate } = await api.uploadCertificate(formData);
      setCertificates((cs) => [...cs, { id: certificate.id, title: certificate.title, fileUrl: certificate.fileUrl }]);
    } catch (err) {
      setBannerError(err.message || 'Certificate upload failed');
    }
  };
  const updateCertificateTitle = (id, value) => setCertificates((cs) => cs.map((c) => (c.id === id ? { ...c, title: value } : c)));
  const removeCertificate = async (id) => {
    setCertificates((cs) => cs.filter((c) => c.id !== id));
    try {
      await api.deleteCertificate(id);
    } catch (err) {
      setBannerError(err.message || 'Failed to remove certificate');
    }
  };

  // Languages
  const addLanguage = () => setLanguages((ls) => [...ls, blankLanguage()]);
  const updateLanguageField = (id, field, value) => setLanguages((ls) => ls.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  const removeLanguage = (id) => setLanguages((ls) => ls.filter((l) => l.id !== id));

  // References
  const addReference = () => setReferences((rs) => [...rs, blankReference()]);
  const updateReferenceField = (id, field, value) => setReferences((rs) => rs.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  const removeReference = (id) => setReferences((rs) => rs.filter((r) => r.id !== id));

  // Skills
  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills((sk) => [...sk, s]);
    setSkillInput('');
  };
  const removeSkill = (s) => setSkills((sk) => sk.filter((x) => x !== s));

  if (loadingResume) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5F1]">
        <Loader2 size={20} className="animate-spin text-[#C08A3E]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F1]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .ff-display { font-family: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif; }
        .ff-body { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
        .ff-mono { font-family: 'IBM Plex Mono', ui-monospace, monospace; }
      `}</style>

      <header className="bg-[#1E2128] text-[#F7F5F1] px-6 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-sm bg-[#C08A3E] flex items-center justify-center shrink-0">
            <span className="ff-display text-[#1E2128] text-xs font-bold">C</span>
          </div>
          <span className="ff-display font-semibold tracking-tight text-[15px]">CareerForge</span>
          <span className="ff-mono text-[10px] uppercase tracking-wider text-[#7B808C] ml-2 border-l border-[#3A3F4A] pl-2">
            Resume Builder
          </span>
        </div>
        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="ff-mono text-[10px] text-[#7B808C] hidden sm:inline">
              Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="border border-[#3A3F4A] hover:border-[#5A5F6A] disabled:opacity-60 text-[#F7F5F1] ff-body font-medium text-[13px] rounded-md px-3 py-2 flex items-center gap-1.5"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="bg-[#C08A3E] hover:bg-[#B07A32] disabled:opacity-60 text-[#1E2128] ff-body font-medium text-[13px] rounded-md px-4 py-2 flex items-center gap-1.5 transition-colors"
          >
            {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Download .docx
          </button>
          <button onClick={handleLogout} className="text-[#9BA0AC] hover:text-[#F7F5F1] p-2" aria-label="Log out">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {bannerError && (
        <div className="max-w-[1200px] mx-auto px-6 pt-4">
          <div className="px-3 py-2.5 rounded-md bg-[#FBEAE7] border border-[#EAC5BD] text-[#A8402E] text-[13px] ff-body flex items-center justify-between">
            {bannerError}
            <button onClick={() => setBannerError('')} className="text-[#A8402E] hover:opacity-70" aria-label="Dismiss">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <main className="max-w-[1200px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-8">
        {/* LEFT — form */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-[#E3DFD5] p-5">
            <CardHeading icon={User}>Basic info</CardHeading>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Field label="Full name" value={basics.fullName} onChange={(v) => updateBasics('fullName', v)} placeholder="Jordan Lee" />
              <Field label="Target role" value={basics.targetRole} onChange={(v) => updateBasics('targetRole', v)} placeholder="Frontend Engineer" />
              <Field label="Email" value={basics.email} onChange={(v) => updateBasics('email', v)} placeholder="you@example.com" />
              <Field label="Phone" value={basics.phone} onChange={(v) => updateBasics('phone', v)} placeholder="(555) 123-4567" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#E3DFD5] p-5">
            <CardHeading icon={Link2}>Links</CardHeading>
            <p className="ff-body text-[12.5px] text-[#8B909C] mt-1 mb-3">LinkedIn, GitHub, a portfolio, or anywhere your projects live.</p>

            {links.length > 0 && (
              <div className="space-y-2 mb-3">
                {links.map((link) => {
                  const Icon = linkIcon(link.label);
                  return (
                    <div key={link.id} className="flex items-center gap-2">
                      <Icon size={14} className="text-[#9BA0AC] shrink-0" />
                      <input
                        value={link.label}
                        onChange={(e) => updateLink(link.id, 'label', e.target.value)}
                        placeholder="Label"
                        className="w-28 border border-[#D8D4CB] rounded-md px-2 py-1.5 text-[13px] ff-body outline-none focus:border-[#C08A3E] focus:ring-2 focus:ring-[#C08A3E]/20"
                      />
                      <input
                        value={link.url}
                        onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                        placeholder="https://..."
                        className="flex-1 border border-[#D8D4CB] rounded-md px-2 py-1.5 text-[13px] ff-body outline-none focus:border-[#C08A3E] focus:ring-2 focus:ring-[#C08A3E]/20"
                      />
                      <button onClick={() => removeLink(link.id)} className="text-[#B0B4BD] hover:text-[#C0392B]" aria-label="Remove link">
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <button onClick={() => addLink('LinkedIn')} className="ff-body text-[12px] font-medium border border-[#D8D4CB] hover:border-[#C08A3E] rounded-full px-3 py-1.5 flex items-center gap-1.5">
                <Briefcase size={12} /> LinkedIn
              </button>
              <button onClick={() => addLink('GitHub')} className="ff-body text-[12px] font-medium border border-[#D8D4CB] hover:border-[#C08A3E] rounded-full px-3 py-1.5 flex items-center gap-1.5">
                <Code2 size={12} /> GitHub
              </button>
              <button onClick={() => addLink('Portfolio')} className="ff-body text-[12px] font-medium border border-[#D8D4CB] hover:border-[#C08A3E] rounded-full px-3 py-1.5 flex items-center gap-1.5">
                <Globe size={12} /> Portfolio
              </button>
              <button onClick={() => addLink('')} className="ff-body text-[12px] font-medium text-[#6B7080] hover:text-[#22252B] rounded-full px-3 py-1.5 flex items-center gap-1.5">
                <Plus size={12} /> Custom link
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#E3DFD5] p-5">
            <div className="flex items-center justify-between">
              <CardHeading icon={AlignLeft}>Summary</CardHeading>
              <button
                onClick={forgeSummary}
                disabled={!summary.raw.trim() || summary.status === 'forging'}
                className="ff-body text-[11.5px] font-medium bg-[#1E2128] disabled:bg-[#C7C4BA] text-[#F7F5F1] rounded px-2.5 py-1.5 flex items-center gap-1 transition-colors focus:outline-none focus:ring-2 focus:ring-[#C08A3E]"
              >
                {summary.status === 'forging' ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                {summary.status === 'forging' ? 'Forging' : 'Forge'}
              </button>
            </div>
            <p className="ff-body text-[12.5px] text-[#8B909C] mt-1 mb-3">One or two sentences on who you are and what you're looking for.</p>
            <textarea
              value={summary.raw}
              onChange={(e) => updateSummaryRaw(e.target.value)}
              rows={3}
              placeholder="I've been doing frontend dev for a few years and want to move into a bigger role."
              className="w-full border border-[#D8D4CB] rounded-md px-3 py-2 text-[14px] ff-body outline-none focus:border-[#C08A3E] focus:ring-2 focus:ring-[#C08A3E]/20 transition-shadow placeholder:text-[#B0B4BD] resize-none"
            />
            {summary.status === 'done' && (
              <div className="mt-2 pt-2 border-t border-[#EDEAE3] flex items-start gap-2">
                <span className="ff-mono text-[9px] uppercase tracking-wider text-[#C08A3E] mt-0.5 shrink-0">forged</span>
                <p className="ff-body text-[13px] text-[#22252B] font-medium">{summary.forged}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border border-[#E3DFD5] p-5">
            <div className="flex items-center justify-between mb-4">
              <CardHeading icon={Briefcase}>Experience</CardHeading>
              <button onClick={addExperience} className="ff-body text-[12.5px] text-[#C08A3E] hover:text-[#A8762E] flex items-center gap-1 font-medium">
                <Plus size={13} /> Add role
              </button>
            </div>

            <div className="space-y-6">
              {experience.map((exp, i) => (
                <div key={exp.id} className={i > 0 ? "pt-6 border-t border-[#EDEAE3]" : ""}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="grid grid-cols-2 gap-3 flex-1">
                      <Field label="Job title" value={exp.title} onChange={(v) => updateExperienceField(exp.id, 'title', v)} placeholder="Software Engineer" />
                      <Field label="Company" value={exp.company} onChange={(v) => updateExperienceField(exp.id, 'company', v)} placeholder="Acme Inc." />
                    </div>
                    {experience.length > 1 && (
                      <button onClick={() => removeExperience(exp.id)} className="mt-5 text-[#B0B4BD] hover:text-[#C0392B]" aria-label="Remove role">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                  <div className="mt-3">
                    <Field label="Dates" value={exp.dates} onChange={(v) => updateExperienceField(exp.id, 'dates', v)} placeholder="Jan 2023 — Present" />
                  </div>

                  <div className="mt-4 space-y-3">
                    {exp.bullets.map((b) => (
                      <div key={b.id} className="rounded-md border border-[#EDEAE3] bg-[#FBFAF7] p-3">
                        <div className="flex items-start gap-2">
                          <textarea
                            value={b.raw}
                            onChange={(e) => updateBulletRaw(exp.id, b.id, e.target.value)}
                            placeholder="e.g. helped fix bugs in the checkout flow"
                            rows={2}
                            className="flex-1 bg-transparent text-[13.5px] ff-body outline-none resize-none placeholder:text-[#B0B4BD]"
                          />
                          <div className="flex flex-col gap-1.5 shrink-0">
                            <button
                              onClick={() => forgeBullet(exp.id, b.id, b.raw)}
                              disabled={!b.raw.trim() || b.status === 'forging'}
                              className="ff-body text-[11.5px] font-medium bg-[#1E2128] disabled:bg-[#C7C4BA] text-[#F7F5F1] rounded px-2.5 py-1.5 flex items-center gap-1 transition-colors focus:outline-none focus:ring-2 focus:ring-[#C08A3E]"
                            >
                              {b.status === 'forging' ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                              {b.status === 'forging' ? 'Forging' : 'Forge'}
                            </button>
                            {exp.bullets.length > 1 && (
                              <button onClick={() => removeBullet(exp.id, b.id)} className="text-[#B0B4BD] hover:text-[#C0392B] self-center" aria-label="Remove bullet">
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        </div>

                        {b.status === 'done' && (
                          <div className="mt-2 pt-2 border-t border-[#EDEAE3] flex items-start gap-2">
                            <span className="ff-mono text-[9px] uppercase tracking-wider text-[#C08A3E] mt-0.5 shrink-0">forged</span>
                            <p className="ff-body text-[13px] text-[#22252B] font-medium">{b.forged}</p>
                          </div>
                        )}
                      </div>
                    ))}

                    <button onClick={() => addBullet(exp.id)} className="ff-body text-[12px] text-[#6B7080] hover:text-[#22252B] flex items-center gap-1">
                      <Plus size={12} /> Add bullet
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#E3DFD5] p-5">
            <div className="flex items-center justify-between mb-4">
              <CardHeading icon={GraduationCap}>Education</CardHeading>
              <button onClick={addEducation} className="ff-body text-[12.5px] text-[#C08A3E] hover:text-[#A8762E] flex items-center gap-1 font-medium">
                <Plus size={13} /> Add education
              </button>
            </div>

            <div className="space-y-5">
              {education.map((edu, i) => {
                const isSchoolLevel = edu.level === 'SSC' || edu.level === 'HSC';
                return (
                  <div key={edu.id} className={i > 0 ? "pt-5 border-t border-[#EDEAE3]" : ""}>
                    <div className="flex items-start justify-between gap-2">
                      <label className="block flex-1">
                        <span className="ff-mono text-[10px] uppercase tracking-wider text-[#6B7080]">Level</span>
                        <select
                          value={edu.level}
                          onChange={(e) => updateEducationField(edu.id, 'level', e.target.value)}
                          className="mt-1.5 w-full border border-[#D8D4CB] rounded-md px-3 py-2 text-[14px] ff-body outline-none focus:border-[#C08A3E] focus:ring-2 focus:ring-[#C08A3E]/20 bg-white"
                        >
                          <option value="">Select level</option>
                          {Object.entries(LEVEL_LABELS).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                          ))}
                        </select>
                      </label>
                      {education.length > 1 && (
                        <button onClick={() => removeEducation(edu.id)} className="mt-6 text-[#B0B4BD] hover:text-[#C0392B]" aria-label="Remove education entry">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>

                    <div className="mt-3">
                      <Field
                        label={isSchoolLevel ? 'School / Board' : 'Institution'}
                        value={edu.institution}
                        onChange={(v) => updateEducationField(edu.id, 'institution', v)}
                        placeholder={isSchoolLevel ? 'Delhi Public School, CBSE' : 'State University'}
                      />
                    </div>

                    {!isSchoolLevel && (
                      <div className="mt-3">
                        <Field
                          label="Field of study"
                          value={edu.fieldOfStudy}
                          onChange={(v) => updateEducationField(edu.id, 'fieldOfStudy', v)}
                          placeholder="Computer Science"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <Field label="Dates" value={edu.dates} onChange={(v) => updateEducationField(edu.id, 'dates', v)} placeholder="2021 — 2025" />
                      <Field label="Grade / CGPA (optional)" value={edu.grade} onChange={(v) => updateEducationField(edu.id, 'grade', v)} placeholder="8.7 CGPA" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#E3DFD5] p-5">
            <CardHeading icon={Award}>Certificates</CardHeading>
            <p className="ff-body text-[12.5px] text-[#8B909C] mt-1 mb-3">Upload a completion certificate — it'll show as a link in the preview and in the downloaded resume.</p>

            {certificates.length > 0 && (
              <div className="space-y-2 mb-3">
                {certificates.map((c) => (
                  <div key={c.id} className="flex items-center gap-2 rounded-md border border-[#EDEAE3] bg-[#FBFAF7] px-3 py-2">
                    <FileText size={14} className="text-[#C08A3E] shrink-0" />
                    <input
                      value={c.title}
                      onChange={(e) => updateCertificateTitle(c.id, e.target.value)}
                      className="flex-1 bg-transparent text-[13px] ff-body outline-none"
                    />
                    <a href={c.fileUrl} target="_blank" rel="noreferrer" className="ff-mono text-[10px] uppercase tracking-wider text-[#6B7080] hover:text-[#22252B] shrink-0">
                      View
                    </a>
                    <button onClick={() => removeCertificate(c.id)} className="text-[#B0B4BD] hover:text-[#C0392B] shrink-0" aria-label="Remove certificate">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className="inline-flex items-center gap-2 ff-body text-[13px] font-medium border border-dashed border-[#D8D4CB] hover:border-[#C08A3E] rounded-md px-3 py-2 cursor-pointer text-[#6B7080]">
              <Plus size={14} /> Upload PDF certificate
              <input type="file" accept="application/pdf" onChange={addCertificateFile} className="hidden" />
            </label>
          </div>

          <div className="bg-white rounded-lg border border-[#E3DFD5] p-5">
            <div className="flex items-center justify-between mb-4">
              <CardHeading icon={Languages}>Languages</CardHeading>
              <button onClick={addLanguage} className="ff-body text-[12.5px] text-[#C08A3E] hover:text-[#A8762E] flex items-center gap-1 font-medium">
                <Plus size={13} /> Add language
              </button>
            </div>
            <div className="space-y-3">
              {languages.map((lang) => (
                <div key={lang.id} className="flex items-center gap-2">
                  <input
                    value={lang.name}
                    onChange={(e) => updateLanguageField(lang.id, 'name', e.target.value)}
                    placeholder="German"
                    className="flex-1 border border-[#D8D4CB] rounded-md px-3 py-2 text-[14px] ff-body outline-none focus:border-[#C08A3E] focus:ring-2 focus:ring-[#C08A3E]/20"
                  />
                  <select
                    value={lang.proficiency}
                    onChange={(e) => updateLanguageField(lang.id, 'proficiency', e.target.value)}
                    className="border border-[#D8D4CB] rounded-md px-3 py-2 text-[14px] ff-body outline-none focus:border-[#C08A3E] focus:ring-2 focus:ring-[#C08A3E]/20 bg-white"
                  >
                    <option value="">Proficiency</option>
                    {PROFICIENCY_OPTIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  {languages.length > 1 && (
                    <button onClick={() => removeLanguage(lang.id)} className="text-[#B0B4BD] hover:text-[#C0392B] shrink-0" aria-label="Remove language">
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#E3DFD5] p-5">
            <div className="flex items-center justify-between mb-4">
              <CardHeading icon={Contact}>References</CardHeading>
              <button onClick={addReference} className="ff-body text-[12.5px] text-[#C08A3E] hover:text-[#A8762E] flex items-center gap-1 font-medium">
                <Plus size={13} /> Add reference
              </button>
            </div>
            <div className="space-y-5">
              {references.map((ref, i) => (
                <div key={ref.id} className={i > 0 ? "pt-5 border-t border-[#EDEAE3]" : ""}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="grid grid-cols-2 gap-3 flex-1">
                      <Field label="Name" value={ref.name} onChange={(v) => updateReferenceField(ref.id, 'name', v)} placeholder="Linda Hobbs" />
                      <Field label="Company" value={ref.company} onChange={(v) => updateReferenceField(ref.id, 'company', v)} placeholder="Blixo Resources" />
                    </div>
                    {references.length > 1 && (
                      <button onClick={() => removeReference(ref.id)} className="mt-5 text-[#B0B4BD] hover:text-[#C0392B]" aria-label="Remove reference">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <Field label="Email" value={ref.email} onChange={(v) => updateReferenceField(ref.id, 'email', v)} placeholder="hobbs.linda@example.org" />
                    <Field label="Phone" value={ref.phone} onChange={(v) => updateReferenceField(ref.id, 'phone', v)} placeholder="303-229-3451" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#E3DFD5] p-5">
            <CardHeading icon={Tag}>Skills</CardHeading>
            <div className="flex gap-2 mt-3">
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                placeholder="Type a skill and press Enter"
                className="flex-1 border border-[#D8D4CB] rounded-md px-3 py-2 text-[14px] ff-body outline-none focus:border-[#C08A3E] focus:ring-2 focus:ring-[#C08A3E]/20 transition-shadow placeholder:text-[#B0B4BD]"
              />
              <button onClick={addSkill} className="bg-[#1E2128] text-[#F7F5F1] rounded-md px-3 text-[13px] ff-body font-medium focus:outline-none focus:ring-2 focus:ring-[#C08A3E]">
                Add
              </button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {skills.map((s) => (
                  <span key={s} className="ff-mono text-[11.5px] bg-[#EDEAE3] text-[#22252B] rounded-full pl-3 pr-2 py-1 flex items-center gap-1.5">
                    {s}
                    <button onClick={() => removeSkill(s)} className="text-[#9BA0AC] hover:text-[#C0392B]" aria-label={`Remove ${s}`}>
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — live preview */}
        <div className="lg:sticky lg:top-20 h-fit">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6B9E78]" />
            <span className="ff-mono text-[10px] uppercase tracking-wider text-[#6B7080]">Live preview</span>
          </div>

          <div className="bg-white rounded-lg border border-[#E3DFD5] shadow-sm p-8 min-h-[600px]">
            <div className="text-center border-b border-[#EDEAE3] pb-4 mb-5">
              <h2 className="ff-display text-[22px] font-semibold text-[#22252B] tracking-tight">
                {basics.fullName || 'Your Name'}
              </h2>
              <p className="ff-body text-[13px] text-[#6B7080] mt-1">
                {[basics.email, basics.phone].filter(Boolean).join('  ·  ') || 'email@example.com  ·  (000) 000-0000'}
              </p>
              {basics.targetRole && (
                <p className="ff-mono text-[10.5px] uppercase tracking-wider text-[#C08A3E] mt-1.5">{basics.targetRole}</p>
              )}
              {links.filter((l) => l.url).length > 0 && (
                <div className="flex justify-center gap-3 mt-2 flex-wrap">
                  {links.filter((l) => l.url).map((l) => {
                    const Icon = linkIcon(l.label);
                    return (
                      <a key={l.id} href={l.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11.5px] ff-body text-[#6B7080] hover:text-[#C08A3E]">
                        <Icon size={11} /> {l.label || 'Link'}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {(summary.forged || summary.raw) && (
              <p className="ff-body text-[13px] text-[#3A3F4A] leading-relaxed mb-5">{summary.forged || summary.raw}</p>
            )}

            <h4 className="ff-mono text-[11px] uppercase tracking-wider text-[#22252B] border-b border-[#22252B] pb-1 mb-3">Experience</h4>
            <div className="space-y-4 mb-5">
              {experience.every((e) => !e.title && !e.company) ? (
                <p className="ff-body text-[13px] text-[#B0B4BD] italic">Your roles will appear here as you fill them in.</p>
              ) : (
                experience.map(
                  (exp) =>
                    (exp.title || exp.company) && (
                      <div key={exp.id}>
                        <div className="flex justify-between items-baseline">
                          <p className="ff-body text-[13.5px] font-semibold text-[#22252B]">
                            {exp.title || 'Job title'} {exp.company && `— ${exp.company}`}
                          </p>
                          <span className="ff-mono text-[10.5px] text-[#8B909C] shrink-0 ml-2">{exp.dates}</span>
                        </div>
                        <ul className="mt-1.5 space-y-1">
                          {exp.bullets
                            .filter((b) => b.forged || b.raw)
                            .map((b) => (
                              <li
                                key={b.id}
                                className="ff-body text-[12.5px] text-[#3A3F4A] leading-relaxed pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-[#C08A3E]"
                              >
                                {b.forged || b.raw}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )
                )
              )}
            </div>

            <h4 className="ff-mono text-[11px] uppercase tracking-wider text-[#22252B] border-b border-[#22252B] pb-1 mb-3">Education</h4>
            <div className="space-y-3 mb-5">
              {education.every((e) => !e.institution && !e.level) ? (
                <p className="ff-body text-[13px] text-[#B0B4BD] italic">Your education will appear here.</p>
              ) : (
                education.map(
                  (edu) =>
                    (edu.institution || edu.level) && (
                      <div key={edu.id}>
                        <div className="flex justify-between items-baseline">
                          <p className="ff-body text-[13.5px] font-semibold text-[#22252B]">
                            {edu.level ? LEVEL_LABELS[edu.level] : 'Education'}
                            {edu.fieldOfStudy && edu.level !== 'SSC' && edu.level !== 'HSC' ? ` in ${edu.fieldOfStudy}` : ''}
                            {edu.institution && ` — ${edu.institution}`}
                          </p>
                          <span className="ff-mono text-[10.5px] text-[#8B909C] shrink-0 ml-2">{edu.dates}</span>
                        </div>
                        {edu.grade && <p className="ff-body text-[12px] text-[#8B909C]">{edu.grade}</p>}
                      </div>
                    )
                )
              )}
            </div>

            {certificates.length > 0 && (
              <div className="mb-5">
                <h4 className="ff-mono text-[11px] uppercase tracking-wider text-[#22252B] border-b border-[#22252B] pb-1 mb-3">Certificates</h4>
                <ul className="space-y-1">
                  {certificates.map((c) => (
                    <li key={c.id} className="flex items-center gap-1.5">
                      <FileText size={11} className="text-[#C08A3E] shrink-0" />
                      <a href={c.fileUrl} target="_blank" rel="noreferrer" className="ff-body text-[12.5px] text-[#3A3F4A] underline underline-offset-2 hover:text-[#C08A3E]">
                        {c.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {languages.filter((l) => l.name).length > 0 && (
              <div className="mb-5">
                <h4 className="ff-mono text-[11px] uppercase tracking-wider text-[#22252B] border-b border-[#22252B] pb-1 mb-3">Languages</h4>
                <div className="grid grid-cols-2 gap-y-1.5 gap-x-4">
                  {languages.filter((l) => l.name).map((l) => (
                    <div key={l.id} className="flex justify-between items-baseline">
                      <span className="ff-body text-[12.5px] text-[#3A3F4A]">{l.name}</span>
                      {l.proficiency && <span className="ff-mono text-[10.5px] text-[#8B909C] ml-2">{l.proficiency}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {references.filter((r) => r.name).length > 0 && (
              <div className="mb-5">
                <h4 className="ff-mono text-[11px] uppercase tracking-wider text-[#22252B] border-b border-[#22252B] pb-1 mb-3">References</h4>
                <div className="space-y-3">
                  {references.filter((r) => r.name).map((r) => (
                    <div key={r.id}>
                      <p className="ff-body text-[13px] font-semibold text-[#22252B]">
                        {r.name}{r.company && ` from ${r.company}`}
                      </p>
                      {(r.email || r.phone) && (
                        <p className="ff-body text-[11.5px] text-[#8B909C]">
                          {[r.email, r.phone].filter(Boolean).join('  ·  ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {skills.length > 0 && (
              <>
                <h4 className="ff-mono text-[11px] uppercase tracking-wider text-[#22252B] border-b border-[#22252B] pb-1 mb-3">Skills</h4>
                <p className="ff-body text-[12.5px] text-[#3A3F4A]">{skills.join(' · ')}</p>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
