"use client";
import Image from "next/image";
import { format, formatDistanceToNow } from "date-fns";
import {
	MoreHorizontal, Loader2, MessageSquare, Pencil, Trash2,
	Star, ChevronRight, Package, Clock, MapPin, CheckCircle2,
	XCircle, AlertTriangle, Send, Phone, Mail, Filter, ShieldAlert,
} from "lucide-react";
import { useState, useCallback } from "react";
import type { Donation, FoodCategory, QuantityUnit } from "@/lib/types";
import { FOOD_CATEGORY_LABELS, QUANTITY_UNIT_LABELS } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
	Dialog, DialogContent, DialogHeader, DialogTitle,
	DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
	DropdownMenu, DropdownMenuContent, DropdownMenuItem,
	DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import ReviewDialog from "@/components/shared/review-dialog";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────
type Status = Donation["status"];

const STATUS_COLORS: Record<Status, string> = {
	available: "bg-emerald-100 text-emerald-700 border-emerald-200",
	claimed:   "bg-blue-100 text-blue-700 border-blue-200",
	completed: "bg-gray-100 text-gray-600 border-gray-200",
	expired:   "bg-red-100 text-red-700 border-red-200",
};
const STATUS_ICONS: Record<Status, React.ReactNode> = {
	available: <Package    className="h-3.5 w-3.5" />,
	claimed:   <ChevronRight className="h-3.5 w-3.5" />,
	completed: <CheckCircle2 className="h-3.5 w-3.5" />,
	expired:   <XCircle    className="h-3.5 w-3.5" />,
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function safeDate(v: unknown): Date {
	if (v instanceof Date) return v;
	if (typeof v === "string" || typeof v === "number") return new Date(v);
	return new Date();
}

// ── CoordinationThread component ─────────────────────────────────────────────
function CoordinationThread({
	donation,
	onMessageSent,
}: {
	donation: Donation;
	onMessageSent: (donationId: string, msg: any) => void;
}) {
	const { toast } = useToast();
	const [text, setText] = useState("");
	const [sending, setSending] = useState(false);
	const thread = donation.coordinationMessages ?? [];

	const send = async () => {
		const trimmed = text.trim();
		if (!trimmed) return;
		setSending(true);
		try {
			const res = await fetch(`/api/donations/${donation.id}/note`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ message: trimmed }),
			});
			if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed");
			const { coordination } = await res.json();
			setText("");
			onMessageSent(donation.id, coordination);
			toast({ title: "Message sent" });
		} catch (err) {
			toast({
				title: "Error",
				description: err instanceof Error ? err.message : "Could not send message",
				variant: "destructive",
			});
		} finally {
			setSending(false);
		}
	};

	return (
		<div className="flex flex-col gap-3">
			{thread.length === 0 ? (
				<div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
					<MessageSquare className="h-10 w-10 opacity-20" />
					<p className="text-sm">No messages yet.</p>
					<p className="text-xs opacity-70">Send a message to start coordinating the pickup.</p>
				</div>
			) : (
				<ScrollArea className="h-56 rounded-xl border bg-muted/30 p-3">
					<div className="space-y-3 pr-2">
						{thread.map((msg) => {
							const isMe = msg.authorRole === "donor";
							return (
								<div key={msg.id} className={cn("flex flex-col gap-0.5", isMe && "items-end")}>
									<div className={cn("flex items-center gap-2 text-xs", isMe && "flex-row-reverse")}>
										<span className="font-semibold">{msg.authorName}</span>
										<Badge variant="outline" className="text-[10px] px-1 py-0 capitalize">
											{msg.authorRole}
										</Badge>
										<span className="text-muted-foreground">
											{formatDistanceToNow(safeDate(msg.createdAt), { addSuffix: true })}
										</span>
									</div>
									<div className={cn(
										"max-w-[80%] rounded-2xl px-3 py-2 text-sm",
										isMe
											? "bg-primary text-white rounded-tr-none"
											: "bg-background border rounded-tl-none"
									)}>
										{msg.message}
									</div>
								</div>
							);
						})}
					</div>
				</ScrollArea>
			)}

			{/* Distributor contact info (shown once claimed) */}
			{donation.status === "claimed" && (donation as any).claimedBy && (
				<div className="rounded-xl border bg-blue-50/50 p-3 space-y-1.5">
					<p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Distributor Contact</p>
					<div className="flex items-center gap-2 text-sm text-blue-700">
						<Mail className="h-3.5 w-3.5" />
						<a href={`mailto:${(donation as any).claimedBy.email}`} className="hover:underline">
							{(donation as any).claimedBy.email}
						</a>
					</div>
				</div>
			)}

			{/* Reply input — only for claimed donations */}
			{(donation.status === "claimed" || donation.status === "available") && (
				<div className="flex gap-2">
					<Textarea
						value={text}
						onChange={(e) => setText(e.target.value)}
						placeholder="Type a message… (pickup info, timing, access details)"
						className="min-h-[60px] resize-none text-sm"
						maxLength={500}
						onKeyDown={(e) => {
							if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) send();
						}}
					/>
					<Button
						onClick={send}
						disabled={sending || !text.trim()}
						size="icon"
						className="h-auto px-3 self-end rounded-xl">
						{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
					</Button>
				</div>
			)}
			<p className="text-[11px] text-muted-foreground -mt-1">Ctrl+Enter to send</p>
		</div>
	);
}

