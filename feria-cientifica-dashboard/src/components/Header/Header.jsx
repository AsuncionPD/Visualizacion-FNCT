import './Header.css'

function Header({ children }) {
  return (
    <header className="header">

      <div className="header__brand">
          
        <div>

          <div >
              <img src="./src/assets/imgs/Logo FNCT invertido horizontal.png" alt="Logo de Feria Nacional de Científica y Tecnológica" className="header__icon"/>
          </div>

          {/* <p className="header__subtitle">
            Visualización interactiva de proyectos presentados en 2025
          </p> */}
        </div>
      </div>

      <div className="header__filters">
        {children}
      </div>

    </header>
  )
}

export default Header