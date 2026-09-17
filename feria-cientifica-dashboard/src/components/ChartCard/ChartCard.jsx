import './ChartCard.css'

function ChartCard({ icon, title, subtitle, children, className = '' }) {
  return (
    <section className={`chart-card ${className}`}>
      <div className="chart-card__header">
        {icon && (
          <span className="chart-card__icon">
            {icon}
          </span>
        )}

        <div>
          <h2 className="chart-card__title">{title}</h2>

          {subtitle && (
            <p className="chart-card__subtitle">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="chart-card__content">
        {children}
      </div>
    </section>
  )
}

export default ChartCard