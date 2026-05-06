import { NavLink, useLocation } from 'react-router-dom'
import { useProjectStore } from '../store'
import {
  Home,
  FileText,
  Layout,
  Image,
  Video,
  Mic,
  Download,
  Sparkles,
  FolderOpen,
} from 'lucide-react'

const iconMap = {
  FileText,
  Layout,
  Image,
  Video,
  Mic,
  Download,
}

export default function Sidebar({ steps, currentStep }) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-50">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-manga flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-gray-900">漫剧工坊</h1>
            <p className="text-xs text-gray-500">AI漫剧创作平台</p>
          </div>
        </div>
      </div>

      {/* 导航链接 */}
      <nav className="flex-1 py-6 px-4 space-y-1">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span className="font-medium">首页概览</span>
        </NavLink>

        <div className="pt-4 pb-2">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            创作流程
          </p>
        </div>

        {steps.map((step, index) => {
          const Icon = iconMap[step.icon] || FileText
          const isActive = index === currentStep
          const isPast = index < currentStep
          const isClickable = index <= currentStep || index === currentStep + 1

          return (
            <NavLink
              key={step.id}
              to={`/${step.id === 'script' ? 'script' : step.id}`}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
                ${isActive
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                  : isPast
                    ? 'bg-green-50 text-green-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold
                ${isActive
                  ? 'bg-white/20 text-white'
                  : isPast
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }
              `}>
                {isPast ? '✓' : index + 1}
              </div>
              <span className="font-medium">{step.name}</span>
            </NavLink>
          )
        })}

        <div className="pt-4 pb-2">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            资源管理
          </p>
        </div>

        <NavLink
          to="/materials"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`
          }
        >
          <FolderOpen className="w-5 h-5" />
          <span className="font-medium">素材库</span>
        </NavLink>
      </nav>

      {/* 底部信息 */}
      <div className="p-4 border-t border-gray-100">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-4 text-white">
          <p className="text-sm font-medium mb-1">创作提示</p>
          <p className="text-xs text-white/80">
            使用结构化的剧本格式可以大幅提升生成效率
          </p>
        </div>
      </div>
    </aside>
  )
}
