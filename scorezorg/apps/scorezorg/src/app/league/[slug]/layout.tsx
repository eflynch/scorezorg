
'use client';
import React, { useContext, useEffect } from 'react';
import { LeagueNameEditor } from "@/app/league/components";
import { LeagueProvider, LeagueContext } from "@/app/contexts";
import { useLeagueDb } from "@/app/hooks";

// Client component to handle the addOrUpdateLeague logic
function LeagueRegistration({ slug }: { slug: string }) {
  const { league } = useContext(LeagueContext);
  const { addOrUpdateLeague } = useLeagueDb();
  
  useEffect(() => {
    if (league?.name) {
      addOrUpdateLeague(slug, league.name);
    }
  }, [addOrUpdateLeague, slug, league?.name]);

  return null; // This component only handles side effects
}

export default function LeagueLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  // Since we're now a client component, we need to unwrap the promise
  const { slug } = React.use(params);

  return (
    <div>
      <LeagueProvider slug={slug}>
        <LeagueRegistration slug={slug} />
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