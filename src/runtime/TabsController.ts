import {
    ACTIVE_CLASSNAME,
    DEFAULT_TABS_GROUP_PREFIX,
    GROUP_DATA_KEY,
    SelectedTabEvent,
    TABS_CLASSNAME,
    TABS_LIST_CLASSNAME,
    TABS_VERTICAL_CLASSNAME,
    TAB_CLASSNAME,
    TAB_DATA_ID,
    TAB_DATA_KEY,
    TAB_PANEL_CLASSNAME,
    Tab,
} from '../common';
import type {TabsOrientation} from '../plugin/transform';
import {
    ElementOffset,
    getClosestScrollableParent,
    getEventTarget,
    getOffsetByScrollableParent,
    isCustom,
} from './utils';

const Selector = {
    TABS: `.${TABS_CLASSNAME}`,
    TAB_LIST: `.${TABS_LIST_CLASSNAME}`,
    TAB: `.${TAB_CLASSNAME}`,
    TAB_PANEL: `.${TAB_PANEL_CLASSNAME}`,
    VERTICAL_TABS: `.${TABS_VERTICAL_CLASSNAME}`,
};

export interface ISelectTabByIdOptions {
    scrollToElement: boolean;
}

type Handler = (data: SelectedTabEvent) => void;

type TabSwitchDirection = 'left' | 'right';

export class TabsController {
    private _document: Document;

    private _onSelectTabHandlers: Set<Handler> = new Set();

    constructor(document: Document) {
        this._document = document;
        this._document.addEventListener('click', (event) => {
            const target = getEventTarget(event) as HTMLElement;
            const areVertical = this.areTabsVertical(target);

            if (isCustom(event)) {
                return;
            }

            if (!(this.isValidTabElement(target) || areVertical)) {
                return;
            }

            const tab = this.getTabDataFromHTMLElement(target);

            if (tab) {
                this._selectTab(tab, target);
            }
        });
        this._document.addEventListener('keydown', (event) => {
            let direction: TabSwitchDirection | null = null;
            switch (event.key) {
                case 'ArrowLeft': {
                    direction = 'left';
                    break;
                }
                case 'ArrowRight': {
                    direction = 'right';
                    break;
                }
            }
            if (!direction) {
                return;
            }

            const target = getEventTarget(event) as HTMLElement;

            if (isCustom(event) || !this.isValidTabElement(target)) {
                return;
            }

            const {tabs, nodes} = this.getTabs(target);
            const currentTab = this.getTabDataFromHTMLElement(target);
            const currentTabIndex = tabs.findIndex(
                ({key}) => currentTab?.key && key === currentTab.key,
            );
            if (!currentTab || tabs.length <= 1 || currentTabIndex === -1) {
                return;
            }

            const newIndex =
                (currentTabIndex + (direction === 'left' ? -1 : 1) + tabs.length) % tabs.length;

            this.selectTab(tabs[newIndex]);
            nodes[newIndex].focus();
        });
    }

    onSelectTab(handler: Handler) {
        this._onSelectTabHandlers.add(handler);

        return () => {
            this._onSelectTabHandlers.delete(handler);
        };
    }

    selectTabById(id: string, options?: ISelectTabByIdOptions) {
        const target = this._document.querySelector(
            `${Selector.TAB}[${TAB_DATA_ID}="${id}"]`,
        ) as HTMLElement;

        if (!target || !this.isValidTabElement(target)) {
            return;
        }

        const tab = this.getTabDataFromHTMLElement(target);

        if (tab) {
            this._selectTab(tab, target);
        }

        if (options?.scrollToElement) {
            target.scrollIntoView();
        }
    }

    selectTab(tab: Tab) {
        this._selectTab(tab);
    }

    private _selectTab(tab: Tab, targetTab?: HTMLElement) {
        const {group, key, align} = tab;

        if (!group) {
            return;
        }

        const scrollableParent = targetTab && getClosestScrollableParent(targetTab);
        const previousTargetOffset =
            scrollableParent && getOffsetByScrollableParent(targetTab, scrollableParent);

        const updatedTabs = this.updateHTML({group, key, align}, align);

        if (updatedTabs > 0) {
            this.fireSelectTabEvent({group, key, align}, targetTab?.dataset.diplodocId);

            if (previousTargetOffset) {
                this.resetScroll(targetTab, scrollableParent, previousTargetOffset);
            }
        }
    }

    private updateHTML(tab: Required<Tab>, align: TabsOrientation) {
        switch (align) {
            case 'vertical': {
                return this.updateHTMLVertical(tab);
            }
            case 'horizontal': {
                return this.updateHTMLHorizontal(tab);
            }
        }

        return 0;
    }

