"use client";
import { useState, useEffect, useCallback } from "react";
import type { MatchedDonation, Donation } from "@/lib/types";
import { urgencyColors, urgencyLabels } from "@/lib/matching";
import DonationCard from "@/components/shared/donation-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, RefreshCw, Navigation2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSSE } from "@/hooks/use-sse";

interface MatchedDonationsListProps {
	onClaim: (donation: Donation) => void;
}

export default function MatchedDonationsList({ onClaim }: MatchedDonationsListProps) {
	const [donations, setDonations] = useState<MatchedDonation[]>([]);
	const [loading, setLoading] = useState(true);
	const [locating, setLocating] = useState(false);
	const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
	const { toast } = useToast();

	const fetchMatched = useCallback(
		async (lat?: number, lng?: number) => {
			setLoading(true);
			try {
				const params = new URLSearchParams({ limit: "20" });
				if (lat !== undefined) params.set("lat", String(lat));
				if (lng !== undefined) params.set("lng", String(lng));
				const res = await fetch(`/api/matching?${params}`);
				if (!res.ok) throw new Error("Failed to fetch matched donations");
				const data = await res.json();
				setDonations(data.data ?? []);
			} catch (err) {
				toast({
					title: "Error",
					description: err instanceof Error ? err.message : "Could not load donations",
					variant: "destructive",
				});
			} finally {
				setLoading(false);
			}
		},
		[toast]
	);

	// Initial load
	useEffect(() => {
		fetchMatched();
	}, [fetchMatched]);

	// Re-fetch when a new donation is posted or a donation is claimed/completed
	useSSE((type) => {
		if (["new_donation", "donation_claimed", "donation_completed", "donation_expired"].includes(type)) {
			fetchMatched(coords?.lat, coords?.lng);
		}
	});

	function useMyLocation() {
		if (!navigator.geolocation) {
			toast({ title: "Geolocation not supported", variant: "destructive" });
			return;
		}
		setLocating(true);
		navigator.geolocation.getCurrentPosition(
			({ coords: c }) => {
				const loc = { lat: c.latitude, lng: c.longitude };
				setCoords(loc);
				setLocating(false);
				fetchMatched(loc.lat, loc.lng);
			},
			() => {
				setLocating(false);
				toast({
					title: "Location denied",
					description: "Cannot determine distance without location access.",
					variant: "destructive",
				});
			}
		);
	}

	// Urgency summary counts
	const urgencyCounts = donations.reduce(
		(acc, d) => {
			const level = d.urgencyLevel ?? "normal";
			acc[level] = (acc[level] ?? 0) + 1;
			return acc;
		},
		{} as Record<string, number>
	);

	return (
		<div className='space-y-6'>
			{/* Toolbar */}
			<div className='flex flex-wrap items-center justify-between gap-3'>
				<div className='flex items-center gap-2 flex-wrap'>
					<span className='text-sm font-medium text-muted-foreground'>
						{donations.length} donation{donations.length !== 1 ? "s" : ""} prioritized
					</span>
					{Object.entries(urgencyCounts).map(([level, count]) => (
						<Badge
							key={level}
							className={`${urgencyColors[level as keyof typeof urgencyColors]} border text-xs`}>
							{urgencyLabels[level as keyof typeof urgencyLabels]}: {count}
						</Badge>
					))}
				</div>
				<div className='flex gap-2'>
					<Button
						variant='outline'
						size='sm'
						onClick={useMyLocation}
						disabled={locating}
						className='gap-2 rounded-xl'>
						{locating ? (
							<RefreshCw className='h-4 w-4 animate-spin' />
						) : (
							<Navigation2 className='h-4 w-4' />
						)}
						{coords ? "Refresh Location" : "Use My Location"}
					</Button>
					<Button
						variant='ghost'
						size='sm'
						onClick={() => fetchMatched(coords?.lat, coords?.lng)}
						disabled={loading}
						className='gap-2 rounded-xl'>
						<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
						Refresh
					</Button>
				</div>
			</div>

			{coords && (
				<div className='flex items-center gap-2 text-sm text-blue-600 bg-blue-50 rounded-lg px-3 py-2'>
					<MapPin className='h-4 w-4' />
					<span>
						Showing donations sorted by distance + urgency from your location.
					</span>
				</div>
			)}

			{/* Grid */}
			{loading ? (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{Array.from({ length: 6 }).map((_, i) => (
						<Skeleton key={i} className='h-80 rounded-2xl' />
					))}
				</div>
			) : donations.length === 0 ? (
				<div className='text-center py-16'>
					<h2 className='text-xl font-semibold'>No Available Donations</h2>
					<p className='text-muted-foreground mt-2'>
						Check back soon — donors are posting new food every day!
					</p>
				</div>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{donations.map((donation) => (
						<DonationCard
							key={donation.id}
							donation={donation}
							onClaim={onClaim}
						/>
					))}
				</div>
			)}
		</div>
	);
}
