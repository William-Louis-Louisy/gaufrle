import { CTA } from "../utils/CTA";
import CtaHome from "../components/CtaHome";

function Homepage() {
  return (
    <div className="md:w-4/5 flex flex-col items-center px-4 md:px-0 gap-8 min-h-[calc(100dvh-64px)]">
      <div className="flex flex-col items-center relative h-44 w-full mt-1">
        <img
          className="object-cover w-full h-full blur-[2px]"
          src="https://ucarecdn.com/684b6b61-d0cf-4b04-9d3b-2c08891f6e4e/DALLE20231020173242Illustrationofa4K2DchibilandscapedepictingawhimsicalworldinhabitedbywafflesRollinghillsmadeoffluffybatterriversofsyrupandwa.png"
          alt=""
        />
        <img
          className="w-32 h-32 absolute -bottom-2"
          src="https://ucarecdn.com/582f659c-89fe-413b-b273-49d84b9da0a3/-/preview/500x500/-/quality/smart/-/format/auto/"
          alt=""
        />
      </div>

      <h2 className="text-3xl text-center uppercase theme-text-accent">
        Transformez le chaos en mots !
      </h2>

      <h3 className="text-lg md:text-xl">
        Découvrez le jeu quotidien qui mettra votre vocabulaire à l'épreuve.
      </h3>

      {/* CALL TO ACTIONS */}
      <div className="flex flex-col md:flex-row md:justify-center gap-8 w-full mb-8">
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
    </div>
  );
}

export default Homepage;
