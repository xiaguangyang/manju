import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Plus, Edit2, Trash2, Film, Play, Clock, ChevronRight,
  ChevronLeft, GripVertical, MoreVertical, ArrowLeft, Sparkles
} from 'lucide-react';

const API_BASE = 'http://localhost:3001/api';

export default function EpisodeManagement() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [scenes, setScenes] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    episodeNumber: 1,
  });
  const [selectedEpisode, setSelectedEpisode] = useState(null);

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      const [projectRes, episodesRes] = await Promise.all([
        fetch(`${API_BASE}/projects/${projectId}`),
        fetch(`${API_BASE}/episodes?projectId=${projectId}`),
      ]);
      const projectData = await projectRes.json();
      const episodesData = await episodesRes.json();
      setProject(projectData);
      setEpisodes(episodesData);

      // 获取每个剧集的分镜
      const scenesData = {};
      for (const ep of episodesData) {
        const scenesRes = await fetch(`${API_BASE}/scenes?episodeId=${ep.id}`);
        scenesData[ep.id] = await scenesRes.json();
      }
      setScenes(scenesData);
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        projectId,
      };
      if (editingEpisode) {
        await fetch(`${API_BASE}/episodes/${editingEpisode.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } else {
        await fetch(`${API_BASE}/episodes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      }
      setShowModal(false);
      setEditingEpisode(null);
      setFormData({ title: '', description: '', episodeNumber: episodes.length + 1 });
      fetchData();
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('确定要删除这个剧集吗？')) return;
    try {
      await fetch(`${API_BASE}/episodes/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const openEditModal = (episode) => {
    setEditingEpisode(episode);
    setFormData({
      title: episode.title,
      description: episode.description,
      episodeNumber: episode.episodeNumber,
    });
    setShowModal(true);
  };

  const getEpisodeStatus = (episode) => {
    const epScenes = scenes[episode.id] || [];
    if (epScenes.length === 0) return { text: '未开始', color: 'bg-gray-100 text-gray-600' };
    const completed = epScenes.filter(s => s.status === 'completed').length;
    const total = epScenes.length;
    if (completed === total) return { text: '已完成', color: 'bg-green-100 text-green-600' };
    if (completed > 0) return { text: '生成中', color: 'bg-yellow-100 text-yellow-600' };
    return { text: '未开始', color: 'bg-gray-100 text-gray-600' };
  };

  const getTotalDuration = (episode) => {
    const epScenes = scenes[episode.id] || [];
    const total = epScenes.reduce((sum, s) => sum + (s.duration || 3), 0);
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="p-6 text-center">加载中...</div>;
  }

  return (
    <div className="p-6">
      {/* 头部 */}
      <div className="mb-6">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft size={16} />
          返回剧目列表
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{project?.name || '剧集管理'}</h1>
            <p className="text-gray-500 mt-1">
              {project?.description || '创建和管理剧集'}
            </p>
          </div>
          <button
            onClick={() => {
              setEditingEpisode(null);
              setFormData({ title: '', description: '', episodeNumber: episodes.length + 1 });
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600"
          >
            <Plus size={20} />
            新建剧集
          </button>
        </div>
      </div>

      {/* 剧集列表 */}
      {episodes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <Film className="mx-auto text-gray-300 mb-4" size={64} />
          <p className="text-gray-500 mb-4">还没有创建任何剧集</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            创建第一个剧集
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {episodes.map((episode, index) => {
            const status = getEpisodeStatus(episode);
            const epScenes = scenes[episode.id] || [];
            return (
              <div
                key={episode.id}
                className={`bg-white rounded-xl border border-gray-100 overflow-hidden transition-all ${
                  selectedEpisode?.id === episode.id ? 'ring-2 ring-purple-500' : 'hover:shadow-md'
                }`}
              >
                {/* 展开的分镜列表 */}
                {selectedEpisode?.id === episode.id ? (
                  <div className="p-4">
                    {/* 分镜工具栏 */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">第{episode.episodeNumber}集</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}>
                          {status.text}
                        </span>
                        <span className="text-sm text-gray-500">
                          {epScenes.length} 个镜头 · {getTotalDuration(episode)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg" title="添加分镜">
                          <Plus size={18} />
                        </button>
                        <button
                          onClick={() => setSelectedEpisode(null)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <ChevronLeft size={18} />
                        </button>
                      </div>
                    </div>

                    {/* 分镜列表 */}
                    {epScenes.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        暂无分镜，点击添加或导入剧本自动生成
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {epScenes.map((scene, i) => (
                          <div
                            key={scene.id}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                          >
                            <GripVertical size={16} className="text-gray-400" />
                            <span className="text-sm font-medium text-gray-400 w-8">
                              {scene.shotNumber}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm truncate">{scene.description || scene.script || '未描述'}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {scene.characters?.map((char, ci) => (
                                  <span key={ci} className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded">
                                    {char}
                                  </span>
                                ))}
                                <span className="text-xs text-gray-400">{scene.duration}s</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {scene.status === 'completed' ? (
                                <span className="w-2 h-2 bg-green-500 rounded-full" title="已完成" />
                              ) : scene.status === 'generating' ? (
                                <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" title="生成中" />
                              ) : (
                                <span className="w-2 h-2 bg-gray-300 rounded-full" title="待生成" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 快捷操作 */}
                    <div className="mt-4 pt-4 border-t flex gap-3">
                      <button className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 text-sm">
                        <Sparkles size={16} />
                        AI 生成全部
                      </button>
                      <Link
                        to={`/projects/${projectId}/episodes/${episode.id}/editor`}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                      >
                        分镜编辑器
                        <ChevronRight size={16} />
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* 折叠状态 */
                  <div
                    className="p-4 flex items-center gap-4 cursor-pointer"
                    onClick={() => setSelectedEpisode(episode)}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center text-white font-bold">
                      {episode.episodeNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{episode.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}>
                          {status.text}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Film size={14} />
                          {epScenes.length} 镜头
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {getTotalDuration(episode)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(episode);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(episode.id);
                        }}
                        className="p-2 hover:bg-red-50 text-red-500 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                      <ChevronRight size={20} className="text-gray-400" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 创建/编辑模态框 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingEpisode ? '编辑剧集' : '创建新剧集'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  剧集名称 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="例如：第1集 初遇"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  集数
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.episodeNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, episodeNumber: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  简介
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={3}
                  placeholder="简要描述这一集的内容..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600"
                >
                  {editingEpisode ? '保存' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
