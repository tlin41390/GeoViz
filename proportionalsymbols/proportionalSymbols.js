function main() {

    const canvasWidth = 960;
    const canvasHeight = 600;

    const svg = d3.select("#proportionalSymbols").append("svg")
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
        .domain([10,20,30,40,50,60,70,80,90,100])
        .range(d3.schemeBlues[3])

    container_g.selectAll("rect")
        .data(color.range().map(d => {
            d = color.invertExtent(d);
            if (d[0] == null) d[0] = x.domain()[0];
            if (d[1] == null) d[1] = x.domain()[1];
            console.log(d[1])
            return d;
        }))

    container_g.append("text")
        .attr('class', "caption")
        .attr("x", x.range()[0])
        .attr("y", -6)
        .attr("fill", "#000")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text("Poverty Rate")

    container_g.call(d3.axisBottom(x)
        .tickSize(10)
        .tickFormat(function (x, i) { return i ? x : x + "%" })
        .tickValues(color.domain()))
        .select(".domain")
        .remove();

    var promises = [
        d3.json("https://d3js.org/us-10m.v1.json"),
        // d3.csv("../CSV/PovertyData.csv", function (d) { poverty.set(d.FIPStxt, +d.Percentage);})
    ]

    Promise.all(promises).then(ready)

    function ready([us]) {
        svg.append("g")
            .attr("class", "counties")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.counties).features)
            .enter().append("path")
            .attr("fill", function (d) { return color(poverty.get(d.id)); })
            .attr("d", path)

        svg.append("path")
            .datum(topojson.mesh(us, us.objects.states, function (a, b) {
                return a !== b;
            })).attr("class", "states")
            .attr("d", path)
    }
}
main();