import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '../store'
import {
  Layout,
  Plus,
  Edit2,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  Image,
  MessageSquare,
  Camera,
  Clock,
  ArrowRight,
  GripVertical,
  Film,
} from 'lucide-react'

const cameraOptions = ['全景', '远景', '中景', '近景', '特写', '双人镜头', '过肩镜头']
const expressionOptions = ['平静', '微笑', '大笑', '惊讶', '悲伤', '愤怒', '沉思', '深情']

export default function Storyboard() {
  const navigate = useNavigate()
  const { scenes, addScene, updateScene, deleteScene, setScenes, setCurrentStep, updateStepStatus } = useProjectStore()
  const [editingId, setEditingId] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newScene, setNewScene] = useState({
    shot_id: 1,
    duration: '4s',
    camera: '中景',
    prompt: '',
    character: '',
    expression: '平静',
    dialogue: '',
    bgm: '无',
  })

  // 添加分镜
  const handleAddScene = () => {
    if (!newScene.prompt.trim()) {
      alert('请输入画面描述')
      return
    }
    addScene({ ...newScene, shot_id: scenes.length + 1 })
    setNewScene({
      shot_id: scenes.length + 2,
      duration: '4s',
      camera: '中景',
      prompt: '',
      character: '',
      expression: '平静',
      dialogue: '',
      bgm: '无',
    })
    setShowAddModal(false)
  }

  // 批量导入
  const handleBatchImport = () => {
    // 示例：从剧本JSON导入
    const sampleScenes = [
      {
        shot_id: 1,
        duration: '4s',
        camera: '中景',
        prompt: 'A beautiful young woman with long black hair, standing in a moonlit garden, anime style',
        character: '苏晚',
        expression: '惊讶',
        dialogue: '你怎么会在这里？',
        bgm: '舒缓钢琴曲'
      },
      {
        shot_id: 2,
        duration: '3s',
        camera: '近景',
        prompt: 'A handsome man in a black coat, looking at the woman with gentle eyes',
        character: '陆辰',
        expression: '温柔',
        dialogue: '我来赴一场约定。',
        bgm: '舒缓钢琴曲'
      },
      {
        shot_id: 3,
        duration: '5s',
        camera: '双人镜头',
        prompt: 'Two people standing face to face in a beautiful garden, romantic atmosphere',
        character: '两人',
        expression: '深情对视',
        dialogue: '三年了，我一直在等你。',
        bgm: '高潮音乐'
      }
    ]
    setScenes(sampleScenes)
  }

  // 复制分镜
  const handleDuplicate = (scene) => {
    addScene({ ...scene, shot_id: scenes.length + 1 })
  }

  // 下一步
  const handleNextStep = () => {
    if (scenes.length > 0) {
      setCurrentStep(2)
      updateStepStatus('storyboard', 'completed')
      navigate('/images')
    }
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">分镜设计</h1>
          <p className="text-gray-500 mt-1">管理漫剧的分镜脚本，每个分镜将生成一张图片</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleBatchImport}
            className="btn-secondary flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            批量导入
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            添加分镜
          </button>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="panel p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Film className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{scenes.length}</p>
            <p className="text-sm text-gray-500">分镜总数</p>
          </div>
        </div>
        <div className="panel p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
            <Clock className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {scenes.reduce((acc, s) => acc + parseInt(s.duration), 0)}s
            </p>
            <p className="text-sm text-gray-500">预计时长</p>
          </div>
        </div>
        <div className="panel p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-pink-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {scenes.filter(s => s.dialogue).length}
            </p>
            <p className="text-sm text-gray-500">对话镜头</p>
          </div>
        </div>
        <div className="panel p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
            <Image className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">待生成</p>
            <p className="text-sm text-gray-500">图片状态</p>
          </div>
        </div>
      </div>

      {/* 分镜列表 */}
      <div className="panel">
        <div className="panel-header">
          <div className="flex items-center gap-3">
            <Layout className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">分镜列表</h3>
          </div>
          <span className="text-sm text-gray-500">{scenes.length} 个分镜</span>
        </div>

        {scenes.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Layout className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无分镜</h3>
            <p className="text-gray-500 mb-6">点击"添加分镜"或"批量导入"开始创建分镜</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={handleBatchImport}
                className="btn-secondary"
              >
                批量导入示例
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
              >
                添加分镜
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {scenes.map((scene, index) => (
              <div
                key={scene.id}
                className="p-6 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-start gap-6">
                  {/* 拖拽手柄 */}
                  <div className="pt-2 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  {/* 序号 */}
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0">
                    {scene.shot_id}
                  </div>

                  {/* 内容 */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-4">
                      {/* 时长 */}
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={scene.duration}
                          onChange={(e) => updateScene(scene.id, { duration: e.target.value })}
                          className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-center"
                        />
                      </div>

                      {/* 镜头 */}
                      <div className="flex items-center gap-2 text-sm">
                        <Camera className="w-4 h-4 text-gray-400" />
                        <select
                          value={scene.camera}
                          onChange={(e) => updateScene(scene.id, { camera: e.target.value })}
                          className="px-2 py-1 border border-gray-200 rounded-lg"
                        >
                          {cameraOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>

                      {/* 角色 */}
                      <div className="flex items-center gap-2 text-sm">
                        <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded-lg">
                          {scene.character || '未指定'}
                        </span>
                      </div>

                      {/* 表情 */}
                      <div className="flex items-center gap-2 text-sm">
                        <span className="px-2 py-1 bg-pink-100 text-pink-600 rounded-lg">
                          {scene.expression}
                        </span>
                      </div>
                    </div>

                    {/* 画面描述 */}
                    <p className="text-gray-700">{scene.prompt}</p>

                    {/* 对话 */}
                    {scene.dialogue && (
                      <div className="flex items-start gap-2 text-sm">
                        <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                        <span className="text-indigo-600 italic">"{scene.dialogue}"</span>
                      </div>
                    )}

                    {/* BGM */}
                    {scene.bgm && scene.bgm !== '无' && (
                      <div className="text-xs text-gray-500">
                        BGM: {scene.bgm}
                      </div>
                    )}
                  </div>

                  {/* 操作 */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDuplicate(scene)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      title="复制"
                    >
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => deleteScene(scene.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 底部操作 */}
        {scenes.length > 0 && (
          <div className="p-6 border-t border-gray-100 flex justify-between">
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              添加分镜
            </button>
            <button
              onClick={handleNextStep}
              className="btn-primary flex items-center gap-2"
            >
              下一步：生成图片
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 添加分镜弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">添加分镜</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">时长</label>
                  <input
                    type="text"
                    value={newScene.duration}
                    onChange={(e) => setNewScene({ ...newScene, duration: e.target.value })}
                    placeholder="如: 4s"
                    className="input-modern"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">镜头</label>
                  <select
                    value={newScene.camera}
                    onChange={(e) => setNewScene({ ...newScene, camera: e.target.value })}
                    className="input-modern"
                  >
                    {cameraOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
                  <input
                    type="text"
                    value={newScene.character}
                    onChange={(e) => setNewScene({ ...newScene, character: e.target.value })}
                    placeholder="角色名"
                    className="input-modern"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">表情</label>
                <select
                  value={newScene.expression}
                  onChange={(e) => setNewScene({ ...newScene, expression: e.target.value })}
                  className="input-modern"
                >
                  {expressionOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  画面描述 (Prompt) <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newScene.prompt}
                  onChange={(e) => setNewScene({ ...newScene, prompt: e.target.value })}
                  placeholder="用英文描述画面内容，这将用于AI图片生成..."
                  className="input-modern h-24 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">对话</label>
                <input
                  type="text"
                  value={newScene.dialogue}
                  onChange={(e) => setNewScene({ ...newScene, dialogue: e.target.value })}
                  placeholder="角色对话（可选）"
                  className="input-modern"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">BGM</label>
                <input
                  type="text"
                  value={newScene.bgm}
                  onChange={(e) => setNewScene({ ...newScene, bgm: e.target.value })}
                  placeholder="背景音乐风格（可选）"
                  className="input-modern"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleAddScene}
                className="btn-primary"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
