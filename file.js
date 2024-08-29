const express = require('express');
const busboy = require('busboy');
const fsPromises = require('fs').promises;
const path = require('path');
const fs = require('fs');
const { rimraf } = require('rimraf');
const { getUniqueFileName } = require('./utils');

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, 'uploads');

router.post('/upload', (req, res) => {

  const bb = busboy({ headers: req.headers });

  let filename, chunkIndex, writeStream;

  /**
   * 请求中断时删除临时文件，
   * 并关闭文件写入流
   * 这个操作我不知道否合理，但是目前功能确实达到了我想要的效果
   */
  req.on('aborted', async () => {

    const chunkDir = path.join(UPLOAD_DIR, `${filename}_CHUNKS_FOLDER_MARK_`);

    const chunkPath = path.join(chunkDir, `chunk_${chunkIndex}`);

    writeStream.end();
    
    fsPromises.unlink(chunkPath);

  });
  
  bb.on('field', (fieldname, val) => {

    if (fieldname === 'filename') filename = val;

    if (fieldname === 'chunkIndex') chunkIndex = parseInt(val, 10);

    if (fieldname === 'chunkBlob' && value === 'undefined') {

      res.status(400).json({msg: '文件切片数据不存在'})

    }

  });

  bb.on('file', (fieldname, file) => {

    if (!file) {

      res.status(400).json({msg: '文件切片数据不存在'})

      return;
    }

    const chunkDir = path.join(UPLOAD_DIR, `${filename}_CHUNKS_FOLDER_MARK_`);

    fs.mkdir(chunkDir, { recursive: true }, async (err) => {

      if (err) {

        return res.status(500).json({ msg: '无法创建文件夹', error: err.message });

      };

      const chunkPath = path.join(chunkDir, `chunk_${chunkIndex}`);

      writeStream = fs.createWriteStream(chunkPath);

      file.pipe(writeStream);

      writeStream.on('close', () => {

        res.sendStatus(200);
        
      });

      writeStream.on('error', (error) => {

        res.status(500).json({ msg: '保存文件块时出错', error: error.message });

      });
      
    });

  });

  req.pipe(bb);
});

// Merge handler
router.post('/merge', async (req, res) => {

  const { filename } = req.body;

  const chunkDir = path.join(UPLOAD_DIR, `${filename}_CHUNKS_FOLDER_MARK_`);

  try {
    const files = await fsPromises.readdir(chunkDir);

    const indexsSort = files
      .filter(name => !name.endsWith('.temp'))
      .map(name => parseInt(name.split('_')[1]))
      .sort((a, b) => a - b);

    const uniqueFilename = getUniqueFileName(UPLOAD_DIR, filename);

    const writeStream = fs.createWriteStream(path.join(UPLOAD_DIR, uniqueFilename));

    for (let i = 0; i < indexsSort.length; i++) {

      const chunkPath = path.join(chunkDir, `chunk_${indexsSort[i]}`);

      const chunk = await fsPromises.readFile(chunkPath);

      await new Promise((resolve, reject) => {

        writeStream.write(chunk, err => {

          if (err) reject(err);

          else resolve();

        });

      });

    }

    await new Promise((resolve, reject) => {

      writeStream.end(err => {

        if (err) reject(err);

        else resolve();

      });

    });

    await rimraf(chunkDir, { glob: false });

    res.sendStatus(200);

  } catch (err) {

    res.status(500).json({ msg: '合并文件时出错', error: err.message });

  }
});

// Helper function to get uploaded chunks
router.get('/getUploadedChunks', (req, res) => {

  const { filename } = req.query;

  const chunkDir = path.join(UPLOAD_DIR, `${filename}_CHUNKS_FOLDER_MARK_`);

  fs.readdir(chunkDir, (err, files) => {

    if (err) {

      res.json([]);

    } else {

      res.json(
        files
          .filter(name => !name.endsWith('.temp'))
          .map(name => parseInt(name.split('_')[1]))
      );

    }

  });

});

module.exports = router;
