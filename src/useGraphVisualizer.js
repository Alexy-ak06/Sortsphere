import { useCallback, useRef, useState } from "react";

const defaultNodeColor = "#8b5cf6";
const activeNodeColor = "#ec4899";
const visitedNodeColor = "#22c55e";
const queuedNodeColor = "#f97316";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const initialGraph = {
  A: ["B", "C"],
  B: ["D", "E"],
  C: ["F"],
  D: [],
  E: ["F"],
  F: [],
};

const createInitialColors = () => 
  Object.keys(initialGraph).reduce((acc, node) => {
    acc[node] = defaultNodeColor;
    return acc;
  }, {});

export function useGraphVisualizer() {
  const [graph] = useState(initialGraph);
  const [nodeColors, setNodeColors] = useState(createInitialColors);
  const [isTraversing, setIsTraversing] = useState(false);
  const [metrics, setMetrics] = useState({
    visited: 0,
    timeElapsed: 0,
    result: "Idle",
  });

  const activeGraphToken = useRef(0);

  const resetGraph = useCallback(() => {
    activeGraphToken.current++;
    setIsTraversing(false);
    setNodeColors(createInitialColors());
    setMetrics({
      visited: 0,
      timeElapsed: 0,
      result: "Idle",
    });
  }, []);

  const updateGraphState = (colors, visited, result, startTime) => {
    setNodeColors({ ...colors });
    setMetrics({
      visited,
      result,
      timeElapsed: Math.floor(performance.now() - startTime),
    });
  };

  const runBFS = async (startNode = "A", speed = 300, onLineExecute) => {
    if (isTraversing) return;

    setIsTraversing(true);

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

    onLineExecute?.(1);
    await sleep(speed * 0.35);

    while (queue.length > 0) {
      if (currentToken !== activeGraphToken.current) {
        setIsTraversing(false);
        onLineExecute?.(null);
        return;
      }

      onLineExecute?.(2);
      await sleep(speed * 0.35);

      const currentNode = queue.shift();

      onLineExecute?.(3);
      await sleep(speed * 0.35);

      if (visited.has(currentNode)) continue;

      colors[currentNode] = activeNodeColor;
      updateGraphState(colors, visitedCount, `Visiting ${currentNode}`, startTime);
      await sleep(speed);

      visited.add(currentNode);
      visitedCount++;

      colors[currentNode] = visitedNodeColor;
      updateGraphState(colors, visitedCount, `Visited ${currentNode}`, startTime);
      await sleep(speed);

      for (const neighbor of graph[currentNode]) {
        if (currentToken !== activeGraphToken.current) {
          setIsTraversing(false);
          onLineExecute?.(null);
          return;
        }

        onLineExecute?.(4);
        await sleep(speed * 0.35);

        if (!visited.has(neighbor) && !queue.includes(neighbor)) {
          onLineExecute?.(5);
          await sleep(speed * 0.35);

          queue.push(neighbor);
          colors[neighbor] = queuedNodeColor;

          updateGraphState(
            colors,
            visitedCount,
            `Queued ${neighbor}`,
            startTime
          );

          await sleep(speed);
        }
      }

      onLineExecute?.(2);
      await sleep(speed * 0.35);
    }

    if (currentToken === activeGraphToken.current) {
      updateGraphState(
        colors,
        visitedCount,
        "BFS Traversal Complete",
        startTime
      );

      setIsTraversing(false);
      await sleep(speed * 0.5);
      onLineExecute?.(null);
    }
  };

  const runDFS = async (startNode = "A", speed = 300, onLineExecute) => {
    if (isTraversing) return;
    setIsTraversing(true);

    const currentToken = ++activeGraphToken.current;
    const colors = createInitialColors();
    const visited = new Set();
    let visitedCount = 0;
    const startTime = performance.now();

    const dfsHelper = async (node) => {
      if (currentToken !== activeGraphToken.current) {
        setIsTraversing(false);
        onLineExecute?.(null);
        return false;
      }

      onLineExecute?.(0);
      await sleep(speed * 0.35);

      colors[node] = activeNodeColor;
      updateGraphState(colors, visitedCount, `Visiting ${node}`, startTime);
      await sleep(speed);

      onLineExecute?.(1);
      await sleep(speed * 0.35);

      visited.add(node);
      visitedCount++;
      colors[node] = visitedNodeColor;
      updateGraphState(colors, visitedCount, `Visited ${node}`, startTime);
      await sleep(speed);

      onLineExecute?.(2);
      await sleep(speed * 0.35);

      for (const neighbor of graph[node]) {
        if (currentToken !== activeGraphToken.current) {
          setIsTraversing(false);
          onLineExecute?.(null);
          return false;
        }

        onLineExecute?.(3);
        await sleep(speed * 0.35);

        if (!visited.has(neighbor)) {
          colors[neighbor] = queuedNodeColor;
          updateGraphState(colors, visitedCount, `Discovered ${neighbor}`, startTime);
          await sleep(speed);
          
          onLineExecute?.(4);
          await sleep(speed * 0.35);

          const continued = await dfsHelper(neighbor);
          if (!continued) return false;
        }
      }
      return true;
    };

    const completedSuccessfully = await dfsHelper(startNode);

    if (completedSuccessfully && currentToken === activeGraphToken.current) {
      updateGraphState(colors, visitedCount, "DFS Traversal Complete", startTime);
      setIsTraversing(false);
      await sleep(speed * 0.5);
      onLineExecute?.(null);
    }
  };

  return {
    graph,
    nodeColors,
    isTraversing,
    metrics,
    resetGraph,
    runBFS,
    runDFS,
  };
}