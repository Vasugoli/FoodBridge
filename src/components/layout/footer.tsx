import Link from "next/link";
import { Logo } from "@/components/icons/logo";
import { Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
	const socialLinks = [
		{ icon: <Twitter className='h-5 w-5' />, href: "#", label: "Twitter" },
		{ icon: <Github className='h-5 w-5' />, href: "#", label: "GitHub" },
		{
			icon: <Linkedin className='h-5 w-5' />,
			href: "#",
			label: "LinkedIn",
		},
	];

	return (
		<footer className='relative bg-gradient-to-br from-gray-50 to-white border-t-2 border-gray-100'>
			<div className='container mx-auto px-4 md:px-6 py-12'>
				<div className='grid grid-cols-1 md:grid-cols-3 gap-8 items-center'>
					{/* Logo and Description */}
					<div className='text-center md:text-left'>
						<Link
							href='/'
							className='inline-block mb-3 transition-transform duration-300 hover:scale-105'>
							<Logo />
						</Link>
						<p className='text-sm text-muted-foreground max-w-xs mx-auto md:mx-0'>
							Connecting communities to rescue surplus food and
							fight hunger together.
						</p>
					</div>

					{/* Copyright */}
					<div className='text-center'>
						<p className='text-sm text-muted-foreground font-medium'>
							&copy; {new Date().getFullYear()} FoodBridge. All
							rights reserved.
						</p>
						<p className='text-xs text-muted-foreground/70 mt-2'>
							Made with 💚 for a better tomorrow
						</p>
					</div>

					{/* Social Links */}
					<div className='flex justify-center md:justify-end items-center gap-3'>
						{socialLinks.map((social, index) => (
							<Link
								key={index}
								href={social.href}
								aria-label={social.label}
								className='group flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-muted-foreground hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg'>
								{social.icon}
							</Link>
						))}
					</div>
				</div>

				{/* Divider */}
				<div className='mt-8 pt-6 border-t border-gray-200'>
					<div className='flex flex-wrap justify-center gap-6 text-sm'>
						<Link
							href='#'
							className='text-muted-foreground hover:text-primary transition-colors font-medium'>
							Privacy Policy
						</Link>
						<span className='text-gray-300'>•</span>
						<Link
							href='#'
							className='text-muted-foreground hover:text-primary transition-colors font-medium'>
							Terms of Service
						</Link>
						<span className='text-gray-300'>•</span>
						<Link
							href='#'
							className='text-muted-foreground hover:text-primary transition-colors font-medium'>
							Contact Us
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}
