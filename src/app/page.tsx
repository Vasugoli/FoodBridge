import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ArrowRight, Users, MapPin, Bell } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function Home() {
	const heroImage = PlaceHolderImages.find((img) => img.id === "hero");
	const howItWorksImages = {
		1: PlaceHolderImages.find((img) => img.id === "how-it-works-1"),
		2: PlaceHolderImages.find((img) => img.id === "how-it-works-2"),
		3: PlaceHolderImages.find((img) => img.id === "how-it-works-3"),
	};

	const features = [
		{
			icon: <Users className='h-8 w-8 text-primary' />,
			title: "Secure Authentication",
			description:
				"Easy and secure sign-up for donors and distributors with optional Google OAuth.",
		},
		{
			icon: <MapPin className='h-8 w-8 text-primary' />,
			title: "Donation Discovery",
			description:
				"An interactive map to find surplus food donations in your local area quickly.",
		},
		{
			icon: <Bell className='h-8 w-8 text-primary' />,
			title: "Real-time Notifications",
			description:
				"Get instant alerts for donation claims, status updates, and new opportunities.",
		},
	];

	return (
		<div className='flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-secondary/20'>
			<Header />
			<main className='flex-grow'>
				{/* Hero Section */}
				<section className='relative w-full overflow-hidden py-20 md:py-32 lg:py-40'>
					{/* Animated background gradient */}
					<div className='absolute inset-0 -z-20 bg-gradient-to-br from-primary/5 via-emerald-50/50 to-teal-50/30' />
					<div className='absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.05),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(20,184,166,0.05),transparent_50%)]' />

					<div className='container mx-auto px-4 md:px-6'>
						<div className='grid gap-12 lg:grid-cols-2 lg:gap-16 items-center'>
							{/* Text Content */}
							<div className='flex flex-col justify-center space-y-8'>
								<div className='inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary w-fit animate-slide-in-left'>
									<span className='mr-2'>🌱</span> Making a
									difference, one meal at a time
								</div>

								<h1 className='text-5xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-7xl font-headline animate-slide-up leading-tight'>
									Saving Food,
									<br />
									<span className='text-gradient'>
										Serving Lives
									</span>
								</h1>

								<p className='text-xl leading-relaxed text-muted-foreground max-w-xl animate-slide-up animation-delay-200'>
									FoodBridge connects communities to rescue
									surplus food, reduce waste, and fight
									hunger. Join us in making a difference.
								</p>

								<div className='flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-slide-up animation-delay-400'>
									<Button
										asChild
										size='lg'
										className='text-lg px-8 py-6 rounded-xl shadow-glow hover:shadow-glow-lg transition-all duration-300 group'>
										<Link href='/signup'>
											Get Started
											<ArrowRight className='ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform' />
										</Link>
									</Button>
									<Button
										asChild
										variant='outline'
										size='lg'
										className='text-lg px-8 py-6 rounded-xl border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300'>
										<Link href='#how-it-works'>
											Learn More
										</Link>
									</Button>
								</div>

								{/* Stats */}
								<div className='grid grid-cols-3 gap-6 pt-8 animate-fade-in animation-delay-600'>
									<div className='text-center sm:text-left'>
										<div className='text-3xl font-bold text-primary'>
											10K+
										</div>
										<div className='text-sm text-muted-foreground'>
											Meals Saved
										</div>
									</div>
									<div className='text-center sm:text-left'>
										<div className='text-3xl font-bold text-primary'>
											500+
										</div>
										<div className='text-sm text-muted-foreground'>
											Active Donors
										</div>
									</div>
									<div className='text-center sm:text-left'>
										<div className='text-3xl font-bold text-primary'>
											50+
										</div>
										<div className='text-sm text-muted-foreground'>
											Cities
										</div>
									</div>
								</div>
							</div>

							{/* Hero Image */}
							{heroImage && (
								<div className='relative lg:block animate-scale-in animation-delay-400'>
									<div className='absolute inset-0 bg-gradient-to-br from-primary/20 to-teal-500/20 rounded-3xl blur-3xl opacity-50 animate-pulse-slow' />
									<div className='relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white/50 hover:border-white/80 transition-all duration-500 hover-lift'>
										<Image
											src={heroImage.imageUrl}
											alt={heroImage.description}
											width={800}
											height={600}
											quality={95}
											className='object-cover w-full h-full'
											data-ai-hint={heroImage.imageHint}
											priority
										/>
									</div>
								</div>
							)}
						</div>
					</div>
				</section>

				{/* How It Works Section */}
				<section
					id='how-it-works'
					className='py-24 sm:py-32 bg-white/50 backdrop-blur-sm relative overflow-hidden'>
					<div className='absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] -z-10' />

					<div className='container mx-auto px-4 md:px-6'>
						<div className='text-center max-w-3xl mx-auto mb-16'>
							<div className='inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-6'>
								Simple Process
							</div>
							<h2 className='text-4xl font-bold tracking-tight text-foreground sm:text-5xl font-headline'>
								How It Works
							</h2>
							<p className='mt-6 text-lg text-muted-foreground'>
								A simple three-step process to connect surplus
								food with those in need.
							</p>
						</div>

						<div className='grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12'>
							{[
								{
									step: 1,
									title: "Post a Donation",
									description:
										"Donors list surplus food with details and photos through a simple form.",
									image: howItWorksImages[1],
									icon: "📦",
								},
								{
									step: 2,
									title: "Find & Claim",
									description:
										"Distributors browse available donations on a map and claim them instantly.",
									image: howItWorksImages[2],
									icon: "🗺️",
								},
								{
									step: 3,
									title: "Collect & Distribute",
									description:
										"Distributors pick up the food and deliver it to local communities in need.",
									image: howItWorksImages[3],
									icon: "🚚",
								},
							].map(
								({ step, title, description, image, icon }) => (
									<Card
										key={step}
										className='group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-500 hover-lift bg-white/80 backdrop-blur-sm'>
										<div className='absolute top-4 right-4 text-6xl opacity-5 group-hover:opacity-10 transition-opacity'>
											{icon}
										</div>

										<CardHeader className='p-0 relative'>
											{image && (
												<div className='relative overflow-hidden'>
													<Image
														src={image.imageUrl}
														alt={image.description}
														width={400}
														height={300}
														className='rounded-t-lg aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-110'
														data-ai-hint={
															image.imageHint
														}
													/>
													<div className='absolute top-4 left-4 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold shadow-lg'>
														{step}
													</div>
												</div>
											)}
										</CardHeader>

										<CardContent className='p-8 space-y-3'>
											<h3 className='text-2xl font-semibold text-foreground group-hover:text-primary transition-colors'>
												{title}
											</h3>
											<p className='text-muted-foreground leading-relaxed'>
												{description}
											</p>
										</CardContent>
									</Card>
								),
							)}
						</div>

						{/* Connecting Line */}
						<div className='hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent -z-10' />
					</div>
				</section>

				{/* Features Section */}
				<section id='features' className='py-24 sm:py-32 relative'>
					<div className='container mx-auto px-4 md:px-6'>
						<div className='text-center max-w-3xl mx-auto mb-16'>
							<div className='inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-6'>
								Platform Features
							</div>
							<h2 className='text-4xl font-bold tracking-tight text-foreground sm:text-5xl font-headline'>
								Everything You Need
							</h2>
							<p className='mt-6 text-lg text-muted-foreground'>
								Powerful tools to manage food donations and
								distribution efficiently.
							</p>
						</div>

						<div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
							{features.map((feature, index) => (
								<div
									key={index}
									className='group relative flex flex-col items-center text-center p-8 rounded-2xl border-2 border-transparent hover:border-primary/30 bg-gradient-to-br from-white to-gray-50/50 hover:from-primary/5 hover:to-primary/10 transition-all duration-500 hover-lift'
									style={{
										animationDelay: `${index * 150}ms`,
									}}>
									<div className='relative mb-6'>
										<div className='absolute inset-0 bg-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
										<div className='relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-600 text-white shadow-lg group-hover:shadow-glow transition-all duration-500 group-hover:scale-110'>
											{feature.icon}
										</div>
									</div>
									<h3 className='text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors'>
										{feature.title}
									</h3>
									<p className='text-muted-foreground leading-relaxed'>
										{feature.description}
									</p>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* CTA Section */}
				<section className='relative py-24 sm:py-32 overflow-hidden'>
					{/* Gradient background */}
					<div className='absolute inset-0 bg-gradient-to-br from-primary via-emerald-600 to-teal-700' />
					<div className='absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)]' />
					<div className='absolute inset-0 bg-grid-white/[0.05]' />

					<div className='container relative mx-auto px-4 md:px-6 text-center'>
						<div className='mx-auto max-w-3xl'>
							<h2 className='text-4xl font-bold tracking-tight text-white sm:text-5xl font-headline animate-slide-up'>
								Join the Movement Today
							</h2>
							<p className='mt-6 text-xl text-white/90 leading-relaxed animate-slide-up animation-delay-200'>
								Whether you have food to give or hands to help,
								you can make a tangible impact on your community
								and help fight hunger.
							</p>

							<div className='mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up animation-delay-400'>
								<Button
									asChild
									size='lg'
									className='text-lg px-8 py-6 bg-white text-primary hover:bg-white/90 rounded-xl shadow-2xl hover:shadow-glow-lg transition-all duration-300 group min-w-[200px]'>
									<Link href='/signup'>
										Sign Up to Donate
										<ArrowRight className='ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform' />
									</Link>
								</Button>
								<Button
									asChild
									variant='outline'
									size='lg'
									className='text-lg px-8 py-6 border-2 border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all duration-300 min-w-[200px]'>
									<Link href='/signup'>
										Sign Up to Distribute
									</Link>
								</Button>
							</div>

							{/* Trust indicators */}
							<div className='mt-16 pt-8 border-t border-white/20'>
								<p className='text-white/70 text-sm mb-6'>
									Trusted by communities worldwide
								</p>
								<div className='flex flex-wrap justify-center items-center gap-8 opacity-70'>
									<div className='text-white font-semibold'>
										🏆 Award Winning
									</div>
									<div className='h-8 w-px bg-white/30' />
									<div className='text-white font-semibold'>
										🔒 Secure Platform
									</div>
									<div className='h-8 w-px bg-white/30' />
									<div className='text-white font-semibold'>
										💚 100% Free
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>
			</main>
			<Footer />
		</div>
	);
}
