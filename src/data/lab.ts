// PLACEHOLDER: experiments and images are stand-ins.
import type { ImageMetadata } from 'astro';
import dither from '../assets/images/gamedev/lab-dither.png';
import fog from '../assets/images/gamedev/lab-fog.png';
import rig from '../assets/images/gamedev/lab-rig.png';

export interface Experiment {
    label: string;
    title: string;
    description: string;
    image: ImageMetadata;
    imageAlt: string;
}

export const lab: Experiment[] = [
    {
        label: 'Post-processing',
        title: '1-bit dithering',
        description: 'A Bayer-matrix dither pass that turns any scene into two colors in real time.',
        image: dither,
        imageAlt: 'Placeholder for a dithered render of a scene.',
    },
    {
        label: 'VFX',
        title: 'Stylized fog',
        description: 'Light raymarched fog that reacts to the player light.',
        image: fog,
        imageAlt: 'Placeholder for a foggy forest scene.',
    },
    {
        label: 'Tooling',
        title: 'Rig validator',
        description: 'A Blender script that checks bone names and weights before export.',
        image: rig,
        imageAlt: 'Placeholder for a character rig in Blender.',
    },
];
