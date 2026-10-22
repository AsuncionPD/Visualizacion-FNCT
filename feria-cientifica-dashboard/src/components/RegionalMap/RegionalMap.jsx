
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
  const viewportRef = useRef(null)

  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  })

  const [tooltip, setTooltip] = useState(null)

  const [range, setRange] = useState({
    min: 0,
    max: 0,
  })

  // ========================================
  // 1. MEDIR EL CONTENEDOR
  // ========================================

  useEffect(() => {
    const viewport = viewportRef.current

    if (!viewport) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]

      if (!entry) return

      const width = Math.round(entry.contentRect.width)
      const height = Math.round(entry.contentRect.height)

      if (width <= 0 || height <= 0) return

      setDimensions((previous) => {
        if (
          previous.width === width &&
          previous.height === height
        ) {
          return previous
        }

        return { width, height }
      })
    })

    observer.observe(viewport)

    return () => observer.disconnect()
  }, [])

  // ========================================
  // 2. DIBUJAR MAPA
  // ========================================

  useEffect(() => {
    const { width, height } = dimensions

    if (!svgRef.current || width <= 0 || height <= 0) {
      return
    }

    const svg = d3.select(svgRef.current)

    svg.selectAll('*').remove()

    svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')

    if (!Array.isArray(data)) return

    // ========================================
    // 3. PROYECTOS POR REGIONAL
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
    // 4. PROYECCIÓN RESPONSIVA
    // ========================================

    const isMobile = window.innerWidth <= 600

    const padding = isMobile ? 12 : 20

    const projection = d3
      .geoMercator()
      .fitExtent(
        [
          [padding, padding],
          [
            Math.max(padding + 1, width - padding),
            Math.max(padding + 1, height - padding),
          ],
        ],
        regionalesData
      )

    const path = d3
      .geoPath()
      .projection(projection)

    // ========================================
    // 5. VALORES
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

    setRange((previous) => {
      if (
        previous.min === minProjects &&
        previous.max === maxProjects
      ) {
        return previous
      }

      return {
        min: minProjects,
        max: maxProjects,
      }
    })

    // ========================================
    // 6. ESCALA DE COLOR
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
    // 7. TOOLTIP
    // ========================================

    const updateTooltip = (event, feature) => {
      const nombre =
        feature.properties.NOMBRE_DRE

      const cantidad =
        getProjectCount(nombre)

      const porcentaje = data.length > 0
        ? (cantidad / data.length) * 100
        : 0

      const tooltipWidth = Math.min(
        230,
        window.innerWidth - 24
      )

      const tooltipHeight = 115
      const offset = 16
      const padding = 12

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
    // 8. REGIONES
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
  }, [data, theme, dimensions])

  return (
    <div className="regional-map">

      {/* ========================================
          MAPA
      ======================================== */}

      <div
        ref={viewportRef}
        className="regional-map__viewport"
      >
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
          <strong>{tooltip.nombre}</strong>

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
