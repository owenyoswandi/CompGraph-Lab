import * as THREE from './ThreeJS/build/three.module.js';
import { OrbitControls } from './ThreeJS/examples/jsm/controls/OrbitControls.js';

let scene, camera, w, h, rndr, control, camera2, selectedcamera

const init = () => {
    scene = new THREE.Scene()

    w = window.innerWidth
    h = window.innerHeight

    camera = new THREE.PerspectiveCamera(75, w/h, 0.1, 10000)
    camera.position.set(640, 480, 240)
    camera.lookAt(0, 0, 0)

    camera2 = new THREE.PerspectiveCamera(90, w/h, 0.1, 10000)
    camera.position.set(0, 0, 0)

    selectedcamera = camera

    rndr = new THREE.WebGL1Renderer({antialias: true})
    rndr.setSize(w, h)
    document.body.appendChild(rndr.domElement)

    rndr.shadowMap.enabled = true 
    rndr.shadowMap.type = THREE.PCFShadowMap

    control = new OrbitControls(camera, rndr.domElement)

    let sun = createSun()
    sun.position.set(640, 320, 0) 

    scene.add(sun)
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
    let geo = new THREE.SphereGeometry(40)

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
    if(event.key.charAt(0)==32){
        if(selectedcamera==camera){
            selectedcamera = camera2
            control.enabled = false
        }else if(selectedcamera == camera2){
            selectedcamera = camera
            control.enabled = true
        }
    }
}))