
import { useEffect, useMemo, useRef, useState } from 'react'
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

// ========================================
// LÍMITES DE ESCALADO
// ========================================

// La tarjeta puede crecer mucho en pantallas muy anchas.
// El mapa se centra dentro del espacio disponible, pero su
// dibujo deja de crecer al alcanzar estos límites.
const MAX_FIT_WIDTH = 1100
const MAX_FIT_HEIGHT = 920

// Isla del Coco (aprox. 5.5° N) forma parte de la DRE Puntarenas,
// pero está muy lejos del territorio continental. Si se incluye
// al calcular fitExtent(), alarga el área de ajuste y reduce el
// mapa continental a una porción mínima de la tarjeta.
// Se excluye únicamente del cálculo de la proyección; la geometría
// y los datos de las 27 DRE se siguen renderizando completos.
const FIT_MIN_LATITUDE = 8

const fitData = {
  ...regionalesData,

  features: regionalesData.features.map((feature) => {
    if (feature.geometry.type !== 'MultiPolygon') {
      return feature
    }

    const coordinates = feature.geometry.coordinates.filter(
      (polygon) => {
        const [[, minLatitude]] = d3.geoBounds({
          type: 'Polygon',
          coordinates: polygon,
        })

        return minLatitude >= FIT_MIN_LATITUDE
      }
    )

    return {
      ...feature,

      geometry: {
        ...feature.geometry,
        coordinates,
      },
    }
  }),
}

function RegionalMap({ data, theme = 'dark' }) {
  const svgRef = useRef(null)
  const viewportRef = useRef(null)

  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  })

  const [tooltip, setTooltip] = useState(null)

  // ========================================
  // 1. RANGO DE PROYECTOS (LEYENDA)
  // ========================================

  const range = useMemo(() => {
    if (!Array.isArray(data)) {
      return { min: 0, max: 0 }
    }

    const projectsByRegional = getProjectsByRegional(data)

    const normalizedCounts = new Map(
      Object.entries(projectsByRegional).map(
        ([name, count]) => [
          normalizeRegionalName(name),
          count,
        ]
      )
    )

    const positiveValues = regionalesData.features
      .map(
        (feature) =>
          normalizedCounts.get(
            normalizeRegionalName(
              feature.properties.NOMBRE_DRE
            )
          ) ?? 0
      )
      .filter((value) => value > 0)

    return {
      min: d3.min(positiveValues) ?? 0,
      max: d3.max(positiveValues) ?? 0,
    }
  }, [data])

  // ========================================
  // 2. MEDIR EL CONTENEDOR
  // ========================================

  useEffect(() => {
    const viewport = viewportRef.current

    if (!viewport) return

    const measure = () => {
      const rect = viewport.getBoundingClientRect()

      const width = Math.round(rect.width)
      const height = Math.round(rect.height)

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
    }

    // Medición inicial para evitar que el SVG espere al primer
    // callback del ResizeObserver.
    measure()

    const observer = new ResizeObserver(measure)

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

    // El SVG ocupa exactamente el viewport medido. La proyección
    // se ajusta a ese mismo espacio (1 unidad SVG = 1 px CSS), así
    // que D3 y CSS no aplican dos escalados distintos.
    const fitWidth = Math.min(width, MAX_FIT_WIDTH)
    const fitHeight = Math.min(height, MAX_FIT_HEIGHT)

    const offsetX = (width - fitWidth) / 2
    const offsetY = (height - fitHeight) / 2

    const padding = Math.max(
      12,
      Math.min(26, Math.min(fitWidth, fitHeight) * 0.03)
    )

    const projection = d3
      .geoMercator()
      .fitExtent(
        [
          [
            offsetX + padding,
            offsetY + padding,
          ],
          [
            offsetX + fitWidth - padding,
            offsetY + fitHeight - padding,
          ],
        ],
        fitData
      )

    const path = d3
      .geoPath()
      .projection(projection)

    // ========================================
    // 5. VALORES
    // ========================================

    const {
      min: minProjects,
      max: maxProjects,
    } = range

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
  }, [data, theme, dimensions.width, dimensions.height, range.min, range.max])

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
