const container = document.getElementById('jsoneditor')
const options = {
    modes: ['text', 'code', 'tree', 'form', 'view', "preview"],
    mode: 'code',
    onModeChange: function(mode) {
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
}

const editor = new JSONEditor(container, options, json);
editor.aceEditor.setTheme("ace/theme/tomorrow_night");