import { UserRound, Pause } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

function PlayerCard({ onPause, score, highScore }) {
  // Get the currently signed-in user from the authentication context.
  const { user } = useAuth();

  // Store the username retrieved from the Supabase profile.
  const [username, setUsername] = useState("");

  // Load the signed-in player's username from their Supabase profile.
  useEffect(() => {
    // Clear the username if nobody is signed in.
    if (!user) {
      setUsername("");
      return;
    }

    // Track whether this effect is still active.
    let isActive = true;

    async function loadUsername() {
      // Find the profile belonging to the signed-in user.
      // Ask Supabase for the signed-in player's username.
      const { data, error } = await supabase.rpc("get_my_username");

      // Report database errors so we can troubleshoot them.
      if (error) {
        console.error("Failed to load username:", error.message);
        return;
      }

      // Store the username if this request is still active.
      if (isActive) {
        // Store the username returned by the database function.
        setUsername(data ?? "");
      }
    }

    // Start loading the profile.
    loadUsername();

    // Prevent outdated requests from updating state.
    return () => {
      isActive = false;
    };
  }, [user]);

  return (
    <section className="card !p-3 lg:!p-6">
      {/* Pause Button */}
      <div className="hidden lg:flex justify-start">
        <button
          type="button"
          className="icon-btn"
          aria-label="Pause game"
          onClick={onPause}
        >
          <Pause size={20} />
        </button>
      </div>

      <div className="flex flex-row lg:flex-col items-center lg:items-stretch gap-4 lg:gap-0">
        {/* Player identity */}
        <div className="flex min-w-0 flex-1 flex-row lg:flex-col items-center gap-3 text-left lg:text-center">
          <div className="flex h-12 lg:h-16 w-12 lg:w-16 shrink-0 items-center justify-center rounded-lg bg-mint text-green-dark">
            <UserRound size={24} className="lg:hidden" />
            <UserRound size={30} className="hidden lg:block" />
          </div>

          <div>
            <p className="label-mono">PLAYER</p>
            <h2 className="font-grotesk text-lg lg:text-[26px] font-bold text-ink text-nowrap">
              {username || "Player"}
            </h2>
          </div>
        </div>

        {/* Score statistics */}
        <div className="min-w-0 self-center lg:self-stretch flex-1 mt-0 lg:mt-4 border-l lg:border-t border-border lg:border-l-0 px-3 lg:px-0 lg:pt-5">
          <p className="label-mono mb-4 hidden lg:block">SCORE</p>

          <div className="grid grid-cols-2 gap-2 lg:gap-4">
            <div>
              <p className="stat-label !mt-0 lg:!mt-1">CURRENT</p>
              <p className="font-mono text-2xl sm:text-3xl lg:text-[49px] leading-none font-medium text-ink">
                {String(score).padStart(3, "0")}
              </p>
            </div>

            <div>
              <p className="stat-label !mt-0 lg:!mt-1">BEST</p>
              <p className="font-mono text-2xl sm:text-3xl lg:text-[49px] leading-none font-medium text-ink">
                {String(highScore).padStart(3, "0")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PlayerCard;
