/*
 * @Author: Nokey 
 * @Date: 2018-11-21 11:04:26 
 * @Last Modified by: Mr.B
 * @Last Modified time: 2018-11-21 11:15:05
 */
'use strict'; 

import React, { Component } from 'react';
import * as d3 from 'd3'
import {queue} from 'd3-queue'
import UTIL from 'utils'

// styl
import classNames from 'classnames/bind'
import styles from './css'
let _s = classNames.bind(styles)

// res
// import geo_data from './data/countries_prepped.json'
// import data from './data/historical_data_plus.json'

import geo_data from './data/countries.json'
import data from './data/historical_data.json'
import positions from './data/positions.json'
import csv_link from './data/links.csv'

class BubbleMapChart extends Component {
    constructor(props) {
        super(props);
        
        this.year = '2016'
        this.width = 720
        this.height= 350
        this.margin = 0
        this.duration = 1500
        this.MIN_LABLED_WIDTH = 300

        // this.Q = queue()
        this.geo_data_key = _.keyBy(geo_data, 'iso')
        this.positions_key = _.keyBy(positions, 'iso')

        this.rScale = null
        this.format = d3.formatPrefix('$,.0', 1e6)

        this.countryForceXYStrength = {
            DDR: 2,
            FIN: 2,
            BRA: 2,
            IRL: 0.1,
            KOR: 1.5,
            JPN: 0.3
        }

        this.con_colors = {
            'North America': '#F25652',
            'South America': '#F28F99',
            'Africa': '#82B8BF',
            'Europe': '#62D9B7',
            'Asia': '#D9BB93',
            'Oceania': '#C2E7F2'
        }

        this.filter_data = []

        // this.s_fontW = 0
        // this.m_fontW = 0
    }
    
    componentDidMount() {
        let _me = this
            
        _me.setPremeters()
        
        
        let dataYear = data[_me.year],
            dataYear_index = _.keyBy(dataYear, 'iso')

        // compute radius scale
        _me.rScale = d3.scaleLinear()
            .domain(d3.extent(dataYear, d=>d.pow_gdp))
            .range([2, 50])
        console.log('Extent:', d3.extent(dataYear, d=>d.pow_gdp))

        geo_data.forEach((e)=>{
            let d = dataYear_index[e.iso],
                pos = _me.positions_key[e.iso]

            if(!!pos){
                e.x = pos['x'+'2016'+'a'] || 0
                e.y = pos['y'+'2016'+'a'] || 0
            }else{
                e.x = 0
                e.y = 0
            }
            
            // e.x = 0
            // e.y = 0

            if(!!d){
                _me.filter_data.push(_.extend({}, e, {radius: _me.radius(d), year: _me.year}, d))
            }
        })

        console.log('_me.filter_data', _me.filter_data)
        // console.log('geo_data', geo_data)

        // bind data
        _me.redraw(_me.filter_data)
        
        // force layout
        setTimeout(() => {
            console.info('layout...')
            _me.layout(_me.filter_data)
        
            _me.redraw(_me.filter_data)
        }, 2000);
        
    }

    forceLink(simulation){
        let links = []

        csv_link.forEach((e)=>{
            links.push({
                source: e.iso1,
                target: e.iso2,
                value: e.dist
            })
        })

        let f_link = d3.forceLink(links).id((d)=>{ 
            return d.iso 
        }).distance((d)=>{
            return d.value
        })

        simulation.force('link', f_link)
    }

    forceX(simulation){
        let _me = this,
            continents = {
                'North America': 1,
                'South America': 0.8,
                Europe: 0.8,
                Africa: 0.5
            },
            strength = (d)=>{
                return _me.countryForceXYStrength[d.iso] || continents[d.continent] || 0.7
            },
            x = (d)=>{
                return d.x
            }
        
        simulation.force('x', d3.forceX(x).strength(strength))
    }

    forceY(simulation){
        let _me = this,
            continents = {
                'South America': 0.4,
                Oceania: 1.5,
                Europe: 1,
                Africa: 0.8
            },
            strength = (d)=>{
                return _me.countryForceXYStrength[d.iso] || continents[d.continent] || 0.7
            },
            y = (d)=>{
                return d.y
            }

        simulation.force('y', d3.forceY(y).strength(strength))
    }

    layout(data){
        let _me = this,
            simulation = d3.forceSimulation(data).stop()

        // simulation
            // .force('charge', d3.forceManyBody().strength(0.5))
            // .force('x', d3.forceX().strength(0.002))
            // .force('y', d3.forceY().strength(0.002))
        _me.forceX(simulation)
        _me.forceY(simulation)
        simulation.force('collision', d3.forceCollide(function(d){
            return d.radius + _me.margin
        }))
        _me.forceLink(simulation)
            
        for (let i = 0; i < 300; i++) {
            simulation.tick()
        }

    }

