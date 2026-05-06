/**
 * 漫剧工坊后端服务
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// 导入路由
const materialRoutes = require('./routes/materials');
const characterRoutes = require('./routes/characters');
const projectRoutes = require('./routes/projects');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 确保上传目录存在
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// API 路由
app.use('/api/materials', materialRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api', projectRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ success: false, error: err.message || '服务器错误' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║       漫剧工坊后端服务已启动                  ║
╠═══════════════════════════════════════════════╣
║  本地地址: http://localhost:${PORT}              ║
║  API 端点: http://localhost:${PORT}/api         ║
╚═══════════════════════════════════════════════╝
  `);
});
