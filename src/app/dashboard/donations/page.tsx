import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import {
	getUserById,
	getDonationsByDonor,
	getAvailableDonations,
} from "@/lib/db";
import MyDonationsList from "@/components/dashboard/donor/my-donations-list";
import AvailableDonationsList from "@/components/dashboard/distributor/available-donations-list";
import type { Donation } from "@/lib/types";

export default async function DonationsPage() {
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

	// Fetch donations based on user role
	let donations: Donation[] = [];

	try {
		if (user.role === "donor") {
			donations = await getDonationsByDonor(user.id);
		} else if (user.role === "distributor") {
			donations = await getAvailableDonations();
		}
	} catch (error) {
		console.error("Failed to fetch donations from database:", error);
		donations = [];
	}

	if (user.role === "donor") {
		return (
			<div>
				<h1 className='text-3xl font-bold tracking-tight font-headline mb-6'>
					My Donations
				</h1>
				<MyDonationsList donations={donations} />
			</div>
		);
	}

	if (user.role === "distributor") {
		return (
			<div>
				<h1 className='text-3xl font-bold tracking-tight font-headline mb-6'>
					Available Donations
				</h1>
				<AvailableDonationsList donations={donations} />
			</div>
		);
	}

	// Fallback for admin or other roles
	return (
		<div>
			<h1 className='text-3xl font-bold tracking-tight font-headline'>
				Donations
			</h1>
			<p className='text-muted-foreground'>
				You do not have a specific donation view.
			</p>
		</div>
	);
}
