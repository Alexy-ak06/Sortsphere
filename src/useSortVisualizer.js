import { useCallback, useRef, useState } from "react";

const defaultColor = "#8b5cf6";
const compareColor = "#ec4899";
const swapColor = "#f97316";
const sortedColor = "#22c55e";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function useSortVisualizer(size = 35) {
  const [array, setArray] = useState([]);
  const [barColors, setBarColors] = useState([]);
  const [isSorting, setIsSorting] = useState(false);
  const [metrics, setMetrics] = useState({
    comparisons: 0,
    swaps: 0,
    timeElapsed: 0,
  });

  const activeSortToken = useRef(0);

  const generateNewArray = useCallback(() => {
    activeSortToken.current++;
    setIsSorting(false);

    const values = Array.from(
      { length: size },
      () => Math.floor(Math.random() * 340) + 40
    );

    setArray(values);
    setBarColors(Array(size).fill(defaultColor));
    setMetrics({
      comparisons: 0,
      swaps: 0,
      timeElapsed: 0,
    });
  }, [size]);

  const updateVisualizerState = (
    currentArray,
    currentColors,
    comparisons,
    operations,
    startTime
  ) => {
    setArray([...currentArray]);
    setBarColors([...currentColors]);
    setMetrics({
      comparisons,
      swaps: operations,
      timeElapsed: Math.floor(performance.now() - startTime),
    });
  };

  const isCancelled = (token) => token !== activeSortToken.current;

  const runBubbleSort = async (speed = 30) => {
    if (isSorting) return;

    setIsSorting(true);

    const currentToken = ++activeSortToken.current;
    const values = [...array];
    const colors = Array(values.length).fill(defaultColor);
    let comparisons = 0;
    let operations = 0;
    const startTime = performance.now();

    for (let i = 0; i < values.length - 1; i++) {
      for (let j = 0; j < values.length - i - 1; j++) {
        if (isCancelled(currentToken)) {
          setIsSorting(false);
          return;
        }

        comparisons++;
        colors[j] = compareColor;
        colors[j + 1] = compareColor;
        updateVisualizerState(values, colors, comparisons, operations, startTime);

        await sleep(speed);

        if (values[j] > values[j + 1]) {
          operations++;
          colors[j] = swapColor;
          colors[j + 1] = swapColor;
          updateVisualizerState(values, colors, comparisons, operations, startTime);

          await sleep(speed);

          [values[j], values[j + 1]] = [values[j + 1], values[j]];
        }

        colors[j] = defaultColor;
        colors[j + 1] = defaultColor;
      }

      colors[values.length - i - 1] = sortedColor;
      updateVisualizerState(values, colors, comparisons, operations, startTime);
    }

    colors[0] = sortedColor;
    updateVisualizerState(values, colors, comparisons, operations, startTime);
    setIsSorting(false);
  };

  const runSelectionSort = async (speed = 30) => {
    if (isSorting) return;

    setIsSorting(true);

    const currentToken = ++activeSortToken.current;
    const values = [...array];
    const colors = Array(values.length).fill(defaultColor);
    let comparisons = 0;
    let operations = 0;
    const startTime = performance.now();

    for (let i = 0; i < values.length; i++) {
      let minIndex = i;
      colors[minIndex] = swapColor;

      for (let j = i + 1; j < values.length; j++) {
        if (isCancelled(currentToken)) {
          setIsSorting(false);
          return;
        }

        comparisons++;
        colors[j] = compareColor;
        updateVisualizerState(values, colors, comparisons, operations, startTime);

        await sleep(speed);

        if (values[j] < values[minIndex]) {
          colors[minIndex] = defaultColor;
          minIndex = j;
          colors[minIndex] = swapColor;
        } else {
          colors[j] = defaultColor;
        }
      }

      if (minIndex !== i) {
        operations++;
        [values[i], values[minIndex]] = [values[minIndex], values[i]];
      }

      colors[minIndex] = defaultColor;
      colors[i] = sortedColor;
      updateVisualizerState(values, colors, comparisons, operations, startTime);
    }

    setIsSorting(false);
  };

  const runInsertionSort = async (speed = 30) => {
    if (isSorting) return;

    setIsSorting(true);

    const currentToken = ++activeSortToken.current;
    const values = [...array];
    const colors = Array(values.length).fill(defaultColor);
    let comparisons = 0;
    let operations = 0;
    const startTime = performance.now();

    if (values.length > 0) {
      colors[0] = sortedColor;
      updateVisualizerState(values, colors, comparisons, operations, startTime);
    }

    for (let i = 1; i < values.length; i++) {
      if (isCancelled(currentToken)) {
        setIsSorting(false);
        return;
      }

      const key = values[i];
      let j = i - 1;

      colors[i] = compareColor;
      updateVisualizerState(values, colors, comparisons, operations, startTime);

      await sleep(speed);

      while (j >= 0) {
        if (isCancelled(currentToken)) {
          setIsSorting(false);
          return;
        }

        comparisons++;

        if (values[j] <= key) break;

        operations++;
        colors[j] = swapColor;
        colors[j + 1] = swapColor;
        values[j + 1] = values[j];

        updateVisualizerState(values, colors, comparisons, operations, startTime);

        await sleep(speed);

        colors[j] = sortedColor;
        colors[j + 1] = sortedColor;
        j--;
      }

      values[j + 1] = key;

      for (let index = 0; index <= i; index++) {
        colors[index] = sortedColor;
      }

      updateVisualizerState(values, colors, comparisons, operations, startTime);
    }

    colors.fill(sortedColor);
    updateVisualizerState(values, colors, comparisons, operations, startTime);
    setIsSorting(false);
  };

  const runMergeSort = async (speed = 30) => {
    if (isSorting) return;

    setIsSorting(true);

    const currentToken = ++activeSortToken.current;
    const values = [...array];
    const colors = Array(values.length).fill(defaultColor);
    let comparisons = 0;
    let operations = 0;
    const startTime = performance.now();

    const markRange = (left, right, color) => {
      for (let index = left; index <= right; index++) {
        colors[index] = color;
      }
    };

    const merge = async (left, mid, right) => {
      const leftArray = values.slice(left, mid + 1);
      const rightArray = values.slice(mid + 1, right + 1);

      let i = 0;
      let j = 0;
      let k = left;

      markRange(left, right, compareColor);
      updateVisualizerState(values, colors, comparisons, operations, startTime);

      await sleep(speed);

      while (i < leftArray.length && j < rightArray.length) {
        if (isCancelled(currentToken)) {
          setIsSorting(false);
          return;
        }

        comparisons++;

        if (leftArray[i] <= rightArray[j]) {
          values[k] = leftArray[i];
          i++;
        } else {
          values[k] = rightArray[j];
          j++;
        }

        operations++;
        colors[k] = swapColor;
        updateVisualizerState(values, colors, comparisons, operations, startTime);

        await sleep(speed);

        colors[k] = compareColor;
        k++;
      }

      while (i < leftArray.length) {
        if (isCancelled(currentToken)) {
          setIsSorting(false);
          return;
        }

        values[k] = leftArray[i];
        operations++;
        colors[k] = swapColor;
        updateVisualizerState(values, colors, comparisons, operations, startTime);

        await sleep(speed);

        colors[k] = compareColor;
        i++;
        k++;
      }

      while (j < rightArray.length) {
        if (isCancelled(currentToken)) {
          setIsSorting(false);
          return;
        }

        values[k] = rightArray[j];
        operations++;
        colors[k] = swapColor;
        updateVisualizerState(values, colors, comparisons, operations, startTime);

        await sleep(speed);

        colors[k] = compareColor;
        j++;
        k++;
      }

      markRange(left, right, defaultColor);
      updateVisualizerState(values, colors, comparisons, operations, startTime);
    };

    const mergeSortHelper = async (left, right) => {
      if (isCancelled(currentToken)) {
        setIsSorting(false);
        return;
      }

      if (left >= right) return;

      const mid = Math.floor((left + right) / 2);

      await mergeSortHelper(left, mid);
      await mergeSortHelper(mid + 1, right);
      await merge(left, mid, right);
    };

    await mergeSortHelper(0, values.length - 1);

    if (!isCancelled(currentToken)) {
      colors.fill(sortedColor);
      updateVisualizerState(values, colors, comparisons, operations, startTime);
      setIsSorting(false);
    }
  };
const runQuickSort = async (speed = 30) => {
  if (isSorting) return;

  setIsSorting(true);

  const currentToken = ++activeSortToken.current;
  const values = [...array];
  const colors = Array(values.length).fill(defaultColor);

  let comparisons = 0;
  let operations = 0;
  const startTime = performance.now();

  const partition = async (low, high) => {
    const pivot = values[high];
    let i = low - 1;

    colors[high] = compareColor;
    updateVisualizerState(values, colors, comparisons, operations, startTime);

    await sleep(speed);

    for (let j = low; j < high; j++) {
      if (currentToken !== activeSortToken.current) {
        setIsSorting(false);
        return -1;
      }

      comparisons++;

      colors[j] = compareColor;
      updateVisualizerState(values, colors, comparisons, operations, startTime);

      await sleep(speed);

      if (values[j] < pivot) {
        i++;
        operations++;

        colors[i] = swapColor;
        colors[j] = swapColor;

        [values[i], values[j]] = [values[j], values[i]];

        updateVisualizerState(values, colors, comparisons, operations, startTime);

        await sleep(speed);

        colors[i] = defaultColor;
        colors[j] = defaultColor;
      } else {
        colors[j] = defaultColor;
      }
    }

    if (currentToken !== activeSortToken.current) {
      setIsSorting(false);
      return -1;
    }

    operations++;

    [values[i + 1], values[high]] = [values[high], values[i + 1]];

    colors[high] = defaultColor;
    colors[i + 1] = sortedColor;

    updateVisualizerState(values, colors, comparisons, operations, startTime);

    await sleep(speed);

    return i + 1;
  };

  const quickSortHelper = async (low, high) => {
    if (currentToken !== activeSortToken.current) {
      setIsSorting(false);
      return;
    }

    if (low < high) {
      const pivotIndex = await partition(low, high);

      if (pivotIndex === -1) return;

      await quickSortHelper(low, pivotIndex - 1);
      await quickSortHelper(pivotIndex + 1, high);
    } else if (low === high) {
      colors[low] = sortedColor;

      updateVisualizerState(
        values,
        colors,
        comparisons,
        operations,
        startTime
      );
    }
  };

  await quickSortHelper(0, values.length - 1);

  if (currentToken === activeSortToken.current) {
    colors.fill(sortedColor);

    updateVisualizerState(
      values,
      colors,
      comparisons,
      operations,
      startTime
    );

    setIsSorting(false);
  }
};
  return {
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
  };
}