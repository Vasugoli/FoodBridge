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
import { Loader2 } from "lucide-react";

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
		<div className='flex min-h-screen w-full items-center justify-center bg-secondary p-4'>
			<Card className='mx-auto w-full max-w-sm shadow-xl'>
				<CardHeader className='text-center'>
					<Link href='/' className='inline-block mb-4'>
						<Logo />
					</Link>
					<CardTitle className='text-2xl font-headline'>
						Create an Account
					</CardTitle>
					<CardDescription>
						Join FoodBridge to start making a difference
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
							<Label htmlFor='full-name'>Full Name</Label>
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
							/>
						</div>

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
							<Label htmlFor='password'>Password</Label>
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
							/>
						</div>

						<div className='grid gap-2'>
							<Label htmlFor='role'>I am a...</Label>
							<Select
								value={formData.role}
								onValueChange={(value) =>
									setFormData({ ...formData, role: value })
								}
								disabled={isLoading}
								required>
								<SelectTrigger id='role'>
									<SelectValue placeholder='Select your role' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='donor'>
										Donor (I want to donate food)
									</SelectItem>
									<SelectItem value='distributor'>
										Distributor (I want to collect food)
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<Button
							type='submit'
							className='w-full'
							disabled={isLoading}>
							{isLoading ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Creating account...
								</>
							) : (
								"Create Account"
							)}
						</Button>
					</form>

					<div className='mt-4 text-center text-sm'>
						Already have an account?{" "}
						<Link href='/login' className='underline'>
							Sign in
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
