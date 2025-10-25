import { getMockUser } from "@/lib/placeholder-data";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import type { UserRole } from "@/lib/types";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // In a real app, you'd get the user's role from the session.
  // We'll allow switching for demo purposes via URL query param.
  // e.g., /dashboard?role=admin
  // const searchParams = new URLSearchParams();
  // const role: UserRole = (searchParams.get('role') as UserRole) || 'donor';

  // For this implementation, we will hardcode a role.
  // You can change 'donor' to 'distributor' or 'admin' to see other views.
  const role: UserRole = 'donor';
  const user = getMockUser(role);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar role={user.role} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader user={user} />
          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
