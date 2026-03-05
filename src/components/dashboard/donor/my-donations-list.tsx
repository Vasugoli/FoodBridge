"use client";
import Image from "next/image";
import { format, formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Loader2 } from "lucide-react";
import { useState } from "react";
import type { Donation, FoodCategory, QuantityUnit } from "@/lib/types";
import { FOOD_CATEGORY_LABELS, QUANTITY_UNIT_LABELS } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import ReviewDialog from "@/components/shared/review-dialog";

const statusVariantMap: {
	[key in Donation["status"]]:
		| "default"
		| "secondary"
		| "destructive"
		| "outline";
} = {
	available: "default",
	claimed: "secondary",
	completed: "outline",
	expired: "destructive",
};

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

export default function MyDonationsList({
	donations,
}: {
	donations: Donation[];
}) {
	const { toast } = useToast();
	const router = useRouter();
	const [editState, setEditState] = useState<EditState>(emptyEdit);
	const [isSaving, setIsSaving] = useState(false);

	const handleDelete = async (id: string) => {
		if (!confirm("Delete this donation?")) return;
		try {
			const res = await fetch(`/api/donations/${id}`, {
				method: "DELETE",
			});
			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				throw new Error(err.error || "Failed to delete");
			}
			toast({
				title: "Deleted",
				description: "Donation has been deleted.",
			});
			router.refresh();
		} catch (e) {
			toast({
				title: "Error",
				description:
					e instanceof Error ? e.message : "Failed to delete",
				variant: "destructive",
			});
		}
	};

	function openEdit(donation: Donation) {
		setEditState({
			open: true,
			donation,
			title: donation.title,
			description: donation.description ?? "",
			category: donation.category ?? "",
			quantityValue: donation.quantityValue?.toString() ?? "",
			quantityUnit: donation.quantityUnit ?? "",
		});
	}

	async function handleSaveEdit() {
		if (!editState.donation) return;
		if (!editState.title.trim()) {
			toast({ title: "Validation", description: "Title is required.", variant: "destructive" });
			return;
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
			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				throw new Error(err.error || "Failed to update");
			}
			toast({ title: "Updated", description: "Donation updated successfully." });
			setEditState(emptyEdit);
			router.refresh();
		} catch (e) {
			toast({
				title: "Error",
				description: e instanceof Error ? e.message : "Failed to update",
				variant: "destructive",
			});
		} finally {
			setIsSaving(false);
		}
	}
	return (
		<>
		<Card>
			<CardHeader>
				<CardTitle>Your Donations</CardTitle>
				<CardDescription>
					A list of all the food donations you have posted.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className='hidden w-[100px] sm:table-cell'>
								<span className='sr-only'>Image</span>
							</TableHead>
							<TableHead>Title</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className='hidden md:table-cell'>
								Expires
							</TableHead>
							<TableHead className='hidden lg:table-cell'>
								Coordination Note
							</TableHead>
							<TableHead className='hidden md:table-cell'>
								Created at
							</TableHead>
							<TableHead>
								<span className='sr-only'>Actions</span>
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{donations.map((donation) => (
							<TableRow key={donation.id}>
								<TableCell className='hidden sm:table-cell'>
									<Image
										alt={donation.title}
										className='aspect-square rounded-md object-cover'
										height='64'
										src={
											donation.imageUrl &&
											(
												donation.imageUrl.startsWith("/uploads/") ||
												donation.imageUrl.startsWith("http")
											)
												? donation.imageUrl
												: "https://placehold.co/128x128/jpg?text=Donation"
										}
										width='64'
										data-ai-hint={donation.imageHint}
									/>
								</TableCell>
								<TableCell className='font-medium'>
									{donation.title}
								</TableCell>
								<TableCell>
									<Badge
										variant={
											statusVariantMap[donation.status]
										}
										className='capitalize'>
										{donation.status}
									</Badge>
								</TableCell>
								<TableCell className='hidden md:table-cell'>
									{formatDistanceToNow(donation.expiry, {
										addSuffix: true,
									})}
								</TableCell>
								<TableCell className='hidden lg:table-cell max-w-[200px]'>
									{donation.pickupNote ? (
										<span className='text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 block truncate' title={donation.pickupNote}>
											{donation.pickupNote}
										</span>
									) : (
										<span className='text-xs text-muted-foreground italic'>No note</span>
									)}
								</TableCell>
								<TableCell className='hidden md:table-cell'>
									{format(donation.createdAt, "PP")}
								</TableCell>
								<TableCell>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												aria-haspopup='true'
												size='icon'
												variant='ghost'>
												<MoreHorizontal className='h-4 w-4' />
												<span className='sr-only'>
													Toggle menu
												</span>
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align='end'>
											<DropdownMenuLabel>
												Actions
											</DropdownMenuLabel>
											<DropdownMenuItem
												onClick={() =>
													openEdit(donation)
												}>
												Edit
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() =>
													handleDelete(donation.id)
												}>
												Delete
											</DropdownMenuItem>
											{donation.status === "completed" && donation.claimedBy && (
												<ReviewDialog
													donationId={donation.id}
													targetUserId={donation.claimedBy.id}
													triggerButton={
														<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
															Rate Partner
														</DropdownMenuItem>
													}
												/>
											)}
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>

		{/* Edit Donation Dialog */}
		<Dialog open={editState.open} onOpenChange={(open) => { if (!open) setEditState(emptyEdit); }}>
			<DialogContent className='sm:max-w-lg'>
				<DialogHeader>
					<DialogTitle>Edit Donation</DialogTitle>
					<DialogDescription>
						Update the details below and save your changes.
					</DialogDescription>
				</DialogHeader>
				<div className='space-y-4 py-2'>
					<div className='space-y-1'>
						<Label htmlFor='edit-title'>Title</Label>
						<Input
							id='edit-title'
							value={editState.title}
							onChange={(e) => setEditState((s) => ({ ...s, title: e.target.value }))}
							placeholder='Donation title'
						/>
					</div>
					<div className='space-y-1'>
						<Label htmlFor='edit-desc'>Description</Label>
						<Textarea
							id='edit-desc'
							value={editState.description}
							onChange={(e) => setEditState((s) => ({ ...s, description: e.target.value }))}
							placeholder='Describe the donation'
							rows={3}
						/>
					</div>
					<div className='space-y-1'>
						<Label>Category</Label>
						<Select
							value={editState.category}
							onValueChange={(v) => setEditState((s) => ({ ...s, category: v }))}
						>
							<SelectTrigger className='rounded-lg'>
								<SelectValue placeholder='Select category…' />
							</SelectTrigger>
							<SelectContent>
								{(Object.keys(FOOD_CATEGORY_LABELS) as FoodCategory[]).map((k) => (
									<SelectItem key={k} value={k}>{FOOD_CATEGORY_LABELS[k]}</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className='grid grid-cols-2 gap-3'>
						<div className='space-y-1'>
							<Label htmlFor='edit-qty'>Quantity</Label>
							<Input
								id='edit-qty'
								type='number'
								min={1}
								value={editState.quantityValue}
								onChange={(e) => setEditState((s) => ({ ...s, quantityValue: e.target.value }))}
								placeholder='e.g. 10'
							/>
						</div>
						<div className='space-y-1'>
							<Label>Unit</Label>
							<Select
								value={editState.quantityUnit}
								onValueChange={(v) => setEditState((s) => ({ ...s, quantityUnit: v }))}
							>
								<SelectTrigger className='rounded-lg'>
									<SelectValue placeholder='Unit…' />
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
					<Button variant='outline' onClick={() => setEditState(emptyEdit)}>Cancel</Button>
					<Button onClick={handleSaveEdit} disabled={isSaving} className='gap-2'>
						{isSaving && <Loader2 className='h-4 w-4 animate-spin' />}
						Save Changes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
		</>
	);
}
