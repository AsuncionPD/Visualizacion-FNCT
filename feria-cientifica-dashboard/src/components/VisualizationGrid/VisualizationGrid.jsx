import AITreemap from '../AITreemap/AITreemap.jsx'
import RegionalMap from '../RegionalMap/RegionalMap.jsx'
import AreaSexChart from '../AreaSexChart/AreaSexChart.jsx'
import AreaModalityHeatMap from '../AreaModalityHeatMap/AreaModalityHeatMap.jsx'

import './VisualizationGrid.css'

function VisualizationGrid({ data }) {
  return (
    <section className="visualization-grid">

      {/* =========================
          IZQUIERDA: MAPA GRANDE
      ========================= */}
      <section className="chart-card visualization-grid__map">

        <div className="chart-card__header">
          <h2>● Dirección Regional</h2>
          <p>Cantidad de proyectos</p>
        </div>

        <div className="chart-card__content">
          <RegionalMap data={data} />
        </div>

      </section>


      {/* =========================
          DERECHA
      ========================= */}
      <div className="visualization-grid__right">

        {/* HEATMAP */}
        <section className="chart-card visualization-grid__heatmap">

          <div className="chart-card__header">
            <h2>▦ Área temática × Modalidad</h2>
            <p>Cantidad de proyectos</p>
          </div>

          <div className="chart-card__content">
            <AreaModalityHeatMap data={data} />
          </div>

        </section>


        {/* PARTE INFERIOR DERECHA */}
        <div className="visualization-grid__bottom">

          {/* ÁREA × SEXO */}
          <section className="chart-card visualization-grid__sex">

            <div className="chart-card__header">
              <h2>♟ Área temática × Sexo</h2>
              <p>Cantidad de estudiantes</p>
            </div>

            <div className="chart-card__content">
              <AreaSexChart data={data} />
            </div>

          </section>


          {/* IA × MODALIDAD */}
          <section className="chart-card visualization-grid__ai">

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

        </div>

      </div>

    </section>
  )
}

export default VisualizationGrid