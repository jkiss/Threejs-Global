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

// com
import Earth3D from 'com/Earth3D'

class Earth extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            city: {
                lat: 0,
                lon: 0
            }
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
    }

    componentDidUpdate(prevProps, prevState) {

        this.earth_3d.update(this.state.city)
    }
    
    handleCityClick(e){
        let _me = this,
            ele = $(e.target),
            no = ele.data('city'),
            city = _me.citys[no]

        // _me.lookAtCamera(city)
        _me.setState({
            city: {
                lat: city.lat,
                lon: city.lon
            }
        })
        // _me.earth_3d.update(city)
        console.log(city)
    }

    render() {
        return (
            <div className={_s('Demo__earth_3d')}>
                <h1 className={_s('h1')}>3D Earth</h1>

                <div id="nk_earth_3d"></div>

                <button id="city1" className={_s('btn', 'city1')} data-city="0" onClick={this.handleCityClick.bind(this)}>City 1</button>
                <button id="city2" className={_s('btn', 'city2')} data-city="1" onClick={this.handleCityClick.bind(this)}>City 2</button>
            </div>
        )
    }
}

export default Earth;