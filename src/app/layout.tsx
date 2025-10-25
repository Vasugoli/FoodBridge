import type { Metadata } from "next";
import { Poppins } from "next/font/google";
// @ts-ignore: allow side-effect import of global CSS without explicit type declarations
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const poppins = Poppins({
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
	variable: "--font-sans",
});

export const metadata: Metadata = {
	title: "FoodBridge - Saving Food, Serving Lives",
	description:
		"Connecting food donators with distributors to fight food waste and hunger.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en' suppressHydrationWarning>
			<head suppressHydrationWarning>
				<link rel='preconnect' href='https://fonts.googleapis.com' />
				<link
					rel='preconnect'
					href='https://fonts.gstatic.com'
					crossOrigin='anonymous'
				/>
				<link
					href='https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'
					rel='stylesheet'
				/>
			</head>
			<body
				className={`font-body antialiased ${poppins.variable}`}
				suppressHydrationWarning={true}>
				{children}
				<Toaster />
			</body>
		</html>
	);
}
