package com.ecodeli.backend.service;

import com.ecodeli.backend.repository.ContratCommercantRepository;
import com.ecodeli.backend.repository.UtilisateurRepository;
import com.ecodeli.model.ContratCommercant;
import com.ecodeli.model.Utilisateur;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class ContratCommercantService {

    @Autowired
    private ContratCommercantRepository contratRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    /**
     * Récupère le contrat d'un commerçant par son ID
     */
    public Optional<ContratCommercant> getContratByCommercantId(Long commercantId) {
        return contratRepository.findByCommercantId(commercantId);
    }

    /**
     * Vérifie si un commerçant a un contrat
     */
    public boolean hasContrat(Long commercantId) {
        return contratRepository.existsByCommercantId(commercantId);
    }

    /**
     * Récupère un contrat par son numéro
     */
    public Optional<ContratCommercant> getContratByNumero(String numeroContrat) {
        return contratRepository.findByNumeroContrat(numeroContrat);
    }

    /**
     * Crée un nouveau contrat pour un commerçant
     */
    @Transactional
    public ContratCommercant createContrat(ContratCommercant contrat, Long commercantId) {
        Optional<Utilisateur> utilisateur = utilisateurRepository.findById(commercantId);
        if (utilisateur.isEmpty()) {
            throw new RuntimeException("Utilisateur non trouvé avec l'ID : " + commercantId);
        }

        // Vérifier que l'utilisateur est bien un commerçant
        if (!"COMMERCANT".equals(utilisateur.get().getRole())) {
            throw new RuntimeException("L'utilisateur n'est pas un commerçant");
        }

        // Vérifier qu'il n'y a pas déjà un contrat pour ce commerçant
        if (contratRepository.existsByCommercantId(commercantId)) {
            throw new RuntimeException("Un contrat existe déjà pour ce commerçant");
        }

        contrat.setCommercant(utilisateur.get());
        return contratRepository.save(contrat);
    }

    /**
     * Met à jour un contrat existant
     */
    @Transactional
    public ContratCommercant updateContrat(Long contratId, ContratCommercant contratUpdated) {
        Optional<ContratCommercant> existingContrat = contratRepository.findById(contratId);
        if (existingContrat.isEmpty()) {
            throw new RuntimeException("Contrat non trouvé avec l'ID : " + contratId);
        }

        ContratCommercant contrat = existingContrat.get();
        
        // Mise à jour des champs modifiables
        if (contratUpdated.getDateFin() != null) {
            contrat.setDateFin(contratUpdated.getDateFin());
        }
        if (contratUpdated.getStatutContrat() != null) {
            contrat.setStatutContrat(contratUpdated.getStatutContrat());
        }
        if (contratUpdated.getCommissionPourcentage() != null) {
            contrat.setCommissionPourcentage(contratUpdated.getCommissionPourcentage());
        }
        if (contratUpdated.getAbonnementMensuel() != null) {
            contrat.setAbonnementMensuel(contratUpdated.getAbonnementMensuel());
        }
        if (contratUpdated.getLivraisonRapideIncluse() != null) {
            contrat.setLivraisonRapideIncluse(contratUpdated.getLivraisonRapideIncluse());
        }
        if (contratUpdated.getAssuranceIncluse() != null) {
            contrat.setAssuranceIncluse(contratUpdated.getAssuranceIncluse());
        }
        if (contratUpdated.getSupportPrioritaire() != null) {
            contrat.setSupportPrioritaire(contratUpdated.getSupportPrioritaire());
        }
        if (contratUpdated.getNombreLivraisonsMensuelles() != null) {
            contrat.setNombreLivraisonsMensuelles(contratUpdated.getNombreLivraisonsMensuelles());
        }
        if (contratUpdated.getUrlContratPdf() != null) {
            contrat.setUrlContratPdf(contratUpdated.getUrlContratPdf());
        }
        if (contratUpdated.getCheminContratPdf() != null) {
            contrat.setCheminContratPdf(contratUpdated.getCheminContratPdf());
        }

        return contratRepository.save(contrat);
    }

    /**
     * Supprime un contrat
     */
    @Transactional
    public void deleteContrat(Long contratId) {
        if (!contratRepository.existsById(contratId)) {
            throw new RuntimeException("Contrat non trouvé avec l'ID : " + contratId);
        }
        contratRepository.deleteById(contratId);
    }
}
