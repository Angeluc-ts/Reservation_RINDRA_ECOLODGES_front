import React, { useState } from 'react';
import image1 from './img/bungalow.jpg'; // Image du bungalow
import resto from './img/resto.jpg';
import image3 from './img/douche.jpg';
import bungalowInterior from './img/restau.jpg'; // Image de l'intérieur du bungalow
import hotPoolImage from './img/piscine.jpg'; // Image de la piscine avec eau chaude (à ajouter)
import logo from './img/logo.jpg';
import distanceMap from './img/Image4.png';
import './App.css';
import './assets/home.css';

function Home() {
  // État pour gérer l'affichage de la modale et l'image sélectionnée
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState('');

  // Fonction pour ouvrir la modale avec l'image de l'intérieur du bungalow
  const openModal = (image) => {
    setModalImage(image);
    setIsModalOpen(true);
  };

  // Fonction pour fermer la modale
  const closeModal = () => {
    setIsModalOpen(false);
    setModalImage('');
  };

  return (
    <>
      <header>
        <div className="logo">
          <img src={logo} alt="R-écolodges" />
        </div>
        <nav>
          <ul>
            <li><a href="/login">Connexion</a></li>
          </ul>
        </nav>
      </header>
      <main>
        <section className="welcome">
          <h2>Bienvenue chez Rindra Ecolodges</h2>
          <p>
          Plongez au cœur de la nature et profitez d'un séjour exceptionnel dans nos écolodges,<br></br>
          alliant confort moderne et panoramas à couper le souffle.<br></br>
          Découvrez nos offres et réservez dès maintenant votre prochaine escapade.<br></br>
          <b>Heure d'hoverture: Lundi-Vendredi 9h-18h</b>
          </p>
        </section>

        <section id="voyages">
          <h2>Nos Déstinations</h2>
          <div className="voyages-container">
            <div className="voyage" onClick={() => openModal(bungalowInterior)}>
              <img src={image1} alt="Image de voyage 1" />
              <h3>Bungalow</h3>
              <p>          Découvrez notre bungalow chaleureux et intime, niché en pleine nature. Profitez d'un séjour confortable, idéal pour une escapade relaxante.<br></br>
              <b>Nous avons 6 bungalows :</b> 
              <ul>
                 <li><b>3 bungalows familiaux</b> 50 000 Ar</li>
                <li><b>3 bungalows standards</b> 30 000Ar.</li>
              </ul> 
              </p>
            </div>
            <div className="voyage">
              <img src={resto} alt="Image de voyage 2" />
              <h3>Restaurant</h3>
              <p>Savourez une expérience culinaire exceptionnelle dans notre restaurant. Dégustez des plats raffinés préparés avec des ingrédients frais et locaux, le tout dans une ambiance conviviale et élégante.</p>
            </div>
            <div className="voyage">
              <img src={image3} alt="Image de voyage 3" />
              <h3>Douche avec eau thérmale</h3>
              <p>Offrez-vous un moment de détente ultime sous une douche d'eau thermale. Plongez dans les bienfaits naturels de l'eau pure et chaude, reconnue pour ses propriétés apaisantes et revitalisantes. Redécouvrez le bien-être avec chaque goutte.</p>
            </div>
            <div className="voyage" onClick={() => openModal(hotPoolImage)}>
              <img src={hotPoolImage} alt="Piscine avec eau chaude" />
              <h3>Piscine avec eau chaude</h3>
              <p>Détendez-vous dans notre piscine chauffée. Profitez d'un bain chaud en pleine nature, parfait pour se relaxer après une journée d'exploration.</p>
            </div>
          </div>

          <div className="distance-info">
            <h3>Distance du site</h3>
            <p>Nos bungalows et les autres installations sont situés le long de la route de Dobonandrina Ranomafana. Comme illustré sur la carte, les distances entre chaque point clé sont indiquées pour vous aider à planifier votre séjour et vos déplacements facilement.</p>
            <img src={distanceMap} alt="Carte de la route de Dobonandrina Ranomafana" />
          </div>
        </section>

        {/* Nouvelle section des activités */}
        <section id="activities">
          <h2>Activités proposées</h2>
          <div className="activities-container">
            <div className="activity">
              <h3>Pêche</h3>
              <p>Profitez de la tranquillité des eaux et découvrez la pêche dans un cadre naturel et serein.</p>
            </div>
            <div className="activity">
              <h3>Randonnée</h3>
              <p>Explorez les sentiers naturels et découvrez des panoramas époustouflants lors de nos randonnées guidées.</p>
            </div>
            <div className="activity">
              <h3>Foot</h3>
              <p>Rejoignez une partie de foot sur notre terrain bien entretenu, entouré par la nature.</p>
            </div>
            <div className="activity">
              <h3>Pirogue</h3>
              <p>Vivez une aventure unique en pirogue sur les rivières locales, une expérience authentique et apaisante.</p>
            </div>
            <div className="activity">
              <h3>Pétanque</h3>
              <p>Participez à une partie de pétanque dans une ambiance conviviale et détendue.</p>
            </div>
            <div className="activity">
              <h3>Et bien plus encore...</h3>
              <p>Nous proposons de nombreuses autres activités pour tous les goûts et tous les âges. Il y en a pour tout le monde !</p>
            </div>
          </div>
        </section>

        <h2>Contact</h2>
        <div className="contact-info">
          <div className="contact-item">
            <h3>Siège de l'entreprise</h3>
            <p>LOT II N 146 Analamahintsy Antananarive</p>
          </div>
          <div className="contact-item">
            <h3>Numéro de téléphone</h3>
            <p>+261 34 83 893 32</p>
          </div>
          <div className="contact-item">
            <h3>Adresse e-mail</h3>
            <p>rindra3ti@gmail.com</p>
          </div>
        </div>

        {/* Modale pour afficher l'image en grand */}
        {isModalOpen && (
          <div className="modal" onClick={closeModal}>
            <div className="modal-content">
              <span className="close-button" onClick={closeModal}>&times;</span>
              <img src={modalImage} alt="Intérieur du bungalow" />
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default Home;
