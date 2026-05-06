import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import materialRoutes from './routes/materials.js';
import characterRoutes from './routes/characters.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务 - 素材图片
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API 路由
app.use('/api/materials', materialRoutes);
app.use('/api/characters', characterRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`漫剧工坊后端服务运行在 http://localhost:${PORT}`);
});
