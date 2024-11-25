import React, { useState } from 'react';
import './assets/login.css';

function Login() {
  // État pour les champs de saisie
  const [identifiant, setIdentifiant] = useState(''); // Utilisé pour email ou numéro de téléphone
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Fonction de gestion de la soumission du formulaire
  const handleSubmit = async (event) => {
    event.preventDefault(); // Empêche le rechargement de la page

    // Appel à l'API de connexion (backend)
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifiant, password }), // Envoi de l'identifiant (email ou téléphone) et du mot de passe
      });

      if (response.ok) {
        // Si la connexion réussit, tu peux rediriger l'utilisateur ou effectuer d'autres actions
        console.log('Connexion réussie');
        window.location.href = '/reservation';
      } else {
        // Affichage de l'erreur si les informations sont incorrectes
        setError('Email ou mot de passe incorrect');
      }
    } catch (error) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  return (
    <div className='login-container'>
      <form className="login-form" onSubmit={handleSubmit}>
        <p className="login-title">Login</p>
        {error && <p className="login-error">{error}</p>} {/* Affiche le message d'erreur */}
        <div className="login-input-field">
          <input
            required
            className="login-input"
            type="text"
            value={identifiant}
            onChange={(e) => setIdentifiant(e.target.value)}
          />
          <label className="login-label" htmlFor="identifiant">Enter Email or Phone Number</label>
        </div>
        <div className="login-input-field">
          <input
            required
            className="login-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label className="login-label" htmlFor="password">Enter Password</label>
        </div>
        <div className="login-links-container">
          <a className="login-forgot-password" href="/forgot-password">Mot de passe oublié?</a>
          <p>|</p>
          <a className="login-forgot-password" href="/">Retourner vers l'acceuil?</a>
        </div>
        <button className="login-submit-btn" type="submit">Sign In</button>
      </form>
    </div>
  );
}

export default Login;
