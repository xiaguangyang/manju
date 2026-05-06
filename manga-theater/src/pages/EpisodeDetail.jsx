import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Edit3, Trash2, Image, Video, Volume2,
  Clock, ChevronRight, GripVertical, Film, 
  Camera, MessageSquare, Sun, Moon, Play, Save
} from 'lucide-react';

const API_BASE = 'http://localhost:3001/api';

// 摄像机角度选项
const CAMERA_OPTIONS = [
  { value: 'wide', label: '全景' },
  { value: 'medium', label: '中景' },
  { value: 'close', label: '近景' },
  { value: 'close_up', label: '特写' },
  { value: 'over_shoulder', label: '过肩' },
  { value: 'pov', label: '主观镜头' },
];

// 时段选项
const TIME_OPTIONS = [
  { value: 'morning', label: '清晨' },
  { value: 'day', label: '白天' },
  { value: 'afternoon', label: '下午' },
  { value: 'evening', label: '傍晚' },
  { value: 'night', label: '夜晚' },
  { value: 'midnight', label: '深夜' },
];

// 获取状态信息
const getStatusInfo = (status) => {
  const info = {
    pending: { text: '待生成', color: 'text-gray-500 bg-gray-100' },
    generating: { text: '生成中', color: 'text-blue-600 bg-blue-100' },
    completed: { text: '已完成', color: 'text-green-600 bg-green-100' },
    failed: { text: '失败', color: 'text-red-600 bg-red-100' },
  };
  return info[status] || info.pending;
};

