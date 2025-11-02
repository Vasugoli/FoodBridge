"use client";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import type { Donation } from "@/lib/types";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock } from "lucide-react";

type DonationCardProps = {
	donation: Donation;
	onClaim?: (donation: Donation) => void;
};

export default function DonationCard({ donation, onClaim }: DonationCardProps) {
	const imgSrc =
		donation.imageUrl && donation.imageUrl.startsWith("/")
			? "https://placehold.co/800x450/jpg?text=Donation"
			: donation.imageUrl;
	return (
		<Card className='flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300'>
			<CardHeader className='p-0'>
				<Image
					src={imgSrc}
					alt={donation.title}
					width={400}
					height={250}
					className='rounded-t-lg object-cover aspect-video w-full'
					data-ai-hint={donation.imageHint}
				/>
			</CardHeader>
			<CardContent className='p-4 flex-grow'>
				<CardTitle className='text-lg font-bold mb-2'>
					{donation.title}
				</CardTitle>
				<p className='text-sm text-muted-foreground mb-4'>
					{donation.description}
				</p>
				<div className='flex items-center text-sm text-muted-foreground mb-2'>
					<MapPin className='mr-2 h-4 w-4 text-primary' />
					<span>{donation.location.address}</span>
				</div>
				<div className='flex items-center text-sm text-muted-foreground'>
					<Clock className='mr-2 h-4 w-4 text-primary' />
					<span>
						Expires{" "}
						{formatDistanceToNow(donation.expiry, {
							addSuffix: true,
						})}
					</span>
				</div>
			</CardContent>
			<CardFooter className='p-4 flex justify-between items-center bg-secondary/50 rounded-b-lg'>
				<div className='font-semibold text-foreground'>
					{donation.quantity}
				</div>
				{onClaim ? (
					<Button
						onClick={() => onClaim(donation)}
						disabled={donation.status !== "available"}>
						{donation.status === "available"
							? "Claim"
							: "Not available"}
					</Button>
				) : (
					<Button variant='outline'>View</Button>
				)}
			</CardFooter>
		</Card>
	);
}
