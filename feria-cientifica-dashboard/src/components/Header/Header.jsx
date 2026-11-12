
import { useEffect, useRef, useState } from 'react'
import logoClaro from '../../assets/imgs/Logo-14cm-Blanco.png'
import logoOscuro from '../../assets/imgs/Logo-14cm-Full-Color.png'

import {
  QuestionMarkCircleIcon,
  SunIcon,
  MoonIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

import './Header.css'

function Header({
  children,
  kpis,
  theme = 'dark',
  onToggleTheme,
  year,
  hasActiveFilters = false,
  onStartTour,
}) {
  const isDark = theme === 'dark'

  const [menuOpen, setMenuOpen] = useState(false)

  const headerRef = useRef(null)
  const menuButtonRef = useRef(null)

  /* ==========================================
     CERRAR EL MENÚ DE FILTROS
  ========================================== */

  useEffect(() => {
    if (!menuOpen) return undefined

    const onPointerDown = (event) => {
      const target = event.target

      // No cerrar al seleccionar una opción de React Select.
      // Sus opciones se renderizan en un portal fuera del Header.
      if (
        target instanceof Element &&
        target.closest('.filter-select__menu-portal')
      ) {
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

      {/* ==========================================
          LOGO Y NOMBRE DEL DASHBOARD
      ========================================== */}

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
            Visualización interactiva · FNCT {year ?? '—'}
          </p>
        </div>
      </div>

      {/* ==========================================
          INDICADORES KPI
      ========================================== */}

      <div className="header__kpis">
        {kpis}
      </div>

      {/* ==========================================
          CONTROLES DEL ENCABEZADO
      ========================================== */}

      <div className="header__actions">

        {/* RECORRIDO GUIADO */}
        <button
          type="button"
          className="header__tour-button"
          onClick={onStartTour}
          aria-label="Iniciar recorrido guiado"
          title="¿Cómo utilizar el dashboard?"
        >
          <QuestionMarkCircleIcon aria-hidden="true" />
        </button>

        {/* CAMBIO DE TEMA */}
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
          {isDark ? (
            <MoonIcon aria-hidden="true" />
          ) : (
            <SunIcon aria-hidden="true" />
          )}
        </button>

        {/* BOTÓN DE FILTROS */}
        <button
          ref={menuButtonRef}
          type="button"
          className="header__menu-button"
          aria-expanded={menuOpen}
          aria-controls="fnct-filters-panel"
          onClick={() => setMenuOpen((current) => !current)}
        >
          {menuOpen ? (
            <XMarkIcon aria-hidden="true" />
          ) : (
            <FunnelIcon aria-hidden="true" />
          )}

          <span>Filtros</span>

          {hasActiveFilters && (
            <span
              className="header__active-indicator"
              aria-label="Filtros activos"
            />
          )}
        </button>

      </div>

      {/* ==========================================
          PANEL DESPLEGABLE DE FILTROS
      ========================================== */}

      {menuOpen && (
        <div
          id="fnct-filters-panel"
          className="header__panel"
          aria-label="Filtros del dashboard"
        >
          <div className="header__panel-heading">
            <strong>Filtros</strong>

            <button
              type="button"
              className="header__panel-close"
              onClick={() => setMenuOpen(false)}
              aria-label="Cerrar filtros"
            >
              ×
            </button>
          </div>

          <div className="header__filters">
            {children}
          </div>
        </div>
      )}

    </header>
  )
}

export default Header
