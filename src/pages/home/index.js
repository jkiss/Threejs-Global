/*
 * @Author: Nokey 
 * @Date: 2017-07-13 18:03:17 
 * @Last Modified by: Mr.B
 * @Last Modified time: 2018-11-21 11:16:07
 */
'use strict';

// plugin
import * as PIXI from 'pixi.js'

// Utils
import { TimelineLite } from 'gsap'
import Util from 'utils'

// Style
import 'roboto-thin.styl'
import 'style/reset.styl'
import classNames from 'classnames/bind'
import styles from './index-css'
let _s = classNames.bind(styles)

// com
import Earth from './Earth'
import PixiVideo from './PixiVideo'
import BubbleMapChart from './BubbleMapChart'

class MyComponent extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            // Loading
            loading: true
        }

        
    }

    componentDidMount() {
        let _me = this

        console.log('%c' + 'CGTN', 'font-family: "courier new"; color:#000; font-size:24px; font-weight:bold; text-shadow:0 0 6px #22ff22;padding: 0 3px;')

        let type = 'WebGL'
        if(!PIXI.utils.isWebGLSupported()){
            type = 'canvas'
        }

        PIXI.utils.sayHello(type)
    }
    
    render() {
        return (
            <section className={_s('home')}>

            {/* Demo-2 canvas video */}
            {/* <PixiVideo
                video_w={800}
                video_h={450} /> */}

            {/* Demo-1 3D earth */}
            <Earth />

            {/* Demo 3 */}
            {/* <BubbleMapChart /> */}
                
            </section>
        );
    }
}

ReactDOM.render(<MyComponent /> , document.getElementById('app'));