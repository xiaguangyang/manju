import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FolderOpen, Film, MoreVertical, Search } from 'lucide-react';

const API_BASE = 'http://localhost:3001/api';

// 类型标签选项
const TYPE_TAGS = [
  { value: 'romance', label: '甜宠', color: 'bg-pink-100 text-pink-700' },
  { value: 'thriller', label: '悬疑', color: 'bg-purple-100 text-purple-700' },
  { value: 'fantasy', label: '奇幻', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'scifi', label: '科幻', color: 'bg-blue-100 text-blue-700' },
  { value: 'action', label: '动作', color: 'bg-red-100 text-red-700' },
  { value: 'comedy', label: '喜剧', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'war', label: '战争', color: 'bg-gray-100 text-gray-700' },
  { value: 'xianxia', label: '仙侠', color: 'bg-green-100 text-green-700' },
];

export default function ProjectManagement() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tags: [],
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_BASE}/projects`);
      const data = await res.json();
      setProjects(data);
    } catch (error) {
      console.error('获取项目列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await fetch(`${API_BASE}/projects/${editingProject.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch(`${API_BASE}/projects`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }
      setShowModal(false);
      setEditingProject(null);
      setFormData({ name: '', description: '', tags: [] });
      fetchProjects();
    } catch (error) {
      console.error('保存项目失败:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('确定要删除这个项目吗？删除后无法恢复。')) return;
    try {
      await fetch(`${API_BASE}/projects/${id}`, { method: 'DELETE' });
      fetchProjects();
    } catch (error) {
      console.error('删除项目失败:', error);
    }
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      tags: project.tags || [],
    });
    setShowModal(true);
  };

  const toggleTag = (tagValue) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagValue)
        ? prev.tags.filter(t => t !== tagValue)
        : [...prev.tags, tagValue]
    }));
  };

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProgress = (project) => {
    if (project.sceneCount === 0) return 0;
    return Math.round((project.completedCount / project.sceneCount) * 100);
  };

  return (
    <div className="p-6">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">剧目管理</h1>
          <p className="text-gray-500 mt-1">创建和管理你的漫剧项目</p>
        </div>
        <button
          onClick={() => {
            setEditingProject(null);
            setFormData({ name: '', description: '', tags: [] });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
        >
          <Plus size={20} />
          新建剧目
        </button>
      </div>

      {/* 搜索 */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="搜索剧目..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* 项目列表 */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">加载中...</div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="mx-auto text-gray-300 mb-4" size={64} />
          <p className="text-gray-500 mb-4">
            {searchTerm ? '没有找到匹配的剧目' : '还没有创建任何剧目'}
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            创建第一个剧目
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* 封面 */}
              <div className="h-32 bg-gradient-to-br from-purple-400 to-pink-400 relative">
                {project.cover ? (
                  <img src={project.cover} alt={project.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FolderOpen className="text-white opacity-50" size={48} />
                  </div>
                )}
                {/* 操作按钮 */}
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={() => openEditModal(project)}
                    className="p-1.5 bg-white/80 rounded-lg hover:bg-white"
                  >
                    <Edit2 size={16} className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-1.5 bg-white/80 rounded-lg hover:bg-white"
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              </div>

              {/* 内容 */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-1">{project.name}</h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                  {project.description || '暂无描述'}
                </p>

                {/* 标签 */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.tags?.slice(0, 3).map((tag) => {
                    const tagInfo = TYPE_TAGS.find(t => t.value === tag);
                    return (
                      <span
                        key={tag}
                        className={`text-xs px-2 py-0.5 rounded-full ${tagInfo?.color || 'bg-gray-100 text-gray-600'}`}
                      >
                        {tagInfo?.label || tag}
                      </span>
                    );
                  })}
                </div>

                {/* 统计 */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Film size={14} />
                      {project.episodeCount || 0} 集
                    </span>
                    <span>{project.sceneCount || 0} 镜头</span>
                  </div>
                </div>

                {/* 进度条 */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500">完成进度</span>
                    <span className="font-medium text-purple-600">{getProgress(project)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                      style={{ width: `${getProgress(project)}%` }}
                    />
                  </div>
                </div>

                {/* 按钮 */}
                <div className="flex gap-2">
                  <a
                    href={`#/projects/${project.id}/episodes`}
                    className="flex-1 text-center py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 font-medium text-sm"
                  >
                    管理剧集
                  </a>
                  <a
                    href={`#/projects/${project.id}/characters`}
                    className="flex-1 text-center py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 font-medium text-sm"
                  >
                    角色库
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 创建/编辑模态框 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingProject ? '编辑剧目' : '创建新剧目'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  剧目名称 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="例如：霸道总裁爱上我"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  简介
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={3}
                  placeholder="简要描述这个剧目的内容..."
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  类型标签（可多选）
                </label>
                <div className="flex flex-wrap gap-2">
                  {TYPE_TAGS.map((tag) => (
                    <button
                      key={tag.value}
                      type="button"
                      onClick={() => toggleTag(tag.value)}
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        formData.tags.includes(tag.value)
                          ? `${tag.color} ring-2 ring-offset-1 ring-gray-300`
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
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
                  {editingProject ? '保存' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
