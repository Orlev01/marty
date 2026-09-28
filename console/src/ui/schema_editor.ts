/**
 * schema_editor.ts — Generates the CSS and JS for the interactive schema editor.
 *
 * Ported from schema_editor_ui.py. Returns CSS and JS strings to inject into the HTML.
 */

export function getEditorCss(): string {
    return `
/* Schema Editor - Interactive */
.se { display: flex; flex-direction: column; gap: 16px; }
.se-toolbar { display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 2px solid var(--surface2); margin-bottom: 4px; }
.se-toolbar h2 { margin: 0; }
.se-toolbar-actions { display: flex; gap: 8px; }
.se-body { display: grid; grid-template-columns: 220px 1fr; gap: 20px; min-height: 400px; }

/* Sidebar */
.se-sidebar { display: flex; flex-direction: column; gap: 4px; background: var(--surface); border-radius: var(--radius); padding: 8px; border: 1px solid var(--surface2); }
.se-sidebar-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: var(--surface); border-radius: var(--radius); cursor: pointer; font-size: 13px; border-left: 3px solid transparent; transition: all 0.15s; }
.se-sidebar-item:hover { background: var(--surface2); }
.se-sidebar-item.active { border-left-color: var(--accent); background: var(--surface2); }
.se-sidebar-item .name { font-weight: 600; }
.se-sidebar-item .cnt { color: var(--text2); font-size: 11px; background: var(--bg); padding: 1px 6px; border-radius: 10px; }
.se-sidebar-add { padding: 10px 12px; border: 1px dashed var(--surface2); border-radius: var(--radius); cursor: pointer; font-size: 13px; color: var(--text2); text-align: center; transition: all 0.15s; }
.se-sidebar-add:hover { border-color: var(--accent); color: var(--accent); }

/* Detail panel */
.se-detail-panel { min-width: 0; overflow-x: auto; }
.se-detail { display: flex; flex-direction: column; gap: 16px; }
.se-detail-empty { display: flex; align-items: center; justify-content: center; color: var(--text2); font-size: 14px; }
.se-meta { background: var(--surface); padding: 16px; border-radius: var(--radius); border: 1px solid var(--surface2); }
.se-meta-row { display: flex; gap: 12px; align-items: center; margin-bottom: 8px; }
.se-meta-row:last-child { margin-bottom: 0; }
.se-meta-label { color: var(--text2); font-size: 12px; min-width: 80px; }

/* Inline editing */
.se-editable { cursor: text; padding: 2px 4px; border-radius: 3px; border: 1px solid transparent; transition: border-color 0.15s; }
.se-editable:hover { border-color: var(--surface2); }
.se-input { background: var(--bg); border: 1px solid var(--accent); color: var(--text); padding: 4px 8px; border-radius: 4px; font-size: 13px; font-family: inherit; width: 100%; outline: none; }
.se-input:focus { box-shadow: 0 0 0 2px rgba(59,130,246,0.3); }
.se-input-sm { padding: 2px 6px; font-size: 12px; }
.se-select { background: var(--bg); border: 1px solid var(--surface2); color: var(--text); padding: 4px 8px; border-radius: 4px; font-size: 12px; cursor: pointer; outline: none; }
.se-select:focus { border-color: var(--accent); }
.se-name-input { font-size: 16px; font-weight: 600; }
.se-desc-input { font-size: 13px; color: var(--text2); }

/* View config */
.se-view-config { display: flex; gap: 16px; flex-wrap: wrap; background: var(--surface); padding: 12px 16px; border-radius: var(--radius); border: 1px solid var(--surface2); }
.se-view-config-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text2); }

/* Field list */
.se-fields-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px; border-bottom: 1px solid var(--surface2); margin-bottom: 4px; }
.se-fields-section { border: 1px solid var(--surface2); border-radius: var(--radius); padding: 16px; background: var(--surface); }
.se-field { display: flex; gap: 10px; padding: 14px 16px; background: var(--bg); border-radius: 8px; font-size: 13px; position: relative; border: 1px solid var(--surface2); transition: border-color 0.15s; }
.se-field:hover { border-color: rgba(59,130,246,0.5); }
.se-field-grip { display: flex; flex-direction: column; gap: 2px; padding-top: 4px; flex-shrink: 0; }
.se-field-grip button { background: none; border: none; color: var(--text2); cursor: pointer; font-size: 10px; padding: 1px 3px; line-height: 1; border-radius: 2px; }
.se-field-grip button:hover { color: var(--accent); background: var(--surface); }
.se-field-main { flex: 1; min-width: 0; }
.se-field-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
.se-field-name { font-weight: 600; font-size: 14px; }
.se-field-type { font-family: monospace; font-size: 11px; color: var(--text2); background: var(--surface); padding: 2px 8px; border-radius: 3px; }
.se-field-req { font-size: 10px; color: var(--accent); text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; background: rgba(59,130,246,0.15); padding: 2px 6px; border-radius: 3px; }
.se-field-id { font-size: 11px; color: var(--text2); font-family: monospace; }
.se-field-props { display: grid; grid-template-columns: 80px 1fr; gap: 4px 12px; font-size: 12px; }
.se-field-prop-label { color: var(--text2); }
.se-field-prop-value { color: var(--text); }
.se-field-opts { display: flex; gap: 4px; flex-wrap: wrap; }
.se-field-ai { color: var(--accent); opacity: 0.9; line-height: 1.4; }
.se-field-actions { position: absolute; top: 10px; right: 10px; display: flex; gap: 2px; opacity: 0.4; transition: opacity 0.15s; }
.se-field:hover .se-field-actions { opacity: 1; }
.se-field-default { font-size: 11px; color: var(--text2); }
.se-field-divider { height: 1px; background: var(--surface2); margin: 2px 0; grid-column: 1 / -1; opacity: 0.5; }

/* Tags for select options */
.se-tag { display: inline-flex; align-items: center; gap: 3px; padding: 1px 6px; background: var(--surface); border-radius: 3px; font-size: 11px; }
.se-tag-remove { cursor: pointer; color: var(--text2); font-size: 9px; }
.se-tag-remove:hover { color: var(--red); }
.se-tag-add { cursor: pointer; color: var(--accent); padding: 1px 6px; border: 1px dashed var(--surface2); border-radius: 3px; font-size: 11px; }
.se-tag-add:hover { border-color: var(--accent); }

/* Buttons */
.se-btn { padding: 6px 14px; border-radius: 6px; font-size: 13px; cursor: pointer; border: none; font-family: inherit; transition: all 0.15s; }
.se-btn-primary { background: var(--accent); color: white; }
.se-btn-primary:hover { filter: brightness(1.1); }
.se-btn-primary.pulse { animation: pulse 2s infinite; }
.se-btn-secondary { background: var(--surface2); color: var(--text); }
.se-btn-secondary:hover { filter: brightness(1.2); }
.se-btn-danger { background: transparent; color: var(--red); border: 1px solid var(--red); }
.se-btn-danger:hover { background: var(--red); color: white; }
.se-btn-icon { background: none; border: none; color: var(--text2); cursor: pointer; padding: 4px; font-size: 14px; border-radius: 4px; }
.se-btn-icon:hover { background: var(--surface2); color: var(--text); }
.se-btn-icon.danger:hover { color: var(--red); }
.se-add-field { width: 100%; padding: 10px; border: 1px dashed var(--surface2); border-radius: 6px; cursor: pointer; font-size: 13px; color: var(--text2); background: transparent; text-align: center; font-family: inherit; }
.se-add-field:hover { border-color: var(--accent); color: var(--accent); }
.se-delete-schema { margin-top: 16px; padding: 12px 16px; border: 1px solid var(--surface2); border-radius: var(--radius); background: rgba(220,38,38,0.05); }

/* Modal */
.se-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 1000; display: flex; align-items: center; justify-content: center; }
.se-modal { background: var(--surface); border-radius: 12px; padding: 24px; max-width: 520px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
.se-modal h3 { margin-bottom: 16px; }
.se-modal-field { margin-bottom: 12px; }
.se-modal-field label { display: block; font-size: 12px; color: var(--text2); margin-bottom: 4px; }
.se-modal-field .se-input { width: 100%; }
.se-modal-field .hint { font-size: 11px; color: var(--text2); margin-top: 2px; }
.se-modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
.se-modal-check { display: flex; align-items: center; gap: 8px; }
.se-modal-check input[type="checkbox"] { accent-color: var(--accent); }

/* Apply modal */
.se-apply-tabs { display: flex; gap: 4px; margin-bottom: 12px; }
.se-apply-tab { padding: 6px 12px; border-radius: 4px; font-size: 12px; cursor: pointer; background: var(--bg); border: none; color: var(--text2); font-family: inherit; }
.se-apply-tab.active { background: var(--accent); color: white; }
.se-apply-json { background: var(--bg); padding: 12px; border-radius: 6px; max-height: 400px; overflow: auto; font-family: monospace; font-size: 11px; white-space: pre; line-height: 1.4; }
.se-apply-instructions { font-size: 12px; color: var(--text2); margin-top: 12px; line-height: 1.6; }

/* Diff */
.se-diff-item { padding: 6px 10px; border-radius: 4px; margin-bottom: 4px; font-size: 12px; }
.se-diff-add { background: rgba(22,163,106,0.15); border-left: 3px solid var(--green); }
.se-diff-remove { background: rgba(220,38,38,0.15); border-left: 3px solid var(--red); }
.se-diff-change { background: rgba(202,138,4,0.15); border-left: 3px solid var(--yellow); }
.se-diff-sub { margin-left: 16px; }

/* Toast */
.se-toast { position: fixed; bottom: 20px; right: 20px; padding: 10px 16px; background: var(--green); color: white; border-radius: 6px; font-size: 13px; z-index: 2000; animation: fadeInUp 0.3s; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }

@media (max-width: 768px) {
    .se-body { grid-template-columns: 1fr; }
    .se-sidebar { flex-direction: row; overflow-x: auto; gap: 4px; }
    .se-sidebar-item { white-space: nowrap; }
}
`;
}


