/**
 * records.ts — Generic record editor UI for schema-driven dashboard tabs.
 *
 * Ported from records_ui.py. Provides CSS and JS that allow adding, editing,
 * and deleting records from any schema tab via modal forms.
 * Works with the /api/save-record endpoint.
 */

export function getRecordsEditorCss(): string {
    return `
/* Record editor */
.add-record-btn { background: var(--accent); border: none; color: white; padding: 6px 14px; border-radius: var(--radius); cursor: pointer; font-size: 12px; font-weight: 600; font-family: inherit; transition: all 0.15s; }
.add-record-btn:hover { filter: brightness(1.15); }
.row-actions { white-space: nowrap; text-align: right; opacity: 0.3; transition: opacity 0.15s; }
tr:hover .row-actions { opacity: 1; }
.actions-col { width: 60px; }
.row-action-btn { background: none; border: none; color: var(--text2); cursor: pointer; font-size: 14px; padding: 2px 6px; border-radius: 4px; font-family: inherit; }
.row-action-btn:hover { background: var(--surface2); color: var(--text); }
.delete-btn:hover { color: var(--red); }

/* Record form modal */
.record-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 1001; display: flex; align-items: center; justify-content: center; }
.record-modal { background: var(--surface); border-radius: 12px; padding: 28px; max-width: 560px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.5); position: relative; }
.record-modal h3 { margin-bottom: 20px; font-size: 16px; }
.record-form-group { margin-bottom: 14px; }
.record-form-group label { display: block; font-size: 12px; font-weight: 600; color: var(--text2); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.3px; }
.record-form-group label .req { color: var(--red); }
.record-form-group input, .record-form-group select, .record-form-group textarea { width: 100%; background: var(--bg); border: 1px solid var(--surface2); color: var(--text); padding: 8px 10px; border-radius: 6px; font-size: 13px; font-family: inherit; }
.record-form-group textarea { min-height: 80px; resize: vertical; }
.record-form-group input:focus, .record-form-group select:focus, .record-form-group textarea:focus { outline: none; border-color: var(--accent); }
.record-form-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 20px; }
.record-form-actions button { padding: 8px 18px; border-radius: 6px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
.record-save-btn { background: var(--accent); color: white; }
.record-save-btn:hover { filter: brightness(1.15); }
.record-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.record-cancel-btn { background: var(--surface2); color: var(--text); }
.record-cancel-btn:hover { background: var(--bg); }
.record-delete-confirm { background: var(--red); color: white; }
.record-delete-confirm:hover { filter: brightness(1.15); }

/* Detail view modal */
.detail-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 1001; display: flex; align-items: center; justify-content: center; }
.detail-modal { background: var(--surface); border-radius: 12px; padding: 28px; max-width: 720px; width: 92%; max-height: 85vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.5); position: relative; }
.detail-modal h3 { margin-bottom: 20px; font-size: 18px; font-weight: 600; }
.detail-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 20px; margin-bottom: 20px; }
.detail-field { }
.detail-field.full-width { grid-column: 1 / -1; }
.detail-label { font-size: 11px; font-weight: 600; color: var(--text2); text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 3px; }
.detail-value { font-size: 13px; line-height: 1.5; }
.detail-value .badge { font-size: 11px; }
.detail-divider { grid-column: 1 / -1; border: none; border-top: 1px solid var(--surface2); margin: 8px 0; }
.detail-tactics { grid-column: 1 / -1; background: var(--bg); border-radius: 8px; padding: 20px; margin-top: 4px; }
.detail-tactics-label { font-size: 12px; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
.detail-tactics-body { font-size: 13px; line-height: 1.7; color: var(--text); }
.detail-tactics-body h3 { font-size: 14px; font-weight: 700; color: var(--text); margin: 16px 0 6px; }
.detail-tactics-body h3:first-child { margin-top: 0; }
.detail-tactics-body h4 { font-size: 13px; font-weight: 600; color: var(--accent); margin: 12px 0 4px; }
.detail-tactics-body p { margin-bottom: 8px; }
.detail-tactics-body ul { margin: 4px 0 10px 18px; }
.detail-tactics-body li { margin-bottom: 3px; }
.detail-tactics-body em { color: var(--text2); font-style: italic; }
.detail-tactics-body strong { font-weight: 600; }
.detail-tactics-body code { background: var(--surface2); padding: 1px 5px; border-radius: 3px; font-size: 12px; }
.detail-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }
.detail-edit-btn { background: var(--surface2); color: var(--text); padding: 8px 18px; border-radius: 6px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
.detail-edit-btn:hover { background: var(--accent); color: white; }
.detail-close-btn { background: var(--surface2); color: var(--text); padding: 8px 18px; border-radius: 6px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
.detail-close-btn:hover { background: var(--bg); }
`;
}


