
import { useCallback, useRef, useState } from "react";

const defaultColor = "#8b5cf6";
const checkingColor = "#ec4899";
const foundColor = "#22c55e";
const rejectedColor = "#ef4444";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function useSearchVisualizer(size = 35) {
  const [array, setArray] = useState([]);
  const [barColors, setBarColors] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [metrics, setMetrics] = useState({
    comparisons: 0,
    timeElapsed: 0,
    result: "Idle",
  });

  const activeSearchToken = useRef(0);

  const generateNewArray = useCallback(
    (shouldSort = false) => {
      activeSearchToken.current++;
      setIsSearching(false);

      let values = Array.from(
        { length: size },
        () => Math.floor(Math.random() * 340) + 40
      );

      if (shouldSort) {
        values.sort((a, b) => a - b);
      }

      setArray(values);
      setBarColors(Array(size).fill(defaultColor));
      setMetrics({
        comparisons: 0,
        timeElapsed: 0,
        result: "Idle",
      });
    },
    [size]
  );

  const updateVisualizerState = (
    currentColors,
    comparisons,
    result,
    startTime
  ) => {
    setBarColors([...currentColors]);
    setMetrics({
      comparisons,
      result,
      timeElapsed: Math.floor(performance.now() - startTime),
    });
  };

  const isCancelled = (token) => token !== activeSearchToken.current;

  const runLinearSearch = async (target, speed = 30, onLineExecute) => {
    if (isSearching) return;

    setIsSearching(true);

    const currentToken = ++activeSearchToken.current;
    const colors = Array(array.length).fill(defaultColor);
    let comparisons = 0;
    const startTime = performance.now();

    onLineExecute?.(0);
    await sleep(speed * 0.35);

    for (let index = 0; index < array.length; index++) {
      if (isCancelled(currentToken)) {
        setIsSearching(false);
        return;
      }

      comparisons++;
      colors[index] = checkingColor;
      updateVisualizerState(colors, comparisons, "Searching", startTime);

      await sleep(speed);

      onLineExecute?.(1);
      await sleep(speed * 0.35);

      if (array[index] === target) {
        onLineExecute?.(2);
        await sleep(speed * 0.35);

        colors[index] = foundColor;
        updateVisualizerState(
          colors,
          comparisons,
          `Found at index ${index}`,
          startTime
        );
        setIsSearching(false);
        return;
      }

      colors[index] = rejectedColor;
      updateVisualizerState(colors, comparisons, "Searching", startTime);

      await sleep(speed);
    }

    onLineExecute?.(3);
    await sleep(speed * 0.35);

    updateVisualizerState(colors, comparisons, "Not Found", startTime);
    setIsSearching(false);
  };

  const runBinarySearch = async (target, speed = 30, onLineExecute) => {
    if (isSearching) return;

    setIsSearching(true);

    const currentToken = ++activeSearchToken.current;
    const colors = Array(array.length).fill(defaultColor);
    let comparisons = 0;
    const startTime = performance.now();

    let left = 0;
    let right = array.length - 1;

    onLineExecute?.(0);
    await sleep(speed * 0.35);

    while (left <= right) {
      if (isCancelled(currentToken)) {
        setIsSearching(false);
        return;
      }

      const mid = Math.floor((left + right) / 2);

      onLineExecute?.(1);
      await sleep(speed * 0.35);

      comparisons++;
      colors[mid] = checkingColor;
      updateVisualizerState(colors, comparisons, "Searching", startTime);

      await sleep(speed);

      onLineExecute?.(2);
      await sleep(speed * 0.35);

      if (array[mid] === target) {
        colors[mid] = foundColor;
        updateVisualizerState(
          colors,
          comparisons,
          `Found at index ${mid}`,
          startTime
        );
        setIsSearching(false);
        return;
      }

      if (array[mid] < target) {
        onLineExecute?.(3);
        await sleep(speed * 0.35);

        for (let i = left; i <= mid; i++) {
          colors[i] = rejectedColor;
        }

        onLineExecute?.(4);
        await sleep(speed * 0.35);

        left = mid + 1;
      } else {
        onLineExecute?.(5);
        await sleep(speed * 0.35);

        for (let i = mid; i <= right; i++) {
          colors[i] = rejectedColor;
        }

        right = mid - 1;
      }

      updateVisualizerState(colors, comparisons, "Searching", startTime);

      await sleep(speed);
    }

    onLineExecute?.(6);
    await sleep(speed * 0.35);

    updateVisualizerState(colors, comparisons, "Not Found", startTime);
    setIsSearching(false);
  };

  return {
    array,
    barColors,
    isSearching,
    metrics,
    generateNewArray,
    runLinearSearch,
    runBinarySearch,
  };
}

