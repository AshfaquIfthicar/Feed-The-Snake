import { useState } from "react";
import { supabase } from "../../lib/supabase.js";
import { ArrowRight, X, Eye, EyeOff } from "lucide-react";

// Define the signup modal component.
// isOpen controls visibility, and onClose lets the parent close it.
function SignupModal({ isOpen, onClose, onSignupSuccess, onLoginClick }) {
  // Store what the player types into each form field.
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Control whether the password is visible or hidden.
  const [showPassword, setShowPassword] = useState(false);

  // Track whether the signup request is in progress.
  const [isLoading, setIsLoading] = useState(false);

  // Store an error message if signup fails.
  const [errorMessage, setErrorMessage] = useState("");

  // Store a message when signup succeeds but email confirmation is needed.
  const [successMessage, setSuccessMessage] = useState("");

  // Handle the signup form submission.
  async function handleSignup(event) {
    // Stop the browser from refreshing the page when the form submits.
    event.preventDefault();

    // Clear any error left over from an earlier attempt.
    setErrorMessage("");

    // Clear any success message from an earlier attempt.
    setSuccessMessage("");

    // Prevent another signup request while one is already running.
    setIsLoading(true);

    try {
      // Check whether the chosen username is available.
      const { data: isUsernameAvailable, error: usernameCheckError } =
        await supabase.rpc("is_username_available", {
          requested_username: username.trim(),
        });

      // Stop if the username check itself fails.
      if (usernameCheckError) {
        throw usernameCheckError;
      }

      // Show a friendly message if the username is already taken.
      if (!isUsernameAvailable) {
        setErrorMessage(
          "This username is already taken. Please choose another.",
        );
        return;
      }

      // Ask Supabase Auth to create a new account.
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          // Pass the username as signup metadata.
          // Your database triggers reads this value to create the profile.
          data: {
            username: username.trim(),
          },
        },
      });

      // Supabase reports signup errors here.
      if (error) {
        throw error;
      }

      // If Supabase created an active session, the player can continue.
      if (data.session) {
        onSignupSuccess();
      } else {
        // No active session usually means email confirmation is required.
        setSuccessMessage(
          "Account created! Please check your email to confirm your account before playing.",
        );
      }
    } catch (error) {
      // Show a helpful message if this email already has an account.
      if (error.message?.toLowerCase().includes("already registered")) {
        setErrorMessage(
          "An account with this email already exists. Please sign in instead.",
        );
      } else {
        // Show the original error for any other signup problem.
        setErrorMessage(error.message || "Signup failed. Please try again.");
      }
    } finally {
      // Always reset the loading state after signup finishes.
      setIsLoading(false);
    }
  }

  // If the parent says the modal is closed, render nothing.
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="modal w-full max-w-md p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="signup-title"
      >
        {/* Modal heading and close button */}
        <div className="mb-1 flex items-center justify-between gap-0">
          <div>
            <h2
              id="signup-title"
              className="font-grotesk text-4xl font-bold tracking-tight text-ink text-left"
            >
              Join the board.
            </h2>
          </div>

          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-mint hover:text-green-dark"
            aria-label="Close signup modal"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <p className="mt-1 mb-2  text-muted text-left text-nowrap">
          Create an account to save your scores.
        </p>

        {/* Signup form */}
        <form onSubmit={handleSignup} className="flex flex-col gap-2">
          <div className="form-field">
            <label htmlFor="signup-username">Username</label>
            <input
              id="signup-username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="your_name"
              minLength={3}
              maxLength={20}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="example@gmail.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="signup-password">Password</label>

            <div className="relative">
              {/* Input Field */}
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
                className="pr-12"
              />

              {/* Toggle password visibility when clicked} */}
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

          {/* Display an error if signup fails */}
          {errorMessage && (
            <p role="alert" className="text-sm text-orange">
              {errorMessage}
            </p>
          )}

          {/* Display confirmation guidance if no session is returned */}
          {successMessage && (
            <p role="status" className="text-sm text-muted">
              {successMessage}
            </p>
          )}

          {/* Give existing players a way to open the login modal. */}
          <p className="mt-3 text-center text-sm text-muted">
            Already have an account?{" "}
            <button
              type="button"
              className="font-semibold text-green-dark underline underline-offset-4"
              onClick={onLoginClick}
            >
              Sign in
            </button>
          </p>

          <button
            type="submit"
            className="btn-primary mt-1 w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              "Creating account..."
            ) : (
              <>
                Start <ArrowRight />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// Make this component available to other files.
export default SignupModal;
