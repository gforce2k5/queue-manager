const customersWaitTimes =
  JSON.parse(document.getElementById('customers-wait-time')
      .value); // data from HTML script
const socket = io();
const customersServed = document.querySelector('#servedCustomers');
const customersWaiting = document.querySelector('#waitingCustomers');
const pieCtx = document.querySelector('#doughnut').getContext('2d');
const lineCtx = document.querySelector('#line').getContext('2d');
let data = [
  parseInt(customersWaiting.textContent),
  parseInt(customersServed.textContent),
];

socket.on('enqueue-dash', (msg) => {
  customersWaiting.textContent = msg.customersWaiting;
  data[0] = msg.customersWaiting;
  updatePieChart();
});

socket.on('dequeue-dash', (msg) => {
  customersServed.textContent = msg.customersServed;
  customersWaiting.textContent = msg.customersWaiting;
  data = [msg.customersWaiting, msg.customersServed];
  if (msg.lastCustomerTimes) {
    lineChart.data.datasets[0].data.push(msg.lastCustomerTimes.waitTime);
    lineChart.data.datasets[1].data.push(msg.lastCustomerTimes.resolveTime);
    lineChart.data.labels.push(lineChart.data.labels.length + 1);
    lineChart.update();
  }
  updatePieChart();
});

/**
 * Update the pie chart
 */
function updatePieChart() {
  pieChart.data.datasets[0].data = data;
  pieChart.update();
};

const lineChart = new Chart(lineCtx, {
  type: 'line',
  data: {
    datasets: [{
      data: customersWaitTimes.map((customer) => customer.waitTime),
      backgroundColor: '#1897C6',
      borderColor: '#1897C6',
      label: 'זמן המתנה',
      fill: false,
    },
    {
      data: customersWaitTimes.map((customer) => customer.resolveTime),
      backgroundColor: '#19C98E',
      borderColor: '#19C98E',
      label: 'זמן טיפול',
      fill: false,
    }],
    labels: [...Array(customersWaitTimes.length).keys()].map((key) => key + 1),
  },
  options: {
    scales: {
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'שניות',
        },
      }],
    },
  },
});

const pieChart = new Chart(pieCtx, {
  type: 'doughnut',
  data: {
    datasets: [{
      data: data,
      backgroundColor: [
        '#1897C6',
        '#19C98E',
      ],
    }],
    labels: [
      'לקוחות ממתינים',
      'לקוחות שקיבלו שירות',
    ],
  },
  options: Chart.defaults.doughnut,
});
