import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Check, Eye, EyeOff, User, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEMO_PAIRS = [
  {
    before: "worked on stuff for the team project",
    after: "Led cross-functional initiative that lifted team output 30%",
  },
  {
    before: "helped fix bugs in the app",
    after: "Resolved 40+ production defects, cutting crash rate by 18%",
  },
  {
    before: "made the website look better",
    after: "Redesigned checkout flow, raising conversion 12% in 6 weeks",
  },
];

export default function AuthPage() {
  const navigate = useNavigate();
  const { register, login } = useAuth();

  const [mode, setMode] = useState('signin');
  const [pairIndex, setPairIndex] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const id = setInterval(() => {
      setPairIndex((i) => (i + 1) % DEMO_PAIRS.length);
    }, 4200);
    return () => clearInterval(id);
  }, [reducedMotion]);

  const pair = DEMO_PAIRS[pairIndex];

  const updateForm = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const switchMode = (next) => {
    setMode(next);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'signup') {
        await register({ name: form.name, email: form.email, password: form.password });
      } else {
        await login({ email: form.email, password: form.password });
      }
      navigate('/resume');
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#F7F5F1]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .ff-display { font-family: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif; }
        .ff-body { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
        .ff-mono { font-family: 'IBM Plex Mono', ui-monospace, monospace; }
        @keyframes fadeSlide {
          0% { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .fade-slide { animation: fadeSlide 0.5s ease forwards; }
      `}</style>

      {/* LEFT — brand / forge panel */}
      <div className="relative md:w-[46%] bg-[#1E2128] text-[#F7F5F1] px-8 py-10 md:p-12 flex flex-col justify-between overflow-hidden">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-sm bg-[#C08A3E] flex items-center justify-center shrink-0">
            <span className="ff-display text-[#1E2128] text-sm font-bold">C</span>
          </div>
          <span className="ff-display font-semibold tracking-tight text-lg">CareerForge</span>
        </div>

        <div className="mt-10 md:mt-0">
          <h1 className="ff-display text-3xl md:text-[2.5rem] leading-[1.08] font-semibold tracking-tight max-w-md">
            Raw experience,<br />forged into offers.
          </h1>
          <p className="ff-body text-[#B8BCC6] mt-4 max-w-sm text-[15px] leading-relaxed">
            Every bullet point gets rewritten, every skill gets verified, before it ever reaches an ATS.
          </p>

          <div
            key={pairIndex}
            className={`${!reducedMotion ? 'fade-slide' : ''} mt-8 rounded-lg border border-[#3A3F4A] bg-[#262A33] p-4 max-w-md`}
          >
            <div className="flex items-start gap-2">
              <span className="ff-mono text-[10px] uppercase tracking-wider text-[#7B808C] mt-0.5 shrink-0">raw</span>
              <p className="ff-mono text-[13px] text-[#8B909C] line-through decoration-[#5A5F6A]">
                {pair.before}
              </p>
            </div>
            <div className="flex items-start gap-2 mt-3">
              <span className="ff-mono text-[10px] uppercase tracking-wider text-[#C08A3E] mt-0.5 shrink-0">forged</span>
              <p className="ff-body text-[13.5px] text-[#F7F5F1] font-medium">
                {pair.after}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-5 ff-mono text-[11px] text-[#9BA0AC] mt-10 md:mt-0">
          <span className="flex items-center gap-1.5"><Check size={13} className="text-[#6B9E78]" /> ATS-verified</span>
          <span className="flex items-center gap-1.5"><Check size={13} className="text-[#6B9E78]" /> Skill-tested</span>
        </div>
      </div>

      {/* RIGHT — form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 md:p-12">
        <div className="w-full max-w-[380px]">
          <div className="flex gap-1 mb-8 p-1 bg-[#EDEAE3] rounded-lg w-fit ff-body text-[14px]">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className={`px-4 py-1.5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#C08A3E] ${mode === 'signin' ? 'bg-[#1E2128] text-[#F7F5F1]' : 'text-[#5A5F6A] hover:text-[#1E2128]'}`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`px-4 py-1.5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#C08A3E] ${mode === 'signup' ? 'bg-[#1E2128] text-[#F7F5F1]' : 'text-[#5A5F6A] hover:text-[#1E2128]'}`}
            >
              Create account
            </button>
          </div>

          <h2 className="ff-display text-2xl font-semibold text-[#22252B] tracking-tight">
            {mode === 'signin' ? 'Welcome back' : 'Start building'}
          </h2>
          <p className="ff-body text-[#6B7080] text-[14px] mt-1.5 mb-7">
            {mode === 'signin' ? 'Sign in to pick up where you left off.' : 'A resume, forged in minutes.'}
          </p>

          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-md bg-[#FBEAE7] border border-[#EAC5BD] text-[#A8402E] text-[13px] ff-body">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <label className="block">
                <span className="ff-mono text-[11px] uppercase tracking-wider text-[#6B7080]">Full name</span>
                <div className="mt-1.5 flex items-center gap-2 border border-[#D8D4CB] rounded-md px-3 py-2.5 focus-within:border-[#C08A3E] focus-within:ring-2 focus-within:ring-[#C08A3E]/20 transition-shadow">
                  <User size={16} className="text-[#9BA0AC] shrink-0" />
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => updateForm('name', e.target.value)}
                    placeholder="Jordan Lee"
                    className="ff-body w-full text-[14px] outline-none placeholder:text-[#B0B4BD]"
                  />
                </div>
              </label>
            )}

            <label className="block">
              <span className="ff-mono text-[11px] uppercase tracking-wider text-[#6B7080]">Email</span>
              <div className="mt-1.5 flex items-center gap-2 border border-[#D8D4CB] rounded-md px-3 py-2.5 focus-within:border-[#C08A3E] focus-within:ring-2 focus-within:ring-[#C08A3E]/20 transition-shadow">
                <Mail size={16} className="text-[#9BA0AC] shrink-0" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => updateForm('email', e.target.value)}
                  placeholder="you@example.com"
                  className="ff-body w-full text-[14px] outline-none placeholder:text-[#B0B4BD]"
                />
              </div>
            </label>

            <label className="block">
              <span className="ff-mono text-[11px] uppercase tracking-wider text-[#6B7080]">Password</span>
              <div className="mt-1.5 flex items-center gap-2 border border-[#D8D4CB] rounded-md px-3 py-2.5 focus-within:border-[#C08A3E] focus-within:ring-2 focus-within:ring-[#C08A3E]/20 transition-shadow">
                <Lock size={16} className="text-[#9BA0AC] shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => updateForm('password', e.target.value)}
                  placeholder="••••••••"
                  className="ff-body w-full text-[14px] outline-none placeholder:text-[#B0B4BD]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="text-[#9BA0AC] hover:text-[#5A5F6A] shrink-0"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 bg-[#1E2128] hover:bg-[#2A2E37] disabled:opacity-60 text-[#F7F5F1] ff-body font-medium text-[14px] rounded-md py-2.5 flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#C08A3E] focus:ring-offset-2"
            >
              {submitting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <>
                  {mode === 'signin' ? 'Sign in' : 'Create account'}
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <p className="ff-body text-[13px] text-[#6B7080] mt-6 text-center">
            {mode === 'signin' ? (
              <>New here? <button onClick={() => switchMode('signup')} className="text-[#22252B] font-medium underline underline-offset-2">Create an account</button></>
            ) : (
              <>Already have an account? <button onClick={() => switchMode('signin')} className="text-[#22252B] font-medium underline underline-offset-2">Sign in</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
