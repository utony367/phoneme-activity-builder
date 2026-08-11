"use client";

import {
  useTheme,
} from "../../components/ThemeProvider";

export default function SettingsPage() {
  const {
    theme,
    setTheme,
    layoutPreference,
    setLayoutPreference,
  } = useTheme();

  return (
    <div className="standard-page">
      <section className="page-intro">
        <p className="eyebrow">
          Preferences
        </p>

        <h2>
          Interface Settings
        </h2>

        <p>
          Personalise the activity builder
          using display preferences that are
          stored in your browser.
        </p>
      </section>

      <div className="settings-layout">

        {/* Theme */}

        <section className="settings-card">
          <h3>
            Appearance
          </h3>

          <p>
            Choose between light and dark
            interface themes.
          </p>

          <fieldset className="option-group">
            <legend>
              Theme
            </legend>

            <label
              className={`setting-option ${
                theme === "light"
                  ? "selected-option"
                  : ""
              }`}
            >
              <input
                type="radio"
                name="theme"
                value="light"
                checked={
                  theme === "light"
                }
                onChange={() =>
                  setTheme("light")
                }
              />

              <span className="option-content">
                <strong>
                  Light
                </strong>

                <small>
                  Bright interface for
                  general classroom use.
                </small>
              </span>
            </label>

            <label
              className={`setting-option ${
                theme === "dark"
                  ? "selected-option"
                  : ""
              }`}
            >
              <input
                type="radio"
                name="theme"
                value="dark"
                checked={
                  theme === "dark"
                }
                onChange={() =>
                  setTheme("dark")
                }
              />

              <span className="option-content">
                <strong>
                  Dark
                </strong>

                <small>
                  Reduced brightness for
                  lower-light environments.
                </small>
              </span>
            </label>
          </fieldset>
        </section>

        {/* Layout */}

        <section className="settings-card">
          <h3>
            Layout
          </h3>

          <p>
            Adjust the amount of spacing used
            throughout the interface.
          </p>

          <fieldset className="option-group">
            <legend>
              Layout preference
            </legend>

            <label
              className={`setting-option ${
                layoutPreference ===
                "comfortable"
                  ? "selected-option"
                  : ""
              }`}
            >
              <input
                type="radio"
                name="layout"
                value="comfortable"
                checked={
                  layoutPreference ===
                  "comfortable"
                }
                onChange={() =>
                  setLayoutPreference(
                    "comfortable"
                  )
                }
              />

              <span className="option-content">
                <strong>
                  Comfortable
                </strong>

                <small>
                  More spacing between
                  controls and content.
                </small>
              </span>
            </label>

            <label
              className={`setting-option ${
                layoutPreference ===
                "compact"
                  ? "selected-option"
                  : ""
              }`}
            >
              <input
                type="radio"
                name="layout"
                value="compact"
                checked={
                  layoutPreference ===
                  "compact"
                }
                onChange={() =>
                  setLayoutPreference(
                    "compact"
                  )
                }
              />

              <span className="option-content">
                <strong>
                  Compact
                </strong>

                <small>
                  Less spacing to show more
                  information at once.
                </small>
              </span>
            </label>
          </fieldset>
        </section>

        {/* Preview */}

        <section className="settings-card settings-preview-card">
          <p className="eyebrow">
            Current preferences
          </p>

          <h3>
            Phoneme Activity Builder
          </h3>

          <p>
            Theme:{" "}
            <strong>
              {theme}
            </strong>
          </p>

          <p>
            Layout:{" "}
            <strong>
              {layoutPreference}
            </strong>
          </p>

          <button
            type="button"
            className="primary-action"
          >
            Example Button
          </button>
        </section>
      </div>
    </div>
  );
}