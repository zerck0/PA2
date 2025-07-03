package com.ecodeli.backend.service;

import com.ecodeli.model.Livraison;
import com.ecodeli.model.Annonce;
import com.ecodeli.model.Livreur;
import com.ecodeli.model.Entrepot;
import com.ecodeli.backend.repository.LivraisonRepository;
import com.ecodeli.backend.repository.AnnonceRepository;
import com.ecodeli.backend.repository.LivreurRepository;
import com.ecodeli.backend.repository.EntrepotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class LivraisonService {

    @Autowired
    private LivraisonRepository livraisonRepository;

    @Autowired
    private AnnonceRepository annonceRepository;

    @Autowired
    private LivreurRepository livreurRepository;

    @Autowired
    private EntrepotRepository entrepotRepository;

    @Autowired
    private EmailService emailService;

    // === NOUVEAU WORKFLOW SIMPLIFIÉ ===

    /**
     * Créer une livraison complète
     */
    public Livraison creerLivraisonComplete(Long annonceId, Long livreurId) {
        Annonce annonce = annonceRepository.findById(annonceId)
            .orElseThrow(() -> new RuntimeException("Annonce non trouvée"));
        
        Livreur livreur = livreurRepository.findById(livreurId)
            .orElseThrow(() -> new RuntimeException("Livreur non trouvé"));

        // Vérifier qu'il n'y a pas déjà des segments partiels
        List<Livraison> livraisonsExistantes = livraisonRepository.findByAnnonceId(annonceId);
        boolean aDesSegmentsPartiels = livraisonsExistantes.stream()
            .anyMatch(l -> l.isPartielle());
        
        if (aDesSegmentsPartiels) {
            throw new RuntimeException("Impossible de créer une livraison complète : des segments de livraison partielle existent déjà pour cette annonce");
        }

        // Marquer l'annonce comme assignée
        annonce.setStatut(Annonce.StatutAnnonce.ASSIGNEE);
        annonceRepository.save(annonce);

        // Créer la livraison complète
        Livraison livraison = new Livraison();
        livraison.setAnnonce(annonce);
        livraison.setLivreur(livreur);
        livraison.setEstPartielle(false);  // NOUVEAU : livraison complète
        livraison.setSegmentOrdre(null);   // NOUVEAU : pas de segment
        livraison.setAdresseDepart(annonce.getAdresseDepart());
        livraison.setAdresseArrivee(annonce.getAdresseArrivee());
        livraison.setStatut(Livraison.StatutLivraison.ASSIGNEE);
        livraison.setCodeValidation(genererCodeValidation());

        // Compatibilité avec l'ancien système
        livraison.setTypeLivraison(Livraison.TypeLivraison.COMPLETE);
        livraison.setOrdre(1);

        Livraison livraisonSauvee = livraisonRepository.save(livraison);
        envoyerEmailCodeValidation(livraisonSauvee);

        return livraisonSauvee;
    }

    /**
     * Créer un segment de livraison partielle (dépôt ou retrait)
     */
    public Livraison creerLivraisonPartielle(Long annonceId, Long livreurId, Integer segmentOrdre, Long entrepotId) {
        System.out.println("=== CRÉATION SEGMENT PARTIEL ===");
        System.out.println("Annonce: " + annonceId + " | Livreur: " + livreurId + " | Segment: " + segmentOrdre);

        // Validation des paramètres
        if (segmentOrdre == null || (segmentOrdre != 1 && segmentOrdre != 2)) {
            throw new RuntimeException("Segment ordre doit être 1 (dépôt) ou 2 (retrait)");
        }

        Annonce annonce = annonceRepository.findById(annonceId)
            .orElseThrow(() -> new RuntimeException("Annonce non trouvée"));
        
        Livreur livreur = livreurRepository.findById(livreurId)
            .orElseThrow(() -> new RuntimeException("Livreur non trouvé"));

        Entrepot entrepot = entrepotRepository.findById(entrepotId)
            .orElseThrow(() -> new RuntimeException("Entrepôt non trouvé"));

        // Vérifications de conflit
        List<Livraison> livraisonsExistantes = livraisonRepository.findByAnnonceId(annonceId);
        
        // Vérifier qu'il n'y a pas de livraison complète
        boolean aLivraisonComplete = livraisonsExistantes.stream()
            .anyMatch(l -> l.isComplete());
        
        if (aLivraisonComplete) {
            throw new RuntimeException("Impossible de créer un segment partiel : une livraison complète existe déjà");
        }

        // Vérifier qu'il n'y a pas déjà ce segment
        boolean segmentExiste = livraisonsExistantes.stream()
            .anyMatch(l -> l.isPartielle() && segmentOrdre.equals(l.getSegmentOrdre()));
        
        if (segmentExiste) {
            throw new RuntimeException("Le segment " + (segmentOrdre == 1 ? "dépôt" : "retrait") + " existe déjà pour cette annonce");
        }

        // Créer la livraison partielle
        Livraison livraison = new Livraison();
        livraison.setAnnonce(annonce);
        livraison.setLivreur(livreur);
        livraison.setEntrepot(entrepot);
        livraison.setEstPartielle(true);    // NOUVEAU : livraison partielle
        livraison.setSegmentOrdre(segmentOrdre); // NOUVEAU : ordre du segment
        livraison.setStatut(Livraison.StatutLivraison.ASSIGNEE);
        livraison.setCodeValidation(genererCodeValidation());

        // Adresses selon le segment
        if (segmentOrdre == 1) { // Dépôt
            livraison.setAdresseDepart(annonce.getAdresseDepart());
            livraison.setAdresseArrivee(entrepot.getAdresse());
            // Compatibilité
            livraison.setTypeLivraison(Livraison.TypeLivraison.PARTIELLE_DEPOT);
            livraison.setOrdre(1);
        } else { // Retrait
            livraison.setAdresseDepart(entrepot.getAdresse());
            livraison.setAdresseArrivee(annonce.getAdresseArrivee());
            // Compatibilité
            livraison.setTypeLivraison(Livraison.TypeLivraison.PARTIELLE_RETRAIT);
            livraison.setOrdre(2);
        }

        Livraison livraisonSauvee = livraisonRepository.save(livraison);

        // Vérifier si les deux segments sont maintenant assignés
        verifierEtActiverLivraisonPartielle(annonceId);
        
        envoyerEmailCodeValidation(livraisonSauvee);

        System.out.println("Segment " + segmentOrdre + " créé avec succès pour l'annonce " + annonceId);
        return livraisonSauvee;
    }

    // Anciennes méthodes supprimées - remplacées par prendreEnChargeAnnonce()
    // qui utilise creerLivraisonPartielleDepotNouveau() et creerLivraisonPartielleRetraitNouveau()

    // === NOUVELLES MÉTHODES POUR LE WORKFLOW ===

    /**
     * Démarrer une livraison (passer de ASSIGNEE à EN_COURS)
     * NOUVELLE VERSION SIMPLIFIÉE
     */
    public Livraison commencerLivraison(Long livraisonId) {
        System.out.println("=== COMMENCER LIVRAISON (NOUVEAU WORKFLOW) ===");
        
        Livraison livraison = livraisonRepository.findById(livraisonId)
            .orElseThrow(() -> new RuntimeException("Livraison non trouvée"));

        System.out.println("Livraison - ID: " + livraison.getId() + 
                          ", Partielle: " + livraison.isPartielle() + 
                          ", Segment: " + livraison.getSegmentOrdre() + 
                          ", Statut: " + livraison.getStatut());

        if (livraison.getStatut() != Livraison.StatutLivraison.ASSIGNEE) {
            throw new RuntimeException("Cette livraison ne peut pas être démarrée (statut: " + livraison.getStatut() + ")");
        }

        // Pour les livraisons partielles, vérifications de coordination
        if (livraison.isPartielle()) {
            System.out.println("Livraison partielle - Vérifications de coordination...");
            
            // Vérifier que tous les segments sont assignés
            if (!tousLesSegmentsSontAssignes(livraison.getAnnonce().getId())) {
                throw new RuntimeException("Impossible de commencer : tous les segments ne sont pas encore assignés");
            }
            
            // Pour le segment 2 (retrait), vérifier que le segment 1 (dépôt) est terminé
            if (livraison.isSegmentRetrait()) {
                if (!segment1EstTermine(livraison.getAnnonce().getId())) {
                    throw new RuntimeException("Impossible de commencer le retrait : le dépôt n'est pas encore terminé");
                }
            }
        }

        // Démarrer la livraison
        livraison.setStatut(Livraison.StatutLivraison.EN_COURS);
        livraison.setDateDebut(LocalDateTime.now());

        // Mettre à jour le statut de l'annonce
        Annonce annonce = livraison.getAnnonce();
        annonce.setStatut(Annonce.StatutAnnonce.EN_COURS);
        annonceRepository.save(annonce);

        System.out.println("Livraison démarrée avec succès !");
        return livraisonRepository.save(livraison);
    }

    /**
     * Prendre en charge une annonce avec choix du type de livraison
     */
    public Livraison prendreEnChargeAnnonce(Long annonceId, Long livreurId, String typeLivraison, Long entrepotId) {
        Annonce annonce = annonceRepository.findById(annonceId)
            .orElseThrow(() -> new RuntimeException("Annonce non trouvée"));

        if (annonce.getStatut() != Annonce.StatutAnnonce.ACTIVE) {
            throw new RuntimeException("Cette annonce n'est plus disponible");
        }

        switch (typeLivraison.toUpperCase()) {
            case "COMPLETE":
                return creerLivraisonComplete(annonceId, livreurId);
            case "PARTIELLE_DEPOT":
                if (entrepotId == null) {
                    throw new RuntimeException("Entrepôt requis pour une livraison partielle");
                }
                return creerLivraisonPartielleDepotNouveau(annonceId, livreurId, entrepotId);
            case "PARTIELLE_RETRAIT":
                if (entrepotId == null) {
                    throw new RuntimeException("Entrepôt requis pour une livraison partielle");
                }
                return creerLivraisonPartielleRetraitNouveau(annonceId, livreurId, entrepotId);
            default:
                throw new RuntimeException("Type de livraison non reconnu: " + typeLivraison);
        }
    }

    /**
     * Créer une livraison partielle dépôt selon le nouveau workflow
     */
    private Livraison creerLivraisonPartielleDepotNouveau(Long annonceId, Long livreurId, Long entrepotId) {
        Annonce annonce = annonceRepository.findById(annonceId)
            .orElseThrow(() -> new RuntimeException("Annonce non trouvée"));
        
        Livreur livreur = livreurRepository.findById(livreurId)
            .orElseThrow(() -> new RuntimeException("Livreur non trouvé"));

        Entrepot entrepot = entrepotRepository.findById(entrepotId)
            .orElseThrow(() -> new RuntimeException("Entrepôt non trouvé"));

        // Vérifications de conflit de types de livraison
        List<Livraison> livraisonsExistantes = livraisonRepository.findByAnnonceId(annonceId);
        
        // VALIDATION CRUCIALE : Vérifier qu'il n'y a pas déjà une livraison complète
        boolean aUnelivraisonComplete = livraisonsExistantes.stream()
            .anyMatch(l -> l.getTypeLivraison() == Livraison.TypeLivraison.COMPLETE);
        
        if (aUnelivraisonComplete) {
            throw new RuntimeException("Impossible de créer un segment partiel : une livraison complète existe déjà pour cette annonce");
        }
        
        // Vérifier si il n'y a pas déjà une livraison partielle dépôt pour cette annonce
        boolean depotExiste = livraisonsExistantes.stream()
            .anyMatch(l -> l.getTypeLivraison() == Livraison.TypeLivraison.PARTIELLE_DEPOT);

        if (depotExiste) {
            throw new RuntimeException("Une livraison partielle dépôt existe déjà pour cette annonce");
        }

        Livraison livraison = new Livraison();
        livraison.setAnnonce(annonce);
        livraison.setLivreur(livreur);
        livraison.setEntrepot(entrepot);
        livraison.setTypeLivraison(Livraison.TypeLivraison.PARTIELLE_DEPOT);
        livraison.setAdresseDepart(annonce.getAdresseDepart());
        livraison.setAdresseArrivee(entrepot.getAdresse());
        livraison.setStatut(Livraison.StatutLivraison.ASSIGNEE);
        livraison.setOrdre(1);
        livraison.setCodeValidation(genererCodeValidation());

        Livraison livraisonSauvee = livraisonRepository.save(livraison);

        // Vérifier si les deux parties sont maintenant disponibles
        verifierEtActiverLivraisonPartielle(annonceId);

        return livraisonSauvee;
    }

    /**
     * Créer une livraison partielle retrait selon le nouveau workflow
     */
    private Livraison creerLivraisonPartielleRetraitNouveau(Long annonceId, Long livreurId, Long entrepotId) {
        Annonce annonce = annonceRepository.findById(annonceId)
            .orElseThrow(() -> new RuntimeException("Annonce non trouvée"));
        
        Livreur livreur = livreurRepository.findById(livreurId)
            .orElseThrow(() -> new RuntimeException("Livreur non trouvé"));

        Entrepot entrepot = entrepotRepository.findById(entrepotId)
            .orElseThrow(() -> new RuntimeException("Entrepôt non trouvé"));

        // Vérifications de conflit de types de livraison
        List<Livraison> livraisonsExistantes = livraisonRepository.findByAnnonceId(annonceId);
        
        // VALIDATION CRUCIALE : Vérifier qu'il n'y a pas déjà une livraison complète
        boolean aUnelivraisonComplete = livraisonsExistantes.stream()
            .anyMatch(l -> l.getTypeLivraison() == Livraison.TypeLivraison.COMPLETE);
        
        if (aUnelivraisonComplete) {
            throw new RuntimeException("Impossible de créer un segment partiel : une livraison complète existe déjà pour cette annonce");
        }
        
        // Vérifier si il n'y a pas déjà une livraison partielle retrait pour cette annonce
        boolean retraitExiste = livraisonsExistantes.stream()
            .anyMatch(l -> l.getTypeLivraison() == Livraison.TypeLivraison.PARTIELLE_RETRAIT);

        if (retraitExiste) {
            throw new RuntimeException("Une livraison partielle retrait existe déjà pour cette annonce");
        }

        Livraison livraison = new Livraison();
        livraison.setAnnonce(annonce);
        livraison.setLivreur(livreur);
        livraison.setEntrepot(entrepot);
        livraison.setTypeLivraison(Livraison.TypeLivraison.PARTIELLE_RETRAIT);
        livraison.setAdresseDepart(entrepot.getAdresse());
        livraison.setAdresseArrivee(annonce.getAdresseArrivee());
        livraison.setStatut(Livraison.StatutLivraison.ASSIGNEE);
        livraison.setOrdre(2);
        livraison.setCodeValidation(genererCodeValidation());

        Livraison livraisonSauvee = livraisonRepository.save(livraison);

        // Vérifier si les deux parties sont maintenant disponibles
        verifierEtActiverLivraisonPartielle(annonceId);

        return livraisonSauvee;
    }

    /**
     * Vérifier si les deux segments d'une livraison partielle sont pris et activer si c'est le cas
     */
    private void verifierEtActiverLivraisonPartielle(Long annonceId) {
        List<Livraison> livraisons = livraisonRepository.findByAnnonceId(annonceId);
        
        boolean depotAssigne = livraisons.stream()
            .anyMatch(l -> l.getTypeLivraison() == Livraison.TypeLivraison.PARTIELLE_DEPOT && l.getLivreur() != null);
        
        boolean retraitAssigne = livraisons.stream()
            .anyMatch(l -> l.getTypeLivraison() == Livraison.TypeLivraison.PARTIELLE_RETRAIT && l.getLivreur() != null);

        if (depotAssigne && retraitAssigne) {
            // Les deux segments sont pris, mettre l'annonce en ASSIGNEE
            Annonce annonce = annonceRepository.findById(annonceId)
                .orElseThrow(() -> new RuntimeException("Annonce non trouvée"));
            
            annonce.setStatut(Annonce.StatutAnnonce.ASSIGNEE);
            annonceRepository.save(annonce);

            System.out.println("Livraison partielle complètement assignée pour l'annonce " + annonceId);
        }
    }

    // === GESTION DES STATUTS ===

    public Livraison terminerLivraison(Long livraisonId, String codeValidation) {
        Livraison livraison = livraisonRepository.findById(livraisonId)
            .orElseThrow(() -> new RuntimeException("Livraison non trouvée"));

        if (!livraison.getCodeValidation().equals(codeValidation)) {
            throw new RuntimeException("Code de validation incorrect");
        }

        // Déterminer le statut final selon le type de livraison
        Livraison.StatutLivraison nouveauStatut = livraison.getTypeLivraison() == Livraison.TypeLivraison.PARTIELLE_DEPOT
            ? Livraison.StatutLivraison.STOCKEE
            : Livraison.StatutLivraison.LIVREE;

        livraison.setStatut(nouveauStatut);
        livraison.setDateFin(LocalDateTime.now());

        Livraison livraisonTerminee = livraisonRepository.save(livraison);

        // NOTE: Création automatique désactivée - dans le nouveau workflow,
        // les deux segments sont créés manuellement par des livreurs distincts
        // if (livraison.getTypeLivraison() == Livraison.TypeLivraison.PARTIELLE_DEPOT && 
        //     nouveauStatut == Livraison.StatutLivraison.STOCKEE) {
        //     creerDeuxiemePartiePartielle(livraison);
        // }

        return livraisonTerminee;
    }

    /**
     * Crée automatiquement la 2ème partie d'une livraison partielle (retrait de l'entrepôt)
     */
    private void creerDeuxiemePartiePartielle(Livraison premierePartie) {
        try {
            Livraison deuxiemePartie = new Livraison();
            deuxiemePartie.setAnnonce(premierePartie.getAnnonce());
            // Pas de livreur assigné initialement - sera visible dans les annonces disponibles
            deuxiemePartie.setLivreur(null);
            deuxiemePartie.setEntrepot(premierePartie.getEntrepot());
            deuxiemePartie.setTypeLivraison(Livraison.TypeLivraison.PARTIELLE_RETRAIT);
            deuxiemePartie.setAdresseDepart(premierePartie.getEntrepot().getAdresse());
            deuxiemePartie.setAdresseArrivee(premierePartie.getAnnonce().getAdresseArrivee());
            deuxiemePartie.setStatut(Livraison.StatutLivraison.EN_COURS);
            deuxiemePartie.setDateDebut(LocalDateTime.now());
            deuxiemePartie.setOrdre(2);
            deuxiemePartie.setCodeValidation(genererCodeValidation());
            deuxiemePartie.setPrixConvenu(premierePartie.getPrixConvenu()); // Même prix ou répartition

            livraisonRepository.save(deuxiemePartie);

            System.out.println("Deuxième partie de livraison créée automatiquement: " + deuxiemePartie.getId());
        } catch (Exception e) {
            System.err.println("Erreur lors de la création de la 2ème partie: " + e.getMessage());
            // On ne fait pas échouer la transaction principale si la création de la 2ème partie échoue
        }
    }

    public Livraison annulerLivraison(Long livraisonId) {
        return changerStatutLivraison(livraisonId, Livraison.StatutLivraison.ANNULEE);
    }

    public Livraison assignerLivreur(Long livraisonId, Long livreurId) {
        Livraison livraison = livraisonRepository.findById(livraisonId)
            .orElseThrow(() -> new RuntimeException("Livraison non trouvée"));
        
        Livreur livreur = livreurRepository.findById(livreurId)
            .orElseThrow(() -> new RuntimeException("Livreur non trouvé"));

        if (livraison.getLivreur() != null) {
            throw new RuntimeException("Cette livraison a déjà un livreur assigné");
        }

        livraison.setLivreur(livreur);
        return livraisonRepository.save(livraison);
    }

    private Livraison changerStatutLivraison(Long livraisonId, Livraison.StatutLivraison nouveauStatut) {
        Livraison livraison = livraisonRepository.findById(livraisonId)
            .orElseThrow(() -> new RuntimeException("Livraison non trouvée"));
        
        livraison.setStatut(nouveauStatut);
        return livraisonRepository.save(livraison);
    }

    // === CONSULTATION ===

    public List<Livraison> getLivraisonsDisponibles() {
        return livraisonRepository.findLivraisonsDisponibles();
    }

    public List<Livraison> getLivraisonsByLivreur(Long livreurId) {
        return livraisonRepository.findByLivreurId(livreurId);
    }

    public List<Livraison> getLivraisonsEnCoursByLivreur(Long livreurId) {
        return livraisonRepository.findLivraisonsEnCoursByLivreur(livreurId);
    }

    public List<Livraison> getLivraisonsByAnnonce(Long annonceId) {
        return livraisonRepository.findByAnnonceId(annonceId);
    }

    public List<Livraison> getColisStockesInEntrepot(Long entrepotId) {
        return livraisonRepository.findColisStockesInEntrepot(entrepotId);
    }

    public Optional<Livraison> getLivraisonById(Long id) {
        return livraisonRepository.findById(id);
    }

    public Optional<Livraison> getLivraisonByCodeValidation(String codeValidation) {
        return livraisonRepository.findByCodeValidation(codeValidation);
    }

    // === UTILITAIRES ===

    private String genererCodeValidation() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    public boolean annonceHasLivraisons(Long annonceId) {
        return livraisonRepository.hasLivraisonsByAnnonce(annonceId);
    }

    // === NOUVELLES MÉTHODES UTILITAIRES SIMPLIFIÉES ===

    /**
     * Vérifie si tous les segments (1 et 2) d'une livraison partielle sont assignés
     */
    private boolean tousLesSegmentsSontAssignes(Long annonceId) {
        List<Livraison> livraisons = livraisonRepository.findByAnnonceId(annonceId);
        
        System.out.println("  >> Vérification segments pour annonce " + annonceId + ":");
        for (Livraison l : livraisons) {
            System.out.println("    - Livraison " + l.getId() + 
                             " | Partielle: " + l.isPartielle() + 
                             " | Segment: " + l.getSegmentOrdre() + 
                             " | Livreur: " + (l.getLivreur() != null ? l.getLivreur().getId() : "null"));
        }
        
        boolean segment1Assigne = livraisons.stream()
            .anyMatch(l -> l.isPartielle() && Integer.valueOf(1).equals(l.getSegmentOrdre()) && l.getLivreur() != null);
        
        boolean segment2Assigne = livraisons.stream()
            .anyMatch(l -> l.isPartielle() && Integer.valueOf(2).equals(l.getSegmentOrdre()) && l.getLivreur() != null);

        System.out.println("  >> Résultat: Segment 1=" + segment1Assigne + ", Segment 2=" + segment2Assigne);
        return segment1Assigne && segment2Assigne;
    }
    
    /**
     * Vérifie si le segment 1 (dépôt) est terminé (statut STOCKEE)
     */
    private boolean segment1EstTermine(Long annonceId) {
        List<Livraison> livraisons = livraisonRepository.findByAnnonceId(annonceId);
        
        System.out.println("  >> Vérification segment 1 terminé pour annonce " + annonceId + ":");
        
        boolean termine = livraisons.stream()
            .anyMatch(l -> l.isPartielle() && 
                          Integer.valueOf(1).equals(l.getSegmentOrdre()) && 
                          l.getStatut() == Livraison.StatutLivraison.STOCKEE);
        
        System.out.println("  >> Segment 1 terminé (STOCKEE): " + termine);
        return termine;
    }

    // === MÉTHODES DE COMPATIBILITÉ (ANCIEN WORKFLOW) ===

    /**
     * Vérifie si tous les segments d'une livraison partielle sont assignés (ANCIEN)
     */
    private boolean sontTousLesSegmentsAssignes(Long annonceId) {
        // Rediriger vers la nouvelle méthode
        return tousLesSegmentsSontAssignes(annonceId);
    }
    
    /**
     * Vérifie si le segment dépôt est terminé (ANCIEN)
     */
    private boolean segmentDepotEstTermine(Long annonceId) {
        // Rediriger vers la nouvelle méthode
        return segment1EstTermine(annonceId);
    }

    // === STATISTIQUES ===

    public Long getCountLivraisonsByStatut(Livraison.StatutLivraison statut) {
        return livraisonRepository.countByStatut(statut);
    }

    public Long getCountLivraisonsByType(Livraison.TypeLivraison type) {
        return livraisonRepository.countByType(type);
    }

    // === ENVOI D'EMAILS ===

    /**
     * Envoie un email avec le code de validation au client
     */
    private void envoyerEmailCodeValidation(Livraison livraison) {
        try {
            String emailClient = livraison.getAnnonce().getAuteur().getEmail();
            String nomClient = livraison.getAnnonce().getAuteur().getPrenom() + " " + livraison.getAnnonce().getAuteur().getNom();
            String nomLivreur = livraison.getLivreur().getPrenom() + " " + livraison.getLivreur().getNom();
            
            String sujet = "EcoDeli - Votre livraison a été prise en charge";
            
            String contenu = String.format(
                "Bonjour %s,\n\n" +
                "Bonne nouvelle ! Votre annonce \"%s\" a été prise en charge par %s.\n\n" +
                "Détails de la livraison :\n" +
                "- De : %s\n" +
                "- Vers : %s\n" +
                "- Type : %s\n\n" +
                "CODE DE VALIDATION : %s\n\n" +
                "Vous devrez communiquer ce code au livreur lors de la remise du colis pour confirmer la livraison.\n\n" +
                "Gardez ce code précieusement !\n\n" +
                "Cordialement,\n" +
                "L'équipe EcoDeli",
                nomClient,
                livraison.getAnnonce().getTitre(),
                nomLivreur,
                livraison.getAdresseDepart(),
                livraison.getAdresseArrivee(),
                getTypeLivraisonLibelle(livraison.getTypeLivraison()),
                livraison.getCodeValidation()
            );

            emailService.envoyerEmail(emailClient, sujet, contenu);
            
            System.out.println("Email de code de validation envoyé à : " + emailClient);
        } catch (Exception e) {
            System.err.println("Erreur lors de l'envoi de l'email de validation : " + e.getMessage());
            // On ne fait pas échouer la transaction si l'email ne peut pas être envoyé
        }
    }

    /**
     * Retourne le libellé du type de livraison
     */
    private String getTypeLivraisonLibelle(Livraison.TypeLivraison type) {
        switch (type) {
            case COMPLETE:
                return "Livraison complète";
            case PARTIELLE_DEPOT:
                return "Livraison partielle - Dépôt en entrepôt";
            case PARTIELLE_RETRAIT:
                return "Livraison partielle - Retrait d'entrepôt";
            default:
                return type.toString();
        }
    }
}
