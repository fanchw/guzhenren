export const SCENE_IDS = ['river', 'ice', 'strength', 'wanderer'];
export const DEFAULT_STATE = Object.freeze({ scene: 'river', motion: true, reading: true, rotate: false });
export const STORAGE_KEY = 'guzhenren:appearance:v1';

// 只接受本皮肤的外观偏好，不读取宿主配置或会话。
export function normalizeState(value) {
  const input = value && typeof value === 'object' ? value : {};
  return {
    scene: SCENE_IDS.includes(input.scene) ? input.scene : DEFAULT_STATE.scene,
    motion: typeof input.motion === 'boolean' ? input.motion : DEFAULT_STATE.motion,
    reading: typeof input.reading === 'boolean' ? input.reading : DEFAULT_STATE.reading,
    rotate: typeof input.rotate === 'boolean' ? input.rotate : DEFAULT_STATE.rotate,
  };
}

export function readState(storage) {
  try { return normalizeState(JSON.parse(storage.getItem(STORAGE_KEY))); }
  catch { return { ...DEFAULT_STATE }; }
}

export function writeState(storage, value) {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(normalizeState(value))); }
  catch { /* 禁用本地存储时，当前页面仍可使用。 */ }
}

export function nextScene(id) {
  return SCENE_IDS[(SCENE_IDS.indexOf(id) + 1) % SCENE_IDS.length];
}
