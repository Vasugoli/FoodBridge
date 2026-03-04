import type { SerializableUser, Donation } from "@/lib/types";
import DonationMap from "./donation-map";
import StatCard from "@/components/shared/stat-card";
import { MapPin, Star, Package, CheckCircle } from "lucide-react";

interface DistributorDashboardProps {
	user: SerializableUser;
	donations?: Donation[];
}

export default function DistributorDashboard({
	user,
	donations = [],
}: DistributorDashboardProps) {
	// For demo purposes, we can count the donations that the distributor claimed
	// (usually passed in as a separate prop, but we'll extract simply for display)
	const availableDonations = donations.filter(d => d.status === "available").length;

	return (
		<div className='space-y-8 h-full flex flex-col'>
			<div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-6'>
				<div className='space-y-2'>
					<h1 className='text-4xl font-bold tracking-tight font-headline bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text'>
						Welcome, {user.name.split(" ")[0]}! 🚚
					</h1>
					<p className='text-lg text-muted-foreground'>
						Explore the map to discover available food donations in your area.
					</p>
				</div>
			</div>

			<div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
				<StatCard
					title='Trust Score'
					value={user.trustScore ? `${user.trustScore.toFixed(1)}` : "New"}
					icon={<Star className='h-5 w-5 text-yellow-500' />}
					description={`${user.totalRatings || 0} reviews`}
				/>
				<StatCard
					title='Available Donations'
					value={availableDonations.toString()}
					icon={<Package className='h-5 w-5 text-emerald-600' />}
					description='Currently awaiting pickup.'
				/>
				<StatCard
					title='Community Impact'
					value="Partner"
					icon={<CheckCircle className='h-5 w-5 text-blue-600' />}
					description='Helping reduce food waste.'
				/>
			</div>

			<div className='bg-gradient-to-br from-white to-gray-50/50 rounded-2xl border-2 border-gray-100 p-6 shadow-lg flex-grow min-h-[400px] flex flex-col'>
				<h2 className='text-2xl font-bold tracking-tight font-headline mb-6 flex items-center gap-3'>
					<div className='h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center'>
						<MapPin className='h-6 w-6 text-primary' />
					</div>
					Available Donations Map
				</h2>
				<div className='rounded-xl overflow-hidden border-2 border-gray-200 flex-grow'>
					<DonationMap donations={donations} />
				</div>
			</div>
		</div>
	);
}
