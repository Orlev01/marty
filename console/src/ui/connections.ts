/**
 * connections.ts — CSS and JS for the read-only Sources tab and the My Identity tab.
 *
 * The Sources tab is a VIEW, not an editor. The canonical source registry is
 * markdown owned by Marty (sources.md and missions/<m>/sources/registry.md);
 * this tab renders what parse_sources.ts extracted at generation time.
 */

export function getConnectionsCss(): string {
    return `
/* Sources Tab */
.cx { display: flex; flex-direction: column; gap: 16px; }
.cx-toolbar { display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 2px solid var(--surface2); margin-bottom: 4px; }
.cx-toolbar h2 { margin: 0; }

.cx-section { background: var(--surface); border: 1px solid var(--surface2); border-radius: var(--radius); padding: 16px; }
.cx-section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--surface2); }
.cx-section-title { font-size: 14px; font-weight: 600; }
.cx-section-origin { color: var(--text2); font-size: 11px; font-family: monospace; margin-left: auto; }
.cx-section-count { color: var(--text2); font-size: 12px; }
.cx-type-badge { font-size: 10px; padding: 2px 8px; border-radius: 4px; font-weight: 600; color: white; text-transform: uppercase; letter-spacing: 0.5px; flex-shrink: 0; }
.cx-type-slack { background: #4A154B; }
.cx-type-notion { background: #191919; border: 1px solid var(--surface2); }
.cx-type-linear { background: #5E6AD2; }
.cx-type-gdoc { background: #188038; }
.cx-type-calendar { background: #1a73e8; }
.cx-type-figma { background: #F24E1E; }
.cx-type-datadog { background: #632CA6; }
.cx-type-other { background: var(--surface2); color: var(--text2); }

.cx-cards { display: flex; flex-direction: column; gap: 6px; }
.cx-card { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: var(--bg); border: 1px solid var(--surface2); border-radius: 6px; }
.cx-card-info { flex: 1; min-width: 0; }
.cx-card-name { font-weight: 600; font-size: 14px; }
.cx-card-detail { font-size: 11px; color: var(--text2); font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 2px; }
.cx-card-desc { font-size: 12px; color: var(--text2); margin-top: 4px; line-height: 1.4; }
.cx-card-meta { font-size: 11px; color: var(--text2); margin-top: 2px; }

.cx-empty { color: var(--text2); font-size: 13px; font-style: italic; padding: 8px 0; }

.cx-info-bar { background: var(--surface); border: 1px solid var(--surface2); border-radius: var(--radius); padding: 14px 16px; font-size: 13px; color: var(--text2); line-height: 1.6; }
.cx-info-bar code { background: var(--bg); padding: 1px 5px; border-radius: 3px; font-size: 12px; }
.cx-info-bar strong { color: var(--text); }

.cx-parse-ok { font-size: 12px; color: var(--green); display: flex; align-items: center; gap: 6px; padding: 6px 10px; background: rgba(22,163,106,0.1); border-radius: 4px; line-height: 1.4; }
.cx-parse-err { font-size: 12px; color: var(--red); display: flex; align-items: center; gap: 6px; padding: 6px 10px; background: rgba(220,38,38,0.1); border-radius: 4px; line-height: 1.4; }
`;
}


