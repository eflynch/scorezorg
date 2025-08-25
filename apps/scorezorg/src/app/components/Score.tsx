import { useState } from 'react';
import { Score as ScoreType, TennisScore, Sport, Player } from '@/app/types';

interface ScoreProps {
  score?: ScoreType;
  onScoreChange: (score: ScoreType | undefined) => void;
  sport?: Sport;
  players?: [Player, Player];
  className?: string;
}

export const Score = ({ score, onScoreChange, sport = 'simple', players, className = '' }: ScoreProps) => {
  const [scoreText, setScoreText] = useState(() => {
    if (!score) return '';
    
    // Convert score object to display string
    if ('points' in score) {
      return score.points.join('-');
    } else if ('sets' in score) {
      return score.sets.map(set => 
        set.tiebreak ? 
          `${set.games.join('-')} (${set.tiebreak.join('-')})` : 
          set.games.join('-')
      ).join(', ');
    }
    
    return '';
  });

  const [isEditing, setIsEditing] = useState(false);
  
  // Tennis-specific state
  const [tennisScore, setTennisScore] = useState<TennisScore>(() => {
    if (score && 'sets' in score) {
      return score;
    }
    return { sets: [{ games: [0, 0] }] };
  });

  const parseScore = (text: string): ScoreType | undefined => {
    if (!text.trim()) return undefined;

    try {
      if (sport === 'tennis') {
        // Tennis scoring: "6-4, 6-3" or "6-4, 7-6 (7-3)"
        const sets = text.split(',').map(setStr => {
          const trimmed = setStr.trim();
          const tiebreakMatch = trimmed.match(/^(\d+-\d+)\s*\((\d+-\d+)\)$/);
          
          if (tiebreakMatch) {
            return {
              games: tiebreakMatch[1].split('-').map(Number),
              tiebreak: tiebreakMatch[2].split('-').map(Number)
            };
          } else {
            return {
              games: trimmed.split('-').map(Number)
            };
          }
        });
        
        return { sets };
      } else {
        // Simple scoring: "21-19" or "3-1"
        const points = text.split('-').map(Number);
        if (points.length === 2 && points.every(p => !isNaN(p))) {
          return { points };
        }
      }
    } catch {
      console.warn('Failed to parse score:', text);
    }
    
    return undefined;
  };

  const handleSubmit = () => {
    if (sport === 'tennis') {
      onScoreChange(tennisScore);
    } else {
      const parsedScore = parseScore(scoreText);
      onScoreChange(parsedScore);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset to original score
    if (!score) {
      setScoreText('');
      setTennisScore({ sets: [{ games: [0, 0] }] });
    } else if ('points' in score) {
      setScoreText(score.points.join('-'));
    } else if ('sets' in score) {
      setScoreText(score.sets.map(set => 
        set.tiebreak ? 
          `${set.games.join('-')} (${set.tiebreak.join('-')})` : 
          set.games.join('-')
      ).join(', '));
      setTennisScore(score);
    }
    setIsEditing(false);
  };

  const updateTennisSet = (setIndex: number, player: 0 | 1, games: number) => {
    setTennisScore(prev => {
      const newSets = [...prev.sets];
      newSets[setIndex] = {
        ...newSets[setIndex],
        games: newSets[setIndex].games.map((g, i) => i === player ? games : g)
      };
      return { sets: newSets };
    });
  };

  const updateTennisTiebreak = (setIndex: number, player: 0 | 1, points: number) => {
    setTennisScore(prev => {
      const newSets = [...prev.sets];
      const currentSet = { ...newSets[setIndex] };
      
      if (!currentSet.tiebreak) {
        currentSet.tiebreak = [0, 0];
      }
      
      currentSet.tiebreak = currentSet.tiebreak.map((p, i) => i === player ? points : p);
      newSets[setIndex] = currentSet;
      
      return { sets: newSets };
    });
  };

  const addTennisSet = () => {
    setTennisScore(prev => ({
      sets: [...prev.sets, { games: [0, 0] }]
    }));
  };

  const removeTennisSet = (setIndex: number) => {
    if (tennisScore.sets.length > 1) {
      setTennisScore(prev => ({
        sets: prev.sets.filter((_, i) => i !== setIndex)
      }));
    }
  };

  const toggleTiebreak = (setIndex: number) => {
    setTennisScore(prev => {
      const newSets = [...prev.sets];
      const currentSet = { ...newSets[setIndex] };
      
      if (currentSet.tiebreak) {
        delete currentSet.tiebreak;
      } else {
        currentSet.tiebreak = [0, 0];
      }
      
      newSets[setIndex] = currentSet;
      return { sets: newSets };
    });
  };

  const getPlaceholder = () => {
    switch (sport) {
      case 'tennis': return 'e.g., 6-4, 6-3 or 6-4, 7-6 (7-3)';
      default: return 'e.g., 3-1';
    }
  };

  const renderTennisEditor = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">Tennis Score:</label>
        <button
          type="button"
          onClick={addTennisSet}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          + Add Set
        </button>
      </div>
      
      {tennisScore.sets.map((set, setIndex) => (
        <div key={setIndex} className="border rounded-lg p-3 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Set {setIndex + 1}</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => toggleTiebreak(setIndex)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                {set.tiebreak ? 'Remove Tiebreak' : 'Add Tiebreak'}
              </button>
              {tennisScore.sets.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTennisSet(setIndex)}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Remove Set
                </button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 items-center">
            <span className="text-sm text-gray-600">{players?.[0]?.name || 'Player 1'}:</span>
            <input
              type="number"
              min="0"
              max="7"
              value={set.games[0]}
              onChange={(e) => updateTennisSet(setIndex, 0, parseInt(e.target.value) || 0)}
              className="border rounded px-2 py-1 text-center"
            />
            <span className="text-xs text-gray-500">games</span>
            
            <span className="text-sm text-gray-600">{players?.[1]?.name || 'Player 2'}:</span>
            <input
              type="number"
              min="0"
              max="7"
              value={set.games[1]}
              onChange={(e) => updateTennisSet(setIndex, 1, parseInt(e.target.value) || 0)}
              className="border rounded px-2 py-1 text-center"
            />
            <span className="text-xs text-gray-500">games</span>
          </div>
          
          {set.tiebreak && (
            <div className="mt-3 pt-3 border-t">
              <div className="text-xs text-gray-600 mb-2">Tiebreak:</div>
              <div className="grid grid-cols-3 gap-2 items-center">
                <span className="text-sm text-gray-600">{players?.[0]?.name || 'Player 1'}:</span>
                <input
                  type="number"
                  min="0"
                  value={set.tiebreak[0]}
                  onChange={(e) => updateTennisTiebreak(setIndex, 0, parseInt(e.target.value) || 0)}
                  className="border rounded px-2 py-1 text-center"
                />
                <span className="text-xs text-gray-500">points</span>
                
                <span className="text-sm text-gray-600">{players?.[1]?.name || 'Player 2'}:</span>
                <input
                  type="number"
                  min="0"
                  value={set.tiebreak[1]}
                  onChange={(e) => updateTennisTiebreak(setIndex, 1, parseInt(e.target.value) || 0)}
                  className="border rounded px-2 py-1 text-center"
                />
                <span className="text-xs text-gray-500">points</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderSimpleEditor = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700">Score:</label>
      <input
        type="text"
        value={scoreText}
        onChange={(e) => setScoreText(e.target.value)}
        placeholder={getPlaceholder()}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        autoFocus
      />
    </div>
  );

  if (isEditing) {
    return (
      <div className={`space-y-3 ${className}`}>
        {sport === 'tennis' ? renderTennisEditor() : renderSimpleEditor()}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
          >
            Save
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {score ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            Score: {scoreText}
          </span>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Edit
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Add Score
        </button>
      )}
    </div>
  );
};
