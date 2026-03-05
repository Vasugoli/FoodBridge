"use client";

import type { SerializableUser, Donation } from "@/lib/types";
import StatCard from "@/components/shared/stat-card";
import DonationMap from "@/components/dashboard/distributor/donation-map";
import AnalyticsDashboard from "@/components/dashboard/admin/analytics-dashboard";
import AdminReportsQueue from "@/components/dashboard/admin/reports-queue";
import { BarChart3, Users, Package, HandHeart, MapPin, TrendingUp, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AdminDashboardProps {
	user: SerializableUser;
	totalUsers?: number;
	donations?: Donation[];
}

export default function AdminDashboard({
	user,
	totalUsers = 0,
	donations = [],
}: AdminDashboardProps) {
	const totalDonations     = donations.length;
	const completedDonations = donations.filter((d) => d.status === "completed").length;
	const availableDonations = donations.filter((d) => d.status === "available").length;
	const claimedDonations   = donations.filter((d) => d.status === "claimed").length;

	return (
		<div className='space-y-6'>
			<div className="flex items-center justify-between">
				<h1 className='text-3xl font-bold tracking-tight font-headline'>
					Admin Dashboard
				</h1>
			</div>

			<Tabs defaultValue='overview'>
				<TabsList className="mb-4">
					<TabsTrigger value='overview' className="flex items-center gap-2">
						<BarChart3 className="h-4 w-4" /> Overview
					</TabsTrigger>
					<TabsTrigger value='analytics' className="flex items-center gap-2">
						<TrendingUp className="h-4 w-4" /> Analytics
					</TabsTrigger>
					<TabsTrigger value='map' className="flex items-center gap-2">
						<MapPin className="h-4 w-4" /> Map
					</TabsTrigger>
					<TabsTrigger value='reports' className="flex items-center gap-2">
						<ShieldAlert className="h-4 w-4" /> Reports
					</TabsTrigger>
				</TabsList>

				{/* ── Overview tab ─────────────────────────────────── */}
				<TabsContent value='overview' className="space-y-6">
					<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
						<StatCard
							title='Total Donations'
							value={totalDonations.toString()}
							icon={<Package className='h-4 w-4 text-muted-foreground' />}
							description='All donations on the platform.'
						/>
						<StatCard
							title='Total Users'
							value={totalUsers.toString()}
							icon={<Users className='h-4 w-4 text-muted-foreground' />}
							description='Registered donors and distributors.'
						/>
						<StatCard
							title='Completed Pickups'
							value={completedDonations.toString()}
							icon={<HandHeart className='h-4 w-4 text-muted-foreground' />}
							description={`${
								totalDonations > 0
									? Math.round((completedDonations / totalDonations) * 100)
									: 0
							}% of donations completed.`}
						/>
						<StatCard
							title='Available Now'
							value={availableDonations.toString()}
							icon={<MapPin className='h-4 w-4 text-emerald-600' />}
							description={`${claimedDonations} currently claimed.`}
						/>
					</div>

					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<MapPin className='h-5 w-5' />
								All Donations Map
							</CardTitle>
						</CardHeader>
						<CardContent>
							<DonationMap donations={donations} />
						</CardContent>
					</Card>
				</TabsContent>

				{/* ── Analytics tab ────────────────────────────────── */}
				<TabsContent value='analytics'>
					<AnalyticsDashboard />
				</TabsContent>

				{/* ── Map tab ──────────────────────────────────────── */}
				<TabsContent value='map'>
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<MapPin className='h-5 w-5' />
								Full Donation Map
							</CardTitle>
						</CardHeader>
						<CardContent>
							<DonationMap donations={donations} />
						</CardContent>
					</Card>
				</TabsContent>

				{/* ── Reports tab ──────────────────────────────────── */}
				<TabsContent value='reports'>
					<AdminReportsQueue />
				</TabsContent>
			</Tabs>
		</div>
	);
}
