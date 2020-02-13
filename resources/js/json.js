const fs = require('fs');
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
    },
    updated: function() {
        if (!this.AddedEditor)
            return;
        const options = {
            //modes: ['text', 'code', 'tree', 'form', 'view'],
            mode: EditorMode,
            onModeChange: function(mode) {
                EditorMode = mode;
                if (mode === "code") {
                    var e = document.querySelector(".ace_editor");
                    e.setAttribute("class", "ace_editor ace-tomorrow-night ace_dark");
                }
            }
        }
        const json = {
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
        const container = document.getElementById(this.AddedEditor.id);
        const editor = new JSONEditor(container, options, json);
        editor.aceEditor.setTheme("ace/theme/tomorrow_night");
        this.AddedEditor = null;
    },
    methods: {
        NewTab: function() {
            var editorData = {
                editor: null,
                filePath: "a",
                title: "Untitled-" + (this.tabs + 1),
                id: "json_editor_" + (this.tabs + 1)
            };
            this.tabs += 1;
            this.editors.push(editorData);
            this.AddedEditor = editorData;
            this.selectedIndex = this.editors.length - 1;

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
        }
    }
});


/* 

document.addEventListener('drop', (e) => {
    if (EditorMode != 'code')
        return;
    e.preventDefault();
    e.stopPropagation();


    for (const f of e.dataTransfer.files) {
        OpenFile(f.path);
        break;
    }
});
document.addEventListener('dragover', (e) => {
    if (EditorMode != 'code')
        return;
    e.preventDefault();
    e.stopPropagation();
});

require('electron').ipcRenderer.on('open-file', function(event, message) {
    console.log(message); // Prints "whoooooooh!"
    OpenFile(message);
});

function OpenFile(file) {
    fs.readFile(file, 'utf-8', function(err, data) {
        // 读取文件失败/错误
        if (err) {
            throw err;
        }
        // 读取文件成功
        editor.aceEditor.setValue(data);
    });
} */