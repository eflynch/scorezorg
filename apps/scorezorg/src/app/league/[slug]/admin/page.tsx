'use client';
import { use, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { TabNavigation } from "@/app/components";
import { LeagueContext } from "@/app/contexts";
import { useLeagueDb } from "@/app/hooks";

export default function AdminPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { league } = useContext(LeagueContext);
  const { removeLeague } = useLeagueDb();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isServerDeleting, setIsServerDeleting] = useState(false);

  const handleDeleteLeague = async () => {
    if (!league) return;

    const confirmMessage = `Are you sure you want to remove "${league.name}" from your device?\n\nThis will:\n- Remove the league from your recent leagues list\n- Clear all local data for this league\n\nNote: This only affects your local device. The league data on the server (if any) will remain unchanged.\n\nType "REMOVE" to confirm this action.`;
    
    const userInput = prompt(confirmMessage);
    
    if (userInput !== "REMOVE") {
      if (userInput !== null) {
        alert('Removal cancelled. You must type "REMOVE" exactly to confirm.');
      }
      return;
    }

    setIsDeleting(true);
    try {
      await removeLeague(slug);
      alert(`League "${league.name}" has been successfully removed from your device.`);
      router.push('/league');
    } catch (error) {
      console.error('Failed to remove league:', error);
      alert('Failed to remove league. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleServerDeleteLeague = async () => {
    if (!league) return;

    const confirmMessage = `⚠️ PERMANENT DELETION WARNING ⚠️\n\nAre you sure you want to PERMANENTLY DELETE "${league.name}" from the server?\n\nThis will:\n- PERMANENTLY delete the league from the server database\n- Remove ALL league data including players, seasons, and brackets\n- Make the league inaccessible to ALL users\n- This action CANNOT be undone\n\nType "DELETE FOREVER" to confirm this permanent action.`;
    
    const userInput = prompt(confirmMessage);
    
    if (userInput !== "DELETE FOREVER") {
      if (userInput !== null) {
        alert('Server deletion cancelled. You must type "DELETE FOREVER" exactly to confirm.');
      }
      return;
    }

    setIsServerDeleting(true);
    try {
      const response = await fetch(`/api/league/${slug}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete league from server');
      }

      // Also remove from local storage since the server copy is gone
      await removeLeague(slug);
      
      alert(`League "${league.name}" has been permanently deleted from the server.`);
      router.push('/league');
    } catch (error) {
      console.error('Failed to delete league from server:', error);
      alert(`Failed to delete league from server: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsServerDeleting(false);
    }
  };

  if (!league) {
    return (
      <div>
        <TabNavigation slug={slug} />
        <div className="p-6">
          <p>Loading league data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <TabNavigation slug={slug} />
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">League Administration</h2>
          
          <div className="space-y-6">
            {/* League Info Section */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">League Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Name:</span>
                  <span className="ml-2 text-gray-900">{league.name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Sport:</span>
                  <span className="ml-2 text-gray-900 capitalize">{league.sport}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Players:</span>
                  <span className="ml-2 text-gray-900">{league.players?.length || 0}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Seasons:</span>
                  <span className="ml-2 text-gray-900">{league.seasons?.length || 0}</span>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <h3 className="text-lg font-semibold mb-3 text-red-800">Remove from Device</h3>
              <p className="text-sm text-red-700 mb-4">
                This will remove the league from your device&apos;s local storage. This only affects 
                your local device - any league data stored on the server will remain unchanged. 
                You can always access the league again by visiting its URL.
              </p>
              
              <button
                onClick={handleDeleteLeague}
                disabled={isDeleting}
                className={`px-4 py-2 text-white font-medium rounded transition-colors ${
                  isDeleting 
                    ? 'bg-red-400 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isDeleting ? 'Removing...' : 'Remove from Device'}
              </button>
            </div>

            {/* Server Deletion Zone */}
            <div className="border border-red-500 rounded-lg p-4 bg-red-100">
              <h3 className="text-lg font-semibold mb-3 text-red-900">⚠️ Permanent Server Deletion</h3>
              <p className="text-sm text-red-800 mb-4">
                <strong>WARNING:</strong> This will permanently delete the league from the server database. 
                This action affects ALL users and CANNOT be undone. The league and all its data 
                (players, seasons, brackets) will be lost forever.
              </p>
              
              <button
                onClick={handleServerDeleteLeague}
                disabled={isServerDeleting}
                className={`px-4 py-2 text-white font-medium rounded transition-colors ${
                  isServerDeleting 
                    ? 'bg-red-400 cursor-not-allowed' 
                    : 'bg-red-800 hover:bg-red-900'
                }`}
              >
                {isServerDeleting ? 'Deleting...' : 'Delete from Server'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
