import { useState, useEffect, useRef } from 'react';
import { 
  Upload, Search, Filter, Grid, List, Trash2, 
  Image, FolderOpen, Sparkles, X, Check, Tag
} from 'lucide-react';

// 素材类型配置
const MATERIAL_TYPES = [
  { value: 'character', label: '角色', icon: '👤', color: 'bg-pink-500' },
  { value: 'scene', label: '场景', icon: '🏠', color: 'bg-blue-500' },
  { value: 'prop', label: '道具', icon: '🎁', color: 'bg-amber-500' },
  { value: 'background', label: '背景', icon: '🎨', color: 'bg-purple-500' }
];

// API 配置
const API_BASE = 'http://localhost:3001/api';

export default function MaterialLibrary() {
  // 状态
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeType, setActiveType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // grid | list

  // 上传表单
  const [uploadForm, setUploadForm] = useState({
    name: '',
    type: 'scene',
    category: '',
    tags: ''
  });

  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // 加载素材列表
  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeType !== 'all') params.append('type', activeType);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`${API_BASE}/materials?${params}`);
      const data = await res.json();
      if (data.success) {
        setMaterials(data.data);
      }
    } catch (err) {
      console.error('获取素材失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [activeType, searchQuery]);

  // 处理文件选择
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // 上传素材
  const handleUpload = async () => {
    if (!selectedFile || !uploadForm.name) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', uploadForm.name);
      formData.append('type', uploadForm.type);
      formData.append('category', uploadForm.category);
      formData.append('tags', uploadForm.tags);

      const res = await fetch(`${API_BASE}/materials`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.success) {
        setShowUploadModal(false);
        setUploadForm({ name: '', type: 'scene', category: '', tags: '' });
        setSelectedFile(null);
        setPreviewUrl(null);
        fetchMaterials();
      }
    } catch (err) {
      console.error('上传失败:', err);
    } finally {
      setUploading(false);
    }
  };

  // 删除素材
  const handleDelete = async (id) => {
    if (!confirm('确定要删除这个素材吗？')) return;

    try {
      const res = await fetch(`${API_BASE}/materials/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        fetchMaterials();
        setSelectedMaterials(prev => prev.filter(m => m !== id));
      }
    } catch (err) {
      console.error('删除失败:', err);
    }
  };

  // 切换选择
  const toggleSelect = (id) => {
    setSelectedMaterials(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (!confirm(`确定要删除选中的 ${selectedMaterials.length} 个素材吗？`)) return;

    for (const id of selectedMaterials) {
      await handleDelete(id);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 顶部工具栏 */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-blue-500" />
            素材库
          </h1>
          <div className="flex items-center gap-3">
            {selectedMaterials.length > 0 && (
              <button
                onClick={handleBatchDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                删除选中 ({selectedMaterials.length})
              </button>
            )}
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              上传素材
            </button>
          </div>
        </div>
      </div>

      {/* 类型筛选 */}
      <div className="bg-white border-b px-6 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveType('all')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
              activeType === 'all' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            全部
          </button>
          {MATERIAL_TYPES.map(type => (
            <button
              key={type.value}
              onClick={() => setActiveType(type.value)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
                activeType === type.value 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{type.icon}</span>
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="bg-white border-b px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索素材名称或标签..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2 border rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-200' : ''}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-200' : ''}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 素材列表 */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : materials.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Image className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg">暂无素材</p>
            <p className="text-sm">点击"上传素材"添加第一个素材</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {materials.map(material => (
              <MaterialCard
                key={material.id}
                material={material}
                selected={selectedMaterials.includes(material.id)}
                onSelect={() => toggleSelect(material.id)}
                onDelete={() => handleDelete(material.id)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {materials.map(material => (
              <MaterialListItem
                key={material.id}
                material={material}
                selected={selectedMaterials.includes(material.id)}
                onSelect={() => toggleSelect(material.id)}
                onDelete={() => handleDelete(material.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 上传弹窗 */}
      {showUploadModal && (
        <UploadModal
          uploadForm={uploadForm}
          setUploadForm={setUploadForm}
          selectedFile={selectedFile}
          previewUrl={previewUrl}
          onFileSelect={handleFileSelect}
          onClose={() => {
            setShowUploadModal(false);
            setSelectedFile(null);
            setPreviewUrl(null);
          }}
          onUpload={handleUpload}
          uploading={uploading}
        />
      )}
    </div>
  );
}

// 素材卡片组件
function MaterialCard({ material, selected, onSelect, onDelete }) {
  const typeInfo = MATERIAL_TYPES.find(t => t.value === material.type) || MATERIAL_TYPES[1];

  return (
    <div className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden transition ${
      selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent hover:border-gray-200'
    }`}>
      {/* 图片 */}
      <div className="relative aspect-square bg-gray-100">
        <img
          src={`http://localhost:3001${material.url}`}
          alt={material.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23e5e7eb" width="100" height="100"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12">无图片</text></svg>';
          }}
        />
        {/* 选择框 */}
        <button
          onClick={onSelect}
          className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
            selected 
              ? 'bg-blue-500 border-blue-500 text-white' 
              : 'bg-white/80 border-gray-300 hover:border-blue-500'
          }`}
        >
          {selected && <Check className="w-4 h-4" />}
        </button>
        {/* 类型标签 */}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs text-white ${typeInfo.color}`}>
          {typeInfo.icon} {typeInfo.label}
        </div>
      </div>
      {/* 信息 */}
      <div className="p-3">
        <h3 className="font-medium text-gray-800 truncate">{material.name}</h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">
            {material.usedInScenes?.length || 0} 次引用
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1 text-gray-400 hover:text-red-500 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        {/* 标签 */}
        {material.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {material.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// 素材列表项组件
function MaterialListItem({ material, selected, onSelect, onDelete }) {
  const typeInfo = MATERIAL_TYPES.find(t => t.value === material.type) || MATERIAL_TYPES[1];

  return (
    <div className={`bg-white rounded-lg shadow-sm border-2 p-4 flex items-center gap-4 transition ${
      selected ? 'border-blue-500' : 'border-transparent hover:border-gray-200'
    }`}>
      <button
        onClick={onSelect}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
          selected 
            ? 'bg-blue-500 border-blue-500 text-white' 
            : 'border-gray-300 hover:border-blue-500'
        }`}
      >
        {selected && <Check className="w-4 h-4" />}
      </button>
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        <img
          src={`http://localhost:3001${material.url}`}
          alt={material.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23e5e7eb" width="100" height="100"/></svg>';
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-800">{material.name}</h3>
          <span className={`px-2 py-0.5 rounded text-xs text-white ${typeInfo.color}`}>
            {typeInfo.icon} {typeInfo.label}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {material.tags?.join(' / ') || '无标签'}
        </p>
      </div>
      <div className="text-sm text-gray-400">
        {material.usedInScenes?.length || 0} 次引用
      </div>
      <button
        onClick={onDelete}
        className="p-2 text-gray-400 hover:text-red-500 transition"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
}

// 上传弹窗组件
function UploadModal({ uploadForm, setUploadForm, selectedFile, previewUrl, onFileSelect, onClose, onUpload, uploading }) {
  const typeInfo = MATERIAL_TYPES.find(t => t.value === uploadForm.type) || MATERIAL_TYPES[1];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg mx-4 shadow-2xl">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">上传素材</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* 内容 */}
        <div className="p-6 space-y-4">
          {/* 预览区 */}
          <div 
            className="border-2 border-dashed rounded-xl aspect-video flex flex-col items-center justify-center cursor-pointer transition hover:border-blue-400"
            onClick={() => document.getElementById('file-input').click()}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="预览" className="max-h-full object-contain" />
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-gray-500">点击或拖拽上传图片</p>
                <p className="text-xs text-gray-400 mt-1">支持 JPG、PNG、WebP</p>
              </>
            )}
          </div>
          <input
            id="file-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileSelect}
          />

          {/* 表单 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">素材名称</label>
              <input
                type="text"
                value={uploadForm.name}
                onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                placeholder="请输入素材名称"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">素材类型</label>
              <div className="grid grid-cols-4 gap-2">
                {MATERIAL_TYPES.map(type => (
                  <button
                    key={type.value}
                    onClick={() => setUploadForm({ ...uploadForm, type: type.value })}
                    className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition ${
                      uploadForm.type === type.value 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xl">{type.icon}</span>
                    <span className="text-xs">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">分类标签</label>
              <input
                type="text"
                value={uploadForm.category}
                onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                placeholder="如：室内、室外、古风"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">搜索标签</label>
              <input
                type="text"
                value={uploadForm.tags}
                onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                placeholder="多个标签用逗号分隔"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        {/* 底部 */}
        <div className="px-6 py-4 border-t bg-gray-50 rounded-b-xl">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              取消
            </button>
            <button
              onClick={onUpload}
              disabled={!selectedFile || !uploadForm.name || uploading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  上传中...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  上传
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
