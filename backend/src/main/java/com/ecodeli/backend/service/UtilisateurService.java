package com.ecodeli.backend.service;

import com.ecodeli.backend.repository.UtilisateurRepository;
import com.ecodeli.model.Utilisateur;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UtilisateurService {
    
    @Autowired
    private UtilisateurRepository utilisateurRepository;
    
    public boolean existsByEmail(String email) {
        return utilisateurRepository.existsByEmail(email);
    }
    
    public Optional<Utilisateur> findByEmail(String email) {
        return utilisateurRepository.findByEmail(email);
    }
    
    public List<Utilisateur> getAllUtilisateurs() {
        return utilisateurRepository.findAll();
    }

    public Optional<Utilisateur> getUtilisateurById(Long id) {
        return utilisateurRepository.findById(id);
    }

    public List<Utilisateur> getUtilisateursByRole(String role) {
        return utilisateurRepository.findByRole(Utilisateur.Role.valueOf(role.toUpperCase()));
    }

    public void deleteUtilisateur(Long id) {
        utilisateurRepository.deleteById(id);
    }

    public long countUtilisateurs() {
        return utilisateurRepository.count();
    }

    public Utilisateur saveUtilisateur(Utilisateur utilisateur) {
        return utilisateurRepository.save(utilisateur);
    }
}