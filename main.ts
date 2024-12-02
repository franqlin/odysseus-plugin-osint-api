import axios from 'axios';
import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFolder } from 'obsidian';
import { exec } from 'child_process';
import { promisify } from 'util';
import { Console } from 'console';
import { OdysseusPluginSettings, DEFAULT_SETTINGS, OdysseusPluginSettingTab } from './settings';

const execAsync = promisify(exec);
const ALLOW_FILE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "pdf"];
const START_MESSAGE = "Iniciar Sincronização!!";
const PROCESS_MESSAGE = "Media Sync in Process!!";
const END_MESSAGE = "Media Sync End!!";
const ERROR_MESSAGE = "Error Occurred!! Please retry.";
const SKIP_URLS = [
  "https://twitter.com/intent/tweet",
  "https://twitter.com/share",
  "https://search.yahoo.co.jp/search"
];

var import_obsidian2 = require("obsidian");

const getFilePrefix = (): string => {
	return 'media';
  };
  const getRondomString = (): string => {
	return Math.floor(Math.random() * 1e5).toString().padStart(5, "0");
  };
  
  const getResorceFolderName = (app: App, settings: OdysseusPluginSettings): string => {
    let resourceFolderName = '';
    const activeFile = app.workspace.getActiveFile();
    if (activeFile) {
      const filePath = activeFile.path;
      const directoryPath = filePath.substring(0, filePath.lastIndexOf('/'));
      return directoryPath;
    }
    return resourceFolderName;
};

//const downloadFiles = async (data: any, files: any[], resorceFolderName: string, adapter: any, useCache = true) => 
var downloadFiles = async (data:any, files:any[], resorceFolderName:string, adapter:any, useCache = true) => {
	var _a, _b;
	if (!await adapter.exists(resorceFolderName)) {
	  adapter.mkdir(resorceFolderName);
	}
	let totalCount;
	if (useCache) {
	  totalCount = (_a = files.filter(
		(file) => {
		  var _a2;
		  return !((_a2 = data == null ? void 0 : data.files) == null ? void 0 : _a2.some((f: string) => f === file.name));
		}
	  )) == null ? void 0 : _a.length;
	} else {
	  totalCount = files.length;
	}
	let currentCount = 1;
	const errorUrls: string[] = [];
	for (const file of files) {
	  const isSkip = (_b = data == null ? void 0 : data.files) == null ? void 0 : _b.some((f: string) => f === file.name);
	  if (isSkip && useCache) {
		continue;
	  }
	  const currentNotice = new Notice(
		`${PROCESS_MESSAGE} (${currentCount}/${totalCount})`,
		0
	  );
	  let fileContent = await adapter.read(file.path);
	  const prefix = getFilePrefix();
	  const currentFileFolderPath = `${resorceFolderName}/${prefix}`;
	  const urlMatches = fileContent.match(/https?:\/\/([\w!?/\-_=.&%;:,])+/g);
	  if (urlMatches) {
		for (const urlMatche of urlMatches) {
		  if (errorUrls.some((url) => url === urlMatche)) {
			continue;
		  }
		  const hasSkipUrls = SKIP_URLS.some((url) => urlMatche.startsWith(url));
		  if (hasSkipUrls) {
			continue;
		  }
		  try {
			const response = await ( import_obsidian2.requestUrl)(urlMatche);
			const contentType = response.headers["content-type"];
			if (contentType.startsWith("image") || contentType === "application/pdf") {
			  if (!await adapter.exists(currentFileFolderPath)) {
				adapter.mkdir(currentFileFolderPath);
			  }
			  const extension = contentType.split("/")[1];
			  const isAllowExtension = ALLOW_FILE_EXTENSIONS.some(
				(ext) => extension.toLowerCase() === ext
			  );
			  let fileName = getRondomString();
			  const contentDisposition = response.headers["content-disposition"];
			  if (contentDisposition) {
				const fileNameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
				if (fileNameMatch) {
				  fileName = fileNameMatch[1];
				}
			  }
			  let filePath = `${currentFileFolderPath}/file_${fileName}`;
			  if (isAllowExtension) {
				filePath = `${filePath}.${extension}`;
			  } else {
				const realUrl = urlMatche.split("?")[0];
				const realExtention = ALLOW_FILE_EXTENSIONS.find(
				  (ext) => realUrl.toLowerCase().endsWith(ext)
				);
				if (realExtention) {
				  filePath = `${filePath}.${realExtention}`;
				} else {
				  continue;
				}
			  }
			  fileContent = fileContent.replace(urlMatche, `![[${filePath}]]`);
			  let fileNotePath = `${filePath}.md`;
			  await adapter.writeBinary(filePath, response.arrayBuffer);
			  await adapter.write(
				fileNotePath,
				`![[${filePath}]] From note: [[${file.path}]] Original url: ${urlMatche}`
			  );
			}
		  } catch (error) {
			console.log("access url error: " + urlMatche);
			console.log(error);
			errorUrls.push(urlMatche);
		  }
		}
	  }
	  await adapter.write(file.path, fileContent);
	  data.files.push(file.name);
	  currentNotice.hide();
	  currentCount++;
	}
  };
  
  const saveFiles = async (app: App, plugin: Plugin, settings: OdysseusPluginSettings, selectFiles: any[] = [], useCache = true) => {
	const notices = [];
	notices.push(new Notice(START_MESSAGE, 2e3));
	console.log(START_MESSAGE);
	notices.push(new Notice(PROCESS_MESSAGE, 2e3));
	console.log(PROCESS_MESSAGE);
	let data;
	try {
	  const dataJson = await plugin.loadData();
	  data = JSON.parse(dataJson);
	} catch (error) {
	  console.log("load data error");
	  console.log(error);
	}
	if (!data) {
	  data = {};
	}
	if (!data.files) {
	  data.files = [];
	}
	let files = [];
	if (selectFiles.length > 0) {
	  files = selectFiles;
	} else {
	  files = app.vault.getMarkdownFiles();
	}
	const resorceFolderName = getResorceFolderName(app, settings);
	await downloadFiles(
	  data,
	  files,
	  resorceFolderName,
	  app.vault.adapter,
	  useCache
	);
	try {
	  const saveData = JSON.stringify({ ...data, ...settings });
	  await plugin.saveData(saveData);
	} catch (error) {
	  console.log("save data error");
	  console.log(error);
	  notices.push(new Notice(ERROR_MESSAGE, 0));
	}
	notices.push(new Notice(END_MESSAGE, 0));
	await new Promise((r) => setTimeout(r, 2e3));
	notices.forEach((notice) => notice.hide());
	console.log(END_MESSAGE);
  };	
	
