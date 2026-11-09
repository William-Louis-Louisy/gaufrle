import { Link } from "react-router-dom";

interface GridUnavailableProps {
  weekly?: boolean;
}

export default function GridUnavailable({ weekly = false }: GridUnavailableProps) {
  return (
    <section
      role="alert"
      className="theme-lmnt theme-text mt-16 w-full max-w-lg rounded-md p-8 text-center"
    >
      <h1 className="theme-text-accent mb-4 text-xl uppercase">
        Grille indisponible
      </h1>
      <p className="mb-6">
        {weekly
          ? "Aucune grille valide n'est disponible pour cette semaine."
          : "Aucune grille valide n'est disponible pour aujourd'hui."}
        {" "}Réessayez ultérieurement.
      </p>
      <Link
        to="/"
        className="theme-btn inline-block rounded-md px-4 py-2 font-bold"
      >
        Retour à l'accueil
      </Link>
    </section>
  );
}