export default function EpisodeDetail() {
  const { id, episodeId } = useParams();
  const navigate = useNavigate();
  
  const [episode, setEpisode] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingScene, setEditingScene] = useState(null);
  const [showSceneModal, setShowSceneModal] = useState(false);
  const [newScene, setNewScene] = useState({
    shotNumber: 1,
    camera: 'medium',
    timeOfDay: 'day',
    script: '',
    dialogue: '',
    narration: '',
    characters: [],
    location: '',
  });

  // 获取数据
  useEffect(() => {
    fetchData();
  }, [id, episodeId]);

  const fetchData = async () => {
    try {
      const [projectRes, episodeRes] = await Promise.all([
        fetch(`${API_BASE}/projects/${id}`),
        fetch(`${API_BASE}/projects/${id}/episodes/${episodeId}`),
      ]);
      
      const projectData = await projectRes.json();
      const episodeData = await episodeRes.json();
      
      if (projectData.success) {
        setProject(projectData.data);
      }
      if (episodeData.success) {
        setEpisode(episodeData.data);
        setNewScene(prev => ({ ...prev, shotNumber: (episodeData.data.scenes?.length || 0) + 1 }));
      }
    } catch (err) {
      console.error('获取数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 创建分镜
  const handleCreateScene = async () => {
    if (!newScene.script.trim()) {
      alert('请输入分镜描述');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/projects/${id}/episodes/${episodeId}/scenes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newScene),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
        setShowSceneModal(false);
        resetSceneForm();
      }
    } catch (err) {
      console.error('创建分镜失败:', err);
    }
  };

  // 更新分镜
  const handleUpdateScene = async () => {
    if (!editingScene) return;
    try {
      const res = await fetch(`${API_BASE}/projects/${id}/episodes/${episodeId}/scenes/${editingScene.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingScene),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
        setEditingScene(null);
      }
    } catch (err) {
      console.error('更新分镜失败:', err);
    }
  };

  // 删除分镜
  const handleDeleteScene = async (sceneId) => {
    if (!confirm('确定要删除这个分镜吗？')) return;
    try {
      const res = await fetch(`${API_BASE}/projects/${id}/episodes/${episodeId}/scenes/${sceneId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error('删除分镜失败:', err);
    }
  };

  // 重置表单
  const resetSceneForm = () => {
    setNewScene({
      shotNumber: (episode?.scenes?.length || 0) + 1,
      camera: 'medium',
      timeOfDay: 'day',
      script: '',
      dialogue: '',
      narration: '',
      characters: [],
      location: '',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-gray-500 mb-4">剧集不存在</p>
        <button onClick={() => navigate(`/project/${id}`)} className="text-purple-600 hover:underline">
          返回项目
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 顶部导航 */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(`/project/${id}`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <span>{project?.name}</span>
            <ChevronRight className="w-4 h-4" />
            <span>第{episode.episodeNumber}集</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{episode.title}</h1>
        </div>
        <button
          onClick={() => setShowSceneModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90"
        >
          <Plus className="w-5 h-5" />
          添加分镜
        </button>
      </div>

      {/* 分镜列表 */}
      <div className="space-y-4">
        {episode.scenes?.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <Film className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">还没有分镜</h3>
            <p className="text-gray-500 mb-4">开始创建你的第一个分镜吧</p>
            <button
              onClick={() => setShowSceneModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              创建分镜
            </button>
          </div>
        ) : (
          episode.scenes?.map((scene, index) => (
            <div
              key={scene.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* 分镜头部 */}
              <div className="flex items-center gap-4 p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
                    {scene.shotNumber}
                  </div>
                </div>
                
                <div className="flex-1 grid grid-cols-4 gap-4">
                  {/* 摄像机 */}
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {CAMERA_OPTIONS.find(c => c.value === scene.camera)?.label || '中景'}
                    </span>
                  </div>
                  
                  {/* 时段 */}
                  <div className="flex items-center gap-2">
                    {scene.timeOfDay?.includes('night') || scene.timeOfDay === 'midnight' ? (
                      <Moon className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Sun className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-600">
                      {TIME_OPTIONS.find(t => t.value === scene.timeOfDay)?.label || '白天'}
                    </span>
                  </div>
                  
                  {/* 地点 */}
                  {scene.location && (
                    <div className="flex items-center gap-2">
                      <Film className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 truncate">{scene.location}</span>
                    </div>
                  )}
                  
                  {/* 状态 */}
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusInfo(scene.imageStatus).color}`}>
                      {getStatusInfo(scene.imageStatus).text}
                    </span>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingScene(scene)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Edit3 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteScene(scene.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              {/* 分镜内容 */}
              <div className="p-4">
                {/* 画面描述 */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">画面描述</h4>
                  <p className="text-gray-600 bg-gray-50 rounded-lg p-3">
                    {scene.script || '暂无描述'}
                  </p>
                </div>

                {/* 对话/旁白 */}
                {(scene.dialogue || scene.narration) && (
                  <div className="grid grid-cols-2 gap-4">
                    {scene.dialogue && (
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700">对话</span>
                        </div>
                        <p className="text-blue-800">{scene.dialogue}</p>
                      </div>
                    )}
                    {scene.narration && (
                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Volume2 className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-700">旁白</span>
                        </div>
                        <p className="text-purple-800">{scene.narration}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 生成结果预览 */}
                <div className="mt-4 flex items-center gap-4">
                  {/* 图片预览 */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Image className="w-5 h-5 text-gray-400" />
                    {scene.imageUrl ? (
                      <img src={scene.imageUrl} alt="" className="w-20 h-14 object-cover rounded" />
                    ) : (
                      <span className="text-sm text-gray-500">待生成</span>
                    )}
                  </div>
                  
                  {/* 视频预览 */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Video className="w-5 h-5 text-gray-400" />
                    {scene.videoUrl ? (
                      <video src={scene.videoUrl} className="w-20 h-14 object-cover rounded" />
                    ) : (
                      <span className="text-sm text-gray-500">待生成</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 添加分镜弹窗 */}
      {showSceneModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 m-4 my-8">
            <h2 className="text-xl font-bold mb-4">添加分镜</h2>
            
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {/* 分镜编号 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">分镜编号</label>
                  <input
                    type="number"
                    min="1"
                    value={newScene.shotNumber}
                    onChange={(e) => setNewScene({...newScene, shotNumber: parseInt(e.target.value) || 1})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">摄像机角度</label>
                  <select
                    value={newScene.camera}
                    onChange={(e) => setNewScene({...newScene, camera: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {CAMERA_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 时段和地点 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">时段</label>
                  <select
                    value={newScene.timeOfDay}
                    onChange={(e) => setNewScene({...newScene, timeOfDay: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {TIME_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">地点</label>
                  <input
                    type="text"
                    value={newScene.location}
                    onChange={(e) => setNewScene({...newScene, location: e.target.value})}
                    placeholder="例如：咖啡馆"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* 画面描述 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">画面描述 *</label>
                <textarea
                  value={newScene.script}
                  onChange={(e) => setNewScene({...newScene, script: e.target.value})}
                  placeholder="描述这个分镜的画面..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              {/* 对话 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">对话</label>
                <textarea
                  value={newScene.dialogue}
                  onChange={(e) => setNewScene({...newScene, dialogue: e.target.value})}
                  placeholder="角色对话..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              {/* 旁白 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">旁白</label>
                <textarea
                  value={newScene.narration}
                  onChange={(e) => setNewScene({...newScene, narration: e.target.value})}
                  placeholder="旁白描述..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowSceneModal(false);
                  resetSceneForm();
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleCreateScene}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 编辑分镜弹窗 */}
      {editingScene && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 m-4 my-8">
            <h2 className="text-xl font-bold mb-4">编辑分镜 #{editingScene.shotNumber}</h2>
            
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">摄像机角度</label>
                  <select
                    value={editingScene.camera}
                    onChange={(e) => setEditingScene({...editingScene, camera: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {CAMERA_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">时段</label>
                  <select
                    value={editingScene.timeOfDay}
                    onChange={(e) => setEditingScene({...editingScene, timeOfDay: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {TIME_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">地点</label>
                <input
                  type="text"
                  value={editingScene.location}
                  onChange={(e) => setEditingScene({...editingScene, location: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">画面描述</label>
                <textarea
                  value={editingScene.script}
                  onChange={(e) => setEditingScene({...editingScene, script: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">对话</label>
                <textarea
                  value={editingScene.dialogue}
                  onChange={(e) => setEditingScene({...editingScene, dialogue: e.target.value})}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">旁白</label>
                <textarea
                  value={editingScene.narration}
                  onChange={(e) => setEditingScene({...editingScene, narration: e.target.value})}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingScene(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleUpdateScene}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
