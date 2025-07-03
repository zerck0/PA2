package com.ecodeli.backend.service;

import com.ecodeli.model.Annonce;
import com.ecodeli.model.Livreur;
import com.ecodeli.model.Livraison;
import com.ecodeli.backend.repository.AnnonceRepository;
import com.ecodeli.backend.repository.LivreurRepository;
import com.ecodeli.backend.repository.LivraisonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@Service
public class AnnonceService {
    
    @Autowired
    private AnnonceRepository annonceRepository;
    
    @Autowired
    private LivreurRepository livreurRepository;
    
    @Autowired
    private LivraisonRepository livraisonRepository;
    
    public List<Annonce> getAllActiveAnnonces() {
        return annonceRepository.findByStatutOrderByDateCreationDesc(Annonce.StatutAnnonce.ACTIVE);
    }
    
    /**
     * Enrichit une annonce avec les informations de segments de livraison partielle
     */
    private void enrichirAvecInfosSegments(Annonce annonce) {
        try {
            // Vérification de sécurité
            if (annonce == null || annonce.getId() == null) {
                System.err.println("Annonce nulle ou sans ID dans enrichirAvecInfosSegments");
                return;
            }
            
            List<Livraison> livraisons = livraisonRepository.findByAnnonceId(annonce.getId());
            
            // Vérification si des livraisons existent
            if (livraisons == null || livraisons.isEmpty()) {
                return; // Pas de segments, pas d'enrichissement
            }
            
            // Chercher le segment dépôt assigné
            Optional<Livraison> segmentDepot = livraisons.stream()
                .filter(l -> l != null && 
                           l.getTypeLivraison() == Livraison.TypeLivraison.PARTIELLE_DEPOT && 
                           l.getLivreur() != null)
                .findFirst();
            
            if (segmentDepot.isPresent()) {
                // Si le segment dépôt est assigné, modifier l'affichage de l'annonce
                Livraison depot = segmentDepot.get();
                
                // Modifier l'adresse de départ vers l'entrepôt
                if (depot.getEntrepot() != null && 
                    depot.getEntrepot().getAdresse() != null && 
                    depot.getEntrepot().getVille() != null) {
                    annonce.setAdresseDepart(depot.getEntrepot().getAdresse());
                    annonce.setVilleDepart(depot.getEntrepot().getVille());
                }
                
                // Marquer l'annonce comme ayant un segment dépôt assigné
                // Vérification de toutes les valeurs non nulles
                if (annonce.getDescription() != null && 
                    depot.getEntrepot() != null && 
                    depot.getEntrepot().getNom() != null &&
                    depot.getLivreur() != null &&
                    depot.getLivreur().getPrenom() != null &&
                    depot.getLivreur().getNom() != null) {
                    
                    String enrichissement = "##SEGMENT_DEPOT_ASSIGNE##" + 
                        depot.getEntrepot().getNom() + "##" + 
                        depot.getLivreur().getPrenom() + " " + depot.getLivreur().getNom();
                    
                    annonce.setDescription(annonce.getDescription() + enrichissement);
                }
            }
            
        } catch (Exception e) {
            // En cas d'erreur, on log mais on ne fait pas planter l'endpoint
            System.err.println("Erreur lors de l'enrichissement de l'annonce " + 
                             (annonce != null ? annonce.getId() : "null") + ": " + e.getMessage());
            e.printStackTrace();
            // On continue sans enrichissement plutôt que de faire planter l'API
        }
    }
    
    public List<Annonce> getAnnoncesByAuteur(Long auteurId) {
        return annonceRepository.findByAuteurIdOrderByDateCreationDesc(auteurId);
    }
    
    public List<Annonce> searchAnnoncesByVille(String ville) {
        List<Annonce> annonces = annonceRepository.findActiveAnnoncesByVille(ville, Annonce.StatutAnnonce.ACTIVE);
        // Enrichir chaque annonce avec les informations de segments
        for (Annonce annonce : annonces) {
            enrichirAvecInfosSegments(annonce);
        }
        return annonces;
    }
    
    public List<Annonce> getAnnoncesByType(Annonce.TypeAnnonce type) {
        List<Annonce> annonces = annonceRepository.findActiveAnnoncesByType(type, Annonce.StatutAnnonce.ACTIVE);
        // Enrichir chaque annonce avec les informations de segments
        for (Annonce annonce : annonces) {
            enrichirAvecInfosSegments(annonce);
        }
        return annonces;
    }
    
    public Annonce createAnnonce(Annonce annonce) {
        return annonceRepository.save(annonce);
    }
    
