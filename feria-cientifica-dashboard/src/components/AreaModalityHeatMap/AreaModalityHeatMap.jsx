
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import * as d3 from 'd3'

import {
  getProjectsByAreaAndModality,
} from '../../utils/dataProcessing.js'

import './AreaModalityHeatmap.css'

function AreaModalityHeatmap({ data, theme = 'dark' }) {
  const svgRef = useRef(null)
  const [tooltip, setTooltip] = useState(null)

  useEffect(() => {
    const svg = d3.select(svgRef.current)

    svg.selectAll('*').remove()

    if (!data || data.length === 0) {
      return
    }

    const isLight = theme === 'light'

    // ==========================================
    // 1. DATOS
    // ==========================================

    const grouped = getProjectsByAreaAndModality(data)

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
          cantidad: grouped[area]?.[modalidad] || 0,
        })
      })
    })

    // ==========================================
    // 2. ABREVIAR MODALIDADES
    // ==========================================

    const getShortModality = (modalidad) => {
      const text = modalidad
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')

      if (
        text.includes('secundaria') &&
        text.includes('tecnica')
      ) {
        return 'Sec. técnica'
      }

      if (
        text.includes('secundaria') &&
        (
          text.includes('cientifica') ||
          text.includes('humanistica')
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
        text.includes('academica')
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
        text.includes('academica')
      ) {
        return 'Prim. académica'
      }

      return modalidad
    }

    // ==========================================
    // 3. DIMENSIONES ORIGINALES
    // ==========================================

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

    svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')

    const group = svg
      .append('g')
      .attr(
        'transform',
        `translate(${margin.left}, ${margin.top})`
      )

    // ==========================================
    // 5. ESCALAS DE POSICIÓN
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
    // 6. ESCALA DE COLOR SEGÚN TEMA
    // ==========================================

    const maxValue =
      d3.max(heatmapData, (d) => d.cantidad) || 1

    const color = d3
      .scaleLinear()
      .domain([
        0,
        maxValue * 0.25,
        maxValue * 0.5,
        maxValue * 0.75,
        maxValue,
      ])
      .range(
        isLight
          ? [
              '#edf8ff',
              '#b9e8fb',
              '#65c9f0',
              '#168bd3',
              '#0754a3',
            ]
          : [
              '#c9f1ff',
              '#82d9ff',
              '#13bdf0',
              '#0874c9',
              '#0754a3',
            ]
      )
      .interpolate(d3.interpolateRgb)
      .clamp(true)

    const getCellColor = (cantidad) => {
      if (cantidad === 0) {
        return isLight ? '#e7f1f9' : '#082449'
      }

      return color(cantidad)
    }

    // ==========================================
    // 7. CONTRASTE DE LOS NÚMEROS
    // ==========================================

    const getTextColor = (cantidad) => {
      const background = d3.rgb(
        getCellColor(cantidad)
      )

      const toLinear = (value) => {
        const channel = value / 255

        return channel <= 0.04045
          ? channel / 12.92
          : ((channel + 0.055) / 1.055) ** 2.4
      }

      const luminance =
        0.2126 * toLinear(background.r) +
        0.7152 * toLinear(background.g) +
        0.0722 * toLinear(background.b)

      return luminance > 0.18
        ? '#082449'
        : '#ffffff'
    }

    // ==========================================
    // 8. TOOLTIP
    // ==========================================

    const updateTooltip = (event, d) => {
      const padding = 12
      const offset = 16

      const tooltipWidth = Math.min(
        300,
        window.innerWidth - padding * 2
      )

      const tooltipHeight = 125

      let xPosition = event.clientX + offset
      let yPosition = event.clientY + offset

      if (
        xPosition + tooltipWidth >
        window.innerWidth - padding
      ) {
        xPosition =
          event.clientX - tooltipWidth - offset
      }

      xPosition = Math.max(
        padding,
        Math.min(
          xPosition,
          window.innerWidth - tooltipWidth - padding
        )
      )

      yPosition = Math.max(
        padding,
        Math.min(
          yPosition,
          window.innerHeight - tooltipHeight - padding
        )
      )

      setTooltip({
        area: d.area,
        modalidad: d.modalidad,
        cantidad: d.cantidad,
        x: xPosition,
        y: yPosition,
      })
    }

    // ==========================================
    // 9. CELDAS
    // ==========================================

    group
      .selectAll('.heatmap-cell')
      .data(heatmapData)
      .join('rect')
      .attr('class', 'heatmap-cell')
      .attr('x', (d) => x(d.modalidad))
      .attr('y', (d) => y(d.area))
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .attr('rx', 3)
      .attr('fill', (d) => getCellColor(d.cantidad))
      .on('mouseenter', updateTooltip)
      .on('mousemove', updateTooltip)
      .on('mouseleave', () => {
        setTooltip(null)
      })

    // ==========================================
    // 10. NÚMEROS
    // ==========================================

    group
      .selectAll('.heatmap-value')
      .data(
        heatmapData.filter(
          (d) => d.cantidad > 0
        )
      )
      .join('text')
      .attr('class', 'heatmap-value')
      .attr(
        'x',
        (d) =>
          x(d.modalidad) + x.bandwidth() / 2
      )
      .attr(
        'y',
        (d) =>
          y(d.area) + y.bandwidth() / 2
      )
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr(
        'fill',
        (d) => getTextColor(d.cantidad)
      )
      .text((d) => d.cantidad)

    // ==========================================
    // 11. EJE Y
    // ==========================================

    group
      .append('g')
      .attr('class', 'heatmap-y-axis')
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
    // 12. EJE X
    // ==========================================

    const xAxis = group
      .append('g')
      .attr('class', 'heatmap-x-axis')
      .call(
        d3
          .axisTop(x)
          .tickSize(0)
          .tickFormat(getShortModality)
      )

    xAxis.select('.domain').remove()

    // ==========================================
    // 13. DIVIDIR ETIQUETAS
    // ==========================================

    xAxis
      .selectAll('text')
      .each(function () {
        const text = d3.select(this)
        const label = text.text()
        const words = label.split(' ')

        text.text('')

        if (words.length === 1) {
          text
            .append('tspan')
            .attr('x', 0)
            .attr('dy', '-0.8em')
            .text(words[0])

          return
        }

        const middle = Math.ceil(words.length / 2)

        const firstLine = words
          .slice(0, middle)
          .join(' ')

        const secondLine = words
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

    return () => {
      svg.selectAll('*').remove()
    }

  }, [data, theme])

  return (
    <div className="area-modality-heatmap">

      <svg
        ref={svgRef}
        className="area-modality-heatmap__svg"
        role="img"
        aria-label="Cantidad de proyectos por área temática y modalidad"
      />

      {tooltip && createPortal(
        <div
          className="heatmap-tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y,
          }}
        >
          <strong
            style={{
              color: theme === 'light'
                ? '#082449'
                : '#ffffff',
            }}
          >
            {tooltip.area}
          </strong>

          <span>{tooltip.modalidad}</span>

          <span>
            {tooltip.cantidad}{' '}
            {tooltip.cantidad === 1
              ? 'proyecto'
              : 'proyectos'}
          </span>
        </div>,
        document.body
      )}

    </div>
  )
}

export default AreaModalityHeatmap