import {PluginOptions, transform} from '../src/plugin/transform';
import {callPlugin, tokenize} from './utils';
import {base, escaped, nestedTokenTypes, vertical} from './data/tabs';
// @ts-ignore
import Token from 'markdown-it/lib/token';

const defaultContent = [
    '# Create a folder',
    '',
    '{% list tabs %}',
    '',
    '- Python',
    '',
    '  About python',
    '',
    '- Tab with list',
    '  - One',
    '  - Two',
    '',
    '- Tab with list',
    '  1. One',
    '  2. Two',
    '',
    '{% endlist %}',
    '',
    'After tabs',
];


const defaultVerticalContent = [
    '# Create a folder',
    '',
    '{% list tabs vertical %}',
    '',
    '- Python',
    '',
    '  About python',
    '',
    '- Tab with list',
    '  - One',
    '  - Two',
    '',
    '- Tab with list',
    '  1. One',
    '  2. Two',
    '',
    '{% endlist %}',
    '',
    'After tabs',
];

const convertAttrsToObject = ({attrs}: Token) =>
    attrs?.reduce((acc: Record<string, string>, [name, value]) => {
        acc[name] = value;

        return acc;
    }, {}) || {};

function makeTransform(params?: {transformOptions?: Partial<PluginOptions>; content?: string[]}) {
    return callPlugin(
        transform({bundle: false, ...params?.transformOptions}),
        tokenize(params?.content || defaultContent),
    );
}

