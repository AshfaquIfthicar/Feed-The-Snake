import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase.js";
import { UserRound, X, LogOut, SquarePen, Check, Settings } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import SettingsPanel from "../SettingsPanel.jsx";

// Shortest username allowed.
const MIN_NAME = 3;

// Longest username allowed.
const MAX_NAME = 20;

function ProfileModal({
  isOpen,
  onClose,
  isDarkTheme,
  setIsDarkTheme,
  isSoundOn,
  setIsSoundOn,
}) {
  // Get the currently signed-in user from our shared authentication context.
  const { user } = useAuth();

  // The username currently shown on screen (starts from Supabase metadata).
  const [username, setUsername] = useState(user?.user_metadata?.username ?? "");

  // Are we editing the name right now?
  const [isEditing, setIsEditing] = useState(false);

  // The text typed in the name input while editing.
  const [draft, setDraft] = useState("");

  // Track whether a save request is currently running.
  const [isSaving, setIsSaving] = useState(false);

  // Track whether the logout request is currently running.
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Store an error message if saving or logging out fails.
  const [errorMessage, setErrorMessage] = useState("");

  // Used to focus the input when edit mode opens.
  const inputRef = useRef(null);

  // Track whether the profile's Settings view is open.
  const [showSettings, setShowSettings] = useState(false);

  // Keep the shown name in sync if the signed-in user changes.
  useEffect(() => {
    setUsername(user?.user_metadata?.username ?? "");
  }, [user]);

  // Reset edit mode every time the modal is opened or closed.
  useEffect(() => {
    setIsEditing(false);
    setErrorMessage("");
    setShowSettings(false);
  }, [isOpen]);

  // Focus and select the text as soon as edit mode starts.
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.select();
    }
  }, [isEditing]);

  // Open the name editor.
  function startEditing() {
    setDraft(username);
    setErrorMessage("");
    setIsEditing(true);
  }

  // Close the name editor without saving.
  function cancelEditing() {
    setDraft(username);
    setErrorMessage("");
    setIsEditing(false);
  }

  // Save the new username to Supabase.
  async function handleSaveName() {
    const cleanName = draft.trim();

    if (cleanName.length < MIN_NAME || cleanName.length > MAX_NAME) {
      setErrorMessage(
        `Username must be between ${MIN_NAME} and ${MAX_NAME} characters.`,
      );
      return;
    }

    // Nothing changed (or empty): just close the editor.
    if (!cleanName || cleanName === username) {
      cancelEditing();
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    // Update the username stored in the user's metadata.
    // NOTE: if you also keep usernames in a database table (for example the
    // leaderboard), update that table here too.
    const { error } = await supabase.auth.updateUser({
      data: { username: cleanName },
    });

    if (error) {
      setErrorMessage(error.message);
      setIsSaving(false);
      return;
    }

    setUsername(cleanName);
    setIsEditing(false);
    setIsSaving(false);
  }

  // Enter saves, Escape cancels the edit.
  function handleInputKeyDown(event) {
    if (event.key === "Enter") {
      handleSaveName();
    }

    if (event.key === "Escape") {
      // Stop the Escape key from also closing the whole modal.
      event.stopPropagation();
      cancelEditing();
    }
  }

  // Sign the current player out through Supabase.
  async function handleLogout() {
    // Prevent repeated logout requests.
    setIsLoggingOut(true);

    // Clear any previous error message.
    setErrorMessage("");

    // Ask Supabase to sign the player out.
    const { error } = await supabase.auth.signOut();

    // Handle a failed logout request.
    if (error) {
      setErrorMessage(error.message);
      setIsLoggingOut(false);
      return;
    }

    // Close the profile modal after successful logout.
    onClose();

    // Reset the loading state.
    setIsLoggingOut(false);
  }

  // Don't display anything when the modal is closed.
  if (!isOpen) {
    return null;
  }

  return (
    // The dark overlay covers the page behind the modal. Clicking it closes the modal.
    <div className="modal-backdrop" onClick={onClose}>
      {/* The profile modal itself */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-title"
        onClick={(event) => event.stopPropagation()}
        className="modal relative text-center"
      >
        {showSettings ? (
          <div>
            {/* Settings heading and shared settings controls */}
            <div className="mb-1 flex items-center justify-between">
              <h2 className="font-grotesk text-4xl font-bold tracking-tight text-ink">
                Settings
              </h2>

              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-mint hover:text-green-dark"
                aria-label="Close settings"
                onClick={() => setShowSettings(false)}
              >
                <X size={20} />
              </button>
            </div>

            <p className="mt-3 text-muted">Customize your game experience.</p>

            <div className="mt-6">
              <SettingsPanel
                isDarkTheme={isDarkTheme}
                setIsDarkTheme={setIsDarkTheme}
                isSoundOn={isSoundOn}
                setIsSoundOn={setIsSoundOn}
                showBackButton={false}
              />
            </div>
          </div>
        ) : (
          <>
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close profile"
              className="absolute right-4 top-4 rounded-md p-2 text-muted transition hover:bg-mint hover:text-ink"
            >
              <X size={20} />
            </button>

            {/* Screen-reader heading (the visible heading is the username below) */}
            <h2 id="profile-title" className="sr-only">
              Your profile
            </h2>

            {/* Profile icon */}
            <div className="mx-auto mb-6 mt-2 grid h-24 w-24 place-items-center bg-mint text-green-dark">
              <UserRound size={48} strokeWidth={1.8} />
            </div>

            {/* Username + pencil-square edit button */}
            <div className="flex min-h-11 items-center justify-center gap-3">
              {isEditing ? (
                <>
                  {/* Name input (uses the .form-field styles from index.css) */}
                  <div className="form-field min-w-0 flex-1">
                    <input
                      ref={inputRef}
                      type="text"
                      value={draft}
                      maxLength={MAX_NAME}
                      onChange={(event) => setDraft(event.target.value)}
                      onKeyDown={handleInputKeyDown}
                      aria-label="Edit username"
                      autoFocus
                      className="text-lg font-bold"
                    />
                  </div>

                  {/* Save (check) button */}
                  <button
                    type="button"
                    onClick={handleSaveName}
                    disabled={isSaving}
                    aria-label="Save username"
                    className="icon-btn bg-green-dark! border-green-dark! text-bg! disabled:opacity-50"
                  >
                    <Check size={20} />
                  </button>

                  {/* Cancel (X) button */}
                  <button
                    type="button"
                    onClick={cancelEditing}
                    aria-label="Cancel editing"
                    className="icon-btn"
                  >
                    <X size={20} />
                  </button>
                </>
              ) : (
                <>
                  <p className="break-words font-grotesk text-3xl font-bold leading-tight tracking-tight">
                    {username || "Username unavailable"}
                  </p>

                  {/* Pencil-square edit button */}
                  <button
                    type="button"
                    onClick={startEditing}
                    aria-label="Edit username"
                    className="icon-btn shrink-0"
                  >
                    <SquarePen size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Small hint while editing */}
            {isEditing && (
              <p className="label-mono mt-3 pt-4 pb-1">
                Enter to save · Esc to cancel
              </p>
            )}

            {/* Email from the signed-in Supabase user */}
            <p className="mt-3 break-words font-mono text-base text-muted">
              {user?.email ?? "Email unavailable"}
            </p>

            {/* Divider */}
            <hr className="my-7 h-px border-0 bg-border" />

            {/* Show an error if saving or logout fails */}
            {errorMessage && (
              <p role="alert" className="mb-4 text-sm text-red-600">
                {errorMessage}
              </p>
            )}

            {/* Settings button */}
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="btn-outline w-full"
            >
              <Settings size={18} />
              Settings
            </button>

            {/* Logout button */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="btn-text mt-3 inline-flex w-full items-center justify-center gap-2 text-ink! hover:text-green! disabled:opacity-50"
            >
              <LogOut size={18} />
              {isLoggingOut ? "Signing out..." : "Log out"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ProfileModal;
