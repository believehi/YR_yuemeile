var AppName = '阅美乐',
	//baseURL = 'http://yml.02.t1m.cn',	
	//AudioAPI = 'http://ymlpv.02.t1m.cn/AudioFile/',
	//ImgUrl = 'http://ymlpv.02.t1m.cn/Img/',
	wwwUrl = 'http://ymlapp.dhredu.cn',
	URL = 'https://yml.dhredu.cn/yiru/yml/',
	PvUrl = 'https://z.newstaredu.cn/ymlapp',
	CaCheNum = 5,
	isupdate = false;
// 绘本DVD旋转函数
function DVDRotate(xElem) {
	var num = 0;
	var _time = setInterval(function() {
		xElem.css({
			"transform": 'rotate(' + (num = num + 1) + 'deg)'
		});
	}, 50);
}
(function($, app) {
	//学生登录
	app.PostData = function(oldData, isteacher) {
		var post = {};
		post.token = !isteacher ? app.getuserinfo().token : app.getteacherinfo().token;
		//console.log("POST:" + app.deviceId());
		post.loginMark = app.deviceId();
		if (app.isJsonFormat(oldData)) {
			post.data = JSON.stringify(oldData || {});
		} else {
			post.data = oldData;
		}
		return post;
	};
	app.isJsonFormat = function(str) {
		var obj = str;
		var xy = Object.prototype.toString.call(obj);
		if (xy == "[object Object]" || xy == "[object Array]") {
			return true;
		} else {
			return false;
		}
	};
	app.RemoveItem = function(key) {
		plus.storage.removeItem(key);
	};
	app.getajax = function(path, callback, dataitem, mask, modth, cache, isteacher) {
		//console.log("请求参数：" + JSON.stringify(app.PostData(dataitem))+"------"+path)
		/*
		cache = cache || {};
		if (cache.key) {
			//console.log("缓存开启");
			var cachedata = plus.storage.getItem(path + cache.key);
			if (cachedata != null && cachedata != 'null' && cachedata) {
				var cachejson = JSON.parse(cachedata);
				if (app.TimeDifference(new Date(cachejson.time), new Date()) < cache.num) {
					if (mask) {
						mask.close();
					}
					//console.log("用的缓存数据");
					return callback(cachejson.data);
				}
			}
		}
		*/
		mui.ajax(URL + path, {
			data: app.PostData(dataitem, isteacher),
			dataType: 'json',
			//type: modth || 'post',
			type: 'post',
			timeout: 10000,
			success: function(data) {
				//console.log(JSON.stringify(app.PostData(dataitem)))
				//console.log(JSON.stringify(data));

				if (mask) {
					mask.close();
				}
				if (data.code == 410) {
					//console.log("接口返回401了:" + path);
					//console.log(localStorage.getItem('$yml_userinfo'));
					//console.log("上次的:" + app.getuserinfo().loginMark);
					//console.log("本次的:" + app.deviceId());
					
					if (!isteacher) {
						mui.toast("您的账号可能在别的设备登录了");
						app.logout();
						app.openVW("/pages/UserLogin/Userlogin.html");
						setTimeout(function() {
							YiRu.closeAllwebview("/pages/UserLogin/Userlogin.html");
						}, 300);
					} else {
						mui.toast("您还未登录或登录超时");
						YiRu.logout_teacher();
						YiRu.openVW("/pages/teacherLogin/teacherLogin.html");
						setTimeout(function() {
							YiRu.closeAllwebview("/pages/teacherLogin/teacherLogin.html");
						}, 300);
					}
					return;
				}
				if (data.code == 200) {
					// if (cache.key) {
					// 	plus.storage.setItem(path + cache.key, JSON.stringify({
					// 		data: data,
					// 		time: new Date()
					// 	}));
					// }
					return callback(data);
				} else {
					mui.toast(data.info);
					return;
				}
			},
			error: function(xhr, type, errorThrown) {
				//alert(xhr.responseText);
				//console.log(xhr.responseText+"/"+path);
				reloadWvLoad();
				if (mask) {
					mask.close();
				}
			}
		});
	};
	app.WaitingStyle = function(s) {
		var _s = {
			color: "#ffffff",
			size: "14px",
			padding: "20px",
			background: "rgba(37,151,218,1)",
			loading: {
				type: "snow"
				// 	icon: "/img/touxiang.png",
				// 	height: "60px"
			}
		};
		if (s) _s.push(s);
		return _s;
	};
	// 获取用户头像
	app.getajax_nomark = function(path, callback, dataitem, modth) {
		mui.ajax(URL + path, {
			data: app.PostData(dataitem),
			dataType: 'json',
			//type: modth || 'post',
			type: 'post',
			timeout: 10000,
			success: function(data) {
				//console.log(JSON.stringify(data)+"/"+dataitem);
				if (data.code == 200) {
					return callback(data);
				}
			},
			error: function(xhr, type, errorThrown) {
				//alert(xhr.responseText);
				//console.log(xhr.responseText + "/"+path+"/" + JSON.stringify(dataitem));
				//reloadWvLoad();
				//w.close();
			}
		});
	};
	//2各日期相差分钟数
	app.TimeDifference = function(k, j) {
		return (j.getTime() - k.getTime()) / 1000 / 60 //时间差的毫秒数
	};
	app.getpicture = function(filename, typename) {
		// var filename = loadUrl.substring(loadUrl.lastIndexOf("/") + 1, loadUrl.length);
		if (YiRu.ios() && filename.split('.')[1] == "mp3") {
			return "_doc/" + typename + "/" + filename;
		}
		return plus.io.convertLocalFileSystemURL("_doc/" + typename + "/" + filename);
	}
	//根据远程url地址返回本地文件地址，如果已经下载了的话
	app.getFileUrlbyLocal = function(loadUrl, path) {
		path = path ? path + "/" : "";
		if (loadUrl == null || loadUrl == "") return loadUrl;
		var filename = loadUrl.substring(loadUrl.lastIndexOf("/") + 1, loadUrl.length);
		var relativePath = "_doc/" + path + filename;
		if (YiRu.ios() && (filename.split('.')[1] == "mp3" || filename.split('.')[1] == "wav")) {
			return relativePath;
		}
		return plus.io.convertLocalFileSystemURL(relativePath);
		//}, function(e) {
		//return loadUrl;
		//});
	};
	app.getheadIconUrl = function(loadUrl, callback) {
		if (loadUrl == null || loadUrl == "" || loadUrl == " ") return callback("");
		if (loadUrl.split('.').length < 2) return callback("");
		var filename = loadUrl.substring(loadUrl.lastIndexOf("/") + 1, loadUrl.length);
		var relativePath = "_doc/" + filename;
		//检查是否已存在
		plus.io.resolveLocalFileSystemURL(relativePath, function(entry) {
			return callback(plus.io.convertLocalFileSystemURL(relativePath));
		}, function(e) {
			return app.DownFile(loadUrl, relativePath, callback);
		});
	};
	app.getFileUrl = function(loadUrl, callback, loadback) {
		if (loadUrl == null || loadUrl == "" || loadUrl == " ") return callback("");
		//下载成功 默认保存在本地相对路径的"_downloads"文件夹里面, 如"_downloads/logo.jpg"  
		var filename = loadUrl.substring(loadUrl.lastIndexOf("/") + 1, loadUrl.length);
		var relativePath = "_doc/" + filename;
		//检查是否已存在  
		plus.io.resolveLocalFileSystemURL(relativePath, function(entry) {
			if (YiRu.ios() && filename.split('.')[1] == "mp3") {
				return callback(relativePath);
			}
			return callback(plus.io.convertLocalFileSystemURL(relativePath));
		}, function(e) {
			return app.DownFile(loadUrl, relativePath, callback, loadback);
		});
	};
	app.DownFile = function(loadUrl, relativePath, callback, loadback) {
		//创建下载任务  
		var dtask = plus.downloader.createDownload(loadUrl, {
			filename: relativePath,
			retryInterval: 1
		}, function(d, status) {
			//console.log(status);
			if (status == 200) {
				//console.log("下载成功");
				if (YiRu.ios() && relativePath.split('.')[1] == "mp3") {
					return callback(relativePath);
				}
				return callback(plus.io.convertLocalFileSystemURL(d.filename));
			} else {
				//console.log("下载失败");
				if (relativePath != null) delFile(relativePath);
				return callback(loadUrl);
			}
			plus.downloader.clear();
		});
		if (loadback) {
			dtask.addEventListener("statechanged", function(download, status) {
				//console.log(JSON.stringify(download));
				if (download.state != 4) {
					return loadback(download.downloadedSize, download.totalSize);
					//console.log(download.downloadedSize);
					//console.log(download.totalSize);
					//console.log(download.state);
					//var bfb = parseInt((download.downloadedSize / download.totalSize) * 100);
					//$("#jdt").css("width", bfb + "%");
					//$("#bfb").html(bfb + "%");
				}
			}, false);
		}
		//启动下载任务
		dtask.start();
	};
	app.deviceId = function() {
		//plus.storage.setItem('uuid1309', e.uuid);
		var thisuuid = localStorage.getItem('$uuid') || ""; //plus.storage.getItem('uuid');
		//console.log("deviceId:" + thisuuid);
		if (thisuuid != "" && thisuuid != null) return thisuuid;
		plus.device.getInfo({
			success: function(e) {
				//console.log('getDeviceInfo success: ' + JSON.stringify(e));
				//console.log("getInfo:" + e.uuid);
				localStorage.setItem('$uuid', e.uuid);
				//plus.storage.setItem('uuid', e.uuid);
				return e.uuid;
			},
			fail: function(e) {
				//console.log('getDeviceInfo failed: ' + JSON.stringify(e));
				//mui.alert("无法获取到您的手机设备信息,请设置应用设备信息权限.");
				return "";
			}
		});
		// var uuuid = plus.device.uuid;
		// if (uuuid == "" || uuuid == null) {
		// 	mui.alert("无法获取到您的手机设备信息,请设置应用设备信息权限.");
		// }
		// return uuuid;
	};
	app.getuserinfo = function() {
		var stateText = localStorage.getItem('$yml_userinfo') || "{}";
		var _state = JSON.parse(stateText);
		//var _stateText = JSON.parse(stateText);

		return _state;

	};
	app.getteacherinfo = function() {
		var stateText = localStorage.getItem('$yml_teacherinfo') || "{}";
		var _state = JSON.parse(stateText);
		//var _stateText = JSON.parse(stateText);

		return _state;

	};

	app.setuserinfo = function(state, callback) {
		state = state || {};
		state.baseheadIcon = state.headIcon;
		app.getheadIconUrl(state.headIcon, function(headIcon) {
			state.headIcon = headIcon;
			localStorage.setItem('$yml_userinfo', JSON.stringify(state));
			return callback();
		});
	};
	app.setteacherinfo = function(state, callback) {
		state = state || {};
		state.baseheadIcon = state.headIcon;
		app.getheadIconUrl(state.headIcon, function(headIcon) {
			state.headIcon = headIcon;
			localStorage.setItem('$yml_teacherinfo', JSON.stringify(state));
			return callback();
		});
	};

	app.logout = function() {
		localStorage.setItem('$yml_userinfo', "{}");
	};
	app.logout_teacher = function() {
		localStorage.setItem('$yml_teacherinfo', "{}");
	};
	app.isLogin = function() {
		var userState = JSON.parse(localStorage.getItem('$yml_userinfo') || "{}");
		if (userState.userId && userState.userId != '' && userState != {}) {
			return true;
		} else {
			return false;
		}
	};
	app.isteacherLogin = function() {
		var userState = JSON.parse(localStorage.getItem('$yml_teacherinfo') || "{}");
		if (userState.userId && userState.userId != '' && userState != {}) {
			return true;
		} else {
			return false;
		}
	};
	app.UserLogin = function() {
		if (!app.isLogin()) {
			YiRu.openVW('/pages/UserLogin/Userlogin.html');
			return;
		};
	}
	app.teacherLogin = function() {
		//console.log("111");
		if (!app.isteacherLogin()) {
			YiRu.openVW('/pages/teacherLogin/teacherLogin.html');
			return;
		};
	}

	app.checkEmail = function(email) {
		email = email || '';
		return (email.length > 3 && email.indexOf('@') > -1);
	};
	app.checkCntxt = function(txt) {
		if (txt.length == 0) return true;
		var reg = new RegExp("[\\u4E00-\\u9FFF-a-zA-Z]+", "g");
		return reg.test(txt);
	};

	app.checkNick = function(txt) {
		if (txt.length == 0 || txt.length > 12) {
			return false;
		}
		var reg = new RegExp("[\\u4E00-\\u9FFF-_A-Za-z0-9\.\@\#]+", "g");
		if (reg.test(txt)) {
			return true;
		}
		return false;
	};

	app.checkPhone = function(phone) {
		phone = phone || '';
		var reg = /^0?(13|15|18|16|14|17|19)[0-9]{9}$/;
		return (reg.test(phone));
	};

	app.checkNumber = function(Number) {
		if (Number === "" || Number == null) {
			return false;
		}
		if (!isNaN(Number)) {
			return true;
		}
		return false;
	};

	//判断是否是ios
	app.ios = function() {
		if (plus.os.name.toLocaleLowerCase() == 'ios') {
			return true;
		} else {
			return false;
		}
	};
	//关闭除指定webview之外的所有webview,current位null则关闭所有
	app.closeAllwebview = function(current) {
		setTimeout(function() {
			var all = plus.webview.all();
			for (var i = 0, len = all.length; i < len; i++) {
				if (current != null) {
					if (all[i].id !== current && all[i].id != plus.runtime.appid) {
						plus.webview.close(all[i], "none");
						//all[i].close();
					}
				} else {
					if (all[i].id != plus.runtime.appid) {
						plus.webview.close(all[i], "none");
					}
					//all[i].close();
				}
			}
		}, 300);
	};
	app.md5Data = function(oldData) {
		var data = JSON.parse(JSON.stringify(oldData || {})); //保存原始数据
		//data = data || {};
		return data;
	}
	//IOS判断QQ是否已经安装
	app.isQQInstalled = function() {
		var TencentOAuth = plus.ios.import("TencentOAuth");
		var isQQInstalled = TencentOAuth.iphoneQQInstalled();
		return isQQInstalled == '0' ? false : true;
	};
	//IOS判断微信是否已经安装
	app.isWXInstalled = function() {
		var Weixin = plus.ios.import("WXApi");
		var isWXInstalled = Weixin.isWXAppInstalled();
		return isWXInstalled == '0' ? false : true;
	};
	//去掉空白
	app.trim = function(str) {
		return str.replace(/(^\s*)|(\s*$)/g, "");
	};
	//移除class样式
	app.removeClass = function(el, name) {
		if (!el)
			return;
		if (el.className.indexOf(name) >= 0)
			el.className = el.className.replace(name, '');
	};
	//移除所有class样式
	app.removeAllClass = function(el, name) {
		if (!el)
			return;
		if (el.className.indexOf(name) >= 0) {
			var reg = new RegExp(name, "g");
			el.className = el.className.replace(reg, '');
		}
	};
	//重写退出应用
	app.quitApp = function() {
		$.oldBack = mui.back;
		var backButtonPress = 0;
		$.back = function(event) {
			backButtonPress++;
			if (backButtonPress > 1) {
				plus.runtime.quit();
			} else {
				plus.nativeUI.toast('再按一次退出' + AppName);
			}
			setTimeout(function() {
				backButtonPress = 0;
			}, 1000);
			return false;
		};
	};
	//复制到剪切板
	app.copyclip = function(text) {
		if (plus.os.name.toLocaleLowerCase() == 'ios') {
			var UIPasteboard = plus.ios.importClass("UIPasteboard");
			var generalPasteboard = UIPasteboard.generalPasteboard();
			generalPasteboard.setValueforPasteboardType(text, "public.utf8-plain-text");
			//var value = generalPasteboard.valueForPasteboardType("public.utf8-plain-text"); 
			mui.toast('复制成功');
		} else {
			var Context = plus.android.importClass("android.content.Context");
			var main = plus.android.runtimeMainActivity();
			var clip = main.getSystemService(Context.CLIPBOARD_SERVICE);
			plus.android.invoke(clip, "setText", text);
			mui.toast('复制成功');
		}
	};
	//打开软键盘
	app.openSoftKeyboard = function() {
		if (mui.os.ios) {
			var webView = plus.webview.currentWebview().nativeInstanceObject();
			webView.plusCallMethod({
				"setKeyboardDisplayRequiresUserAction": false
			});
		} else {
			var webview = plus.android.currentWebview();
			plus.android.importClass(webview);
			webview.requestFocus();
			var Context = plus.android.importClass("android.content.Context");
			var InputMethodManager = plus.android.importClass("android.view.inputmethod.InputMethodManager");
			var main = plus.android.runtimeMainActivity();
			var imm = main.getSystemService(Context.INPUT_METHOD_SERVICE);
			imm.toggleSoftInput(0, InputMethodManager.SHOW_FORCED);
		}
	};
	//打开新窗口
	app.openVW = function(id, extras, New) {
		//plus.webview.open('xinshou.html', 'new', {}, 'slide-in-right', 200);
		New = New || false;
		$.openWindow({
			id: id,
			url: id,
			extras: extras,
			createNew: New,
			show: {
				autoShow: true,
				aniShow: 'pop-in', //pop-in,fade-in
				duration: 300,
				event: 'loaded',
				extras: {
					acceleration: 'capture', //capture,auto
				}
			},
			waiting: {
				autoShow: true,
				//title: '加载中...',
				options: YiRu.WaitingStyle()
			}
		});
	};
	app.openVW_ = function(id, extras, New) {
		//如果webview已经存在
		var _webview = plus.webview.getWebviewById(id);
		if (_webview) {
			//如果存在，但强制新建webview
			if (New) {
				_webview.close('none');
				_webview = app.createwebview(id, extras);
			}
		} else {
			//如果不存在webview则创建窗口
			_webview = app.createwebview(id, extras);
		}

		setTimeout(function() {
			//if (app.ios()) {
			//	setTimeout(function() {
			//	_webview.show('pop-in', 300, function() {
			//显示完成的操作fade-in
			//	}, extras);
			//	}, 150);
			//} else {
			//setTimeout(function() {
			_webview.show('pop-in', 300, function() {
				//显示完成的操作fade-in
			}, extras);
			//}, 150);
			//}
		}, 200);
	};
	//预加载
	app.preload = function(options) {
		if (options.url) {
			var _webview = plus.webview.getWebviewById(options.url);
			if (_webview) {
				//如果存在，但强制新建webview
				if (options.isnew) {
					_webview.close('none');
					app.createwebview(options.url, options.extras);
				}
			} else {
				//如果不存在webview则创建窗口
				app.createwebview(options.url, options.extras);
			}
		}
	};
	app.createwebview = function(id, extras) {
		return plus.webview.create(id, id, {
			background: 'transparent',
			render: '', //always
			scrollIndicator: 'none',
			softinputMode: YiRu.ios() ? 'adjustPan' : 'adjustResize', //软键盘模式，adjustResize|adjustPan
			softinputNavBar: 'none' //软键盘导航条
		}, extras || {});
	}
	//格式化图文信息得图片样式
	app.parseDomImg = function(str) {
		var objE = document.createElement("div");
		objE.innerHTML = str;

		var imgs = objE.querySelectorAll('img');
		for (var i = 0; i < imgs.length; i++) {
			var img = imgs[i];
			img.setAttribute('data-delay', img.src);
			img.src = 'images/blank.gif';
			img.setAttribute('height', '100px');
			img.setAttribute('width', '100%');
		}
		return objE.innerHTML;
	};
	//格式化图文信息得图片样式
	app.parseImg = function(str) {
		var objE = document.createElement("div");
		objE.innerHTML = str;

		var imgs = objE.querySelectorAll('img');
		for (var i = 0; i < imgs.length; i++) {
			var img = imgs[i];
			//img.setAttribute('data-delay', img.src);
			if (img.src.substring(0, 4) != "http") {
				img.src = img.src.replace('/ueditor/', wwwUrl + '/ueditor/').replace('file://', '');
			}
			img.setAttribute('height', 'auto');
			img.setAttribute('width', '100%');
		}
		return objE.innerHTML;
	};
	//格式化图文信息得图片样式
	app.parseDomImg_article = function(str) {
		var objE = document.createElement("div");
		objE.innerHTML = str;

		var imgs = objE.querySelectorAll('img');
		for (var i = 0; i < imgs.length; i++) {
			var img = imgs[i];
			img.setAttribute('data-delay', img.src);
			img.src = 'images/logo-bg.png';
			img.setAttribute('height', '100px');
			img.setAttribute('width', '100%');
		}
		return objE.innerHTML;
	};
	//APP更新
	app.update = function() {
		if (isupdate) return;
		setTimeout(function() {
			plus.runtime.getProperty(plus.runtime.appid, function(wgtinfo) {
				mui.ajax(URL + 'update', {
					data: app.PostData({
						version: wgtinfo.version,
						appType: plus.os.name == 'Android' ? 2 : 3
					}),
					dataType: 'json',
					type: 'post',
					timeout: 10000,
					success: function(data) {
						//console.log(JSON.stringify(data) + "/" + wgtinfo.version);
						if (data.code == 200 && data.data.isUpdate) {
							isupdate = true;
							plus.nativeUI.confirm('阅美乐有新的版本啦，请务必更新升级哦！', function(event) {
								if (0 == event.index) {
									var pathstr = data.data.Url.substr(data.data.Url.length - 3);
									if (pathstr == "wgt") {
										//开始下载								
										var _mask = plus.nativeUI.showWaiting('下载升级包...', app.WaitingStyle());
										var downupdate = plus.downloader.createDownload(data.data.Url, {
											filename: "_doc/update/"
										}, function(d, status) {
											if (status == 200) {
												app.installWgt(d.filename); // 安装wgt包
											} else {
												plus.nativeUI.alert("下载升级包失败！");
											}
											_mask.close();
										});
										downupdate.start();
										downupdate.addEventListener("statechanged", function(download, status) {

											if (download.state != 4) {
												var _c = parseInt(download.downloadedSize / download.totalSize * 100);
												if (_c) {
													_mask.setTitle("下载升级包...(" + _c + "%)");
												}
												//return loadback(download.downloadedSize, download.totalSize);
											}
										}, false);
										//开始下载
									} else {
										plus.runtime.openURL(data.data.Url);
									}
								} else {
									plus.runtime.quit();
								}
							}, '', ["准了！", "退下"]);
						} else {
							isupdate = false;
						}
					},
					error: function(xhr, type, errorThrown) {
						//alert(xhr.responseText);
						//console.log(xhr.responseText);
						//reloadWvLoad();
						//w.close();
					}
				});
			});
		}, 5000);
	};
	app.installWgt = function(path) {
		plus.nativeUI.showWaiting('安装升级包文件...', app.WaitingStyle());
		plus.runtime.install(path, {}, function() {
			plus.nativeUI.closeWaiting();
			plus.nativeUI.alert("应用资源更新完成！", function() {
				plus.runtime.restart();
			});
		}, function(e) {
			plus.nativeUI.closeWaiting();
			plus.nativeUI.alert("安装升级包文件失败[" + e.code + "]：" + e.message);
		});
	};
	app.viewstyle = function() {
		var _style = {
			//scrollIndicator: 'none',
			//bounce: 'vertical',
			//bounceBackground: '#ffffff'
		};
		return _style;
	};
	app.downstyle = function(pulldownRefresh) {
		var _style = {
			style: 'circle',
			color: '#9d6519',
			offset: '44px',
			callback: pulldownRefresh
		};
		return _style;
	};
}(mui, window.YiRu = {}));

