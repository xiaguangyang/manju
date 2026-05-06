import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, FolderOpen, Image, Layers, Palette, 
  Settings, ChevronDown, Plus, Film
} from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
  const navigate = useNavigate();
  const [showProjects, setShowProjects] = useState(false);
  const [projects, setProjects] = useState([]);

  // 获取项目列表
  useState(() => {
    fetch('http://localhost:3001/api/projects')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProjects(data.data || []);
        }
      })
      .catch(() => {});
  }, []);

  const navItems = [
    { path: '/', icon: Home, label: '首页', exact: true },
    { path: '/materials', icon: Palette, label: '素材库' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-gray-100">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <Film className="w-5 h-5 text-white" />
        </div>
        <span className="ml-3 font-bold text-gray-900">漫剧工坊</span>
      </div>

      {/* 导航 */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-purple-50 text-purple-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}

        {/* 项目下拉 */}
        <div>
          <button
            onClick={() => setShowProjects(!showProjects)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <FolderOpen className="w-5 h-5" />
            <span className="font-medium flex-1 text-left">剧目</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showProjects ? 'rotate-180' : ''}`} />
          </button>
          
          {showProjects && (
            <div className="ml-4 mt-1 space-y-1">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => navigate(`/project/${project.id}`)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                >
                  <Layers className="w-4 h-4" />
                  <span className="truncate">{project.name}</span>
                </button>
              ))}
              {projects.length === 0 && (
                <p className="px-3 py-2 text-sm text-gray-400">暂无剧目</p>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* 底部设置 */}
      <div className="p-3 border-t border-gray-100">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
          <Settings className="w-5 h-5" />
          <span className="font-medium">设置</span>
        </button>
      </div>
    </aside>
  );
}
