"use client";
import Image from "next/image";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import type { Donation, MatchedDonation, UrgencyLevel } from "@/lib/types";
import { FOOD_CATEGORY_LABELS } from "@/lib/types";
import { urgencyColors, urgencyLabels } from "@/lib/matching";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Clock, Package, Navigation, Flag, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type DonationCardProps = {
	donation: Donation | MatchedDonation;
	onClaim?: (donation: Donation) => void;
	showContactInfo?: boolean;
	/** When true, shows a "Report" flag button in the card footer */
	reportable?: boolean;
};

export default function DonationCard({ donation, onClaim, showContactInfo = false, reportable }: DonationCardProps) {
	const { toast } = useToast();
	const [reportOpen, setReportOpen] = useState(false);
	const [reason, setReason] = useState<string>("");
	const [details, setDetails] = useState("");
	const [reporting, setReporting] = useState(false);

	async function submitReport() {
		if (!reason) { toast({ title: "Select a reason", variant: "destructive" }); return; }
		setReporting(true);
		try {
			const res = await fetch(`/api/donations/${donation.id}/report`, {
				method:  "POST",
				headers: { "Content-Type": "application/json" },
				body:    JSON.stringify({ reason, details }),
			});
			if (!res.ok) {
				const msg = (await res.json().catch(() => ({}))).error || "Failed";
				throw new Error(msg);
			}
			toast({ title: "Report submitted", description: "Thank you for helping keep FoodBridge safe." });
			setReportOpen(false);
			setReason(""); setDetails("");
		} catch (err) {
			toast({ title: "Error", description: err instanceof Error ? err.message : "Could not submit report", variant: "destructive" });
		} finally {
			setReporting(false);
		}
	}
	// Allow locally uploaded images (/uploads/…) and remote URLs; fall back to placeholder
	const imgSrc =
		donation.imageUrl && (donation.imageUrl.startsWith("/uploads/") || donation.imageUrl.startsWith("http"))
			? donation.imageUrl
			: "https://placehold.co/800x450/jpg?text=Donation";

	const statusColors = {
		available: "bg-emerald-100 text-emerald-700 border-emerald-200",
		claimed:   "bg-blue-100 text-blue-700 border-blue-200",
		completed: "bg-gray-100 text-gray-700 border-gray-200",
		expired:   "bg-red-100 text-red-700 border-red-200",
	};

	// Phase 2 – urgency fields from matching engine
	const matched = donation as MatchedDonation;
	const urgency: UrgencyLevel | undefined = matched.urgencyLevel;
	const distanceKm: number | undefined    = matched.distanceKm;

	return (
		<Card className='group relative flex flex-col h-full overflow-hidden border-2 border-gray-100 hover:border-primary/40 transition-all duration-500 hover-lift bg-white rounded-2xl'>
			{/* Status Badge */}
			<div className='absolute top-4 right-4 z-10 flex flex-col gap-1 items-end'>
				<Badge
					className={`${statusColors[donation.status]} border capitalize font-semibold px-3 py-1 shadow-lg`}>
					{donation.status}
				</Badge>
				{urgency && (
					<Badge className={`${urgencyColors[urgency]} border font-semibold px-2 py-0.5 text-xs shadow-md`}>
						{urgencyLabels[urgency]}
					</Badge>
				)}
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
					</CardTitle>				{donation.category && (
					<Badge variant='secondary' className='text-xs mb-1 capitalize'>
						{FOOD_CATEGORY_LABELS[donation.category] ?? donation.category}
					</Badge>
				)}					<p className='text-sm text-muted-foreground leading-relaxed line-clamp-2'>
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

					{distanceKm !== undefined && (
						<div className='flex items-center text-sm text-blue-600 font-medium'>
							<Navigation className='mr-3 h-5 w-5 flex-shrink-0' />
							<span>{distanceKm.toFixed(1)} km away</span>
						</div>
					)}

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

			<div className='flex items-center gap-2'>
				{/* Report flag – shown when reportable=true */}
				{reportable && (
					<Button
						variant='ghost'
						size='icon'
						title='Report this donation'
						className='h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50'
						onClick={() => setReportOpen(true)}>
						<Flag className='h-4 w-4' />
					</Button>
				)}

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
			</div>
		</CardFooter>

		{/* ── Report Dialog ──────────────────────────────────────────────── */}
		<Dialog open={reportOpen} onOpenChange={setReportOpen}>
			<DialogContent className='sm:max-w-md'>
				<DialogHeader>
					<DialogTitle>Report This Donation</DialogTitle>
					<DialogDescription>
						Help keep FoodBridge safe. We review all reports.
					</DialogDescription>
				</DialogHeader>
				<div className='grid gap-4 py-2'>
					<Select value={reason} onValueChange={setReason}>
						<SelectTrigger>
							<SelectValue placeholder='Select a reason…' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='unsafe'>Food appears unsafe / spoiled</SelectItem>
							<SelectItem value='misrepresented'>Description is inaccurate</SelectItem>
							<SelectItem value='already_gone'>Food was already taken</SelectItem>
							<SelectItem value='other'>Other</SelectItem>
						</SelectContent>
					</Select>
					<Textarea
						placeholder='Optional additional details…'
						value={details}
						onChange={(e) => setDetails(e.target.value)}
						maxLength={500}
					/>
				</div>
				<DialogFooter>
					<Button variant='outline' onClick={() => setReportOpen(false)}>Cancel</Button>
					<Button onClick={submitReport} disabled={reporting} className='gap-2 bg-red-600 hover:bg-red-700 text-white'>
						{reporting && <Loader2 className='h-4 w-4 animate-spin' />}
						Submit Report
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	</Card>
	);
}




