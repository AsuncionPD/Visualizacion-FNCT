
import './KpiCard.css'

function KpiCard({
  img,
  value,
  label,
  highlight = false,
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
    </article>
  )
}

export default KpiCard
