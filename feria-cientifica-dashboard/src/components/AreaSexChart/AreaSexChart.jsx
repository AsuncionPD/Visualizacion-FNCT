import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

import {
  getStudentsByAreaAndSex,
} from '../../utils/dataProcessing.js'

import './AreaSexChart.css'

function AreaSexChart({ data }) {
  const svgRef = useRef(null)
  const containerRef = useRef(null)

  const [tooltip, setTooltip] = useState(null)

  useEffect(() => {
    if (!data || data.length === 0) return

    // ==========================================
    // 1. Obtener datos
    // ==========================================

    const grouped = getStudentsByAreaAndSex(data)

    console.log('=== ÁREA TEMÁTICA × SEXO ===')
    console.log(grouped)

    const sexes = Array.from(
      new Set(
        Object.values(grouped)
          .flatMap((values) => Object.keys(values))
      )
    )

    console.log('Sexos encontrados:', sexes)

    // ==========================================
    // 2. Convertir datos
    // ==========================================

    const chartData = Object.entries(grouped)
      .map(([area, values]) => {
        const item = {
          area,
          total: 0,
        }

        sexes.forEach((sex) => {
          item[sex] = values[sex] || 0
          item.total += values[sex] || 0
        })

        return item
      })
      .sort((a, b) => b.total - a.total)

    console.table(chartData)

    // ==========================================
    // 3. Tamaño
    // ==========================================

    const width = 600
    const height = 320

    const margin = {
      top: 15,
      right: 45,
      bottom: 30,
      left: 180,
    }

    const innerWidth =
      width - margin.left - margin.right

    const innerHeight =
      height - margin.top - margin.bottom

    // ==========================================
    // 4. Preparar SVG
    // ==========================================

    const svg = d3.select(svgRef.current)

    svg.selectAll('*').remove()

    svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr(
        'preserveAspectRatio',
        'xMidYMid meet'
      )

    const group = svg
      .append('g')
      .attr(
        'transform',
        `translate(${margin.left}, ${margin.top})`
      )

    // ==========================================
    // 5. Escalas
    // ==========================================

    const maxTotal =
      d3.max(chartData, (d) => d.total) || 1

    const x = d3
      .scaleLinear()
      .domain([0, maxTotal])
      .nice()
      .range([0, innerWidth])

    const y = d3
      .scaleBand()
      .domain(chartData.map((d) => d.area))
      .range([0, innerHeight])
      .padding(0.25)

    const colors = [
      '#e0568c',
      '#2388e8',
      '#9aa8ba',
      '#32b6a4',
    ]

    const color = d3
      .scaleOrdinal()
      .domain(sexes)
      .range(colors)

    // ==========================================
    // 6. Datos apilados
    // ==========================================

    const stack = d3
      .stack()
      .keys(sexes)

    const stackedData = stack(chartData)

    // ==========================================
    // 7. Líneas verticales
    // ==========================================

    group
      .append('g')
      .attr('class', 'area-sex-grid')
      .attr(
        'transform',
        `translate(0, ${innerHeight})`
      )
      .call(
        d3
          .axisBottom(x)
          .ticks(4)
          .tickSize(-innerHeight)
      )

    // ==========================================
    // 8. Barras
    // ==========================================

    group
      .selectAll('.area-sex-series')
      .data(stackedData)
      .join('g')
      .attr('fill', (d) => color(d.key))
      .selectAll('rect')
      .data((series) =>
        series.map((d) => ({
          ...d,
          sex: series.key,
        }))
      )
      .join('rect')
      .attr('x', (d) => x(d[0]))
      .attr('y', (d) => y(d.data.area))
      .attr(
        'width',
        (d) => Math.max(0, x(d[1]) - x(d[0]))
      )
      .attr('height', y.bandwidth())
      .attr('rx', 2)
      .style('cursor', 'pointer')

      .on('mouseenter', (event, d) => {
        setTooltip({
          area: d.data.area,
          sex: d.sex,
          cantidad: d[1] - d[0],
          x: event.clientX,
          y: event.clientY,
        })
      })

      .on('mousemove', (event, d) => {
        setTooltip({
          area: d.data.area,
          sex: d.sex,
          cantidad: d[1] - d[0],
          x: event.clientX,
          y: event.clientY,
        })
      })

      .on('mouseleave', () => {
        setTooltip(null)
      })

    // ==========================================
    // 9. Nombres de áreas
    // ==========================================

    group
      .append('g')
      .attr('class', 'area-sex-y-axis')
      .call(
        d3
          .axisLeft(y)
          .tickSize(0)
      )
      .call((g) =>
        g.select('.domain').remove()
      )

    // ==========================================
    // 10. Total al final de cada barra
    // ==========================================

    group
      .selectAll('.area-sex-total')
      .data(chartData)
      .join('text')
      .attr('class', 'area-sex-total')
      .attr('x', (d) => x(d.total) + 7)
      .attr(
        'y',
        (d) =>
          y(d.area) + y.bandwidth() / 2
      )
      .attr('dominant-baseline', 'middle')
      .text((d) => d.total)

  }, [data])

  return (
    <div
      ref={containerRef}
      className="area-sex-chart"
    >
      <svg
        ref={svgRef}
        className="area-sex-chart__svg"
        role="img"
        aria-label="Cantidad de estudiantes por área temática y sexo"
      />

      {tooltip && (
        <div
          className="area-sex-tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y,
          }}
        >
          <strong>{tooltip.area}</strong>

          <span>
            {tooltip.sex}
          </span>

          <span>
            {tooltip.cantidad}{' '}
            {tooltip.cantidad === 1
              ? 'estudiante'
              : 'estudiantes'}
          </span>
        </div>
      )}
    </div>
  )
}

export default AreaSexChart