import { WriteasClient } from 'Writeas';
import { App, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';
import { useFrontmatterHelper } from './Frontmatter';

interface WriteasPluginSettings {
	writeasUser: string;
	writeasPassword: string;
}

const DEFAULT_SETTINGS: WriteasPluginSettings = {
	writeasUser: 'default',
	writeasPassword: 'default'
}

const COLL_KEY = 'writeas_collection';

function removeFrontMatter(content: string) {
	const YAMLFrontMatter = /\---(.|\n)*?---/i;
	return content.replace(YAMLFrontMatter, "");
}

export default class WriteasPlugin extends Plugin {
	settings: WriteasPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Publish/update on write.as',
			hotkeys: [{ modifiers: ["Alt", "Shift"], key: "p" }],
			callback: () => {
				var file = this.app.workspace.getActiveFile()
				if (file) {
					this.handleFile(file);
				}
			}
		});

		this.addSettingTab(new SettingTab(this.app, this));


	}

	updateFrontmatter(file: TFile, keys: Record<string, string>) {
		let fm = useFrontmatterHelper(app)
		fm.setFrontmatterKeys(file, keys)
	}


	async handleFile(file: TFile) {
		let c = new WriteasClient(this.settings.writeasUser, this.settings.writeasPassword);
		this.app.vault.cachedRead(file).then(async lines => {
			var content = this.app.metadataCache.getFileCache(file);
			if (content?.frontmatter && content.frontmatter[COLL_KEY]) {
				let coll = content.frontmatter[COLL_KEY]
				console.log(coll);
				await c.login();
				// TODO check if collection is valid?
				// TODO check if post exists and if collection it is in has changed
				// let colls = await c.getCollections();
				// if (colls.some((colls: any) => !(colls.alias === coll))) {
				// 	console.error("Provided collection was not found")
				// 	new Notice('Provided collection does not exist')
				// 	// return
				// }
				let post_body = { body: removeFrontMatter(lines), title: file.basename };
				let res;
				if (content.frontmatter['_writeas_id']) {
					let id = content.frontmatter['_writeas_id'];
					res = await c.updatePost(post_body, id)
					if (res === undefined) {
						new Notice("Failed to update post. Does it exist?")
						return;
					}
					c.getPost(id);
				} else {
					res = await c.publishPost(post_body, content.frontmatter[COLL_KEY])
					if (res === undefined) {
						new Notice("Failed to publish, does the collection exist?")
						return;
					}
					const keys: Record<string, string> = { 'writeas_url': res['url'].replace('http', 'https'), '_writeas_id': res['id'] }
					this.updateFrontmatter(file, keys)
				}

			}
		});

	}


	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SettingTab extends PluginSettingTab {
	plugin: WriteasPlugin;

	constructor(app: App, plugin: WriteasPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Writeas User')
			.setDesc('')
			.addText(text => text
				.setPlaceholder('Enter your writeas username')
				.setValue(this.plugin.settings.writeasUser)
				.onChange(async (value) => {
					this.plugin.settings.writeasUser = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('Writeas Password')
			.setDesc('')
			.addText(text => text
				.setPlaceholder('Enter your writeas password')
				.setValue(this.plugin.settings.writeasPassword)
				.onChange(async (value) => {
					this.plugin.settings.writeasPassword = value;
					await this.plugin.saveSettings();
				}));
	}
}
