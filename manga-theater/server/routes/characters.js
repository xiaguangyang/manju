import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// 数据存储文件路径
const DATA_FILE = path.join(__dirname, '../data/characters.json');

// 确保数据目录存在
const dataDir = path.join(__dirname, '../data');
const uploadDir = path.join(__dirname, '../uploads/characters');

[dataDir, uploadDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
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

// Multer 配置 - 角色参考图上传
const storage = multer.diskStorage({
  destination: (req, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `char_${uuidv4()}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('只支持 JPG、PNG、WebP 格式'));
    }
  }
});

// GET /api/characters - 获取角色列表
router.get('/', (req, res) => {
  try {
    const characters = readData();
    res.json({ success: true, data: characters });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/characters - 创建角色
router.post('/', (req, res) => {
  try {
    const { name, description = '', traits = [], voice = '', colorPalette = [] } = req.body;
    
    const character = {
      id: uuidv4(),
      name,
      description,
      referenceImages: [],
      traits: traits || [],
      voice,
      colorPalette: colorPalette || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const characters = readData();
    characters.push(character);
    saveData(characters);

    res.json({ success: true, data: character });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/characters/:id/images - 上传角色参考图
router.post('/:id/images', upload.array('images', 10), (req, res) => {
  try {
    const characters = readData();
    const character = characters.find(c => c.id === req.params.id);
    
    if (!character) {
      return res.status(404).json({ success: false, error: '角色不存在' });
    }

    const newImages = req.files.map(f => ({
      url: `/uploads/characters/${f.filename}`,
      filename: f.filename
    }));

    character.referenceImages = [...character.referenceImages, ...newImages];
    character.updatedAt = new Date().toISOString();
    saveData(characters);

    res.json({ success: true, data: character });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/characters/:id - 更新角色
router.put('/:id', (req, res) => {
  try {
    const characters = readData();
    const index = characters.findIndex(c => c.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ success: false, error: '角色不存在' });
    }

    characters[index] = {
      ...characters[index],
      ...req.body,
      id: req.params.id,
      updatedAt: new Date().toISOString()
    };
    saveData(characters);

    res.json({ success: true, data: characters[index] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/characters/:id - 删除角色
router.delete('/:id', (req, res) => {
  try {
    let characters = readData();
    const character = characters.find(c => c.id === req.params.id);
    
    if (!character) {
      return res.status(404).json({ success: false, error: '角色不存在' });
    }

    // 删除参考图文件
    character.referenceImages.forEach(img => {
      const filePath = path.join(__dirname, '..', img.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    characters = characters.filter(c => c.id !== req.params.id);
    saveData(characters);

    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
