import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore, useGenerationStore } from '../store'
import {
  Mic,
  Play,
  Pause,
  Volume2,
  User,
  Wand2,
  Settings,
  Check,
  Loader2,
  Download,
  RefreshCw,
  Trash2,
  MessageSquare,
  Music,
} from 'lucide-react'

const voiceCharacters = [
  { id: 'female_young', name: '年轻女声', description: '甜美、清新', icon: '👩' },
  { id: 'female_mature', name: '成熟女声', description: '知性、温柔', icon: '👩‍🦰' },
  { id: 'male_young', name: '年轻男声', description: '磁性、活力', icon: '👨' },
  { id: 'male_mature', name: '成熟男声', description: '沉稳、厚重', icon: '🧔' },
  { id: 'narrator', name: '旁白', description: '中性、叙述感', icon: '🎙️' },
]

const bgmStyles = [
  { id: 'none', name: '无BGM', icon: '🔇' },
  { id: 'romance', name: '浪漫舒缓', icon: '💕' },
  { id: 'tension', name: '紧张悬疑', icon: '😰' },
  { id: 'epic', name: '史诗大气', icon: '🏰' },
  { id: 'comedy', name: '轻松欢快', icon: '😄' },
  { id: 'sad', name: '悲伤抒情', icon: '😢' },
]

