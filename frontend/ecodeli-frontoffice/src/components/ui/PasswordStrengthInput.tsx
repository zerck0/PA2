import React, { useMemo } from 'react';
import Input from './Input';

interface PasswordStrengthInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
}

const PasswordStrengthInput: React.FC<PasswordStrengthInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required = false
}) => {
  
  // Validation du mot de passe en temps réel
  const validation = useMemo((): PasswordValidation => {
    const minLength = value.length >= 8;
    const hasUppercase = /[A-Z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    
    const validCount = [minLength, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;
    const isValid = validCount === 4;
    
    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (validCount >= 4) strength = 'strong';
    else if (validCount >= 2) strength = 'medium';
    
    return {
      minLength,
      hasUppercase,
      hasNumber,
      hasSpecial,
      isValid,
      strength
    };
  }, [value]);

  // Couleurs pour la barre de progression
  const getStrengthColor = () => {
    switch (validation.strength) {
      case 'strong': return 'success';
      case 'medium': return 'warning';
      default: return 'danger';
    }
  };

  const getStrengthPercentage = () => {
    const validCount = [validation.minLength, validation.hasUppercase, validation.hasNumber, validation.hasSpecial]
      .filter(Boolean).length;
    return (validCount / 4) * 100;
  };

  return (
    <div>
      <Input
        label={label}
        type="password"
        value={value}
        onChange={onChange}
        placeholder={placeholder || "Saisissez un mot de passe sécurisé"}
        required={required}
        autoComplete="new-password"
      />
      
      {/* Indicateur de force du mot de passe */}
      {value && (
        <div className="mt-2">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <small className="text-muted">Force du mot de passe</small>
            <small className={`fw-bold text-${getStrengthColor()}`}>
              {validation.strength === 'strong' ? 'Fort' : 
               validation.strength === 'medium' ? 'Moyen' : 'Faible'}
            </small>
          </div>
          
          {/* Barre de progression */}
          <div className="progress" style={{ height: '4px' }}>
            <div 
              className={`progress-bar bg-${getStrengthColor()}`}
              style={{ width: `${getStrengthPercentage()}%` }}
            ></div>
          </div>
          
          {/* Critères de validation */}
          <div className="mt-2">
            <div className="row g-2">
              <div className="col-6">
                <small className={validation.minLength ? 'text-success' : 'text-muted'}>
                  <i className={`bi ${validation.minLength ? 'bi-check-circle-fill' : 'bi-circle'} me-1`}></i>
                  8 caractères min.
                </small>
              </div>
              <div className="col-6">
                <small className={validation.hasUppercase ? 'text-success' : 'text-muted'}>
                  <i className={`bi ${validation.hasUppercase ? 'bi-check-circle-fill' : 'bi-circle'} me-1`}></i>
                  1 majuscule
                </small>
              </div>
              <div className="col-6">
                <small className={validation.hasNumber ? 'text-success' : 'text-muted'}>
                  <i className={`bi ${validation.hasNumber ? 'bi-check-circle-fill' : 'bi-circle'} me-1`}></i>
                  1 chiffre
                </small>
              </div>
              <div className="col-6">
                <small className={validation.hasSpecial ? 'text-success' : 'text-muted'}>
                  <i className={`bi ${validation.hasSpecial ? 'bi-check-circle-fill' : 'bi-circle'} me-1`}></i>
                  1 caractère spécial
                </small>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthInput;
