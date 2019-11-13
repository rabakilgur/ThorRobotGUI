let settings = {
	autoConnect: true,
	autoRetry: true,
	ignoredPorts: [],
	homingToZero: true,
	verboseOutput: true,
	zoomInterface: 1,
	baudRate: 115200,
	effectorStepSize: 1
};

let process = remote.getGlobal('process'); // a reference to the process

// Set up the ipcRenderer (for events passing) and the shared variables:
const ipcRenderer = require('electron').ipcRenderer;
var shared = remote.getGlobal('shared');
/*function updateShared(obj) {
    let newObj = eval("remote.getGlobal('shared')." + String(obj));
    console.log( `Updated value of "${String(obj)}": `, newObj );  // JUST FOR DEVELOPMENT!!!
}*/

$('title').text(shared.package.productName || shared.package.name); // Set the title of the window

// Show errors to the user:
let show_error = process.show_error;
function fadeOut_error(thisError) {
    if ( thisError.hasClass("noFade") ) return null;
    else if ( thisError.is(":hover") ) setTimeout(() => { fadeOut_error(thisError); }, 500);
    else fadeOut_error_now(thisError);
}
function fadeOut_error_now(thisError) {
    thisError.addClass("error-fadeOut");
    thisError.stop().animate({ height: "0" }, 1000);
    setTimeout(() => { thisError.remove(); }, 1000);
}
function clean_error_list() {
    if ( (($("#error-layer").height() - 100) - $("#error-list").height()) < 0 ) {
        fadeOut_error_now($(".error-box:not(.error-fadeOut):last"));
        setTimeout(() => {
            if ( (($("#error-layer").height() - 100) - $("#error-list").height()) < 0 ) clean_error_list();
        }, 1000);
    }
}

// const spawn = require("child_process").spawn;  // Needed to spawn Python Scripts
const SerialPort = require('serialport');

$(document).ready(() => {

    // Vue.config.devtools = false; // Tell Vue that you don't won't to use the Vue-DevTools
    require('./js/modules/titlebar.js'); // Add functionality to the titlebar
    $(".app-title").text(shared.package.productName);
    $(".app-version").text(" - Version: " + shared.package.version);


    if (remote.getGlobal('shared').devmode) {
        $(".preloader").remove();
        $(".content").addClass("no-preloader");
    }


    // Close an error-message when clicking on the close-button:
    $("#error-list").on("click", ".error-close", function () {
        let thisError = $(this).parent().parent();
        fadeOut_error_now(thisError);
    });


    $("#popup-background").click(() => {
        document.body.classList.remove("show_addDevice");
        document.body.classList.remove("show_deviceSettings");
        document.body.classList.remove("show_options");
        document.body.classList.remove("show_import");
    });
    $(".btn_close").click(() => {
        document.body.classList.remove("show_addDevice");
        document.body.classList.remove("show_deviceSettings");
        document.body.classList.remove("show_options");
        document.body.classList.remove("show_import");
    });


    $(".btn_reload").click(() => {
        location.reload();
    });
    $(".btn_restart").click(() => {
        setTimeout(() => {
            ipcRenderer.send('restart');
        },250);
    });

});



// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// ------------------------------ Main JS Code: ------------------------------
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------

const robot = require("./js/modules/sendToRobot.js");

let current_artic = {
	"a1": 0,  // Articulation 1
	"a2": 0,  // Articulation 2
	"a3": 0,  // Articulation 3
	"a4": 0,  // Articulation 4
	"a5": 0,  // Articulation 5
	"a6": 0   // Articulation 6
};
let current_pos = {
	"x": 0,  // X Position
	"y": 0,  // Y Position
	"z": 0,  // Z Position
	"xv": 0, // X Vector
	"yv": 0, // Y Vector
	"zv": 0  // Z Vector
};

// Function to write to to users console
function cnsl(text, sender) {
	if (sender === undefined) {
		$(".console-output").append(`${text}`);
	} else {
		$(".console-output").append(`<div data-source="${sender}">${text}</div>`);
	}
	
}

function set_start(slider_nbr, new_start = 0) {
	const slider = $(`#rs-${slider_nbr}`);
	slider.trigger("change_start", [{new_start: new_start}]);
	slider.val(new_start).change();
}

