import React, { useState, useEffect, useMemo } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import logo from './img/logo.jpg';
import './assets/reservation.css';
import useSessionTimeout from '../useSessionTimeout'; // Importer votre hook


function Reservation() {
  const [nbPersonnes, setNbPersonnes] = useState('');
  const [dureeSejour, setDureeSejour] = useState('');
  const [nomClient, setNomClient] = useState('');
  const [emailClient, setEmailClient] = useState('');
  const [numero_client, setNumeroMvola] = useState(''); // Ce champ est maintenant permanent
  const [dateReservation, setDateReservation] = useState('');
  const [modePaiement, setModePaiement] = useState('');
  const [bungalows, setBungalows] = useState([]); // État pour stocker les bungalows
  const [bungalowId, setBungalowId] = useState(''); // État pour l'ID du bungalow sélectionné
  const [bungalowPrice, setBungalowPrice] = useState(0); // État pour stocker le prix du bungalow
  const [error, setError] = useState(''); // État pour gérer les erreurs
  const [nextAvailableDate, setNextAvailableDate] = useState(null); // État pour stocker la prochaine date de libération

  useSessionTimeout('/api/logout');

  useEffect(() => {
    fetch('/api/bungalows')
      .then(response => response.json())
      .then(data => {
        const disponibles = data.filter(bungalow => bungalow.disponibilite);
        setBungalows(disponibles);
        console.log('Bungalows chargés:', disponibles);

        if (disponibles.length === 0) {
          // Si aucun bungalow n'est disponible, trouver la date de libération la plus proche
          const prochainesDisponibilites = data
            .map(bungalow => ({
              ...bungalow,
              dateDisponibilite: new Date(bungalow.dateDisponibilite)
            }))
            .sort((a, b) => a.dateDisponibilite - b.dateDisponibilite);

          if (prochainesDisponibilites.length > 0) {
            setNextAvailableDate(prochainesDisponibilites[0].dateDisponibilite);
          }
        }
      })
      .catch(error => {
        console.error('Erreur lors du chargement des bungalows:', error);
      });
  }, []);

  // Mettre à jour le prix du bungalow sélectionné
  useEffect(() => {
    if (bungalowId) {
      const bungalow = bungalows.find(b => b.id.toString() === bungalowId.toString());
      console.log('Bungalows:', bungalows); // Débogage
      console.log('ID sélectionné:', bungalowId); // Débogage

      if (bungalow) {
        setBungalowPrice(bungalow.prix || 0); // Utilisez la nouvelle colonne prix
        console.log('Prix du bungalow sélectionné:', bungalow.prix); // Débogage
      } else {
        console.log('Bungalow non trouvé pour l\'ID:', bungalowId); // Débogage
      }
    }
  }, [bungalowId, bungalows]);
  useEffect(() => {
    if (nomClient) {
      fetch(`/api/clients/${nomClient}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Client non trouvé');
          }
          return response.json();
        })
        .then(clientData => {
          setEmailClient(clientData.email_client);
          setNumeroMvola(clientData.numero_client);
          toast.success('Informations du client chargées automatiquement');
        })
        .catch(error => {
          console.log('Erreur:', error.message);
          setEmailClient('');
          setNumeroMvola('');
        });
    }
  }, [nomClient]);
  

  // Calculer le prix payé en utilisant useMemo pour éviter les recalculs inutiles
  const prixPaye = useMemo(() => {
    const dureeSejourNumber = parseFloat(dureeSejour);
    return bungalowPrice * dureeSejourNumber || 0;
  }, [bungalowPrice, dureeSejour]);

  // Fonction pour gérer la réservation
  const handleReservation = async (e) => {
    e.preventDefault();

    // Vérification des champs obligatoires
    if (!nomClient || !emailClient || !nbPersonnes || !dureeSejour || !dateReservation || !modePaiement || !numero_client || !bungalowId) {
      setError('Tous les champs sont obligatoires. Veuillez les remplir.');
      toast.error('Tous les champs sont obligatoires. Veuillez les remplir.');
      return;
    }

    // Réinitialiser l'erreur si tous les champs sont remplis
    setError('');

    // Convertir dureeSejour en nombre
    const dureeSejourNumber = parseFloat(dureeSejour);
    if (isNaN(dureeSejourNumber) || dureeSejourNumber <= 0) {
      setError('La durée du séjour doit être un nombre valide.');
      toast.error('La durée du séjour doit être un nombre valide.');
      return;
    }

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nom_client: nomClient,
          email_client: emailClient,
          dateReservation,
          dureeSejour: dureeSejourNumber, // Envoyer en tant que nombre
          personnes: nbPersonnes,
          modepaiement: modePaiement,
          bungalow_id: bungalowId,
          numero_client: numero_client,
          prix_paye: prixPaye, // Calculer le prix total en fonction de la durée du séjour
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'ajout de la réservation');
      }

      toast.success(data.message);
      setNomClient('');
      setEmailClient('');
      setNbPersonnes('');
      setDureeSejour('');
      setDateReservation('');
      setModePaiement('');
      setBungalowId('');
      setNumeroMvola('');
    } catch (error) {
      console.error('Erreur lors de la réservation:', error);
      toast.error(error.message || 'Erreur serveur');
    }
  };

  // Fonction pour gérer la déconnexion
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include' // Assurez-vous que les cookies sont envoyés avec la requête
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la déconnexion');
      }

      toast.success('Déconnexion réussie');

      setTimeout(() => {
        window.location.href = '/';
      }, 1000); // Délai de 1 seconde
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast.error(error.message || 'Erreur serveur');
    }
  };

  return (
    <div className="reservation-page">
      <header>
        <div className="logo">
          <img src={logo} alt="R-écolodges" /> {/* Remplacez par le chemin de votre logo */}
        </div>
        <nav>
          <ul>
            <li><a href="/reservation">Réservation</a></li>
            <li><a href="/stat">Statistiques</a></li>
            <li><button onClick={handleLogout} className="btn btn-danger">Déconnexion</button></li>
          </ul>
        </nav>
      </header>

      <div className="main">
        <form id="reservation-form" onSubmit={handleReservation}>
          <h1>Réservation</h1>
          {bungalows.length === 0 && nextAvailableDate ? (
            <p>Aucun bungalow n'est disponible actuellement. Le prochain bungalow sera disponible le {nextAvailableDate.toLocaleDateString()}.</p>
          ) : (
            <>
              <div className="row">
                <div className="col-md-6 form-group">
                  <label htmlFor="nom-client">Nom du client :</label>
                  <input 
                    type="text" 
                    id="nom-client" 
                    className="form-control"
                    value={nomClient} 
                    onChange={(e) => setNomClient(e.target.value)} 
                  />
                </div>
                <div className="col-md-6 form-group">
                  <label htmlFor="email-client">Email :</label>
                  <input 
                    type="email" 
                    id="email-client" 
                    className="form-control"
                    autoComplete='off'
                    value={emailClient} 
                    onChange={(e) => setEmailClient(e.target.value)} 
                    placeholder="exemple@domaine.com"
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 form-group">
                  <label htmlFor="nb-personnes">Nombre de personnes :</label>
                  <input 
                    type="number" 
                    id="nb-personnes" 
                    className="form-control"
                    value={nbPersonnes} 
                    onChange={(e) => setNbPersonnes(e.target.value)} 
                  />
                </div>
                <div className="col-md-6 form-group">
                  <label htmlFor="duree-sejour">Durée du séjour (en jours) :</label>
                  <input 
                    type="number" 
                    id="duree-sejour" 
                    className="form-control"
                    value={dureeSejour} 
                    onChange={(e) => setDureeSejour(e.target.value)} 
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 form-group">
                  <label htmlFor="date-reservation">Date de réservation :</label>
                  <input 
                    type="date" 
                    id="date-reservation" 
                    className="form-control"
                    value={dateReservation} 
                    onChange={(e) => setDateReservation(e.target.value)} 
                  />
                </div>
                <div className="col-md-6 form-group">
                  <label htmlFor="mode-paiement">Mode de paiement :</label>
                  <select 
                    id="mode-paiement" 
                    className="form-control"
                    value={modePaiement} 
                    onChange={(e) => setModePaiement(e.target.value)} 
                  >
                    <option value="">Sélectionnez un mode de paiement</option>
                    <option value="Mvola">Mvola</option>
                    <option value="espèces">Espèces</option>
                  </select>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 form-group">
                  <label htmlFor="bungalow-select">Sélectionnez un bungalow :</label>
                  <select 
                    id="bungalow-select" 
                    className="form-control"
                    value={bungalowId} 
                    onChange={(e) => setBungalowId(e.target.value)} 
                  >
                    <option value="">Bungalows disponibles : {bungalows.length}</option>
                    {bungalows.map(bungalow => (
                      <option key={bungalow.id} value={bungalow.id}>
                        {bungalow.type} - Prix: {bungalow.prix} Ar
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 form-group">
                  <label htmlFor="num-client">Numéro du client :</label>
                  <input 
                    type="text" 
                    id="num-client" 
                    className="form-control"
                    autoComplete='off'
                    value={numero_client} 
                    onChange={(e) => setNumeroMvola(e.target.value)} 
                  />
                </div>
              <div className="col-md-6 form-group prix d-flex align-items-center">
                <label htmlFor="prix-total" className="mr-2" style={{ width: '100px', flexShrink: 0 }}>Prix en Ar :</label> {/* Ajoute une marge à droite */}
                <input 
                  type="text" 
                  id="prix-total" 
                  className="form-control"
                  value={prixPaye} 
                  readOnly 
                />
              </div>
              </div>
              <button type="submit" className="btn btn-primary">Réserver</button>
            </>
          )}
          {error && <p className="text-danger">{error}</p>} {/* Affiche les erreurs */}
        </form>
      </div>

      <ToastContainer />
    </div>
  );
}

export default Reservation;
