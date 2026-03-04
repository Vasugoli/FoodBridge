import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";

interface StatCardProps {
	title: string;
	value: string;
	icon: React.ReactNode;
	description?: string;
}

export default function StatCard({
	title,
	value,
	icon,
	description,
}: StatCardProps) {
	return (
		<Card className='group relative overflow-hidden border-2 border-gray-100 hover:border-primary/30 transition-all duration-500 hover-lift bg-gradient-to-br from-white to-gray-50/50 rounded-2xl'>
			{/* Decorative gradient overlay on hover */}
			<div className='absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />

			<CardHeader className='relative flex flex-row items-center justify-between space-y-0 pb-3'>
				<CardTitle className='text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors duration-300'>
					{title}
				</CardTitle>
				<div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:shadow-glow'>
					{icon}
				</div>
			</CardHeader>
			<CardContent className='relative'>
				<div className='text-3xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors duration-300'>
					{value}
				</div>
				{description && (
					<p className='text-sm text-muted-foreground leading-relaxed'>
						{description}
					</p>
				)}
			</CardContent>
		</Card>
	);
}