function GetPictureloadImg(typename) {
	$("img[data-loadimg='true']").each(function() {
		var _imgurl = YiRu.getpicture(this.getAttribute('data-src'), typename);
		// var _imgurl = this.getAttribute('data-src');
		//给<img>设置图片  
		this.setAttribute("src", _imgurl);
	});
};
/*<img>设置图片  
 *1.从本地获取,如果本地存在,则直接设置图片  
 *2.如果本地不存在则联网下载,缓存到本地,再设置图片  
 * */
function GetloadImg() {
	$("img[data-loadimg='true']").each(function() {

		GetImg(this, this.getAttribute('data-src').replace("{{url}}", PvUrl + '/Img/'));
	});
}

function GetImg(imgobj, loadUrl) {
	if (imgobj == null || loadUrl == null) return;
	//图片下载成功 默认保存在本地相对路径的"_downloads"文件夹里面, 如"_downloads/logo.jpg"  
	var filename = loadUrl.substring(loadUrl.lastIndexOf("/") + 1, loadUrl.length);
	var relativePath = "_doc/" + filename;
	//检查图片是否已存在  
	plus.io.resolveLocalFileSystemURL(relativePath, function(entry) {
		//console.log("图片存在,直接设置=" + relativePath);
		//如果文件存在,则直接设置本地图片  
		setImgFromLocal(imgobj, relativePath);
	}, function(e) {
		//console.log("图片不存在,联网下载=" + relativePath);
		//如果文件不存在,联网下载图片  
		setImgFromNet(imgobj, loadUrl, relativePath);
	});
}
/*给图片标签<img>设置本地图片  
 * relativePath 本地相对路径 例如:"_downloads/logo.jpg"  
 */
