// 素材数据模型
export const Material = {
  id: '',
  name: '',
  url: '',
  thumbnail: '',
  type: 'scene', // character | scene | prop | background
  category: '',
  tags: [],
  characterId: null,
  metadata: {
    width: 0,
    height: 0,
    size: 0,
    format: ''
  },
  usedInScenes: [],
  createdAt: new Date().toISOString()
};

// 创建素材实例
export function createMaterial(data) {
  return {
    ...Material,
    ...data,
    id: data.id || crypto.randomUUID(),
    createdAt: data.createdAt || new Date().toISOString()
  };
}
