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
import img_brush2 from './media/disp1.jpg'
import img_mask from './media/mask1.jpg'
import img_disp from './media/displace.png'
import img_level from './media/level-mask1'

// style
import classNames from 'classnames/bind'
import styles from './pixi-video-css'
let _s = classNames.bind(styles)

// plugin
import * as PIXI from 'pixi.js'
import 'pixi-projection'
import TWEEN from '@tweenjs/tween.js'

class PixiVideo extends React.Component {
    constructor(props) {
        super(props)
        
        this.app = null
        this.loader = PIXI.loader
        this.assets = PIXI.loader.resources
        this.camera = null
        this.c3d = null
        this.disp_brush = null
        this.disp_filter = null
        this.disp = {
            width: 400,
            height: 150,
            scale_x: 20,
            scale_y: 20
        }
        this.disp_scale_tween = new TWEEN.Tween({
            x: 0,
            y: 0
        })
        this.duration = 2000

        this.video_dom = {
            x: null,
            y: null,
            width: props.video_w,
            height: props.video_h
        }
    }
    
    componentDidMount() {
        let _me = this

        /**
         * set video dom positon relative to <body>
         */
        _me.setVideoDomXY(_me.box)
        console.log(_me.video_dom)

        /**
         * create video
         */
        let _video = document.createElement('video')
        _video.src = video_src
        _video.muted = true
        _video.autoplay = true
        _video.loop = true
        _video.width = _me.video_dom.width
        _video.height = _me.video_dom.height

        /**
         * Init pixi
         */
        _me.app = new PIXI.Application({
            width: _me.video_dom.width, 
            height: _me.video_dom.height,
            antialias: true,
            transparent: true
        })

        _me.app.renderer.backgroundColor = 0xffffff
        _me.app.renderer.autoResize = true
        _me.box.appendChild(_me.app.view)
        

        /**
         * 3D camera
         */
        _me.camera = new PIXI.projection.Camera3d()
        _me.camera.position.set(_me.app.screen.width / 2, _me.app.screen.height / 2)
        _me.camera.setPlanes(400, 10, 10000)
        // camera.euler.x = Math.PI / 20
        // camera.euler.y = Math.PI / 20
        _me.app.stage.addChild(_me.camera)

        /**
         * 3D container
         */
        _me.c3d = new PIXI.projection.Container3d()
        // c3d.position3d.y = -1 * _me.app.screen.height / 2
        // c3d.position3d.x = -1 * _me.app.screen.width / 2
        _me.c3d.pivot3d.x = _me.app.screen.width / 2
        _me.c3d.pivot3d.y = _me.app.screen.height / 2
        // MAKE CARDS LARGER:
        _me.c3d.scale3d.set(1.2)
        // console.log('c3d', _me.c3d)
        _me.camera.addChild(_me.c3d)

        // console.log(camera.euler)

        /**
         * Add video into canvas
         */
        let tex_video = PIXI.Texture.fromVideo(_video)
        let videoSprite = new PIXI.projection.Sprite3d(tex_video)
        // videoSprite.anchor = {x:0.5,y:0.5}
        // videoSprite.scale.set(1.2)
        videoSprite.width = _me.app.screen.width
        videoSprite.height = _me.app.screen.height
        // _me.app.stage.addChild(videoSprite)
        _me.c3d.addChild(videoSprite)
        

        /**
         * Add mask & brush
         */
        _me.loader.add('mask', img_mask)
        _me.loader.add('brush', img_level)

        _me.loader
            .on('progress', _me.handleProgress)
            .on('error', _me.handleError)
            .load(_me.loaded.bind(this))

        console.log($('#pixi_video').offset().left)
    }

