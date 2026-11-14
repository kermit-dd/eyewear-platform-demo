import test from 'node:test';
import assert from 'node:assert/strict';
import { renderApp } from '../src/app.js';

test('renders the demo merchant name', () => {
  const markup = renderApp();
  assert.match(markup, /丹阳眼镜样板店/);
});
