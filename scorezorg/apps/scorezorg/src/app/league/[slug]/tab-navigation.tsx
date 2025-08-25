'use client';
import { usePathname, useRouter } from "next/navigation";

interface TabNavigationProps {
  slug: string;
}

export default function TabNavigation({ slug }: TabNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();

  const tabs = [
    { key: 'players', label: 'Players', path: `/league/${slug}/players` },
    { key: 'seasons', label: 'Seasons', path: `/league/${slug}/seasons` },
    { key: 'brackets', label: 'Brackets', path: `/league/${slug}/brackets` }
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <div className="flex border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => router.push(tab.path)}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            isActive(tab.path)
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
