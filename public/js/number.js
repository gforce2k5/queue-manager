const socket = io({
  query: {
    nid: document.querySelector('#id').value
  }
});

document.querySelector('#get-number').addEventListener('click', function() {
  this.disabled = true;
  getNumber();
  setTimeout(() => {
    this.disabled = false;
  }, 500);
});

/**
 * Pulls a new number ticket
 */
async function getNumber() {
  const id = document.querySelector('#id').value;
  const token = document.querySelector('#token');
  const email = document.querySelector('input[type=email]');
  const body = new URLSearchParams();
  body.append('id', id);
  body.append('token', token.value);
  body.append('email', email.value);
  const response = await fetch('/customers', {
    heasders: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    method: 'POST',
    body: body,
    cache: 'default'
  });
  const number = await response.json();
  if (number.error) {
    console.log(number);
  } else {
    email.value = '';
    socket.emit('enqueue');
    document.querySelector('.number').textContent = number.c;
    token.value = number.token;
  }
}
