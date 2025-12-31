var getkobis_srv = window.localStorage.getItem("kobis_srv");
if (getkobis_srv == null) {
    var ua = navigator.userAgent;
    // determine Hybrid
    if (ua.match(/KOBIS-HYBRID/i)) {
        getkobis_srv = "https://mproxy.kbs.co.kr";
    } else {
        getkobis_srv = "https://mk.kbs.co.kr";
    }
}

var str = "";
// str += '<style type="text/css">@import url("' + getkobis_srv + '/m001/css/cap.css");</style>';
str += '<div id="cap">';
str += '<h1 onclick="CapkobisHome();">KOBIS</h1>'; //메인페이지
str += "<ul>";
str += '	<li><a href="javascript:CaplistNoti();"><img src="' + getkobis_srv + '/m001/images/cap/util_talk.png" alt="" /></a></li>';
str += '	<li><a href="javascript:CapuserSearch();"><img src="' + getkobis_srv + '/m001/images/cap/util_search.png" alt="" /></a></li>';
str += '	<li><a href="javascript:CaplistSiteMap();"><img src="' + getkobis_srv + '/m001/images/cap/util_menu.png" /></a></li>';
str += "</ul>";
str += "</div>";

document.write(str);

function CapkobisHome() {
    if (typeof loadingOn == "function") {
        loadingOn();
    } else {
        nimbleImport = "";
        nimbleImport += '<style type="text/css">@import url("' + getkobis_srv + '/m001/css/jquery-nimble-loader.css");</style>';
        nimbleImport += '<script type="text/javascript" src="' + getkobis_srv + '/m001/js/jq/jquery.nimble.loader.js"/></script>';

        $("#cap").append(nimbleImport);

        capLoadingOn();
    }

    setTimeout(function () {
        location.href = "/m001/login.do?target=/main.do";
    }, 300);
}

function CaplistNoti() {
    if (typeof loadingOn == "function") {
        loadingOn();
    } else {
        nimbleImport = "";
        nimbleImport += '<style type="text/css">@import url("' + getkobis_srv + '/m001/css/jquery-nimble-loader.css");</style>';
        nimbleImport += '<script type="text/javascript" src="' + getkobis_srv + '/m001/js/jq/jquery.nimble.loader.js"/></script>';

        $("#cap").append(nimbleImport);

        capLoadingOn();
    }

    setTimeout(function () {
        location.href = getkobis_srv + "/m001/login.do?target=/view/listNoti.do";
    }, 300);
}

function CapuserSearch() {
    if (typeof loadingOn == "function") {
        loadingOn();
    } else {
        nimbleImport = "";
        nimbleImport += '<style type="text/css">@import url("' + getkobis_srv + '/m001/css/jquery-nimble-loader.css");</style>';
        nimbleImport += '<script type="text/javascript" src="' + getkobis_srv + '/m001/js/jq/jquery.nimble.loader.js"/></script>';

        $("#cap").append(nimbleImport);

        capLoadingOn();
    }

    setTimeout(function () {
        location.href = getkobis_srv + "/mobile/org/morg.nsf/home?readform";
    }, 300);
}

function CaplistSiteMap() {
    if (typeof loadingOn == "function") {
        loadingOn();
    } else {
        nimbleImport = "";
        nimbleImport += '<style type="text/css">@import url("' + getkobis_srv + '/m001/css/jquery-nimble-loader.css");</style>';
        nimbleImport += '<script type="text/javascript" src="' + getkobis_srv + '/m001/js/jq/jquery.nimble.loader.js"/></script>';

        $("#cap").append(nimbleImport);

        capLoadingOn();
    }

    setTimeout(function () {
        location.href = getkobis_srv + "/m001/login.do?target=/view/listSiteMap.do";
    }, 300);
}

function capLoadingOn() {
    $("body").nimbleLoader("show", {
        position: "fixed",
        loaderClass: "loading_bar_body",
        hasBackground: true,
        zIndex: 999
    });
}

function capLoadingOff() {
    if (!$("body").nimbleLoader("isShow")) return false;

    $("body").nimbleLoader("hide");
}
