import { useProjectStore } from '../store'
import { Settings, Bell, User, Plus } from 'lucide-react'

export default function Header() {
  const { project } = useProjectStore()

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
      {/* 左侧：项目信息 */}
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {project.title || '新建漫剧项目'}
          </h2>
          <p className="text-sm text-gray-500">
            {project.title ? '项目进行中' : '开始你的创作之旅'}
          </p>
        </div>
      </div>

      {/* 右侧：操作按钮 */}
      <div className="flex items-center gap-3">
        <button className="btn-ghost flex items-center gap-2">
          <Plus className="w-4 h-4" />
          新建项目
        </button>

        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5 text-gray-500" />
        </button>

        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Settings className="w-5 h-5 text-gray-500" />
        </button>

        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-medium">
          U
        </div>
      </div>
    </header>
  )
}
