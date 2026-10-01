import './Filters.css'

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
  return (
    <section className="filters">

      {/* =========================
          DIRECCIÓN REGIONAL
      ========================= */}

      <div className="filter-box">

        <span className="filter-box__icon">
          ♧
        </span>

        <div className="filter-box__content">

          <label htmlFor="regional">
            Dirección Regional
          </label>

          <select
            id="regional"
            value={selectedRegional}
            onChange={(event) =>
              onRegionalChange(
                event.target.value
              )
            }
          >
            <option value="Todas">
              Todas
            </option>

            {regionalOptions.map(
              (regional) => (
                <option
                  key={regional}
                  value={regional}
                >
                  {regional}
                </option>
              )
            )}

          </select>

        </div>
      </div>


      {/* =========================
          MODALIDAD
      ========================= */}

      <div className="filter-box">

        <span className="filter-box__icon">
          ◇
        </span>

        <div className="filter-box__content">

          <label htmlFor="modalidad">
            Modalidad
          </label>

          <select
            id="modalidad"
            value={selectedModality}
            onChange={(event) =>
              onModalityChange(
                event.target.value
              )
            }
          >
            <option value="Todas">
              Todas
            </option>

            {modalityOptions.map(
              (modality) => (
                <option
                  key={modality}
                  value={modality}
                >
                  {modality}
                </option>
              )
            )}

          </select>

        </div>
      </div>


      {/* =========================
          ÁREA TEMÁTICA
      ========================= */}

      <div className="filter-box">

        <span className="filter-box__icon">
          ♧
        </span>

        <div className="filter-box__content">

          <label htmlFor="area">
            Área temática
          </label>

          <select
            id="area"
            value={selectedArea}
            onChange={(event) =>
              onAreaChange(
                event.target.value
              )
            }
          >
            <option value="Todas">
              Todas
            </option>

            {areaOptions.map(
              (area) => (
                <option
                  key={area}
                  value={area}
                >
                  {area}
                </option>
              )
            )}

          </select>

        </div>
      </div>


      {/* =========================
          RESTABLECER
      ========================= */}

      <button
        className="filters__reset"
        type="button"
        onClick={onReset}
      >
        <span className="filters__reset-icon">
          ↻
        </span>

        <span>
          Restablecer filtros
        </span>

      </button>

    </section>
  )
}

export default Filters