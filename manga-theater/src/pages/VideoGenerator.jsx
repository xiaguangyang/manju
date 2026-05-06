import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore, useGenerationStore } from '../store'
import {
  Video,
  Play,
  Pause,
  Loader2,
  Settings,
  Wand2,
  Film,
  Clock,
  Layers,
  ArrowRight,
  Check,
  AlertCircle,
  Zap,
} from 'lucide-react'

const videoModels = [
  {
    id: 'kling',
    name: '可灵AI',
    provider: '快手',
    quality: '高质量',
    speed: '较快',
    color: 'from-orange-500 to-red-500',
    badge: '推荐'
  },
  {
    id: 'jimeng',
    name: '即梦AI',
    provider: '字节',
    quality: '高质量',
    speed: '快',
    color: 'from-blue-500 to-purple-500',
    badge: '免费'
  },
  {
    id: 'runway',
    name: 'Runway',
    provider: 'Runway',
    quality: '最高质量',
    speed: '较慢',
    color: 'from-gray-600 to-gray-800',
    badge: null
  },
]

const transitions = [
  { id: 'fade', name: '淡入淡出', icon: '💫' },
  { id: 'slide', name: '滑动', icon: '➡️' },
  { id: 'zoom', name: '缩放', icon: '🔍' },
  { id: 'wipe', name: '擦除', icon: '🧹' },
  { id: 'none', name: '无转场', icon: '⚡' },
]

