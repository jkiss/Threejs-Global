/*
 * @Author: Nokey 
 * @Date: 2018-08-31 15:53:05 
 * @Last Modified by: Mr.B
 * @Last Modified time: 2018-08-31 17:46:17
 */
'use strict'; 

// res
import video_src from './media/body.mp4'
import img_brush0 from './media/brushlayer-0.jpg'
import img_brush1 from './media/brushlayer-1.jpg'
import img_mask from './media/mask1.jpg'

// style
import classNames from 'classnames/bind'
import styles from './pixi-video-css'
let _s = classNames.bind(styles)

// plugin
import * as PIXI from 'pixi.js'
import 'pixi-projection'

class PixiVideo extends React.Component {
    constructor(props) {
        super(props)
        
        this.app = null
        this.loader = PIXI.loader
        this.assets = PIXI.loader.resources
    }
    
    componentDidMount() {
        let _me = this

        /**
         * create video
         */
        let _video = document.createElement('video')
        _video.src = video_src
        _video.muted = true
        _video.autoplay = true
        _video.loop = true
        _video.width = 800
        _video.height = 450

        // _me.box.appendChild(_video)


        /**
         * Init pixi
         */
        _me.app = new PIXI.Application({
            width: 800, 
            height: 450,
            antialias: true,
            transparent: true
        })

        // _me.app.renderer.backgroundColor = 0x666666
        _me.app.renderer.autoResize = true
        _me.box.appendChild(_me.app.view)
        

        /**
         * 3D camera
         */
        let camera = new PIXI.projection.Camera3d()
        camera.position.set(_me.app.screen.width / 2, _me.app.screen.height / 2)
        camera.setPlanes(400, 10, 10000)
        // camera.euler.x = Math.PI / 20
        // camera.euler.y = Math.PI / 20
        _me.app.stage.addChild(camera)

        /**
         * 3D container
         */
        let c3d = new PIXI.projection.Container3d()
        // c3d.position3d.y = -1 * _me.app.screen.height / 2
        // c3d.position3d.x = -1 * _me.app.screen.width / 2
        c3d.pivot3d.x = _me.app.screen.width / 2
        c3d.pivot3d.y = _me.app.screen.height / 2
        // MAKE CARDS LARGER:
        // c3d.scale3d.set(1.5)
        console.log('c3d', c3d)
        camera.addChild(c3d)

        // console.log(camera.euler)

        /**
         * Add video into canvas
         */
        let tex_video = PIXI.Texture.fromVideo(_video)
        let videoSprite = new PIXI.projection.Sprite3d(tex_video)
        videoSprite.width = _me.app.screen.width
        videoSprite.height = _me.app.screen.height
        // _me.app.stage.addChild(videoSprite)
        c3d.addChild(videoSprite)
        

        /**
         * Add mask
         */
        _me.loader.add('mask', img_mask)
        _me.loader.add('brush', img_brush0)

        _me.loader
            .on('progress', _me.handleProgress)
            .on('error', _me.handleError)
            .load(_me.loaded.bind(this))

        // let tex_mask = PIXI.Texture.fromImage(img_mask)
    }

    loaded(){
        let _me = this
        console.info('Res loaded...')
        /**
         * Add mask sprite
         */
        let mask = new PIXI.Sprite(_me.assets.mask.texture)
        mask.width = _me.app.screen.width
        mask.height = _me.app.screen.height
        // mask.x = _me.app.screen.width / 2
        mask.blendMode = PIXI.BLEND_MODES.ADD
        _me.app.stage.addChild(mask)


        /**
         * Add brush sprite
         */
        let disp_brush = new PIXI.Sprite(_me.assets.brush.texture)
        disp_brush.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT
        disp_brush.width = 200
        disp_brush.height = 200
        _me.app.stage.addChild(disp_brush)

        let disp_filter = new PIXI.filters.DisplacementFilter(disp_brush)
        // disp_filter.padding = 10
        disp_filter.autoFit = false
        disp_filter.scale.x = 20
        disp_filter.scale.y = 20
        _me.app.stage.filters = [disp_filter]
        _me.app.stage.filterArea = new PIXI.Rectangle(0,0,200,200)
        console.log(_me.app.stage.filterArea)
        
        /**
         * Add tick event
         */
        _me.app.ticker.add(()=>{
            // videoSprite.euler += 0.1
            // camera.euler.x += 0.01
            // camera.euler.y += 0.01
            // c3d.euler.y += 0.01
            // camera.updateTransform()
        })
    }

    handleProgress(loader){
        console.log(loader.progress)
    }

    handleError(){
        console.error('Load resource error')
    }
    
    render() {
        return (
            <div className={_s('Demo__pixi_video')} ref={_ele=>this.box = _ele}>
                
            </div>
        );
    }
}

export default PixiVideo;