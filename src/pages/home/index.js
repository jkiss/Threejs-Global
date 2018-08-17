/*
 * @Author: Nokey 
 * @Date: 2017-07-13 18:03:17 
 * @Last Modified by: Mr.B
 * @Last Modified time: 2018-06-08 18:24:12
 */
'use strict';

// Plugins
// import THREE from 'three'
// window.THREE = require('threer95')
// import 'CanvasRenderer'
import Stats from 'stats'
import TWEEN from '@tweenjs/tween.js'

// Utils
import { TimelineLite } from 'gsap'
import Util from 'utils'

// Style
import 'roboto-thin.styl'
import 'style/reset.styl'
import classNames from 'classnames/bind'
import styles from './index-css'
let _s = classNames.bind(styles)

// res
import img_earth from './img/earth6.jpg'
import img_weather from './img/weather.jpg'
import img_marker from './img/marker.png'

class MyComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            // Loading
            loading: true
        }

        this.citys = [{
                city: 'Berea',
                country: 'South Africa',
                date: '2018-06-19',
                lat: -29.8505555,
                lon: 31.0019444,
                region: 'KwaZulu-Natal',
                value: 147.8660430908203
            },{
                city:"Lagos",
                country:"Nigeria",
                date:"2018-01-09",
                lat:6.524379,
                lon:3.379206,
                region:"Lagos",
                value:555.056659
            }]

        this.citys_data = null

        this.CAMERA = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 2000 );
        this.CAMERA_RADIUS = 500

        this.SCENE = new THREE.Scene();

        this.LAT_LON = {lat: 0, lon: 0}
        this.CAMERA_TWEEN = new TWEEN.Tween(this.LAT_LON)
    }

    componentDidMount() {
        console.log('%c' + 'CGTN', 'font-family: "courier new"; color:#000; font-size:24px; font-weight:bold; text-shadow:0 0 6px #22ff22;padding: 0 3px;');

        let _me = this

        let container = document.getElementById( 'container' );

        _me.CAMERA.position.z = _me.CAMERA_RADIUS;
        
        _me.SCENE.background = new THREE.Color( 0x183939 );
        let group = new THREE.Group();
        // group.rotation.y -= 1.9;
        _me.SCENE.add( group );

        let stats;
        let renderer;
        let weatherMesh;
        let marker_sprite;
        let mouseX = 0, mouseY = 0;
        let windowHalfX = window.innerWidth / 2;
        let windowHalfY = window.innerHeight / 2;
        let RADIUS = 200
        let loader = new THREE.TextureLoader();

        let marker = [{
            city: 'Berea',
            country: 'South Africa',
            date: '2018-06-19',
            lat: -29.8505555,
            lon: 31.0019444,
            region: 'KwaZulu-Natal',
            value: 147.8660430908203
        },{
            city:"Lagos",
            country:"Nigeria",
            date:"2018-01-09",
            lat:6.524379,
            lon:3.379206,
            region:"Lagos",
            value:555.056659
        }]

        _me.citys_data = marker.map((point)=>{
            let pos = _me.xyzFromLatLng(point.lat, point.lon, RADIUS+10);
            
            return {
                pos: pos,
                lat: point.lat,
                lon: point.lon,
                value: point.value,
                city: point.city,
                region: point.region,
                country: point.country,
                distance: 0
            }
        })
        console.log('markerData', _me.citys_data[0].pos)

        // add marker
        let texture = loader.load(img_marker, (texture)=>{

            texture.needsUpdate = true;

            let material = new THREE.SpriteMaterial( { map: texture, color: 0xffffff, fog: true } )

            marker_sprite = new THREE.Sprite( material );

            marker_sprite.position.set(_me.citys_data[0].pos.x, _me.citys_data[0].pos.y, _me.citys_data[0].pos.z)

            marker_sprite.position.normalize()

            marker_sprite.position.multiplyScalar(RADIUS+1)

            marker_sprite.scale.set(20,20,1)

            group.add( marker_sprite )

        })

        init();
        animate();

        function init() {

            // earth
            loader.load( img_earth, (texture)=>{
                var geometry = new THREE.SphereGeometry( RADIUS, 64, 64 );
                var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );
                var mesh = new THREE.Mesh( geometry, material );
                group.add( mesh );

                console.log('GROUP', group.rotation)
            } );

            // weather
            loader.load(img_weather, (texture)=>{
                // texture.mapping = THREE.UVMapping;
                var geometry = new THREE.SphereGeometry(201, 64, 64);
                var material = new THREE.MeshBasicMaterial({
                    map: texture
                    ,transparent: true
                    ,opacity: .2
                    ,blending: THREE.AdditiveBlending
                });

                weatherMesh = new THREE.Mesh(geometry, material);
                // group.add(weatherMesh);
                _me.SCENE.add( weatherMesh );
            });

            // renderer = new THREE.CanvasRenderer();
            renderer = new THREE.WebGLRenderer({
                antialias: true
            });
            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.setSize( window.innerWidth, window.innerHeight );
            container.appendChild( renderer.domElement );


            stats = new Stats();
            container.appendChild( stats.dom );
        }

        function render() {
            
            if(!!marker_sprite){
                // _me.CAMERA.position.x += 1
                // _me.CAMERA.position.y += 1
                // _me.CAMERA.position.z += 1

                // _me.CAMERA.position.multiplyScalar(2)

                // console.log('cccc', _me.CAMERA.position)
                _me.CAMERA.lookAt( _me.SCENE.position );

                if(marker_sprite.scale.x > 20){
                    marker_sprite.scale.x = 0.1
                    marker_sprite.scale.y = 0.1
                }else{
                    marker_sprite.scale.x += 0.5
                    marker_sprite.scale.y += 0.5
                }
                

                _me.CAMERA.updateProjectionMatrix()
            }
            
            
            // group.rotation.y += 0.0005;
            if(!!weatherMesh){
                weatherMesh.rotation.y += 0.0004;
            }
            
            renderer.render( _me.SCENE, _me.CAMERA );
        }
        console.log('cccc', _me.CAMERA.position)

        function animate() {
            requestAnimationFrame( animate );
            render();

            stats.update();
            // Tween FPS
            TWEEN.update();
        }

    }

    cluster(points, distance) {
        points = points.slice(0);
        var clusters = [];
        for (var i = points.length - 1; i > -1; i--) {
            var p = points.splice(i, 1)[0];
            var cluster = [p];
            for (var j = i - 1; j > -1; j--) {
                var p1 = points[j];
                var isClose = true;
                for (var k = 0; k < cluster.length; k++) {
                    if (HELPERS.distanceBetweenTwoCoordinations({
                        lat: cluster[k].lat,
                        lng: cluster[k].lon
                    }, {
                        lat: p1.lat,
                        lng: p1.lon
                    }) > distance) {
                        isClose = false;
                        break
                    }
                }
                if (isClose) {
                    cluster.push(points.splice(j, 1)[0]);
                    i--
                }
            }
            clusters.push(cluster)
        }
        return clusters
    }

    distanceBetweenTwoCoordinations(point1, point2) {
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

    xyzFromLatLng(lat, lng, radius) {
        var phi = (90 - lat) * Math.PI / 180;
        var theta = (360 - lng) * Math.PI / 180;
        return {
            x: radius * Math.sin(phi) * Math.cos(theta),
            y: radius * Math.cos(phi),
            z: radius * Math.sin(phi) * Math.sin(theta)
        }
    }

    DPR() {
        return window.devicePixelRatio < 1.5 ? window.devicePixelRatio : 1.5
    }

    lookAtCamera(point){
        let _me = this,
            curr_pos = {},
            target_pos = {lat: point.lat, lon: point.lon}

        Object.assign(curr_pos, _me.CAMERA.position)

        console.log(point)

        // locate camera
        // let camera_pos = _me.xyzFromLatLng(point.lat, point.lon, CAMERA_RADIUS);
        // camera.position.x = camera_pos.x
        // camera.position.y = camera_pos.y
        // camera.position.z = camera_pos.z
        // camera.lookAt( scene.position )

        _me.CAMERA_TWEEN
            .to(target_pos, 2000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(function(obj){
                // console.log(obj)
                let xyz = _me.xyzFromLatLng(obj.lat, obj.lon, _me.CAMERA_RADIUS)

                _me.CAMERA.position.x = xyz.x
                _me.CAMERA.position.y = xyz.y
                _me.CAMERA.position.z = xyz.z
                _me.CAMERA.lookAt( _me.SCENE.position )
            })
            .start()

    }

    handleCityClick(e){
        let _me = this,
            ele = $(e.target),
            no = ele.data('city'),
            city = _me.citys_data[no]

        _me.lookAtCamera(city)
        // console.log(city)
    }
    
    render() {
        return (
            <section className={_s('home')}>
                <div id="container"></div>

                <button id="city1" className={_s('btn', 'city1')} data-city="0" onClick={this.handleCityClick.bind(this)}>City 1</button>
                <button id="city2" className={_s('btn', 'city2')} data-city="1" onClick={this.handleCityClick.bind(this)}>City 2</button>
            </section>
        );
    }
}

ReactDOM.render(<MyComponent /> , document.getElementById('app'));