    private updateHTMLVertical(tab: Required<Tab>) {
        const {group, key} = tab;

        const [tabs] = this._document.querySelectorAll(
            `${Selector.TABS}[${GROUP_DATA_KEY}="${group}"] ${Selector.TAB}[${TAB_DATA_KEY}="${key}"]`,
        );

        let updated = 0;
        const root = tabs.parentNode!;
        const elements = root.children;

        for (let i = 0; i < elements.length; i += 2) {
            const [title, content] = [elements.item(i), elements.item(i + 1)] as HTMLElement[];

            const input = title.children.item(0) as HTMLInputElement;

            if (input.hasAttribute('checked')) {
                title.classList.remove('active');
                content?.classList.remove('active');
                input.removeAttribute('checked');
            }

            if (title === tabs) {
                title.classList.add('active');
                content?.classList.add('active');
                input.setAttribute('checked', 'true');
            }

            updated++;
        }

        return updated;
    }

    private updateHTMLHorizontal(tab: Required<Tab>) {
        const {group, key} = tab;

        const tabs = this._document.querySelectorAll(
            `${Selector.TABS}[${GROUP_DATA_KEY}="${group}"] ${Selector.TAB}[${TAB_DATA_KEY}="${key}"]`,
        );

        let updated = 0;

        tabs.forEach((element) => {
            const htmlElem = element as HTMLElement;
            if (!this.isValidTabElement(htmlElem) || htmlElem.dataset.diplodocIsActive === 'true') {
                return;
            }

            updated++;

            const tab = element;
            const tabList = tab.parentNode;
            const tabsContainer = tabList?.parentNode;
            const allTabs = Array.from(tabList?.querySelectorAll(Selector.TAB) || []);
            const allPanels = Array.from(tabsContainer?.children || []).filter((node) =>
                node.classList.contains(TAB_PANEL_CLASSNAME),
            );
            const targetIndex = allTabs.indexOf(tab);

            allTabs.forEach((tab, i) => {
                const panel = allPanels[i];
                const isTargetTab = i === targetIndex;
                const htmlElem = tab as HTMLElement;

                htmlElem.dataset.diplodocIsActive = isTargetTab ? 'true' : 'false';

                tab.classList.toggle(ACTIVE_CLASSNAME, isTargetTab);
                tab.setAttribute('aria-selected', isTargetTab.toString());
                tab.setAttribute('tabindex', isTargetTab ? '0' : '-1');
                panel.classList.toggle(ACTIVE_CLASSNAME, isTargetTab);
            });
        });

        return updated;
    }

    private resetScroll(
        target: HTMLElement,
        scrollableParent: HTMLElement,
        previousTargetOffset: ElementOffset,
    ) {
        const targetOffset = getOffsetByScrollableParent(target, scrollableParent);
        const topDelta = targetOffset.top - previousTargetOffset.top;
        const leftDelta = targetOffset.left - previousTargetOffset.left;
        const scrollTopDelta = targetOffset.scrollTop - previousTargetOffset.scrollTop;
        const scrollLeftDelta = targetOffset.scrollLeft - previousTargetOffset.scrollLeft;
        scrollableParent.scrollTo(
            scrollableParent.scrollLeft + leftDelta - scrollLeftDelta,
            scrollableParent.scrollTop + topDelta - scrollTopDelta,
        );
    }

    private fireSelectTabEvent(tab: Required<Tab>, diplodocId?: string) {
        const {group, key, align} = tab;

        const eventTab: Tab = group.startsWith(DEFAULT_TABS_GROUP_PREFIX) ? {key, align} : tab;

        this._onSelectTabHandlers.forEach((handler) => {
            handler({tab: eventTab, currentTabId: diplodocId});
        });
    }

    private isValidTabElement(element: HTMLElement) {
        const tabList =
            element.matches(Selector.TAB) && element.dataset.diplodocId
                ? element.closest(Selector.TAB_LIST)
                : null;

        return tabList?.closest(Selector.TABS);
    }

    private areTabsVertical(target: HTMLElement) {
        const parent = target.parentElement;

        return target.dataset.diplodocVerticalTab || Boolean(parent?.dataset.diplodocVerticalTab);
    }

    private getTabDataFromHTMLElement(target: HTMLElement): Tab | null {
        if (this.areTabsVertical(target)) {
            const tab = target.dataset.diplodocVerticalTab ? target : target.parentElement!;

            const key = tab.dataset.diplodocKey;
            const group = (tab.closest(Selector.TABS) as HTMLElement)?.dataset.diplodocGroup;
            return key && group ? {group, key, align: 'vertical'} : null;
        }

        const key = target.dataset.diplodocKey;
        const group = (target.closest(Selector.TABS) as HTMLElement)?.dataset.diplodocGroup;
        return key && group ? {group, key, align: 'horizontal'} : null;
    }

    private getTabs(target: HTMLElement): {tabs: Tab[]; nodes: NodeListOf<HTMLElement>} {
        const group = (target.closest(Selector.TABS) as HTMLElement)?.dataset.diplodocGroup;
        const nodes = (
            target.closest(Selector.TAB_LIST) as HTMLElement
        )?.querySelectorAll<HTMLElement>(Selector.TAB);

        const tabs: Tab[] = [];
        nodes.forEach((tabEl) => {
            const key = tabEl?.dataset.diplodocKey;
            if (!key) {
                return;
            }

            /** horizontal-only supported feature (used in left/right button click) */
            tabs.push({
                group,
                key,
                align: 'horizontal',
            });
        });

        return {tabs, nodes};
    }
}
