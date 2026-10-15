import KpiCard from '../KpiCard/KpiCard.jsx'
import coheteIcon from '../../assets/imgs/cohete.png'
import colegioIcon from '../../assets/imgs/colegio.png'
import estudianteIcon from '../../assets/imgs/estudiante.png'
import estrellasIcon from '../../assets/imgs/estrellas.png'

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
        img= {coheteIcon}
        value={totalProjects}
        label="Total de proyectos"
      />

      <KpiCard
        img= {colegioIcon}
        value={totalSchools}
        label="Centros educativos"
      />

      <KpiCard
        img= {estudianteIcon}
        value={totalStudents}
        label="Estudiantes"
      />

      <KpiCard
         img= {estrellasIcon}
        value={`${totalAIProjects} (${aiPercentage}%)`}
        label="Proyectos con IA"
        highlight
      />

    </section>
  )
}

export default KpiSection