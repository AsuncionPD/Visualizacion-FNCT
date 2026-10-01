import './Header.css'

function Header({ children }) {
  return (
    <header className="header">

      <div className="header__brand">
        <div className="header__icon">
          ⚛
        </div>

        <div>
          <h1 className="header__title">
            Feria Nacional de Científica y Tecnológica
          </h1>

          <p className="header__subtitle">
            Visualización interactiva de proyectos presentados en 2025
          </p>
        </div>
      </div>

      <div className="header__filters">
        {children}
      </div>

    </header>
  )
}

export default Header