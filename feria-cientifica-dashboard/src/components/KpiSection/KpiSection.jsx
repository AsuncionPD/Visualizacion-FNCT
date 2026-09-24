import KpiCard from '../KpiCard/KpiCard.jsx'

import {
  getTotalProjects,
  getTotalSchools,
  getTotalStudents,
  getTotalAIProjects,
} from '../../utils/dataProcessing.js'

import './KpiSection.css'

function KpiSection({ data }) {
  const totalProjects = getTotalProjects(data)
  const totalSchools = getTotalSchools(data)
  const totalStudents = getTotalStudents(data)
  const totalAIProjects = getTotalAIProjects(data)

  const aiPercentage =
    totalProjects > 0
      ? Math.round((totalAIProjects / totalProjects) * 100)
      : 0

  return (
    <section className="kpi-section">
      <KpiCard
        icon="▤"
        label="Total de proyectos"
        value={totalProjects}
      />

      <KpiCard
        icon="🏫"
        label="Centros educativos"
        value={totalSchools}
      />

      <KpiCard
        icon="♙"
        label="Estudiantes"
        value={totalStudents}
      />

      <KpiCard
        icon="✦"
        label="Proyectos con IA"
        value={`${totalAIProjects} (${aiPercentage}%)`}
      />
    </section>
  )
}

export default KpiSection