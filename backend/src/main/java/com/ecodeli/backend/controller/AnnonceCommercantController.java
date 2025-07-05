package com.ecodeli.backend.controller;

import com.ecodeli.model.AnnonceCommercant;
import com.ecodeli.model.Commercant;
import com.ecodeli.backend.repository.AnnonceCommercantRepository;
import com.ecodeli.backend.repository.CommercantRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/annonces-commercants")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:5174"})
public class AnnonceCommercantController {

    private final AnnonceCommercantRepository annonceCommercantRepository;
    private final CommercantRepository commercantRepository;

    public AnnonceCommercantController(AnnonceCommercantRepository annonceCommercantRepository, 
                                     CommercantRepository commercantRepository) {
        this.annonceCommercantRepository = annonceCommercantRepository;
        this.commercantRepository = commercantRepository;
    }

    @GetMapping
    public List<AnnonceCommercant> getAllAnnonces() {
        return annonceCommercantRepository.findByStatutOrderByDateCreationDesc(AnnonceCommercant.StatutAnnonce.ACTIVE);
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
}
