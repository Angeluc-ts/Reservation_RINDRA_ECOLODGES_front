import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './route/Home.jsx';
import Reservation from './route/Reservation.jsx';
import Login from './route/login.jsx';
import ForgotPassword from './route/forgot-pasword.jsx'; 
import ResetPassword from './route/reset-password.jsx'; 
import Stat from './route/statistique.jsx';



function AppRouter() {
  const [reservations, setReservations] = useState([]);
  const [bungalows, setBungalows] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);


  useEffect(() => {
    async function fetchData() {
      try {
        const reservationsResponse = await fetch('http://localhost:5000/api/reservations', {
          credentials: 'include'
        });
        if (reservationsResponse.ok) {
          const reservationsData = await reservationsResponse.json();
          setReservations(reservationsData);
        } else {
          setIsAuthenticated(false);
        }

        const bungalowsResponse = await fetch('http://localhost:5000/api/bungalows/count', {
          credentials: 'include'
        });
        const bungalowsData = await bungalowsResponse.json();
        setBungalows(bungalowsData.totalBungalows);
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('http://localhost:5000/api/check-auth', {
          credentials: 'include'
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        setIsAuthenticated(false);
      }
    }

    checkAuth();
  }, []);

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

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/reservation" element={isAuthenticated ? <Reservation bungalows={bungalows} /> : <Navigate to="/login" />} />
      <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/stat" element={isAuthenticated ? <Stat reservations={reservations} bungalows={bungalows} /> : <Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}