$(document).ready(() => {
	if (settings.verboseOutput) cnsl(`Starting...`, "System");

	/* For the Testing-Controls: */
	$('placeholder[for="testing-control"]').each(function(counter) {
		let nbr = $(this).attr("data-articulation");
		$(this).replaceWith(`
			<div class="testing-control">
				<h3>Art. ${nbr}</h3>
				<span class="btngroup">
					<button class="d-btn d-btn-secondary testing-btn-minus10" data-articulation="${nbr}">-10°</button>
					<button class="d-btn d-btn-secondary testing-btn-plus10" data-articulation="${nbr}">+10°</button>
				</span>
			</div>
		`);
	});
	function send_to_robot(message) {
		try {
			robot.send(message);
		} catch(err) {
			console.error("Error while sending: \n", err);
			cnsl(`Error while sending message: <i>${err.message}</i>`, "Error");
		}
	}
	$(".testing-btn-minus10").on("click", function() {
		let art = $(this).attr("data-articulation");
		new_val = Math.max(-180, current_artic["a" + art] - 10);
		let new_artic = current_artic;
		new_artic["a" + art] = new_val;
		cnsl(`Moving <i>Articulation ${art}</i> by -10°`, "System");
		let typeOfMovement = "G1";  // <-- HARDCODED FOR NOW! (Or should it stay?)
		let feedRate = 500;  // <-- HARDCODED FOR NOW!
		send_to_robot(`${typeOfMovement} ${translateForThor(new_artic)} F${Math.round(feedRate, 1)}`);
	});
	$(".testing-btn-plus10").on("click", function() {
		let art = $(this).attr("data-articulation");
		new_val = Math.min(180, current_artic["a" + art] + 10);
		let new_artic = current_artic;
		new_artic["a" + art] = new_val;
		cnsl(`Moving <i>Articulation ${art}</i> by +10°`, "System");
		let typeOfMovement = "G1";  // <-- HARDCODED FOR NOW! (Or should it stay?)
		let feedRate = 500;  // <-- HARDCODED FOR NOW!
		send_to_robot(`${typeOfMovement} ${translateForThor(new_artic)} F${Math.round(feedRate, 1)}`);
	});
	$(".testing-btn-gripperOpen").on("click", function() {
		cnsl(`Opening the Gripper`, "System");
		send_to_robot(`M3 S0`);
	});
	$(".testing-btn-gripperClose").on("click", function() {
		cnsl(`Closing the Gripper`, "System");
		send_to_robot(`M3 S800`);
	});
	$(".testing-btn-straight").on("click", function() {
		cnsl(`Going to "Straight" position`, "System");
		send_to_robot(`G1 A0 B0 C0 D0 X0 Y0 Z0 F500`);
	});
	$(".testing-btn-move").on("click", function() {
		cnsl(`Moving <b>all</b> articulations`, "System");
		send_to_robot(`G1 A8.93 B42.11 C42.11 D85.79 X3.33 Y18.09 Z11.94 F500`);
	});
	$(".testing-btn-grip").on("click", function() {
		cnsl(`Running the demo movement`, "System");
		send_to_robot(`M3 S0`);
		send_to_robot(`G1 A8.93 B42.11 C42.11 D85.79 X7.5 Y4.23 Z-4.23 F500`);
		send_to_robot(`M3 S800`);
		send_to_robot(`G1 A1.79 B31.58 C31.58 D56.84 X7.5 Y1.15 Z-1.15 F500`);
		send_to_robot(`M3 S0`);
	});

	/* For the Range-Sliders: */
	$('placeholder[for="range-slider"]').each(function(counter) {
		let item_counter = counter + 1 - 3;  // -3 to compensate for the XYZ-Position sliders
		var name, type;
		if ( $(this).text() === "X" ||
			  $(this).text() === "Y" ||
			  $(this).text() === "Z" ) {
			name = $(this).text() + " Position";
			item_counter = $(this).text();
			type = "InvKin";
		} else {
			name = "Articulation " + item_counter;
			type = "ForKin";
		}
		
		$(this).replaceWith(`
			<table class="rs-table">
				<tr>
					<td>
						${name}<br>
						<span class="rs-output rs-output-${item_counter}" contenteditable="true"></span>
					</td>
					<td>
						<div class="range-slider">
							<input id="rs-${item_counter}" type="range" min="-180" max="180" step="0.1" value="0"/>
							<div class="range-values">
								<span class="range-min" data-value="-180°"></span>
								<span class="range-ministep" data-value=""></span>
								<span class="range-subsubstep" data-value="-135°"></span>
								<span class="range-ministep" data-value=""></span>
								<span class="range-substep" data-value="-90°"></span>
								<span class="range-ministep" data-value=""></span>
								<span class="range-subsubstep" data-value="-45°"></span>
								<span class="range-ministep" data-value=""></span>
								<span class="range-zero" data-value="0°"></span>
								<span class="range-ministep" data-value=""></span>
								<span class="range-subsubstep" data-value="45°"></span>
								<span class="range-ministep" data-value=""></span>
								<span class="range-substep" data-value="90°"></span>
								<span class="range-ministep" data-value=""></span>
								<span class="range-subsubstep" data-value="135°"></span>
								<span class="range-ministep" data-value=""></span>
								<span class="range-max" data-value="180°"></span>
							</div>
							<div class="range-buttons range-btnsArtic">
								<button class="d-btn d-btn-secondary rs-hide1">-90°</button>
								<button class="d-btn d-btn-secondary rs-hide3">-45°</button>
								<button class="d-btn d-btn-secondary rs-hide4">-10°</button>
								<button class="d-btn d-btn-secondary rs-hide2">-5°</button>
								<button class="d-btn d-btn-secondary">-1°</button>
								<button class="d-btn d-btn-secondary rs-hide5">-0.1°</button>
								<button class="d-btn d-btn-secondary d-btn-square rs-home"><i class="fas fa-home"></i></button>
								<button class="d-btn d-btn-secondary rs-hide5">+0.1°</button>
								<button class="d-btn d-btn-secondary">+1°</button>
								<button class="d-btn d-btn-secondary rs-hide2">+5°</button>
								<button class="d-btn d-btn-secondary rs-hide4">+10°</button>
								<button class="d-btn d-btn-secondary rs-hide3">+45°</button>
								<button class="d-btn d-btn-secondary rs-hide1">+90°</button>
							</div>
						</div>
					</td>
					<td>
						<button class="d-btn btn-${type}" data-id="${item_counter}" click>Go</button>
					</td>
				</tr>
			</table>
		`);
	});
	
	$('input[type="range"]').rangeslider({  // Initialize the Range-Sliders
		polyfill: false
	});

	$('.range-slider input[type="range"]').each(function() {
		const range = $(this);
		const output = $(`.rs-output-${this.id.substring(3)}`);
		const fill = $(this).parent().find(".rangeslider__fill");
		let fill_from = 0;
		range.on('input', () => {
			if( document.activeElement !== output[0] ) output.text(range.val());
			var progress, position;
			if ( range.hasClass("rs-onlyPos") ) {
				progress =  parseFloat(range.val()) / parseFloat(range.attr("max")) * 100;
				position = (parseFloat(fill_from) / parseFloat(range.attr("max"))) * 100;
				if ( parseFloat(range.val()) > parseFloat(fill_from) ) {
					fill.css({"right": "${100 - position}%",
								 "min-width": `${progress - position}%`,
								 "max-width": `${progress - position}%`,
								 "transform": "translateX(100%)"});
				} else {
					fill.css({"right": `${100 - position}%`,
								 "min-width": `${-progress + position}%`,
								 "max-width": `${-progress + position}%`,
								 "transform": "initial"});
				}
			} else {
				progress =  parseFloat(range.val()) / parseFloat(range.attr("max")) * 50;
				position = parseFloat(fill_from) / parseFloat(range.attr("max")) * 50;
				if ( parseFloat(range.val()) > parseFloat(fill_from) ) {
					fill.css({"right": `${50 - position}%`,
								 "min-width": `${progress - position}%`,
								 "max-width": `${progress - position}%`,
								 "transform": "translateX(100%)"});
				} else {
					fill.css({"right": `${50 - position}%`,
								 "min-width": `${-progress + position}%`,
								 "max-width": `${-progress + position}%`,
								 "transform": "initial"});
				}
			}
		}).trigger('input');
		range.on('change_start', (e, data) => {
			$(this).siblings(".rangeslider").children(".rangeslider__fill").attr("style","max-width: 0;");
			fill_from = data.new_start;
		});
	});
	$(".range-buttons > button").on("click", function() {
		let input = $(this).parent().parent().children("input");
		if ( $(this).hasClass("rs-home") ) {
			input.val(0).change();
		} else {
			let current_val = Number(input.val());
			let step = Number(this.textContent.slice(0,-1));
			if ( typeof clear_animation !== "undefined" ) clearTimeout(clear_animation);  // clear previous animation
			let slider = $(this).parent().parent().children(".rangeslider");
			slider.addClass("rs-animate");
			setTimeout(() => {
				input.val(current_val + step).change();
			}, 10);
			clear_animation = setTimeout(() => {
				slider.removeClass("rs-animate");
			}, 300);
		}
	});
	/* For the Rangeslider Outputs: */
	$(".rs-output").on("input", function() {
		const rs = $(this).parent().parent().find('input[type="range"]');
		const new_val = rangeslider_checkOutput(this);
		rs.val(new_val).change();
	});
	$(".rs-output").keydown(function(e) {
	if ( (e.keyCode >= 48 && e.keyCode <= 57) || /* Number Keys */
		 (e.keyCode === 189) ||  /* "-" Key */
		 (e.keyCode === 190) ) {  /* "." Key */
		 if ( this.textContent.length > 4 ) e.preventDefault();
	} else if ( (e.keyCode === 8) ||    /* Backspace Key */
				(e.keyCode === 47) ||   /* Delete Key */
				(e.keyCode === 37) ||   /* Left Arrow Key */
				(e.keyCode === 39) ) {  /* Right Arrow Key */
			// allowed
		} else if ( e.keyCode === 13 ) {  /* On enter */
			e.preventDefault();
			rangeslider_correctOutput(this);
		} else if ( (e.keyCode === 38) || (e.keyCode === 40) ) {
			e.preventDefault();
			let new_val = Number(this.textContent);
			if (e.keyCode === 38) new_val++;
			else new_val--;
			if (!isNaN(new_val)) this.textContent = new_val;
			rangeslider_correctOutput(this);
			$(this).trigger("input");
		} else {
			e.preventDefault();
		}
	});
	function rangeslider_checkOutput(this_rs) {
		const nbr = Number($(this_rs).text());
		const rs = $(this_rs).parent().parent().find('input[type="range"]');
		const min = Number(rs.attr("min"));
		const max = Number(rs.attr("max"));
		if (isNaN(nbr)) return 0;
		else if (nbr < min) return min;
		else if (nbr > max) return max;
		else return Number($(this_rs).text());
	}
	function rangeslider_correctOutput(this_rs) {
		const nbr = Number($(this_rs).text());
		const rs = $(this_rs).parent().parent().find('input[type="range"]');
		const min = rs.attr("min");
		const max = rs.attr("max");
		if (isNaN(nbr)) {
			$(this_rs).text(0);
			give_class(this_rs, "rs-output-error");
		} else if (nbr < min) {
			$(this_rs).text(min);
			give_class(this_rs, "rs-output-error");
		} else if (nbr > max) {
			$(this_rs).text(max);
			give_class(this_rs, "rs-output-error");
		} else {
			$(this_rs).text(Number($(this_rs).text()));
		}
	}
	$(".rs-output").on("focusout", function() {
		rangeslider_correctOutput(this);
	});
	$(".rs-output").on("paste", function(e_jq) {  // Only allow pasting of plain text
		let e = e_jq.originalEvent;
		e.preventDefault();
		document.execCommand("insertHTML", false, e.clipboardData.getData("text/plain"));
	});
	
	/* For the Inverse Kinematic Buttons: */
	$(".invKin_subbox1 button").on("click", function() {
		if ( typeof clear_animation !== "undefined" ) clearTimeout(clear_animation);  // clear previous animation
		let step = Number($(".invKin_subbox2 .d-rg-active").text());  // Get the step size
		let slider = $(".invKin_box2 .rangeslider");  // Get the slider elements
		slider.addClass("rs-animate");  // Add a class to the slider so it will be animated
		if      ( $(this).hasClass("invKin-btnX+") ) setTimeout(() => { $("#rs-X").val(Number($("#rs-X").val()) + step).change(); }, 10);
		else if ( $(this).hasClass("invKin-btnX-") ) setTimeout(() => { $("#rs-X").val(Number($("#rs-X").val()) - step).change(); }, 10);
		else if ( $(this).hasClass("invKin-btnY+") ) setTimeout(() => { $("#rs-Y").val(Number($("#rs-Y").val()) + step).change(); }, 10);
		else if ( $(this).hasClass("invKin-btnY-") ) setTimeout(() => { $("#rs-Y").val(Number($("#rs-Y").val()) - step).change(); }, 10);
		else if ( $(this).hasClass("invKin-btnZ+") ) setTimeout(() => { $("#rs-Z").val(Number($("#rs-Z").val()) + step).change(); }, 10);
		else if ( $(this).hasClass("invKin-btnZ-") ) setTimeout(() => { $("#rs-Z").val(Number($("#rs-Z").val()) - step).change(); }, 10);
		else if ( $(this).hasClass("invKin-btnHome") ) {
			setTimeout(() => {
				$("#rs-X").val(0).change();
				$("#rs-Y").val(0).change();
				$("#rs-Z").val(0).change();
			}, 10);
		}
		clear_animation = setTimeout(() => {
			slider.removeClass("rs-animate");
		}, 300);
	});
	
	/* For the menu buttons: */
	$("menuitem").on("click", function() {
		// console.log( "Opening section '" + $(this).attr("data-menu") + "'" );
		// Make this button "active":
		$(".menu-active").removeClass("menu-active");
		$(this).addClass("menu-active");
		// Make the corresponding .main block active:
		$(".main-active").removeClass("main-active");
		$(".main-" + $(this).attr("data-menu")).addClass("main-active");
	});

	/* For the Console Input: */
	$(".console-input").on("input", function() {
		//console.log( $(this).text() );
	});
	$(".console-input").keydown((e) => {  // Prevent Enter
		if (e.keyCode === 13) {
			e.preventDefault();
			let text = $(".console-input").text().trim();
			if (text != "") {
				$(".console-output").append(`
					<div data-source="Input">${text}</div>
				`);
				if (text === "clear") {
					$(".console-output").empty();
				} else {
					const message = $(".console-input").text();
					if (robot.get_status() === 3) {
						try {
							robot.send(message);
						} catch(err) {
							console.error("Error while sending: \n", err);
							cnsl(`Error while sending message: <i>${err.message}</i>`, "Error");
						}
					} else {
						console.error("Can't send message! The robot is not connect");
						cnsl("Can't send message! The robot is not connect", "Warning");
					}
				}
			}
			$(".console-input").text("");
		}
	});
	$(".console-input").on("paste", function(e_jq) {  // Only paste plain text into the Console Input
		let e = e_jq.originalEvent;
		e.preventDefault();
		document.execCommand("insertHTML", false, e.clipboardData.getData("text/plain"));
	});
	
	/* Automatically scroll to the bottom of the Console Output: */
	$(".console-output").on("DOMSubtreeModified", () => {
		$(".console-output").stop().animate({
			scrollTop: $(".console-output")[0].scrollHeight
		}, 500);
	}).trigger("DOMSubtreeModified");

	// Toogle ForKin Block Size:
	$(".forKin-more > button").on("click", function() {
		$(".forKin-more").addClass("forKin-hidden");
		$(".forKin-less").removeClass("forKin-hidden");
		$(".forKin-blockMore").removeClass("forKin-hidden");
		$(".forKin-blockLess").addClass("forKin-hidden");
		$(".widgetConsole").detach().appendTo(".main-column1");
		$(".console-output").trigger("DOMSubtreeModified");
	});
	$(".forKin-less > button").on("click", function() {
		$(".forKin-more").removeClass("forKin-hidden");
		$(".forKin-less").addClass("forKin-hidden");
		$(".forKin-blockMore").addClass("forKin-hidden");
		$(".forKin-blockLess").removeClass("forKin-hidden");
		$(".widgetConsole").detach().appendTo(".main-column2");
		$(".console-output").trigger("DOMSubtreeModified");
	});

	
	
	// For Testing:
	setTimeout(() => {
		/*
		set_start(1,-40);
		set_start(2,-120);
		set_start(3,63);
		set_start(4,0);
		set_start(5,-180);
		set_start(6,25);
		
		set_start("X",45);
		set_start("Y",-20);
		set_start("Z",124.3);
		
		set_start("gripper",15.2);
		*/
		
		$('menuitem[data-menu="Testing"]').click();
	}, 100);
	
});


