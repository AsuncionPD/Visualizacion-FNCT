import './KpiCard.css'

function KpiCard({
  img,
  value,
  label,
}) {
  return (
    <article className="kpi-card">

      <div className="kpi-card__icon">
        <img src={img} alt={label} style={{ width: '30px', height: 'auto'}}/>
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