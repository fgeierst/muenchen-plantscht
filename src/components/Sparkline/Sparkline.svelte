<script>
	import * as d3 from "d3";
	import { onMount } from "svelte";

	export let url;

	let wrapper;

	onMount(() => {
		console.log(wrapper);
		d3.json(url)
			.then((data) => {
				const sortedData = sort(data);
				draw(sortedData, wrapper);
			})
			.catch((error) => console.log(error));
	});

	const dimensions = {
		width: 200,
		height: 100,
		marginTop: 10,
		marginInline: 5,
	};

	const xAccessor = (d) => d.date;
	const yAccessor = (d) => d.water_temperature;

	const formatDate = d3.timeFormat("%Y-%m-%d %H:%M");

	const getText = (data, d) => {
		const date = xAccessor(d);
		return `${formatDate(date)}`;
	};

	function draw(data, element) {
		// console.log(data);
		const wrapper = d3.select(element);
		const svg = wrapper
			.select("[data-chart]")
			.append("svg")
			.attr("viewBox", `0 0 ${dimensions.width} ${dimensions.height}`);

		const xDomain = d3.extent(data, xAccessor);
		const xScale = d3
			.scaleTime()
			.domain(xDomain)
			.range([
				dimensions.marginInline,
				dimensions.width - dimensions.marginInline,
			]);

		const yDomain = [0, d3.max(data, yAccessor)];
		const yScale = d3
			.scaleLinear()
			.domain(yDomain)
			.range([dimensions.height, dimensions.marginTop]);

		// const areaGenerator = d3
		// 	.area()
		// 	.x((d) => xScale(xAccessor(d)))
		// 	.y1((d) => yScale(yAccessor(d)))
		// 	.y0(dimensions.height)
		// 	.curve(d3.curveBumpX);

		// const area = svg
		// 	.append("path")
		// 	.datum(data)
		// 	.attr("d", areaGenerator)
		// 	.attr("fill", "lavender");

		const lineGenerator = d3
			.line()
			.x((d) => xScale(xAccessor(d)))
			.y((d) => yScale(yAccessor(d)))
			.curve(d3.curveBumpX);

		const line = svg
			.append("path")
			.datum(data)
			.attr("d", lineGenerator)
			.attr("stroke", "black")
			.attr("stroke-width", 2)
			.attr("stroke-linejoin", "round")
			.attr("fill", "none");

		const markerLine = svg
			.append("line")
			.attr("x1", 0)
			.attr("x2", 0)
			.attr("y1", 0)
			.attr("y2", dimensions.height)
			.attr("stroke-width", 1)
			.attr("stroke", "black")
			.attr("opacity", 0);

		const markerDot = svg
			.append("circle")
			.attr("cx", 0)
			.attr("cy", 0)
			.attr("r", 5)
			.attr("fill", "black")
			.attr("opacity", 0);

		const bisect = d3.bisector(xAccessor);
		svg.on("mousemove", (e) => {
			const pointerCoords = d3.pointer(e);
			const [posX, posY] = pointerCoords;
			const date = xScale.invert(posX);
			const index = bisect.center(data, date);
			const d = data[index];
			const x = xScale(xAccessor(d));
			const y = yScale(yAccessor(d));
			markerLine.attr("x1", x).attr("x2", x).attr("opacity", 1);
			markerDot.attr("cx", x).attr("cy", y).attr("opacity", 1);

			wrapper.select("[data-date]").text(getText(data, d));
			wrapper.select("[data-temperature]").text(yAccessor(d));
		});

		svg.on("mouseleave", () => {
			const lastDatum = data[data.length - 1];

			markerLine.attr("opacity", 0);
			markerDot.attr("opacity", 0);

			wrapper.select("[data-date]").text(getText(data, lastDatum));
			wrapper.select("[data-temperature]").text(yAccessor(lastDatum));
		});
	}

	function sort(data) {
		return data
			.map((d) => {
				return {
					...d,
					date: new Date(d.date),
				};
			})
			.sort((a, b) => d3.ascending(a.date, b.date));
	}
</script>

<div class="wrapper" data-wrapper bind:this={wrapper}>
	<figure data-chart />
	<div class="legend">
		<span data-date /><span data-temperature />
	</div>
</div>

<style>
	.wrapper {
		width: 300px;
		max-width: 100%;
		aspect-ratio: 2/1;
	}

	figure {
		margin: 0;
	}

	figure :global(svg) {
		width: 100%;
		height: auto;
		/* border: 1px dashed; */
		display: block;
	}

	.legend {
		display: flex;
		justify-content: space-between;
	}
</style>
