const express = require('express');

const multer = require('multer');

const fsPromises = require('fs').promises;

const path = require('path');

const fs = require('fs');

const { rimraf } = require('rimraf');

const { getUniqueFileName } = require('./utils');

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, 'uploads');

// 设置 multer 存储配置
const uploadFileStorage = multer.diskStorage({
  // 动态设置文件保存路径
  destination: (req, file, cb) => {

    const filename = req.body.filename || 'default';

    const chunkMulterDir = path.join(UPLOAD_DIR, `${filename}_CHUNKS_MULTER_FOLDER_MARK_`);

    fs.mkdir(chunkMulterDir, { recursive: true }, (err) => {

      if (err) return cb(err);

      cb(null, chunkMulterDir);

    });

  },

  // 设置保存的文件名
  filename: (req, file, cb) => {

    const chunkIndex = req.body.chunkIndex || 0;

    // 自定义文件名，例如使用原文件名
    cb(null, `chunk_${chunkIndex}`);
  }
});

const uploadFileMulter = multer({ storage: uploadFileStorage });

router.get('/getUploadedChunks', (req, res) => {

  const { filename } = req.query;

  const chunkDir = path.join(UPLOAD_DIR, `${filename}_CHUNKS_FOLDER_MARK_`);

  fs.readdir(chunkDir, (err, files) => {

    if (err) {

      res.json([])

    } else {

      res.json(files.map(name => parseInt(name.split('_')[1])))

    }

  });

});

router.post('/upload', uploadFileMulter.single('chunkBlob'), (req, res) => {

  const { filename, chunkIndex } = req.body;

  const multerChunk = req.file;

  const chunkDir = path.join(UPLOAD_DIR, `${filename}_CHUNKS_FOLDER_MARK_`);

  // 如果没有目录，则创建一个
  fs.mkdir(chunkDir, { recursive: true }, (err) => {

    if (err) return;

    fs.rename(multerChunk.path, path.join(chunkDir, `chunk_${chunkIndex}`), () => {

      res.sendStatus(200)

    });
  })

});

router.post('/merge', async (req, res) => {

  const { filename } = req.body;

  const chunkDir = path.join(UPLOAD_DIR, `${filename}_CHUNKS_FOLDER_MARK_`);
  const chunkMulterDir = path.join(UPLOAD_DIR, `${filename}_CHUNKS_MULTER_FOLDER_MARK_`);

  try {
    // 读取chunk目录下的文件列表
    const files = await fsPromises.readdir(chunkDir);

    const indexsSort = files
      .map(name => parseInt(name.split('_')[1]))
      .sort((a, b) => a - b);

    const uniqueFilename = getUniqueFileName(UPLOAD_DIR, filename);

    const writeStream = fs.createWriteStream(path.join(UPLOAD_DIR, uniqueFilename));

    for (let i = 0; i < indexsSort.length; i++) {
      const chunkPath = path.join(chunkDir, `chunk_${indexsSort[i]}`);

      // 异步读取文件
      const chunk = await fsPromises.readFile(chunkPath);

      // 异步写入文件
      await new Promise((resolve, reject) => {
        writeStream.write(chunk, err => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    // 确保所有数据写入完成
    await new Promise((resolve, reject) => {
      writeStream.end(err => {
        if (err) reject(err);
        else resolve();
      });
    });

    // 删除目录及其内容
    await rimraf(chunkDir, { glob: false });
    await rimraf(chunkMulterDir, { glob: false });

    res.sendStatus(200);

  } catch (err) {
    res.status(500).json({ msg: '合并文件时出错', error: err.message });
  }
});



module.exports = router;