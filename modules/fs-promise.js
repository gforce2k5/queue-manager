const fs = require('fs');

module.exports = {
  readFile(path) {
    return new Promise((resolve, reject) => {
      fs.readFile(path, (err, data) => {
        if (err) reject(err);
        else {
          resolve(data);
        }
      });
    });
  },

  writeFile(path, data) {
    return new Promise((resolve, reject) => {
      fs.writeFile(path, JSON.stringify(data, null, 2), (err) => {
        if (err) reject(err);
        else {
          resolve(data);
        }
      });
    });
  },
};
