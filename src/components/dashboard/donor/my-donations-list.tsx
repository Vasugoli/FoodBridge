"use client";
import Image from "next/image";
import { format, formatDistanceToNow } from "date-fns";
import { MoreHorizontal } from "lucide-react";
import type { Donation } from "@/lib/types";
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
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

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

export default function MyDonationsList({
	donations,
}: {
	donations: Donation[];
}) {
	const { toast } = useToast();
	const router = useRouter();

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

	const handleEdit = async (donation: Donation) => {
		const title = prompt("Update title", donation.title);
		if (title == null) return;
		const description = prompt(
			"Update description",
			donation.description ?? ""
		);
		if (description == null) return;
		try {
			const res = await fetch(`/api/donations/${donation.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ title, description }),
			});
			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				throw new Error(err.error || "Failed to update");
			}
			toast({
				title: "Updated",
				description: "Donation updated successfully.",
			});
			router.refresh();
		} catch (e) {
			toast({
				title: "Error",
				description:
					e instanceof Error ? e.message : "Failed to update",
				variant: "destructive",
			});
		}
	};
	return (
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
											donation.imageUrl.startsWith("/")
												? "https://placehold.co/128x128/jpg?text=Donation"
												: donation.imageUrl
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
													handleEdit(donation)
												}>
												Edit
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() =>
													handleDelete(donation.id)
												}>
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
