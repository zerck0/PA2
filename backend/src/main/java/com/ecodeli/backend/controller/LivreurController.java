package com.ecodeli.backend.controller;

import com.ecodeli.model.Livreur;
import com.ecodeli.backend.repository.LivreurRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/livreurs")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class LivreurController {

    private final LivreurRepository livreurRepository;

    public LivreurController(LivreurRepository livreurRepository) {
        this.livreurRepository = livreurRepository;
    }

    @GetMapping
    public List<Livreur> getAll() {
        return livreurRepository.findAll();
    }

    @PostMapping
    public Livreur create(@RequestBody Livreur livreur) {
        return livreurRepository.save(livreur);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        livreurRepository.deleteById(id);
    }

    @GetMapping("/count")
    public long countLivreurs() {
        return livreurRepository.count();
    }
}
