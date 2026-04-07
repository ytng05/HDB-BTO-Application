export interface HeroSlide {
  title: string
  town: string
  topDate: string
  image: string
}

export interface UpcomingProject {
  title: string
  town: string
  flatTypes: string
  openDate: string
  closeDate: string
  image: string
}

interface ProjectLookupEntry {
  name: string
  town: string
}

export interface ProjectLookupRecord {
  project_id: number
  project_name: string
  town_name: string
}

export const heroSlides: HeroSlide[] = [
  {
    title: 'Tengah Garden Walk',
    town: 'Tengah',
    topDate: 'Q4 2028',
    image: 'https://picsum.photos/1400/600?random=1',
  },
  {
    title: 'Kallang RiverFront',
    town: 'Kallang/Whampoa',
    topDate: 'Q2 2029',
    image: 'https://picsum.photos/1400/600?random=2',
  },
  {
    title: 'Queenstown SkyGrove',
    town: 'Queenstown',
    topDate: 'Q1 2028',
    image: 'https://picsum.photos/1400/600?random=3',
  },
]

export const upcomingProjects: UpcomingProject[] = [
  {
    title: 'Tengah Garden Walk',
    town: 'Tengah',
    flatTypes: '2-Room Flexi to 5-Room',
    openDate: '10 March 2025',
    closeDate: '16 March 2025',
    image: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Tengah_Singapore_HDB_20240529_143609.jpg',
  },
  {
    title: 'Kallang RiverFront',
    town: 'Kallang/Whampoa',
    flatTypes: '3-Room to 5-Room',
    openDate: '24 March 2025',
    closeDate: '30 March 2025',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/4/4b/%28SGP-Singapore%29_Kallang_Horizon_HDB_blocks_under_construction_2024-02-16.jpg',
  },
  {
    title: 'Queenstown SkyGrove',
    town: 'Queenstown',
    flatTypes: '2-Room Flexi to 5-Room',
    openDate: '07 April 2025',
    closeDate: '13 April 2025',
    image: 'https://upload.wikimedia.org/wikipedia/commons/d/dd/Block_45_Stirling_Road%2C_Singapore.jpg',
  },
]

const projectLookup: Record<number, ProjectLookupEntry> = {
  24: {
    name: 'Serangoon MeadowRise',
    town: 'Serangoon',
  },
  31: {
    name: 'Jurong West LakeEdge',
    town: 'Jurong West',
  },
  32: {
    name: 'Clementi RidgeView',
    town: 'Clementi',
  },
  33: {
    name: 'Bukit Batok Hillcrest',
    town: 'Bukit Batok',
  },
  40: {
    name: 'Tengah Garden Walk',
    town: 'Tengah',
  },
  41: {
    name: 'Punggol SeaVista',
    town: 'Punggol',
  },
  42: {
    name: 'Queenstown SkyGrove',
    town: 'Queenstown',
  },
  43: {
    name: 'Kallang RiverFront',
    town: 'Kallang/Whampoa',
  },
  53: {
    name: 'Geylang East Crest',
    town: 'Geylang',
  },
}

export function syncProjectLookup(records: ProjectLookupRecord[]) {
  for (const record of records) {
    if (!record || typeof record.project_id !== 'number') {
      continue
    }

    projectLookup[record.project_id] = {
      name: record.project_name,
      town: record.town_name,
    }
  }
}

export function getProjectName(projectId: number): string {
  return projectLookup[projectId]?.name ?? `Project ${projectId}`
}

export function getProjectTown(projectId: number): string {
  return projectLookup[projectId]?.town ?? 'Singapore'
}
