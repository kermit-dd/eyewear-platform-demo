import test from 'node:test';
import assert from 'node:assert/strict';
import { loadLeadDraft, saveLeadDraft, submitLead } from '../../src/domain/leads.js';
import { renderLeadPage } from '../../src/features/leads/LeadForm.js';

function createStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
}

test('rejects a lead without a phone number', () => {
  globalThis.localStorage = createStorage();
  assert.throws(() => submitLead({ tenantId: 'tenant-a', skuId: 'frame-a', name: '小林', phone: '', note: '', prescription: {} }), /手机号/);
});

test('restores a saved lead draft', () => {
  globalThis.localStorage = createStorage();
  saveLeadDraft({ skuId: 'frame-a', name: '小林', prescription: { hasAstigmatism: true } });
  assert.deepEqual(loadLeadDraft(), { skuId: 'frame-a', name: '小林', prescription: { hasAstigmatism: true } });
});

test('submits a lead with prescription metadata and report filename', () => {
  globalThis.localStorage = createStorage();
  const lead = submitLead({
    tenantId: 'tenant-a',
    skuId: 'frame-a',
    name: '小林',
    phone: '13800000000',
    note: '想看黑色',
    prescription: {
      hasAstigmatism: true,
      reportFileName: '验光单.jpg',
      right: { sphere: '-2.00', pd: '32', cylinder: '-0.50', axis: '180' },
      left: { sphere: '-1.75', pd: '31', cylinder: '-0.25', axis: '170' },
    },
  });
  assert.equal(lead.tenantId, 'tenant-a');
  assert.equal(lead.prescription.right.pd, '32');
  assert.equal(lead.prescription.reportFileName, '验光单.jpg');
});

test('lead form contains report upload and both eye prescription fields', () => {
  const html = renderLeadPage({ frame: { skuId: 'frame-a', name: '复古圆框' } });
  assert.match(html, /上传验光单/);
  assert.match(html, /右眼（R）/);
  assert.match(html, /左眼（L）/);
  assert.match(html, /球镜（S）/);
  assert.match(html, /瞳距（PD）/);
  assert.match(html, /柱镜（C）/);
  assert.match(html, /轴位（A）/);
});
