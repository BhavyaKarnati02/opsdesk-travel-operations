import React, { useState, useEffect } from 'react';
import {
  Plane,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Layers,
  ClockAlert,
  Cpu,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export type AuthMode = 'signin' | 'signup' | 'forgot';

interface AuthPageProps {
  mode: AuthMode;
  onChangeMode: (mode: AuthMode) => void;
  redirectNotice?: string | null;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const AuthPage: React.FC<AuthPageProps> = ({
  mode,
  onChangeMode,
  redirectNotice,
}) => {
  const { signIn, signUp, resetPassword } = useAuth();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Show/hide password toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Submission & feedback states
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Reset form errors & password visibility when switching modes
  useEffect(() => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [mode]);

  const validateSignIn = (): string | null => {
    if (!email.trim()) return 'Work email address is required.';
    if (!EMAIL_REGEX.test(email.trim())) return 'Please enter a valid email address.';
    if (!password) return 'Password is required.';
    return null;
  };

  const validateSignUp = (): string | null => {
    const cleanName = name.trim();
    if (!cleanName) return 'Full name is required.';
    if (cleanName.length < 2) return 'Full name must be at least 2 characters.';
    if (cleanName.length > 100) return 'Full name cannot exceed 100 characters.';
    if (!email.trim()) return 'Work email address is required.';
    if (!EMAIL_REGEX.test(email.trim())) return 'Please enter a valid email address.';
    if (!password) return 'Password is required.';
    if (password.length < 6) return 'Password must be at least 6 characters long.';
    if (password !== confirmPassword) return 'Passwords do not match. Please re-enter.';
    return null;
  };

  const validateForgot = (): string | null => {
    if (!email.trim()) return 'Please enter your registered email address.';
    if (!EMAIL_REGEX.test(email.trim())) return 'Please enter a valid email address.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (mode === 'signin') {
      const validationErr = validateSignIn();
      if (validationErr) {
        setErrorMsg(validationErr);
        return;
      }
      setSubmitting(true);
      try {
        await signIn(email, password);
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Unable to sign in.');
      } finally {
        setSubmitting(false);
      }
    } else if (mode === 'signup') {
      const validationErr = validateSignUp();
      if (validationErr) {
        setErrorMsg(validationErr);
        return;
      }
      setSubmitting(true);
      try {
        await signUp(name, email, password);
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Unable to create account.');
      } finally {
        setSubmitting(false);
      }
    } else if (mode === 'forgot') {
      const validationErr = validateForgot();
      if (validationErr) {
        setErrorMsg(validationErr);
        return;
      }
      setSubmitting(true);
      try {
        await resetPassword(email);
        setSuccessMsg(
          `Password reset link sent to ${email.trim()}. Please check your inbox and spam folder.`
        );
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Unable to send reset link.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5FA] flex flex-col lg:flex-row">
      {/* Left Brand & Operations Context Panel */}
      <div className="lg:w-[44%] bg-[#263B5B] text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
        {/* Top Brand Mark */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#20A89E] to-[#4267D5] flex items-center justify-center text-white shadow-lg shadow-black/20">
              <Plane className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight">OpsDesk</span>
                <span className="text-[11px] bg-[#20A89E]/20 text-[#20A89E] font-semibold px-2 py-0.5 rounded border border-[#20A89E]/40">
                  TBO
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Intelligent Travel Operations Management System
              </p>
            </div>
          </div>

          <div className="mt-10 lg:mt-14 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B2C45] border border-[#354E75] text-xs font-semibold text-amber-300">
              <ShieldCheck className="w-3.5 h-3.5 text-[#20A89E]" />
              <span>Authenticated Support Workspace</span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold leading-snug tracking-tight">
              Unified, Travel-Aware Case Operations for TBO Support Teams
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-md">
              Sign in with your verified operator credentials to manage multi-ticket agency cases,
              monitor live check-in SLAs, and preserve communication continuity.
            </p>
          </div>

          {/* Core Capabilities Overview */}
          <div className="mt-8 space-y-3 hidden sm:block">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#1B2C45]/70 border border-[#354E75]">
              <Layers className="w-4 h-4 text-[#20A89E] mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-bold text-white">Unified Booking Cases</div>
                <div className="text-[11px] text-slate-300">
                  Connects agency, traveler, and supplier complaints under a single booking context.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#1B2C45]/70 border border-[#354E75]">
              <ClockAlert className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-bold text-white">Travel-Aware SLA Guardian</div>
                <div className="text-[11px] text-slate-300">
                  Live check-in &amp; LCD countdowns with automated Duty Manager escalations.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#1B2C45]/70 border border-[#354E75]">
              <Cpu className="w-4 h-4 text-[#4267D5] mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-bold text-white">Transparent Smart Routing</div>
                <div className="text-[11px] text-slate-300">
                  Rule-based agent matching across territory, category expertise, and live capacity.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="relative z-10 pt-8 mt-8 border-t border-[#354E75] flex items-center justify-between text-xs text-slate-400">
          <span>VOYAGEHACK 4.0 • TBO Operations</span>
          <span className="font-mono text-[11px] text-slate-300">Firebase Auth Protected</span>
        </div>
      </div>

      {/* Right Authentication Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/60 p-7 sm:p-8 space-y-6">
          {/* Header & Tabs */}
          <div>
            {mode !== 'forgot' ? (
              <div className="flex p-1 rounded-xl bg-slate-100 border border-slate-200 mb-6">
                <button
                  type="button"
                  onClick={() => onChangeMode('signin')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    mode === 'signin'
                      ? 'bg-[#263B5B] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => onChangeMode('signup')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-[#263B5B] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Create Account
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onChangeMode('signin')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4267D5] hover:underline mb-4 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
            )}

            <h2 className="text-xl font-bold text-[#263B5B] tracking-tight">
              {mode === 'signin' && 'Sign in to OpsDesk'}
              {mode === 'signup' && 'Register Operator Account'}
              {mode === 'forgot' && 'Reset your password'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {mode === 'signin' && 'Enter your email and password to access TBO operations modules.'}
              {mode === 'signup' && 'Create a new TBO support operator profile stored in Firestore.'}
              {mode === 'forgot' &&
                'Enter your registered work email and we will send a Firebase password reset link.'}
            </p>
          </div>

          {/* Protected Route Redirect Notice */}
          {redirectNotice && !errorMsg && !successMsg && (
            <div className="p-3 rounded-xl bg-[#FFF0D5] border border-amber-300 text-amber-900 text-xs font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>{redirectNotice}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-[#FFE4DF] border border-rose-300 text-rose-900 text-xs font-semibold flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div
              role="status"
              className="p-3 rounded-xl bg-[#DDF5EC] border border-emerald-300 text-emerald-950 text-xs font-semibold flex items-start gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Full Name (Sign Up only) */}
            {mode === 'signup' && (
              <div>
                <label
                  htmlFor="auth-name"
                  className="block text-xs font-bold text-slate-700 mb-1.5"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#4267D5] focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="auth-email"
                className="block text-xs font-bold text-slate-700 mb-1.5"
              >
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@opsdesk.tbo.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#4267D5] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Password Field (Sign In & Sign Up) */}
            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="auth-password"
                    className="block text-xs font-bold text-slate-700"
                  >
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => onChangeMode('forgot')}
                      className="text-xs font-semibold text-[#4267D5] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? 'Minimum 6 characters' : 'Enter your password'}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#4267D5] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password Field (Sign Up only) */}
            {mode === 'signup' && (
              <div>
                <label
                  htmlFor="auth-confirm-password"
                  className="block text-xs font-bold text-slate-700 mb-1.5"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#4267D5] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-[#4267D5] hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-sm shadow-blue-900/10 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
            >
              {submitting ? (
                <span>
                  {mode === 'signin' && 'Signing in...'}
                  {mode === 'signup' && 'Creating account...'}
                  {mode === 'forgot' && 'Sending reset link...'}
                </span>
              ) : (
                <>
                  <span>
                    {mode === 'signin' && 'Sign In to OpsDesk'}
                    {mode === 'signup' && 'Create Operator Account'}
                    {mode === 'forgot' && 'Send Reset Link'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Mode Switcher */}
          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            {mode === 'signin' && (
              <span>
                New to OpsDesk?{' '}
                <button
                  type="button"
                  onClick={() => onChangeMode('signup')}
                  className="font-bold text-[#20A89E] hover:underline cursor-pointer"
                >
                  Create an operator account
                </button>
              </span>
            )}
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <p className="text-[11px] text-slate-400">
                  New accounts receive standard Support Agent access. Admin roles cannot be self-assigned.
                </p>
                <span>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => onChangeMode('signin')}
                    className="font-bold text-[#4267D5] hover:underline cursor-pointer"
                  >
                    Sign in here
                  </button>
                </span>
              </div>
            )}
            {mode === 'forgot' && (
              <span>
                Remembered your password?{' '}
                <button
                  type="button"
                  onClick={() => onChangeMode('signin')}
                  className="font-bold text-[#4267D5] hover:underline cursor-pointer"
                >
                  Return to Sign In
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
