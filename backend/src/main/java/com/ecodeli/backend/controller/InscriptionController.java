package com.ecodeli.backend.controller;

import com.ecodeli.model.dto.InscriptionDTO;
import com.ecodeli.model.*;
import com.ecodeli.backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/inscription")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
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
        try {
            // Champs communs à tous les utilisateurs
            LocalDate dateCreation = LocalDate.now();
            
            switch (dto.role.toUpperCase()) {
                case "LIVREUR" -> {
                    Livreur livreur = new Livreur();
                    setCommonFields(livreur, dto, dateCreation);
                    livreur.setRole(Utilisateur.Role.LIVREUR);
                    livreur.setVehicule(dto.vehicule);
                    livreur.setPermisVerif(dto.permisVerif);
                    livreur.setNote(0.0); // Note initiale
                    livreur.setDossierValide(false); // Par défaut
                    return ResponseEntity.ok(livreurRepo.save(livreur));
                }
                case "CLIENT" -> {
                    Client client = new Client();
                    setCommonFields(client, dto, dateCreation);
                    client.setRole(Utilisateur.Role.CLIENT);
                    client.setTutorielVu(false); // Par défaut
                    return ResponseEntity.ok(clientRepo.save(client));
                }
                case "COMMERCANT" -> {
                    Commercant commercant = new Commercant();
                    setCommonFields(commercant, dto, dateCreation);
                    commercant.setRole(Utilisateur.Role.COMMERCANT);
                    commercant.setSIRET(dto.siret);
                    commercant.setVerifDossier(false); // Par défaut
                    // Optionnel : à compléter plus tard
                    commercant.setNomEntreprise("");
                    commercant.setAdresseCommerce("");
                    return ResponseEntity.ok(commercantRepo.save(commercant));
                }
                case "PRESTATAIRE" -> {
                    Prestataire prestataire = new Prestataire();
                    setCommonFields(prestataire, dto, dateCreation);
                    prestataire.setRole(Utilisateur.Role.PRESTATAIRE);
                    prestataire.setTypeService(dto.typeService);
                    prestataire.setVerifDossier(false); // Par défaut
                    prestataire.setTarifHoraire(dto.tarifHoraire != null ? dto.tarifHoraire.floatValue() : 0f);
                    prestataire.setNote(0f); // Note initiale
                    return ResponseEntity.ok(prestataireRepo.save(prestataire));
                }
                default -> {
                    return ResponseEntity.badRequest().body("Rôle invalide: " + dto.role);
                }
            }
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur lors de la création: " + e.getMessage());
        }
    }

    private void setCommonFields(Utilisateur utilisateur, InscriptionDTO dto, LocalDate dateCreation) {
        utilisateur.setNom(dto.nom);
        utilisateur.setPrenom(dto.prenom);
        utilisateur.setEmail(dto.email);
        utilisateur.setPassword(dto.password); // À hasher dans une version future
        utilisateur.setTelephone(dto.telephone);
        utilisateur.setDateCreation(dateCreation);
        // Champs optionnels à remplir plus tard
        utilisateur.setAdresse("");
        utilisateur.setVille("");
        utilisateur.setCodepostal("");
    }
}
