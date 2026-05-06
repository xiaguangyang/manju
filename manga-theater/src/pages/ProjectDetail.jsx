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
  {
    id: 'script',
    icon: FileText,
    title: '剧本创作',
    description: '编写剧本内容，管理对话和旁白',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    lightColor: 'bg-blue-100',
    placeholder: '在此输入剧本内容...\n\n可以包括：\n- 对话：角色A：台词内容\n- 旁白：描述场景或内心活动\n- 动作：角色的动作描写',
    fields: [
      { key: 'content', label: '剧本内容', type: 'textarea' },
    ]
  },
  {
    id: 'storyboard',
    icon: Layout,
    title: '分镜设计',
    description: '创建和管理分镜，设置镜头参数',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    lightColor: 'bg-purple-100',
    placeholder: '在此设计分镜...\n\n每个分镜包括：\n- 镜头编号\n- 场景描述\n- 角色动作\n- 对话内容\n- 镜头时长',
    fields: [
      { key: 'content', label: '分镜设计', type: 'textarea' },
      { key: 'sceneCount', label: '分镜数量', type: 'number' },
    ]
  },
  {
    id: 'image',
    icon: Image,
    title: '图片生成',
    description: 'AI 生成分镜图片',
    color: 'from-orange-500 to-yellow-500',
    bgColor: 'bg-orange-50',
    lightColor: 'bg-orange-100',
    placeholder: '配置图片生成参数...',
    fields: [
      { key: 'style', label: '画面风格', type: 'select', options: ['动漫', '写实', '水彩', '素描'] },
      { key: 'quality', label: '生成质量', type: 'select', options: ['快速', '标准', '高清', '4K'] },
      { key: 'prompt', label: '额外提示词', type: 'textarea', placeholder: '补充画面细节描述...' },
    ]
  },
  {
    id: 'video',
    icon: Video,
    title: '视频生成',
    description: '图生视频，转场效果',
    color: 'from-red-500 to-pink-500',
    bgColor: 'bg-red-50',
    lightColor: 'bg-red-100',
    placeholder: '配置视频生成参数...',
    fields: [
      { key: 'duration', label: '视频时长(秒)', type: 'number' },
      { key: 'transition', label: '转场效果', type: 'select', options: ['无', '淡入淡出', '滑动', '缩放'] },
      { key: 'fps', label: '帧率', type: 'select', options: ['24fps', '30fps', '60fps'] },
    ]
  },
  {
    id: 'audio',
    icon: Volume2,
    title: '配音合成',
    description: '角色配音，BGM 背景音乐',
    color: 'from-green-500 to-teal-500',
    bgColor: 'bg-green-50',
    lightColor: 'bg-green-100',
    placeholder: '配置配音参数...',
    fields: [
      { key: 'voiceStyle', label: '配音风格', type: 'select', options: ['旁白', '对话', '独白'] },
      { key: 'bgm', label: '背景音乐', type: 'select', options: ['无', '轻松', '紧张', '浪漫', '悬疑'] },
      { key: 'volume', label: '音量调整', type: 'range', min: 0, max: 100 },
    ]
  },
  {
    id: 'export',
    icon: Download,
    title: '预览导出',
    description: '最终预览，导出视频',
    color: 'from-gray-600 to-gray-800',
    bgColor: 'bg-gray-50',
    lightColor: 'bg-gray-100',
    placeholder: '导出设置...',
    fields: [
      { key: 'format', label: '导出格式', type: 'select', options: ['MP4', 'MOV', 'AVI'] },
      { key: 'resolution', label: '分辨率', type: 'select', options: ['720p', '1080p', '4K'] },
    ]
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

  // 计算项目进度
  const completedSteps = WORKFLOW_STEPS.filter(
    step => project[step.id]?.status === 'completed'
  ).length;
  const progress = Math.round((completedSteps / WORKFLOW_STEPS.length) * 100);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!project) {
    return <div className="p-6 text-center text-gray-500">项目不存在</div>;
  }

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
            const isActive = activeStep === step.id;

            return (
              <div
                key={step.id}
                className={`
                  relative rounded-2xl border-2 transition-all
                  ${status === 'completed' ? 'border-green-300 bg-green-50' : 
                    status === 'in_progress' ? 'border-blue-300 bg-blue-50' :
                    isNext ? 'border-purple-300 bg-purple-50' :
                    'border-gray-200 bg-white'}
                `}
              >
                {/* 步骤头部 */}
                <div 
                  onClick={() => setActiveStep(isActive ? null : step.id)}
                  className="p-5 cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg ${step.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 bg-gradient-to-br ${step.color} bg-clip-text`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{step.title}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">{step.description}</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isActive ? 'rotate-180' : ''}`} />
                  </div>

                  {/* 状态标签 */}
                  <div className="flex items-center justify-between mt-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                      {statusInfo.text}
                    </span>
                    {status === 'completed' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {status === 'pending' && isNext && (
                      <span className="text-xs text-purple-600 font-medium">下一步</span>
                    )}
                  </div>
                </div>

                {/* 展开的编辑区域 */}
                {isActive && (
                  <div className="px-5 pb-5 pt-0 border-t border-gray-200 mt-2">
                    <div className="pt-4 space-y-4">
                      {/* 根据步骤类型显示不同的编辑字段 */}
                      {step.id === 'script' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">剧本内容</label>
                            <textarea
                              value={editingContent[step.id] || ''}
                              onChange={(e) => setEditingContent({...editingContent, [step.id]: e.target.value})}
                              placeholder={step.placeholder}
                              rows={8}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                            />
                          </div>
                        </>
                      )}

                      {step.id === 'storyboard' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">分镜数量</label>
                            <input
                              type="number"
                              min="1"
                              value={project[step.id]?.sceneCount || ''}
                              onChange={(e) => {
                                const newData = { ...project, [step.id]: { ...project[step.id], sceneCount: parseInt(e.target.value) || 0 } };
                                setProject(newData);
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">分镜描述</label>
                            <textarea
                              value={editingContent[step.id] || ''}
                              onChange={(e) => setEditingContent({...editingContent, [step.id]: e.target.value})}
                              placeholder={step.placeholder}
                              rows={6}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                            />
                          </div>
                        </>
                      )}

                      {step.id === 'image' && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">画面风格</label>
                            <select
                              value={project[step.id]?.style || '动漫'}
                              onChange={(e) => {
                                setProject({...project, [step.id]: {...project[step.id], style: e.target.value}});
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                              <option value="动漫">动漫风格</option>
                              <option value="写实">写实风格</option>
                              <option value="水彩">水彩风格</option>
                              <option value="素描">素描风格</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">生成质量</label>
                            <select
                              value={project[step.id]?.quality || '标准'}
                              onChange={(e) => {
                                setProject({...project, [step.id]: {...project[step.id], quality: e.target.value}});
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                              <option value="快速">快速</option>
                              <option value="标准">标准</option>
                              <option value="高清">高清</option>
                              <option value="4K">4K</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">额外提示词</label>
                            <textarea
                              value={editingContent[step.id] || ''}
                              onChange={(e) => setEditingContent({...editingContent, [step.id]: e.target.value})}
                              placeholder="补充画面细节描述..."
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                            />
                          </div>
                        </div>
                      )}

                      {step.id === 'video' && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">视频时长（秒）</label>
                            <input
                              type="number"
                              min="1"
                              value={project[step.id]?.duration || ''}
                              onChange={(e) => {
                                setProject({...project, [step.id]: {...project[step.id], duration: parseInt(e.target.value) || 0}});
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">转场效果</label>
                            <select
                              value={project[step.id]?.transition || '无'}
                              onChange={(e) => {
                                setProject({...project, [step.id]: {...project[step.id], transition: e.target.value}});
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                              <option value="无">无</option>
                              <option value="淡入淡出">淡入淡出</option>
                              <option value="滑动">滑动</option>
                              <option value="缩放">缩放</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">帧率</label>
                            <select
                              value={project[step.id]?.fps || '30fps'}
                              onChange={(e) => {
                                setProject({...project, [step.id]: {...project[step.id], fps: e.target.value}});
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                              <option value="24fps">24fps</option>
                              <option value="30fps">30fps</option>
                              <option value="60fps">60fps</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {step.id === 'audio' && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">配音风格</label>
                            <select
                              value={project[step.id]?.voiceStyle || '对话'}
                              onChange={(e) => {
                                setProject({...project, [step.id]: {...project[step.id], voiceStyle: e.target.value}});
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                              <option value="旁白">旁白</option>
                              <option value="对话">对话</option>
                              <option value="独白">独白</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">背景音乐</label>
                            <select
                              value={project[step.id]?.bgm || '无'}
                              onChange={(e) => {
                                setProject({...project, [step.id]: {...project[step.id], bgm: e.target.value}});
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                              <option value="无">无</option>
                              <option value="轻松">轻松</option>
                              <option value="紧张">紧张</option>
                              <option value="浪漫">浪漫</option>
                              <option value="悬疑">悬疑</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">音量</label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={project[step.id]?.volume ?? 80}
                              onChange={(e) => {
                                setProject({...project, [step.id]: {...project[step.id], volume: parseInt(e.target.value)}});
                              }}
                              className="w-full"
                            />
                            <div className="text-xs text-gray-500 text-right">{project[step.id]?.volume ?? 80}%</div>
                          </div>
                        </div>
                      )}

                      {step.id === 'export' && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">导出格式</label>
                            <select
                              value={project[step.id]?.format || 'MP4'}
                              onChange={(e) => {
                                setProject({...project, [step.id]: {...project[step.id], format: e.target.value}});
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                              <option value="MP4">MP4</option>
                              <option value="MOV">MOV</option>
                              <option value="AVI">AVI</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">分辨率</label>
                            <select
                              value={project[step.id]?.resolution || '1080p'}
                              onChange={(e) => {
                                setProject({...project, [step.id]: {...project[step.id], resolution: e.target.value}});
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                              <option value="720p">720p</option>
                              <option value="1080p">1080p</option>
                              <option value="4K">4K</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {/* 操作按钮 */}
                      <div className="flex gap-2 pt-2 border-t border-gray-200">
                        <button
                          onClick={() => handleSaveContent(step.id)}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
                        >
                          <Save className="w-4 h-4" />
                          保存
                        </button>
                        <button
                          onClick={() => {
                            if (status === 'in_progress') {
                              updateProjectStatus(step.id, 'completed');
                            } else {
                              updateProjectStatus(step.id, 'in_progress');
                            }
                          }}
                          className={`flex items-center justify-center gap-1 px-3 py-2 text-sm rounded-lg ${
                            status === 'in_progress' 
                              ? 'bg-green-600 text-white hover:bg-green-700' 
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          <CheckCircle className="w-4 h-4" />
                          {status === 'in_progress' ? '完成' : '开始'}
                        </button>
                        <button
                          onClick={() => handleResetStep(step.id)}
                          className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
                          title="重置"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">添加剧集</h2>
              <button onClick={() => setShowEpisodeModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
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
