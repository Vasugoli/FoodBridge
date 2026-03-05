"use client";

import { useActionState, useRef } from "react";
import { updatePasswordAction } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: any = {
	error: "",
	success: "",
};

export function PasswordForm() {
	const [state, formAction, isPending] = useActionState(
		updatePasswordAction,
		initialState
	);

	const formRef = useRef<HTMLFormElement>(null);

	// Reset form on success
	if (state?.success && formRef.current) {
	    formRef.current.reset();
	    state.success = ""; // Clear to avoid infinite loop
	}

	return (
		<Card className='mt-6'>
			<CardHeader>
				<CardTitle>Change Password</CardTitle>
				<CardDescription>
					Update your password for better security.
				</CardDescription>
			</CardHeader>
			<form action={formAction} ref={formRef}>
				<CardContent className='space-y-4'>
					{state?.success && (
						<div className="bg-emerald-50 text-emerald-600 p-3 rounded-md text-sm">
							Password updated successfully!
						</div>
					)}
					{state?.error && (
						<div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
							{state.error}
						</div>
					)}
					<div className='space-y-2'>
						<Label htmlFor='currentPassword'>
							Current Password
						</Label>
						<Input id='currentPassword' name='currentPassword' type='password' required />
					</div>
					<div className='space-y-2'>
						<Label htmlFor='newPassword'>New Password</Label>
						<Input id='newPassword' name='newPassword' type='password' required />
					</div>
				</CardContent>
				<CardFooter className='border-t px-6 py-4'>
					<Button type="submit" disabled={isPending}>
						{isPending ? "Updating..." : "Update Password"}
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}
