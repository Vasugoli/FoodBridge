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
import { Progress } from "@/components/ui/progress";
import { ShieldCheck, Star } from "lucide-react";

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

	const trustScore   = user.trustScore   ?? 0;
	const ratingAvg    = user.ratingAvg    ?? 0;
	const ratingCount  = user.totalRatings ?? 0;
	const isVerified   = user.isVerified   ?? user.emailVerified ?? false;

	// Convert trustScore (0-100) to badge label
	const trustLabel =
		trustScore >= 80 ? "Excellent" :
		trustScore >= 60 ? "Good" :
		trustScore >= 40 ? "Fair" : "New";

	const trustColor =
		trustScore >= 80 ? "text-emerald-600" :
		trustScore >= 60 ? "text-blue-600" :
		trustScore >= 40 ? "text-yellow-600" : "text-gray-500";

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
						<div className='flex items-center gap-2'>
							<Badge
								variant='secondary'
								className='capitalize text-sm'>
								{user.role}
							</Badge>
							{isVerified && (
								<Badge className='bg-blue-100 text-blue-700 border border-blue-200 gap-1'>
									<ShieldCheck className='h-3 w-3' />
									Verified
								</Badge>
							)}
						</div>
					</div>

					{/* Trust Score */}
					<div className='space-y-2 pt-2 border-t'>
						<Label className='text-sm font-medium'>Trust Score</Label>
						<div className='flex items-center gap-3'>
							<Progress value={trustScore} className='h-2 flex-1' />
							<span className={`text-sm font-bold min-w-[3rem] text-right ${trustColor}`}>
								{trustScore}/100
							</span>
							<Badge variant='outline' className={`text-xs ${trustColor} border-current`}>
								{trustLabel}
							</Badge>
						</div>
					</div>

					{/* Ratings */}
					<div className='space-y-1'>
						<Label className='text-sm font-medium'>Rating</Label>
						<div className='flex items-center gap-2'>
							<div className='flex items-center gap-0.5'>
								{[1, 2, 3, 4, 5].map((star) => (
									<Star
										key={star}
										className={`h-4 w-4 ${
											star <= Math.round(ratingAvg)
												? "fill-yellow-400 text-yellow-400"
												: "text-gray-300"
										}`}
									/>
								))}
							</div>
							<span className='text-sm text-muted-foreground'>
								{ratingAvg > 0
									? `${ratingAvg.toFixed(1)} (${ratingCount} review${ratingCount !== 1 ? "s" : ""})`
									: "No reviews yet"}
							</span>
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

