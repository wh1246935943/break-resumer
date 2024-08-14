const express = require('express');
const path = require('path');
const fileRoutes = require('./file'); // 引入file.js

const app = express();

// 使用中间件解析 JSON 请求体
app.use(express.json());
// 使用中间件解析 URL 编码请求体
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './web/index.html'));
});

// 使用file.js中的路由
app.use('/file', fileRoutes);

app.listen(3000, () => {
    console.log('服务器已启动，端口 3000');
});
