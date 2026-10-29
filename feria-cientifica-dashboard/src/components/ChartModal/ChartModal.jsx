import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './ChartModal.css'

const MIN_ZOOM = 1
const MAX_ZOOM = 3
const STEP = 0.25

export default function ChartModal({ title, description, children, onClose}) {
  const titleId = useId()
  const descriptionId = useId()
  const dialogRef = useRef(null)
  const viewportRef = useRef(null)
  const dragRef = useRef(null)
  const previousFocusRef = useRef(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const normalizedTitle = String(title ?? '').toLowerCase()
  const isHeatmap = normalizedTitle.includes('modalidad') && normalizedTitle.includes('área')
  const isSexChart = normalizedTitle.includes('sexo')
  const legend = isHeatmap
    ? [
        { label: 'Mayor cantidad de proyectos', color: '#0754a3' },
        { label: 'Menor cantidad de proyectos', color: 'var(--modal-heatmap-min, #c9f1ff)' },
      ]
    : isSexChart
      ? [
          { label: 'Mujeres', color: 'var(--color-accent, #ff891f)' },
          { label: 'Hombres', color: 'var(--color-secondary, #13bdf0)' },
        ]
      : []

  useEffect(() => {
    previousFocusRef.current = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
      if (event.key !== 'Tab' || !dialogRef.current) return
      const elements = [...dialogRef.current.querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')]
        .filter((element) => element.getClientRects().length > 0)
      if (!elements.length) return
      const first = elements[0]
      const last = elements[elements.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
      previousFocusRef.current?.focus?.()
    }
  }, [onClose])

  const clampOffset = (value, nextZoom = zoom) => {
    const rect = viewportRef.current?.getBoundingClientRect()
    if (!rect || nextZoom <= 1) return { x: 0, y: 0 }
    const limitX = rect.width * (nextZoom - 1) / 2
    const limitY = rect.height * (nextZoom - 1) / 2
    return {
      x: Math.max(-limitX, Math.min(limitX, value.x)),
      y: Math.max(-limitY, Math.min(limitY, value.y)),
    }
  }

  const changeZoom = (delta) => {
    const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.round((zoom + delta) * 100) / 100))
    setZoom(next)
    setOffset((current) => clampOffset(current, next))
  }

  const reset = () => {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
  }

  const startDrag = (event) => {
    if (zoom <= 1 || event.button !== 0) return
    // Drag only on the blank background; preserve chart mouse interactions.
    if (event.target !== viewportRef.current && !event.target.classList?.contains('chart-modal__transform')) return
    dragRef.current = { x: event.clientX, y: event.clientY, start: offset }
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const moveDrag = (event) => {
    if (!dragRef.current) return
    const { x, y, start } = dragRef.current
    setOffset(clampOffset({ x: start.x + event.clientX - x, y: start.y + event.clientY - y }))
  }

  const stopDrag = () => { dragRef.current = null }

  return createPortal(
    <div className="chart-modal__backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section
        className="chart-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        ref={dialogRef}
      >
        <header className="chart-modal__header">
          <div className="chart-modal__heading">
            <h2 id={titleId} style={{ fontSize: '1.5em' }}>{title}</h2>
            <p id={descriptionId} style={{ fontSize: '1em' }}> {description}</p>
            {legend.length > 0 && (
              <div className="chart-modal__legend" aria-label="Leyenda de colores">
                {legend.map(({ label, color }) => (
                  <span className="chart-modal__legend-item" key={label}>
                    <span className="chart-modal__legend-swatch" style={{ backgroundColor: color}} aria-hidden="true" />
                    <span style={{ fontSize: '1.2em' }}>{label}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
          <button type="button" className="chart-modal__close" onClick={onClose} aria-label="Cerrar visualización ampliada" title="Cerrar (Esc)">×</button>
        </header>
        <div className="chart-modal__toolbar" aria-label="Controles de ampliación">
          <button type="button" onClick={() => changeZoom(-STEP)} disabled={zoom <= MIN_ZOOM} aria-label="Alejar">−</button>
          <output aria-live="polite">{Math.round(zoom * 100)}%</output>
          <button type="button" onClick={() => changeZoom(STEP)} disabled={zoom >= MAX_ZOOM} aria-label="Acercar">+</button>
          <button type="button" onClick={reset} disabled={zoom === 1 && offset.x === 0 && offset.y === 0} className="chart-modal__reset">Restablecer</button>
        </div>
        <div
          className="chart-modal__viewport"
          ref={viewportRef}
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={stopDrag}
          onPointerCancel={stopDrag}
        >
          <div
            className="chart-modal__transform"
            style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }}
          >
            <div className="chart-modal__chart">{children}</div>
          </div>
        </div>
      </section>
    </div>,
    document.body
  )
}
