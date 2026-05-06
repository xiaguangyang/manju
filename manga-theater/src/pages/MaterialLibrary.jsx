import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Plus, Upload, Trash2, Edit3, X, Check, Image, User,
  Palette, Volume2, Sparkles, ArrowLeft, Save
} from 'lucide-react';

const API_BASE = 'http://localhost:3001/api';

export default function MaterialLibrary() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    personality: '',
    traits: [],
    colorPalette: [],
    preferredVoice: '',
    referenceImages: []
  });
  const [newTrait, setNewTrait] = useState('');
  const [newColor, setNewColor] = useState('');

  // 加载角色列表
  useEffect(() => {
    loadCharacters();
  }, [projectId]);

  const loadCharacters = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/characters?projectId=${projectId}`);
      const data = await res.json();
      if (data.success) {
        setCharacters(data.data);
      }
    } catch (err) {
      console.error('加载角色失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 打开创建/编辑模态框
  const openModal = (character = null) => {
    if (character) {
      setEditingCharacter(character);
      setFormData({
        name: character.name,
        description: character.description || '',
        personality: character.personality || '',
        traits: character.traits || [],
        colorPalette: character.colorPalette || [],
        preferredVoice: character.preferredVoice || '',
        referenceImages: character.referenceImages || []
      });
    } else {
      setEditingCharacter(null);
      setFormData({
        name: '',
        description: '',
        personality: '',
        traits: [],
        colorPalette: [],
        preferredVoice: '',
        referenceImages: []
      });
    }
    setShowModal(true);
  };

  // 保存角色
  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('请输入角色名称');
      return;
    }

    try {
      const url = editingCharacter
        ? `${API_BASE}/characters/${editingCharacter.id}`
        : `${API_BASE}/characters`;
      const method = editingCharacter ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, projectId })
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        loadCharacters();
      }
    } catch (err) {
      console.error('保存角色失败:', err);
    }
  };

  // 删除角色
  const handleDelete = async (id) => {
    if (!confirm('确定要删除这个角色吗？')) return;
    try {
      const res = await fetch(`${API_BASE}/characters/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadCharacters();
      }
    } catch (err) {
      console.error('删除角色失败:', err);
    }
  };

  // 添加特征词
  const addTrait = () => {
    if (newTrait.trim() && !formData.traits.includes(newTrait.trim())) {
      setFormData({ ...formData, traits: [...formData.traits, newTrait.trim()] });
      setNewTrait('');
    }
  };

  // 添加配色
  const addColor = () => {
    if (newColor.trim() && !formData.colorPalette.includes(newColor.trim())) {
      setFormData({ ...formData, colorPalette: [...formData.colorPalette, newColor.trim()] });
      setNewColor('');
    }
  };

  // AI 生成角色描述
  const handleAIGenerate = async () => {
    if (!formData.name.trim()) {
      alert('请先输入角色名称');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/characters/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name })
      });
      const data = await res.json();
      if (data.success) {
        setFormData({
          ...formData,
          description: data.data.description || formData.description,
          personality: data.data.personality || formData.personality,
          traits: data.data.traits?.length > 0 ? data.data.traits : formData.traits
        });
      }
    } catch (err) {
      console.error('AI 生成失败:', err);
    }
  };

  return (
    <div className="p-6">
      {/* 顶部导航 */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(`/project/${projectId}`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">素材库</h1>
          <p className="text-gray-500 text-sm">管理角色模板和参考图</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-4 h-4" />
          添加角色
        </button>
      </div>

      {/* 角色列表 */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
        </div>
      ) : characters.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无角色</h3>
          <p className="text-gray-500 mb-4">添加角色模板，用于保持画面一致性</p>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            创建第一个角色
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.map((char) => (
            <div key={char.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* 角色封面 */}
              <div className="h-40 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center relative">
                {char.referenceImages?.[0] ? (
                  <img
                    src={char.referenceImages[0]}
                    alt={char.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-purple-300" />
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={() => openModal(char)}
                    className="p-1.5 bg-white/80 rounded-lg hover:bg-white"
                  >
                    <Edit3 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(char.id)}
                    className="p-1.5 bg-white/80 rounded-lg hover:bg-white"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              {/* 角色信息 */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{char.name}</h3>
                {char.description && (
                  <p className="text-sm text-gray-500 mb-2 line-clamp-2">{char.description}</p>
                )}

                {/* 特征标签 */}
                {char.traits?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {char.traits.slice(0, 3).map((trait, i) => (
                      <span key={i} className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-xs">
                        {trait}
                      </span>
                    ))}
                    {char.traits.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                        +{char.traits.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* 配色预览 */}
                {char.colorPalette?.length > 0 && (
                  <div className="flex gap-1">
                    {char.colorPalette.slice(0, 4).map((color, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full border border-gray-200"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 创建/编辑模态框 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                {editingCharacter ? '编辑角色' : '创建新角色'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[calc(90vh-130px)] space-y-4">
              {/* 角色名称 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">角色名称 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：小明、小红"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* 角色描述 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  角色描述
                  <button
                    onClick={handleAIGenerate}
                    className="ml-2 text-purple-600 hover:text-purple-800 text-xs flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    AI 补充
                  </button>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="描述角色的外貌特征..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              {/* 性格特征 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">性格特征</label>
                <textarea
                  value={formData.personality}
                  onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                  placeholder="例如：活泼开朗、有点冒失、但心地善良"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              {/* 特征词标签 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  特征标签 <span className="text-gray-400 font-normal">(帮助 AI 保持一致性)</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.traits.map((trait, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-1"
                    >
                      {trait}
                      <button
                        onClick={() => setFormData({
                          ...formData,
                          traits: formData.traits.filter((_, idx) => idx !== i)
                        })}
                        className="hover:text-purple-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTrait}
                    onChange={(e) => setNewTrait(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTrait()}
                    placeholder="输入标签后回车"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <button onClick={addTrait} className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 配色方案 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  角色配色 <span className="text-gray-400 font-normal">(主色调)</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.colorPalette.map((color, i) => (
                    <div key={i} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
                      <span className="text-sm">{color}</span>
                      <button
                        onClick={() => setFormData({
                          ...formData,
                          colorPalette: formData.colorPalette.filter((_, idx) => idx !== i)
                        })}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    placeholder="#FF5500"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <button onClick={addColor} className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 参考图 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  参考图 <span className="text-gray-400 font-normal">(用于 IP-Adapter 角色一致性)</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-2">拖拽图片或点击上传</p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg cursor-pointer hover:bg-purple-200 text-sm"
                  >
                    选择图片
                  </label>
                </div>
                {formData.referenceImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {formData.referenceImages.map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} alt="" className="w-full h-20 object-cover rounded" />
                        <button
                          onClick={() => setFormData({
                            ...formData,
                            referenceImages: formData.referenceImages.filter((_, idx) => idx !== i)
                          })}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 音色选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Volume2 className="w-4 h-4" />
                  音色选择
                </label>
                <select
                  value={formData.preferredVoice}
                  onChange={(e) => setFormData({ ...formData, preferredVoice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">自动分配</option>
                  <option value="female_youthful">女声 - 年轻活泼</option>
                  <option value="female_mature">女声 - 成熟稳重</option>
                  <option value="male_youthful">男声 - 年轻活力</option>
                  <option value="male_mature">男声 - 成熟低沉</option>
                  <option value="neutral">中性音色</option>
                </select>
              </div>
            </div>

            {/* 底部按钮 */}
            <div className="flex justify-end gap-2 p-4 border-t">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
