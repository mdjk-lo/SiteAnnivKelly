import { Lock } from 'lucide-react';
import './Legal.css';

export default function Confidentialite() {
  return (
    <div className="page-container legal-page">
      <div className="page-header">
        <h1><Lock size={28} /> Politique de confidentialité</h1>
        <p>Dernière mise à jour : juin 2026</p>
      </div>

      <div className="legal-content card">
        <h2>1. Responsable du traitement</h2>
        <p>Le responsable du traitement des données est l'organisateur du site AnnivKelly, accessible uniquement sur invitation.</p>

        <h2>2. Données collectées</h2>
        <p>Nous collectons les données suivantes :</p>
        <ul>
          <li>Prénom et nom</li>
          <li>Adresse email</li>
          <li>Photo de profil (optionnelle)</li>
          <li>Disponibilités renseignées</li>
          <li>Contributions déclarées (apports)</li>
          <li>Votes pour les artistes et musiques</li>
        </ul>

        <h2>3. Finalité</h2>
        <p>Ces données sont collectées uniquement pour organiser l'anniversaire de Kelly : planifier la date, coordonner les apports et construire la playlist de la soirée.</p>

        <h2>4. Durée de conservation</h2>
        <p>Les données sont conservées jusqu'à la fin de l'événement. Elles seront supprimées après l'anniversaire.</p>

        <h2>5. Partage des données</h2>
        <p>Vos données ne sont jamais vendues ni transmises à des tiers. Elles sont visibles uniquement par l'administrateur du site et partiellement par les autres invités (prénom, nom, contributions).</p>

        <h2>6. Vos droits (RGPD)</h2>
        <p>Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :</p>
        <ul>
          <li><strong>Droit d'accès</strong> : consulter vos données</li>
          <li><strong>Droit de rectification</strong> : modifier vos données depuis votre profil</li>
          <li><strong>Droit à l'effacement</strong> : demander la suppression de votre compte</li>
          <li><strong>Droit d'opposition</strong> : vous opposer au traitement</li>
        </ul>
        <p>Pour exercer ces droits, contactez l'organisateur directement.</p>

        <h2>7. Sécurité</h2>
        <p>Les accès sont protégés par authentification. Les données sont stockées sur un serveur local sécurisé accessible uniquement sur le réseau de l'organisateur.</p>

        <h2>8. Cookies</h2>
        <p>Le Site n'utilise pas de cookies tiers ni de traceurs publicitaires. Seul un token d'authentification est stocké localement dans votre navigateur pour maintenir votre session.</p>
      </div>
    </div>
  );
}
