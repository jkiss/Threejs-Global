/*
 * @Author: Nokey 
 * @Date: 2018-08-31 15:10:39 
 * @Last Modified by: Mr.B
 * @Last Modified time: 2018-08-31 15:31:54
 */
'use strict'

import classNames from 'classnames/bind'
import styles from './earth-css'
let _s = classNames.bind(styles)

// plugins
import * as THREE from 'three'
import Stats from 'stats'
import TWEEN from '@tweenjs/tween.js'

// res
import img_earth from './img/earth.jpg'
import img_weather from './img/weather.jpg'
import img_marker from './img/marker.png'

class Earth extends React.Component {
    constructor(props) {
        super(props)

        // this.state = {
        //     city: {
        //         lat: 0,
        //         lon: 0
        //     }
        // }
        
        // this.citys = [{
        //     city: 'Berea',
        //     country: 'South Africa',
        //     date: '2018-06-19',
        //     lat: -29.8505555,
        //     lon: 31.0019444,
        //     region: 'KwaZulu-Natal',
        //     value: 147.8660430908203
        // },{
        //     city:"Lagos",
        //     country:"Nigeria",
        //     date:"2018-01-09",
        //     lat:6.524379,
        //     lon:3.379206,
        //     region:"Lagos",
        //     value:555.056659
        // }]

        // this.earth_3d = new Earth3D

        this._w = window.innerWidth
        this._h = window.innerHeight

        this.CAMERA = null
        this.CAMERA_RADIUS = 500
        this.RADIUS = 200

        this.SCENE = new THREE.Scene()
        this.GROUP = new THREE.Group()
        this.LOADER = new THREE.TextureLoader()

        // this.LAT_LON = {lat: 0, lon: 0}
        this.INIT_LAT_LON = {lat: 6.527309, lon: 21.699449}
        this.CAMERA_TWEEN = new TWEEN.Tween(this.INIT_LAT_LON)
        
        this.weatherMesh
        this.marker = null
        this.light1 = null
        this.renderer = null
        this.container = null
        this.stats = null
        this.debug = false
        this.duration = 1500
    }

