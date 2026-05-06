import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore, useGenerationStore } from '../store'
import {
  FileText,
  Sparkles,
  Send,
  Save,
  RotateCcw,
  BookOpen,
  Type,
  Heart,
  Swords,
  Ghost,
  Zap,
} from 'lucide-react'

const genreOptions = [
  { id: 'romance', name: '甜宠言情', icon: Heart, color: 'from-pink-500 to-rose-500' },
  { id: 'action', name: '热血战斗', icon: Swords, color: 'from-red-500 to-orange-500' },
  { id: 'sci-fi', name: '科幻未来', icon: Zap, color: 'from-cyan-500 to-blue-500' },
  { id: 'fantasy', name: '奇幻冒险', icon: BookOpen, color: 'from-purple-500 to-violet-500' },
  { id: 'horror', name: '悬疑惊悚', icon: Ghost, color: 'from-gray-600 to-gray-800' },
]

const styleOptions = [
  { id: 'anime', name: '日漫画风', desc: '大眼睛、细腻情感' },
  { id: 'comic', name: '美漫画风', desc: '肌肉线条、强烈光影' },
  { id: 'chinese', name: '国漫画风', desc: '水墨质感、传统美学' },
  { id: 'realistic', name: '写实风格', desc: '接近真人、电影质感' },
]

