
import React, { useMemo, useState, useEffect } from "react";
import { useSortVisualizer } from "./useSortVisualizer";

const COMPLEXITY = {
  "Bubble Sort": "O(n²)",
  "Selection Sort": "O(n²)",
  "Insertion Sort": "O(n²)",
  "Merge Sort": "O(n log n)",
  "Quick Sort": "O(n log n)",
};

const getPrediction = (algoA, algoB, distributionType) => {
  const strongChoices = {
    "Nearly Sorted": "Insertion Sort",
    "Reverse Sorted": "Merge Sort",
    "Few Unique": "Merge Sort",
    Gaussian: "Quick Sort",
    Mountain: "Merge Sort",
    Random: "Quick Sort",
  };
  const predicted = strongChoices[distributionType];
  if (algoA === predicted) return algoA;
  if (algoB === predicted) return algoB;
  return COMPLEXITY[algoA] === "O(n log n)" ? algoA : algoB;
};

const createDistributionArray = (type, size) => {
  const base = Array.from({ length: size }, (_, i) => Math.floor((i + 1) * (340 / size)) + 40);
  switch (type) {
    case "Nearly Sorted":
      const values = [...base];
      for (let i = 0; i < Math.max(1, Math.floor(size / 5)); i++) {
        const [a, b] = [Math.floor(Math.random() * size), Math.floor(Math.random() * size)];
        [values[a], values[b]] = [values[b], values[a]];
      }
      return values;
    case "Reverse Sorted": return [...base].reverse();
    case "Few Unique":
      const u = [80, 160, 240, 320];
      return Array.from({ length: size }, () => u[Math.floor(Math.random() * u.length)]);
    case "Gaussian":
      return Array.from({ length: size }, () => {
        const u = Math.random();
        const v = Math.random();
        const gaussian = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
        return Math.max(40, Math.min(380, Math.floor(210 + gaussian * 55)));
      });
    case "Mountain":
      return Array.from({ length: size }, (_, i) => {
        const midpoint = size / 2;
        if (i <= midpoint) return Math.floor(40 + (340 * i) / midpoint);
        return Math.floor(380 - (340 * (i - midpoint)) / midpoint);
      });
    default: return Array.from({ length: size }, () => Math.floor(Math.random() * 340) + 40);
  }
};

