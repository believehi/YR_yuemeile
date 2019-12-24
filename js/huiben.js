// (function() {

var obja = $('<div id="waitTime" style="display:none;"></div>' +
	//录音按钮
	'<div id="btnStartRecord" style="display:none;">Reading</div>' +
	//遮盖层
	'<div class="cover"></div>' +
	//录音模态框
	'<ul class="pageState" style="display: none;"></ul>' +
	'<div class="Record_box">' +
	'<div class="Record_1">' +
	'<i class="icon_2"></i>' +
	'<span id="">录音中...<i id="number">0</i>s</span>' +
	'</div>' +
	'<div class="Record_but">' +
	'<span id="mList">取消</span>' +
	'<span class="wanc_but" id="wanc_but">结束录音</span>' +
	'</div>' +
	'</div>' +
	//计时器弹窗
	'<div class="timer_popup">' +
	'<div class="timer_popup_in">' +
	'<p>休息一会吧！</p>' +
	'<p>30分钟计时已到，注意保护视力健康哦！</p>' +
	'<div class="timer_in">' +
	'<span id="timer_Det">Yes</span>' +
	'<span id="timer_Can">No</span>' +
	'</div>' +
	'</div>' +
	'</div>');
$("#leftTabBox").after(obja);
var pic_aa = true;
var Audio = null,
	Audioa = null,
	player = null,
	zongyeshu = false;
var recorder, isluyin = false;
// 左右滑动切换
var nnn = 0;
var ddd = 0;




// startTime();
TouchSlide({
	slideCell: "#leftTabBox",
	titCell: '#bd12 .test',
	pageStateCell: '',
	endFun: function(i, c) {
		pic_aa = true;

		if (Audio != null) Audio.stop();
		if (Audioa != null) Audioa.stop();
		if (i == c - 1) {
			zongyeshu = true;

			if (nnn == 1) mui.toast("已读到该绘本的最后一页！");
			nnn = 1;
		} else {
			nnn = 0;
		}
		if (i == 0) {
			if (ddd == 1) mui.toast("已经到第一页！");
			ddd = 1;
		} else {
			ddd = 0;
		}
	}
});
//计时
var time = 60;
var a = setInterval(jishi, 1000); //1000毫秒
var isCanCancerOrder = false;
var toTime = 0; //总秒数
var TotalTime = 0; //总分钟
var states = 1; //是否阅读完成
var Timeout = null;
var picArr_01, picArr_02, picArr_03, picArr_04, picArr_05, picArr_06, picArr_07, picArr_08, picArr_09, picArr_10,
	picArr_1, picArr_2, picArr_3, picArr_4, picArr_5, picArr_6, picArr_7, picArr_8, picArr_9, picArr_10,
	picArr_11, picArr_12, picArr_13, picArr_14, picArr_15, picArr_16, picArr_17, picArr_18, picArr_19, picArr_20,
	picArr_21, picArr_22, picArr_23, picArr_24, picArr_25, picArr_26, picArr_27, picArr_28, picArr_29, picArr_30,
	picArr_31, picArr_32, picArr_33, picArr_34, picArr_35, picArr_36, picArr_37, picArr_38, picArr_39, picArr_40,
	picArr_41, picArr_42, picArr_43, picArr_44, picArr_45, picArr_46, picArr_47, picArr_48, picArr_49, picArr_50;

function jishi() {
	time++;
	toTime = time;
	var minutes = toTime;
	var m = Math.floor(toTime / 60);
	var h = Math.floor(minutes / 3600);
	var hs = Math.floor(h * 60);
	TotalTime = hs + m;
	$('#waitTime').html(calTime(time)); //倒计时
}

function newback(_typename, ws) {
	
	var oldback = mui.back;
	mui.back = function() {
		
		states = 1;
		if (zongyeshu) {
			states = 2;
		}
		var msk = plus.nativeUI.showWaiting('', YiRu.WaitingStyle());
		YiRu.getajax('draw/saverecord', function(data) {
			msk.close();
			Audio.close();
			Audioa.close();
			player.close();
			clearInterval(a);
			oldback();
			setTimeout(function() {
				ws.close("none");
				var Y = plus.webview.getWebviewById("/pages/picture/Y.html");
				var C = plus.webview.getWebviewById("/pages/picture/C.html");
				if (Y) Y.close("none");
				if (C) C.close("none");
			}, 300);
		}, {
			studentid: YiRu.getuserinfo().userId,
			drawId: _typename,
			second: toTime,
			time: TotalTime,
			states: states
		}, msk, 'get');
	}
}
//背景图片
function getbackground(_typename) {
	$("#bd12").children().each(function(i) {

		$(this).css("background-image", "url(" + YiRu.getpicture("bg" + ("0" + (i + 1)).substr(-2) + "_background.jpg",
			_typename) + ")");
		//console.log(YiRu.getpicture("bg" + ("0" + (i + 1)).substr(-2) + "_background.jpg", _typename));
	});
	setTimeout(function() {
		$("body").css("background-color", "#FF83AF");
		$("#btnStartRecord").fadeIn();
	}, 500);
}
var dishiqi = "";

