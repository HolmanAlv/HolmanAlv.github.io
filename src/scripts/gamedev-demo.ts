// The GameDev hero animation. Only reached through the dynamic import in
// GameDevDemo.astro, so this file and GSAP load in their own chunk.
import { gsap } from 'gsap';

const TILE = 1600; // width of every repeating layer, in SVG units
const LOOP = 4; // seconds for the ground to scroll one tile
// The ground scrolls 400 units/s, so its rocks reach the runner (x = 520) at
// 1 s and 3 s of every loop. Moving a rock in the SVG means moving its jump here.
const JUMPS = [1, 3];
const HIP = '0 -54';
const SHOULDER = '6 -98';

export function start(root: HTMLElement) {
    const q = gsap.utils.selector(root);
    const tl = gsap.timeline();

    // Parallax: the farther the layer, the longer it takes to scroll one tile.
    const layers: [string, number][] = [
        ['far', 60],
        ['clouds', 90],
        ['birds', 40],
        ['mid', 24],
        ['near', 10],
        ['ground', LOOP],
    ];
    for (const [name, duration] of layers) {
        tl.to(q(`[data-layer="${name}"]`), { x: -TILE, duration, ease: 'none', repeat: -1 }, 0);
    }

    // Run cycle. The SVG is drawn mid-stride, so rotation 0 is the still frame.
    const stride = { duration: 0.18, ease: 'sine.inOut', repeat: -1, yoyo: true };
    tl.to(q('[data-limb="leg-near"]'), { rotation: 60, svgOrigin: HIP, ...stride }, 0)
        .to(q('[data-limb="leg-far"]'), { rotation: -60, svgOrigin: HIP, ...stride }, 0)
        .to(q('[data-limb="arm-near"]'), { rotation: -70, svgOrigin: SHOULDER, ...stride }, 0)
        .to(q('[data-limb="arm-far"]'), { rotation: 70, svgOrigin: SHOULDER, ...stride }, 0)
        .to(q('[data-body]'), { y: -5, duration: stride.duration / 2, ease: 'sine.inOut', repeat: -1, yoyo: true }, 0)
        .to(q('[data-tail]'), { rotation: 20, svgOrigin: '-10 -56', duration: 0.3, ease: 'sine.inOut', repeat: -1, yoyo: true }, 0)
        .to(q('[data-bird]'), { scaleY: -0.4, transformOrigin: '50% 50%', duration: 0.3, ease: 'sine.inOut', repeat: -1, yoyo: true, stagger: 0.1 }, 0);

    // Jumps, timed to the rocks. Padded to exactly one loop so it stays in sync with the ground.
    const runner = q('[data-runner]');
    const dust = q('[data-dust]');
    const jumps = gsap.timeline({ repeat: -1 });
    for (const at of JUMPS) {
        jumps
            .to(runner, { y: -120, rotation: -10, svgOrigin: '0 -60', duration: 0.4, ease: 'power2.out' }, at - 0.4)
            .to(runner, { y: 0, rotation: 0, duration: 0.4, ease: 'power2.in' }, at)
            // The dust puffs up and shrinks away instead of fading: a fade would turn the white gray.
            .fromTo(
                dust,
                { opacity: 1, scale: 0.4, x: 0, transformOrigin: '50% 100%' },
                { keyframes: [{ scale: 1.4, x: -20, duration: 0.2, ease: 'power1.out' }, { scale: 0, x: -40, duration: 0.3, ease: 'power1.in' }] },
                at + 0.4,
            );
    }
    jumps.set({}, {}, LOOP);
    tl.add(jumps, 0);

    return tl;
}
