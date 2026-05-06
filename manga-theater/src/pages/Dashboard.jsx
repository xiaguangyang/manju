import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, FolderOpen, Film, Clock, CheckCircle, 
  PlayCircle, Trash2, Edit3, ChevronRight, Layers,
  X
} from 'lucide-react';

const API_BASE = 'http://localhost:3001/api';

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 获取类型文本
const getGenreText = (genre) => {
  const texts = {
    romance: '甜宠',
    fantasy: '奇幻',
    thriller: '悬疑',
    scifi: '科幻',
    other: '其他',
  };
  return texts[genre] || '其他';
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    genre: 'romance',
  });

  // 获取项目列表
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_BASE}/projects`);
      const data = await res.json();
      if (data.success) {
        setProjects(data.data || []);
      }
    } catch (err) {
      console.error('获取项目失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 创建项目
  const handleCreateProject = async () => {
    if (!newProject.name.trim()) {
      alert('请输入项目名称');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject),
      });
      const data = await res.json();
      if (data.success) {
        fetchProjects();
        setShowCreateModal(false);
        setNewProject({ name: '', description: '', genre: 'romance' });
        navigate(`/project/${data.data.id}`);
      }
    } catch (err) {
      console.error('创建项目失败:', err);
    }
  };

  // 打开编辑弹窗
  const handleEditProject = (project, e) => {
    e?.stopPropagation();
    setEditingProject({ ...project });
    setShowEditModal(true);
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!editingProject.name.trim()) {
      alert('请输入项目名称');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/projects/${editingProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProject),
      });
      const data = await res.json();
      if (data.success) {
        fetchProjects();
        setShowEditModal(false);
        setEditingProject(null);
      }
    } catch (err) {
      console.error('保存失败:', err);
    }
  };

  // 删除项目
  const handleDeleteProject = async (id, e) => {
    e.stopPropagation();
    if (!confirm('确定要删除这个项目吗？所有剧集和分镜都会被删除！')) return;
    try {
      const res = await fetch(`${API_BASE}/projects/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchProjects();
      }
    } catch (err) {
      console.error('删除失败:', err);
    }
  };

  // 统计项目进度
  const getProjectProgress = (project) => {
    const stages = ['script', 'storyboard', 'image', 'video', 'audio', 'export'];
    const completed = stages.filter(s => project[s]?.status === 'completed').length;
    return Math.round((completed / stages.length) * 100);
  };

  // 获取剧集和分镜总数
  const getTotalScenes = (project) => {
    if (!project.episodes) return 0;
    return project.episodes.reduce((total, ep) => total + (ep.scenes?.length || 0), 0);
  };

  return (
    <div className="p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">我的剧目</h1>
          <p className="text-gray-500 mt-1">管理你的漫剧创作项目</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          新建剧目
        </button>
      </div>

      {/* 加载状态 */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
        </div>
      ) : projects.length === 0 ? (
        /* 空状态 - 引导创建 */
        <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed border-gray-300 rounded-2xl">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
            <Film className="w-10 h-10 text-purple-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">开始你的第一个漫剧</h2>
          <p className="text-gray-500 mb-6 text-center max-w-md">
            创建剧目，编写剧本，生成图片和视频<br />
            轻松制作你的AI漫剧作品
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity shadow-lg"
          >
            <Plus className="w-5 h-5" />
            创建第一个剧目
          </button>
        </div>
      ) : (
        /* 项目列表 */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/project/${project.id}`)}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer group"
            >
              {/* 项目封面 */}
              <div className="h-40 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 relative overflow-hidden">
                {project.cover ? (
                  <img src={project.cover} alt={project.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Film className="w-16 h-16 text-white/50" />
                  </div>
                )}
                {/* 类型标签 */}
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 bg-white/90 text-gray-700 text-xs font-medium rounded-full">
                    {getGenreText(project.genre)}
                  </span>
                </div>
                {/* 操作按钮 */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleEditProject(project, e)}
                    className="p-2 bg-white/90 rounded-lg hover:bg-white"
                    title="编辑项目"
                  >
                    <Edit3 className="w-4 h-4 text-gray-700" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteProject(project.id, e)}
                    className="p-2 bg-white/90 rounded-lg hover:bg-white"
                    title="删除项目"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              {/* 项目信息 */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 truncate">{project.name}</h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                  {project.description || '暂无描述'}
                </p>

                {/* 进度条 */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500">创作进度</span>
                    <span className="font-medium text-purple-600">{getProjectProgress(project)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                      style={{ width: `${getProjectProgress(project)}%` }}
                    />
                  </div>
                </div>

                {/* 统计信息 */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    <span>{project.episodes?.length || 0} 剧集</span>
                    <span className="mx-1">/</span>
                    <span>{getTotalScenes(project)} 分镜</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(project.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* 添加新项目卡片 */}
          <div
            onClick={() => setShowCreateModal(true)}
            className="h-80 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-all"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <span className="text-gray-500 font-medium">创建新剧目</span>
          </div>
        </div>
      )}

      {/* 创建项目弹窗 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 m-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">创建新剧目</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">剧目名称 *</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  placeholder="例如：霸道总裁爱上我"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">剧目类型</label>
                <select
                  value={newProject.genre}
                  onChange={(e) => setNewProject({...newProject, genre: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="romance">甜宠</option>
                  <option value="fantasy">奇幻</option>
                  <option value="thriller">悬疑</option>
                  <option value="scifi">科幻</option>
                  <option value="other">其他</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">简介</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  placeholder="简单描述你的剧目..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleCreateProject}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 编辑项目弹窗 */}
      {showEditModal && editingProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 m-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">编辑剧目</h2>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">剧目名称 *</label>
                <input
                  type="text"
                  value={editingProject.name}
                  onChange={(e) => setEditingProject({...editingProject, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">剧目类型</label>
                <select
                  value={editingProject.genre}
                  onChange={(e) => setEditingProject({...editingProject, genre: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="romance">甜宠</option>
                  <option value="fantasy">奇幻</option>
                  <option value="thriller">悬疑</option>
                  <option value="scifi">科幻</option>
                  <option value="other">其他</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">简介</label>
                <textarea
                  value={editingProject.description || ''}
                  onChange={(e) => setEditingProject({...editingProject, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">封面图片URL</label>
                <input
                  type="text"
                  value={editingProject.cover || ''}
                  onChange={(e) => setEditingProject({...editingProject, cover: e.target.value})}
                  placeholder="输入封面图片URL（可选）"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleSaveEdit}
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
