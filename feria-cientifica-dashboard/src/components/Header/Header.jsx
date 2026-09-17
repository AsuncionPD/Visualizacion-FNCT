import './Header.css'

function Header() {
  return (
    <header className="header">
      <div className="header__brand">
        <div className="header__icon">
          ⚛
        </div>

        <div>
          <h1 className="header__title">
            Feria Nacional Científica y Tecnológica
          </h1>

          <p className="header__subtitle">
            Mapa de la ciencia, innovación y talento estudiantil de Costa Rica
          </p>
        </div>
      </div>

      <div className="header__info">
        <span>Visualización interactiva</span>
        <span className="header__info-icon">ⓘ</span>
      </div>
    </header>
  )
}

export default Header