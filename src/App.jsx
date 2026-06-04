import ArenaView from "./ArenaView";
import React, { useEffect, useMemo, useState } from "react";
import { useSortVisualizer } from "./useSortVisualizer";
import { useSearchVisualizer } from "./useSearchVisualizer";
import { useGraphVisualizer } from "./useGraphVisualizer";
import ComparisonView from "./ComparisonView";

export default function App() {
  const [mode, setMode] = useState("Sorting");
  const [arraySize, setArraySize] = useState(35);
  const [speed, setSpeed] = useState(30);
  const [selectedSortAlgorithm, setSelectedSortAlgorithm] = useState("Bubble Sort");
  const [selectedSearchAlgorithm, setSelectedSearchAlgorithm] = useState("Linear Search");
  const [selectedGraphAlgorithm, setSelectedGraphAlgorithm] = useState("BFS");
  const [targetValue, setTargetValue] = useState(120);
  const [currentExecutingLine, setCurrentExecutingLine] = useState(null);
  const [distributionType, setDistributionType] = useState("Random");

  const sortVisualizer = useSortVisualizer(arraySize);
  const searchVisualizer = useSearchVisualizer(arraySize);
  const graphVisualizer = useGraphVisualizer();

  const isSortingMode = mode === "Sorting";
  const isSearchingMode = mode === "Searching";
  const isGraphMode = mode === "Graphs";
  const isCompareMode = mode === "Compare";
  const isArenaMode = mode === "Arena";

  const sortingRegistry = useMemo(
    () => ({
      "Bubble Sort": { action: sortVisualizer.runBubbleSort, best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)", stable: "Yes", pseudocode: ["do", "   swapped = false", "   for i = 1 to indexOfLastUnsortedElement-1", "     if leftElement > rightElement", "       swap(leftElement, rightElement)", "       swapped = true", "while swapped"] },
      "Selection Sort": { action: sortVisualizer.runSelectionSort, best: "O(n²)", average: "O(n²)", worst: "O(n²)", space: "O(1)", stable: "No", pseudocode: ["repeat (numOfElements - 1) times", "  set the first unsorted element as the minimum", "  for each of the unsorted elements", "    if element < currentMinimum", "      set this element as the new minimum", "  swap minimum with first unsorted position"] },
      "Insertion Sort": { action: sortVisualizer.runInsertionSort, best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)", stable: "Yes", pseudocode: ["mark first element as sorted", "for each unsorted element X", "  'extract' the element X", "  for j = lastSortedIndex down to 0", "    if sortedElement > X", "      move sorted element to the right", "  insert X into correct position"] },
      "Merge Sort": { action: sortVisualizer.runMergeSort, best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)", space: "O(n)", stable: "Yes", pseudocode: ["split the unsorted list into n sublists", "repeatedly merge sublists to produce new sorted sublists", "if leftLength == 0 return rightList", "if rightLength == 0 return list", "if left[0] <= right[0]", "  append left[0] to mergedList", "else append right[0] to mergedList"] },
      "Quick Sort": { action: sortVisualizer.runQuickSort, best: "O(n log n)", average: "O(n log n)", worst: "O(n²)", space: "O(log n)", stable: "No", pseudocode: ["if low < high", "  pivotIndex = partition(array, low, high)", "  quickSort(array, low, pivotIndex - 1)", "  quickSort(array, pivotIndex + 1, high)", "// partition logic:", "choose array[high] as pivot element", "traverse array and swap elements smaller than pivot"] },
    }),
    [sortVisualizer.runBubbleSort, sortVisualizer.runSelectionSort, sortVisualizer.runInsertionSort, sortVisualizer.runMergeSort, sortVisualizer.runQuickSort]
  );

  const searchingRegistry = useMemo(
    () => ({
      "Linear Search": { action: searchVisualizer.runLinearSearch, best: "O(1)", average: "O(n)", worst: "O(n)", space: "O(1)", requirement: "Unsorted array", pseudocode: ["for each item in the list", "  if item == targetValue", "    return item's index", "return -1 (Not Found)"] },
      "Binary Search": { action: searchVisualizer.runBinarySearch, best: "O(1)", average: "O(log n)", worst: "O(log n)", space: "O(1)", requirement: "Sorted array", pseudocode: ["while low <= high", "  mid = low + (high - low) / 2", "  if array[mid] == targetValue return mid", "  if array[mid] < targetValue", "    low = mid + 1", "  else high = mid - 1", "return -1 (Not Found)"] },
    }),
    [searchVisualizer.runLinearSearch, searchVisualizer.runBinarySearch]
  );

  const graphRegistry = useMemo(
    () => ({
      BFS: { action: graphVisualizer.runBFS, best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)", space: "O(V)", type: "Traversal", pseudocode: ["enqueue startNode into Queue", "mark startNode as visited", "while Queue is not empty", "  currentNode = dequeue()", "  for each neighbor of currentNode", "    if neighbor is not visited", "      mark neighbor as visited & enqueue"] },
      DFS: { action: graphVisualizer.runDFS, best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)", space: "O(V)", type: "Traversal", pseudocode: ["push startNode into Stack", "while Stack is not empty", "  currentNode = pop()", "  if currentNode is not visited", "    mark currentNode as visited", "    push all unvisited neighbors to Stack"] },
      Dijkstra: {
        action: graphVisualizer.runDijkstra,
        best: "O((V + E) log V)",
        average: "O((V + E) log V)",
        worst: "O((V + E) log V)",
        space: "O(V)",
        type: "Shortest Path",
        pseudocode: ["set all distances to infinity", "set start distance to 0", "while unvisited nodes remain", "  choose node with smallest distance", "  relax all outgoing weighted edges", "  update distance if shorter path found", "reconstruct shortest path"],
      },
      AStar: {
        action: graphVisualizer.runAStar,
        best: "O(E)",
        average: "O(E)",
        worst: "O(E)",
        space: "O(V)",
        type: "Heuristic Pathfinding",
        pseudocode: [
          "set start gScore to 0",
          "set fScore = gScore + heuristic",
          "while openSet is not empty",
          "  choose node with lowest fScore",
          "  if current is target, stop",
          "  check each neighbor",
          "  update path if better score found"
        ],
      },
    }),
    [graphVisualizer.runBFS, graphVisualizer.runDFS, graphVisualizer.runDijkstra, graphVisualizer.runAStar]
  );

  const activeArray = isSortingMode ? sortVisualizer.array : searchVisualizer.array;
  const activeColors = isSortingMode ? sortVisualizer.barColors : searchVisualizer.barColors;
  const activeMetrics = isSortingMode ? sortVisualizer.metrics : isSearchingMode ? searchVisualizer.metrics : graphVisualizer.metrics;
  const isRunning = isSortingMode ? sortVisualizer.isSorting : isSearchingMode ? searchVisualizer.isSearching : graphVisualizer.isTraversing;
  const activeAlgorithm = isSortingMode ? sortingRegistry[selectedSortAlgorithm] : isSearchingMode ? searchingRegistry[selectedSearchAlgorithm] : graphRegistry[selectedGraphAlgorithm];

  useEffect(() => {
    if (isSortingMode) sortVisualizer.generateNewArray(distributionType);
    else if (isSearchingMode) searchVisualizer.generateNewArray(selectedSearchAlgorithm === "Binary Search");
    else graphVisualizer.resetGraph();
    setCurrentExecutingLine(null);
  }, [arraySize, mode, selectedSearchAlgorithm, sortVisualizer.generateNewArray, searchVisualizer.generateNewArray, graphVisualizer.resetGraph]);

  const handleGenerate = () => {
    if (isSortingMode) sortVisualizer.generateNewArray(distributionType);
    else if (isSearchingMode) searchVisualizer.generateNewArray(selectedSearchAlgorithm === "Binary Search");
    else graphVisualizer.resetGraph();
    setCurrentExecutingLine(null);
  };

  const handleStart = async () => {
    if (isRunning) return;
    try {
      if (isSortingMode) await activeAlgorithm.action(speed, setCurrentExecutingLine);
      else if (isSearchingMode) await activeAlgorithm.action(Number(targetValue), speed, setCurrentExecutingLine);
      else await activeAlgorithm.action("A", speed * 4, setCurrentExecutingLine);
    } finally { setCurrentExecutingLine(null); }
  };

  const graphPositions = { A: { x: 400, y: 80 }, B: { x: 250, y: 190 }, C: { x: 580, y: 190 }, D: { x: 170, y: 340 }, E: { x: 400, y: 340 }, F: { x: 650, y: 340 } };
  const graphEdges = Object.entries(graphVisualizer.graph).flatMap(([from, edges]) => edges.map(({ node, weight }) => [from, node, weight]));

  return (
    <div style={styles.dashboardContainer}>
      <header style={styles.header}>
        <h1 style={styles.logo}>🌌 SortSphere <span style={styles.badge}>v2.0 DSA Lab</span></h1>
        <p style={styles.subtitle}>Interactive Sorting, Searching and Graph Algorithm Visualization Laboratory</p>
      </header>

      <section style={styles.modePanel}>
        {["Sorting", "Searching", "Graphs", "Compare", "Arena"].map((m) => (
          <button key={m} onClick={() => setMode(m)} disabled={isRunning} style={{ ...styles.modeButton, ...(mode === m ? styles.modeButtonActive : {}) }}>{m}</button>
        ))}
      </section>

      {isCompareMode ? <ComparisonView styles={styles} /> : (
        <>
          {isArenaMode && <ArenaView styles={styles} />}
          {!isArenaMode && (
            <>
              <section style={styles.hudPanel}>
                <div style={styles.metricCard}><span style={styles.metricLabel}>{isGraphMode ? "Nodes Processed" : "Comparisons"}</span><span style={styles.metricValue}>{isGraphMode ? graphVisualizer.metrics.visited || 0 : activeMetrics.comparisons}</span></div>
                <div style={styles.metricCard}><span style={styles.metricLabel}>{isSortingMode ? "Writes / Operations" : "Result"}</span><span style={styles.metricValue}>{isSortingMode ? activeMetrics.swaps : activeMetrics.result}</span></div>
                <div style={styles.metricCard}><span style={styles.metricLabel}>Execution Time</span><span style={styles.metricValue}>{activeMetrics.timeElapsed ? `${activeMetrics.timeElapsed}ms` : "--"}</span></div>
                <div style={styles.metricCard}><span style={styles.metricLabel}>Average Complexity</span><span style={{ ...styles.metricValue, color: "#ec4899" }}>{activeAlgorithm.average}</span></div>
              </section>

              <div style={{...styles.workspaceLayout, maxWidth: isGraphMode ? "1300px" : "980px"}}>
                <main style={styles.stage}>
                  {isGraphMode ? (
                    <div style={styles.graphStageWrapper}>
                      <section style={styles.graphStats}>
                        <div>Visited: {graphVisualizer.metrics.visited || 0}</div>
                        <div>Time: {graphVisualizer.metrics.timeElapsed || 0}ms</div>
                        <div>Status: {graphVisualizer.metrics.result || "Idle"}</div>
                      </section>
                      <div style={styles.graphCanvas}>
                        <svg viewBox="0 0 800 460" style={styles.graphSvg}>
                          <defs>
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1f2030" strokeWidth="1" /></pattern>
                            <filter id="edgeGlow"><feGaussianBlur stdDeviation="5" result="coloredBlur" /><feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                          </defs>
                          <rect width="100%" height="100%" fill="url(#grid)" />
                          {graphEdges.map(([from, to, weight]) => {
                            const fromPosition = graphPositions[from];
                            const toPosition = graphPositions[to];
                            const isActiveEdge = graphVisualizer.activeEdge && graphVisualizer.activeEdge[0] === from && graphVisualizer.activeEdge[1] === to;
                            
                            return (
                              <g key={`${from}-${to}`}>
                                <line
                                  x1={fromPosition.x + (toPosition.x - fromPosition.x) * 0.08}
                                  y1={fromPosition.y + (toPosition.y - fromPosition.y) * 0.08}
                                  x2={toPosition.x - (toPosition.x - fromPosition.x) * 0.08}
                                  y2={toPosition.y - (toPosition.y - fromPosition.y) * 0.08}
                                  stroke={isActiveEdge ? "#22c55e" : "#6d5dfc"}
                                  strokeWidth={isActiveEdge ? "6" : "3"}
                                  strokeLinecap="round"
                                  opacity={isActiveEdge ? "1" : "0.35"}
                                  filter={isActiveEdge ? "url(#edgeGlow)" : "none"}
                                />
                                <text x={(fromPosition.x + toPosition.x) / 2} y={(fromPosition.y + toPosition.y) / 2 - 28} fill="#f8fafc" fontSize="13" fontWeight="700" textAnchor="middle">w:{weight}</text>
                              </g>
                            );
                          })}
                          {(selectedGraphAlgorithm === "Dijkstra" || selectedGraphAlgorithm === "AStar") &&
                            graphVisualizer.shortestPath.length > 1 &&
                            graphVisualizer.shortestPath.slice(0, -1).map((from, index) => {
                              const to = graphVisualizer.shortestPath[index + 1];
                              const fromPosition = graphPositions[from];
                              const toPosition = graphPositions[to];
                              if (!fromPosition || !toPosition) return null;
                              return (
                                <g key={`shortest-overlay-${from}-${to}`}>
                                  <line
                                    x1={fromPosition.x}
                                    y1={fromPosition.y}
                                    x2={toPosition.x}
                                    y2={toPosition.y}
                                    stroke="#facc15"
                                    strokeWidth="22"
                                    strokeLinecap="round"
                                    opacity="0.35"
                                  />
                                  <line
                                    x1={fromPosition.x}
                                    y1={fromPosition.y}
                                    x2={toPosition.x}
                                    y2={toPosition.y}
                                    stroke="#ffffff"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    opacity="1"
                                    filter="url(#edgeGlow)"
                                  />
                                </g>
                              );
                            })}
                        </svg>
                        {Object.keys(graphVisualizer.graph).map((node) => {
                          const isPathNode = graphVisualizer.shortestPath.includes(node);
                          return (
                            <div key={node} style={{ ...styles.positionedGraphNode, top: `${graphPositions[node].y}px`, left: `${graphPositions[node].x}px` }}>
                              <div style={{ ...styles.graphNode, transform: isPathNode ? "scale(1.25)" : "scale(1)", backgroundColor: graphVisualizer.nodeColors[node] || "#8b5cf6", boxShadow: isPathNode ? "0 0 30px #facc15" : `0 0 18px ${graphVisualizer.nodeColors[node] || "#8b5cf6"}`, border: isPathNode ? "3px solid #facc15" : "2px solid rgba(255,255,255,0.2)" }}>{node}</div>
                            </div>
                          );
                        })}
                      </div>
                      <section style={styles.graphPathPanel}>
                        <h3 style={{ margin: "0 0 8px 0" }}>{(selectedGraphAlgorithm === "Dijkstra" || selectedGraphAlgorithm === "AStar") ? "Shortest Path" : "Traversal Path"}</h3>
                        <div style={styles.graphPathContent}>{(selectedGraphAlgorithm === "Dijkstra" || selectedGraphAlgorithm === "AStar") ? (graphVisualizer.shortestPath.length === 0 ? "Calculating..." : graphVisualizer.shortestPath.join(" → ")) : (graphVisualizer.traversalPath.length === 0 ? "Waiting..." : graphVisualizer.traversalPath.join(" → "))}</div>
                        {(selectedGraphAlgorithm === "Dijkstra" || selectedGraphAlgorithm === "AStar") && graphVisualizer.shortestPath.length > 0 && <div style={{ marginTop: "10px", color: "#facc15", fontWeight: "800", fontSize: "1rem" }}>Cost = {graphVisualizer.distances["F"]}</div>}
                      </section>
                    </div>
                  ) : (
                    activeArray.map((value, idx) => (
                      <div
                        key={idx}
                        title={`${value}`}
                        style={{
                          width: `${Math.max(8, 620 / activeArray.length)}px`,
                          height: "380px",
transform: `scaleY(${value / 380})`,
transformOrigin: "bottom",
transition: "transform 0.08s linear",
willChange: "transform",
                          backgroundColor: activeColors[idx],
                          boxShadow: `0 0 6px ${activeColors[idx]}`,
                          margin: "0 3px",
                          borderRadius: "6px 6px 0 0",
                          alignSelf: "flex-end"
                        }}
                      />
                    ))
                  )}
                </main>

                <aside style={styles.codeTracer}>
                  <h3 style={styles.tracerTitle}>Execution Tracer</h3>
                  <div style={styles.codeBlock}>
                    {activeAlgorithm.pseudocode.map((line, index) => (
                      <div key={index} style={{ ...styles.codeLine, backgroundColor: currentExecutingLine === index ? "rgba(236, 72, 153, 0.2)" : "transparent", color: currentExecutingLine === index ? "#ec4899" : "#a1a1aa", borderLeft: currentExecutingLine === index ? "3px solid #ec4899" : "3px solid transparent" }}>
                        <span style={styles.lineNumber}>{index + 1}</span>
                        <pre style={styles.codeText}>{line}</pre>
                      </div>
                    ))}
                  </div>
                </aside>
              </div>

              <section style={styles.legend}>
                <div style={styles.legendItem}><span style={{ ...styles.legendDot, backgroundColor: "#8b5cf6" }} /> Default</div>
                <div style={styles.legendItem}><span style={{ ...styles.legendDot, backgroundColor: "#ec4899" }} /> {isSortingMode ? "Comparing" : isSearchingMode ? "Checking" : "Visiting"}</div>
                <div style={styles.legendItem}><span style={{ ...styles.legendDot, backgroundColor: "#f97316" }} /> {isSortingMode ? "Writing" : isSearchingMode ? "Active" : "Queued / Discovered"}</div>
                <div style={styles.legendItem}><span style={{ ...styles.legendDot, backgroundColor: "#22c55e" }} /> {isSortingMode ? "Sorted" : isSearchingMode ? "Found" : "Visited"}</div>
                {(selectedGraphAlgorithm === "Dijkstra" || selectedGraphAlgorithm === "AStar") && <div style={styles.legendItem}><span style={{ ...styles.legendDot, backgroundColor: "#facc15" }} /> Shortest Path</div>}
              </section>
            </>
          )}
        </>
      )}

      {!isArenaMode && !isCompareMode && (
        <>
          <section style={styles.algorithmInfo}>
            <div>
              <span style={styles.infoLabel}>Selected {mode} Algorithm</span>
              <h2 style={styles.infoTitle}>{isSortingMode ? selectedSortAlgorithm : isSearchingMode ? selectedSearchAlgorithm : selectedGraphAlgorithm}</h2>
            </div>
            <div style={styles.infoGrid}>
              {[ { l: "Best", v: activeAlgorithm.best }, { l: "Average", v: activeAlgorithm.average }, { l: "Worst", v: activeAlgorithm.worst }, { l: "Space", v: activeAlgorithm.space }, { l: isSortingMode ? "Stable" : isSearchingMode ? "Requirement" : "Type", v: isSortingMode ? activeAlgorithm.stable : isSearchingMode ? activeAlgorithm.requirement : activeAlgorithm.type } ].map(item => (
                <div key={item.l} style={styles.infoCard}>
                  <span style={styles.infoLabel}>{item.l}</span>
                  <strong style={styles.infoValue}>{item.v}</strong>
                </div>
              ))}
            </div>
          </section>

          <section style={{ ...styles.controlPanel, gridTemplateColumns: isSortingMode || isSearchingMode ? "1fr 1fr 1fr 1fr auto" : "1fr 1fr auto" }}>
            <div style={styles.controlGroup}>
              <label style={styles.controlLabel}>Algorithm</label>
              <select value={isSortingMode ? selectedSortAlgorithm : isSearchingMode ? selectedSearchAlgorithm : selectedGraphAlgorithm} disabled={isRunning} onChange={(e) => isSortingMode ? setSelectedSortAlgorithm(e.target.value) : isSearchingMode ? setSelectedSearchAlgorithm(e.target.value) : setSelectedGraphAlgorithm(e.target.value)} style={styles.select}>
                {Object.keys(isSortingMode ? sortingRegistry : isSearchingMode ? searchingRegistry : graphRegistry).map((alg) => <option key={alg} value={alg}>{alg}</option>)}
              </select>
            </div>
            <div style={styles.controlGroup}>
              <label style={styles.controlLabel}>Speed: {speed}ms</label>
              <input type="range" min="5" max="120" value={speed} disabled={isRunning} onChange={(e) => setSpeed(Number(e.target.value))} style={styles.slider} />
            </div>
            {isSortingMode && (
              <div style={styles.controlGroup}>
                <label style={styles.controlLabel}>Distribution</label>
                <select value={distributionType} disabled={isRunning} onChange={(e) => { setDistributionType(e.target.value); sortVisualizer.generateNewArray(e.target.value); }} style={styles.select}>
                  {["Random", "Nearly Sorted", "Reverse Sorted", "Few Unique"].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            )}
            {!isGraphMode && (
              <div style={styles.controlGroup}>
                <label style={styles.controlLabel}>Array Size: {arraySize}</label>
                <input type="range" min="10" max="80" value={arraySize} disabled={isRunning} onChange={(e) => setArraySize(Number(e.target.value))} style={styles.slider} />
              </div>
            )}
            {isSearchingMode && (
              <div style={styles.controlGroup}>
                <label style={styles.controlLabel}>Target Value</label>
                <input type="number" value={targetValue} disabled={isRunning} onChange={(e) => setTargetValue(e.target.value)} style={styles.input} />
              </div>
            )}
            <div style={styles.actionGroup}>
              {isSearchingMode && <button onClick={() => setTargetValue(activeArray[Math.floor(Math.random() * activeArray.length)])} disabled={isRunning} style={{ ...styles.btn, ...styles.btnSecondary }}>Pick Target</button>}
              <button onClick={handleGenerate} disabled={isRunning} style={{ ...styles.btn, ...styles.btnSecondary }}>{isGraphMode ? "Reset Graph" : "Generate Array"}</button>
              <button onClick={handleStart} disabled={isRunning} style={{ ...styles.btn, ...styles.btnPrimary }}>{isRunning ? "Engine Active..." : "Start"}</button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

const styles = {
  graphStageWrapper: { width: "100%", height: "100%", display: "flex", flexDirection: "column" },
  graphCanvas: { position: "relative", width: "100%", height: "460px", minWidth: "760px", maxWidth: "900px", alignSelf: "center", marginBottom: "20px", overflow: "visible" },
  graphStats: { display: "flex", gap: "20px", marginBottom: "15px", padding: "10px", background: "#1f2030", borderRadius: "10px", color: "#a1a1aa", fontSize: "0.85rem", justifyContent: "center" },
  graphPathPanel: { marginTop: "16px", padding: "16px", borderRadius: "16px", background: "#151522", border: "1px solid #2a2540" },
  graphPathContent: { color: "#22c55e", fontWeight: "700", fontSize: "0.9rem", wordBreak: "break-word" },
  dashboardContainer: { minHeight: "100vh", backgroundColor: "#05050a", color: "#f8fafc", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', system-ui, sans-serif", padding: "20px" },
  header: { textAlign: "center", marginBottom: "18px" },
  logo: { fontSize: "2.6rem", fontWeight: "800", letterSpacing: "-0.05em", background: "linear-gradient(to right, #8b5cf6, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "0 0 8px 0" },
  badge: { fontSize: "0.85rem", fontWeight: "500", color: "#ec4899", border: "1px solid #ec4899", padding: "2px 8px", borderRadius: "20px", verticalAlign: "middle", marginLeft: "10px" },
  subtitle: { color: "#a1a1aa", fontSize: "1rem", margin: 0 },
  modePanel: { display: "flex", gap: "10px", background: "#151522", border: "1px solid #2a2540", borderRadius: "999px", padding: "8px", marginBottom: "16px" },
  modeButton: { padding: "10px 24px", borderRadius: "999px", border: "none", cursor: "pointer", background: "transparent", color: "#a1a1aa", fontWeight: "700", transition: "all 0.2s ease" },
  modeButtonActive: { background: "linear-gradient(to right, #8b5cf6, #ec4899)", color: "#ffffff", boxShadow: "0 4px 18px rgba(236, 72, 153, 0.25)" },
  hudPanel: { display: "flex", gap: "16px", width: "100%", maxWidth: "980px", marginBottom: "18px" },
  metricCard: { flex: 1, background: "#151522", border: "1px solid #2a2540", padding: "12px 16px", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "4px" },
  metricLabel: { fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#a1a1aa" },
  metricValue: { fontSize: "1.05rem", fontWeight: "700", color: "#f8fafc" },
  workspaceLayout: { display: "flex", gap: "20px", width: "100%", marginBottom: "16px" },
  stage: { display: "flex", alignItems: "flex-end", justifyContent: "center", minHeight: "500px", flex: 1, background: "radial-gradient(circle at center, #1d1638 0%, #09050f 100%)", border: "1px solid #31244f", borderRadius: "18px", padding: "24px", boxShadow: "0 30px 80px rgba(139, 92, 246, 0.18)", overflow: "visible" },
  codeTracer: { flex: "0 0 320px", height: "340px", background: "#151522", border: "1px solid #2a2540", borderRadius: "18px", padding: "18px", display: "flex", flexDirection: "column", boxShadow: "0 30px 80px rgba(0, 0, 0, 0.2)" },
  tracerTitle: { margin: "0 0 14px 0", fontSize: "0.95rem", fontWeight: "700", color: "#f8fafc", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #2a2540", paddingBottom: "8px" },
  codeBlock: { flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "2px" },
  codeLine: { display: "flex", alignItems: "flex-start", gap: "12px", padding: "4px 8px", borderRadius: "6px", transition: "all 0.15s ease" },
  lineNumber: { fontFamily: "'Courier New', monospace", fontSize: "0.75rem", color: "#4b5563", width: "16px", textAlign: "right", userSelect: "none", marginTop: "2px" },
  codeText: { margin: 0, fontFamily: "'Fira Code', monospace, Consolas", fontSize: "0.82rem", whiteSpace: "pre-wrap", lineHeight: "1.4" },
  legend: { display: "flex", gap: "18px", alignItems: "center", justifyContent: "center", background: "#151522", border: "1px solid #2a2540", borderRadius: "999px", padding: "10px 18px", marginBottom: "16px", color: "#d4d4d8", fontSize: "0.85rem", flexWrap: "wrap" },
  legendItem: { display: "flex", alignItems: "center", gap: "8px" },
  legendDot: { width: "10px", height: "10px", borderRadius: "50%", display: "inline-block" },
  algorithmInfo: { width: "100%", maxWidth: "980px", background: "#151522", border: "1px solid #2a2540", borderRadius: "18px", padding: "16px 18px", marginBottom: "16px", display: "flex", justifyContent: "space-between", gap: "20px", alignItems: "center" },
  infoTitle: { margin: "4px 0 0 0", fontSize: "1.35rem", color: "#f8fafc" },
  infoGrid: { display: "grid", gridTemplateColumns: "repeat(5, minmax(80px, 1fr))", gap: "10px", flex: 1 },
  infoCard: { background: "#1f2030", border: "1px solid #3f3f56", borderRadius: "12px", padding: "10px", display: "flex", flexDirection: "column", gap: "4px" },
  infoLabel: { fontSize: "0.72rem", color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.05em" },
  infoValue: { color: "#f8fafc", fontSize: "0.9rem" },
  controlPanel: { width: "100%", maxWidth: "980px", background: "#151522", border: "1px solid #2a2540", borderRadius: "18px", padding: "18px", display: "grid", gap: "16px", alignItems: "end" },
  controlGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  controlLabel: { fontSize: "0.8rem", color: "#a1a1aa", fontWeight: "600" },
  select: { backgroundColor: "#1f2030", color: "#f8fafc", border: "1px solid #3f3f56", borderRadius: "10px", padding: "12px", outline: "none" },
  input: { backgroundColor: "#1f2030", color: "#f8fafc", border: "1px solid #3f3f56", borderRadius: "10px", padding: "12px", outline: "none" },
  slider: { width: "100%", accentColor: "#ec4899" },
  actionGroup: { display: "flex", gap: "10px" },
  btn: { padding: "14px 22px", fontSize: "0.9rem", fontWeight: "600", borderRadius: "10px", border: "none", cursor: "pointer", transition: "all 0.2s ease", whiteSpace: "nowrap" },
  btnPrimary: { backgroundColor: "#8b5cf6", color: "#ffffff", boxShadow: "0 4px 18px rgba(139, 92, 246, 0.45)" },
  btnSecondary: { backgroundColor: "#1f2030", color: "#d4d4d8", border: "1px solid #3f3f56" },
  graphSvg: { position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" },
  positionedGraphNode: { position: "absolute", transform: "translate(-50%, -50%)" },
  graphNode: { width: "72px", height: "72px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontWeight: "800", fontSize: "1.8rem", border: "2px solid rgba(255,255,255,0.2)", transition: "all 0.25s ease" },
};