"use client";
import type { Donation } from "@/lib/types";
import DonationCard from "@/components/shared/donation-card";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function AvailableDonationsList({
	donations,
}: {
	donations: Donation[];
}) {
	const router = useRouter();
	const { toast } = useToast();

	const handleClaim = async (donation: Donation) => {
		// Attempt to get user coords for proximity warning (non-blocking)
		let lat: number | undefined;
		let lng: number | undefined;
		try {
			const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
				navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 })
			);
			lat = pos.coords.latitude;
			lng = pos.coords.longitude;
		} catch {
			// Location unavailable — proceed without proximity check
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
			const data = await res.json().catch(() => ({}));
			toast({
				title: "Claimed!",
				description: data.proximityWarning
					? `Donation claimed. Note: ${data.proximityWarning}`
					: "Donation has been claimed.",
			});
			router.refresh();
		} catch (e) {
			toast({
				title: "Error",
				description: e instanceof Error ? e.message : "Failed to claim",
				variant: "destructive",
			});
		}
	};
	if (donations.length === 0) {
		return (
			<div className='text-center py-16'>
				<h2 className='text-xl font-semibold'>
					No Available Donations
				</h2>
				<p className='text-muted-foreground mt-2'>
					Check back later for new food donation opportunities.
				</p>
			</div>
		);
	}

	return (
		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
			{donations.map((donation) => (
				<DonationCard
					key={donation.id}
					donation={donation}
					onClaim={handleClaim}
					reportable
				/>
			))}
		</div>
	);
}
