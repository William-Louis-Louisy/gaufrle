import React from "react";
import "../styles/errorPage.css";

export default function Errorpage() {
  return (
    <div className="col-view gap-4">
      <h1 className="text-4xl my-4 text-center">404 Page non trouvée</h1>

      <div>
        <h3 className="text-lg text-center">
          Il semblerait que vous vous soyez perdu...
        </h3>
        <h3 className="text-lg text-center">
          Vous pouvez retourner à la page d'accueil en cliquant sur le logo
        </h3>
        <h3 className="text-lg text-center">
          ou en cliquant sur le bouton ci-dessous
        </h3>
      </div>

      <div className="flex justify-center">
        <a href="/" className="px-3 py-2 rounded-md font-bold theme-btn">
          Retour à l'accueil
        </a>
      </div>

      <img
        className="w-52 h-52 image-to-animate"
        src="/images/not-found.webp"
        alt="Une gaufre perdue"
      />
    </div>
  );
}
