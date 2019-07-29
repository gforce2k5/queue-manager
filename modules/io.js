const data = require('./data');

module.exports = io => {

  io.on('connection', (socket) => {
    socket.on('enqueue', () => {
      io.emit('enqueue-done', JSON.stringify(data.queue[data.queue.length - 1]));
    });

    socket.on('dequeue', (msg) => {
      data.lastCustomer = { customer: data.queue.shift(), terminal: msg };
      io.emit('dequeue-done', JSON.stringify(data.lastCustomer));
    });
  });

}