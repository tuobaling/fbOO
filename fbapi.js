//fb init
window.fbAsyncInit = function () {
    FB.init({
        appId: fb_appid,
        status: true,
        cookie: true,
        xfbml: true,
        channel: location.origin + fb_channel
    });
}
// 非同步的載入 SDK 的原始碼
(function (d) {
    var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
    if (d.getElementById(id)) { return; }
    js = d.createElement('script'); js.id = id; js.async = true;
    js.src = "//connect.facebook.net/zh_TW/all.js";
    ref.parentNode.insertBefore(js, ref);
}(document));

var userData = {}; var shareData = {}; var sharePhoto = {};

function fbObj() {
    //params
    var _fbuid = ''; var _fbaccesstoken = ''; var _fbusername = ''; var _fbbir = ''; var _fbemail = '';

    this.getuid = function (param) { return _fbuid; }
    this.getaccesstoken = function (param) { return _fbaccesstoken; }
    this.getname = function (param) { return _fbusername; }
    this.getbirthday = function (param) { return _fbbir; }
    this.getemail = function (param) { return _fbemail; }

    //f(x)s
    this.fbLoginClick = function () { FB.getLoginStatus(this.fbLoginCheck); }
    this.fbLoginCheck = function (response) {
        if (response.status === 'connected') { fbGetData(response); }
        else { FB.login(this.fbPopLogin, { scope: fb_scope }); }
    }
    this.fbPopLogin = function (response) {
        if (response.authResponse) { fbGetData(response); }
        else { alert('請先允許該應用程式授權!'); }
    }
    this.fbLogoutClick = function () { FB.logout(location.reload()); }
    this.fbShareClick = function (fbLinkUrl) { //fbshare & fbpush所達到的結果都是一樣的
        window.open('http://www.facebook.com/sharer/sharer.php?u=' + fbLinkUrl, 'NewWindow', 'height=500, width=850');
    }
    this.fbPushClick = function () { FB.api('/me/feed', 'post', shareData, fbPushCheck); }
    this.fbAlbumClick = function () { FB.api('/me/albums', this.fbAlbumCheck); }
    this.fbAlbumCheck = function (response) { showAlbums(response.data); }
    this.fbFredClick = function () { FB.api('/me/friends', this.fbFredCheck) }
    this.fbFredCheck = function (response) { fbFredShow(response.data); }
    this.fbPhotoClick = function () { FB.api('/me/photos', 'POST', sharePhoto, fbPhotoCheck); }

    function fbGetData(response) {
        _fbuid = response.authResponse.userID;
        _fbaccesstoken = response.authResponse.accessToken;

        FB.api('/me', fbGetUserData);
    }

    function fbGetUserData(response) {
        _fbusername = response.name;
        _fbbir = response.birthday;
        _fbemail = response.email;
        // print();
        console.log('Your Welcome!fb_email=' + _fbemail);
    }

    function fbPushCheck(response) {
        if (!response || response.error) { alert('系統有誤，請稍後再試'); }
        else { alert('發布成功'); }
    }
    function ex() {
        //FriendList
        //function fbFredShow(friendlist) {
        //    if ($(".image") !== null) { $(".image").empty(); }
        //    for (var i = 0; i < friendlist.length; i++) {
        //        FB.api('/' + friendlist[i].id + '/albums?fields=name,cover_photo,link,from', fbFredList);
        //    }
        //}

        //var t = '';
        //function fbFredList(response) {
        //    for (var j = 0; j < response.data.length; j++) {
        //        if (response.data[j].name === 'Profile Pictures') {
        //            var p = "https://graph.facebook.com/" + response.data[j].cover_photo + "/picture?access_token=" + _fbaccesstoken;
        //            t += '<div style="width:150px;height:220px;float:left;"><img style="width:150px;height:150px" src="' + p + '"/><span>' + response.data[j].from.name + '</span></div>';
        //        }
        //    }
        //    $('.friendList').html(t);
        //}
    }

    function fbFredShow(friendlist) {
        for (var i = 0; i < friendlist.length; i++) {
            FB.api('/' + friendlist[i].id + '?fields=name,picture.type(normal).width(150).height(150)', fbFredList);
        }
    }

    function showAlbums(mealbums) {
        if ($(".friendList") !== null) { $(".friendList").empty(); }
        var h = '';
        for (var i = 0; i < mealbums.length; i++) {
            if (mealbums[i].cover_photo) {
                var p = "https://graph.facebook.com/" + mealbums[i].cover_photo + "/picture?access_token=" + _fbaccesstoken;
                h += '<a href="javascript:showPhotos(\'' + mealbums[i].id + '\');"><img src="' + p + '" style="width:200px" ></a>';
            }
        }
        $(".image").empty().html(h);
    }

    function fbPhotoCheck(response) {
        if (!response || response.error) { alert('系統有誤，請稍後再試'); }
        else { alert('發布成功'); }
    }

}
function showPhotos(id) {
    FB.api('/' + id + '?fields=photos.limit(500).fields(source,name)', showPhotoList);
}

var t = '';
function fbFredList(response) {
    if ($(".image") !== null) { $(".image").empty(); }
    var p = response.picture.data.url;
    t += '<div style="width:100px;height:200px;float:left;"><img style="width:100px;" src="' + p + '"/><span>' + response.name + '</span></div>';
    $('.friendList').html(t);
}

function showPhotoList(response) {
    var h = '';
    for (var i = 0, j = response.photos.data.length; i < j; i++) {
        var n = response.photos.data[i].name === undefined ? '' : response.photos.data[i].name;
        h += '<a href="javascript:void(0);" onclick="selectPhoto(this)"><div><img src="' + response.photos.data[i].source + '" ></div></a>';
    }
    $('.image').empty().html(h);
}

function selectPhoto(t) {
    var fbobj = new fbObj();
    fbpushstr = confirm("您確定要發布嗎？")
    if (fbpushstr) {
        var s = $(t).find('img').attr('src');
        shareData.message = "訊息";
        shareData.picture = s;
        shareData.link = "http://www.allenj.net";
        shareData.name = "Allen J";
        shareData.caption = "www.allenj.net";
        shareData.description = "Allen J Blog";
        fbobj.fbPushClick();
    }
}