function setImgFromLocal(imgobj, relativePath) {
	//本地相对路径("_downloads/logo.jpg")转成SD卡绝对路径("/storage/emulated/0/Android/data/io.dcloud.HBuilder/.HBuilder/downloads/logo.jpg");  
	var sd_path = plus.io.convertLocalFileSystemURL(relativePath);
	//给<img>设置图片
	// console.log(sd_path);
	// plus.io.resolveLocalFileSystemURL("file://" + sd_path, function() {
	// 	alert("有这个图片"+sd_path);
	// }, function(e) {
	// 	alert(JSON.stringify(e)+"--"+sd_path);
	// });

	imgobj.setAttribute("src", sd_path);

}

/*联网下载图片,并设置给<img>*/
function setImgFromNet(imgobj, loadUrl, relativePath) {
	//创建下载任务  
	var dtask = plus.downloader.createDownload(loadUrl, {
		filename: relativePath,
		retryInterval: 1
	}, function(d, status) {
		if (status == 200) {
			//下载成功  
			//console.log("下载成功=" + relativePath + "---" + d.filename);
			setImgFromLocal(imgobj, d.filename);
		} else {
			//下载失败,需删除本地临时文件,否则下次进来时会检查到图片已存在  
			//console.log("下载失败=" + status + "==" + relativePath);
			//dtask.abort();//文档描述:取消下载,删除临时文件;(但经测试临时文件没有删除,故使用delFile()方法删除);  
			if (relativePath != null)
				delFile(relativePath);
		}
	});
	//启动下载任务  
	dtask.start();
}

