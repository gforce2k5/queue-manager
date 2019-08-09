const socket = io();

const terminalList = document.querySelector('#terminal-list');
const generatorList = document.querySelector('#generator-list');

socket.on('new-terminal', tid => {
  terminalList.querySelectorAll('li')[tid - 1].querySelector('a').setAttribute('href', 'javascript:;');
});

socket.on('new-generator', id => {
  generatorList.querySelectorAll('li')[id].querySelector('a').setAttribute('href', 'javascript:;');
})

socket.on('terminal-disconnect', terminal => {
  terminalList.querySelectorAll('li')[terminal.tid - 1].querySelector('a').setAttribute('href', `/terminals/${terminal._id}`);
});

socket.on('generator-disconnect', id => {
  generatorList.querySelectorAll('li')[id].querySelector('a').setAttribute('href', `/numbers?id=${id}`);
});