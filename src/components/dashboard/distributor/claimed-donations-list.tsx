"use client";
import { useState } from "react";
import type { Donation } from "@/lib/types";
import DonationCard from "@/components/shared/donation-card";
import ReviewDialog from "@/components/shared/review-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { CheckCircle, Loader2, Undo2, MessageSquare, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ClaimedDonationsList({
	donations: initialDonations,
}: {
	donations: Donation[];
}) {
	const [donations, setDonations] = useState<Donation[]>(initialDonations);
	const [loadingId, setLoadingId] = useState<string | null>(null);
	const [noteState, setNoteState] = useState<{ donationId: string; current: string } | null>(null);
	const [savingNote, setSavingNote] = useState(false);
	const { toast } = useToast();

	// ── Mark Complete ────────────────────────────────────────────────────────
	async function handleComplete(donationId: string) {
		setLoadingId(`complete-${donationId}`);
		try {
			const res = await fetch(`/api/donations/${donationId}/complete`, { method: "POST" });
			if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed");
			setDonations((prev) =>
				prev.map((d) => d.id === donationId ? { ...d, status: "completed" as const } : d)
			);
			toast({ title: "Donation completed!", description: "The donor has been notified." });
		} catch (err) {
			toast({ title: "Error", description: err instanceof Error ? err.message : "Something went wrong", variant: "destructive" });
		} finally {
			setLoadingId(null);
		}
	}

	// ── Unclaim ──────────────────────────────────────────────────────────────
	async function handleUnclaim(donationId: string) {
		if (!confirm("Release this donation? It will become available for other distributors.")) return;
		setLoadingId(`unclaim-${donationId}`);
		try {
			const res = await fetch(`/api/donations/${donationId}/unclaim`, { method: "POST" });
			if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed");
			setDonations((prev) => prev.filter((d) => d.id !== donationId));
			toast({ title: "Donation released", description: "It is now available for others to claim." });
		} catch (err) {
			toast({ title: "Error", description: err instanceof Error ? err.message : "Something went wrong", variant: "destructive" });
		} finally {
			setLoadingId(null);
		}
	}

	// ── Pickup Note ──────────────────────────────────────────────────────────
	async function saveNote() {
		if (!noteState) return;
		setSavingNote(true);
		try {
			const res = await fetch(`/api/donations/${noteState.donationId}/note`, {
				method:  "PATCH",
				headers: { "Content-Type": "application/json" },
				body:    JSON.stringify({ note: noteState.current }),
			});
			if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed");
			setDonations((prev) =>
				prev.map((d) => d.id === noteState.donationId ? { ...d, pickupNote: noteState.current } : d)
			);
			toast({ title: "Note saved", description: "The donor can see your coordination note." });
			setNoteState(null);
		} catch (err) {
			toast({ title: "Error", description: err instanceof Error ? err.message : "Could not save note", variant: "destructive" });
		} finally {
			setSavingNote(false);
		}
	}

	if (donations.length === 0) {
		return (
			<div className='text-center py-16'>
				<h2 className='text-xl font-semibold'>No Claimed Donations</h2>
				<p className='text-muted-foreground mt-2'>
					Claim donations from the Available tab to see them here.
				</p>
			</div>
		);
	}

	return (
		<>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
				{donations.map((donation) => (
					<div key={donation.id} className='flex flex-col gap-2'>
						<DonationCard donation={donation} />

						{/* Coordination note preview */}
						{donation.pickupNote && (
							<div className='text-xs bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-amber-800'>
								<span className='font-semibold'>Note from donor:</span> {donation.pickupNote}
							</div>
						)}

						{/* Action buttons for claimed donations */}
						{donation.status === "claimed" && (
							<div className='flex gap-2'>
								{/* Mark Complete */}
								<Button
									onClick={() => handleComplete(donation.id)}
									disabled={loadingId === `complete-${donation.id}`}
									className='flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-2'>
									{loadingId === `complete-${donation.id}` ? (
										<><Loader2 className='h-4 w-4 animate-spin' />Completing…</>
									) : (
										<><CheckCircle className='h-4 w-4' />Mark Complete</>
									)}
								</Button>

								{/* Add/Edit note */}
								<Button
									variant='outline'
									size='icon'
									title='Add coordination note'
									className='rounded-xl'
									onClick={() => setNoteState({ donationId: donation.id, current: donation.pickupNote ?? "" })}>
									<MessageSquare className='h-4 w-4' />
								</Button>

								{/* Unclaim */}
								<Button
									variant='outline'
									size='icon'
									title='Release this donation'
									className='rounded-xl text-red-500 hover:text-red-700 hover:border-red-300'
									disabled={loadingId === `unclaim-${donation.id}`}
									onClick={() => handleUnclaim(donation.id)}>
									{loadingId === `unclaim-${donation.id}`
										? <Loader2 className='h-4 w-4 animate-spin' />
										: <Undo2 className='h-4 w-4' />}
								</Button>
							</div>
						)}

						{/* Completed: show rate-donor option */}
						{donation.status === "completed" && (
							<div className='flex items-center gap-2'>
								<p className='text-sm text-emerald-600 font-medium flex-1'>✓ Completed</p>
								{donation.donor && (
									<ReviewDialog
										donationId={donation.id}
										targetUserId={(donation.donor as any).id}
										triggerButton={
											<Button variant='outline' size='sm' className='rounded-xl gap-1 text-xs'>
												<Star className='h-3 w-3' />
												Rate Donor
											</Button>
										}
									/>
								)}
							</div>
						)}
					</div>
				))}
			</div>

			{/* Pickup Note Dialog */}
			<Dialog open={!!noteState} onOpenChange={(open) => { if (!open) setNoteState(null); }}>
				<DialogContent className='sm:max-w-md'>
					<DialogHeader>
						<DialogTitle>Pickup Coordination Note</DialogTitle>
						<DialogDescription>
							Add a short note for the donor (entrance details, timing, contact, etc.).
							Max 500 characters.
						</DialogDescription>
					</DialogHeader>
					<Textarea
						value={noteState?.current ?? ""}
						onChange={(e) =>
							setNoteState((s) => s ? { ...s, current: e.target.value } : null)
						}
						placeholder='e.g. "Please use the side entrance and ring bell 2B. Available 2–5 PM."'
						className='min-h-[120px]'
						maxLength={500}
					/>
					<DialogFooter>
						<Button variant='outline' onClick={() => setNoteState(null)}>Cancel</Button>
						<Button onClick={saveNote} disabled={savingNote} className='gap-2'>
							{savingNote && <Loader2 className='h-4 w-4 animate-spin' />}
							Save Note
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
