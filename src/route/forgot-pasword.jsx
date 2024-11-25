import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importer useNavigate
import { toast, ToastContainer } from 'react-toastify'; // Importer toast
import 'react-toastify/dist/ReactToastify.css'; // Importer le style de react-toastify
import './assets/forgot-pasword.css';
import useSessionTimeout from '../useSessionTimeout'; // Importer votre hook

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  
  useSessionTimeout('/api/logout');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Un lien a été envoyé à votre adresse e-mail.'); // Notification de succès
      } else {
        toast.error(data.message || 'Erreur lors de l\'envoi du lien de réinitialisation.'); // Notification d'erreur
      }
    } catch (error) {
      console.error('Erreur lors de la demande de réinitialisation de mot de passe', error);
      toast.error('Erreur lors de la demande de réinitialisation.'); // Notification d'erreur
    }
  };

  const handleCancel = () => {
    navigate('/login'); // Naviguer vers la page d'accueil
  };

  return (
    <div className="forgot-password-container">
      <h2 className="forgot-password-title">Réinitialiser le mot de passe</h2>
      <form className="forgot-password-form" onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Entrez votre email"
          required
        />
        <button type="submit">Envoyer le lien de réinitialisation</button>
        <button type="button" onClick={handleCancel} className="cancel-button">Annuler</button> {/* Nouveau bouton */}
      </form>
      <ToastContainer /> {/* Ajouter le conteneur de notifications */}
    </div>
  );
}

export default ForgotPassword;
