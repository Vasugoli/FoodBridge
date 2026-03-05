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
import { Logo } from "@/components/icons/logo";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		try {
			const response = await fetch("/api/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to log in");
			}

			// Redirect to dashboard after successful login
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
			<div className='absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.08),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(20,184,166,0.08),transparent_50%)] -z-10' />

			{/* Decorative elements */}
			<div className='absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-slow -z-10' />
			<div className='absolute bottom-20 left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-slow animation-delay-400 -z-10' />

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
							Welcome Back
						</CardTitle>
						<CardDescription className='text-base'>
							Enter your credentials to access your account
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
							<div className='flex items-center justify-between'>
								<Label
									htmlFor='password'
									className='text-sm font-semibold'>
									Password
								</Label>
								<Link
									href='#'
									className='text-sm text-primary hover:text-primary/80 font-medium transition-colors'>
									Forgot password?
								</Link>
							</div>
							<div className='relative'>
								<Input
									id='password'
									type={showPassword ? "text" : "password"}
									required
									value={formData.password}
									onChange={(e) =>
										setFormData({
											...formData,
											password: e.target.value,
										})
									}
									disabled={isLoading}
									className='h-11 rounded-xl border-2 focus:border-primary transition-colors pr-10'
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
								>
									{showPassword ? (
										<EyeOff className="h-5 w-5" />
									) : (
										<Eye className="h-5 w-5" />
									)}
								</button>
							</div>
						</div>

						<Button
							type='submit'
							className='w-full h-12 text-base font-semibold rounded-xl shadow-lg hover:shadow-glow transition-all duration-300 mt-2'
							disabled={isLoading}>
							{isLoading ? (
								<>
									<Loader2 className='mr-2 h-5 w-5 animate-spin' />
									Signing in...
								</>
							) : (
								"Sign In"
							)}
						</Button>
					</form>

					<div className='relative my-8'>
						<div className='absolute inset-0 flex items-center'>
							<span className='w-full border-t border-gray-200' />
						</div>
						<div className='relative flex justify-center text-xs uppercase'>
							<span className='bg-white px-3 text-muted-foreground font-medium'>
								New to FoodBridge?
							</span>
						</div>
					</div>

					<div className='text-center'>
						<Link
							href='/signup'
							className='inline-flex items-center justify-center text-sm font-semibold text-primary hover:text-primary/80 transition-colors'>
							Create an account
							<ArrowRight className='ml-1 h-4 w-4' />
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
