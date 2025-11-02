"use client";

import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import { mockDonations } from "@/lib/placeholder-data";
import type { Donation } from "@/lib/types";

// Dynamically import the Leaflet map to avoid SSR issues
const LeafletMap = dynamic(() => import("./leaflet-map-direct"), {
	ssr: false,
	loading: () => (
		<div className='h-full w-full flex items-center justify-center bg-muted rounded-lg min-h-[400px]'>
			<p className='text-muted-foreground'>Loading map...</p>
		</div>
	),
});

interface DonationMapProps {
	donations?: Donation[];
}

export default function DonationMap({
	donations = mockDonations,
}: DonationMapProps) {
	return (
		<Card className='h-full w-full shadow-lg'>
			<CardContent className='p-0 h-full relative'>
				<div className='h-full min-h-[400px]'>
					<LeafletMap donations={donations} />
				</div>
			</CardContent>
		</Card>
	);
}
