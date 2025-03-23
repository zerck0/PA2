package com.ecodeli.backend.controller;

import com.ecodeli.backend.model.Livreur;
import com.ecodeli.backend.service.LivreurService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/livreurs")
public class LivreurController {

    private final LivreurService livreurService;

    public LivreurController(LivreurService livreurService) {
        this.livreurService = livreurService;
    }

    // 🔍 1. Obtenir tous les livreurs
    @GetMapping
    public List<Livreur> getAllLivreurs() {
        return livreurService.getAllLivreurs();
    }

    // 🔍 2. Obtenir un livreur par ID
    @GetMapping("/{id}")
    public ResponseEntity<Livreur> getLivreurById(@PathVariable Long id) {
        Optional<Livreur> livreur = livreurService.getLivreurById(id);
        return livreur.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ➕ 3. Ajouter un livreur
    @PostMapping
    public Livreur createLivreur(@RequestBody Livreur livreur) {
        return livreurService.saveLivreur(livreur);
    }

    // ✏️ 4. Modifier un livreur
    @PutMapping("/{id}")
    public ResponseEntity<Livreur> updateLivreur(@PathVariable Long id, @RequestBody Livreur livreurDetails) {
        Optional<Livreur> livreurOptional = livreurService.getLivreurById(id);
        if (livreurOptional.isPresent()) {
            Livreur livreur = livreurOptional.get();
            livreur.setNom(livreurDetails.getNom());
            livreur.setTelephone(livreurDetails.getTelephone());
            livreur.setEmail(livreurDetails.getEmail());
            livreur.setDisponible(livreurDetails.isDisponible());
            return ResponseEntity.ok(livreurService.saveLivreur(livreur));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // ❌ 5. Supprimer un livreur
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLivreur(@PathVariable Long id) {
        if (livreurService.getLivreurById(id).isPresent()) {
            livreurService.deleteLivreur(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
