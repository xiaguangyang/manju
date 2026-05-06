import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Settings, Plus, Film, ChevronRight, ChevronDown,
  FileText, Layout, Image, Video, Volume2, Download,
  Clock, CheckCircle, Play, Trash2, Edit3, X, Save, RotateCcw
} from 'lucide-react';

const API_BASE = 'http://localhost:3001/api';

// 创作流程步骤
const WORKFLOW_STEPS = [
  { id: 'script', title: '剧本创作', icon: FileText, description: '编写剧本内容，管理对话和旁白' },
  { id: 'storyboard', title: '分镜设计', icon: Layout, description: '创建和管理分镜，设置镜头参数' },
  { id: 'image', title: '图片生成', icon: Image, description: 'AI生成分镜图片' },
  { id: 'video', title: '视频生成', icon: Video, description: '图生视频，转场效果' },
  { id: 'audio', title: '配音合成', icon: Volume2, description: '角色配音，BGM背景音乐' },
  { id: 'export', title: '预览导出', icon: Download, description: '最终预览，导出视频' },
];



// 获取状态信息
const getStatusInfo = (status) => {
  const info = {
    pending: { text: '待处理', color: 'text-gray-500 bg-gray-100' },
    in_progress: { text: '进行中', color: 'text-blue-600 bg-blue-100' },
    completed: { text: '已完成', color: 'text-green-600 bg-green-100' },
  };
  return info[status] || info.pending;
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
};

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(null);
  const [editingContent, setEditingContent] = useState({});
  const [showEpisodeModal, setShowEpisodeModal] = useState(false);
  const [newEpisode, setNewEpisode] = useState({ title: '', episodeNumber: 1 });

  // 获取项目详情
  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`${API_BASE}/projects/${id}`);
      const data = await res.json();
      if (data.success) {
        setProject(data.data);
        // 初始化编辑内容
        const content = {};
        WORKFLOW_STEPS.forEach(step => {
          content[step.id] = data.data[step.id]?.content || '';
        });
        setEditingContent(content);
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('获取项目失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 创建剧集
  const handleCreateEpisode = async () => {
    if (!newEpisode.title.trim()) {
      alert('请输入剧集标题');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/projects/${id}/episodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEpisode),
      });
      const data = await res.json();
      if (data.success) {
        fetchProject();
        setShowEpisodeModal(false);
        setNewEpisode({ title: '', episodeNumber: (project.episodes?.length || 0) + 1 });
      }
    } catch (err) {
      console.error('创建剧集失败:', err);
    }
  };

  // 删除剧集
  const handleDeleteEpisode = async (episodeId, e) => {
    e?.stopPropagation();
    if (!confirm('确定要删除这个剧集吗？')) return;
    try {
      const res = await fetch(`${API_BASE}/projects/${id}/episodes/${episodeId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchProject();
      }
    } catch (err) {
      console.error('删除剧集失败:', err);
    }
  };

  // 进入剧集详情
  const goToEpisode = (episodeId) => {
    navigate(`/project/${id}/episode/${episodeId}`);
  };

  // 更新项目状态
  const updateProjectStatus = async (stepId, status) => {
    try {
      const res = await fetch(`${API_BASE}/projects/${id}/steps/${stepId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status,
          content: editingContent[stepId] || '',
          updatedAt: new Date().toISOString()
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchProject();
      }
    } catch (err) {
      console.error('更新状态失败:', err);
    }
  };

  // 保存步骤内容
  const handleSaveContent = (stepId) => {
    updateProjectStatus(stepId, project[stepId]?.status || 'in_progress');
  };

  // 重置步骤
  const handleResetStep = (stepId) => {
    if (!confirm('确定要重置这个步骤吗？')) return;
    setEditingContent({ ...editingContent, [stepId]: '' });
    updateProjectStatus(stepId, 'pending');
  };

  // 加载状态检查
  if (loading || !project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!project) {
    return <div className="p-6 text-center text-gray-500">项目不存在</div>;
  }

  // 计算项目进度
  const completedSteps = WORKFLOW_STEPS.filter(
    step => project[step.id]?.status === 'completed'
  ).length;
  const progress = Math.round((completedSteps / WORKFLOW_STEPS.length) * 100);

  return (
    <div className="p-6">
      {/* 顶部导航 */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-gray-500 text-sm">{project.description || '暂无描述'}</p>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* 进度概览 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">创作进度</h2>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {progress}%
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
          <span>已完成 {completedSteps} / {WORKFLOW_STEPS.length} 个步骤</span>
          <span>{project.episodes?.length || 0} 剧集</span>
        </div>
      </div>

      {/* 剧集列表 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Film className="w-5 h-5 text-purple-600" />
            剧集列表
          </h2>
          <button
            onClick={() => setShowEpisodeModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加剧集
          </button>
        </div>

        {project.episodes?.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
            <Film className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-3">还没有剧集</p>
            <button
              onClick={() => setShowEpisodeModal(true)}
              className="text-purple-600 hover:underline"
            >
              创建第一个剧集
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {project.episodes?.map((episode, index) => (
              <div
                key={episode.id}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50/50 cursor-pointer transition-all group"
              >
                <div 
                  onClick={() => goToEpisode(episode.id)}
                  className="flex items-center gap-4 flex-1"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold">
                    {episode.episodeNumber}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{episode.title}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>{episode.scenes?.length || 0} 分镜</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(episode.updatedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusInfo(episode.status).color}`}>
                      {getStatusInfo(episode.status).text}
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                  </div>
                </div>
                <button
                  onClick={(e) => handleDeleteEpisode(episode.id, e)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="删除剧集"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 创建剧集模态框 */}
      {showEpisodeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">创建新剧集</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleCreateEpisode(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  剧集名称 *
                </label>
                <input
                  type="text"
                  value={newEpisode.title}
                  onChange={(e) => setNewEpisode({ ...newEpisode, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="例如：第1集 初遇"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  剧集描述
                </label>
                <textarea
                  value={newEpisode.description || ''}
                  onChange={(e) => setNewEpisode({ ...newEpisode, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="描述本集内容..."
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEpisodeModal(false);
                    setNewEpisode({ title: '', description: '', episodeNumber: 1 });
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}