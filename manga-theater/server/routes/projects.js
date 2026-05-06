/**
 * 项目/剧集/分镜 API 路由
 */
const express = require('express');
const router = express.Router();
const { Project, Episode, Scene, Character } = require('../models/Project');

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
        completedCount: scenes.filter(s => s.status === 'completed').length,
      };
    });
    res.json(projectsWithStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取单个项目
router.get('/projects/:id', (req, res) => {
  try {
    const project = Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: '项目不存在' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建项目
router.post('/projects', (req, res) => {
  try {
    const project = Project.create(req.body);
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新项目
router.put('/projects/:id', (req, res) => {
  try {
    const project = Project.update(req.params.id, req.body);
    if (!project) {
      return res.status(404).json({ error: '项目不存在' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除项目
router.delete('/projects/:id', (req, res) => {
  try {
    Project.delete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== 剧集路由 ====================

// 获取所有剧集（支持按projectId筛选）
router.get('/episodes', (req, res) => {
  try {
    const { projectId } = req.query;
    const episodes = Episode.findAll(projectId);
    res.json(episodes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取单个剧集
router.get('/episodes/:id', (req, res) => {
  try {
    const episode = Episode.findById(req.params.id);
    if (!episode) {
      return res.status(404).json({ error: '剧集不存在' });
    }
    res.json(episode);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建剧集
router.post('/episodes', (req, res) => {
  try {
    const episode = Episode.create(req.body);
    res.status(201).json(episode);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新剧集
router.put('/episodes/:id', (req, res) => {
  try {
    const episode = Episode.update(req.params.id, req.body);
    if (!episode) {
      return res.status(404).json({ error: '剧集不存在' });
    }
    res.json(episode);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除剧集
router.delete('/episodes/:id', (req, res) => {
  try {
    Episode.delete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== 分镜路由 ====================

// 获取所有分镜（支持按episodeId筛选）
router.get('/scenes', (req, res) => {
  try {
    const { episodeId } = req.query;
    const scenes = Scene.findAll(episodeId);
    res.json(scenes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取单个分镜
router.get('/scenes/:id', (req, res) => {
  try {
    const scene = Scene.findById(req.params.id);
    if (!scene) {
      return res.status(404).json({ error: '分镜不存在' });
    }
    res.json(scene);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建分镜
router.post('/scenes', (req, res) => {
  try {
    const scene = Scene.create(req.body);
    res.status(201).json(scene);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 批量创建分镜
router.post('/scenes/batch', (req, res) => {
  try {
    const scenes = Scene.createMany(req.body.scenes);
    res.status(201).json(scenes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新分镜
router.put('/scenes/:id', (req, res) => {
  try {
    const scene = Scene.update(req.params.id, req.body);
    if (!scene) {
      return res.status(404).json({ error: '分镜不存在' });
    }
    res.json(scene);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除分镜
router.delete('/scenes/:id', (req, res) => {
  try {
    Scene.delete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 批量更新分镜顺序
router.put('/scenes/reorder/:episodeId', (req, res) => {
  try {
    Scene.reorder(req.params.episodeId, req.body.orderedIds);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== 角色路由 ====================

// 获取所有角色
router.get('/characters', (req, res) => {
  try {
    const { projectId } = req.query;
    const characters = Character.findAll(projectId);
    res.json(characters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取单个角色
router.get('/characters/:id', (req, res) => {
  try {
    const character = Character.findById(req.params.id);
    if (!character) {
      return res.status(404).json({ error: '角色不存在' });
    }
    res.json(character);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建角色
router.post('/characters', (req, res) => {
  try {
    const character = Character.create(req.body);
    res.status(201).json(character);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新角色
router.put('/characters/:id', (req, res) => {
  try {
    const character = Character.update(req.params.id, req.body);
    if (!character) {
      return res.status(404).json({ error: '角色不存在' });
    }
    res.json(character);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除角色
router.delete('/characters/:id', (req, res) => {
  try {
    Character.delete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
