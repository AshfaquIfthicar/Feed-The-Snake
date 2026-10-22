import {
  Play,
  RotateCcw,
  Home,
  X,
  Settings,
  Volume2,
  VolumeX,
  Sun,
  Moon,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import SettingsPanel from "../SettingsPanel.jsx";

function PauseMenuModal({
  onResume,
  onRestart,
  isDarkTheme,
  setIsDarkTheme,
  isSoundOn,
  setIsSoundOn,
}) {
  const navigate = useNavigate();

  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <section className="modal w-full max-w-md p-8">
        {showSettings ? (
          <div>
            {/* Settings heading and close button */}
            <div className="mb-1 flex items-center justify-between">
              <h2 className="font-grotesk text-4xl font-bold tracking-tight text-ink">
                Settings
              </h2>

              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-mint hover:text-green-dark"
                aria-label="Close settings and resume game"
                onClick={onResume}
              >
                <X size={20} />
              </button>
            </div>

            <p className="mt-3 text-muted">Customize your game experience.</p>

            {/* Reuse the shared Sound and Theme controls. */}
            <div className="mt-6">
              <SettingsPanel
                isDarkTheme={isDarkTheme}
                setIsDarkTheme={setIsDarkTheme}
                isSoundOn={isSoundOn}
                setIsSoundOn={setIsSoundOn}
                showBackButton={true}
                onBack={() => setShowSettings(false)}
              />
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-1 flex items-center justify-between">
              <h2 className="font-grotesk text-4xl font-bold tracking-tight text-ink">
                Game Paused
              </h2>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-md  text-muted transition-colors hover:bg-mint hover:text-green-dark"
                aria-label="Close pause menu"
                onClick={onResume}
              >
                <X size={20} />
              </button>
            </div>
            <p className="mt-3 text-muted">
              Your snake is waiting. Ready when you are.
            </p>
            <button
              type="button"
              className="btn-primary flex w-full items-center justify-center gap-2 mt-3"
              onClick={onResume}
            >
              <Play size={18} className="fill-slate-400 " />
              Resume Button
            </button>
            <button
              type="button"
              className="btn-outline flex w-full items-center justify-center gap-2 mt-3"
              onClick={() => {
                onRestart();
                onResume();
              }}
            >
              <RotateCcw size={18} />
              Restart Game
            </button>
            <button
              type="button"
              className="btn-outline flex w-full items-center justify-center gap-2 mt-3"
              onClick={() => setShowSettings(true)}
            >
              <Settings size={18} />
              Settings
            </button>
            <button
              type="button"
              className="btn-text flex w-full items-center justify-center gap-2 mt-3"
              onClick={() => navigate("/")}
            >
              <Home size={18} />
              Back to Home
            </button>{" "}
          </div>
        )}
      </section>
    </div>
  );
}

export default PauseMenuModal;
