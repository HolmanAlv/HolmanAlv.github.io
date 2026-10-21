// The Home hero: a lo-fi cube you can drag around. It renders at a fixed
// RES×RES pixels and the browser scales the canvas up with hard edges, while a
// 4×4 Bayer dither turns the lighting into two grays. Only reached through the
// dynamic import in Hero3D.astro, so Three.js loads in its own chunk.
import {
    BoxGeometry,
    Color,
    EdgesGeometry,
    Euler,
    Group,
    LineBasicMaterial,
    LineSegments,
    Mesh,
    PerspectiveCamera,
    Quaternion,
    Scene,
    ShaderMaterial,
    Vector2,
    Vector3,
    WebGLRenderer,
} from 'three';

const RES = 160; // canvas pixels per side: lower is chunkier
const START = new Euler(0.5, -0.7, 0); // starting pose, three faces in view. The poster image is this frame.
const SPIN = 0.3; // idle spin around the vertical axis, rad/s
const DRAG = 0.01; // rad per CSS pixel dragged
const FRICTION = 3; // how fast a fling slows down, 1/s
const BOIL = 0.15; // seconds between dither shifts, like the line boil of hand-drawn animation

const vertexShader = /* glsl */ `
    varying vec3 vNormal;

    void main() {
        vNormal = mat3(modelMatrix) * normal;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragmentShader = /* glsl */ `
    uniform vec3 paper;
    uniform vec3 ink;
    uniform vec3 light;
    uniform vec2 offset;
    varying vec3 vNormal;

    // 4×4 ordered-dither threshold, built from the 2×2 Bayer matrix.
    float bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
    float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }

    void main() {
        float tone = 0.2 + 0.8 * max(dot(normalize(vNormal), light), 0.0);
        vec3 color = tone > bayer4(gl_FragCoord.xy + offset) ? paper : ink;
        gl_FragColor = vec4(color, 1.0);
        #include <colorspace_fragment>
    }
`;

export function init(stage: HTMLElement) {
    const css = getComputedStyle(document.documentElement);
    const token = (name: string) => new Color(css.getPropertyValue(name).trim());

    const renderer = new WebGLRenderer({ alpha: true, antialias: false });
    renderer.setPixelRatio(1);
    renderer.setSize(RES, RES, false); // false: CSS sizes the canvas, not three
    const canvas = renderer.domElement;
    stage.append(canvas);

    const scene = new Scene();
    const camera = new PerspectiveCamera(30, 1, 0.1, 20);
    camera.position.z = 6;

    const uniforms = {
        paper: { value: token('--white') },
        ink: { value: token('--gray-900') },
        light: { value: new Vector3(-0.45, 0.75, 0.5).normalize() },
        offset: { value: new Vector2() },
    };
    const material = new ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
        // Push the faces back a little so the edge lines win the depth test.
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
    });
    const geometry = new BoxGeometry(1.6, 1.6, 1.6);
    const cube = new Group();
    cube.add(new Mesh(geometry, material), new LineSegments(new EdgesGeometry(geometry), new LineBasicMaterial({ color: uniforms.ink.value })));
    cube.quaternion.setFromEuler(START);
    scene.add(cube);

    // Pointer input only records movement; the render loop applies it once per frame.
    let dragging = false;
    let dragX = 0;
    let dragY = 0;
    let lastX = 0;
    let lastY = 0;
    canvas.addEventListener('pointerdown', (event) => {
        dragging = true;
        lastX = event.clientX;
        lastY = event.clientY;
        canvas.setPointerCapture(event.pointerId);
        stage.classList.add('is-dragging');
    });
    canvas.addEventListener('pointermove', (event) => {
        if (!dragging) return;
        dragX += event.clientX - lastX;
        dragY += event.clientY - lastY;
        lastX = event.clientX;
        lastY = event.clientY;
    });
    const release = () => {
        dragging = false;
        stage.classList.remove('is-dragging');
    };
    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('pointercancel', release);

    // Created once and reused every frame (no garbage, no GC stutter).
    const X = new Vector3(1, 0, 0);
    const Y = new Vector3(0, 1, 0);
    const turn = new Quaternion();
    const rotate = (axis: Vector3, angle: number) => cube.quaternion.premultiply(turn.setFromAxisAngle(axis, angle));

    let velocityX = 0;
    let velocityY = 0;
    let last = -1;
    let boil = 0;
    let ready = false;

    const frame = (time: number) => {
        // Seconds since the last frame, so speed is the same at 60 Hz and 144 Hz.
        // The first frame moves nothing, so it matches the poster.
        const dt = last < 0 ? 0 : Math.min((time - last) / 1000, 0.1);
        last = time;

        if (dragging) {
            rotate(X, dragY * DRAG);
            rotate(Y, dragX * DRAG);
            if (dt > 0) {
                velocityX = (dragY * DRAG) / dt;
                velocityY = (dragX * DRAG) / dt;
            }
            dragX = dragY = 0;
        } else {
            const decay = Math.exp(-FRICTION * dt);
            velocityX *= decay;
            velocityY *= decay;
            rotate(X, velocityX * dt);
            rotate(Y, (velocityY + SPIN) * dt);
        }

        boil += dt;
        if (boil > BOIL) {
            boil = 0;
            uniforms.offset.value.set(Math.floor(Math.random() * 4), Math.floor(Math.random() * 4));
        }

        renderer.render(scene, camera);
        if (!ready) {
            ready = true;
            stage.classList.add('is-ready'); // fades the canvas in over the poster
        }
    };

    // Render only while the hero is on screen. Hidden tabs pause on their own.
    new IntersectionObserver(([entry]) => renderer.setAnimationLoop(entry.isIntersecting ? frame : null)).observe(stage);
}

