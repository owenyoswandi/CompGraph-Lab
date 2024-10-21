import * as THREE from './ThreeJS/build/three.module.js';
import { OrbitControls } from './ThreeJS/examples/jsm/controls/OrbitControls.js';

let scene, camera, w, h, rndr, control, camera2, selectedCamera

const init = () => {
    scene = new THREE.Scene()

    w = window.innerWidth
    h = window.innerHeight

    camera = new THREE.PerspectiveCamera(75, w/h, 0.1, 10000)
    camera.position.set(640, 480, 240)
    camera.lookAt(640, 320, 0)

    camera2 = new THREE.PerspectiveCamera(90, w/h, 0.1, 10000)
    camera2.position.set(0, 0, 0)
    camera2.lookAt(640, 320, 0)

    selectedCamera = camera

    rndr = new THREE.WebGL1Renderer({antialias: true})
    rndr.setSize(w, h)
    document.body.appendChild(rndr.domElement)

    rndr.shadowMap.enabled = true 
    rndr.shadowMap.type = THREE.PCFShadowMap

    control = new OrbitControls(camera, rndr.domElement)

    let sun = createSun()
    sun.position.set(640, 320, 0)
    
    let point = createPointLight()
    point.position.set(640, 320, 0)
    point.castShadow = true

    let spot = createSpotlight()

    scene.add(sun, point)
}

const createPointLight = () =>{
    let lampu = new THREE.PointLight(0xffffff, 1, 1280)
    // let helpLampu = new THREE.PointLightHelper(lampu, 0xffffff)

    return lampu
}

const createSpotlight = () =>{
    let lampu = new THREE.SpotLight(0xffffff, 8, 8)

    return lampu
}

const createSun = () =>{
    let geo = new THREE.SphereGeometry(40, 64, 64)

    let textureLoad = new THREE.TextureLoader()
    let texture  = textureLoad.load(
        "./assets/textures/sun.jpg"
    )

    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping

    texture.repeat.set(1, 1)

    let mats = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: texture
    })
    return new THREE.Mesh(geo, mats)
}

const render = () => {
    requestAnimationFrame(render)
    rndr.render(scene, camera)
    control.update()
}

window.onresize = () => {
    w = window.innerWidth
    h = window.innerHeight

    camera.aspect = w/h
    rndr.setSize(w, h)
    camera.updateProjectionMatrix()
}

window.onload = () => {
    init()
    render()
}

window.addEventListener("keydown", (event=>{
    if(event.key.charCodeAt(0) == 32){
        if(selectedCamera == camera)
        {
            selectedCamera = camera2
            control.enabled = false
        }
        else if(selectedCamera == camera2)
        {
            selectedCamera = camera
            control.enabled = true
        }
    }
}))