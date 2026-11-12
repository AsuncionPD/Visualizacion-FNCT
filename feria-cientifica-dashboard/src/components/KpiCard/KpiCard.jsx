
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import './KpiCard.css'

function KpiCard({
  img,
  value,
  label,
  highlight = false,
  tooltip = false,
}) {
  return (
    <article
      className={`kpi-card ${highlight ? 'kpi-card--highlight' : ''}`}
    >
      <div className="kpi-card__icon">
        <img
          src={img}
          alt=""
          aria-hidden="true"
          className="kpi-card__image"
        />
      </div>

      <div className="kpi-card__info">
        <strong className="kpi-card__value">
          {value}
        </strong>

        <span className="kpi-card__label">
          {label}
        </span>
      </div>

      {tooltip && (
        <div className="kpi-card__tooltip-container">
          <button
            type="button"
            className="kpi-card__tooltip-button"
            aria-label="Información sobre los usos de la IA"
            aria-describedby="kpi-ai-tooltip"
          >
            <InformationCircleIcon aria-hidden="true" />
          </button>

          <div
            id="kpi-ai-tooltip"
            className="kpi-card__tooltip"
            role="tooltip"
          >
            <strong>Principales usos de la IA</strong>
            <p>La IA fue empleada principalmente para:</p>

            <ul>
              <li>Búsqueda y organización de información.</li>
              <li>Apoyo en redacción.</li>
              <li>Programación y desarrollo tecnológico.</li>
              <li>Análisis de datos.</li>
              <li>Elaboración de materiales gráficos.</li>
            </ul>
          </div>
        </div>
      )}
    </article>
  )
}

export default KpiCard
