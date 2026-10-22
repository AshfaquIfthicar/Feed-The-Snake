import { Flag, RotateCcw, House } from "lucide-react";
import { useNavigate } from "react-router";

function GameOverModal({ score, highScore, isWinner, onReplay }) {
  const navigate = useNavigate();

  return (
    <div className="modal-backdrop">
      {/* Game Over card goes here */}
      <section
        className="modal w-full max-w-[484px] !p-5 sm:!p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-over-title"
      >
        <div className="flex items-center  gap-2 lg:gap-4 mb-3">
          <div className="flex h-[60px] w-[60px] items-center justify-center bg-mint rounded-lg">
            <Flag size={24} className="text-green-dark" />
          </div>

          <div>
            {/* Small coral label above the final score */}
            <p className="flex flex-1 items-center font-mono font-bold text-xl tracking-[0.35em] text-orange ">
              {isWinner ? "YOU WIN!" : "GAME OVER"}
            </p>

            {/* Show a different message depending on the game result. */}
            <p className=" text-sm leading-relaxed text-muted">
              {isWinner
                ? "Amazing! You filled the entire board!"
                : "Nice try! Ready for another round?"}
            </p>
          </div>
        </div>

        {/* Main heading; we'll replace this placeholder with the actual score. */}
        <h2
          id="game-over-title"
          className="mt-4 font-grotesk text-7xl font-bold leading-none tracking-[-0.06em] text-green-dark sm:text-8xl"
        >
          {score}
        </h2>

        {/* Show the final score and the player's high score. */}
        <p className="mt-5 text-base text-muted sm:text-lg">
          Final score · High score {highScore}
        </p>

        {/* Actions the player can take after the game ends */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          {/* Restart Button} */}
          <button
            type="button"
            className="btn-primary flex items-center justify-center gap-2"
            onClick={onReplay}
          >
            <RotateCcw size={16} /> Replay
          </button>

          {/* Return Button*/}
          <button
            type="button"
            className="btn-outline flex items-center justify-center gap-2"
            onClick={() => navigate("/")}
          >
            <House size={16} />
            Home
          </button>
        </div>
      </section>
    </div>
  );
}

export default GameOverModal;