// ── DonationStatusBadge ───────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Status }) {
	return (
		<Badge className={cn("border capitalize flex items-center gap-1 font-semibold", STATUS_COLORS[status])}>
			{STATUS_ICONS[status]}
			{status}
		</Badge>
	);
}

// ── DonationRow ───────────────────────────────────────────────────────────────
function DonationRow({
	donation,
	onEdit,
	onDelete,
	onOpenThread,
	onRevoke,
}: {
	donation: Donation;
	onEdit: (d: Donation) => void;
	onDelete: (id: string) => void;
	onOpenThread: (d: Donation) => void;
	onRevoke: (id: string) => void;
}) {
	const imgSrc = donation.imageUrl?.startsWith("/uploads/") || donation.imageUrl?.startsWith("http")
		? donation.imageUrl
		: "https://placehold.co/64x64/jpg?text=Food";

	const threadCount = donation.coordinationMessages?.length ?? 0;

	return (
		<div className="flex items-center gap-4 rounded-xl border-2 border-gray-100 p-4 hover:border-primary/30 hover:bg-muted/20 transition-all duration-200 group">
			{/* Image */}
			<div className="h-14 w-14 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
				<Image src={imgSrc} alt={donation.title} width={56} height={56} className="object-cover w-full h-full" />
			</div>

			{/* Main info */}
			<div className="flex-1 min-w-0">
				<p className="font-semibold text-sm leading-snug line-clamp-1">{donation.title}</p>
				<div className="flex items-center flex-wrap gap-2 mt-1.5">
					<StatusBadge status={donation.status} />
					{donation.category && (
						<Badge variant="secondary" className="text-xs capitalize">
							{FOOD_CATEGORY_LABELS[donation.category] ?? donation.category}
						</Badge>
					)}
					<span className="text-xs text-muted-foreground flex items-center gap-1">
						<Clock className="h-3 w-3" />
						{formatDistanceToNow(safeDate(donation.expiry), { addSuffix: true })}
					</span>
					{donation.status === "claimed" && (donation as any).claimedBy && (
						<span className="text-xs text-blue-600 flex items-center gap-1">
							Claimed by {(donation as any).claimedBy.name}
						</span>
					)}
				</div>
				{donation.pickupNote && (
					<p className="mt-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 line-clamp-1">
						💬 {donation.pickupNote}
					</p>
				)}
			</div>

			{/* Actions */}
			<div className="flex items-center gap-2 flex-shrink-0">
				{/* Chat button — always shown */}
				<Button
					variant="outline"
					size="sm"
					className="rounded-xl gap-1.5 text-xs relative"
					onClick={() => onOpenThread(donation)}>
					<MessageSquare className="h-3.5 w-3.5" />
					Chat
					{threadCount > 0 && (
						<span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
							{threadCount}
						</span>
					)}
				</Button>

				{/* Revoke button — red, only for claimed */}
				{donation.status === "claimed" && (
					<Button
						variant="outline"
						size="sm"
						className="rounded-xl gap-1.5 text-xs text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
						onClick={() => onRevoke(donation.id)}
						title="Revoke this claim from the distributor">
						<ShieldAlert className="h-3.5 w-3.5" />
						Revoke
					</Button>
				)}

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg">
							<MoreHorizontal className="h-4 w-4" />
							<span className="sr-only">More</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-44 rounded-xl">
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{donation.status === "available" && (
							<DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => onEdit(donation)}>
								<Pencil className="h-3.5 w-3.5" /> Edit
							</DropdownMenuItem>
						)}
						<DropdownMenuItem
							className="gap-2 cursor-pointer"
							onClick={() => onOpenThread(donation)}>
							<MessageSquare className="h-3.5 w-3.5" /> View Thread
						</DropdownMenuItem>
						{donation.status === "completed" && donation.claimedBy && (
							<ReviewDialog
								donationId={donation.id}
								targetUserId={donation.claimedBy.id}
								triggerButton={
									<DropdownMenuItem className="gap-2 cursor-pointer" onSelect={(e) => e.preventDefault()}>
										<Star className="h-3.5 w-3.5" /> Rate Distributor
									</DropdownMenuItem>
								}
							/>
						)}
						{donation.status !== "claimed" && donation.status !== "completed" && (
							<>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									className="gap-2 cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
									onClick={() => onDelete(donation.id)}>
									<Trash2 className="h-3.5 w-3.5" /> Delete
								</DropdownMenuItem>
							</>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}

// ── Edit Dialog ───────────────────────────────────────────────────────────────
interface EditState {
	open: boolean;
	donation: Donation | null;
	title: string;
	description: string;
	category: string;
	quantityValue: string;
	quantityUnit: string;
}
const emptyEdit: EditState = {
	open: false, donation: null, title: "", description: "",
	category: "", quantityValue: "", quantityUnit: "",
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function MyDonationsList({ donations: initial }: { donations: Donation[] }) {
	const { toast } = useToast();
	const router = useRouter();

	const [donations, setDonations] = useState<Donation[]>(initial);
	const [editState, setEditState] = useState<EditState>(emptyEdit);
	const [isSaving, setIsSaving] = useState(false);
	const [threadDonation, setThreadDonation] = useState<Donation | null>(null);
	const [filter, setFilter] = useState<Status | "all">("all");
	const [search, setSearch] = useState("");

	// Derived
	const visible = donations.filter((d) => {
		if (filter !== "all" && d.status !== filter) return false;
		if (search && !d.title.toLowerCase().includes(search.toLowerCase())) return false;
		return true;
	});

	const counts = {
		available: donations.filter((d) => d.status === "available").length,
		claimed:   donations.filter((d) => d.status === "claimed").length,
		completed: donations.filter((d) => d.status === "completed").length,
		expired:   donations.filter((d) => d.status === "expired").length,
	};

	// Coordination thread message received
	const handleMessageSent = useCallback((donationId: string, msg: any) => {
		setDonations((prev) =>
			prev.map((d) => {
				if (d.id !== donationId) return d;
				return {
					...d,
					coordinationMessages: [...(d.coordinationMessages ?? []), msg],
					pickupNote: msg.message,
				};
			})
		);
		// Also update thread view ref
		setThreadDonation((prev) =>
			prev?.id === donationId
				? {
					...prev,
					coordinationMessages: [...(prev.coordinationMessages ?? []), msg],
					pickupNote: msg.message,
				}
				: prev
		);
	}, []);

	// Delete
	const handleDelete = async (id: string) => {
		if (!confirm("Delete this donation? This cannot be undone.")) return;
		try {
			const res = await fetch(`/api/donations/${id}`, { method: "DELETE" });
			if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Failed");
			setDonations((prev) => prev.filter((d) => d.id !== id));
			toast({ title: "Donation deleted" });
		} catch (e) {
			toast({ title: "Error", description: e instanceof Error ? e.message : "Failed", variant: "destructive" });
		}
	};

	// Revoke a distributor's claim
	const handleRevoke = async (id: string) => {
		if (!confirm(
			"Revoke this distributor's claim? The donation will be made available again for others to claim."
		)) return;
		try {
			const res = await fetch(`/api/donations/${id}/revoke`, { method: "POST" });
			if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Failed");
			setDonations((prev) =>
				prev.map((d) =>
					d.id === id
						? { ...d, status: "available" as const, claimedBy: undefined as any, claimedAt: undefined }
						: d
				)
			);
			toast({ title: "Claim revoked", description: "The donation is available again." });
		} catch (e) {
			toast({ title: "Error", description: e instanceof Error ? e.message : "Failed", variant: "destructive" });
		}
	};

	// Open edit
	function openEdit(donation: Donation) {
		setEditState({
			open: true, donation,
			title: donation.title,
			description: donation.description ?? "",
			category: donation.category ?? "",
			quantityValue: donation.quantityValue?.toString() ?? "",
			quantityUnit: donation.quantityUnit ?? "",
		});
	}

	// Save edit
	async function handleSaveEdit() {
		if (!editState.donation) return;
		if (!editState.title.trim()) {
			toast({ title: "Title is required", variant: "destructive" }); return;
		}
		setIsSaving(true);
		try {
			const body: Record<string, unknown> = {
				title: editState.title.trim(),
				description: editState.description.trim(),
			};
			if (editState.category) body.category = editState.category;
			if (editState.quantityValue) body.quantityValue = Number(editState.quantityValue);
			if (editState.quantityUnit) body.quantityUnit = editState.quantityUnit;

			const res = await fetch(`/api/donations/${editState.donation.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});
			if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Failed");
			setDonations((prev) =>
				prev.map((d) =>
					d.id === editState.donation!.id
						? { ...d, title: editState.title.trim(), description: editState.description.trim() }
						: d
				)
			);
			toast({ title: "Donation updated" });
			setEditState(emptyEdit);
		} catch (e) {
			toast({ title: "Error", description: e instanceof Error ? e.message : "Failed", variant: "destructive" });
		} finally {
			setIsSaving(false);
		}
	}

	if (donations.length === 0) {
		return (
			<Card className="text-center py-16 rounded-2xl border-2">
				<CardContent className="flex flex-col items-center gap-4">
					<div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
						<Package className="h-8 w-8 text-primary" />
					</div>
					<div>
						<h3 className="text-xl font-bold">No Donations Yet</h3>
						<p className="text-muted-foreground mt-1">Post your first donation and start making an impact!</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			{/* ── Summary Cards ───────────────────────────────────────────── */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
				{(["available", "claimed", "completed", "expired"] as Status[]).map((s) => (
					<button
						key={s}
						onClick={() => setFilter(filter === s ? "all" : s)}
						className={cn(
							"rounded-xl border-2 p-3 text-left transition-all hover:shadow-md",
							filter === s ? "border-primary bg-primary/5 shadow-md" : "border-gray-100 bg-white hover:border-gray-200"
						)}>
						<p className="text-xs text-muted-foreground capitalize mb-1">{s}</p>
						<p className="text-2xl font-bold">{counts[s]}</p>
					</button>
				))}
			</div>

			{/* ── Search / Filter ──────────────────────────────────────────── */}
			<div className="flex items-center gap-3 mb-4">
				<div className="relative flex-1">
					<Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search donations…"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="pl-9 rounded-xl"
					/>
				</div>
				{filter !== "all" && (
					<Button variant="outline" size="sm" className="rounded-xl" onClick={() => setFilter("all")}>
						Clear filter
					</Button>
				)}
			</div>

			{/* ── Donation list ────────────────────────────────────────────── */}
			<div className="space-y-3">
				{visible.length === 0 ? (
					<div className="text-center py-10 text-muted-foreground">
						<AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-30" />
						<p className="text-sm">No donations match your filter.</p>
					</div>
				) : (
					visible.map((d) => (
						<DonationRow
							key={d.id}
							donation={d}
							onEdit={openEdit}
							onDelete={handleDelete}
							onOpenThread={setThreadDonation}
							onRevoke={handleRevoke}
						/>
					))
				)}
			</div>

			{/* ── Coordination Thread Dialog ───────────────────────────────── */}
			<Dialog open={!!threadDonation} onOpenChange={(open) => { if (!open) setThreadDonation(null); }}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<MessageSquare className="h-5 w-5 text-primary" />
							Coordination Thread
						</DialogTitle>
						<DialogDescription>
							{threadDonation?.title} — {threadDonation?.status === "claimed"
								? `Claimed by ${(threadDonation as any)?.claimedBy?.name ?? "a distributor"}`
								: "Communicate about pickup details"}
						</DialogDescription>
					</DialogHeader>

					{threadDonation && (
						<CoordinationThread
							donation={threadDonation}
							onMessageSent={handleMessageSent}
						/>
					)}

					<DialogFooter>
						<Button variant="outline" onClick={() => setThreadDonation(null)}>Close</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* ── Edit Donation Dialog ─────────────────────────────────────── */}
			<Dialog open={editState.open} onOpenChange={(open) => { if (!open) setEditState(emptyEdit); }}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>Edit Donation</DialogTitle>
						<DialogDescription>Update the details and save your changes.</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-2">
						<div className="space-y-1">
							<Label htmlFor="edit-title">Title</Label>
							<Input
								id="edit-title"
								value={editState.title}
								onChange={(e) => setEditState((s) => ({ ...s, title: e.target.value }))}
								placeholder="Donation title"
							/>
						</div>
						<div className="space-y-1">
							<Label htmlFor="edit-desc">Description</Label>
							<Textarea
								id="edit-desc"
								value={editState.description}
								onChange={(e) => setEditState((s) => ({ ...s, description: e.target.value }))}
								placeholder="Describe the donation"
								rows={3}
							/>
						</div>
						<div className="space-y-1">
							<Label>Category</Label>
							<Select
								value={editState.category}
								onValueChange={(v) => setEditState((s) => ({ ...s, category: v }))}>
								<SelectTrigger className="rounded-lg">
									<SelectValue placeholder="Select category…" />
								</SelectTrigger>
								<SelectContent>
									{(Object.keys(FOOD_CATEGORY_LABELS) as FoodCategory[]).map((k) => (
										<SelectItem key={k} value={k}>{FOOD_CATEGORY_LABELS[k]}</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1">
								<Label htmlFor="edit-qty">Quantity</Label>
								<Input
									id="edit-qty" type="number" min={1}
									value={editState.quantityValue}
									onChange={(e) => setEditState((s) => ({ ...s, quantityValue: e.target.value }))}
									placeholder="e.g. 10"
								/>
							</div>
							<div className="space-y-1">
								<Label>Unit</Label>
								<Select
									value={editState.quantityUnit}
									onValueChange={(v) => setEditState((s) => ({ ...s, quantityUnit: v }))}>
									<SelectTrigger className="rounded-lg">
										<SelectValue placeholder="Unit…" />
									</SelectTrigger>
									<SelectContent>
										{(Object.keys(QUANTITY_UNIT_LABELS) as QuantityUnit[]).map((k) => (
											<SelectItem key={k} value={k}>{QUANTITY_UNIT_LABELS[k]}</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setEditState(emptyEdit)}>Cancel</Button>
						<Button onClick={handleSaveEdit} disabled={isSaving} className="gap-2">
							{isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
							Save Changes
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
