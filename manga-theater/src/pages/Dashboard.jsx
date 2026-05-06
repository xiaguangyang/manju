import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '../store'
import {
  FileText,
  Layout,
  Image,
  Video,
  Mic,
  Download,
  Play,
  Clock,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Zap,
} from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const { steps, scenes, images, audio, currentStep, resetProject } = useProjectStore()

  // 统计数据
  const stats = [
    {
      label: '分镜数量',
      value: scenes.length,
      icon: Layout,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
    {
      label: '生成图片',
      value: images.length,
      icon: Image,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-500',
    },
    {
      label: '配音片段',
      value: audio.length,
      icon: Mic,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-500',
    },
    {
      label: '完成进度',
      value: `${Math.round((currentStep / 5) * 100)}%`,
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-500',
    },
  ]

  // 快捷操作
  const quickActions = [
    {
      title: '新建剧本',
      description: '开始创作新的漫剧剧本',
      icon: FileText,
      path: '/script',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      title: '设计分镜',
      description: '创建和管理漫剧分镜',
      icon: Layout,
      path: '/storyboard',
      color: 'from-cyan-500 to-blue-500',
    },
    {
      title: '生成图片',
      description: 'AI生成漫剧图片',
      icon: Image,
      path: '/images',
      color: 'from-pink-500 to-rose-500',
    },
    {
      title: '生成视频',
      description: '图生视频制作',
      icon: Video,
      path: '/video',
      color: 'from-amber-500 to-orange-500',
    },
  ]

  return (
    <div className="space-y-8">
      {/* 顶部欢迎区 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium text-white/80">AI漫剧创作平台</span>
          </div>
          <h1 className="text-3xl font-display font-bold mb-2">
            欢迎来到漫剧工坊
          </h1>
          <p className="text-white/80 mb-6 max-w-xl">
            从剧本到视频，一站式AI漫剧创作。跟随创作流程，完成你的第一部AI漫剧作品。
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/script')}
              className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-white/90 transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              开始创作
            </button>
            <button
              onClick={resetProject}
              className="px-6 py-3 bg-white/20 text-white font-medium rounded-xl hover:bg-white/30 transition-all"
            >
              重置项目
            </button>
          </div>
        </div>

        {/* 装饰元素 */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -right-10 bottom-0 w-60 h-60 bg-purple-500/30 rounded-full blur-2xl" />

        {/* 动画装饰 */}
        <div className="absolute right-20 top-10 animate-float">
          <div className="w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center">
            <Video className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="panel p-6 card-hover"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 创作流程进度 */}
      <div className="panel p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">创作流程</h3>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = {
              FileText,
              Layout,
              Image,
              Video,
              Mic,
              Download,
            }[step.icon] || FileText

            const isCompleted = index < currentStep
            const isCurrent = index === currentStep
            const isPending = index > currentStep

            return (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => navigate(`/${step.id === 'script' ? 'script' : step.id}`)}
                  className={`
                    flex flex-col items-center gap-3 p-4 rounded-2xl transition-all
                    ${isCurrent
                      ? 'bg-indigo-50 ring-2 ring-indigo-500'
                      : isCompleted
                        ? 'bg-green-50 hover:bg-green-100'
                        : 'bg-gray-50 hover:bg-gray-100 opacity-60'
                    }
                  `}
                >
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center
                    ${isCurrent
                      ? 'bg-indigo-500 text-white'
                      : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }
                  `}>
                    {isCompleted ? (
                      <span className="text-lg">✓</span>
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  <span className={`
                    text-sm font-medium
                    ${isCurrent ? 'text-indigo-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}
                  `}>
                    {step.name}
                  </span>
                </button>

                {index < steps.length - 1 && (
                  <div className={`
                    w-16 h-0.5 mx-2
                    ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 快捷操作 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">快捷操作</h3>
        <div className="grid grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className="panel p-6 card-hover text-left group"
              >
                <div className={`
                  w-12 h-12 rounded-xl bg-gradient-to-br ${action.color}
                  flex items-center justify-center mb-4
                  transform group-hover:scale-110 transition-transform
                `}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{action.title}</h4>
                <p className="text-sm text-gray-500">{action.description}</p>
                <div className="mt-4 flex items-center text-indigo-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  前往 <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 技巧提示 */}
      <div className="panel p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">创作建议</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• 使用清晰的故事大纲可以帮助AI更好地理解你的创作意图</p>
              <p>• 每个分镜控制在3-5秒的视频时长效果最佳</p>
              <p>• 角色描述越详细，生成的图片一致性越高</p>
              <p>• 记得为对话选择合适的配音音色</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
