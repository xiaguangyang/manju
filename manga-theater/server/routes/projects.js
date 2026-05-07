/**
 * 项目/剧集/分镜 API 路由
 */
const express = require('express');
const router = express.Router();
const { Project, Episode, Scene, Character } = require('../models/Project');

// 初始化数据目录
Project.init?.() || Episode.init?.() || Scene.init?.();

// ==================== AI 辅助函数 ====================

function parseScriptWithAI(script) {
  const lines = script.split('\n');
  const characters = [];
  const scenes = [];
  let currentScene = null;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('## 场景') || trimmed.startsWith('##第')) {
      if (currentScene) scenes.push(currentScene);
      currentScene = { name: trimmed.replace(/^##\s*/, ''), description: '', characters: [] };
    } else if (trimmed.startsWith('人物：') || trimmed.startsWith('角色：')) {
      const names = trimmed.split(/[：:]/)[1]?.split(/[、,，]/).map(n => n.trim()) || [];
      names.forEach(name => {
        if (name && !characters.find(c => c.name === name)) {
          characters.push({ name, description: '', personality: '' });
        }
      });
      if (currentScene) currentScene.characters = names;
    } else if (trimmed && currentScene && !currentScene.description) {
      if (trimmed.length > 10) currentScene.description = trimmed.substring(0, 50) + '...';
    }
  });
  if (currentScene) scenes.push(currentScene);

  return {
    characters: characters.length > 0 ? characters : [
      { name: '主角', description: '故事的主要角色', personality: '勇敢、善良' },
      { name: '配角', description: '故事的辅助角色', personality: '温和、友好' }
    ],
    scenes: scenes.length > 0 ? scenes : [{ name: '第一场', description: '开场场景', characters: [] }],
    summary: `剧本包含 ${characters.length} 个角色，${scenes.length} 个场景`
  };
}

function generateStoryboardWithAI(scriptData, episodeId) {
  const scenes = scriptData.scenes || [];
  const characters = scriptData.characters || [];

  return scenes.map((scene, index) => ({
    episodeId,
    shotNumber: index + 1,
    type: 'shot',
    script: scene.description || '',
    description: scene.description || '',
    visualPrompt: generateVisualPrompt(scene, characters),
    camera: ['中景', '近景', '远景'][index % 3],
    cameraMovement: '固定',
    shotAngle: '平视',
    characterIds: characters.filter(c => scene.characters?.includes(c.name)).map(c => c.id || `char_${index}`),
    characters: characters.filter(c => scene.characters?.includes(c.name)),
    location: scene.name || '未知场景',
    timeOfDay: index % 2 === 0 ? '白天' : '夜晚',
    weather: '晴',
    videoPrompt: `${scene.description} 动态画面，缓慢运镜`,
    motionIntensity: 0.5,
    status: 'pending',
    duration: 3 + (index % 3)
  }));
}

function generateVisualPrompt(scene, characters) {
  const charNames = scene.characters?.join('、') || '人物';
  return `${charNames}在${scene.name || '场景'}，${scene.description || '进行日常对话'}, anime style, high quality, detailed, soft lighting, cinematic composition`;
}

// ==================== 项目路由 ====================

