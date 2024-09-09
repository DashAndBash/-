const { app, BrowserWindow, ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { PythonShell } = require('python-shell');
const createWindow = () => {
    const Resoultion = { x: 1920, y: 1080 }; //현재 내 노트북 해상도와 일치함.
    const win = new BrowserWindow({
        width: Math.floor(Resoultion.x * 0.56),
        height: Math.floor(Resoultion.y * 0.34),
        x: Math.floor(Resoultion.x * 0.22), //해상도의 중앙에 오도록 설정
        y: Math.floor(Resoultion.y * 0.55), //해상도의 중앙이 어쩌구
        frame: false,
        transparent: true,
        nativeWindowOpen: true,
        icon: path.join(__dirname, 'assets/BubbleYuna.ico'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        }
    });
    win.setIgnoreMouseEvents(false);
    win.loadFile('index.html');
    const WindowHandle = win.getNativeWindowHandle().readBigUInt64LE(0);
    const WindowHandle32 = win.getNativeWindowHandle().readInt32LE(0);
    console.log("windowhandle:", WindowHandle, WindowHandle32, "<==");
    return WindowHandle;
};
function RunPython(message) {
    // Python 스크립트 실행
    let pyshell = new PythonShell('Pack.py');
    // sends a message to the Python script via stdin
    pyshell.send(message);
    pyshell.on('message', function (message) {
        // received a message sent from the Python script (a simple "print" statement)
        console.log(message);
    });
    // end the input stream and allow the process to exit
    pyshell.end(function (err, code, signal) {
        if (err)
            throw err;
        console.log('The exit code was: ' + code);
        console.log('The exit signal was: ' + signal);
        console.log('finished');
    });
}
app.whenReady().then(() => {
    const number = createWindow();
    RunPython(number);
});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit();
});
ipcMain.on('asynchronous-message', (event, arg) => {
    const Data = arg;
    if (Data.type === "WindowExe") {
        const child = spawn(Data.path);
        child.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });
        child.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
        child.on('close', (code) => {
            console.log(`Child process exited with code ${code}`);
        });
    }
    else if (Data.type === "Website") {
        console.log(Data.path);
        const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
        const child = spawn(chrome, [Data.path]);
        child.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });
        child.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
        child.on('close', (code) => {
            console.log(`Child process exited with code ${code}`);
        });
    }
    else if (Data.type === "TxtRead") {
        let Filedata = "";
        fs.readFile(Data.path, RetrunFile);
        function RetrunFile(err, data) {
            if (err) {
                console.error('Error reading the file:', err);
                return;
            }
            Filedata = data.toString();
            event.sender.send('asynchronous-message', Filedata);
        }
    }
});
