import { DistanceCalculationResult } from '../types/google';

/**
 * Service pour les interactions avec Google Maps API
 */
export class GoogleMapsService {
  private static geocoder: any = null;
  private static distanceService: any = null;

  /**
   * Initialise les services Google Maps
   */
  private static initializeServices() {
    if (window.google && window.google.maps) {
      if (!this.geocoder) {
        this.geocoder = new window.google.maps.Geocoder();
      }
      if (!this.distanceService) {
        this.distanceService = new window.google.maps.DistanceMatrixService();
      }
    }
  }

  /**
   * Vérifie si Google Maps est disponible
   */
  static isAvailable(): boolean {
    return !!(window.google && window.google.maps);
  }

  /**
   * Calcule la distance entre deux adresses et estime un prix
   */
  static async calculateDistanceAndPrice(
    originAddress: string,
    destinationAddress: string
  ): Promise<DistanceCalculationResult> {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          error: 'Google Maps n\'est pas disponible'
        };
      }

      this.initializeServices();

      // Utiliser le service Distance Matrix pour plus de précision
      const result = await new Promise<DistanceCalculationResult>((resolve) => {
        this.distanceService.getDistanceMatrix({
          origins: [originAddress],
          destinations: [destinationAddress],
          travelMode: window.google.maps.TravelMode.DRIVING,
          unitSystem: window.google.maps.UnitSystem.METRIC,
          avoidHighways: false,
          avoidTolls: false
        }, (response: any, status: any) => {
          if (status === window.google.maps.DistanceMatrixStatus.OK) {
            const element = response.rows[0].elements[0];
            
            if (element.status === 'OK') {
              const distanceInMeters = element.distance.value;
              const durationInSeconds = element.duration.value;
              
              const distanceInKm = distanceInMeters / 1000;
              const durationInMinutes = Math.round(durationInSeconds / 60);
              
              // Calcul du prix estimé
              const estimatedPrice = this.calculatePrice(distanceInKm, durationInMinutes);
              
              resolve({
                success: true,
                distance: Math.round(distanceInKm * 10) / 10, // Arrondi à 1 décimale
                duration: durationInMinutes,
                estimatedPrice: Math.round(estimatedPrice * 100) / 100 // Arrondi à 2 décimales
              });
            } else {
              resolve({
                success: false,
                error: 'Impossible de calculer la distance entre ces adresses'
              });
            }
          } else {
            resolve({
              success: false,
              error: 'Erreur du service de calcul de distance'
            });
          }
        });
      });

      return result;

    } catch (error) {
      console.error('Erreur lors du calcul de distance:', error);
      return {
        success: false,
        error: 'Erreur technique lors du calcul'
      };
    }
  }

  /**
   * Calcule un prix estimé basé sur la distance et la durée
   * Formule : Prix de base + (distance × tarif/km) + (durée × tarif/minute)
   */
  private static calculatePrice(distanceKm: number, durationMinutes: number): number {
    const BASE_PRICE = 5; // Prix de base en euros
    const PRICE_PER_KM = 0.8; // Tarif par kilomètre
    const PRICE_PER_MINUTE = 0.15; // Tarif par minute (temps)
    
    const distancePrice = distanceKm * PRICE_PER_KM;
    const timePrice = durationMinutes * PRICE_PER_MINUTE;
    
    return BASE_PRICE + distancePrice + timePrice;
  }

  /**
   * Calcule un prix estimé simple basé uniquement sur la distance
   * Utile quand on a déjà la distance sans passer par l'API
   */
  static calculateSimplePrice(distanceKm: number): number {
    const BASE_PRICE = 5;
    const PRICE_PER_KM = 0.8;
    
    return BASE_PRICE + (distanceKm * PRICE_PER_KM);
  }

  /**
   * Formatte la distance pour l'affichage
   */
  static formatDistance(distanceKm: number): string {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m`;
    }
    return `${distanceKm}km`;
  }

  /**
   * Formatte la durée pour l'affichage
   */
  static formatDuration(durationMinutes: number): string {
    if (durationMinutes < 60) {
      return `${durationMinutes}min`;
    }
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
  }

  /**
   * Formatte le prix pour l'affichage
   */
  static formatPrice(price: number): string {
    return `${price.toFixed(2)}€`;
  }
}

// Export par défaut pour faciliter l'importation
export default GoogleMapsService;
