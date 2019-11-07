/*
* Author: Robin Garbe
* Version: 1.2.1
*/

module.exports = {
    print: (sender,text,fg,bg,sender_fg,sender_bg) => {
        console_print(sender,text,fg,bg,sender_fg,sender_bg);
    }
};

function console_print(sender,text,fg="white",bg="black",sender_fg="black",sender_bg="white") {
    var colorstr = '';
    switch(fg) {
        case "black":   colorstr += '\x1b[30m';  break;
        case "red":     colorstr += '\x1b[31m';  break;
        case "green":   colorstr += '\x1b[32m';  break;
        case "yellow":  colorstr += '\x1b[33m';  break;
        case "blue":    colorstr += '\x1b[34m';  break;
        case "magenta": colorstr += '\x1b[35m';  break;
        case "cyan":    colorstr += '\x1b[36m';  break;
        case "white":   colorstr += '\x1b[37m';  break;
        case "bblack":  colorstr += '\x1b[90m';  break;
        case "bred":    colorstr += '\x1b[91m';  break;
        case "bgreen":  colorstr += '\x1b[92m';  break;
        case "byellow": colorstr += '\x1b[93m';  break;
        case "bblue":   colorstr += '\x1b[94m';  break;
        case "bmagenta":colorstr += '\x1b[95m';  break;
        case "bcyan":   colorstr += '\x1b[96m';  break;
        case "bwhite":  colorstr += '\x1b[97m';  break;
        default:        colorstr += '\x1b[97m'; // bwhite foreground  is the default
    }
    switch(bg) {
        case "black":   colorstr += '\x1b[40m';  break;
        case "red":     colorstr += '\x1b[41m';  break;
        case "green":   colorstr += '\x1b[42m';  break;
        case "yellow":  colorstr += '\x1b[43m';  break;
        case "blue":    colorstr += '\x1b[44m';  break;
        case "magenta": colorstr += '\x1b[45m';  break;
        case "cyan":    colorstr += '\x1b[46m';  break;
        case "white":   colorstr += '\x1b[47m';  break;
        case "bblack":  colorstr += '\x1b[100m';  break;
        case "bred":    colorstr += '\x1b[101m';  break;
        case "bgreen":  colorstr += '\x1b[102m';  break;
        case "byellow": colorstr += '\x1b[103m';  break;
        case "bblue":   colorstr += '\x1b[104m';  break;
        case "bmagenta":colorstr += '\x1b[105m';  break;
        case "bcyan":   colorstr += '\x1b[106m';  break;
        case "bwhite":  colorstr += '\x1b[107m';  break;
        default:        colorstr += '\x1b[40m'; // black background is the default
    }
    var sender_colorstr = '';
    switch(sender_fg) {
        case "black":   sender_colorstr += '\x1b[30m';  break;
        case "red":     sender_colorstr += '\x1b[31m';  break;
        case "green":   sender_colorstr += '\x1b[32m';  break;
        case "yellow":  sender_colorstr += '\x1b[33m';  break;
        case "blue":    sender_colorstr += '\x1b[34m';  break;
        case "magenta": sender_colorstr += '\x1b[35m';  break;
        case "cyan":    sender_colorstr += '\x1b[36m';  break;
        case "white":   sender_colorstr += '\x1b[37m';  break;
        case "bblack":  sender_colorstr += '\x1b[90m';  break;
        case "bred":    sender_colorstr += '\x1b[91m';  break;
        case "bgreen":  sender_colorstr += '\x1b[92m';  break;
        case "byellow": sender_colorstr += '\x1b[93m';  break;
        case "bblue":   sender_colorstr += '\x1b[94m';  break;
        case "bmagenta":sender_colorstr += '\x1b[95m';  break;
        case "bcyan":   sender_colorstr += '\x1b[96m';  break;
        case "bwhite":  sender_colorstr += '\x1b[97m';  break;
        default:        sender_colorstr += '\x1b[30m'; // black foreground  is the default
    }
    switch(sender_bg) {
        case "black":   sender_colorstr += '\x1b[40m';  break;
        case "red":     sender_colorstr += '\x1b[41m';  break;
        case "green":   sender_colorstr += '\x1b[42m';  break;
        case "yellow":  sender_colorstr += '\x1b[43m';  break;
        case "blue":    sender_colorstr += '\x1b[44m';  break;
        case "magenta": sender_colorstr += '\x1b[45m';  break;
        case "cyan":    sender_colorstr += '\x1b[46m';  break;
        case "white":   sender_colorstr += '\x1b[47m';  break;
        case "bblack":  sender_colorstr += '\x1b[100m';  break;
        case "bred":    sender_colorstr += '\x1b[101m';  break;
        case "bgreen":  sender_colorstr += '\x1b[102m';  break;
        case "byellow": sender_colorstr += '\x1b[103m';  break;
        case "bblue":   sender_colorstr += '\x1b[104m';  break;
        case "bmagenta":sender_colorstr += '\x1b[105m';  break;
        case "bcyan":   sender_colorstr += '\x1b[106m';  break;
        case "bwhite":  sender_colorstr += '\x1b[107m';  break;
        default:        sender_colorstr += '\x1b[107m'; // bwhite background is the default
    }
    console.log(sender_colorstr + '[' + sender + ']' + '\x1b[0m' + colorstr, text, '\x1b[0m');
}