/*删除指定文件*/
function delFile(relativePath) {
	plus.io.resolveLocalFileSystemURL(relativePath, function(entry) {
		entry.remove(function(entry) {
			//console.log("文件删除成功==" + relativePath);
		}, function(e) {
			//console.log("文件删除失败=" + relativePath);
		});
	});
}

//分享模块
function shareWeixin(_this, mask) {
	var w = plus.nativeUI.showWaiting('', app.WaitingStyle()),
		msg = {
			extra: {
				scene: 'WXSceneSession'
			}
		};
	var shares = {};
	plus.share.getServices(function(s) {
		if (s && s.length > 0) {
			for (var i = 0; i < s.length; i++) {
				var t = s[i];
				shares[t.id] = t;
			}
			var share = shares['weixin'];
			msg.href = _this.getAttribute('data-href');
			msg.title = _this.getAttribute('data-title');
			msg.content = _this.getAttribute('data-content');
			msg.pictures = _this.getAttribute('data-img') ? [_this.getAttribute('data-img')] : ["_www/images/logo.png"];
			msg.thumbs = _this.getAttribute('data-img') ? [_this.getAttribute('data-img')] : ["_www/images/logo.png"];
			share.send(msg, function() {
				w.close();
				if (mask)
					mask.close();
				plus.nativeUI.toast("分享到" + share.description + "成功！ ");
			}, function(e) {
				w.close();
				plus.nativeUI.toast("分享到" + share.description + "取消");
			});
		}
	}, function() {
		w.close();
		plus.nativeUI.toast('获取分享列表失败');
	});
}

