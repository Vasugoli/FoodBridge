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
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Package } from "lucide-react";

type DonationCardProps = {
	donation: Donation;
	onClaim?: (donation: Donation) => void;
	showContactInfo?: boolean;
};

export default function DonationCard({ donation, onClaim, showContactInfo = false }: DonationCardProps) {
	const imgSrc =
		donation.imageUrl && donation.imageUrl.startsWith("/")
			? "https://placehold.co/800x450/jpg?text=Donation"
			: donation.imageUrl;

	const statusColors = {
		available: "bg-emerald-100 text-emerald-700 border-emerald-200",
		claimed: "bg-blue-100 text-blue-700 border-blue-200",
		completed: "bg-gray-100 text-gray-700 border-gray-200",
		expired: "bg-red-100 text-red-700 border-red-200",
	};

	return (
		<Card className='group relative flex flex-col h-full overflow-hidden border-2 border-gray-100 hover:border-primary/40 transition-all duration-500 hover-lift bg-white rounded-2xl'>
			{/* Status Badge */}
			<div className='absolute top-4 right-4 z-10'>
				<Badge
					className={`${statusColors[donation.status]} border capitalize font-semibold px-3 py-1 shadow-lg`}>
					{donation.status}
				</Badge>
			</div>

			<CardHeader className='p-0 relative overflow-hidden'>
				<div className='relative w-full aspect-video overflow-hidden'>
					<Image
						src={imgSrc}
						alt={donation.title}
						fill
						className='object-cover transition-transform duration-700 group-hover:scale-110'
						data-ai-hint={donation.imageHint}
					/>
					<div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
				</div>
			</CardHeader>

			<CardContent className='p-6 flex-grow space-y-4'>
				<div>
					<CardTitle className='text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300 line-clamp-2'>
						{donation.title}
					</CardTitle>
					<p className='text-sm text-muted-foreground leading-relaxed line-clamp-2'>
						{donation.description}
					</p>
				</div>

				<div className='space-y-3 pt-2'>
					<div className='flex items-start text-sm text-muted-foreground'>
						<MapPin className='mr-3 h-5 w-5 text-primary flex-shrink-0 mt-0.5' />
						<span className='line-clamp-1'>
							{donation.location.address || "Location available"}
						</span>
					</div>

					<div className='flex items-center text-sm text-muted-foreground'>
						<Clock className='mr-3 h-5 w-5 text-orange-500 flex-shrink-0' />
						<span>
							Expires{" "}
							{formatDistanceToNow(donation.expiry, {
								addSuffix: true,
							})}
						</span>
					</div>

					<div className='flex items-center text-sm font-semibold text-foreground'>
						<Package className='mr-3 h-5 w-5 text-emerald-600 flex-shrink-0' />
						<span>{donation.quantity}</span>
					</div>
				</div>

				{showContactInfo && donation.status === "claimed" && (
					<div className='mt-4 p-3 bg-secondary rounded-lg space-y-2 border border-border'>
						<p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2'>Donor Contact Info</p>
						<p className='text-sm text-foreground flex items-center'>
							<span className='w-16 inline-block font-medium'>Email:</span>
							<a href={`mailto:${donation.donor.email}`} className="text-primary hover:underline">{donation.donor.email}</a>
						</p>
						{donation.contactNumber && (
							<p className='text-sm text-foreground flex items-center'>
								<span className='w-16 inline-block font-medium'>Phone:</span>
								<a href={`tel:${donation.contactNumber}`} className="text-primary hover:underline">{donation.contactNumber}</a>
							</p>
						)}
					</div>
				)}
			</CardContent>

			<CardFooter className='p-6 pt-0 flex justify-between items-center gap-3'>
				<div className='flex items-center gap-2'>
					<div className='w-8 h-8 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white text-xs font-bold'>
						{donation.donor.name.charAt(0).toUpperCase()}
					</div>
					<span className='text-xs text-muted-foreground'>
						{donation.donor.name}
					</span>
				</div>

				{onClaim ? (
					<Button
						onClick={() => onClaim(donation)}
						disabled={donation.status !== "available"}
						className='rounded-xl shadow-md hover:shadow-glow transition-all duration-300 disabled:opacity-50'>
						{donation.status === "available"
							? "Claim Now"
							: "Not Available"}
					</Button>
				) : (
					<Button
						variant='outline'
						className='rounded-xl border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300'>
						View Details
					</Button>
				)}
			</CardFooter>
		</Card>
	);
}
