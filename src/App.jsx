import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router";
import { useState, useEffect } from "react";
import LandingPage from "./pages/LandingPage.jsx";
import GamePage from "./pages/GamePage.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";

function ProtectedGameRoute({
  isCheckingSession,
  isAuthenticated,
  isDarkTheme,
  setIsDarkTheme,
  isSoundOn,
  setIsSoundOn,
}) {
  // Read the current route and its navigation state.
  const location = useLocation();

  // Check whether the player selected a valid game mode and difficulty.
  const hasSelectedGame =
    (location.state?.gameMode === "classic" ||
      location.state?.gameMode === "wrap") &&
    (location.state?.difficulty === "normal" ||
      location.state?.difficulty === "hard");

  // Wait until the authentication check is complete.
  if (isCheckingSession) {
    return <p>Checking your login...</p>;
  }

  // Redirect logged-out players to the home page.
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Redirect players who skipped game-mode selection.
  if (!hasSelectedGame) {
    return <Navigate to="/" replace />;
  }

  // Both checks passed: render the game.
  return (
    <GamePage
      isDarkTheme={isDarkTheme}
      setIsDarkTheme={setIsDarkTheme}
      isSoundOn={isSoundOn}
      setIsSoundOn={setIsSoundOn}
    />
  );
}

function AppRoutes({ isDarkTheme, setIsDarkTheme, isSoundOn, setIsSoundOn }) {
  // Read the shared authentication state from AuthContext.
  const { user, isLoading } = useAuth();

  // Convert the user object into a simple true/false value.
  const isAuthenticated = Boolean(user);

  // Use the context's loading state while checking the session.
  const isCheckingSession = isLoading;

  return (
    <Routes>
      <Route
        path="/"
        element={
          <LandingPage
            isDarkTheme={isDarkTheme}
            setIsDarkTheme={setIsDarkTheme}
            isSoundOn={isSoundOn}
            setIsSoundOn={setIsSoundOn}
          />
        }
      />

      <Route
        path="/game"
        element={
          <ProtectedGameRoute
            isCheckingSession={isCheckingSession}
            isAuthenticated={isAuthenticated}
            isDarkTheme={isDarkTheme}
            setIsDarkTheme={setIsDarkTheme}
            isSoundOn={isSoundOn}
            setIsSoundOn={setIsSoundOn}
          />
        }
      />
    </Routes>
  );
}

function App() {
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const savedTheme = localStorage.getItem("snake-theme");
    return savedTheme === "dark";
  });

  // Load the saved sound preferences when the app starts.
  const [isSoundOn, setIsSoundOn] = useState(() => {
    const savedSoundSetting = localStorage.getItem("snake-sound-on");

    // Sound is enabled by default if no preference has been saved.
    return savedSoundSetting === null ? true : savedSoundSetting === "true";
  });

  useEffect(() => {
    localStorage.setItem("snake-theme", isDarkTheme ? "dark" : "light");
  }, [isDarkTheme]);

  // Save the sound preference whenever it changes.
  useEffect(() => {
    localStorage.setItem("snake-sound-on", String(isSoundOn));
  }, [isSoundOn]);

  return (
    <div id="app-theme" data-theme={isDarkTheme ? "dark" : "light"}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes
            isDarkTheme={isDarkTheme}
            setIsDarkTheme={setIsDarkTheme}
            isSoundOn={isSoundOn}
            setIsSoundOn={setIsSoundOn}
          />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
