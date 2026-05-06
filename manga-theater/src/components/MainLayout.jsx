import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { useProjectStore } from '../store'

export default function MainLayout() {
  const { steps, currentStep } = useProjectStore()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 侧边栏 */}
      <Sidebar steps={steps} currentStep={currentStep} />

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col ml-64">
        <Header />

        {/* 页面内容 */}
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
