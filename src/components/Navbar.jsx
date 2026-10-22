import { UserRound } from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";

function Navbar({ onSignInClick, onProfileClick }) {
  // Read the current login state from our shared authentication context.
  const { user, isLoading } = useAuth();

  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
      {/* Brand logo */}
      <Link to="/" className="flex items-center gap-3">
        <div className="grid h-10 w-8 grid-cols-5 grid-rows-3">
          <span className="col-start-3 row-start-1 bg-green-dark" />
          <span className="col-start-4 row-start-1 bg-green-dark" />
          <span className="col-start-5 row-start-1 bg-green-dark" />

          <span className="col-start-1 row-start-2 bg-green-dark" />
          <span className="col-start-2 row-start-2 bg-green-dark" />
          <span className="col-start-3 row-start-2 bg-green-dark" />
        </div>

        <span className="font-grotesk text-lg font-medium tracking-tight text-ink text-nowrap">
          feed the snake
          <span className="ml-1 text-green-light">.</span>
        </span>
      </Link>

      {/* Account button */}

      <button
        type="button"
        className="btn-outline"
        disabled={isLoading}
        onClick={user ? onProfileClick : onSignInClick}
      >
        <UserRound size={18} />
        <span className="hidden sm:inline text-nowrap">
          {isLoading ? "Loading..." : user ? "Profile" : "Sign in"}
        </span>
      </button>
    </header>
  );
}

export default Navbar;
