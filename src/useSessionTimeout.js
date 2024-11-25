import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

function useSessionTimeout(logoutUrl, inactivityTimeout = 600000, warningTime = 60000) {
  const [isSessionWarningShown, setIsSessionWarningShown] = useState(false);
  const idleTimer = useRef(null);
  const countdown = useRef(null);
  const lastActivityTime = useRef(Date.now());

  const handleLogout = async () => {
    try {
      const response = await fetch(logoutUrl, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la déconnexion');
      }

      toast.success('Déconnexion réussie');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast.error(error.message || 'Erreur serveur');
    }
  };

  const resetIdleTimer = () => {
    if (idleTimer.current) {
      clearTimeout(idleTimer.current);
    }

    idleTimer.current = setTimeout(() => {
      if (!isSessionWarningShown) {
        toast.info('Votre session expire dans 1 minute. Veuillez rester actif.');
        setIsSessionWarningShown(true);
      }
    }, inactivityTimeout - warningTime);
  };

  const handleActivity = () => {
    setIsSessionWarningShown(false);
    lastActivityTime.current = Date.now(); // Mettre à jour l'heure de la dernière activité
    resetIdleTimer(); // Réinitialiser le minuteur d'inactivité
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleActivity, { passive: true });
    document.addEventListener('keydown', handleActivity);

    resetIdleTimer();

    countdown.current = setInterval(() => {
      const elapsed = Date.now() - lastActivityTime.current;
      if (elapsed >= inactivityTimeout) {
        handleLogout();
        clearInterval(countdown.current);
      }
    }, 1000);

    return () => {
      document.removeEventListener('mousemove', handleActivity);
      document.removeEventListener('keydown', handleActivity);
      if (idleTimer.current) {
        clearTimeout(idleTimer.current);
      }
      if (countdown.current) {
        clearInterval(countdown.current);
      }
    };
  }, [logoutUrl, inactivityTimeout, warningTime]);

  // Réinitialiser le timer au premier rendu
  useEffect(() => {
    lastActivityTime.current = Date.now(); // Initialiser au premier rendu
  }, [inactivityTimeout]);
}

export default useSessionTimeout;
