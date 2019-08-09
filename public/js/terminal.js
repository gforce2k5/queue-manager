const acceptButton = document.querySelector('#accept');
const h1 = document.querySelector('#current-customer');

const list = document.querySelector('.list');
const socket = io(`http://localhost:3000?tid=${document.querySelector('#tid').value}`);
(async () => {
  const response = await fetch('/customers');
  const customers = await response.json();
  customers.forEach(addCustomer);
})();

const addCustomer = customer => {
  list.innerHTML += `
    <li data-id="${customer._id}">
      ${customer.number} - ${customer.email ? customer.email : ''}
    </li>
  `;
  acceptButton.disabled = false;
};

const removeCustomer = customer => {
  list.querySelector(`li[data-id="${customer._id}"]`).remove();
  if (list.querySelectorAll('li').length == 0) acceptButton.disabled = true;
}

acceptButton.addEventListener('click', async function () {
  const lastCustomer = document.querySelector('li');
  const body = new URLSearchParams();
  body.append('currentId', currentCustomer);
  body.append('terminalId', document.querySelector('#id').value);
  try {
    const response = await fetch(`/customers/${lastCustomer.getAttribute('data-id')}`, {
      method: 'PUT',
      heasders: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body,
    });
    const customer = await response.json();
    h1.textContent = customer.number;
    currentCustomer = customer._id;
    socket.emit('dequeue', document.querySelector('#tid').value);
  } catch (err) {
    console.log(err);
  }
  this.disabled = true;
  setTimeout(() => {
    if (list.querySelectorAll('li').length > 0) {
      this.disabled = false;
    }
  }, 500);
});

socket.on('enqueue-done', (msg) => {
  customer = JSON.parse(msg);
  addCustomer(customer);
});

socket.on('dequeue-done', (msg) => {
  customer = JSON.parse(msg).customer;
  removeCustomer(customer);
});