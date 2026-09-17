import KpiCard from '../KpiCard/KpiCard.jsx'
import './KpiSection.css'

function KpiSection() {
  return (
    <section className="kpi-section">
      <KpiCard
        icon="▤"
        title="Total de proyectos"
        value="—"
      />

      <KpiCard
        icon="🏫"
        title="Centros educativos"
        value="—"
      />

      <KpiCard
        icon="♙"
        title="Estudiantes"
        value="—"
      />

      <KpiCard
        icon="✦"
        title="Proyectos con IA"
        value="—"
        detail=""
      />
    </section>
  )
}

export default KpiSection