"use client";
import { useRouter } from "next/navigation";
import type { SerializableUser, Donation } from "@/lib/types";
import DonationMap from "./donation-map";
import StatCard from "@/components/shared/stat-card";
import MatchedDonationsList from "./matched-donations-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Star, Package, CheckCircle, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DistributorDashboardProps {
	user: SerializableUser;
	donations?: Donation[];
}

export default function DistributorDashboard({
	user,
	donations = [],
}: DistributorDashboardProps) {
	const router = useRouter();
	const { toast } = useToast();

	const availableDonations = donations.filter(d => d.status === "available").length;

	const handleClaim = async (donation: Donation) => {
		// Try to get the user's location for proximity check (soft — never blocks)
		let lat: number | undefined;
		let lng: number | undefined;
		try {
			const position = await new Promise<GeolocationPosition>((resolve, reject) => {
				navigator.geolocation?.getCurrentPosition(resolve, reject, { timeout: 3000 });
			});
			lat = position.coords.latitude;
			lng = position.coords.longitude;
		} catch {
			// location denied or unavailable — claim still proceeds
		}

		try {
			const res = await fetch(`/api/donations/${donation.id}/claim`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ lat, lng }),
			});
			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				throw new Error(err.error || "Failed to claim donation");
			}
			toast({ title: "Claimed!", description: "Donation has been claimed." });
			router.refresh();
		} catch (e) {
			toast({
				title: "Error",
				description: e instanceof Error ? e.message : "Failed to claim",
				variant: "destructive",
			});
		}
	};

	return (
		<div className='space-y-8 h-full flex flex-col'>
			<div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-6'>
				<div className='space-y-2'>
					<h1 className='text-4xl font-bold tracking-tight font-headline bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text'>
						Welcome, {user.name.split(" ")[0]}! 🚚
					</h1>
					<p className='text-lg text-muted-foreground'>
						Discover and claim food donations in your area.
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

			<Tabs defaultValue='feed' className='flex-grow flex flex-col'>
				<TabsList className='grid w-full grid-cols-2 rounded-xl'>
					<TabsTrigger value='feed' className='gap-2 rounded-lg'>
						<Zap className='h-4 w-4' />
						Prioritized Feed
					</TabsTrigger>
					<TabsTrigger value='map' className='gap-2 rounded-lg'>
						<MapPin className='h-4 w-4' />
						Map View
					</TabsTrigger>
				</TabsList>

				<TabsContent value='feed' className='flex-grow mt-6'>
					<MatchedDonationsList onClaim={handleClaim} />
				</TabsContent>

				<TabsContent value='map' className='flex-grow mt-6'>
					<div className='bg-gradient-to-br from-white to-gray-50/50 rounded-2xl border-2 border-gray-100 p-6 shadow-lg min-h-[400px] flex flex-col'>
						<h2 className='text-xl font-bold mb-4 flex items-center gap-2'>
							<MapPin className='h-5 w-5 text-primary' />
							Donations Map
						</h2>
						<div className='rounded-xl overflow-hidden border-2 border-gray-200 flex-grow min-h-[350px]'>
							<DonationMap donations={donations} />
						</div>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}

