const express = require('express');

const fileRouters = require('./file');

const app = express();

const port = 18084;

app.use(express.static(__dirname));

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.get('/', (req, res) => {
  res.redirect('/web/index.html')
});

app.use('/file', fileRouters)

app.listen(port, () => {
  console.log('服务已经启动，请访问：http://localhost:18084')
})