import Link from "next/link";
import type { SerializableUser, Donation } from "@/lib/types";
import StatCard from "@/components/shared/stat-card";
import MyDonationsList from "./my-donations-list";
import DonationMap from "@/components/dashboard/distributor/donation-map";
import { Button } from "@/components/ui/button";
import { Package, CheckCircle, PlusCircle, MapPin, Star } from "lucide-react";

export default function DonorDashboard({
	user,
	donations = [],
}: {
	user: SerializableUser;
	donations?: Donation[];
}) {
	const activeDonations = donations.filter(
		(d) => d.status === "available" || d.status === "claimed",
	).length;
	const completedDonations = donations.filter(
		(d) => d.status === "completed",
	).length;

	return (
		<div className='space-y-8'>
			<div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-6'>
				<div className='space-y-2'>
					<h1 className='text-4xl font-bold tracking-tight font-headline bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text'>
						Welcome back, {user.name.split(" ")[0]}! 👋
					</h1>
					<p className='text-lg text-muted-foreground'>
						Here's an overview of your donation activity and impact.
					</p>
				</div>
				<Button
					asChild
					size='lg'
					className='rounded-xl shadow-lg hover:shadow-glow transition-all duration-300 group px-6'>
					<Link href='/dashboard/donations/new'>
						<PlusCircle className='mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-300' />
						Add New Donation
					</Link>
				</Button>
			</div>

			<div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
				<StatCard
					title='Trust Score'
					value={user.trustScore ? `${user.trustScore.toFixed(1)}` : "New"}
					icon={<Star className='h-5 w-5 text-yellow-500' />}
					description={`${user.totalRatings || 0} reviews`}
				/>
				<StatCard
					title='Active Donations'
					value={activeDonations.toString()}
					icon={<Package className='h-5 w-5' />}
					description='Donations currently available or claimed.'
				/>
				<StatCard
					title='Completed Donations'
					value={completedDonations.toString()}
					icon={<CheckCircle className='h-5 w-5' />}
					description='Donations successfully collected.'
				/>
				<StatCard
					title='Total Impact'
					value={(activeDonations + completedDonations).toString()}
					icon={<MapPin className='h-5 w-5' />}
					description='Total meals contributed to community.'
				/>
			</div>

			<div className='bg-gradient-to-br from-white to-gray-50/50 rounded-2xl border-2 border-gray-100 p-6 shadow-lg'>
				<h2 className='text-2xl font-bold tracking-tight font-headline mb-6 flex items-center gap-3'>
					<div className='h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center'>
						<MapPin className='h-6 w-6 text-primary' />
					</div>
					Your Donations Map
				</h2>
				<div className='rounded-xl overflow-hidden border-2 border-gray-200'>
					<DonationMap donations={donations} />
				</div>
			</div>

			<div className='bg-gradient-to-br from-white to-gray-50/50 rounded-2xl border-2 border-gray-100 p-6 shadow-lg'>
				<h2 className='text-2xl font-bold tracking-tight font-headline mb-6 flex items-center gap-3'>
					<div className='h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center'>
						<Package className='h-6 w-6 text-emerald-600' />
					</div>
					Recent Donations
				</h2>
				<MyDonationsList donations={donations.slice(0, 5)} />
			</div>
		</div>
	);
}
