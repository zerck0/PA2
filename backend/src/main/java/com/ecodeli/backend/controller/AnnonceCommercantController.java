package com.ecodeli.backend.controller;

import com.ecodeli.model.AnnonceCommercant;
import com.ecodeli.model.Commercant;
import com.ecodeli.model.Livreur;
import com.ecodeli.model.Livraison;
import com.ecodeli.backend.repository.AnnonceCommercantRepository;
import com.ecodeli.backend.repository.CommercantRepository;
import com.ecodeli.backend.repository.LivreurRepository;
import com.ecodeli.backend.repository.LivraisonRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/annonces-commercants")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:5174"})
public class AnnonceCommercantController {

    private final AnnonceCommercantRepository annonceCommercantRepository;
    private final CommercantRepository commercantRepository;
    private final LivreurRepository livreurRepository;
    private final LivraisonRepository livraisonRepository;

    public AnnonceCommercantController(AnnonceCommercantRepository annonceCommercantRepository, 
                                     CommercantRepository commercantRepository,
                                     LivreurRepository livreurRepository,
                                     LivraisonRepository livraisonRepository) {
        this.annonceCommercantRepository = annonceCommercantRepository;
        this.commercantRepository = commercantRepository;
        this.livreurRepository = livreurRepository;
        this.livraisonRepository = livraisonRepository;
    }

    @GetMapping
    public List<AnnonceCommercant> getAllAnnonces() {
        return annonceCommercantRepository.findByStatutOrderByDateCreationDesc(AnnonceCommercant.StatutAnnonce.ACTIVE);
    }

    @GetMapping("/affilies")
    public List<AnnonceCommercant> getAnnoncesForAffiliatedDeliverers() {
        // Récupérer les annonces réservées aux affiliés EcoDeli ET statut ACTIVE
        return annonceCommercantRepository.findByReserveAuxAffiliesAndStatutOrderByDateCreationDesc(
            true, 
            AnnonceCommercant.StatutAnnonce.ACTIVE
        );
    }

    @GetMapping("/commercant/{commercantId}")
    public List<AnnonceCommercant> getAnnoncesByCommercant(@PathVariable Long commercantId) {
        Optional<Commercant> commercant = commercantRepository.findById(commercantId);
        if (commercant.isEmpty()) {
            return List.of();
        }
        return annonceCommercantRepository.findByCommercantOrderByDateCreationDesc(commercant.get());
    }