/* For Element Queries: */
window.addEventListener("load", (event) => {
	ElementQueries.init();
	// $('input[type="range"]').trigger('input').rangeslider('update', true); // Re-Render all the rangslider to correct sizing changes that appeared after $.ready
	setTimeout(() => { $('input[type="range"]').trigger('input').rangeslider('update', true); }, 200); // Do it again after a short time
},false);
ElementQueries.listen();





// ------------------------------------------------------------------------------
// ----------------------------  Function Bindings:  ----------------------------
// ------------------------------------------------------------------------------
let startup = true;

function temp_func(msg) {  // ONLY TEMPORARY!
	console.log(`%c${msg}`, "color:#0088FF; background:#0088FF22; padding:6px 10px; border-radius:4px;");
}


function give_class(elem, className, time = 500) {
	$(elem).addClass(className);
	setTimeout(() => {
		$(elem).removeClass(className);
	},time);
}


$(document).ready(() => {
	$(".btn-refreshPorts").on("click", () => {
		give_class(".btn-refreshPorts", "btn-rotate");
		console.log("Refreshing serial port list...");
		if (settings.verboseOutput) cnsl(`Refreshing serial port list...`, "System");
		SerialPort.list((err, results) => {
			if (err) {
				throw err;
			} else {
				let portArray = results.map(x => { return x.comName; });
				console.log("Ports found: ", portArray);
				if (portArray.length > 0) {
					if (settings.verboseOutput) cnsl(`Ports found: ${portArray}`, "Success");
				} else {
					if (settings.verboseOutput) cnsl(`No serial ports found`, "Warning");
				}
				$("#slct-COM").empty();  // delete all ports from the Select Element
				if (portArray.length === 0) {
					$("#slct-COM").append(`<option>❌ No Serial Ports</option>`);
				} else {
					for (let i = 0; i < portArray.length; i++) {
						$("#slct-COM").append(`<option>${portArray[0]}</option>`);
					}
				}
				if (startup && settings.autoConnect && (portArray.length !== 0)) {
					$(".btn-connect").trigger("click");  // try to connect at startup
					startup = false;
				}
			}
		});
	}).trigger("click");
	$(".btn-connect").on("click", () => {
		console.log("Connecting to robot...");
		cnsl(`Connecting to robot...`, "System");
		reset_sliders();
		let comPort = $("#slct-COM")[0].value;  // no default
		if ( comPort.startsWith("❌") ) {
			console.error("No serial port selected!");
			cnsl(`Can't connect without a selected serial port!`, "Error");
			give_class("#slct-COM", "slct-required", 2000);
		} else {
			$(".btn-connect").addClass("btn-connecting");
			let baudRate = Number($("#slct-BaudRate")[0].value);  // default is 115200
			robot.init(comPort, baudRate)
				.then(response => {
					console.log("✔ Connection to Thor succesful");
					cnsl("✔ Connection to Thor succesful", "Success");
					$(".btn-connect").addClass("btn-hide");
					$(".btn-disconnect").removeClass("btn-hide");
					$(".btn-connect").removeClass("btn-connecting");
					$(".connect-status").attr("data-status", "connected");
				})
				.catch(err => {
					console.error("❌ Connection to Thor failed with error:", err);
					cnsl(`❌ Connection error: <i>${err.message}</i>`, "Error");
					$(".btn-connect").removeClass("btn-connecting");
					give_class(".connect-status", "connect-status-error", 900);
				});			
		}
	});
	$(".btn-disconnect").on("click", () => {
		robot.close();
		reset_sliders();
		$(".btn-disconnect").addClass("btn-hide");
		$(".btn-connect").removeClass("btn-hide");
		$(".connect-status").attr("data-status", "disconnected");
	});
});

