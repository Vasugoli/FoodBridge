import Link from "next/link";
import type { SerializableUser, Donation } from "@/lib/types";
import StatCard from "@/components/shared/stat-card";
import MyDonationsList from "./my-donations-list";
import DonationMap from "@/components/dashboard/distributor/donation-map";
import { Button } from "@/components/ui/button";
import { Package, CheckCircle, PlusCircle, MapPin } from "lucide-react";

export default function DonorDashboard({
	user,
	donations = [],
}: {
	user: SerializableUser;
	donations?: Donation[];
}) {
	const activeDonations = donations.filter(
		(d) => d.status === "available" || d.status === "claimed"
	).length;
	const completedDonations = donations.filter(
		(d) => d.status === "completed"
	).length;

	return (
		<div className='space-y-6'>
			<div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
				<div>
					<h1 className='text-3xl font-bold tracking-tight font-headline'>
						Welcome, {user.name.split(" ")[0]}!
					</h1>
					<p className='text-muted-foreground'>
						Here's an overview of your donation activity.
					</p>
				</div>
				<Button asChild size='lg'>
					<Link href='/dashboard/donations/new'>
						<PlusCircle className='mr-2 h-5 w-5' />
						Add New Donation
					</Link>
				</Button>
			</div>

			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
				<StatCard
					title='Active Donations'
					value={activeDonations.toString()}
					icon={<Package className='h-4 w-4 text-muted-foreground' />}
					description='Donations currently available or claimed.'
				/>
				<StatCard
					title='Completed Donations'
					value={completedDonations.toString()}
					icon={
						<CheckCircle className='h-4 w-4 text-muted-foreground' />
					}
					description='Donations successfully collected.'
				/>
			</div>

			<div>
				<h2 className='text-2xl font-bold tracking-tight font-headline mb-4 flex items-center gap-2'>
					<MapPin className='h-6 w-6' />
					Your Donations Map
				</h2>
				<DonationMap donations={donations} />
			</div>

			<div>
				<h2 className='text-2xl font-bold tracking-tight font-headline mb-4'>
					Recent Donations
				</h2>
				<MyDonationsList donations={donations.slice(0, 5)} />
			</div>
		</div>
	);
}
