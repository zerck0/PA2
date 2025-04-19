package com.ecodeli.backend.controller;

import com.ecodeli.backend.repository.AnnonceRepository;
import com.ecodeli.model.Annonce;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/annonces")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class AnnonceController {

    private final AnnonceRepository annonceRepository;

    public AnnonceController(AnnonceRepository annonceRepository) {
        this.annonceRepository = annonceRepository;
    }

    @GetMapping
    public List<Annonce> getAllAnnonces() {
        return annonceRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Annonce> getAnnonceById(@PathVariable Long id) {
        return annonceRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Annonce> createAnnonce(@RequestBody Annonce annonce) {
        Annonce savedAnnonce = annonceRepository.save(annonce);
        return ResponseEntity.ok(savedAnnonce);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Annonce> updateAnnonce(@PathVariable Long id, @RequestBody Annonce annonceDetails) {
        return annonceRepository.findById(id)
                .map(annonce -> {
                    annonce.setDescription(annonceDetails.getDescription());
                    annonce.setType(annonceDetails.getType());
                    annonce.setStatut(annonceDetails.getStatut());
                    annonce.setVilleDepart(annonceDetails.getVilleDepart());
                    annonce.setVilleArrivee(annonceDetails.getVilleArrivee());
                    annonce.setAdresseDepart(annonceDetails.getAdresseDepart());
                    annonce.setAdresseArrivee(annonceDetails.getAdresseArrivee());
                    annonce.setDateLivraison(annonceDetails.getDateLivraison());
                    annonce.setPrix(annonceDetails.getPrix());
                    return ResponseEntity.ok(annonceRepository.save(annonce));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAnnonce(@PathVariable Long id) {
        return annonceRepository.findById(id)
                .map(annonce -> {
                    annonceRepository.delete(annonce);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/count")
    public long countAnnonces() {
        return annonceRepository.count();
    }
}