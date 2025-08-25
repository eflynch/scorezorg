
import { LeagueNameEditor } from "@/app/league/components";
import { LeagueProvider } from "@/app/contexts";

export default async function LeagueLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const { slug } = await params;



  return (
    <div>
      <LeagueProvider slug={slug}>
        <LeagueNameEditor
          className="text-3xl font-bold"
          placeholder="Click to edit league name"
        headerLevel="h1"
      />
      {children}
      </LeagueProvider>
    </div>
  );
}