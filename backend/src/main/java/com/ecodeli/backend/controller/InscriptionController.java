package com.ecodeli.backend.controller;

import com.ecodeli.model.dto.InscriptionDTO;
import com.ecodeli.model.*;
import com.ecodeli.backend.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/inscription")
@CrossOrigin(origins = "http://localhost:3000")
public class InscriptionController {

    private final LivreurRepository livreurRepo;
    private final ClientRepository clientRepo;
    private final CommercantRepository commercantRepo;
    private final PrestataireRepository prestataireRepo;

    public InscriptionController(
            LivreurRepository livreurRepo,
            ClientRepository clientRepo,
            CommercantRepository commercantRepo,
            PrestataireRepository prestataireRepo
    ) {
        this.livreurRepo = livreurRepo;
        this.clientRepo = clientRepo;
        this.commercantRepo = commercantRepo;
        this.prestataireRepo = prestataireRepo;
    }

    @PostMapping
    public ResponseEntity<?> inscrire(@RequestBody InscriptionDTO dto) {
        switch (dto.role.toUpperCase()) {
            case "LIVREUR" -> {
                Livreur l = new Livreur();
                l.setNom(dto.nom);
                l.setPrenom(dto.prenom);
                l.setEmail(dto.email);
                l.setPassword(dto.password);
                l.setTelephone(dto.telephone);
                l.setVehicule(dto.vehicule);
                l.setPermisVerif(dto.permisVerif);
                l.setDateCreation(LocalDate.now());
                l.setRole(Utilisateur.Role.LIVREUR);
                return ResponseEntity.ok(livreurRepo.save(l));
            }
            case "CLIENT" -> {
                Client c = new Client();
                c.setNom(dto.nom);
                c.setEmail(dto.email);
                c.setRole(Utilisateur.Role.CLIENT);
                return ResponseEntity.ok(clientRepo.save(c));
            }
            case "COMMERCANT" -> {
                Commercant com = new Commercant();
                com.setNom(dto.nom);
                com.setEmail(dto.email);
                com.setSIRET(dto.siret);
                com.setRole(Utilisateur.Role.COMMERCANT);
                return ResponseEntity.ok(commercantRepo.save(com));
            }
            case "PRESTATAIRE" -> {
                Prestataire p = new Prestataire();
                p.setNom(dto.nom);
                p.setEmail(dto.email);
                p.setTypeService(dto.typeService);
                p.setRole(Utilisateur.Role.PRESTATAIRE);
                return ResponseEntity.ok(prestataireRepo.save(p));
            }
        }
        return ResponseEntity.badRequest().body("Rôle invalide");
    }
}
