import React, { useEffect, useMemo, useState } from 'react';
import { scenes } from './scenes.js';
import { nextScene, readState, writeState } from './state.js';
import css from './skin.css';

export const words = {
  zh: { open: '场景设置', close: '收起', title: '四时 · 入画', subtitle: '蛊真人 · 动态皮肤', motion: '环境动效', motionHint: '雾、霜雪与微光', reading: '阅读模式', readingHint: '压低背景，让文字更清楚', rotate: '自动换景', rotateHint: '每 30 秒切换，阅读时暂停', reduced: '系统已开启减少动态效果', scene: '选择场景', footer: '同人意象 · 非原著引文', on: '开', off: '关' },
  en: { open: 'Scene settings', close: 'Close', title: 'Four painted worlds', subtitle: 'Gu Zhen Ren · Living skin', motion: 'Ambient motion', motionHint: 'Mist, snow and drifting light', reading: 'Reading mode', readingHint: 'Dim artwork for clear text', rotate: 'Scene rotation', rotateHint: 'Every 30s; paused while reading', reduced: 'Reduced motion is enabled by your system', scene: 'Choose a scene', footer: 'Fan artwork · original captions', on: 'On', off: 'Off' },
};

export function useAppearance(canRotate = true) {
  const storage = () => { try { return window.localStorage; } catch { return undefined; } };
  const [state, setState] = useState(() => readState(storage()));
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [visible, setVisible] = useState(() => !document.hidden);
  const [imageUrls, setImageUrls] = useState({});
  useEffect(() => {
    // 大图不能直接与 CSS var() 拼进声明，浏览器会拒绝超长值。
    // 用本地 Blob URL，不联网，卸载时释放。
    const urls = Object.fromEntries(scenes.map(s => {
      const bytes = Uint8Array.from(atob(s.image.split(',')[1]), c => c.charCodeAt(0));
      return [s.id, URL.createObjectURL(new Blob([bytes], { type: 'image/png' }))];
    }));
    setImageUrls(urls);
    return () => Object.values(urls).forEach(url => URL.revokeObjectURL(url));
  }, []);
  const resolvedScenes = useMemo(() => scenes.map(s => ({ ...s, image: imageUrls[s.id] || '' })), [imageUrls]);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(media.matches);
    const visibility = () => setVisible(!document.hidden);
    media.addEventListener('change', change);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      media.removeEventListener('change', change);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);
  useEffect(() => {
    const sync = event => setState(current => ({ ...current, ...event.detail }));
    window.addEventListener('guzhenren:appearance-change', sync);
    return () => window.removeEventListener('guzhenren:appearance-change', sync);
  }, []);
  useEffect(() => { writeState(storage(), state); }, [state]);
  useEffect(() => {
    if (!canRotate || !state.rotate || state.reading || reduced || !visible) return;
    const timer = window.setInterval(() => window.dispatchEvent(new CustomEvent('guzhenren:appearance-change', { detail: { scene: nextScene(state.scene) } })), 30000);
    return () => window.clearInterval(timer);
  }, [canRotate, state.scene, state.rotate, state.reading, reduced, visible]);
  const update = patch => window.dispatchEvent(new CustomEvent('guzhenren:appearance-change', { detail: patch }));
  return { state, update, reduced, visible, scenes: resolvedScenes, scene: resolvedScenes.find(s => s.id === state.scene) };
}

