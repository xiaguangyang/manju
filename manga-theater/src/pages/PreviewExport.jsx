import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore, useGenerationStore } from '../store'
import {
  Download,
  Play,
  Pause,
  Settings,
  Film,
  Volume2,
  Subtitles,
  CheckCircle2,
  Loader2,
  Share2,
  Copy,
  ChevronLeft,
  Monitor,
  Smartphone,
  Globe,
  FileVideo,
  Image,
  Music,
} from 'lucide-react'

const exportFormats = [
  { id: 'mp4', name: 'MP4', desc: '通用视频格式', icon: FileVideo },
  { id: 'webm', name: 'WebM', desc: '网页专用', icon: Globe },
  { id: 'gif', name: 'GIF', desc: '动画图片', icon: Image },
]

const qualityOptions = [
  { id: 'low', name: '低 (720p)', size: '~50MB' },
  { id: 'medium', name: '中 (1080p)', size: '~150MB' },
  { id: 'high', name: '高 (1080p 60fps)', size: '~300MB' },
  { id: '4k', name: '4K', size: '~1GB' },
]

export default function PreviewExport() {
  const navigate = useNavigate()
  const { scenes, images, videos, audio, exportSettings, setExportSettings, setCurrentStep, updateStepStatus, resetProject } = useProjectStore()
  const { isGenerating, startGeneration, updateProgress, stopGeneration } = useGenerationStore()
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [currentPreview, setCurrentPreview] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  // 获取当前预览的分镜
  const getCurrentScene = () => scenes[currentPreview]
  const getCurrentImage = () => {
    const scene = getCurrentScene()
    return scene ? images.find(img => img.sceneId === scene.id) : null
  }
  const getCurrentAudio = () => {
    const scene = getCurrentScene()
    return scene ? audio.find(a => a.sceneId === scene.id) : null
  }

  // 导出视频
  const handleExport = async () => {
    setIsExporting(true)
    startGeneration('导出视频')

    for (let i = 0; i <= 100; i += 2) {
      await new Promise(resolve => setTimeout(resolve, 100))
      setExportProgress(i)
      updateProgress(i, `导出中... ${i}%`)
    }

    setIsExporting(false)
    stopGeneration()
    updateStepStatus('export', 'completed')
  }

  // 完成并重置
  const handleComplete = () => {
    resetProject()
    navigate('/')
  }

  // 分享
  const handleShare = () => {
    alert('分享功能开发中...')
  }

  const currentScene = getCurrentScene()
  const currentImage = getCurrentImage()
  const currentAudio = getCurrentAudio()

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">预览与导出</h1>
          <p className="text-gray-500 mt-1">预览漫剧效果，导出最终视频</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="btn-secondary flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            分享
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || scenes.length === 0}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                导出中... {exportProgress}%
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                导出视频
              </>
            )}
          </button>
        </div>
      </div>

      {/* 进度总览 */}
      <div className="panel p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">创作进度</h3>
          <span className="text-sm text-gray-500">已完成所有步骤</span>
        </div>
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: '分镜', count: scenes.length, icon: Film, color: 'indigo' },
            { label: '图片', count: images.length, icon: Image, color: 'purple' },
            { label: '视频', count: videos.length, icon: Play, color: 'orange' },
            { label: '配音', count: audio.length, icon: Volume2, color: 'pink' },
            { label: '预计时长', count: `${Math.round(scenes.reduce((acc, s) => acc + parseInt(s.duration), 0) / 60)}秒`, icon: Settings, color: 'green' },
          ].map((item, index) => {
            const Icon = item.icon
            return (
              <div key={index} className="text-center">
                <div className={`
                  w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center
                  ${item.color === 'indigo' ? 'bg-indigo-100 text-indigo-600' : ''}
                  ${item.color === 'purple' ? 'bg-purple-100 text-purple-600' : ''}
                  ${item.color === 'orange' ? 'bg-orange-100 text-orange-600' : ''}
                  ${item.color === 'pink' ? 'bg-pink-100 text-pink-600' : ''}
                  ${item.color === 'green' ? 'bg-green-100 text-green-600' : ''}
                `}>
                  <Icon className="w-6 h-6" />
                </div>
                <p className="text-xl font-bold text-gray-900">{item.count}</p>
                <p className="text-sm text-gray-500">{item.label}</p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* 视频预览 */}
        <div className="col-span-2 space-y-6">
          {/* 播放器 */}
          <div className="panel overflow-hidden">
            <div className="relative aspect-video bg-gray-900">
              {currentImage ? (
                <img
                  src={currentImage.url}
                  alt={`镜头${currentScene?.shot_id}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <Film className="w-16 h-16" />
                </div>
              )}

              {/* 播放控制 */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                {/* 进度条 */}
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-white text-sm">
                    {currentScene?.shot_id || 0} / {scenes.length}
                  </span>
                  <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500"
                      style={{ width: `${scenes.length > 0 ? ((currentPreview + 1) / scenes.length) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-white text-sm">{currentScene?.duration || '0s'}</span>
                </div>

                {/* 控制按钮 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPreview(Math.max(0, currentPreview - 1))}
                      disabled={currentPreview === 0}
                      className="p-2 text-white/80 hover:text-white disabled:opacity-50"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6 ml-1" />
                      )}
                    </button>
                    <button
                      onClick={() => setCurrentPreview(Math.min(scenes.length - 1, currentPreview + 1))}
                      disabled={currentPreview === scenes.length - 1}
                      className="p-2 text-white/80 hover:text-white disabled:opacity-50"
                    >
                      <ChevronLeft className="w-6 h-6 transform rotate-180" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <button className="p-2 text-white/80 hover:text-white">
                      <Volume2 className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-white/80 hover:text-white">
                      <Subtitles className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-white/80 hover:text-white">
                      <Settings className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 场景信息 */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-sm font-medium">
                  镜头 {currentScene?.shot_id || '-'}
                </span>
                <span className="text-sm text-gray-500">
                  {currentScene?.camera || ''} · {currentScene?.expression || ''}
                </span>
              </div>
              {currentScene?.dialogue && (
                <p className="mt-2 text-gray-700 italic">"{currentScene.dialogue}"</p>
              )}
            </div>
          </div>

          {/* 分镜缩略图 */}
          <div className="panel p-6">
            <h3 className="font-semibold text-gray-900 mb-4">分镜缩略图</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {scenes.map((scene, index) => {
                const image = images.find(img => img.sceneId === scene.id)
                const isActive = index === currentPreview

                return (
                  <button
                    key={scene.id}
                    onClick={() => setCurrentPreview(index)}
                    className={`
                      flex-shrink-0 w-32 rounded-xl overflow-hidden border-2 transition-all
                      ${isActive ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200 hover:border-gray-300'}
                    `}
                  >
                    <div className="aspect-[4/3] bg-gray-100">
                      {image ? (
                        <img src={image.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Film className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="p-2 text-center">
                      <span className="text-sm font-medium">{scene.shot_id}</span>
                      {audio.find(a => a.sceneId === scene.id) && (
                        <span className="ml-1 text-green-500">🔊</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* 右侧设置 */}
        <div className="space-y-6">
          {/* 导出设置 */}
          <div className="panel p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-400" />
              导出设置
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">导出格式</label>
                <div className="grid grid-cols-3 gap-2">
                  {exportFormats.map((format) => {
                    const Icon = format.icon
                    return (
                      <button
                        key={format.id}
                        onClick={() => setExportSettings({ format: format.id })}
                        className={`
                          p-3 rounded-xl border-2 text-center transition-all
                          ${exportSettings.format === format.id
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        <Icon className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                        <span className="text-sm font-medium">{format.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">视频质量</label>
                <select
                  value={exportSettings.quality}
                  onChange={(e) => setExportSettings({ quality: e.target.value })}
                  className="input-modern"
                >
                  {qualityOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name} ({option.size})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exportSettings.includeAudio}
                    onChange={(e) => setExportSettings({ includeAudio: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-500"
                  />
                  <span className="text-sm text-gray-700">包含配音</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exportSettings.includeSubtitles}
                    onChange={(e) => setExportSettings({ includeSubtitles: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-500"
                  />
                  <span className="text-sm text-gray-700">包含字幕</span>
                </label>
              </div>
            </div>
          </div>

          {/* 平台适配 */}
          <div className="panel p-6">
            <h3 className="font-semibold text-gray-900 mb-4">平台适配</h3>
            <div className="space-y-2">
              {[
                { name: '抖音/快手', ratio: '9:16 竖屏', icon: Smartphone },
                { name: 'B站/YouTube', ratio: '16:9 横屏', icon: Monitor },
                { name: '微信公众号', ratio: '16:9 横屏', icon: Globe },
              ].map((platform, index) => {
                const Icon = platform.icon
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-indigo-300 cursor-pointer transition-all"
                  >
                    <Icon className="w-5 h-5 text-gray-500" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{platform.name}</div>
                      <div className="text-xs text-gray-500">{platform.ratio}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 完成状态 */}
          <div className="panel p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">创作完成!</h3>
              <p className="text-sm text-gray-600 mb-4">
                你的AI漫剧已经准备就绪，可以导出并在各平台发布了
              </p>
              <button
                onClick={handleComplete}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all"
              >
                开始新项目
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 导出进度弹窗 */}
      {isExporting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md text-center">
            <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mx-auto mb-6" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">正在导出视频</h3>
            <p className="text-gray-500 mb-6">请稍候，这可能需要几分钟时间...</p>
            <div className="mb-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">{exportProgress}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