    public Optional<Annonce> getAnnonceById(Long id) {
        Optional<Annonce> annonceOpt = annonceRepository.findById(id);
        if (annonceOpt.isPresent()) {
            Annonce annonce = annonceOpt.get();
            // Appliquer l'enrichissement aussi pour les annonces individuelles
            enrichirAvecInfosSegments(annonce);
        }
        return annonceOpt;
    }
    
    public Annonce updateAnnonce(Annonce annonce) {
        return annonceRepository.save(annonce);
    }
    
    public void deleteAnnonce(Long id) {
        annonceRepository.deleteById(id);
    }
    
    public Optional<Annonce> assignerLivreur(Long annonceId, Long livreurId) {
        Optional<Annonce> annonceOpt = annonceRepository.findById(annonceId);
        if (annonceOpt.isEmpty()) {
            return Optional.empty();
        }
        
        Annonce annonce = annonceOpt.get();
        
        // Vérifier que l'annonce est disponible
        if (annonce.getStatut() != Annonce.StatutAnnonce.ACTIVE) {
            throw new IllegalStateException("Cette annonce n'est plus disponible");
        }
        
        // Récupérer le livreur par son ID
        Optional<Livreur> livreurOpt = livreurRepository.findById(livreurId);
        if (livreurOpt.isEmpty()) {
            throw new IllegalStateException("Livreur non trouvé");
        }
        
        // Assigner le livreur et changer le statut
        annonce.setLivreurAssigne(livreurOpt.get());
        annonce.setStatut(Annonce.StatutAnnonce.ASSIGNEE);
        
        return Optional.of(annonceRepository.save(annonce));
    }
    
    public List<Annonce> getAnnoncesByLivreur(Long livreurId) {
        // TODO: Implémenter la méthode findByLivreurId dans AnnonceRepository
        return List.of(); // Retourne une liste vide temporairement
    }

    /**
     * Retourne les informations sur les segments d'une annonce (pour les livraisons partielles)
     */
    public Map<String, Object> getSegmentsInfo(Long annonceId) {
        List<Livraison> livraisons = livraisonRepository.findByAnnonceId(annonceId);
        
        // Chercher les segments de livraison partielle
        Optional<Livraison> segmentDepot = livraisons.stream()
            .filter(l -> l.getTypeLivraison() == Livraison.TypeLivraison.PARTIELLE_DEPOT)
            .findFirst();
            
        Optional<Livraison> segmentRetrait = livraisons.stream()
            .filter(l -> l.getTypeLivraison() == Livraison.TypeLivraison.PARTIELLE_RETRAIT)
            .findFirst();

        Map<String, Object> segments = new HashMap<>();
        
        // Informations segment dépôt
        Map<String, Object> depot = new HashMap<>();
        depot.put("existe", segmentDepot.isPresent());
        if (segmentDepot.isPresent()) {
            Livraison depotLivraison = segmentDepot.get();
            depot.put("livreurId", depotLivraison.getLivreur() != null ? depotLivraison.getLivreur().getId() : null);
            depot.put("livreurNom", depotLivraison.getLivreur() != null ? 
                depotLivraison.getLivreur().getPrenom() + " " + depotLivraison.getLivreur().getNom() : null);
            depot.put("entrepotId", depotLivraison.getEntrepot() != null ? depotLivraison.getEntrepot().getId() : null);
            depot.put("entrepotNom", depotLivraison.getEntrepot() != null ? depotLivraison.getEntrepot().getNom() : null);
            depot.put("statut", depotLivraison.getStatut().toString());
        }
        
        // Informations segment retrait
        Map<String, Object> retrait = new HashMap<>();
        retrait.put("existe", segmentRetrait.isPresent());
        if (segmentRetrait.isPresent()) {
            Livraison retraitLivraison = segmentRetrait.get();
            retrait.put("livreurId", retraitLivraison.getLivreur() != null ? retraitLivraison.getLivreur().getId() : null);
            retrait.put("livreurNom", retraitLivraison.getLivreur() != null ? 
                retraitLivraison.getLivreur().getPrenom() + " " + retraitLivraison.getLivreur().getNom() : null);
            retrait.put("entrepotId", retraitLivraison.getEntrepot() != null ? retraitLivraison.getEntrepot().getId() : null);
            retrait.put("entrepotNom", retraitLivraison.getEntrepot() != null ? retraitLivraison.getEntrepot().getNom() : null);
            retrait.put("statut", retraitLivraison.getStatut().toString());
        }
        
        segments.put("depot", depot);
        segments.put("retrait", retrait);
        segments.put("tousSegmentsAssignes", segmentDepot.isPresent() && segmentRetrait.isPresent() && 
            segmentDepot.get().getLivreur() != null && segmentRetrait.get().getLivreur() != null);
        
        return segments;
    }
}
