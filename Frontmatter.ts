/**
 * Original: https://github.com/mcndt/obsidian-quickshare
 * Slightly modified for own purposes
 */

import type { App, TFile } from "obsidian";

function _getFrontmatterKey(
    file: TFile,
    key: string,
    app: App
): string {
    const fmCache = app.metadataCache.getFileCache(file)?.frontmatter;
    return fmCache?.[key] || undefined;
}

function _setFrontmatterKey(
    file: TFile,
    key: string,
    value: string,
    content: string
): string {
    if (_getFrontmatterKey(file, key, app) === value) {
        console.log("returning");
        return content;
    }

    if (_getFrontmatterKey(file, key, app) !== undefined) {
        // replace the existing key.
        content = content.replace(
            new RegExp(`^(${key}):\\s*(.*)$`, "m"),
            `${key}: ${value}`
        );
    } else {
        if (content.match(/^---/)) {
            // add the key to the existing block
            content = content.replace(
                /^---/,
                `---\n${key}: ${value}`
            );
        } else {
            // create a new block
            content = `---\n${key}: ${value}\n---\n${content}`;
        }
    }

    return content;
}

async function _setFrontmatterKeys(
    file: TFile,
    records: Record<string, string>,
    app: App
) {
    let content = await app.vault.read(file);
    for (const [key, value] of Object.entries(records)) {
        if (_getFrontmatterKey(file, key, app) !== value) {
            content = _setFrontmatterKey(
                file,
                key,
                value,
                content
            );
        }
    }
    await app.vault.modify(file, content);
}

export function useFrontmatterHelper(app: App) {
    const getFrontmatterKey = (file: TFile, key: string) =>
        _getFrontmatterKey(file, key, app);

    const setFrontmatterKeys = (
        file: TFile,
        records: Record<string, string>
    ) => _setFrontmatterKeys(file, records, app);

    return {
        getFrontmatterKey,
        setFrontmatterKeys,
    };
}