export default function AudioMixer() {
  const navigate = useNavigate()
  const { scenes, audio, addAudio, setCurrentStep, updateStepStatus } = useProjectStore()
  const { isGenerating, startGeneration, updateProgress, stopGeneration } = useGenerationStore()
  const [selectedCharacter, setSelectedCharacter] = useState({})
  const [selectedBgm, setSelectedBgm] = useState('romance')
  const [generatingIndex, setGeneratingIndex] = useState(null)
  const [playingId, setPlayingId] = useState(null)

  // 为角色分配音色
  const assignVoice = (character, voiceId) => {
    setSelectedCharacter(prev => ({
      ...prev,
      [character]: voiceId
    }))
  }

  // 生成单个配音
  const handleGenerateAudio = async (scene, index) => {
    if (!scene.dialogue) {
      alert('此分镜没有对话')
      return
    }

    setGeneratingIndex(index)
    startGeneration(`生成配音 - ${scene.character || '旁白'}`)

    // 模拟生成过程
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200))
      updateProgress(i)
    }

    // 添加生成的音频
    addAudio({
      sceneId: scene.id,
      character: scene.character,
      text: scene.dialogue,
      voiceId: selectedCharacter[scene.character] || 'female_young',
      duration: parseInt(scene.duration) * 1000,
      url: null, // 实际会返回音频URL
    })

    setGeneratingIndex(null)
    stopGeneration()
  }

  // 批量生成配音
  const handleBatchGenerate = async () => {
    const scenesWithDialogue = scenes.filter(s => s.dialogue)
    if (scenesWithDialogue.length === 0) {
      alert('没有带对话的分镜')
      return
    }

    startGeneration('批量生成配音')
    for (let i = 0; i < scenesWithDialogue.length; i++) {
      const scene = scenesWithDialogue[i]
      setGeneratingIndex(i)
      updateProgress(Math.round((i / scenesWithDialogue.length) * 100), `正在生成: ${scene.dialogue}`)

      await new Promise(resolve => setTimeout(resolve, 500))

      addAudio({
        sceneId: scene.id,
        character: scene.character,
        text: scene.dialogue,
        voiceId: selectedCharacter[scene.character] || 'female_young',
        duration: parseInt(scene.duration) * 1000,
        url: null,
      })
    }

    setGeneratingIndex(null)
    stopGeneration()
  }

  // 下一步
  const handleNextStep = () => {
    if (audio.length > 0) {
      setCurrentStep(5)
      updateStepStatus('audio', 'completed')
      navigate('/preview')
    }
  }

  // 获取分镜对应的音频
  const getAudioForScene = (sceneId) => {
    return audio.find(a => a.sceneId === sceneId)
  }

  // 获取有对话的分镜
  const scenesWithDialogue = scenes.filter(s => s.dialogue)
  const uniqueCharacters = [...new Set(scenes.filter(s => s.character).map(s => s.character))]

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">配音合成</h1>
          <p className="text-gray-500 mt-1">为角色对话生成配音，添加背景音乐</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleBatchGenerate}
            disabled={scenesWithDialogue.length === 0 || isGenerating}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <Wand2 className="w-4 h-4" />
            批量生成配音
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* 角色音色分配 */}
        <div className="panel p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-purple-500" />
            角色音色分配
          </h3>

          <div className="space-y-3">
            {uniqueCharacters.length === 0 ? (
              <p className="text-gray-500 text-sm">暂无角色信息，请先在分镜中指定角色</p>
            ) : (
              uniqueCharacters.map((character) => (
                <div key={character} className="p-3 border border-gray-200 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{character}</span>
                    <select
                      value={selectedCharacter[character] || 'female_young'}
                      onChange={(e) => assignVoice(character, e.target.value)}
                      className="text-sm border border-gray-200 rounded-lg px-2 py-1"
                    >
                      {voiceCharacters.map((voice) => (
                        <option key={voice.id} value={voice.id}>
                          {voice.icon} {voice.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-3">可用音色</h4>
            <div className="grid grid-cols-1 gap-2">
              {voiceCharacters.map((voice) => (
                <div
                  key={voice.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                >
                  <span className="text-xl">{voice.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{voice.name}</div>
                    <div className="text-xs text-gray-500">{voice.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BGM设置 */}
        <div className="panel p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Music className="w-5 h-5 text-pink-500" />
            背景音乐
          </h3>

          <div className="grid grid-cols-3 gap-2">
            {bgmStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedBgm(style.id)}
                className={`
                  p-3 rounded-xl border-2 text-center transition-all
                  ${selectedBgm === style.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <span className="text-2xl">{style.icon}</span>
                <div className="text-xs mt-1 font-medium">{style.name}</div>
              </button>
            ))}
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Volume2 className="w-4 h-4" />
              <span>BGM音量</span>
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="30"
                className="flex-1"
              />
              <span className="w-8">30%</span>
            </div>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="panel p-6">
          <h3 className="font-semibold text-gray-900 mb-4">生成统计</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">对话分镜</span>
              <span className="font-semibold">{scenesWithDialogue.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">已生成配音</span>
              <span className="font-semibold text-green-600">{audio.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">角色数量</span>
              <span className="font-semibold">{uniqueCharacters.length}</span>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">完成进度</span>
                <span className="text-sm font-medium">
                  {scenesWithDialogue.length > 0 ? Math.round((audio.length / scenesWithDialogue.length) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                  style={{ width: `${scenesWithDialogue.length > 0 ? (audio.length / scenesWithDialogue.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 配音列表 */}
      <div className="panel">
        <div className="panel-header">
          <div className="flex items-center gap-3">
            <Mic className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">配音列表</h3>
          </div>
          <span className="text-sm text-gray-500">
            {audio.length} / {scenesWithDialogue.length} 已生成
          </span>
        </div>

        <div className="p-6">
          {scenesWithDialogue.length === 0 ? (
            <div className="text-center py-12">
              <Mic className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">没有带对话的分镜</p>
              <p className="text-sm text-gray-400 mt-1">请在分镜中添加对话内容</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scenesWithDialogue.map((scene, index) => {
                const audioTrack = getAudioForScene(scene.id)
                const isGeneratingThis = generatingIndex === index
                const isPlaying = playingId === scene.id

                return (
                  <div
                    key={scene.id}
                    className={`
                      p-4 rounded-xl border-2 transition-all
                      ${audioTrack ? 'border-green-200 bg-green-50/50' : 'border-gray-200'}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      {/* 镜头号 */}
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                        {scene.shot_id}
                      </div>

                      {/* 角色和对话 */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-600 rounded text-sm font-medium">
                            {scene.character || '旁白'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {voiceCharacters.find(v => v.id === (selectedCharacter[scene.character] || 'female_young'))?.icon}
                            {' '}
                            {voiceCharacters.find(v => v.id === (selectedCharacter[scene.character] || 'female_young'))?.name || '默认'}
                          </span>
                        </div>
                        <p className="text-gray-700">"{scene.dialogue}"</p>
                      </div>

                      {/* 时长 */}
                      <div className="text-sm text-gray-500">
                        {scene.duration}
                      </div>

                      {/* 播放/生成按钮 */}
                      <div className="flex items-center gap-2">
                        {audioTrack ? (
                          <>
                            <button
                              onClick={() => setPlayingId(isPlaying ? null : scene.id)}
                              className={`
                                p-2 rounded-lg transition-all
                                ${isPlaying
                                  ? 'bg-indigo-500 text-white'
                                  : 'bg-gray-100 hover:bg-gray-200'
                                }
                              `}
                            >
                              {isPlaying ? (
                                <Pause className="w-5 h-5" />
                              ) : (
                                <Play className="w-5 h-5" />
                              )}
                            </button>
                            <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200">
                              <RefreshCw className="w-5 h-5" />
                            </button>
                            <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200">
                              <Download className="w-5 h-5" />
                            </button>
                          </>
                        ) : isGeneratingThis ? (
                          <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-lg text-indigo-600">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            生成中...
                          </div>
                        ) : (
                          <button
                            onClick={() => handleGenerateAudio(scene, index)}
                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2"
                          >
                            <Mic className="w-4 h-4" />
                            生成配音
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 音频波形占位 */}
                    {audioTrack && (
                      <div className="mt-3 h-8 bg-gray-200 rounded flex items-center px-2">
                        <div className="flex items-end gap-0.5 h-full">
                          {Array.from({ length: 40 }).map((_, i) => (
                            <div
                              key={i}
                              className={`
                                w-1 bg-indigo-400 rounded-full
                                ${isPlaying && i < 20 ? 'animate-pulse' : ''}
                              `}
                              style={{ height: `${Math.random() * 100}%` }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 底部操作 */}
        {audio.length > 0 && (
          <div className="p-6 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleNextStep}
              className="btn-primary flex items-center gap-2"
            >
              下一步：预览导出
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
