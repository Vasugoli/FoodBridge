import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getUserById, getDonationsClaimedByDistributor } from "@/lib/db";
import type { Donation } from "@/lib/types";
import ClaimedDonationsList from "../../../components/dashboard/distributor/claimed-donations-list";

export default async function ClaimsPage() {
	const session = await getSession();
	if (!session) redirect("/login");

	const user = await getUserById(session.id);
	if (!user) redirect("/login");

	if (user.role !== "distributor") {
		redirect("/dashboard");
	}

	let donations: Donation[] = [];
	try {
		donations = await getDonationsClaimedByDistributor(user.id);
	} catch (e) {
		donations = [];
	}

	return (
		<div>
			<h1 className='text-3xl font-bold tracking-tight font-headline mb-6'>
				My Claims
			</h1>
			<ClaimedDonationsList donations={donations} />
		</div>
	);
}
