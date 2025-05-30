export interface Tab {
  key: string;
  title: string;
  icon: string;
}

export const getDashboardTabs = (role: string): Tab[] => {
  const commonTabs: Tab[] = [
    { key: 'apercu', title: 'Aperçu', icon: 'bi-house' },
    { key: 'annonces', title: 'Mes annonces', icon: 'bi-megaphone' },
    { key: 'profil', title: 'Mon profil', icon: 'bi-person' },
    { key: 'messages', title: 'Messages', icon: 'bi-envelope' }
  ];

  switch (role?.toUpperCase()) {
    case 'LIVREUR':
      return [
        ...commonTabs.slice(0, 2),
        { key: 'livraisons', title: 'Mes livraisons', icon: 'bi-truck' },
        { key: 'planning', title: 'Mon planning', icon: 'bi-calendar' },
        { key: 'paiements', title: 'Mes paiements', icon: 'bi-wallet2' },
        { key: 'documents', title: 'Mes documents', icon: 'bi-file-earmark' },
        ...commonTabs.slice(2)
      ];

    case 'CLIENT':
      return [
        ...commonTabs.slice(0, 2),
        { key: 'livraisons', title: 'Mes livraisons', icon: 'bi-box' },
        { key: 'prestations', title: 'Mes prestations', icon: 'bi-tools' },
        { key: 'abonnement', title: 'Mon abonnement', icon: 'bi-credit-card' },
        { key: 'stockage', title: 'Mes box de stockage', icon: 'bi-archive' },
        ...commonTabs.slice(2)
      ];

    case 'COMMERCANT':
      return [
        ...commonTabs.slice(0, 2),
        { key: 'contrat', title: 'Mon contrat', icon: 'bi-file-text' },
        { key: 'commandes', title: 'Mes commandes', icon: 'bi-bag' },
        { key: 'facturation', title: 'Ma facturation', icon: 'bi-receipt' },
        ...commonTabs.slice(2)
      ];

    case 'PRESTATAIRE':
      return [
        ...commonTabs.slice(0, 2),
        { key: 'services', title: 'Mes services', icon: 'bi-gear' },
        { key: 'interventions', title: 'Mes interventions', icon: 'bi-calendar-check' },
        { key: 'calendrier', title: 'Mon calendrier', icon: 'bi-calendar3' },
        { key: 'evaluations', title: 'Mes évaluations', icon: 'bi-star' },
        { key: 'facturation', title: 'Ma facturation', icon: 'bi-receipt' },
        ...commonTabs.slice(2)
      ];

    default:
      return commonTabs;
  }
};