export default class OdysseusAPIPlugin extends Plugin {
	settings: OdysseusPluginSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('horse', 'Odysseus::Enquecimento de Mídia"', (evt: MouseEvent) => {
			saveFiles(this.app, this, this.settings);
		});
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');
		this.addSettingTab(new OdysseusPluginSettingTab(this.app, this));
		
		this.addCommand({
			id: "media-sync-now",
			name: "Sync This File (1)",
			editorCallback: (editor: Editor, view: MarkdownView) => {
			  saveFiles(this.app, this, this.settings, [view.file], false);
			}
		  });
		  this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
			  menu.addItem((item) => {
				item.setTitle("Odysseus - Enriquecer Mídia").setIcon("horse").onClick(async () => {
				  if (file instanceof TFolder) {
					new Notice("A sincronização de mídia não suporta pastas.");
					return;
				  }
				  saveFiles(this.app, this, this.settings, [file], false);
				});
			  });
			})
		  );
		
		this.addCommand({
			id: 'buscar-por-cnpj-receita',
			name: 'Busca por Empresa CNPJ - Receita Federal',
			editorCallback: async (editor: Editor, view: MarkdownView) => {
                console.log(editor.getSelection());
                const cnpj = editor.getSelection().replace(/[^\d]/g, '');
                const comandoToken = `curl -k -s -o -X GET https://www.receitaws.com.br/v1/cnpj/${cnpj}`;
        
                const resultado = await executarCurl(comandoToken);
                const json_ = JSON.parse(resultado);
                const resultadoFormatado = formatJsonToGraph(json_);
                console.log(resultadoFormatado);

                const resultDiv = createResultDiv(`*Resultado da Busca:* ${cnpj}`);
                editor.replaceSelection(resultDiv + resultadoFormatado);
			}
		});
		function createResultDiv(text: string): string {
			return `*${text}*\n`;
		}
		function formatJsonToGraph(json: any, nivel: number = 0): string {
			let resultado = '';
			const espacos = ' '.repeat(nivel * 2); // Indentação
		
			for (const chave in json) {
				if (typeof json[chave] === 'object' && json[chave] !== null) {
					resultado += `${espacos}<div style="margin-left: ${nivel * 20}px;"><strong>${chave.toUpperCase()}</strong>:</div>\n`;
					resultado += formatJsonToGraph(json[chave], nivel + 1);
				} else {
					resultado += `${espacos}<div style="margin-left: ${nivel * 20}px;"><strong>${chave.toUpperCase()}</strong>: ${json[chave]}</div>\n`;
				}
			}
		
			return resultado;
		}
		
		function showWaitMessage() {
			const waitDiv = document.createElement('div');
			waitDiv.id = 'waitMessage';
			waitDiv.style.position = 'fixed';
			waitDiv.style.top = '50%';
			waitDiv.style.left = '50%';
			waitDiv.style.transform = 'translate(-50%, -50%)';
			waitDiv.style.padding = '20px';
			waitDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
			waitDiv.style.color = 'white';
			waitDiv.style.borderRadius = '5px';
			waitDiv.style.zIndex = '1000';
			waitDiv.innerText = 'Fazendo pesquisa...';
			document.body.appendChild(waitDiv);
		}
		function removeWaitMessage() {
			const waitDiv = document.getElementById('waitMessage');
			if (waitDiv) {
				document.body.removeChild(waitDiv);
			}
		}

        this.addCommand({
            id: 'buscar-por-whois',
            name: 'WHOIS',
            editorCallback: async (editor: Editor, view: MarkdownView) => {
                const query = editor.getSelection();
                showWaitMessage();
                try {
					const result = await fetchWhoisData(query);
					const jsonResult = parseWhoisOutput(result);
					const resultDiv = createResultDiv(`*Resultado da Busca WHOIS:* ${query}`);
					const formattedResult = formatarJsonParaObsidian(jsonResult);
					editor.replaceSelection(resultDiv + formattedResult);
                } catch (error) {
                    new Notice('Erro ao buscar dados do WHOIS');
                } finally {
                    removeWaitMessage();
                }
            }
        });
	
		async function fetchWhoisData(query: string): Promise<string> {
			try {
				
				const { stdout, stderr } = await execAsync(`whois ${query}`);
				if (stderr) {
					throw new Error(stderr);
				}
				return stdout;
			} catch (error) {
				throw new Error(`Erro na requisição: ${error.message}`);
			}
		}
		
		
		function parseWhoisOutput(output: string): Record<string, string> {
			const lines = output.split('\n');
			const result: Record<string, string> = {};
		
			lines.forEach(line => {
				const [key, ...value] = line.split(':');
				if (key && value.length > 0) {
					result[key.trim()] = value.join(':').trim();
				}
			});
		
			return result;
		}
