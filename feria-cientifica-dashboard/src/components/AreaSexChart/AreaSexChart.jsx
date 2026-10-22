
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import * as d3 from 'd3'

import {
  getStudentsByAreaAndSex,
} from '../../utils/dataProcessing.js'

import './AreaSexChart.css'

function AreaSexChart({ data }) {
  const svgRef = useRef(null)

  const [tooltip, setTooltip] = useState(null)

  useEffect(() => {
    const svg = d3.select(svgRef.current)

    svg.selectAll('*').remove()

    if (!data || data.length === 0) {
      return
    }

    // ==========================================
    // 1. OBTENER DATOS
    // ==========================================

    const grouped = getStudentsByAreaAndSex(data)

    // ==========================================
    // 2. IDENTIFICAR SEXOS
    // ==========================================

    const normalizeSex = (sex) => {
      const value = String(sex)
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')

      if (
        value === 'femenino' ||
        value === 'mujer' ||
        value === 'f'
      ) {
        return 'Femenino'
      }

      if (
        value === 'masculino' ||
        value === 'hombre' ||
        value === 'm'
      ) {
        return 'Masculino'
      }

      return sex
    }

    const detectedSexes = Array.from(
      new Set(
        Object.values(grouped)
          .flatMap((values) => Object.keys(values))
          .map(normalizeSex)
      )
    )

    const sexes = [
      'Femenino',
      'Masculino',
      ...detectedSexes.filter(
        (sex) =>
          sex !== 'Femenino' &&
          sex !== 'Masculino'
      ),
    ]

    // ==========================================
    // 3. PREPARAR DATOS
    // ==========================================

    const chartData = Object.entries(grouped)
      .map(([area, values]) => {
        const item = {
          area,
          total: 0,
        }

        sexes.forEach((sex) => {
          item[sex] = 0
        })

        Object.entries(values).forEach(
          ([originalSex, count]) => {
            const sex = normalizeSex(originalSex)
            const cantidad = Number(count) || 0

            item[sex] =
              (item[sex] || 0) + cantidad

            item.total += cantidad
          }
        )

        return item
      })
      .sort((a, b) => b.total - a.total)

    // ==========================================
    // 4. DIMENSIONES ORIGINALES
    // ==========================================

    const width = 600
    const height = 320

    const margin = {
      top: 8,
      right: 45,
      bottom: 28,
      left: 190,
    }

    const innerWidth =
      width - margin.left - margin.right

    const innerHeight =
      height - margin.top - margin.bottom

    // ==========================================
    // 5. PREPARAR SVG
    // ==========================================

    svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr(
        'preserveAspectRatio',
        'xMidYMid meet'
      )

    const group = svg
      .append('g')
      .attr(
        'transform',
        `translate(${margin.left}, ${margin.top})`
      )

    // ==========================================
    // 6. ESCALAS
    // ==========================================

    const maxTotal =
      d3.max(chartData, (d) => d.total) || 1

    const x = d3
      .scaleLinear()
      .domain([0, maxTotal])
      .nice()
      .range([0, innerWidth])

    const y = d3
      .scaleBand()
      .domain(chartData.map((d) => d.area))
      .range([0, innerHeight])
      .padding(0.16)

    // ==========================================
    // 7. COLORES INSTITUCIONALES
    // ==========================================

    const color = d3
      .scaleOrdinal()
      .domain(sexes)
      .range([
        '#ff891f', // Femenino
        '#13bdf0', // Masculino
        '#9cb8d1', // Otros valores
      ])

    // ==========================================
    // 8. DATOS APILADOS
    // ==========================================

    const stack = d3
      .stack()
      .keys(sexes)

    const stackedData = stack(chartData)

    // ==========================================
    // 9. CUADRÍCULA Y EJE X
    // ==========================================

    group
      .append('g')
      .attr('class', 'area-sex-grid')
      .attr(
        'transform',
        `translate(0, ${innerHeight})`
      )
      .call(
        d3
          .axisBottom(x)
          .ticks(4)
          .tickSize(-innerHeight)
          .tickFormat(d3.format('d'))
      )

    // ==========================================
    // 10. TOOLTIP RESPONSIVO
    // ==========================================

    const updateTooltip = (event, d) => {
      const tooltipWidth = 260
      const tooltipHeight = 110
      const offset = 16
      const padding = 12

      const availableWidth =
        window.innerWidth - padding * 2

      const availableHeight =
        window.innerHeight - padding * 2

      const effectiveWidth = Math.min(
        tooltipWidth,
        availableWidth
      )

      const effectiveHeight = Math.min(
        tooltipHeight,
        availableHeight
      )

      let xPosition = event.clientX + offset
      let yPosition = event.clientY - 30

      if (
        xPosition + effectiveWidth >
        window.innerWidth - padding
      ) {
        xPosition =
          event.clientX - effectiveWidth - offset
      }

      xPosition = Math.max(
        padding,
        Math.min(
          xPosition,
          window.innerWidth - effectiveWidth - padding
        )
      )

      yPosition = Math.max(
        padding,
        Math.min(
          yPosition,
          window.innerHeight - effectiveHeight - padding
        )
      )

      setTooltip({
        area: d.data.area,
        sex: d.sex,
        cantidad: d[1] - d[0],
        x: xPosition,
        y: yPosition,
      })
    }

    // ==========================================
    // 11. DIBUJAR BARRAS
    // ==========================================

    group
      .selectAll('.area-sex-series')
      .data(stackedData)
      .join('g')
      .attr('class', 'area-sex-series')
      .attr('fill', (d) => color(d.key))

      .selectAll('rect')
      .data((series) =>
        series.map((d) => ({
          ...d,
          sex: series.key,
        }))
      )
      .join('rect')

      .attr('class', 'area-sex-bar')

      .attr('x', (d) => x(d[0]))
      .attr('y', (d) => y(d.data.area))

      .attr(
        'width',
        (d) =>
          Math.max(0, x(d[1]) - x(d[0]))
      )

      .attr('height', y.bandwidth())
      .attr('rx', 2)

      .on('mouseenter', updateTooltip)
      .on('mousemove', updateTooltip)
      .on('mouseleave', () => {
        setTooltip(null)
      })

    // ==========================================
    // 12. NOMBRES DE ÁREAS
    // ==========================================

    
    // ==========================================
    // 12. NOMBRES DE ÁREAS EN DOS LÍNEAS
    // ==========================================

    const yAxis = group
      .append('g')
      .attr('class', 'area-sex-y-axis')
      .call(
        d3
          .axisLeft(y)
          .tickSize(0)
          .tickPadding(8)
      )

    yAxis.select('.domain').remove()

    yAxis.selectAll('.tick text').each(function (area) {
      const label = d3.select(this)
      const words = String(area).trim().split(/\s+/)
      const maxCharacters = 23

      const lines = ['']

      words.forEach((word) => {
        const index = lines.length - 1

        const candidate = lines[index]
          ? `${lines[index]} ${word}`
          : word

        if (
          candidate.length > maxCharacters &&
          lines[index]
        ) {
          lines.push(word)
        } else {
          lines[index] = candidate
        }
      })

      label.text(null)

      // Centrar verticalmente las líneas en cada barra
      const lineHeight = 1.1
      const firstDy =
        -((lines.length - 1) * lineHeight) / 2

      lines.forEach((line, index) => {
        label
          .append('tspan')
          .attr('x', -8)
          .attr(
            'dy',
            index === 0
              ? `${firstDy}em`
              : `${lineHeight}em`
          )
          .text(line)
      })
    })


    // ==========================================
    // 13. TOTAL POR ÁREA
    // ==========================================

    group
      .selectAll('.area-sex-total')
      .data(chartData)
      .join('text')
      .attr('class', 'area-sex-total')
      .attr('x', (d) => x(d.total) + 7)

      .attr(
        'y',
        (d) =>
          y(d.area) + y.bandwidth() / 2
      )

      .attr('dominant-baseline', 'middle')
      .text((d) => d.total)

    return () => {
      svg.selectAll('*').remove()
    }

  }, [data])

  return (
    <div className="area-sex-chart">

      <svg
        ref={svgRef}
        className="area-sex-chart__svg"
        role="img"
        aria-label="Cantidad de estudiantes por área temática y sexo"
      />

      {tooltip && createPortal(
        <div
          className="area-sex-tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y,
          }}
        >
          <strong>{tooltip.area}</strong>

          <div className="area-sex-tooltip__category">

            <span
              className="area-sex-tooltip__dot"
              style={{
                backgroundColor:
                  tooltip.sex === 'Femenino'
                    ? '#ff891f'
                    : tooltip.sex === 'Masculino'
                      ? '#13bdf0'
                      : '#9cb8d1',
              }}
            />

            <span>{tooltip.sex}</span>

          </div>

          <span className="area-sex-tooltip__value">
            {tooltip.cantidad}{' '}
            {tooltip.cantidad === 1
              ? 'estudiante'
              : 'estudiantes'}
          </span>
        </div>,
        document.body
      )}

    </div>
  )
}

export default AreaSexChart
