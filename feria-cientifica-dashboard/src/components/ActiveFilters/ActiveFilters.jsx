
import './ActiveFilters.css'

function ActiveFilters({
  selectedRegional,
  selectedModality,
  selectedArea,
  onRegionalChange,
  onModalityChange,
  onAreaChange,
}) {
  // ==========================================
  // 1. OBTENER FILTROS ACTIVOS
  // ==========================================

  const activeFilters = [
    {
      key: 'regional',
      label: 'Dirección Regional',
      value: selectedRegional,
      onRemove: () => onRegionalChange('Todas'),
    },
    {
      key: 'modality',
      label: 'Modalidad',
      value: selectedModality,
      onRemove: () => onModalityChange('Todas'),
    },
    {
      key: 'area',
      label: 'Área temática',
      value: selectedArea,
      onRemove: () => onAreaChange('Todas'),
    },
  ].filter(
    (filter) => filter.value && filter.value !== 'Todas'
  )

  // ==========================================
  // 2. OCULTAR SI NO HAY FILTROS
  // ==========================================

  if (activeFilters.length === 0) {
    return null
  }

  return (
    <section
      className="active-filters"
      aria-label="Filtros aplicados"
    >
      {/* ==========================================
          ENCABEZADO
      ========================================== */}

      <div className="active-filters__heading">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 7h16M7 12h10M10 17h4" />
        </svg>

        <span>Filtros aplicados:</span>
      </div>

      {/* ==========================================
          ETIQUETAS DE FILTROS
      ========================================== */}

      <div className="active-filters__items">
        {activeFilters.map((filter) => (
          <div
            key={filter.key}
            className={`active-filters__chip active-filters__chip--${filter.key}`}
          >
            <span className="active-filters__chip-text">
              <strong>{filter.label}:</strong>{' '}
              {filter.value}
            </span>

            <button
              type="button"
              className="active-filters__remove"
              onClick={filter.onRemove}
              aria-label={`Quitar filtro ${filter.label}: ${filter.value}`}
              title={`Quitar ${filter.label}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ActiveFilters
