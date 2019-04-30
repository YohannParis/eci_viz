// Missing Vendors Javascript (D3)
// Missing self-closing function

var svg = d3.select("#participation_interactive_div")
    .append("svg")
    .append("g")

svg.append("g")
    .attr("class", "slices");
svg.append("g")
    .attr("class", "labels");
svg.append("g")
    .attr("class", "lines");

var width = 960,
    height = 450,
    radius = Math.min(width, height) / 2;

var pie = d3.layout.pie()
    .sort(null)
    .value(function (d) {
        return d.value;
    });

var arc = d3.svg.arc()
    .outerRadius(radius * 0.8)
    .innerRadius(radius * 0.4);

var outerArc = d3.svg.arc()
    .innerRadius(radius * 0.9)
    .outerRadius(radius * 0.9);

svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var key = function (d) { return d.data.label; };

var color = d3.scale.ordinal()
    .domain(["Independents", "State Parties", "Bharatiya Janata Party", "Indian National Congress"])
    .range(["#BA55D3", "#e5e5e5", "#ff9933", "#87CEFA"]);

function changeData(year) {
    var labels = color.domain();
    var data = [
        {
            name: "Independents",
            values:
                [
                    { date: "1989", participants: "82" },
                    { date: "1991", participants: "154" },
                    { date: "1996", participants: "424" },
                    { date: "1999", participants: "78" },
                    { date: "2004", participants: "117" },
                    { date: "2009", participants: "207" },
                    { date: "2014", participants: "206" }
                ]
        },
        {
            name: "State Parties",
            values: [
                { date: "1989", participants: "3" },
                { date: "1991", participants: "22" },
                { date: "1996", participants: "22" },
                { date: "1999", participants: "55" },
                { date: "2004", participants: "66" },
                { date: "2009", participants: "27" },
                { date: "2014", participants: "56" }
            ]
        },
        {
            name: "Indian National Congress",
            values: [
                { date: "1989", participants: "56" },
                { date: "1991", participants: "47" },
                { date: "1996", participants: "49" },
                { date: "1999", participants: "51" },
                { date: "2004", participants: "45" },
                { date: "2009", participants: "43" },
                { date: "2014", participants: "60" }
            ]
        },
        {
            name: "Bharatiya Janata Party",
            values: [
                { date: "1989", participants: "10" },
                { date: "1991", participants: "28" },
                { date: "1996", participants: "27" },
                { date: "1999", participants: "25" },
                { date: "2004", participants: "30" },
                { date: "2009", participants: "44" },
                { date: "2014", participants: "38" }
            ]
        }
    ];

    var filterData = function (data, label) {
        for (var i = 0; i < data.length; i++) {
            if (data[i].name == label) {
                for (var j = 0; j < data[i].values.length; j++) {
                    if (data[i].values[j].date == year) {
                        return data[i].values[j].participants
                    }
                }
            }
        }
    }

    return labels.map(function (label) {
        return {
            label: label, value: filterData(data, label)
        }
    });
}

change(changeData("2014"));

d3.selectAll(("input[name='year']")).on("change", function () {
    change(changeData(this.value.toString()))
})

function change(data) {

    var div = d3.select("#participation_interactive_div").append("div").attr("class", "toolTip");

    var slice = svg.select(".slices").selectAll("path.slice")
        .data(pie(data), key);

    var sum = 0;
    for (var i = 0; i < data.length; i++) {
        sum = sum + parseInt(data[i].value)
    }

    slice.enter()
        .insert("path")
        .style("fill", function (d) { return color(d.data.label); })
        .attr("class", "slice");


    slice
        .transition().duration(1000)
        .attrTween("d", function (d) {
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function (t) {
                return arc(interpolate(t));
            };
        })

    slice
        .on("mousemove", function (d) {
            d3.select(this)
                .transition()
                .style("opacity", 0.5);
            div.style("left", d3.event.pageX + 10 + "px");
            div.style("top", d3.event.pageY - 25 + "px");
            div.style("display", "inline-block");
            div.html((d.data.label) + "<br>" + d.data.value + "<br>" + "<b>" + d3.format(".1f")((d.data.value / sum * 100)) + "%" + "</b>");
        });
    slice
        .on("mouseout", function (d) {
            d3.select(this)
                .transition()
                .duration(500)
                .ease('bounce')
                .style("opacity", 1);
            div.style("display", "none");
        });

    slice.exit()
        .remove();


    var text = svg.select(".labels").selectAll("text")
        .data(pie(data), key);

    text.enter()
        .append("text")
        .attr("dy", ".35em")
        .text(function (d) {
            return (d.data.label);
        });

    function midAngle(d) {
        return d.startAngle + (d.endAngle - d.startAngle) / 2;
    }

    text.transition().duration(1000)
        .attrTween("transform", function (d) {
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function (t) {
                var d2 = interpolate(t);
                var pos = outerArc.centroid(d2);
                pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
                return "translate(" + pos + ")";
            };
        })
        .styleTween("text-anchor", function (d) {
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function (t) {
                var d2 = interpolate(t);
                return midAngle(d2) < Math.PI ? "start" : "end";
            };
        });

    text.exit()
        .remove();

    var polyline = svg.select(".lines").selectAll("polyline")
        .data(pie(data), key);

    polyline.enter()
        .append("polyline");

    polyline.transition().duration(1000)
        .attrTween("points", function (d) {
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function (t) {
                var d2 = interpolate(t);
                var pos = outerArc.centroid(d2);
                pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                return [arc.centroid(d2), outerArc.centroid(d2), pos];
            };
        });

    polyline.exit()
        .remove();
};
