import Link from "next/link";
import type { SerializableUser, Donation } from "@/lib/types";
import StatCard from "@/components/shared/stat-card";
import MyDonationsList from "./my-donations-list";
import DonationMap from "@/components/dashboard/distributor/donation-map";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Package, CheckCircle2, PlusCircle, MapPin, Star,
	HandHeart, Clock,
} from "lucide-react";

function roughMeals(donations: Donation[]) {
	return donations
		.filter((d) => d.status === "completed")
		.reduce((acc, d) => {
			const qty = d.quantity || "";
			const n = parseFloat(qty.replace(/[^0-9.]/g, "")) || 1;
			const lower = qty.toLowerCase();
			if (lower.includes("meal") || lower.includes("serving")) return acc + n;
			if (lower.includes("box"))  return acc + n * 8;
			if (lower.includes("kg"))   return acc + n * 3;
			if (lower.includes("tray")) return acc + n * 12;
			return acc + n * 4;
		}, 0);
}

export default function DonorDashboard({
	user,
	donations = [],
}: {
	user: SerializableUser;
	donations?: Donation[];
}) {
	const active    = donations.filter((d) => d.status === "available" || d.status === "claimed").length;
	const completed = donations.filter((d) => d.status === "completed").length;
	const claimed   = donations.filter((d) => d.status === "claimed").length;
	const meals     = Math.round(roughMeals(donations));

	return (
		<div className='space-y-8'>
			{/* ── Header ─────────────────────────────────────────────────── */}
			<div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-6'>
				<div className='space-y-2'>
					<h1 className='text-4xl font-bold tracking-tight font-headline'>
						Welcome back, {user.name.split(" ")[0]}! 👋
					</h1>
					<p className='text-lg text-muted-foreground'>
						Here&apos;s an overview of your donation activity and impact.
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

			{/* ── Stats ──────────────────────────────────────────────────── */}
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				<StatCard
					title='Trust Score'
					value={user.trustScore ? user.trustScore.toFixed(1) : "New"}
					icon={<Star className='h-5 w-5 text-yellow-500' />}
					description={`${user.totalRatings ?? 0} ratings`}
				/>
				<StatCard
					title='Active Donations'
					value={active.toString()}
					icon={<Package className='h-5 w-5 text-emerald-600' />}
					description={`${claimed > 0 ? `${claimed} claimed` : "None claimed yet"}`}
				/>
				<StatCard
					title='Completed'
					value={completed.toString()}
					icon={<CheckCircle2 className='h-5 w-5 text-blue-600' />}
					description='Successfully delivered'
				/>
				<StatCard
					title='Meals Contributed'
					value={meals > 0 ? `~${meals}` : "0"}
					icon={<HandHeart className='h-5 w-5 text-rose-500' />}
					description='Estimated meals provided'
				/>
			</div>

			{/* ── Claimed donations alert box ─────────────────────────────── */}
			{claimed > 0 && (
				<Card className='border-2 border-blue-200 bg-blue-50/50 rounded-2xl'>
					<CardHeader className='pb-2'>
						<CardTitle className='text-base flex items-center gap-2 text-blue-700'>
							<Clock className='h-5 w-5' />
							{claimed} donation{claimed > 1 ? "s" : ""} waiting for pickup
						</CardTitle>
					</CardHeader>
					<CardContent className='text-sm text-blue-600'>
						A distributor has claimed your donation(s). Check the coordination thread below to coordinate pickup timing and details.
					</CardContent>
				</Card>
			)}

			{/* ── Map ─────────────────────────────────────────────────────── */}
			{donations.length > 0 && (
				<div className='bg-gradient-to-br from-white to-gray-50/50 rounded-2xl border-2 border-gray-100 p-6 shadow-sm'>
					<h2 className='text-2xl font-bold tracking-tight font-headline mb-4 flex items-center gap-3'>
						<div className='h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center'>
							<MapPin className='h-6 w-6 text-primary' />
						</div>
						Your Donations Map
					</h2>
					<div className='rounded-xl overflow-hidden border-2 border-gray-200'>
						<DonationMap donations={donations} />
					</div>
				</div>
			)}

			{/* ── My Donations ─────────────────────────────────────────────── */}
			<div className='bg-gradient-to-br from-white to-gray-50/50 rounded-2xl border-2 border-gray-100 p-6 shadow-sm'>
				<div className='flex items-center justify-between mb-6'>
					<h2 className='text-2xl font-bold tracking-tight font-headline flex items-center gap-3'>
						<div className='h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center'>
							<Package className='h-6 w-6 text-emerald-600' />
						</div>
						My Donations
					</h2>
					<Button asChild variant='outline' size='sm' className='rounded-xl'>
						<Link href='/dashboard/donations'>View All</Link>
					</Button>
				</div>
				<MyDonationsList donations={donations} />
			</div>
		</div>
	);
}
