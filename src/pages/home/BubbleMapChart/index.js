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

// styl
import classNames from 'classnames/bind'
import styles from './css'
let _s = classNames.bind(styles)

// res
import geo_data from './data/countries_prepped.json'
import data from './data/historical_data_plus.json'
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

        // this.Q = queue()
        this.geo_data_key = _.keyBy(geo_data, 'iso')
        this.positions_key = _.keyBy(positions, 'iso')

        this.rScale = d3.scaleLinear()
            .domain([0, 563])
            .range([4, 60])

        this.countryForceXYStrength = {
            DDR: 2,
            FIN: 2,
            BRA: 2,
            IRL: 0.1,
            KOR: 1.5,
            JPN: 0.3
        }
    }
    
    componentDidMount() {
        let _me = this
            
        _me.setPremeters()
        
        
        let data2016 = data[_me.year],
            data2016_index = _.keyBy(data2016, 'iso')

        geo_data.forEach((e)=>{
            let d = data2016_index[e.iso]

            e.x = _me.positions_key[e.iso]['x'+'2016'+'a'] || 0
            e.y = _me.positions_key[e.iso]['y'+'2016'+'a'] || 0
            // e.x = 0
            // e.y = 0

            if(!!d){
                _.extend(e, {radius: _me.radius(d), year: _me.year}, d)
            }else{
                _.extend(e, {radius: 0, year: _me.year}, d)
            }

            
        })
        // console.log(geo_data)

        // bind data
        _me.redraw(geo_data)
        
        // force layout
        // console.log(geo_data)
        setTimeout(() => {
            console.info('layout...')
            _me.layout(geo_data)
        
            _me.redraw(geo_data)
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
                .style('fill', '#f40')
                .attr('r', _me.radius.bind(this))
    
            _me.circle_g_boxs
                .append('text')
        }

        _me.circle_g_boxs
            .transition().duration(_me.duration)
            .ease(d3.easeCubicOut)
            .attr('transform', _me.translate)

    }

    translate(d){
        return 'translate(' + d.x + ',' + d.y + ')'
    }

    setPremeters(){
        this.svg = d3.select('#nk_cartogram').style('overflow', 'visible')
        this.g_box = this.svg.append('g').attr('class', 'g_cartogram')
        this.country_gs = null
    }

    // data drive funcs
    radius(d){
        if(d.athletes){
            return this.rScale(d.athletes)
        }else{
            return 0
        }
    }

    render() {
        return (
            <section>
                Bubble map
                <svg id="nk_cartogram" width="720" height="350"></svg>
            </section>
        );
    }
}

export default BubbleMapChart;