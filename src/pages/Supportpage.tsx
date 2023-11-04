import React from "react";

function Supportpage() {
  return (
    <div className="theme-bg w-full md:4/5 flex flex-col md:flex-row items-center justify-center mb-6">
      <div className="md:h-[712px] w-full md:w-3/5 flex flex-col items-center p-8">
        {/* Image */}
        <img
          className="w-40 h-40"
          src="https://ucarecdn.com/2e1ea5d1-7a00-421b-bba9-d5540a55f236/-/preview/500x500/-/quality/smart/-/format/auto/"
          alt=""
        />

        {/* Text */}
        <p className="text-center text-lg md:text-2xl">
          Merci beaucoup de jouer à mon jeu. <br />
          Si vous souhaitez soutenir Gaufrle, vous pouvez m'offrir un café !
        </p>
      </div>
      <iframe
        id="kofiframe"
        src="https://ko-fi.com/221bbakerscript/?hidefeed=true&widget=true&embed=true&preview=true"
        style={{
          border: "none",
          height: "712px",
          padding: "4px",
          background: "#f9f9f9",
        }}
        title="221bbakerscript"
      ></iframe>
    </div>
  );
}

export default Supportpage;
