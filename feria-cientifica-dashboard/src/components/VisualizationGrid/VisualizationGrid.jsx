import ChartCard from '../ChartCard/ChartCard.jsx'
import './VisualizationGrid.css'

function VisualizationGrid() {
  return (
    <section className="visualization-grid">

      <ChartCard
        className="visualization-grid__treemap"
        icon="▧"
        title="IA × Modalidad"
        subtitle="Cantidad de proyectos que utilizan inteligencia artificial"
      >
        <div className="visualization-placeholder">
          Treemap
        </div>
      </ChartCard>

      <ChartCard
        className="visualization-grid__map"
        icon="●"
        title="Dirección Regional"
        subtitle="Cantidad de proyectos"
      >
        <div className="visualization-placeholder">
          Mapa coroplético
        </div>
      </ChartCard>

      <ChartCard
        className="visualization-grid__gender"
        icon="♙"
        title="Área temática × Sexo"
        subtitle="Cantidad de estudiantes"
      >
        <div className="visualization-placeholder">
          Barras apiladas
        </div>
      </ChartCard>

      <ChartCard
        className="visualization-grid__heatmap"
        icon="▦"
        title="Área temática × Modalidad"
        subtitle="Cantidad de proyectos"
      >
        <div className="visualization-placeholder">
          Heatmap
        </div>
      </ChartCard>

    </section>
  )
}

export default VisualizationGrid