import { Shield } from 'lucide-react';
import './Legal.css';

export default function CGU() {
  return (
    <div className="page-container legal-page">
      <div className="page-header">
        <h1><Shield size={28} /> Conditions Générales d'Utilisation</h1>
        <p>Dernière mise à jour : juin 2026</p>
      </div>

      <div className="legal-content card">
        <h2>1. Objet</h2>
        <p>Le site AnnivKelly (ci-après "le Site") est une plateforme privée créée à l'occasion de l'anniversaire de Kelly. Il permet aux invités de s'inscrire, de renseigner leurs disponibilités, de déclarer leurs apports et de voter pour des artistes et musiques.</p>

        <h2>2. Accès au site</h2>
        <p>L'accès au Site est strictement réservé aux personnes ayant reçu une invitation. Toute tentative d'accès non autorisé est interdite. Le Site peut être suspendu à tout moment sans préavis.</p>

        <h2>3. Inscription</h2>
        <p>Pour utiliser le Site, l'utilisateur doit créer un compte avec un prénom, un nom et une adresse email valide. L'utilisateur est responsable de la confidentialité de ses identifiants.</p>

        <h2>4. Données personnelles</h2>
        <p>Les données collectées (nom, prénom, email, disponibilités, contributions) sont utilisées uniquement dans le cadre de l'organisation de l'événement. Elles ne sont pas transmises à des tiers. Conformément au RGPD, vous pouvez demander la suppression de vos données en contactant l'organisateur.</p>

        <h2>5. Contenu</h2>
        <p>L'utilisateur s'engage à ne pas publier de contenu offensant, illicite ou portant atteinte à la vie privée d'autrui. L'administrateur se réserve le droit de supprimer tout contenu inapproprié.</p>

        <h2>6. Propriété intellectuelle</h2>
        <p>Le Site et son contenu sont la propriété de l'organisateur. Toute reproduction sans autorisation est interdite.</p>

        <h2>7. Limitation de responsabilité</h2>
        <p>Le Site est fourni "tel quel" sans garantie de disponibilité. L'organisateur ne saurait être tenu responsable des dommages liés à l'utilisation du Site.</p>

        <h2>8. Contact</h2>
        <p>Pour toute question, contactez l'organisateur directement.</p>
      </div>
    </div>
  );
}
