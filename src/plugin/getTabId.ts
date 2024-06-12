import GithubSlugger from 'github-slugger';

import {Tab} from './transform';

const CUSTOM_ID_REGEXP = /\[?{ ?#(\S+) ?}]?/;

const sluggersStorage = new Map<string, GithubSlugger>();

function parseName(name: string) {
    const parts = name.match(CUSTOM_ID_REGEXP);
    if (!parts) {
        return {
            name,
            customAnchor: null,
        };
    }

    return {
        name: name.replace(parts[0], '').trim(),
        customAnchor: parts[1],
    };
}

export function getTabId(tab: Tab, {runId}: {runId: string}) {
    let slugger = sluggersStorage.get(runId);
    if (!slugger) {
        slugger = new GithubSlugger();
        sluggersStorage.set(runId, slugger);
    }

    return slugger.slug(getRawId(tab));
}

export function getTabKey(tab: Tab) {
    return encodeURIComponent(getRawId(tab)).toLocaleLowerCase();
}

export function getName(tab: Tab) {
    return parseName(tab.name).name;
}

function getRawId(tab: Tab): string {
    return parseName(tab.name).customAnchor || tab.name;
}
