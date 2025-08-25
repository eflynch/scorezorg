'use client';

import React, { useState, useRef, useEffect } from 'react';

interface EditBoxProps {
  value: string;
  onSave?: (value: string) => void;
  className?: string;
  placeholder?: string;
  headerLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const EditBox = ({ 
  value: initialValue, 
  onSave, 
  className = '', 
  placeholder = 'Click to edit...', 
  headerLevel = 'h2' 
}:EditBoxProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    if (onSave && value !== initialValue) {
      onSave(value);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setValue(initialValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  const headerStyles = {
    h1: 'text-4xl font-bold',
    h2: 'text-3xl font-semibold',
    h3: 'text-2xl font-medium',
    h4: 'text-xl font-medium',
    h5: 'text-lg font-medium',
    h6: 'text-base font-medium'
  };

  const baseClasses = `
    cursor-pointer 
    hover:bg-gray-50 
    px-2 py-1 
    rounded 
    transition-colors
    ${headerStyles[headerLevel]}
    ${className}
  `;

  const inputClasses = `
    border-2 
    border-blue-500 
    px-2 py-1 
    rounded 
    outline-none
    ${headerStyles[headerLevel]}
    ${className}
  `;

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={inputClasses}
        placeholder={placeholder}
      />
    );
  }

  const renderHeader = () => {
    const props = {
      onClick: handleClick,
      className: baseClasses,
      title: "Click to edit"
    };

    const displayText = value || placeholder;

    switch (headerLevel) {
      case 'h1':
        return <h1 {...props}>{displayText}</h1>;
      case 'h2':
        return <h2 {...props}>{displayText}</h2>;
      case 'h3':
        return <h3 {...props}>{displayText}</h3>;
      case 'h4':
        return <h4 {...props}>{displayText}</h4>;
      case 'h5':
        return <h5 {...props}>{displayText}</h5>;
      case 'h6':
        return <h6 {...props}>{displayText}</h6>;
      default:
        return <h2 {...props}>{displayText}</h2>;
    }
  };

  return renderHeader();
};
