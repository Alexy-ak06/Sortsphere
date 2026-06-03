
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

  const sortingRegistry = useMemo(
    () => ({
      "Bubble Sort": {
        action: sortVisualizer.runBubbleSort,
        best: "O(n)",
        average: "O(n²)",
        worst: "O(n²)",
        space: "O(1)",
        stable: "Yes",
        pseudocode: [
          "do",
          "  swapped = false",
          "  for i = 1 to indexOfLastUnsortedElement-1",
          "    if leftElement > rightElement",
          "      swap(leftElement, rightElement)",
          "      swapped = true",
          "while swapped"
        ]
      },
      "Selection Sort": {
        action: sortVisualizer.runSelectionSort,
        best: "O(n²)",
        average: "O(n²)",
        worst: "O(n²)",
        space: "O(1)",
        stable: "No",
        pseudocode: [
          "repeat (numOfElements - 1) times",
          "  set the first unsorted element as the minimum",
          "  for each of the unsorted elements",
          "    if element < currentMinimum",
          "      set this element as the new minimum",
          "  swap minimum with first unsorted position"
        ]
      },
      "Insertion Sort": {
        action: sortVisualizer.runInsertionSort,
        best: "O(n)",
        average: "O(n²)",
        worst: "O(n²)",
        space: "O(1)",
        stable: "Yes",
        pseudocode: [
          "mark first element as sorted",
          "for each unsorted element X",
          "  'extract' the element X",
          "  for j = lastSortedIndex down to 0",
          "    if sortedElement > X",
          "      move sorted element to the right",
          "  insert X into correct position"
        ]
      },
      "Merge Sort": {
        action: sortVisualizer.runMergeSort,
        best: "O(n log n)",
        average: "O(n log n)",
        worst: "O(n log n)",
        space: "O(n)",
        stable: "Yes",
        pseudocode: [
          "split the unsorted list into n sublists",
          "repeatedly merge sublists to produce new sorted sublists",
          "if leftLength == 0 return rightList",
          "if rightLength == 0 return leftList",
          "if left[0] <= right[0]",
          "  append left[0] to mergedList",
          "else append right[0] to mergedList"
        ]
      },
      "Quick Sort": {
        action: sortVisualizer.runQuickSort,
        best: "O(n log n)",
        average: "O(n log n)",
        worst: "O(n²)",
        space: "O(log n)",
        stable: "No",
        pseudocode: [
          "if low < high",
          "  pivotIndex = partition(array, low, high)",
          "  quickSort(array, low, pivotIndex - 1)",
          "  quickSort(array, pivotIndex + 1, high)",
          "// partition function logic:",
          "choose array[high] as pivot element",
          "traverse array and swap elements smaller than pivot"
        ]
      },
    }),
    [
      sortVisualizer.runBubbleSort,
      sortVisualizer.runSelectionSort,
      sortVisualizer.runInsertionSort,
      sortVisualizer.runMergeSort,
      sortVisualizer.runQuickSort,
    ]
  );

  const searchingRegistry = useMemo(
    () => ({
      "Linear Search": {
        action: searchVisualizer.runLinearSearch,
        best: "O(1)",
        average: "O(n)",
        worst: "O(n)",
        space: "O(1)",
        requirement: "Unsorted array",
        pseudocode: [
          "for each item in the list",
          "  if item == targetValue",
          "    return item's index",
          "return -1 (Not Found)"
        ]
      },
      "Binary Search": {
        action: searchVisualizer.runBinarySearch,
        best: "O(1)",
        average: "O(log n)",
        worst: "O(log n)",
        space: "O(1)",
        requirement: "Sorted array",
        pseudocode: [
          "while low <= high",
          "  mid = low + (high - low) / 2",
          "  if array[mid] == targetValue return mid",
          "  if array[mid] < targetValue",
          "    low = mid + 1",
          "  else high = mid - 1",
          "return -1 (Not Found)"
        ]
      },
    }),
    [searchVisualizer.runLinearSearch, searchVisualizer.runBinarySearch]
  );

  const graphRegistry = useMemo(
    () => ({
      BFS: {
        action: graphVisualizer.runBFS,
        best: "O(V + E)",
        average: "O(V + E)",
        worst: "O(V + E)",
        space: "O(V)",
        type: "Traversal",
        pseudocode: [
          "enqueue startNode into Queue",
          "mark startNode as visited",
          "while Queue is not empty",
          "  currentNode = dequeue()",
          "  for each neighbor of currentNode",
          "    if neighbor is not visited",
          "      mark neighbor as visited & enqueue"
        ]
      },
      DFS: {
        action: graphVisualizer.runDFS,
        best: "O(V + E)",
        average: "O(V + E)",
        worst: "O(V + E)",
        space: "O(V)",
        type: "Traversal",
        pseudocode: [
          "push startNode into Stack",
          "while Stack is not empty",
          "  currentNode = pop()",
          "  if currentNode is not visited",
          "    mark currentNode as visited",
          "    push all unvisited neighbors to Stack"
        ]
      },
    }),
    [graphVisualizer.runBFS, graphVisualizer.runDFS]
  );

  const activeArray = isSortingMode ? sortVisualizer.array : searchVisualizer.array;

  const activeColors = isSortingMode ? sortVisualizer.barColors : searchVisualizer.barColors;

  const activeMetrics = isSortingMode
    ? sortVisualizer.metrics
    : isSearchingMode
      ? searchVisualizer.metrics
      : graphVisualizer.metrics;

  const isRunning = isSortingMode
    ? sortVisualizer.isSorting
    : isSearchingMode
      ? searchVisualizer.isSearching
      : graphVisualizer.isTraversing;

  const activeAlgorithm = isSortingMode
    ? sortingRegistry[selectedSortAlgorithm]
    : isSearchingMode
      ? searchingRegistry[selectedSearchAlgorithm]
      : graphRegistry[selectedGraphAlgorithm];

  useEffect(() => {
    if (isSortingMode) {
      sortVisualizer.generateNewArray(distributionType);
    } else if (isSearchingMode) {
      searchVisualizer.generateNewArray(selectedSearchAlgorithm === "Binary Search");
    } else {
      graphVisualizer.resetGraph();
    }
    setCurrentExecutingLine(null);
  }, [
    arraySize,
    mode,
    selectedSearchAlgorithm,
    sortVisualizer.generateNewArray,
    searchVisualizer.generateNewArray,
    graphVisualizer.resetGraph,
  ]);

  const handleGenerate = () => {
    if (isSortingMode) {
      sortVisualizer.generateNewArray(distributionType);
    } else if (isSearchingMode) {
      searchVisualizer.generateNewArray(selectedSearchAlgorithm === "Binary Search");
    } else {
      graphVisualizer.resetGraph();
    }
    setCurrentExecutingLine(null);
  };

  const handleStart = async () => {
    if (isRunning) return;

    try {
      if (isSortingMode) {
        await activeAlgorithm.action(speed, setCurrentExecutingLine);
      } else if (isSearchingMode) {
        await activeAlgorithm.action(Number(targetValue), speed, setCurrentExecutingLine);
      } else {
        await activeAlgorithm.action("A", speed * 4, setCurrentExecutingLine);
      }
    } finally {
      setCurrentExecutingLine(null);
    }
  };

  const graphPositions = {
    A: { top: "12%", left: "50%" },
    B: { top: "42%", left: "30%" },
    C: { top: "42%", left: "70%" },
    D: { top: "72%", left: "20%" },
    E: { top: "72%", left: "45%" },
    F: { top: "72%", left: "75%" },
  };

  const graphEdges = [
    ["A", "B"],
    ["A", "C"],
    ["B", "D"],
    ["B", "E"],
    ["C", "F"],
    ["E", "F"],
  ];

  return (
    <div style={styles.dashboardContainer}>
      <header style={styles.header}>
        <h1 style={styles.logo}>
          🌌 SortSphere <span style={styles.badge}>v2.0 DSA Lab</span>
        </h1>
        <p style={styles.subtitle}>
          Interactive Sorting, Searching and Graph Algorithm Visualization Laboratory
        </p>
      </header>

      <section style={styles.modePanel}>
        <button
          onClick={() => setMode("Sorting")}
          disabled={isRunning}
          style={{
            ...styles.modeButton,
            ...(mode === "Sorting" ? styles.modeButtonActive : {}),
          }}
        >
          Sorting
        </button>

        <button
          onClick={() => setMode("Searching")}
          disabled={isRunning}
          style={{
            ...styles.modeButton,
            ...(mode === "Searching" ? styles.modeButtonActive : {}),
          }}
        >
          Searching
        </button>
        <button
          onClick={() => setMode("Graphs")}
          disabled={isRunning}
          style={{
            ...styles.modeButton,
            ...(mode === "Graphs" ? styles.modeButtonActive : {}),
          }}
        >
          Graphs
        </button>
        <button
          onClick={() => setMode("Compare")}
          disabled={isRunning}
          style={{
            ...styles.modeButton,
            ...(mode === "Compare" ? styles.modeButtonActive : {}),
          }}
        >
          Compare
        </button>
      </section>
     {isCompareMode ? (
  <ComparisonView styles={styles} />
) : (
  <>
    <section style={styles.hudPanel}>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>
            {isGraphMode ? "Nodes Processed" : "Comparisons"}
          </span>
          <span style={styles.metricValue}>
            {isGraphMode ? activeMetrics.visited || 0 : activeMetrics.comparisons}
          </span>
        </div>

        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>
            {isSortingMode ? "Writes / Operations" : "Result"}
          </span>
          <span style={styles.metricValue}>
            {isSortingMode ? activeMetrics.swaps : activeMetrics.result}
          </span>
        </div>

        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Execution Time</span>
          <span style={styles.metricValue}>
            {activeMetrics.timeElapsed ? `${activeMetrics.timeElapsed}ms` : "--"}
          </span>
        </div>

        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Average Complexity</span>
          <span style={{ ...styles.metricValue, color: "#ec4899" }}>
            {activeAlgorithm.average}
          </span>
        </div>
      </section>

      <div style={styles.workspaceLayout}>
        <main style={styles.stage}>
          {isGraphMode ? (
            <div style={styles.graphCanvas}>
              <svg style={styles.graphSvg}>
                {graphEdges.map(([from, to]) => {
                  const fromPosition = graphPositions[from];
                  const toPosition = graphPositions[to];

                  return (
                    <line
                      key={`${from}-${to}`}
                      x1={fromPosition.left}
                      y1={fromPosition.top}
                      x2={toPosition.left}
                      y2={toPosition.top}
                      stroke="#6d5dfc"
                      strokeWidth="3"
                      strokeLinecap="round"
                      opacity="0.45"
                    />
                  );
                })}
              </svg>

              {Object.keys(graphVisualizer.graph).map((node) => (
                <div
                  key={node}
                  style={{
                    ...styles.positionedGraphNode,
                    top: graphPositions[node].top,
                    left: graphPositions[node].left,
                  }}
                >
                  <div
                    style={{
                      ...styles.graphNode,
                      backgroundColor: graphVisualizer.nodeColors[node] || "#8b5cf6",
                      boxShadow: `0 0 18px ${
                        graphVisualizer.nodeColors[node] || "#8b5cf6"
                      }`,
                    }}
                  >
                    {node}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            activeArray.map((value, idx) => (
              <div
                key={idx}
                title={`${value}`}
                style={{
                  width: `${Math.max(4, 560 / activeArray.length)}px`,
                  height: `${value}px`,
                  backgroundColor: activeColors[idx],
                  boxShadow: `0 0 12px ${activeColors[idx]}`,
                  margin: "0 2px",
                  borderRadius: "8px 8px 0 0",
                  transition: "background-color 0.05s ease, height 0.05s ease, box-shadow 0.05s ease",
                }}
              />
            ))
          )}
        </main>

        <aside style={styles.codeTracer}>
          <h3 style={styles.tracerTitle}>Execution Tracer</h3>
          <div style={styles.codeBlock}>
            {activeAlgorithm.pseudocode.map((line, index) => (
              <div
                key={index}
                style={{
                  ...styles.codeLine,
                  backgroundColor: currentExecutingLine === index ? "rgba(236, 72, 153, 0.2)" : "transparent",
                  color: currentExecutingLine === index ? "#ec4899" : "#a1a1aa",
                  borderLeft: currentExecutingLine === index ? "3px solid #ec4899" : "3px solid transparent",
                }}
              >
                <span style={styles.lineNumber}>{index + 1}</span>
                <pre style={styles.codeText}>{line}</pre>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <section style={styles.legend}>
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendDot, backgroundColor: "#8b5cf6" }} />
          Default
        </div>
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendDot, backgroundColor: "#ec4899" }} />
          {isSortingMode ? "Comparing" : isSearchingMode ? "Checking" : "Visiting"}
        </div>
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendDot, backgroundColor: "#f97316" }} />
          {isSortingMode ? "Writing" : isSearchingMode ? "Active" : "Queued / Discovered"}
        </div>
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendDot, backgroundColor: "#22c55e" }} />
          {isSortingMode ? "Sorted" : isSearchingMode ? "Found" : "Visited"}
        </div>
        {isSearchingMode && (
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendDot, backgroundColor: "#ef4444" }} />
            Rejected
          </div>
        )}
      </section>

      <section style={styles.algorithmInfo}>
        <div>
          <span style={styles.infoLabel}>Selected {mode} Algorithm</span>
          <h2 style={styles.infoTitle}>
            {isSortingMode
              ? selectedSortAlgorithm
              : isSearchingMode
              ? selectedSearchAlgorithm
              : selectedGraphAlgorithm}
          </h2>
        </div>

        <div style={styles.infoGrid}>
          <div style={styles.infoCard}>
            <span style={styles.infoLabel}>Best</span>
            <strong style={styles.infoValue}>{activeAlgorithm.best}</strong>
          </div>
          <div style={styles.infoCard}>
            <span style={styles.infoLabel}>Average</span>
            <strong style={styles.infoValue}>{activeAlgorithm.average}</strong>
          </div>
          <div style={styles.infoCard}>
            <span style={styles.infoLabel}>Worst</span>
            <strong style={styles.infoValue}>{activeAlgorithm.worst}</strong>
          </div>
          <div style={styles.infoCard}>
            <span style={styles.infoLabel}>Space</span>
            <strong style={styles.infoValue}>{activeAlgorithm.space}</strong>
          </div>
          <div style={styles.infoCard}>
            <span style={styles.infoLabel}>
              {isSortingMode ? "Stable" : isSearchingMode ? "Requirement" : "Type"}
            </span>
            <strong style={styles.infoValue}>
              {isSortingMode
                ? activeAlgorithm.stable
                : isSearchingMode
                ? activeAlgorithm.requirement
                : activeAlgorithm.type}
            </strong>
          </div>
        </div>
      </section>

      <section
        style={{
          ...styles.controlPanel,
          gridTemplateColumns: isSortingMode
            ? "1fr 1fr 1fr 1fr auto"
            : isSearchingMode
            ? "1fr 1fr 1fr 1fr auto"
            : "1fr 1fr auto",
        }}
      >
        <div style={styles.controlGroup}>
          <label style={styles.controlLabel}>Algorithm</label>
          <select
            value={
              isSortingMode
                ? selectedSortAlgorithm
                : isSearchingMode
                ? selectedSearchAlgorithm
                : selectedGraphAlgorithm
            }
            disabled={isRunning}
            onChange={(event) => {
              if (isSortingMode) {
                setSelectedSortAlgorithm(event.target.value);
              } else if (isSearchingMode) {
                setSelectedSearchAlgorithm(event.target.value);
              } else {
                setSelectedGraphAlgorithm(event.target.value);
              }
            }}
            style={styles.select}
          >
            {Object.keys(
              isSortingMode
                ? sortingRegistry
                : isSearchingMode
                ? searchingRegistry
                : graphRegistry
            ).map((algorithm) => (
              <option key={algorithm} value={algorithm}>
                {algorithm}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.controlGroup}>
          <label style={styles.controlLabel}>Speed: {speed}ms</label>
          <input
            type="range"
            min="5"
            max="120"
            value={speed}
            disabled={isRunning}
            onChange={(event) => setSpeed(Number(event.target.value))}
            style={styles.slider}
          />
        </div>
{isSortingMode && (
  <div style={styles.controlGroup}>
    <label style={styles.controlLabel}>Distribution</label>
    <select
      value={distributionType}
      disabled={isRunning}
      onChange={(event) => {
        setDistributionType(event.target.value);
        sortVisualizer.generateNewArray(event.target.value);
      }}
      style={styles.select}
    >
      <option value="Random">Random</option>
      <option value="Nearly Sorted">Nearly Sorted</option>
      <option value="Reverse Sorted">Reverse Sorted</option>
      <option value="Few Unique">Few Unique</option>
    </select>
  </div>
)}
        {!isGraphMode && (
          <div style={styles.controlGroup}>
            <label style={styles.controlLabel}>Array Size: {arraySize}</label>
            <input
              type="range"
              min="10"
              max="80"
              value={arraySize}
              disabled={isRunning}
              onChange={(event) => setArraySize(Number(event.target.value))}
              style={styles.slider}
            />
          </div>
        )}

        {isSearchingMode && (
          <div style={styles.controlGroup}>
            <label style={styles.controlLabel}>Target Value</label>
            <input
              type="number"
              value={targetValue}
              disabled={isRunning}
              onChange={(event) => setTargetValue(event.target.value)}
              style={styles.input}
            />
          </div>
        )}

        <div style={styles.actionGroup}>
          {isSearchingMode && (
            <button
              onClick={() => {
                const randomValue = activeArray[Math.floor(Math.random() * activeArray.length)];
                setTargetValue(randomValue);
              }}
              disabled={isRunning}
              style={{
                ...styles.btn,
                ...styles.btnSecondary,
                opacity: isRunning ? 0.5 : 1,
              }}
            >
              Pick Target
            </button>
          )}

          <button
            onClick={handleGenerate}
            disabled={isRunning}
            style={{
              ...styles.btn,
              ...styles.btnSecondary,
              opacity: isRunning ? 0.5 : 1,
            }}
          >
            {isGraphMode ? "Reset Graph" : "Generate Array"}
          </button>

          <button
            onClick={handleStart}
            disabled={isRunning}
            style={{
              ...styles.btn,
              ...styles.btnPrimary,
              opacity: isRunning ? 0.5 : 1,
            }}
          >
            {isRunning
              ? "Engine Active..."
              : isGraphMode
              ? "Start Traversal"
              : isSortingMode
              ? "Start Sorting"
              : "Start Search"}
          </button>
        </div>
          </section>
    </>
  )}
