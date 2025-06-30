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

    // === CRÉATION DE LIVRAISONS ===

    public Livraison creerLivraisonComplete(Long annonceId, Long livreurId) {
        Annonce annonce = annonceRepository.findById(annonceId)
            .orElseThrow(() -> new RuntimeException("Annonce non trouvée"));
        
        Livreur livreur = livreurRepository.findById(livreurId)
            .orElseThrow(() -> new RuntimeException("Livreur non trouvé"));

        // Modifier le statut de l'annonce pour qu'elle disparaisse de la liste globale
        annonce.setStatut(Annonce.StatutAnnonce.ASSIGNEE);
        annonceRepository.save(annonce);

        Livraison livraison = new Livraison();
        livraison.setAnnonce(annonce);
        livraison.setLivreur(livreur);
        livraison.setTypeLivraison(Livraison.TypeLivraison.COMPLETE);
        livraison.setAdresseDepart(annonce.getAdresseDepart());
        livraison.setAdresseArrivee(annonce.getAdresseArrivee());
        livraison.setStatut(Livraison.StatutLivraison.ASSIGNEE); // Statut ASSIGNEE d'abord
        livraison.setOrdre(1);
        livraison.setCodeValidation(genererCodeValidation());

        Livraison livraisonSauvee = livraisonRepository.save(livraison);
        
        // Envoyer email avec code de validation au client
        envoyerEmailCodeValidation(livraisonSauvee);

        return livraisonSauvee;
    }

    public Livraison creerLivraisonPartielleDepot(Long annonceId, Long livreurId, Long entrepotId) {
        Annonce annonce = annonceRepository.findById(annonceId)
            .orElseThrow(() -> new RuntimeException("Annonce non trouvée"));
        
        Livreur livreur = livreurRepository.findById(livreurId)
            .orElseThrow(() -> new RuntimeException("Livreur non trouvé"));

        Entrepot entrepot = entrepotRepository.findById(entrepotId)
            .orElseThrow(() -> new RuntimeException("Entrepôt non trouvé"));

        // Modifier l'annonce : statut EN_COURS et nouveau point de départ = entrepôt
        annonce.setStatut(Annonce.StatutAnnonce.EN_COURS);
        annonce.setAdresseDepart(entrepot.getAdresse());
        annonceRepository.save(annonce);

        Livraison livraison = new Livraison();
        livraison.setAnnonce(annonce);
        livraison.setLivreur(livreur);
        livraison.setEntrepot(entrepot);
        livraison.setTypeLivraison(Livraison.TypeLivraison.PARTIELLE_DEPOT);
        livraison.setAdresseDepart(annonce.getAdresseDepart()); // Adresse originale
        livraison.setAdresseArrivee(entrepot.getAdresse());
        livraison.setStatut(Livraison.StatutLivraison.EN_COURS);
        livraison.setDateDebut(LocalDateTime.now());
        livraison.setOrdre(1);
        livraison.setCodeValidation(genererCodeValidation());

        return livraisonRepository.save(livraison);
    }

    public Livraison creerLivraisonPartielleRetrait(Long annonceId, Long livreurId, Long entrepotId) {
        Annonce annonce = annonceRepository.findById(annonceId)
            .orElseThrow(() -> new RuntimeException("Annonce non trouvée"));
        
        Livreur livreur = livreurRepository.findById(livreurId)
            .orElseThrow(() -> new RuntimeException("Livreur non trouvé"));

        Entrepot entrepot = entrepotRepository.findById(entrepotId)
            .orElseThrow(() -> new RuntimeException("Entrepôt non trouvé"));

        Livraison livraison = new Livraison();
        livraison.setAnnonce(annonce);
        livraison.setLivreur(livreur);
        livraison.setEntrepot(entrepot);
        livraison.setTypeLivraison(Livraison.TypeLivraison.PARTIELLE_RETRAIT);
        livraison.setAdresseDepart(entrepot.getAdresse());
        livraison.setAdresseArrivee(annonce.getAdresseArrivee());
        livraison.setStatut(Livraison.StatutLivraison.EN_COURS);
        livraison.setDateDebut(LocalDateTime.now());
        livraison.setOrdre(2);
        livraison.setCodeValidation(genererCodeValidation());

        return livraisonRepository.save(livraison);
    }

    // === NOUVELLES MÉTHODES POUR LE WORKFLOW ===

    /**
     * Démarrer une livraison (passer de ASSIGNEE à EN_COURS)
     */
    public Livraison commencerLivraison(Long livraisonId) {
        Livraison livraison = livraisonRepository.findById(livraisonId)
            .orElseThrow(() -> new RuntimeException("Livraison non trouvée"));

        if (livraison.getStatut() != Livraison.StatutLivraison.ASSIGNEE) {
            throw new RuntimeException("Cette livraison ne peut pas être démarrée (statut: " + livraison.getStatut() + ")");
        }

        livraison.setStatut(Livraison.StatutLivraison.EN_COURS);
        livraison.setDateDebut(LocalDateTime.now());

        // Mettre à jour le statut de l'annonce
        Annonce annonce = livraison.getAnnonce();
        annonce.setStatut(Annonce.StatutAnnonce.EN_COURS);
        annonceRepository.save(annonce);

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

        // Vérifier si il n'y a pas déjà une livraison partielle dépôt pour cette annonce
        List<Livraison> livraisonsExistantes = livraisonRepository.findByAnnonceId(annonceId);
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

        // Vérifier si il n'y a pas déjà une livraison partielle retrait pour cette annonce
        List<Livraison> livraisonsExistantes = livraisonRepository.findByAnnonceId(annonceId);
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

        // Si c'est une livraison partielle dépôt terminée, créer automatiquement la 2ème partie
        if (livraison.getTypeLivraison() == Livraison.TypeLivraison.PARTIELLE_DEPOT && 
            nouveauStatut == Livraison.StatutLivraison.STOCKEE) {
            creerDeuxiemePartiePartielle(livraison);
        }

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
