import * as THREE from './ThreeJS/build/three.module.js';
import { OrbitControls } from './ThreeJS/examples/jsm/controls/OrbitControls.js';

let scene, camera, w, h, rndr, cntrol

let init = () => {
    scene = new THREE.Scene()

    w = window.innerWidth
    h = window.innerHeight

    camera = new THREE.PerspectiveCamera(75, w/h, 0.1, 200)
    camera.position.set(2, 2, 2)
    camera.lookAt(0, 0, 0)

    rndr = new THREE.WebGL1Renderer({antialias: true})
    rndr.setSize(w, h)
    document.body.appendChild(rndr.domElement)

    cntrol = new OrbitControls(camera, rndr.domElement)
}

let render = () => {
    requestAnimationFrame(render)
    rndr.render(scene, camera)
    control.update()
}

window.onresize = () => {
    w = window.innerWidth
    h = window.innerHeight

    camera.aspect(w/h)
    rndr.setSize(w, h)
    camera.updateProjectionMatrix()
}

window.onload = () => {
    init()
    render()
}