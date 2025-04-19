package com.ecodeli.backend.service;

import com.ecodeli.backend.repository.UtilisateurRepository;
import com.ecodeli.model.Utilisateur;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;

    public UtilisateurService(UtilisateurRepository utilisateurRepository) {
        this.utilisateurRepository = utilisateurRepository;
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
}