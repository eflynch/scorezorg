'use client';
// Error component for league pages
export default function LeagueError({ error }: { error: Error }) {
  return (
    <div>
      <h1>uh oh!</h1>
      <p>{error.message}</p>
    </div>
  );
}
