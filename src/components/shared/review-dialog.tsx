"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function ReviewDialog({
	donationId,
	targetUserId,
	triggerButton,
}: {
	donationId: string;
	targetUserId: string;
	triggerButton: React.ReactNode;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [rating, setRating] = useState(0);
	const [comment, setComment] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { toast } = useToast();
	const router = useRouter();

	const handleSubmit = async () => {
		if (rating === 0) {
			toast({
				title: "Error",
				description: "Please select a rating",
				variant: "destructive",
			});
			return;
		}

		setIsSubmitting(true);
		try {
			const res = await fetch(`/api/users/${targetUserId}/rate`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					donationId,
					rating,
					comment,
				}),
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Failed to submit rating");
			}

			toast({
				title: "Success",
				description: "Thank you for your review!",
			});
			setIsOpen(false);
			router.refresh();
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>{triggerButton}</DialogTrigger>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>Rate the Partner</DialogTitle>
					<DialogDescription>
						Leave a star rating and comment to help maintain trust in our community.
					</DialogDescription>
				</DialogHeader>
				<div className='grid gap-4 py-4'>
					<div className='flex justify-center gap-2'>
						{[1, 2, 3, 4, 5].map((star) => (
							<Star
								key={star}
								className={`h-8 w-8 cursor-pointer transition-colors ${
									star <= rating
										? "text-yellow-500 fill-yellow-500"
										: "text-gray-300"
								}`}
								onClick={() => setRating(star)}
							/>
						))}
					</div>
					<Textarea
						placeholder='Share your experience (optional)...'
						value={comment}
						onChange={(e) => setComment(e.target.value)}
						className='min-h-[100px]'
					/>
				</div>
				<DialogFooter>
					<Button
						variant='outline'
						onClick={() => setIsOpen(false)}
						disabled={isSubmitting}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={isSubmitting}>
						{isSubmitting ? "Submitting..." : "Submit Review"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
