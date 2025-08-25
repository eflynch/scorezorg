'use client';

import { League } from '@/app/types';
import { EditBox } from './edit-box';
import { useContext } from 'react';
import { LeagueContext } from './league-context';

interface LeagueNameEditorProps {
  className?: string;
  placeholder?: string;
  headerLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const LeagueNameEditor = ({ 
  className = '', 
  placeholder = 'Click to edit league name',
  headerLevel = 'h1'
}: LeagueNameEditorProps) => {

  const { league, updateLeague } = useContext(LeagueContext);
  if (league === null) {
    return <div className={className}>Loading...</div>;
  }
  return (
    <EditBox
      value={league.name}
      onSave={(name) => {
        updateLeague((league:League) => ({ ...league, name }));
      }}
      className={className}
      placeholder={placeholder}
      headerLevel={headerLevel}
    />
  );
};

