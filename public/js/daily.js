const customersWaitTimes = JSON.parse(
  document.getElementById('customers-wait-time').value
); // data from HTML script
const socket = io();
const customersServed = document.querySelector('#served-customers');
const customersWaiting = document.querySelector('#waiting-customers');
const averageWaitTimeString = document.querySelector('#average-wait-time');
const averageWaitTime = document.querySelector('#average-time');
const pieCtx = document.querySelector('#doughnut').getContext('2d');
const lineCtx = document.querySelector('#line').getContext('2d');
const avgDiff = document.querySelector('#avg-diff');

let data = [
  parseInt(customersWaiting.textContent),
  parseInt(customersServed.textContent)
];

socket.on('enqueue-dash', msg => {
  customersWaiting.textContent = msg.customersWaiting;
  data[0] = msg.customersWaiting;
  updatePieChart(data);
});

socket.on('dequeue-dash', async msg => {
  customersServed.textContent = msg.customersServed;
  customersWaiting.textContent = msg.customersWaiting;
  data = [msg.customersWaiting, msg.customersServed];
  if (msg.lastCustomerTimes) {
    const lastAverageTime = parseFloat(averageWaitTime.value);
    const newAverageTime = calculateAverage(
      lastAverageTime,
      msg.lastCustomerTimes.waitTime,
      lineChart.data.datasets[0].data.length
    );
    const diff = getPercentage(lastAverageTime, newAverageTime);
    showDiff(diff);
    averageWaitTime.value = newAverageTime;
    const response = await fetch(
      `/helpers/convertToTime?num=${newAverageTime}`
    );
    const averageTimeString = await response.json();
    averageWaitTimeString.textContent = averageTimeString;
    updateLineChart(msg.lastCustomerTimes);
  }
  updatePieChart(data);
});

/**
 * Updates the pie chart
 * @param {[Number]} data data array
 */
function updatePieChart(data) {
  pieChart.data.datasets[0].data = data;
  pieChart.update();
}

/**
 * Updates the line chart
 * @param {Object} param0 Object containing the last customer times
 */
function updateLineChart({ waitTime, resolveTime }) {
  lineChart.data.datasets[0].data.push(waitTime);
  lineChart.data.datasets[1].data.push(resolveTime);
  lineChart.data.labels.push(lineChart.data.labels.length + 1);
  lineChart.update();
}

/**
 * Calculates nre average
 * @param {Number} oldAverage old average
 * @param {Number} newData new nuber to add to the average
 * @param {Number} oldLength the old length of the array
 * @return {Number} the new average
 */
function calculateAverage(oldAverage, newData, oldLength) {
  return (oldAverage * oldLength + newData) / (oldLength + 1);
}

/**
 * Shows the difference according to sign
 * @param {Number} diff the difference between the old average and the new
 * average
 */
function showDiff(diff) {
  if (diff > 0) {
    avgDiff.classList.remove('delta-negative');
    avgDiff.classList.add('delta-positive');
  } else if (diff < 0) {
    avgDiff.classList.remove('delta-positive');
    avgDiff.classList.add('delta-negative');
  } else {
    avgDiff.classList.remove('delta-positive', 'delta-negative');
  }
  avgDiff.textContent = `${Math.abs(diff).toFixed(2)}%`;
}

const lineChart = new Chart(lineCtx, {
  type: 'line',
  data: {
    datasets: [
      {
        data: customersWaitTimes.map(customer => customer.waitTime),
        backgroundColor: '#1897C6',
        borderColor: '#1897C6',
        label: 'זמן המתנה',
        fill: false
      },
      {
        data: customersWaitTimes.map(customer => customer.resolveTime),
        backgroundColor: '#19C98E',
        borderColor: '#19C98E',
        label: 'זמן טיפול',
        fill: false
      }
    ],
    labels: [...Array(customersWaitTimes.length).keys()].map(key => key + 1)
  },
  options: {
    scales: {
      yAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: 'שניות'
          }
        }
      ]
    }
  }
});

const pieChart = new Chart(pieCtx, {
  type: 'doughnut',
  data: {
    datasets: [
      {
        data: data,
        backgroundColor: ['#1897C6', '#19C98E']
      }
    ],
    labels: ['לקוחות ממתינים', 'לקוחות שקיבלו שירות']
  },
  options: Chart.defaults.doughnut
});

/**
 * Gets difference between 2 values in percentage
 * @param {Number} lastValue the last value
 * @param {Number} newValue the new value
 * @return {Number} the difference
 */
function getPercentage(lastValue, newValue) {
  if (lastValue == 0) return 0;
  return ((lastValue - newValue) / lastValue) * 100;
}
