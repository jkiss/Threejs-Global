/*
 * @Author: Nokey 
 * @Date: 2017-07-13 18:03:17 
 * @Last Modified by: Mr.B
 * @Last Modified time: 2018-06-08 18:24:12
 */
'use strict';

// Plugins
import * as THREE from 'three'
// import THREE from 'threer95'
// import 'CanvasRenderer'
import Stats from 'stats'

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
import img_earth from './img/y_earth.jpg'
import img_weather from './img/weather.jpg'
import img_marker from './img/marker.png'

class MyComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            // Loading
            loading: true
        }
    }

    componentDidMount() {
        console.log('%c' + 'CGTN', 'font-family: "courier new"; color:#000; font-size:24px; font-weight:bold; text-shadow:0 0 6px #22ff22;padding: 0 3px;');

        let _me = this

        let CAMERA_RADIUS = 500

        let container = document.getElementById( 'container' );
        let camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 2000 );
        camera.position.z = CAMERA_RADIUS;
        let scene = new THREE.Scene();
        scene.background = new THREE.Color( 0x183939 );
        let group = new THREE.Group();
        // group.rotation.y -= 1.9;
        scene.add( group );

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
        }]

        let markerData = marker.map((point)=>{
            // dist.push(point.distance);
            // var min = 20;
            // var max = 3e3;
            // var value = point.value;
            // value = value < min ? min : value;
            // value = value > max ? max : value;
            // var howmany = Math.round(_helpers.HELPERS.mapRange(value, min, max, 10, 30));
            let pos = _me.xyzFromLatLng(point.lat, point.lon, RADIUS+10);

            let camera_pos = _me.xyzFromLatLng(point.lat, point.lon, CAMERA_RADIUS);
            camera.position.x = camera_pos.x
            camera.position.y = camera_pos.y
            camera.position.z = camera_pos.z
            camera.lookAt( scene.position )
            
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
        console.log('markerData', markerData[0].pos)

        // add marker
        let VERTEX = "\nattribute float fade;\nattribute float nearCenter;\nattribute float start;\nattribute vec2 opacity;\n\nuniform float size;\nuniform float time;\n\nvarying float op;\n\nvoid main() {\n  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n\n  // Opacity\n  float elapsed = time - start;\n  op = opacity.x + fade * elapsed;\n  op = clamp(op, opacity.x, opacity.y);\n\n  // Hide the markers behind the earth\n  float zPos = dot(cameraPosition, cameraPosition) - mvPosition.z * mvPosition.z;\n  op *= smoothstep(0.25, 0.75, zPos);\n\n  float _size = size * nearCenter;\n\n  gl_PointSize = step(0., op) * _size * ( 300.0 / -mvPosition.z );\n  gl_Position = projectionMatrix * mvPosition;\n}\n";
        let FRAG = "\nuniform sampler2D texture;\n\nvarying float op;\n\nvoid main() {\n  vec4 c = texture2D(texture, gl_PointCoord);\n  gl_FragColor = vec4(c.xyz, c.a * op);\n}\n";

        let texture = loader.load(img_marker, (texture)=>{

            texture.needsUpdate = true;

            let material = new THREE.SpriteMaterial( { map: texture, color: 0xffffff, fog: true } )

            marker_sprite = new THREE.Sprite( material );

            marker_sprite.position.set(markerData[0].pos.x, markerData[0].pos.y, markerData[0].pos.z)
            console.log('POS 1', marker_sprite.position)
            // marker_sprite.position = markerData[0].pos
            marker_sprite.position.normalize()
            console.log('POS 2', marker_sprite.position)
            marker_sprite.position.multiplyScalar(RADIUS+1)
            console.log('POS 3', marker_sprite.position)
            marker_sprite.scale.set(20,20,1)

            group.add( marker_sprite )

            // ---2---
            // var geometry = new THREE.SphereGeometry( 3, 64, 64 );
            // var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );
            // var mesh = new THREE.Mesh( geometry, material );
            // mesh.position.set(markerData[0].pos.x + 10, markerData[0].pos.y + 10, markerData[0].pos.z + 10)
            // group.add( mesh );

            // ---3---
            // texture.flipY = false;
            // let MIN_SIZE = .27;
            // let uniforms = {
            //     texture: {
            //         value: texture
            //     },
            //     size: {
            //         value: MIN_SIZE * _me.DPR(),
            //         type: "f"
            //     },
            //     time: {
            //         value: 0,
            //         type: "f"
            //     }
            // }
            // let material = new THREE.ShaderMaterial({
            //     uniforms: uniforms,
            //     vertexShader: VERTEX,
            //     fragmentShader: FRAG,
            //     blending: THREE.NormalBlending,
            //     depthTest: false,
            //     transparent: true
            // });
            // let geometry = new THREE.BufferGeometry,
            //     count = 1

            // geometry.addAttribute("position", new THREE.BufferAttribute(new Float32Array([150,-100,-100]),3));
            // // geometry.addAttribute("opacity", new THREE.BufferAttribute(new Float32Array(count * 2),2).setDynamic(true));
            // // geometry.addAttribute("fade", new THREE.BufferAttribute(new Float32Array(count),1).setDynamic(true));
            // // geometry.addAttribute("start", new THREE.BufferAttribute(new Float32Array(count),1).setDynamic(true));
            // // geometry.addAttribute("nearCenter", new THREE.BufferAttribute(new Float32Array(count).fill(1),1).setDynamic(true));
            // let mesh = new THREE.Points(geometry, material);

            // group.add( mesh )
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
                scene.add( weatherMesh );
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
                // camera.position.x = marker_sprite.position.x;
                // camera.position.y = marker_sprite.position.y;
                // camera.position.z = marker_sprite.position.z;

                // camera.position.multiplyScalar(2)

                // console.log('cccc', camera.position)
                camera.lookAt( scene.position );

                if(marker_sprite.scale.x > 20){
                    marker_sprite.scale.x = 0.1
                    marker_sprite.scale.y = 0.1
                }else{
                    marker_sprite.scale.x += 1
                    marker_sprite.scale.y += 1
                }
                

                camera.updateProjectionMatrix()
            }
            
            
            group.rotation.y += 0.0005;
            if(!!weatherMesh){
                weatherMesh.rotation.y += 0.0004;
            }
            
            renderer.render( scene, camera );
        }
        console.log('cccc', camera.position)

        function animate() {
            requestAnimationFrame( animate );
            render();

            stats.update();
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
    
    render() {
        return (
            <section id="container" className={_s('home')}>

            </section>
        );
    }
}

ReactDOM.render(<MyComponent /> , document.getElementById('app'));