package com.ecodeli.backend.controller;

import com.ecodeli.backend.repository.LivreurRepository;
import com.ecodeli.backend.repository.PrestataireRepository;
import com.ecodeli.model.Livreur;
import com.ecodeli.model.Prestataire;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/profils")
@CrossOrigin(origins = "http://localhost:5173")
public class ProfilPublicController {

    @Autowired
    private LivreurRepository livreurRepository;

    @Autowired
    private PrestataireRepository prestataireRepository;

    /**
     * Récupérer le profil public d'un livreur
     */
    @GetMapping("/livreur/{id}")
    public ResponseEntity<?> getProfilLivreur(@PathVariable Long id) {
        try {
            Optional<Livreur> livreur = livreurRepository.findById(id);
            
            if (livreur.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(livreur.get());
            
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Erreur lors de la récupération du profil livreur"));
        }
    }

    /**
     * Récupérer le profil public d'un prestataire
     */
    @GetMapping("/prestataire/{id}")
    public ResponseEntity<?> getProfilPrestataire(@PathVariable Long id) {
        try {
            Optional<Prestataire> prestataire = prestataireRepository.findById(id);
            
            if (prestataire.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(prestataire.get());
            
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Erreur lors de la récupération du profil prestataire"));
        }
    }

    /**
     * Mettre à jour le profil d'un livreur (biographie et photo)
     */
    @PutMapping("/livreur/{id}")
    public ResponseEntity<?> updateProfilLivreur(@PathVariable Long id, @RequestBody UpdateProfilRequest request) {
        try {
            Optional<Livreur> livreurOpt = livreurRepository.findById(id);
            
            if (livreurOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Livreur livreur = livreurOpt.get();
            
            // Mise à jour des champs si fournis
            if (request.getBiographie() != null) {
                livreur.setBiographie(request.getBiographie());
            }
            if (request.getPhotoProfilUrl() != null) {
                livreur.setPhotoProfilUrl(request.getPhotoProfilUrl());
            }
            
            livreurRepository.save(livreur);
            
            return ResponseEntity.ok(livreur);
            
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Erreur lors de la mise à jour du profil livreur"));
        }
    }

    /**
     * Mettre à jour le profil d'un prestataire (biographie et photo)
     */
    @PutMapping("/prestataire/{id}")
    public ResponseEntity<?> updateProfilPrestataire(@PathVariable Long id, @RequestBody UpdateProfilRequest request) {
        try {
            Optional<Prestataire> prestataireOpt = prestataireRepository.findById(id);
            
            if (prestataireOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Prestataire prestataire = prestataireOpt.get();
            
            // Mise à jour des champs si fournis
            if (request.getBiographie() != null) {
                prestataire.setBiographie(request.getBiographie());
            }
            if (request.getPhotoProfilUrl() != null) {
                prestataire.setPhotoProfilUrl(request.getPhotoProfilUrl());
            }
            
            prestataireRepository.save(prestataire);
            
            return ResponseEntity.ok(prestataire);
            
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Erreur lors de la mise à jour du profil prestataire"));
        }
    }

    /**
     * Classe interne pour les requêtes de mise à jour
     */
    public static class UpdateProfilRequest {
        private String biographie;
        private String photoProfilUrl;

        public UpdateProfilRequest() {}

        public String getBiographie() {
            return biographie;
        }

        public void setBiographie(String biographie) {
            this.biographie = biographie;
        }

        public String getPhotoProfilUrl() {
            return photoProfilUrl;
        }

        public void setPhotoProfilUrl(String photoProfilUrl) {
            this.photoProfilUrl = photoProfilUrl;
        }

        @Override
        public String toString() {
            return "UpdateProfilRequest{" +
                    "biographie='" + biographie + '\'' +
                    ", photoProfilUrl='" + photoProfilUrl + '\'' +
                    '}';
        }
    }
}
