const socket = io();
const h1 = document.querySelector('h1');

socket.on('dequeue-done', (msg) => {
  data = JSON.parse(msg);
  console.log(data);
  h1.textContent = `מספר ${data.customer.number} לדלפק ${data.terminal}`;
})