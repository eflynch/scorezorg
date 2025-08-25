import Link from "next/link";

export default function LeagueLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div>
        <header className="bg-gray-900 text-white px-8 py-4 flex items-center shadow-md">
            <h1 className="m-0 text-2xl tracking-wide font-semibold"><Link href="/">scorezorg</Link></h1>
        </header>
        {children}
    </div>
  );
}