export function getConnectionsJs(sourceGroupsJson: string): string {
    return `
// Sources Tab (read-only view of Marty's markdown source registries)
const CX_GROUPS = ${sourceGroupsJson};

const CX_TYPE_LABELS = {
    slack: 'Slack', notion: 'Notion', linear: 'Linear', gdoc: 'Google Doc',
    calendar: 'Calendar', figma: 'Figma', datadog: 'Datadog', other: 'Source'
};

function renderCX() {
    const root = document.getElementById('connections-root');
    if (!root) return;

    let sectionsHtml = '';
    if (CX_GROUPS.length === 0) {
        sectionsHtml = '<div class="cx-section"><div class="cx-empty">No source registries found. Create <code>sources.md</code> at the repo root, or a <code>sources/registry.md</code> inside a mission.</div></div>';
    }
    CX_GROUPS.forEach(group => {
        let cardsHtml = '';
        if (group.sources.length === 0) {
            cardsHtml = '<div class="cx-empty">No sources registered in this file yet</div>';
        } else {
            group.sources.forEach(s => {
                const type = CX_TYPE_LABELS[s.type] ? s.type : 'other';
                cardsHtml += '<div class="cx-card">' +
                    '<span class="cx-type-badge cx-type-' + type + '">' + escHtml(CX_TYPE_LABELS[type]) + '</span>' +
                    '<div class="cx-card-info">' +
                        '<div class="cx-card-name">' + escHtml(s.name) + '</div>' +
                        (s.detail ? '<div class="cx-card-detail">' + escHtml(s.detail) + '</div>' : '') +
                        (s.description ? '<div class="cx-card-desc">look for: ' + escHtml(s.description) + '</div>' : '') +
                        (s.meta ? '<div class="cx-card-meta">' + escHtml(s.meta) + '</div>' : '') +
                    '</div>' +
                '</div>';
            });
        }
        sectionsHtml += '<div class="cx-section">' +
            '<div class="cx-section-header">' +
                '<span class="cx-section-title">' + escHtml(group.label) + '</span>' +
                '<span class="cx-section-count">' + group.sources.length + '</span>' +
                '<span class="cx-section-origin">' + escHtml(group.origin) + '</span>' +
            '</div>' +
            '<div class="cx-cards">' + cardsHtml + '</div>' +
        '</div>';
    });

    root.innerHTML = '<div class="cx">' +
        '<div class="cx-toolbar"><h2>Sources</h2></div>' +
        '<div class="cx-info-bar"><strong>Read-only view.</strong> The canonical registry is markdown owned by Marty: ' +
            '<code>sources.md</code> for persistent sources and <code>missions/&lt;mission&gt;/sources/registry.md</code> per mission. ' +
            'Edit those files (or ask Marty), then run <code>npm run dashboard</code> here to refresh this view.<br><br>' +
            '<strong>Auth note:</strong> Source config names WHAT Marty reads; access comes from the MCP connectors ' +
            'you authenticate in your own Claude session (Slack, Notion, Calendar, Drive, ...). Config travels with the repo; OAuth tokens do not.</div>' +
        sectionsHtml +
    '</div>';
}

// Init when connections tab is shown
const cxTab = document.querySelector('[data-tab="connections"]');
if (cxTab) {
    cxTab.addEventListener('click', () => {
        setTimeout(renderCX, 10);
    });
}
if (document.getElementById('tab-connections') && document.getElementById('tab-connections').classList.contains('active')) {
    renderCX();
}

// ===== MY IDENTITY TAB =====
function renderIdentity() {
    const root = document.getElementById('identity-root');
    if (!root) return;
    const currentId = localStorage.getItem('coach_identity') || '';

    let cardsHtml = '';
    TEAM_DATA.forEach(m => {
        const isSelected = m.id === currentId;
        const borderStyle = isSelected ? 'border-color:var(--accent);background:rgba(59,130,246,0.1)' : '';
        const check = isSelected ? '<span style="color:var(--accent);font-weight:600;font-size:16px">&#10003;</span>' : '';
        cardsHtml += '<div class="cx-card" style="cursor:pointer;' + borderStyle + '" onclick="selectIdentity(\\'' + escHtml(m.id) + '\\')">' +
            '<div class="cx-card-info">' +
                '<div class="cx-card-name">' + escHtml(m.name) + '</div>' +
                '<div class="cx-card-detail" style="font-family:inherit">' + escHtml(m.role || '') + '</div>' +
            '</div>' +
            check +
        '</div>';
    });

    const selectedName = currentId ? (TEAM_DATA.find(m => m.id === currentId) || {}).name || currentId : '';
    const statusHtml = currentId
        ? '<div class="cx-parse-ok">&#10003; You are <strong>' + escHtml(selectedName) + '</strong></div>'
        : '<div class="cx-parse-err">&#10007; No identity selected — events you save will be attributed to "dashboard"</div>';

    root.innerHTML = '<div class="cx">' +
        '<div class="cx-toolbar"><h2>My Identity</h2></div>' +
        '<div class="cx-info-bar">Select yourself from the team list (edit <code>team.json</code> to add members). ' +
            'Records you create or edit in the console are attributed to this identity in the event log.</div>' +
        statusHtml +
        '<div class="cx-section">' +
            '<div class="cx-section-header"><span class="cx-section-title">Team Members</span><span class="cx-section-count">' + TEAM_DATA.length + '</span></div>' +
            '<div class="cx-cards">' + cardsHtml + '</div>' +
        '</div>' +
    '</div>';
}

function selectIdentity(memberId) {
    localStorage.setItem('coach_identity', memberId);
    renderIdentity();
}

// Init when identity tab is shown
const idTab = document.querySelector('[data-tab="identity"]');
if (idTab) {
    idTab.addEventListener('click', () => {
        setTimeout(renderIdentity, 10);
    });
}
if (document.getElementById('tab-identity') && document.getElementById('tab-identity').classList.contains('active')) {
    renderIdentity();
}
`;
}
