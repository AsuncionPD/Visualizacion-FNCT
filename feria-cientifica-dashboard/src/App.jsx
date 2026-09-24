import { useEffect, useState } from 'react'
import * as d3 from 'd3'

import Header from './components/Header/Header.jsx'
import Filters from './components/Filters/Filters.jsx'
import KpiSection from './components/KpiSection/KpiSection.jsx'
import VisualizationGrid from './components/VisualizationGrid/VisualizationGrid.jsx'

import proyectosUrl from './data/proyectos.csv?url'

import {
  getTotalProjects,
  getTotalSchools,
  getTotalStudents,
  getTotalAIProjects,
  getStudentsByAreaAndSex,
} from './utils/dataProcessing.js'

import './App.css'

function App() {
  const [data, setData] = useState([])

  useEffect(() => {
    console.log('1. App inició')
    console.log('2. URL del CSV:', proyectosUrl)

    d3.csv(proyectosUrl)
      .then((datos) => {
        // ==========================================
        // CSV CARGADO
        // ==========================================

        console.log('3. CSV cargado correctamente')
        console.log('Datos:', datos)
        console.log('Columnas:', datos.columns)

        // Guardamos los datos en React
        setData(datos)

        // ==========================================
        // KPIs
        // ==========================================

        console.log(
          'Total de proyectos:',
          getTotalProjects(datos)
        )

        console.log(
          'Total de centros educativos:',
          getTotalSchools(datos)
        )

        console.log(
          'Total de estudiantes:',
          getTotalStudents(datos)
        )

        console.log(
          'Total de proyectos con IA:',
          getTotalAIProjects(datos)
        )

        // ==========================================
        // ÁREA TEMÁTICA × SEXO
        // ==========================================

        console.log(
          '=== ÁREA TEMÁTICA × SEXO ==='
        )

        console.log(
          getStudentsByAreaAndSex(datos)
        )

        // ==========================================
        // DIAGNÓSTICO DEL CSV
        // ==========================================

        console.log('=== DIAGNÓSTICO CSV ===')

        console.log(
          'Filas leídas por D3:',
          datos.length
        )

        console.log(
          'IDs:',
          datos.map((fila) => fila['Id'])
        )

        console.log(
          'Filas sin ID:',
          datos.filter(
            (fila) => !fila['Id']?.trim()
          )
        )

        console.log(
          'Cantidad de IDs únicos:',
          new Set(
            datos
              .map((fila) => fila['Id']?.trim())
              .filter(Boolean)
          ).size
        )

        // ==========================================
        // ORDENAR IDs PARA REVISARLOS
        // ==========================================

        const ids = datos
          .map((fila) => Number(fila['Id']))
          .filter((id) => !Number.isNaN(id))
          .sort((a, b) => a - b)

        console.log(
          'Primer ID:',
          ids[0]
        )

        console.log(
          'Último ID:',
          ids[ids.length - 1]
        )

        console.log(
          'IDs numéricos ordenados:',
          ids
        )
      })

      .catch((error) => {
        console.error(
          'ERROR cargando CSV:',
          error
        )
      })
  }, [])

  return (
    <div className="app">
      <Header />

      <main className="dashboard">
         

        <KpiSection data={data} />

        <VisualizationGrid data={data} />
      </main>
    </div>
  )
}

export default App