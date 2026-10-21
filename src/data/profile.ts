// PLACEHOLDER: the about texts and the social URLs (except GitHub) are stand-ins.

export interface Profile {
    name: string;
    roles: string;
    email: string;
    location: string;
    /** Rendered in this order in the footer. */
    socials: Record<'github' | 'itch' | 'linkedin' | 'youtube', { label: string; url: string }>;
    cv: { dev: string; gamedev: string; art: string };
    about: { home: string[]; art: string };
}

export const profile: Profile = {
    name: 'Holman Alvarado',
    roles: 'Software engineer, game developer, technical artist, animator and filmmaker.',
    email: 'alvholman@gmail.com',
    location: "I'm based in Colombia and available to travel to almost any country.",
    socials: {
        github: { label: 'GitHub', url: 'https://github.com/HolmanAlv' },
        itch: { label: 'itch.io', url: 'https://itch.io' },
        linkedin: { label: 'LinkedIn', url: 'https://www.linkedin.com' },
        youtube: { label: 'YouTube', url: 'https://www.youtube.com' },
    },
    cv: { dev: '/cv/dev.pdf', gamedev: '/cv/gamedev.pdf', art: '/cv/art.pdf' },
    about: {
        home: [
            'I write software, build games and make films. The three share more than they seem: a render loop, an edit timeline and a web request all come down to timing, and I like working where they meet.',
            'I started with Linux and code, moved into real-time graphics in Unity, and kept a camera and a microphone close the whole way. Today I take on engineering work, technical art and sound for games, and direction and sound design for film.',
        ],
        art: 'I direct, animate and design sound for short films, documentaries and promos. On a production I usually own the sound: recording foley, building the ambiences and mixing, and I step into direction or animation when a piece needs one more pair of hands that already knows the whole pipeline.',
    },
};
