/*
* Author: Robin Garbe
* Licence: MIT
*
* Description: This is the main JavaSript file. Like in any other Electron
* application, it is the first script to be executed.
* The window is created here and most events will be handeled here too.
*/
console.log("Executing main.js");

const devmode = true;

const package = require('./package.json');
const getAppDataPath = require("appdata-path");
let app_path = getAppDataPath(package.productName);

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

// Include the console_print.js file and call it with "sprint(...)":
let console_print;
if (devmode) console_print = require('./js/modules/console_print');
process.sprint = function (text,fg,bg,sender_fg,sender_bg) {
    let sender = package.name;
    if (devmode) console_print.print(sender,text,fg,bg,sender_fg,sender_bg);
};
const sprint = process.sprint;

sprint("Starting...","byellow","black","black","byellow");


const electron = require('electron');
const app = electron.app; // Module to control application life
const BrowserWindow = electron.BrowserWindow; // Module to create native browser window
const path = require('path');
const url = require('url');
const electron_reload = require('electron-reload')(__dirname, { electron: path.join(__dirname, 'node_modules', '.bin', 'electron'), ignored: /node_modules|settings\.txt|main\.js|[\/\\]\./ });

// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true; // disables all electron security warings

global.shared = { // Define shared variables/objects:
    devmode: devmode,
    package: package,
    app_path: app_path,
    blub: "hell"
};

function changeShared(obj, value) {
    eval("global.shared." + String(obj) + " = " + value); // change the global/shared variable
    mainWindow.webContents.executeJavaScript("updateShared('" + String(obj) + "');"); // tell the FrontEnd that the variable was updated
}

const ipcMain = require('electron').ipcMain;

ipcMain.on('restart', (e) => {
    sprint("Restarting... [This CLI session will close now]","bwhite","red");
    const {spawn} = require('child_process');
    const subprocess = spawn(process.argv[0], process.argv.slice(1), {detached: true}); // create a new instance of this program
    subprocess.unref();
    mainWindow.hide(); // Hide the initial window
    setTimeout(() => { process.exit(); },10000); // close the initial instance after 10s
});

let mainWindow = null; // global reference of the window object

process.show_error = function (text, type) {
    if ( type == undefined ) type = "error";
    function check_mainWindow(text, type) {
        if ( !(mainWindow === null)  ){
            try {
                mainWindow.webContents.executeJavaScript(`
                    function check_errorList(text, type) {
                        if ( $("#error-list").length ){
                            let error_id = "error" + Math.random().toString(36).substr(2).substr(0, 10);
                            $("#error-list").prepend('<div class="error-box ' + type + '" id="' + error_id + '"> <div class="error-inner"><div class="error-close"></div>' + text + '</div> </div>');
                            let thisError = $("#" + error_id);
                            clean_error_list()
                            setTimeout(() => { fadeOut_error(thisError) }, 5000);
                        } else {
                            setTimeout(() => { check_errorList(text, type) }, 300);
                        }
                    }
                    check_errorList("${text.replace(/"/g, '\\"')}", "${type}");
                `);
            } catch (err) {
                sprint("Can't show error [" + err + "]","yellow","black","black","yellow");
            }
        } else {
            setTimeout(() => { check_mainWindow(text, type) }, 300);
        }
    }
    check_mainWindow(text, type)
};
show_error = process.show_error;

process.setStatus = function (status, color, elem, state) {
    if ( color == undefined ) color = "#888";
    if ( elem == undefined )  elem  = "app-status";
    if ( state == undefined ) state = "";
    function check_mainWindow(status, color, elem, state) {
        if ( !(mainWindow === null) ){
            mainWindow.webContents.executeJavaScript(`
                function check_status(status, color, elem, state) {
                    if ( $("." + elem).length ) {
                        if ( $("." + elem).html() == "" ) {
                            $("." + elem).prepend('<span> - Status: <span>');
                        }
                        $("." + elem).attr('data-state', state);
                        $("." + elem).append('<span class="app-status-name" style="color:' + color + ';">' + status + '</span>');
                    } else {
                        setTimeout(() => { check_status(status, color, elem, state) }, 300);
                    }
                }
                check_status("${status}", "${color}", "${elem}", "${state}");
            `);
        } else {
            setTimeout(() => { check_mainWindow(status, color, elem, state) }, 300);
        }
    }
    check_mainWindow(status, color, elem, state)
}
setStatus = process.setStatus;

process.activity_indicator = function (indicator) {
    function check_mainWindow(indicator) {
        if ( !(mainWindow === null)  ){
            try {
                mainWindow.webContents.executeJavaScript(`
                    function check_indicator(indicator) {
                        if ( $(indicator).length ){
                            show_activity(indicator);
                        } else {
                            setTimeout(() => { check_indicator(indicator) }, 300);
                        }
                    }
                    check_indicator("${indicator}");
                `);
            } catch (err) {
                sprint("Can't show activity [" + err + "]","yellow","black","black","yellow");
            }
        } else {
            setTimeout(() => { check_mainWindow(indicator) }, 300);
        }
    }
    check_mainWindow(indicator)
};

function createWindow () {
    let w_width, w_height;
    if (devmode) {
        w_width = 1600; // window width for devmode (for DevTools)
        w_height = 800; // window height for devmode (for menu bar)
    } else {
        w_width = 1200; // default window width
        w_height = 800; // default window height
    }
    mainWindow = new BrowserWindow({ // Create the browser window
        width: w_width,
        height: w_height,
        minWidth: 1200,
        minHeight: 800,
        resizable: true,
        backgroundColor: "#222222",
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            allowRunningInsecureContent: false
        }
    });
    mainWindow.loadURL(url.format({ // load the index.html of the app
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))


    if (devmode) mainWindow.webContents.openDevTools(); // Open the DevTools
    else mainWindow.setMenu(null); // hides the menu bar at the top


    mainWindow.on('closed', function () { // Emitted when this window is closed
        mainWindow = null;
    })
}

app.on('ready', () => {
    createWindow();
    sprint("Window created","green","black","black","byellow");

    

})

// Some stuff for OS X:
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
})
app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
})
