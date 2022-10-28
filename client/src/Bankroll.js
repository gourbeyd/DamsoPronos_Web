import React, {useEffect } from "react";
import * as d3 from "d3";

export const Bankroll = (props) => {

    console.log(window.screen.width);

    var screenWidth = window.screen.width;
    if (screenWidth < 600){
        // set the dimensions and margins of the graph
        var margin = {top: (10/600)*screenWidth, right: (30/600)*screenWidth, bottom: (30/600)*screenWidth, left: (60/600)*screenWidth},
        width = screenWidth - margin.left - margin.right,
        height = (500/600)*screenWidth - margin.top - margin.bottom;
    }
    else{
        var margin = {top: 10, right: 30, bottom: 30, left: 60},
        width = 600 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
    }
    

    var data=JSON.parse(props.data);
    console.log(data);
    //fire only once, we initalize the svg object in it.
    useEffect(()=>{
        // append the svg object to the body of the page
        var svg = d3.select("#Bankroll")
            .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");
    }, [])
    useEffect(() => {
        var svg = d3.select("#Bankroll").select("svg").select("g");
        // Add X axis --> it is a date format
        var x = d3.scaleTime()
        .domain(d3.extent(data, function(d) { return d3.timeParse("%Y-%m-%d")(d.date) }))
        .range([ 0, width ]);

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // Add Y axis
        var y = d3.scaleLinear()
            .domain( [d3.min(data, function(d) { return d.value; }), d3.max(data, function(d) { return d.value; })])
            .range([ height, 0 ]);
        svg.append("g")
            .call(d3.axisLeft(y));

        

        // Add the line
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#69b3a2")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
            .x(function(d) { return x(d3.timeParse("%Y-%m-%d")(d.date)) })
            .y(function(d) { return y(d.value) })
            )
        // Add the points
        svg
        .append("g")
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function(d) { return x(d3.timeParse("%Y-%m-%d")(d.date)) } )
        .attr("cy", function(d) { return y(d.value) } )
        .attr("r", 5)
        .attr("fill", "#69b3a2")

        svg.selectAll(".domain")
            .attr("stroke", "#CCCDCE")
            svg.selectAll(".tick")
            .attr("stroke", "#CCCDCE")

    }, [data])
       
    return(
        <div id="Bankroll"> </div> 
    );
}