export default function ComparisonView({ styles }) {
  const [arraySize, setArraySize] = useState(35);
  const [speed, setSpeed] = useState(30);
  const [distributionType, setDistributionType] = useState("Random");
  const [algoA, setAlgoA] = useState("Bubble Sort");
  const [algoB, setAlgoB] = useState("Merge Sort");
  const [winner, setWinner] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);

  const left = useSortVisualizer(arraySize);
  const right = useSortVisualizer(arraySize);
  const isRunning = left.isSorting || right.isSorting;
  const predictedWinner = getPrediction(algoA, algoB, distributionType);

  const ALGORITHM_MAP = useMemo(() => ({
    "Bubble Sort": { left: left.runBubbleSort, right: right.runBubbleSort },
    "Selection Sort": { left: left.runSelectionSort, right: right.runSelectionSort },
    "Insertion Sort": { left: left.runInsertionSort, right: right.runInsertionSort },
    "Merge Sort": { left: left.runMergeSort, right: right.runMergeSort },
    "Quick Sort": { left: left.runQuickSort, right: right.runQuickSort },
  }), [left, right]);

  useEffect(() => {
    if (isRunning) return;
    const source = createDistributionArray(distributionType, arraySize);
    left.loadArray([...source]);
    right.loadArray([...source]);
    setWinner(null);
  }, [arraySize, distributionType]);

  useEffect(() => {
    if (hasStarted && !left.isSorting && !right.isSorting) {
      if (left.metrics.timeElapsed < right.metrics.timeElapsed) setWinner(algoA);
      else if (right.metrics.timeElapsed < left.metrics.timeElapsed) setWinner(algoB);
      else setWinner("Tie");
      setHasStarted(false);
    }
  }, [left.isSorting, right.isSorting, hasStarted]);

  const startComparison = async () => {
    if (isRunning || left.array.length === 0) return;
    setWinner(null);
    setHasStarted(true);
    ALGORITHM_MAP[algoA].left(speed);
    ALGORITHM_MAP[algoB].right(speed);
  };

  return (
    <div style={compareStyles.wrapper}>
      <section style={compareStyles.controls}>
        <div style={styles.controlGroup}>
          <label style={styles.controlLabel}>Algorithm A</label>
          <select value={algoA} disabled={isRunning} onChange={(e) => setAlgoA(e.target.value)} style={styles.select}>
            {Object.keys(ALGORITHM_MAP).map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div style={styles.controlGroup}>
          <label style={styles.controlLabel}>Algorithm B</label>
          <select value={algoB} disabled={isRunning} onChange={(e) => setAlgoB(e.target.value)} style={styles.select}>
            {Object.keys(ALGORITHM_MAP).map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div style={styles.controlGroup}>
          <label style={styles.controlLabel}>Distribution</label>
          <select value={distributionType} disabled={isRunning} onChange={(e) => setDistributionType(e.target.value)} style={styles.select}>
            <option value="Random">Random</option>
            <option value="Nearly Sorted">Nearly Sorted</option>
            <option value="Reverse Sorted">Reverse Sorted</option>
            <option value="Few Unique">Few Unique</option>
            <option value="Gaussian">Gaussian</option>
            <option value="Mountain">Mountain</option>
          </select>
        </div>
        <div style={styles.controlGroup}>
          <label style={styles.controlLabel}>Size: {arraySize}</label>
          <input type="range" min="10" max="80" value={arraySize} disabled={isRunning} onChange={(e) => setArraySize(Number(e.target.value))} style={styles.slider} />
        </div>
        <div style={styles.controlGroup}>
          <label style={styles.controlLabel}>Speed: {speed}ms</label>
          <input type="range" min="5" max="120" value={speed} disabled={isRunning} onChange={(e) => setSpeed(Number(e.target.value))} style={styles.slider} />
        </div>
        <div style={compareStyles.buttonGroup}>
          <button onClick={startComparison} disabled={isRunning || left.array.length === 0} style={{...styles.btn, ...styles.btnPrimary}}>Start Compare</button>
        </div>
      </section>

      <section style={compareStyles.oracle}>
        🔮 Oracle Prediction: {predictedWinner} is likely to win on {distributionType} data.
      </section>

      <section style={compareStyles.grid}>
        {renderCard(left, algoA, arraySize)}
        {renderCard(right, algoB, arraySize)}
      </section>

      {winner && (
        <section style={compareStyles.winner}>
          {winner === "Tie" ? "Result: Tie" : (
            <>
              🏆 Winner: {winner}
              <div style={compareStyles.winnerSubtext}>
                {winner === algoA
                  ? `${(right.metrics.timeElapsed / left.metrics.timeElapsed).toFixed(2)}x faster • ${Math.abs(left.metrics.comparisons - right.metrics.comparisons)} comparison difference`
                  : `${(left.metrics.timeElapsed / right.metrics.timeElapsed).toFixed(2)}x faster • ${Math.abs(left.metrics.comparisons - right.metrics.comparisons)} comparison difference`}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}

function renderCard(viz, name, arraySize) {
  const maxValue = Math.max(...viz.array, 1);
  return (
    <div style={compareStyles.card}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2 style={compareStyles.title}>{name}</h2>
        <span style={compareStyles.badge}>{COMPLEXITY[name]}</span>
      </div>
      <div style={compareStyles.progressTrack}>
        <div style={{...compareStyles.progressBar, width: `${(viz.metrics.comparisons / (arraySize * 5)) * 100}%`}} />
      </div>
      <div style={compareStyles.visualStage}>
        {viz.array.map((val, i) => (
          <div key={i} style={{ width: `${320/arraySize}px`, height: `${(val / maxValue) * 100}%`, backgroundColor: viz.barColors ? viz.barColors[i] : "#475569", margin: "0 1px" }} />
        ))}
      </div>
      <div style={compareStyles.metrics}>
        <span>Comp: {viz.metrics.comparisons}</span>
        <span>Ops: {viz.metrics.swaps}</span>
        <span>Time: {viz.metrics.timeElapsed}ms</span>
      </div>
    </div>
  );
}

const compareStyles = {
  wrapper: { width: "100%", maxWidth: "1180px", display: "flex", flexDirection: "column", gap: "18px" },
  controls: { background: "#151522", border: "1px solid #2a2540", borderRadius: "18px", padding: "18px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr auto", gap: "16px", alignItems: "end" },
  buttonGroup: { display: "flex", gap: "10px" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
  card: { background: "#151522", border: "1px solid #2a2540", borderRadius: "18px", padding: "18px" },
  title: { color: "#f8fafc", fontSize: "1.15rem", margin: "0 0 12px 0" },
  badge: { background: "#ec4899", color: "#fff", padding: "2px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "bold" },
  progressTrack: { height: "6px", background: "#31244f", borderRadius: "3px", marginBottom: "10px", overflow: "hidden" },
  progressBar: { height: "100%", background: "#22c55e", transition: "width 0.3s ease" },
  visualStage: { height: "380px", display: "flex", alignItems: "flex-end", justifyContent: "center", background: "#09050f", borderRadius: "14px", padding: "20px 18px 18px 18px", overflow: "hidden" },
  metrics: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginTop: "12px", color: "#d4d4d8", fontSize: "0.85rem" },
  winner: { background: "linear-gradient(to right, #8b5cf6, #ec4899)", color: "#fff", borderRadius: "18px", padding: "16px", textAlign: "center", fontWeight: "800", fontSize: "1.2rem" },
  winnerSubtext: { marginTop: "6px", fontSize: "0.9rem", fontWeight: "600", opacity: 0.9 },
  oracle: { background: "#151522", border: "1px solid #ec4899", borderRadius: "18px", padding: "14px 18px", color: "#f8fafc", fontWeight: "700", textAlign: "center" }
};

