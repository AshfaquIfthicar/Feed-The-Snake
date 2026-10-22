import { useState, useEffect } from "react";
import { useLocation } from "react-router";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

function Leaderboard({ refreshKey }) {
  // Read the selected game mode and difficulty from the page navigation.
  const location = useLocation();
  const gameMode = location.state?.gameMode ?? "classic";
  const difficulty = location.state?.difficulty ?? "normal";

  // Get the currently signed-in player.
  const { user } = useAuth();

  // Store the leaderboard rows returned by Supabase.
  const [players, setPlayers] = useState([]);

  // Track whether the leaderboard is still loading.
  const [isLoading, setIsLoading] = useState(true);

  // Store the signed-in player's rank.
  const [yourRank, setYourRank] = useState(null);

  // Store the signed-in player's best score for this mode and difficulty.
  const [yourBestScore, setYourBestScore] = useState(0);

  // Fetch the leaderboard whenever the player, mode, or difficulty changes.
  useEffect(() => {
    // Track whether this effect is still active.
    let isActive = true;

    async function loadLeaderboard() {
      // Show the loading state while requesting the data.
      setIsLoading(true);

      // The leaderboard function requires a signed-in player.
      if (!user) {
        setPlayers([]);
        setIsLoading(false);
        return;
      }

      // Ask Supabase for the leaderboard matching this game mode and difficulty.
      const { data, error } = await supabase.rpc("get_leaderboard", {
        requested_mode: gameMode,
        requested_difficulty: difficulty,
      });

      // Check whether Supabase returned an error.
      if (error) {
        console.error("Failed to load leaderboard:", error.message);

        if (isActive) {
          setPlayers([]);
          setIsLoading(false);
        }

        return;
      }

      // Store the returned leaderboard rows in React state.
      if (isActive) {
        // Keep only the first 10 players returned by Supabase.
        setPlayers((data ?? []).slice(0, 10));
        setIsLoading(false);
      }
    }

    // Start loading the leaderboard.
    loadLeaderboard();

    // Prevent an old request from updating state after cleanup.
    return () => {
      isActive = false;
    };
    // Reload when the player, game settings, or refresh trigger changes.
  }, [user, gameMode, difficulty, refreshKey]);

  // Load the signed-in player's rank and best score.
  useEffect(() => {
    // Clear the previous player's data while loading new data.
    setYourRank(null);
    setYourBestScore(0);

    // A signed-in user is required to retrieve a personal rank.
    if (!user) return;

    // Track whether this effect is still active.
    let isActive = true;

    async function loadPlayerRank() {
      // Ask Supabase for this player's rank and best score.
      const { data, error } = await supabase.rpc("get_player_rank", {
        requested_mode: gameMode,
        requested_difficulty: difficulty,
      });

      // Report any database errors.
      if (error) {
        console.error("Failed to load player rank:", error.message);
        return;
      }

      // The function returns no row if the player has no positive score.
      const playerData = data?.[0];

      // Update the display if this request is still active.
      if (isActive) {
        setYourRank(playerData?.player_rank ?? null);
        setYourBestScore(playerData?.best_score ?? 0);
      }
    }

    // Start retrieving the player's data.
    loadPlayerRank();

    // Prevent an outdated request from updating the component.
    return () => {
      isActive = false;
    };
    // Reload personal rank when the refresh trigger changes too.
  }, [user, gameMode, difficulty, refreshKey]);

  return (
    <section className="card p-6">
      <div className="hidden lg:flex items-center justify-between ">
        <h2 className="font-grotesk text-xl font-bold text-ink">Leaderboard</h2>

        <span className="rounded-full bg-mint px-3 py-1 font-mono text-xs text-green-dark">
          TOP 10
        </span>
      </div>

      <div className="-mt-5 lg:mt-2">
        {/* Show a message while Supabase loads the leaderboard. */}
        {isLoading ? (
          <p className="py-6 text-center text-sm text-ink-muted">
            Loading leaderboard...
          </p>
        ) : players.length === 0 ? (
          // Explain why the list might be empty.
          <p className="py-6 text-center text-sm text-ink-muted">
            No scores yet. Be the first!
          </p>
        ) : (
          // Display the real leaderboard rows.
          players.map((player, index) => (
            <div key={player.username} className="leaderboard-row">
              <span className="leaderboard-rank">
                {String(index + 1).padStart(2, "0")}
              </span>

              <span className="flex-1 font-medium text-ink">
                {player.username}
              </span>

              <span className="leaderboard-score">{player.best_score}</span>
            </div>
          ))
        )}
      </div>

      <div className="mt-2 rounded-lg border border-border bg-mint p-4 py-1 lg:py-2">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <p className="stat-label">YOUR RANK</p>
            {yourRank === null ? "—" : `#${yourRank}`}
          </div>

          <div className="text-right">
            <p className="stat-label">YOUR SCORE</p>
            {yourBestScore}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Leaderboard;
