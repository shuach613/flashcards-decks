"use client";

type ConfirmAction = (formData: FormData) => void | Promise<void>;

export function ConfirmActionForm({
  action,
  confirmation,
  label,
  className,
}: {
  action: ConfirmAction;
  confirmation: string;
  label: string;
  className?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirmation)) event.preventDefault();
      }}
      className={className}
    >
      <button
        type="submit"
        className="rounded-full border border-sunset-orange/30 px-4 py-1.5 text-sm font-medium text-sunset-orange transition hover:bg-sunset-orange/5"
      >
        {label}
      </button>
    </form>
  );
}
