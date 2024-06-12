import MarkdownIt from 'markdown-it';
import StateCore from 'markdown-it/lib/rules_core/state_core';
import Token from 'markdown-it/lib/token';

import {addHiddenProperty, generateID} from './utils';
import {copyRuntimeFiles} from './copyRuntimeFiles';
import {getName, getTabId, getTabKey} from './getTabId';
import {
    ACTIVE_CLASSNAME,
    DEFAULT_TABS_GROUP_PREFIX,
    GROUP_DATA_KEY,
    TABS_CLASSNAME,
    TABS_LIST_CLASSNAME,
    TABS_VERTICAL_CLASSNAME,
    TAB_ACTIVE_KEY,
    TAB_CLASSNAME,
    TAB_DATA_ID,
    TAB_DATA_KEY,
    TAB_DATA_VERTICAL_TAB,
    TAB_PANEL_CLASSNAME,
    VERTICAL_TAB_CLASSNAME,
} from '../common';

export type PluginOptions = {
    runtimeJsPath: string;
    runtimeCssPath: string;
    containerClasses: string;
    bundle: boolean;
};

export type TabsOrientation = 'vertical' | 'horizontal';

const TAB_RE = /`?{% list tabs( group=([^ ]*))?( (vertical)|(horizontal))? %}`?/;

let runsCounter = 0;

export type Tab = {
    name: string;
    tokens: Token[];
    listItem: Token;
};

type TransformOptions = {
    output?: string;
};

function findTabs(tokens: Token[], idx: number) {
    const tabs = [];
    let i = idx,
        nestedLevel = -1,
        pending: Tab = {name: '', tokens: [], listItem: new Token('list_item_open', '', 0)};

    while (i < tokens.length) {
        const token = tokens[i];

        switch (token.type) {
            case 'ordered_list_open':
            case 'bullet_list_open':
                if (nestedLevel > -1) {
                    pending.tokens.push(token);
                }
                nestedLevel++;
                break;
            case 'list_item_open':
                if (nestedLevel) {
                    pending.tokens.push(token);
                } else {
                    pending = {name: '', tokens: [], listItem: token};
                }
                break;
            case 'list_item_close':
                if (nestedLevel) {
                    pending.tokens.push(token);
                } else {
                    tabs.push(pending);
                }
                break;
            case 'ordered_list_close':
            case 'bullet_list_close':
                if (!nestedLevel) {
                    return {
                        tabs,
                        index: i,
                    };
                }

                nestedLevel--;

                pending.tokens.push(token);

                break;
            case 'paragraph_open':
                if (
                    !pending &&
                    tokens[i + 1].content &&
                    tokens[i + 1].content.trim() === '{% endlist %}'
                ) {
                    return {
                        tabs,
                        index: i + 2,
                    };
                }

                if (!pending.name && tokens[i + 1].type === 'inline') {
                    pending.name = tokens[i + 1].content;
                    i += 2;
                } else {
                    pending.tokens.push(token);
                }
                break;
            default:
                pending.tokens.push(token);
        }

        i++;
    }

    return {
        tabs,
        index: i,
    };
}

