package com.ecodeli.backend.controller;

import com.ecodeli.backend.service.ContratCommercantService;
import com.ecodeli.model.ContratCommercant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/contrats")
public class ContratCommercantController {

    @Autowired
    private ContratCommercantService contratService;


    /**
     * Récupère le contrat d'un commerçant
     */
    @GetMapping("/commercant/{commercantId}")
    public ResponseEntity<ContratCommercant> getContratByCommercant(@PathVariable Long commercantId) {
        try {
            Optional<ContratCommercant> contrat = contratService.getContratByCommercantId(commercantId);
            
            if (contrat.isPresent()) {
                return ResponseEntity.ok(contrat.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Vérifie si un commerçant a un contrat
     */
    @GetMapping("/commercant/{commercantId}/exists")
    public ResponseEntity<Boolean> hasContrat(@PathVariable Long commercantId) {
        try {
            boolean hasContrat = contratService.hasContrat(commercantId);
            return ResponseEntity.ok(hasContrat);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Récupère un contrat par son numéro
     */
    @GetMapping("/numero/{numeroContrat}")
    public ResponseEntity<ContratCommercant> getContratByNumero(@PathVariable String numeroContrat) {
        try {
            Optional<ContratCommercant> contrat = contratService.getContratByNumero(numeroContrat);
            
            if (contrat.isPresent()) {
                return ResponseEntity.ok(contrat.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Crée un nouveau contrat pour un commerçant
     */
    @PostMapping("/commercant/{commercantId}")
    public ResponseEntity<ContratCommercant> createContrat(
            @PathVariable Long commercantId,
            @RequestBody ContratCommercant contrat) {
        try {
            ContratCommercant newContrat = contratService.createContrat(contrat, commercantId);
            return ResponseEntity.status(HttpStatus.CREATED).body(newContrat);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Met à jour un contrat existant
     */
    @PutMapping("/{contratId}")
    public ResponseEntity<ContratCommercant> updateContrat(
            @PathVariable Long contratId,
            @RequestBody ContratCommercant contrat) {
        try {
            ContratCommercant updatedContrat = contratService.updateContrat(contratId, contrat);
            return ResponseEntity.ok(updatedContrat);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Supprime un contrat
     */
    @DeleteMapping("/{contratId}")
    public ResponseEntity<Void> deleteContrat(@PathVariable Long contratId) {
        try {
            contratService.deleteContrat(contratId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
