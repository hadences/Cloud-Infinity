import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import gsap from 'gsap'

/**
 * Texture Loader
 */
const textureLoader = new THREE.TextureLoader()
const matcapTexture1 = textureLoader.load('/textures/matcaps/1.png')
const matcapTexture2 = textureLoader.load('/textures/matcaps/2.png')

/**
 * Base
 */
// Debug
const gui = new GUI()
gui.hide()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/***
 * Infinity Particle Generator
 */
const params = {}
const anims = {}
params.count = 50000
params.size = 0.01
params.randomnessPower = 20
params.scale = 5
params.innerColor = '#00ccff'
params.outerColor = '#c800ff'

let geometry = null
let material = null
let points = null

const generateInfinity = () => {
    // dump
    if(points != null){
        geometry.dispose()
        material.dispose()
        scene.remove(points)
    }

    // particles
    geometry = new THREE.BufferGeometry()

    const positions = new Float32Array(params.count * 3)
    const colors = new Float32Array(params.count * 3)
    const deltaAngle = Math.PI * 2 / params.count

    const colorInside = new THREE.Color(params.innerColor)
    const colorOutside = new THREE.Color(params.outerColor)

    //populate positions
    for(let i = 0; i < params.count; i++){
        const i3 = i * 3

        const angle = deltaAngle * i

        // randomness
        const randomY = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
        const randomZ = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
        const randomX = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) 

        positions[i3] = params.scale * (Math.sqrt(2) * Math.cos(angle))/((Math.sin(angle) * Math.sin(angle)) + 1) + randomX
        positions[i3 + 1] = params.scale * (Math.sqrt(2) * Math.cos(angle) * Math.sin(angle)) / ((Math.sin(angle) * Math.sin(angle)) + 1) + randomY
        positions[i3 + 2] = params.scale * randomZ
        
        const distanceFromCenter = Math.sqrt(positions[i3] ** 2 + positions[i3 + 1] ** 2 + positions[i3 + 2] ** 2);
        const normalizedDistance = distanceFromCenter / params.scale;

        // Colors
        const mixedColor = colorInside.clone()
        mixedColor.lerp(colorOutside, normalizedDistance)
        colors[i3] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b

    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    material = new THREE.PointsMaterial({
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        size: params.size,
        depthTest: true,
        vertexColors: true,
        transparent: true,
        opacity: 1
    })

    points = new THREE.Points(geometry, material)
    scene.add(points)
}

generateInfinity()

// anims.idleAnimation = () => {
//     gsap.to(points.position, {
//         y: 180,
//         duration: 5,
//         ease: 'power1.inOut',
//         repeat: -1,
//         yoyo: true, 
//         onUpdate: () => {
//             generateInfinity()
//         }
//     });
// };

// anims.idleAnimation()



// debug params

const infinitySection = gui.addFolder('Infinity')
infinitySection.add(params, 'count').min(100).max(100000).step(1).onFinishChange(generateInfinity)
infinitySection.add(params, 'size').min(0.01).max(1).step(0.001).onFinishChange(generateInfinity)
infinitySection.add(params, 'randomnessPower').min(1).max(100).step(0.001).onFinishChange(generateInfinity)
infinitySection.add(params, 'scale').min(1).max(10).step(0.001).onFinishChange(generateInfinity)
infinitySection.addColor(params, 'innerColor').onFinishChange(generateInfinity)
infinitySection.addColor(params, 'outerColor').onFinishChange(generateInfinity)
infinitySection.add(anims, 'idleAnimation')

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 0
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update Camera
    const radius = 20
    let cameraPos = new THREE.Vector3(
        radius * Math.sin(elapsedTime * 0.25),
        0,
        radius * Math.cos(elapsedTime)
    )

    camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z)



    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()