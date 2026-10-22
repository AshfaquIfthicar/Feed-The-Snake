import { UserRound, Pause, Trophy } from "lucide-react";
import { Link, useLocation } from "react-router";
import PlayerCard from "../components/PlayerCard.jsx";
import GameBoard from "../components/GameBoard.jsx";
import Leaderboard from "../components/Leaderboard.jsx";
import PauseMenuModal from "../components/modals/PauseMenuModal.jsx";
import LeaderboardModal from "../components/modals/LeaderboardModal.jsx";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import ProfileModal from "../components/modals/ProfileModal.jsx";

function GamePage({ isDarkTheme, setIsDarkTheme, isSoundOn, setIsSoundOn }) {
  // When a player finishes a game, Supabase needs to know who earned that score.
  const { user } = useAuth();

  // Read the information passed from the landing page.
  const location = useLocation();

  // Get the selected game mode, defaulting to Classic if none was provided.
  const gameMode = location.state?.gameMode ?? "classic";

  // Get the selected diffuculty mode, defaulting to Normal if none was provided.
  const difficulty = location.state?.difficulty ?? "normal";

  const [isPaused, setIsPaused] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  // Track whether the profile modal is open.
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Track when the leaderboard needs to refresh its data.
  const [leaderboardRefreshKey, setLeaderboardRefreshKey] = useState(0);

  // Track the current score so other components can display it.
  const [score, setScore] = useState(0);

  // Store the player's best score retrieved from Supabase.
  // Start at zero while we load the saved record.
  const [highScore, setHighScore] = useState(0);

  // Track the current game round so we can restart the board.
  const [gameRound, setGameRound] = useState(0);

  // Update the best score immediately when the current score beats it.
  useEffect(() => {
    // Only update the best score if the current score is higher.
    if (score > highScore) {
      setHighScore(score);
    }
  }, [score, highScore]);

  // Save the player's score when a game round finishes.
  async function handleGameOver({
    score: finalScore, // The final score achieved in this round.
    gameMode: finalGameMode, // The mode played: "classic" or "wrap".
    difficulty: finalDifficulty, // The difficulty: "normal" or "hard".
  }) {
    // Stop here if no player is signed in.
    if (!user) return;

    // Ask Supabase to save or update this player's best score.
    // The database identifies the player from their authenticated session.
    const { error } = await supabase.rpc("save_best_score", {
      p_score: finalScore,
      p_game_mode: finalGameMode,
      p_difficulty: finalDifficulty,
    });

    // If Supabase rejects the save, report the error and stop here.
    if (error) {
      console.error("Failed to save score:", error.message);
      return;
    }

    // Refresh the leaderboard after the score saves successfully.
    setLeaderboardRefreshKey((currentKey) => currentKey + 1);
  }

  // Start a fresf round when the player choose replay.
  function handleReplay() {
    // Reser the player's score for the new round.
    setScore(0);

    // Tell react to creaate a fresh gameboard.
    setGameRound((currentRound) => currentRound + 1);
  }

  // Load the player's best score from Supabase.
  // Run again when the player, game mode, or difficulty changes.
  useEffect(() => {
    // Wait until we have a signed-in user.
    if (!user) return;

    // Track whether this effect is still active.
    // This prevents an old request from updating the state
    // after the component has changed or unmounted.
    let isActive = true;

    async function loadBestScore() {
      // Find this player's record for the selected mode and difficulty.
      const { data, error } = await supabase
        .from("scores")
        .select("score")
        .eq("user_id", user.id)
        .eq("game_mode", gameMode)
        .eq("difficulty", difficulty)
        .maybeSingle();

      // Report database errors so we can troubleshoot them.
      if (error) {
        console.error("Failed to load best score:", error.message);
        return;
      }

      // Use the saved score, or zero if no record exists.
      if (isActive) {
        setHighScore(data?.score ?? 0);
      }
    }

    // Start loading the saved best score.
    loadBestScore();

    // Mark this request as inactive when the effect cleans up.
    return () => {
      isActive = false;
    };
  }, [user, gameMode, difficulty]);

  // Allow the player to pause and resume using the keyboard.
  useEffect(() => {
    function handlePauseKey(event) {
      // Ignore shorcuts when typing in an input field.
      const target = event.target;
      const isTyping =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

      if (isTyping || event.repeat) return;

      // Space or P toggles pause and resume.
      if (event.code === "Space" || event.key.toLowerCase() === "p") {
        event.preventDefault();
        setIsPaused((paused) => !paused);
      }
    }

    window.addEventListener("keydown", handlePauseKey);

    return () => {
      window.removeEventListener("keydown", handlePauseKey);
    };
  }, []);

  return (
    <main className="min-h-dvh px-2.5 py-4 sm:px-8 sm:py-5 lg:min-h-screen">
      {/* Mobile-only header: hidden on desktop */}
      <header className="mb-2.5 flex items-center justify-between lg:hidden">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="grid h-8 w-7 grid-cols-3 grid-rows-3">
            <span className="col-start-2 row-start-1 bg-green-dark" />
            <span className="col-start-3 row-start-1 bg-green-dark" />
            <span className="col-start-1 row-start-2 bg-green-dark" />
            <span className="col-start-2 row-start-2 bg-green-dark" />
          </div>

          <span className="font-grotesk text-lg font-medium tracking-tight text-ink">
            feed the snake
            <span className="ml-1 text-green-light">.</span>
          </span>
        </Link>

        {/* Sign-in button */}
        <button
          type="button"
          className="btn-outline"
          onClick={() => {
            setIsPaused(true);
            setIsProfileOpen(true);
          }}
        >
          <UserRound size={18} />
          <span>{user ? "Profile" : "Sign in"}</span>
        </button>
      </header>

      {/* Three-column game layout */}
      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 lg:grid-cols-[251px_minmax(0,1fr)_311px] lg:gap-5">
        {/* Left column */}
        <div className="flex flex-col gap-5">
          <Link to="/" className="hidden lg:flex items-center gap-3">
            <div className="grid h-8 w-7 grid-cols-3 grid-rows-3">
              <span className="col-start-2 row-start-1 bg-green-dark" />
              <span className="col-start-3 row-start-1 bg-green-dark" />
              <span className="col-start-1 row-start-2 bg-green-dark" />
              <span className="col-start-2 row-start-2 bg-green-dark" />
            </div>

            <span className="font-grotesk text-lg font-medium tracking-tight text-ink">
              feed the snake
              <span className="ml-1 text-green-light">.</span>
            </span>
          </Link>

          <div>
            <p className="eyebrow mb-3">PLAYER PROFILE</p>
            <PlayerCard
              score={score}
              highScore={highScore}
              onPause={() => setIsPaused(true)}
            />
          </div>
        </div>

        {/* Centre column */}
        <div className="flex flex-col gap-3">
          <GameBoard
            key={gameRound}
            gameMode={gameMode}
            difficulty={difficulty}
            score={score}
            highScore={highScore}
            setScore={setScore}
            onReplay={handleReplay}
            isPaused={isPaused}
            isSoundOn={isSoundOn}
            onGameOver={handleGameOver}
          />

          {/* Mobile-only game buttons */}
          <div className="grid grid-cols-2 gap-3 lg:hidden">
            <button
              type="button"
              className="btn-outline flex items-center justify-center gap-2"
              onClick={() => setIsPaused(true)}
            >
              <Pause size={18} />
              <span>Pause</span>
            </button>
            <button
              type="button"
              className="btn-primary flex items-center justify-center gap-2"
              onClick={() => {
                // Pause the game while the leaderboard is open.
                setIsPaused(true);

                // Open the leaderboard modal.
                setIsLeaderboardOpen(true);

                // Refresh the leaderboard and personal rank.
                setLeaderboardRefreshKey((currentKey) => currentKey + 1);
              }}
            >
              <Trophy size={18} />
              <span>Leaderboard</span>
            </button>
          </div>
        </div>

        {/* Right column */}
        <div className="hidden lg:flex flex-col gap-5 lg:h-[calc(100svh-40px)] lg:min-h-0">
          <div className="hidden lg:flex min-h-7 items-center justify-end">
            <button
              type="button"
              className="btn-outline"
              onClick={() => {
                setIsPaused(true);
                setIsProfileOpen(true);
              }}
            >
              <UserRound size={18} />
              <span>{user ? "Profile" : "Sign in"}</span>
            </button>
          </div>

          <div className="hidden lg:block">
            <p className="eyebrow mb-3">LEADERBOARD</p>
            <Leaderboard refreshKey={leaderboardRefreshKey} />
          </div>
        </div>
      </section>

      {isPaused && (
        <PauseMenuModal
          onRestart={handleReplay}
          onResume={() => setIsPaused(false)}
          isDarkTheme={isDarkTheme}
          setIsDarkTheme={setIsDarkTheme}
          isSoundOn={isSoundOn}
          setIsSoundOn={setIsSoundOn}
        />
      )}

      {/* Show the profile modal when the player opens their profile. */}
      {isProfileOpen && (
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          isDarkTheme={isDarkTheme}
          setIsDarkTheme={setIsDarkTheme}
          isSoundOn={isSoundOn}
          setIsSoundOn={setIsSoundOn}
        />
      )}

      {/* Show the leaderboard modal only when its state is true. */}
      {isLeaderboardOpen && (
        <LeaderboardModal
          onClose={() => setIsLeaderboardOpen(false)}
          refreshKey={leaderboardRefreshKey}
        />
      )}
    </main>
  );
}

export default GamePage;
