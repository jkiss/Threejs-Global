/*
 * @Author: Nokey 
 * @Date: 2017-07-13 18:03:17 
 * @Last Modified by: Mr.B
 * @Last Modified time: 2018-06-08 18:24:12
 */
'use strict';

// Plugins

// Utils
import { TimelineLite } from 'gsap'
import Util from 'utils'

// Style
import 'roboto-thin.styl'
import 'style/reset.styl'
import classNames from 'classnames/bind'
import styles from './index-css'
let _s = classNames.bind(styles)

// Pages

class MyComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            // Loading
            loading: true
        }
        
        this.TL = null

        this._app = null
        this.fullpage_sections = null
    }

    componentDidMount() {
        console.log('%c' + 'CGTN', 'font-family: "courier new"; color:#000; font-size:24px; font-weight:bold; text-shadow:0 0 6px #22ff22;');

        let _me = this

        _me.TL = new TimelineLite()

        _me.TL
            .to('.home img', 0.5, {scale: 0.5, opacity: 0})
            .to('.home img', 0.5, {scale: 1, opacity: 1})

        /**
         * Config
         */
        _me._app = $('#app')
        _me.fullpage_sections = $('.fullpage-slide');

        /**
         * Register global eventlistener
         */
        $(window).on('GLOBAL-ACT', (e, action)=>{
            /**
             * Usage:
             * action:{
             *     type: 'TYPE',
             *     payload: {}
             * }
             */
            switch (action.type) {
                case 'SWIPE':
                    _me.setState({
                        swipe_show: action.payload.show,
                        swipe_color: action.payload.color
                    })
                    break;

                case 'START-PAGE1-ANIMATE':
                    _me.page1.initAni()
                    break;

                case 'LOADING':
                    _me.setState({
                        loading: action.payload.loading
                    })
                    break;

                case 'SET-ALLOW-SCROLL':
                    _me.setState({
                        swipe_show: action.payload.swipe_arrow_show
                    })
                    $.fn.fullpage.setAllowScrolling(action.payload.allow_scroll)
                    break;
            
                default:
                    console.warn('No implementation for this action!')
                    break;
            }
        })

        
    }
    
    render() {
        return (
            <section className={_s('home')}>
                
            </section>
        );
    }
}

ReactDOM.render(<MyComponent /> , document.getElementById('app'));