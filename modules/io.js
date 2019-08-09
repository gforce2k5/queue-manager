const Terminal = require('../models/terminal');
const data = require('./data');

module.exports = io => {

  io.on('connection', (socket) => {
    const tid = parseInt(socket.handshake.query.tid);
    if (!isNaN(tid)) {
      data.activeTerminals[tid - 1] = true;
      io.emit('new-terminal', tid);
    }

    const nid = parseInt(socket.handshake.query.nid);
    if (!isNaN(nid)) {
      data.activeGenerators[nid] = true;
      io.emit('new-generator', nid);
    }

    socket.on('enqueue', () => {
      io.emit('enqueue-done', JSON.stringify(data.queue[data.queue.length - 1]));
    });

    socket.on('dequeue', msg => {
      data.lastCustomer = { customer: data.queue.shift(), terminal: msg };
      io.emit('dequeue-done', JSON.stringify(data.lastCustomer));
    });

    socket.on('disconnect', async () => {
      if (!isNaN(tid)) {
        data.activeTerminals[tid - 1] = false;
        const terminal = await Terminal.findOne({tid: tid});
        io.emit('terminal-disconnect', terminal);
      }

      if (!isNaN(nid)) {
        data.activeGenerators[nid] = false;
        io.emit('generator-disconnect', nid);
      }
    })
  });

}