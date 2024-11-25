import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Importer le style de react-toastify
import './assets/reset-password.css'; // Importer le fichier CSS

const ResetPassword = () => {
  const { token } = useParams(); // Récupère le token de l'URL
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    // Vérifiez la validité du token lors du chargement du composant
    const checkTokenValidity = async () => {
      try {
        await axios.get(`/api/reset-password/${token}/validate`);
      } catch (err) {
        if (err.response?.status === 400) {
          setTokenValid(false);
        } else {
          toast.error('Erreur lors de la vérification du token');
        }
      }
    };

    checkTokenValidity();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (!tokenValid) {
      toast.error('Le délai de réinitialisation du mot de passe est expiré.');
      return;
    }

    try {
      // Envoyer une requête au backend pour réinitialiser le mot de passe
      const response = await axios.post(`/api/reset-password/${token}`, { password });
      toast.success(response.data.message || 'Mot de passe réinitialisé avec succès');
      setTimeout(() => {
        navigate('/login'); // Rediriger vers la page de connexion après un succès
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Une erreur est survenue');
    }
  };

  const handleCancel = () => {
    navigate('/'); // Naviguer vers la page d'accueil
  };

  if (!tokenValid) {
    return (
      <div className="reset-password-container">
        <h2 className="reset-password-title">Réinitialiser le mot de passe</h2>
        <p>Le délai de réinitialisation du mot de passe est expiré. Veuillez demander un nouveau lien de réinitialisation.</p>
        <ToastContainer />
        <button onClick={handleCancel} className="cancel-button">Retourner à l'accueil</button> {/* Nouveau bouton */}
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <h2 className="reset-password-title">Réinitialiser le mot de passe</h2>
      <form className="reset-password-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="password">Nouveau mot de passe :</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirmer le mot de passe :</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Réinitialiser</button>
        <button type="button" onClick={handleCancel} className="cancel-button">Annuler</button> {/* Nouveau bouton */}
      </form>
      <ToastContainer />
    </div>
  );
};

export default ResetPassword;
