const Terminal = require('../models/terminal');
const data = require('./data');
const { getCustomerTimes } = require('./functions');

module.exports = io => {
  io.on('connection', socket => {
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
      io.emit('enqueue-done', data.queue[data.queue.length - 1]);
      io.emit('enqueue-dash', {
        customersWaiting: data.queue.length
      });
    });

    socket.on('dequeue', msg => {
      data.lastCustomer = {
        customer: data.queue.shift(),
        terminal: msg
      };
      data.customersServed++;
      io.emit('dequeue-done', data.lastCustomer);
      io.emit('dequeue-dash', {
        customersServed: data.customersServed,
        customersWaiting: data.queue.length,
        lastCustomerTimes: getCustomerTimes(data.resolvedCustomer)
      });
    });

    socket.on('disconnect', async () => {
      if (!isNaN(tid)) {
        data.activeTerminals[tid - 1] = false;
        const terminal = await Terminal.findOne({
          tid: tid
        });
        io.emit('terminal-disconnect', terminal);
      }

      if (!isNaN(nid)) {
        data.activeGenerators[nid] = false;
        io.emit('generator-disconnect', nid);
      }
    });
  });
};
