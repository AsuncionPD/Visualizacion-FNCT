
import AITreemap from '../AITreemap/AITreemap.jsx'
import RegionalMap from '../RegionalMap/RegionalMap.jsx'
import AreaSexChart from '../AreaSexChart/AreaSexChart.jsx'
import AreaModalityHeatMap from '../AreaModalityHeatMap/AreaModalityHeatMap.jsx'

import ubicacionIcon from '../../assets/imgs/ubicacion.png'
import sexoIcon from '../../assets/imgs/sexo.png'
import cerebroIcon from '../../assets/imgs/cerebro.png'
import educacionIcon from '../../assets/imgs/educacion.png'

import './VisualizationGrid.css'

// ==========================================
// COMPONENTE PARA MOSTRAR ESTADO VACÍO
// ==========================================

function EmptyChart() {
  return (
    <div
      className="chart-empty"
      role="status"
    >
      <svg
        className="chart-empty__icon"
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="3"
        />

        <path d="M7 16l3-3 3 2 4-5" />

        <path d="M8 8h.01" />
      </svg>

      <strong>
        No hay datos para mostrar
      </strong>

      <p>
        No se encontraron proyectos que coincidan
        con los filtros seleccionados.
      </p>
    </div>
  )
}

// ==========================================
// GRID DE VISUALIZACIONES
// ==========================================

function VisualizationGrid({ data, theme = 'dark' }) {
  const isLight = theme === 'light'

  const hasData = Array.isArray(data) && data.length > 0

  return (
    <section className="visualization-grid">

      {/* ==========================================
          IZQUIERDA: MAPA REGIONAL
      ========================================== */}

      <section className="chart-card visualization-grid__map">

        <div className="chart-card__heading">
          <img
            src={ubicacionIcon}
            alt="Icono de Ubicación"
            aria-hidden="true"
            className="chart-card__heading-icon"
          />

          <div className="chart-card__header">
            <h2>Proyectos por Dirección Regional</h2>

            <p>
              Mapa coroplético que muestra la cantidad
              de proyectos por dirección regional (DRE).
            </p>
          </div>
        </div>

        <div className="chart-card__content">
          {hasData ? (
            <RegionalMap
              data={data}
              theme={theme}
            />
          ) : (
            <EmptyChart />
          )}
        </div>

      </section>

      {/* ==========================================
          DERECHA: VISUALIZACIONES
      ========================================== */}

      <div className="visualization-grid__right">

        {/* ==========================================
            HEATMAP: ÁREA × MODALIDAD
        ========================================== */}

        <section className="chart-card visualization-grid__heatmap">

           <div className="chart-card__heading">
              <img
                src={educacionIcon}
                alt="Icono de Educación"
                aria-hidden="true"
                className="chart-card__heading-icon"
              />

          <div className="chart-card__header">
            <h2>Área temática × Modalidad</h2>

            <p>
              Mapa de calor que presenta la cantidad
              de proyectos por área temática y modalidad
              educativa. Eje Y: áreas temáticas.
              Eje X: modalidad educativa.
            </p>

            {hasData && (
              <div className="chart-card_squares">

                <span
                  className="square"
                  style={{
                    backgroundColor: '#0754a3',
                  }}
                />
                <span>Mayor cantidad de proyectos</span>

                <span
                  className="square"
                  style={{
                    backgroundColor: isLight
                      ? '#edf8ff'
                      : '#c9f1ff',
                  }}
                />
                <span>Menor cantidad de proyectos</span>

              </div>
            )}
          </div>

          </div>

          <div className="chart-card__content">
            {hasData ? (
              <AreaModalityHeatMap
                data={data}
                theme={theme}
              />
            ) : (
              <EmptyChart />
            )}
          </div>

        </section>

        {/* ==========================================
            PARTE INFERIOR DERECHA
        ========================================== */}

        <div className="visualization-grid__bottom">

          {/* ==========================================
              ÁREA TEMÁTICA × SEXO
          ========================================== */}

          <section className="chart-card visualization-grid__sex">

            <div className="chart-card__heading">

              <img
                src={sexoIcon}
                alt="Icono de sexo o género"
                aria-hidden="true"
                className="chart-card__heading-icon"
              />

            <div className="chart-card__header">
              <h2>Área temática × Sexo</h2>

                <p>
                  Barras horizontales apiladas que muestran
                  la distribución de estudiantes por sexo
                  y área temática. Eje Y: áreas temáticas.
                  Eje X: total de estudiantes.
                </p>

                {hasData && (
                <div className="chart-card_squares">

                  <span
                    className="square"
                    style={{
                      backgroundColor:
                        'var(--color-accent, #ff891f)',
                    }}
                  />
                  <span>Mujeres</span>

                  <span
                    className="square"
                    style={{
                      backgroundColor:
                        'var(--color-secondary, #13bdf0)',
                    }}
                  />
                  <span>Hombres</span>

                </div>
              )}

              </div>
            </div>
             
            <div className="chart-card__content">
              {hasData ? (
                <AreaSexChart data={data} />
              ) : (
                <EmptyChart />
              )}
            </div>

          </section>

          {/* ==========================================
              IA × MODALIDAD
          ========================================== */}

          <section className="chart-card visualization-grid__ai">

            <div className="chart-card__heading">
              <img
                src={cerebroIcon}
                alt="Icono de Cerebro"
                aria-hidden="true"
                className="chart-card__heading-icon"
              />

              <div className="chart-card__header">
                <h2>IA × Modalidad</h2>

                <p>
                  Mapa de árbol donde el tamaño de cada
                  rectángulo es proporcional a la cantidad
                  de proyectos que utilizan inteligencia
                  artificial en cada modalidad educativa.
                </p>
              </div>
            </div>

            <div className="chart-card__content">
              {hasData ? (
                <AITreemap data={data} />
              ) : (
                <EmptyChart />
              )}
            </div>

          </section>

        </div>

      </div>

    </section>
  )
}

export default VisualizationGrid
