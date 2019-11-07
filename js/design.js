// console.log("Loaded design.js");

$(document).ready(() => {
    // For the colored "/" after an code-title:
    $(".d-codetitle").append("<span></span>");

    // To put the text from every button in a span:
    $(".d-btn").each(function() {
        $(this).contents().each(function() {
            if (this.nodeType == 3) $(this).replaceWith(`<span>${$(this).clone().children().remove().end().text()}</span>`);
        });
    });

    // Close a notice when clicking on the close-button:
    $(document).on("click", ".notice-close", function () {
        let thisNotice = $(this).parent().parent();
        notice_fadeOut_now(thisNotice);
    });


    // For the Number Inputs:
    $(document).on("click", ".d-input_number > button:first-of-type", function () {
        let nbr_input = this.parentNode.querySelector('input[type=number]');
        nbr_input.stepDown();
    });
    $(document).on("click", ".d-input_number > button:last-of-type", function () {
        let nbr_input = this.parentNode.querySelector('input[type=number]');
        nbr_input.stepUp();
    });
    $(document).on("focusout", ".d-input_number > input", function () {
        let nbr_input = this;
        if ( !nbr_input.checkValidity() ) {
            if ( nbr_input.value > nbr_input.max ) nbr_input.value = nbr_input.max;
            else nbr_input.value = nbr_input.min;
        }
    });
    
    
    // For the Radio Groups:
    $(".d-radio_group").prepend("<div></div>");
    $(document).on("click", ".d-radio_group span", function() {
    	$(this).siblings("span").removeClass("d-rg-active");  // remove "active" state from other elements
    	$(this).addClass("d-rg-active");  // add "active" state to this element
    	let div = $(this).siblings("div");
    	div.css("left", $(this).position().left);  // Move the div to highlight the active element
    	div.width($(this).outerWidth());  // Adjust the width to math the highlighted element
    	//if ( $(this).hasClass("") )
    	if( $(this).attr("d-rg-color") !== undefined ) div.css("background-color", $(this).attr("d-rg-color"));  // Add color if the attribute d-rg-color exists
    	$(this).parent().addClass("d-rg-nonEmpty");
    });

});

window.addEventListener("load", (event) => {
    $(".d-radio_group .d-rg-active").click();
},false);


function show_notice(text = "!", type = "notification") {
    if ( $("#notice-layer").length ) {
        let notice_id = "notice_" + Math.random().toString(36).substr(2).substr(0, 10);
        $("#notice-list").prepend('<div class="notice-box noticeType-' + type + '" id="' + notice_id + '"> <div class="notice-inner"><div class="notice-background"></div><div class="notice-close" click></div><span>' + text + '</span></div> </div>');
        let thisNotice = $("#" + notice_id);
        notice_clean_list();
        setTimeout(() => { notice_fadeOut(thisNotice) }, 5000);
    } else {
        $(document.body).append(`<div id="notice-layer"><div id="notice-list"></div></div>`);
        setTimeout(() => { show_notice(text, type) }, 100)
    }
}
function notice_fadeOut(thisNotice) {
    if ( thisNotice.hasClass("noFade") ) return null;
    else if ( $(`#${thisNotice[0].id}:hover`).length ) setTimeout(() => { notice_fadeOut(thisNotice) }, 500);
    else notice_fadeOut_now(thisNotice);
}
function notice_fadeOut_now(thisNotice) {
    thisNotice.addClass("notice-fadeOut");
    thisNotice.stop().animate({ height: "0" }, 1000);
    setTimeout(() => { thisNotice.remove() }, 1000);
}
function notice_clean_list() {
    if ( (($("#notice-layer").height() - 100) - $("#notice-list").height()) < 0 ) {
        notice_fadeOut_now($(".notice-box:not(.notice-fadeOut):last"));
        setTimeout(() => {
            if ( (($("#notice-layer").height() - 100) - $("#notice-list").height()) < 0 ) notice_clean_list();
        }, 1000);
    }
}