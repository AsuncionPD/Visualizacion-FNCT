import './KpiCard.css'

function KpiCard({
  icon,
  value,
  label,
}) {
  return (
    <article className="kpi-card">

      <div className="kpi-card__icon">
        {icon}
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