import { useState } from "react";
import { ArrowRight, X, Eye, EyeOff } from "lucide-react";
import { supabase } from "../../lib/supabase.js";

// Create the login modal component.
function LoginModal({ isOpen, onClose, onLoginSuccess, onSignupClick }) {
  // Store the email and password entered by the player.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Control whether the password is visible.
  const [showPassword, setShowPassword] = useState(false);

  // Track whether the login request is running.
  const [isLoading, setIsLoading] = useState(false);

  // Store an error message if login fails.
  const [errorMessage, setErrorMessage] = useState("");

  // Handle the login form submission.
  async function handleLogin(event) {
    // Prevent the browser from refreshing the page.
    event.preventDefault();

    // Clear any previous error.
    setErrorMessage("");

    // Prevent repeated submissions while logging in.
    setIsLoading(true);

    try {
      // Ask Supabase to sign in with the player's email and password.
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      // Handle any authentication error.
      if (error) {
        throw error;
      }

      // Tell the parent that login succeeded.
      onLoginSuccess();
    } catch (error) {
      // Show a readable message if login fails.
      setErrorMessage(error.message || "Login failed. Please try again.");
    } finally {
      // Re-enable the form after the request finishes.
      setIsLoading(false);
    }
  }

  // Don't render the modal when it is closed.
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="modal w-full max-w-md p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
      >
        {/* Modal heading and close button */}
        <div className="mb-1 flex items-center justify-between gap-2">
          <h2
            id="login-title"
            className="font-grotesk text-4xl font-bold tracking-tight text-ink text-left"
          >
            Welcome back.
          </h2>

          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-mint hover:text-green-dark"
            aria-label="Close login modal"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <p className="mt-1 mb-4 text-muted text-left">
          Sign in to continue your game.
        </p>

        {/* Login form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          {/* Email field */}
          <div className="form-field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="example@gmail.com"
              autoComplete="email"
              required
            />
          </div>

          {/* Password field */}
          <div className="form-field">
            <label htmlFor="login-password">Password</label>

            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                className="pr-12"
              />

              {/* Toggle password visibility */}
              <button
                type="button"
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted transition-colors hover:bg-mint hover:text-green-dark"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Display an error when login fails */}
          {errorMessage && (
            <p role="alert" className="text-sm text-orange">
              {errorMessage}
            </p>
          )}

          {/* Give new players a way to open the signup modal. */}
          <p className="mt-2 text-center text-sm text-muted">
            Don't have an account?{" "}
            <button
              type="button"
              className="font-semibold text-green-dark underline underline-offset-4"
              onClick={onSignupClick}
            >
              Sign up
            </button>
          </p>

          {/* Submit the login form */}
          <button
            type="submit"
            className="btn-primary mt-2 w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              "Signing in..."
            ) : (
              <>
                Sign in <ArrowRight />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginModal;
