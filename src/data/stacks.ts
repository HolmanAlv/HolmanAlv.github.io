// PLACEHOLDER: confirm every tool, especially the Game Audio group.

export interface SkillGroup {
    category: string;
    items: string[];
}

export const stacks: Record<'dev' | 'gamedev' | 'art', SkillGroup[]> = {
    dev: [
        { category: 'Languages', items: ['TypeScript', 'Python', 'C#', 'SQL'] },
        { category: 'Frontend', items: ['Astro', 'React', 'Three.js', 'CSS architecture'] },
        { category: 'Backend', items: ['Node.js', 'FastAPI', 'REST and WebSockets'] },
        { category: 'Data', items: ['PostgreSQL', 'Redis', 'SQLite'] },
        { category: 'Linux and DevOps', items: ['Bash', 'Docker', 'GitHub Actions', 'Nginx'] },
        { category: 'Testing', items: ['Vitest', 'Playwright', 'Pytest'] },
    ],
    gamedev: [
        { category: 'Engine and scripting', items: ['Unity', 'C#', 'Gameplay systems and NPC AI', 'Editor scripting'] },
        { category: 'Rendering and optimization', items: ['URP and Shader Graph', 'HLSL', 'Profiler and Frame Debugger', 'Batching, LODs, occlusion'] },
        { category: 'Tools and pipeline', items: ['Blender', 'Custom editor tools', 'Git LFS', 'Addressables'] },
        { category: 'Game audio', items: ['FMOD', 'Unity Audio Mixer', 'Reaper'] },
    ],
    art: [
        { category: 'Editing', items: ['DaVinci Resolve', 'Premiere Pro', 'After Effects'] },
        { category: 'Sound design', items: ['Reaper', 'iZotope RX', 'Field recording and foley'] },
        { category: 'Animation', items: ['Blender', 'Toon Boom Harmony', 'Krita'] },
    ],
};
