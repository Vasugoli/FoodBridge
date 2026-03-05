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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const LocationPicker = dynamic(
	() => import("@/components/map/location-picker"),
	{ ssr: false },
);
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { FOOD_CATEGORY_LABELS, QUANTITY_UNIT_LABELS } from "@/lib/types";
import type { FoodCategory, QuantityUnit } from "@/lib/types";

const donationFormSchema = z.object({
	title: z.string().min(5, "Title must be at least 5 characters."),
	description: z
		.string()
		.min(10, "Description must be at least 10 characters.")
		.max(500, "Description must be less than 500 characters."),
	category: z.enum(
		[
			"cooked_food",
			"packaged_goods",
			"produce",
			"bakery",
			"dairy",
			"beverages",
			"other",
		],
		{ required_error: "Category is required." },
	),
	quantityValue: z.coerce
		.number({ invalid_type_error: "Enter a number." })
		.positive("Quantity must be greater than 0.")
		.max(100000),
	quantityUnit: z.enum(
		["meals", "kg", "boxes", "items", "liters", "portions"],
		{ required_error: "Unit is required." },
	),
	expiry: z.date({ required_error: "An expiry date is required." }),
	coordinates: z.object({ lat: z.number(), lng: z.number() }),
	locationAddress: z.string().optional(),
	contactNumber: z.string().optional(),
	imageUrl: z.string().optional(),
});

type DonationFormValues = z.infer<typeof donationFormSchema>;

const defaultValues: Partial<DonationFormValues> = {
	title: "",
	description: "",
	contactNumber: "",
	locationAddress: "",
};

export default function DonationForm() {
	const { toast } = useToast();
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const form = useForm<DonationFormValues>({
		resolver: zodResolver(donationFormSchema),
		defaultValues,
	});

	async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onloadend = () => setImagePreview(reader.result as string);
		reader.readAsDataURL(file);

		setIsUploading(true);
		setUploadProgress(20);

		try {
			const formData = new FormData();
			formData.append("file", file);
			setUploadProgress(50);

			const res = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});
			setUploadProgress(90);

			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.error || "Upload failed");
			}

			const { url } = await res.json();
			form.setValue("imageUrl", url);
			setUploadProgress(100);
			toast({
				title: "Image uploaded",
				description: "Your photo is ready.",
			});
		} catch (error) {
			toast({
				title: "Upload failed",
				description:
					error instanceof Error ? error.message : "Try again",
				variant: "destructive",
			});
			setImagePreview(null);
			form.setValue("imageUrl", undefined);
			if (fileInputRef.current) fileInputRef.current.value = "";
		} finally {
			setIsUploading(false);
			setTimeout(() => setUploadProgress(0), 1000);
		}
	}

	function removeImage() {
		setImagePreview(null);
		form.setValue("imageUrl", undefined);
		if (fileInputRef.current) fileInputRef.current.value = "";
	}

	async function onSubmit(data: DonationFormValues) {
		setIsSubmitting(true);
		try {
			const response = await fetch("/api/donations", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: data.title,
					description: data.description,
					category: data.category,
					quantity: `${data.quantityValue} ${data.quantityUnit}`,
					quantityValue: data.quantityValue,
					quantityUnit: data.quantityUnit,
					contactNumber: data.contactNumber || undefined,
					expiry: data.expiry.toISOString(),
					location: data.locationAddress || undefined,
					coordinates: data.coordinates,
					imageUrl: data.imageUrl || undefined,
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
			setImagePreview(null);
			setTimeout(() => {
				router.push("/dashboard");
				router.refresh();
			}, 1000);
		} catch (error) {
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
				{/* Title */}
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

				{/* Description */}
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

				{/* Category */}
				<FormField
					control={form.control}
					name='category'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Food Category</FormLabel>
							<Select
								onValueChange={field.onChange}
								defaultValue={field.value}>
								<FormControl>
									<SelectTrigger className='rounded-lg'>
										<SelectValue placeholder='Select a category…' />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{(
										Object.keys(
											FOOD_CATEGORY_LABELS,
										) as FoodCategory[]
									).map((key) => (
										<SelectItem key={key} value={key}>
											{FOOD_CATEGORY_LABELS[key]}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Quantity — number + unit */}
				<div className='grid grid-cols-2 gap-4'>
					<FormField
						control={form.control}
						name='quantityValue'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Quantity</FormLabel>
								<FormControl>
									<Input
										type='number'
										min={1}
										placeholder='e.g. 10'
										{...field}
										value={field.value ?? ""}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name='quantityUnit'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Unit</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}>
									<FormControl>
										<SelectTrigger className='rounded-lg'>
											<SelectValue placeholder='Select unit…' />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{(
											Object.keys(
												QUANTITY_UNIT_LABELS,
											) as QuantityUnit[]
										).map((key) => (
											<SelectItem key={key} value={key}>
												{QUANTITY_UNIT_LABELS[key]}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				{/* Expiry */}
				<FormField
					control={form.control}
					name='contactNumber'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Contact Number (Optional)</FormLabel>
							<FormControl>
								<Input
									placeholder='e.g., (555) 123-4567'
									{...field}
								/>
							</FormControl>
							<FormDescription>
								Provide a phone number for the distributor to
								reach you easily. It will only be visible to
								them once they claim the donation.
							</FormDescription>
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
													"text-muted-foreground",
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
															30,
													),
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

				{/* Location */}
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
											if (loc.address)
												form.setValue(
													"locationAddress",
													loc.address,
												);
										}}
									/>
									<div className='text-sm text-muted-foreground'>
										Click on the map to select a pickup
										point.
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
								You can refine the address if needed.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Image Upload */}
				<FormItem>
					<FormLabel>Donation Photo (optional)</FormLabel>
					{imagePreview ? (
						<div className='relative rounded-lg overflow-hidden border-2 border-dashed border-primary/40 bg-secondary'>
							<Image
								src={imagePreview}
								alt='Preview'
								width={800}
								height={300}
								className='w-full h-48 object-cover'
							/>
							<button
								type='button'
								onClick={removeImage}
								aria-label='Remove image'
								className='absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors'>
								<X className='h-4 w-4' />
							</button>
							{isUploading && (
								<div className='absolute bottom-0 left-0 right-0 p-2 bg-black/50'>
									<Progress
										value={uploadProgress}
										className='h-2'
									/>
								</div>
							)}
						</div>
					) : (
						<label
							htmlFor='dropzone-file'
							className={cn(
								"flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary transition-colors",
								isUploading
									? "opacity-50 pointer-events-none"
									: "hover:bg-muted hover:border-primary/40",
							)}>
							<div className='flex flex-col items-center justify-center gap-2'>
								<ImageIcon className='w-8 h-8 text-muted-foreground' />
								<p className='text-sm text-muted-foreground'>
									<span className='font-semibold'>
										Click to upload
									</span>{" "}
									or drag and drop
								</p>
								<p className='text-xs text-muted-foreground'>
									PNG, JPG, WebP — max 5 MB
								</p>
							</div>
						</label>
					)}

					<input
						ref={fileInputRef}
						id='dropzone-file'
						type='file'
						accept='image/jpeg,image/jpg,image/png,image/webp'
						className='hidden'
						onChange={handleImageSelect}
					/>
				</FormItem>

				<Button
					type='submit'
					className='w-full'
					disabled={isSubmitting || isUploading}>
					{isSubmitting ? "Posting…" : "Post Donation"}
				</Button>
			</form>
		</Form>
	);
}
