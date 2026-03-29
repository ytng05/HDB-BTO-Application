export type JourneySlide = {
  id: string
  stage: string
  title: string
  summary: string
  bullets: string[]
  metric: string
  metricLabel: string
}

export type ProcessStep = {
  id: string
  label: string
  title: string
  detail: string
}

export const journeySlides: JourneySlide[] = []
export const processSteps: ProcessStep[] = []

export type DemoUser = {
  nric: string
  password: string
  name: string
  age: number
  household: string
  status: string
  preferredTown: string
  role: 'user' | 'admin'
}

export type LaunchItem = {
  id: string
  month: string
  town: string
  project: string
  summary: string
  window: string
  flatTypes: string[]
  status: 'Upcoming' | 'Preview soon' | 'Early view'
  totalUnits: number
}

export type FlatUnit = {
  id: string
  projectId: string
  floor: number
  unitNumber: string
  type: '2-Room Flexi' | '3-Room' | '4-Room' | '5-Room'
  area: number
  price: number
  status: 'available' | 'reserved'
  facing: 'North' | 'South' | 'East' | 'West'
}

export type Application = {
  id: string
  nric: string
  name: string
  projectId: string
  projectName: string
  town: string
  flatType: string
  appliedDate: string
  queueNumber: number | null
  status: 'pending' | 'balloted' | 'selected' | 'completed'
  selectedUnitId?: string
}

export const demoUsers: DemoUser[] = [
  {
    nric: 'S1234567A',
    password: 'apple123',
    name: 'Rachel Tan',
    age: 29,
    household: 'Fiance and fiancee scheme',
    status: 'First-timer',
    preferredTown: 'Tengah',
    role: 'user',
  },
  {
    nric: 'S7654321D',
    password: 'redhome',
    name: 'Marcus Lee',
    age: 34,
    household: 'Married couple',
    status: 'First-timer',
    preferredTown: 'Woodlands',
    role: 'user',
  },
  {
    nric: 'T0000001Z',
    password: 'admin2026',
    name: 'HDB Administrator',
    age: 0,
    household: 'N/A',
    status: 'admin',
    preferredTown: 'N/A',
    role: 'admin',
  },
]

export const upcomingLaunches: LaunchItem[] = [
  {
    id: 'garden-vista',
    month: 'July 2026',
    town: 'Tengah',
    project: 'Garden Vista',
    summary: 'Green, family-focused launch in Tengah.',
    window: 'Opens in 6 days',
    flatTypes: ['2-Room Flexi', '3-Room', '4-Room', '5-Room'],
    status: 'Upcoming',
    totalUnits: 960,
  },
  {
    id: 'north-haven',
    month: 'August 2026',
    town: 'Woodlands',
    project: 'North Haven',
    summary: 'Transport-focused launch for working households.',
    window: 'Preview next week',
    flatTypes: ['3-Room', '4-Room', '5-Room'],
    status: 'Preview soon',
    totalUnits: 640,
  },
  {
    id: 'skyline-commons',
    month: 'September 2026',
    town: 'Bishan',
    project: 'Skyline Commons',
    summary: 'Central-region launch with a smaller premium mix.',
    window: 'Pricing soon',
    flatTypes: ['3-Room', '4-Room'],
    status: 'Early view',
    totalUnits: 420,
  },
]

function genFlats(): FlatUnit[] {
  const units: FlatUnit[] = []
  const facings = ['North', 'South', 'East', 'West'] as const

  for (let floor = 3; floor <= 15; floor += 1) {
    for (let index = 0; index < 4; index += 1) {
      units.push({
        id: `gv-2r-${floor}-${index}`,
        projectId: 'garden-vista',
        floor,
        unitNumber: `${String(floor).padStart(2, '0')}${String(index + 1).padStart(2, '0')}`,
        type: '2-Room Flexi',
        area: 36,
        price: 158000 + floor * 2800 + (index % 2 === 1 ? 5000 : 0),
        status: (floor + index) % 4 === 0 ? 'reserved' : 'available',
        facing: facings[index % 4] ?? 'North',
      })
    }
  }

  for (let floor = 4; floor <= 15; floor += 1) {
    for (let index = 0; index < 4; index += 1) {
      units.push({
        id: `gv-3r-${floor}-${index}`,
        projectId: 'garden-vista',
        floor,
        unitNumber: `${String(floor).padStart(2, '0')}${String(index + 11).padStart(2, '0')}`,
        type: '3-Room',
        area: 65,
        price: 298000 + floor * 4200 + (index % 2 === 1 ? 8000 : 0),
        status: (floor * 3 + index) % 5 === 0 ? 'reserved' : 'available',
        facing: facings[index % 4] ?? 'North',
      })
    }
  }

  for (let floor = 6; floor <= 15; floor += 1) {
    for (let index = 0; index < 4; index += 1) {
      units.push({
        id: `gv-4r-${floor}-${index}`,
        projectId: 'garden-vista',
        floor,
        unitNumber: `${String(floor).padStart(2, '0')}${String(index + 21).padStart(2, '0')}`,
        type: '4-Room',
        area: 90,
        price: 428000 + floor * 5400 + (index % 2 === 1 ? 12000 : 0),
        status: (floor + index * 2) % 5 === 0 ? 'reserved' : 'available',
        facing: facings[index % 4] ?? 'North',
      })
    }
  }

  for (let floor = 10; floor <= 15; floor += 1) {
    for (let index = 0; index < 2; index += 1) {
      units.push({
        id: `gv-5r-${floor}-${index}`,
        projectId: 'garden-vista',
        floor,
        unitNumber: `${String(floor).padStart(2, '0')}${String(index + 31).padStart(2, '0')}`,
        type: '5-Room',
        area: 110,
        price: 576000 + floor * 6200 + (index === 1 ? 22000 : 0),
        status: (floor + index) % 4 === 0 ? 'reserved' : 'available',
        facing: index === 0 ? 'North' : 'South',
      })
    }
  }

  return units
}

