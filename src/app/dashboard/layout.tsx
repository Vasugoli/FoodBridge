import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getUserById } from "@/lib/db";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// Get the authenticated user from session
	const session = await getSession();

	if (!session) {
		redirect("/login");
	}

	// Fetch full user data from MongoDB
	let user;
	try {
		user = await getUserById(session.id);
	} catch (error) {
		console.error("Failed to fetch user from database:", error);
	}

	if (!user) {
		redirect("/login");
	}

	return (
		<SidebarProvider>
			<div className='flex h-screen w-full'>
				<AppSidebar role={user.role} />
				<div className='flex flex-1 flex-col overflow-hidden'>
					<DashboardHeader user={user} />
					<main className='flex-1 overflow-y-auto overflow-x-hidden bg-background p-4 md:p-6'>
						{children}
					</main>
				</div>
			</div>
		</SidebarProvider>
	);
}
