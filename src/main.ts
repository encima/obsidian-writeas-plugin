import { App, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';
import { WriteasClient } from './Writeas';

interface WriteasPluginSettings {
	writeasUser: string;
	writeasPassword: string;
	writeasServer: string;
}

const DEFAULT_SETTINGS: WriteasPluginSettings = {
	writeasUser: 'default',
	writeasPassword: 'default',
	writeasServer: 'https://write.as'
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
			id: 'open-publish-simple',
			name: 'Publish/update',
			hotkeys: [],
			callback: () => {
				var file = this.app.workspace.getActiveFile()
				if (file) {
					this.handleFile(file);
				}
			}
		});

		this.addSettingTab(new SettingTab(this.app, this));


	}


	async handleFile(file: TFile) {
		let c = new WriteasClient(this.settings.writeasUser, this.settings.writeasPassword, this.settings.writeasServer);
		this.app.vault.cachedRead(file).then(async lines => {
			var content = this.app.metadataCache.getFileCache(file);
			if (content?.frontmatter && content.frontmatter[COLL_KEY]) {
				let coll = content.frontmatter[COLL_KEY]
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
				let res: { [x: string]: any; };
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
					// const keys: Record<string, string> = { 'writeas_url': res['url'], '_writeas_id': res['id'] }
					app.fileManager.processFrontMatter(file, (frontmatter) => {
						frontmatter["writeas_url"] = res['url'];
						frontmatter["_writeas_id"] = res['id'];
					});
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

		new Setting(containerEl)
			.setName('Writeas Server')
			.setDesc('')
			.addText(text => text
				.setPlaceholder('Enter the URL of your WriteFreely server')
				.setValue(this.plugin.settings.writeasServer)
				.onChange(async (value) => {
					this.plugin.settings.writeasServer = value;
					await this.plugin.saveSettings();
				}));
	}
}
