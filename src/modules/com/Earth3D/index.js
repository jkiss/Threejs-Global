/*
 * @Author: Mr.B 
 * @Date: 2018-08-26 19:09:17 
 * @Last Modified by: Mr.B
 * @Last Modified time: 2018-08-27 00:09:32
 */
'use strict';

// plugins
import Stats from 'stats'
import TWEEN from '@tweenjs/tween.js'

// res
import img_earth from './img/earth6.jpg'
import img_weather from './img/weather.jpg'
import img_marker from './img/marker.png'

import React, { Component } from 'react';

class Earth3D extends Component {
    constructor(props) {
        super(props);
        
        this.CAMERA = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 2000 );
        this.CAMERA_RADIUS = 500
        this.RADIUS = 200

        this.SCENE = new THREE.Scene()
        this.LOADER = new THREE.TextureLoader()

        this.LAT_LON = {lat: 0, lon: 0}
        this.INIT_LAT_LON = {lat: 6.527309, lon: 21.699449}
        this.CAMERA_TWEEN = new TWEEN.Tween(this.LAT_LON)

        this.light1 = null
        this.renderer = null
        this.container = null
        this.stats = null
    }

    componentDidMount() {
        let _me = this

        // debug
        if(this.props.debug){
            // FPS stats
            _me.stats = new Stats()
            _me.container.appendChild( stats.dom )
        }
    }

    init(){
        let _me = this

        // add marker
        _me.LOADER.load(img_marker, (texture)=>{

            texture.needsUpdate = true;

            let material = new THREE.SpriteMaterial( { map: texture, color: 0xffffff, fog: true } ), marker_sprite

            marker_sprite = new THREE.Sprite( material );

            marker_sprite.position.set(_me.citys_data[0].pos.x, _me.citys_data[0].pos.y, _me.citys_data[0].pos.z)

            marker_sprite.position.normalize()

            marker_sprite.position.multiplyScalar(RADIUS+1)

            marker_sprite.scale.set(20,20,1)

            group.add( marker_sprite )

        })

        // earth
        _me.LOADER.load( img_earth, (texture)=>{
            var geometry = new THREE.SphereGeometry( RADIUS, 64, 64 );
            // var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );
            var material = new THREE.MeshPhongMaterial( { 
                map: texture, 
                specular: new THREE.Color(0,0,0),
                shininess: .25
            } );
            var mesh = new THREE.Mesh( geometry, material );
            group.add( mesh );

            console.log('GROUP', group.rotation)
            // _me.SCENE.add(group)
        } );

        // weather
        _me.LOADER.load(img_weather, (texture)=>{
            let weatherMesh,
                geometry = new THREE.SphereGeometry(201, 64, 64),
                material = new THREE.MeshBasicMaterial({
                    map: texture
                    ,transparent: true
                    ,opacity: .2
                    ,blending: THREE.AdditiveBlending
                })

            weatherMesh = new THREE.Mesh(geometry, material);

            group.add(weatherMesh);
            // _me.SCENE.add( weatherMesh );
        })

        // renderer = new THREE.CanvasRenderer();
        _me.renderer = new THREE.WebGLRenderer({
            antialias: true
        })
        _me.renderer.setPixelRatio( window.devicePixelRatio )
        _me.renderer.setSize( this.props.r_width, this.props.r_height )
        _me.container.appendChild( _me.renderer.domElement )

    }

    animate(){

    }

    lookAtCamera(point){
        let _me = this,
            curr_pos = {},
            target_pos = {lat: point.lat, lon: point.lon}

        Object.assign(curr_pos, _me.CAMERA.position)

        _me.CAMERA_TWEEN
            .to(target_pos, 2000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate((obj)=>{
                let xyz = _me.xyzFromLatLng(obj.lat, obj.lon, _me.CAMERA_RADIUS)

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

    xyzFromLatLng(lat, lng, radius) {
        var phi = (90 - lat) * Math.PI / 180;
        var theta = (360 - lng) * Math.PI / 180;
        return {
            x: radius * Math.sin(phi) * Math.cos(theta),
            y: radius * Math.cos(phi),
            z: radius * Math.sin(phi) * Math.sin(theta)
        }
    }
    
    render() {
        return (
            <div>
                
            </div>
        );
    }
}

export default Earth3D;