describe('plugin', () => {
    test('should convert vertical tabs to correct new token array', () => {
        // ACT
        const {tokens: result} = makeTransform({content: defaultVerticalContent});

        // ASSERT
        const clearJSON = JSON.parse(JSON.stringify(result.map(({attrs: _, ...item}) => item)));
        expect(clearJSON).toEqual(vertical);
    })

    test('Should convert to correct new token array', () => {
        // ACT
        const {tokens: result} = makeTransform();

        // ASSERT
        const clearJSON = JSON.parse(JSON.stringify(result.map(({attrs: _, ...item}) => item)));
        expect(clearJSON).toEqual(base);
    });

    test('Should use correct attrs', () => {
        // ARRANGE
        const attrs = [
            'data-diplodoc-id',
            'data-diplodoc-key',
            'data-diplodoc-is-active',
            'class',
            'role',
            'aria-controls',
            'aria-selected',
            'tabindex',
        ];

        // ACT
        const {tokens: result} = makeTransform();

        // ASSERT
        const tabs = result.filter(({type}) => type === 'tab_open');
        tabs.forEach((tab, i) => {
            const attrsObject = convertAttrsToObject(tab);

            expect(Object.keys(attrsObject)).toEqual(attrs);
            expect(attrsObject['class']).toEqual(`yfm-tab yfm-tab-group${i === 0 ? ' active' : ''}`);
            expect(attrsObject['role']).toEqual('tab');
            expect(attrsObject['tabindex']).toEqual(i === 0 ? '0' : '-1');
        });
    });

    test('Tab should fit tabPanel', () => {
        // ACT
        const {tokens: result} = makeTransform();

        // ASSERT
        const tabs = result.filter(({type}) => type === 'tab_open');
        const tabPanels = result.filter(({type}) => type === 'tab-panel_open');

        expect(tabs.length).toEqual(tabPanels.length);

        tabs.forEach((tab, i) => {
            const tabPanel = tabPanels[i];
            const attrsObject = convertAttrsToObject(tab);
            const panelAttrsObject = convertAttrsToObject(tabPanel);

            expect(attrsObject['aria-controls']).toEqual(panelAttrsObject['id']);
        });
    });

    test('Tab syntax is escaped', () => {
        // ACT
        const {tokens: result} = makeTransform({
            content: ['`{% list tabs %}`'],
        });

        // ASSERT
        expect(result).toEqual(escaped);
    });

    test('Should parse nested tabs', () => {
        // ACT
        const {tokens} = makeTransform({
            content: [
                '{% list tabs %}\n' +
                    '\n' +
                    '- tab1\n' +
                    '\n' +
                    '  content of tab1\n' +
                    '\n' +
                    '  {% list tabs %}\n' +
                    '\n' +
                    '  - nested_tab1\n' +
                    '\n' +
                    '    content of nested tab1\n' +
                    '\n' +
                    '  - nested_tab2\n' +
                    '\n' +
                    '    content of nested tab2\n' +
                    '\n' +
                    '  {% endlist %}\n' +
                    '\n' +
                    '- tab2\n' +
                    '\n' +
                    '  content of tab2\n' +
                    '\n' +
                    '{% endlist %}',
            ],
        });

        // ASSERT
        expect(tokens.map((token) => token.type)).toEqual(nestedTokenTypes);
    });

    describe('options', () => {
        test('should add an extra className to container node', () => {
            // ACT
            const {tokens: result} = makeTransform({
                transformOptions: {
                    containerClasses: 'test_1 test_2',
                },
            });

            // ASSERT
            const tabsContainer = result.filter(({type}) => type === 'tabs_open');
            const attrsObject = convertAttrsToObject(tabsContainer[0]);
            expect(attrsObject['class']).toEqual('yfm-tabs test_1 test_2');
        });

        test('should return the default className for container node', () => {
            // ACT
            const {tokens: result} = makeTransform();

            // ASSERT
            const tabsContainer = result.filter(({type}) => type === 'tabs_open');
            const attrsObject = convertAttrsToObject(tabsContainer[0]);
            expect(attrsObject['class']).toEqual('yfm-tabs');
        });

        test('should return custom runtimeJsPath and runtimeCssPath meta data', () => {
            // ACT
            const result = makeTransform({
                transformOptions: {
                    runtimeJsPath: 'path_1',
                    runtimeCssPath: 'path_2',
                },
            });

            // ASSERT
            expect(result.env).toEqual({
                meta: {
                    script: ['path_1'],
                    style: ['path_2'],
                },
            });
        });

        test('should return default runtimeJsPath and runtimeCssPath meta data', () => {
            // ACT
            const result = makeTransform();

            // ASSERT
            expect(result.env).toEqual({
                meta: {
                    script: ['_assets/tabs-extension.js'],
                    style: ['_assets/tabs-extension.css'],
                },
            });
        });
    });

    describe('tabs groups', () => {
        test('should set a random group name for the tabs container', () => {
            // ACT
            const {tokens: result} = makeTransform();

            // ASSERT
            const tabs = result.filter(({type}) => type === 'tabs_open');
            const attrsObject = convertAttrsToObject(tabs[0]);
            expect(attrsObject['data-diplodoc-group']).toMatch(/^defaultTabsGroup-[a-z0-9]{8}$/);
        });

        test('should set a specific group name for the tabs container', () => {
            // ACT
            const {tokens: result} = makeTransform({
                content: [
                    '{% list tabs group=group_1 %}',
                    '',
                    '- Tab with list',
                    '',
                    '{% endlist %}',
                ],
            });

            // ASSERT
            const tabsContainer = result.filter(({type}) => type === 'tabs_open');
            const attrsObject = convertAttrsToObject(tabsContainer[0]);
            expect(attrsObject['data-diplodoc-group']).toEqual('group_1');
        });
    });

    describe('tabs anchors', () => {
        test('should set default anchors for tabs', () => {
            // ACT
            const {tokens: result} = makeTransform();

            // ASSERT
            const tabs = result.filter(({type}) => type === 'tab_open');
            const attrsObject0 = convertAttrsToObject(tabs[0]);
            const attrsObject1 = convertAttrsToObject(tabs[1]);
            const attrsObject2 = convertAttrsToObject(tabs[2]);

            expect(result[result.indexOf(tabs[0]) + 1]?.children?.[0]?.content).toEqual('Python');
            expect(result[result.indexOf(tabs[1]) + 1]?.children?.[0]?.content).toEqual(
                'Tab with list',
            );
            expect(result[result.indexOf(tabs[2]) + 1]?.children?.[0]?.content).toEqual(
                'Tab with list',
            );
            expect(attrsObject0['data-diplodoc-id']).toEqual('python');
            expect(attrsObject1['data-diplodoc-id']).toEqual('tab-with-list');
            expect(attrsObject2['data-diplodoc-id']).toEqual('tab-with-list-1');
            expect(attrsObject0['data-diplodoc-key']).toEqual('python');
            expect(attrsObject1['data-diplodoc-key']).toEqual('tab%20with%20list');
            expect(attrsObject2['data-diplodoc-key']).toEqual('tab%20with%20list');
            expect(attrsObject0['data-diplodoc-is-active']).toEqual('true');
            expect(attrsObject1['data-diplodoc-is-active']).toEqual('false');
            expect(attrsObject2['data-diplodoc-is-active']).toEqual('false');
        });

        test('should set custom anchors for tabs', () => {
            // ACT
            const {tokens: result} = makeTransform({
                content: [
                    '{% list tabs %}',
                    '',
                    '- Python {#my-tab}',
                    '',
                    '- Java {#my-tab}',
                    '',
                    '{% endlist %}',
                ],
            });

            // ASSERT
            const tabs = result.filter(({type}) => type === 'tab_open');

            const attrsObject0 = convertAttrsToObject(tabs[0]);
            const attrsObject1 = convertAttrsToObject(tabs[1]);

            expect(result[result.indexOf(tabs[0]) + 1]?.children?.[0]?.content).toEqual('Python');
            expect(result[result.indexOf(tabs[1]) + 1]?.children?.[0]?.content).toEqual('Java');
            expect(attrsObject0['data-diplodoc-id']).toEqual('my-tab');
            expect(attrsObject1['data-diplodoc-id']).toEqual('my-tab-1');
            expect(attrsObject0['data-diplodoc-key']).toEqual('my-tab');
            expect(attrsObject1['data-diplodoc-key']).toEqual('my-tab');
        });

        test('should process tabs with special letters', () => {
            // ACT
            const {tokens: result} = makeTransform({
                content: [
                    '{% list tabs %}',
                    '',
                    '',
                    '- C#',
                    '',
                    '',
                    '- C++',
                    '',
                    '',
                    '{% endlist %}',
                ],
            });

            // ASSERT
            const tabs = result.filter(({type}) => type === 'tab_open');
            const attrsObject0 = convertAttrsToObject(tabs[0]);
            const attrsObject1 = convertAttrsToObject(tabs[1]);

            expect(result[result.indexOf(tabs[0]) + 1]?.children?.[0]?.content).toEqual('C#');
            expect(result[result.indexOf(tabs[1]) + 1]?.children?.[0]?.content).toEqual('C++');
            expect(attrsObject0['data-diplodoc-id']).toEqual('c');
            expect(attrsObject1['data-diplodoc-id']).toEqual('c-1');
            expect(attrsObject0['data-diplodoc-key']).toEqual('c%23');
            expect(attrsObject1['data-diplodoc-key']).toEqual('c%2b%2b');
        });
    });
});
