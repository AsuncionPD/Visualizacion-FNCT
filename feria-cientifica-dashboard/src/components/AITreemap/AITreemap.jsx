
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import * as d3 from 'd3'

import './AITreemap.css'

function AITreemap({ data }) {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const tooltipRef = useRef(null)
  const clipPrefix = useId().replace(/:/g, '')
  const [tooltip, setTooltip] = useState(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  // Posicionar el tooltip usando sus dimensiones reales, antes de pintar.
  // Así se muestra arriba del cursor cuando no cabe debajo.
  useLayoutEffect(() => {
    if (!tooltip || !tooltipRef.current) return

    const element = tooltipRef.current
    const rect = element.getBoundingClientRect()
    const gap = 14
    const padding = 12
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    const x = Math.max(
      padding,
      Math.min(
        tooltip.clientX + gap + rect.width <= viewportWidth - padding
          ? tooltip.clientX + gap
          : tooltip.clientX - rect.width - gap,
        viewportWidth - rect.width - padding
      )
    )

    const below = tooltip.clientY + gap
    const above = tooltip.clientY - rect.height - gap
    const y = below + rect.height <= viewportHeight - padding
      ? below
      : above >= padding
        ? above
        : Math.max(padding, Math.min(above, viewportHeight - rect.height - padding))

    element.style.left = `${x}px`
    element.style.top = `${y}px`
    element.style.visibility = 'visible'
  }, [tooltip])

  // Medir el contenedor real para dibujar el treemap a escala 1:1.
  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const measure = () => {
      const rect = element.getBoundingClientRect()
      const width = Math.round(rect.width)
      const height = Math.round(rect.height)

      if (width <= 0 || height <= 0) return

      setSize((previous) =>
        previous.width === width && previous.height === height
          ? previous
          : { width, height }
      )
    }

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const svg = d3.select(svgRef.current)

    svg.selectAll('*').remove()

    if (!data || data.length === 0) {
      return
    }

    if (!size.width || !size.height) {
      return
    }

    // ========================================
    // 1. DIMENSIONES DINÁMICAS
    // ========================================

    const width = size.width
    const height = size.height

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
      setTooltip({
        modalidad: d.data.modalidad,
        cantidad: d.data.cantidad,
        porcentaje: (d.data.cantidad / proyectosIA.length) * 100,
        clientX: event.clientX,
        clientY: event.clientY,
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

      const compact =
        rectangleWidth < 70 || rectangleHeight < 52

      // Tipografía proporcional al bloque, con mínimos legibles.
      const valueFontSize = compact
        ? Math.max(
            10,
            Math.min(
              18,
              Math.min(rectangleWidth / 7, rectangleHeight / 5)
            )
          )
        : Math.max(
            13,
            Math.min(
              24,
              Math.min(rectangleWidth / 6, rectangleHeight / 5)
            )
          )

      // Bloques pequeños: solo cantidad
      if (compact) {
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
          .style('font-size', `${valueFontSize}px`)
          .text(cantidad)

        return
      }

      const labelFontSize = Math.max(
        10,
        Math.min(
          17,
          Math.min(rectangleWidth / 11, rectangleHeight / 7)
        )
      )

      const padding = Math.max(
        6,
        Math.min(12, rectangleWidth * 0.06)
      )
      const lineHeight = labelFontSize * 1.15

      const availableTextWidth =
        rectangleWidth - padding * 2

      // Reservar espacio para el número inferior
      const availableTextHeight =
        rectangleHeight -
        padding * 2 -
        valueFontSize * 1.8

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
        .attr('y', padding + labelFontSize)
        .style('font-size', `${labelFontSize}px`)

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
        .attr('y', rectangleHeight - padding)
        .style('font-size', `${valueFontSize}px`)
        .text(cantidad)
    })

    return () => {
      svg.selectAll('*').remove()
    }

  }, [data, size])

  return (
    <div ref={containerRef} className="treemap">

      <svg
        ref={svgRef}
        className="treemap__svg"
        role="img"
        aria-label="Cantidad de proyectos que utilizan inteligencia artificial según modalidad"
      />

      {tooltip && createPortal(
        <div
          ref={tooltipRef}
          className="treemap-tooltip"
          style={{
            left: 0,
            top: 0,
            visibility: 'hidden',
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
