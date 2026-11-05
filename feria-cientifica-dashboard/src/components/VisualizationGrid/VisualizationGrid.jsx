import { useCallback, useState } from 'react'
import AITreemap from '../AITreemap/AITreemap.jsx'
import RegionalMap from '../RegionalMap/RegionalMap.jsx'
import AreaSexChart from '../AreaSexChart/AreaSexChart.jsx'
import AreaModalityBubbleMatrix from '../AreaModalityBubbleMatrix/AreaModalityBubbleMatrix.jsx'
import ChartModal from '../ChartModal/ChartModal.jsx'

import ubicacionIcon from '../../assets/imgs/ubicacion.png'
import sexoIcon from '../../assets/imgs/sexo.png'
import cerebroIcon from '../../assets/imgs/cerebro.png'
import educacionIcon from '../../assets/imgs/educacion.png'

import './VisualizationGrid.css'

const CHARTS = {
  map: {
    title: 'Proyectos por Dirección Regional',
    description: 'Mapa coroplético que muestra la cantidad de proyectos por dirección regional (DRE).',
    icon: ubicacionIcon,
  },
  heatmap: {
    title: 'Área temática × Modalidad × Categoría',
    description: 'Matriz de burbujas: eje Y, área temática; eje X, modalidad educativa; color, categoría; tamaño del círculo, cantidad de proyectos.',
    icon: educacionIcon,
  },
  sex: {
    title: 'Área temática × Sexo',
    description: 'Barras horizontales apiladas que muestran la distribución de estudiantes por sexo y área temática. Eje Y: áreas temáticas. Eje X: total de estudiantes.',
    icon: sexoIcon,
  },
  ai: {
    title: 'IA × Modalidad',
    description: 'Mapa de árbol donde el tamaño de cada rectángulo es proporcional a la cantidad de proyectos que utilizan inteligencia artificial en cada modalidad educativa.',
    icon: cerebroIcon,
  },
}

// Colores compartidos con AreaModalityBubbleMatrix.jsx.
const BUBBLE_CATEGORIES = [
  { full: 'Quehacer científico y tecnológico (Primaria)', short: 'Quehacer científico (Primaria)', color: '#13bdf0' },
  { full: 'Proyecto de investigación científica', short: 'Investigación científica', color: '#ff891f' },
  { full: 'Proyecto de investigación y desarrollo tecnológico', short: 'Investigación y desarrollo tecnológico', color: '#9b7bea' },
  { full: 'Subcategoría sumando experiencias científicas', short: 'Sumando experiencias', color: '#23b889' },
  { full: 'Demostraciones científicas y tecnológicas', short: 'Demostraciones científicas', color: '#e05b96' },
]

function BubbleLegend({ data }) {
  const available = new Set(data.map((row) => String(row['Categoría'] ?? '').trim()))
  return (
    <div className="chart-card__category-legend" aria-label="Categorías de proyectos">
      {BUBBLE_CATEGORIES.filter((item) => available.has(item.full)).map((item) => (
        <span key={item.full} className="chart-card__category-item" title={item.full}>
          <span className="chart-card__category-dot" style={{ backgroundColor: item.color }} />
          <span>{item.short}</span>
        </span>
      ))}
      <span className="chart-card__size-hint">Tamaño del círculo = cantidad de proyectos</span>
    </div>
  )
}

function EmptyChart() {
  return (
    <div className="chart-empty" role="status">
      <svg className="chart-empty__icon" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M7 16l3-3 3 2 4-5" />
        <path d="M8 8h.01" />
      </svg>
      <strong>No hay datos para mostrar</strong>
      <p>No se encontraron proyectos que coincidan con los filtros seleccionados.</p>
    </div>
  )
}

function ChartHeader({ icon, title, description, children, onExpand, canExpand }) {
  return (
    <div className="chart-card__header">
      <div className="chart-card__title-row">
        <img src={icon} alt="" aria-hidden="true" className="chart-card__heading-icon" />
        <h2>{title}</h2>
        {canExpand && (
          <button
            type="button"
            className="chart-card__expand"
            onClick={onExpand}
            aria-label={`Ampliar ${title}`}
            title="Ampliar visualización"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M3 16v3a2 2 0 0 0 2 2h3M21 16v3a2 2 0 0 1-2 2h-3" />
            </svg>
          </button>
        )}
      </div>
      <p>{description}</p>
      {children}
    </div>
  )
}

function ChartContent({ chart, data, theme, interactiveZoom = false }) {
  switch (chart) {
    case 'map':
      return <RegionalMap data={data} theme={theme} />
    case 'heatmap':
      return <AreaModalityBubbleMatrix data={data} theme={theme} interactiveZoom={interactiveZoom} />
    case 'sex':
      return <AreaSexChart data={data} />
    case 'ai':
      return <AITreemap data={data} />
    default:
      return null
  }
}

function VisualizationGrid({ data, theme = 'dark' }) {
  const [expanded, setExpanded] = useState(null)
  const closeModal = useCallback(() => setExpanded(null), [])
  const hasData = Array.isArray(data) && data.length > 0

  const header = (chart, children) => (
    <ChartHeader
      icon={CHARTS[chart].icon}
      title={CHARTS[chart].title}
      description={CHARTS[chart].description}
      canExpand={hasData}
      onExpand={() => setExpanded(chart)}
    >
      {children}
    </ChartHeader>
  )

  const content = (chart) => (
    <div className="chart-card__content">
      {hasData
        ? <ChartContent chart={chart} data={data} theme={theme} />
        : <EmptyChart />}
    </div>
  )

  return (
    <>
      <section className="visualization-grid">
        <section className="chart-card visualization-grid__map">
          {header('map')}
          {content('map')}
        </section>

        {/* A la derecha: Bubble Matrix y Sexo a la izquierda; IA a toda altura a la derecha. */}
        <div className="visualization-grid__right">
          <section className="chart-card visualization-grid__heatmap">
            {header('heatmap')}
            {content('heatmap')}
            {hasData && (
              <aside className="chart-card__bubble-sidebar" aria-label="Leyenda de categorías">
                <BubbleLegend data={data} />
              </aside>
            )}
          </section>

          <section className="chart-card visualization-grid__sex">
            {header('sex', hasData && (
              <div className="chart-card_squares">
                <span className="square" style={{ backgroundColor: 'var(--color-accent, #ff891f)' }} />
                <span>Mujeres</span>
                <span className="square" style={{ backgroundColor: 'var(--color-secondary, #13bdf0)' }} />
                <span>Hombres</span>
              </div>
            ))}
            {content('sex')}
          </section>

          <section className="chart-card visualization-grid__ai">
            {header('ai')}
            {content('ai')}
          </section>
        </div>
      </section>

      {expanded && hasData && (
        <ChartModal
          key={expanded}
          title={CHARTS[expanded].title}
          description={CHARTS[expanded].description}
          onClose={closeModal}
          disableZoom={expanded === 'heatmap'}
        >
          <ChartContent
            chart={expanded}
            data={data}
            theme={theme}
            interactiveZoom={expanded === 'heatmap'}
          />
        </ChartModal>
      )}
    </>
  )
}

export default VisualizationGrid
