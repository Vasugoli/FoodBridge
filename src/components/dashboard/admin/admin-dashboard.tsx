"use client";

import type { SerializableUser, Donation } from "@/lib/types";
import StatCard from "@/components/shared/stat-card";
import DonationMap from "@/components/dashboard/distributor/donation-map";
import { BarChart3, Users, Package, HandHeart, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Bar,
	BarChart,
	ResponsiveContainer,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
} from "recharts";

const chartData = [
	{ month: "Jan", donations: Math.floor(Math.random() * 50) + 10 },
	{ month: "Feb", donations: Math.floor(Math.random() * 50) + 10 },
	{ month: "Mar", donations: Math.floor(Math.random() * 50) + 10 },
	{ month: "Apr", donations: Math.floor(Math.random() * 50) + 10 },
	{ month: "May", donations: Math.floor(Math.random() * 50) + 10 },
	{ month: "Jun", donations: Math.floor(Math.random() * 50) + 10 },
];

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
	const totalDonations = donations.length;
	const completedDonations = donations.filter(
		(d) => d.status === "completed"
	).length;

	return (
		<div className='space-y-6'>
			<h1 className='text-3xl font-bold tracking-tight font-headline'>
				Admin Dashboard
			</h1>
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
				<StatCard
					title='Total Donations'
					value={totalDonations.toString()}
					icon={<Package className='h-4 w-4 text-muted-foreground' />}
					description='Total donations created on the platform.'
				/>
				<StatCard
					title='Total Users'
					value={totalUsers.toString()}
					icon={<Users className='h-4 w-4 text-muted-foreground' />}
					description='Total registered donors and distributors.'
				/>
				<StatCard
					title='Completed Pickups'
					value={completedDonations.toString()}
					icon={
						<HandHeart className='h-4 w-4 text-muted-foreground' />
					}
					description={`${
						totalDonations > 0
							? Math.round(
									(completedDonations / totalDonations) * 100
							  )
							: 0
					}% of donations completed.`}
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

			<Card>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<BarChart3 className='h-5 w-5' />
						Donation Trends
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='h-[350px]'>
						<ResponsiveContainer width='100%' height='100%'>
							<BarChart data={chartData}>
								<XAxis
									dataKey='month'
									stroke='#888888'
									fontSize={12}
									tickLine={false}
									axisLine={false}
								/>
								<YAxis
									stroke='#888888'
									fontSize={12}
									tickLine={false}
									axisLine={false}
									tickFormatter={(value) => `${value}`}
								/>
								<Tooltip
									cursor={{
										fill: "hsl(var(--accent))",
										opacity: 0.2,
									}}
									contentStyle={{
										background: "hsl(var(--background))",
										border: "1px solid hsl(var(--border))",
										borderRadius: "var(--radius)",
									}}
								/>
								<Legend />
								<Bar
									dataKey='donations'
									fill='hsl(var(--primary))'
									radius={[4, 4, 0, 0]}
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