function initShare() {
	var shares = {};
	plus.share.getServices(function(s) {
		if (s && s.length > 0) {
			for (var i = 0; i < s.length; i++) {
				var t = s[i];
				shares[t.id] = t;
			}
			return shares;
		}
	}, function() {
		plus.nativeUI.toast('获取分享列表失败');
	});
	return shares;
}

function loadShare(params) {
	var ids = [],
		bts = [];
	// if (YiRu.ios()) {
	// 	ids.push({
	// 		id: "weixin",
	// 		ex: "WXSceneSession"
	// 	}, {
	// 		id: "weixin",
	// 		ex: "WXSceneTimeline"
	// 	});
	// 	bts.push({
	// 		title: "发送给微信好友"
	// 	}, {
	// 		title: "分享到微信朋友圈"
	// 	});
	// 	//if (YiRu.isQQInstalled()) {
	// 		ids.push({
	// 			id: "qq"
	// 		});
	// 		bts.push({
	// 			title: "分享给QQ好友"
	// 		});
	// 	//}
	// } else {
	ids.push({
		id: "weixin",
		ex: "WXSceneSession"
	}, {
		id: "weixin",
		ex: "WXSceneTimeline"
	}, {
		id: "qq"
	});
	bts.push({
		title: "发送给微信好友"
	}, {
		title: "分享到微信朋友圈"
	}, {
		title: "分享给QQ好友"
	});
	//}
	var shares = initShare();
	plus.nativeUI.actionSheet({
		cancel: "取消",
		buttons: bts
	}, function(e) {
		var i = e.index;
		if (i > 0) {
			var s_id = ids[i - 1].id;
			var share = shares[s_id];
			// if (YiRu.ios() && share.id == "weixin" && !YiRu.isWXInstalled()) {
			// 	plus.nativeUI.toast("检测到手机未安装微信!");
			// 	if (typeof params.NocallBack == 'function') {
			// 		return params.NocallBack();
			// 	}
			// 	return;
			// }
			try {
				if (share.authenticated) {
					shareMessage(share, ids[i - 1].ex, params);
				} else {
					share.authorize(function() {
						shareMessage(share, ids[i - 1].ex, params);
					}, function(e) {
						plus.nativeUI.toast("认证授权失败!");
						if (typeof params.NocallBack == 'function') {
							return params.NocallBack();
						}
					});
				}
			} catch (e) {
				plus.nativeUI.toast("分享失败!");
				if (typeof params.NocallBack == 'function') {
					return params.NocallBack();
				}
			}
		} else {
			plus.nativeUI.toast("分享取消");
			if (typeof params.NocallBack == 'function') {
				return params.NocallBack();
			}
		}
	});
}

