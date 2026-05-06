import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Settings, Plus, Film, ChevronRight, 
  FileText, Layout, Image, Video, Volume2, Download,
  Clock, CheckCircle, Play, Trash2, Edit3, MoreVertical,
  Layers, Palette, GripVertical
} from 'lucide-react';

const API_BASE = 'http://localhost:3001/api';

// 创作流程步骤
const WORKFLOW_STEPS = [
  {
    id: 'script',
    icon: FileText,
    title: '剧本创作',
    description: '编写剧本内容，管理对话和旁白',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    lightColor: 'bg-blue-100',
  },
  {
    id: 'storyboard',
    icon: Layout,
    title: '分镜设计',
    description: '创建和管理分镜，设置镜头参数',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    lightColor: 'bg-purple-100',
  },
  {
    id: 'image',
    icon: Image,
    title: '图片生成',
    description: 'AI 生成分镜图片',
    color: 'from-orange-500 to-yellow-500',
    bgColor: 'bg-orange-50',
    lightColor: 'bg-orange-100',
  },
  {
    id: 'video',
    icon: Video,
    title: '视频生成',
    description: '图生视频，转场效果',
    color: 'from-red-500 to-pink-500',
    bgColor: 'bg-red-50',
    lightColor: 'bg-red-100',
  },
  {
    id: 'audio',
    icon: Volume2,
    title: '配音合成',
    description: '角色配音，BGM 背景音乐',
    color: 'from-green-500 to-teal-500',
    bgColor: 'bg-green-50',
    lightColor: 'bg-green-100',
  },
  {
    id: 'export',
    icon: Download,
    title: '预览导出',
    description: '最终预览，导出视频',
    color: 'from-gray-600 to-gray-800',
    bgColor: 'bg-gray-50',
    lightColor: 'bg-gray-100',
  },
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
  const [showEpisodeModal, setShowEpisodeModal] = useState(false);
  const [newEpisode, setNewEpisode] = useState({ title: '', episodeNumber: 1 });
  const [editingEpisode, setEditingEpisode] = useState(null);

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
        setNewEpisode({ title: '', episodeNumber: 1 });
      }
    } catch (err) {
      console.error('创建剧集失败:', err);
    }
  };

  // 删除剧集
  const handleDeleteEpisode = async (episodeId) => {
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

  // 更新项目状态
  const updateProjectStatus = async (stepId, status) => {
    try {
      const res = await fetch(`${API_BASE}/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [stepId]: { status }
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

  // 跳转到剧集详情
  const goToEpisode = (episodeId) => {
    navigate(`/project/${id}/episode/${episodeId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-gray-500 mb-4">项目不存在</p>
        <button onClick={() => navigate('/')} className="text-purple-600 hover:underline">
          返回首页
        </button>
      </div>
    );
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
            <Layers className="w-5 h-5 text-purple-600" />
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
                onClick={() => goToEpisode(episode.id)}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50/50 cursor-pointer transition-all group"
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
            ))}
          </div>
        )}
      </div>

      {/* 创作流程步骤 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Play className="w-5 h-5 text-purple-600" />
          创作流程
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {WORKFLOW_STEPS.map((step, index) => {
            const Icon = step.icon;
            const status = project[step.id]?.status || 'pending';
            const statusInfo = getStatusInfo(status);
            const isNext = status === 'pending' && 
              (index === 0 || project[WORKFLOW_STEPS[index - 1].id]?.status === 'completed');

            return (
              <div
                key={step.id}
                onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
                className={`
                  relative p-5 rounded-2xl border-2 transition-all cursor-pointer
                  ${status === 'completed' ? 'border-green-300 bg-green-50' : 
                    status === 'in_progress' ? 'border-blue-300 bg-blue-50' :
                    isNext ? 'border-purple-300 bg-purple-50 hover:shadow-md' :
                    'border-gray-200 bg-white hover:border-gray-300'}
                `}
              >
                {/* 步骤图标 */}
                <div className={`w-12 h-12 rounded-xl ${step.bgColor} flex items-center justify-center mb-3`}>
                  <Icon className={`w-6 h-6 bg-gradient-to-br ${step.color} bg-clip-text`} />
                </div>

                {/* 步骤信息 */}
                <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-sm text-gray-500 mb-3">{step.description}</p>

                {/* 状态标签 */}
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                    {statusInfo.text}
                  </span>
                  {status === 'pending' && isNext && (
                    <span className="text-xs text-purple-600 font-medium">下一步</span>
                  )}
                </div>

                {/* 操作按钮 */}
                {activeStep === step.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                    {status === 'pending' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateProjectStatus(step.id, 'in_progress');
                        }}
                        className="flex-1 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-lg hover:opacity-90"
                      >
                        开始
                      </button>
                    )}
                    {status === 'in_progress' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateProjectStatus(step.id, 'completed');
                        }}
                        className="flex-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                      >
                        完成
                      </button>
                    )}
                    <button className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
                      查看
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 创建剧集弹窗 */}
      {showEpisodeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 m-4">
            <h2 className="text-xl font-bold mb-4">添加剧集</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">剧集标题 *</label>
                <input
                  type="text"
                  value={newEpisode.title}
                  onChange={(e) => setNewEpisode({...newEpisode, title: e.target.value})}
                  placeholder="例如：初遇"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">集数</label>
                <input
                  type="number"
                  min="1"
                  value={newEpisode.episodeNumber}
                  onChange={(e) => setNewEpisode({...newEpisode, episodeNumber: parseInt(e.target.value) || 1})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEpisodeModal(false);
                  setNewEpisode({ title: '', episodeNumber: 1 });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleCreateEpisode}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
