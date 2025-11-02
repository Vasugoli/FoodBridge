"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useRouter } from "next/navigation";
import LocationPicker from "@/components/map/location-picker";

const donationFormSchema = z.object({
	title: z.string().min(5, "Title must be at least 5 characters."),
	description: z
		.string()
		.min(10, "Description must be at least 10 characters.")
		.max(200, "Description must be less than 200 characters."),
	quantity: z.string().min(1, "Quantity is required."),
	expiry: z.date({ required_error: "An expiry date is required." }),
	coordinates: z.object({ lat: z.number(), lng: z.number() }),
	locationAddress: z.string().optional(),
	image: z.any().optional(),
});

type DonationFormValues = z.infer<typeof donationFormSchema>;

const defaultValues: Partial<DonationFormValues> = {
	title: "",
	description: "",
	quantity: "",
	locationAddress: "",
};

export default function DonationForm() {
	const { toast } = useToast();
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<DonationFormValues>({
		resolver: zodResolver(donationFormSchema),
		defaultValues,
	});

	async function onSubmit(data: DonationFormValues) {
		setIsSubmitting(true);

		try {
			const response = await fetch("/api/donations", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					title: data.title,
					description: data.description,
					quantity: data.quantity,
					expiry: data.expiry.toISOString(),
					location: data.locationAddress,
					coordinates: data.coordinates,
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to create donation");
			}

			toast({
				title: "Donation Posted!",
				description: "Your donation has been successfully listed.",
			});

			form.reset();

			// Redirect to dashboard after a short delay
			setTimeout(() => {
				router.push("/dashboard");
				router.refresh();
			}, 1000);
		} catch (error) {
			console.error("Error creating donation:", error);
			toast({
				title: "Error",
				description:
					error instanceof Error
						? error.message
						: "Failed to create donation. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
				<FormField
					control={form.control}
					name='title'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Donation Title</FormLabel>
							<FormControl>
								<Input
									placeholder='e.g., Fresh Bread Loaves'
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='description'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Description</FormLabel>
							<FormControl>
								<Textarea
									placeholder='Describe the items, condition, and any allergens.'
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='quantity'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Quantity</FormLabel>
							<FormControl>
								<Input
									placeholder='e.g., 2 boxes, approx. 20 meals'
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='expiry'
					render={({ field }) => (
						<FormItem className='flex flex-col'>
							<FormLabel>Best Before / Expiry Date</FormLabel>
							<Popover>
								<PopoverTrigger asChild>
									<FormControl>
										<Button
											variant={"outline"}
											className={cn(
												"w-full pl-3 text-left font-normal",
												!field.value &&
													"text-muted-foreground"
											)}>
											{field.value ? (
												format(field.value, "PPP")
											) : (
												<span>Pick a date</span>
											)}
											<CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
										</Button>
									</FormControl>
								</PopoverTrigger>
								<PopoverContent
									className='w-auto p-0'
									align='start'>
									<Calendar
										mode='single'
										selected={field.value}
										onSelect={field.onChange}
										disabled={(date) =>
											date < new Date() ||
											date >
												new Date(
													new Date().setDate(
														new Date().getDate() +
															30
													)
												)
										}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name='coordinates'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Pickup Location</FormLabel>
							<FormControl>
								<div className='space-y-2'>
									<LocationPicker
										onChange={(loc) => {
											field.onChange({
												lat: loc.lat,
												lng: loc.lng,
											});
											if (loc.address) {
												form.setValue(
													"locationAddress",
													loc.address
												);
											}
										}}
									/>
									<div className='text-sm text-muted-foreground'>
										Click on the map to select a pickup
										point. We'll try to fill the address
										automatically.
									</div>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name='locationAddress'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Address (optional)</FormLabel>
							<FormControl>
								<Input
									placeholder='Resolved address'
									{...field}
								/>
							</FormControl>
							<FormDescription>
								You can refine the address if needed. The map
								location will be used for pickup.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name='image'
					render={() => (
						<FormItem>
							<FormLabel>Donation Image</FormLabel>
							<FormControl>
								<div className='flex items-center justify-center w-full'>
									<label
										htmlFor='dropzone-file'
										className='flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted'>
										<div className='flex flex-col items-center justify-center pt-5 pb-6'>
											<Upload className='w-8 h-8 mb-3 text-muted-foreground' />
											<p className='mb-2 text-sm text-muted-foreground'>
												<span className='font-semibold'>
													Click to upload
												</span>{" "}
												or drag and drop
											</p>
											<p className='text-xs text-muted-foreground'>
												PNG, JPG or GIF (MAX. 800x400px)
											</p>
										</div>
										<Input
											id='dropzone-file'
											type='file'
											className='hidden'
										/>
									</label>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type='submit' disabled={isSubmitting}>
					{isSubmitting ? "Posting..." : "Post Donation"}
				</Button>
			</form>
		</Form>
	);
}