    loaded(){
        let _me = this
        console.info('Res loaded...')
        /**
         * Add mask sprite
         */
        let mask = new PIXI.Sprite(_me.assets.mask.texture)
        mask.width = _me.app.screen.width + 50
        mask.height = _me.app.screen.height + 50
        mask.x = -25
        mask.y = -25
        // mask.anchor = {x:0.5,y:0.5}
        // mask.scale = {x:0.1, y:0.1}
        // mask.x = _me.app.screen.width / 2
        mask.blendMode = PIXI.BLEND_MODES.ADD
        // _me.app.stage.addChild(mask)
        _me.app.stage.addChild(mask)

        /**
         * Add brush sprite
         */
        _me.disp_brush = new PIXI.Sprite(_me.assets.brush.texture)
        // _me.disp_brush.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.CLAMP
        _me.disp_brush.x = 0
        _me.disp_brush.y = 100
        _me.disp_brush.width = _me.disp.width
        _me.disp_brush.height = _me.disp.height
        _me.disp_brush.anchor = {x: 0.5, y: 0.5}
        _me.app.stage.addChild(_me.disp_brush)
        console.log('bbbb', _me.disp_brush.anchor)

        // filter
        _me.disp_filter = new PIXI.filters.DisplacementFilter(_me.disp_brush)
        _me.disp_filter.autoFit = false
        _me.disp_filter.padding = 50
        // _me.disp_filter.scale.x = _me.disp.scale_x
        // _me.disp_filter.scale.y = _me.disp.scale_y
        _me.app.stage.filters = [_me.disp_filter]
        
        /**
         * Add tick event
         */
        _me.app.ticker.add(()=>{
            // videoSprite.euler += 0.1
            // camera.euler.x += 0.01
            // camera.euler.y += 0.01
            // _me.c3d.euler.y += 0.01
            // camera.updateTransform()

            // disp_brush.x += 1
            // disp_brush.y += 1
            // if(_me.disp_filter.scale.x > 0){
            //     _me.disp_filter.scale.x -= 1
            //     if(_me.disp_filter.scale.x <= 0) _me.disp_filter.scale.x = 50
            // }
            // if(_me.disp_filter.scale.y > 0){
            //     _me.disp_filter.scale.y -= 1
            //     if(_me.disp_filter.scale.y <= 0) _me.disp_filter.scale.y = 50
            // }
            
            TWEEN.update()
        })
    }

    handleProgress(loader){
        console.log(loader.progress)
    }

    handleError(){
        console.error('Load resource error')
    }

    handleMouse(e){
        // console.log(e.pageX, e.pageY)
        /**
         * 1: calculate mouse position relative to video dom
         */
        let _me = this,
            offsetX = e.pageX - _me.video_dom.x,
            offsetY = e.pageY - _me.video_dom.y

        // console.log(offsetX, offsetY)
        /**
         * 2: animate video & disp
         */
        _me.updateDispAni({offsetX, offsetY})

        _me.updateVideoAni({offsetX, offsetY})
    }

    updateDispAni(mouse_pos){
        let _me = this,
            target_x = mouse_pos.offsetX

        if(mouse_pos.offsetY > (_me.video_dom.height/2 + 150)){
            _me.disp_brush.y = _me.video_dom.height - 50
            _me.disp_brush.x = target_x
        
            new TWEEN.Tween({x: _me.disp.scale_x, y: _me.disp.scale_y})
                .to({x: 0,y: 0}, _me.duration)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate((obj)=>{
                    _me.disp_filter.scale.x = obj.x
                    _me.disp_filter.scale.y = obj.y
                })
                .start()
        }else if(mouse_pos.offsetY < (_me.video_dom.height/2 - 150)){
            _me.disp_brush.y = 100
            _me.disp_brush.x = target_x
        
            new TWEEN.Tween({x: _me.disp.scale_x, y: _me.disp.scale_y})
                .to({x: 0,y: 0}, _me.duration)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate((obj)=>{
                    _me.disp_filter.scale.x = obj.x
                    _me.disp_filter.scale.y = obj.y
                })
                .start()
        }
    }

    updateVideoAni(mouse_pos){
        let _me = this,
            half_w = _me.video_dom.width / 2,
            half_h = _me.video_dom.height / 2,
            flip_angle = 0.1,
            fraction_x = mouse_pos.offsetX / half_w - 1,
            fraction_y = mouse_pos.offsetY / half_h - 1
            
        _me.c3d.euler.y = -1 * fraction_x * flip_angle
        _me.c3d.euler.x = fraction_y * flip_angle

        console.log({fraction_x, fraction_y})
    }

    setVideoDomXY(dom){
        let _me = this

        _me.video_dom.x = $(dom).offset().left
        _me.video_dom.y = $(dom).offset().top
    }
    
    render() {
        return (
            <div
                id="pixi_video" 
                className={_s('Demo__pixi_video')} 
                ref={_ele=>this.box = _ele} 
                onMouseMove={this.handleMouse.bind(this)}
                >
                
            </div>
        );
    }
}

export default PixiVideo;