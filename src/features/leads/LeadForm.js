import { loadLeadDraft, saveLeadDraft, submitLead } from '../../domain/leads.js';

function escapeValue(value = '') {
  return String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function eyeFields(prefix, label, values = {}) {
  return `
    <div class="prescription-eye">
      <div class="prescription-eye__title">${label}</div>
      <label>球镜（S）<input data-field="${prefix}.sphere" value="${escapeValue(values.sphere)}" placeholder="请选择" /></label>
      <label>瞳距（PD）<input data-field="${prefix}.pd" value="${escapeValue(values.pd)}" placeholder="请选择" /></label>
      <label data-astigmatism-field>柱镜（C）<input data-field="${prefix}.cylinder" value="${escapeValue(values.cylinder)}" placeholder="请选择" /></label>
      <label data-astigmatism-field>轴位（A）<input data-field="${prefix}.axis" value="${escapeValue(values.axis)}" placeholder="请选择" /></label>
    </div>
  `;
}

export function renderLeadPage({ frame }) {
  return `
    <section class="page-section lead-page">
      <button class="text-button back-button" type="button" data-action="back-detail">← 返回镜框详情</button>
      <div class="section-heading"><div><span class="eyebrow">填写信息</span><h1>留下配镜需求</h1></div></div>
      <form class="lead-form" data-lead-form>
        <div class="lead-frame-summary"><span>意向镜框</span><strong>${frame.name}</strong></div>
        <div class="lead-card">
          <label class="upload-card"><input type="file" data-report-file accept="image/*,.pdf" /><span class="upload-card__title">上传验光单，无需手动填</span><span class="upload-card__copy">请提供验光师按流程详细检查，并试戴无问题后的验光单。</span><span class="upload-card__file" data-report-name>点击选择图片或 PDF</span></label>
        </div>
        <div class="lead-card">
          <div class="manual-card__heading"><div><strong>无验光单，手动填写视力信息</strong><span>如已上传验光单，则无需重复填写。仅有散光时，填写柱镜和轴位。</span></div><label class="switch-field"><input type="checkbox" data-astigmatism /><span>散光</span></label></div>
          <div class="prescription-grid">${eyeFields('right', '右眼（R）')} ${eyeFields('left', '左眼（L）')}</div>
        </div>
        <div class="lead-card contact-card">
          <label>称呼<input data-field="name" autocomplete="name" placeholder="怎么称呼你" /></label>
          <label>手机号<input data-field="phone" autocomplete="tel" inputmode="tel" placeholder="方便商家联系你" /></label>
          <label>备注<textarea data-field="note" rows="3" placeholder="颜色、预算或其他需求"></textarea></label>
        </div>
        <p class="form-status" data-form-status></p>
        <button class="primary-button lead-submit" type="submit">提交配镜需求</button>
      </form>
    </section>
  `;
}

function setField(container, field, value) {
  const element = container.querySelector(`[data-field="${field}"]`);
  if (element && value !== undefined && value !== null) element.value = value;
}

export function mountLeadForm(container, { frame, onSubmitted } = {}) {
  const form = container.querySelector('[data-lead-form]');
  const draft = loadLeadDraft() ?? {};
  const prescription = draft.prescription ?? {};
  setField(container, 'name', draft.name);
  setField(container, 'phone', draft.phone);
  setField(container, 'note', draft.note);
  setField(container, 'right.sphere', prescription.right?.sphere);
  setField(container, 'right.pd', prescription.right?.pd);
  setField(container, 'right.cylinder', prescription.right?.cylinder);
  setField(container, 'right.axis', prescription.right?.axis);
  setField(container, 'left.sphere', prescription.left?.sphere);
  setField(container, 'left.pd', prescription.left?.pd);
  setField(container, 'left.cylinder', prescription.left?.cylinder);
  setField(container, 'left.axis', prescription.left?.axis);
  const astigmatism = container.querySelector('[data-astigmatism]');
  astigmatism.checked = Boolean(prescription.hasAstigmatism);
  const reportName = container.querySelector('[data-report-name]');
  if (prescription.reportFileName) reportName.textContent = prescription.reportFileName;

  const updateAstigmatismFields = () => {
    container.querySelectorAll('[data-astigmatism-field] input').forEach((input) => {
      input.disabled = !astigmatism.checked;
    });
  };
  updateAstigmatismFields();

  const readForm = () => ({
    name: container.querySelector('[data-field="name"]').value.trim(),
    phone: container.querySelector('[data-field="phone"]').value.trim(),
    note: container.querySelector('[data-field="note"]').value.trim(),
    prescription: {
      hasAstigmatism: astigmatism.checked,
      reportFileName: reportName.dataset.fileName ?? '',
      right: {
        sphere: container.querySelector('[data-field="right.sphere"]').value.trim(),
        pd: container.querySelector('[data-field="right.pd"]').value.trim(),
        cylinder: container.querySelector('[data-field="right.cylinder"]').value.trim(),
        axis: container.querySelector('[data-field="right.axis"]').value.trim(),
      },
      left: {
        sphere: container.querySelector('[data-field="left.sphere"]').value.trim(),
        pd: container.querySelector('[data-field="left.pd"]').value.trim(),
        cylinder: container.querySelector('[data-field="left.cylinder"]').value.trim(),
        axis: container.querySelector('[data-field="left.axis"]').value.trim(),
      },
    },
  });

  const saveDraft = () => saveLeadDraft({ skuId: frame.skuId, tenantId: frame.tenantId, ...readForm() });
  form.addEventListener('input', saveDraft);
  astigmatism.addEventListener('change', () => { updateAstigmatismFields(); saveDraft(); });
  container.querySelector('[data-report-file]').addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    reportName.textContent = file.name;
    reportName.dataset.fileName = file.name;
    saveDraft();
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const status = container.querySelector('[data-form-status]');
    try {
      const lead = submitLead({ tenantId: frame.tenantId, skuId: frame.skuId, ...readForm() });
      status.textContent = `已收到，我们会尽快联系你。编号 ${lead.leadId}`;
      status.dataset.tone = 'success';
      onSubmitted?.(lead);
    } catch (error) {
      status.textContent = error.message;
      status.dataset.tone = 'error';
    }
  });
}
