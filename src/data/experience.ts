// PLACEHOLDER: organizations, roles and dates are stand-ins.

export interface LogItem {
    org: string;
    role: string;
    period: string;
}

export const experience: LogItem[] = [
    { org: 'Studio Name', role: 'Unity developer', period: '2025 — now' },
    { org: 'Company Name', role: 'Full-stack developer', period: '2023 — 2025' },
    { org: 'Freelance', role: 'Web developer and sound designer', period: '2021 — 2023' },
];

export const education: LogItem[] = [
    { org: 'University Name', role: 'Systems engineering', period: '2019 — now' },
    { org: 'Online course', role: 'Course or certification', period: '2024' },
];
