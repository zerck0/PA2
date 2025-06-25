import React, { useEffect, useState } from 'react';
import { Toast as ToastType } from '../../contexts/ToastContext';

interface ToastProps {
  toast: ToastType;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Animation d'entrée
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(toast.id), 300); // Temps de l'animation de sortie
  };

  // Icônes selon le type
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <i className="bi bi-check-circle-fill text-success me-2"></i>;
      case 'error':
        return <i className="bi bi-exclamation-triangle-fill text-danger me-2"></i>;
      case 'warning':
        return <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>;
      case 'info':
        return <i className="bi bi-info-circle-fill text-info me-2"></i>;
      default:
        return <i className="bi bi-info-circle-fill text-primary me-2"></i>;
    }
  };

  // Couleur de bordure selon le type
  const getBorderClass = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-success';
      case 'error':
        return 'border-danger';
      case 'warning':
        return 'border-warning';
      case 'info':
        return 'border-info';
      default:
        return 'border-primary';
    }
  };

  const toastStyle: React.CSSProperties = {
    minWidth: '350px',
    marginBottom: '0.5rem',
    opacity: isExiting ? 0 : isVisible ? 1 : 0,
    transform: isExiting 
      ? 'translateX(100%)' 
      : isVisible 
        ? 'translateX(0)' 
        : 'translateX(100%)',
    transition: 'all 0.3s ease-in-out',
  };

  return (
    <div
      className={`toast show ${getBorderClass(toast.type)}`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      style={toastStyle}
    >
      <div className="toast-header">
        {getIcon(toast.type)}
        <strong className="me-auto">
          {toast.type === 'success' && 'Succès'}
          {toast.type === 'error' && 'Erreur'}
          {toast.type === 'warning' && 'Attention'}
          {toast.type === 'info' && 'Information'}
        </strong>
        <button
          type="button"
          className="btn-close"
          onClick={handleClose}
          aria-label="Fermer"
        ></button>
      </div>
      <div className="toast-body">
        {toast.message}
      </div>
    </div>
  );
};

export default Toast;
