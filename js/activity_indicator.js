/*
* Author: Robin Garbe
* Version: 1.0.0
*/

/*
module.exports = {
    show: (indicator) => {
        show_activity(indicator);
    }
}
*/

function show_activity(indicator) {
	let activity = $("<span></span>");
	this_activity = activity.prependTo($(indicator));
	setTimeout(() => { $(indicator+" span:last-child").remove(); }, 2000);
}

$(document).ready(() => {
    init();
});

let init = function() {
    $("head").append(`
<style>
/* -------------------------------------------------------------------------- */
/* --------------------------- Activity Indicator: -------------------------- */
/* -------------------------------------------------------------------------- */

.activity_indicator {
    position: relative;
    display: inline-block;
    height: 6px;
    width: 6px;
    margin: 0 15px;
    vertical-align: middle;
}
.activity_indicator::after {
    content: "";
    position: absolute;
    display: block;
    background-color: #bbb;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
    border-radius: 6px;
}
.activity_indicator > span {
    position: absolute;
    display: block;
    width: 30px;
    height: 30px;
    margin: -12px 0 0 -12px;
    border-radius: 30px;
    box-shadow: 0 0 30px 4px #bbb inset;
    opacity: 0;
    animation-name: ai_activity;
    animation-duration: 2s;
    animation-timing-function: ease-out;
}
.ai_blue::after, *[data-state='3'] + .activity_indicator::after { background-color: #6EA0E6; }
.ai_blue > span, *[data-state='3'] + .activity_indicator > span { box-shadow: 0 0 30px 4px #6EA0E6 inset; }
.ai_green::after, *[data-state='2'] + .activity_indicator::after { background-color: #51A84C; }
.ai_green > span, *[data-state='2'] + .activity_indicator > span { box-shadow: 0 0 30px 4px #51A84C inset; }
.ai_yellow::after, *[data-state='1'] + .activity_indicator::after { background-color: #E6AA40; }
.ai_yellow > span, *[data-state='1'] + .activity_indicator > span { box-shadow: 0 0 30px 4px #E6AA40 inset; }
.ai_red::after, *[data-state='0'] + .activity_indicator::after { background-color: #C04D4A; }
.ai_red > span, *[data-state='0'] + .activity_indicator > span { box-shadow: 0 0 30px 4px #C04D4A inset; }
@keyframes ai_activity {
    from { transform: scale(0); opacity: 1; }
    to { transform: scale(1); opacity: 0; }
}
</style>
    `);
};
