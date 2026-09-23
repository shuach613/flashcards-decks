"use client";

import { deleteUser, setUserAdmin, transferPrimaryAdmin } from "./role-actions";

type UserManagementActionsProps = {
  userId: string;
  role: string;
  labels: {
    makeAdmin: string;
    revokeAdmin: string;
    transferPrimary: string;
    deleteUser: string;
    transferConfirmation: string;
    deleteConfirmation: string;
  };
};

export function UserManagementActions({
  userId,
  role,
  labels,
}: UserManagementActionsProps) {
  return (
    <div className="flex flex-wrap justify-end gap-2">
      <form action={setUserAdmin.bind(null, userId, role !== "ADMIN")}>
        <button
          type="submit"
          className="rounded-full border border-evergreen px-4 py-2 text-sm font-semibold text-evergreen transition hover:bg-evergreen hover:text-white"
        >
          {role === "ADMIN" ? labels.revokeAdmin : labels.makeAdmin}
        </button>
      </form>

      {role === "ADMIN" && (
        <form
          action={transferPrimaryAdmin.bind(null, userId)}
          onSubmit={(event) => {
            if (!window.confirm(labels.transferConfirmation)) {
              event.preventDefault();
            }
          }}
        >
          <button
            type="submit"
            className="rounded-full border border-evergreen px-4 py-2 text-sm font-semibold text-evergreen transition hover:bg-evergreen hover:text-white"
          >
            {labels.transferPrimary}
          </button>
        </form>
      )}

      <form
        action={deleteUser.bind(null, userId)}
        onSubmit={(event) => {
          if (!window.confirm(labels.deleteConfirmation)) {
            event.preventDefault();
          }
        }}
      >
        <button
          type="submit"
          className="rounded-full border border-red-700 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-700 hover:text-white"
        >
          {labels.deleteUser}
        </button>
      </form>
    </div>
  );
}
