import React from 'react';
import Input from './Input';

interface AddressInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onCityChange?: (city: string) => void;
  placeholder?: string;
  required?: boolean;
}

const AddressInput: React.FC<AddressInputProps> = ({
  label,
  value,
  onChange,
  onCityChange,
  placeholder,
  required = false
}) => {
  // TODO: Intégrer Google Places Autocomplete quand la clé API sera disponible
  // Pour l'instant, utilisation d'un Input standard
  
  const handleChange = (newValue: string) => {
    onChange(newValue);
    
    // Extraction simple de la ville (après la dernière virgule)
    if (onCityChange && newValue.includes(',')) {
      const parts = newValue.split(',');
      const city = parts[parts.length - 1].trim();
      onCityChange(city);
    }
  };

  return (
    <Input
      label={label}
      value={value}
      onChange={handleChange}
      placeholder={placeholder || "Saisissez une adresse complète"}
      required={required}
    />
  );
};

export default AddressInput;
