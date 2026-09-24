export function getTotalProjects(data) {
  return data.length
}

export function getTotalSchools(data) {
  const schools = new Set(
    data
      .map((project) => project['Nombre del centro educativo'])
      .filter(Boolean)
  )

  return schools.size
}

export function getTotalStudents(data) {
  let total = 0

  data.forEach((project) => {
    if (project['Sexo del estudiante 1']?.trim()) {
      total++
    }

    if (project['Sexo del estudiante 2']?.trim()) {
      total++
    }

    if (project['Sexo del estudiante 3']?.trim()) {
      total++
    }
  })

  return total
}

export function getTotalAIProjects(data) {
  return data.filter((project) => {
    const value = project['Uso de Inteligencia artificial']
      ?.trim()
      .toLowerCase()

    return value === 'sí' || value === 'si'
  }).length
}

export function getProjectsByRegional(data) {
  const projectsByRegional = {}

  data.forEach((project) => {
    const regional =
      project['Nombre de la dirección regional']?.trim()

    if (!regional) {
      return
    }

    if (!projectsByRegional[regional]) {
      projectsByRegional[regional] = 0
    }

    projectsByRegional[regional]++
  })

  return projectsByRegional
}