import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

import './AITreemap.css'

function AITreemap({ data }) {
  const svgRef = useRef(null)
  const containerRef = useRef(null)

  const [tooltip, setTooltip] = useState(null)

  useEffect(() => {
    if (!data || data.length === 0) return

    const width = 600
    const height = 360

    // ========================================
    // 1. Filtrar solamente proyectos con IA
    // ========================================

    const proyectosIA = data.filter((project) => {
      const value =
        project['Uso de inteligencia artificial']
          ?.trim()
          .toLowerCase()

      return value === 'sí' || value === 'si'
    })

    // ========================================
    // 2. Agrupar por modalidad
    // ========================================

    const modalidadesMap = d3.rollup(
      proyectosIA,
      (projects) => projects.length,
      (project) => {
        const modalidad = project['Modalidad']?.trim()

        return modalidad || 'Sin modalidad'
      }
    )

    // ========================================
    // 3. Convertir a arreglo para el treemap
    // ========================================

    const treemapData = Array.from(
      modalidadesMap,
      ([modalidad, cantidad]) => ({
        modalidad: modalidad || 'Sin modalidad',
        cantidad,
      })
    ).sort((a, b) => b.cantidad - a.cantidad)

    console.log('=== IA POR MODALIDAD ===')
    console.table(treemapData)

    // ========================================
    // 4. Crear jerarquía
    // ========================================

    const root = d3
      .hierarchy({
        name: 'Proyectos con IA',
        children: treemapData,
      })
      .sum((d) => d.cantidad || 0)
      .sort((a, b) => b.value - a.value)

    d3
      .treemap()
      .size([width, height])
      .paddingInner(3)(root)

    // ========================================
    // 5. SVG
    // ========================================

    const svg = d3.select(svgRef.current)

    svg.selectAll('*').remove()

    svg
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')

    // ========================================
    // 6. Colores
    // ========================================

    const colors = [
      '#7047eb',
      '#2388e8',
      '#32b6a4',
      '#e67e22',
      '#e0568c',
      '#5c6bc0',
      '#26a69a',
      '#ab47bc',
      '#ef5350',
      '#42a5f5',
      '#7e57c2',
      '#66bb6a',
      '#ffa726',
      '#78909c',
      '#ec407a',
    ]

    const color = d3
      .scaleOrdinal()
      .domain(treemapData.map((d) => d.modalidad))
      .range(colors)

    // ========================================
    // 7. Crear bloques
    // ========================================

    const nodes = svg
      .selectAll('g')
      .data(root.leaves())
      .join('g')
      .attr(
        'transform',
        (d) => `translate(${d.x0}, ${d.y0})`
      )
      .style('cursor', 'pointer')

      .on('mouseenter', (event, d) => {
        const bounds =
          containerRef.current.getBoundingClientRect()

        setTooltip({
            modalidad: d.data.modalidad,
            cantidad: d.data.cantidad,
            porcentaje:
              (d.data.cantidad / proyectosIA.length) * 100,

            x: event.clientX,
            y: event.clientY,
          })
        })

      .on('mousemove', (event, d) => {
        setTooltip({
          modalidad: d.data.modalidad,
          cantidad: d.data.cantidad,
          porcentaje:
            (d.data.cantidad / proyectosIA.length) * 100,

          x: event.clientX,
          y: event.clientY,
        })
      })

      .on('mouseleave', () => {
        setTooltip(null)
      })

    // ========================================
    // 8. Rectángulos
    // ========================================

    nodes
      .append('rect')
      .attr('width', (d) => d.x1 - d.x0)
      .attr('height', (d) => d.y1 - d.y0)
      .attr('rx', 4)
      .attr(
        'fill',
        (d) => color(d.data.modalidad)
      )

    // ========================================
    // 9. Textos
    // ========================================

    nodes.each(function (d) {
    const group = d3.select(this)

    const rectangleWidth = d.x1 - d.x0
    const rectangleHeight = d.y1 - d.y0

    const modalidad =
      d.data.modalidad || 'Sin modalidad'

    const cantidad = d.data.cantidad

    // Muy pequeño: solo cantidad
    if (
      rectangleWidth < 70 ||
      rectangleHeight < 90
    ) {
      group
        .append('text')
        .attr(
          'class',
          'treemap-value treemap-value--small'
        )
        .attr('x', rectangleWidth / 2)
        .attr('y', rectangleHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .text(cantidad)

      return
    }

    const padding = 10

    // Cantidad de caracteres según ancho
    const maxCharacters = Math.max(
      6,
      Math.floor(
        (rectangleWidth - padding * 2) / 9
      )
    )

    // Cantidad de líneas según altura
    let maxLines = 2

    if (rectangleHeight >= 70) {
      maxLines = 3
    }

    if (rectangleHeight >= 100) {
      maxLines = 4
    }

    if (rectangleHeight >= 135) {
      maxLines = 5
    }

    const words = modalidad
    .replaceAll('/', '/ ')
    .split(' ')
    .filter(Boolean)

    const lines = []
    let currentLine = ''

    words.forEach((word) => {
      const testLine = currentLine
        ? `${currentLine} ${word}`
        : word

      if (testLine.length <= maxCharacters) {
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

    const visibleLines =
      lines.slice(0, maxLines)

    // Agregar ... si el texto no cabe
    if (lines.length > maxLines) {
      const lastIndex =
        visibleLines.length - 1

      let lastLine =
        visibleLines[lastIndex]

      if (
        lastLine.length >
        maxCharacters - 3
      ) {
        lastLine = lastLine.substring(
          0,
          maxCharacters - 3
        )
      }

      visibleLines[lastIndex] =
        `${lastLine}...`
    }

    const text = group
      .append('text')
      .attr('class', 'treemap-label')
      .attr('x', padding)
      .attr('y', padding)

    visibleLines.forEach(
      (line, index) => {
        text
          .append('tspan')
          .attr('x', padding)
          .attr(
            'dy',
            index === 0 ? 12 : 15
          )
          .text(line)
      }
    )

    // Número grande abajo
    group
      .append('text')
      .attr('class', 'treemap-value')
      .attr('x', padding)
      .attr(
        'y',
        rectangleHeight - 10
      )
      .text(cantidad)
  })

      }, [data])

      return (
        <div
          ref={containerRef}
          className="treemap"
        >
          <svg
            ref={svgRef}
            className="treemap__svg"
            role="img"
            aria-label="Cantidad de proyectos que utilizan inteligencia artificial según modalidad"
          />

          {tooltip && (
            <div
              className="treemap-tooltip"
              style={{
                left: tooltip.x,
                top: tooltip.y,
              }}
            >
              <strong>
                {tooltip.modalidad}
              </strong>

              <span>
                {tooltip.cantidad}{' '}
                {tooltip.cantidad === 1
                  ? 'proyecto con IA'
                  : 'proyectos con IA'}
              </span>

              <span>
                {tooltip.porcentaje.toFixed(1)}%
                {' '}del total con IA
              </span>
            </div>
          )}
    </div>
  )
}

export default AITreemap