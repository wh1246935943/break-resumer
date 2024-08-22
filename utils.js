const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;

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
};

async function removeDir(dir) {
  try {
    const files = await fsPromises.readdir(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await fsPromises.lstat(filePath);

      if (stat.isDirectory()) {
        // 如果是目录，递归删除
        await removeDir(filePath);
      } else {
        // 如果是文件，直接删除
        await fsPromises.unlink(filePath);
      }
    }

    // 最后删除空目录
    await fsPromises.rmdir(dir);
    console.log(`Deleted directory: ${dir}`);
  } catch (err) {
    console.error(`Error removing directory ${dir}: ${err}`);
  }
}

module.exports = {
  getUniqueFileName,
  removeDir
}