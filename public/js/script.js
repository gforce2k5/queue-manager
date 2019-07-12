document.querySelector('#get-number').addEventListener('click', function(e) {
  this.disabled = true;
  getNumber();
  setTimeout(() => {
    this.disabled = false;
  }, 500);
});

async function getNumber() {
  var id = document.querySelector('#id').value;
  var token = document.querySelector('#token');
  var response = await fetch(`/enqueue?token=${token.value}&id=${id}`);
  var number = await response.json();
  document.querySelector('.number').textContent = number.c;
  token.value = number.token;
}