import { X, Trophy } from "lucide-react";
import Leaderboard from "../Leaderboard.jsx";

//This component displays the Leaderboard inside a modal.
function LeaderboardModal({ onClose, refreshKey }) {
  return (
    //Dark background behind the modal.
    <div className="modal-backdrop" onClick={onClose}>
      {/* The Modal Window   */}
      <section className="modal leaderboard-modal" role="dialog">
        {/* Modale header */}
        <div className=" flex items-center justify-between">
          <div className=" flex items-center gap-4">
            <Trophy size={22} className="text-green-dark" />
            <h2
              id="leaderboard-title"
              className="font-grotesk text-xl font-bold text-ink"
            >
              Leaderboard
            </h2>
            <span className="rounded-full bg-mint px-3 py-1 font-mono text-xs text-green-dark">
              TOP 10
            </span>
          </div>

          {/* Clicking X tells the parent to close the modal */}
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-mint hover:text-green-dark"
            onClick={onClose}
            aria-label="Close leaderboard"
          >
            <X size={20} />
          </button>
        </div>

        {/* Reuse the existing leaderboard component and its player rankings. */}
        <div className="mt-5">
          <Leaderboard refreshKey={refreshKey} />
        </div>
      </section>
    </div>
  );
}

export default LeaderboardModal;
