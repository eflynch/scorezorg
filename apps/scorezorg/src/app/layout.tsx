import './global.css';

export const metadata = {
  title: 'Scorezorg - Sports League Management Platform',
  description: 'Modern sports league management platform for organizing tournaments, tracking player statistics, and managing competitive seasons.',
  keywords: 'sports, league, tournament, management, brackets, statistics, competition',
  authors: [{ name: 'Scorezorg Team' }],
  openGraph: {
    title: 'Scorezorg - Sports League Management Platform',
    description: 'Organize tournaments, track statistics, and manage competitive seasons with our modern sports league platform.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scorezorg - Sports League Management Platform',
    description: 'Modern sports league management platform for organizing tournaments and tracking statistics.',
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
