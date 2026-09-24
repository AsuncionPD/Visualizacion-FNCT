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
    const value = project['Uso de inteligencia artificial']
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


// ==========================================
// ESTUDIANTES POR ÁREA TEMÁTICA Y SEXO
// ==========================================

export function getStudentsByAreaAndSex(data) {
  const result = {}

  data.forEach((project) => {
    const area = project['Área temática']?.trim()

    if (!area) {
      return
    }

    if (!result[area]) {
      result[area] = {}
    }

    // Revisar los tres posibles estudiantes
    for (let i = 1; i <= 3; i++) {
      const sex =
        project[`Sexo del estudiante ${i}`]?.trim()

      if (!sex) {
        continue
      }

      if (!result[area][sex]) {
        result[area][sex] = 0
      }

      result[area][sex]++
    }
  })

  return result
}


// ==========================================
// PROYECTOS POR ÁREA TEMÁTICA Y MODALIDAD
// ==========================================

export function getProjectsByAreaAndModality(data) {
  const result = {}

  data.forEach((project) => {
    const area =
      project['Área temática']?.trim()

    const modalidad =
      project['Modalidad']?.trim()

    if (!area || !modalidad) {
      return
    }

    if (!result[area]) {
      result[area] = {}
    }

    if (!result[area][modalidad]) {
      result[area][modalidad] = 0
    }

    result[area][modalidad]++
  })

  return result
}