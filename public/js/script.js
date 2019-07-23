document.querySelector('#get-number').addEventListener('click', function(e) {
  this.disabled = true;
  getNumber();
  setTimeout(() => {
    this.disabled = false;
  }, 500);
});

async function getNumber() {
  const id = document.querySelector('#id').value;
  const token = document.querySelector('#token');
  const body = new URLSearchParams();
  body.append('id', id);
  body.append('token', token.value);
  const response = await fetch('/customers', {
    heasders: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'PUT',
    body: body,
    cache: 'default',
  });
  const number = await response.json();
  if (number.error) {
    console.log(number);
  } else {
    document.querySelector('.number').textContent = number.c;
    token.value = number.token;
  }
}