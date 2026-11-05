import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import * as d3 from 'd3'
import './AreaModalityBubbleMatrix.css'

const CATEGORIES = [
  'Quehacer científico y tecnológico (Primaria)',
  'Proyecto de investigación científica',
  'Proyecto de investigación y desarrollo tecnológico',
  'Subcategoría sumando experiencias científicas',
  'Demostraciones científicas y tecnológicas',
]
const NAMES = ['Quehacer científico (Primaria)', 'Investigación científica', 'Investigación y desarrollo tecnológico', 'Sumando experiencias', 'Demostraciones científicas']
const COLORS = ['#13bdf0', '#ff891f', '#9b7bea', '#23b889', '#e05b96']
const clamp = (n, a, b) => Math.max(a, Math.min(b, n))
const normalize = v => String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

function shortModality(value) {
  const t = normalize(value)
  if (t.includes('primaria') && t.includes('epja')) return ['Prim.', 'EPJA']
  if (t.includes('secundaria') && t.includes('epja')) return ['Sec.', 'EPJA']
  if (t.includes('secundaria') && t.includes('tecnica')) return ['Sec.', 'téc.']
  if (t.includes('secundaria') && t.includes('indigena')) return ['Sec.', 'indíg.']
  if (t.includes('primaria') && t.includes('indigena')) return ['Prim.', 'indíg.']
  if (t.includes('primaria') && t.includes('unidocente')) return ['Prim.', 'unidoc.']
  if (t.includes('secundaria') && t.includes('academica')) return ['Sec.', 'académ.']
  if (t.includes('primaria') && t.includes('academica')) return ['Prim.', 'académ.']
  if (t.includes('cientifica') || t.includes('humanistic')) return ['Sec.', 'cient.', 'hum.']
  if (t.includes('especial') || t.includes('vocacional')) {
    const cycles = t.includes('iii y iv') ? 'III-IV' : t.includes('ii, iii') ? 'II-IV' : 'PN'
    return ['Ed. esp.', cycles]
  }
  const words = String(value).split(/\s+/)
  return words.length > 1 ? [words[0].slice(0, 9), words.slice(1).join(' ').slice(0, 11)] : [String(value).slice(0, 13)]
}

function wrapLabel(value, max = 19) {
  const lines = ['']
  for (const word of String(value).split(/\s+/)) {
    const i = lines.length - 1
    const next = lines[i] ? `${lines[i]} ${word}` : word
    if (next.length > max && lines[i]) lines.push(word)
    else lines[i] = next
  }
  return lines
}

function fitLabel(value, maxChars, maxLines) {
  const all = wrapLabel(value, maxChars)
  if (all.length <= maxLines) return all
  const lines = all.slice(0, maxLines)
  const lastIndex = lines.length - 1
  lines[lastIndex] = `${lines[lastIndex].slice(0, Math.max(1, maxChars - 1)).trimEnd()}…`
  return lines
}

