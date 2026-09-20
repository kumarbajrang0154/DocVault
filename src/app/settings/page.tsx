'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Clock,
  ShieldCheck,
  Lock,
  Database,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Bell,
  Send,
} from 'lucide-react';
import { updateUserSettingsAction, getUserSettingsAction } from '@/app/actions/documents';
import { AuthGuard } from '@/components/layout/AuthGuard';

function SettingsContent() {
  const [reminderThresholds, setReminderThresholds] = useState<number[]>([30, 60, 90]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isTestingCron, setIsTestingCron] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [cronResult, setCronResult] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await getUserSettingsAction();
        setReminderThresholds(res.reminderThresholds);
      } catch (err) {
        console.error('Failed to load user settings:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleToggleThreshold = async (day: number) => {
    let updated: number[];
    if (reminderThresholds.includes(day)) {
      if (reminderThresholds.length === 1) {
        setErrorMessage('At least one reminder threshold must be selected.');
        return;
      }
      updated = reminderThresholds.filter((d) => d !== day);
    } else {
      updated = [...reminderThresholds, day].sort((a, b) => a - b);
    }

    setIsSaving(true);
    setSaveSuccess(null);
    setErrorMessage(null);

    try {
      const res = await updateUserSettingsAction(updated);
      if (res.success && res.reminderThresholds) {
        setReminderThresholds(res.reminderThresholds);
        setSaveSuccess(`Updated reminder thresholds to: ${res.reminderThresholds.join(', ')} days`);
      } else {
        setErrorMessage(res.error || 'Failed to save settings.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving settings';
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestCron = async () => {
    setIsTestingCron(true);
    setCronResult(null);
    try {
      const res = await fetch('/api/cron/reminders');
      const data = await res.json();
      setCronResult(
        `Cron executed successfully! Processed ${data.processed || 0} expiring document(s).`
      );
    } catch (_err) {
      setCronResult('Failed to execute test cron job.');
    } finally {
      setIsTestingCron(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          <Settings className="h-7 w-7 text-purple-400" />
          Settings & Vault Preferences
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Configure personal notification thresholds, review encryption status, and test automated expiry alerts.
        </p>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-950/30 p-4 text-xs font-semibold text-emerald-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-950/30 p-4 text-xs font-semibold text-rose-300">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Expiry Reminder Threshold Options */}
      <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Personal Expiry Warning Thresholds</h2>
            <p className="text-xs text-zinc-400">
              Toggle which milestone days prior to document expiration trigger warnings.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[30, 60, 90].map((days) => {
            const isSelected = reminderThresholds.includes(days);

            return (
              <button
                key={days}
                type="button"
                onClick={() => handleToggleThreshold(days)}
                disabled={isSaving}
                className={`relative flex flex-col justify-between rounded-2xl border p-5 text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-600/15 text-white shadow-lg shadow-blue-600/10'
                    : 'border-white/10 bg-zinc-950/60 text-zinc-400 hover:border-white/20 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-extrabold text-white">{days} Days</span>
                  <Clock className={`h-5 w-5 ${isSelected ? 'text-blue-400' : 'text-zinc-600'}`} />
                </div>
                <p className="text-xs text-zinc-400">
                  Alert when passport, license, or policy is within {days} days of expiry.
                </p>
                {isSelected && (
                  <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-blue-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Enabled
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual Cron Reminder Trigger Test */}
      <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Test Expiry Reminder Cron</h2>
              <p className="text-xs text-zinc-400">
                Manually trigger the background cron job that scans and logs document expiry warnings.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTestCron}
            disabled={isTestingCron}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 text-xs font-bold text-white shadow-md hover:bg-purple-500 disabled:opacity-50 cursor-pointer"
          >
            {isTestingCron ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Running Scan...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Trigger Scan Now</span>
              </>
            )}
          </button>
        </div>

        {cronResult && (
          <p className="text-xs font-semibold text-purple-300 bg-purple-950/30 p-3 rounded-xl border border-purple-500/20">
            {cronResult}
          </p>
        )}
      </div>

      {/* Security & System Information */}
      <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 sm:p-8 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          Security Architecture Status
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="rounded-2xl border border-white/5 bg-zinc-950/60 p-4 space-y-1">
            <span className="text-zinc-500 block text-[11px] uppercase font-bold tracking-wider">
              File Encryption Standard
            </span>
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Lock className="h-4 w-4" /> AES-256-GCM (Server-Side)
            </div>
            <p className="text-zinc-400 text-[11px] pt-1">
              All uploads are binary encrypted in memory before storage.
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-zinc-950/60 p-4 space-y-1">
            <span className="text-zinc-500 block text-[11px] uppercase font-bold tracking-wider">
              Cloud Storage Asset Protection
            </span>
            <div className="flex items-center gap-2 text-blue-400 font-bold">
              <Database className="h-4 w-4" /> Cloudinary (Authenticated Assets)
            </div>
            <p className="text-zinc-400 text-[11px] pt-1">
              Assets set to authenticated type. Files streamed via verified owner session routes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  );
}
