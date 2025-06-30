package com.ecodeli.backend.controller;

import com.ecodeli.model.Entrepot;
import com.ecodeli.backend.service.EntrepotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/entrepots")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:5174"})
public class EntrepotController {

    @Autowired
    private EntrepotService entrepotService;

    @GetMapping
    public ResponseEntity<List<Entrepot>> getAllActiveEntrepots() {
        List<Entrepot> entrepots = entrepotService.getActiveEntrepots();
        return ResponseEntity.ok(entrepots);
    }

    @GetMapping("/ville/{ville}")
    public ResponseEntity<List<Entrepot>> getEntrepotsByVille(@PathVariable String ville) {
        List<Entrepot> entrepots = entrepotService.getEntrepotsByVille(ville);
        return ResponseEntity.ok(entrepots);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Entrepot>> searchEntrepotsByVille(@RequestParam String ville) {
        List<Entrepot> entrepots = entrepotService.searchEntrepotsByVille(ville);
        return ResponseEntity.ok(entrepots);
    }

    @GetMapping("/plus-proche")
    public ResponseEntity<Entrepot> getEntrepotPlusProche(@RequestParam String ville) {
        return entrepotService.getEntrepotPlusProche(ville)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Entrepot> getEntrepotById(@PathVariable Long id) {
        return entrepotService.getEntrepotById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = Map.of(
            "totalEntrepotsActifs", entrepotService.getCountActiveEntrepots(),
            "nombreEntrepots", entrepotService.getAllEntrepots().size()
        );
        return ResponseEntity.ok(stats);
    }

    // Endpoints d'administration (pour le backoffice)
    @PostMapping
    public ResponseEntity<?> createEntrepot(@RequestBody Entrepot entrepot) {
        try {
            Entrepot nouvelEntrepot = entrepotService.createEntrepot(entrepot);
            return ResponseEntity.ok(nouvelEntrepot);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEntrepot(@PathVariable Long id, @RequestBody Entrepot entrepotDetails) {
        try {
            Entrepot entrepotMisAJour = entrepotService.updateEntrepot(id, entrepotDetails);
            return ResponseEntity.ok(entrepotMisAJour);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/activer")
    public ResponseEntity<?> activerEntrepot(@PathVariable Long id) {
        try {
            entrepotService.activerEntrepot(id);
            return ResponseEntity.ok(Map.of("message", "Entrepôt activé avec succès"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/desactiver")
    public ResponseEntity<?> desactiverEntrepot(@PathVariable Long id) {
        try {
            entrepotService.desactiverEntrepot(id);
            return ResponseEntity.ok(Map.of("message", "Entrepôt désactivé avec succès"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEntrepot(@PathVariable Long id) {
        try {
            entrepotService.deleteEntrepot(id);
            return ResponseEntity.ok(Map.of("message", "Entrepôt supprimé avec succès"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        }
    }
}
