export interface MenuItem {
  label: string;
  path: string;
  requiresAuth: boolean;
  icon?: string;
  roles?: string[];
}

export interface UserAction {
  label: string;
  path?: string;
  action?: string;
  icon: string;
  roles?: string[];
  divider?: boolean;
}

// Menus de navigation principale (Header)
export const NAVIGATION_MENUS = {
  public: [
    { label: 'Accueil', path: '/', requiresAuth: false },
    { label: 'Annonces', path: '/annonces', requiresAuth: false },
    { label: 'Services', path: '/services', requiresAuth: false },
    { label: 'Comment ça marche', path: '/how-it-works', requiresAuth: false },
    { label: 'Contact', path: '/contact', requiresAuth: false }
  ] as MenuItem[]
};

// Actions du menu profil utilisateur
export const USER_PROFILE_ACTIONS = {
  common: [
    { 
      label: 'Dashboard', 
      path: '/dashboard', 
      icon: 'bi-speedometer2'
    },
    { 
      label: 'Créer une annonce', 
      path: '/annonces/creer', 
      icon: 'bi-plus-circle'
    },
    { 
      label: 'Messages', 
      path: '/messages', 
      icon: 'bi-chat-dots'
    }
  ] as UserAction[],

  roleSpecific: {
    CLIENT: [
      { 
        label: 'Mes annonces', 
        path: '/client/annonces', 
        icon: 'bi-clipboard-check'
      }
    ] as UserAction[],
    
    LIVREUR: [
      { 
        label: 'Annonces disponibles', 
        path: '/livreur/annonces', 
        icon: 'bi-truck'
      },
      { 
        label: 'Mes missions', 
        path: '/livreur/missions', 
        icon: 'bi-box-seam'
      }
    ] as UserAction[],
    
    COMMERCANT: [
      { 
        label: 'Mes contrats', 
        path: '/commercant/contrats', 
        icon: 'bi-file-text'
      },
      { 
        label: 'Mes annonces', 
        path: '/commercant/annonces', 
        icon: 'bi-shop'
      }
    ] as UserAction[],
    
    PRESTATAIRE: [
      { 
        label: 'Mes prestations', 
        path: '/prestataire/prestations', 
        icon: 'bi-tools'
      },
      { 
        label: 'Mon calendrier', 
        path: '/prestataire/calendrier', 
        icon: 'bi-calendar3'
      }
    ] as UserAction[]
  },

  settings: [
    { 
      label: 'Mon profil', 
      path: '/profile', 
      icon: 'bi-person',
      divider: true
    },
    { 
      label: 'Paramètres', 
      path: '/settings', 
      icon: 'bi-gear'
    },
    { 
      label: 'Déconnexion', 
      action: 'logout', 
      icon: 'bi-box-arrow-right',
      divider: true
    }
  ] as UserAction[]
};

export const getNavigationMenus = (): MenuItem[] => {
  return NAVIGATION_MENUS.public;
};

export const getUserProfileActions = (role: string | undefined): UserAction[] => {
  const commonActions = USER_PROFILE_ACTIONS.common;
  const roleActions = role ? USER_PROFILE_ACTIONS.roleSpecific[role as keyof typeof USER_PROFILE_ACTIONS.roleSpecific] || [] : [];
  const settingsActions = USER_PROFILE_ACTIONS.settings;
  
  return [...commonActions, ...roleActions, ...settingsActions];
};

export const isMenuItemAccessible = (item: MenuItem, isAuthenticated: boolean, userRole?: string): boolean => {
  if (!item.requiresAuth) return true;
  if (!isAuthenticated) return false;
  if (item.roles && userRole && !item.roles.includes(userRole)) return false;
  return true;
};
