package com.ecodeli.backend.service;

import com.ecodeli.model.Prestataire;
import com.ecodeli.model.Prestation;
import com.ecodeli.backend.repository.PrestataireRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
}
