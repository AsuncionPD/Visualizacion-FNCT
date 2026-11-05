import { useEffect, useRef, useState } from 'react'
import logoClaro from '../../assets/imgs/Logo-14cm-Blanco.png'
import logoOscuro from '../../assets/imgs/Logo-14cm-Full-Color.png'
import './Header.css'

function Header({ children, kpis, theme = 'dark', onToggleTheme, year, hasActiveFilters = false }) {
  const isDark = theme === 'dark'
  const [menuOpen, setMenuOpen] = useState(false)
  const headerRef = useRef(null)
  const menuButtonRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return undefined

    const onPointerDown = (event) => {
    const target = event.target

      // No cerrar al seleccionar una opción de React Select.
      // Sus opciones se renderizan en un portal fuera del Header.
      if (target instanceof Element &&
          target.closest('.filter-select__menu-portal')) {
        return
      }

      if (!headerRef.current?.contains(target)) {
        setMenuOpen(false)
      }
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  return (
    <header className="header" ref={headerRef}>
      <div className="header__brand">
        <div className="header__logo-frame">
          <img
            src={isDark ? logoClaro : logoOscuro}
            alt="Logo oficial de la Feria Nacional de Ciencia y Tecnología"
            className="header__icon"
          />
        </div>
        <div className="header__information">
          <h1 className="header__title">Dashboard de proyectos científicos</h1>
          <p className="header__subtitle">Visualización interactiva · FNCT {year ?? '—'}</p>
        </div>
      </div>

      <div className="header__kpis">{kpis}</div>

      <div className="header__actions">
        <button
          ref={menuButtonRef}
          type="button"
          className="header__menu-button"
          aria-expanded={menuOpen}
          aria-controls="fnct-filters-panel"
          onClick={() => setMenuOpen((current) => !current)}
        >
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {menuOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
          <span>Filtros</span>
          {hasActiveFilters && <span className="header__active-indicator" aria-label="Filtros activos" />}
        </button>
      </div>

      {menuOpen && (
        <div id="fnct-filters-panel" className="header__panel" aria-label="Filtros y apariencia">
          <div className="header__panel-heading">
            <strong>Filtros y preferencias</strong>
            <button type="button" className="header__panel-close" onClick={() => setMenuOpen(false)} aria-label="Cerrar filtros">×</button>
          </div>
          <div className="header__filters">{children}</div>
          <div className="header__appearance">
            <span>Apariencia</span>
            <button
              type="button"
              className="theme-switch"
              onClick={onToggleTheme}
              aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
              aria-pressed={!isDark}
              title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              <span className="theme-switch__track" aria-hidden="true">
                <svg className="theme-switch__sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
                </svg>
                <svg className="theme-switch__moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" />
                </svg>
                <span className={`theme-switch__thumb ${isDark ? 'theme-switch__thumb--dark' : 'theme-switch__thumb--light'}`} />
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
