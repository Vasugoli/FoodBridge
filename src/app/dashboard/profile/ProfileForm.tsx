"use client";

import { useActionState, useEffect } from "react";
import { updateProfileAction } from "@/app/actions/profile";
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
import { Badge } from "@/components/ui/badge";

const initialState: any = {
	error: "",
	success: "",
};

export function ProfileForm({ user }: { user: any }) {
	const [state, formAction, isPending] = useActionState(
		updateProfileAction,
		initialState
	);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Profile</CardTitle>
				<CardDescription>
					Manage your account settings and personal information.
				</CardDescription>
			</CardHeader>
			<form action={formAction}>
				<CardContent className='space-y-4'>
					{state?.success && (
						<div className="bg-emerald-50 text-emerald-600 p-3 rounded-md text-sm">
							{state.success}
						</div>
					)}
					{state?.error && (
						<div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
							{state.error}
						</div>
					)}
					<div className='space-y-2'>
						<Label htmlFor='name'>Full Name</Label>
						<Input id='name' name='name' defaultValue={user.name} required />
					</div>
					<div className='space-y-2'>
						<Label htmlFor='email'>Email</Label>
						<Input
							id='email'
							name='email'
							type='email'
							defaultValue={user.email}
							required
						/>
					</div>
					<div className='space-y-2'>
						<Label>Role</Label>
						<div>
							<Badge
								variant='secondary'
								className='capitalize text-sm'>
								{user.role}
							</Badge>
						</div>
					</div>
				</CardContent>
				<CardFooter className='border-t px-6 py-4'>
					<Button type="submit" disabled={isPending}>
						{isPending ? "Saving..." : "Save Changes"}
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}
