import { useEffect, useMemo, useState } from 'react'
import * as d3 from 'd3'
import Header from './components/Header/Header.jsx'
import Filters from './components/Filters/Filters.jsx'
import ActiveFilters from './components/ActiveFilters/ActiveFilters.jsx'
import KpiSection from './components/KpiSection/KpiSection.jsx'
import VisualizationGrid from './components/VisualizationGrid/VisualizationGrid.jsx'
import Footer from './components/Footer/Footer.jsx'
import proyectosUrl from './data/proyectos_FNCT_2026.csv?url'
import useDashboardTour from './hooks/useDashboardTour'
import './App.css'

function App() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('dashboard-theme') === 'light' ? 'light' : 'dark' }
    catch { return 'dark' }
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('dashboard-theme', theme) }
    catch { /* El dashboard funciona sin almacenamiento. */ }
  }, [theme])

  const toggleTheme = () => setTheme(current => current === 'dark' ? 'light' : 'dark')
  const [data, setData] = useState([])
  const [selectedRegional, setSelectedRegional] = useState('Todas')
  const [selectedModality, setSelectedModality] = useState('Todas')
  const [selectedArea, setSelectedArea] = useState('Todas')
  const { startTour } = useDashboardTour(data.length > 0)

  useEffect(() => {
    d3.csv(proyectosUrl)
      .then(datos => setData(datos))
      .catch(error => console.error('ERROR cargando CSV:', error))
  }, [])

  const fnctYear = useMemo(() => {
    const years = Array.from(new Set(data.map(row => String(row['Año FNCT'] ?? '').trim()).filter(value => /^\d{4}$/.test(value))))
    if (years.length === 1) return years[0]
    if (years.length > 1) console.warn('El CSV contiene diferentes años FNCT:', years)
    return null
  }, [data])

  const regionalOptions = useMemo(() => Array.from(new Set(data.map(row => row['Nombre de la dirección regional']?.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es')), [data])
  const modalityOptions = useMemo(() => Array.from(new Set(data.map(row => row.Modalidad?.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es')), [data])
  const areaOptions = useMemo(() => Array.from(new Set(data.map(row => row['Área temática']?.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es')), [data])

  const filteredData = useMemo(() => data.filter(row => {
    const regional = row['Nombre de la dirección regional']?.trim()
    const modality = row.Modalidad?.trim()
    const area = row['Área temática']?.trim()
    return (selectedRegional === 'Todas' || regional === selectedRegional)
      && (selectedModality === 'Todas' || modality === selectedModality)
      && (selectedArea === 'Todas' || area === selectedArea)
  }), [data, selectedRegional, selectedModality, selectedArea])

  const resetFilters = () => {
    setSelectedRegional('Todas')
    setSelectedModality('Todas')
    setSelectedArea('Todas')
  }

  const hasActiveFilters = selectedRegional !== 'Todas' || selectedModality !== 'Todas' || selectedArea !== 'Todas'

  return (
    <div className="app">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        year={fnctYear}
        hasActiveFilters={hasActiveFilters}
        kpis={<KpiSection data={filteredData} />}
        onStartTour={startTour}
      >
        <Filters
          regionalOptions={regionalOptions}
          modalityOptions={modalityOptions}
          areaOptions={areaOptions}
          selectedRegional={selectedRegional}
          selectedModality={selectedModality}
          selectedArea={selectedArea}
          onRegionalChange={setSelectedRegional}
          onModalityChange={setSelectedModality}
          onAreaChange={setSelectedArea}
          onReset={resetFilters}
        />
      </Header>

      {/* SIEMPRE fuera del menú. Mantiene visibles los filtros activos y sus opciones para quitarlos. */}
      <ActiveFilters
        selectedRegional={selectedRegional}
        selectedModality={selectedModality}
        selectedArea={selectedArea}
        onRegionalChange={setSelectedRegional}
        onModalityChange={setSelectedModality}
        onAreaChange={setSelectedArea}
        onReset={resetFilters}
      />

      <main className="dashboard">
        <VisualizationGrid data={filteredData} theme={theme} />
      </main>
      <Footer />
    </div>
  )
}

export default App
