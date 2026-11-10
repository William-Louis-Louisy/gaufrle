import { useEffect, useState } from "react";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type NavigatorWithStandalone = Navigator & { standalone?: boolean };

function isInstalled(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as NavigatorWithStandalone).standalone === true
  );
}

/**
 * Chromium controls whether and when beforeinstallprompt is dispatched.
 * The alternative is honest installation guidance, not a fake browser prompt.
 */
export default function InstallApp() {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isInstalled);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handlePrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    };
    const handleInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
      setShowHelp(false);
    };

    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  if (installed) return null;

  const handleInstall = async () => {
    if (!promptEvent) {
      setShowHelp((previous) => !previous);
      return;
    }

    const pending = promptEvent;
    setPromptEvent(null);
    try {
      await pending.prompt();
      const { outcome } = await pending.userChoice;
      if (outcome === "accepted") setShowHelp(false);
    } catch {
      // The event is single-use. Show real browser instructions if it fails.
      setShowHelp(true);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleInstall}
        aria-expanded={showHelp}
        aria-controls="pwa-install-guide"
        className="theme-text-accent text-xs md:text-sm font-semibold underline underline-offset-4"
      >
        {promptEvent ? "Installer Gaufrle" : "Comment installer ?"}
      </button>
      {showHelp && (
        <div
          id="pwa-install-guide"
          role="note"
          className="absolute right-0 top-full z-50 mt-3 w-72 rounded-lg border p-4 theme-bg theme-text shadow-lg text-sm"
        >
          <p className="font-semibold mb-2">Installer Gaufrle</p>
          <p className="mb-2">
            Sur Chrome pour ordinateur, ouvrez le menu du navigateur puis
            sélectionnez l’option d’installation du site, si elle apparaît.
          </p>
          <p className="mb-2">
            Sur Chrome Android, ouvrez le menu ⋮ puis « Ajouter à l’écran d’accueil ».
          </p>
          <p>
            Sur iPhone, ouvrez le menu Partager de Safari puis
            « Sur l’écran d’accueil ».
          </p>
          <button
            type="button"
            className="mt-3 underline font-semibold"
            onClick={() => setShowHelp(false)}
          >
            Fermer
          </button>
        </div>
      )}
    </div>
  );
}
