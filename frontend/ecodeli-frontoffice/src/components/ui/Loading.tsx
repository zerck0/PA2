import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({ 
  size = 'md', 
  text = 'Chargement...', 
  className = '' 
}) => {
  const spinnerSize = size === 'sm' ? 'spinner-border-sm' : '';

  return (
    <div className={`text-center ${className}`}>
      <div className={`spinner-border text-primary ${spinnerSize}`} role="status">
        <span className="visually-hidden">{text}</span>
      </div>
      {text && <div className="mt-2">{text}</div>}
    </div>
  );
};

export default Loading;
