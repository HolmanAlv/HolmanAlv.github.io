// The three subpages. Each key equals its route name and the `discipline` value
// in the projects collection, so links can be built as `/${key}/#${id}`.
export const disciplines = {
    dev: { label: 'Developer' },
    gamedev: { label: 'GameDev' },
    art: { label: 'Artist' },
} as const;

export type Discipline = keyof typeof disciplines;
