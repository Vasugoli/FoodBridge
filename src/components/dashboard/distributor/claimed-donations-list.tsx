"use client";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Loader2, Undo2, MessageSquare, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ClaimedDonationsList({
	donations: initialDonations,
}: {
	donations: Donation[];
}) {
	const [donations, setDonations] = useState<Donation[]>(initialDonations);
	const [loadingId, setLoadingId] = useState<string | null>(null);
	const [noteState, setNoteState] = useState<{ donationId: string; newMsg: string } | null>(null);
	const [savingNote, setSavingNote] = useState(false);
	const { toast } = useToast();

	// ── Helpers ──────────────────────────────────────────────────────────────
	function getThread(donation: Donation) {
		return donation.coordinationMessages ?? [];
	}

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

	// ── Send Coordination Message ─────────────────────────────────────────────
	async function sendMessage() {
		if (!noteState || !noteState.newMsg.trim()) return;
		setSavingNote(true);
		try {
			const res = await fetch(`/api/donations/${noteState.donationId}/note`, {
				method:  "PATCH",
				headers: { "Content-Type": "application/json" },
				body:    JSON.stringify({ message: noteState.newMsg.trim() }),
			});
			if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed");
			const { coordination } = await res.json();
			setDonations((prev) =>
				prev.map((d) => {
					if (d.id !== noteState.donationId) return d;
					return {
						...d,
						coordinationMessages: [...(d.coordinationMessages ?? []), coordination],
						pickupNote: coordination.message,
					};
				})
			);
			setNoteState((s) => s ? { ...s, newMsg: "" } : null);
			toast({ title: "Message sent", description: "Added to coordination thread." });
		} catch (err) {
			toast({ title: "Error", description: err instanceof Error ? err.message : "Could not send message", variant: "destructive" });
		} finally {
			setSavingNote(false);
		}
	}

	const activeDonation = noteState
		? donations.find((d) => d.id === noteState.donationId)
		: null;

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

						{/* Latest note preview */}
						{donation.pickupNote && (
							<div className='text-xs bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-amber-800'>
								<span className='font-semibold'>Latest note:</span> {donation.pickupNote}
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

								{/* Open coordination thread */}
								<Button
									variant='outline'
									size='icon'
									title='Coordination thread'
									className='rounded-xl relative'
									onClick={() => setNoteState({ donationId: donation.id, newMsg: "" })}>
									<MessageSquare className='h-4 w-4' />
									{getThread(donation).length > 0 && (
										<span className='absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center'>
											{getThread(donation).length}
										</span>
									)}
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

			{/* Coordination Thread Dialog */}
			<Dialog open={!!noteState} onOpenChange={(open) => { if (!open) setNoteState(null); }}>
				<DialogContent className='sm:max-w-md'>
					<DialogHeader>
						<DialogTitle>Coordination Thread</DialogTitle>
						<DialogDescription>
							Chat with the donor about pickup details, timing, entrance info, etc.
						</DialogDescription>
					</DialogHeader>

					{/* Message list */}
					{getThread(activeDonation!).length === 0 ? (
						<p className='text-sm text-muted-foreground italic text-center py-4'>
							No messages yet. Start the conversation below.
						</p>
					) : (
						<ScrollArea className='h-56 rounded-md border bg-muted/30 p-3'>
							<div className='space-y-3'>
								{getThread(activeDonation!).map((msg) => (
									<div key={msg.id} className='flex flex-col gap-0.5'>
										<div className='flex items-center gap-2'>
											<span className='text-xs font-semibold'>{msg.authorName}</span>
											<Badge variant='outline' className='text-[10px] px-1 py-0 capitalize'>
												{msg.authorRole}
											</Badge>
											<span className='text-[10px] text-muted-foreground ml-auto'>
												{formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
											</span>
										</div>
										<p className='text-sm bg-background rounded px-2 py-1.5 border'>
											{msg.message}
										</p>
									</div>
								))}
							</div>
						</ScrollArea>
					)}

					{/* New message input */}
					<Textarea
						value={noteState?.newMsg ?? ""}
						onChange={(e) =>
							setNoteState((s) => s ? { ...s, newMsg: e.target.value } : null)
						}
						placeholder='Type a message… (entrance details, timing, contact info)'
						className='min-h-[80px]'
						maxLength={500}
						onKeyDown={(e) => {
							if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) sendMessage();
						}}
					/>
					<p className='text-xs text-muted-foreground -mt-1'>Ctrl+Enter to send</p>

					<DialogFooter>
						<Button variant='outline' onClick={() => setNoteState(null)}>Close</Button>
						<Button onClick={sendMessage} disabled={savingNote || !noteState?.newMsg.trim()} className='gap-2'>
							{savingNote && <Loader2 className='h-4 w-4 animate-spin' />}
							Send Message
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
