import { useState } from "react";
import { ArrowRight } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import GameModeModal from "../components/modals/GameModeModal.jsx";
import { useNavigate } from "react-router";
import SignupModal from "../components/modals/SignupModal.jsx";
import { supabase } from "../lib/supabase.js";
import ProfileModal from "../components/modals/ProfileModal.jsx";
import LoginModal from "../components/modals/LoginModal.jsx";

function LandingPage({ isDarkTheme, setIsDarkTheme, isSoundOn, setIsSoundOn }) {
  // Controls whether the Choose Game Mode Modal is visible
  const [showGameModeModal, setShowGameModeModal] = useState(false);

  // Controls whether the Signup Modal is visible.
  const [showSignupModal, setShowSignupModal] = useState(false);

  // Controls whether the Login Modal is visible.
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Controls whether the Profile Modal is visible.
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Allows us to navigate to another page.
  const navigate = useNavigate();

  // Rund when the player chooses a game mode.
  function handleSelectMode(mode, difficulty) {
    // Close the game mode modal.
    setShowGameModeModal(false);

    // Navigate to the game page and remember the selected mode and selected difficulty.
    navigate("/game", { state: { gameMode: mode, difficulty: difficulty } });
  }

  // Check whether the player is already logged in.
  async function handlePlayNow() {
    const { data, error } = await supabase.auth.getSession();

    // If checking the session fails, don't continue silently.
    if (error) {
      console.error("Could not check login session:", error.message);
      return;
    }

    // Existing session: go straight to game-mode selection.
    if (data.session) {
      setShowGameModeModal(true);
    } else {
      // No session: ask the player to sign up.
      setShowSignupModal(true);
    }
  }

  // Handle a successful signup.
  function handleSignupSuccess() {
    // Close the signup modal.
    setShowSignupModal(false);

    // Open the game mode selection modal.
    setShowGameModeModal(true);
  }

  // Handle a successful login.
  function handleLoginSuccess() {
    // Close the login modal.
    setShowLoginModal(false);

    // Open the game mode selection modal.
    setShowGameModeModal(true);
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12 text-center">
      <div className="absolute left-6 right-6 top-6 sm:left-10 sm:right-10 sm:top-8">
        <Navbar
          onSignInClick={() => setShowLoginModal(true)}
          onProfileClick={() => setShowProfileModal(true)}
        />
      </div>

      <section className="flex w-full max-w-2xl flex-col items-center">
        <p className="eyebrow mb-5">THE CLASSIC GAME, REIMAGINED</p>

        <h1 className="hero-title">
          Feed The
          <br />
          <span className="accent">Snake</span>.
        </h1>

        <p className="hero-sub mb-8">
          One little snake. Endless apples.
          <br className="hidden sm:block" />
          How long can you survive?
        </p>

        <button
          type="button"
          className="btn-primary min-w-44 mt-2"
          onClick={handlePlayNow}
        >
          Play Now
          <ArrowRight size={18} />
        </button>

        <div className="mt-12 flex items-center gap-3">
          <span className="h-px w-8 bg-border" />

          <p className="tagline">EAT. GROW. REPEAT.</p>

          <span className="h-px w-8 bg-border" />
        </div>
      </section>

      <footer className="absolute bottom-25 lg:bottom-5 px-4 text-center">
        <p className="label-mono">A LITTLE GAME OF BIG APPETITES</p>
      </footer>

      {/* Show the game mode modal only when requested. */}
      {showGameModeModal && (
        <GameModeModal
          onClose={() => setShowGameModeModal(false)}
          onSelectMode={handleSelectMode}
        />
      )}

      {/* Show the signup modal only when requested. */}
      {showSignupModal && (
        <SignupModal
          isOpen={showSignupModal}
          onClose={() => setShowSignupModal(false)}
          onSignupSuccess={handleSignupSuccess}
          onLoginClick={() => {
            setShowSignupModal(false);
            setShowLoginModal(true);
          }}
        />
      )}

      {/* Show the login modal only when requested. */}
      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
          onSignupClick={() => {
            setShowLoginModal(false);
            setShowSignupModal(true);
          }}
        />
      )}

      {/* Show the profile modal only when requested. */}
      {showProfileModal && (
        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          isDarkTheme={isDarkTheme}
          setIsDarkTheme={setIsDarkTheme}
          isSoundOn={isSoundOn}
          setIsSoundOn={setIsSoundOn}
        />
      )}
    </main>
  );
}

export default LandingPage;
