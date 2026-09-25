import UserActions from "./UserActions";

export type UserRow = {
  id: string;
  name: string | null;
  email: string;
  username: string | null;
  role: "USER" | "ADMIN";
  createdAt: Date;
  postCount: number;
};

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export default function UserTable({
  users,
  currentUserId,
}: {
  users: UserRow[];
  currentUserId: string;
}) {
    if (users.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border bg-muted/5">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted"
            aria-hidden="true"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <path d="M21 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <p className="mt-4 text-base font-semibold tracking-tight">
          No users yet
        </p>
        <p className="mt-1 text-sm text-muted">
          There are currently no user accounts to display.
        </p>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-muted/5 text-xs uppercase tracking-wider text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="hidden px-4 py-3 font-medium md:table-cell">Email</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="hidden px-4 py-3 font-medium sm:table-cell">Posts</th>
            <th className="hidden px-4 py-3 font-medium lg:table-cell">Joined</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            return (
              <tr key={user.id} className="transition-colors hover:bg-muted/5">
                <td className="px-4 py-3">
                  <div className="font-medium">
                    {user.name ?? "—"}
                    {isSelf && (
                      <span className="ml-2 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                        You
                      </span>
                    )}
                  </div>
                  {user.username && (
                    <div className="mt-0.5 text-xs text-muted">
                      @{user.username}
                    </div>
                  )}
                </td>
                <td className="hidden px-4 py-3 text-muted md:table-cell">
                  {user.email}
                </td>
                <td className="px-4 py-3">
                  {user.role === "ADMIN" ? (
                    <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                      Admin
                    </span>
                  ) : (
                    <span className="rounded-full border border-border px-2 py-0.5 text-xs font-medium text-muted">
                      User
                    </span>
                  )}
                </td>
                <td className="hidden px-4 py-3 text-muted sm:table-cell">
                  {user.postCount}
                </td>
                <td className="hidden px-4 py-3 text-muted lg:table-cell">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <UserActions
                    userId={user.id}
                    userName={user.name ?? user.username ?? user.email}
                    currentRole={user.role}
                    isSelf={isSelf}
                    postCount={user.postCount}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}