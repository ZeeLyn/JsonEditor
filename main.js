const { app, BrowserWindow, Menu, MenuItem, dialog, ipcMain } = require('electron')

let MainWindow = null;

function createWindow() {
    // 创建浏览器窗口
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });
    MainWindow = win;

    // and load the index.html of the app.
    win.loadFile('index.html')

    // 打开开发者工具
    win.webContents.openDevTools();

    SetMenu();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
    // 否则绝大部分应用及其菜单栏会保持激活。
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // 在macOS上，当单击dock图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口。
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();

    }
})



function SetMenu() {
    const menu = new Menu();
    menu.append(new MenuItem({
        label: 'File',
        submenu: [{
                label: "New File",
                accelerator: "CmdOrCtrl+N",
                click() {
                    MainWindow.webContents.send('new-file', "");
                }
            },
            {
                label: "Open File",
                accelerator: "CmdOrCtrl+O",
                click() {
                    console.log("in")
                    dialog.showOpenDialog({
                        title: 'Open File',
                        properties: ['openFile'],
                        filters: [
                            { name: 'Json', extensions: ['json', 'txt'] },
                            { name: 'All Files', extensions: ['*'] }
                        ],
                        defaultPath: '/Users/<username>/Documents/'
                    }).then(result => {
                        if (result.canceled)
                            return;
                        if (result.filePaths) {
                            MainWindow.webContents.send('open-file', result.filePaths[0]);
                        }
                    }).catch(err => {
                        throw (err);
                    })
                }
            }, {
                label: "Save File",
                accelerator: "CmdOrCtrl+S",
                click() {
                    MainWindow.webContents.send('save-file', 'save file');
                }
            }, {
                label: "Exit",
                accelerator: "CmdOrCtrl+Q",
                role: "quit"
            }
        ]
    }));
    menu.append(new MenuItem({
        label: "Edit",
        role: "editMenu"
    }));
    menu.append(new MenuItem({
        label: "View",
        role: "viewMenu"
    }));
    ipcMain.on('asynchronous-get-save-file-path', function(event, arg) {
        dialog.showSaveDialog({
            title: "Save File",
            defaultPath: '/Users/<username>/Documents/',
            filters: [
                { name: 'Json', extensions: ['json', 'txt'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        }).then(function(result) {
            if (result.canceled)
                return;
            MainWindow.webContents.send('set-file-path-save-file', result.filePath, arg);
        });
    });

    Menu.setApplicationMenu(menu);
}