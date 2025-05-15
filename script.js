let array = [];
let originalArray = [];
let isPaused = false;
let isSorting = false;

function generateArray() {
    const size = document.getElementById("arraySize").value;
    array = Array.from({ length: size }, () => Math.floor(Math.random() * 300) + 10);
    originalArray = [...array];
    updateBars();
}

function updateBars(highlight = []) {
    const container = document.getElementById("array-container");
    container.innerHTML = "";
    const width = Math.floor(800 / array.length) + "px";

    array.forEach((value, index) => {
        const bar = document.createElement("div");
        bar.className = "bar";
        bar.style.height = `${value}px`;
        bar.style.width = width;
        bar.style.backgroundColor = highlight.includes(index) ? "red" : "blue";
        container.appendChild(bar);
    });

    const speedValue = document.getElementById("speed").value;
    const delay = 1000 - speedValue;
    return new Promise(resolve => setTimeout(resolve, delay));
}

function toggleControls(disable) {
    const keepEnabled = ["Play", "Pause", "Restart"];
    document.querySelectorAll("button, select, input").forEach(el => {
        const keep = keepEnabled.some(label => el.textContent.includes(label));
        el.disabled = disable && !keep;
    });
}

async function startSorting() {
    if (isSorting) return;
    isSorting = true;
    isPaused = false;
    toggleControls(true);

    const algo = document.getElementById("algorithm").value;
    const start = performance.now();

    switch (algo) {
        case "bubble": await bubbleSort(); break;
        case "selection": await selectionSort(); break;
        case "insertion": await insertionSort(); break;
        case "merge": await mergeSort(0, array.length - 1); break;
        case "quick": await quickSort(0, array.length - 1); break;
        case "heap": await heapSort(); break;
    }

    const end = performance.now();
    markSorted();
    showTime(end - start);
    isSorting = false;
    toggleControls(false);
}

function pauseSorting() {
    isPaused = true;
}

function resumeSorting() {
    isPaused = false;
}



function showTime(ms) {
    document.getElementById("metrics").textContent = `Time taken: ${ms.toFixed(2)} ms`;
}

function markSorted() {
    document.querySelectorAll(".bar").forEach(bar => bar.style.backgroundColor = "green");
}

async function waitWhilePaused() {
    while (isPaused) {
        await new Promise(resolve => setTimeout(resolve, 50));
    }
}

// Sorting Algorithms
async function bubbleSort() {
    for (let i = 0; i < array.length - 1; i++) {
        for (let j = 0; j < array.length - i - 1; j++) {
            await waitWhilePaused();
            if (array[j] > array[j + 1]) {
                [array[j], array[j + 1]] = [array[j + 1], array[j]];
            }
            await updateBars([j, j + 1]);
        }
    }
}

async function selectionSort() {
    for (let i = 0; i < array.length; i++) {
        let min = i;
        for (let j = i + 1; j < array.length; j++) {
            await waitWhilePaused();
            if (array[j] < array[min]) min = j;
            await updateBars([i, j]);
        }
        [array[i], array[min]] = [array[min], array[i]];
        await updateBars([i, min]);
    }
}

async function insertionSort() {
    for (let i = 1; i < array.length; i++) {
        let key = array[i];
        let j = i - 1;
        while (j >= 0 && array[j] > key) {
            await waitWhilePaused();
            array[j + 1] = array[j];
            j--;
            await updateBars([j, j + 1]);
        }
        array[j + 1] = key;
        await updateBars([j + 1]);
    }
}

async function mergeSort(l, r) {
    if (l >= r) return;
    const m = Math.floor((l + r) / 2);
    await mergeSort(l, m);
    await mergeSort(m + 1, r);
    await merge(l, m, r);
}

async function merge(l, m, r) {
    const left = array.slice(l, m + 1);
    const right = array.slice(m + 1, r + 1);
    let i = 0, j = 0, k = l;

    while (i < left.length && j < right.length) {
        await waitWhilePaused();
        array[k++] = left[i] <= right[j] ? left[i++] : right[j++];
        await updateBars([k - 1]);
    }
    while (i < left.length) {
        await waitWhilePaused();
        array[k++] = left[i++];
        await updateBars([k - 1]);
    }
    while (j < right.length) {
        await waitWhilePaused();
        array[k++] = right[j++];
        await updateBars([k - 1]);
    }
}

async function quickSort(l, r) {
    if (l >= r) return;
    const p = await partition(l, r);
    await quickSort(l, p - 1);
    await quickSort(p + 1, r);
}

async function partition(l, r) {
    const pivot = array[r];
    let i = l;
    for (let j = l; j < r; j++) {
        await waitWhilePaused();
        if (array[j] < pivot) {
            [array[i], array[j]] = [array[j], array[i]];
            await updateBars([i, j]);
            i++;
        }
    }
    [array[i], array[r]] = [array[r], array[i]];
    await updateBars([i, r]);
    return i;
}

async function heapSort() {
    let n = array.length;
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) await heapify(n, i);
    for (let i = n - 1; i > 0; i--) {
        await waitWhilePaused();
        [array[0], array[i]] = [array[i], array[0]];
        await updateBars([0, i]);
        await heapify(i, 0);
    }
}

async function heapify(n, i) {
    let largest = i, l = 2 * i + 1, r = 2 * i + 2;
    if (l < n && array[l] > array[largest]) largest = l;
    if (r < n && array[r] > array[largest]) largest = r;
    if (largest !== i) {
        await waitWhilePaused();
        [array[i], array[largest]] = [array[largest], array[i]];
        await updateBars([i, largest]);
        await heapify(n, largest);
    }
}

// Compare All Algorithms
async function compareAlgorithms() {
    toggleControls(true);
    const algos = ["bubble", "selection", "insertion", "merge", "quick", "heap"];
    const times = [];
    const original = [...array];

    for (let algo of algos) {
        array = [...original];
        const start = performance.now();
        switch (algo) {
            case "bubble": await bubbleSort(); break;
            case "selection": await selectionSort(); break;
            case "insertion": await insertionSort(); break;
            case "merge": await mergeSort(0, array.length - 1); break;
            case "quick": await quickSort(0, array.length - 1); break;
            case "heap": await heapSort(); break;
        }
        const end = performance.now();
        times.push(`${algo}: ${Math.round(end - start)}ms`);
    }

    document.getElementById("metrics").textContent = "Compare: " + times.join(" | ");
    array = [...original];
    updateBars();
    toggleControls(false);
}

// Initialize
generateArray();
