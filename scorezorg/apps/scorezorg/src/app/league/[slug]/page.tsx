'use client';
import { use, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LeagueRoot({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug } = use(params);
  
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
