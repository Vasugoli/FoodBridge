import { UserTable } from "@/components/dashboard/admin/user-table";
import { mockUsers } from "@/lib/placeholder-data";

export default function ManageUsersPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight font-headline mb-6">Manage Users</h1>
      <UserTable users={mockUsers} />
    </div>
  );
}
