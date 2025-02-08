let barChart,
  lineChart,
  data = [];
fetch("output.json")
  .then((response) => response.json())
  .then((jsonData) => {
    data = jsonData;
    createBarChart([
      { feature: "A", value: 0 },
      { feature: "B", value: 0 },
      { feature: "C", value: 0 },
      { feature: "D", value: 0 },
      { feature: "E", value: 0 },
      { feature: "F", value: 0 },
    ]);
    createLineChart();
  })
  .catch((err) => console.error("Failed to load JSON data:", err));

function createBarChart(chartData) {
  const ctx = document.getElementById("barChart").getContext("2d");
  if (barChart) barChart.destroy();
  barChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: chartData.map((item) => item.feature),
      datasets: [
        {
          label: "Total Time Spent",
          data: chartData.map((item) => item.value),
          backgroundColor: "rgba(2, 177, 177, 0.5)",
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      onClick: (event, elements) => {
        if (elements.length > 0) {
          const index = elements[0].index;
          const feature = chartData[index].feature;
          updateLineChart(feature);
        }
      },
    },
  });
}

function createLineChart() {
  const ctx = document.getElementById("lineChart").getContext("2d");
  if (lineChart) lineChart.destroy();
  lineChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Time Trend",
          data: [],
          borderColor: "rgba(153, 102, 255, 0.8)",
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { type: "time", time: { unit: "day" } },
      },
      plugins: {
        zoom: {
          zoom: {
            wheel: { enabled: true },
            pinch: { enabled: true },
            mode: "x",
          },
          pan: { enabled: true, mode: "x" },
        },
      },
    },
  });
}

function updateLineChart(feature) {
  const featureData = data.map((item) => ({
    day: item.day,
    value: item[feature],
  }));
  lineChart.data.labels = featureData.map((d) => d.day);
  lineChart.data.datasets[0].data = featureData.map((d) => d.value);
  lineChart.update();
}

document.getElementById("applyFilters").addEventListener("click", () => {
  const ageFilter = document.getElementById("ageGroup").value;
  const genderFilter = document.getElementById("genderFilter").value;
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;

  let filteredData = [...data];

  if (ageFilter !== "all")
    filteredData = filteredData.filter((item) => item.age === ageFilter);
  if (genderFilter !== "all")
    filteredData = filteredData.filter(
      (item) => item.gender === genderFilter
    );

//     if (startDate)
//     filteredData = filteredData.filter((d) => d.day >= startDate);
//   if (endDate)
//     filteredData = filteredData.filter((d) => d.day <= endDate);




  if (startDate)
    filteredData = filteredData.filter((item) => item.day >= startDate);
  if (endDate)
    filteredData = filteredData.filter((item) => item.day <= endDate);

  const featureTotals = ["A", "B", "C", "D", "E", "F"].map((feature) => ({
    feature,
    value: filteredData.reduce(
      (sum, item) => sum + (item[feature] || 0),
      0
    ),
  }));

  createBarChart(featureTotals);
  createLineChart();

  // Update the URL with the applied filters
  const url = new URL(window.location);
  url.searchParams.set("age", ageFilter);
  url.searchParams.set("gender", genderFilter);
  url.searchParams.set("startDate", startDate);
  url.searchParams.set("endDate", endDate);
  window.history.pushState({}, "", url); // Update URL without refreshing
});
function applyFiltersFromURL() {
  const urlParams = new URLSearchParams(window.location.search);

  const ageFilter = urlParams.get("age") || "all";
  const genderFilter = urlParams.get("gender") || "all";
  const startDate = urlParams.get("startDate") || "";
  const endDate = urlParams.get("endDate") || "";

  document.getElementById("ageGroup").value = ageFilter;
  document.getElementById("genderFilter").value = genderFilter;
  document.getElementById("startDate").value = startDate;
  document.getElementById("endDate").value = endDate;

  let filteredData = [...data];

  if (ageFilter !== "all")
    filteredData = filteredData.filter((item) => item.age === ageFilter);
  if (genderFilter !== "all")
    filteredData = filteredData.filter(
      (item) => item.gender === genderFilter
    );
  if (startDate)
    filteredData = filteredData.filter((item) => item.day >= startDate);
  if (endDate)
    filteredData = filteredData.filter((item) => item.day <= endDate);

  const featureTotals = ["A", "B", "C", "D", "E", "F"].map((feature) => ({
    feature,
    value: filteredData.reduce(
      (sum, item) => sum + (item[feature] || 0),
      0
    ),
  }));

  createBarChart(featureTotals);
  createLineChart();
}

// Call this function when the page loads
window.onload = () => {
  fetch("output.json")
    .then((response) => response.json())
    .then((jsonData) => {
      data = jsonData;
      applyFiltersFromURL(); // Apply filters from the URL
    })
    .catch((err) => console.error("Failed to load JSON data:", err));
};
