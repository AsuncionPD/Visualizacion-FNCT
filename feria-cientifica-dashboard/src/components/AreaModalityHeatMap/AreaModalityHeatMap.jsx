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
    // 1. DATOS
    // ==========================================

    const grouped =
      getProjectsByAreaAndModality(data)

    const areas = Object.keys(grouped)

    const modalidades = Array.from(
      new Set(
        Object.values(grouped).flatMap(
          (values) => Object.keys(values)
        )
      )
    )

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
    // 2. NOMBRES CORTOS
    // ==========================================

    const getShortModality = (modalidad) => {
      const text = modalidad
        .trim()
        .toLowerCase()

      if (
        text.includes('secundaria') &&
        text.includes('técnica')
      ) {
        return 'Sec. técnica'
      }

      if (
        text.includes('secundaria') &&
        (
          text.includes('científica') ||
          text.includes('humanística')
        )
      ) {
        return 'Sec. científica'
      }

      if (
        text.includes('secundaria') &&
        text.includes('epja')
      ) {
        return 'Sec. EPJA'
      }

      if (
        text.includes('secundaria') &&
        text.includes('académica')
      ) {
        return 'Sec. académica'
      }

      if (
        text.includes('primaria') &&
        text.includes('unidocente')
      ) {
        return 'Prim. unidoc.'
      }

      if (
        text.includes('primaria') &&
        text.includes('epja')
      ) {
        return 'Prim. EPJA'
      }

      if (
        text.includes('primaria') &&
        text.includes('académica')
      ) {
        return 'Prim. académica'
      }

      return modalidad
    }

    // ==========================================
    // 3. TAMAÑO
    // ==========================================

    /*
      IMPORTANTE:
      ahora usamos un formato mucho más ancho
      porque la tarjeta del heatmap es horizontal.
    */

    const width = 1200
    const height = 360

    const margin = {
      top: 65,
      right: 15,
      bottom: 15,
      left: 165,
    }

    const innerWidth =
      width - margin.left - margin.right

    const innerHeight =
      height - margin.top - margin.bottom

    // ==========================================
    // 4. SVG
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
    // 5. ESCALAS
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
      .padding(0.05)

    // ==========================================
    // 6. COLOR
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
    // 7. CELDAS
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
    // 8. NÚMEROS
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
    // 9. EJE Y
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
          .tickPadding(8)
      )
      .call((g) =>
        g.select('.domain').remove()
      )

    // ==========================================
    // 10. EJE X
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
    // 11. DIVIDIR MODALIDADES
    // ==========================================

    xAxis
      .selectAll('text')
      .each(function () {
        const text = d3.select(this)

        const label = text.text()

        const words =
          label.split(' ')

        text.text('')

        /*
          Máximo dos líneas.
          Queremos nombres cortos y legibles.
        */

        if (words.length === 1) {
          text
            .append('tspan')
            .attr('x', 0)
            .attr('dy', '-0.8em')
            .text(words[0])

          return
        }

        const middle =
          Math.ceil(words.length / 2)

        const firstLine =
          words
            .slice(0, middle)
            .join(' ')

        const secondLine =
          words
            .slice(middle)
            .join(' ')

        text
          .append('tspan')
          .attr('x', 0)
          .attr('dy', '-1.5em')
          .text(firstLine)

        text
          .append('tspan')
          .attr('x', 0)
          .attr('dy', '1.15em')
          .text(secondLine)
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