;


		
		this.addCommand({
			id: 'buscar-instagram',
			name: 'Instagram',
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				const query = editor.getSelection();
				showWaitMessage();
				try {
					const result = await fetchInstagramData(query, this);
					const resultDiv = createResultDiv(`*Resultado da Busca Instagram:* ${query}`);
					console.log(result.data)
					const imageUrl = result.data.profile_pic_url;
					const caption = `Foto Perfil`;
					const imageResultMarkdown = createImageResultMarkdown(imageUrl, caption);
					const formattedResult = formatarJsonParaObsidian(result.data);
					
					editor.replaceSelection(resultDiv + imageResultMarkdown+formattedResult);
					new Notice('Busca Efetuada com sucesso');
				} catch (error) {
					new Notice('Erro ao buscar dados do Instagram');
				} finally {
					removeWaitMessage();
				}
			}
		});
		function createImageResultMarkdown(imageUrl: string, caption: string): string {
			return `${imageUrl}\n`;
		}
		
		function fetchInstagramData(username: string,plugin:OdysseusAPIPlugin): Promise<any> {
			return new Promise((resolve, reject) => {
				const xhr = new XMLHttpRequest();
				const url = `https://instagram-scraper-api2.p.rapidapi.com/v1/info?username_or_id_or_url=${username}`;
				
				xhr.open('GET', url);
				xhr.setRequestHeader('x-rapidapi-key', plugin.settings.rapidApiKey);
				xhr.setRequestHeader('x-rapidapi-host', plugin.settings.rapidApiHost);
				
				xhr.onload = () => {
					if (xhr.status >= 200 && xhr.status < 300) {
						resolve(JSON.parse(xhr.responseText));
					} else {
						reject(new Error(`Erro na requisição: ${xhr.statusText}`));
					}
				};
				
				xhr.onerror = () => reject(new Error('Erro na requisição'));
				
				xhr.send();
			});
		}

            const  apiService = new ApiService(this.app);
		
			this.addCommand({
				id: 'buscar-por-cnpj-receita',
				name: 'Busca por CNPJ - Receita Federal',
				editorCallback: async (editor: Editor, view: MarkdownView) => {
					console.log(editor.getSelection());
					const cnpj = editor.getSelection().replace(/[^\d]/g, '');
					const comandoToken = `curl -k -s -o -X GET https://www.receitaws.com.br/v1/cnpj/${cnpj}`;
                    showWaitMessage();
					const resultado = await executarCurl(comandoToken);
					removeWaitMessage();
					const json_ = JSON.parse(resultado);
					const resultadoFormatado = formatarJsonParaObsidian(json_);
					console.log(resultadoFormatado);
					editor.replaceSelection(`*Resultado da Busca:* ${cnpj}\n${resultadoFormatado}`);
				}
			});

			this.addCommand({
					id: 'buscar-por-ip',
					name: 'Busca dados do IP',
					editorCallback: async (editor: Editor, view: MarkdownView) => {
						showWaitMessage();
						await apiService.fetchIPData(editor);
						removeWaitMessage();
					}
				});

		

		// This adds a settings tab so the user can configure various aspects of the plugin
		//this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}
  async syncMedia(notePath: string) {
   
	
}
async loadSettings() {
    try {
        const data = await this.loadData();
        this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
    } catch (error) {
        console.error("Error loading settings:", error);
        this.settings = DEFAULT_SETTINGS;
    }
}

	async saveSettings() {
		await this.saveData(this.settings);
	}
	
}



