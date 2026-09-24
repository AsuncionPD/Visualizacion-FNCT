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

  useEffect(() => {
    // -----------------------------
    // 1. Configuración del SVG
    // -----------------------------

    const width = 700
    const height = 420

    const svg = d3.select(svgRef.current)

    svg.selectAll('*').remove()

    svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')

    // -----------------------------
    // 2. Agrupar proyectos por DRE
    // -----------------------------

    const projectsByRegional =
      getProjectsByRegional(data)

      console.log('=== CSV AGRUPADO POR DRE ===')
      console.log(projectsByRegional)

      console.log('=== NOMBRES DEL GEOJSON ===')
      console.log(
        
  regionalesData.features.map(
    (feature) => feature.properties.NOMBRE_DRE
  )
)

    // -----------------------------
    // 3. Función para obtener
    //    cantidad por DRE
    // -----------------------------

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

    // -----------------------------
    // 4. Proyección geográfica
    // -----------------------------

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

    // -----------------------------
    // 5. Obtener cantidades
    // -----------------------------

    const values = regionalesData.features.map(
      (feature) =>
        getProjectCount(
          feature.properties.NOMBRE_DRE
        )
    )

    const maxProjects = d3.max(values) || 1

    // -----------------------------
    // 6. Escala de color
    // -----------------------------

    const colorScale = d3
      .scaleSequential()
      .domain([0, maxProjects])
      .interpolator(d3.interpolateBlues)

    // -----------------------------
    // 7. Grupo del mapa
    // -----------------------------

    const mapGroup = svg
      .append('g')
      .attr('class', 'regional-map__group')

    // -----------------------------
    // 8. Dibujar las regiones
    // -----------------------------

    mapGroup
      .selectAll('path')
      .data(regionalesData.features)
      .join('path')
      .attr('d', path)
      .attr('class', 'regional-map__region')

      // Color según cantidad de proyectos
      .attr('fill', (d) => {
        const cantidad = getProjectCount(
          d.properties.NOMBRE_DRE
        )

        return colorScale(cantidad)
      })

      // -----------------------------
      // Tooltip: entrar
      // -----------------------------

      .on('mouseenter', (event, d) => {
        const containerBounds =
          containerRef.current.getBoundingClientRect()

        const cantidad = getProjectCount(
          d.properties.NOMBRE_DRE
        )

        setTooltip({
          nombre: d.properties.NOMBRE_DRE,
          cantidad: cantidad,
          x: event.clientX - containerBounds.left,
          y: event.clientY - containerBounds.top,
        })
      })

      // -----------------------------
      // Tooltip: mover
      // -----------------------------

      .on('mousemove', (event, d) => {
        const containerBounds =
          containerRef.current.getBoundingClientRect()

        const cantidad = getProjectCount(
          d.properties.NOMBRE_DRE
        )

        setTooltip({
          nombre: d.properties.NOMBRE_DRE,
          cantidad: cantidad,
          x: event.clientX - containerBounds.left,
          y: event.clientY - containerBounds.top,
        })
      })

      // -----------------------------
      // Tooltip: salir
      // -----------------------------

      .on('mouseleave', () => {
        setTooltip(null)
      })
  }, [data])

  return (
    <div
      ref={containerRef}
      className="regional-map"
    >
      <svg
        ref={svgRef}
        className="regional-map__svg"
        role="img"
        aria-label="Mapa de las Direcciones Regionales de Educación de Costa Rica"
      />

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