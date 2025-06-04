export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatPrice = (price: number): string => {
  return `${price.toFixed(2)}€`;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const getRoleLabel = (role: string): string => {
  const roleLabels: { [key: string]: string } = {
    CLIENT: 'Client',
    LIVREUR: 'Livreur',
    COMMERCANT: 'Commerçant',
    PRESTATAIRE: 'Prestataire'
  };
  return roleLabels[role] || role;
};
