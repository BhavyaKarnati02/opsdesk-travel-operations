import React, { useState, useEffect } from 'react';
import {
  MailCheck,
  RefreshCw,
  Send,
  LogOut,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface EmailVerificationModalProps {
  isOpen: boolean;
  email: string;
  userName?: string;
}

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  isOpen,
  email,
  userName,
}) => {
  const { resendVerificationEmail, refreshVerificationStatus, logout } = useAuth();

  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Cooldown timer for resend button
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Automatically re-check verification when user returns to this browser tab
  useEffect(() => {
    if (!isOpen) return;
    const handleFocus = () => {
      refreshVerificationStatus().catch(() => {});
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [isOpen, refreshVerificationStatus]);

  if (!isOpen) return null;

  const handleCheckVerified = async () => {
    setErrorMsg(null);
    setStatusMsg(null);
    setChecking(true);
    try {
      const verified = await refreshVerificationStatus();
      if (!verified) {
        setErrorMsg(
          'Your email is not verified yet. Please click the verification link in your inbox (or spam folder), then click Continue.'
        );
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to check verification status.');
    } finally {
      setChecking(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setErrorMsg(null);
    setStatusMsg(null);
    setResending(true);
    try {
      await resendVerificationEmail();
      setStatusMsg(`A fresh verification email has been sent to ${email}.`);
      setCooldown(60);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  const handleSignOut = async () => {
    setErrorMsg(null);
    await logout();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1B2C45]/75 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="verify-email-title"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-[#263B5B] text-white px-6 py-5 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#20A89E] to-[#4267D5] flex items-center justify-center text-white shrink-0 shadow-sm">
            <MailCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 id="verify-email-title" className="text-base font-bold tracking-tight">
                Verify Your Email Address
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Account activation required to access OpsDesk
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <div className="p-4 rounded-xl bg-[#F1F5FA] border border-slate-200 space-y-2 text-xs text-slate-700 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-[#263B5B]">
              <ShieldCheck className="w-4 h-4 text-[#20A89E]" />
              <span>Welcome{userName ? `, ${userName}` : ''}!</span>
            </div>
            <p>
              We sent an account verification link to{' '}
              <strong className="text-[#263B5B] break-all">{email}</strong>.
            </p>
            <p className="text-slate-600">
              Please open that email and click the verification link before accessing the OpsDesk
              travel operations platform. Check your spam or junk folder if you do not see it within
              a minute.
            </p>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-[#FFE4DF] border border-rose-300 text-rose-900 text-xs font-semibold flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {statusMsg && (
            <div
              role="status"
              className="p-3 rounded-xl bg-[#DDF5EC] border border-emerald-300 text-emerald-950 text-xs font-semibold flex items-start gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Primary Actions */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleCheckVerified}
              disabled={checking}
              className="w-full py-2.5 px-4 bg-[#4267D5] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
              <span>{checking ? 'Checking verification status...' : "I've Verified My Email — Continue"}</span>
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-[#263B5B] font-semibold text-xs rounded-xl border border-slate-200 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-[#20A89E]" />
              <span>
                {resending
                  ? 'Sending verification email...'
                  : cooldown > 0
                  ? `Resend Verification Email (${cooldown}s)`
                  : 'Resend Verification Email'}
              </span>
            </button>
          </div>

          {/* Footer / Sign Out */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Wrong email address?</span>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 font-semibold text-rose-700 hover:text-rose-800 hover:underline cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out &amp; Use Another Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
