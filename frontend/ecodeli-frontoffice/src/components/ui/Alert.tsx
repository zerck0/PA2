import React from 'react';

interface AlertProps {
  type?: 'success' | 'danger' | 'warning' | 'info';
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({ 
  type = 'info', 
  children, 
  onClose, 
  className = '' 
}) => {
  return (
    <div className={`alert alert-${type} ${onClose ? 'alert-dismissible' : ''} ${className}`}>
      {children}
      {onClose && (
        <button 
          type="button" 
          className="btn-close" 
          onClick={onClose}
          aria-label="Close"
        ></button>
      )}
    </div>
  );
};

export default Alert;
