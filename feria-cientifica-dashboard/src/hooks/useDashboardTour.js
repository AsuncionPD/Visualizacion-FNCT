import { useCallback, useEffect, useRef } from 'react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

const TOUR_KEY = 'fnct-dashboard-tour-v1'

export default function useDashboardTour(ready) {
  const tourRef = useRef(null)

  const startTour = useCallback(() => {
    if (!tourRef.current) return

    tourRef.current.drive()
  }, [])

  useEffect(() => {
    if (!ready) return

    let mounted = true

    const tour = driver({
      animate: true,
      duration: 250,
      showProgress: true,
      progressText: 'Paso {{current}} de {{total}}',
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Finalizar',
      closeBtnLabel: 'Salir del recorrido',
      allowClose: true,
      overlayOpacity: 0.65,
      stagePadding: 6,
      stageRadius: 10,
      smoothScroll: true,
      popoverClass: 'fnct-tour-popover',

      steps: [
        {
          element: '.visualization-grid__map',
          popover: {
            title: 'Explorá el mapa',
            description:
              'Pasá el cursor sobre las regiones para consultar información de los proyectos.',
            side: 'right',
            align: 'center',
          },
        },
        {
          element: '.visualization-grid__map .chart-card__expand',
          popover: {
            title: 'Ampliá los gráficos',
            description:
              'Usá este botón para abrir las visualizaciones en una ventana más grande.',
            side: 'bottom',
            align: 'end',
          },
        },
        {
          element: '.header__menu-button',
          popover: {
            title: 'Aplicá filtros',
            description:
              'Filtrá por dirección regional, modalidad y área temática. Los filtros activos siempre aparecerán debajo del encabezado.',
            side: 'bottom',
            align: 'end',
          },
        },
        {
          element: '.header__actions .theme-switch',
          popover: {
            title: 'Personalizá la apariencia',
            description:
              'Cambiá entre el modo claro y oscuro cuando querás.',
            side: 'bottom',
            align: 'end',
          },
        },
      ],

      onDestroyed: () => {
        if (!mounted) return

        try {
          localStorage.setItem(TOUR_KEY, '1')
        } catch {
          // El recorrido funciona sin almacenamiento.
        }
      },
    })

    tourRef.current = tour

    const timer = window.setTimeout(() => {
      try {
        if (mounted && !localStorage.getItem(TOUR_KEY)) {
          tour.drive()
        }
      } catch {
        if (mounted) tour.drive()
      }
    }, 700)

    return () => {
      mounted = false
      window.clearTimeout(timer)
      tour.destroy()
      tourRef.current = null
    }
  }, [ready])

  return { startTour }
}
