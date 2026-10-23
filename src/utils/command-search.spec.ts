import { foldText, labelRanges, matchCommand, queryTokens, searchCommands, type KernCommandItem } from './command-search';

const ITEMS: KernCommandItem[] = [
  { id: 'scan', label: 'Start scan', group: 'Actions' },
  { id: 'devices', label: 'Devices', group: 'Pages' },
  { id: 'boiler', label: 'Boiler', group: 'Devices', keywords: ['192.168.1.20', 'water heater'] },
  { id: 'kitchen', label: 'Küche Licht', group: 'Devices' },
  { id: 'updates', label: 'Updates', group: 'Pages', keywords: ['firmware'] },
  { id: 'loose', label: 'Help' },
];

const ids = (groups: ReturnType<typeof searchCommands>) => groups.map((g) => [g.label, g.hits.map((h) => h.item.id)]);

describe('command search', () => {
  it('folds case and diacritics and splits the query into words', () => {
    expect(foldText('Küche ÉTÉ')).toBe('kuche ete');
    expect(queryTokens('  Küche   licht ')).toEqual(['kuche', 'licht']);
  });

  it('folds label and query the same way, also the Greek final sigma', () => {
    const items: KernCommandItem[] = [{ id: 'n', label: 'ΝΙΚΟΣ' }];
    for (const q of ['ΝΙΚΟΣ', 'νικος', 'νικοσ', 'Νίκος']) expect(searchCommands(items, q)[0]?.hits[0].ranges).toEqual([[0, 5]]);
    expect(foldText('ΝΙΚΟΣ')).toBe(foldText('νικος'));
  });

  it('groups in the order of the first entry of each group, all items without a query', () => {
    expect(ids(searchCommands(ITEMS, ''))).toEqual([
      ['Actions', ['scan']],
      ['Pages', ['devices', 'updates']],
      ['Devices', ['boiler', 'kitchen']],
      ['', ['loose']],
    ]);
  });

  it('needs every word in the label, a keyword or the group', () => {
    expect(ids(searchCommands(ITEMS, 'kuche'))).toEqual([['Devices', ['kitchen']]]);
    expect(ids(searchCommands(ITEMS, '192.168'))).toEqual([['Devices', ['boiler']]]);
    expect(ids(searchCommands(ITEMS, 'firmware'))).toEqual([['Pages', ['updates']]]);
    expect(ids(searchCommands(ITEMS, 'devices'))).toEqual([
      ['Pages', ['devices']],
      ['Devices', ['boiler', 'kitchen']],
    ]);
    expect(ids(searchCommands(ITEMS, 'kuche heater'))).toEqual([]);
    expect(ids(searchCommands(ITEMS, 'water boil'))).toEqual([['Devices', ['boiler']]]);
  });

  it('ranks label start before word start before anywhere before keywords', () => {
    const items: KernCommandItem[] = [
      { id: 'kw', label: 'Other', keywords: ['scanner'] },
      { id: 'inside', label: 'Rescan' },
      { id: 'word', label: 'Start scan' },
      { id: 'start', label: 'Scan network' },
    ];
    expect(ids(searchCommands(items, 'scan'))).toEqual([['', ['start', 'word', 'inside', 'kw']]]);
  });

  it('highlights the matched parts of the label in the original text', () => {
    expect(matchCommand(ITEMS[3], 3, ['kuche', 'li'])!.ranges).toEqual([
      [0, 5],
      [6, 8],
    ]);
    expect(labelRanges('Scan scan', ['sca', 'can'])).toEqual([[0, 4]]);
    expect(matchCommand(ITEMS[2], 2, ['heater'])!.ranges).toEqual([]);
  });

  it('keeps all items without filtering and highlights what occurs in the label', () => {
    const groups = searchCommands(ITEMS, 'boi xyz', false);
    expect(groups.flatMap((g) => g.hits).length).toBe(ITEMS.length);
    expect(groups.flatMap((g) => g.hits).find((h) => h.item.id === 'boiler')!.ranges).toEqual([[0, 3]]);
  });
});
