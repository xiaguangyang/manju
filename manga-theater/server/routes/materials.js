import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { createMaterial } from '../models/Material.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// 数据存储文件路径
const DATA_FILE = path.join(__dirname, '../data/materials.json');

// 确保数据目录存在
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../uploads');
['characters', 'scenes', 'props', 'backgrounds'].forEach(dir => {
  const dirPath = path.join(uploadDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// 读取数据
function readData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('读取数据失败:', e);
  }
  return [];
}

// 保存数据
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Multer 配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.body.type || 'scenes';
    const dir = path.join(uploadDir, type);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('只支持 JPG、PNG、WebP、GIF 格式'));
    }
  }
});

// GET /api/materials - 获取素材列表
router.get('/', (req, res) => {
  try {
    const { type, category, search, page = 1, limit = 20 } = req.query;
    let materials = readData();

    // 筛选
    if (type) {
      materials = materials.filter(m => m.type === type);
    }
    if (category) {
      materials = materials.filter(m => m.category === category);
    }
    if (search) {
      const keyword = search.toLowerCase();
      materials = materials.filter(m =>
        m.name.toLowerCase().includes(keyword) ||
        m.tags.some(t => t.toLowerCase().includes(keyword))
      );
    }

    // 分页
    const total = materials.length;
    const start = (page - 1) * limit;
    const end = start + parseInt(limit);
    materials = materials.slice(start, end);

    res.json({
      success: true,
      data: materials,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/materials - 上传素材
router.post('/', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: '请上传文件' });
    }

    const { name, type = 'scene', category = '', tags = '', characterId = null } = req.body;
    
    const material = createMaterial({
      name: name || req.file.originalname,
      url: `/uploads/${type}/${req.file.filename}`,
      thumbnail: `/uploads/${type}/${req.file.filename}`,
      type,
      category,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      characterId,
      metadata: {
        width: 0,
        height: 0,
        size: req.file.size,
        format: path.extname(req.file.filename).replace('.', '')
      }
    });

    const materials = readData();
    materials.push(material);
    saveData(materials);

    res.json({ success: true, data: material });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/materials/:id - 获取单个素材
router.get('/:id', (req, res) => {
  try {
    const materials = readData();
    const material = materials.find(m => m.id === req.params.id);
    
    if (!material) {
      return res.status(404).json({ success: false, error: '素材不存在' });
    }

    res.json({ success: true, data: material });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/materials/:id - 更新素材
router.put('/:id', (req, res) => {
  try {
    const materials = readData();
    const index = materials.findIndex(m => m.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ success: false, error: '素材不存在' });
    }

    materials[index] = { ...materials[index], ...req.body, id: req.params.id };
    saveData(materials);

    res.json({ success: true, data: materials[index] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/materials/:id - 删除素材
router.delete('/:id', (req, res) => {
  try {
    let materials = readData();
    const material = materials.find(m => m.id === req.params.id);
    
    if (!material) {
      return res.status(404).json({ success: false, error: '素材不存在' });
    }

    // 删除文件
    const filePath = path.join(__dirname, '..', material.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // 删除数据
    materials = materials.filter(m => m.id !== req.params.id);
    saveData(materials);

    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
