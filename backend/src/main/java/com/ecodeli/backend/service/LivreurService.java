package com.ecodeli.backend.service;

import com.ecodeli.backend.model.Livreur;
import com.ecodeli.backend.repository.LivreurRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LivreurService {

    private final LivreurRepository livreurRepository;

    public LivreurService(LivreurRepository livreurRepository) {
        this.livreurRepository = livreurRepository;
    }

    public List<Livreur> getAllLivreurs() {
        return livreurRepository.findAll();
    }

    public Optional<Livreur> getLivreurById(Long id) {
        return livreurRepository.findById(id);
    }

    public Livreur saveLivreur(Livreur livreur) {
        return livreurRepository.save(livreur);
    }

    public void deleteLivreur(Long id) {
        livreurRepository.deleteById(id);
    }
}
