import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useProjectStore = create(
  persist(
    (set, get) => ({
      // 项目信息
      project: {
        id: null,
        title: '',
        description: '',
        createdAt: null,
        updatedAt: null,
      },

      // 剧本内容
      script: {
        outline: '',        // 故事大纲
        fullText: '',       // 完整剧本
        genre: 'romance',    // 类型: romance, action, sci-fi, fantasy, horror
        style: 'anime',      // 风格: anime, comic, realistic
      },

      // 分镜列表
      scenes: [],

      // 生成的图片
      images: [],

      // 生成的音频
      audio: [],

      // 视频设置
      videoSettings: {
        resolution: '1080p',    // 720p, 1080p, 4k
        fps: 30,
        duration: 180,          // 总时长(秒)
        transition: 'fade',     // 转场效果
      },

      // 导出设置
      exportSettings: {
        format: 'mp4',
        quality: 'high',
        includeAudio: true,
        includeSubtitles: true,
      },

      // 当前工作流程步骤
      currentStep: 0,
      steps: [
        { id: 'script', name: '剧本创作', icon: 'FileText', status: 'pending' },
        { id: 'storyboard', name: '分镜设计', icon: 'Layout', status: 'pending' },
        { id: 'images', name: '图片生成', icon: 'Image', status: 'pending' },
        { id: 'video', name: '视频生成', icon: 'Video', status: 'pending' },
        { id: 'audio', name: '配音合成', icon: 'Mic', status: 'pending' },
        { id: 'export', name: '预览导出', icon: 'Download', status: 'pending' },
      ],

      // Actions
      setProject: (project) => set({ project }),
      setScript: (script) => set({ script }),
      setScenes: (scenes) => set({ scenes }),
      addScene: (scene) => set((state) => ({
        scenes: [...state.scenes, { ...scene, id: Date.now() }]
      })),
      updateScene: (id, updates) => set((state) => ({
        scenes: state.scenes.map((s) => s.id === id ? { ...s, ...updates } : s)
      })),
      deleteScene: (id) => set((state) => ({
        scenes: state.scenes.filter((s) => s.id !== id)
      })),
      addImage: (image) => set((state) => ({
        images: [...state.images, { ...image, id: Date.now() }]
      })),
      addAudio: (audio) => set((state) => ({
        audio: [...state.audio, { ...audio, id: Date.now() }]
      })),
      setVideoSettings: (settings) => set((state) => ({
        videoSettings: { ...state.videoSettings, ...settings }
      })),
      setExportSettings: (settings) => set((state) => ({
        exportSettings: { ...state.exportSettings, ...settings }
      })),
      setCurrentStep: (step) => set({ currentStep: step }),
      updateStepStatus: (stepId, status) => set((state) => ({
        steps: state.steps.map((s) => s.id === stepId ? { ...s, status } : s)
      })),
      resetProject: () => set({
        project: { id: null, title: '', description: '', createdAt: null, updatedAt: null },
        script: { outline: '', fullText: '', genre: 'romance', style: 'anime' },
        scenes: [],
        images: [],
        audio: [],
        currentStep: 0,
        steps: [
          { id: 'script', name: '剧本创作', icon: 'FileText', status: 'pending' },
          { id: 'storyboard', name: '分镜设计', icon: 'Layout', status: 'pending' },
          { id: 'images', name: '图片生成', icon: 'Image', status: 'pending' },
          { id: 'video', name: '视频生成', icon: 'Video', status: 'pending' },
          { id: 'audio', name: '配音合成', icon: 'Mic', status: 'pending' },
          { id: 'export', name: '预览导出', icon: 'Download', status: 'pending' },
        ],
      }),
    }),
    {
      name: 'manga-theater-storage',
    }
  )
)

// 生成状态管理
export const useGenerationStore = create((set, get) => ({
  isGenerating: false,
  progress: 0,
  currentTask: null,
  logs: [],

  startGeneration: (task) => set({
    isGenerating: true,
    progress: 0,
    currentTask: task,
    logs: [{ time: new Date(), message: `开始任务: ${task}` }]
  }),

  updateProgress: (progress, message) => set((state) => ({
    progress,
    logs: [...state.logs, { time: new Date(), message }]
  })),

  stopGeneration: () => set({
    isGenerating: false,
    progress: 0,
    currentTask: null
  }),

  clearLogs: () => set({ logs: [] }),
}))
