/*
 * @Author: Nokey 
 * @Date: 2018-08-31 15:53:05 
 * @Last Modified by: Mr.B
 * @Last Modified time: 2018-08-31 17:46:17
 */
'use strict'; 

// res
import video_src from '../../media/body.mp4'

// style
import classNames from 'classnames/bind'
import styles from './pixi-video-css'
let _s = classNames.bind(styles)

// plugin
import * as PIXI from 'pixi.js'

class PixiVideo extends React.Component {
    constructor(props) {
        super(props)
        
        this.app = null
        this.loader = PIXI.loader
        this.assets = PIXI.loader.resources
    }
    
    componentDidMount() {
        let _me = this
        
        _me.app = new PIXI.Application({
            width: 800, 
            height: 450,
            antialias: true,
            transparent: true
        })

        _me.app.renderer.backgroundColor = 0x666666
        _me.app.renderer.autoResize = true

        _me.box.appendChild(_me.app.view)

        /**
         * create video
         */
        let _video = document.createElement('video')
        _video.src = video_src
        _video.autoplay = true
        _video.loop = true
        _video.width = 800
        _video.height = 450

        _me.box.appendChild(_video)

        let texture = PIXI.Texture.fromVideo(_video)
        let videoSprite = new PIXI.Sprite(texture)

        videoSprite.width = _me.app.screen.width
        videoSprite.height = _me.app.screen.height

        _me.app.stage.addChild(videoSprite)
        
    }
    
    render() {
        return (
            <div className={_s('Demo__pixi_video')} ref={_ele=>this.box = _ele}>
                
            </div>
        );
    }
}

export default PixiVideo;