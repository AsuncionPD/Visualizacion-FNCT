import AITreemap from '../AITreemap/AITreemap.jsx'
import RegionalMap from '../RegionalMap/RegionalMap.jsx'
import AreaSexChart from '../AreaSexChart/AreaSexChart.jsx'
import AreaModalityHeatMap from '../AreaModalityHeatMap/AreaModalityHeatMap.jsx'

import './VisualizationGrid.css'

function VisualizationGrid({ data }) {
  return (
    <section className="visualization-grid">

      {/* =========================
          COLUMNA IZQUIERDA
      ========================= */}
      <div className="visualization-grid__left">

        {/* IA × MODALIDAD */}
        <section className="chart-card">
          <div className="chart-card__header">
            <h2>▧ IA × Modalidad</h2>

            <p>
              Cantidad de proyectos que utilizan
              inteligencia artificial
            </p>
          </div>

          <div className="chart-card__content">
            <AITreemap data={data} />
          </div>
        </section>


        {/* ÁREA TEMÁTICA × SEXO */}
        <section className="chart-card">
          <div className="chart-card__header">
            <h2>♟ Área temática × Sexo</h2>

            <p>
              Cantidad de estudiantes
            </p>
          </div>

          <div className="chart-card__content">
            <AreaSexChart data={data} />

          </div>
        </section>

      </div>


      {/* =========================
          COLUMNA CENTRAL: MAPA
      ========================= */}
      <section
        className="
          chart-card
          visualization-grid__map
        "
      >
        <div className="chart-card__header">
          <h2>● Dirección Regional</h2>

          <p>
            Cantidad de proyectos
          </p>
        </div>

        <div className="chart-card__content">
          <RegionalMap data={data} />
        </div>
      </section>


      {/* =========================
          COLUMNA DERECHA: HEATMAP
      ========================= */}
      <section 
      className="
      chart-card visualization-grid__heatmap
      "
      >

        <div className="chart-card__header">
          <h2>
            ▦ Área temática × Modalidad
          </h2>

          <p>
            Cantidad de proyectos
          </p>
        </div>

        <div className="chart-card__content">

          <AreaModalityHeatMap data={data} />

        </div>
      </section>

    </section>
  )
}

export default VisualizationGrid