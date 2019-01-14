(function ($) {
    var puz = {
        level: '一 般',
        state: '重新开始',
        second: 0,
        backImage: ['拼图-dnf1.jpg', '拼图-dnf2.jpg', '拼图-dnf3.jpg', '拼图-dnf4.jpg', '拼图-dnf5.jpg', '拼图-dnf6.jpg', '拼图-dnf7.jpg',],
        backInset: ['A1.jpg', 'A2.jpg', 'A3.jpg', 'A4.jpg', 'A5.jpg', 'A6.jpg']
    }

    function puzzle(puz) {
        this.state = puz.state;
        this.second = puz.second;
        this.puzImgArr = puz.backImage;
        this.level = puz.level;
        this.backInset = puz.backInset;
        this.homePage();   //首先是首页插画跟动画部分，动画结束会触发init();
        this.bindEvent();
        this.drag();
        document.onselectstart = new Function('return false');
    }
    puzzle.prototype = {
        homePage: function () {    //首页插画动画特效部分
            var self = this;
            var insetWidth = window.innerWidth;
            var insetHeight = window.innerHeight;
            $('.homeInset').css({ "width": insetWidth + 'px', "height": insetHeight + 'px' });
            //进入页面展示插画动画，运动结束创建接下来需要的动画插画条；
            $('.homeBtn').animate({ left: '0px' }, 800, 'linear', function () {
                var len = self.backInset.length;
                for (var i = 0; i < len; i++) {
                    $('.inset').eq(i).css({    //设置每一张插画的尺寸；
                        "background-image": 'url(' + self.backInset[i] + ')',
                        "left": insetWidth / 6 * i + 'px',
                        "width": insetWidth / 6 + "px",
                        "height": insetHeight + 'px'
                    });
                    $('li:even', '.homeInset').css("top", (-insetHeight + 'px'));       //奇数偶数分别交叉运动；
                    $('li:odd', '.homeInset').css("top", (insetHeight + 'px'));
                }
                //将该事件绑定写在回调函数里，希望插画结束后才可点击；
                $(document).on('click', function () {
                    $('li:even', '.homeInset').animate({ top: 0 + 'px' }, 400);
                    $('li:odd', '.homeInset').animate({ top: 0 + 'px' }, 400, 'linear', function () {
                        $('.homeBtn').remove();
                        $('.puzzle').css('display', 'block');
                        $('.puzzle').css('width', insetWidth + 'px');
                        $('.puzzle').css('height', insetHeight + 'px')
                        self.init();
                        $('.puzBox').css('display', 'none');
                        var timer1 = setTimeout(function () {     //动画停留800毫秒；随后再滑出；
                            $('li:even', '.homeInset').animate({ top: insetHeight + 'px' }, 400, 'linear')
                            $('li:odd', '.homeInset').animate({ top: -insetHeight + 'px' }, 400, 'linear', function () {
                                $('.homePage').remove();
                                var timer2 = setTimeout(function () {
                                    $('.puzBox').fadeIn(1000);
                                }, 800)
                            })
                        }, 600)
                    });
                })
            })
        },
        init: function () {
            this.fillPuzzle();
            this.dragLastLeft = 0;  //鼠标按下记录位置
            this.dragLastTop = 0;
            $('.level').eq(1).css('color', 'rgb(219, 224, 150)');            //默认 一般 难度css状态
        },
        fillPuzzle: function () {
            $('.content').empty();    //每次重绘都先将之前的格子全部清空；
            switch (this.level) {     //通过难度值获取需要生成的格子数量；
                case '简 单':
                    this.lvW = 6;
                    this.lvH = 3;
                    break;
                case '一 般':
                    this.lvW = 8;
                    this.lvH = 4;
                    break;
                case '困 难':
                    this.lvW = 10;
                    this.lvH = 5;
                    break;
                case '魔 鬼':
                    this.lvW = 16;   //将这里改成100试试（手动滑稽   --  别傻了，电脑会卡死的）
                    this.lvH = 8;
                    break;
            }
            //根据格子数量确定每个格子的边长；
            this.boxWidth = $('.content').width() / this.lvW;
            this.boxHeight = $('.content').height() / this.lvH;
            //点击等级跟重新开始的时候，随机获取一张图片，开始游戏的时候就保持现状；
            if ($('.start-again').html() === '开始游戏') {
                this.puzImg = this.puzImgArr[Math.floor(Math.random() * 7)];
            }
            //将每一个数放进数组；这些this.lvW的数字乘以一个单位宽度，来获取坐标跟背景图坐标；
            var posiArr = [];
            for (var i = 0; i < this.lvW; i++) {
                for (var j = 0; j < this.lvH; j++) {
                    posiArr.push(this.boxWidth * i + ',' + this.boxHeight * j);
                }
            }
            // 如果开始游戏，将打乱数组；
            if ($('.start-again').html() === '重新开始') {
                posiArr.sort(function () {
                    return Math.random() - 0.5;
                })
            }

            //通过字符串拼接生成dom；
            var puzBoxStr = "";
            for (var i = 0; i < this.lvW; i++) {
                for (var j = 0; j < this.lvH; j++) {
                    puzBoxStr += '<div class="puzBox' + '" style="background-position:' + -this.boxWidth * i + 'px' + ' ' + -this.boxHeight * j + 'px;background-image:url(' + this.puzImg + ');width:' + this.boxWidth + 'px;height:' + this.boxHeight + 'px"></div>';
                }
            }
            $('.content').append(puzBoxStr);
            // 设置left跟top；
            var lenXY = this.lvW * this.lvH;
            for (var a = 0; a < lenXY; a++) {
                $('.puzBox').eq(a).css({
                    "left": posiArr[a].split(',')[0] + 'px',
                    "top": posiArr[a].split(',')[1] + 'px',
                })
            }
            $('.puzBox').css('display', 'none');   //两者配合实现淡入特效
            $('.puzBox').fadeIn(1000);             //两者配合实现淡入特效
        },
        drag: function () {  //拖拽绑定；
            var self = this;
            var disX,
                disY,
                dragging = false,
                Etarget;
            $(document).on('mousedown', '.puzBox', function (e) {
                var event = e || window.event;
                Etarget = $(event.target)
                if ($(Etarget).attr('data') !== 'active') {
                    disX = event.clientX - parseInt($(this).position().left);
                    disY = event.clientY - parseInt($(this).position().top);
                    self.dragLastLeft = $(Etarget).position().left;
                    self.dragLastTop = $(Etarget).position().top;
                    dragging = true;
                    $(Etarget).css('z-index', 10);
                    event.preventDefault();    //这两个清除捕获和默认事件原本想清除连续点击的bug，不过发现没啥用，不知道是否需要该属性，待研究；
                    return false;    //这两个清除捕获和默认事件原本想清除连续点击的bug，不过发现没啥用，不知道是否需要该属性，待研究；
                }
            })
                .on('mousemove', function (e) {
                    if (dragging) {
                        if ($('.start-again').html() === '重新开始') {   //只有在游戏开始之后才能拖拽；
                            var event = e || window.event;
                            $(Etarget).css({ "left": event.clientX - disX + "px", 'top': event.clientY - disY + "px" });
                        }
                    }
                })
                .on('mouseup', function (e) {
                    var event = e || window.event;
                    if (dragging) {
                        if ($('.start-again').html() === '重新开始') {  //只有在正在游戏的状态，才在每次鼠标抬起判断拼图是否成功；
                            $(Etarget).attr('data', 'active');//每次鼠标抬起给该div添加data属性，移动结束后删除，拥有此属性的div我们不对其进行拖拽；防止点击过快；给div设定一个不合法的新的坐标位置；
                            dragging = false;
                            self.judge();
                            self.swop(Etarget);   //抬起判断是否达到一定的覆盖面积，达到才调换位置；
                        }
                    }
                })
        },
        bindEvent: function () {   //这里是左边按键功能区的逻辑部分；
            var self = this;
            $('.start-again').on('click', function () {
                if ($(this).html() == '开始游戏') {
                    $(this).html('重新开始');
                    $(this).css('color', 'white')
                    self.fillPuzzle();
                    self.times();
                } else {
                    self.second = 0;
                    $('.count').html("计时:" + self.second);
                    $(this).html('开始游戏');
                    $(this).css('color', 'rgb(255, 174, 0)')
                    self.fillPuzzle();
                    clearInterval(self.timer);
                }
            })
            $('.level').on('click', function () {
                if ($('.start-again').html() !== "重新开始") {
                    self.level = $(this).html();
                    $('.level').css('color', 'white')
                    $(this).css('color', 'rgb(219, 224, 150)')
                    self.fillPuzzle();
                }
            })
        },
        times: function () {    //计时器
            var self = this;
            self.timer = setInterval(function () {
                self.second++;
                $('.count').html("计时:" + self.second)
            }, 1000)
        },
        swop: function (e) {  //调换位置
            var oDiv = this.cover(e);   //计算覆盖面积，返回符合要求的div；
            if ($(oDiv).length == 1) {   //如果有返回div，就进行位置调换；
                $(oDiv).attr('data', 'active');
                var nowLeft = $(oDiv).position().left;
                var nowTop = $(oDiv).position().top;
                $(e).css('z-index', 10);
                $(oDiv).css('z-index', 10);
                $(e).animate({ left: nowLeft + 'px', top: nowTop + 'px' }, 200, 'linear', function () {
                    $(e).css('z-index', 1);
                    $(e).removeAttr('data');   //在每次方块移动到对应目标之后删除data属性，在拥有此属性的div我们不对其进行拖拽；防止点击过快；给div设定一个不合法的新的坐标位置；
                })
                $(oDiv).animate({ left: this.dragLastLeft, top: this.dragLastTop }, 200, 'linear', function () {
                    $(oDiv).removeAttr('data');
                    $(oDiv).css('z-index', 1);
                })
            } else {   //没有返回符合条件的div，让鼠标拽着的格子回到之前的位置；
                if ($(e).attr('class') == 'puzBox') {   //还原之前的位置时，鼠标必须有拽着格子，否则在外面点击一下，也出触发格子回到上次的位置。
                    $(e).css('z-index', 10);
                    $(e).animate({ 'left': this.dragLastLeft, 'top': this.dragLastTop }, 200, 'linear', function () {
                        $(e).css('z-index', 1);
                        $(e).removeAttr('data');   //在每次方块移动到对应目标之后删除data属性，在拥有此属性的div我们不对其进行拖拽；防止点击过快；给div设定一个不合法的新的坐标位置；
                    });
                }
            }
        },
        cover: function (e) {  //计算覆盖面积
            var self = this;
            var posiEX = $(e).position().left;
            var posiEY = $(e).position().top;
            var puzArr = $('.content').find('div');
            var Arr = Array.prototype.filter.call(puzArr, function (elem, index) { //如果方块有data属性，也就是处于运动的过程中，我们不对齐进行面积计算操作；
                if (!$(elem).attr('data')) {
                    return true;
                }
            })
            var oDiv = Array.prototype.filter.call(Arr, function (elem, index) {
                var Eleft = $(elem).position().left;
                var Etop = $(elem).position().top;
                var Eright = Eleft + self.boxWidth;
                var Ebottom = Etop + self.boxHeight;
                var coverWidth, coverHeight;
                if (posiEX > Eleft && posiEX < Eright) {
                    coverWidth = Eright - posiEX;
                } else if (posiEX < Eleft && posiEX > Eleft - self.boxWidth) {
                    coverWidth = posiEX + self.boxWidth - Eleft;
                }
                if (posiEY > Etop && posiEY < Ebottom) {
                    coverHeight = Ebottom - posiEY;
                } else if (posiEY < Etop && posiEY > Etop - self.boxHeight) {
                    coverHeight = posiEY + self.boxHeight - Etop;
                }
                var covers = coverWidth * coverHeight;
                if (covers > self.boxWidth * self.boxHeight * 0.55) {  //判断覆盖面积是否大于百分之55；
                    return true;
                }
            })
            return oDiv;
        },
        judge: function () {    //通过判断背景图位置跟div坐标是否全部吻合，来判断是否拼图成功，游戏结束，---暂未时间；
            var len = this.lvW * this.lvH;
            var count = 1;
            for (var a = 0; a < len; a++) {
                var puzBoxBack = $('.puzBox').eq(a).css("background-position")
                var puzBoxOffsetLeft = $('.puzBox').eq(a).position().left
                var puzBoxOffsetTop = $('.puzBox').eq(a).position().top
                //    console.log(typeof puzBoxOffsetLeft) 
                if (puzBoxOffsetLeft.toString().indexOf(0) == 0) {
                    var Lstr = puzBoxOffsetLeft
                } else {
                    var Lstr = '-' + puzBoxOffsetLeft
                }
                if (puzBoxOffsetTop.toString().indexOf(0) == 0) {
                    var Tstr = puzBoxOffsetTop
                } else {
                    var Tstr = '-' + puzBoxOffsetTop
                }
                var offsetStr = Lstr + 'px' + ' ' + Tstr + 'px'
                console.log(puzBoxBack)
                console.log(offsetStr)

                if (puzBoxBack === offsetStr) {
                    console.log(count)
                    count++;
                }
                if (count == len) {
                    alert('成功')
                }
            }
        },
    }
    // console.log(window.innerHeight)
    // console.log(window.innerWidth)


    new puzzle(puz);




}($))
