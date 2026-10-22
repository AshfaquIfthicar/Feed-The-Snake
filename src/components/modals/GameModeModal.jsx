import { X, Play, Repeat2 } from "lucide-react";
import { useState } from "react";

function GameModeModal({ onClose, onSelectMode }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState("normal");

  return (
    <div className="modal-backdrop ">
      {/* The main modal panel. */}
      <section
        className="modal game-mode-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-mode-title"
      >
        {/* Modal header: title and close button. */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="game-mode-title"
              className="whitespace-nowrap font-grotesk text-xl font-bold tracking-tight text-ink sm:text-2xl text-left"
            >
              Choose Game Mode
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-muted">
              How do you want to play today?
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-mint hover:text-green-dark"
            aria-label="Close game mode selection"
          >
            <X size={20} />
          </button>
        </div>

        {/* Game mode selection cards */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          {/* Classic mode */}
          <button
            type="button"
            onClick={() => onSelectMode("classic", selectedDifficulty)}
            className="card-interactive flex items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-mint shadow-[var(--shadow-sm)] sm:block sm:p-5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-mint text-green-dark sm:mb-4 sm:h-11 sm:w-11">
              <Play size={22} />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-grotesk text-base font-bold text-ink sm:text-lg">
                Classic
              </h3>

              <p className="mt-1 text-sm leading-relaxed text-muted">
                Play the traditional way. Hit a wall and your run ends.
              </p>
            </div>
          </button>

          {/* Wrap-Around mode */}
          <button
            type="button"
            onClick={() => onSelectMode("wrap", selectedDifficulty)}
            className="card-interactive flex items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:border-greenbg-mint shadow-[var(--shadow-sm)] sm:block sm:p-5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-mint text-green-dark sm:mb-4 sm:h-11 sm:w-11">
              <Repeat2 size={22} />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-grotesk text-base font-bold text-ink sm:text-lg">
                Wrap-Around
              </h3>

              <p className="mt-1 text-sm leading-relaxed text-muted">
                Cross an edge and reappear on the opposite side.
              </p>
            </div>
          </button>
        </div>

        {/* Difficulty selection */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <h3 className="font-grotesk text-base font-bold text-ink">
            Difficulty
          </h3>

          <div className="flex rounded-full border border-border bg-mint p-1">
            <button
              type="button"
              onClick={() => setSelectedDifficulty("normal")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                selectedDifficulty === "normal"
                  ? "bg-green-dark text-white shadow-sm"
                  : "text-muted hover:text-ink"
              }`}
            >
              Normal
            </button>

            <button
              type="button"
              onClick={() => setSelectedDifficulty("hard")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                selectedDifficulty === "hard"
                  ? "bg-green-dark text-white shadow-sm"
                  : "text-muted hover:text-ink"
              }`}
            >
              Hard
            </button>
          </div>

          <p className="text-center text-xs leading-relaxed text-muted">
            {selectedDifficulty === "normal"
              ? "Start steady and speed up as you score."
              : "Start faster and speed up as you score."}
          </p>
        </div>
      </section>
    </div>
  );
}

export default GameModeModal;
