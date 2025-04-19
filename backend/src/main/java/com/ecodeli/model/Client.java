package com.ecodeli.model;

import jakarta.persistence.Entity;
import lombok.Data;

@Data
@Entity
public class Client extends Utilisateur{
    private boolean tutorielVu;

    public boolean isTutorielVu() {
        return tutorielVu;
    }

}
