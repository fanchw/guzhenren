import React from 'react';
import { Skin, FooterControl, words } from './skin.jsx';

export const inject = ['slots', 'theme', 'locale'];
export function apply(ctx) {
  ctx.effect(() => ctx.locale.register('guzhenren', words));
  ctx.effect(() => ctx.theme.overrideTokens('guzhenren', {
    '--dsw-alias-bg-base': { light: 'transparent', dark: 'transparent' },
    '--dsw-specific-sidebar-fill': { light: 'rgba(236,240,231,.90)', dark: 'rgba(16,27,31,.87)' },
  }));
  ctx.slots.inject('shell.overlay', () => ctx.slots.register(
    { name: 'shell.overlay', id: 'guzhenren', locale: 'guzhenren' },
    () => <Skin showControls={false} />,
  ));
  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register(
    { name: 'sidebar.footer.action', id: 'guzhenren', locale: 'guzhenren' },
    ({ t }) => <FooterControl text={Object.fromEntries(Object.keys(words.zh).map(key => [key, t(key)]))} />,
  ));
}
