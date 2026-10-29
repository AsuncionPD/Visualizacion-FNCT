import './Footer.css'
import ubicacionIcon from '../../assets/imgs/ubicacion.png'
import telefonoIcon from '../../assets/imgs/telefono.png'
import correoIcon from '../../assets/imgs/correo.png'

const PHONE_DISPLAY = '+506 2511-8882'
const WHATSAPP_NUMBER = '50625118882'
const EMAIL = 'feria.ciencitifica@ucr.ac.cr'
const ADDRESS = 'Oficina 314, Facultad de Educación, Sede Rodrigo Facio, Universidad de Costa Rica'
const GOOGLE_MAPS_URL = `https://maps.app.goo.gl/vEjm67fRrvCWYko37`

function Footer() {
  return (
    <footer className="dashboard-footer">
      <div className="dashboard-footer__content">
        <div className="dashboard-footer__info">
          <h3>Contacto</h3>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <a
            className="dashboard-footer__contact-link"
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Contactar por WhatsApp al ${PHONE_DISPLAY} (se abre en una nueva pestaña)`}
          >
            <img src={telefonoIcon} alt="" aria-hidden="true" className="dashboard-footer__icon" />
            <span>{PHONE_DISPLAY}</span>
          </a>

          <a
            className="dashboard-footer__contact-link"
            href={`mailto:${EMAIL}`}
            aria-label={`Enviar correo a ${EMAIL}`}
          >
            <img src={correoIcon} alt="" aria-hidden="true" className="dashboard-footer__icon" />
            <span>{EMAIL}</span>
          </a>

          </div>

          <a
            className="dashboard-footer__contact-link"
            href={GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${ADDRESS}. Ver ubicación en Google Maps (se abre en una nueva pestaña)`}
          >
            <img src={ubicacionIcon} alt="" aria-hidden="true" className="dashboard-footer__icon" />
            <span>{ADDRESS}</span>
          </a>
        </div>

        <div className="dashboard-footer__source">
          <p>
            Fuente de datos:{' '}
            <a href="https://www.ucr.ac.cr/" target="_blank" rel="noopener noreferrer">
              Universidad de Costa Rica
            </a>
          </p>
          <p>© Feria Nacional de Ciencia y Tecnología</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
