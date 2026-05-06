/**
 * ComfyUI 服务模块
 * 负责与 ComfyUI API 交互，执行图片和视频生成工作流
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// ComfyUI 配置
const COMFYUI_CONFIG = {
  baseUrl: process.env.COMFYUI_URL || 'http://localhost:8188',
  outputDir: process.env.COMFYUI_OUTPUT_DIR || './output',
};

// 工作流目录
const WORKFLOW_DIR = path.join(__dirname, '../workflows');

class ComfyUIService {
  constructor() {
    this.baseUrl = COMFYUI_CONFIG.baseUrl;
    this.outputDir = COMFYUI_CONFIG.outputDir;
    this.queue = [];
    this.processing = false;
  }

  /**
   * 检查 ComfyUI 连接状态
   */
  async checkConnection() {
    try {
      const res = await fetch(`${this.baseUrl}/system_stats`);
      return res.ok;
    } catch (err) {
      console.error('ComfyUI 连接失败:', err);
      return false;
    }
  }

  /**
   * 获取队列状态
   */
  async getQueueStatus() {
    try {
      const res = await fetch(`${this.baseUrl}/queue`);
      const data = await res.json();
      return {
        running: data.queue_running?.length || 0,
        pending: data.queue_pending?.length || 0
      };
    } catch (err) {
      console.error('获取队列状态失败:', err);
      return { running: 0, pending: 0 };
    }
  }

  /**
   * 执行图片生成工作流
   * @param {Object} params - 生成参数
   * @param {string} params.prompt - 画面提示词
   * @param {string} params.negativePrompt - 负面提示词
   * @param {string} params.characterRef - 角色参考图（Base64 或 URL）
   * @param {Object} params.settings - 生成设置
   */
  async generateImage(params) {
    const {
      prompt,
      negativePrompt = 'low quality, bad anatomy, blurry, watermark',
      characterRef = null,
      settings = {}
    } = params;

    const {
      width = 1024,
      height = 1024,
      steps = 25,
      cfg = 7.5,
      seed = -1,
      model = 'sd_xl_base_1.0',
      sampler = 'euler_ancestral'
    } = settings;

    try {
      // 构建工作流
      const workflow = this.buildImageWorkflow({
        prompt,
        negativePrompt,
        characterRef,
        width,
        height,
        steps,
        cfg,
        seed,
        model,
        sampler
      });

      // 提交到 ComfyUI
      const result = await this.submitWorkflow(workflow);
      return result;

    } catch (err) {
      console.error('图片生成失败:', err);
      throw err;
    }
  }

  /**
   * 构建图片生成工作流
   * 支持 IP-Adapter 角色一致性
   */
  buildImageWorkflow(params) {
    const {
      prompt,
      negativePrompt,
      characterRef,
      width,
      height,
      steps,
      cfg,
      seed,
      model,
      sampler
    } = params;

    // 基础工作流结构
    // 注意：实际使用时需要根据 ComfyUI 安装的节点调整
    const workflow = {
      // 模型加载器
      "3": {
        "class_type": "CheckpointLoaderSimple",
        "inputs": {
          "ckpt_name": `${model}.safetensors`
        }
      },
      // 正面提示词
      "4": {
        "class_type": "CLIPTextEncode",
        "inputs": {
          "text": prompt,
          "clip": ["3", 1]
        }
      },
      // 负面提示词
      "5": {
        "class_type": "CLIPTextEncode",
        "inputs": {
          "text": negativePrompt,
          "clip": ["3", 1]
        }
      },
      // 基础采样器
      "6": {
        "class_type": "KSampler",
        "inputs": {
          "seed": seed,
          "steps": steps,
          "cfg": cfg,
          "sampler_name": sampler,
          "scheduler": "normal",
          "positive": ["4", 0],
          "negative": ["5", 0],
          "model": ["3", 0]
        }
      },
      // 图像解码
      "8": {
        "class_type": "VAEDecode",
        "inputs": {
          "samples": ["6", 0],
          "vae": ["3", 2]
        }
      },
      // 保存图像
      "9": {
        "class_type": "SaveImage",
        "inputs": {
          "filename_prefix": `manga_${Date.now()}`,
          "images": ["8", 0]
        }
      }
    };

    // 如果有角色参考图，添加 IP-Adapter 节点
    if (characterRef) {
      // IP-Adapter 节点配置（需要安装 ComfyUI-IPAdapter_plus）
      workflow["ip_adapter"] = {
        "class_type": "IPAdapter",
        "inputs": {
          "model": ["3", 0],
          "image": characterRef, // Base64 或图像路径
          "weight": 0.7, // 一致性权重
          "embeds_scale": 1.0
        }
      };

      // 修改采样器连接
      workflow["6"].inputs.positive = ["ip_adapter", 0];
    }

    return workflow;
  }

  /**
   * 执行视频生成工作流（I2V）
   * @param {Object} params - 生成参数
   */
  async generateVideo(params) {
    const {
      imagePath,
      prompt,
      settings = {}
    } = params;

    const {
      duration = 3,
      fps = 24,
      motionStrength = 0.5
    } = settings;

    try {
      const workflow = this.buildVideoWorkflow({
        imagePath,
        prompt,
        duration,
        fps,
        motionStrength
      });

      const result = await this.submitWorkflow(workflow);
      return result;

    } catch (err) {
      console.error('视频生成失败:', err);
      throw err;
    }
  }

  /**
   * 构建视频生成工作流
   */
  buildVideoWorkflow(params) {
    const { imagePath, prompt, duration, fps, motionStrength } = params;

    // 视频生成工作流
    // 注意：需要安装对应的视频生成节点（如 AnimateDiff）
    return {
      "load_image": {
        "class_type": "LoadImage",
        "inputs": {
          "image": imagePath
        }
      },
      "video_prompt": {
        "class_type": "CLIPTextEncode",
        "inputs": {
          "text": prompt
        }
      },
      "animate_diff": {
        "class_type": "AnimateDiffLoader",
        "inputs": {
          "model": "model_name",
          "context_length": 16,
          "motion_strength": motionStrength
        }
      },
      "img2video": {
        "class_type": "ImageToVideo",
        "inputs": {
          "image": ["load_image", 0],
          "prompt": ["video_prompt", 0],
          "frames": duration * fps,
          "fps": fps,
          "model": ["animate_diff", 0]
        }
      },
      "save_video": {
        "class_type": "SaveAnimatedWEBP",
        "inputs": {
          "filename_prefix": `video_${Date.now()}`,
          "images": ["img2video", 0]
        }
      }
    };
  }

  /**
   * 提交工作流到 ComfyUI
   */
  async submitWorkflow(workflow) {
    try {
      // 提交工作流
      const res = await fetch(`${this.baseUrl}/prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: workflow,
          extra_data: {}
        })
      });

      if (!res.ok) {
        throw new Error(`提交失败: ${res.status}`);
      }

      const data = await res.json();
      const promptId = data.prompt_id;

      // 等待完成
      const result = await this.waitForCompletion(promptId);
      return result;

    } catch (err) {
      console.error('提交工作流失败:', err);
      throw err;
    }
  }

  /**
   * 等待工作流完成
   */
  async waitForCompletion(promptId, timeout = 300000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        // 检查历史记录
        const res = await fetch(`${this.baseUrl}/history/${promptId}`);
        const data = await res.json();

        if (data[promptId]) {
          const status = data[promptId].status;
          if (status.exec_err) {
            throw new Error('执行错误');
          }
          return this.parseOutput(data[promptId]);
        }

        // 等待一段时间后再检查
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (err) {
        if (err.message === '执行错误') throw err;
        console.error('检查状态失败:', err);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    throw new Error('超时');
  }

  /**
   * 解析输出结果
   */
  parseOutput(historyData) {
    const outputs = historyData.outputs || {};
    const images = [];
    const videos = [];

    // 收集所有输出文件
    Object.values(outputs).forEach(node => {
      if (node.images) {
        images.push(...node.images.map(img => ({
          filename: img.filename,
          subfolder: img.subfolder,
          type: img.type
        })));
      }
      if (node.videos) {
        videos.push(...node.videos.map(vid => ({
          filename: vid.filename,
          subfolder: vid.subfolder,
          type: vid.type
        })));
      }
    });

    return {
      promptId: historyData.prompt_id,
      status: historyData.status,
      images,
      videos
    };
  }

  /**
   * 获取输出文件 URL
   */
  getOutputUrl(filename, subfolder = '', type = 'output') {
    return `${this.baseUrl}/view?filename=${filename}&subfolder=${subfolder}&type=${type}`;
  }

  /**
   * 保存工作流模板
   */
  saveWorkflow(name, workflow) {
    const filepath = path.join(WORKFLOW_DIR, `${name}.json`);
    fs.writeFileSync(filepath, JSON.stringify(workflow, null, 2));
    return filepath;
  }

  /**
   * 加载工作流模板
   */
  loadWorkflow(name) {
    const filepath = path.join(WORKFLOW_DIR, `${name}.json`);
    if (fs.existsSync(filepath)) {
      return JSON.parse(fs.readFileSync(filepath, 'utf8'));
    }
    return null;
  }
}

// 导出单例
module.exports = new ComfyUIService();
