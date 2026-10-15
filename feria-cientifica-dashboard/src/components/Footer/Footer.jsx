
import './Footer.css'

function Footer() {
  return (
    <footer className="dashboard-footer">
      <div className="dashboard-footer__content">

        <div className="dashboard-footer__info">
          <h3>
            Visualización interactiva de proyectos científicos
          </h3>

          <p>
            Feria Nacional de Ciencia y Tecnología · 2025
          </p>
        </div>

        <div className="dashboard-footer__source">
          <p>
            <strong>Fuente de datos:</strong>{' '}
            Registros de proyectos presentados en la
            Feria Nacional de Ciencia y Tecnología 2025.
          </p>

          <p>
            Información sobre proyectos, centros educativos,
            estudiantes y uso de inteligencia artificial.
          </p>
        </div>

      </div>
    </footer>
  )
}

export default Footer
