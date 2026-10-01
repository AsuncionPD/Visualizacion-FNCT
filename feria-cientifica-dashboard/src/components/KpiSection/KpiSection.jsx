import KpiCard from '../KpiCard/KpiCard.jsx'

import {
  getTotalProjects,
  getTotalSchools,
  getTotalStudents,
  getTotalAIProjects,
} from '../../utils/dataProcessing.js'

import './KpiSection.css'

function KpiSection({ data }) {

  const totalProjects =
    getTotalProjects(data)

  const totalSchools =
    getTotalSchools(data)

  const totalStudents =
    getTotalStudents(data)

  const totalAIProjects =
    getTotalAIProjects(data)

  const aiPercentage =
    totalProjects > 0
      ? Math.round(
          (totalAIProjects / totalProjects) * 100
        )
      : 0

  return (
    <section className="kpi-section">

      <KpiCard
        icon="▤"
        value={totalProjects}
        label="Total de proyectos"
      />

      <KpiCard
        icon="🏫"
        value={totalSchools}
        label="Centros educativos"
      />

      <KpiCard
        icon="♙"
        value={totalStudents}
        label="Estudiantes"
      />

      <KpiCard
        icon="✦"
        value={`${totalAIProjects} (${aiPercentage}%)`}
        label="Proyectos con IA"
      />

    </section>
  )
}

export default KpiSection