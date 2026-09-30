"use client";

import { useActionState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { t, type Locale } from "@/lib/i18n";
import { MfaCopyButton } from "./mfa-copy-button";
import {
  confirmMfaSetup,
  disableMfa,
  startMfaSetup,
  type MfaState,
} from "./actions";

export function MfaSettings({ enabled, locale }: { enabled: boolean; locale: Locale }) {
  const [setupState, setupAction, setupPending] = useActionState<MfaState, FormData>(
    startMfaSetup,
    undefined
  );
  const [confirmState, confirmAction, confirmPending] = useActionState<MfaState, FormData>(
    confirmMfaSetup,
    undefined
  );
  const [disableState, disableAction, disablePending] = useActionState<MfaState, FormData>(
    disableMfa,
    undefined
  );

  if (enabled) {
    return (
      <div className="mt-5 rounded-xl border border-neutral-muted bg-cream p-4">
        <p className="font-semibold text-brand-primary">{t(locale, "settings.mfaEnabledStatus")}</p>
        <p className="mt-1 text-sm text-text-muted">{t(locale, "settings.mfaDisableBody")}</p>
        <form action={disableAction} className="mt-4 flex flex-col gap-3">
          <input name="password" type="password" required placeholder={t(locale, "auth.passwordLabel")} className="rounded-xl border border-neutral-muted bg-white px-3.5 py-2.5 text-sm" />
          <input name="code" inputMode="numeric" required placeholder={t(locale, "settings.mfaCodePlaceholder")} className="rounded-xl border border-neutral-muted bg-white px-3.5 py-2.5 text-sm" />
          {disableState?.error && <p className="text-sm text-status-danger">{disableState.error}</p>}
          {disableState?.message && <p className="text-sm text-brand-accent">{disableState.message}</p>}
          <button type="submit" disabled={disablePending} className="self-start rounded-full border border-status-danger/30 px-4 py-1.5 text-sm font-semibold text-status-danger disabled:opacity-50">
            {t(locale, "settings.mfaDisable")}
          </button>
        </form>
      </div>
    );
  }

  const setup = setupState?.secret && setupState.otpauthUri;
  const recoveryCodes = confirmState?.recoveryCodes;
  return (
    <div id="mfa" className="mt-5 rounded-xl border border-neutral-muted bg-cream p-4">
      <p className="font-semibold text-brand-primary">{t(locale, "settings.mfaNotEnabled")}</p>
      <p className="mt-1 text-sm text-text-muted">{t(locale, "settings.mfaBody")}</p>
      {!setup && !recoveryCodes && (
        <form action={setupAction} className="mt-4 flex flex-col gap-3">
          <input name="password" type="password" required placeholder={t(locale, "auth.passwordLabel")} className="rounded-xl border border-neutral-muted bg-white px-3.5 py-2.5 text-sm" />
          {setupState?.error && <p className="text-sm text-status-danger">{setupState.error}</p>}
          <button type="submit" disabled={setupPending} className="self-start rounded-full bg-brand-primary px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50">
            {t(locale, "settings.mfaStart")}
          </button>
        </form>
      )}
      {setup && !recoveryCodes && (
        <>
          <p className="mt-4 text-sm text-text-muted">{t(locale, "settings.mfaScanBody")}</p>
          <div className="mt-4 inline-flex rounded-xl bg-white p-4" aria-label="MFA setup QR code">
            <QRCodeSVG value={setup} size={220} level="M" includeMargin />
          </div>
          <details className="mt-4 rounded-xl border border-neutral-muted bg-white p-3">
            <summary className="min-h-11 cursor-pointer list-none py-2 text-sm font-semibold text-brand-primary sm:min-h-0 [&::-webkit-details-marker]:hidden">
              {t(locale, "settings.mfaManualSetup")}
            </summary>
            <p className="mt-2 break-all font-mono text-xs text-brand-primary">{setup}</p>
            <MfaCopyButton
              value={setup}
              label={t(locale, "settings.mfaCopyUri")}
              copiedLabel={t(locale, "settings.mfaCopied")}
            />
            <p className="mt-3 text-xs text-text-muted">{t(locale, "settings.mfaManualSecret")} <span className="break-all font-mono">{setupState.secret}</span></p>
          </details>
          <form action={confirmAction} className="mt-4 flex flex-col gap-3">
            <input name="code" inputMode="numeric" required placeholder={t(locale, "settings.mfaCodePlaceholder")} className="rounded-xl border border-neutral-muted bg-white px-3.5 py-2.5 text-sm" />
            {confirmState?.error && <p className="text-sm text-status-danger">{confirmState.error}</p>}
            <button type="submit" disabled={confirmPending} className="self-start rounded-full bg-brand-primary px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50">
              {t(locale, "settings.mfaConfirm")}
            </button>
          </form>
        </>
      )}
      {recoveryCodes && (
        <div className="mt-4">
          <p className="text-sm font-semibold text-status-danger">{t(locale, "settings.mfaRecoveryWarning")}</p>
          <p className="mt-1 text-sm text-text-muted">{t(locale, "settings.mfaRecoveryBody")}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-white p-3 font-mono text-sm">
            {recoveryCodes.map((code) => <span key={code}>{code}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}
