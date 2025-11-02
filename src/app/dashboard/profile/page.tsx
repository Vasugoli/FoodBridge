import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getUserById } from "@/lib/db";
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

export default async function ProfilePage() {
	// Get the authenticated user from session
	const session = await getSession();

	if (!session) {
		redirect("/login");
	}

	// Fetch full user data from MongoDB
	let user;
	try {
		user = await getUserById(session.id);
	} catch (error) {
		console.error("Failed to fetch user from database:", error);
	}

	if (!user) {
		redirect("/login");
	}

	return (
		<div className='max-w-2xl mx-auto'>
			<Card>
				<CardHeader>
					<CardTitle>Profile</CardTitle>
					<CardDescription>
						Manage your account settings and personal information.
					</CardDescription>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='space-y-2'>
						<Label htmlFor='name'>Full Name</Label>
						<Input id='name' defaultValue={user.name} />
					</div>
					<div className='space-y-2'>
						<Label htmlFor='email'>Email</Label>
						<Input
							id='email'
							type='email'
							defaultValue={user.email}
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
					<Button>Save Changes</Button>
				</CardFooter>
			</Card>

			<Card className='mt-6'>
				<CardHeader>
					<CardTitle>Change Password</CardTitle>
					<CardDescription>
						Update your password for better security.
					</CardDescription>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='space-y-2'>
						<Label htmlFor='current-password'>
							Current Password
						</Label>
						<Input id='current-password' type='password' />
					</div>
					<div className='space-y-2'>
						<Label htmlFor='new-password'>New Password</Label>
						<Input id='new-password' type='password' />
					</div>
				</CardContent>
				<CardFooter className='border-t px-6 py-4'>
					<Button>Update Password</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