function insertTabs(
    tabs: Tab[],
    state: StateCore,
    align: TabsOrientation,
    {start, end}: {start: number; end: number},
    {
        containerClasses,
        tabsGroup,
        runId,
    }: {containerClasses: string; tabsGroup: string; runId: string},
) {
    const tabsTokens = [];
    const tabListTokens = [];
    const tabPanelsTokens = [];
    const tabsOpen = new state.Token('tabs_open', 'div', 1);
    const tabsClose = new state.Token('tabs_close', 'div', -1);
    const tabListOpen = new state.Token('tab-list_open', 'div', 1);
    const tabListClose = new state.Token('tab-list_close', 'div', -1);

    if (tabs.length) {
        const [start] = tabs[0].listItem.map ?? [null];
        // eslint-disable-next-line no-eq-null, eqeqeq
        if (start == null) {
            throw new Error('failed to parse line mapping');
        }

        const [_, end] = tabs[tabs.length - 1].listItem.map ?? [null, null];
        // eslint-disable-next-line no-eq-null, eqeqeq
        if (end == null) {
            throw new Error('failed to parse line mapping');
        }

        tabListOpen.map = [start, end];
    }

    tabsOpen.block = true;
    tabsClose.block = true;
    tabListOpen.block = true;
    tabListClose.block = true;

    const areTabsVerticalClass = align === 'vertical' && TABS_VERTICAL_CLASSNAME;

    tabsOpen.attrSet(
        'class',
        [TABS_CLASSNAME, containerClasses, areTabsVerticalClass].filter(Boolean).join(' '),
    );
    tabsOpen.attrSet(GROUP_DATA_KEY, tabsGroup);
    tabListOpen.attrSet('class', TABS_LIST_CLASSNAME);
    tabListOpen.attrSet('role', 'tablist');

    if (align === 'vertical') {
        tabsTokens.push(tabsOpen);
    }

    for (let i = 0; i < tabs.length; i++) {
        const tabOpen = new state.Token('tab_open', 'div', 1);
        const tabInline = new state.Token('inline', '', 0);
        const tabText = new state.Token('text', '', 0);
        const tabClose = new state.Token('tab_close', 'div', -1);
        const tabPanelOpen = new state.Token('tab-panel_open', 'div', 1);
        const tabPanelClose = new state.Token('tab-panel_close', 'div', -1);

        const verticalTabOpen = new state.Token('tab_open', 'input', 0);
        const verticalTabLabelOpen = new state.Token('label_open', 'label', 1);

        tabOpen.map = tabs[i].listItem.map;
        tabOpen.markup = tabs[i].listItem.markup;

        const tab = tabs[i];
        const tabId = getTabId(tab, {runId});
        const tabKey = getTabKey(tab);
        tab.name = getName(tab);

        const tabPanelId = generateID();

        verticalTabOpen.block = true;

        verticalTabOpen.attrJoin('class', 'radio');
        verticalTabOpen.attrSet('type', 'radio');

        tabOpen.map = tabs[i].listItem.map;
        tabOpen.markup = tabs[i].listItem.markup;
        tabText.content = tabs[i].name;
        tabInline.children = [tabText];
        tabOpen.block = true;
        tabClose.block = true;
        tabPanelOpen.block = true;
        tabPanelClose.block = true;
        tabOpen.attrSet(TAB_DATA_ID, tabId);
        tabOpen.attrSet(TAB_DATA_KEY, tabKey);
        tabOpen.attrSet(TAB_ACTIVE_KEY, i === 0 ? 'true' : 'false');
        tabOpen.attrSet('class', TAB_CLASSNAME);
        tabOpen.attrJoin('class', 'yfm-tab-group');
        tabOpen.attrSet('role', 'tab');
        tabOpen.attrSet('aria-controls', tabPanelId);
        tabOpen.attrSet('aria-selected', 'false');
        tabOpen.attrSet('tabindex', i === 0 ? '0' : '-1');
        tabPanelOpen.attrSet('id', tabPanelId);
        tabPanelOpen.attrSet('class', TAB_PANEL_CLASSNAME);
        tabPanelOpen.attrSet('role', 'tabpanel');
        tabPanelOpen.attrSet('aria-labelledby', tabId);
        tabPanelOpen.attrSet('data-title', tab.name);

        if (align === 'vertical') {
            tabOpen.attrSet(TAB_DATA_VERTICAL_TAB, 'true');
            tabOpen.attrJoin('class', VERTICAL_TAB_CLASSNAME);
        }

        if (i === 0) {
            if (align === 'horizontal') {
                tabOpen.attrJoin('class', ACTIVE_CLASSNAME);
                tabOpen.attrSet('aria-selected', 'true');
            } else {
                verticalTabOpen.attrSet('checked', 'true');
            }

            tabPanelOpen.attrJoin('class', ACTIVE_CLASSNAME);
        }

        if (align === 'vertical') {
            tabsTokens.push(tabOpen, verticalTabOpen, verticalTabLabelOpen, tabInline, tabClose);
            tabsTokens.push(tabPanelOpen, ...tabs[i].tokens, tabPanelClose);
        } else {
            tabListTokens.push(tabOpen, tabInline, tabClose);
            tabPanelsTokens.push(tabPanelOpen, ...tabs[i].tokens, tabPanelClose);
        }
    }

    if (align === 'horizontal') {
        tabsTokens.push(tabsOpen);
        tabsTokens.push(tabListOpen);
        tabsTokens.push(...tabListTokens);
        tabsTokens.push(tabListClose);
        tabsTokens.push(...tabPanelsTokens);
    }

    tabsTokens.push(tabsClose);

    state.tokens.splice(start, end - start + 1, ...tabsTokens);

    return tabsTokens.length;
}

