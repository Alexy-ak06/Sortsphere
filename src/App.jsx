import React, { useEffect, useMemo, useState } from "react";
import { useSortVisualizer } from "./useSortVisualizer";

export default function App() {
  const [arraySize, setArraySize] = useState(35);
  const [speed, setSpeed] = useState(30);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("Bubble Sort");

  const {
    array,
    barColors,
    isSorting,
    metrics,
    generateNewArray,
    runBubbleSort,
    runSelectionSort,
    runInsertionSort,
    runMergeSort,
    runQuickSort,
  } = useSortVisualizer(arraySize);

  const algorithmRegistry = useMemo(
    () => ({
      "Bubble Sort": {
        action: runBubbleSort,
        best: "O(n)",
        average: "O(n²)",
        worst: "O(n²)",
        space: "O(1)",
        stable: "Yes",
      },
      "Selection Sort": {
        action: runSelectionSort,
        best: "O(n²)",
        average: "O(n²)",
        worst: "O(n²)",
        space: "O(1)",
        stable: "No",
      },
      "Insertion Sort": {
        action: runInsertionSort,
        best: "O(n)",
        average: "O(n²)",
        worst: "O(n²)",
        space: "O(1)",
        stable: "Yes",
      },
      "Merge Sort": {
        action: runMergeSort,
        best: "O(n log n)",
        average: "O(n log n)",
        worst: "O(n log n)",
        space: "O(n)",
        stable: "Yes",
      },
      "Quick Sort": {
  action: runQuickSort,
  best: "O(n log n)",
  average: "O(n log n)",
  worst: "O(n²)",
  space: "O(log n)",
  stable: "No",
},
    }),
    [runBubbleSort, runSelectionSort, runInsertionSort, runMergeSort, runQuickSort]
  );

  useEffect(() => {
    generateNewArray();
  }, [arraySize, generateNewArray]);

  const activeAlgorithm = algorithmRegistry[selectedAlgorithm];

  const handleStart = async () => {
    if (isSorting) return;
    await activeAlgorithm.action(speed);
  };

  return (
    <div style={styles.dashboardContainer}>
      <header style={styles.header}>
        <h1 style={styles.logo}>
          🌌 SortSphere <span style={styles.badge}>v1.4 Merge Lab</span>
        </h1>
        <p style={styles.subtitle}>
          Interactive Algorithm Visualization Laboratory
        </p>
      </header>

      <section style={styles.hudPanel}>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Comparisons</span>
          <span style={styles.metricValue}>{metrics.comparisons}</span>
        </div>

        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Writes / Operations</span>
          <span style={styles.metricValue}>{metrics.swaps}</span>
        </div>

        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Execution Time</span>
          <span style={styles.metricValue}>
            {metrics.timeElapsed ? `${metrics.timeElapsed}ms` : "--"}
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
        {array.map((value, idx) => (
          <div
            key={idx}
            style={{
              width: `${Math.max(4, 560 / array.length)}px`,
              height: `${value}px`,
              backgroundColor: barColors[idx],
              boxShadow: `0 0 12px ${barColors[idx]}`,
              margin: "0 2px",
              borderRadius: "8px 8px 0 0",
              transition:
                "background-color 0.05s ease, height 0.05s ease, box-shadow 0.05s ease",
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
          Comparing
        </div>
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendDot, backgroundColor: "#f97316" }} />
          Writing
        </div>
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendDot, backgroundColor: "#22c55e" }} />
          Sorted
        </div>
      </section>

      <section style={styles.algorithmInfo}>
        <div>
          <span style={styles.infoLabel}>Selected Algorithm</span>
          <h2 style={styles.infoTitle}>{selectedAlgorithm}</h2>
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
            <span style={styles.infoLabel}>Stable</span>
            <strong style={styles.infoValue}>{activeAlgorithm.stable}</strong>
          </div>
        </div>
      </section>

      <section style={styles.controlPanel}>
        <div style={styles.controlGroup}>
          <label style={styles.controlLabel}>Algorithm</label>
          <select
            value={selectedAlgorithm}
            disabled={isSorting}
            onChange={(event) => setSelectedAlgorithm(event.target.value)}
            style={styles.select}
          >
            {Object.keys(algorithmRegistry).map((algorithm) => (
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
            disabled={isSorting}
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
            disabled={isSorting}
            onChange={(event) => setArraySize(Number(event.target.value))}
            style={styles.slider}
          />
        </div>

        <div style={styles.actionGroup}>
          <button
            onClick={generateNewArray}
            disabled={isSorting}
            style={{
              ...styles.btn,
              ...styles.btnSecondary,
              opacity: isSorting ? 0.5 : 1,
            }}
          >
            Generate Array
          </button>

          <button
            onClick={handleStart}
            disabled={isSorting}
            style={{
              ...styles.btn,
              ...styles.btnPrimary,
              opacity: isSorting ? 0.5 : 1,
            }}
          >
            {isSorting ? "Engine Active..." : "Start Sorting"}
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
    marginBottom: "22px",
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
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#f8fafc",
  },
  stage: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    height: "360px",
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
    fontSize: "0.95rem",
  },
  controlPanel: {
    width: "100%",
    maxWidth: "980px",
    background: "#151522",
    border: "1px solid #2a2540",
    borderRadius: "18px",
    padding: "18px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr auto",
    gap: "16px",
    alignItems: "end",
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