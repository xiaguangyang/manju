import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, Play, ChevronRight, CheckCircle, Clock, AlertCircle,
  Edit2, Trash2, ArrowLeft, BookOpen, Film, Image, Video, Music, Download
} from 'lucide-react';

const API_BASE = 'http://localhost:3001/api';

// 工作流程步骤定义
const WORKFLOW_STEPS = [
  { id: 'script', title: '剧本创作', description: '编写剧本内容，管理对话和旁白', icon: BookOpen, color: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-100' },
  { id: 'storyboard', title: '分镜设计', description: '创建和管理分镜，设置镜头参数', icon: Film, color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-100' },
  { id: 'imageGeneration', title: '图片生成', description: 'AI生成分镜图片', icon: Image, color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-100' },
  { id: 'videoGeneration', title: '视频生成', description: '图生视频，转场效果', icon: Video, color: 'from-orange-500 to-amber-500', bgColor: 'bg-orange-100' },
  { id: 'audioMixing', title: '配音合成', description: '角色配音，BGM背景音乐', icon: Music, color: 'from-pink-500 to-rose-500', bgColor: 'bg-pink-100' },
  { id: 'export', title: '预览导出', description: '最终预览，导出视频', icon: Download, color: 'from-gray-600 to-gray-800', bgColor: 'bg-gray-100' },
];

export default function EpisodeDetail() {
  const { projectId, episodeId } = useParams();
  const navigate = useNavigate();
  const [episode, setEpisode] = useState(null);
  const [project, setProject] = useState(null);
  const [scenes, setScenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(null);
  const [editingContent, setEditingContent] = useState({});

  // 加载数据
  useEffect(() => {
    loadData();
  }, [projectId, episodeId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 并行请求项目和剧集
      const [projectRes, episodeRes] = await Promise.all([
        fetch(`${API_BASE}/projects/${projectId}`),
        fetch(`${API_BASE}/projects/${projectId}/episodes/${episodeId}`)
      ]);

      const projectData = await projectRes.json();
      const episodeData = await episodeRes.json();

      if (projectData.success) setProject(projectData.data);
      if (episodeData.success) {
        setEpisode(episodeData.data);
        // 初始化编辑内容
        setEditingContent({
          script: episodeData.data.script || '',
        });
      }

      // 加载分镜
      const scenesRes = await fetch(`${API_BASE}/projects/${projectId}/episodes/${episodeId}/scenes`);
      const scenesData = await scenesRes.json();
      if (scenesData.success) setScenes(scenesData.data || []);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 获取状态信息
  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { text: '待处理', color: 'bg-gray-100 text-gray-600' },
      in_progress: { text: '进行中', color: 'bg-blue-100 text-blue-600' },
      completed: { text: '已完成', color: 'bg-green-100 text-green-600' },
    };
    return statusMap[status] || statusMap.pending;
  };

  // 保存步骤内容
  const handleSaveStep = async (stepId) => {
    const content = editingContent[stepId] || '';
    
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}/episodes/${episodeId}/steps/${stepId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, status: 'completed' })
      });
      
      const data = await res.json();
      if (data.success) {
        setEpisode({ ...episode, [stepId]: content });
        setActiveStep(null);
        loadData(); // 重新加载刷新状态
      }
    } catch (err) {
      console.error('保存失败:', err);
    }
  };

  // 计算进度
  const completedSteps = WORKFLOW_STEPS.filter(
    step => episode?.[step.id]?.status === 'completed'
  ).length;
  const progress = Math.round((completedSteps / WORKFLOW_STEPS.length) * 100);

  if (loading || !episode) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 顶部导航 */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/project/${projectId}`)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{episode.title}</h1>
          <p className="text-sm text-gray-500">{project?.name} · 第{episode.episodeNumber}集</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusInfo(episode.status).color}`}>
          {getStatusInfo(episode.status).text}
        </span>
      </div>

      {/* 创作流程步骤 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Play className="w-5 h-5 text-purple-600" />
            创作流程
          </h2>
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm text-gray-500">{progress}%</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {WORKFLOW_STEPS.map((step, index) => {
            const Icon = step.icon;
            const stepData = episode[step.id] || {};
            const status = stepData.status || 'pending';
            const statusInfo = getStatusInfo(status);
            const isNext = status === 'pending' && 
              (index === 0 || episode[WORKFLOW_STEPS[index - 1].id]?.status === 'completed');
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
                    <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${isActive ? 'rotate-90' : ''}`} />
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
                      {step.id === 'script' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">剧本内容</label>
                            <textarea
                              value={editingContent.script || ''}
                              onChange={(e) => setEditingContent({...editingContent, script: e.target.value})}
                              placeholder="输入剧本内容..."
                              rows={8}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveStep('script')}
                              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                            >
                              保存剧本
                            </button>
                          </div>
                        </>
                      )}

                      {step.id === 'storyboard' && (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600">
                            当前分镜数：{scenes.length}
                          </p>
                          <button
                            onClick={() => {/* TODO: 打开分镜列表 */}}
                            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                          >
                            管理分镜
                          </button>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveStep('storyboard')}
                              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                            >
                              标记完成
                            </button>
                          </div>
                        </div>
                      )}

                      {step.id === 'imageGeneration' && (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600">
                            {scenes.length > 0 ? `已生成 ${scenes.filter(s => s.image).length}/${scenes.length} 张图片` : '请先完成分镜设计'}
                          </p>
                          <button
                            onClick={() => handleSaveStep('imageGeneration')}
                            disabled={scenes.length === 0}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:opacity-50"
                          >
                            开始生成
                          </button>
                        </div>
                      )}

                      {step.id === 'videoGeneration' && (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600">
                            需要先生成图片
                          </p>
                          <button
                            onClick={() => handleSaveStep('videoGeneration')}
                            disabled={!episode.imageGeneration?.status}
                            className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm disabled:opacity-50"
                          >
                            开始生成
                          </button>
                        </div>
                      )}

                      {step.id === 'audioMixing' && (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600">
                            配置角色配音和背景音乐
                          </p>
                          <button
                            onClick={() => handleSaveStep('audioMixing')}
                            className="w-full px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 text-sm"
                          >
                            配置配音
                          </button>
                        </div>
                      )}

                      {step.id === 'export' && (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600">
                            预览并导出最终视频
                          </p>
                          <div className="flex gap-2">
                            <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                              预览
                            </button>
                            <button className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 text-sm">
                              导出
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 分镜列表 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Film className="w-5 h-5 text-purple-600" />
            分镜管理
          </h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
            <Plus className="w-4 h-4" />
            添加分镜
          </button>
        </div>

        {scenes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Film className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>暂无分镜</p>
            <p className="text-sm mt-1">在剧本创作完成后添加分镜</p>
          </div>
        ) : (
          <div className="space-y-3">
            {scenes.map((scene, index) => (
              <div key={scene.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{scene.shotNumber || `镜头 ${index + 1}`}</h3>
                  <p className="text-sm text-gray-500 truncate">{scene.script || '暂无描述'}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  scene.image ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {scene.image ? '已生成' : '待生成'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
