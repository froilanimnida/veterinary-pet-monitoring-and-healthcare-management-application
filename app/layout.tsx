import type { Metadata } from 'next';
import { Geist, Geist_Mono, Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
	variable: '--inter',
	weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
	preload: true,
	adjustFontFallback: true,
	display: 'swap',
	subsets: ['latin-ext', 'latin'],
});

export const metadata: Metadata = {
	title: 'PawsitiveHealth | Home',
	description: 'PawsitiveHealth is a pet health care service.',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<body className={`${inter.className} antialiased`}>{children}</body>
		</html>
	);
}
