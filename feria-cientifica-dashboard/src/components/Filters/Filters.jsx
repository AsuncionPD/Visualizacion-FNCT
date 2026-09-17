import './Filters.css'

function Filters() {
  return (
    <section className="filters">
      <div className="filter">
        <label htmlFor="regional">Dirección Regional</label>

        <select id="regional">
          <option value="todas">Todas</option>
        </select>
      </div>

      <div className="filter">
        <label htmlFor="modalidad">Modalidad</label>

        <select id="modalidad">
          <option value="todas">Todas</option>
        </select>
      </div>

      <div className="filter">
        <label htmlFor="area">Área temática</label>

        <select id="area">
          <option value="todas">Todas</option>
        </select>
      </div>

      <button className="filters__reset" type="button">
        ↻
        <span>Restablecer filtros</span>
      </button>
    </section>
  )
}

export default Filters