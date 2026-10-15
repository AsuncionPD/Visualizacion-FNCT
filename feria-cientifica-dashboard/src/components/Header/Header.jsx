import logoClaro from '../../assets/imgs/Logo-14cm-Blanco.png'
import logoOscuro from '../../assets/imgs/Logo-14cm-Full-Color.png'

import './Header.css'

function Header({
  children,
  theme = 'dark',
  onToggleTheme,
}) {
  const isDark = theme === 'dark'

  return (
    <header className="header">

      <div className="header__brand">

        <div className="header__logo-frame">
          <img
            src={isDark ? logoClaro : logoOscuro}
            alt="Logo oficial de la Feria Nacional de Ciencia y Tecnología"
            className="header__icon"
          />
        </div>

        <div className="header__information">
          <h1 className="header__title">
            Dashboard de proyectos científicos
          </h1>

          <p className="header__subtitle">
            Visualización interactiva · FNCT 2025
          </p>
        </div>

      </div>

      <div className="header__actions">

        <div className="header__filters">
          {children}
        </div>

        <button
          type="button"
          className="theme-switch"
          onClick={onToggleTheme}
          aria-label={
            isDark
              ? 'Activar modo claro'
              : 'Activar modo oscuro'
          }
          aria-pressed={!isDark}
          title={
            isDark
              ? 'Cambiar a modo claro'
              : 'Cambiar a modo oscuro'
          }
        >
          <span
            className="theme-switch__track"
            aria-hidden="true"
          >
            <svg
              className="theme-switch__sun"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
            </svg>

            <svg
              className="theme-switch__moon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" />
            </svg>

            <span
              className={`theme-switch__thumb ${
                isDark
                  ? 'theme-switch__thumb--dark'
                  : 'theme-switch__thumb--light'
              }`}
            />
          </span>
        </button>

      </div>

    </header>
  )
}

export default Header