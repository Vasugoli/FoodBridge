"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import { CheckCircle2, Loader2, AlertTriangle } from "lucide-react";

function ResetPasswordForm() {
	const searchParams    = useSearchParams();
	const router          = useRouter();
	const token           = searchParams.get("token") ?? "";

	const [password, setPassword]       = useState("");
	const [confirm, setConfirm]         = useState("");
	const [isLoading, setIsLoading]     = useState(false);
	const [success, setSuccess]         = useState(false);
	const [error, setError]             = useState("");

	useEffect(() => {
		if (!token) setError("No reset token found. Please request a new reset link.");
	}, [token]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (password !== confirm) {
			setError("Passwords do not match.");
			return;
		}

		setError("");
		setIsLoading(true);

		try {
			const res = await fetch("/api/auth/reset-password", {
				method:  "POST",
				headers: { "Content-Type": "application/json" },
				body:    JSON.stringify({ token, password }),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Failed to reset password");
			}

			setSuccess(true);
			setTimeout(() => router.push("/login"), 3000);
		} catch (err: any) {
			setError(err.message || "Something went wrong. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='relative flex min-h-screen w-full items-center justify-center p-4 overflow-hidden'>
			<div className='absolute inset-0 bg-gradient-to-br from-primary/5 via-emerald-50/50 to-teal-50/30 -z-20' />

			<Card className='relative mx-auto w-full max-w-md shadow-2xl border-2 border-gray-100 rounded-2xl overflow-hidden backdrop-blur-sm bg-white/80 animate-scale-in'>
				<div className='absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-emerald-500 to-teal-600' />

				<CardHeader className='text-center space-y-4 pt-8 pb-6'>
					<Link href='/' className='inline-block mb-2 transition-transform duration-300 hover:scale-110'>
						<Logo />
					</Link>
					<CardTitle className='text-3xl font-headline font-bold'>
						Reset Password
					</CardTitle>
					<CardDescription className='text-base'>
						Choose a new secure password for your account.
					</CardDescription>
				</CardHeader>

				<CardContent className='px-8 pb-8'>
					{success ? (
						<div className='text-center space-y-4'>
							<div className='mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center'>
								<CheckCircle2 className='h-8 w-8 text-primary' />
							</div>
							<h3 className='font-semibold text-lg'>Password Updated!</h3>
							<p className='text-muted-foreground text-sm'>
								Your password has been reset. Redirecting to login…
							</p>
						</div>
					) : (
						<form onSubmit={handleSubmit} className='grid gap-5'>
							{error && (
								<Alert variant='destructive' className='border-2 rounded-xl'>
									<AlertTriangle className='h-4 w-4' />
									<AlertDescription className='font-medium'>{error}</AlertDescription>
								</Alert>
							)}

							<div className='grid gap-2.5'>
								<Label htmlFor='password' className='text-sm font-semibold'>
									New Password
								</Label>
								<Input
									id='password'
									type='password'
									required
									placeholder='At least 12 characters'
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									disabled={isLoading || !token}
									className='h-11 rounded-xl border-2 focus:border-primary transition-colors'
								/>
								<p className='text-xs text-muted-foreground'>
									Must be at least 12 chars with uppercase, lowercase, number, and special character.
								</p>
							</div>

							<div className='grid gap-2.5'>
								<Label htmlFor='confirm' className='text-sm font-semibold'>
									Confirm Password
								</Label>
								<Input
									id='confirm'
									type='password'
									required
									placeholder='Repeat your new password'
									value={confirm}
									onChange={(e) => setConfirm(e.target.value)}
									disabled={isLoading || !token}
									className='h-11 rounded-xl border-2 focus:border-primary transition-colors'
								/>
							</div>

							<Button
								type='submit'
								className='w-full h-12 text-base font-semibold rounded-xl shadow-lg hover:shadow-glow transition-all duration-300 mt-2'
								disabled={isLoading || !token}>
								{isLoading ? (
									<>
										<Loader2 className='mr-2 h-5 w-5 animate-spin' />
										Resetting…
									</>
								) : (
									"Reset Password"
								)}
							</Button>

							<div className='text-center text-sm text-muted-foreground'>
								Remembered your password?{" "}
								<Link href='/login' className='text-primary font-semibold hover:underline'>
									Sign in
								</Link>
							</div>
						</form>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

export default function ResetPasswordPage() {
	return (
		<Suspense>
			<ResetPasswordForm />
		</Suspense>
	);
}
