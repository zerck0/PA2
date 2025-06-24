package com.ecodeli.backend.service;

import com.ecodeli.model.Annonce;
import com.ecodeli.model.Livreur;
import com.ecodeli.backend.repository.AnnonceRepository;
import com.ecodeli.backend.repository.LivreurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class AnnonceService {
    
    @Autowired
    private AnnonceRepository annonceRepository;
    
    @Autowired
    private LivreurRepository livreurRepository;
    
    public List<Annonce> getAllActiveAnnonces() {
        return annonceRepository.findByStatutOrderByDateCreationDesc(Annonce.StatutAnnonce.ACTIVE);
    }
    
    public List<Annonce> getAnnoncesByAuteur(Long auteurId) {
        return annonceRepository.findByAuteurIdOrderByDateCreationDesc(auteurId);
    }
    
    public List<Annonce> searchAnnoncesByVille(String ville) {
        return annonceRepository.findActiveAnnoncesByVille(ville, Annonce.StatutAnnonce.ACTIVE);
    }
    
    public List<Annonce> getAnnoncesByType(Annonce.TypeAnnonce type) {
        return annonceRepository.findActiveAnnoncesByType(type, Annonce.StatutAnnonce.ACTIVE);
    }
    
    public Annonce createAnnonce(Annonce annonce) {
        return annonceRepository.save(annonce);
    }
    
    public Optional<Annonce> getAnnonceById(Long id) {
        return annonceRepository.findById(id);
    }
    
    public Annonce updateAnnonce(Annonce annonce) {
        return annonceRepository.save(annonce);
    }
    
    public void deleteAnnonce(Long id) {
        annonceRepository.deleteById(id);
    }
    
    public Optional<Annonce> assignerLivreur(Long annonceId, Long livreurId) {
        Optional<Annonce> annonceOpt = annonceRepository.findById(annonceId);
        if (annonceOpt.isEmpty()) {
            return Optional.empty();
        }
        
        Annonce annonce = annonceOpt.get();
        
        // Vérifier que l'annonce est disponible
        if (annonce.getStatut() != Annonce.StatutAnnonce.ACTIVE) {
            throw new IllegalStateException("Cette annonce n'est plus disponible");
        }
        
        // Récupérer le livreur par son ID
        Optional<Livreur> livreurOpt = livreurRepository.findById(livreurId);
        if (livreurOpt.isEmpty()) {
            throw new IllegalStateException("Livreur non trouvé");
        }
        
        // Assigner le livreur et changer le statut
        annonce.setLivreurAssigne(livreurOpt.get());
        annonce.setStatut(Annonce.StatutAnnonce.ASSIGNEE);
        
        return Optional.of(annonceRepository.save(annonce));
    }
    
    public List<Annonce> getAnnoncesByLivreur(Long livreurId) {
        return annonceRepository.findByLivreurAssigneIdOrderByDateCreationDesc(livreurId);
    }
}
