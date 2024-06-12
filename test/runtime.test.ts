import {PluginOptions, transform} from '../src/plugin/transform';
import {callPlugin, tokenize} from './utils';
// @ts-ignore
import Token from 'markdown-it/lib/token';
import {TabsController} from "../src/runtime/TabsController";
import {GROUP_DATA_KEY, TAB_CLASSNAME, TABS_LIST_CLASSNAME} from "../src/common";

const defaultContent = `
{% list tabs group=g0 %}

- Tab with unordered list

    Here is unordered list

    - Unordered list item 1

    - Unordered list item 2

    - Unordered list item 3

    - Unordered list item 4

- Tab with ordered list

    Here is ordered list

    1. Ordered list item 1

    1. Ordered list item 2

    1. Ordered list item 3

    1. Ordered list item 4

- First level tab

    Sample text inside first level tab

    {% list tabs group=g1 %}

    - Nested tab 1

        Contents of nested tab 1

    - Nested tab 2

        Contents of nested tab 2

    {% endlist %}

{% endlist %}
`;


function makeTransform(params?: { transformOptions?: Partial<PluginOptions>; content?: string[] }) {
    return callPlugin(
        transform({bundle: false, ...params?.transformOptions}),
        tokenize([defaultContent]),
    );
}

describe('Testing runtime features', () => {
    let tabs: NodeListOf<HTMLElement>;
    let nestedTabs: NodeListOf<HTMLElement>;

    beforeEach(() => {
        const {tokens, env, md} = makeTransform();
        document.body.innerHTML = md.renderer.render(tokens, {}, env);
        new TabsController(document);

        tabs = document.querySelectorAll(`[${GROUP_DATA_KEY}="g0"] > .${TABS_LIST_CLASSNAME} > .${TAB_CLASSNAME}`);
        nestedTabs = document.querySelectorAll(`[${GROUP_DATA_KEY}="g1"] > .${TABS_LIST_CLASSNAME} > .${TAB_CLASSNAME}`);

        if (!tabs.length) {
            throw new Error('No tabs found');
        }
    });

    test.each([0, 1, 2])('click on tab', (tabToSelectIndex) => {
        expect(tabs[0].classList.contains('active')).toBeTruthy();
        expect(tabs[1].classList.contains('active')).not.toBeTruthy();
        expect(tabs[2].classList.contains('active')).not.toBeTruthy();

        tabs[tabToSelectIndex].click();

        tabs.forEach((tab, index) => {
            if (tabToSelectIndex === index) {
                expect(tab.classList.contains('active')).toBeTruthy();
            } else {
                expect(tab.classList.contains('active')).not.toBeTruthy();
            }
        })
    });

    test('roving tabindex on pressing right', () => {
        expect(tabs[0].classList.contains('active')).toBeTruthy();
        expect(tabs[1].classList.contains('active')).not.toBeTruthy();
        expect(tabs[2].classList.contains('active')).not.toBeTruthy();

        tabs[0].focus();
        let keyDownEvent = new window.KeyboardEvent('keydown', {key: 'ArrowRight'});
        keyDownEvent.initEvent('keydown', true, true);
        tabs[0].dispatchEvent(keyDownEvent);

        expect(tabs[0].classList.contains('active')).not.toBeTruthy();
        expect(tabs[1].classList.contains('active')).toBeTruthy();
        expect(tabs[2].classList.contains('active')).not.toBeTruthy();
        expect(window.document.activeElement).toBe(tabs[1]);

        tabs[1].dispatchEvent(keyDownEvent);

        expect(tabs[0].classList.contains('active')).not.toBeTruthy();
        expect(tabs[1].classList.contains('active')).not.toBeTruthy();
        expect(tabs[2].classList.contains('active')).toBeTruthy();
        expect(window.document.activeElement).toBe(tabs[2]);

        tabs[2].dispatchEvent(keyDownEvent);

        expect(tabs[0].classList.contains('active')).toBeTruthy();
        expect(tabs[1].classList.contains('active')).not.toBeTruthy();
        expect(tabs[2].classList.contains('active')).not.toBeTruthy();
        expect(window.document.activeElement).toBe(tabs[0]);
    });

    test('roving tabindex on pressing left', () => {
        expect(tabs[0].classList.contains('active')).toBeTruthy();
        expect(tabs[1].classList.contains('active')).not.toBeTruthy();
        expect(tabs[2].classList.contains('active')).not.toBeTruthy();

        tabs[0].focus();
        let keyDownEvent = new window.KeyboardEvent('keydown', {key: 'ArrowLeft'});
        keyDownEvent.initEvent('keydown', true, true);
        tabs[0].dispatchEvent(keyDownEvent);

        expect(tabs[0].classList.contains('active')).not.toBeTruthy();
        expect(tabs[1].classList.contains('active')).not.toBeTruthy();
        expect(tabs[2].classList.contains('active')).toBeTruthy();
        expect(window.document.activeElement).toBe(tabs[2]);

        tabs[2].dispatchEvent(keyDownEvent);

        expect(tabs[0].classList.contains('active')).not.toBeTruthy();
        expect(tabs[1].classList.contains('active')).toBeTruthy();
        expect(tabs[2].classList.contains('active')).not.toBeTruthy();
        expect(window.document.activeElement).toBe(tabs[1]);

        tabs[1].dispatchEvent(keyDownEvent);

        expect(tabs[0].classList.contains('active')).toBeTruthy();
        expect(tabs[1].classList.contains('active')).not.toBeTruthy();
        expect(tabs[2].classList.contains('active')).not.toBeTruthy();
        expect(window.document.activeElement).toBe(tabs[0]);
    });

    test('roving tabindex should not work if not focused on tab', () => {
        const fakeButton = window.document.createElement('button');
        fakeButton.innerText = 'Fake button';
        window.document.body.append(fakeButton);
        expect(tabs[0].classList.contains('active')).toBeTruthy();
        expect(tabs[1].classList.contains('active')).not.toBeTruthy();
        expect(tabs[2].classList.contains('active')).not.toBeTruthy();

        fakeButton.focus();
        let keyDownEvent = new window.KeyboardEvent('keydown', {key: 'ArrowLeft'});
        keyDownEvent.initEvent('keydown', true, true);
        fakeButton.dispatchEvent(keyDownEvent);

        expect(tabs[0].classList.contains('active')).toBeTruthy();
        expect(tabs[1].classList.contains('active')).not.toBeTruthy();
        expect(tabs[2].classList.contains('active')).not.toBeTruthy();
        expect(window.document.activeElement).toBe(fakeButton);
    });

    test.each(['ArrowRight', 'ArrowLeft'])('roving tabindex works on nested tabs when pressing right/left arrow keys', (key) => {
        tabs[2].click();
        nestedTabs[0].click();
        nestedTabs[0].focus();

        expect(nestedTabs[0].classList.contains('active')).toBeTruthy();
        expect(nestedTabs[1].classList.contains('active')).not.toBeTruthy();
        expect(tabs[0].classList.contains('active')).not.toBeTruthy();
        expect(tabs[1].classList.contains('active')).not.toBeTruthy();
        expect(tabs[2].classList.contains('active')).toBeTruthy();

        let keyDownEvent = new window.KeyboardEvent('keydown', {key});
        keyDownEvent.initEvent('keydown', true, true);
        nestedTabs[0].dispatchEvent(keyDownEvent);

        expect(nestedTabs[0].classList.contains('active')).not.toBeTruthy();
        expect(nestedTabs[1].classList.contains('active')).toBeTruthy();
        expect(window.document.activeElement).toBe(nestedTabs[1]);
        expect(tabs[0].classList.contains('active')).not.toBeTruthy();
        expect(tabs[1].classList.contains('active')).not.toBeTruthy();
        expect(tabs[2].classList.contains('active')).toBeTruthy();

        nestedTabs[1].dispatchEvent(keyDownEvent);

        expect(nestedTabs[0].classList.contains('active')).toBeTruthy();
        expect(nestedTabs[1].classList.contains('active')).not.toBeTruthy();
        expect(window.document.activeElement).toBe(nestedTabs[0]);
        expect(tabs[0].classList.contains('active')).not.toBeTruthy();
        expect(tabs[1].classList.contains('active')).not.toBeTruthy();
        expect(tabs[2].classList.contains('active')).toBeTruthy();
    });
});
