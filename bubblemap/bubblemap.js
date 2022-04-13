function main() {
    const canvasWidth = 800;
    const canvasHeight = 600;

    var projection = d3.geoAlbersUsa()
        .translate([canvasWidth / 2, canvasHeight / 2])
        .scale([1000])
    var path = d3.geoPath().projection(projection);

    var svg = d3.select("#bubblemap").append("svg")
        .attr("width", canvasWidth)
        .attr("height", canvasHeight)

    d3.json("../csv/usa.json", function (json) {
        svg.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("fill", "grey")

        d3.csv("../CSV/expensive_states.csv", function (data) {

            var toolTip = d3.select("#bubblemap")
                .append("div")
                .style("opacity", 0)
                .attr("class", "tooltip")
                .style("background-color", "white")
                .style("position", "absolute")
                .style("font-family","sans-serif")
                .style("border", "solid")
                .style("border-width", "2px")
                .style("border-radius", "5px")
                .style("padding", "5px")

            var mouseover = function (d) {
                toolTip
                    .style("opacity", 1)
                d3.select(this)
                    .raise()
                    .classed("active", true)
                d3.select(this)
                    .style("stroke", "black")
                    .style("opacity", 0.75)
                d3.select(this)
                    .attr("r", radius(+d.costIndex) * 2)
            }

            var mousemove = function (d) {
                toolTip
                    .html("State: "+d.State+"<br>Cost Index: " + d.costIndex)
                    .style("left", (d3.mouse(this)[0] + 70) + "px")
                    .style("top", (d3.mouse(this)[1]) + "px")

            }

            var mouseleave = function (d) {
                toolTip
                    .style("opacity", 0)
                d3.select(this)
                    .style("opacity", 0.75)

                d3.select(this)
                    .raise()
                    .classed("active", false)

                d3.select(this)
                    .attr("r", radius(+d.costIndex))
            }

            var radius = d3.scaleLinear()
                .domain([80, 200])
                .range([5, 30]);

            data.forEach(function (d) {
                console.log(radius(+d.costIndex))
            });

            svg.selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", function (d) {
                    return (projection([+d.Longitude, +d.Latitude]))[0];
                })
                .attr("cy", function (d) {
                    return projection([+d.Longitude, +d.Latitude])[1];
                })
                .attr("r", function (d) {
                    return radius(+d.costIndex)
                })
                .style("fill", function (d) {
                    return +d.costRank <= 10 ? "crimson" : "steelblue"
                })
                .style("stroke", "black")
                .style("stroke-width", 2)
                .style("opacity", 0.75)
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave)
        });
        svg.append("text")
        .text("Cost Index for Each State")
        .attr("transform","translate(300,50)")
        .style("font-family","sans-serif")
        .attr("font-size","30px")

    });
}
main();