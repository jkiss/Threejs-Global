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
    xlsx_file = fs.readFileSync(`${__dirname}/GDP-ALL.xlsx`)

let excel = xlsx.parse(xlsx_file),
    sheet = excel[0],
    title_row = sheet.data[0],
    data_row = sheet.data.slice(1),
    countries_data = [],
    historical_data = {}

data_row.forEach((row, i)=>{
    // process country data
    countries_data.push({
        name: row[0],
        continent: row[1],
        iso: row[2]
    })

    row.forEach((e, j)=>{
        // if(i == 0){
        //     console.log(e, j)
        // }
        // let data_row = row.slice(3)

        // data_row.forEach((gdp, i)=>{
        //     gdp = gdp || 0
        //     historical_data[title_row[i+3]] = historical_data[title_row[i+3]] || []

        //     historical_data[title_row[i+3]].push({
        //         iso: row[2],
        //         gdp: parseInt(gdp)
        //     })
        // })
        if(j >= 3){
            // process history data
            historical_data[title_row[j]] = historical_data[title_row[j]] || []

            historical_data[title_row[j]].push({
                iso: row[2],
                gdp: parseInt(e),
                pow_gdp: parseInt(Math.pow(e, 1/4))
            })
        }
    })
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