function actionrecord() {
	$("#btnStartRecord").bind('tap', function() {
		dishiqi = setInterval(function() {
			var nuber = parseFloat($("#number").html()) + 1;
			$("#number").html(nuber);
		}, 1000);
		$(".cover").show();
		$(".Record_box").show();
		$(".lines").show();
		startRecord();
	});
	$("#mList").bind('tap', function() {
		clearInterval(dishiqi);
		$("#number").html("0");
		$(".cover").hide();
		$(".Record_box").hide();
		$(".lines").hide();
		isluyin = false;
		endRecord();
	});
	$("#wanc_but").bind('tap', function() {
		clearInterval(dishiqi);
		$("#number").html("0");
		$(".cover").hide();
		$(".Record_box").hide();
		$(".lines").hide();
		isluyin = true;
		endRecord();
	});
}
// 录音
function startRecord() {
	if (Audio != null) Audio.stop();
	if (Audioa != null) Audioa.stop();
	if (player != null) player.stop();
	if (Timeout != null) clearTimeout(Timeout);
	pic_aa = false;
	// 1.创建recorder
	recorder = plus.audio.getRecorder();
	// 2.录音
	recorder.record({
		filename: "_doc/audio/"
	}, function(filePath) {
		plus.io.resolveLocalFileSystemURL(filePath, function(entry) {
			if (isluyin) {
				player.setStyles({
					src: filePath
				});
				player.play(function() {
					pic_aa = true;
					delFile(filePath);
				}, function(e) {
					pic_aa = true;
					delFile(filePath);
					//console.log("message：" + e.message);
				});
			} else {
				pic_aa = true;
				delFile(filePath);
			}
		}, function(e) {
			pic_aa = true;
			//console.log("读取录音失败：" + e.message);
		});
	});
}
// 结束录音
function endRecord() {
	recorder.stop();
};
// 绘本动画循环函数
function PlayLoop(xElem, picArr, typename) {
	var flag = true;
	var picSub = 0;
	var _time = null;
	if (flag === true) {
		flag = false;
		_time = setInterval(function() {
			if (picSub == picArr.length - 1) {
				picSub = 0;
				if (_time != null) clearInterval(_time);
				flag = true;
			} else {
				picSub++;
			}
			xElem.src = YiRu.getpicture(picArr[picSub], typename); //切换图片
		}, 150);
	}
}
// 计时器
function calTime(_time) {
	var spit = ":";
	var hour = "0";
	var second = "0";
	var min = "0";
	var result = "";

	if (_time % 60 != 0) { //秒
		if (_time % 60 > 10) {
			second = _time % 60;
		} else {
			second = "0" + _time % 60;
		}
	}

	if (parseInt(_time / 60) != 0) { //分
		if (parseInt(_time / 60) > 10) {
			min = parseInt(_time / 60);
		} else {
			min = "0" + parseInt(_time / 60);
		}
	}

	if (parseInt(_time / 3600) != 0) { //时
		if (parseInt(_time / 3600) > 10) {
			hour = parseInt(_time / 3600);
		} else {
			hour = "0" + parseInt(_time / 3600);
		}
	}

	result = hour + spit + min + spit + second;
	return result;

}

// 动画封装函数
function PlayAnima(xElem, picArr, pea, typename) {
	var flag = true;
	var picSub = 0;
	var _time = null;
	// pea 判断是否回到第一张图片, true 为回到第一张
	if (pea === true) {
		if (flag === true) {
			flag = false;
			_time = setInterval(function() {
				if (picSub == picArr.length - 1) {
					picSub = 0;
					clearInterval(_time);
					flag = true;
				} else {
					picSub++;
				}

				xElem.src = YiRu.getpicture(picArr[picSub], typename); //切换图片

				// YiRu.getpicture(picArr[picSub], typename)
			}, 300);
		}
	} else {
		if (flag === true) {
			flag = false;
			_time = setInterval(function() {
				if (picSub == picArr.length - 1) {
					picSub = 0;
					xElem.src = YiRu.getpicture(picArr[picArr.length - 1], typename);
					clearInterval(_time);
					flag = true;
				} else {
					xElem.src = YiRu.getpicture(picArr[picSub], typename); //切 换 图 片
					picSub++;
				}
			}, 200);
		}
	}
}
//通用点击方法
function DataActionClick(_typename) {
	$("[data-action='true']").each(function() {
		//data-action="true" data-audio="d1804.mp3" isdong="false"
		$(this).click(function() {
			if (pic_aa) {
				pic_aa = false;
				if (Timeout != null) clearTimeout(Timeout);
				if (this.getAttribute("isdong") == "true") {
					var pea = this.getAttribute("pea") == "true" ? true : false;
					//console.log(eval(this.getAttribute("picarr")))
					PlayAnima(this, eval(this.getAttribute("picarr")), pea, _typename);
					
				}
				if (Audio != null) Audio.stop();
				Audio.setStyles({
					src: YiRu.getpicture(this.getAttribute("data-audio"), _typename)
				});
				console.log(this.getAttribute("data-audio"))
				Audio.play(function() {
					pic_aa = true;
				}, function(e) {
					pic_aa = true;
				});
				Timeout = setTimeout(function() {
					pic_aa = true;
					Timeout = null;
				}, 3000);
			}
		});
	});
}
// });
