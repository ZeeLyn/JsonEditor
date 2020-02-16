const fs = require('fs');
const { ipcRenderer, remote } = require('electron');
const { Menu, MenuItem } = remote;

let EditorMode = "code";
new Vue({
    el: '#app',
    data: {
        tabs: 0,
        selectedIndex: 0,
        editors: []
    },
    mounted: function() {
        this.NewTab();
        var self = this;
        document.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            for (const f of e.dataTransfer.files) {
                this.NewTab(function(e) {
                    self.OpenFile(f.path, e.editor);
                    e.filePath = f.path;
                    e.title = self.GetFileName(f.path);
                });
            }
        });
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        if (ipcRenderer) {
            ipcRenderer.on('new-file', function(event, message) {
                self.NewTab();
            });

            ipcRenderer.on('open-file', function(event, message) {
                self.NewTab(function(e) {
                    self.OpenFile(message, e.editor);
                    e.filePath = message;
                    e.title = self.GetFileName(message);
                });
            });

            ipcRenderer.on('save-file', function(event, message) {
                var editor = self.editors[self.selectedIndex];
                if (editor.filePath) {
                    self.SaveFile(editor);
                } else {
                    ipcRenderer.send('asynchronous-get-save-file-path', editor.id);
                }
            });

            ipcRenderer.on('set-file-path-save-file', function(event, filePath, id) {
                var editor;
                for (var i = 0; i < self.editors.length; i++) {
                    if (self.editors[i].id != id)
                        continue;
                    editor = self.editors[i];
                }
                if (!editor)
                    return;
                editor.filePath = filePath;
                editor.title = self.GetFileName(filePath);
                self.SaveFile(editor);
            });
        }


    },
    methods: {
        NewTab: function(callback) {
            var editorData = {
                OnAdded: callback,
                editor: null,
                hasChange: false,
                filePath: "",
                title: "Untitled-" + (this.tabs + 1),
                id: "json_editor_" + (this.tabs + 1)
            };
            this.tabs += 1;
            this.addtab = true;
            this.editors.push(editorData);
            this.selectedIndex = this.editors.length - 1;
            this.AddedEditor = editorData;
            var self = this;
            var timer = setTimeout(function() {
                const options = {
                    mode: EditorMode,
                    indentation: 4,
                    escapeUnicode: true,
                    ace: ace
                };
                const json = {
                    "index": self.tabs,
                    'array': [1, 2, 3],
                    'boolean': true,
                    'null': null,
                    'number': 123,
                    'object': {
                        'a': 'b',
                        'c': 'd'
                    },
                    'string': 'Hello World'
                };
                const container = document.querySelector("#" + editorData.id);
                const editor = new JSONEditor(container, options, null);
                editor.aceEditor.setTheme("ace/theme/tomorrow_night");
                editor.aceEditor.getSession().setTabSize(4);
                editor.aceEditor.setOptions({
                    navigateWithinSoftTabs: true,
                    useSoftTabs: true
                });
                editorData.editor = editor;
                editor.options.onChangeText = function() {
                    editorData.hasChange = true;
                }
                if (editorData.OnAdded)
                    editorData.OnAdded(editorData);

                if (Menu) {
                    const menu = new Menu();
                    menu.append(new MenuItem({ label: 'Undo', role: "undo", accelerator: "CmdOrCtrl+Z" }));
                    menu.append(new MenuItem({ label: 'Redo', role: "redo", accelerator: "CmdOrCtrl+Y" }));
                    menu.append(new MenuItem({ type: 'separator' }));
                    menu.append(new MenuItem({ label: 'Cut', role: "cut", accelerator: "CmdOrCtrl+X" }));
                    menu.append(new MenuItem({ label: 'Copy', role: "copy", accelerator: "CmdOrCtrl+C" }));
                    menu.append(new MenuItem({ label: 'Paste', role: "paste", accelerator: "CmdOrCtrl+S" }));
                    menu.append(new MenuItem({ label: 'Delete', role: "delete" }));
                    menu.append(new MenuItem({ type: 'separator' }));
                    menu.append(new MenuItem({ label: 'SelectAll', role: "selectAll", accelerator: "CmdOrCtrl+A" }));

                    container.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                        menu.popup({ window: remote.getCurrentWindow() });
                    }, false);

                }
                clearTimeout(timer);
            }, 100);
            return editorData;
        },
        AddTab: function() {
            this.NewTab();
        },
        SwitchTab: function(e) {
            this.selectedIndex = e.target.dataset.index;
        },
        CloseTab: function(e) {
            e.preventDefault();
            e.stopPropagation();
            var index = parseInt(e.target.dataset.index);
            var editor = this.editors[index];
            if (editor.hasChange && !confirm('文档已被更改，关闭将会丢失更改，确定要关闭吗？'))
                return;
            if (this.selectedIndex > index) {
                this.selectedIndex -= 1;
            } else if (this.selectedIndex == index) {
                this.selectedIndex = index - 1;
            }
            this.editors.splice(index, 1);
        },
        OpenFile: function(file, editor) {
            var self = this;
            fs.readFile(file, 'utf-8', function(err, data) {
                // 读取文件失败/错误
                if (err) {
                    alert(err.message);
                    throw err;
                }
                // 读取文件成功
                if (!editor)
                    editor = self.editors[self.selectedIndex].editor;
                editor.setText(data);
            });
        },
        GetFileName: function(path) {
            path = path.replace("//g", "\\");
            let pos = path.lastIndexOf('\\');
            return path.substring(pos + 1);
        },
        SaveFile: function(editor) {
            var content = editor.editor.getText()
            fs.writeFile(editor.filePath, content, 'utf-8', function(err) {
                if (err) {
                    console.error(err);
                    alert(err.message);
                } else
                    editor.hasChange = false;
            });
        }
    }
});