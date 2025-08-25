'use client';
import { use, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLeagueDb } from "@/app/use-league-db";
import { LeagueContext } from "@/app/contexts";

export default function LeagueRoot({ params }: { params: Promise<{ slug: string }> }) {
  const { league } = useContext(LeagueContext);
  const { addOrUpdateLeague } = useLeagueDb();
  const router = useRouter();

  const { slug } = use(params);
  
  useEffect(() => {
    if (league?.name) {
      addOrUpdateLeague(slug, league.name);
    }
  }, [addOrUpdateLeague, slug, league?.name]);

  // Redirect to players tab by default
  useEffect(() => {
    router.replace(`/league/${slug}/players`);
  }, [router, slug]);

  return (
    <div>
      <span className="px-5 text-2xl font-bold">Loading...</span>
    </div>
  );
}
