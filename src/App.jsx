import React, { useEffect, useMemo, useState } from "react";
import { useSortVisualizer } from "./useSortVisualizer";
import { useSearchVisualizer } from "./useSearchVisualizer";

export default function App() {
  const [mode, setMode] = useState("Sorting");
  const [arraySize, setArraySize] = useState(35);
  const [speed, setSpeed] = useState(30);
  const [selectedSortAlgorithm, setSelectedSortAlgorithm] = useState("Bubble Sort");
  const [selectedSearchAlgorithm, setSelectedSearchAlgorithm] = useState("Linear Search");
  const [targetValue, setTargetValue] = useState(120);

  const sortVisualizer = useSortVisualizer(arraySize);
  const searchVisualizer = useSearchVisualizer(arraySize);

  const isSortingMode = mode === "Sorting";

  const sortingRegistry = useMemo(
    () => ({
      "Bubble Sort": {
        action: sortVisualizer.runBubbleSort,
        best: "O(n)",
        average: "O(n²)",
        worst: "O(n²)",
        space: "O(1)",
        stable: "Yes",
      },
      "Selection Sort": {
        action: sortVisualizer.runSelectionSort,
        best: "O(n²)",
        average: "O(n²)",
        worst: "O(n²)",
        space: "O(1)",
        stable: "No",
      },
      "Insertion Sort": {
        action: sortVisualizer.runInsertionSort,
        best: "O(n)",
        average: "O(n²)",
        worst: "O(n²)",
        space: "O(1)",
        stable: "Yes",
      },
      "Merge Sort": {
        action: sortVisualizer.runMergeSort,
        best: "O(n log n)",
        average: "O(n log n)",
        worst: "O(n log n)",
        space: "O(n)",
        stable: "Yes",
      },
      "Quick Sort": {
        action: sortVisualizer.runQuickSort,
        best: "O(n log n)",
        average: "O(n log n)",
        worst: "O(n²)",
        space: "O(log n)",
        stable: "No",
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
      },
      "Binary Search": {
        action: searchVisualizer.runBinarySearch,
        best: "O(1)",
        average: "O(log n)",
        worst: "O(log n)",
        space: "O(1)",
        requirement: "Sorted array",
      },
    }),
    [searchVisualizer.runLinearSearch, searchVisualizer.runBinarySearch]
  );

  const activeArray = isSortingMode ? sortVisualizer.array : searchVisualizer.array;
  const activeColors = isSortingMode ? sortVisualizer.barColors : searchVisualizer.barColors;
  const activeMetrics = isSortingMode ? sortVisualizer.metrics : searchVisualizer.metrics;
  const isRunning = isSortingMode ? sortVisualizer.isSorting : searchVisualizer.isSearching;
  
  const activeAlgorithm = isSortingMode
    ? sortingRegistry[selectedSortAlgorithm]
    : searchingRegistry[selectedSearchAlgorithm];
useEffect(() => {
  if (isSortingMode) {
    sortVisualizer.generateNewArray();
  } else {
    searchVisualizer.generateNewArray(
      selectedSearchAlgorithm === "Binary Search"
    );
  }
}, [
  arraySize,
  mode,
  selectedSearchAlgorithm,
  sortVisualizer.generateNewArray,
  searchVisualizer.generateNewArray,
]);
  
    
  const handleGenerate = () => {
    if (isSortingMode) {
      sortVisualizer.generateNewArray();
    } else {
      searchVisualizer.generateNewArray(selectedSearchAlgorithm === "Binary Search");
    }
  };

  const handleStart = async () => {
    if (isRunning) return;

    if (isSortingMode) {
      await activeAlgorithm.action(speed);
    } else {
      await activeAlgorithm.action(Number(targetValue), speed);
    }
  };

  return (
    <div style={styles.dashboardContainer}>
      <header style={styles.header}>
        <h1 style={styles.logo}>
          🌌 SortSphere <span style={styles.badge}>v2.0 DSA Lab</span>
        </h1>
        <p style={styles.subtitle}>
          Interactive Sorting and Searching Algorithm Visualization Laboratory
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
      </section>

      <section style={styles.hudPanel}>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Comparisons</span>
          <span style={styles.metricValue}>{activeMetrics.comparisons}</span>
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

      <main style={styles.stage}>
        {activeArray.map((value, idx) => (
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
        ))}
      </main>

      <section style={styles.legend}>
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendDot, backgroundColor: "#8b5cf6" }} />
          Default
        </div>
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendDot, backgroundColor: "#ec4899" }} />
          {isSortingMode ? "Comparing" : "Checking"}
        </div>
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendDot, backgroundColor: "#f97316" }} />
          {isSortingMode ? "Writing" : "Active"}
        </div>
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendDot, backgroundColor: "#22c55e" }} />
          {isSortingMode ? "Sorted" : "Found"}
        </div>
        {!isSortingMode && (
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
            {isSortingMode ? selectedSortAlgorithm : selectedSearchAlgorithm}
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
              {isSortingMode ? "Stable" : "Requirement"}
            </span>
            <strong style={styles.infoValue}>
              {isSortingMode ? activeAlgorithm.stable : activeAlgorithm.requirement}
            </strong>
          </div>
        </div>
      </section>

      <section 
        style={{ 
          ...styles.controlPanel, 
          gridTemplateColumns: isSortingMode ? "1fr 1fr 1fr auto" : "1fr 1fr 1fr 1fr auto" 
        }}
      >
        <div style={styles.controlGroup}>
          <label style={styles.controlLabel}>Algorithm</label>
          <select
            value={isSortingMode ? selectedSortAlgorithm : selectedSearchAlgorithm}
            disabled={isRunning}
            onChange={(event) =>
              isSortingMode
                ? setSelectedSortAlgorithm(event.target.value)
                : setSelectedSearchAlgorithm(event.target.value)
            }
            style={styles.select}
          >
            {Object.keys(isSortingMode ? sortingRegistry : searchingRegistry).map(
              (algorithm) => (
                <option key={algorithm} value={algorithm}>
                  {algorithm}
                </option>
              )
            )}
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

        {!isSortingMode && (
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
          <button
            onClick={handleGenerate}
            disabled={isRunning}
            style={{
              ...styles.btn,
              ...styles.btnSecondary,
              opacity: isRunning ? 0.5 : 1,
            }}
          >
          {!isSortingMode && (
  <button
    onClick={() => {
      const randomValue =
        activeArray[Math.floor(Math.random() * activeArray.length)];
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
            Generate Array
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
            {isRunning ? "Engine Active..." : isSortingMode ? "Start Sorting" : "Start Search"}
          </button>
        </div>
      </section>
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
  stage: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    height: "340px",
    width: "100%",
    maxWidth: "980px",
    background: "radial-gradient(circle at center, #1d1638 0%, #09050f 100%)",
    border: "1px solid #31244f",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 30px 80px rgba(139, 92, 246, 0.18)",
    marginBottom: "16px",
    overflow: "hidden",
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
};