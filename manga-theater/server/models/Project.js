/**
 * 数据模型 - 项目、剧集、分镜
 * 项目结构：Project -> Episode -> Scene
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 数据存储目录
const DATA_DIR = path.join(__dirname, '../data');
const db = {
  projects: path.join(DATA_DIR, 'projects.json'),
  episodes: path.join(DATA_DIR, 'episodes.json'),
  scenes: path.join(DATA_DIR, 'scenes.json'),
  characters: path.join(DATA_DIR, 'characters.json'),
};

// 确保数据目录存在
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  // 初始化空数据文件
  ['projects', 'episodes', 'scenes', 'characters'].forEach(file => {
    const filePath = db[file];
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    }
  });
}

// 读取数据
function readData(type) {
  ensureDataDir(); // 确保数据目录存在
  ensureDataDir();
  try {
    const data = fs.readFileSync(db[type], 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

// 保存数据
function saveData(type, data) {
  ensureDataDir();
  fs.writeFileSync(db[type], JSON.stringify(data, null, 2));
}

// ==================== 项目 ====================

const Project = {
  // 获取所有项目
  findAll: () => {
    return readData('projects');
  },

  // 根据ID获取项目
  findById: (id) => {
    const projects = readData('projects');
    return projects.find(p => p.id === id);
  },

  // 创建项目
  create: (data) => {
    const projects = readData('projects');
    const project = {
      id: uuidv4(),
      name: data.name || '新剧目',
      description: data.description || '',
      cover: data.cover || null,
      tags: data.tags || [],
      settings: data.settings || {
        style: 'anime', // anime, cartoon, realistic
        aspectRatio: '16:9',
        resolution: '1920x1080',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    projects.push(project);
    saveData('projects', projects);
    return project;
  },

  // 更新项目
  update: (id, data) => {
    const projects = readData('projects');
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return null;

    projects[index] = {
      ...projects[index],
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    saveData('projects', projects);
    return projects[index];
  },

  // 删除项目
  delete: (id) => {
    const projects = readData('projects');
    const filtered = projects.filter(p => p.id !== id);
    saveData('projects', filtered);

    // 同时删除项目下的所有剧集和分镜
    const episodes = readData('episodes');
    const episodeIds = episodes.filter(e => e.projectId === id).map(e => e.id);
    saveData('episodes', episodes.filter(e => e.projectId !== id));

    const scenes = readData('scenes');
    saveData('scenes', scenes.filter(s => !episodeIds.includes(s.episodeId)));

    return true;
  },
};

// ==================== 剧集 ====================

const Episode = {
  // 获取所有剧集（可按projectId筛选）
  findAll: (projectId = null) => {
    const episodes = readData('episodes');
    if (projectId) {
      return episodes.filter(e => e.projectId === projectId);
    }
    return episodes;
  },

  // 根据ID获取剧集
  findById: (id) => {
    const episodes = readData('episodes');
    return episodes.find(e => e.id === id);
  },

  // 获取项目的剧集列表
  findByProject: (projectId) => {
    return readData('episodes').filter(e => e.projectId === projectId);
  },

  // 创建剧集
  create: (data) => {
    const episodes = readData('episodes');
    const episode = {
      id: uuidv4(),
      projectId: data.projectId,
      title: data.title || '新剧集',
      episodeNumber: data.episodeNumber || 1,
      description: data.description || '',
      status: 'draft', // draft, script_ready, storyboard_ready, generating, completed

      // 剧本相关
      script: {
        raw: data.script?.raw || '', // 用户原始输入
        parsed: data.script?.parsed || null, // AI 解析后的结构化剧本
        characters: data.script?.characters || [], // 从剧本提取的角色列表
        scenes: data.script?.scenes || [], // 分场信息
      },

      // 工作流状态
      workflow: {
        script: { status: 'pending', updatedAt: null },
        storyboard: { status: 'pending', updatedAt: null },
        image: { status: 'pending', updatedAt: null },
        video: { status: 'pending', updatedAt: null },
        audio: { status: 'pending', updatedAt: null },
        export: { status: 'pending', updatedAt: null },
      },

      totalDuration: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    episodes.push(episode);
    saveData('episodes', episodes);
    return episode;
  },

  // 更新剧集
  update: (id, data) => {
    const episodes = readData('episodes');
    const index = episodes.findIndex(e => e.id === id);
    if (index === -1) return null;

    episodes[index] = {
      ...episodes[index],
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    saveData('episodes', episodes);
    return episodes[index];
  },

  // 删除剧集
  delete: (id) => {
    const episodes = readData('episodes');
    saveData('episodes', episodes.filter(e => e.id !== id));

    // 同时删除剧集下的所有分镜
    const scenes = readData('scenes');
    saveData('scenes', scenes.filter(s => s.episodeId !== id));

    return true;
  },
};

// ==================== 分镜 ====================

const Scene = {
  // 获取所有分镜（可按episodeId筛选）
  findAll: (episodeId = null) => {
    const scenes = readData('scenes');
    if (episodeId) {
      return scenes.filter(s => s.episodeId === episodeId);
    }
    return scenes;
  },

  // 根据ID获取分镜
  findById: (id) => {
    const scenes = readData('scenes');
    return scenes.find(s => s.id === id);
  },

  // 获取剧集的分镜列表
  findByEpisode: (episodeId) => {
    return readData('scenes').filter(s => s.episodeId === episodeId);
  },

  // 创建分镜
  create: (data) => {
    const scenes = readData('scenes');
    const scene = {
      id: uuidv4(),
      episodeId: data.episodeId,
      shotNumber: data.shotNumber || 1,
      type: data.type || 'shot', // shot, dialogue, action, transition

      // 剧本内容
      script: data.script || '',
      dialogue: data.dialogue || '',
      narration: data.narration || '',

      // 画面描述（AI 生成）
      description: data.description || '',
      visualPrompt: data.visualPrompt || '', // 给图片生成的完整提示词
      camera: data.camera || '中景', // 近景, 中景, 远景, 特写
      cameraMovement: data.cameraMovement || '固定', // 固定, 推, 拉, 摇, 移
      shotAngle: data.shotAngle || '平视', // 平视, 俯视, 仰视

      // 角色关联
      characterIds: data.characterIds || [], // 涉及的角色 ID 列表
      characters: data.characters || [], // 内嵌的角色信息快照

      // 场景
      location: data.location || '',
      timeOfDay: data.timeOfDay || '白天', // 白天, 夜晚, 黎明, 黄昏
      weather: data.weather || '晴', // 晴, 雨, 雪, 雾

      // 视频生成
      videoPrompt: data.videoPrompt || '', // 给视频生成的提示词
      motionIntensity: data.motionIntensity || 0.5, // 0-1, 运动强度

      // 音频
      audioPrompt: data.audioPrompt || '', // 音效描述
      dialogueAudio: null, // 生成的对话音频
      sfxAudio: null, // 生成的音效
      bgmTrack: null, // BGM 轨道

      // BGM/音效
      bgm: data.bgm || '',
      soundEffect: data.soundEffect || '',

      // 生成结果
      image: data.image || null,
      imagePrompt: data.imagePrompt || '',
      video: data.video || null,
      videoUrl: data.videoUrl || null, // 生成的视频 URL
      audio: data.audio || null,

      // 状态
      status: 'pending', // pending, generating, completed, failed
      generationLog: [], // 生成日志
      duration: data.duration || 3, // 预计时长（秒）
      actualDuration: null, // 实际生成后的时长

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    scenes.push(scene);
    saveData('scenes', scenes);
    return scene;
  },

  // 批量创建分镜
  createMany: (scenesData) => {
    const scenes = readData('scenes');
    const newScenes = scenesData.map(data => ({
      id: uuidv4(),
      episodeId: data.episodeId,
      shotNumber: data.shotNumber || 1,
      type: data.type || 'shot',
      script: data.script || '',
      dialogue: data.dialogue || '',
      narration: data.narration || '',
      description: data.description || '',
      visualPrompt: data.visualPrompt || '',
      camera: data.camera || '中景',
      cameraMovement: data.cameraMovement || '固定',
      shotAngle: data.shotAngle || '平视',
      characterIds: data.characterIds || [],
      characters: data.characters || [],
      location: data.location || '',
      timeOfDay: data.timeOfDay || '白天',
      weather: data.weather || '晴',
      videoPrompt: data.videoPrompt || '',
      motionIntensity: data.motionIntensity || 0.5,
      audioPrompt: data.audioPrompt || '',
      dialogueAudio: null,
      sfxAudio: null,
      bgmTrack: null,
      bgm: data.bgm || '',
      soundEffect: data.soundEffect || '',
      image: null,
      imagePrompt: data.imagePrompt || '',
      video: null,
      videoUrl: null,
      audio: null,
      status: 'pending',
      generationLog: [],
      duration: data.duration || 3,
      actualDuration: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    scenes.push(...newScenes);
    saveData('scenes', scenes);
    return newScenes;
  },

  // 更新分镜
  update: (id, data) => {
    const scenes = readData('scenes');
    const index = scenes.findIndex(s => s.id === id);
    if (index === -1) return null;

    scenes[index] = {
      ...scenes[index],
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    saveData('scenes', scenes);
    return scenes[index];
  },

  // 删除分镜
  delete: (id) => {
    const scenes = readData('scenes');
    saveData('scenes', scenes.filter(s => s.id !== id));
    return true;
  },

  // 批量更新分镜顺序
  reorder: (episodeId, orderedIds) => {
    const scenes = readData('scenes');
    orderedIds.forEach((id, index) => {
      const scene = scenes.find(s => s.id === id);
      if (scene) {
        scene.shotNumber = index + 1;
      }
    });
    saveData('scenes', scenes);
    return true;
  },
};

// ==================== 角色 ====================

const Character = {
  // 获取所有角色（可按projectId筛选）
  findAll: (projectId = null) => {
    const characters = readData('characters');
    if (projectId) {
      return characters.filter(c => c.projectId === projectId);
    }
    return characters;
  },

  // 根据ID获取角色
  findById: (id) => {
    const characters = readData('characters');
    return characters.find(c => c.id === id);
  },

  // 创建角色
  create: (data) => {
    const characters = readData('characters');
    const character = {
      id: uuidv4(),
      projectId: data.projectId || null, // null表示全局角色库
      name: data.name || '新角色',
      description: data.description || '',
      personality: data.personality || '', // AI 角色性格描述
      referenceImages: data.referenceImages || [], // 参考图 URL 列表
      ipAdapterData: data.ipAdapterData || null, // IP-Adapter 特征数据
      traits: data.traits || [], // 特征词：["活泼", "开朗"]
      colorPalette: data.colorPalette || [], // 角色主色调
      preferredVoice: data.preferredVoice || '', // 偏好音色 ID
      voiceSettings: data.voiceSettings || { // 音色设置
        speed: 1.0,
        pitch: 0,
        volume: 1.0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    characters.push(character);
    saveData('characters', characters);
    return character;
  },

  // 更新角色
  update: (id, data) => {
    const characters = readData('characters');
    const index = characters.findIndex(c => c.id === id);
    if (index === -1) return null;

    characters[index] = {
      ...characters[index],
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    saveData('characters', characters);
    return characters[index];
  },

  // 删除角色
  delete: (id) => {
    const characters = readData('characters');
    saveData('characters', characters.filter(c => c.id !== id));
    return true;
  },
};

module.exports = {
  Project,
  Episode,
  Scene,
  Character,
};
