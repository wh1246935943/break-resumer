const path = require('path');
const fs = require('fs');

function getUnqieFilename(dir, filename) {

  let ext = path.extname(filename);

  let basename = path.basename(filename, ext);

  let newFilename = filename;

  let counter = 1;

  while(fs.existsSync(path.join(dir, newFilename))) {
     
    newFilename = `${basename}(${counter})${ext}`;

    counter++
  };

  return newFilename
};

module.exports = {
  getUnqieFilename
}