export default function ScriptEditor() {
  const navigate = useNavigate()
  const { script, setScript, setCurrentStep, updateStepStatus } = useProjectStore()
  const { isGenerating, startGeneration, updateProgress, stopGeneration } = useGenerationStore()
  const [isGeneratingScript, setIsGeneratingScript] = useState(false)

  const handleGenerateScript = async () => {
    if (!script.outline.trim()) {
      alert('请先输入故事大纲')
      return
    }

    setIsGeneratingScript(true)
    startGeneration('AI剧本生成')

    // 模拟AI生成过程
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 300))
      updateProgress(i, `正在生成剧本... ${i}%`)
    }

    // 生成示例剧本
    const generatedScript = {
      episode: 1,
      title: script.outline.slice(0, 20),
      scenes: [
        {
          shot_id: 1,
          duration: '4s',
          camera: '中景',
          prompt: 'A beautiful young woman with long black hair, wearing a white dress, standing in a moonlit garden, anime style, soft lighting, emotional atmosphere',
          character: '女主-苏晚',
          expression: '惊讶',
          dialogue: '你...怎么会在这里？',
          bgm: '舒缓钢琴曲'
        },
        {
          shot_id: 2,
          duration: '3s',
          camera: '近景',
          prompt: 'A handsome man in a black coat, looking at the woman with gentle eyes, anime style, romantic atmosphere, moonlight',
          character: '男主-陆辰',
          expression: '温柔',
          dialogue: '我来赴一场约定。',
          bgm: '舒缓钢琴曲'
        },
        {
          shot_id: 3,
          duration: '5s',
          camera: '双人镜头',
          prompt: 'Two people standing face to face in a beautiful garden, flowers blooming around them, anime style, romantic scene, golden hour lighting',
          character: '两人',
          expression: '深情对视',
          dialogue: '三年了，我一直在等你。',
          bgm: '高潮音乐'
        }
      ]
    }

    setScript({
      ...script,
      fullText: JSON.stringify(generatedScript, null, 2)
    })

    setIsGeneratingScript(false)
    stopGeneration()
    updateStepStatus('script', 'completed')
  }

  const handleNextStep = () => {
    if (script.outline && script.fullText) {
      setCurrentStep(1)
      updateStepStatus('script', 'completed')
      navigate('/storyboard')
    }
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">剧本创作</h1>
          <p className="text-gray-500 mt-1">输入故事大纲，AI将为你生成结构化的分镜脚本</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setScript({ ...script, outline: '', fullText: '' })}
            className="btn-secondary flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            重置
          </button>
          <button
            onClick={handleNextStep}
            disabled={!script.fullText}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一步：分镜设计
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* 左侧：输入区域 */}
        <div className="col-span-2 space-y-6">
          {/* 故事大纲 */}
          <div className="panel">
            <div className="panel-header">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">故事大纲</h3>
                  <p className="text-sm text-gray-500">描述你的故事核心情节</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <textarea
                value={script.outline}
                onChange={(e) => setScript({ ...script, outline: e.target.value })}
                placeholder="例如：末世少女苏晚意外获得空间异能，在丧尸横行的末世中艰难求生，遇到了神秘男子陆辰，两人从陌生到相知相爱，共同面对生存考验..."
                className="input-modern h-40 resize-none"
              />
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <span>{script.outline.length} / 2000 字符</span>
                <button
                  onClick={handleGenerateScript}
                  disabled={!script.outline.trim() || isGeneratingScript}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {isGeneratingScript ? '生成中...' : 'AI生成剧本'}
                </button>
              </div>
            </div>
          </div>

          {/* 类型选择 */}
          <div className="panel">
            <div className="panel-header">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Type className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">剧本类型</h3>
                  <p className="text-sm text-gray-500">选择适合的故事类型</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-5 gap-4">
                {genreOptions.map((genre) => {
                  const Icon = genre.icon
                  return (
                    <button
                      key={genre.id}
                      onClick={() => setScript({ ...script, genre: genre.id })}
                      className={`
                        p-4 rounded-xl border-2 transition-all text-center
                        ${script.genre === genre.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <div className={`
                        w-10 h-10 rounded-lg mx-auto mb-2 bg-gradient-to-br ${genre.color}
                        flex items-center justify-center
                      `}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{genre.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* 风格选择 */}
          <div className="panel">
            <div className="panel-header">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-pink-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">画风选择</h3>
                  <p className="text-sm text-gray-500">选择你喜欢的视觉风格</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-4 gap-4">
                {styleOptions.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setScript({ ...script, style: style.id })}
                    className={`
                      p-4 rounded-xl border-2 transition-all text-center
                      ${script.style === style.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className={`
                      w-12 h-12 rounded-lg mx-auto mb-2
                      ${style.id === 'anime' ? 'bg-gradient-to-br from-pink-400 to-purple-400' : ''}
                      ${style.id === 'comic' ? 'bg-gradient-to-br from-blue-400 to-cyan-400' : ''}
                      ${style.id === 'chinese' ? 'bg-gradient-to-br from-amber-400 to-orange-400' : ''}
                      ${style.id === 'realistic' ? 'bg-gradient-to-br from-gray-400 to-gray-600' : ''}
                    `} />
                    <span className="text-sm font-medium text-gray-700 block">{style.name}</span>
                    <span className="text-xs text-gray-500">{style.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：预览区域 */}
        <div className="space-y-6">
          {/* 生成的剧本预览 */}
          <div className="panel h-[600px] flex flex-col">
            <div className="panel-header">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">生成预览</h3>
                  <p className="text-sm text-gray-500">AI生成的分镜脚本</p>
                </div>
              </div>
            </div>
            <div className="flex-1 p-6 overflow-auto">
              {script.fullText ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">剧本结构</h4>
                    <pre className="text-xs text-gray-600 overflow-auto whitespace-pre-wrap">
                      {script.fullText}
                    </pre>
                  </div>
                  <button className="w-full btn-secondary flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" />
                    保存剧本
                  </button>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <FileText className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-center">
                    输入故事大纲<br />
                    点击"AI生成剧本"<br />
                    预览将在这里显示
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 快捷提示 */}
          <div className="panel p-6">
            <h4 className="font-semibold text-gray-900 mb-4">创作提示</h4>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                <p>故事大纲越详细，AI生成的质量越高</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                <p>包含主要角色介绍和核心冲突</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                <p>明确故事的情感基调（甜/虐/热血）</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
