// 非同步的載入 SDK 的原始碼
(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/zh_TW/all.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
//fb init
window.fbAsyncInit = function () {
    FB.init({
        appId: fb_appid,
        frictionlessRequests: true,
        //channel: 'http://cell.webgene.com.tw/Mei/testfbapi/channel.html',
        status: true,
        cookie: true,
        xfbml: true
        //channel: location.origin + fb_channel
    });
}
//FB Obj
function fbObj() {
    //params
    var _fbuid = ''; var _fbaccesstoken = ''; var _fbusername = ''; var _fbbir = ''; var _fbemail = ''; var _fbgender = ''; var _fbname = '';

    this.getuid = function (param) { return _fbuid; }
    this.getaccesstoken = function () { return _fbaccesstoken; }
    this.getusername = function (param) { return _fbusername; }
    this.getbirthday = function (param) { return _fbbir; }
    this.getemail = function (param) { return _fbemail; }
    this.getgender = function (param) { return _fbgender; }
    this.getname = function (param) { return _fbname; }

    this.shareData = {};
    this.sharePhoto = {};
    this.FredData = {};
    this.sendData = {};
    this.fredID = [];

    //f(x)s
    this.fbLoginClick = function () { FB.getLoginStatus(fbLoginCheck); }
    var fbLoginCheck = function (response) {
        if (response.status === 'connected') { fbGetData(response); }
        else { FB.login(fbPopLogin, { scope: fb_scope }); }
    }
    var fbGetData = function (response) {
        _fbuid = response.authResponse.userID;
        _fbaccesstoken = response.authResponse.accessToken;

        FB.api('/me', fbGetUserData);
    }
    var fbGetUserData = function (response) {
        _fbusername = response.username;
        _fbbir = response.birthday;
        _fbemail = response.email;
        _fbgender = response.gender;
        _fbname = response.name;
        console.log('Your Welcome!My friend~!' + _fbname);
    }
    var fbPopLogin = function (response) {
        if (response.authResponse) { fbGetData(response); }
        else { alert('請先允許該應用程式授權!'); }
    }
    this.fbLogoutClick = function () { FB.logout(location.reload()); }
    this.fbShareClick = function (fbLinkUrl) { //fbshare & fbpush所達到的結果都是一樣的
        window.open('http://www.facebook.com/sharer/sharer.php?u=' + fbLinkUrl, 'NewWindow', 'height=500, width=850');
    }
    this.fbPushClick = function () { FB.api('/me/feed', 'post', this.shareData, fbPushCheck); }
    //Push
    var fbPushCheck = function (response) {
        if (!response || response.error) { alert('系統有誤，請稍後再試'); }
        else { alert('發布成功'); }
        location.reload();
    }
    this.fbAlbumClick = function () { FB.api('/me/albums', showAlbums); }
    var showAlbums = function (response) {
        var mealbums = response.data;
        //console.log(JSON.stringify(mealbums));
        var h = '';
        for (var i = 0; i < mealbums.length; i++) {
            var coverphoto = mealbums[i].cover_photo;
            var photoid = mealbums[i].id;
            if (mealbums[i].cover_photo) {
                var p = "https://graph.facebook.com/" + coverphoto + "/picture?access_token=" + _fbaccesstoken;
                h += '<div class="' + coverphoto + '" style="width:200px;height:200px;float:left;">';
                h += '<img src="' + p + '" style="width:200px;height:200px" >'
                h += '</div>';
            }
            $(".image").empty().html(h);
            $('body').on('click', '.' + coverphoto, { coverid: photoid }, showPhotos)
        }
    }
    var showPhotos = function (response) {
        FB.api('/' + response.data.coverid + '?fields=photos.limit(500).fields(source,name)', showPhotoList);
    }
    var showPhotoList = function (response) {
        //console.log(response);
        var h = '';
        for (var i = 0, j = response.photos.data.length; i < j; i++) {
            var photoid = response.photos.data[i].id;
            var photosource = response.photos.data[i].source;
            h += '<div class="' + photoid + '">';
            h += '<img src="' + photosource + '" >';
            h += '</div>';
            $('.image').empty().html(h);
            $('body').on('click', '.' + photoid, { photolink: photosource }, selectPhoto)
        }
    }
    this.fbFredClick = function () { FB.api('/me/friends', fbFredCheck) }
    var fbFredCheck = function (response) {
        for (var i = 0; i < response.data.length; i++) {
            FB.api('/' + response.data[i].id + '?fields=name,picture.type(normal).width(150).height(150)', fbFredList);
        }
    }
    //FredData
    var t = '';
    var fbFredList = function (response) {
        var p = response.picture.data.url;
        var userid = response.id;
        t += '<div class="' + userid + '" style="width:100px;height:180px;float:left;">'
        t += '<img style="width:100px;" src="' + p + '"/>'
        t += '<span>' + response.name + '</span>'
        t += '</div>';
        $('.friendList').empty().html(t);
        $('body').on('click', '.' + userid, { sendid: userid }, choiceFriend)
    }

    var num = 1;
    var choiceFriend = function (response) {
        if (num > 1) {
            alert('已選擇超過一位!將以最後選擇的為主')
            fbobj.fredID[1] = response.data.sendid
        }
        else { fbobj.fredID[num] = response.data.sendid }
        num++;
        console.log(fbobj.fredID);
    }

    this.sendListClick = function () { FB.ui(this.sendData, requestCallback); }
    var requestCallback = function (response) {
        if (response != 'success') { console.log(response); }//('系統有誤，請稍後再試');
        else { alert('發布成功'); }
        $(".friendList").dialog("close");
    }
    this.fbPhotoClick = function () { FB.api('/me/photos', 'POST', this.sharePhoto, fbPhotoCheck); }

    //Upload Photo
    var fbPhotoCheck = function (response) {
        if (!response || response.error) { alert('系統有誤，請稍後再試'); }
        else { alert('發布成功'); }
        location.reload();
    }
}
