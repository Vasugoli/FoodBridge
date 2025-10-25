import { getMockUser } from "@/lib/placeholder-data";
import AdminDashboard from "@/components/dashboard/admin/admin-dashboard";
import DonorDashboard from "@/components/dashboard/donor/donor-dashboard";
import DistributorDashboard from "@/components/dashboard/distributor/distributor-dashboard";
import type { UserRole } from "@/lib/types";

// This component acts as a router to display the correct dashboard
// based on the user's role.
export default function DashboardPage({ searchParams }: { searchParams: { role: string } }) {
  // In a real app, you'd get the user from the session, not search params.
  // This is for demonstration purposes to easily switch between roles.
  // e.g., /dashboard?role=admin
  const role = (searchParams.role as UserRole) || 'donor';
  const user = getMockUser(role);

  const renderDashboard = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard user={user} />;
      case 'donor':
        return <DonorDashboard user={user} />;
      case 'distributor':
        return <DistributorDashboard user={user} />;
      default:
        return <div>Invalid user role.</div>;
    }
  };

  return <div className="h-full">{renderDashboard()}</div>;
}
