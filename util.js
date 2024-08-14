const path = require('path');
const fs = require('fs');
// 生成不重复的文件名
function getUniqueFileName(directory, fileName) {
  let ext = path.extname(fileName); // 获取文件的扩展名
  let baseName = path.basename(fileName, ext); // 获取文件名（不包括扩展名）

  let newFileName = fileName;
  let counter = 1;

  // 循环检查文件是否存在，直到找到一个唯一的文件名
  while (fs.existsSync(path.join(directory, newFileName))) {
    newFileName = `${baseName}(${counter})${ext}`;
    counter++;
  }

  return newFileName;
}

module.exports = {
  getUniqueFileName
}