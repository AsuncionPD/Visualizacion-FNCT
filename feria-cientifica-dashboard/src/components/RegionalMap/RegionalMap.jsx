import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

import regionalesData from '../../data/geo/direcciones-regionales.json'

import {
  getProjectsByRegional,
} from '../../utils/dataProcessing.js'

import {
  normalizeRegionalName,
} from '../../utils/normalizeRegionalName.js'

import './RegionalMap.css'

function RegionalMap({ data }) {
  const svgRef = useRef(null)
  const containerRef = useRef(null)

  const [tooltip, setTooltip] = useState(null)
  const [range, setRange] = useState({
    min: 0,
    max: 0,
  })

  useEffect(() => {
    // ========================================
    // 1. Tamaño interno del SVG
    // ========================================

    const width = 700
    const height = 420

    const svg = d3.select(svgRef.current)

    svg.selectAll('*').remove()

    svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')

    // ========================================
    // 2. Agrupar proyectos por DRE
    // ========================================

    const projectsByRegional =
      getProjectsByRegional(data)

    // ========================================
    // 3. Obtener cantidad de una DRE
    // ========================================

    const getProjectCount = (regionalName) => {
      const normalizedRegionalName =
        normalizeRegionalName(regionalName)

      const match = Object.entries(
        projectsByRegional
      ).find(([csvRegionalName]) => {
        return (
          normalizeRegionalName(csvRegionalName) ===
          normalizedRegionalName
        )
      })

      return match ? match[1] : 0
    }

    // ========================================
    // 4. Proyección geográfica
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
    // 5. Cantidad de proyectos por región
    // ========================================

    const values = regionalesData.features.map(
      (feature) =>
        getProjectCount(
          feature.properties.NOMBRE_DRE
        )
    )

    const minProjects = d3.min(values) ?? 0
    const maxProjects = d3.max(values) ?? 0

    setRange({
      min: minProjects,
      max: maxProjects,
    })

    // ========================================
    // 6. Escala de azules
    // ========================================

    const colorScale = d3
      .scaleSequential()
      .domain([minProjects, maxProjects || 1])
      .interpolator(d3.interpolateBlues)

    // ========================================
    // 7. Grupo principal
    // ========================================

    const mapGroup = svg
      .append('g')
      .attr('class', 'regional-map__group')

    // ========================================
    // 8. Dibujar regiones
    // ========================================

    mapGroup
      .selectAll('path')
      .data(regionalesData.features)
      .join('path')

      .attr('d', path)

      .attr(
        'class',
        'regional-map__region'
      )

      // Azul según cantidad
      .attr('fill', (d) => {
        const cantidad =
          getProjectCount(
            d.properties.NOMBRE_DRE
          )

        return colorScale(cantidad)
      })

      // ======================================
      // TOOLTIP
      // ======================================

      .on('mouseenter', (event, d) => {
        const bounds =
          containerRef.current
            .getBoundingClientRect()

        const cantidad =
          getProjectCount(
            d.properties.NOMBRE_DRE
          )

        setTooltip({
          nombre: d.properties.NOMBRE_DRE,
          cantidad,
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        })
      })

      .on('mousemove', (event, d) => {
        const bounds =
          containerRef.current
            .getBoundingClientRect()

        const cantidad =
          getProjectCount(
            d.properties.NOMBRE_DRE
          )

        setTooltip({
          nombre: d.properties.NOMBRE_DRE,
          cantidad,
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        })
      })

      .on('mouseleave', () => {
        setTooltip(null)
      })

  }, [data])

  return (
    <div
      ref={containerRef}
      className="regional-map"
    >

      {/* ==============================
          ZONA 1: MAPA
      ============================== */}

      <div className="regional-map__viewport">
        <svg
          ref={svgRef}
          className="regional-map__svg"
          role="img"
          aria-label="Mapa de las Direcciones Regionales de Educación de Costa Rica"
        />
      </div>


      {/* ==============================
          ZONA 2: LEYENDA
      ============================== */}

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


      {/* ==============================
          TOOLTIP
      ============================== */}

      {tooltip && (
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

export default RegionalMap