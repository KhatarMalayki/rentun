async (page) => {
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const context = await page.context().browser().newContext({acceptDownloads: true});
  const test = await context.newPage();
  const errors = [];
  test.on('pageerror', error => errors.push(error.message));
  try {
    await test.goto('http://127.0.0.1:4173');
    await test.locator('#customer').fill('Sample studio');
    await test.locator('#details').fill('<img src=x onerror=alert(1)> Request details');
    await test.locator('#next').fill('Send estimate');
    await test.getByRole('button', {name: 'Save request'}).click();
    assert(await test.locator('.request').count() === 1, 'Create failed');
    assert(await test.locator('.request img').count() === 0, 'Unsafe HTML rendering');
    await test.reload();
    assert(await test.locator('.request').count() === 1, 'Persistence failed');
    await test.getByLabel('Status for Sample studio').selectOption('Follow up');
    await test.locator('#filter').selectOption('New');
    assert(await test.locator('.request').count() === 0, 'Status filter failed');
    await test.locator('#filter').selectOption('Follow up');
    assert(await test.locator('.request').count() === 1, 'Status update failed');
    const downloaded = test.waitForEvent('download');
    await test.getByRole('button', {name: 'Export JSON'}).click();
    const download = await downloaded;
    const stream = await download.createReadStream();
    let exported = '';
    for await (const chunk of stream) exported += chunk;
    assert(JSON.parse(exported)[0].status === 'Follow up', 'Export content failed');
    test.once('dialog', dialog => dialog.dismiss());
    await test.getByRole('button', {name: 'Delete request for Sample studio'}).click();
    assert(await test.locator('.request').count() === 1, 'Cancel delete failed');
    test.once('dialog', dialog => dialog.accept());
    await test.getByRole('button', {name: 'Delete request for Sample studio'}).click();
    assert(await test.locator('.request').count() === 0, 'Delete failed');
    await test.locator('#customer').fill('   ');
    await test.locator('#details').fill('details');
    await test.locator('#next').fill('next');
    await test.getByRole('button', {name: 'Save request'}).click();
    assert(await test.locator('.request').count() === 0, 'Whitespace validation failed');
    const widths = [320, 390, 768, 1440];
    for (const width of widths) {
      await test.setViewportSize({width, height: 900});
      assert(await test.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Overflow at ' + width);
    }
    assert(await test.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].every(link => link.hash === '' || document.getElementById(link.hash.slice(1)))), 'Broken section link');
    await test.evaluate(() => localStorage.setItem('rentun.requests.v1', '{broken'));
    await test.reload();
    assert(await test.getByRole('button', {name: 'Save request'}).isDisabled(), 'Corrupt storage not protected');
    assert(await test.evaluate(() => localStorage.getItem('rentun.requests.v1')) === '{broken', 'Corrupt storage overwritten');
    await test.evaluate(() => localStorage.removeItem('rentun.requests.v1'));
    await test.reload();
    await test.evaluate(() => { Storage.prototype.setItem = () => { throw new DOMException('Full', 'QuotaExceededError'); }; });
    await test.locator('#customer').fill('Unsaved studio');
    await test.locator('#details').fill('Keep this input');
    await test.locator('#next').fill('Retry later');
    await test.getByRole('button', {name: 'Save request'}).click();
    assert(await test.locator('.request').count() === 0, 'Failed write appeared saved');
    assert(await test.locator('#details').inputValue() === 'Keep this input', 'Failed write lost input');
    assert((await test.locator('#notice').textContent()).includes('Could not save'), 'Missing storage error');
    assert(errors.length === 0, 'Browser errors: ' + errors.join(', '));
    return {passed: ['create', 'reload persistence', 'safe text rendering', 'status changes', 'filter', 'JSON export', 'cancel deletion', 'confirmed deletion', 'blank validation', '320/390/768/1440 layout', 'section links', 'corrupt storage protection', 'write failure preserves input'], errors};
  } finally {
    await context.close();
  }
}