const formatarJsonParaObsidian = (json: any, nivel: number = 0): string => {
    let resultado = '';
    const espacos = ' '.repeat(nivel * 2); // Indentação

    for (const chave in json) {
        if (typeof json[chave] === 'object' && json[chave] !== null) {
            resultado += `${espacos}- **${chave.toLocaleUpperCase()}**:\n`;
            resultado += formatarJsonParaObsidian(json[chave], nivel + 1);
        } else {
            resultado += `${espacos}- **${chave.toUpperCase()}**: ${json[chave]}\n`;
        }
    }

    return resultado;
};

async function executarCurl(cmd: string): Promise<string> {
    try {
        const { stdout, stderr } = await execAsync(cmd, { maxBuffer: 1024 * 1024 * 50 }); // 10 MB

        if (stderr) {
            throw new Error(`Erro na saída padrão: ${stderr}`);
        }

        return stdout;
    } catch (error) {
        throw new Error(`Erro ao executar curl: ${error.message}`);
    }
}
function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
class ApiService {
	private app: App;
	 	
		constructor(app: App) {
			this.app = app;
		}
	 


	
	private  async executeHttpRequest(url: string): Promise<any> {
        try {
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Erro na requisição: ${error.message}`);
            } else {
                throw new Error(`Erro inesperado: ${error}`);
            }
        }
    }
	public  async fetchIPData(editor: Editor): Promise<void> {
        try {
            const ip = editor.getSelection();
            const url = `https://ipinfo.io/${ip}/json`;

            const data = await this.executeHttpRequest(url);
            console.log('Dados do IP/DNS:', data);

            const resultadoFormatado = this.formatJsonResult(data);
            console.log(resultadoFormatado);

            editor.replaceSelection('*Resultado da Busca:* ' + '\n' + resultadoFormatado);
        } catch (error) {
            console.error(error.message);
        }
    }
	
	private  formatCNPJ(cnpj: string): string {

        return cnpj.replace(/[^\d]/g, '');
    }
	private  formatJsonResult(json: any): string {
        return formatarJsonParaObsidian(json);
    }
	private  async executeCurlCommand(command: string): Promise<string> {
        try {
            const { stdout, stderr } = await execAsync(command, { maxBuffer: 1024 * 1024 * 50 }); // 50 MB

            if (stderr) {
                throw new Error(`Erro na saída padrão: ${stderr}`);
            }

            return stdout;
        } catch (error) {
            throw new Error(`Erro ao executar curl: ${error.message}`);
        }
    }
	
}

