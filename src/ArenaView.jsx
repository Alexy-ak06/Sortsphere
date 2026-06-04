import React, { useEffect, useMemo, useState } from "react";
import { useSortVisualizer } from "./useSortVisualizer";

const DATASET_EXPLANATIONS = {
  Random: "General purpose random dataset.",
  "Nearly Sorted": "Ideal for testing Insertion Sort best-case behavior.",
  "Reverse Sorted": "Common worst-case scenario for many algorithms.",
  "Few Unique": "Tests handling of duplicate values.",
  Gaussian: "Bell-curve distribution similar to real-world data.",
  Mountain: "Ascending then descending values.",
  Adversarial: "Designed to expose worst-case pivot behavior in Quick Sort.",
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
        const u = Math.random(); const v = Math.random();
        const g = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
        return Math.max(40, Math.min(380, Math.floor(210 + g * 55)));
      });
    case "Mountain":
      return Array.from({ length: size }, (_, i) => {
        const m = size / 2;
        return i <= m ? Math.floor(40 + (340 * i) / m) : Math.floor(380 - (340 * (i - m)) / m);
      });
    case "Adversarial": return [...base];
    default: return Array.from({ length: size }, () => Math.floor(Math.random() * 340) + 40);
  }
};

export default function ArenaView({ styles }) {
  const [arraySize, setArraySize] = useState(30);
  const [speed, setSpeed] = useState(20);
  const [distributionType, setDistributionType] = useState("Random");
  const [ranking, setRanking] = useState([]);
  const [history, setHistory] = useState({});

  const bubble = useSortVisualizer(arraySize);
  const selection = useSortVisualizer(arraySize);
  const insertion = useSortVisualizer(arraySize);
  const merge = useSortVisualizer(arraySize);
  const quick = useSortVisualizer(arraySize);

  const engines = useMemo(() => [
    { name: "Bubble Sort", engine: bubble, run: bubble.runBubbleSort },
    { name: "Selection Sort", engine: selection, run: selection.runSelectionSort },
    { name: "Insertion Sort", engine: insertion, run: insertion.runInsertionSort },
    { name: "Merge Sort", engine: merge, run: merge.runMergeSort },
    { name: "Quick Sort", engine: quick, run: quick.runQuickSort },
  ], [bubble, selection, insertion, merge, quick]);

  const isRunning = engines.some((e) => e.engine.isSorting);

  const prepareArena = () => {
    const source = createDistributionArray(distributionType, arraySize);
    engines.forEach((e) => e.engine.loadArray([...source]));
    setRanking([]);
    setHistory({});
  };

  useEffect(() => {
    if (!isRunning) prepareArena();
  }, [arraySize, distributionType]);

  const startArena = async () => {
    if (isRunning) return;
    setRanking([]);
    const startTime = performance.now();

    const results = await Promise.all(
      engines.map(async (e) => {
        await e.run(speed, null, (point) => {
          setHistory((previous) => ({
            ...previous,
            [e.name]: [...(previous[e.name] || []), point].slice(-60),
          }));
        });

        return {
          name: e.name,
          time: Math.floor(performance.now() - startTime),
          comparisons: e.engine.metrics.comparisons,
          operations: e.engine.metrics.swaps,
        };
      })
    );

    const finalRanking = results.sort((a, b) => a.time - b.time);
    setRanking(finalRanking);
  };

  const renderGrowthGraph = (algorithmName) => {
    const points = history[algorithmName] || [];
    if (points.length < 2) return <div style={arenaStyles.graphPlaceholder}>Growth graph waiting...</div>;
    const maxComparisons = Math.max(...points.map((p) => p.comparisons), 1);
    const path = points.map((p, i) => {
      const x = (i / (points.length - 1)) * 100;
      const y = 100 - (p.comparisons / maxComparisons) * 100;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");
    return (
      <svg viewBox="0 0 100 100" style={arenaStyles.growthGraph} preserveAspectRatio="none">
        <path d={path} fill="none" stroke="#22c55e" strokeWidth="3" />
      </svg>
    );
  };

  return (
    <div style={arenaStyles.wrapper}>
      <section style={arenaStyles.controls}>
        <div style={styles.controlGroup}>
          <label style={styles.controlLabel}>Distribution</label>
          <select value={distributionType} disabled={isRunning} onChange={(e) => setDistributionType(e.target.value)} style={styles.select}>
            {["Random", "Nearly Sorted", "Reverse Sorted", "Few Unique", "Gaussian", "Mountain", "Adversarial"].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div style={styles.controlGroup}>
          <label style={styles.controlLabel}>Size: {arraySize}</label>
          <input type="range" min="10" max="60" value={arraySize} disabled={isRunning} onChange={(e) => setArraySize(Number(e.target.value))} style={styles.slider} />
        </div>
        <div style={styles.controlGroup}>
          <label style={styles.controlLabel}>Speed: {speed}ms</label>
          <input type="range" min="5" max="80" value={speed} disabled={isRunning} onChange={(e) => setSpeed(Number(e.target.value))} style={styles.slider} />
        </div>
        <button onClick={prepareArena} disabled={isRunning} style={{ ...styles.btn, ...styles.btnSecondary }}>Prepare</button>
        <button onClick={startArena} disabled={isRunning} style={{ ...styles.btn, ...styles.btnPrimary }}>{isRunning ? "Running..." : "Start Arena"}</button>
      </section>

      <section style={arenaStyles.datasetInfo}>
        <h3 style={{ margin: "0 0 6px 0" }}>{distributionType}</h3>
        <p style={{ margin: 0 }}>{DATASET_EXPLANATIONS[distributionType]}</p>
      </section>

      {ranking.length > 0 && ranking[0].time > 0 && (
        <section style={arenaStyles.championBanner}>
          <div>🏆 ARENA CHAMPION</div>
          <h2 style={{ margin: "8px 0" }}>{ranking[0].name}</h2>
          <div style={{ fontSize: "0.9rem", opacity: 0.8 }}>
            {(ranking[ranking.length - 1].time / ranking[0].time).toFixed(2)}x faster than {ranking[ranking.length - 1].name}
          </div>
        </section>
      )}

      {ranking.length > 0 && (
        <section style={arenaStyles.podium}>
          {ranking.slice(0, 3).map((e, i) => (
            <div key={e.name} style={arenaStyles.podiumCard}>
              <div style={arenaStyles.medal}>{["🥇", "🥈", "🥉"][i]}</div>
              <strong>{e.name}</strong> <span>{e.time}ms</span>
            </div>
          ))}
        </section>
      )}

      {ranking.length > 0 && (
        <section style={arenaStyles.statsTable}>
          <h2 style={arenaStyles.statsTitle}>Arena Statistics</h2>
          <table style={arenaStyles.table}>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Algorithm</th>
                <th>Comparisons</th>
                <th>Operations</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((algo, index) => (
                <tr key={algo.name} style={{ borderBottom: "1px solid #2a2540", height: "48px" }}>
                  <td>{index + 1}</td>
                  <td>{algo.name}</td>
                  <td>{algo.comparisons}</td>
                  <td>{algo.operations}</td>
                  <td>{algo.time}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section style={arenaStyles.grid}>
        {engines.map((e) => {
          const maxVal = Math.max(...e.engine.array, 1);
          return (
            <div key={e.name} style={arenaStyles.card}>
              <h2 style={arenaStyles.title}>{e.name}</h2>
              <div style={arenaStyles.progressTrack}>
                <div style={{ ...arenaStyles.progressBar, width: `${Math.min(100, (e.engine.metrics.comparisons / (arraySize * arraySize)) * 100)}%` }} />
              </div>
              {renderGrowthGraph(e.name)}
              <div style={arenaStyles.stage}>
                {e.engine.array.map((val, idx) => (
                  <div key={idx} style={{
                    width: `${Math.max(2, 180 / arraySize)}px`,
                    height: "100%",
                    transform: `scaleY(${val / maxVal})`,
                    transformOrigin: "bottom",
                    transition: "transform 0.08s linear",
                    willChange: "transform",
                    backgroundColor: e.engine.barColors[idx],
                    margin: "0 1px",
                    borderRadius: "4px 4px 0 0"
                  }} />
                ))}
              </div>
              <div style={arenaStyles.metrics}>
                <span>Comp: {e.engine.metrics.comparisons}</span>
                <span>Ops: {e.engine.metrics.swaps}</span>
                <span>Time: {e.engine.metrics.timeElapsed}ms</span>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}

const arenaStyles = {
  wrapper: { width: "100%", maxWidth: "1400px", display: "flex", flexDirection: "column", gap: "18px" },
  controls: { background: "#151522", border: "1px solid #2a2540", borderRadius: "18px", padding: "18px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto auto", gap: "16px", alignItems: "end" },
  datasetInfo: { background: "#151522", border: "1px solid #2a2540", borderRadius: "18px", padding: "16px", color: "#d4d4d8" },
  championBanner: { background: "#22c55e", color: "#000", padding: "20px", borderRadius: "12px", textAlign: "center", fontWeight: "900", fontSize: "1.5rem" },
  podium: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" },
  podiumCard: { background: "linear-gradient(to right, #8b5cf6, #ec4899)", color: "#fff", borderRadius: "18px", padding: "18px", textAlign: "center", display: "flex", flexDirection: "column", gap: "6px", fontWeight: "800" },
  medal: { fontSize: "2rem" },
  statsTable: { background: "#151522", border: "1px solid #2a2540", borderRadius: "18px", padding: "20px" },
  statsTitle: { color: "#f8fafc", marginBottom: "16px", textAlign: "center" },
  table: { width: "100%", borderCollapse: "collapse", color: "#f8fafc", textAlign: "center" },
  grid: { display: "grid", gridTemplateColumns: "repeat(5, minmax(180px, 1fr))", gap: "16px" },
  card: { background: "#151522", border: "1px solid #2a2540", borderRadius: "18px", padding: "14px" },
  title: { color: "#f8fafc", fontSize: "0.95rem", margin: "0 0 10px 0", textAlign: "center" },
  stage: { height: "300px", display: "flex", alignItems: "flex-end", justifyContent: "center", background: "#09050f", borderRadius: "14px", padding: "12px", overflow: "hidden" },
  metrics: { display: "grid", gap: "6px", marginTop: "10px", color: "#d4d4d8", fontSize: "0.78rem", textAlign: "center" },
  progressTrack: { height: "8px", background: "#1f2937", borderRadius: "999px", overflow: "hidden", marginBottom: "10px" },
  progressBar: { height: "100%", background: "#22c55e" },
  growthGraph: { width: "100%", height: "80px", background: "#020617", borderRadius: "10px", marginBottom: "10px", padding: "6px" },
  graphPlaceholder: { height: "80px", background: "#020617", borderRadius: "10px", marginBottom: "10px", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem" }
};