'use strict';
const storageKey = 'rentun.requests.v1';
const statuses = ['New', 'Follow up', 'Done'];
const form = document.querySelector('#request-form');
const list = document.querySelector('#requests');
const notice = document.querySelector('#notice');
const filter = document.querySelector('#filter');
let records = [];
let storageReadable = true;
function validRecord(record) {
  return record && typeof record.id === 'string' && record.id.length > 0 && record.id.length <= 100 &&
    [['customer', 100], ['details', 2000], ['next', 300]].every(([key, limit]) =>
      typeof record[key] === 'string' && record[key].trim().length > 0 && record[key].length <= limit) && statuses.includes(record.status);
}
try {
  const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (!Array.isArray(stored) || !stored.every(validRecord) || new Set(stored.map(record => record.id)).size !== stored.length) throw new Error('Invalid stored records');
  records = stored;
} catch {
  storageReadable = false;
  notice.textContent = 'Stored data could not be read. Saving is disabled to avoid overwriting it. Check browser storage permissions or recover existing data before continuing.';
  form.querySelector('button').disabled = true;
}
function persist(updated) {
  if (!storageReadable) return false;
  try {
    localStorage.setItem(storageKey, JSON.stringify(updated));
    records = updated;
    notice.textContent = 'Saved in this browser. Export regularly for a backup.';
    render();
    return true;
  } catch {
    notice.textContent = 'Could not save. Changes were not applied. Keep this page open, export existing records, and check browser storage.';
    return false;
  }
}
function textElement(tag, text) {
  const element = document.createElement(tag);
  element.textContent = text;
  return element;
}
function render() {
  document.querySelector('#count').textContent = records.length;
  list.replaceChildren();
  const visible = records.filter(record => filter.value === 'all' || record.status === filter.value);
  if (!visible.length) {
    const empty = textElement('p', records.length ? 'No requests with this status.' : 'A clean slate. Add your first request to get started.');
    empty.className = 'empty';
    list.append(empty);
  }
  for (const record of visible) {
    const article = document.createElement('article');
    article.className = 'request';
    article.append(textElement('h3', record.customer), textElement('p', record.details), textElement('p', 'Next: ' + record.next));
    const actions = document.createElement('div');
    actions.className = 'request-actions';
    const select = document.createElement('select');
    select.setAttribute('aria-label', 'Status for ' + record.customer);
    statuses.forEach(status => select.add(new Option(status, status)));
    select.value = record.status;
    select.addEventListener('change', () => {
      if (!persist(records.map(item => item.id === record.id ? {...item, status: select.value} : item))) select.value = record.status;
    });
    const remove = textElement('button', 'Delete');
    remove.type = 'button';
    remove.setAttribute('aria-label', 'Delete request for ' + record.customer);
    remove.addEventListener('click', () => {
      if (confirm('Delete the request for ' + record.customer + '? This cannot be undone.')) {
        if (persist(records.filter(item => item.id !== record.id))) filter.focus();
      }
    });
    actions.append(select, remove);
    article.append(actions);
    list.append(article);
  }
}
form.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(form);
  const record = {id: crypto.randomUUID(), customer: data.get('customer').trim(), details: data.get('details').trim(), next: data.get('next').trim(), status: 'New'};
  if (!validRecord(record)) {
    notice.textContent = 'Complete every field with non-blank text within the length limits.';
    return;
  }
  if (persist([record, ...records])) {
    form.reset();
    document.querySelector('#customer').focus();
  }
});
filter.addEventListener('change', render);
document.querySelector('#export').addEventListener('click', () => {
  if (!storageReadable) {
    notice.textContent = 'Export unavailable: stored records could not be read. Existing storage has not been changed.';
    return;
  }
  const url = URL.createObjectURL(new Blob([JSON.stringify(records, null, 2)], {type: 'application/json'}));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'rentun-requests-' + new Date().toISOString().slice(0, 10) + '.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  notice.textContent = 'JSON export requested. Keep the downloaded file somewhere safe.';
});
render();
