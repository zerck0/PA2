import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { annonceService } from '../services/annonceService';
import { Annonce } from '../types/annonce';

export const useDashboardData = () => {
  const { currentUser } = useContext(AuthContext);
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser?.user?.id) {
      fetchUserAnnonces();
    }
  }, [currentUser]);

  const fetchUserAnnonces = async () => {
    try {
      setLoading(true);
      const data = await annonceService.getMyAnnonces(currentUser!.user.id);
      setAnnonces(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  return {
    currentUser,
    annonces,
    loading,
    error,
    refetchAnnonces: fetchUserAnnonces
  };
};
