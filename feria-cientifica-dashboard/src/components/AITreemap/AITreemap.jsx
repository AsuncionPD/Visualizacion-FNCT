import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import './AITreemap.css'

const sampleData = [
  {
    modalidad: 'Secundaria técnica',
    cantidad: 35,
  },
  {
    modalidad: 'Secundaria académica regular',
    cantidad: 28,
  },
  {
    modalidad: 'Otra modalidad',
    cantidad: 12,
  },
]

function AITreemap() {
  const svgRef = useRef(null)
  const containerRef = useRef(null)

  const [tooltip, setTooltip] = useState(null)

  useEffect(() => {
    const width = 400
    const height = 300

    const root = d3
      .hierarchy({
        name: 'Proyectos con IA',
        children: sampleData,
      })
      .sum((d) => d.cantidad || 0)

    d3
      .treemap()
      .size([width, height])
      .paddingInner(3)(root)

    const svg = d3.select(svgRef.current)

    svg.selectAll('*').remove()

    svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')

    const color = d3
      .scaleOrdinal()
      .domain(sampleData.map((d) => d.modalidad))
      .range([
        '#7047eb',
        '#2388e8',
        '#32b6a4',
      ])

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
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        })
      })

      .on('mousemove', (event, d) => {
        const bounds =
          containerRef.current.getBoundingClientRect()

        setTooltip({
          modalidad: d.data.modalidad,
          cantidad: d.data.cantidad,
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        })
      })

      .on('mouseleave', () => {
        setTooltip(null)
      })

    nodes
      .append('rect')
      .attr('width', (d) => d.x1 - d.x0)
      .attr('height', (d) => d.y1 - d.y0)
      .attr('rx', 5)
      .attr('fill', (d) => color(d.data.modalidad))

    nodes.each(function (d) {
      const group = d3.select(this)

      const rectangleWidth = d.x1 - d.x0
      const rectangleHeight = d.y1 - d.y0

      if (rectangleWidth > 100 && rectangleHeight > 55) {
        const words = d.data.modalidad.split(' ')

        let firstLine = ''
        let secondLine = ''

        words.forEach((word) => {
          if (firstLine.length + word.length < 18) {
            firstLine += `${word} `
          } else {
            secondLine += `${word} `
          }
        })

        const text = group
          .append('text')
          .attr('class', 'treemap-label')
          .attr('x', 12)
          .attr('y', 24)

        text
          .append('tspan')
          .attr('x', 12)
          .text(firstLine.trim())

        if (secondLine) {
          text
            .append('tspan')
            .attr('x', 12)
            .attr('dy', 16)
            .text(secondLine.trim())
        }

        group
          .append('text')
          .attr('class', 'treemap-value')
          .attr('x', 12)
          .attr('y', rectangleHeight - 15)
          .text(d.data.cantidad)
      }
    })
  }, [])

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
          <strong>{tooltip.modalidad}</strong>

          <span>
            {tooltip.cantidad} proyectos con IA
          </span>
        </div>
      )}
    </div>
  )
}

export default AITreemap