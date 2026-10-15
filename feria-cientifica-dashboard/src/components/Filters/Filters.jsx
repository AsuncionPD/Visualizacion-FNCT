
import { useId } from 'react'
import Select from 'react-select'

import ubicacionIcon from '../../assets/imgs/ubicacion.png'
import birreteIcon from '../../assets/imgs/birrete.png'
import cienciasIcon from '../../assets/imgs/ciencias.png'

import './Filters.css'

// ==========================================
// OPCIONES PARA REACT SELECT
// ==========================================

const buildOptions = (options = []) => {
  const values = Array.from(
    new Set(
      options.filter(
        (option) => option && option !== 'Todas'
      )
    )
  )

  return [
    {
      value: 'Todas',
      label: 'Todas',
    },
    ...values.map((value) => ({
      value,
      label: value,
    })),
  ]
}

// ==========================================
// COMPONENTE REUTILIZABLE DE FILTRO
// ==========================================

function FilterSelect({
  id,
  label,
  icon,
  options,
  selectedValue,
  onChange,
}) {
  const selectOptions = buildOptions(options)

  const selectedOption =
    selectOptions.find(
      (option) => option.value === selectedValue
    ) || selectOptions[0]

  return (
    <div className="filter-box">

      <img
        src={icon}
        alt=""
        aria-hidden="true"
        className="filter-box__icon"
      />

      <div className="filter-box__content">

        <label htmlFor={id}>
          {label}
        </label>

        <Select
          inputId={id}
          instanceId={id}
          className="filter-select"
          classNamePrefix="filter-select"
          options={selectOptions}
          value={selectedOption}
          onChange={(option) => {
            onChange(option?.value ?? 'Todas')
          }}
          isSearchable
          isClearable={false}
          isMulti={false}
          menuPortalTarget={
            typeof document !== 'undefined'
              ? document.body
              : undefined
          }
          menuPosition="fixed"
          menuPlacement="auto"
          maxMenuHeight={240}
          noOptionsMessage={() =>
            'No se encontraron resultados'
          }
          placeholder="Seleccionar..."
          openMenuOnFocus={false}
          blurInputOnSelect
          unstyled
        />

      </div>

    </div>
  )
}

// ==========================================
// FILTROS PRINCIPALES
// ==========================================

function Filters({
  regionalOptions,
  modalityOptions,
  areaOptions,

  selectedRegional,
  selectedModality,
  selectedArea,

  onRegionalChange,
  onModalityChange,
  onAreaChange,

  onReset,
}) {
  const idPrefix = useId().replace(/:/g, '')

  return (
    <section
      className="filters"
      aria-label="Filtros del dashboard"
    >

      {/* =====================================
          DIRECCIÓN REGIONAL
      ===================================== */}

      <FilterSelect
        id={`${idPrefix}-regional`}
        label="Dirección Regional"
        icon={ubicacionIcon}
        options={regionalOptions}
        selectedValue={selectedRegional}
        onChange={onRegionalChange}
      />

      {/* =====================================
          MODALIDAD
      ===================================== */}

      <FilterSelect
        id={`${idPrefix}-modalidad`}
        label="Modalidad"
        icon={birreteIcon}
        options={modalityOptions}
        selectedValue={selectedModality}
        onChange={onModalityChange}
      />

      {/* =====================================
          ÁREA TEMÁTICA
      ===================================== */}

      <FilterSelect
        id={`${idPrefix}-area`}
        label="Área temática"
        icon={cienciasIcon}
        options={areaOptions}
        selectedValue={selectedArea}
        onChange={onAreaChange}
      />

      {/* =====================================
          RESTABLECER FILTROS
      ===================================== */}

      <button
        className="filters__reset"
        type="button"
        onClick={onReset}
      >

        <svg
          className="filters__reset-icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 11a9 9 0 1 1 2.6 6.4" />
          <path d="M3 4v7h7" />
        </svg>

        <span>
          Restablecer filtros
        </span>

      </button>

    </section>
  )
}

export default Filters
