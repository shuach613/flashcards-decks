import { ForgotPasswordForm } from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto mt-16 max-w-sm px-6">
      <div className="rounded-2xl border border-neutral-muted bg-white p-8 shadow-[0_2px_8px_rgba(25,51,37,0.08)]">
        <h1 className="mb-3 text-2xl font-extrabold tracking-tight text-brand-primary">
          Forgot your password?
        </h1>
        <p className="mb-6 text-sm text-text-muted">
          Enter your registered email address and we will send you a reset link.
        </p>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
