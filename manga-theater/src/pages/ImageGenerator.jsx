import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore, useGenerationStore } from '../store'
import {
  Image,
  Play,
  Pause,
  RefreshCw,
  Download,
  Trash2,
  Check,
  Loader2,
  Wand2,
  Maximize,
  Palette,
  Sparkles,
  Eye,
  Copy,
} from 'lucide-react'

const qualityOptions = [
  { id: 'standard', name: '标准', desc: '快速生成，适合预览', icon: '⚡' },
  { id: 'high', name: '高清', desc: '质量优先，画质更好', icon: '✨' },
  { id: '4k', name: '4K', desc: '超高清，分辨率最高', icon: '🌟' },
]

const stylePresets = [
  { id: 'anime', name: '日漫风', prompt: 'anime style, high quality, detailed' },
  { id: 'comic', name: '美漫风', prompt: 'comic style, bold lines, vibrant colors' },
  { id: 'watercolor', name: '水墨风', prompt: 'Chinese ink painting style, traditional' },
  { id: 'realistic', name: '写实风', prompt: 'photorealistic, cinematic lighting' },
]

export default function ImageGenerator() {
  const navigate = useNavigate()
  const { scenes, images, addImage, setCurrentStep, updateStepStatus } = useProjectStore()
  const { isGenerating, progress, startGeneration, updateProgress, stopGeneration } = useGenerationStore()
  const [selectedScene, setSelectedScene] = useState(null)
  const [quality, setQuality] = useState('high')
  const [selectedPreset, setSelectedPreset] = useState('anime')
  const [generatingId, setGeneratingId] = useState(null)

  // 生成单张图片
  const handleGenerateImage = async (scene) => {
    setGeneratingId(scene.id)
    startGeneration(`生成图片 - 镜头${scene.shot_id}`)

    // 模拟生成过程
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 100))
      updateProgress(i)
    }

    // 生成示例图片URL
    const imageUrl = `https://picsum.photos/seed/${scene.id}/800/600`

    addImage({
      sceneId: scene.id,
      url: imageUrl,
      prompt: scene.prompt,
      quality,
      style: selectedPreset,
      createdAt: new Date().toISOString(),
    })

    setGeneratingId(null)
    stopGeneration()
  }

  // 批量生成
  const handleBatchGenerate = async () => {
    if (scenes.length === 0) {
      alert('请先添加分镜')
      return
    }

    startGeneration('批量生成图片')
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i]
      updateProgress(Math.round((i / scenes.length) * 100), `正在生成镜头${scene.shot_id}...`)
      await new Promise(resolve => setTimeout(resolve, 1000))

      const imageUrl = `https://picsum.photos/seed/${scene.id}/800/600`
      addImage({
        sceneId: scene.id,
        url: imageUrl,
        prompt: scene.prompt,
        quality,
        style: selectedPreset,
        createdAt: new Date().toISOString(),
      })
    }
    stopGeneration()
  }

  // 下一步
  const handleNextStep = () => {
    if (images.length > 0) {
      setCurrentStep(3)
      updateStepStatus('images', 'completed')
      navigate('/video')
    }
  }

  // 获取分镜对应的图片
  const getImageForScene = (sceneId) => {
    return images.find(img => img.sceneId === sceneId)
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">图片生成</h1>
          <p className="text-gray-500 mt-1">为分镜生成高质量漫画图片</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleBatchGenerate}
            disabled={scenes.length === 0 || isGenerating}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <Wand2 className="w-4 h-4" />
            批量生成 ({scenes.length}张)
          </button>
        </div>
      </div>

      {/* 生成设置 */}
      <div className="grid grid-cols-3 gap-6">
        {/* 质量选择 */}
        <div className="panel p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5 text-indigo-500" />
            生成质量
          </h3>
          <div className="space-y-3">
            {qualityOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setQuality(option.id)}
                className={`
                  w-full p-4 rounded-xl border-2 transition-all text-left
                  ${quality === option.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{option.name}</span>
                    <p className="text-sm text-gray-500">{option.desc}</p>
                  </div>
                  <span className="text-2xl">{option.icon}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 风格预设 */}
        <div className="panel p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            风格预设
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {stylePresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setSelectedPreset(preset.id)}
                className={`
                  p-4 rounded-xl border-2 transition-all text-center
                  ${selectedPreset === preset.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className={`
                  w-10 h-10 rounded-lg mx-auto mb-2
                  ${preset.id === 'anime' ? 'bg-gradient-to-br from-pink-400 to-purple-400' : ''}
                  ${preset.id === 'comic' ? 'bg-gradient-to-br from-blue-400 to-cyan-400' : ''}
                  ${preset.id === 'watercolor' ? 'bg-gradient-to-br from-amber-400 to-orange-400' : ''}
                  ${preset.id === 'realistic' ? 'bg-gradient-to-br from-gray-400 to-gray-600' : ''}
                `} />
                <span className="text-sm font-medium">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 统计信息 */}
        <div className="panel p-6">
          <h3 className="font-semibold text-gray-900 mb-4">生成统计</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">分镜总数</span>
              <span className="font-semibold">{scenes.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">已生成</span>
              <span className="font-semibold text-green-600">{images.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">待生成</span>
              <span className="font-semibold text-orange-600">{scenes.length - images.length}</span>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">完成进度</span>
                <span className="text-sm font-medium">
                  {scenes.length > 0 ? Math.round((images.length / scenes.length) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                  style={{ width: `${scenes.length > 0 ? (images.length / scenes.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 分镜图片网格 */}
      <div className="panel">
        <div className="panel-header">
          <div className="flex items-center gap-3">
            <Image className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">分镜图片</h3>
          </div>
          <span className="text-sm text-gray-500">
            {images.length} / {scenes.length} 已生成
          </span>
        </div>

        <div className="p-6">
          {scenes.length === 0 ? (
            <div className="text-center py-12">
              <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">请先在"分镜设计"中添加分镜</p>
            </div>
          ) : (
            <div className="preview-grid">
              {scenes.map((scene) => {
                const image = getImageForScene(scene.id)
                const isGeneratingThis = generatingId === scene.id

                return (
                  <div
                    key={scene.id}
                    className={`
                      rounded-xl border-2 overflow-hidden transition-all
                      ${image ? 'border-green-200' : 'border-gray-200'}
                    `}
                  >
                    {/* 图片预览 */}
                    <div className="relative aspect-[4/3] bg-gray-100">
                      {image ? (
                        <>
                          <img
                            src={image.url}
                            alt={`镜头${scene.shot_id}`}
                            className="w-full h-full object-cover"
                          />
                          {/* 覆盖层 */}
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                            <div className="flex gap-2">
                              <button className="p-2 bg-white rounded-lg hover:bg-gray-100">
                                <Eye className="w-5 h-5" />
                              </button>
                              <button className="p-2 bg-white rounded-lg hover:bg-gray-100">
                                <Download className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                          {/* 完成标记 */}
                          <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </>
                      ) : isGeneratingThis ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Image className="w-12 h-12" />
                        </div>
                      )}
                    </div>

                    {/* 信息 */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">镜头 {scene.shot_id}</span>
                        <span className="text-sm text-gray-500">{scene.duration}</span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {scene.character ? `${scene.character} · ` : ''}
                        {scene.expression}
                      </p>

                      {/* 操作按钮 */}
                      {image ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleGenerateImage(scene)}
                            className="flex-1 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center gap-1"
                          >
                            <RefreshCw className="w-4 h-4" />
                            重新生成
                          </button>
                          <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleGenerateImage(scene)}
                          disabled={isGenerating}
                          className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isGeneratingThis ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              生成中...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              生成图片
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 底部操作 */}
        {images.length > 0 && (
          <div className="p-6 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleNextStep}
              className="btn-primary flex items-center gap-2"
            >
              下一步：生成视频
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
