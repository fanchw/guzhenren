import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import React from 'react';
import { normalizeState, readState, writeState, nextScene, DEFAULT_STATE } from '../src/state.js';

test('损坏或被禁用的偏好存储不会阻断皮肤', () => {
  assert.deepEqual(readState({ getItem: () => '{broken' }), DEFAULT_STATE);
  assert.deepEqual(readState({ getItem() { throw new Error('denied'); } }), DEFAULT_STATE);
  assert.doesNotThrow(() => writeState({ setItem() { throw new Error('denied'); } }, {}));
  assert.deepEqual(normalizeState({ scene: '../../secret', motion: 'false', reading: false, extra: 1 }), { ...DEFAULT_STATE, reading: false });
});

test('四景轮换回到起点', () => {
  let id = 'river';
  const seen = [];
  for (let i = 0; i < 4; i++) { seen.push(id); id = nextScene(id); }
  assert.equal(new Set(seen).size, 4);
  assert.equal(id, 'river');
});

test('真实构建产物延迟执行，并注册可清理的主题和槽', async () => {
  let definition;
  const sandbox = { window: { __ModuleLoader__: { load(value) { definition = value; } } } };
  vm.runInNewContext(await readFile(new URL('../lib/client.js', import.meta.url), 'utf8'), sandbox);
  assert.equal(definition.id, 'guzhenren');
  const plugin = definition.factory(id => { assert.equal(id, 'react'); return React; });
  assert.equal(typeof plugin.apply, 'function');
  const cleanups = [];
  let themes = 0, slots = 0, locales = 0;
  plugin.apply({
    effect(fn) { cleanups.push(fn()); },
    locale: { register(id, dictionaries) { assert.equal(id, 'guzhenren'); assert.ok(dictionaries.zh.open); locales++; return () => locales--; } },
    theme: { overrideTokens(id, tokens) {
      assert.equal(id, 'guzhenren');
      assert.equal(tokens['--dsw-alias-bg-base'].light, 'transparent');
      assert.ok(tokens['--dsw-specific-sidebar-fill'].dark);
      themes++;
      return () => themes--;
    } },
    slots: {
      inject(name, fn) { assert.ok(['shell.overlay', 'sidebar.footer.action'].includes(name)); cleanups.push(fn()); },
      register(meta, Component) {
        assert.equal(meta.id, 'guzhenren');
        assert.equal(typeof Component, 'function'); slots++;
        return () => slots--;
      },
    },
  });
  assert.equal(themes, 1); assert.equal(slots, 2);
  for (const dispose of cleanups.reverse()) dispose();
  assert.equal(themes, 0); assert.equal(slots, 0); assert.equal(locales, 0);
});
