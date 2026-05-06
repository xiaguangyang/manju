/**
 * 项目/剧集/分镜 API 路由
 */
const express = require('express');
const router = express.Router();
const { Project, Episode, Scene, Character } = require('../models/Project');

// 初始化数据目录
Project.init?.() || Episode.init?.() || Scene.init?.();

// ==================== 项目路由 ====================

// 获取所有项目
router.get('/projects', (req, res) => {
  try {
    const projects = Project.findAll();
    // 附加统计信息
    const projectsWithStats = projects.map(p => {
      const episodes = Episode.findByProject(p.id);
      const scenes = episodes.flatMap(e => Scene.findByEpisode(e.id));
      return {
        ...p,
        episodeCount: episodes.length,
        sceneCount: scenes.length,
        completedScenes: scenes.filter(s => s.status === 'completed').length,
      };
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
    if (!project) {
      return res.status(404).json({ success: false, error: '项目不存在' });
    }
    // 附加剧集列表
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
    if (!project) {
      return res.status(404).json({ success: false, error: '项目不存在' });
    }
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
    if (!project) {
      return res.status(404).json({ success: false, error: '项目不存在' });
    }
    
    // 更新步骤数据
    const stepData = {
      status: status || 'pending',
      updatedAt: new Date().toISOString(),
    };
    if (content !== undefined) {
      stepData.content = content;
    }
    
    // 合并其他数据
    Object.keys(otherData).forEach(key => {
      if (!project[req.params.stepId]) {
        project[req.params.stepId] = {};
      }
      project[req.params.stepId][key] = otherData[key];
    });
    
    // 更新项目
    const updatedProject = Project.update(req.params.id, {
      [req.params.stepId]: {
        ...(project[req.params.stepId] || {}),
        ...stepData,
      }
    });
    
    res.json({ success: true, data: updatedProject });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除项目
router.delete('/projects/:id', (req, res) => {
  try {
    const result = Project.delete(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, error: '项目不存在' });
    }
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
    // 附加分镜统计
    const episodesWithStats = episodes.map(e => {
      const scenes = Scene.findByEpisode(e.id);
      return {
        ...e,
        sceneCount: scenes.length,
        completedScenes: scenes.filter(s => s.status === 'completed').length,
      };
    });
    res.json({ success: true, data: episodesWithStats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取单个剧集
router.get('/episodes/:id', (req, res) => {
  try {
    const episode = Episode.findById(req.params.id);
    if (!episode) {
      return res.status(404).json({ success: false, error: '剧集不存在' });
    }
    // 附加分镜列表
    const scenes = Scene.findByEpisode(episode.id);
    res.json({ success: true, data: { ...episode, scenes } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取单个剧集（带 projectId 前缀的路由）
router.get('/projects/:projectId/episodes/:id', (req, res) => {
  try {
    const episode = Episode.findById(req.params.id);
    if (!episode) {
      return res.status(404).json({ success: false, error: '剧集不存在' });
    }
    // 附加分镜列表
    const scenes = Scene.findByEpisode(episode.id);
    res.json({ success: true, data: { ...episode, scenes } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取剧集的所有分镜（带 projectId 前缀）
router.get('/projects/:projectId/episodes/:episodeId/scenes', (req, res) => {
  try {
    const scenes = Scene.findByEpisode(req.params.episodeId);
    res.json({ success: true, data: scenes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 为项目创建剧集
router.post('/projects/:projectId/episodes', (req, res) => {
  try {
    const episode = Episode.create({
      ...req.body,
      projectId: req.params.projectId,
    });
    res.status(201).json({ success: true, data: episode });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除剧集（带 projectId 前缀）
router.delete('/projects/:projectId/episodes/:id', (req, res) => {
  try {
    const result = Episode.delete(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, error: '剧集不存在' });
    }
    res.json({ success: true, message: '剧集已删除' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新剧集步骤状态
router.put('/projects/:projectId/episodes/:episodeId/steps/:stepId', (req, res) => {
  try {
    const { status, content, ...otherData } = req.body;
    const episode = Episode.findById(req.params.episodeId);
    if (!episode) {
      return res.status(404).json({ success: false, error: '剧集不存在' });
    }
    
    // 更新步骤数据
    const stepData = {
      status: status || 'pending',
      updatedAt: new Date().toISOString(),
    };
    if (content !== undefined) {
      stepData.content = content;
    }
    
    // 合并其他数据
    Object.keys(otherData).forEach(key => {
      if (!episode[req.params.stepId]) {
        episode[req.params.stepId] = {};
      }
      episode[req.params.stepId][key] = otherData[key];
    });
    
    // 更新剧集
    const updatedEpisode = Episode.update(req.params.episodeId, {
      [req.params.stepId]: {
        ...(episode[req.params.stepId] || {}),
        ...stepData,
      }
    });
    
    res.json({ success: true, data: updatedEpisode });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 创建剧集
router.post('/episodes', (req, res) => {
  try {
    const episode = Episode.create(req.body);
    res.status(201).json({ success: true, data: episode });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新剧集
router.put('/episodes/:id', (req, res) => {
  try {
    const episode = Episode.update(req.params.id, req.body);
    if (!episode) {
      return res.status(404).json({ success: false, error: '剧集不存在' });
    }
    res.json({ success: true, data: episode });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除剧集
router.delete('/episodes/:id', (req, res) => {
  try {
    const result = Episode.delete(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, error: '剧集不存在' });
    }
    res.json({ success: true, message: '剧集已删除' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== 分镜路由 ====================

// 获取剧集的所有分镜
router.get('/scenes/episode/:episodeId', (req, res) => {
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
    const scenes = Scene.createBatch(req.body.scenes);
    res.status(201).json({ success: true, data: scenes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新分镜
router.put('/scenes/:id', (req, res) => {
  try {
    const scene = Scene.update(req.params.id, req.body);
    if (!scene) {
      return res.status(404).json({ success: false, error: '分镜不存在' });
    }
    res.json({ success: true, data: scene });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除分镜
router.delete('/scenes/:id', (req, res) => {
  try {
    const result = Scene.delete(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, error: '分镜不存在' });
    }
    res.json({ success: true, message: '分镜已删除' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 重新排序分镜
router.put('/scenes/reorder', (req, res) => {
  try {
    Scene.reorder(req.body.sceneIds);
    res.json({ success: true, message: '分镜已重新排序' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== 角色路由 ====================

// 获取项目的所有角色
router.get('/characters/project/:projectId', (req, res) => {
  try {
    const characters = Character.findByProject(req.params.projectId);
    res.json({ success: true, data: characters });
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
    if (!character) {
      return res.status(404).json({ success: false, error: '角色不存在' });
    }
    res.json({ success: true, data: character });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除角色
router.delete('/characters/:id', (req, res) => {
  try {
    const result = Character.delete(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, error: '角色不存在' });
    }
    res.json({ success: true, message: '角色已删除' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
