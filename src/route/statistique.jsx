import React, { useState, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { toast, ToastContainer } from 'react-toastify';
import logo from './img/logo.jpg';
import './App.css';
import './assets/stat.css';
import useSessionTimeout from '../useSessionTimeout';
import * as XLSX from 'xlsx';


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function formatPrice(price) {
  if (price == null || isNaN(price)) {
    return 'Non spécifié'; 
  }
  return price.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}


function Statistics() {
  const [reservations, setReservations] = useState([]);
  const [bungalows, setBungalows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // État pour le terme de recherche

  useSessionTimeout('/api/logout');


  useEffect(() => {
    async function fetchData() {
      try {
        const [reservationsResponse, bungalowsResponse] = await Promise.all([
          fetch('/api/reservations'),
          fetch('/api/bungalows')
        ]);

        if (!reservationsResponse.ok || !bungalowsResponse.ok) {
          throw new Error('Erreur lors de la récupération des données');
        }

        const reservationsData = await reservationsResponse.json();
        const bungalowsData = await bungalowsResponse.json();

        setReservations(reservationsData);
        setBungalows(bungalowsData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredReservations = reservations.filter(reservation => {
    const searchLower = searchTerm.toLowerCase();
    return (
      reservation.nom_client.toLowerCase().includes(searchLower) ||
      reservation.numero_client.toLowerCase().includes(searchLower) ||
      reservation.email_client.toLowerCase().includes(searchLower)
    );
  });

  const totalReservations = reservations.length;
  const totalPersonnes = reservations.reduce((total, reservation) => total + (reservation.personnes || 0), 0);
  const totalBungalows = bungalows.length;

  async function handleDelete(reservationId) {
    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de la réservation');
      }

      setReservations(reservations.filter(reservation => reservation.id !== reservationId));

      toast.success('Réservation supprimée avec succès');
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la suppression de la réservation');
    }
  }

  const today = new Date();
  const bungalowsOccupes = reservations.filter(reservation => {
    const dateDebut = new Date(reservation.datereservation);
    const dateFin = new Date(dateDebut);
    dateFin.setDate(dateFin.getDate() + (reservation.dureesejour || 0));
    return today >= dateDebut && today <= dateFin;
  }).length;

  const bungalowsLibres = totalBungalows - bungalowsOccupes;

  const personnesSurPlace = reservations
    .filter(reservation => {
      const dateDebut = new Date(reservation.datereservation);
      const dateFin = new Date(dateDebut);
      dateFin.setDate(dateFin.getDate() + (reservation.dureesejour || 0));
      return today >= dateDebut && today <= dateFin;
    })
    .reduce((total, reservation) => total + (reservation.personnes || 0), 0);

  const revenuTotal = reservations.reduce((total, reservation) => total + (Number(reservation.prix_paye) || 0), 0);

  const moisReservations = reservations.reduce((acc, reservation) => {
    const date = new Date(reservation.datereservation);
    const moisIndex = date.getMonth();
    acc[moisIndex] = (acc[moisIndex] || 0) + 1;
    return acc;
  }, new Array(12).fill(0));

  const moisLabels = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  const moisData = moisLabels.map((_, index) => moisReservations[index]);

  const filteredMoisLabels = moisLabels.filter((_, index) => moisReservations[index] > 0);
  const filteredMoisData = moisData.filter(value => value > 0);

  const modePaiementStats = reservations.reduce((acc, reservation) => {
    const modePaiement = reservation.modepaiement || 'Non spécifié';
    acc[modePaiement] = (acc[modePaiement] || 0) + 1;
    return acc;
  }, {});

  const paiementLabels = Object.keys(modePaiementStats);
  const paiementData = paiementLabels.map(label => modePaiementStats[label]);

  const barData = {
    labels: filteredMoisLabels,
    datasets: [
      {
        label: 'Réservations par mois',
        data: filteredMoisData,
        backgroundColor: '#0073e6',
        borderColor: '#005bb5',
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Réservations par mois',
      },
    },
  };

  const donutData = {
    labels: ['Bungalows Libres', 'Bungalows Occupés'],
    datasets: [
      {
        label: 'Occupation des Bungalows',
        data: [bungalowsLibres, bungalowsOccupes],
        backgroundColor: ['#198754', '#dc3545'],
        borderColor: ['#218838', '#c82333'],
        borderWidth: 1,
      },
    ],
  };

  const donutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Occupation des Bungalows',
      },
    },
  };

  const paiementDonutData = {
    labels: paiementLabels,
    datasets: [
      {
        label: 'Mode de Paiement',
        data: paiementData,
        backgroundColor: ['#0073e6', '#198754', '#dc3545', '#ffc107'],
        borderColor: ['#005bb5', '#218838', '#c82333', '#e0a800'],
        borderWidth: 1,
      },
    ],
  };

  const paiementDonutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Répartition par Mode de Paiement',
      },
    },
  };

  const exportToExcel = () => {
    const clientsData = reservations.map(reservation => ({
      Nom: reservation.nom_client, 
      Numero: reservation.numero_client,
      Email: reservation.email_client,
      Personnes: reservation.personnes,
      Datereservation: reservation.datereservation,
      bungalows: reservation.type_bungalow,
      Dureesejour: reservation.dureesejour,
      PrixPaye: formatPrice(reservation.prix_paye),
      Modepaiement: reservation.modepaiement,
    }));

    // Créer un fichier Excel
    const worksheet = XLSX.utils.json_to_sheet(clientsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clients');

    XLSX.writeFile(workbook, 'clients.xlsx');
  };

  if (loading) {
    return (
      <div className="container">
        <div className="cloud front">
          <span className="left-front"></span>
          <span className="right-front"></span>
        </div>
        <span className="sun sunshine"></span>
        <span className="sun"></span>
        <div className="cloud back">
          <span className="left-back"></span>
          <span className="right-back"></span>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la déconnexion');
      }

      
      toast.success('Déconnexion réussie');

      
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast.error(error.message || 'Erreur serveur');
    }
  };

  return (
    <div className="statistique-page">
      <header>
        <div className="logo">
          <img src={logo} alt="R-écolodges" />
        </div>
        <nav>
          <ul>
            <li><a href="/reservation">Réservation</a></li>
            <li><a href="/stat">Statistiques</a></li>
            <li><button onClick={handleLogout} className="btn btn-danger">Déconnexion</button></li>
          </ul>
        </nav>
      </header>

      <div className="statistics-page">
        <div className="stats">
          <p>Total des réservations : {totalReservations}</p><hr></hr>
          <p>Total des personnes : {totalPersonnes}</p><hr></hr>
          <p>Nombre de personnes sur place : {personnesSurPlace}</p><hr></hr>
          <p>Revenu total : {formatPrice(revenuTotal)} Ar</p>
        </div>

        <div className='main'>
          <h1>Statistiques des Réservations</h1>
          <div className="charts-container">
            <div className="chart-container1">
              <Bar data={barData} options={barOptions} />
            </div>

            <div className="chart-container">
              <Doughnut data={donutData} options={donutOptions} />
            </div>

            <div className="chart-container">
              <Doughnut data={paiementDonutData} options={paiementDonutOptions} />
            </div>

          </div>

          <h2>Liste des Réservations</h2>
          <input
            type="text"
            placeholder="Rechercher par nom, numéro ou email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <div className="table-scroll-area">
          <button onClick={exportToExcel} className="btn btn-success bout">Exporter vers Excel</button>
          {filteredReservations.length === 0 && searchTerm.length > 0 ? (
          <p>Aucun résultat trouvé pour "{searchTerm}".</p>
          ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Numéro</th>
                    <th>Personnes</th>
                    <th>Durée</th>
                    <th>Date</th>
                    <th>Mode de Paiement</th>
                    <th>Prix</th>
                    <th>Bungalow</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations
                    .sort((a, b) => {
                      if (a.statut === 'terminé' && b.statut !== 'terminé') return 1;
                      if (a.statut !== 'terminé' && b.statut === 'terminé') return -1;
                      return 0; 
                    })
                    .map(reservation => (
                      <tr key={reservation.id}>
                        <td>{reservation.nom_client}</td>
                        <td>{reservation.email_client}</td>
                        <td>{reservation.numero_client}</td>
                        <td>{reservation.personnes || 'Non spécifié'}</td>
                        <td>{reservation.dureesejour || 'Non spécifié'} jours</td>
                        <td>{new Date(reservation.datereservation).toLocaleDateString('fr-FR') || 'Non spécifié'}</td>
                        <td>{reservation.modepaiement || 'Non spécifié'}</td>
                        <td>{formatPrice(reservation.prix_paye) || 'Non spécifié'}</td>
                        <td>{reservation.type_bungalow || 'Non spécifié'}</td>
                        <td>
                          {reservation.statut !== 'terminé' ? (
                            <button 
                              onClick={() => handleDelete(reservation.id)} 
                              className="delete-button"
                            >
                              Annuler
                            </button>
                          ) : (
                            <button 
                              className="desactive" 
                              disabled
                            >
                              Terminé
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}

export default Statistics;