export const gardenVistaFlats: FlatUnit[] = genFlats()

export const demoApplications: Application[] = [
  {
    id: 'app-001',
    nric: 'S1234567A',
    name: 'Rachel Tan',
    projectId: 'garden-vista',
    projectName: 'Garden Vista',
    town: 'Tengah',
    flatType: '4-Room',
    appliedDate: '2026-01-15',
    queueNumber: 247,
    status: 'balloted',
  },
  {
    id: 'app-002',
    nric: 'S7654321D',
    name: 'Marcus Lee',
    projectId: 'garden-vista',
    projectName: 'Garden Vista',
    town: 'Tengah',
    flatType: '4-Room',
    appliedDate: '2026-01-18',
    queueNumber: 891,
    status: 'balloted',
  },
  {
    id: 'app-003',
    nric: 'S2345678B',
    name: 'Priya Nair',
    projectId: 'garden-vista',
    projectName: 'Garden Vista',
    town: 'Tengah',
    flatType: '3-Room',
    appliedDate: '2026-01-14',
    queueNumber: 103,
    status: 'balloted',
  },
  {
    id: 'app-004',
    nric: 'S3456789C',
    name: 'David Lim',
    projectId: 'garden-vista',
    projectName: 'Garden Vista',
    town: 'Tengah',
    flatType: '5-Room',
    appliedDate: '2026-01-20',
    queueNumber: 512,
    status: 'balloted',
  },
  {
    id: 'app-005',
    nric: 'S4567890E',
    name: 'Sarah Wong',
    projectId: 'garden-vista',
    projectName: 'Garden Vista',
    town: 'Tengah',
    flatType: '4-Room',
    appliedDate: '2026-01-12',
    queueNumber: 78,
    status: 'balloted',
  },
  {
    id: 'app-006',
    nric: 'S5678901F',
    name: 'Ahmad Rasyid',
    projectId: 'garden-vista',
    projectName: 'Garden Vista',
    town: 'Tengah',
    flatType: '3-Room',
    appliedDate: '2026-01-16',
    queueNumber: 334,
    status: 'balloted',
  },
  {
    id: 'app-007',
    nric: 'S6789012G',
    name: 'Mei Ling Tan',
    projectId: 'garden-vista',
    projectName: 'Garden Vista',
    town: 'Tengah',
    flatType: '4-Room',
    appliedDate: '2026-01-19',
    queueNumber: 156,
    status: 'balloted',
  },
  {
    id: 'app-008',
    nric: 'S7890123H',
    name: 'Kevin Ong',
    projectId: 'garden-vista',
    projectName: 'Garden Vista',
    town: 'Tengah',
    flatType: '2-Room Flexi',
    appliedDate: '2026-01-11',
    queueNumber: 41,
    status: 'balloted',
  },
  {
    id: 'app-009',
    nric: 'S8901234J',
    name: 'Nurul Huda',
    projectId: 'garden-vista',
    projectName: 'Garden Vista',
    town: 'Tengah',
    flatType: '5-Room',
    appliedDate: '2026-01-22',
    queueNumber: 667,
    status: 'balloted',
  },
  {
    id: 'app-010',
    nric: 'S9012345K',
    name: 'Benjamin Chua',
    projectId: 'garden-vista',
    projectName: 'Garden Vista',
    town: 'Tengah',
    flatType: '4-Room',
    appliedDate: '2026-01-17',
    queueNumber: 423,
    status: 'balloted',
  },
]
