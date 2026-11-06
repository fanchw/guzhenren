import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SceneLayers, SceneControls, useAppearance } from '../src/skin.jsx';
import { scenes } from '../src/scenes.js';
import css from './preview.css';

function App() {
  const appearance = useAppearance();
  const { scene, update } = appearance;
  const [chat, setChat] = useState(false);
  const [draft, setDraft] = useState('');
  const [message, setMessage] = useState('');
  const [enabled, setEnabled] = useState(true);
  const send = e => {
    e.preventDefault();
    if (!draft.trim()) return;
    setMessage(draft.trim()); setDraft(''); setChat(true); update({ reading: true });
  };
  return <>
    <style>{css}</style>
    {enabled && <div className="guzhenren-root" style={{ pointerEvents: 'none' }}><SceneLayers appearance={appearance} /></div>}
    <div className="preview-app" style={{ '--accent': scene.color }}>
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="蛊真人皮肤首页"><span className="brand-seal">蛊</span><span>蛊真人<small>GU ZHEN REN</small></span></a>
        <button className="new-chat" onClick={() => { setChat(false); setMessage(''); update({ reading: false }); }}><span>＋</span> 开启新篇</button>
        <div className="side-label">山河画卷 <span>04</span></div>
        <nav className="scene-nav" aria-label="场景导航">{scenes.map(s => <button key={s.id} className={scene.id === s.id ? 'selected' : ''} onClick={() => update({ scene: s.id })}><span>{s.number}</span><div>{s.title}<small>{s.person} · {s.chapter}</small></div><i /></button>)}</nav>
        <div className="side-note"><span>一念之间，山河流转。</span><small>四幅画，一方天地。</small></div>
        {enabled && <SceneControls appearance={appearance} compact />}
        <div className="side-bottom"><span className="status-dot" /> 本地独立预览<span>v0.1</span></div>
      </aside>
      <main>
        <header><div className="breadcrumb">四时入画 <span>/</span> {scene.title}</div><div className="header-actions"><div className="mobile-scene-control">{enabled && <SceneControls appearance={appearance} compact />}</div><span className="preview-badge">PREVIEW</span><button aria-label="切换浅色预览" onClick={() => document.body.toggleAttribute('data-ds-dark-theme')}>◐</button><button onClick={() => setEnabled(!enabled)}>{enabled ? '停用预览' : '启用皮肤'}</button></div></header>
        <div className="main-content">
          {!chat ? <section className="welcome">
            <div className="eyebrow"><span /> GU ZHEN REN · {scene.en.toUpperCase()}</div>
            <h1>心有所向<span>步履不息</span><i>蛊</i></h1>
            <p>{scene.caption}</p>
            <div className="welcome-divider" />
            <div className="intro">落笔于此，续写你的篇章。</div>
            <div className="suggestions">{['梳理今日计划', '记录一个灵感', '开启新的探索'].map((s, i) => <button key={s} onClick={() => setDraft(s)}><span>{['⌘', '✦', '↗'][i]}</span>{s}</button>)}</div>
          </section> : <section className="conversation" aria-label="模拟聊天">
            <div className="chat-heading">一段新的旅程 <span>界面演示</span></div>
            <div className="user-message">{message}</div>
            <article className="assistant-message"><div className="assistant-avatar">蛊</div><div><small>预览回复</small><p>这里展示皮肤在聊天时的阅读效果。</p><p>背景已进入阅读模式，动态粒子也会变淡。你可以继续切换场景，检查文字、输入框与画面的协调程度。</p><blockquote>此页面没有连接模型，不会发送消息或读取 DSH 会话。</blockquote></div></article>
          </section>}
          <form className="composer" onSubmit={send}><label className="sr-only" htmlFor="draft">输入预览消息</label><textarea id="draft" rows="2" value={draft} placeholder="落笔，开启你的篇章…" onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(e); } }} /><div className="composer-footer"><span>✦ <b>独立预览</b><span className="model-divider">|</span>仅演示界面</span><button type="submit" aria-label="发送预览消息" disabled={!draft.trim()}>↑</button></div></form>
          <p className="preview-disclaimer">同人主题 · 图片与文案为创作演绎 · 不连接真实 DSH profile</p>
        </div>
        <div className="scene-caption" aria-hidden="true"><span>{scene.number}</span><strong>{scene.person}</strong><small>{scene.chapter}</small></div>
        <footer><span>GU ZHEN REN</span><div>{scenes.map(s => <button key={s.id} aria-label={`切换到${s.title}`} aria-pressed={scene.id === s.id} onClick={() => update({ scene: s.id })} />)}</div><span>{String(scenes.findIndex(s => s.id === scene.id) + 1).padStart(2, '0')} / 04</span></footer>
      </main>
    </div>
  </>;
}

createRoot(document.getElementById('root')).render(<App />);
