import { Volume2, VolumeX, Sun, Moon } from "lucide-react";

function SettingsPanel({
  isDarkTheme,
  setIsDarkTheme,
  isSoundOn,
  setIsSoundOn,
  showBackButton,
  onBack,
}) {
  return (
    <div>
      <div>
        {/* Sound and Theme settings share a two-column layout. */}
        <div className="grid grid-cols-2 gap-4">
          {/* Sound setting */}
          <button
            type="button"
            className="shadow-[var(--shadow-sm)] flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:bg-mint"
            onClick={() => setIsSoundOn(!isSoundOn)}
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-green bg-mint">
              {isSoundOn ? (
                <Volume2 size={30} className="text-green-dark" />
              ) : (
                <VolumeX size={30} className="text-green-dark" />
              )}
            </span>

            <span className="font-grotesk font-semibold text-ink">Sound</span>

            <span className="label-mono">{isSoundOn ? "ON" : "OFF"}</span>
          </button>

          {/* Theme setting */}
          <button
            type="button"
            className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:bg-mint shadow-[var(--shadow-sm)]"
            onClick={() => setIsDarkTheme(!isDarkTheme)}
          >
            <span
              className={`flex h-16 w-16 items-center justify-center rounded-full border-2 ${
                isDarkTheme
                  ? "border-green-light bg-green-dark"
                  : "border-green bg-mint"
              }`}
            >
              {isDarkTheme ? (
                <Moon size={30} className="text-white" />
              ) : (
                <Sun size={30} className="text-green-dark" />
              )}
            </span>

            <span className="font-grotesk font-semibold text-ink">Theme</span>

            <span className="label-mono">{isDarkTheme ? "DARK" : "LIGHT"}</span>
          </button>
        </div>

        {/* Only show this button when the parent requests it. */}
        {showBackButton && (
          <button
            type="button"
            className="btn-outline mt-3 w-full"
            onClick={onBack}
          >
            Back to Pause Menu
          </button>
        )}
      </div>
    </div>
  );
}

export default SettingsPanel;
