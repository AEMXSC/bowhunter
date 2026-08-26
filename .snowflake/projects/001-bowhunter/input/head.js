// @ts-nocheck

// .NET inclusion or not
if (typeof dotNetInclusion === 'undefined') {
    dotNetInclusion = '.aspx';
}

// console.log('TEST 123');
// Cookie functions
function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; Secure; HttpOnly; SameSite=Strict; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
function eraseCookie(name) {   
    document.cookie = name+'=; Max-Age=-99999999;';  
}
function closeModal(){
    $('.lity').remove();
}

var $siteID = document.querySelector("meta[name='websiteID']").getAttribute('content');
var $subscribePage = document.querySelector("meta[name='subscribepage']").getAttribute('content');

// ////////
// Vue change status
function changeStatus(controller) {
    if (getCookie('PremiumUser' + $siteID) !== null) {
        header.auth = 'auth';
        sidebar.auth = 'auth';
        authOverlay.auth = 'auth';
        authContent.auth = 'auth';
    } else {
        header.auth = 'anon';
        sidebar.auth = 'anon';
        authOverlay.auth = 'anon';
        authContent.auth = 'anon';
    }
    location.reload();
}
function getQueryVariable(data, variable) {
    var query = data;
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
}

// Auth vars
var initStatus;
var isFree = 'false';
var checkers = ['header', 'sidebar', 'authOverlay', 'content'];
var $authQuery = '/AuthenticatePremium' + dotNetInclusion;
var $appendable = '';
var $username = '';
var $useremail = '';
var $authAttr = getCookie('PremiumUser' + $siteID);
// var $authAttr = 'Name=John Brown&Email=premiumtest@mail.com&Token=29d337be328fd32e45d0cc21dea4d598&expireIssue=2022-12-01&authenticated=True&cookieExpireDate=10/07/2022'; // for local only

// initStatus = 'auth'; // for testing
// console.log('Free: ' + initStatus);

// Check cookie
if ($authAttr) {    
    initStatus = 'auth';
    $username = getQueryVariable($authAttr, 'Name');
    $useremail = getQueryVariable($authAttr, 'Email');
    $appendable = getQueryVariable($authAttr, 'Token');
} else {
    initStatus = 'anon';
}
