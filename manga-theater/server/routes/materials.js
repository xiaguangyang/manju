/**
 * 素材库 API 路由
 */
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// 数据存储文件路径
const DATA_DIR = path.join(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'materials.json');

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
    const uploadDir = path.join(__dirname, '../uploads/materials');
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
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('只支持 JPG、PNG、WebP、GIF 格式'));
    }
  },
});

// ==================== 素材 API ====================

// 获取所有素材
router.get('/', (req, res) => {
  try {
    const { type, category, search, projectId } = req.query;
    let materials = readData();

    // 类型筛选
    if (type) {
      materials = materials.filter(m => m.type === type);
    }

    // 分类筛选
    if (category) {
      materials = materials.filter(m => m.category === category);
    }

    // 项目筛选
    if (projectId) {
      materials = materials.filter(m => m.projectId === projectId);
    }

    // 搜索
    if (search) {
      const keyword = search.toLowerCase();
      materials = materials.filter(
        m =>
          m.name.toLowerCase().includes(keyword) ||
          (m.tags && m.tags.some(t => t.toLowerCase().includes(keyword)))
      );
    }

    res.json({ success: true, data: materials });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 上传素材
router.post('/upload', upload.array('files', 20), (req, res) => {
  try {
    const { name, type, category, tags, projectId } = req.body;
    const materials = readData();
    const newMaterials = [];

    for (const file of req.files) {
      const material = {
        id: uuidv4(),
        name: name || file.originalname,
        url: `/uploads/materials/${file.filename}`,
        thumbnail: `/uploads/materials/${file.filename}`,
        type: type || 'other',
        category: category || '默认',
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
        projectId: projectId || null,
        metadata: {
          originalName: file.originalname,
          size: file.size,
          format: path.extname(file.originalname).slice(1),
          width: 0,
          height: 0,
        },
        usedInScenes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      materials.push(material);
      newMaterials.push(material);
    }

    writeData(materials);
    res.json({ success: true, data: newMaterials });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 保存 AI 生成的素材
router.post('/save-ai', (req, res) => {
  try {
    const { imageUrl, name, type, category, tags, projectId } = req.body;
    const materials = readData();

    const material = {
      id: uuidv4(),
      name: name || 'AI生成素材',
      url: imageUrl,
      thumbnail: imageUrl,
      type: type || 'other',
      category: category || 'AI生成',
      tags: tags || ['AI生成'],
      projectId: projectId || null,
      metadata: {
        source: 'ai',
        format: 'png',
        size: 0,
      },
      usedInScenes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    materials.push(material);
    writeData(materials);

    res.json({ success: true, data: material });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取单个素材
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

// 更新素材
router.put('/:id', (req, res) => {
  try {
    const materials = readData();
    const index = materials.findIndex(m => m.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ success: false, error: '素材不存在' });
    }

    materials[index] = {
      ...materials[index],
      ...req.body,
      id: materials[index].id, // 保持原 ID
      createdAt: materials[index].createdAt, // 保持创建时间
      updatedAt: new Date().toISOString(),
    };

    writeData(materials);
    res.json({ success: true, data: materials[index] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除素材
router.delete('/:id', (req, res) => {
  try {
    const materials = readData();
    const material = materials.find(m => m.id === req.params.id);

    if (!material) {
      return res.status(404).json({ success: false, error: '素材不存在' });
    }

    // 删除文件
    const filePath = path.join(__dirname, '..', material.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // 从数据中移除
    const filteredMaterials = materials.filter(m => m.id !== req.params.id);
    writeData(filteredMaterials);

    res.json({ success: true, message: '素材已删除' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 批量删除素材
router.post('/delete-batch', (req, res) => {
  try {
    const { ids } = req.body;
    const materials = readData();
    const toDelete = [];

    for (const id of ids) {
      const material = materials.find(m => m.id === id);
      if (material) {
        // 删除文件
        const filePath = path.join(__dirname, '..', material.url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        toDelete.push(id);
      }
    }

    const filteredMaterials = materials.filter(m => !toDelete.includes(m.id));
    writeData(filteredMaterials);

    res.json({ success: true, message: `已删除 ${toDelete.length} 个素材` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取素材统计
router.get('/stats/overview', (req, res) => {
  try {
    const materials = readData();
    const stats = {
      total: materials.length,
      byType: {},
      byCategory: {},
      recentAdded: materials
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10),
    };

    // 按类型统计
    materials.forEach(m => {
      stats.byType[m.type] = (stats.byType[m.type] || 0) + 1;
    });

    // 按分类统计
    materials.forEach(m => {
      stats.byCategory[m.category] = (stats.byCategory[m.category] || 0) + 1;
    });

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
