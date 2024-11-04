// Load data and set up the chart
d3.json("data/data.json").then(data => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Define color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Create SVG container with zoom behavior
    const svg = d3.select("#graph")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(d3.zoom().on("zoom", (event) => {
            g.attr("transform", event.transform);
        }));

    const g = svg.append("g");

    // Calculate the degree of each node
    const nodeDegree = {};
    data.links.forEach(link => {
        nodeDegree[link.source] = (nodeDegree[link.source] || 0) + 1;
        nodeDegree[link.target] = (nodeDegree[link.target] || 0) + 1;
    });

    // Initialize force simulation
    const simulation = d3.forceSimulation(data.nodes)
        .force("link", d3.forceLink(data.links).id(d => d.id).distance(100))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2));

    // Render links
    const link = g.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(data.links)
        .enter().append("line")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", d => Math.sqrt(d.value));

    // Render nodes
    const node = g.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(data.nodes)
        .enter().append("circle")
        .attr("r", d => 5 + (nodeDegree[d.id] || 0) * 2) // Dynamic radius based on node degree
        .attr("fill", d => color(d.group))
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);

    // Append static text labels to each node
    const labels = g.append("g")
        .attr("class", "labels")
        .selectAll("text")
        .data(data.nodes)
        .enter().append("text")
        .attr("x", d => d.x)
        .attr("y", d => d.y - 20)
        .attr("class", "node-label")
        .style("fill", "#000") // Change text color to black
        .style("font-size", "12px")
        .style("text-anchor", "middle") // Center the text horizontally
        .text(d => d.id);

    // Tooltip for displaying node IDs
    const tooltip = d3.select("#graph")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("padding", "5px")
        .style("background", "rgba(0, 0, 0, 0.7)")
        .style("color", "#fff")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("opacity", 0);

    // Update positions on each simulation tick
    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        labels
            .attr("x", d => d.x)
            .attr("y", d => d.y - 20);
    });

    // Drag functions
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    // Tooltip event handlers
    function handleMouseOver(event, d) {
        tooltip
            .style("opacity", 1)
            .html(d.id)
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 20}px`);
    }

    function handleMouseOut() {
        tooltip.style("opacity", 0);
    }
});