export function SceneLayers({ appearance }) {
  const { scene, state, reduced, visible } = appearance;
  const [previous, setPrevious] = useState(scene);
  useEffect(() => {
    const timer = window.setTimeout(() => setPrevious(scene), 1000);
    return () => window.clearTimeout(timer);
  }, [scene]);
  const moving = state.motion && !reduced && visible;
  // 背景写在组件拥有的样式节点中；卸载时由 React 一并移除。
  // 不替换宿主 DOM，不读取消息，也不修改宿主的持久主题设置。
  const darkVeil = `linear-gradient(90deg,rgba(12,22,26,.90),rgba(17,27,31,${state.reading ? '.90' : '.48'}) 46%,rgba(17,27,31,${state.reading ? '.83' : '.12'}) 76%,rgba(12,22,26,.4))`;
  const lightVeil = `linear-gradient(90deg,rgba(241,243,236,.97),rgba(241,243,236,${state.reading ? '.94' : '.64'}) 46%,rgba(241,243,236,${state.reading ? '.88' : '.3'}) 76%,rgba(241,243,236,.6))`;
  const layer = (s, pseudo, z) => `body:has(.guzhenren-root)::${pseudo}{content:"";position:fixed;inset:0;z-index:${z};pointer-events:none;background-image:var(--gz-veil),linear-gradient(90deg,#172126 calc(100% - ${s.id === 'river' ? '150' : '66.667'}vh),transparent calc(100% - ${s.id === 'river' ? '150' : '66.667'}vh + 150px)),url("${s.image}");background-size:cover,cover,auto 100%;background-position:center,center,right top;background-repeat:no-repeat;background-color:#172126;}`;
  const background = `body:has(.guzhenren-root){isolation:isolate;--gz-veil:${lightVeil};}
    body[data-ds-dark-theme]:has(.guzhenren-root){--gz-veil:${darkVeil};}
    ${layer(scene, 'before', -1)}${layer(previous, 'after', -2)}
    @keyframes gz-reveal-${scene.id}{from{opacity:0}to{opacity:1}}
    body:has(.guzhenren-root)::before{animation:${!reduced && visible ? `gz-reveal-${scene.id} .85s ease-out` : 'none'}${moving ? ',gz-breathe 32s ease-in-out infinite alternate' : ''};}`;
  return <>
    <style>{css}</style><style>{background}</style>
    <div className="gz-particles" data-effect={scene.effect} data-moving={moving} data-reading={state.reading} aria-hidden="true">
      {Array.from({ length: 24 }, (_, i) => <i key={i} style={{ '--x': `${(i * 43 + 13) % 100}%`, '--delay': `${-i * 1.83}s`, '--duration': `${18 + i % 7 * 3}s`, '--size': `${2 + i % 4}px` }} />)}
      {scene.effect === 'mist' && <div className="gz-mist" />}
    </div>
  </>;
}

function Toggle({ label, hint, value, onChange }) {
  return <div className="gz-setting"><div><strong>{label}</strong><small>{hint}</small></div>
    <button type="button" role="switch" aria-label={label} aria-checked={value} className="gz-switch" onClick={() => onChange(!value)}><span /></button>
  </div>;
}

export function SceneControls({ appearance, text = words.zh, initiallyOpen = false, compact = false }) {
  const [open, setOpen] = useState(initiallyOpen);
  const { scene, state, update, reduced } = appearance;
  const trigger = React.useRef(null);
  useEffect(() => {
    if (!open) return;
    const escape = e => { if (e.key === 'Escape') { setOpen(false); trigger.current?.focus(); } };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [open]);
  return <div className={compact ? "gz-controls gz-controls--compact" : "gz-controls"} style={{ '--gz-accent': scene.color }}>
    <button ref={trigger} type="button" className="gz-trigger" aria-label={text.open} aria-expanded={open} aria-controls="gz-scene-panel" onClick={() => setOpen(!open)}>
      <span className="gz-seal">蛊</span><span>{scene.title}</span><span aria-hidden="true">{open ? '−' : '＋'}</span>
    </button>
    {open && <section id="gz-scene-panel" className="gz-panel" aria-label={text.open}>
      <div className="gz-panel-header"><div><small>{text.subtitle}</small><h2>{text.title}</h2></div><button type="button" className="gz-close" aria-label={text.close} onClick={() => { setOpen(false); trigger.current?.focus(); }}>×</button></div>
      <div className="gz-scenes" role="group" aria-label={text.scene}>
        {appearance.scenes.map(s => <button type="button" key={s.id} className="gz-scene" aria-pressed={s.id === state.scene} onClick={() => update({ scene: s.id })} style={{ backgroundImage: `linear-gradient(0deg,rgba(8,17,21,.92),transparent 85%),url("${s.image}")`, backgroundPosition: s.position }}>
          <span className="gz-scene-number">{s.number}</span><strong>{s.person}</strong><small>{s.chapter}</small>
        </button>)}
      </div>
      <Toggle label={text.motion} hint={text.motionHint} value={state.motion} onChange={motion => update({ motion })} />
      <Toggle label={text.reading} hint={text.readingHint} value={state.reading} onChange={reading => update({ reading })} />
      <Toggle label={text.rotate} hint={text.rotateHint} value={state.rotate} onChange={rotate => update({ rotate })} />
      {reduced && <p className="gz-reduced">{text.reduced}</p>}
      <div className="gz-panel-footer">{text.footer}</div>
    </section>}
  </div>;
}

export function Skin({ text, showControls = true }) {
  const appearance = useAppearance();
  return <div className="guzhenren-root" style={{ pointerEvents: 'none' }}>
    <SceneLayers appearance={appearance} />{showControls && <SceneControls appearance={appearance} text={text} />}
  </div>;
}

export function FooterControl({ text }) {
  const appearance = useAppearance(false);
  return <SceneControls appearance={appearance} text={text} compact />;
}
