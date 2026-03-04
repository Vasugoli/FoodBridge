"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/icons/logo";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export default function Header() {
	const [isScrolled, setIsScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 10);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<header
			className={cn(
				"sticky top-0 z-50 w-full transition-all duration-500",
				isScrolled
					? "bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-lg shadow-black/5"
					: "bg-transparent",
			)}>
			<div className='container mx-auto px-4 md:px-6'>
				<div className='flex h-20 items-center justify-between'>
					<Link
						href='/'
						className='transition-transform duration-300 hover:scale-105'>
						<Logo />
					</Link>
					<nav className='flex items-center gap-3'>
						<Button
							variant='ghost'
							asChild
							className='rounded-xl hover:bg-primary/5 hover:text-primary transition-all duration-300'>
							<Link href='/login'>Log In</Link>
						</Button>
						<Button
							asChild
							className='rounded-xl shadow-lg hover:shadow-glow transition-all duration-300 px-6'>
							<Link href='/signup'>Sign Up</Link>
						</Button>
					</nav>
				</div>
			</div>
		</header>
	);
}
