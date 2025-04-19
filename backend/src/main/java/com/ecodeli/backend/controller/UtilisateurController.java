package com.ecodeli.backend.controller;

import com.ecodeli.model.Utilisateur;
import com.ecodeli.backend.service.UtilisateurService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.util.List;

@RestController
@RequestMapping("/api/utilisateurs")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class UtilisateurController {

    private final UtilisateurService utilisateurService;

    public UtilisateurController(UtilisateurService utilisateurService) {
        this.utilisateurService = utilisateurService;
    }

    @GetMapping
    public List<Utilisateur> getAllUtilisateurs() {
        return utilisateurService.getAllUtilisateurs();
    }

    @GetMapping("/{id}")
    public Utilisateur getUtilisateurById(@PathVariable Long id) {
        return utilisateurService.getUtilisateurById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    @GetMapping("/role/{role}")
    public List<Utilisateur> getUtilisateursByRole(@PathVariable String role) {
        return utilisateurService.getUtilisateursByRole(role);
    }

    @GetMapping("/count")
    public long countUtilisateurs() {
        return utilisateurService.countUtilisateurs();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUtilisateur(@PathVariable Long id) {
        try {
            utilisateurService.deleteUtilisateur(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}