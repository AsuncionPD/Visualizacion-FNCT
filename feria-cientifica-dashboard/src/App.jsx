import { useEffect, useState } from 'react'
import * as d3 from 'd3'

import Header from './components/Header/Header.jsx'
import Filters from './components/Filters/Filters.jsx'
import KpiSection from './components/KpiSection/KpiSection.jsx'
import VisualizationGrid from './components/VisualizationGrid/VisualizationGrid.jsx'

import proyectosUrl from './data/proyectos.csv?url'

import { getTotalProjects, getTotalSchools, getTotalStudents, getTotalAIProjects } from './utils/dataProcessing.js'

import './App.css'

function App() {
  const [data, setData] = useState([])

  useEffect(() => {
    console.log('1. App inició')
    console.log('2. URL del CSV:', proyectosUrl)

    d3.csv(proyectosUrl)
      .then((datos) => {
        console.log('3. CSV cargado correctamente')
        console.log('Datos:', datos)
        console.log('Columnas:', datos.columns)

        setData(datos)

        console.log('Total de proyectos:', getTotalProjects(datos))
        console.log('Total de centros educativos:', getTotalSchools(datos))
        console.log('Total de estudiantes:', getTotalStudents(datos))
        console.log('Total de proyectos con IA:', getTotalAIProjects(datos))
      })
      .catch((error) => {
        console.error('ERROR cargando CSV:', error)
      })
  }, [])

  return (
    <div className="app">
      <Header />

      <main className="dashboard">
        <Filters />

        <KpiSection data={data} />

        <VisualizationGrid data={data} />
      </main>
    </div>
  )
}

export default App