export default function VideoGenerator() {
  const navigate = useNavigate()
  const { scenes, images, videoSettings, setVideoSettings, setCurrentStep, updateStepStatus } = useProjectStore()
  const { isGenerating, progress, startGeneration, updateProgress, stopGeneration } = useGenerationStore()
  const [selectedModel, setSelectedModel] = useState('kling')
  const [videos, setVideos] = useState([])
  const [generatingIndex, setGeneratingIndex] = useState(null)

  // 获取分镜对应的图片
  const getImageForScene = (sceneId) => {
    return images.find(img => img.sceneId === sceneId)
  }

  // 生成单个视频
  const handleGenerateVideo = async (scene, index) => {
    const image = getImageForScene(scene.id)
    if (!image) {
      alert('请先为此分镜生成图片')
      return
    }

    setGeneratingIndex(index)
    startGeneration(`生成视频 - 镜头${scene.shot_id}`)

    // 模拟生成过程
    for (let i = 0; i <= 100; i += 2) {
      await new Promise(resolve => setTimeout(resolve, 100))
      updateProgress(i, `视频生成中... ${i}%`)
    }

    // 添加生成的视频
    setVideos(prev => [...prev, {
      sceneId: scene.id,
      url: image.url, // 使用静态图作为占位
      duration: scene.duration,
      model: selectedModel,
    }])

    setGeneratingIndex(null)
    stopGeneration()
  }

  // 批量生成视频
  const handleBatchGenerate = async () => {
    if (images.length === 0) {
      alert('请先生成图片')
      return
    }

    startGeneration('批量生成视频')
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i]
      const image = getImageForScene(scene.id)
      if (!image) continue

      setGeneratingIndex(i)
      updateProgress(Math.round((i / scenes.length) * 100), `正在生成镜头${scene.shot_id}...`)

      await new Promise(resolve => setTimeout(resolve, 2000))

      setVideos(prev => [...prev, {
        sceneId: scene.id,
        url: image.url,
        duration: scene.duration,
        model: selectedModel,
      }])
    }

    setGeneratingIndex(null)
    stopGeneration()
  }

  // 下一步
  const handleNextStep = () => {
    if (videos.length > 0) {
      setCurrentStep(4)
      updateStepStatus('video', 'completed')
      navigate('/audio')
    }
  }

  // 获取视频对应的分镜
  const getSceneForVideo = (sceneId) => {
    return scenes.find(s => s.id === sceneId)
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">视频生成</h1>
          <p className="text-gray-500 mt-1">将图片转换为动态视频</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleBatchGenerate}
            disabled={images.length === 0 || isGenerating}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <Wand2 className="w-4 h-4" />
            批量生成视频
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* 视频模型选择 */}
        <div className="panel p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" />
            选择视频模型
          </h3>
          <div className="space-y-3">
            {videoModels.map((model) => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`
                  w-full p-4 rounded-xl border-2 transition-all text-left relative
                  ${selectedModel === model.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                {model.badge && (
                  <span className={`
                    absolute -top-2 -right-2 px-2 py-0.5 text-xs font-medium rounded-full text-white
                    ${model.id === 'kling' ? 'bg-orange-500' : 'bg-green-500'}
                  `}>
                    {model.badge}
                  </span>
                )}
                <div className="flex items-center gap-3">
                  <div className={`
                    w-10 h-10 rounded-lg bg-gradient-to-br ${model.color}
                    flex items-center justify-center text-white font-bold
                  `}>
                    {model.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{model.name}</div>
                    <div className="text-sm text-gray-500">{model.provider} · {model.quality}</div>
                  </div>
                  <div className="text-xs text-gray-400">{model.speed}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 p-3 bg-amber-50 rounded-lg text-sm text-amber-700">
            <div className="flex gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>视频生成需要调用外部API，可能产生额外费用</p>
            </div>
          </div>
        </div>

        {/* 视频设置 */}
        <div className="panel p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-500" />
            视频设置
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">分辨率</label>
              <select
                value={videoSettings.resolution}
                onChange={(e) => setVideoSettings({ resolution: e.target.value })}
                className="input-modern"
              >
                <option value="720p">720p (HD)</option>
                <option value="1080p">1080p (Full HD)</option>
                <option value="4k">4K (Ultra HD)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">帧率</label>
              <select
                value={videoSettings.fps}
                onChange={(e) => setVideoSettings({ fps: parseInt(e.target.value) })}
                className="input-modern"
              >
                <option value="24">24 fps (电影感)</option>
                <option value="30">30 fps (标准)</option>
                <option value="60">60 fps (流畅)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">转场效果</label>
              <div className="grid grid-cols-5 gap-2">
                {transitions.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setVideoSettings({ transition: t.id })}
                    className={`
                      p-2 rounded-lg border-2 text-center transition-all
                      ${videoSettings.transition === t.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                    title={t.name}
                  >
                    <span className="text-lg">{t.icon}</span>
                    <div className="text-xs mt-1">{t.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="panel p-6">
          <h3 className="font-semibold text-gray-900 mb-4">生成统计</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">图片数量</span>
              <span className="font-semibold">{images.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">已生成视频</span>
              <span className="font-semibold text-green-600">{videos.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">预计总时长</span>
              <span className="font-semibold">
                {Math.round(scenes.reduce((acc, s) => acc + parseInt(s.duration), 0) / 60)}秒
              </span>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">完成进度</span>
                <span className="text-sm font-medium">
                  {scenes.length > 0 ? Math.round((videos.length / scenes.length) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all"
                  style={{ width: `${scenes.length > 0 ? (videos.length / scenes.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 视频预览列表 */}
      <div className="panel">
        <div className="panel-header">
          <div className="flex items-center gap-3">
            <Film className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">视频预览</h3>
          </div>
          <span className="text-sm text-gray-500">
            {videos.length} / {scenes.length} 已生成
          </span>
        </div>

        <div className="p-6">
          {scenes.length === 0 ? (
            <div className="text-center py-12">
              <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">请先添加分镜并生成图片</p>
            </div>
          ) : (
            <div className="preview-grid">
              {scenes.map((scene, index) => {
                const video = videos.find(v => v.sceneId === scene.id)
                const isGeneratingThis = generatingIndex === index
                const hasImage = !!getImageForScene(scene.id)

                return (
                  <div
                    key={scene.id}
                    className={`
                      rounded-xl border-2 overflow-hidden transition-all
                      ${video ? 'border-green-200' : hasImage ? 'border-indigo-200' : 'border-gray-200'}
                    `}
                  >
                    {/* 视频/图片预览 */}
                    <div className="relative aspect-video bg-gray-900">
                      {video ? (
                        <>
                          <img
                            src={video.url}
                            alt={`镜头${scene.shot_id}`}
                            className="w-full h-full object-cover"
                          />
                          {/* 播放按钮 */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center cursor-pointer">
                              <Play className="w-8 h-8 text-gray-900 ml-1" />
                            </div>
                          </div>
                          {/* 完成标记 */}
                          <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </>
                      ) : hasImage ? (
                        <>
                          <img
                            src={getImageForScene(scene.id)?.url}
                            alt={`镜头${scene.shot_id}`}
                            className="w-full h-full object-cover opacity-70"
                          />
                          {isGeneratingThis ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                              <div className="text-center text-white">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                                <p className="text-sm">生成中... {progress}%</p>
                              </div>
                            </div>
                          ) : null}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Video className="w-12 h-12" />
                        </div>
                      )}
                    </div>

                    {/* 信息 */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">镜头 {scene.shot_id}</span>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {scene.duration}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                        {scene.camera} · {scene.expression}
                      </p>

                      {video ? (
                        <button className="w-full py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition-all flex items-center justify-center gap-2">
                          <Play className="w-4 h-4" />
                          预览视频
                        </button>
                      ) : hasImage ? (
                        <button
                          onClick={() => handleGenerateVideo(scene, index)}
                          disabled={isGenerating}
                          className="w-full py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <Video className="w-4 h-4" />
                          生成视频
                        </button>
                      ) : (
                        <div className="w-full py-2 bg-gray-100 text-gray-400 rounded-lg text-center text-sm">
                          请先生成图片
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 底部操作 */}
        {videos.length > 0 && (
          <div className="p-6 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleNextStep}
              className="btn-primary flex items-center gap-2"
            >
              下一步：配音合成
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
