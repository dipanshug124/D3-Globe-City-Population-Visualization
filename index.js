const svg = d3.select("svg").style("background-color", "black");
const path = svg.append("path").attr("stroke", "gray");
const citiesG = svg.append("g");
const projection = d3.geoOrthographic();
const initialScale = projection.scale();
const geoPath = d3.geoPath().projection(projection);
let moving = false;
const rValue = (d) => d.population;
const rScale = d3.scaleSqrt().range([0, 20]);

var commaFormat = d3.format(",");
var tip = d3
  .tip()
  .attr("class", "d3-tip")
  .offset([-10, 0])
  .html((d) => `${d.name}: ${commaFormat(d.population)}`);
svg.call(tip);

d3.queue()
  .defer(d3.json, "https://unpkg.com/world-atlas@1/world/110m.json")
  .defer(d3.json, "https://unpkg.com/world-atlas@1/world/50m.json")
  .defer(
    d3.csv,
    "https://gist.githubusercontent.com/dipanshug124/0132dbe5547583821dd3ac72fbaa8fd2/raw/983bbd1bd2854afd637b1d705a631a602804a19f/cities.csv"
  )
  .await((error, world110m, world50m, cities) => {
    const countries110m = topojson.feature(
      world110m,
      world110m.objects.countries
    );
    const countries50m = topojson.feature(world50m, world50m.objects.countries);

    cities.forEach((d) => {
      d.latitude = +d.latitude;
      d.longitude = +d.longitude;
      d.population = +d.population;
    });

    rScale.domain([0, d3.max(cities, rValue)]);

    cities.forEach((d) => {
      d.radius = rScale(rValue(d));
    });

    const render = () => {
      // Render low resolution boundaries when moving,
      // render high resolution boundaries when stopped.
      path.attr("d", geoPath(moving ? countries110m : countries50m));

      const point = {
        type: "Point",
        coordinates: [0, 0],
      };
      cities.forEach((d) => {
        point.coordinates[0] = d.longitude;
        point.coordinates[1] = d.latitude;
        d.projected = geoPath(point) ? projection(point.coordinates) : null;
      });

      const k = Math.sqrt(projection.scale() / 200);
      const circles = citiesG
        .selectAll("circle")
        .data(cities.filter((d) => d.projected));
      circles
        .enter()
        .append("circle")
        .merge(circles)
        .attr("cx", (d) => d.projected[0])
        .attr("cy", (d) => d.projected[1])
        .attr("fill", "red")
        .attr("fill-opacity", 0.3)
        .attr("r", (d) => d.radius * k)
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide);
      circles.exit().remove();
    };
    render();

    let rotate0, coords0;
    const coords = () =>
      projection.rotate(rotate0).invert([d3.event.x, d3.event.y]);

    svg
      .call(
        d3
          .drag()
          .on("start", () => {
            rotate0 = projection.rotate();
            coords0 = coords();
            moving = true;
          })
          .on("drag", () => {
            const coords1 = coords();
            projection.rotate([
              rotate0[0] + coords1[0] - coords0[0],
              rotate0[1] + coords1[1] - coords0[1],
            ]);
            render();
          })
          .on("end", () => {
            moving = false;
            render();
          })
          // Goal: let zoom handle pinch gestures (not working correctly).
          .filter(() => !(d3.event.touches && d3.event.touches.length === 2))
      )
      .call(
        d3
          .zoom()
          .on("zoom", () => {
            projection.scale(initialScale * d3.event.transform.k);
            render();
          })
          .on("start", () => {
            moving = true;
          })
          .on("end", () => {
            moving = false;
            render();
          })
      );
  });