function shareMessage(share, ex, params) {
	var msg = {
		extra: {
			scene: ex
		}
	};
	msg.href = params.href;
	msg.title = params.title;
	msg.content = params.content;
	/*if (~share.id.indexOf('weibo')>=0) {
		msg.content += '，<a href="'+ProductHref+'">Go血拼！ ></a>';
	}*/
	//msg.thumbs=productImg;
	//msg.pictures=productImg;
	msg.pictures = ["" + params.pictures + ""];
	msg.thumbs = [params.thumbs ? params.thumbs : params.pictures];
	share.send(msg, function() {
		plus.nativeUI.toast("分享到" + share.description + "成功！ ");
		if (typeof params.callBack == 'function') {
			return params.callBack();
		}
	}, function(e) {
		plus.nativeUI.toast("分享到" + share.description + "取消");
		if (typeof params.NocallBack == 'function') {
			return params.NocallBack();
		}
	});
}
//分享模块结束

mui('body').on('tap', '#reloadWv', function() {
	plus.webview.currentWebview().reload();
});

function reloadWvLoad() {
	var errorText = document.createElement('div');
	errorText.innerHTML =
		'<div class="tisi_box"><h4>网络不给力，请检查网络！</h4><button id="reloadWv" class="mui-btn mui-btn-negative">重新加载</button></div>';
	errorText.setAttribute('class', 'empty-show');
	document.body.appendChild(errorText);
}

