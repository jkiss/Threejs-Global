# Earth 3D

> 简单的3D地球插件，通过传入经纬度坐标，将地点旋转到中心地点，并标记出来

### Install

```javascript
// 安装依赖 ：'stats' 模块是通过 *alias* 配置引用 /vendor 下面的 js 文件
npm i

// 引用对象
import Earth3D from 'com/Earth3D'
```

### Usage

首先初始化对象：

```javascript
let earth_3d = new Earth3D
```

然后需要调用 `init()` 方法初始化内部方法，并给它传入配置参数

```javascript
let opt = {
    dom_id,    // String ：包裹的 DIV 的 id
    r_width,   // Int : 画布的宽度
    r_height,  // Int ：画布的高度
    // r_color,   // Hex Color: 0x183939 画布的背景色
    duration,  // Int : 动画时间
    debug,     // Boolean: 显示 FPS指示器，用于性能调试
}

earth_3d.init(opt)
```

更新地点需要调用 `update(point)` :

```javascript
let new_point = {
    lat, // Float : 纬度
    lon,  // Float : 经度
    ...
}

earth_3d.update(new_point)
```
