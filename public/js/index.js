const list = document.querySelector('#terminal-list');

const loadTerminals = async () => {
  try {
    // await fetch('/terminals', {method: 'DELETE'});
    const response = await fetch('/terminals');
    const terminals = await response.json();
    terminals.forEach((terminal, index) => {
      list.innerHTML += `
        <li>
          <a href="/terminals/${terminal._id}" target="_blank">מסוף ${index + 1}</a>
        </li>
      `
    });
  } catch (err) {
    console.log(err);
  }
}

loadTerminals();