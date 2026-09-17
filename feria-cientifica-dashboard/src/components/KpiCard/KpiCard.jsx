import './KpiCard.css'

function KpiCard({ icon, title, value, detail }) {
  return (
    <article className="kpi-card">
      <div className="kpi-card__icon">
        {icon}
      </div>

      <div className="kpi-card__content">
        <span className="kpi-card__title">
          {title}
        </span>

        <div className="kpi-card__value-container">
          <strong className="kpi-card__value">
            {value}
          </strong>

          {detail && (
            <span className="kpi-card__detail">
              {detail}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

export default KpiCard