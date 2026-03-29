/* ─────────────────────────────────────────
   HDB BTO Portal · Data & Types
   ───────────────────────────────────────── */
/* ── Demo users ────────────────────────── */
export const demoUsers = [
    {
        nric: 'S1234567A',
        password: 'apple123',
        name: 'Rachel Tan',
        age: 29,
        household: 'Fiancé/Fiancée Scheme',
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
        household: '—',
        status: 'admin',
        preferredTown: '—',
        role: 'admin',
    },
];
/* ── Launches ──────────────────────────── */
export const upcomingLaunches = [
    {
        id: 'garden-vista',
        month: 'July 2026',
        town: 'Tengah',
        project: 'Garden Vista',
        summary: 'A greenery-led launch with courtyard planning, family-sized layouts, and strong connectivity to the western growth corridor.',
        window: 'Applications open in 6 days',
        flatTypes: ['2-Room Flexi', '3-Room', '4-Room', '5-Room'],
        status: 'Upcoming',
        totalUnits: 960,
    },
    {
        id: 'north-haven',
        month: 'August 2026',
        town: 'Woodlands',
        project: 'North Haven',
        summary: 'A practical, transport-connected launch designed for younger households seeking convenience and a simpler commute.',
        window: 'Preview details arriving next week',
        flatTypes: ['3-Room', '4-Room', '5-Room'],
        status: 'Preview soon',
        totalUnits: 640,
    },
    {
        id: 'skyline-commons',
        month: 'September 2026',
        town: 'Bishan',
        project: 'Skyline Commons',
        summary: 'A rarer central-region launch with compact urban planning, elevated shared spaces, and a premium location profile.',
        window: 'Indicative pricing to be released soon',
        flatTypes: ['3-Room', '4-Room'],
        status: 'Early view',
        totalUnits: 420,
    },
];
/* ── Flat units for Garden Vista ────────── */
function genFlats() {
    const units = [];
    const facings = ['North', 'South', 'East', 'West'];
    // 2-Room Flexi: floors 3–15
    for (let f = 3; f <= 15; f++) {
        for (let u = 0; u < 4; u++) {
            units.push({
                id: `gv-2r-${f}-${u}`,
                projectId: 'garden-vista',
                floor: f,
                unitNumber: `${String(f).padStart(2, '0')}${String(u + 1).padStart(2, '0')}`,
                type: '2-Room Flexi',
                area: 36,
                price: 158000 + f * 2800 + (u % 2 === 1 ? 5000 : 0),
                status: (f + u) % 4 === 0 ? 'reserved' : 'available',
                facing: facings[u],
            });
        }
    }
    // 3-Room: floors 5–25
    for (let f = 5; f <= 25; f++) {
        for (let u = 0; u < 4; u++) {
            units.push({
                id: `gv-3r-${f}-${u}`,
                projectId: 'garden-vista',
                floor: f,
                unitNumber: `${String(f).padStart(2, '0')}${String(u + 11).padStart(2, '0')}`,
                type: '3-Room',
                area: 65,
                price: 298000 + f * 4200 + (u % 2 === 1 ? 8000 : 0),
                status: (f * 3 + u) % 5 === 0 ? 'reserved' : 'available',
                facing: facings[u],
            });
        }
    }
    // 4-Room: floors 8–38
    for (let f = 8; f <= 38; f++) {
        for (let u = 0; u < 4; u++) {
            units.push({
                id: `gv-4r-${f}-${u}`,
                projectId: 'garden-vista',
                floor: f,
                unitNumber: `${String(f).padStart(2, '0')}${String(u + 21).padStart(2, '0')}`,
                type: '4-Room',
                area: 90,
                price: 428000 + f * 5400 + (u % 2 === 1 ? 12000 : 0),
                status: (f + u * 2) % 5 === 0 ? 'reserved' : 'available',
                facing: facings[u],
            });
        }
    }
    // 5-Room: floors 15–40
    for (let f = 15; f <= 40; f++) {
        for (let u = 0; u < 2; u++) {
            units.push({
                id: `gv-5r-${f}-${u}`,
                projectId: 'garden-vista',
                floor: f,
                unitNumber: `${String(f).padStart(2, '0')}${String(u + 31).padStart(2, '0')}`,
                type: '5-Room',
                area: 110,
                price: 576000 + f * 6200 + (u === 1 ? 22000 : 0),
                status: (f + u) % 4 === 0 ? 'reserved' : 'available',
                facing: u === 0 ? 'North' : 'South',
            });
        }
    }
    return units;
}
export const gardenVistaFlats = genFlats();
/* ── Applications ──────────────────────── */
export const demoApplications = [
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
];
