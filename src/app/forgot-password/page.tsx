"use client";

import { useState } from "react";
import Link from "next/link";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Logo } from "@/components/icons/logo";
import { ArrowLeft, Loader2, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
	const [email, setEmail]       = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [error, setError]         = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		try {
			const res = await fetch("/api/auth/forgot-password", {
				method:  "POST",
				headers: { "Content-Type": "application/json" },
				body:    JSON.stringify({ email }),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Failed to send reset email");
			}

			setSubmitted(true);
		} catch (err: any) {
			setError(err.message || "Something went wrong. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='relative flex min-h-screen w-full items-center justify-center p-4 overflow-hidden'>
			<div className='absolute inset-0 bg-gradient-to-br from-primary/5 via-emerald-50/50 to-teal-50/30 -z-20' />
			<div className='absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.08),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(20,184,166,0.08),transparent_50%)] -z-10' />

			<Card className='relative mx-auto w-full max-w-md shadow-2xl border-2 border-gray-100 rounded-2xl overflow-hidden backdrop-blur-sm bg-white/80 animate-scale-in'>
				<div className='absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-emerald-500 to-teal-600' />

				<CardHeader className='text-center space-y-4 pt-8 pb-6'>
					<Link href='/' className='inline-block mb-2 transition-transform duration-300 hover:scale-110'>
						<Logo />
					</Link>
					<CardTitle className='text-3xl font-headline font-bold'>
						Forgot Password
					</CardTitle>
					<CardDescription className='text-base'>
						Enter your email and we&apos;ll send you a reset link.
					</CardDescription>
				</CardHeader>

				<CardContent className='px-8 pb-8'>
					{submitted ? (
						<div className='text-center space-y-4'>
							<div className='mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center'>
								<Mail className='h-8 w-8 text-primary' />
							</div>
							<h3 className='font-semibold text-lg'>Check your inbox</h3>
							<p className='text-muted-foreground text-sm'>
								If an account with <strong>{email}</strong> exists, we&apos;ve sent
								a password reset link. Check your email (and spam folder).
							</p>
							<p className='text-xs text-muted-foreground'>
								The link expires in 1 hour.
							</p>
							<Link
								href='/login'
								className='inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 transition-colors'>
								<ArrowLeft className='h-4 w-4' />
								Back to login
							</Link>
						</div>
					) : (
						<form onSubmit={handleSubmit} className='grid gap-5'>
							{error && (
								<Alert variant='destructive' className='border-2 rounded-xl'>
									<AlertDescription className='font-medium'>{error}</AlertDescription>
								</Alert>
							)}

							<div className='grid gap-2.5'>
								<Label htmlFor='email' className='text-sm font-semibold'>
									Email address
								</Label>
								<Input
									id='email'
									type='email'
									placeholder='name@example.com'
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									disabled={isLoading}
									className='h-11 rounded-xl border-2 focus:border-primary transition-colors'
								/>
							</div>

							<Button
								type='submit'
								className='w-full h-12 text-base font-semibold rounded-xl shadow-lg hover:shadow-glow transition-all duration-300 mt-2'
								disabled={isLoading}>
								{isLoading ? (
									<>
										<Loader2 className='mr-2 h-5 w-5 animate-spin' />
										Sending...
									</>
								) : (
									"Send Reset Link"
								)}
							</Button>

							<div className='text-center'>
								<Link
									href='/login'
									className='inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 transition-colors'>
									<ArrowLeft className='h-4 w-4' />
									Back to login
								</Link>
							</div>
						</form>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