    init(){
        let _me = this

        // Camera
        let xyz = _me._xyzFromLatLng(_me.INIT_LAT_LON.lat, _me.INIT_LAT_LON.lon, _me.CAMERA_RADIUS)
        _me.CAMERA = new THREE.PerspectiveCamera(60, _me._w / _me._h, 1, 2000)
        _me.CAMERA.position.x = xyz.x
        _me.CAMERA.position.y = xyz.y
        _me.CAMERA.position.z = xyz.z
        _me.CAMERA.lookAt(_me.SCENE.position)
        
        // Scene
        // _me.SCENE.background = new THREE.Color(0x000000)
        _me.SCENE.add(_me.GROUP)

        /**
         * Light
         */
        _me.light1 = new THREE.DirectionalLight(0xffffff, 1)
        // _me.light1.position.set(0, 0, _me.CAMERA_RADIUS)
        _me.light1.position.x = xyz.x
        _me.light1.position.y = xyz.y
        _me.light1.position.z = xyz.z
        _me.SCENE.add(_me.light1)

        /**
         * Add Marker
         */
        _me.LOADER.load(img_marker, (texture)=>{

            texture.needsUpdate = true

            let material = new THREE.SpriteMaterial({
                map: texture,
                color: 0xffffff,
                fog: true
            })

            _me.marker = new THREE.Sprite(material)
            _me.marker.scale.set(20,20,1)

            // _me.marker.position.set(_me.citys_data[0].pos.x, _me.citys_data[0].pos.y, _me.citys_data[0].pos.z)
            // _me.marker.position.normalize()
            // _me.marker.position.multiplyScalar(RADIUS+1)

            _me.GROUP.add(_me.marker)

        })

        /**
         * Add Earth
         */
        _me.LOADER.load(img_earth, (texture)=>{
            var geometry = new THREE.SphereGeometry(_me.RADIUS, 64, 64);
            // var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );
            var material = new THREE.MeshPhongMaterial({ 
                map: texture, 
                specular: new THREE.Color(0,0,0),
                shininess: .25
            })

            _me.GROUP.add(new THREE.Mesh(geometry, material))

            console.log('Earth')
        } )

        /**
         * Add Weather
         */
        _me.LOADER.load(img_weather, (texture)=>{
            let 
                geometry = new THREE.SphereGeometry(201, 64, 64),
                material = new THREE.MeshBasicMaterial({
                    map: texture
                    ,transparent: true
                    ,opacity: .2
                    ,blending: THREE.AdditiveBlending
                })

            _me.weatherMesh = new THREE.Mesh(geometry, material)

            _me.GROUP.add(_me.weatherMesh)
        })

        /**
         * Render to dom
         */
        // renderer = new THREE.CanvasRenderer();
        _me.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false
        })
        _me.renderer.setPixelRatio(window.devicePixelRatio)
        _me.renderer.setSize(_me._w, _me._h)
        _me.renderer.setClearColor(0xffffff, 0)
        _me.container.appendChild(_me.renderer.domElement)

        // debug
        if(_me.debug){
            // FPS stats
            _me.stats = new Stats()
            _me.container.appendChild(_me.stats.dom)
        }

        // start aniamte loop
        _me._animate()

        return _me
    }

    update(point){
        let _me = this

        _me._updateMarker(point)

        _me._lookAtCamera(point)

        return _me
    }

    /*
     * internal function prefix with '_'
     */
    _animate(){
        let _me = this

        requestAnimationFrame(_me._animate.bind(this))

        _me._render()

        _me.debug && _me.stats.update()
        
        // Tween FPS
        TWEEN.update()
    }

    _render(){
        let _me = this

        if(!!_me.marker){
            // _me.CAMERA.lookAt( _me.SCENE.position );

            if(_me.marker.scale.x > 20){
                _me.marker.scale.x = 0.1
                _me.marker.scale.y = 0.1
            }else{
                _me.marker.scale.x += 0.5
                _me.marker.scale.y += 0.5
            }
            
            
        }

        if(!!_me.weatherMesh){
            _me.weatherMesh.rotation.y += 0.0004
        }

        _me.CAMERA.updateProjectionMatrix()
        
        _me.renderer.render(_me.SCENE, _me.CAMERA)

        // test
        _me.geometry.vertices.forEach((particle)=>{
            let dX, dY, dZ
            dX = Math.random() * 1 - .5
            dY = Math.random() * 1 - .5
            dZ = Math.random() * 1 - .5

            particle.add(new THREE.Vector3(dX, dY, dZ))
        })
        // _me.geometry.verticesNeedUpdate = true
    }

    _updateMarker(point){
        let _me = this,
            xyz = _me._xyzFromLatLng(point.lat, point.lon, _me.RADIUS)

        _me.marker.position.set(xyz.x, xyz.y, xyz.z)
        _me.marker.position.normalize()
        _me.marker.position.multiplyScalar(_me.RADIUS+1)
    }

    _lookAtCamera(point){
        let _me = this,
            target_pos = {lat: point.lat, lon: point.lon}

        _me.CAMERA_TWEEN
            .to(target_pos, _me.duration)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate((obj)=>{
                let xyz = _me._xyzFromLatLng(obj.lat, obj.lon, _me.CAMERA_RADIUS)

                _me.CAMERA.position.x = xyz.x
                _me.CAMERA.position.y = xyz.y
                _me.CAMERA.position.z = xyz.z
                _me.CAMERA.lookAt( _me.SCENE.position )

                _me.light1.position.x = xyz.x
                _me.light1.position.y = xyz.y
                _me.light1.position.z = xyz.z
            })
            .start()

    }

    _xyzFromLatLng(lat, lng, radius) {
        var phi = (90 - lat) * Math.PI / 180;
        var theta = (360 - lng) * Math.PI / 180;
        return {
            x: radius * Math.sin(phi) * Math.cos(theta),
            y: radius * Math.cos(phi),
            z: radius * Math.sin(phi) * Math.sin(theta)
        }
    }

    _DPR() {
        return window.devicePixelRatio < 1.5 ? window.devicePixelRatio : 1.5
    }

    _distanceBetweenTwoCoordinations(point1, point2) {
        var R = 6371e3;
        var φ1 = toRadians(point1.lat);
        var φ2 = toRadians(point2.lat);
        var Δφ = toRadians(point2.lat - point1.lat);
        var Δλ = toRadians(point2.lng - point1.lng);
        var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return d
    }

    componentDidMount() {
        let _me = this

        let material = new THREE.PointCloudMaterial({
            color: 0xffffcc
        })
        _me.geometry = new THREE.Geometry()
        let x, y, z
        for (let i = 0; i < 1000; i++) {
            x = (Math.random() * 800) - 400
            y = (Math.random() * 800) - 400
            z = (Math.random() * 800) - 400

            _me.geometry.vertices.push(new THREE.Vector3(x, y, z))
        }

        let pointCloud = new THREE.PointCloud(_me.geometry, material)
        
        _me.init({
            canvas_color: 0x000000,
            debug: true
        })

        _me.SCENE.add(pointCloud)
    }

    render() {
        return (
            <div ref={ele=>this.container=ele}></div>
        )
    }
}

export default Earth;