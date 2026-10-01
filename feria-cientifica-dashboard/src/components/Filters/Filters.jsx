import './Filters.css'

function Filters() {
  return (
    <section className="filters">

      {/* DIRECCIÓN REGIONAL */}
      <div className="filter-box">
        <span className="filter-box__icon">
          ♧
        </span>

        <div className="filter-box__content">
          <label htmlFor="regional">
            Dirección Regional
          </label>

          <select id="regional">
            <option value="todas">
              Todas
            </option>
          </select>
        </div>
      </div>


      {/* MODALIDAD */}
      <div className="filter-box">
        <span className="filter-box__icon">
          ◇
        </span>

        <div className="filter-box__content">
          <label htmlFor="modalidad">
            Modalidad
          </label>

          <select id="modalidad">
            <option value="todas">
              Todas
            </option>
          </select>
        </div>
      </div>


      {/* ÁREA TEMÁTICA */}
      <div className="filter-box">
        <span className="filter-box__icon">
          ♧
        </span>

        <div className="filter-box__content">
          <label htmlFor="area">
            Área temática
          </label>

          <select id="area">
            <option value="todas">
              Todas
            </option>
          </select>
        </div>
      </div>


      {/* RESTABLECER */}
      <button
        className="filters__reset"
        type="button"
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