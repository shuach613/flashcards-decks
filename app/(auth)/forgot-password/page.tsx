import { ForgotPasswordForm } from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto mt-16 max-w-sm px-6">
      <div className="rounded-2xl border border-sand bg-white p-8 shadow-[0_2px_8px_rgba(25,51,37,0.08)]">
        <h1 className="mb-3 text-2xl font-extrabold tracking-tight text-evergreen">
          Forgot your password?
        </h1>
        <p className="mb-6 text-sm text-dark-gray">
          Enter your registered email address and we will send you a reset link.
        </p>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
