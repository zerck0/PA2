/**
 * Utilitaire pour charger Google Maps API de manière dynamique
 */

let isLoading = false;
let isLoaded = false;
let loadPromise: Promise<void> | null = null;

/**
 * Charge Google Maps API de manière asynchrone
 */
export const loadGoogleMapsAPI = (): Promise<void> => {
  // Si déjà chargé, retourner immédiatement
  if (isLoaded && window.google?.maps?.places) {
    return Promise.resolve();
  }

  // Si en cours de chargement, retourner la promesse existante
  if (isLoading && loadPromise) {
    return loadPromise;
  }

  // Commencer le chargement
  isLoading = true;
  
  loadPromise = new Promise((resolve, reject) => {
    // Vérifier si le script existe déjà
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Obtenir la clé API depuis les variables d'environnement
    const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || 'AIzaSyBZN-HKmsPlakwEIrg3iSAufkM6Jtqc27M';
    
    // Debug : Afficher toutes les variables d'environnement Vite
    console.log('🔍 Variables d\'environnement Vite disponibles:');
    console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
    console.log('VITE_GOOGLE_PLACES_API_KEY:', import.meta.env.VITE_GOOGLE_PLACES_API_KEY);
    console.log('VITE_GOOGLE_MAPS_API_KEY:', import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
    console.log('Toutes les variables VITE:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));
    
    if (!apiKey) {
      console.error('❌ VITE_GOOGLE_PLACES_API_KEY non définie dans .env');
      console.error('📝 Contenu de import.meta.env:', import.meta.env);
      isLoading = false;
      reject(new Error('Clé API Google Maps manquante'));
      return;
    }

    // Créer et injecter le script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log('✅ Google Maps API chargée avec succès');
      isLoaded = true;
      isLoading = false;
      resolve();
    };

    script.onerror = (error) => {
      console.error('❌ Erreur lors du chargement de Google Maps API:', error);
      isLoading = false;
      reject(error);
    };

    document.head.appendChild(script);
  });

  return loadPromise;
};

/**
 * Vérifie si Google Maps API est disponible
 */
export const isGoogleMapsLoaded = (): boolean => {
  return !!(window.google && window.google.maps && window.google.maps.places);
};

/**
 * Attend que Google Maps API soit disponible
 */
export const waitForGoogleMaps = (maxAttempts = 10): Promise<void> => {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const checkAvailability = () => {
      attempts++;
      
      if (isGoogleMapsLoaded()) {
        resolve();
      } else if (attempts >= maxAttempts) {
        reject(new Error('Google Maps API non disponible après plusieurs tentatives'));
      } else {
        setTimeout(checkAvailability, 500);
      }
    };

    checkAvailability();
  });
};
