"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Logo } from "@/components/icons/logo";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowRight } from "lucide-react";

export default function SignupPage() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		role: "",
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		try {
			const response = await fetch("/api/auth/signup", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to create account");
			}

			// Redirect to dashboard after successful signup
			router.push("/dashboard");
		} catch (err: any) {
			setError(err.message || "Something went wrong. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='relative flex min-h-screen w-full items-center justify-center p-4 overflow-hidden'>
			{/* Animated background */}
			<div className='absolute inset-0 bg-gradient-to-br from-primary/5 via-emerald-50/50 to-teal-50/30 -z-20' />
			<div className='absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.08),transparent_50%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.08),transparent_50%)] -z-10' />

			{/* Decorative elements */}
			<div className='absolute top-20 left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-slow -z-10' />
			<div className='absolute bottom-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow animation-delay-400 -z-10' />

			<Card className='relative mx-auto w-full max-w-md shadow-2xl border-2 border-gray-100 rounded-2xl overflow-hidden backdrop-blur-sm bg-white/80 animate-scale-in'>
				{/* Accent bar */}
				<div className='absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-emerald-500 to-teal-600' />

				<CardHeader className='text-center space-y-4 pt-8 pb-6'>
					<Link
						href='/'
						className='inline-block mb-2 transition-transform duration-300 hover:scale-110'>
						<Logo />
					</Link>
					<div className='space-y-2'>
						<CardTitle className='text-3xl font-headline font-bold'>
							Create an Account
						</CardTitle>
						<CardDescription className='text-base'>
							Join FoodBridge to start making a difference
						</CardDescription>
					</div>
				</CardHeader>

				<CardContent className='px-8 pb-8'>
					<form onSubmit={handleSubmit} className='grid gap-5'>
						{error && (
							<Alert
								variant='destructive'
								className='border-2 rounded-xl'>
								<AlertDescription className='font-medium'>
									{error}
								</AlertDescription>
							</Alert>
						)}

						<div className='grid gap-2.5'>
							<Label
								htmlFor='full-name'
								className='text-sm font-semibold'>
								Full Name
							</Label>
							<Input
								id='full-name'
								placeholder='John Doe'
								required
								value={formData.name}
								onChange={(e) =>
									setFormData({
										...formData,
										name: e.target.value,
									})
								}
								disabled={isLoading}
								className='h-11 rounded-xl border-2 focus:border-primary transition-colors'
							/>
						</div>

						<div className='grid gap-2.5'>
							<Label
								htmlFor='email'
								className='text-sm font-semibold'>
								Email
							</Label>
							<Input
								id='email'
								type='email'
								placeholder='name@example.com'
								required
								value={formData.email}
								onChange={(e) =>
									setFormData({
										...formData,
										email: e.target.value,
									})
								}
								disabled={isLoading}
								className='h-11 rounded-xl border-2 focus:border-primary transition-colors'
							/>
						</div>

						<div className='grid gap-2.5'>
							<Label
								htmlFor='password'
								className='text-sm font-semibold'>
								Password
							</Label>
							<Input
								id='password'
								type='password'
								required
								minLength={6}
								placeholder='At least 6 characters'
								value={formData.password}
								onChange={(e) =>
									setFormData({
										...formData,
										password: e.target.value,
									})
								}
								disabled={isLoading}
								className='h-11 rounded-xl border-2 focus:border-primary transition-colors'
							/>
						</div>

						<div className='grid gap-2.5'>
							<Label
								htmlFor='role'
								className='text-sm font-semibold'>
								I am a...
							</Label>
							<Select
								value={formData.role}
								onValueChange={(value) =>
									setFormData({ ...formData, role: value })
								}
								disabled={isLoading}
								required>
								<SelectTrigger
									id='role'
									className='h-11 rounded-xl border-2 focus:border-primary transition-colors'>
									<SelectValue placeholder='Select your role' />
								</SelectTrigger>
								<SelectContent className='rounded-xl'>
									<SelectItem
										value='donor'
										className='rounded-lg'>
										🎁 Donor (I want to donate food)
									</SelectItem>
									<SelectItem
										value='distributor'
										className='rounded-lg'>
										📦 Distributor (I want to collect food)
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<Button
							type='submit'
							className='w-full h-12 text-base font-semibold rounded-xl shadow-lg hover:shadow-glow transition-all duration-300 mt-2'
							disabled={isLoading}>
							{isLoading ? (
								<>
									<Loader2 className='mr-2 h-5 w-5 animate-spin' />
									Creating account...
								</>
							) : (
								"Create Account"
							)}
						</Button>
					</form>

					<div className='relative my-8'>
						<div className='absolute inset-0 flex items-center'>
							<span className='w-full border-t border-gray-200' />
						</div>
						<div className='relative flex justify-center text-xs uppercase'>
							<span className='bg-white px-3 text-muted-foreground font-medium'>
								Already a member?
							</span>
						</div>
					</div>

					<div className='text-center'>
						<Link
							href='/login'
							className='inline-flex items-center justify-center text-sm font-semibold text-primary hover:text-primary/80 transition-colors'>
							Sign in to your account
							<ArrowRight className='ml-1 h-4 w-4' />
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
