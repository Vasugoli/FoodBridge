"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [status, setStatus] = useState<"loading" | "success" | "error">(
		"loading",
	);
	const [message, setMessage] = useState("");

	useEffect(() => {
		const token = searchParams.get("token");

		if (!token) {
			setStatus("error");
			setMessage("No verification token provided");
			return;
		}

		// Verify the token
		fetch(`/api/auth/verify-email?token=${token}`)
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					setStatus("success");
					setMessage(data.message);
				} else {
					setStatus("error");
					setMessage(data.error || "Verification failed");
				}
			})
			.catch(() => {
				setStatus("error");
				setMessage("An error occurred during verification");
			});
	}, [searchParams]);

	return (
		<div className='min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white p-4'>
			<Card className='w-full max-w-md'>
				<CardHeader className='text-center'>
					<CardTitle className='text-2xl'>
						Email Verification
					</CardTitle>
					<CardDescription>
						{status === "loading" &&
							"Verifying your email address..."}
						{status === "success" &&
							"Your email has been verified!"}
						{status === "error" && "Verification failed"}
					</CardDescription>
				</CardHeader>
				<CardContent className='flex flex-col items-center space-y-4'>
					{status === "loading" && (
						<Loader2 className='h-16 w-16 text-green-600 animate-spin' />
					)}
					{status === "success" && (
						<>
							<CheckCircle2 className='h-16 w-16 text-green-600' />
							<p className='text-center text-muted-foreground'>
								{message}
							</p>
							<Button
								onClick={() => router.push("/dashboard")}
								className='w-full'>
								Go to Dashboard
							</Button>
						</>
					)}
					{status === "error" && (
						<>
							<XCircle className='h-16 w-16 text-red-600' />
							<p className='text-center text-muted-foreground'>
								{message}
							</p>
							<Button
								onClick={() => router.push("/login")}
								variant='outline'
								className='w-full'>
								Back to Login
							</Button>
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