export default function AreaModalityBubbleMatrix({ data, theme = 'dark', interactiveZoom = false }) {
  const svgRef = useRef(null)
  const zoomRef = useRef(null)
  const groupRef = useRef(null)
  const tooltipRef = useRef(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [zoom, setZoom] = useState(1)
  const [tooltip, setTooltip] = useState(null)

  const { areas, modalities, categories, counts, maxCount } = useMemo(() => {
    const rows = Array.isArray(data) ? data : []
    const areas = [...new Set(rows.map(d => String(d['Área temática'] ?? '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'))
    const modalities = [...new Set(rows.map(d => String(d.Modalidad ?? '').trim()).filter(Boolean))]
    const observed = [...new Set(rows.map(d => String(d['Categoría'] ?? '').trim()).filter(Boolean))]
    const categories = [...CATEGORIES.filter(c => observed.includes(c)), ...observed.filter(c => !CATEGORIES.includes(c))]
    const counts = new Map()
    for (const row of rows) {
      const area = String(row['Área temática'] ?? '').trim()
      const modality = String(row.Modalidad ?? '').trim()
      const category = String(row['Categoría'] ?? '').trim()
      if (!area || !modality || !category) continue
      const key = JSON.stringify([area, modality, category])
      counts.set(key, (counts.get(key) || 0) + 1)
    }
    return { areas, modalities, categories, counts, maxCount: Math.max(1, ...counts.values()) }
  }, [data])

  // Se mide el SVG real: si en móvil recibe un ancho mínimo desplazable,
  // la escala D3 se calcula sobre ese ancho y no sobre el viewport recortado.
  useEffect(() => {
    const target = svgRef.current
    if (!target) return
    let raf
    const applySize = (width, height) => {
      const next = { width: Math.round(width), height: Math.round(height) }
      if (!next.width || !next.height) return
      setSize(prev => prev.width === next.width && prev.height === next.height ? prev : next)
    }
    const observer = new ResizeObserver(entries => {
      const r = entries[0]?.contentRect
      if (!r) return
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => applySize(r.width, r.height))
    })
    observer.observe(target)
    const rect = target.getBoundingClientRect()
    applySize(rect.width, rect.height)
    return () => { observer.disconnect(); cancelAnimationFrame(raf) }
  }, [areas.length, modalities.length])

  // El contenedor manda. Solo se usa un valor de respaldo durante el primer frame.
  const width = Math.max(200, Math.round(size.width || 640))
  const height = Math.max(170, Math.round(size.height || 420))
  const left = interactiveZoom ? clamp(width * .22, 142, 212) : clamp(width * .22, 104, 190)
  const right = 10
  const plotW = Math.max(80, width - left - right)
  const cellW = plotW / Math.max(1, modalities.length)
  const textColor = theme === 'light' ? '#17395c' : '#d6e8fa'
  const lineColor = theme === 'light' ? '#dbe7f1' : '#345575'

  // Etiquetas de modalidad: se abrevian y se ajusta la fuente al ancho real de cada columna.
  const modalityLayouts = modalities.map(modality => ({ full: modality, lines: shortModality(modality) }))
  const longestModalityLine = Math.max(1, ...modalityLayouts.flatMap(item => item.lines.map(line => line.length)))
  const modalityFont = clamp(
    Math.min(cellW * .26, (cellW * .92) / (longestModalityLine * .55)),
    7.2,
    interactiveZoom ? 11 : 10.5,
  )
  const modalityLineHeight = modalityFont * 1.18
  // Si las abreviaturas no caben a lo ancho de su columna, se giran 90°.
  // Así siguen siendo legibles en el panel estrecho de 1251-1366 px.
  const rotateModalities = modalityFont * .55 * longestModalityLine > cellW * .98
  const top = interactiveZoom ? 20 : 14
  const bottom = rotateModalities ? 70 : interactiveZoom ? 72 : 58
  const plotH = Math.max(80, height - top - bottom)
  const cellH = plotH / Math.max(1, areas.length)

  // Etiquetas de área: nunca más líneas de las que caben en el alto de la fila.
  const areaFont = clamp(cellH * .32, 8.5, interactiveZoom ? 12 : 11.5)
  const areaLineHeight = areaFont * 1.16
  const areaMaxLines = clamp(Math.floor((cellH - 2) / areaLineHeight), 1, 3)
  const areaMaxChars = Math.max(8, Math.floor((left - 14) / (areaFont * .55)))

  const positionsByCount = {
    1: [[0, 0]],
    2: [[-.24, -.24], [.24, .24]],
    3: [[0, -.28], [-.27, .22], [.27, .22]],
    4: [[-.24, -.24], [.24, -.24], [-.24, .24], [.24, .24]],
    5: [[-.28, -.26], [.28, -.26], [0, 0], [-.28, .26], [.28, .26]],
  }

  // Distancia mínima entre los centros de una misma celda, ya escalada.
  // Limita el radio para que burbujas de la misma celda no se tapen.
  const minCenterDistance = (positions, cw, ch) => {
    let min = Infinity
    for (let i = 0; i < positions.length; i += 1) {
      for (let j = i + 1; j < positions.length; j += 1) {
        const dx = (positions[i][0] - positions[j][0]) * cw
        const dy = (positions[i][1] - positions[j][1]) * ch
        min = Math.min(min, Math.hypot(dx, dy))
      }
    }
    return Number.isFinite(min) ? min : Math.min(cw, ch)
  }

  useEffect(() => {
    if (!interactiveZoom || !svgRef.current || !groupRef.current) return
    const svg = d3.select(svgRef.current), group = d3.select(groupRef.current)
    const behavior = d3.zoom().scaleExtent([1, 5])
      .extent([[0, 0], [width, height]])
      .translateExtent([[0, 0], [width, height]])
      .filter(e => e.type === 'wheel' || (!e.button && !e.ctrlKey))
      .on('zoom', e => {
        group.attr('transform', e.transform.toString())
        setZoom(e.transform.k)
        setTooltip(null)
      })
    zoomRef.current = behavior
    svg.call(behavior).on('dblclick.zoom', null)
    return () => { svg.on('.zoom', null); zoomRef.current = null }
  }, [interactiveZoom, width, height])

  useLayoutEffect(() => {
    if (!tooltip || !tooltipRef.current) return
    const el = tooltipRef.current, rect = el.getBoundingClientRect()
    const gap = 14, pad = 12
    const x = tooltip.x + gap + rect.width < window.innerWidth - pad ? tooltip.x + gap : tooltip.x - rect.width - gap
    const y = tooltip.y + gap + rect.height < window.innerHeight - pad ? tooltip.y + gap : tooltip.y - rect.height - gap
    el.style.left = `${clamp(x, pad, Math.max(pad, window.innerWidth - rect.width - pad))}px`
    el.style.top = `${clamp(y, pad, Math.max(pad, window.innerHeight - rect.height - pad))}px`
    el.style.visibility = 'visible'
  }, [tooltip])

  const zoomBy = factor => {
    if (svgRef.current && zoomRef.current)
      d3.select(svgRef.current).transition().duration(160).call(zoomRef.current.scaleTo, clamp(zoom * factor, 1, 5))
  }
  const reset = () => {
    if (svgRef.current && zoomRef.current)
      d3.select(svgRef.current).transition().duration(160).call(zoomRef.current.transform, d3.zoomIdentity)
  }
  const tooltipFor = (event, area, modality, category, count) =>
    setTooltip({ area, modality, category, count, x: event.clientX, y: event.clientY })

  if (!areas.length || !modalities.length) return <div className="bubble-matrix__empty">No hay datos para mostrar</div>

  return <div className={`bubble-matrix ${interactiveZoom ? 'bubble-matrix--interactive' : 'bubble-matrix--preview'}`}>
    {interactiveZoom && <div className="bubble-matrix__legend" aria-label="Categorías">
      {categories.map((c, i) => {
        const ci = CATEGORIES.indexOf(c)
        return <span key={c} className="bubble-matrix__legend-item" title={c}>
          <span className="bubble-matrix__legend-dot" style={{ background: COLORS[(ci >= 0 ? ci : i) % COLORS.length] }}/>
          <span>{ci >= 0 ? NAMES[ci] : c}</span>
        </span>
      })}
      <span className="bubble-matrix__size-hint">Tamaño = cantidad de proyectos</span>
    </div>}
    {interactiveZoom && <div className="bubble-matrix__toolbar">
      <span>Rueda: zoom · Arrastrar: mover</span>
      <button type="button" onClick={() => zoomBy(1 / 1.35)} disabled={zoom <= 1.001} aria-label="Alejar">−</button>
      <output>{Math.round(zoom * 100)}%</output>
      <button type="button" onClick={() => zoomBy(1.35)} disabled={zoom >= 4.999} aria-label="Acercar">+</button>
      <button type="button" onClick={reset} disabled={zoom <= 1.001}>Restablecer</button>
    </div>}
    <div className="bubble-matrix__canvas">
      <svg ref={svgRef} className="bubble-matrix__svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Área temática, modalidad educativa y categoría; tamaño de burbuja indica proyectos">
        <g ref={groupRef}>
          {/* Las modalidades van abajo y con saltos de línea para no amontonarse. */}
          {modalityLayouts.map(({ full, lines: allLines }, c) => {
            const x = left + (c + .5) * cellW
            const y = top + plotH + 15
            // Al girar, tres líneas ocuparían más ancho que su columna; se funden en dos.
            const lines = rotateModalities && allLines.length > 2
              ? [allLines[0], allLines.slice(1).join(' ')]
              : allLines
            return <text
              key={full}
              x={x}
              y={y}
              transform={rotateModalities ? `rotate(-90 ${x} ${y})` : undefined}
              fontSize={modalityFont}
              fill={textColor}
              textAnchor={rotateModalities ? 'end' : 'middle'}
              fontWeight="600"
            >
              <title>{full}</title>
              {lines.map((t, i) => <tspan key={i} x={x} dy={i ? modalityLineHeight : 0}>{t}</tspan>)}
            </text>
          })}
          {areas.map((area, r) => {
            const y = top + (r + .5) * cellH
            const lines = fitLabel(area, areaMaxChars, areaMaxLines)
            return <g key={area}>
              <text
                x={left - 9}
                y={y - ((lines.length - 1) * areaLineHeight) / 2 + areaFont * .35}
                textAnchor="end"
                fontSize={areaFont}
                fill={textColor}
                fontWeight="600"
              >
                <title>{area}</title>
                {lines.map((t, i) => <tspan key={i} x={left - 9} dy={i ? areaLineHeight : 0}>{t}</tspan>)}
              </text>
              {modalities.map((modality, c) => {
                const x = left + (c + .5) * cellW
                const entries = categories
                  .map((category, i) => ({ category, i, count: counts.get(JSON.stringify([area, modality, category])) || 0 }))
                  .filter(d => d.count > 0)
                const positions = positionsByCount[entries.length] || positionsByCount[5]
                const maxRadius = Math.min(
                  Math.min(cellW, cellH) * (entries.length === 1 ? .4 : entries.length === 2 ? .3 : .25),
                  minCenterDistance(positions, cellW, cellH) * .46,
                  Math.min(cellW, cellH) * .42,
                )
                const minRadius = Math.min(2.5, maxRadius)
                return <g key={modality}>
                  {interactiveZoom && <rect x={left + c * cellW + .5} y={top + r * cellH + .5} width={Math.max(1, cellW - 1)} height={Math.max(1, cellH - 1)} fill="none" stroke={lineColor} strokeWidth=".6"/>}
                  {entries.map(({ category, i, count }, j) => {
                    const [px, py] = positions[j] || [0, 0]
                    const radius = clamp(
                      minRadius + Math.sqrt(count / maxCount) * (maxRadius - minRadius),
                      minRadius,
                      Math.max(minRadius, maxRadius),
                    )
                    const ci = CATEGORIES.indexOf(category)
                    return <circle
                      key={category}
                      cx={x + px * cellW}
                      cy={y + py * cellH}
                      r={radius}
                      fill={COLORS[(ci >= 0 ? ci : i) % COLORS.length]}
                      stroke={theme === 'light' ? '#fff' : '#082449'}
                      strokeWidth=".75"
                      tabIndex={0}
                      aria-label={`${area}, ${modality}, ${category}: ${count} proyectos`}
                      onMouseEnter={e => tooltipFor(e, area, modality, category, count)}
                      onMouseMove={e => tooltipFor(e, area, modality, category, count)}
                      onMouseLeave={() => setTooltip(null)}
                      onFocus={e => {
                        const box = e.currentTarget.getBoundingClientRect()
                        tooltipFor({ clientX: box.left + box.width / 2, clientY: box.top + box.height / 2 }, area, modality, category, count)
                      }}
                      onBlur={() => setTooltip(null)}
                    />
                  })}
                </g>
              })}
            </g>
          })}
          <line x1={left} x2={left} y1={top} y2={top + plotH} stroke={lineColor}/>
          <line x1={left} x2={left + plotW} y1={top + plotH} y2={top + plotH} stroke={lineColor}/>
        </g>
      </svg>
    </div>
    {tooltip && createPortal(<div className="bubble-matrix__tooltip" ref={tooltipRef} role="status" style={{ left: 0, top: 0, visibility: 'hidden' }}>
      <strong>{tooltip.area}</strong><span>{tooltip.modality}</span><span>{tooltip.category}</span><b>{tooltip.count} {tooltip.count === 1 ? 'proyecto' : 'proyectos'}</b>
    </div>, document.body)}
  </div>
}
