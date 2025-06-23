# Configuration Google Places API

## Étapes pour activer l'autocomplétion d'adresses

### 1. Obtenir une clé API Google Places

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer ou sélectionner un projet
3. Activer l'API "Places API" 
4. Créer une clé API dans "Identifiants"
5. Restreindre la clé aux domaines autorisés

### 2. Configuration dans le projet

1. Ajouter la clé dans le fichier `.env` :
```bash
VITE_GOOGLE_PLACES_API_KEY=your_api_key_here
```

2. Charger le script Google Places dans `index.html` :
```html
<script async defer 
  src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">
</script>
```

### 3. Mise à jour du composant AddressInput

Le composant `AddressInput.tsx` est déjà préparé pour recevoir l'intégration Google Places.

Remplacer la section TODO par :

```typescript
useEffect(() => {
  if (window.google && window.google.maps && inputRef.current) {
    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['address']
    });
    
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        onChange(place.formatted_address);
        
        // Extraire la ville du résultat Google Places
        const addressComponents = place.address_components;
        const city = addressComponents?.find(
          component => component.types.includes('locality')
        )?.long_name;
        
        if (city && onCityChange) {
          onCityChange(city);
        }
      }
    });
  }
}, [onChange, onCityChange]);
```

### 4. Types TypeScript

Ajouter les types Google Places dans `src/types/google.d.ts` :

```typescript
declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: any;
        };
      };
    };
  }
}
```

### 5. Coût estimé

L'API Google Places facture environ 0,017$ par requête d'autocomplétion.
Pour un usage modéré (1000 requêtes/mois), comptez ~17$/mois.