</div>
);
}

const styles = {
  dashboardContainer: {
    minHeight: "100vh",
    backgroundColor: "#05050a",
    color: "#f8fafc",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Inter', system-ui, sans-serif",
    padding: "20px",
  },
  header: {
    textAlign: "center",
    marginBottom: "18px",
  },
  logo: {
    fontSize: "2.6rem",
    fontWeight: "800",
    letterSpacing: "-0.05em",
    background: "linear-gradient(to right, #8b5cf6, #ec4899)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: "0 0 8px 0",
  },
  badge: {
    fontSize: "0.85rem",
    fontWeight: "500",
    color: "#ec4899",
    border: "1px solid #ec4899",
    padding: "2px 8px",
    borderRadius: "20px",
    verticalAlign: "middle",
    marginLeft: "10px",
    WebkitTextFillColor: "#ec4899",
  },
  subtitle: {
    color: "#a1a1aa",
    fontSize: "1rem",
    margin: 0,
  },
  modePanel: {
    display: "flex",
    gap: "10px",
    background: "#151522",
    border: "1px solid #2a2540",
    borderRadius: "999px",
    padding: "8px",
    marginBottom: "16px",
  },
  modeButton: {
    padding: "10px 24px",
    borderRadius: "999px",
    border: "none",
    cursor: "pointer",
    background: "transparent",
    color: "#a1a1aa",
    fontWeight: "700",
    transition: "all 0.2s ease",
  },
  modeButtonActive: {
    background: "linear-gradient(to right, #8b5cf6, #ec4899)",
    color: "#ffffff",
    boxShadow: "0 4px 18px rgba(236, 72, 153, 0.25)",
  },
  hudPanel: {
    display: "flex",
    gap: "16px",
    width: "100%",
    maxWidth: "980px",
    marginBottom: "18px",
  },
  metricCard: {
    flex: 1,
    background: "#151522",
    border: "1px solid #2a2540",
    padding: "12px 16px",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  metricLabel: {
    fontSize: "0.72rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#a1a1aa",
  },
  metricValue: {
    fontSize: "1.05rem",
    fontWeight: "700",
    color: "#f8fafc",
  },
  workspaceLayout: {
    display: "flex",
    gap: "20px",
    width: "100%",
    maxWidth: "980px",
    marginBottom: "16px",
  },
  stage: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    height: "340px",
    flex: 1,
    background: "radial-gradient(circle at center, #1d1638 0%, #09050f 100%)",
    border: "1px solid #31244f",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 30px 80px rgba(139, 92, 246, 0.18)",
    overflow: "hidden",
  },
  codeTracer: {
    flex: "0 0 320px",
    height: "340px",
    background: "#151522",
    border: "1px solid #2a2540",
    borderRadius: "18px",
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 30px 80px rgba(0, 0, 0, 0.2)",
  },
  tracerTitle: {
    margin: "0 0 14px 0",
    fontSize: "0.95rem",
    fontWeight: "700",
    color: "#f8fafc",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "1px solid #2a2540",
    paddingBottom: "8px",
  },
  codeBlock: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  codeLine: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "4px 8px",
    borderRadius: "6px",
    transition: "all 0.15s ease",
  },
  lineNumber: {
    fontFamily: "'Courier New', monospace",
    fontSize: "0.75rem",
    color: "#4b5563",
    width: "16px",
    textAlign: "right",
    userSelect: "none",
    marginTop: "2px",
  },
  codeText: {
    margin: 0,
    fontFamily: "'Fira Code', monospace, Consolas",
    fontSize: "0.82rem",
    whiteSpace: "pre-wrap",
    lineHeight: "1.4",
  },
  legend: {
    display: "flex",
    gap: "18px",
    alignItems: "center",
    justifyContent: "center",
    background: "#151522",
    border: "1px solid #2a2540",
    borderRadius: "999px",
    padding: "10px 18px",
    marginBottom: "16px",
    color: "#d4d4d8",
    fontSize: "0.85rem",
    flexWrap: "wrap",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  legendDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    display: "inline-block",
  },
  algorithmInfo: {
    width: "100%",
    maxWidth: "980px",
    background: "#151522",
    border: "1px solid #2a2540",
    borderRadius: "18px",
    padding: "16px 18px",
    marginBottom: "16px",
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    alignItems: "center",
  },
  infoTitle: {
    margin: "4px 0 0 0",
    fontSize: "1.35rem",
    color: "#f8fafc",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(80px, 1fr))",
    gap: "10px",
    flex: 1,
  },
  infoCard: {
    background: "#1f2030",
    border: "1px solid #3f3f56",
    borderRadius: "12px",
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  infoLabel: {
    fontSize: "0.72rem",
    color: "#a1a1aa",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  infoValue: {
    color: "#f8fafc",
    fontSize: "0.9rem",
  },
  controlPanel: {
    width: "100%",
    maxWidth: "980px",
    background: "#151522",
    border: "1px solid #2a2540",
    borderRadius: "18px",
    padding: "18px",
    display: "grid",
    gap: "16px",
    alignItems: "end",
    transition: "grid-template-columns 0.15s ease",
  },
  controlGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  controlLabel: {
    fontSize: "0.8rem",
    color: "#a1a1aa",
    fontWeight: "600",
  },
  select: {
    backgroundColor: "#1f2030",
    color: "#f8fafc",
    border: "1px solid #3f3f56",
    borderRadius: "10px",
    padding: "12px",
    outline: "none",
  },
  input: {
    backgroundColor: "#1f2030",
    color: "#f8fafc",
    border: "1px solid #3f3f56",
    borderRadius: "10px",
    padding: "12px",
    outline: "none",
  },
  slider: {
    width: "100%",
    accentColor: "#ec4899",
  },
  actionGroup: {
    display: "flex",
    gap: "10px",
  },
  btn: {
    padding: "14px 22px",
    fontSize: "0.9rem",
    fontWeight: "600",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  },
  btnPrimary: {
    backgroundColor: "#8b5cf6",
    color: "#ffffff",
    boxShadow: "0 4px 18px rgba(139, 92, 246, 0.45)",
  },
  btnSecondary: {
    backgroundColor: "#1f2030",
    color: "#d4d4d8",
    border: "1px solid #3f3f56",
  },
  graphCanvas: {
    position: "relative",
    width: "100%",
    height: "100%",
    maxWidth: "760px",
  },
  graphSvg: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    overflow: "visible",
  },
  positionedGraphNode: {
    position: "absolute",
    transform: "translate(-50%, -50%)",
  },
  graphNode: {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    fontWeight: "800",
    fontSize: "1.3rem",
    border: "2px solid rgba(255,255,255,0.2)",
    transition: "all 0.2s ease",
  },
};

