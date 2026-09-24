import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

import {
  getProjectsByAreaAndModality,
} from '../../utils/dataProcessing.js'

import './AreaModalityHeatmap.css'

function AreaModalityHeatmap({ data }) {
  const svgRef = useRef(null)
  const containerRef = useRef(null)

  const [tooltip, setTooltip] = useState(null)

  useEffect(() => {
    if (!data || data.length === 0) return

    // ==========================================
    // 1. OBTENER DATOS
    // ==========================================

    const grouped =
      getProjectsByAreaAndModality(data)

    const areas = Object.keys(grouped)

    const modalidades = Array.from(
      new Set(
        Object.values(grouped).flatMap((values) =>
          Object.keys(values)
        )
      )
    )

    console.log('=== HEATMAP ===')
    console.log('Áreas:', areas)
    console.log('Modalidades:', modalidades)

    // ==========================================
    // 2. CONVERTIR DATOS PARA D3
    // ==========================================

    const heatmapData = []

    areas.forEach((area) => {
      modalidades.forEach((modalidad) => {
        heatmapData.push({
          area,
          modalidad,
          cantidad:
            grouped[area]?.[modalidad] || 0,
        })
      })
    })

    // ==========================================
    // 3. NOMBRES CORTOS
    // Solo para mostrarlos visualmente.
    // El tooltip conserva el nombre completo.
    // ==========================================

    const getShortModality = (modalidad) => {
      const text = modalidad
        .trim()
        .toLowerCase()

      if (
        text.includes('secundaria') &&
        text.includes('técnica')
      ) {
        return 'Secundaria técnica'
      }

      if (
        text.includes('secundaria') &&
        (
          text.includes('científica') ||
          text.includes('humanística')
        )
      ) {
        return 'Sec. científica humanística'
      }

      if (
        text.includes('secundaria') &&
        text.includes('epja')
      ) {
        return 'Secundaria EPJA'
      }

      if (
        text.includes('secundaria') &&
        text.includes('académica')
      ) {
        return 'Secundaria académica'
      }

      if (
        text.includes('primaria') &&
        text.includes('unidocente')
      ) {
        return 'Primaria unidocente'
      }

      if (
        text.includes('primaria') &&
        text.includes('epja')
      ) {
        return 'Primaria EPJA'
      }

      if (
        text.includes('primaria') &&
        text.includes('académica')
      ) {
        return 'Primaria académica'
      }

      return modalidad
    }

    // ==========================================
    // 4. TAMAÑO
    // ==========================================

    const width = 700
    const height = 520

    const margin = {
      top: 90,
      right: 10,
      bottom: 20,
      left: 150,
    }

    const innerWidth =
      width - margin.left - margin.right

    const innerHeight =
      height - margin.top - margin.bottom

    // ==========================================
    // 5. SVG
    // ==========================================

    const svg = d3.select(svgRef.current)

    svg.selectAll('*').remove()

    svg
      .attr(
        'viewBox',
        `0 0 ${width} ${height}`
      )
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
    // 6. ESCALAS
    // ==========================================

    const x = d3
      .scaleBand()
      .domain(modalidades)
      .range([0, innerWidth])
      .padding(0.04)

    const y = d3
      .scaleBand()
      .domain(areas)
      .range([0, innerHeight])
      .padding(0.04)

    // ==========================================
    // 7. COLOR
    // ==========================================

    const maxValue =
      d3.max(
        heatmapData,
        (d) => d.cantidad
      ) || 1

    const color = d3
      .scaleSequential()
      .domain([0, maxValue])
      .interpolator(d3.interpolateBlues)

    // ==========================================
    // 8. CELDAS
    // ==========================================

    group
      .selectAll('.heatmap-cell')
      .data(heatmapData)
      .join('rect')

      .attr('class', 'heatmap-cell')

      .attr(
        'x',
        (d) => x(d.modalidad)
      )

      .attr(
        'y',
        (d) => y(d.area)
      )

      .attr(
        'width',
        x.bandwidth()
      )

      .attr(
        'height',
        y.bandwidth()
      )

      .attr('rx', 2)

      .attr('fill', (d) => {
        if (d.cantidad === 0) {
          return '#0d2a50'
        }

        return color(d.cantidad)
      })

      // ========================================
      // TOOLTIP
      // ========================================

      .on('mouseenter', (event, d) => {
        const bounds =
          containerRef.current
            .getBoundingClientRect()

        setTooltip({
          area: d.area,
          modalidad: d.modalidad,
          cantidad: d.cantidad,

          x:
            event.clientX -
            bounds.left,

          y:
            event.clientY -
            bounds.top,
        })
      })

      .on('mousemove', (event, d) => {
        const bounds =
          containerRef.current
            .getBoundingClientRect()

        setTooltip({
          area: d.area,
          modalidad: d.modalidad,
          cantidad: d.cantidad,

          x:
            event.clientX -
            bounds.left,

          y:
            event.clientY -
            bounds.top,
        })
      })

      .on('mouseleave', () => {
        setTooltip(null)
      })

    // ==========================================
    // 9. NÚMEROS DE LAS CELDAS
    // ==========================================

    group
      .selectAll('.heatmap-value')
      .data(
        heatmapData.filter(
          (d) => d.cantidad > 0
        )
      )
      .join('text')

      .attr(
        'class',
        'heatmap-value'
      )

      .attr(
        'x',
        (d) =>
          x(d.modalidad) +
          x.bandwidth() / 2
      )

      .attr(
        'y',
        (d) =>
          y(d.area) +
          y.bandwidth() / 2
      )

      .attr(
        'text-anchor',
        'middle'
      )

      .attr(
        'dominant-baseline',
        'middle'
      )

      .text((d) => d.cantidad)

    // ==========================================
    // 10. EJE Y — ÁREAS TEMÁTICAS
    // ==========================================

    group
      .append('g')
      .attr(
        'class',
        'heatmap-y-axis'
      )
      .call(
        d3
          .axisLeft(y)
          .tickSize(0)
      )
      .call((g) =>
        g.select('.domain').remove()
      )

    // ==========================================
    // 11. EJE X — MODALIDADES
    // ==========================================

    const xAxis = group
      .append('g')

      .attr(
        'class',
        'heatmap-x-axis'
      )

      .call(
        d3
          .axisTop(x)
          .tickSize(0)
          .tickFormat(getShortModality)
      )

    xAxis
      .select('.domain')
      .remove()

    // ==========================================
    // 12. DIVIDIR MODALIDADES EN VARIAS LÍNEAS
    // ==========================================

    xAxis
      .selectAll('text')
      .each(function () {
        const text = d3.select(this)

        const label = text.text()

        const words =
          label.split(' ')

        text.text('')

        const lines = []
        let currentLine = ''

        words.forEach((word) => {
          const testLine =
            currentLine
              ? `${currentLine} ${word}`
              : word

          /*
            Al ser columnas pequeñas,
            no dejamos líneas demasiado largas.
          */
          if (testLine.length <= 11) {
            currentLine = testLine
          } else {
            if (currentLine) {
              lines.push(currentLine)
            }

            currentLine = word
          }
        })

        if (currentLine) {
          lines.push(currentLine)
        }

        // Máximo 3 líneas
        const visibleLines =
          lines.slice(0, 3)

        if (lines.length > 3) {
          const lastIndex =
            visibleLines.length - 1

          let lastLine =
            visibleLines[lastIndex]

          if (lastLine.length > 9) {
            lastLine =
              lastLine.substring(0, 9)
          }

          visibleLines[lastIndex] =
            `${lastLine}...`
        }

        visibleLines.forEach(
          (line, index) => {
            text
              .append('tspan')

              .attr('x', 0)

              .attr(
                'dy',
                index === 0
                  ? '-2.8em'
                  : '1.15em'
              )

              .text(line)
          }
        )
      })

  }, [data])

  return (
    <div
      ref={containerRef}
      className="area-modality-heatmap"
    >
      <svg
        ref={svgRef}
        className="area-modality-heatmap__svg"
        role="img"
        aria-label="Cantidad de proyectos por área temática y modalidad"
      />

      {tooltip && (
        <div
          className="heatmap-tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y,
          }}
        >
          <strong>
            {tooltip.area}
          </strong>

          <span>
            {tooltip.modalidad}
          </span>

          <span>
            {tooltip.cantidad}{' '}
            {tooltip.cantidad === 1
              ? 'proyecto'
              : 'proyectos'}
          </span>
        </div>
      )}
    </div>
  )
}

export default AreaModalityHeatmap