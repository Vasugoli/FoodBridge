import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
// @ts-ignore: allow side-effect import of global CSS without explicit type declarations
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-body",
	display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
	subsets: ["latin"],
	variable: "--font-headline",
	display: "swap",
});

export const metadata: Metadata = {
	title: "FoodBridge - Saving Food, Serving Lives",
	description:
		"Connecting food donors with distributors to fight food waste and hunger through innovative technology.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang='en'
			suppressHydrationWarning
			className={`${inter.variable} ${plusJakartaSans.variable}`}>
			<body
				className={`font-body antialiased`}
				suppressHydrationWarning={true}>
				{children}
				<Toaster />
			</body>
		</html>
	);
}
