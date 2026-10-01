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
          <h2>● Proyectos × Dirección Regional</h2>
          <p>Mapa coroplético que muestra la cantidad de proyectos por dirección regional (DRE).</p>
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
            <p>Mapa de calor que presenta la cantidad de proyectos por área temática y modalidad educativa. Eje Y: Aréas temáticas - Eje X: Modalidad educativa</p>
        
            <div className="chart-card_squares">
              < span className="square" style={{ backgroundColor: '#10284d' }}></span>
               Mayor cantidad de proyecto
              < span className="square" style={{ backgroundColor: '#a9c9f5' }}></span>
               Menor cantidad de proyectos
            </div>
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
              <p>Barras verticales a color que muestra la predominancia de hombres y mujeres por área temática. Eje Y: Aréas temáticas - Eje X: Total de estudiantes</p>

              <div className="chart-card_squares">
              < span className="square" style={{ backgroundColor: '#e0568c' }}></span>
               Mujeres
              < span className="square" style={{ backgroundColor: '#2388e8' }}></span>
               Hombres              
              </div>
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
                Mapa de árbol donde el tamaño de cada rectángulo es proporcional a la cantidad de proyectos que utilizan inteligencia artificial en cada modalidad educativa.
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