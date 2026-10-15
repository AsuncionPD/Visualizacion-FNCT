
import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import * as d3 from 'd3'

import './AITreemap.css'

function AITreemap({ data }) {
  const svgRef = useRef(null)
  const clipPrefix = useId().replace(/:/g, '')
  const [tooltip, setTooltip] = useState(null)

  useEffect(() => {
    const svg = d3.select(svgRef.current)

    svg.selectAll('*').remove()

    if (!data || data.length === 0) {
      return
    }

    // ========================================
    // 1. DIMENSIONES ORIGINALES
    // ========================================

    const width = 600
    const height = 360

    // ========================================
    // 2. FILTRAR PROYECTOS CON IA
    // ========================================

    const proyectosIA = data.filter((project) => {
      const value = String(
        project['Uso de inteligencia artificial'] || ''
      )
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')

      return value === 'si'
    })

    svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')

    if (proyectosIA.length === 0) {
      svg
        .append('text')
        .attr('class', 'treemap-empty')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .text('No hay proyectos con IA para estos filtros')

      return
    }

    // ========================================
    // 3. AGRUPAR POR MODALIDAD
    // ========================================

    const modalidadesMap = d3.rollup(
      proyectosIA,
      (projects) => projects.length,
      (project) =>
        project['Modalidad']?.trim() || 'Sin modalidad'
    )

    const treemapData = Array.from(
      modalidadesMap,
      ([modalidad, cantidad]) => ({
        modalidad,
        cantidad,
      })
    ).sort((a, b) => b.cantidad - a.cantidad)

    // ========================================
    // 4. JERARQUÍA
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
    // 5. PALETA NARANJA
    // ========================================

    const colors = [
      '#ff891f',
      '#ff6b16',
      '#ffad4f',
      '#f47a13',
      '#ff9c36',
      '#e9650c',
      '#ffb86b',
      '#ed7c22',
      '#ff7720',
      '#d9580b',
      '#ffa03d',
      '#e88731',
      '#ff9340',
      '#c94f09',
      '#ffc078',
    ]

    const color = d3
      .scaleOrdinal()
      .domain(treemapData.map((d) => d.modalidad))
      .range(colors)

    // ========================================
    // 6. TOOLTIP RESPONSIVO
    // ========================================

    const updateTooltip = (event, d) => {
      const tooltipWidth = Math.min(
        260,
        window.innerWidth - 24
      )

      const tooltipHeight = 115
      const offset = 16
      const padding = 12

      let x = event.clientX + offset
      let y = event.clientY - 35

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
        modalidad: d.data.modalidad,
        cantidad: d.data.cantidad,
        porcentaje:
          (d.data.cantidad / proyectosIA.length) * 100,
        x,
        y,
      })
    }

    // ========================================
    // 7. CREAR BLOQUES
    // ========================================

    const nodes = svg
      .selectAll('.treemap-node')
      .data(root.leaves())
      .join('g')
      .attr('class', 'treemap-node')
      .attr(
        'transform',
        (d) => `translate(${d.x0}, ${d.y0})`
      )
      .on('mouseenter', updateTooltip)
      .on('mousemove', updateTooltip)
      .on('mouseleave', () => setTooltip(null))

    // ========================================
    // 8. RECTÁNGULOS
    // ========================================

    nodes
      .append('rect')
      .attr('class', 'treemap-rect')
      .attr('width', (d) => d.x1 - d.x0)
      .attr('height', (d) => d.y1 - d.y0)
      .attr('rx', 5)
      .attr('fill', (d) => color(d.data.modalidad))

    // ========================================
    // 9. TEXTOS Y CANTIDADES
    // ========================================

    nodes.each(function (d, index) {
      const group = d3.select(this)

      const rectangleWidth = d.x1 - d.x0
      const rectangleHeight = d.y1 - d.y0

      const modalidad =
        d.data.modalidad || 'Sin modalidad'

      const cantidad = d.data.cantidad

      // Recortar contenido al tamaño de su rectángulo
      const clipId = `treemap-clip-${clipPrefix}-${index}`

      group
        .append('clipPath')
        .attr('id', clipId)
        .append('rect')
        .attr('width', rectangleWidth)
        .attr('height', rectangleHeight)
        .attr('rx', 5)

      const content = group
        .append('g')
        .attr('clip-path', `url(#${clipId})`)

      // Bloques pequeños: solo cantidad
      if (
        rectangleWidth < 75 ||
        rectangleHeight < 55
      ) {
        content
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
      const fontSize = 14
      const lineHeight = 16

      const availableTextWidth =
        rectangleWidth - padding * 2

      // Reservar espacio para el número inferior
      const availableTextHeight =
        rectangleHeight - padding * 2 - 30

      const maxLines = Math.max(
        1,
        Math.floor(availableTextHeight / lineHeight)
      )

      const words = modalidad
        .replaceAll('/', '/ ')
        .split(/\s+/)
        .filter(Boolean)

      const text = content
        .append('text')
        .attr('class', 'treemap-label')
        .attr('x', padding)
        .attr('y', padding + fontSize)

      // Medir el ancho real del texto SVG
      const measure = (value) => {
        const test = text
          .append('tspan')
          .text(value)

        const length =
          test.node()?.getComputedTextLength() || 0

        test.remove()

        return length
      }

      const lines = []
      let currentLine = ''

      words.forEach((word) => {
        const candidate = currentLine
          ? `${currentLine} ${word}`
          : word

        if (
          measure(candidate) <= availableTextWidth
        ) {
          currentLine = candidate
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

      const visibleLines = lines.slice(0, maxLines)

      if (lines.length > maxLines) {
        const lastIndex = visibleLines.length - 1
        let lastLine = visibleLines[lastIndex]

        while (
          lastLine.length > 0 &&
          measure(`${lastLine}…`) > availableTextWidth
        ) {
          lastLine = lastLine.slice(0, -1)
        }

        visibleLines[lastIndex] = `${lastLine}…`
      }

      visibleLines.forEach((line, lineIndex) => {
        text
          .append('tspan')
          .attr('x', padding)
          .attr(
            'dy',
            lineIndex === 0 ? 0 : lineHeight
          )
          .text(line)
      })

      // Cantidad en la parte inferior
      content
        .append('text')
        .attr('class', 'treemap-value')
        .attr('x', padding)
        .attr('y', rectangleHeight - 10)
        .text(cantidad)
    })

    return () => {
      svg.selectAll('*').remove()
    }

  }, [data])

  return (
    <div className="treemap">

      <svg
        ref={svgRef}
        className="treemap__svg"
        role="img"
        aria-label="Cantidad de proyectos que utilizan inteligencia artificial según modalidad"
      />

      {tooltip && createPortal(
        <div
          className="treemap-tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y,
          }}
        >
          <strong>{tooltip.modalidad}</strong>

          <span>
            {tooltip.cantidad}{' '}
            {tooltip.cantidad === 1
              ? 'proyecto con IA'
              : 'proyectos con IA'}
          </span>

          <span className="treemap-tooltip__percentage">
            {tooltip.porcentaje.toFixed(1)}%
            {' '}del total con IA
          </span>
        </div>,
        document.body
      )}

    </div>
  )
}

export default AITreemap