function reset_sliders() {  // Reset all sliders to zero
	[1, 2, 3, 4, 5, 6, "gripper", "X", "Y", "Z"]  // Array of all sliders
		.forEach((item) => { set_start(item, 0); });
}

function translateForThor(new_artic) {
	// Correction:
	let art1 = new_artic.a1 / 5.6;  // pretty good
	let art2 = new_artic.a2 / 0.95; // just a guess (slightly lower might be better)
	let art3 = new_artic.a3 / 1;    // pretty good
	art3 = art3 - 0.1 * art2;  /* counter rotation */
	let art4 = new_artic.a4 / 12;   // worked pretty good with the orange Thor
	let art5 = new_artic.a5 / 13;   // Quentins guess
	let art6 = new_artic.a6 / 3.33; // Quentins guess
	return  "A" + parseFloat(art1.toFixed(2)) +
			" B" + parseFloat(art2.toFixed(2)) +
			" C" + parseFloat(art2.toFixed(2)) +
			" D" + parseFloat(art3.toFixed(2)) +
			" X" + parseFloat(art4.toFixed(2)) +
			" Y" + parseFloat((art5 + art6).toFixed(2)) +
			" Z" + parseFloat((-art5 + art6).toFixed(2));
}

// Forward Kinematic:
$(document).on("click", ".btn-ForKin", function() {
	let id = $(this).attr("data-id");  // Get the ID (number 1-6)
	let new_artic = JSON.parse(JSON.stringify(current_artic));  // Copy the current articulations
	if (id === "all") {
		new_artic.a1 = $("#rs-1").val();
		new_artic.a2 = $("#rs-2").val();
		new_artic.a3 = $("#rs-3").val();
		new_artic.a4 = $("#rs-4").val();
		new_artic.a5 = $("#rs-5").val();
		new_artic.a6 = $("#rs-6").val();
	} else {
		new_artic["a" + id] = parseFloat($("#rs-" + id).val());  // Change just this articulation
		$(this).parent().parent().find('.range-slider input[type="range"]').trigger("change_start", [{new_start: $("#rs-" + id).val()}]);
	}
	console.log("New Artuculation: ", new_artic);
	let typeOfMovement = "G1";  // <-- HARDCODED FOR NOW! (Or should it stay?)
	let feedRate = 500;  // <-- HARDCODED FOR NOW!
	const gcode = typeOfMovement +  " " + translateForThor(new_artic) +  " F" + Math.round(feedRate, 1);
	cnsl(gcode, "Input");
	robot.send(gcode);
	current_artic = new_artic;
});
// Inverse Kinematic:
$(document).on("click", ".btn-InvKin", function() {
	let id = $(this).attr("data-id");  // Get the ID [x,y,z,xv,yv,zv]
	let new_pos = JSON.parse(JSON.stringify(current_pos));  // Copy the current articulations
	if (id === "all") {
		new_pos.x  = $("#rs-X").val();
		new_pos.y  = $("#rs-Y").val();
		new_pos.z  = $("#rs-Z").val();
		new_pos.xv = $("#rs-Xv").val();
		new_pos.yv = $("#rs-Yv").val();
		new_pos.zv = $("#rs-Zv").val();
	} else {
		new_pos[id.toLowerCase()] = $("#rs-" + id).val();  // Change just this position/vector
	}
	console.log("New Position: ", new_pos);
	temp_func("ToDo: Go with InvKin and Pos/Vec" + id);
	// ToDo: Inverse Kinematic only with this position/vector
});
// Gripper:
$(document).on("click", ".btn-gripper", function() {
	console.log( "--> Gripper <--" );
	const gripper_closeness = parseFloat($("#rs-gripper").val());
	const gripper_value = parseFloat(gripper__closeness * 1275, 1);
	robot.send(`M3 S${gripper_value}`);
});