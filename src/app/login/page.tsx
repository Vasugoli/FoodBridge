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
import { Loader2 } from "lucide-react";

export default function LoginPage() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
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
		<div className='flex min-h-screen w-full items-center justify-center bg-secondary p-4'>
			<Card className='mx-auto w-full max-w-sm shadow-xl'>
				<CardHeader className='text-center'>
					<Link href='/' className='inline-block mb-4'>
						<Logo />
					</Link>
					<CardTitle className='text-2xl font-headline'>
						Welcome Back
					</CardTitle>
					<CardDescription>
						Enter your credentials to access your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className='grid gap-4'>
						{error && (
							<Alert variant='destructive'>
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						<div className='grid gap-2'>
							<Label htmlFor='email'>Email</Label>
							<Input
								id='email'
								type='email'
								placeholder='m@example.com'
								required
								value={formData.email}
								onChange={(e) =>
									setFormData({
										...formData,
										email: e.target.value,
									})
								}
								disabled={isLoading}
							/>
						</div>

						<div className='grid gap-2'>
							<div className='flex items-center'>
								<Label htmlFor='password'>Password</Label>
								<Link
									href='#'
									className='ml-auto inline-block text-sm underline'>
									Forgot your password?
								</Link>
							</div>
							<Input
								id='password'
								type='password'
								required
								value={formData.password}
								onChange={(e) =>
									setFormData({
										...formData,
										password: e.target.value,
									})
								}
								disabled={isLoading}
							/>
						</div>

						<Button
							type='submit'
							className='w-full'
							disabled={isLoading}>
							{isLoading ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Signing in...
								</>
							) : (
								"Sign In"
							)}
						</Button>
					</form>

					<div className='mt-4 text-center text-sm'>
						Don&apos;t have an account?{" "}
						<Link href='/signup' className='underline'>
							Sign up
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