    @PostMapping
    public ResponseEntity<?> createAnnonce(@RequestBody AnnonceCommercant annonce, @RequestParam Long commercantId) {
        Optional<Commercant> commercant = commercantRepository.findById(commercantId);
        
        if (commercant.isEmpty()) {
            return ResponseEntity.badRequest().body("Commerçant non trouvé");
        }
        
        annonce.setCommercant(commercant.get());
        AnnonceCommercant savedAnnonce = annonceCommercantRepository.save(annonce);
        
        return ResponseEntity.ok(savedAnnonce);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnnonceCommercant> getAnnonceById(@PathVariable Long id) {
        Optional<AnnonceCommercant> annonce = annonceCommercantRepository.findById(id);
        return annonce.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAnnonce(@PathVariable Long id, @RequestBody AnnonceCommercant annonceUpdated) {
        Optional<AnnonceCommercant> annonceOpt = annonceCommercantRepository.findById(id);
        
        if (annonceOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        AnnonceCommercant annonce = annonceOpt.get();
        
        // Mettre à jour les champs modifiables
        annonce.setTitre(annonceUpdated.getTitre());
        annonce.setDescription(annonceUpdated.getDescription());
        annonce.setListeCourses(annonceUpdated.getListeCourses());
        annonce.setQuantiteProduits(annonceUpdated.getQuantiteProduits());
        annonce.setPrixPropose(annonceUpdated.getPrixPropose());
        annonce.setReserveAuxAffilies(annonceUpdated.getReserveAuxAffilies());
        annonce.setAdresseDepart(annonceUpdated.getAdresseDepart());
        annonce.setAdresseArrivee(annonceUpdated.getAdresseArrivee());
        annonce.setVilleDepart(annonceUpdated.getVilleDepart());
        annonce.setVilleArrivee(annonceUpdated.getVilleArrivee());
        annonce.setDateLimite(annonceUpdated.getDateLimite());
        annonce.setDatePreferee(annonceUpdated.getDatePreferee());
        
        AnnonceCommercant savedAnnonce = annonceCommercantRepository.save(annonce);
        return ResponseEntity.ok(savedAnnonce);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAnnonce(@PathVariable Long id) {
        Optional<AnnonceCommercant> annonce = annonceCommercantRepository.findById(id);
        
        if (annonce.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        annonceCommercantRepository.deleteById(id);
        return ResponseEntity.ok().body("Annonce supprimée avec succès");
    }

    @PostMapping("/{id}/prendre-en-charge")
    public ResponseEntity<?> prendreEnCharge(@PathVariable Long id, @RequestParam Long livreurId) {
        try {
            // Vérifier que l'annonce existe et est disponible
            Optional<AnnonceCommercant> annonceOpt = annonceCommercantRepository.findById(id);
            if (annonceOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            AnnonceCommercant annonce = annonceOpt.get();
            if (annonce.getStatut() != AnnonceCommercant.StatutAnnonce.ACTIVE) {
                return ResponseEntity.badRequest().body("Cette annonce n'est plus disponible");
            }
            
            // Vérifier que le livreur existe et est affilié
            Optional<Livreur> livreurOpt = livreurRepository.findById(livreurId);
            if (livreurOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Livreur non trouvé");
            }
            
            Livreur livreur = livreurOpt.get();
            if (livreur.getStatutAffiliation() != Livreur.StatutAffiliation.AFFILIE) {
                return ResponseEntity.badRequest().body("Seuls les livreurs affiliés EcoDeli peuvent prendre en charge ces missions");
            }
            
            // Mettre à jour l'annonce : statut ASSIGNEE + livreur assigné
            annonce.setStatut(AnnonceCommercant.StatutAnnonce.ASSIGNEE);
            annonce.setLivreurAssigne(livreur);
            annonceCommercantRepository.save(annonce);
            
            // Créer une livraison associée pour la mission commerçant
            Livraison livraison = new Livraison();
            
            // NOUVEAU : Lier à l'AnnonceCommercant au lieu d'une Annonce normale
            livraison.setAnnonceCommercant(annonce);  // Utiliser la nouvelle relation
            // livraison.setAnnonce(null); // Pas d'annonce normale
            
            livraison.setTypeLivraison(Livraison.TypeLivraison.COMPLETE); // Mission commerçant = livraison complète
            livraison.setStatut(Livraison.StatutLivraison.ASSIGNEE);
            livraison.setAdresseDepart(annonce.getAdresseDepart());
            livraison.setAdresseArrivee(annonce.getAdresseArrivee());
            livraison.setPrixConvenu(annonce.getPrixPropose());
            livraison.setLivreur(livreur);
            livraison.setDateCreation(LocalDateTime.now());
            livraison.setOrdre(1); // Mission commerçant = ordre 1
            livraison.setCodeValidation(generateCodeValidation());
            livraison.setCommentaires("Mission commerçant : " + annonce.getTitre());
            
            // Paramètres pour mission commerçant (complète par défaut)
            livraison.setEstPartielle(false);
            livraison.setSegmentOrdre(null); // Pas de segment pour livraison complète
            
            // Sauvegarder la livraison
            livraisonRepository.save(livraison);
            
            return ResponseEntity.ok().body("Mission prise en charge avec succès !");
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur lors de la prise en charge : " + e.getMessage());
        }
    }
    
    @GetMapping("/count/commercant/{commercantId}")
    public ResponseEntity<Long> countAnnoncesByCommercant(@PathVariable Long commercantId) {
        Optional<Commercant> commercant = commercantRepository.findById(commercantId);
        
        if (commercant.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Long count = annonceCommercantRepository.countByCommercantAndStatut(
            commercant.get(), 
            AnnonceCommercant.StatutAnnonce.ACTIVE
        );
        
        return ResponseEntity.ok(count);
    }
    
    // Méthode utilitaire pour générer un code de validation
    private String generateCodeValidation() {
        return "CM" + System.currentTimeMillis() % 100000; // CM + 5 chiffres
    }
}
