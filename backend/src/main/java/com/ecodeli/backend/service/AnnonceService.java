package com.ecodeli.backend.service;

import com.ecodeli.model.Annonce;
import com.ecodeli.backend.repository.AnnonceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class AnnonceService {
    
    @Autowired
    private AnnonceRepository annonceRepository;
    
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
}
