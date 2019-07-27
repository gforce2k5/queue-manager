const list = document.querySelector('.list');
const socket = io();
(async () => {
  const response = await fetch('/customers');
  const customers = await response.json();
  console.log(customers);
  customers.forEach(addCustomer);
})();

const addCustomer = customer => {
  list.innerHTML += `
    <li>
      ${customer.number} - ${customer.email ? customer.email : ''}<button data-id="${customer._id}">קבל לקוח</button>
    </li>
  `;
};

socket.on('enqueue-done', (msg) => {
  customer = JSON.parse(msg);
  addCustomer(customer);
});