import { useToastContext } from '../contexts/ToastContext';

export const useToast = () => {
  const { addToast, removeToast, clearAllToasts } = useToastContext();

  const showSuccess = (message: string, duration?: number) => {
    addToast({
      message,
      type: 'success',
      duration,
    });
  };

  const showError = (message: string, duration?: number) => {
    addToast({
      message,
      type: 'error',
      duration,
    });
  };

  const showInfo = (message: string, duration?: number) => {
    addToast({
      message,
      type: 'info',
      duration,
    });
  };

  const showWarning = (message: string, duration?: number) => {
    addToast({
      message,
      type: 'warning',
      duration,
    });
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    removeToast,
    clearAllToasts,
  };
};
