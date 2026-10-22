
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import * as d3 from 'd3'

import {
  getProjectsByAreaAndModality,
} from '../../utils/dataProcessing.js'

import './AreaModalityHeatmap.css'

function AreaModalityHeatmap({ data, theme = 'dark' }) {
  const containerRef = useRef(null)
  const [tooltip, setTooltip] = useState(null)
  const [isMobile, setIsMobile] = useState(false)

  // ==========================================
  // 1. DETECTAR CELULARES
  // ==========================================

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 700px)')

    const updateMobile = () => {
      setIsMobile(mediaQuery.matches)
    }

    updateMobile()

    mediaQuery.addEventListener('change', updateMobile)

    return () => {
      mediaQuery.removeEventListener('change', updateMobile)
    }
  }, [])

  useEffect(() => {
    const container = d3.select(containerRef.current)

    container.selectAll('*').remove()

    if (!data || data.length === 0) {
      return
    }

    const isLight = theme === 'light'

    // ==========================================
    // 2. OBTENER DATOS
    // ==========================================

    const grouped = getProjectsByAreaAndModality(data)

    const areas = Object.keys(grouped)

    const modalidades = Array.from(
      new Set(
        Object.values(grouped).flatMap(
          (values) => Object.keys(values)
        )
      )
    )

    const heatmapData = []

    areas.forEach((area) => {
      modalidades.forEach((modalidad) => {
        heatmapData.push({
          area,
          modalidad,
          cantidad: grouped[area]?.[modalidad] || 0,
        })
      })
    })

    // ==========================================
    // 3. ABREVIAR MODALIDADES
    // ==========================================

    const getShortModality = (modalidad) => {
      const text = String(modalidad ?? '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')

      if (
        text.includes('centros de educacion especial') ||
        text.includes('ciclo diversificado vocacional')
      ) {
        if (text.includes('plan nacional')) {
          return 'Ed. especial (PN)'
        }

        if (text.includes('plan de estudios')) {
          return 'Ed. especial (PE)'
        }

        return 'Ed. especial / Voc.'
      }

      if (text.includes('primaria') && text.includes('epja')) {
        return 'Prim. EPJA'
      }

      if (text.includes('secundaria') && text.includes('epja')) {
        return 'Sec. EPJA'
      }

      if (text.includes('epja')) {
        return 'EPJA'
      }

      if (text.includes('secundaria') && text.includes('tecnica')) {
        return 'Sec. técnica'
      }

      if (
        text.includes('secundaria') &&
        (text.includes('cientifica') || text.includes('humanistica'))
      ) {
        return 'Sec. cient./hum.'
      }

      if (text.includes('secundaria') && text.includes('academica')) {
        return 'Sec. académica'
      }

      if (text.includes('primaria') && text.includes('unidocente')) {
        return 'Prim. unidoc.'
      }

      if (text.includes('primaria') && text.includes('academica')) {
        return 'Prim. académica'
      }

      return String(modalidad ?? '')
        .replace(/Educación/gi, 'Ed.')
        .replace(/Secundaria/gi, 'Sec.')
        .replace(/Primaria/gi, 'Prim.')
        .replace(/Académica/gi, 'Acad.')
        .replace(/Diversificado/gi, 'Divers.')
        .replace(/Vocacional/gi, 'Voc.')
    }

    // ==========================================
    // 4. DIVIDIR MODALIDADES EN CELULARES
    // ==========================================

    const middle = Math.ceil(modalidades.length / 2)

    const modalityGroups = isMobile
      ? [
          modalidades.slice(0, middle),
          modalidades.slice(middle),
        ].filter((group) => group.length > 0)
      : [modalidades]

    // ==========================================
    // 5. ESCALA DE COLOR COMPARTIDA
    // ==========================================

    const maxValue =
      d3.max(heatmapData, (d) => d.cantidad) || 1

    const color = d3
      .scaleLinear()
      .domain([
        0,
        maxValue * 0.25,
        maxValue * 0.5,
        maxValue * 0.75,
        maxValue,
      ])
      .range(
        isLight
          ? [
              '#edf8ff',
              '#b9e8fb',
              '#65c9f0',
              '#168bd3',
              '#0754a3',
            ]
          : [
              '#c9f1ff',
              '#82d9ff',
              '#13bdf0',
              '#0874c9',
              '#0754a3',
            ]
      )
      .interpolate(d3.interpolateRgb)
      .clamp(true)

    const getCellColor = (cantidad) => {
      if (cantidad === 0) {
        return isLight ? '#e7f1f9' : '#082449'
      }

      return color(cantidad)
    }

    // ==========================================
    // 6. CONTRASTE DE NÚMEROS
    // ==========================================

    const getTextColor = (cantidad) => {
      const background = d3.rgb(getCellColor(cantidad))

      const toLinear = (value) => {
        const channel = value / 255

        return channel <= 0.04045
          ? channel / 12.92
          : ((channel + 0.055) / 1.055) ** 2.4
      }

      const luminance =
        0.2126 * toLinear(background.r) +
        0.7152 * toLinear(background.g) +
        0.0722 * toLinear(background.b)

      return luminance > 0.18
        ? '#082449'
        : '#ffffff'
    }

    // ==========================================
    // 7. TOOLTIP RESPONSIVO
    // ==========================================

    const updateTooltip = (event, d) => {
      const padding = 12
      const offset = 16

      const tooltipWidth = Math.min(
        300,
        window.innerWidth - padding * 2
      )

      const tooltipHeight = 125

      let xPosition = event.clientX + offset
      let yPosition = event.clientY + offset

      if (
        xPosition + tooltipWidth >
        window.innerWidth - padding
      ) {
        xPosition =
          event.clientX - tooltipWidth - offset
      }

      xPosition = Math.max(
        padding,
        Math.min(
          xPosition,
          window.innerWidth - tooltipWidth - padding
        )
      )

      yPosition = Math.max(
        padding,
        Math.min(
          yPosition,
          window.innerHeight - tooltipHeight - padding
        )
      )

      setTooltip({
        area: d.area,
        modalidad: d.modalidad,
        cantidad: d.cantidad,
        x: xPosition,
        y: yPosition,
      })
    }

    // ==========================================
    // 8. CREAR UNO O DOS HEATMAPS
    // ==========================================

    modalityGroups.forEach((groupModalities, index) => {
      const width = isMobile ? 760 : 1200
      const height = 360

      const margin = {
        top: 65,
        right: 15,
        bottom: 15,
        left: isMobile ? 190 : 190,
      }

      const innerWidth =
        width - margin.left - margin.right

      const innerHeight =
        height - margin.top - margin.bottom

      const svg = container
        .append('svg')
        .attr('class', 'area-modality-heatmap__svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .attr('role', 'img')
        .attr(
          'aria-label',
          isMobile
            ? `Mapa de calor, sección ${index + 1} de ${modalityGroups.length}`
            : 'Cantidad de proyectos por área temática y modalidad'
        )

      const group = svg
        .append('g')
        .attr(
          'transform',
          `translate(${margin.left}, ${margin.top})`
        )

      const x = d3
        .scaleBand()
        .domain(groupModalities)
        .range([0, innerWidth])
        .padding(0.04)

      const y = d3
        .scaleBand()
        .domain(areas)
        .range([0, innerHeight])
        .padding(0.05)

      const blockData = heatmapData.filter((d) =>
        groupModalities.includes(d.modalidad)
      )

      // ==========================================
      // 9. CELDAS
      // ==========================================

      group
        .selectAll('.heatmap-cell')
        .data(blockData)
        .join('rect')
        .attr('class', 'heatmap-cell')
        .attr('x', (d) => x(d.modalidad))
        .attr('y', (d) => y(d.area))
        .attr('width', x.bandwidth())
        .attr('height', y.bandwidth())
        .attr('rx', 3)
        .attr('fill', (d) => getCellColor(d.cantidad))
        .on('mouseenter', updateTooltip)
        .on('mousemove', updateTooltip)
        .on('mouseleave', () => {
          setTooltip(null)
        })

      // ==========================================
      // 10. NÚMEROS
      // ==========================================

      group
        .selectAll('.heatmap-value')
        .data(
          blockData.filter((d) => d.cantidad > 0)
        )
        .join('text')
        .attr('class', 'heatmap-value')
        .attr(
          'x',
          (d) => x(d.modalidad) + x.bandwidth() / 2
        )
        .attr(
          'y',
          (d) => y(d.area) + y.bandwidth() / 2
        )
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', (d) => getTextColor(d.cantidad))
        .text((d) => d.cantidad)

      // ==========================================
      // 11. EJE Y - NOMBRES DIVIDIDOS
      // ==========================================

      const yAxis = group
        .append('g')
        .attr('class', 'heatmap-y-axis')
        .call(
          d3.axisLeft(y)
            .tickSize(0)
            .tickPadding(8)
        )

      yAxis.select('.domain').remove()

      yAxis.selectAll('.tick text').each(function (area) {
        const label = d3.select(this)
        const words = String(area).trim().split(/\s+/)
        const maxCharacters = isMobile ? 20 : 23

        const lines = ['']

        words.forEach((word) => {
          const lineIndex = lines.length - 1

          const candidate = lines[lineIndex]
            ? `${lines[lineIndex]} ${word}`
            : word

          if (
            candidate.length > maxCharacters &&
            lines[lineIndex]
          ) {
            lines.push(word)
          } else {
            lines[lineIndex] = candidate
          }
        })

        label.text(null)

        const lineHeight = 1.1
        const firstDy =
          -((lines.length - 1) * lineHeight) / 2

        lines.forEach((line, lineIndex) => {
          label
            .append('tspan')
            .attr('x', -8)
            .attr(
              'dy',
              lineIndex === 0
                ? `${firstDy}em`
                : `${lineHeight}em`
            )
            .text(line)
        })
      })

      // ==========================================
      // 12. EJE X - MODALIDADES
      // ==========================================

      const xAxis = group
        .append('g')
        .attr('class', 'heatmap-x-axis')
        .call(
          d3
            .axisTop(x)
            .tickSize(0)
            .tickFormat(getShortModality)
        )

      xAxis.select('.domain').remove()

      // ==========================================
      // 13. ETIQUETAS X EN DOS LÍNEAS
      // ==========================================

      xAxis
        .selectAll('text')
        .each(function () {
          const text = d3.select(this)
          const label = text.text()
          const words = label.split(' ')

          text.text('')

          if (words.length === 1) {
            text
              .append('tspan')
              .attr('x', 0)
              .attr('dy', '-0.8em')
              .text(words[0])

            return
          }

          const middleWords = Math.ceil(words.length / 2)

          const firstLine = words
            .slice(0, middleWords)
            .join(' ')

          const secondLine = words
            .slice(middleWords)
            .join(' ')

          text
            .append('tspan')
            .attr('x', 0)
            .attr('dy', '-1.5em')
            .text(firstLine)

          text
            .append('tspan')
            .attr('x', 0)
            .attr('dy', '1.15em')
            .text(secondLine)
        })
    })

    return () => {
      container.selectAll('*').remove()
    }

  }, [data, theme, isMobile])

  return (
    <div className="area-modality-heatmap">
      <div
        ref={containerRef}
        className="area-modality-heatmap__blocks"
      />

      {tooltip && createPortal(
        <div
          className="heatmap-tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y,
          }}
        >
          <strong
            style={{
              color: theme === 'light'
                ? '#082449'
                : '#ffffff',
            }}
          >
            {tooltip.area}
          </strong>

          <span>{tooltip.modalidad}</span>

          <span>
            {tooltip.cantidad}{' '}
            {tooltip.cantidad === 1
              ? 'proyecto'
              : 'proyectos'}
          </span>
        </div>,
        document.body
      )}
    </div>
  )
}

export default AreaModalityHeatmap
