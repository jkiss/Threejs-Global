/*
 * @Author: Nokey 
 * @Date: 2017-07-13 18:03:17 
 * @Last Modified by: Mr.B
 * @Last Modified time: 2018-08-26 22:47:34
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
import Earth3D from 'com/Earth3D'

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

        this.earth_3d = new Earth3D
    }

    componentDidMount() {
        let _me = this
        
        _me.earth_3d.init({
            dom_id: 'nk_earth_3d',
            r_width: 800,
            r_height: 400,
            r_color: 0x183939,
            debug: true
        })

        console.log('%c' + 'CGTN', 'font-family: "courier new"; color:#000; font-size:24px; font-weight:bold; text-shadow:0 0 6px #22ff22;padding: 0 3px;')
    }

    handleCityClick(e){
        let _me = this,
            ele = $(e.target),
            no = ele.data('city'),
            city = _me.citys[no]

        // _me.lookAtCamera(city)
        _me.earth_3d.update(city)
        console.log(city)
    }
    
    render() {
        return (
            <section className={_s('home')}>
                <div id="container"></div>

                <button id="city1" className={_s('btn', 'city1')} data-city="0" onClick={this.handleCityClick.bind(this)}>City 1</button>
                <button id="city2" className={_s('btn', 'city2')} data-city="1" onClick={this.handleCityClick.bind(this)}>City 2</button>

                <div id="nk_earth_3d"></div>
            </section>
        );
    }
}

ReactDOM.render(<MyComponent /> , document.getElementById('app'));