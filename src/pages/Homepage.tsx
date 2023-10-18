import { CTA } from "../utils/CTA";
import CtaHome from "../components/CtaHome";

function Homepage() {
  return (
    <div className="md:w-4/5 flex flex-col items-center px-4 py-8 md:py-16 gap-8 min-h-[calc(100vh-64px)]">
      <h1 className="text-3xl text-center uppercase theme-text-accent">
        Transformez le chaos en mots!
      </h1>

      <h2 className="text-lg md:text-xl">
        Découvrez le jeu quotidien qui mettra votre vocabulaire à l'épreuve.
      </h2>

      {/* CALL TO ACTIONS */}
      <div className="flex flex-col md:flex-row md:justify-center gap-8 w-full md:my-8">
        {CTA.map((cta) => (
          <CtaHome
            key={cta.title}
            mode={cta.mode}
            title={cta.title}
            description={cta.description}
            cellsNumber={cta.cellsNumber}
            colsNumber={cta.colsNumber}
          />
        ))}
      </div>
    </div>
  );
}

export default Homepage;
