var DEFAULT_TIMEOUT_INTERVAL_IN_MILLIS = 900000;

var serviceId = -1;
var batteryLevel = 100;

function startService() {

    // fetch geo location data
    fetchLocationData();

    serviceId = setTimeout('startService()', getTimeoutInterval());

}

function stopService() {
    if (serviceId != -1) {
        clearTimeout(serviceId)
    }
}


function fetchLocationData() {

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(onSucess, onError, {
            maximumAge: 3000,
            timeout: 5000,
            enableHighAccuracy: true
        });
    }
}

/**
 * callback method when call to fetch location data is successfult
 *
 */

function onSucess(position) {

    window.localStorage.lat = position.coords.latitude;

    window.localStorage.lon = position.coords.longitude;

    updateDeviceLocation(window.localStorage.userId, window.localStorage.lat, window.localStorage.lon);
}


/**
 * callback method when call to fech location data fails
 *
 */

function onError(error) {
    //fetch lat and lon from cache  
    if (window.localStorage.lat != null && window.localStorage.lon != null) {
        postLocationData(window.localStorage.userId, window.localStorage.lat, window.localStorage.lon);
    } else {
        // do nothing
    }
}


function updateDeviceLocation(userId, lat, lon) {

    var networkConnectivityAvailable = isConnected();

    if (networkConnectivityAvailable) {
        var webServiceUrl = getWebServiceBaseUrl() + '/updateDeviceLocation';
        var deviceId = getDeviceId();
        var deviceType = getDeviceType();

        $.ajax({
            type: "POST",
            url: webServiceUrl,
            data: {
                "pin": userId,
                "deviceId": deviceId,
                "deviceType": deviceType,
                "latitude": lat,
                "longitude": lon
            },
            error: function (xhr) {
                console.log(xhr.status + " " + xhr.statusText);
            },
            success: function (result, status, xhr) {
                console.log(status + " " + result);
            }
        });
    }
}

function updateOptIn(userId, status) {

    var networkConnectivityAvailable = isConnected();

    if (networkConnectivityAvailable) {
        var webServiceUrl = getWebServiceBaseUrl() + '/updateOptIn';
        var deviceId = getDeviceId();
        var deviceType = getDeviceType();

        $.ajax({
            type: "POST",
            url: webServiceUrl,
            data: {
                "pin": userId,
                "deviceId": deviceId,
                "deviceType": deviceType,
                "status": status
            },
            error: function (xhr) {
                console.log(xhr.status + " " + xhr.statusText);
            },
            success: function (result, status, xhr) {
                console.log(status + " " + result);
            }
        });
    }
}

function getTimeoutInterval() {

    var temp = 100 - batteryLevel;
    if (temp < 15) {
        return 900000;
    } else if (temp > 85) {
        return 7200000;
    } else {
        return 7200000 * (temp / 100);
    }

}

function getWebServiceBaseUrl() {
    return "http://hoojook.com/analysis-services/mongoservice";
}

function getDeviceId() {
    return device.uuid;
}

function getDeviceType() {
    return device.platform;
}

function isConnected() {
    return true;
}

function onBatteryStatus(info) {
    batteryLevel = info.level;

}

function loadData() {

    //load agreement

    window.addEventListener("batterystatus", onBatteryStatus, false);

    if (window.localStorage.agreed == null) {
        window.localStorage.agreed = 'false';
    } else if (window.localStorage.agreed == 'true') {
        $('#agree').prop("checked", true);
    } else {
        $('#agree').prop("checked", false);
    }

    // load Pin as userId
    if (window.localStorage.userId != null) {
        $('#activationPin').attr("value", window.localStorage.userId);
    }
}

function addEventListeners() {

    // add opt-in listener
    $('#agree').click(function () {
        window.localStorage.agreed = $('#agree').is(":checked");
    });

    // add submit form request listener
    $('#activationForm').submit(function () {

        //if agreement is accepted then start service else stop service
        if (window.localStorage.agreed == 'true') {

            window.localStorage.userId = $('#activationPin').val();
            updateOptIn(window.localStorage.userId, "true");
            startService();
        } else {
            updateOptIn(window.localStorage.userId, "false");
            stopService();
        }

        return false;

    });
}

function verifyAndStartService() {
    if (window.localStorage.agreed == 'true' && window.localStorage.userId != null) {
        startService();
    }
}