function getDateDiff(datestr) {
	var createtime = Date.parse(mui.os.ios ? datestr.replace(/-/g, '/') : datestr);
	createtime = createtime / 1000;
	var now = Date.parse(new Date()) / 1000;
	var limit = now - createtime;
	var content = "";
	if (limit < 60) {
		content = "刚刚";
	} else if (limit >= 60 && limit < 3600) {
		content = Math.floor(limit / 60) + "分钟前";
	} else if (limit >= 3600 && limit < 86400) {
		content = Math.floor(limit / 3600) + "小时前";
	} else if (limit >= 86400 && limit < 2592000) {
		content = Math.floor(limit / 86400) + "天前";
	} else if (limit >= 2592000 && limit < 31104000) {
		content = Math.floor(limit / 2592000) + "个月前";
	} else {
		content = formatTime(datestr, 'yyyy-MM-dd');
	}
	return content;
}

function formatTime(times, fmt) {
	//正则对应的格式
	if (times == null || times == '' || times == undefined || times == 'undefined' || times == 'null') {
		return "";
	}
	var d = new Date(mui.os.ios ? times.replace(/-/g, '/') : times);
	var o = {
		"M+": d.getMonth() + 1,
		"d+": d.getDate(),
		"h+": d.getHours(),
		"m+": d.getMinutes(),
		"s+": d.getSeconds(),
		"q+": Math.floor((d.getMonth() + 3) / 3),
		"S": d.getMilliseconds()
	};
	if (/(y+)/.test(fmt))
		fmt = fmt.replace(RegExp.$1, (d.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (var k in o)
		if (new RegExp("(" + k + ")").test(fmt))
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
}
