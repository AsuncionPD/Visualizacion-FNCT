import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import * as d3 from 'd3'
import { getStudentsByAreaAndSex } from '../../utils/dataProcessing.js'
import './AreaSexChart.css'

const normalizeSex = (value) => {
  const s = String(value).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (['femenino', 'mujer', 'f'].includes(s)) return 'Femenino'
  if (['masculino', 'hombre', 'm'].includes(s)) return 'Masculino'
  return String(value)
}
const wrap = (value, max) => {
  const lines = ['']
  String(value).split(/\s+/).forEach(word => {
    const i = lines.length - 1
    const next = lines[i] ? `${lines[i]} ${word}` : word
    if (next.length > max && lines[i]) lines.push(word)
    else lines[i] = next
  })
  return lines
}
const clamp = (v, min, max) => Math.max(min, Math.min(max, v))

function AreaSexChart({ data }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const tooltipRef = useRef(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [tooltip, setTooltip] = useState(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    let raf
    const ro = new ResizeObserver(entries => {
      const r = entries[0]?.contentRect
      if (!r) return
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setSize(old => {
        const width = Math.round(r.width), height = Math.round(r.height)
        return old.width === width && old.height === height ? old : { width, height }
      }))
    })
    ro.observe(el)
    return () => { ro.disconnect(); cancelAnimationFrame(raf) }
  }, [])

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    if (!Array.isArray(data) || !data.length) return

    const grouped = getStudentsByAreaAndSex(data)
    const records = Object.entries(grouped).map(([area, values]) => {
      const d = { area, total: 0, Femenino: 0, Masculino: 0 }
      Object.entries(values).forEach(([sex, val]) => {
        const normalized = normalizeSex(sex), count = Number(val) || 0
        d[normalized] = (d[normalized] || 0) + count
        d.total += count
      })
      return d
    }).sort((a, b) => b.total - a.total)

    if (!records.length) return

    // Dimensiones reales medidas con ResizeObserver; los topes solo evitan
    // cálculos inválidos durante el primer frame o con contenedores ocultos.
    const width = Math.max(size.width || 0, 280)
    const height = Math.max(size.height || 0, 200)
    const maxTotal = d3.max(records, d => d.total) || 1

    // El margen derecho reserva espacio para la etiqueta del total.
    const right = clamp(30 + String(maxTotal).length * 7, 36, 58)
    const left = clamp(width * .26, 112, 286)
    const margin = { left, top: 8, right, bottom: 30 }
    const innerWidth = Math.max(80, width - margin.left - margin.right)
    const innerHeight = Math.max(80, height - margin.top - margin.bottom)
    const rowStep = innerHeight / records.length

    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('preserveAspectRatio', 'xMidYMid meet')
    const group = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3.scaleLinear().domain([0, maxTotal]).nice().range([0, innerWidth])
    const bandPadding = rowStep >= 38 ? .2 : rowStep >= 28 ? .17 : .13
    const y = d3.scaleBand().domain(records.map(d => d.area)).range([0, innerHeight]).padding(bandPadding)

    // Se busca el mayor tamaño de fuente que permite mostrar las etiquetas
    // completas sin que una fila invada la siguiente.
    const labelWidth = Math.max(48, left - 16)
    const desiredFont = clamp(Math.min(width * .0135, rowStep * .42), 9, 12.5)
    let fontSize = desiredFont
    let lineHeight = fontSize * 1.14
    let maxLines = 1
    for (let step = 0; ; step += 1) {
      const candidate = Math.max(8.5, desiredFont - step * .5)
      const candidateLineHeight = candidate * 1.14
      const candidateMaxLines = clamp(Math.floor((rowStep - 3) / candidateLineHeight), 1, 3)
      const candidateChars = Math.max(8, Math.floor(labelWidth / (candidate * .54)))
      const fits = records.every(d => wrap(d.area, candidateChars).length <= candidateMaxLines)
      fontSize = candidate
      lineHeight = candidateLineHeight
      maxLines = candidateMaxLines
      if (fits || candidate <= 8.5) break
    }

    const maxChars = Math.max(8, Math.floor(labelWidth / (fontSize * .54)))
    const labels = new Map(records.map(d => {
      const all = wrap(d.area, maxChars)
      const visible = all.slice(0, maxLines)
      if (all.length > maxLines) {
        const last = visible.length - 1
        visible[last] = `${visible[last].slice(0, Math.max(1, maxChars - 1)).trimEnd()}…`
      }
      return [d.area, visible]
    }))

    const tickCount = width < 420 ? 3 : 4
    const gridAxis = group.append('g').attr('class', 'area-sex-grid').attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).ticks(tickCount).tickSize(-innerHeight).tickFormat(d3.format('d')))
    gridAxis.selectAll('text').attr('font-size', clamp(width * .012, 9, 11))
    gridAxis.selectAll('.tick line').attr('stroke-opacity', .3)
    gridAxis.select('.domain').attr('stroke-opacity', .8)

    const allSexes = [...new Set(records.flatMap(d => Object.keys(d).filter(k => !['area', 'total'].includes(k))))]
    const sexes = ['Femenino', 'Masculino', ...allSexes.filter(s => !['Femenino', 'Masculino'].includes(s))]
    const palette = { Femenino: '#ff891f', Masculino: '#13bdf0' }
    const color = sex => palette[sex] || '#9cb8d1'
    const series = d3.stack().keys(sexes)(records)

    group.selectAll('.area-sex-series').data(series).join('g').attr('fill', s => color(s.key))
      .selectAll('rect').data(s => s.map(d => ({ ...d, sex: s.key }))).join('rect')
      .attr('class', 'area-sex-bar').attr('x', d => x(d[0])).attr('y', d => y(d.data.area))
      .attr('width', d => Math.max(0, x(d[1]) - x(d[0]))).attr('height', y.bandwidth())
      .attr('rx', Math.min(2.5, y.bandwidth() / 4))
      .on('mouseenter mousemove', (event, d) => setTooltip({ area: d.data.area, sex: d.sex, count: d[1] - d[0], x: event.clientX, y: event.clientY }))
      .on('mouseleave', () => setTooltip(null))

    const axis = group.append('g').attr('class', 'area-sex-y-axis').call(d3.axisLeft(y).tickSize(0).tickPadding(8))
    axis.select('.domain').remove()
    axis.selectAll('.tick line').remove()
    axis.selectAll('.tick text').attr('font-size', fontSize).attr('dy', 0).each(function(area) {
      const label = d3.select(this)
      const lines = labels.get(area) || [area]
      label.text(null)
      label.append('title').text(area)
      lines.forEach((line, i) => label.append('tspan')
        .attr('x', -8)
        .attr('dy', i === 0 ? -((lines.length - 1) * lineHeight) / 2 + fontSize * .35 : lineHeight)
        .text(line))
    })

    group.selectAll('.area-sex-total').data(records).join('text')
      .attr('class', 'area-sex-total').attr('font-size', clamp(width * .014, 9, 12))
      .attr('x', d => x(d.total) + 5).attr('y', d => y(d.area) + y.bandwidth() / 2)
      .attr('dominant-baseline', 'middle').text(d => d.total)

    // Las cantidades dentro de la barra solo aparecen cuando caben de verdad.
    const valueFontSize = clamp(y.bandwidth() * .55, 9, 11)
    series.forEach((s, index) => {
      group.selectAll(`.area-sex-value-${index}`).data(s).join('text')
        .attr('class', `area-sex-value-${index}`)
        .attr('x', d => x(d[0]) + (x(d[1]) - x(d[0])) / 2)
        .attr('y', d => y(d.data.area) + y.bandwidth() / 2)
        .attr('dominant-baseline', 'middle').attr('text-anchor', 'middle')
        .attr('font-size', valueFontSize).attr('font-weight', 700)
        .attr('fill', '#fff').attr('pointer-events', 'none')
        .text(d => {
          const value = d[1] - d[0]
          const segment = x(d[1]) - x(d[0])
          return value > 0 && y.bandwidth() >= 16 && segment >= String(value).length * valueFontSize * .62 + 8 ? value : ''
        })
    })
    return () => svg.selectAll('*').remove()
  }, [data, size.width, size.height])

  useLayoutEffect(() => {
    if (!tooltip || !tooltipRef.current) return
    const el = tooltipRef.current, r = el.getBoundingClientRect(), gap = 15, pad = 12
    const x = tooltip.x + gap + r.width < window.innerWidth - pad ? tooltip.x + gap : tooltip.x - r.width - gap
    const y = tooltip.y + gap + r.height < window.innerHeight - pad ? tooltip.y + gap : tooltip.y - r.height - gap
    el.style.left = `${clamp(x, pad, Math.max(pad, window.innerWidth - r.width - pad))}px`
    el.style.top = `${clamp(y, pad, Math.max(pad, window.innerHeight - r.height - pad))}px`
    el.style.visibility = 'visible'
  }, [tooltip])

  return <div className="area-sex-chart" ref={containerRef}>
    <svg ref={svgRef} className="area-sex-chart__svg" role="img" aria-label="Estudiantes por área temática y sexo"/>
    {tooltip && createPortal(<div ref={tooltipRef} className="area-sex-tooltip" style={{ left: 0, top: 0, visibility: 'hidden' }} role="status">
      <strong>{tooltip.area}</strong>
      <div className="area-sex-tooltip__category"><span className="area-sex-tooltip__dot" style={{ background: tooltip.sex === 'Femenino' ? '#ff891f' : tooltip.sex === 'Masculino' ? '#13bdf0' : '#9cb8d1' }}/><span>{tooltip.sex}</span></div>
      <span className="area-sex-tooltip__value">{tooltip.count} {tooltip.count === 1 ? 'estudiante' : 'estudiantes'}</span>
    </div>, document.body)}
  </div>
}
export default AreaSexChart
