package com.ecodeli.model;

import jakarta.persistence.Entity;

@Entity
public class Client extends Utilisateur{
    private boolean tutorielVu;

    public boolean isTutorielVu() {
        return tutorielVu;
    }

    public void setTutorielVu(boolean tutorielVu) {
        this.tutorielVu = tutorielVu;
    }
}
