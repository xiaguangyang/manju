/**
 * ComfyUI API 路由
 * 提供图片生成和视频生成接口
 */
const express = require('express');
const router = express.Router();
const comfyui = require('../services/comfyui');

// 检查 ComfyUI 连接状态
router.get('/status', async (req, res) => {
  try {
    const connected = await comfyui.checkConnection();
    const queue = await comfyui.getQueueStatus();
    res.json({
      success: true,
      data: {
        connected,
        queue
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 生成图片
router.post('/generate/image', async (req, res) => {
  try {
    const { prompt, negativePrompt, characterRef, settings } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, error: '提示词不能为空' });
    }

    // 检查 ComfyUI 连接
    const connected = await comfyui.checkConnection();
    if (!connected) {
      // 如果 ComfyUI 未连接，返回模拟数据
      return res.json({
        success: true,
        data: {
          mock: true,
          prompt,
          message: 'ComfyUI 未连接，返回模拟数据',
          result: {
            images: [{
              url: `https://picsum.photos/1024/1024?random=${Date.now()}`,
              filename: `mock_${Date.now()}.png`
            }]
          }
        }
      });
    }

    // 调用 ComfyUI 生成
    const result = await comfyui.generateImage({
      prompt,
      negativePrompt,
      characterRef,
      settings
    });

    // 转换输出路径为 URL
    const images = result.images.map(img => ({
      ...img,
      url: comfyui.getOutputUrl(img.filename, img.subfolder, img.type)
    }));

    res.json({
      success: true,
      data: {
        promptId: result.promptId,
        images
      }
    });

  } catch (error) {
    console.error('图片生成失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 批量生成图片（用于分镜）
router.post('/generate/batch', async (req, res) => {
  try {
    const { scenes, characterRefs = {} } = req.body;

    if (!scenes || !Array.isArray(scenes)) {
      return res.status(400).json({ success: false, error: '无效的分镜数据' });
    }

    const results = [];
    const errors = [];

    // 逐个生成（可以改为并发，但要注意队列压力）
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];

      try {
        // 检查 ComfyUI 连接
        const connected = await comfyui.checkConnection();

        if (!connected) {
          // 模拟数据
          results.push({
            sceneId: scene.id,
            success: true,
            mock: true,
            image: {
              url: `https://picsum.photos/1024/1024?random=${Date.now() + i}`,
              filename: `scene_${scene.id}.png`
            }
          });
        } else {
          // 实际调用
          const characterRef = scene.characterIds
            ?.map(id => characterRefs[id])
            ?.filter(Boolean)[0] || null;

          const result = await comfyui.generateImage({
            prompt: scene.visualPrompt || scene.description,
            negativePrompt: 'low quality, bad anatomy, blurry, text, watermark',
            characterRef,
            settings: scene.settings || {}
          });

          if (result.images?.length > 0) {
            results.push({
              sceneId: scene.id,
              success: true,
              image: {
                ...result.images[0],
                url: comfyui.getOutputUrl(result.images[0].filename, result.images[0].subfolder, result.images[0].type)
              }
            });
          } else {
            errors.push({ sceneId: scene.id, error: '未生成图片' });
          }
        }
      } catch (err) {
        errors.push({ sceneId: scene.id, error: err.message });
      }
    }

    res.json({
      success: true,
      data: {
        results,
        errors,
        summary: {
          total: scenes.length,
          success: results.length,
          failed: errors.length
        }
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 生成视频
router.post('/generate/video', async (req, res) => {
  try {
    const { imagePath, prompt, settings } = req.body;

    if (!imagePath) {
      return res.status(400).json({ success: false, error: '图片路径不能为空' });
    }

    // 检查 ComfyUI 连接
    const connected = await comfyui.checkConnection();
    if (!connected) {
      return res.json({
        success: true,
        data: {
          mock: true,
          message: 'ComfyUI 未连接，返回模拟数据',
          result: {
            videos: [{
              url: `https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4`,
              filename: `mock_video_${Date.now()}.mp4`
            }]
          }
        }
      });
    }

    const result = await comfyui.generateVideo({
      imagePath,
      prompt,
      settings
    });

    const videos = result.videos.map(vid => ({
      ...vid,
      url: comfyui.getOutputUrl(vid.filename, vid.subfolder, vid.type)
    }));

    res.json({
      success: true,
      data: {
        promptId: result.promptId,
        videos
      }
    });

  } catch (error) {
    console.error('视频生成失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取队列状态
router.get('/queue', async (req, res) => {
  try {
    const status = await comfyui.getQueueStatus();
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
