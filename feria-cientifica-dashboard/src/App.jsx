import { useEffect, useMemo, useState } from 'react'
import * as d3 from 'd3'

import Header from './components/Header/Header.jsx'
import Filters from './components/Filters/Filters.jsx'
import KpiSection from './components/KpiSection/KpiSection.jsx'
import VisualizationGrid from './components/VisualizationGrid/VisualizationGrid.jsx'

import proyectosUrl from './data/proyectos.csv?url'

import './App.css'

function App() {
  // ==========================================
  // DATOS ORIGINALES
  // ==========================================

  const [data, setData] = useState([])

  // ==========================================
  // FILTROS
  // ==========================================

  const [selectedRegional, setSelectedRegional] =
    useState('Todas')

  const [selectedModality, setSelectedModality] =
    useState('Todas')

  const [selectedArea, setSelectedArea] =
    useState('Todas')


  // ==========================================
  // CARGAR CSV
  // ==========================================

  useEffect(() => {
    d3.csv(proyectosUrl)
      .then((datos) => {
        console.log('CSV cargado correctamente')
        console.log('Columnas:', datos.columns)
        console.log('Datos:', datos)

        setData(datos)
      })
      .catch((error) => {
        console.error(
          'ERROR cargando CSV:',
          error
        )
      })
  }, [])


  // ==========================================
  // OPCIONES DE DIRECCIÓN REGIONAL
  // ==========================================

  const regionalOptions = useMemo(() => {
    return Array.from(
      new Set(
        data
          .map((row) =>
            row[
              'Nombre de la dirección regional'
            ]?.trim()
          )
          .filter(Boolean)
      )
    ).sort((a, b) =>
      a.localeCompare(b, 'es')
    )
  }, [data])


  // ==========================================
  // OPCIONES DE MODALIDAD
  // ==========================================

  const modalityOptions = useMemo(() => {
    return Array.from(
      new Set(
        data
          .map((row) =>
            row['Modalidad']?.trim()
          )
          .filter(Boolean)
      )
    ).sort((a, b) =>
      a.localeCompare(b, 'es')
    )
  }, [data])


  // ==========================================
  // OPCIONES DE ÁREA TEMÁTICA
  // ==========================================

  const areaOptions = useMemo(() => {
    return Array.from(
      new Set(
        data
          .map((row) =>
            row['Área temática']?.trim()
          )
          .filter(Boolean)
      )
    ).sort((a, b) =>
      a.localeCompare(b, 'es')
    )
  }, [data])


  // ==========================================
  // APLICAR LOS 3 FILTROS
  // ==========================================

  const filteredData = useMemo(() => {
    return data.filter((row) => {

      const regional =
        row[
          'Nombre de la dirección regional'
        ]?.trim()

      const modality =
        row['Modalidad']?.trim()

      const area =
        row['Área temática']?.trim()


      const matchesRegional =
        selectedRegional === 'Todas' ||
        regional === selectedRegional


      const matchesModality =
        selectedModality === 'Todas' ||
        modality === selectedModality


      const matchesArea =
        selectedArea === 'Todas' ||
        area === selectedArea


      return (
        matchesRegional &&
        matchesModality &&
        matchesArea
      )
    })
  }, [
    data,
    selectedRegional,
    selectedModality,
    selectedArea,
  ])


  // ==========================================
  // RESTABLECER FILTROS
  // ==========================================

  const resetFilters = () => {
    setSelectedRegional('Todas')
    setSelectedModality('Todas')
    setSelectedArea('Todas')
  }


  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="app">

      <Header>

        <Filters
          regionalOptions={regionalOptions}
          modalityOptions={modalityOptions}
          areaOptions={areaOptions}

          selectedRegional={selectedRegional}
          selectedModality={selectedModality}
          selectedArea={selectedArea}

          onRegionalChange={
            setSelectedRegional
          }

          onModalityChange={
            setSelectedModality
          }

          onAreaChange={
            setSelectedArea
          }

          onReset={resetFilters}
        />

      </Header>


      <main className="dashboard">

        <KpiSection
          data={filteredData}
        />

        <VisualizationGrid
          data={filteredData}
        />

      </main>

    </div>
  )
}

export default App