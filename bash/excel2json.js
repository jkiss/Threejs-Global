/*
 * @Author: Mr.B 
 * @Date: 2018-02-24 00:21:02 
 * @Last Modified by: Mr.B
 * @Last Modified time: 2018-02-24 00:45:12
 */

'use strict';

let xlsx = require('node-xlsx'),
    fs = require('fs'),
    path = require('path'),
    xlsx_file = fs.readFileSync(`${__dirname}/GDP-ALL.xlsx`),
    _ = require('lodash'),
    nyt_json = require('./countries_prepped.json'),
    nyt_json_key = _.keyBy(nyt_json, 'iso')

let excel = xlsx.parse(xlsx_file),
    sheet = excel[0],
    title_row = sheet.data[0],
    data_row = sheet.data.slice(1),
    countries_data = [],
    historical_data = {}

data_row.forEach((row, i)=>{
    let iso = row[2]

    if(i < 218 && (iso.indexOf('del') < 0)){
        let geo = nyt_json_key[iso] || {lng2: 0, lat2: 0}

        if(!nyt_json_key[iso]){
            console.log('iso', i, iso)
        }
        
        // process country data
        countries_data.push({
            name: row[0],
            continent: row[1],
            iso: iso,
            x: geo.lng2,
            y: geo.lat2,
            lng: geo.lng2,
            lat: geo.lat2
        })

        row.forEach((e, j)=>{
            // if(i == 0){
            //     console.log(e, j)
            // }
            
            if(j >= 3){
                // process history data
                historical_data[title_row[j]] = historical_data[title_row[j]] || []

                historical_data[title_row[j]].push({
                    iso: iso,
                    gdp: parseInt(e),
                    pow_gdp: parseInt(Math.pow(e, 1/4))
                })
            }
        })
    }
});

// console.log(historical_data['1978'])

// write files
let countries_file = path.join(__dirname, 'data/countries.json')
let historical_file = path.join(__dirname, 'data/historical_data.json')

fs.open(countries_file, 'w+', (err, fd)=>{
    if(err){
        console.error('open', err)
    }else{
        fs.writeFile(countries_file, JSON.stringify(countries_data), (err)=>{
            if(err){
                console.error('write', err)
            }
        
            console.log('Create countries file done:', countries_file)
        })
    }
})

fs.open(countries_file, 'w+', (err, fd)=>{
    if(err){
        console.error('open', err)
    }else{
        fs.writeFile(historical_file, JSON.stringify(historical_data), (err)=>{
            if(err){
                console.error(err)
            }
    
            console.log('Create historical file done:', historical_file)
        })
    }
})
