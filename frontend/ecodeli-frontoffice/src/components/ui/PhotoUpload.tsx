import React, { useState } from 'react';
import Button from './Button';
import Alert from './Alert';

interface PhotoUploadProps {
  onUpload: (file: File) => Promise<string>; // Retourne l'URL de la photo
  onRemove?: () => void;
  currentPhotoUrl?: string;
  disabled?: boolean;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ 
  onUpload, 
  onRemove,
  currentPhotoUrl,
  disabled = false
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);
    
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    // Validation de la taille (1MB max pour éviter l'erreur 413)
    if (file.size > 1 * 1024 * 1024) {
      setError('La photo est trop volumineuse. Taille maximum: 1MB');
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    // Validation du type (seulement images)
    if (!file.type.startsWith('image/')) {
      setError('Seules les images sont autorisées (JPEG, PNG, GIF, etc.)');
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    setSelectedFile(file);
    
    // Créer une prévisualisation
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
      setPreviewUrl(null);
      // Reset l'input file
      const fileInput = document.getElementById('photoInput') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      // Gestion spécifique des erreurs d'upload
      if (error.message && error.message.includes('413')) {
        setError('La photo est trop volumineuse pour le serveur. Réduisez la taille de votre image.');
      } else if (error.message && error.message.includes('Payload Too Large')) {
        setError('Fichier trop volumineux. Choisissez une image plus petite (max 1MB).');
      } else {
        setError(error.message || 'Erreur lors de l\'upload de la photo');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    const fileInput = document.getElementById('photoInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const displayUrl = previewUrl || currentPhotoUrl;

  return (
    <div className="photo-upload">
      {error && (
        <Alert type="danger" className="mb-3">
          {error}
        </Alert>
      )}
      
      {/* Zone de prévisualisation */}
      {displayUrl && (
        <div className="mb-3 text-center">
          <div className="position-relative d-inline-block">
            <img 
              src={displayUrl} 
              alt="Prévisualisation" 
              className="img-thumbnail"
              style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }}
            />
            {!uploading && (
              <button
                type="button"
                className="btn btn-danger btn-sm position-absolute top-0 end-0"
                onClick={handleRemove}
                disabled={disabled}
                style={{ transform: 'translate(50%, -50%)' }}
              >
                <i className="bi bi-x"></i>
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Input de sélection de fichier */}
      {!displayUrl && (
        <div className="mb-3">
          <input
            id="photoInput"
            type="file"
            className="form-control"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={disabled || uploading}
          />
          <small className="form-text text-muted">
            Formats acceptés: JPEG, PNG, GIF - Taille max: 1MB
          </small>
        </div>
      )}

      {/* Informations sur le fichier sélectionné */}
      {selectedFile && (
        <div className="mb-3 p-2 bg-light rounded">
          <strong>Fichier sélectionné:</strong> {selectedFile.name}
          <br />
          <small className="text-muted">
            Taille: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </small>
        </div>
      )}

      {/* Boutons d'action */}
      {selectedFile && (
        <div className="d-flex gap-2">
          <Button
            onClick={handleUpload}
            disabled={uploading || disabled}
            variant="primary"
            size="sm"
          >
            {uploading ? 'Upload en cours...' : 'Ajouter cette photo'}
          </Button>
          <Button
            onClick={() => {
              setSelectedFile(null);
              setPreviewUrl(null);
              const fileInput = document.getElementById('photoInput') as HTMLInputElement;
              if (fileInput) fileInput.value = '';
            }}
            disabled={uploading || disabled}
            variant="secondary"
            size="sm"
          >
            Annuler
          </Button>
        </div>
      )}

      {/* Option pour changer de photo */}
      {displayUrl && !selectedFile && (
        <div className="text-center">
          <Button
            onClick={() => {
              const fileInput = document.getElementById('photoInput') as HTMLInputElement;
              if (fileInput) fileInput.click();
            }}
            disabled={disabled || uploading}
            variant="secondary"
            size="sm"
          >
            Changer la photo
          </Button>
          <input
            id="photoInput"
            type="file"
            className="d-none"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={disabled || uploading}
          />
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;
