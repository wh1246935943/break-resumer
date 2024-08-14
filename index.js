const express = require('express');
const path = require('path');
const fileRoutes = require('./file');

const app = express();

// 使用中间件解析 JSON 请求体
app.use(express.json());

// 使用中间件解析 URL 编码请求体
app.use(express.urlencoded({ extended: true }));

// 设置静态资源目录
app.use(express.static(__dirname));

app.get('/', (req, res) => {
	res.redirect('/web/index.html');
	// res.sendFile(path.join(__dirname, './web/index.html'));
});

// 使用file.js中的路由
app.use('/file', fileRoutes);

app.listen(3000, () => {
	console.log('服务器已启动,请访问: http://localhost:3000');
});
