import St from "gi://St";
import Pango from "gi://Pango";
import Clutter from 'gi://Clutter';
import * as Main from "resource:///org/gnome/shell/ui/main.js";




let tooltipActive = false;
let _ttbox = null;
let _ttlabel = null;
let _ttlayout = null;


export async function showTooltip(text) {
    // Active tool tip
    tooltipActive = true;
    let _ttboxWidth = 0;
    let _ttboxHeight = 0;

    if (!_ttbox) {
        _ttbox = new St.Bin({ style_class: 'app-tooltip' });
        _ttlayout = new St.BoxLayout({ vertical: true });
        _ttlabel = new St.Label({ style_class: 'app-tooltip-title', text: text });
        _ttlayout.add_child(_ttlabel);
        _ttbox.add_child(_ttlayout);

        


        // Wrap
        _ttlabel.clutter_text.line_wrap = true;
        _ttlabel.clutter_text.line_wrap_mode = Pango.WrapMode.WORD;
        _ttlabel.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;

        
        Main.uiGroup.add_child(_ttbox);

        _ttboxHeight = _ttbox.get_height()
        _ttboxWidth = _ttbox.get_width()
    } else {
        _ttlabel.text = text;
    }
    // Show/Hide elements as needed

    // Compute tooltip location


    log(tooltipActive)

    while (tooltipActive) {

        await new Promise(resolve => setTimeout(resolve, 10));

        let y = global.get_pointer()[1] - _ttboxHeight + 2;
        let x = global.get_pointer()[0] - _ttboxWidth + 2;

        // do not show label move if not in showing mode

        _ttbox.set_position(x, y);
    }

    _ttboxWidth = null;
    _ttboxHeight = null;
}


export async function hideTooltip() {
    tooltipActive = false;

    if (_ttbox) {
        _ttlabel = null;
        Main.uiGroup.remove_child(_ttbox);
        _ttbox = null;
    }

    log("Status of tool tip (hide)")
    log(tooltipActive)

}
