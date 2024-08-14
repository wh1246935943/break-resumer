const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { getUniqueFileName } = require('./util');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });
const UPLOAD_DIR = path.join(__dirname, 'uploads');

// 获取已上传的切片
router.get('/getUploadedChunks', (req, res) => {
  const { fileName } = req.query;
  const chunkDir = path.join(UPLOAD_DIR, `${fileName}_CHUNKS_FOLDER_MARK_`);

  let uploadedChunks = [];
  if (fs.existsSync(chunkDir)) {
    // 检查路径是否是一个文件夹
    if (fs.statSync(chunkDir).isDirectory()) {
      uploadedChunks = fs.readdirSync(chunkDir).map(name => parseInt(name.split('_')[1]));
    }
  }

  res.json(uploadedChunks);
});

// 保存每个切片到服务器
router.post('/upload', upload.single('chunk'), (req, res) => {
  const { fileName, chunkIndex } = req.body;
  const chunk = req.file;

  const chunkDir = path.join(UPLOAD_DIR, `${fileName}_CHUNKS_FOLDER_MARK_`);

  // 如果没有目录，则创建一个
  if (!fs.existsSync(chunkDir)) {
    fs.mkdirSync(chunkDir);
  }

  const chunkPath = path.join(chunkDir, `chunk_${chunkIndex}`);
  fs.renameSync(chunk.path, chunkPath); // 将切片保存到对应路径

  res.sendStatus(200);
});

// 合并切片文件
router.post('/merge', (req, res) => {
  const { fileName, totalChunks } = req.body;
  const chunkDir = path.join(UPLOAD_DIR, `${fileName}_CHUNKS_FOLDER_MARK_`);

  // 获取一个不重复的文件名
  const uniqueFileName = getUniqueFileName(UPLOAD_DIR, fileName);
  const filePath = path.join(UPLOAD_DIR, uniqueFileName);

  // 创建合并后的文件
  const writeStream = fs.createWriteStream(filePath);

  for (let i = 0; i < totalChunks; i++) {
    const chunkPath = path.join(chunkDir, `chunk_${i}`);
    const chunk = fs.readFileSync(chunkPath);
    writeStream.write(chunk);
    fs.unlinkSync(chunkPath);  // 合并后删除切片
  }

  writeStream.end();

  // 删除临时目录
  fs.rmdirSync(chunkDir);

  res.sendStatus(200);
});

module.exports = router;