// 获取所有项目
router.get('/projects', (req, res) => {
  try {
    const projects = Project.findAll();
    const projectsWithStats = projects.map(p => {
      const episodes = Episode.findByProject(p.id);
      const scenes = episodes.flatMap(e => Scene.findByEpisode(e.id));
      return { ...p, episodeCount: episodes.length, sceneCount: scenes.length, completedScenes: scenes.filter(s => s.status === 'completed').length };
    });
    res.json({ success: true, data: projectsWithStats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取单个项目
router.get('/projects/:id', (req, res) => {
  try {
    const project = Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, error: '项目不存在' });
    const episodes = Episode.findByProject(project.id);
    res.json({ success: true, data: { ...project, episodes } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 创建项目
router.post('/projects', (req, res) => {
  try {
    const project = Project.create(req.body);
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新项目
router.put('/projects/:id', (req, res) => {
  try {
    const project = Project.update(req.params.id, req.body);
    if (!project) return res.status(404).json({ success: false, error: '项目不存在' });
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新项目步骤状态
router.put('/projects/:id/steps/:stepId', (req, res) => {
  try {
    const { status, content, ...otherData } = req.body;
    const project = Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, error: '项目不存在' });
    const stepData = { status: status || 'pending', updatedAt: new Date().toISOString() };
    if (content !== undefined) stepData.content = content;
    Object.keys(otherData).forEach(key => {
      if (!project[req.params.stepId]) project[req.params.stepId] = {};
      project[req.params.stepId][key] = otherData[key];
    });
    const updatedProject = Project.update(req.params.id, { [req.params.stepId]: { ...(project[req.params.stepId] || {}), ...stepData } });
    res.json({ success: true, data: updatedProject });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除项目
router.delete('/projects/:id', (req, res) => {
  try {
    const result = Project.delete(req.params.id);
    if (!result) return res.status(404).json({ success: false, error: '项目不存在' });
    res.json({ success: true, message: '项目已删除' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== 剧集路由 ====================

// 获取项目的所有剧集
router.get('/projects/:projectId/episodes', (req, res) => {
  try {
    const episodes = Episode.findByProject(req.params.projectId);
    const episodesWithStats = episodes.map(e => {
      const scenes = Scene.findByEpisode(e.id);
      return { ...e, sceneCount: scenes.length, completedScenes: scenes.filter(s => s.status === 'completed').length };
    });
    res.json({ success: true, data: episodesWithStats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取单个剧集
router.get('/projects/:projectId/episodes/:id', (req, res) => {
  try {
    const episode = Episode.findById(req.params.id);
    if (!episode) return res.status(404).json({ success: false, error: '剧集不存在' });
    const scenes = Scene.findByEpisode(episode.id);
    res.json({ success: true, data: { ...episode, scenes } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 为项目创建剧集
router.post('/projects/:projectId/episodes', (req, res) => {
  try {
    const episode = Episode.create({ ...req.body, projectId: req.params.projectId });
    res.status(201).json({ success: true, data: episode });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新剧集
router.put('/projects/:projectId/episodes/:id', (req, res) => {
  try {
    const episode = Episode.update(req.params.id, req.body);
    if (!episode) return res.status(404).json({ success: false, error: '剧集不存在' });
    res.json({ success: true, data: episode });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除剧集
router.delete('/projects/:projectId/episodes/:id', (req, res) => {
  try {
    const result = Episode.delete(req.params.id);
    if (!result) return res.status(404).json({ success: false, error: '剧集不存在' });
    res.json({ success: true, message: '剧集已删除' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== 分镜路由 ====================

// 获取剧集的所有分镜
router.get('/projects/:projectId/episodes/:episodeId/scenes', (req, res) => {
  try {
    const scenes = Scene.findByEpisode(req.params.episodeId);
    res.json({ success: true, data: scenes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 创建分镜
router.post('/scenes', (req, res) => {
  try {
    const scene = Scene.create(req.body);
    res.status(201).json({ success: true, data: scene });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 批量创建分镜
router.post('/scenes/batch', (req, res) => {
  try {
    const scenes = Scene.createMany(req.body.scenes);
    res.status(201).json({ success: true, data: scenes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新分镜
router.put('/scenes/:id', (req, res) => {
  try {
    const scene = Scene.update(req.params.id, req.body);
    if (!scene) return res.status(404).json({ success: false, error: '分镜不存在' });
    res.json({ success: true, data: scene });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除分镜
router.delete('/scenes/:id', (req, res) => {
  try {
    const result = Scene.delete(req.params.id);
    if (!result) return res.status(404).json({ success: false, error: '分镜不存在' });
    res.json({ success: true, message: '分镜已删除' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== 剧本 AI 处理路由 ====================

// AI 解析剧本
router.post('/projects/:projectId/episodes/:episodeId/script/parse', (req, res) => {
  try {
    const { script } = req.body;
    if (!script) return res.status(400).json({ success: false, error: '剧本内容不能为空' });
    const parsed = parseScriptWithAI(script);
    res.json({ success: true, data: parsed });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI 生成分镜
router.post('/projects/:projectId/episodes/:episodeId/storyboard/generate', (req, res) => {
  try {
    const episode = Episode.findById(req.params.episodeId);
    if (!episode) return res.status(404).json({ success: false, error: '剧集不存在' });
    if (!episode.script?.parsed) return res.status(400).json({ success: false, error: '请先解析剧本' });
    const scenes = generateStoryboardWithAI(episode.script, episode.id);
    const createdScenes = Scene.createMany(scenes);
    res.json({ success: true, data: createdScenes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== 角色路由 ====================

// 获取角色列表
router.get('/characters', (req, res) => {
  try {
    const { projectId } = req.query;
    let characters = projectId ? Character.findByProject(projectId) : Character.findAll();
    res.json({ success: true, data: characters });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI 生成角色描述
router.post('/characters/generate', (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, error: '角色名称不能为空' });
    const templates = [
      { personality: '活泼开朗、乐观向上', traits: ['活泼', '开朗', '勇敢'] },
      { personality: '沉稳内敛、善于思考', traits: ['沉稳', '冷静', '睿智'] },
      { personality: '温柔善良、体贴周到', traits: ['温柔', '善良', '细腻'] },
    ];
    const template = templates[Math.floor(Math.random() * templates.length)];
    res.json({ success: true, data: { description: `${name}是一个有着独特魅力的角色，外表特征鲜明。`, personality: template.personality, traits: template.traits, colorPalette: ['#FFB6C1', '#87CEEB', '#98FB98'] } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 创建角色
router.post('/characters', (req, res) => {
  try {
    const character = Character.create(req.body);
    res.status(201).json({ success: true, data: character });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新角色
router.put('/characters/:id', (req, res) => {
  try {
    const character = Character.update(req.params.id, req.body);
    if (!character) return res.status(404).json({ success: false, error: '角色不存在' });
    res.json({ success: true, data: character });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除角色
router.delete('/characters/:id', (req, res) => {
  try {
    const result = Character.delete(req.params.id);
    if (!result) return res.status(404).json({ success: false, error: '角色不存在' });
    res.json({ success: true, message: '角色已删除' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
