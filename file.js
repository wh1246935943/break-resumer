const express = require('express');

const multer = require('multer');

const path = require('path');

const fs = require('fs');

const { rimraf } = require('rimraf');

const { getUnqieFilename } = require('./utils');

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, 'uploads');

// 设置 multer 存储配置
const uploadFileStorage = multer.diskStorage({
  // 动态设置文件保存路径
  destination: (req, file, cb) => {

    const filename = req.body.filename || 'default';

    const chunkDir = path.join(UPLOAD_DIR, `${filename}_CHUNKS_FOLDER_MARK_`);

    fs.mkdir(chunkDir, { recursive: true }, (err) => {

      if (err) return cb(err);

      cb(null, chunkDir);

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

  res.sendStatus(200)

});

router.post('/merge', (req, res) => {

  const { filename } = req.body;

  const chunkDir = path.join(UPLOAD_DIR, `${filename}_CHUNKS_FOLDER_MARK_`);

  fs.readdir(chunkDir, (err, files) => {

    if (err) {

      res.sendStatus(400).json({msg: '要合并的文件不存再'});

      return;

    };

    const indexs = files.map(name => parseInt(name.split('_')[1]));

    const indexsSort = indexs.sort((a,b) => a - b);
  
    const unqieFilename = getUnqieFilename(UPLOAD_DIR, filename);
  
    const writeStream = fs.createWriteStream(path.join(UPLOAD_DIR, unqieFilename));
  
    for (let index = 0; index < indexsSort.length; index++) {
      
      const chunkPath = path.join(chunkDir, `chunk_${index}`);
  
      const chunk = fs.readFileSync(chunkPath);
  
      writeStream.write(chunk);
      
    };
  
    writeStream.end();
  
    rimraf(chunkDir, { glob: false }).catch(err => {console.log('err:::', err)});
  
    res.sendStatus(200)

  });

})


module.exports = router;