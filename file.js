const express = require('express');
const fs = require('fs');
const path = require('path');
/**
 * multer 是一个用于处理 multipart/form-data 类型的表单数据的中间件，
 * 特别是在处理文件上传时非常有用。
 * 通过这个语句，可以在后续的代码中使用 multer 模块提供的功能，
 * 例如创建上传表单、处理上传请求、管理文件存储路径等。
 */
const multer = require('multer');
/**
 * 这个语句导入了一个名为 getUniqueFileName 的函数，
 * 用于生成一个唯一的文件名。
 * 这个函数接受两个参数：上传文件的目录和文件名。
 * 它会生成一个唯一的文件名，
 * 保证在给定的目录下不会出现重复的文件名。
 */
const { getUniqueFileName } = require('./util');

const router = express.Router();
/**
 * dest: 'uploads/' 指定了上传文件存储的目录为当前目录下的 uploads 文件夹。
 */
const upload = multer({ dest: 'uploads/' });

// 上传文件的目录
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
  if (!fs.existsSync(chunkDir)) fs.mkdirSync(chunkDir);

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
