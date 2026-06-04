import { useCallback, useRef, useState } from "react";

const defaultNodeColor = "#8b5cf6";
const activeNodeColor = "#ec4899";
const visitedNodeColor = "#22c55e";
const queuedNodeColor = "#f97316";
const shortestPathColor = "#facc15";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const initialGraph = {
  A: [{ node: "B", weight: 4 }, { node: "C", weight: 2 }],
  B: [{ node: "D", weight: 3 }, { node: "E", weight: 5 }, { node: "C", weight: 6 }],
  C: [{ node: "F", weight: 7 }, { node: "E", weight: 2 }],
  D: [{ node: "E", weight: 2 }],
  E: [{ node: "F", weight: 1 }],
  F: [],
};

const heuristic = { A: 5, B: 4, C: 3, D: 3, E: 1, F: 0 };

const createInitialColors = () => 
  Object.keys(initialGraph).reduce((acc, node) => {
    acc[node] = defaultNodeColor;
    return acc;
  }, {});

export function useGraphVisualizer() {
  const [graph] = useState(initialGraph);
  const [nodeColors, setNodeColors] = useState(createInitialColors);
  const [nodeScores, setNodeScores] = useState({}); 
  const [activeEdge, setActiveEdge] = useState(null);
  const [traversalPath, setTraversalPath] = useState([]);
  const [shortestPath, setShortestPath] = useState([]);
  const [shortestPathEdges, setShortestPathEdges] = useState([]);
  const [distances, setDistances] = useState({});
  const [isTraversing, setIsTraversing] = useState(false);
  const [metrics, setMetrics] = useState({ visited: 0, timeElapsed: 0, result: "Idle" });

  const activeGraphToken = useRef(0);

  const resetAllPathData = () => {
    setTraversalPath([]);
    setShortestPath([]);
    setShortestPathEdges([]);
    setDistances({});
    setNodeScores({});
    setActiveEdge(null);
  };

  const resetGraph = useCallback(() => {
    activeGraphToken.current++;
    setIsTraversing(false);
    setNodeColors(createInitialColors());
    setMetrics({ visited: 0, timeElapsed: 0, result: "Idle" });
    resetAllPathData();
  }, []);

  const updateGraphState = (colors, visited, result, startTime, scores = {}) => {
    setNodeColors({ ...colors });
    setNodeScores(scores);
    setMetrics({
      visited,
      result,
      timeElapsed: Math.floor(performance.now() - startTime),
    });
  };

  const runBFS = async (startNode = "A", speed = 300, onLineExecute) => {
    if (isTraversing) return;
    setIsTraversing(true);
    resetAllPathData();
    
    const currentToken = ++activeGraphToken.current;
    const colors = createInitialColors();
    const visited = new Set();
    const queue = [startNode];
    let visitedCount = 0;
    const startTime = performance.now();

    onLineExecute?.(0);
    await sleep(speed * 0.35);
    colors[startNode] = queuedNodeColor;
    updateGraphState(colors, visitedCount, "Queued", startTime);
    await sleep(speed);

    while (queue.length > 0) {
      if (currentToken !== activeGraphToken.current) return;
      const currentNode = queue.shift();
      if (visited.has(currentNode)) continue;
      
      colors[currentNode] = activeNodeColor;
      updateGraphState(colors, visitedCount, `Visiting ${currentNode}`, startTime);
      await sleep(speed);
      
      visited.add(currentNode);
      visitedCount++;
      setTraversalPath((prev) => [...prev, currentNode]);
      colors[currentNode] = visitedNodeColor;
      updateGraphState(colors, visitedCount, `Visited ${currentNode}`, startTime);
      await sleep(speed);
      
      for (const edge of graph[currentNode]) {
        if (!visited.has(edge.node) && !queue.includes(edge.node)) {
          setActiveEdge([currentNode, edge.node]);
          queue.push(edge.node);
          colors[edge.node] = queuedNodeColor;
          updateGraphState(colors, visitedCount, `Queued ${edge.node}`, startTime);
          await sleep(speed);
        }
      }
      setActiveEdge(null);
    }
    if (currentToken === activeGraphToken.current) {
      updateGraphState(colors, visitedCount, "BFS Complete", startTime);
      setIsTraversing(false);
      onLineExecute?.(null);
    }
  };

  const runDFS = async (startNode = "A", speed = 300, onLineExecute) => {
    if (isTraversing) return;
    setIsTraversing(true);
    resetAllPathData();

    const currentToken = ++activeGraphToken.current;
    const colors = createInitialColors();
    const visited = new Set();
    let visitedCount = 0;
    const startTime = performance.now();

    const dfsHelper = async (node) => {
      if (currentToken !== activeGraphToken.current) return false;
      colors[node] = activeNodeColor;
      updateGraphState(colors, visitedCount, `Visiting ${node}`, startTime);
      await sleep(speed);
      visited.add(node);
      visitedCount++;
      setTraversalPath((prev) => [...prev, node]);
      colors[node] = visitedNodeColor;
      updateGraphState(colors, visitedCount, `Visited ${node}`, startTime);
      await sleep(speed);
      for (const edge of graph[node]) {
        if (!visited.has(edge.node)) {
          setActiveEdge([node, edge.node]);
          await sleep(speed * 0.5);
          if (!(await dfsHelper(edge.node))) return false;
          setActiveEdge(null);
          await sleep(speed * 0.25);
        }
      }
      return true;
    };
    await dfsHelper(startNode);
    if (currentToken === activeGraphToken.current) {
      updateGraphState(colors, visitedCount, "DFS Complete", startTime);
      setActiveEdge(null);
      setIsTraversing(false);
      onLineExecute?.(null);
    }
  };

  const runDijkstra = async (startNode = "A", targetNode = "F", speed = 300, onLineExecute) => {
    if (isTraversing) return;
    setIsTraversing(true);
    resetAllPathData();

    const currentToken = ++activeGraphToken.current;
    const colors = createInitialColors();
    const startTime = performance.now();
    
    onLineExecute?.(0);
    const distanceMap = {};
    const previous = {};
    const visited = new Set();
    Object.keys(graph).forEach((node) => { distanceMap[node] = Infinity; previous[node] = null; });
    distanceMap[startNode] = 0;
    
    onLineExecute?.(1);
    setDistances({ ...distanceMap });
    await sleep(speed);

    while (visited.size < Object.keys(graph).length) {
      if (currentToken !== activeGraphToken.current) return;
      
      onLineExecute?.(2);
      await sleep(speed);

      onLineExecute?.(3);
      const currentNode = Object.keys(graph)
        .filter((node) => !visited.has(node))
        .sort((a, b) => distanceMap[a] - distanceMap[b])[0];

      if (!currentNode || distanceMap[currentNode] === Infinity) break;
      
      colors[currentNode] = activeNodeColor;
      updateGraphState(colors, visited.size, `Checking ${currentNode}`, startTime);
      await sleep(speed);
      
      visited.add(currentNode);
      const visitedCount = visited.size;
      colors[currentNode] = visitedNodeColor;
      setTraversalPath((prev) => [...prev, currentNode]);
      updateGraphState(colors, visitedCount, `Visited ${currentNode}`, startTime);
      await sleep(speed);

      onLineExecute?.(4);
      for (const edge of graph[currentNode]) {
        if (visited.has(edge.node)) continue;
        setActiveEdge([currentNode, edge.node]);
        
        onLineExecute?.(5);
        const newDistance = distanceMap[currentNode] + edge.weight;
        if (newDistance < distanceMap[edge.node]) {
          distanceMap[edge.node] = newDistance;
          previous[edge.node] = currentNode;
          colors[edge.node] = queuedNodeColor;
          setDistances({ ...distanceMap });
          updateGraphState(colors, visitedCount, `Updated ${edge.node}: ${newDistance}`, startTime);
          await sleep(speed);
        }
      }
      setActiveEdge(null);
    }

    onLineExecute?.(6);
    const path = [];
    let current = targetNode;
    while (current) { path.unshift(current); current = previous[current]; }
    setShortestPath(path);
    
    const pathEdges = path.slice(0, -1).map((node, index) => [node, path[index + 1]]);
    setShortestPathEdges(pathEdges);
    setDistances({ [targetNode]: gScore[targetNode] });
    await sleep(speed);
    for (const node of path) {
      colors[node] = shortestPathColor;
      setNodeColors({ ...colors });
      await sleep(speed * 0.7);
    }
    
    updateGraphState(colors, visited.size, `Complete. Path: ${path.join(" → ")}`, startTime);
    setIsTraversing(false);
    onLineExecute?.(null);
  };

  const runAStar = async (startNode = "A", targetNode = "F", speed = 300, onLineExecute) => {
    if (isTraversing) return;
    setIsTraversing(true);
    resetAllPathData();

    const currentToken = ++activeGraphToken.current;
    const colors = createInitialColors();
    const startTime = performance.now();

    const gScore = {};
    const fScore = {};
    const scores = {}; 
    const previous = {};
    const openSet = [startNode];
    const closedSet = new Set();

    Object.keys(graph).forEach((node) => {
      gScore[node] = Infinity;
      fScore[node] = Infinity;
      previous[node] = null;
      scores[node] = { g: Infinity, h: heuristic[node], f: Infinity };
    });

    gScore[startNode] = 0;
    fScore[startNode] = heuristic[startNode];
    scores[startNode] = { g: 0, h: heuristic[startNode], f: heuristic[startNode] };

    colors[startNode] = queuedNodeColor;
    updateGraphState(colors, 0, "A* started", startTime, scores);
    await sleep(speed);

    while (openSet.length > 0) {
      if (currentToken !== activeGraphToken.current) return;

      openSet.sort((a, b) => fScore[a] - fScore[b]);
      const currentNode = openSet.shift();

      colors[currentNode] = activeNodeColor;
      updateGraphState(colors, closedSet.size, `Checking ${currentNode}`, startTime, scores);
      await sleep(speed);

      if (currentNode === targetNode) {
        setTraversalPath((prev) => [...prev, currentNode]);
        break;
      }

      closedSet.add(currentNode);
      setTraversalPath((prev) => [...prev, currentNode]);
      colors[currentNode] = visitedNodeColor;
      updateGraphState(colors, closedSet.size, `Visited ${currentNode}`, startTime, scores);
      await sleep(speed);

      for (const edge of graph[currentNode]) {
        if (closedSet.has(edge.node)) continue;

        setActiveEdge([currentNode, edge.node]);
        await sleep(speed * 0.5);

        const tentativeG = gScore[currentNode] + edge.weight;

        if (tentativeG < gScore[edge.node]) {
          previous[edge.node] = currentNode;
          gScore[edge.node] = tentativeG;
          fScore[edge.node] = tentativeG + heuristic[edge.node];
          scores[edge.node] = { g: tentativeG, h: heuristic[edge.node], f: fScore[edge.node] };

          if (!openSet.includes(edge.node)) openSet.push(edge.node);

          colors[edge.node] = queuedNodeColor;
          updateGraphState(colors, closedSet.size, `Updated ${edge.node}`, startTime, scores);
          await sleep(speed);
        }
        setActiveEdge(null);
      }
    }

    const path = [];
    let current = targetNode;
    while (current) { path.unshift(current); current = previous[current]; }
    
    setShortestPath(path);
    const pathEdges = path.slice(0, -1).map((node, index) => [node, path[index + 1]]);
    setShortestPathEdges(pathEdges);
setDistances({ [targetNode]: gScore[targetNode] });
    for (const node of path) {
      colors[node] = shortestPathColor;
      setNodeColors({ ...colors });
      await sleep(speed * 0.7);
    }

    updateGraphState(
      colors,
      closedSet.size,
      `A* Complete. Path: ${path.join(" → ")} | Cost: ${gScore[targetNode]}`,
      startTime,
      scores
    );
    setIsTraversing(false);
    onLineExecute?.(null);
  };

  return { 
    graph, nodeColors, nodeScores, activeEdge, traversalPath, shortestPath, 
    shortestPathEdges, distances, isTraversing, metrics, resetGraph, 
    runBFS, runDFS, runDijkstra, runAStar 
  };
}