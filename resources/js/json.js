const fs = require('fs');
const electron = require('electron');
let EditorMode = "code";
var app = new Vue({
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
        if (electron && electron.ipcRenderer) {
            electron.ipcRenderer.on('open-file', function(event, message) {
                self.NewTab(function(e) {
                    self.OpenFile(message, e.editor);
                    e.filePath = message;
                    e.title = self.GetFileName(message);
                });
            });
        }
    },
    methods: {
        NewTab: function(callback) {
            var editorData = {
                OnAdded: callback,
                editor: null,
                filePath: "a",
                title: "Untitled-" + (this.tabs + 1),
                id: "json_editor_" + (this.tabs + 1)
            };
            this.tabs += 1;
            this.addtab = true;
            this.editors.push(editorData);
            this.selectedIndex = this.editors.length - 1;
            this.AddedEditor = editorData;
            var timer = setTimeout(function() {
                const options = {
                    mode: EditorMode
                };
                const json = {
                    "index": this.tabs,
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
                const editor = new JSONEditor(container, options, json);
                editor.aceEditor.setTheme("ace/theme/tomorrow_night");
                editorData.editor = editor;
                if (editorData.OnAdded)
                    editorData.OnAdded(editorData);
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
                    throw err;
                }
                // 读取文件成功
                if (!editor)
                    editor = self.editors[self.selectedIndex].editor;
                editor.aceEditor.setValue(data);
            });
        },
        GetFileName: function(path) {
            path = path.replace("//g", "\\");
            let pos = path.lastIndexOf('\\');
            return path.substring(pos + 1);
        }
    }
});