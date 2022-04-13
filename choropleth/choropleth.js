function main() {

    const canvasWidth = 960;
    const canvasHeight = 600;

    const svg = d3.select("#choropleth_map").append("svg")
        .attr("width", canvasWidth)
        .attr("height", canvasHeight)

    const container_g = svg.append("g")
        .attr("class", "key")
        .attr("transform", "translate(200,100)")


    const poverty = d3.map();
    const path = d3.geoPath();

    var x = d3.scaleLinear().domain([1, 10])
        .rangeRound([600, 860])

    var color = d3.scaleThreshold()
        .domain([10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
        .range(d3.schemeBlues[3])

    container_g.selectAll("rect")
        .data(color.range().map(d => {
            d = color.invertExtent(d);
            if (d[0] == null) d[0] = x.domain()[0];
            if (d[1] == null) d[1] = x.domain()[1];
            return d;
        }))

    var promises = [
        d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/counties-albers-10m.json"),
        d3.csv("../CSV/PovertyData.csv", function (d) { poverty.set(d.FIPStxt, +d.Percentage,d.State); })
    ]

    Promise.all(promises).then(ready)

    function ready([us]) {

        var toolTip = d3.select("#choropleth_map")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("position", "absolute")
            .style("font-family", "sans-serif")
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
                .style("opacity", 0.75)
        }

        var mousemove = function (d) {
            toolTip
                .html("County: " + d.properties.name + "<br>Cost Index: " + poverty.get(d.id))
                .style("left", (d3.mouse(this)[0] + 70) + "px")
                .style("top", (d3.mouse(this)[1]) + "px")

        }

        var mouseleave = function (d) {
            toolTip
                .style("opacity", 0)
            d3.select(this)
                .style("opacity", 1)
        }
        svg.append("g")
            .attr("class", "counties")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.counties).features)
            .enter().append("path")
            .attr("fill", function (d) { return color(poverty.get(d.id)); })
            .attr("d", path)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)


        svg.append("path")
            .datum(topojson.mesh(us, us.objects.states, function (a, b) {
                return a !== b;
            })).attr("class", "states")
            .attr("d", path)
    }
}
main();