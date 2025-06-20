import React, { useState } from 'react';
import Button from './ui/Button';
import Alert from './ui/Alert';

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  acceptedTypes?: string;
  maxSizeMB?: number;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onUpload, 
  acceptedTypes = ".pdf,.jpg,.jpeg,.png", 
  maxSizeMB = 5,
  disabled = false
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);
    
    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Validation de la taille
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Le fichier est trop volumineux. Taille maximum: ${maxSizeMB}MB`);
      setSelectedFile(null);
      return;
    }

    // Validation du type
    const validTypes = acceptedTypes.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validTypes.includes(fileExtension)) {
      setError(`Type de fichier non autorisé. Types acceptés: ${acceptedTypes}`);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
      // Reset l'input file
      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      setError(error.message || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="file-upload">
      {error && (
        <Alert type="danger" className="mb-3">
          {error}
        </Alert>
      )}
      
      <div className="mb-3">
        <input
          id="fileInput"
          type="file"
          className="form-control"
          accept={acceptedTypes}
          onChange={handleFileSelect}
          disabled={disabled || uploading}
        />
        <small className="form-text text-muted">
          Formats acceptés: {acceptedTypes.replace(/\./g, '').toUpperCase()} - Taille max: {maxSizeMB}MB
        </small>
      </div>

      {selectedFile && (
        <div className="mb-3 p-2 bg-light rounded">
          <strong>Fichier sélectionné:</strong> {selectedFile.name}
          <br />
          <small className="text-muted">
            Taille: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </small>
        </div>
      )}

      <Button
        onClick={handleUpload}
        disabled={!selectedFile || uploading || disabled}
        variant="primary"
      >
        {uploading ? 'Upload en cours...' : 'Télécharger le fichier'}
      </Button>
    </div>
  );
};

export default FileUpload;
