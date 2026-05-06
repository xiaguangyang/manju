/**
 * 角色库 API 路由
 */
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// 数据存储文件路径
const DATA_DIR = path.join(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'characters.json');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 初始化数据文件
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// 读取数据
function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

// 写入数据
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// 配置 multer 上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/characters');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('只支持 JPG、PNG、WebP 格式'));
    }
  },
});

// ==================== 角色 API ====================

// 获取所有角色
router.get('/', (req, res) => {
  try {
    const { projectId } = req.query;
    let characters = readData();

    if (projectId) {
      characters = characters.filter(c => c.projectId === projectId);
    }

    res.json({ success: true, data: characters });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取单个角色
router.get('/:id', (req, res) => {
  try {
    const characters = readData();
    const character = characters.find(c => c.id === req.params.id);

    if (!character) {
      return res.status(404).json({ success: false, error: '角色不存在' });
    }

    res.json({ success: true, data: character });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 创建角色
router.post('/', (req, res) => {
  try {
    const characters = readData();
    const character = {
      id: uuidv4(),
      name: req.body.name || '新角色',
      description: req.body.description || '',
      projectId: req.body.projectId || null,
      referenceImages: req.body.referenceImages || [],
      traits: req.body.traits || [],
      voice: req.body.voice || '',
      colorPalette: req.body.colorPalette || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    characters.push(character);
    writeData(characters);

    res.status(201).json({ success: true, data: character });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新角色
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
      id: characters[index].id,
      createdAt: characters[index].createdAt,
      updatedAt: new Date().toISOString(),
    };

    writeData(characters);
    res.json({ success: true, data: characters[index] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除角色
router.delete('/:id', (req, res) => {
  try {
    const characters = readData();
    const character = characters.find(c => c.id === req.params.id);

    if (!character) {
      return res.status(404).json({ success: false, error: '角色不存在' });
    }

    // 删除参考图文件
    for (const img of character.referenceImages) {
      const filePath = path.join(__dirname, '..', img);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    const filteredCharacters = characters.filter(c => c.id !== req.params.id);
    writeData(filteredCharacters);

    res.json({ success: true, message: '角色已删除' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 上传角色参考图
router.post('/:id/upload-ref', upload.array('images', 5), (req, res) => {
  try {
    const characters = readData();
    const index = characters.findIndex(c => c.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ success: false, error: '角色不存在' });
    }

    const newImages = req.files.map(file => `/uploads/characters/${file.filename}`);
    characters[index].referenceImages = [
      ...(characters[index].referenceImages || []),
      ...newImages,
    ];
    characters[index].updatedAt = new Date().toISOString();

    writeData(characters);

    res.json({ success: true, data: characters[index] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除角色参考图
router.delete('/:id/ref/:imageIndex', (req, res) => {
  try {
    const characters = readData();
    const index = characters.findIndex(c => c.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ success: false, error: '角色不存在' });
    }

    const imageIndex = parseInt(req.params.imageIndex);
    const images = characters[index].referenceImages || [];

    if (imageIndex < 0 || imageIndex >= images.length) {
      return res.status(404).json({ success: false, error: '图片不存在' });
    }

    // 删除文件
    const filePath = path.join(__dirname, '..', images[imageIndex]);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // 从数组中移除
    characters[index].referenceImages = images.filter((_, i) => i !== imageIndex);
    characters[index].updatedAt = new Date().toISOString();

    writeData(characters);

    res.json({ success: true, data: characters[index] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 生成角色特征词 (Prompt 优化)
router.post('/:id/generate-prompt', (req, res) => {
  try {
    const characters = readData();
    const character = characters.find(c => c.id === req.params.id);

    if (!character) {
      return res.status(404).json({ success: false, error: '角色不存在' });
    }

    // 构建特征描述
    const traitDescriptions = {
      hair: { 银发: 'silver long hair', 金发: 'blonde hair', 黑发: 'black long hair', 红发: 'red hair' },
      eyes: { 红瞳: 'red eyes', 蓝瞳: 'blue eyes', 绿瞳: 'green eyes', 紫瞳: 'purple eyes' },
      style: { 哥特: 'gothic style', 校园: 'school uniform', 古风: 'traditional Chinese clothing', 休闲: 'casual clothing' },
    };

    let promptParts = [];

    // 添加特征词
    if (character.traits && character.traits.length > 0) {
      for (const trait of character.traits) {
        for (const [key, desc] of Object.entries(traitDescriptions.hair)) {
          if (trait.includes(key)) promptParts.push(desc);
        }
        for (const [key, desc] of Object.entries(traitDescriptions.eyes)) {
          if (trait.includes(key)) promptParts.push(desc);
        }
        for (const [key, desc] of Object.entries(traitDescriptions.style)) {
          if (trait.includes(key)) promptParts.push(desc);
        }
      }
    }

    // 添加配色
    if (character.colorPalette && character.colorPalette.length > 0) {
      promptParts.push(...character.colorPalette.map(c => `${c} color scheme`));
    }

    // 添加基础描述
    promptParts.push(character.description || '');
    promptParts.push('anime style, high quality');

    const prompt = promptParts.filter(Boolean).join(', ');

    res.json({ success: true, data: { prompt, traits: character.traits } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
