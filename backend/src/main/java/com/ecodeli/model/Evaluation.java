package com.ecodeli.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "evaluations")
public class Evaluation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @Column(name = "evaluateur_id", nullable = false)
    private Long evaluateurId; // Client qui note
    
    @NotNull
    @Column(name = "evalue_id", nullable = false)
    private Long evalueId; // Prestataire OU Livreur noté
    
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "service_type", nullable = false)
    private TypeService serviceType; // PRESTATION | LIVRAISON
    
    @NotNull
    @Column(name = "service_id", nullable = false)
    private Long serviceId; // prestationId OU livraisonId
    
    @NotNull
    @Min(1)
    @Max(5)
    @Column(name = "note", nullable = false)
    private Integer note; // 1-5
    
    @Column(name = "commentaire", length = 1000)
    private String commentaire; // Optionnel
    
    @Column(name = "date_evaluation", nullable = false)
    private LocalDateTime dateEvaluation;
    
    // Constructeurs
    public Evaluation() {
        this.dateEvaluation = LocalDateTime.now();
    }
    
    public Evaluation(Long evaluateurId, Long evalueId, TypeService serviceType, 
                     Long serviceId, Integer note, String commentaire) {
        this();
        this.evaluateurId = evaluateurId;
        this.evalueId = evalueId;
        this.serviceType = serviceType;
        this.serviceId = serviceId;
        this.note = note;
        this.commentaire = commentaire;
    }
    
    // Getters et Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getEvaluateurId() {
        return evaluateurId;
    }
    
    public void setEvaluateurId(Long evaluateurId) {
        this.evaluateurId = evaluateurId;
    }
    
    public Long getEvalueId() {
        return evalueId;
    }
    
    public void setEvalueId(Long evalueId) {
        this.evalueId = evalueId;
    }
    
    public TypeService getServiceType() {
        return serviceType;
    }
    
    public void setServiceType(TypeService serviceType) {
        this.serviceType = serviceType;
    }
    
    public Long getServiceId() {
        return serviceId;
    }
    
    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }
    
    public Integer getNote() {
        return note;
    }
    
    public void setNote(Integer note) {
        this.note = note;
    }
    
    public String getCommentaire() {
        return commentaire;
    }
    
    public void setCommentaire(String commentaire) {
        this.commentaire = commentaire;
    }
    
    public LocalDateTime getDateEvaluation() {
        return dateEvaluation;
    }
    
    public void setDateEvaluation(LocalDateTime dateEvaluation) {
        this.dateEvaluation = dateEvaluation;
    }
    
    // Méthodes utilitaires
    public boolean isEvaluationPrestation() {
        return TypeService.PRESTATION.equals(this.serviceType);
    }
    
    public boolean isEvaluationLivraison() {
        return TypeService.LIVRAISON.equals(this.serviceType);
    }
    
    @PrePersist
    protected void onCreate() {
        if (this.dateEvaluation == null) {
            this.dateEvaluation = LocalDateTime.now();
        }
    }
}
