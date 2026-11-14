const draftKey = 'eyewear-lead-draft';
const leadsKey = 'eyewear-leads';
const memoryValues = new Map();
const memoryStorage = {
  getItem: (key) => memoryValues.get(key) ?? null,
  setItem: (key, value) => memoryValues.set(key, String(value)),
  removeItem: (key) => memoryValues.delete(key),
};

function getStorage() {
  return globalThis.localStorage ?? memoryStorage;
}

export function saveLeadDraft(draft) {
  const current = loadLeadDraft() ?? {};
  getStorage().setItem(draftKey, JSON.stringify({ ...current, ...draft }));
}

export function loadLeadDraft() {
  const raw = getStorage().getItem(draftKey);
  return raw ? JSON.parse(raw) : null;
}

export function submitLead(lead) {
  if (!lead?.phone?.trim()) throw new Error('手机号不能为空');
  const now = new Date().toISOString();
  const savedLead = {
    ...lead,
    leadId: lead.leadId ?? `lead-${Date.now()}`,
    createdAt: lead.createdAt ?? now,
    prescription: lead.prescription ?? { hasAstigmatism: false, right: {}, left: {} },
  };
  const saved = JSON.parse(getStorage().getItem(leadsKey) ?? '[]');
  getStorage().setItem(leadsKey, JSON.stringify([...saved, savedLead]));
  getStorage().removeItem(draftKey);
  return savedLead;
}
