const socket = io();

const terminalList = document.querySelector('#terminal-list');
const generatorList = document.querySelector('#generator-list');

socket.on('new-terminal', (tid) => {
  blurImage(terminalList, tid - 1);
});

socket.on('new-generator', (id) => {
  blurImage(generatorList, id);
});

socket.on('terminal-disconnect', (terminal) => {
  unblurImage(terminalList, terminal.tid - 1, `/terminals/${terminal._id}`);
});

socket.on('generator-disconnect', (id) => {
  unblurImage(generatorList, id, `/numbers?id=${id}`);
});

/**
 * Blurs image
 * @param {NodeList} listNode
 * @param {Number} index
 */
function blurImage(listNode, index) {
  const currentNode = listNode.querySelector(`li:nth-of-type(${index + 1})`);
  currentNode.querySelector('a').setAttribute('href', 'javascript:;');
  currentNode.querySelector('img').classList.add('active');
}

/**
 * Unblurs image
 * @param {NodeList} listNode
 * @param {Number} index
 * @param {String} url
 */
function unblurImage(listNode, index, url) {
  const currentNode = listNode.querySelector(`li:nth-of-type(${index + 1})`);
  currentNode.querySelector('a').setAttribute('href', url);
  currentNode.querySelector('img').classList.remove('active');
}