    redraw(data){
        let _me = this

        if(!_me.circle_g_boxs){
            _me.circle_g_boxs = _me.g_box.selectAll('g')
                .data(data)
                .enter().append('g')
                .attr('transform', _me.translate)

            _me.circle_g_boxs
                .append('circle')
                .style('fill', (d)=>{
                    return _me.con_colors[d.continent]
                })
                .attr('r', _me.radius.bind(this))
    
            _me.circle_g_boxs
                .append('text')

            _me.g_box.selectAll('circle')
                .on('mouseover', function(d){
                    _me.showTooltip(this, d)
                })
                .on('mouseout', function(){
                    _me.hideTooltip()

                    _me.handleMouseOut(this)
                })
        }

        _me.circle_g_boxs
            .transition().duration(_me.duration)
            .ease(d3.easeCubicOut)
            .attr('transform', _me.translate)

        // add label
        _me.circle_g_boxs
            .selectAll('text')
            .html((d)=>{
                return _me.labelHtml(d)
            })
            
    }

    translate(d){
        return 'translate(' + d.x + ',' + d.y + ')'
    }

    setPremeters(){
        let _me = this

        _me.svg = d3.select('#nk_cartogram').style('overflow', 'visible')
        _me.g_box = _me.svg.append('g').attr('class', 'g_cartogram')
        _me.country_gs = null
        _me.tooltip = d3.select('body')
            .append('div')
            .attr('class', _s('tool-tip'))
            .attr('id', 'tool_tip')
            .html(`<h6 class=${_s('title')}>China</h6><p class=${_s('desc')}>GDP: 12121212</p>`)
            .on('click', ()=>{
                d3.event.stopPropagation()

                _me.hideTooltip()
            })
    }

    showTooltip(circle, d){
        let pos = UTIL.getBCR(circle)

        d3.select('#tool_tip')
            .style('display', 'block')
            .style('top', window.scrollY + pos.top + 'px')
            .style('left', pos.left + parseInt(d.radius) + 'px')

        d3.select('#tool_tip h6')
            .html(()=>{
                return d.name
            })

        d3.select('#tool_tip p')
            .html(()=>{
                return 'GDP: '+this.format(d.gdp)
            })

        d3.select(circle)
            .attr('class', _s('hover'))
    }

    hideTooltip(){
        console.log('hide')
        d3.select('#tool_tip')
            .style('display', 'none')
    }

    handleMouseOut(circle){
        d3.select(circle)
            .attr('class', '')
    }

    // data drive funcs
    radius(d){
        if(d.pow_gdp){
            return this.rScale(d.pow_gdp)
        }else{
            return 0
        }
    }

    labelHtml(d){
        let _me = this
        if(_me.width < _me.MIN_LABLED_WIDTH) return ''

        let html = '',
            name = d.name,
            lines = name.split(' '),
            _l = lines.length,
            y = 0,
            circle_w = d.radius * 2

        let font_size = _me.getFontSize(circle_w, lines)

        if(font_size < 8) return ''

        lines.forEach((e, i)=>{
            if(_l == 2){
                y = i==0 ? '-0.45' : '0.55'
            }else if(_l == 3){
                y = i == 0 && '-1' || i == 2 && '1' || '0'
            }

            html += '<tspan style="font-size:'+font_size+'px;" dy="0.3em" x="0" y="'+y+'em">'+e+'</tspan>'
        })

        return html
    }

    getFontSize(w, lines){
        let _me = this,
            max_len_line = '',
            max_line_width_10px = 0

        lines.forEach((e, i)=>{
            let _l = _me.estimateWidth10px(e)

            max_line_width_10px = _l > max_line_width_10px ? _l : max_line_width_10px
        })

        // let line_width_10px = _me.estimateWidth10px(line)

        return w / max_line_width_10px * 11.5
    }

    estimateWidth10px(str) {
        let chars = str.length,
            smalls = str.split(/[Itil ]/).length - 1,
            wides = str.split(/[A-Zmw]/).length - 1,
            widths = chars - smalls * 0.7 + wides * 0.8

        return widths * 7.38
    }

    render() {
        return (
            <section className={_s('box')}>
                
                <svg className={_s('svg')} id="nk_cartogram" width="720" height="350"></svg>
                <div>
                    <span>Bubble map</span>
                    <span>B</span>
                    <span>u</span>
                    <span>b</span>
                    <span>b</span>
                    <span>l</span>
                    <span>e</span>
                    <span> </span>
                    <span>m</span>
                    <span>a</span>
                    <span>p</span>
                    <span>t</span>
                    <span>Itil l</span>

                </div>
            </section>
        );
    }
}

export default BubbleMapChart;