export function getEditorJs(schemasJs: string, teamJs: string, recordsCountJs: string, overviewJs: string, portfolioJs: string): string {
    return `
// Schema Editor Data
const SCHEMAS_DATA = ${schemasJs};
const TEAM_DATA = ${teamJs};
const RECORDS_COUNT = ${recordsCountJs};
const OVERVIEW_DATA = ${overviewJs};
const PORTFOLIO_DATA = ${portfolioJs};
const FIELD_TYPES = ['text','date','number','boolean','select','multi_select','member','member[]'];

// State
const SE = {
    schemas: JSON.parse(JSON.stringify(SCHEMAS_DATA)),
    original: JSON.parse(JSON.stringify(SCHEMAS_DATA)),
    overview: JSON.parse(JSON.stringify(OVERVIEW_DATA)),
    originalOverview: JSON.parse(JSON.stringify(OVERVIEW_DATA)),
    portfolio: JSON.parse(JSON.stringify(PORTFOLIO_DATA)),
    originalPortfolio: JSON.parse(JSON.stringify(PORTFOLIO_DATA)),
    sel: null,
    dirty: false
};

function toId(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').substring(0, 30);
}
function toCamelCase(name) {
    return name.replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()).replace(/^[A-Z]/, c => c.toLowerCase()).replace(/[^a-zA-Z0-9]/g, '');
}
function markDirty() {
    SE.dirty = true;
    const btn = document.getElementById('se-apply-btn');
    if (btn) btn.classList.add('pulse');
}
function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'se-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
}

// ===== CRUD =====
function seCreateSchema(name, desc, viewType) {
    const id = toId(name);
    if (!id) return alert('Name must contain at least one alphanumeric character');
    if (SE.schemas.schemas[id]) return alert('Schema ID "' + id + '" already exists');
    SE.schemas.schemas[id] = {
        name: name, icon: 'circle', description: desc || '',
        fields: [],
        dashboardView: { type: viewType || 'table' }
    };
    SE.sel = id;
    markDirty();
    renderSE();
}
function seDeleteSchema(id) {
    // Check for orphaned ref: fields in other schemas
    const refs = [];
    for (const [sid, s] of Object.entries(SE.schemas.schemas)) {
        if (sid === id) continue;
        for (const f of s.fields) {
            if (f.type === 'ref:' + id || f.type === 'ref:' + id + '[]') {
                refs.push(s.name + '.' + f.name);
            }
        }
    }
    if (refs.length && !confirm('Warning: these fields reference this schema and will become orphaned:\\n' + refs.join('\\n') + '\\n\\nContinue?')) return;
    delete SE.schemas.schemas[id];
    if (SE.sel === id) SE.sel = Object.keys(SE.schemas.schemas)[0] || null;
    markDirty();
    renderSE();
}
function seUpdateSchema(id, key, val) {
    if (key === 'name') SE.schemas.schemas[id].name = val;
    else if (key === 'description') SE.schemas.schemas[id].description = val;
    else if (key.startsWith('view.')) {
        const vk = key.split('.')[1];
        SE.schemas.schemas[id].dashboardView[vk] = val || undefined;
        if (!val) delete SE.schemas.schemas[id].dashboardView[vk];
    }
    markDirty();
    renderSE();
}
function seAddField(schemaId, field) {
    SE.schemas.schemas[schemaId].fields.push(field);
    markDirty();
    renderSE();
}
function seUpdateField(schemaId, idx, key, val) {
    const f = SE.schemas.schemas[schemaId].fields[idx];
    const coreKeys = ['id', 'name', 'type'];
    if ((val === '' || val === undefined) && !coreKeys.includes(key)) delete f[key];
    else if (val !== '' && val !== undefined) f[key] = val;
    markDirty();
    renderSE();
}
function seRemoveField(schemaId, idx) {
    SE.schemas.schemas[schemaId].fields.splice(idx, 1);
    markDirty();
    renderSE();
}
function seMoveField(schemaId, from, dir) {
    const fields = SE.schemas.schemas[schemaId].fields;
    const to = from + dir;
    if (to < 0 || to >= fields.length) return;
    [fields[from], fields[to]] = [fields[to], fields[from]];
    markDirty();
    renderSE();
}

// ===== MODALS =====
function showModal(html) {
    hideModal(); // prevent stacking
    const ov = document.createElement('div');
    ov.className = 'se-modal-overlay';
    ov.id = 'se-modal-overlay';
    ov.innerHTML = '<div class="se-modal" role="dialog" aria-modal="true">' + html + '</div>';
    ov.addEventListener('click', (e) => { if (e.target === ov) hideModal(); });
    SE._escHandler = (e) => { if (e.key === 'Escape') hideModal(); };
    document.addEventListener('keydown', SE._escHandler);
    document.body.appendChild(ov);
    const first = ov.querySelector('input,select,textarea');
    if (first) first.focus();
}
function hideModal() {
    const ov = document.getElementById('se-modal-overlay');
    if (ov) ov.remove();
    if (SE._escHandler) { document.removeEventListener('keydown', SE._escHandler); SE._escHandler = null; }
}

function showCreateSchemaModal() {
    showModal(\`
        <h3>New Schema</h3>
        <div class="se-modal-field"><label for="se-new-name">Name</label><input class="se-input" id="se-new-name" placeholder="e.g. Risk Assessment"></div>
        <div class="se-modal-field"><label for="se-new-id">ID (auto-generated)</label><input class="se-input se-input-sm" id="se-new-id" readonly style="opacity:0.6"></div>
        <div class="se-modal-field"><label for="se-new-desc">Description</label><input class="se-input" id="se-new-desc" placeholder="What does this track?"></div>
        <div class="se-modal-field"><label for="se-new-view">Dashboard View</label>
            <select class="se-select" id="se-new-view"><option value="table">Table</option><option value="cards">Cards</option><option value="list">List</option><option value="timeline">Timeline</option></select>
        </div>
        <div class="se-modal-actions">
            <button class="se-btn se-btn-secondary" onclick="hideModal()">Cancel</button>
            <button class="se-btn se-btn-primary" onclick="doCreateSchema()">Create</button>
        </div>
    \`);
    document.getElementById('se-new-name').addEventListener('input', (e) => {
        document.getElementById('se-new-id').value = toId(e.target.value);
    });
}

function doCreateSchema() {
    const name = document.getElementById('se-new-name').value.trim();
    if (!name) return alert('Name is required');
    const desc = document.getElementById('se-new-desc').value.trim();
    const view = document.getElementById('se-new-view').value;
    hideModal();
    seCreateSchema(name, desc, view);
}

function showAddFieldModal(schemaId) {
    const refOptions = Object.keys(SE.schemas.schemas).map(s => '<option value="ref:' + s + '">ref:' + s + '</option><option value="ref:' + s + '[]">ref:' + s + '[]</option>').join('');
    const typeOptions = FIELD_TYPES.map(t => '<option value="' + t + '">' + t + '</option>').join('') + refOptions;
    showModal(\`
        <h3>Add Field</h3>
        <div class="se-modal-field"><label for="se-f-name">Name</label><input class="se-input" id="se-f-name" placeholder="e.g. Due Date"></div>
        <div class="se-modal-field"><label for="se-f-id">ID (auto-generated)</label><input class="se-input se-input-sm" id="se-f-id" readonly style="opacity:0.6"></div>
        <div class="se-modal-field"><label for="se-f-type">Type</label><select class="se-select" id="se-f-type" style="width:100%">\${typeOptions}</select></div>
        <div class="se-modal-check"><input type="checkbox" id="se-f-req"><label for="se-f-req">Required</label></div>
        <div class="se-modal-field" id="se-f-opts-wrap" style="display:none"><label for="se-f-opts">Options (comma-separated)</label><input class="se-input" id="se-f-opts" placeholder="option1, option2, option3"></div>
        <div class="se-modal-field"><label for="se-f-default">Default Value</label><input class="se-input se-input-sm" id="se-f-default" placeholder="Optional"></div>
        <div class="se-modal-field"><label for="se-f-ai">AI Instruction</label><textarea class="se-input" id="se-f-ai" rows="2" placeholder="How should Marty populate this field?"></textarea></div>
        <div class="se-modal-actions">
            <button class="se-btn se-btn-secondary" onclick="hideModal()">Cancel</button>
            <button class="se-btn se-btn-primary" onclick="doAddField('\${schemaId}')">Add Field</button>
        </div>
    \`);
    document.getElementById('se-f-name').addEventListener('input', (e) => {
        document.getElementById('se-f-id').value = toCamelCase(e.target.value);
    });
    document.getElementById('se-f-type').addEventListener('change', (e) => {
        document.getElementById('se-f-opts-wrap').style.display = (e.target.value === 'select' || e.target.value === 'multi_select') ? '' : 'none';
    });
}

function doAddField(schemaId) {
    const name = document.getElementById('se-f-name').value.trim();
    if (!name) return alert('Name is required');
    const fieldId = document.getElementById('se-f-id').value || toCamelCase(name);
    if (!fieldId) return alert('Could not generate a valid field ID. Use a name with alphanumeric characters.');
    const field = {
        id: fieldId,
        name: name,
        type: document.getElementById('se-f-type').value
    };
    if (document.getElementById('se-f-req').checked) field.required = true;
    const opts = document.getElementById('se-f-opts').value.trim();
    if (opts && (field.type === 'select' || field.type === 'multi_select')) {
        field.options = opts.split(',').map(o => o.trim()).filter(Boolean);
    }
    const def = document.getElementById('se-f-default').value.trim();
    if (def) field['default'] = def;
    const ai = document.getElementById('se-f-ai').value.trim();
    if (ai) field.aiInstruction = ai;
    // Check for duplicate ID
    const existing = SE.schemas.schemas[schemaId].fields.map(f => f.id);
    if (existing.includes(field.id)) return alert('Field ID "' + field.id + '" already exists in this schema');
    hideModal();
    seAddField(schemaId, field);
}

function showEditFieldModal(schemaId, idx) {
    const f = SE.schemas.schemas[schemaId].fields[idx];
    const refOptions = Object.keys(SE.schemas.schemas).map(s => '<option value="ref:' + escHtml(s) + '">ref:' + escHtml(s) + '</option><option value="ref:' + escHtml(s) + '[]">ref:' + escHtml(s) + '[]</option>').join('');
    const typeOptions = FIELD_TYPES.map(t => '<option value="' + t + '"' + (t === f.type ? ' selected' : '') + '>' + t + '</option>').join('') + refOptions.replace('value="' + escHtml(f.type) + '"', 'value="' + escHtml(f.type) + '" selected');
    const optsVisible = (f.type === 'select' || f.type === 'multi_select') ? '' : 'display:none';
    showModal(\`
        <h3>Edit Field: \${escHtml(f.name)}</h3>
        <div class="se-modal-field"><label for="se-ef-name">Name</label><input class="se-input" id="se-ef-name" value="\${escHtml(f.name)}"></div>
        <div class="se-modal-field"><label for="se-ef-id">ID</label><input class="se-input se-input-sm" id="se-ef-id" value="\${escHtml(f.id)}" readonly style="opacity:0.6"></div>
        <div class="se-modal-field"><label for="se-ef-type">Type</label><select class="se-select" id="se-ef-type" style="width:100%">\${typeOptions}</select></div>
        <div class="se-modal-check"><input type="checkbox" id="se-ef-req"\${f.required ? ' checked' : ''}><label for="se-ef-req">Required</label></div>
        <div class="se-modal-field" id="se-ef-opts-wrap" style="\${optsVisible}"><label for="se-ef-opts">Options (comma-separated)</label><input class="se-input" id="se-ef-opts" value="\${f.options ? escHtml(f.options.join(', ')) : ''}" placeholder="option1, option2"></div>
        <div class="se-modal-field"><label for="se-ef-default">Default Value</label><input class="se-input se-input-sm" id="se-ef-default" value="\${f['default'] ? escHtml(String(f['default'])) : ''}" placeholder="Optional"></div>
        <div class="se-modal-field"><label for="se-ef-ai">AI Instruction</label><textarea class="se-input" id="se-ef-ai" rows="3" placeholder="How should Marty populate this field?">\${escHtml(f.aiInstruction || '')}</textarea></div>
        <div class="se-modal-actions">
            <button class="se-btn se-btn-secondary" onclick="hideModal()">Cancel</button>
            <button class="se-btn se-btn-primary" onclick="doEditField('\${schemaId}', \${idx})">Save Changes</button>
        </div>
    \`);
    document.getElementById('se-ef-type').addEventListener('change', (e) => {
        document.getElementById('se-ef-opts-wrap').style.display = (e.target.value === 'select' || e.target.value === 'multi_select') ? '' : 'none';
    });
}

function doEditField(schemaId, idx) {
    const name = document.getElementById('se-ef-name').value.trim();
    if (!name) return alert('Name is required');
    const f = SE.schemas.schemas[schemaId].fields[idx];
    f.name = name;
    f.type = document.getElementById('se-ef-type').value;
    f.required = document.getElementById('se-ef-req').checked || undefined;
    if (!f.required) delete f.required;
    const opts = document.getElementById('se-ef-opts').value.trim();
    if (opts && (f.type === 'select' || f.type === 'multi_select')) {
        f.options = opts.split(',').map(o => o.trim()).filter(Boolean);
    } else {
        delete f.options;
    }
    const def = document.getElementById('se-ef-default').value.trim();
    if (def) f['default'] = def; else delete f['default'];
    const ai = document.getElementById('se-ef-ai').value.trim();
    if (ai) f.aiInstruction = ai; else delete f.aiInstruction;
    hideModal();
    markDirty();
    renderSE();
}

function getExportData() {
    return {
        schemas: SE.schemas,
        configUpdates: {
            overview: SE.overview,
            portfolio: SE.portfolio
        }
    };
}

function showApplyModal() {
    const exportData = getExportData();
    const schemasJson = JSON.stringify(exportData.schemas, null, 2);
    const configJson = JSON.stringify(exportData.configUpdates, null, 2);
    const diff = computeDiff();
    const isServerMode = window.location.protocol !== 'file:';
    const actionsHtml = isServerMode
        ? '<button class="se-btn se-btn-primary" id="se-save-btn" onclick="saveToServer()">Save &amp; Rebuild</button>' +
          '<button class="se-btn se-btn-secondary" onclick="hideModal()">Cancel</button>'
        : '<button class="se-btn se-btn-primary" onclick="copySchemas()">Copy schemas.json</button>' +
          '<button class="se-btn se-btn-secondary" onclick="copyConfig()">Copy config updates</button>' +
          '<button class="se-btn se-btn-secondary" onclick="hideModal()">Close</button>';
    const instructionsHtml = isServerMode
        ? '<div class="se-apply-instructions">Click <strong>Save &amp; Rebuild</strong> to write changes to disk and regenerate the dashboard.</div>'
        : '<div class="se-apply-instructions"><strong>To apply:</strong><br>' +
          '1. Copy <strong>schemas.json</strong> content and paste into <code>schemas.json</code><br>' +
          '2. Copy <strong>config updates</strong> and merge the <code>overview</code> and <code>portfolio</code> sections into <code>config.json</code><br>' +
          '3. Run: <code>npm run rebuild && npm run dashboard</code><br>' +
          'Or tell the Coach to apply both files.</div>';
    showModal(\`
        <h3>Apply Changes</h3>
        <div class="se-apply-tabs">
            <button class="se-apply-tab active" onclick="switchApplyTab('json', this)">schemas.json</button>
            <button class="se-apply-tab" onclick="switchApplyTab('config', this)">config.json updates</button>
            <button class="se-apply-tab" onclick="switchApplyTab('diff', this)">What Changed</button>
        </div>
        <div id="se-apply-json" class="se-apply-json">\${escHtml(schemasJson)}</div>
        <div id="se-apply-config" class="se-apply-json" style="display:none">\${escHtml(configJson)}</div>
        <div id="se-apply-diff" style="display:none">\${diff}</div>
        <div style="margin-top:12px;display:flex;gap:8px">\${actionsHtml}</div>
        \${instructionsHtml}
    \`);
}

function switchApplyTab(tab, btn) {
    document.getElementById('se-apply-json').style.display = tab === 'json' ? '' : 'none';
    const configEl = document.getElementById('se-apply-config');
    if (configEl) configEl.style.display = tab === 'config' ? '' : 'none';
    document.getElementById('se-apply-diff').style.display = tab === 'diff' ? '' : 'none';
    btn.parentElement.querySelectorAll('.se-apply-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function copySchemas() {
    const jsonStr = JSON.stringify(SE.schemas, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
        showToast('Copied to clipboard!');
    }).catch(() => {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = jsonStr;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        showToast('Copied to clipboard!');
    });
}

function copyConfig() {
    const jsonStr = JSON.stringify(getExportData().configUpdates, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
        showToast('Config updates copied!');
    }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = jsonStr;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        showToast('Config updates copied!');
    });
}

function saveToServer() {
    const exportData = getExportData();
    const btn = document.getElementById('se-apply-btn') || document.getElementById('se-save-btn');
    const origText = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }
    fetch('/api/save-schemas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportData)
    })
    .then(r => r.json())
    .then(data => {
        if (data.ok) {
            hideModal();
            showToast('Saved! Reloading...');
            setTimeout(() => window.location.reload(), 800);
        } else {
            if (btn) { btn.disabled = false; btn.textContent = origText; }
            alert('Save failed: ' + (data.error || 'Unknown error') + (data.stderr ? '\\n\\n' + data.stderr : ''));
        }
    })
    .catch(err => {
        if (btn) { btn.disabled = false; btn.textContent = origText; }
        alert('Network error: ' + err.message);
    });
}

function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ===== DIFF =====
function computeDiff() {
    const orig = SE.original.schemas || {};
    const curr = SE.schemas.schemas || {};
    let html = '';
    // Added schemas
    for (const id in curr) {
        if (!orig[id]) {
            html += '<div class="se-diff-item se-diff-add">+ Added schema: <strong>' + escHtml(curr[id].name) + '</strong> (' + curr[id].fields.length + ' fields)</div>';
        }
    }
    // Removed schemas
    for (const id in orig) {
        if (!curr[id]) {
            html += '<div class="se-diff-item se-diff-remove">- Removed schema: <strong>' + escHtml(orig[id].name) + '</strong></div>';
        }
    }
    // Modified schemas
    for (const id in curr) {
        if (!orig[id]) continue;
        const changes = [];
        if (curr[id].name !== orig[id].name) changes.push('Renamed to "' + curr[id].name + '"');
        if (curr[id].description !== orig[id].description) changes.push('Description updated');
        if (JSON.stringify(curr[id].dashboardView) !== JSON.stringify(orig[id].dashboardView)) changes.push('View config changed');
        // Field changes
        const origFields = (orig[id].fields || []).map(f => f.id);
        const currFields = (curr[id].fields || []).map(f => f.id);
        currFields.forEach(fid => {
            if (!origFields.includes(fid)) changes.push('+ Added field: ' + fid);
        });
        origFields.forEach(fid => {
            if (!currFields.includes(fid)) changes.push('- Removed field: ' + fid);
        });
        // Field modifications
        currFields.forEach(fid => {
            if (!origFields.includes(fid)) return;
            const of = orig[id].fields.find(f => f.id === fid);
            const cf = curr[id].fields.find(f => f.id === fid);
            if (JSON.stringify(of) !== JSON.stringify(cf)) changes.push('~ Modified field: ' + fid);
        });
        // Field reorder detection
        const commonFields = currFields.filter(f => origFields.includes(f));
        const origOrder = origFields.filter(f => commonFields.includes(f));
        if (commonFields.join(',') !== origOrder.join(',')) changes.push('~ Fields reordered');
        if (changes.length > 0) {
            html += '<div class="se-diff-item se-diff-change">~ Modified schema: <strong>' + escHtml(curr[id].name) + '</strong></div>';
            changes.forEach(c => {
                html += '<div class="se-diff-item se-diff-sub">' + escHtml(c) + '</div>';
            });
        }
    }
    // Overview config changes
    if (JSON.stringify(SE.overview) !== JSON.stringify(SE.originalOverview)) {
        html += '<div class="se-diff-item se-diff-change">~ Modified: <strong>Overview Config</strong></div>';
        if (JSON.stringify(SE.overview.stats) !== JSON.stringify(SE.originalOverview.stats)) html += '<div class="se-diff-item se-diff-sub">~ Stats updated</div>';
        if (JSON.stringify(SE.overview.perPerson) !== JSON.stringify(SE.originalOverview.perPerson)) html += '<div class="se-diff-item se-diff-sub">~ Per-person aggregations updated</div>';
    }
    // Portfolio config changes
    if (JSON.stringify(SE.portfolio) !== JSON.stringify(SE.originalPortfolio)) {
        html += '<div class="se-diff-item se-diff-change">~ Modified: <strong>Portfolio Config</strong></div>';
        if (SE.portfolio.schema !== SE.originalPortfolio.schema) html += '<div class="se-diff-item se-diff-sub">~ Schema changed to ' + escHtml(SE.portfolio.schema) + '</div>';
        if (JSON.stringify(SE.portfolio.currentFocus) !== JSON.stringify(SE.originalPortfolio.currentFocus)) html += '<div class="se-diff-item se-diff-sub">~ Current focus updated</div>';
        if (JSON.stringify(SE.portfolio.nextUp) !== JSON.stringify(SE.originalPortfolio.nextUp)) html += '<div class="se-diff-item se-diff-sub">~ Next up updated</div>';
    }
    if (!html) html = '<div class="se-diff-item" style="color:var(--text2)">No changes</div>';
    return html;
}

// ===== RENDERING =====
function renderSE() {
    const root = document.getElementById('schema-editor-root');
    if (!root) return;
    const schemas = SE.schemas.schemas || {};
    const ids = Object.keys(schemas);
    if (!SE.sel) SE.sel = '_overview';

    // Config sidebar items
    let sidebar = '<div class="' + (SE.sel === '_overview' ? 'se-sidebar-item active' : 'se-sidebar-item') + '" data-action="select-schema" data-schema="_overview"><span class="name">Overview Config</span><span class="cnt" style="font-size:10px">&#9881;</span></div>';
    sidebar += '<div style="height:1px;background:var(--surface2);margin:4px 0"></div>';
    ids.forEach(id => {
        const s = schemas[id];
        const cnt = (RECORDS_COUNT[id] || 0);
        const cls = id === SE.sel ? 'se-sidebar-item active' : 'se-sidebar-item';
        sidebar += '<div class="' + cls + '" data-action="select-schema" data-schema="' + id + '"><span class="name">' + escHtml(s.name) + '</span><span class="cnt">' + cnt + '</span></div>';
    });
    sidebar += '<div class="se-sidebar-add" data-action="create-schema">+ New Schema</div>';

    const saveClass = SE.dirty ? 'se-btn se-btn-primary pulse' : 'se-btn se-btn-secondary';
    let detail = '<div class="se-detail-empty">Select a schema</div>';
    if (SE.sel === '_overview') detail = renderOverviewConfig();
    else if (SE.sel && schemas[SE.sel]) detail = renderSchemaDetail(SE.sel, schemas[SE.sel]);

    const isServerMode = window.location.protocol !== 'file:';
    const saveBtn = isServerMode
        ? '<button class="' + saveClass + '" id="se-apply-btn" data-action="save"' + (SE.dirty ? '' : ' disabled') + '>Save</button>'
        : '<button class="' + saveClass + '" id="se-apply-btn" data-action="apply"' + (SE.dirty ? '' : ' disabled') + '>Apply Changes</button>';
    root.innerHTML = '<div class="se">' +
        '<div class="se-toolbar"><h2>Schema Editor</h2><div class="se-toolbar-actions">' +
        '<button class="se-btn se-btn-secondary" data-action="create-schema">+ New Schema</button>' +
        saveBtn +
        '</div></div>' +
        '<div class="se-body"><div class="se-sidebar">' + sidebar + '</div><div class="se-detail-panel">' + detail + '</div></div></div>';
}

function renderSchemaDetail(id, schema) {
    const view = schema.dashboardView || {};
    const fieldIds = schema.fields.map(f => f.id);
    const fieldOptions = '<option value="">None</option>' + fieldIds.map(f => '<option value="' + f + '">' + f + '</option>').join('');

    let fieldsHtml = '';
    schema.fields.forEach((f, idx) => {
        const reqBadge = f.required ? '<span class="se-field-req">required</span>' : '';
        const typeBadge = '<span class="se-field-type">' + escHtml(f.type) + '</span>';
        const upBtn = idx > 0 ? '<button data-action="move-field" data-schema="' + id + '" data-index="' + idx + '" data-dir="-1" title="Move up">&#9650;</button>' : '<button disabled style="opacity:0.2">&#9650;</button>';
        const dnBtn = idx < schema.fields.length - 1 ? '<button data-action="move-field" data-schema="' + id + '" data-index="' + idx + '" data-dir="1" title="Move down">&#9660;</button>' : '<button disabled style="opacity:0.2">&#9660;</button>';

        // Build property rows
        let propsHtml = '';
        propsHtml += '<span class="se-field-prop-label">ID</span><span class="se-field-prop-value se-field-id">' + escHtml(f.id) + '</span>';
        if (f.options && f.options.length) {
            propsHtml += '<span class="se-field-prop-label">Options</span><span class="se-field-prop-value"><div class="se-field-opts">' + f.options.map(o => '<span class="se-tag">' + escHtml(o) + '</span>').join('') + '</div></span>';
        }
        if (f['default']) {
            propsHtml += '<span class="se-field-prop-label">Default</span><span class="se-field-prop-value">' + escHtml(String(f['default'])) + '</span>';
        }
        if (f.aiInstruction) {
            propsHtml += '<div class="se-field-divider"></div>';
            propsHtml += '<span class="se-field-prop-label">AI</span><span class="se-field-prop-value se-field-ai">' + escHtml(f.aiInstruction) + '</span>';
        }

        fieldsHtml += '<div class="se-field">' +
            '<div class="se-field-grip">' + upBtn + dnBtn + '</div>' +
            '<div class="se-field-main">' +
                '<div class="se-field-header">' +
                    '<span class="se-field-name se-editable" data-action="edit-field-name" data-schema="' + id + '" data-index="' + idx + '">' + escHtml(f.name) + '</span>' +
                    typeBadge + reqBadge +
                '</div>' +
                '<div class="se-field-props">' + propsHtml + '</div>' +
            '</div>' +
            '<div class="se-field-actions">' +
                '<button class="se-btn-icon" data-action="edit-field" data-schema="' + id + '" data-index="' + idx + '" title="Edit field" aria-label="Edit field ' + escHtml(f.name) + '">&#9998;</button>' +
                '<button class="se-btn-icon danger" data-action="remove-field" data-schema="' + id + '" data-index="' + idx + '" title="Remove field" aria-label="Remove field ' + escHtml(f.name) + '">&#10005;</button>' +
            '</div>' +
        '</div>';
    });

    const groupByVal = view.groupBy || '';
    const sortByVal = view.sortBy || '';
    const groupSelect = '<select class="se-select" data-action="update-view" data-schema="' + id + '" data-key="groupBy">' + fieldOptions.replace('value="' + groupByVal + '"', 'value="' + groupByVal + '" selected') + '</select>';
    const sortSelect = '<select class="se-select" data-action="update-view" data-schema="' + id + '" data-key="sortBy">' + fieldOptions.replace('value="' + sortByVal + '"', 'value="' + sortByVal + '" selected') + '</select>';
    const viewTypeSelect = '<select class="se-select" data-action="update-view" data-schema="' + id + '" data-key="type">' +
        ['table','cards','list','timeline'].map(t => '<option value="' + t + '"' + (t === (view.type||'table') ? ' selected' : '') + '>' + t + '</option>').join('') + '</select>';

    return '<div class="se-detail">' +
        '<div class="se-meta">' +
            '<div class="se-meta-row"><span class="se-meta-label">Name</span><span class="se-editable se-name-input" data-action="edit-schema" data-schema="' + id + '" data-key="name">' + escHtml(schema.name) + '</span></div>' +
            '<div class="se-meta-row"><span class="se-meta-label">Description</span><span class="se-editable se-desc-input" data-action="edit-schema" data-schema="' + id + '" data-key="description">' + escHtml(schema.description || 'Click to add...') + '</span></div>' +
        '</div>' +
        '<div class="se-view-config">' +
            '<div class="se-view-config-item"><span>View</span>' + viewTypeSelect + '</div>' +
            '<div class="se-view-config-item"><span>Group by</span>' + groupSelect + '</div>' +
            '<div class="se-view-config-item"><span>Sort by</span>' + sortSelect + '</div>' +
        '</div>' +
        '<div class="se-fields-section">' +
        '<div class="se-fields-header"><h3>Fields (' + schema.fields.length + ')</h3></div>' +
        '<div style="display:flex;flex-direction:column;gap:6px">' + fieldsHtml + '</div>' +
        '<button class="se-add-field" data-action="add-field" data-schema="' + id + '">+ Add Field</button>' +
        '</div>' +
        '<div class="se-delete-schema"><button class="se-btn se-btn-danger" data-action="delete-schema" data-schema="' + id + '">Delete Schema</button></div>' +
    '</div>';
}

// ===== OVERVIEW CONFIG =====
function renderOverviewConfig() {
    const ov = SE.overview;
    const pf = SE.portfolio;
    const schemaIds = Object.keys(SE.schemas.schemas);
    const schemaOpts = schemaIds.map(s => '<option value="' + s + '">' + SE.schemas.schemas[s].name + '</option>').join('');

    // Stats
    let statsHtml = '';
    (ov.stats || []).forEach((stat, idx) => {
        const selOpts = schemaIds.map(s => '<option value="' + s + '"' + (s === stat.schema ? ' selected' : '') + '>' + SE.schemas.schemas[s].name + '</option>').join('');
        statsHtml += '<div class="se-field" style="padding:10px 12px">' +
            '<div class="se-field-main"><div class="se-field-header">' +
                '<span class="se-field-name">' + escHtml(stat.label) + '</span>' +
                '<span class="se-field-type">' + escHtml(stat.schema) + '</span>' +
                '<span class="se-field-type">' + escHtml(stat.count) + '</span>' +
            '</div></div>' +
            '<div class="se-field-actions" style="opacity:1">' +
                '<button class="se-btn-icon" data-action="edit-stat" data-index="' + idx + '" title="Edit stat">&#9998;</button>' +
                '<button class="se-btn-icon danger" data-action="remove-stat" data-index="' + idx + '" title="Remove stat">&#10005;</button>' +
            '</div></div>';
    });

    // Per-person aggregations
    let ppHtml = '';
    for (const [key, def] of Object.entries(ov.perPerson || {})) {
        ppHtml += '<div class="se-field" style="padding:10px 12px">' +
            '<div class="se-field-main"><div class="se-field-header">' +
                '<span class="se-field-name">' + escHtml(key) + '</span>' +
                '<span class="se-field-type">' + escHtml(def.schema) + '</span>' +
                '<span class="se-field-type">' + escHtml(def.filter || 'all') + '</span>' +
                '<span class="se-field-type">owner: ' + escHtml(def.ownerField || 'owner') + '</span>' +
            '</div></div>' +
            '<div class="se-field-actions" style="opacity:1">' +
                '<button class="se-btn-icon" data-action="edit-pp" data-key="' + escHtml(key) + '" title="Edit">&#9998;</button>' +
                '<button class="se-btn-icon danger" data-action="remove-pp" data-key="' + escHtml(key) + '" title="Remove">&#10005;</button>' +
            '</div></div>';
    }

    // Portfolio config
    const pfSchema = pf.schema || 'opportunity';
    const pfSchemaOpts = schemaIds.map(s => '<option value="' + s + '"' + (s === pfSchema ? ' selected' : '') + '>' + SE.schemas.schemas[s].name + '</option>').join('');
    const focusVal = (pf.currentFocus || []).join(', ');
    const nextVal = (pf.nextUp || []).join(', ');

    return '<div class="se-detail">' +
        '<div class="se-meta"><h3 style="margin:0 0 8px">Overview Stats</h3>' +
            '<p class="schema-desc">Stats shown at the top of the Overview tab. Each counts records from a schema with an optional filter.</p>' +
        '</div>' +
        '<div class="se-fields-section"><div class="se-fields-header"><h3>Stats (' + (ov.stats || []).length + ')</h3></div>' +
            '<div style="display:flex;flex-direction:column;gap:6px">' + statsHtml + '</div>' +
            '<button class="se-add-field" data-action="add-stat">+ Add Stat</button>' +
        '</div>' +
        '<div class="se-fields-section"><div class="se-fields-header"><h3>Per-Person Aggregations (' + Object.keys(ov.perPerson || {}).length + ')</h3></div>' +
            '<p class="schema-desc" style="margin-top:4px">For each team member, count records they own in a schema. Shown in Overview team cards.</p>' +
            '<div style="display:flex;flex-direction:column;gap:6px">' + ppHtml + '</div>' +
            '<button class="se-add-field" data-action="add-pp">+ Add Aggregation</button>' +
        '</div>' +
        '<div class="se-meta" style="margin-top:8px"><h3 style="margin:0 0 8px">Portfolio Config</h3>' +
            '<p class="schema-desc">Which schema represents your portfolio, and which records are in focus.</p>' +
            '<div class="se-meta-row"><span class="se-meta-label">Schema</span><select class="se-select" data-action="update-pf" data-key="schema">' + pfSchemaOpts + '</select></div>' +
            '<div class="se-meta-row"><span class="se-meta-label">Focus IDs</span><span class="se-editable" data-action="edit-pf" data-key="currentFocus">' + escHtml(focusVal || 'Click to set...') + '</span></div>' +
            '<div class="se-meta-row"><span class="se-meta-label">Next Up IDs</span><span class="se-editable" data-action="edit-pf" data-key="nextUp">' + escHtml(nextVal || 'Click to set...') + '</span></div>' +
        '</div>' +
    '</div>';
}

function showAddStatModal() {
    const schemaOpts = Object.keys(SE.schemas.schemas).map(s => '<option value="' + s + '">' + SE.schemas.schemas[s].name + '</option>').join('');
    showModal(\`
        <h3>Add Overview Stat</h3>
        <div class="se-modal-field"><label for="se-st-label">Label</label><input class="se-input" id="se-st-label" placeholder="e.g. Open Risks"></div>
        <div class="se-modal-field"><label for="se-st-schema">Schema</label><select class="se-select" id="se-st-schema" style="width:100%">\${schemaOpts}</select></div>
        <div class="se-modal-field"><label for="se-st-count">Count filter</label><input class="se-input se-input-sm" id="se-st-count" value="all" placeholder="all, status=open, status=done"></div>
        <p class="schema-desc">Use <code>all</code> for total count, or <code>field=value</code> / <code>field!=value</code> to filter.</p>
        <div class="se-modal-actions">
            <button class="se-btn se-btn-secondary" onclick="hideModal()">Cancel</button>
            <button class="se-btn se-btn-primary" onclick="doAddStat()">Add</button>
        </div>
    \`);
}

function doAddStat() {
    const label = document.getElementById('se-st-label').value.trim();
    if (!label) return alert('Label is required');
    if (!SE.overview.stats) SE.overview.stats = [];
    SE.overview.stats.push({
        label: label,
        schema: document.getElementById('se-st-schema').value,
        count: document.getElementById('se-st-count').value.trim() || 'all'
    });
    hideModal();
    markDirty();
    renderSE();
}

function showEditStatModal(idx) {
    const stat = SE.overview.stats[idx];
    const schemaOpts = Object.keys(SE.schemas.schemas).map(s => '<option value="' + s + '"' + (s === stat.schema ? ' selected' : '') + '>' + SE.schemas.schemas[s].name + '</option>').join('');
    showModal(\`
        <h3>Edit Stat</h3>
        <div class="se-modal-field"><label for="se-st-label">Label</label><input class="se-input" id="se-st-label" value="\${escHtml(stat.label)}"></div>
        <div class="se-modal-field"><label for="se-st-schema">Schema</label><select class="se-select" id="se-st-schema" style="width:100%">\${schemaOpts}</select></div>
        <div class="se-modal-field"><label for="se-st-count">Count filter</label><input class="se-input se-input-sm" id="se-st-count" value="\${escHtml(stat.count)}"></div>
        <div class="se-modal-actions">
            <button class="se-btn se-btn-secondary" onclick="hideModal()">Cancel</button>
            <button class="se-btn se-btn-primary" onclick="doEditStat(\${idx})">Save</button>
        </div>
    \`);
}

function doEditStat(idx) {
    const label = document.getElementById('se-st-label').value.trim();
    if (!label) return alert('Label is required');
    SE.overview.stats[idx] = {
        label: label,
        schema: document.getElementById('se-st-schema').value,
        count: document.getElementById('se-st-count').value.trim() || 'all'
    };
    hideModal();
    markDirty();
    renderSE();
}

function showAddPPModal() {
    const schemaOpts = Object.keys(SE.schemas.schemas).map(s => '<option value="' + s + '">' + SE.schemas.schemas[s].name + '</option>').join('');
    showModal(\`
        <h3>Add Per-Person Aggregation</h3>
        <div class="se-modal-field"><label for="se-pp-key">Key</label><input class="se-input" id="se-pp-key" placeholder="e.g. activeRisks"></div>
        <div class="se-modal-field"><label for="se-pp-schema">Schema</label><select class="se-select" id="se-pp-schema" style="width:100%">\${schemaOpts}</select></div>
        <div class="se-modal-field"><label for="se-pp-filter">Filter</label><input class="se-input se-input-sm" id="se-pp-filter" placeholder="e.g. status!=done"></div>
        <div class="se-modal-field"><label for="se-pp-owner">Owner field</label><input class="se-input se-input-sm" id="se-pp-owner" value="owner" placeholder="owner"></div>
        <div class="se-modal-actions">
            <button class="se-btn se-btn-secondary" onclick="hideModal()">Cancel</button>
            <button class="se-btn se-btn-primary" onclick="doAddPP()">Add</button>
        </div>
    \`);
}

function doAddPP() {
    const key = document.getElementById('se-pp-key').value.trim();
    if (!key) return alert('Key is required');
    if (!SE.overview.perPerson) SE.overview.perPerson = {};
    SE.overview.perPerson[key] = {
        schema: document.getElementById('se-pp-schema').value,
        filter: document.getElementById('se-pp-filter').value.trim(),
        ownerField: document.getElementById('se-pp-owner').value.trim() || 'owner'
    };
    hideModal();
    markDirty();
    renderSE();
}

// ===== EVENT DELEGATION =====
document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.dataset.action;
    const schemaId = el.dataset.schema;
    const idx = parseInt(el.dataset.index);

    if (action === 'select-schema') { SE.sel = schemaId; renderSE(); }
    else if (action === 'create-schema') { showCreateSchemaModal(); }
    else if (action === 'delete-schema') {
        const cnt = RECORDS_COUNT[schemaId] || 0;
        const msg = cnt > 0 ? 'Delete "' + SE.schemas.schemas[schemaId].name + '"? It has ' + cnt + ' existing records.' : 'Delete "' + SE.schemas.schemas[schemaId].name + '"?';
        if (confirm(msg)) seDeleteSchema(schemaId);
    }
    else if (action === 'add-field') { showAddFieldModal(schemaId); }
    else if (action === 'edit-field') { showEditFieldModal(schemaId, idx); }
    else if (action === 'remove-field') {
        const f = SE.schemas.schemas[schemaId].fields[idx];
        if (confirm('Remove field "' + f.name + '"?')) seRemoveField(schemaId, idx);
    }
    else if (action === 'move-field') { seMoveField(schemaId, idx, parseInt(el.dataset.dir)); }
    else if (action === 'save') { if (SE.dirty) saveToServer(); }
    else if (action === 'apply') { if (SE.dirty) showApplyModal(); }
    else if (action === 'add-stat') { showAddStatModal(); }
    else if (action === 'edit-stat') { showEditStatModal(idx); }
    else if (action === 'remove-stat') {
        SE.overview.stats.splice(idx, 1);
        markDirty();
        renderSE();
    }
    else if (action === 'add-pp') { showAddPPModal(); }
    else if (action === 'remove-pp') {
        delete SE.overview.perPerson[el.dataset.key];
        markDirty();
        renderSE();
    }
    else if (action === 'edit-pf') {
        const key = el.dataset.key;
        const current = (SE.portfolio[key] || []).join(', ');
        const input = document.createElement('input');
        input.className = 'se-input se-input-sm';
        input.value = current;
        input.placeholder = 'Comma-separated record IDs (e.g. opp1, opp3)';
        el.replaceWith(input);
        input.focus();
        input.select();
        const commit = () => {
            const val = input.value.trim();
            SE.portfolio[key] = val ? val.split(',').map(s => s.trim()).filter(Boolean) : [];
            markDirty();
            renderSE();
        };
        input.addEventListener('blur', commit);
        input.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') input.blur(); if (ev.key === 'Escape') { input.value = current; input.blur(); } });
    }
    else if (action === 'edit-schema') {
        const span = el;
        const key = span.dataset.key;
        const current = key === 'name' ? SE.schemas.schemas[schemaId].name : (SE.schemas.schemas[schemaId].description || '');
        const input = document.createElement('input');
        input.className = 'se-input' + (key === 'name' ? ' se-name-input' : ' se-desc-input');
        input.value = current;
        span.replaceWith(input);
        input.focus();
        input.select();
        const commit = () => {
            const val = input.value.trim();
            if (val && val !== current) seUpdateSchema(schemaId, key, val);
            else renderSE();
        };
        input.addEventListener('blur', commit);
        input.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') input.blur(); if (ev.key === 'Escape') { input.value = current; input.blur(); } });
    }
    else if (action === 'edit-field-name') {
        const span = el;
        const f = SE.schemas.schemas[schemaId].fields[idx];
        const input = document.createElement('input');
        input.className = 'se-input se-input-sm';
        input.value = f.name;
        input.style.width = '150px';
        span.replaceWith(input);
        input.focus();
        input.select();
        const commit = () => {
            const val = input.value.trim();
            if (val && val !== f.name) seUpdateField(schemaId, idx, 'name', val);
            else renderSE();
        };
        input.addEventListener('blur', commit);
        input.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') input.blur(); if (ev.key === 'Escape') { input.value = f.name; input.blur(); } });
    }
});

// Handle select changes (view config + portfolio config)
document.addEventListener('change', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    if (el.dataset.action === 'update-view') {
        seUpdateSchema(el.dataset.schema, 'view.' + el.dataset.key, el.value);
    } else if (el.dataset.action === 'update-pf') {
        SE.portfolio[el.dataset.key] = el.value;
        markDirty();
        renderSE();
    }
});

// Init editor when schemas tab is shown
const schemasTab = document.querySelector('.nav-btn[data-tab="schemas"]');
if (schemasTab) {
    schemasTab.addEventListener('click', () => {
        setTimeout(renderSE, 10);
    });
}
// Also render if schemas tab is already active
if (document.getElementById('tab-schemas') && document.getElementById('tab-schemas').classList.contains('active')) {
    renderSE();
}
`;
}
