// PLACEHOLDER: milestones, dates and images are stand-ins. Newest first.
import type { ImageMetadata } from 'astro';
import studio from '../assets/images/home/timeline-studio.png';
import film from '../assets/images/home/timeline-film.png';

export interface Milestone {
    period: string;
    title: string;
    description: string;
    image?: { src: ImageMetadata; alt: string };
}

export const timeline: Milestone[] = [
    {
        period: '2025 — now',
        title: 'Unity developer at Studio Name',
        description: 'Gameplay systems and rendering optimization for web and mobile builds.',
        image: { src: studio, alt: 'Placeholder for a photo of the studio team at work.' },
    },
    {
        period: '2023 — 2025',
        title: 'Full-stack developer at Company Name',
        description: 'Web apps from the database to the interface, deployed on Linux servers.',
    },
    {
        period: '2022',
        title: 'First short film as sound designer',
        description: 'Foley, ambiences and the final mix for an animated short.',
        image: { src: film, alt: 'Placeholder for a still from the short film.' },
    },
    {
        period: '2019',
        title: 'Started systems engineering at University Name',
        description: 'Programming, Linux and the math behind computer graphics.',
    },
];
