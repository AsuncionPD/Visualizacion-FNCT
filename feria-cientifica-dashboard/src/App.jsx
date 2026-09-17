import Header from './components/Header/Header.jsx'
import Filters from './components/Filters/Filters.jsx'
import KpiSection from './components/KpiSection/KpiSection.jsx'
import VisualizationGrid from './components/VisualizationGrid/VisualizationGrid.jsx'
import './App.css'

function App() {
  return (
    <div className="app">
      <Header />

      <main className="dashboard">
        <Filters />
        <KpiSection />
        <VisualizationGrid />
      </main>
    </div>
  )
}

export default App