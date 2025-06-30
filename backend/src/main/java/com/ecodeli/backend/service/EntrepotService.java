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

    /**
     * Trouve l'entrepôt le plus proche d'une ville donnée
     * Pour l'instant, logique simple basée sur les villes principales
     */
    public Optional<Entrepot> getEntrepotPlusProche(String villeDestination) {
        String ville = villeDestination.toLowerCase().trim();
        
        // Mapping simple des villes vers les entrepôts les plus proches
        String entrepotCible;
        
        if (ville.contains("paris") || ville.contains("versailles") || ville.contains("boulogne")) {
            entrepotCible = "paris";
        } else if (ville.contains("marseille") || ville.contains("aix") || ville.contains("toulon")) {
            entrepotCible = "marseille";
        } else if (ville.contains("lyon") || ville.contains("villeurbanne") || ville.contains("saint-étienne")) {
            entrepotCible = "lyon";
        } else if (ville.contains("lille") || ville.contains("roubaix") || ville.contains("tourcoing") || ville.contains("valenciennes")) {
            entrepotCible = "lille";
        } else if (ville.contains("montpellier") || ville.contains("nîmes") || ville.contains("béziers")) {
            entrepotCible = "montpellier";
        } else if (ville.contains("rennes") || ville.contains("brest") || ville.contains("quimper") || ville.contains("saint-brieuc")) {
            entrepotCible = "rennes";
        } else {
            // Par défaut, retourner Paris
            entrepotCible = "paris";
        }
        
        return entrepotRepository.findByVilleContainingIgnoreCase(entrepotCible)
            .stream()
            .filter(e -> e.getStatut() == Entrepot.StatutEntrepot.ACTIF)
            .findFirst();
    }

    /**
     * Retourne la liste des entrepôts avec leurs informations pour le choix de livraison partielle
     */
    public List<Entrepot> getEntrepotsDisponiblesPourLivraison() {
        return entrepotRepository.findAllActiveOrderByVille();
    }
}