function findCloseTokenIdx(tokens: Token[], idx: number) {
    let level = 0;
    let i = idx;
    while (i < tokens.length) {
        if (matchOpenToken(tokens, i)) {
            level++;
        } else if (matchCloseToken(tokens, i)) {
            if (level === 0) {
                return i;
            }
            level--;
        }

        i++;
    }

    return null;
}

function matchCloseToken(tokens: Token[], i: number) {
    return (
        tokens[i].type === 'paragraph_open' &&
        tokens[i + 1].type === 'inline' &&
        tokens[i + 1].content.trim() === '{% endlist %}'
    );
}

function matchOpenToken(tokens: Token[], i: number) {
    return (
        tokens[i].type === 'paragraph_open' &&
        tokens[i + 1].type === 'inline' &&
        tokens[i + 1].content.match(TAB_RE)
    );
}

export function transform({
    runtimeJsPath = '_assets/tabs-extension.js',
    runtimeCssPath = '_assets/tabs-extension.css',
    containerClasses = '',
    bundle = true,
}: Partial<PluginOptions> = {}) {
    return function tabs(md: MarkdownIt, options?: TransformOptions) {
        const {output = '.'} = options || {};
        const plugin = (state: StateCore) => {
            const {env, tokens} = state;
            const runId = String(++runsCounter);

            addHiddenProperty(env, 'bundled', new Set<string>());

            let i = 0;
            let tabsAreInserted = false;

            while (i < tokens.length) {
                const match = matchOpenToken(tokens, i);
                const openTag = match && match[0];
                const isNotEscaped = openTag && !(openTag.startsWith('`') && openTag.endsWith('`'));

                if (!match || !isNotEscaped) {
                    i++;
                    continue;
                }

                const closeTokenIdx = findCloseTokenIdx(tokens, i + 3);

                if (!closeTokenIdx) {
                    tokens[i].attrSet('YFM005', 'true');
                    i += 3;
                    continue;
                }

                const tabsGroup = match[2] || `${DEFAULT_TABS_GROUP_PREFIX}${generateID()}`;
                const orientation = (match[4] || 'horizontal') as TabsOrientation;

                const {tabs, index} = findTabs(state.tokens, i + 3);

                if (tabs.length > 0) {
                    insertTabs(
                        tabs,
                        state,
                        orientation,
                        {start: i, end: index + 3},
                        {
                            containerClasses,
                            tabsGroup,
                            runId,
                        },
                    );
                    i++;
                    tabsAreInserted = true;
                } else {
                    state.tokens.splice(i, index - i);
                }
            }

            if (tabsAreInserted) {
                env.meta = env.meta || {};
                env.meta.script = env.meta.script || [];
                env.meta.style = env.meta.style || [];
                env.meta.script.push(runtimeJsPath);
                env.meta.style.push(runtimeCssPath);

                if (bundle) {
                    copyRuntimeFiles({runtimeJsPath, runtimeCssPath, output}, env.bundled);
                }
            }
        };

        try {
            md.core.ruler.before('curly_attributes', 'tabs', plugin);
        } catch (e) {
            md.core.ruler.push('tabs', plugin);
        }
    };
}
