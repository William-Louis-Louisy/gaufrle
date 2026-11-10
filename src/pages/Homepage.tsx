import { CTA } from "../utils/CTA";
import CtaHome from "../components/CtaHome";
import PatchNotePanel from "../components/PatchNotePanel";

function Homepage() {
  return (
    <div className="md:w-4/5 flex flex-col items-center px-4 md:px-0 gap-8 min-h-[calc(100dvh-112px)]">
      <div className="flex flex-col items-center relative h-44 w-full mt-1">
        <img
          className="object-cover w-full h-full blur-[2px]"
          src="/images/banner.webp"
          alt="Le pays des gaufres"
        />
        <img
          className="w-32 h-32 absolute -bottom-2"
          src="/images/mascot.webp"
          alt="La gaufre mascotte"
        />
      </div>

      <h1 className="text-3xl text-center uppercase theme-text-accent">
        Transformez le chaos en mots !
      </h1>

      <h3 className="text-lg md:text-xl">
        Découvrez le jeu quotidien qui mettra votre vocabulaire à l'épreuve.
      </h3>

      {/* CALL TO ACTIONS */}
      <div className="flex flex-col md:flex-row md:justify-center gap-8 w-full">
        {CTA.map((cta) => (
          <CtaHome
            key={cta.title}
            mode={cta.mode}
            title={cta.title}
            description={cta.description}
            cellsNumber={cta.cellsNumber}
            colsNumber={cta.colsNumber}
            href={cta.href}
          />
        ))}
      </div>

      {/* Patch Note Panel */}
      <PatchNotePanel />
    </div>
  );
}

export default Homepage;