export function getRecordsEditorJs(schemasJs: string, allRecordsJs: string, teamJs: string, maxSequenceJs: string = "{}"): string {
    return `
// --- Record Editor ---
(function() {
    const RE_SCHEMAS = ${schemasJs};
    const RE_RECORDS = ${allRecordsJs};
    const RE_TEAM = ${teamJs};
    const RE_MAX_SEQ = ${maxSequenceJs};

    function getIdentity() {
        // Try reading from localStorage (set by identity tab)
        return localStorage.getItem('coach_identity') || 'dashboard';
    }

    function nextRecordId(schemaId) {
        const author = getIdentity();
        // Use _maxSequence from state if available (handles deleted records)
        if (typeof RE_MAX_SEQ !== 'undefined') {
            const key = schemaId + '.' + author;
            const seq = (RE_MAX_SEQ[key] || 0) + 1;
            return schemaId + '_' + String(seq).padStart(3, '0') + '_' + author;
        }
        // Fallback: scan existing records (matches both old and new ID formats)
        const existing = RE_RECORDS[schemaId] || [];
        let max = 0;
        for (const r of existing) {
            const m = (r._id || '').match(/_(\\d+)(?:_\\w+)?$/);
            if (m) max = Math.max(max, parseInt(m[1]));
        }
        return schemaId + '_' + String(max + 1).padStart(3, '0') + '_' + author;
    }

    function buildFormField(field, value) {
        const id = 'rf_' + field.id;
        const req = field.required ? '<span class="req">*</span>' : '';
        let input = '';
        const ftype = field.type || 'text';

        if (ftype === 'select') {
            const opts = (field.options || []).map(o =>
                '<option value="' + o + '"' + (o === value ? ' selected' : '') + '>' + o + '</option>'
            ).join('');
            input = '<select id="' + id + '"><option value="">--</option>' + opts + '</select>';
        } else if (ftype === 'member') {
            const opts = RE_TEAM.map(m =>
                '<option value="' + m.id + '"' + (m.id === value ? ' selected' : '') + '>' + m.name + '</option>'
            ).join('');
            input = '<select id="' + id + '"><option value="">--</option>' + opts + '</select>';
        } else if (ftype === 'date') {
            input = '<input type="date" id="' + id + '" value="' + (value || '') + '">';
        } else {
            const v = (value || '').replace(/"/g, '&quot;');
            if (v.length > 60 || v.includes('\\n')) {
                input = '<textarea id="' + id + '">' + (value || '').replace(/</g, '&lt;') + '</textarea>';
            } else {
                input = '<input type="text" id="' + id + '" value="' + v + '">';
            }
        }

        return '<div class="record-form-group"><label>' + field.name + ' ' + req + '</label>' + input + '</div>';
    }

    function readFormField(field) {
        const el = document.getElementById('rf_' + field.id);
        if (!el) return undefined;
        const v = el.value.trim();
        return v || undefined;
    }

    function openRecordForm(schemaId, recordId) {
        const schemaDef = RE_SCHEMAS.schemas[schemaId];
        if (!schemaDef) return;
        const fields = schemaDef.fields || [];
        const isEdit = !!recordId;
        const record = isEdit ? (RE_RECORDS[schemaId] || []).find(r => r._id === recordId) : {};

        const title = isEdit ? 'Edit ' + schemaDef.name : 'Add ' + schemaDef.name;
        let formHtml = '';
        for (const field of fields) {
            formHtml += buildFormField(field, record ? record[field.id] : undefined);
        }

        const ov = document.createElement('div');
        ov.className = 'record-overlay';
        ov.id = 'record-overlay';
        ov.innerHTML = '<div class="record-modal">' +
            '<h3>' + title + '</h3>' +
            '<form id="record-form">' + formHtml +
            '<div class="record-form-actions">' +
            '<button type="button" class="record-cancel-btn" id="record-cancel">Cancel</button>' +
            '<button type="submit" class="record-save-btn" id="record-save">Save</button>' +
            '</div></form></div>';
        ov.addEventListener('click', (ev) => { if (ev.target === ov) ov.remove(); });
        document.body.appendChild(ov);

        document.getElementById('record-cancel').onclick = () => ov.remove();
        document.getElementById('record-form').onsubmit = async (ev) => {
            ev.preventDefault();
            const data = {};
            for (const field of fields) {
                const v = readFormField(field);
                if (v !== undefined) data[field.id] = v;
            }
            // Validate required fields
            for (const field of fields) {
                if (field.required && !data[field.id]) {
                    alert(field.name + ' is required');
                    return;
                }
            }
            const saveBtn = document.getElementById('record-save');
            saveBtn.disabled = true;
            saveBtn.textContent = 'Saving...';
            try {
                const resp = await fetch('/api/save-record', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        schema: schemaId,
                        action: isEdit ? 'update' : 'create',
                        recordId: isEdit ? recordId : nextRecordId(schemaId),
                        data: data,
                        author: getIdentity()
                    })
                });
                const result = await resp.json();
                if (result.ok) {
                    window.location.reload();
                } else {
                    alert('Save failed: ' + (result.error || 'Unknown error'));
                    saveBtn.disabled = false;
                    saveBtn.textContent = 'Save';
                }
            } catch (err) {
                alert('Save failed: ' + err.message);
                saveBtn.disabled = false;
                saveBtn.textContent = 'Save';
            }
        };

        document.addEventListener('keydown', function escHandler(ev) {
            if (ev.key === 'Escape') {
                const o = document.getElementById('record-overlay');
                if (o) o.remove();
                document.removeEventListener('keydown', escHandler);
            }
        });
    }

    async function deleteRecord(schemaId, recordId) {
        const record = (RE_RECORDS[schemaId] || []).find(r => r._id === recordId);
        const name = record ? (record.title || record.term || recordId) : recordId;
        if (!confirm('Delete "' + name + '"?')) return;
        try {
            const resp = await fetch('/api/save-record', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    schema: schemaId,
                    action: 'delete',
                    recordId: recordId,
                    data: {},
                    author: getIdentity()
                })
            });
            const result = await resp.json();
            if (result.ok) {
                window.location.reload();
            } else {
                alert('Delete failed: ' + (result.error || 'Unknown error'));
            }
        } catch (err) {
            alert('Delete failed: ' + err.message);
        }
    }

    function renderMd(text) {
        if (!text) return '';
        var s = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        // Headers
        s = s.replace(/^### (.+)$/gm, '<h3>$1</h3>');
        s = s.replace(/^## (.+)$/gm, '<h3>$1</h3>');
        s = s.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
        // Bold and italic
        s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
        // Inline code
        s = s.replace(/\`(.+?)\`/g, '<code>$1</code>');
        // Bullet lists
        var lines = s.split('\\n');
        var out = [];
        var inList = false;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var bullet = line.match(/^\\s*[-*]\\s+(.+)/);
            if (bullet) {
                if (!inList) { out.push('<ul>'); inList = true; }
                out.push('<li>' + bullet[1] + '</li>');
            } else {
                if (inList) { out.push('</ul>'); inList = false; }
                if (line.match(/^<h[34]/)) {
                    out.push(line);
                } else if (line.trim() === '') {
                    out.push('');
                } else {
                    out.push('<p>' + line + '</p>');
                }
            }
        }
        if (inList) out.push('</ul>');
        return out.join('\\n');
    }

    function getFieldDisplayValue(field, value) {
        if (value == null) return '--';
        var ftype = field.type || 'text';
        if (ftype === 'member') {
            for (var m of RE_TEAM) { if (m.id === value) return m.name; }
            return value;
        }
        if (ftype === 'member[]' && Array.isArray(value)) {
            return value.map(function(v) {
                for (var m of RE_TEAM) { if (m.id === v) return m.name; }
                return v;
            }).join(', ');
        }
        if (ftype === 'select') {
            return '<span class="badge" style="background:' + ({
                not_started:'#6b7280', in_progress:'#2563eb', blocked:'#dc2626', done:'#16a34a',
                P0:'#dc2626', P1:'#ea580c', P2:'#ca8a04', P3:'#6b7280',
                open:'#dc2626', resolved:'#16a34a'
            }[value] || '#6b7280') + '">' + value + '</span>';
        }
        if (ftype.startsWith('ref:')) {
            var refSchema = ftype.replace('ref:', '').replace('[]', '');
            var recs = RE_RECORDS[refSchema] || [];
            if (Array.isArray(value)) {
                return value.map(function(v) {
                    var r = recs.find(function(x) { return x._id === v; });
                    return r ? (r.title || v) : v;
                }).join(', ');
            }
            var rec = recs.find(function(x) { return x._id === value; });
            return rec ? (rec.title || value) : value;
        }
        return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\\n/g, '<br>');
    }

    function viewRecord(schemaId, recordId) {
        var schemaDef = RE_SCHEMAS.schemas[schemaId];
        if (!schemaDef) return;
        var fields = schemaDef.fields || [];
        var record = (RE_RECORDS[schemaId] || []).find(function(r) { return r._id === recordId; });
        if (!record) return;

        var title = record.title || record.term || recordId;
        var tacticsField = fields.find(function(f) { return f.id === 'tactics'; });
        var tacticsValue = record.tactics;
        var regularFields = fields.filter(function(f) { return f.id !== 'tactics'; });

        var fieldsHtml = '<div class="detail-fields">';
        var longFields = ['notes', 'description', 'summary', 'context', 'impact', 'mitigation', 'agenda', 'actions', 'decisions', 'answer', 'deliverables', 'risks', 'dependencies'];
        for (var f of regularFields) {
            var val = record[f.id];
            if (val == null) continue;
            var isLong = longFields.indexOf(f.id) >= 0 || (typeof val === 'string' && val.length > 80);
            fieldsHtml += '<div class="detail-field' + (isLong ? ' full-width' : '') + '">';
            fieldsHtml += '<div class="detail-label">' + f.name + '</div>';
            fieldsHtml += '<div class="detail-value">' + getFieldDisplayValue(f, val) + '</div>';
            fieldsHtml += '</div>';
        }
        fieldsHtml += '</div>';

        var tacticsHtml = '';
        if (tacticsValue) {
            tacticsHtml = '<div class="detail-tactics">' +
                '<div class="detail-tactics-label">Tactics</div>' +
                '<div class="detail-tactics-body">' + renderMd(tacticsValue) + '</div>' +
                '</div>';
        }

        var ov = document.createElement('div');
        ov.className = 'detail-overlay';
        ov.id = 'detail-overlay';
        ov.innerHTML = '<div class="detail-modal">' +
            '<h3>' + (title.replace ? title.replace(/</g, '&lt;') : title) + '</h3>' +
            fieldsHtml +
            tacticsHtml +
            '<div class="detail-actions">' +
            '<button class="detail-close-btn" id="detail-close">Close</button>' +
            '<button class="detail-edit-btn" id="detail-edit">Edit</button>' +
            '</div></div>';
        ov.addEventListener('click', function(ev) { if (ev.target === ov) ov.remove(); });
        document.body.appendChild(ov);

        document.getElementById('detail-close').onclick = function() { ov.remove(); };
        document.getElementById('detail-edit').onclick = function() {
            ov.remove();
            openRecordForm(schemaId, recordId);
        };

        document.addEventListener('keydown', function escHandler(ev) {
            if (ev.key === 'Escape') {
                var o = document.getElementById('detail-overlay');
                if (o) o.remove();
                document.removeEventListener('keydown', escHandler);
            }
        });
    }

    // Wire up: Add buttons on each schema tab, edit/delete handlers
    document.addEventListener('DOMContentLoaded', () => {
        for (const [sid, schema] of Object.entries(RE_SCHEMAS.schemas)) {
            const tab = document.getElementById('tab-' + sid);
            if (!tab) continue;

            // Add "Add" button in the tab header
            const header = tab.querySelector('.tab-header');
            if (header) {
                const btn = document.createElement('button');
                btn.className = 'add-record-btn';
                btn.textContent = '+ Add ' + schema.name;
                btn.onclick = () => openRecordForm(sid, null);
                header.prepend(btn);
            }
        }

        // Delegate edit/delete clicks
        document.addEventListener('click', (ev) => {
            const btn = ev.target.closest('[data-action]');
            if (btn) {
                const recordId = btn.dataset.recordId;
                const tabPanel = btn.closest('.tab-panel');
                if (!tabPanel) return;
                const schemaId = tabPanel.id.replace('tab-', '');

                if (btn.dataset.action === 'edit') {
                    openRecordForm(schemaId, recordId);
                } else if (btn.dataset.action === 'delete') {
                    deleteRecord(schemaId, recordId);
                }
                return;
            }

            // Row click -> detail view (disabled — data already visible in table)
        });
    });
})();
`;
}
