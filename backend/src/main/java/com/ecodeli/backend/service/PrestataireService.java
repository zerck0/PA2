package com.ecodeli.backend.service;

import com.ecodeli.model.Prestataire;
import com.ecodeli.model.Prestation;
import com.ecodeli.backend.repository.PrestataireRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class PrestataireService {

    @Autowired
    private PrestataireRepository prestataireRepository;

    /**
     * Récupérer le profil d'un prestataire
     */
    public Map<String, Object> getProfilPrestataire(Long prestataireId) {
        Optional<Prestataire> prestataireOpt = prestataireRepository.findById(prestataireId);
        
        if (prestataireOpt.isPresent()) {
            Prestataire prestataire = prestataireOpt.get();
            return Map.of(
                "descriptionPrestation", prestataire.getDescriptionPrestation() != null ? prestataire.getDescriptionPrestation() : "",
                "typePrestationPrincipale", prestataire.getTypePrestationPrincipale() != null ? prestataire.getTypePrestationPrincipale().name() : "",
                "photoPrestation", prestataire.getPhotoPrestation() != null ? prestataire.getPhotoPrestation() : "",
                "profilConfigured", prestataire.isProfilConfigured()
            );
        } else {
            // Retourner un profil vide si le prestataire n'existe pas encore
            return Map.of(
                "descriptionPrestation", "",
                "typePrestationPrincipale", "",
                "photoPrestation", "",
                "profilConfigured", false
            );
        }
    }

    /**
     * Configurer le profil d'un prestataire
     */
    public void configurerProfilPrestataire(Long prestataireId, Map<String, Object> profilData) {
        Optional<Prestataire> prestataireOpt = prestataireRepository.findById(prestataireId);
        
        if (prestataireOpt.isPresent()) {
            Prestataire prestataire = prestataireOpt.get();
            
            try {
                // Extraire et valider chaque champ séparément
                String description = null;
                String typeString = null;
                String photoUrl = null;
                
                // Description
                if (profilData.containsKey("descriptionPrestation")) {
                    Object descObj = profilData.get("descriptionPrestation");
                    if (descObj != null) {
                        description = String.valueOf(descObj);
                    }
                }
                
                // Type de prestation
                if (profilData.containsKey("typePrestationPrincipale")) {
                    Object typeObj = profilData.get("typePrestationPrincipale");
                    if (typeObj != null && !typeObj.equals("null")) {
                        typeString = String.valueOf(typeObj).trim();
                        if (typeString.isEmpty()) {
                            typeString = null;
                        }
                    }
                }
                
                // Photo
                if (profilData.containsKey("photoPrestation")) {
                    Object photoObj = profilData.get("photoPrestation");
                    if (photoObj != null) {
                        photoUrl = String.valueOf(photoObj);
                    }
                }
                
                // Appliquer les modifications
                prestataire.setDescriptionPrestation(description);
                prestataire.setPhotoPrestation(photoUrl);
                
                // Gérer le type de prestation
                if (typeString != null) {
                    try {
                        Prestation.TypePrestation typePrestation = Prestation.TypePrestation.valueOf(typeString);
                        prestataire.setTypePrestationPrincipale(typePrestation);
                    } catch (IllegalArgumentException e) {
                        throw new RuntimeException("Type de prestation invalide : " + typeString);
                    }
                } else {
                    prestataire.setTypePrestationPrincipale(null);
                }
                
                // Marquer le profil comme configuré
                boolean isConfigured = (description != null && !description.trim().isEmpty()) ||
                                     prestataire.getTypePrestationPrincipale() != null;
                prestataire.setProfilConfigured(isConfigured);
                
                // Sauvegarder en base
                prestataireRepository.save(prestataire);
                
            } catch (Exception e) {
                throw new RuntimeException("Erreur lors de la configuration du profil: " + e.getMessage());
            }
        } else {
            throw new RuntimeException("Prestataire non trouvé avec l'ID : " + prestataireId);
        }
    }

    /**
     * Récupérer toutes les prestations disponibles (prestataires avec profils configurés)
     */
    public List<Map<String, Object>> getPrestationsDisponibles(String typeService) {
        List<Prestataire> prestataires;
        
        if (typeService != null && !typeService.trim().isEmpty()) {
            // Filtrer par type de service si spécifié
            try {
                Prestation.TypePrestation type = Prestation.TypePrestation.valueOf(typeService);
                prestataires = prestataireRepository.findAll().stream()
                    .filter(p -> p.isProfilConfigured() && 
                               p.getTypePrestationPrincipale() != null && 
                               p.getTypePrestationPrincipale().equals(type))
                    .toList();
            } catch (IllegalArgumentException e) {
                // Type invalide, retourner liste vide
                return new ArrayList<>();
            }
        } else {
            // Récupérer tous les prestataires avec profil configuré
            prestataires = prestataireRepository.findAll().stream()
                .filter(Prestataire::isProfilConfigured)
                .toList();
        }

        // Convertir en format pour l'API
        List<Map<String, Object>> prestationsDisponibles = new ArrayList<>();
        
        for (Prestataire prestataire : prestataires) {
            Map<String, Object> prestationInfo = new HashMap<>();
            
            // Informations de la prestation
            prestationInfo.put("id", prestataire.getId());
            prestationInfo.put("description", prestataire.getDescriptionPrestation() != null ? 
                prestataire.getDescriptionPrestation() : "Service disponible");
            prestationInfo.put("typeService", prestataire.getTypePrestationPrincipale() != null ? 
                prestataire.getTypePrestationPrincipale().getLibelle() : "Service général");
            prestationInfo.put("typeServiceCode", prestataire.getTypePrestationPrincipale() != null ? 
                prestataire.getTypePrestationPrincipale().name() : null);
            prestationInfo.put("photoPrestation", prestataire.getPhotoPrestation());
            
            // Informations du prestataire
            prestationInfo.put("prestataireId", prestataire.getId());
            prestationInfo.put("prestataireName", prestataire.getPrenom() + " " + prestataire.getNom());
            prestationInfo.put("prestatairePhoto", prestataire.getPhotoProfilUrl());
            
            // TODO: Ajouter note moyenne du prestataire (intégration avec le système d'évaluations)
            prestationInfo.put("noteMoyenne", 0.0);
            prestationInfo.put("nombreEvaluations", 0);
            
            prestationsDisponibles.add(prestationInfo);
        }
        
        return prestationsDisponibles;
    }
}
