import { UserTable } from "@/components/dashboard/admin/user-table";
import { getUsersFromDb } from "@/lib/db";
import { User } from "@/lib/types";

export default async function ManageUsersPage() {
	// Fetch users from MongoDB
	let users: User[];
	try {
		users = await getUsersFromDb();
	} catch (error) {
		// MongoDB is not configured
		console.error("Failed to fetch users from database:", error);
		users = [];
	}

	if (!users || users.length === 0) {
		return (
			<div>
				<h1 className='text-3xl font-bold tracking-tight font-headline mb-6'>
					Manage Users
				</h1>
				<div className='flex flex-col items-center justify-center gap-4 py-8'>
					<p className='text-muted-foreground'>
						No users found. Please seed the database first.
					</p>
					<p className='text-sm text-muted-foreground'>
						Run:{" "}
						<code className='bg-muted px-2 py-1 rounded'>
							curl -X POST http://localhost:9002/api/seed
						</code>
					</p>
				</div>
			</div>
		);
	}

	return (
		<div>
			<h1 className='text-3xl font-bold tracking-tight font-headline mb-6'>
				Manage Users
			</h1>
			<UserTable users={users} />
		</div>
	);
}
