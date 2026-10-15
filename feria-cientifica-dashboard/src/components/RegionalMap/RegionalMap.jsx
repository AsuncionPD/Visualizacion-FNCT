
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import * as d3 from 'd3'

import regionalesData from '../../data/geo/direcciones-regionales.json'

import {
  getProjectsByRegional,
} from '../../utils/dataProcessing.js'

import {
  normalizeRegionalName,
} from '../../utils/normalizeRegionalName.js'

import './RegionalMap.css'

function RegionalMap({ data, theme = 'dark' }) {
  const svgRef = useRef(null)

  const [tooltip, setTooltip] = useState(null)

  const [range, setRange] = useState({
    min: 0,
    max: 0,
  })

  useEffect(() => {
    const width = 700
    const height = 420

    const svg = d3.select(svgRef.current)

    svg.selectAll('*').remove()
    setTooltip(null)

    if (!data) return

    // ========================================
    // 1. SVG
    // ========================================

    svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')

    // ========================================
    // 2. AGRUPACIÓN POR REGIONAL
    // ========================================

    const projectsByRegional =
      getProjectsByRegional(data)

    const normalizedCounts = new Map(
      Object.entries(projectsByRegional).map(
        ([name, count]) => [
          normalizeRegionalName(name),
          count,
        ]
      )
    )

    const getProjectCount = (regionalName) => {
      const normalizedName =
        normalizeRegionalName(regionalName)

      return normalizedCounts.get(normalizedName) ?? 0
    }

    // ========================================
    // 3. PROYECCIÓN
    // ========================================

    const projection = d3
      .geoMercator()
      .fitExtent(
        [
          [20, 20],
          [width - 20, height - 20],
        ],
        regionalesData
      )

    const path = d3
      .geoPath()
      .projection(projection)

    // ========================================
    // 4. VALORES
    // ========================================

    const values = regionalesData.features.map(
      (feature) =>
        getProjectCount(feature.properties.NOMBRE_DRE)
    )

    const positiveValues = values.filter(
      (value) => value > 0
    )

    const minProjects =
      d3.min(positiveValues) ?? 0

    const maxProjects =
      d3.max(positiveValues) ?? 0

    setRange({
      min: minProjects,
      max: maxProjects,
    })

    // ========================================
    // 5. ESCALA DE COLOR
    // ========================================

    const colorScale = d3
      .scaleLinear()
      .domain([
        minProjects,
        minProjects + (maxProjects - minProjects) * 0.35,
        minProjects + (maxProjects - minProjects) * 0.7,
        maxProjects || 1,
      ])
      .range([
        '#d7f4ff',
        '#65d7ff',
        '#13bdf0',
        '#0754a3',
      ])
      .interpolate(d3.interpolateRgb)
      .clamp(true)

    const getRegionColor = (count) => {
      if (count === 0) {
        return theme === 'light'
          ? '#e7f1f9'
          : '#082449'
      }

      return colorScale(count)
    }

    // ========================================
    // 6. TOOLTIP RESPONSIVO
    // ========================================

    const updateTooltip = (event, feature) => {
      const tooltipWidth = 230
      const tooltipHeight = 115
      const offset = 16
      const padding = 12

      const nombre =
        feature.properties.NOMBRE_DRE

      const cantidad =
        getProjectCount(nombre)

      const porcentaje = data.length > 0
        ? (cantidad / data.length) * 100
        : 0

      let x = event.clientX + offset
      let y = event.clientY - tooltipHeight / 2

      if (
        x + tooltipWidth >
        window.innerWidth - padding
      ) {
        x = event.clientX - tooltipWidth - offset
      }

      x = Math.max(
        padding,
        Math.min(
          x,
          window.innerWidth - tooltipWidth - padding
        )
      )

      y = Math.max(
        padding,
        Math.min(
          y,
          window.innerHeight - tooltipHeight - padding
        )
      )

      setTooltip({
        nombre,
        cantidad,
        porcentaje,
        x,
        y,
      })
    }

    // ========================================
    // 7. DIBUJAR REGIONES
    // ========================================

    svg
      .append('g')
      .attr('class', 'regional-map__group')
      .selectAll('path')
      .data(regionalesData.features)
      .join('path')
      .attr('class', 'regional-map__region')
      .attr('d', path)
      .attr('fill', (feature) =>
        getRegionColor(
          getProjectCount(
            feature.properties.NOMBRE_DRE
          )
        )
      )
      .on('mouseenter', updateTooltip)
      .on('mousemove', updateTooltip)
      .on('mouseleave', () => setTooltip(null))

    return () => {
      svg.selectAll('*').remove()
    }

  }, [data, theme])

  return (
    <div className="regional-map">

      {/* ========================================
          MAPA
      ======================================== */}

      <div className="regional-map__viewport">
        <svg
          ref={svgRef}
          className="regional-map__svg"
          role="img"
          aria-label="Mapa de las Direcciones Regionales de Educación de Costa Rica"
        />
      </div>

      {/* ========================================
          LEYENDA
      ======================================== */}

      <div className="regional-map__legend">

        <span className="regional-map__legend-label">
          Mínima cantidad
        </span>

        <div className="regional-map__legend-scale">

          <div className="regional-map__legend-gradient" />

          <div className="regional-map__legend-values">
            <span>{range.min}</span>
            <span>{range.max}</span>
          </div>

        </div>

        <span className="regional-map__legend-label">
          Máxima cantidad
        </span>

      </div>

      {/* ========================================
          TOOLTIP
      ======================================== */}

      {tooltip && createPortal(
        <div
          className="regional-map__tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y,
          }}
        >
          <strong>
            {tooltip.nombre}
          </strong>

          <span className="regional-map__tooltip-count">
            <span className="regional-map__tooltip-dot" />

            {tooltip.cantidad}{' '}
            {tooltip.cantidad === 1
              ? 'proyecto'
              : 'proyectos'}
          </span>

          <span className="regional-map__tooltip-percentage">
            {tooltip.porcentaje.toFixed(1)}%
            {' '}del total de proyectos
          </span>

        </div>,
        document.body
      )}

    </div>
  )
}

export default RegionalMap
