import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import {
	getUserById,
	getUsersFromDb,
	getAvailableDonations,
	getDonationsByDonor,
	getDonationsFromDb,
} from "@/lib/db";
import AdminDashboard from "@/components/dashboard/admin/admin-dashboard";
import DonorDashboard from "@/components/dashboard/donor/donor-dashboard";
import DistributorDashboard from "@/components/dashboard/distributor/distributor-dashboard";

// This component displays the correct dashboard based on the authenticated user's role.
export default async function DashboardPage() {
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

	const renderDashboard = async () => {
		switch (user.role) {
			case "admin":
				// Fetch total users count and all donations for admin dashboard
				let totalUsers = 0;
				let allDonations: any[] = [];
				try {
					const users = await getUsersFromDb();
					totalUsers = users?.length || 0;
					allDonations = await getDonationsFromDb();
				} catch (error) {
					console.error("Failed to fetch users count:", error);
				}
				return (
					<AdminDashboard
						user={user}
						totalUsers={totalUsers}
						donations={allDonations}
					/>
				);
			case "donor":
				// Fetch donor's donations
				let donorDonations: any[] = [];
				try {
					donorDonations = await getDonationsByDonor(user.id);
				} catch (error) {
					console.error("Failed to fetch donor donations:", error);
				}
				return (
					<DonorDashboard user={user} donations={donorDonations} />
				);
			case "distributor":
				// Fetch available donations for map
				let donations: any[] = [];
				try {
					donations = await getAvailableDonations();
				} catch (error) {
					console.error("Failed to fetch donations:", error);
				}
				return (
					<DistributorDashboard user={user} donations={donations} />
				);
			default:
				return <div>Invalid user role.</div>;
		}
	};

	return <div className='h-full'>{await renderDashboard()}</div>;
}
