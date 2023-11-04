import React from "react";
import { IoCloseCircle } from "react-icons/io5";

type HowToPlayModalProps = {
  modal: boolean;
  setModal: React.Dispatch<React.SetStateAction<boolean>>;
};

function HowToPlayModal({ modal, setModal }: HowToPlayModalProps) {
  const handleCloseModal = () => {
    setModal(false);
    document.body.style.overflow = "unset";
  };

  React.useEffect(() => {
    if (modal) {
      document.body.style.overflow = "hidden";
    } else if (!modal) {
      document.body.style.overflow = "unset";
    }
  }, [modal]);
  return (
    <div className="bg-lmntDark bg-opacity-70 h-full w-full absolute top-0 left-0 flex flex-col items-center">
      {/* MODAL CONTENT */}
      <div className="w-full md:w-4/5 max-w-2xl theme-bg flex flex-col items-center h-screen overflow-y-auto relative theme-text">
        {/* CLOSE BUTTON */}
        <div className="flex flex-row items-center justify-between w-full">
          <div className="m-5 h-9 w-9">
            <span> </span>
          </div>
          <h3 className="uppercase text-xl md:text-2xl theme-text-accent">
            Comment jouer ?
          </h3>
          <button className="m-5" onClick={() => handleCloseModal()}>
            <IoCloseCircle className="theme-text text-4xl" />
          </button>
        </div>

        <div className="px-16 pb-16 overflow-y-auto gap-8 theme-text flex flex-col items-center">
          <p className="text-lg font-semibold">
            Réorganisez les lettres pour former les mots corrects,
            horizontalement et verticalement. Faites glisser les lettres
            n'importe où sur le tableau. Les lettres changent de couleur pour
            indiquer si elles sont dans la bonne position. Le nombre de coups
            restants est affiché sous le tableau.
          </p>

          {/* DIVIDER */}
          <div className="theme-divider"></div>

          <div className="w-full">
            <span className="text-lg font-semibold">
              Cette lettre est la bonne place :
            </span>

            <div className="flex flex-row items-center w-full justify-center mt-2">
              <div className="correct-cell">o</div>
              <div className="normal-cell">t</div>
              <div className="normal-cell">u</div>
              <div className="normal-cell">v</div>
              <div className="normal-cell">b</div>
            </div>
          </div>

          <div className="w-full">
            <span className="text-lg font-semibold">
              Cette lettre est dans le mot, mais à une position différente :
            </span>

            <div className="flex flex-row items-center w-full justify-center mt-2">
              <div className="normal-cell">i</div>
              <div className="line-or-column-cell">t</div>
              <div className="normal-cell">a</div>
              <div className="normal-cell">g</div>
              <div className="normal-cell">r</div>
            </div>
          </div>

          <div className="w-full">
            <span className="text-lg font-semibold">
              Cette lettre est dans le mot vertical, mais à une position
              différente :
            </span>

            <div className="flex flex-col items-center w-full justify-center mt-2">
              <div className="normal-cell">n</div>
              <div className="line-or-column-cell">o</div>
              <div className="normal-cell">l</div>
            </div>
          </div>

          <div className="w-full mb-6">
            <span className="text-lg font-semibold">
              Cette lettre se trouve sur un coin, donc <b>soit</b> le mot
              vertical contient cette lettre, <b>soit</b> le mot horizontal :
            </span>

            <div className="flex flex-row items-center justify-center w-full">
              <div className="grid grid-cols-3 w-fit mt-2">
                <div className="disabled-cell"></div>
                <div className="normal-cell">a</div>
                <div className="disabled-cell"></div>
                <div className="normal-cell">a</div>
                <div className="line-or-column-cell">n</div>
                <div className="normal-cell">n</div>
              </div>
            </div>
          </div>

          {/* SPECIAL CASES */}
          <div className="theme-divider"></div>
          <h3 className="uppercase text-2xl text-center my-2">
            Cas particuliers
          </h3>
          {/* DIVIDER */}
          <div className="theme-divider"></div>

          <span className="text-lg font-bold uppercase">
            La même lettre plusieurs fois dans un mot
          </span>

          <div>
            <span className="text-lg font-semibold">
              Dans ce cas, le mot ne doit contenir qu'un seul <b>T</b>, car le
              premier est mis en évidence, mais pas le second. Aucun des deux
              n'est dans la bonne position :
            </span>

            <div className="flex flex-row items-center w-full justify-center mt-2">
              <div className="correct-cell">v</div>
              <div className="line-or-column-cell">t</div>
              <div className="normal-cell">t</div>
              <div className="line-or-column-cell">a</div>
              <div className="correct-cell">e</div>
            </div>
          </div>

          <div>
            <span className="text-lg font-semibold">
              Une fois le "T" placé au bon endroit, le premier "T" n'est plus
              nécessaire dans ce mot et n'est donc plus mis en évidence :
            </span>

            <div className="flex flex-row items-center w-full justify-center mt-2">
              <div className="correct-cell">v</div>
              <div className="normal-cell">t</div>
              <div className="line-or-column-cell">a</div>
              <div className="correct-cell">t</div>
              <div className="correct-cell">e</div>
            </div>
          </div>

          {/* DIVIDER */}
          <div className="theme-divider"></div>

          <span className="text-lg font-bold uppercase">
            Le cas funky dingo
          </span>

          <div>
            <span className="text-lg font-semibold">
              Dans ce cas, le mot horizontal doit contenir un <b>N</b>, mais le
              mot vertical doit également contenir un <b>N</b> :
            </span>

            <div className="flex flex-row items-center justify-center w-full">
              <div className="grid grid-cols-5 w-fit mt-2">
                <div className="disabled-cell"></div>
                <div className="disabled-cell"></div>
                <div className="correct-cell">f</div>
                <div className="disabled-cell"></div>
                <div className="correct-cell">c</div>
                <div className="disabled-cell"></div>
                <div className="disabled-cell"></div>
                <div className="line-or-column-cell">n</div>
                <div className="disabled-cell"></div>
                <div className="normal-cell">u</div>
                <div className="correct-cell">d</div>
                <div className="line-or-column-cell">n</div>
                <div className="normal-cell">l</div>
                <div className="correct-cell">g</div>
                <div className="correct-cell">o</div>
                <div className="disabled-cell"></div>
                <div className="disabled-cell"></div>
                <div className="normal-cell">i</div>
                <div className="disabled-cell"></div>
                <div className="normal-cell">k</div>
                <div className="disabled-cell"></div>
                <div className="disabled-cell"></div>
                <div className="correct-cell">y</div>
                <div className="disabled-cell"></div>
                <div className="correct-cell">e</div>
              </div>
            </div>
          </div>

          <div>
            <span className="text-lg font-semibold">
              Cela ne signifie pas nécessairement que les deux <b>N</b> doivent
              être utilisés dans ces deux mots. Dans cet exemple particulier,
              les deux mots contiennent un <b>N</b> au milieu, et l'autre
              appartient à <b>CLONE</b> :
            </span>

            <div className="flex flex-row items-center justify-center w-full">
              <div className="grid grid-cols-5 w-fit mt-2">
                <div className="disabled-cell"></div>
                <div className="disabled-cell"></div>
                <div className="correct-cell">f</div>
                <div className="disabled-cell"></div>
                <div className="correct-cell">c</div>
                <div className="disabled-cell"></div>
                <div className="disabled-cell"></div>
                <div className="correct-cell">u</div>
                <div className="disabled-cell"></div>
                <div className="correct-cell">l</div>
                <div className="correct-cell">d</div>
                <div className="correct-cell">i</div>
                <div className="correct-cell">n</div>
                <div className="correct-cell">g</div>
                <div className="correct-cell">o</div>
                <div className="disabled-cell"></div>
                <div className="disabled-cell"></div>
                <div className="correct-cell">k</div>
                <div className="disabled-cell"></div>
                <div className="correct-cell">n</div>
                <div className="disabled-cell"></div>
                <div className="disabled-cell"></div>
                <div className="correct-cell">y</div>
                <div className="disabled-cell"></div>
                <div className="correct-cell">e</div>
              </div>
            </div>

            <span className="text-lg font-semibold">
              Les lettres surlignées indiquent simplement qu'une lettre (dans ce
              cas, <b>N</b>) se trouve dans le mot mystère. Cela ne signifie pas
              que ce <b>N </b>
              particulier doit y répondre.
            </span>
          </div>

          {/* DIVIDER */}
          <div className="theme-divider"></div>

          {/* CREDITS */}
          <div className="flex flex-col items-start w-full">
            <span>
              inspiré par{" "}
              <a className="text-moon" href="https://www.wafflegame.net">
                wafflegame.net
              </a>
            </span>
            <span>
              créé par{" "}
              <a
                className="text-moon"
                href="https://www.linkedin.com/in/william-louis-louisy"
              >
                William Louis-Louisy
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HowToPlayModal;
