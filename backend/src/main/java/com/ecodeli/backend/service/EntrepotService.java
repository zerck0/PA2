package com.ecodeli.backend.service;

import com.ecodeli.model.Entrepot;
import com.ecodeli.backend.repository.EntrepotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EntrepotService {

    @Autowired
    private EntrepotRepository entrepotRepository;

    public List<Entrepot> getAllEntrepots() {
        return entrepotRepository.findAll();
    }

    public List<Entrepot> getActiveEntrepots() {
        return entrepotRepository.findAllActiveOrderByVille();
    }

    public Optional<Entrepot> getEntrepotById(Long id) {
        return entrepotRepository.findById(id);
    }

    public Optional<Entrepot> getEntrepotByNom(String nom) {
        return entrepotRepository.findByNomIgnoreCase(nom);
    }

    public List<Entrepot> getEntrepotsByVille(String ville) {
        return entrepotRepository.findActiveByVille(ville);
    }

    public List<Entrepot> searchEntrepotsByVille(String ville) {
        return entrepotRepository.findByVilleContainingIgnoreCase(ville);
    }

    public Entrepot createEntrepot(Entrepot entrepot) {
        // Vérification que le nom n'existe pas déjà
        if (entrepotRepository.findByNomIgnoreCase(entrepot.getNom()).isPresent()) {
            throw new RuntimeException("Un entrepôt avec ce nom existe déjà");
        }
        
        // Valeurs par défaut
        if (entrepot.getCapaciteMax() == null) {
            entrepot.setCapaciteMax(100);
        }
        if (entrepot.getStatut() == null) {
            entrepot.setStatut(Entrepot.StatutEntrepot.ACTIF);
        }
        
        return entrepotRepository.save(entrepot);
    }

    public Entrepot updateEntrepot(Long id, Entrepot entrepotDetails) {
        return entrepotRepository.findById(id)
            .map(entrepot -> {
                entrepot.setNom(entrepotDetails.getNom());
                entrepot.setAdresse(entrepotDetails.getAdresse());
                entrepot.setVille(entrepotDetails.getVille());
                entrepot.setCodePostal(entrepotDetails.getCodePostal());
                entrepot.setResponsable(entrepotDetails.getResponsable());
                entrepot.setTelephone(entrepotDetails.getTelephone());
                entrepot.setEmail(entrepotDetails.getEmail());
                entrepot.setCapaciteMax(entrepotDetails.getCapaciteMax());
                entrepot.setStatut(entrepotDetails.getStatut());
                return entrepotRepository.save(entrepot);
            })
            .orElseThrow(() -> new RuntimeException("Entrepôt non trouvé avec l'ID: " + id));
    }

    public void deleteEntrepot(Long id) {
        if (!entrepotRepository.existsById(id)) {
            throw new RuntimeException("Entrepôt non trouvé avec l'ID: " + id);
        }
        entrepotRepository.deleteById(id);
    }

    public void desactiverEntrepot(Long id) {
        entrepotRepository.findById(id)
            .map(entrepot -> {
                entrepot.setStatut(Entrepot.StatutEntrepot.INACTIF);
                return entrepotRepository.save(entrepot);
            })
            .orElseThrow(() -> new RuntimeException("Entrepôt non trouvé avec l'ID: " + id));
    }

    public void activerEntrepot(Long id) {
        entrepotRepository.findById(id)
            .map(entrepot -> {
                entrepot.setStatut(Entrepot.StatutEntrepot.ACTIF);
                return entrepotRepository.save(entrepot);
            })
            .orElseThrow(() -> new RuntimeException("Entrepôt non trouvé avec l'ID: " + id));
    }

    // Statistiques
    public Long getCountActiveEntrepots() {
        return entrepotRepository.countActiveEntrepots();
    }

    public boolean entrepotExists(Long id) {
        return entrepotRepository.existsById(id);
    }

    public boolean entrepotIsActive(Long id) {
        return entrepotRepository.findById(id)
            .map(entrepot -> entrepot.getStatut() == Entrepot.StatutEntrepot.ACTIF)
            .orElse(false);
    }
}
