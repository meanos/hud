let win = nw.Window.get();
const volumes = require('volumes');
//win.showDevTools();
win.height = 58;
win.width = 500;
win.y = screen.height-200;
win.x = (screen.width/2) - 250;
App = parent.getInstance();
console.log("App: ",App);
let hideTimeout;
let init = false;

var currentPercentage = 0;

let displayBrightness = 1;

executeNativeCommand = (request,callback) => {
    var exec = require('child_process').exec, child;
    child = exec(request,function (error, stdout, stderr) {
        if (error !== null) {
            //console.log('exec error: ' + error);
            if (callback != null)
                callback(null,error);
        } else {
            if (callback != null)
                callback(stdout);
        }
    });
}

if (localStorage.getItem('displayBrightness') != null)
    displayBrightness = JSON.parse(localStorage.getItem('displayBrightness'));

checkCurrentVolume = () => {
    executeNativeCommand("amixer sget Master", function(res,err) {
        if (!err) {
            console.log("res: ",res);
            audioOutSplit = res.split("\n");
            console.log("res.split: ",audioOutSplit);
            var matches = audioOutSplit[4].match(/\[(.*?)\]/);

            console.log("matches: ",matches);
            if (matches) {
                var submatch = matches[1];

                currentPercentage = parseInt(submatch.replace(/\D/g,''));
                console.log("currentPercentage: ",currentPercentage)
            }
        }
        else
            console.log("err: ",err);
    });
}


changeBrightness = (brightness) => {
	const brightnessData = {
    		brightness: brightness
	}
	
	displayBrightness = brightness;

    console.log("changing brightness to: ", brightness);

	$.post("http://127.0.0.1:8081/system/display/change_brightness",brightnessData, function (data, status) {
		if (status == "success") {
			console.log("success brightness change");
			localStorage.setItem('displayBrightness', JSON.stringify(displayBrightness));
			//console.log("changed brightness: ",JSON.parse(localStorage.getItem('displayBrightness')));
		} else {
			console.log("An error occurred changing brightness");
		}
	});
}

checkCurrentVolume();

$(App.close_button).hide();
$(App.maximize_button).hide();
$(App.minimize_button).hide();
App.disableWindowDraggability();

App.enableBrightnessMode = () => {
    $(".hudElement").addClass("hidden");
    $("#brightnessControl").removeClass("hidden")
}

App.setBrightness = (percent) => {
    App.enableBrightnessMode();
    if (init) {
        clearTimeout(hideTimeout);
        win.show();
        win.y = screen.height-200;
        win.x = (screen.width/2) - 250;
        win.setAlwaysOnTop(true);
        hideTimeout = setTimeout(function(){win.hide(); }, 2000);
    } else {
        setTimeout(function(){ win.hide();}, 1000);
    }
    init = true;
    
    $("#brightnessControl .progress-bar").css("width",percent*100+"%");
    changeBrightness(percent);
}

App.enableVolumeMode = () => {
    $(".hudElement").addClass("hidden");
    $("#volumeControl").removeClass("hidden")
}

App.setVolume = (percent) => {
    App.enableVolumeMode();
    clearTimeout(hideTimeout);
    win.show();
    win.y = screen.height-200;
    win.x = (screen.width/2) - 250;
    win.setAlwaysOnTop(true);
    hideTimeout = setTimeout(function(){win.hide(); }, 2000);
    $("#volumeControl .progress-bar").css("width",percent+"%");
    volumes.set(percent).then(function(response) {
        //$("#volumeIcon").empty();
    });
}

App.increaseVolume = () => {
    if (currentPercentage < 100) {
        currentPercentage++;
        App.setVolume(currentPercentage)
    }
    
}

App.decreaseVolume = () => {
    if (currentPercentage > 0) {
        currentPercentage--;
        App.setVolume(currentPercentage)
    }
    
}

App.toggleMute = () => () {
    //
}

App.increaseBrightness = () => {
    if (displayBrightness < 1) {
        displayBrightness = Number((displayBrightness+0.1).toFixed(1)); //fixing the weird inacurrate rounding (noticed this after 0.7)
        App.setBrightness(displayBrightness)
    }
    
}

App.decreaseBrightness = () => {
    if (displayBrightness > 0) {
        displayBrightness = Number((displayBrightness-0.1).toFixed(1)); //fixing the weird inacurrate rounding (noticed this after 0.7)
        App.setBrightness(displayBrightness)
    }
    
}

App.setBrightness(displayBrightness);