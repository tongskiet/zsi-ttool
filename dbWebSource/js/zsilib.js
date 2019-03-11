var  ud='undefined'
    ,isUD=function(o){return (typeof o === ud);}
    ,zsi= {
         __monitorAjaxResponse      : function(){
            $(document).ajaxStart(function(){});      
            $( document ).ajaxSend(function(event,request,settings) {
                if(typeof zsi_request_count === ud) zsi_request_count=0;
                
                var eAW = zsi.config.excludeAjaxWatch;    
                for(var x=0; x<eAW.length;x++){
                    if(zsi.strExist(settings.url, eAW[x] ) ) return;
                }
                zsi_request_count++;
                zsi.ShowHideProgressWindow(true);
            });
        
           $(document).ajaxComplete(function(event,request,settings) {
              if(typeof zsi_request_count !== ud){
                 zsi_request_count--;
                 if(zsi_request_count<=0){
                    //console.log("no remaining request");
                    CloseProgressWindow();
                 }
              }
           });   
        
           $(document).ajaxSuccess(function(event,request,settings){
              //console.log("zsi.Ajax.Request Status=Success, url: "+ settings.url);
           });      
           
           $(document).ajaxError(function(event, request, settings ){  
              var error_url = (typeof zsi.config.errorUpdateURL!== ud? zsi.config.errorUpdateURL:"")  ;
              var noErrURLMsg = "No error URL found. Error not submitted.";
              var retryLimit=0;
              var errorObject = {};
              errorObject.event =event;
              errorObject.request =request;
              errorObject.settings =settings;
              
              CloseProgressWindow();
        
              if(error_url){
                  if( zsi.strExist(settings.url,error_url) ){
                     console.log("url: " + settings.url);         
                     return false;
                  }
              }
              if(typeof zsi.config.sqlConsoleName !== ud){
                  if( zsi.strExist(settings.url,zsi.config.sqlConsoleName) ){return false;}
              }
              
              if(request.responseText===""){
                 console.log("zsi.Ajax.Request Status = %cNo Data (warning!) %c, url: " + settings.url, "color:orange;", "color:#000;");  
                if(error_url==="")
                    console.log(noErrURLMsg);
                else
                     $.post( 
                         error_url
                        ,{
                            p : "error_logs_upd @error_type='W' @error_msg='No Response Data' @page_url='" + escape(settings.url) + "'"
                        } 
                        ,function() {
                            console.log( "Warning submited." );
                        }
                    );             
              }
              else{
                 console.log("zsi.Ajax.Request Status = Failed %c, url: " + settings.url, "color:red;", "color:#000;");
                 console.log(errorObject);              
                 
                 if(!settings.retryCounter ) settings.retryCounter=0;
                 settings.retryCounter++;
        
                 if(settings.retryCounter<=retryLimit){                
                    setTimeout(function(){
                       console.log("retry#:" + settings.retryCounter);                 
                       $.ajax(settings);
                    },1000);
                 }
                 if(settings.retryCounter>retryLimit){
                    console.log("retry limit is reached");
                    
                    if(error_url===""){
                        console.log(noErrURLMsg);
                        zsi.ShowErrorWindow();
                    }
                    else
                        $.post( 
                             error_url
                            ,{
                                p : "error_logs_upd @error_type='E',@error_msg='" +  escape(request.responseText) + "',@page_url='"  +  escape(settings.url) + "'"   
                            }  
                            ,function() {
                                console.log( "Error submited." );
                                zsi.ShowErrorWindow();                       
                            }
                        );                
                    
                 }
              }
           });         
           
           function CloseProgressWindow(){
              setTimeout(function(){
                 if(typeof zsi_request_count!==ud){
                    if(zsi_request_count<=0){
                       zsi.ShowHideProgressWindow(false);
                       zsi_request_count=0;
                    }
                 }
              },100);      
           }
        }
        ,__setExtendedJqFunctions   : function(){
            $.fn.addColResize       = function(o) {
                var __obj   = this;
                if ( ! __obj.length) { console.error("Target not found."); return false; }
                if ( ! __obj.parent().hasClass("zTable")) { console.error("zTable div parent is not found."); return false; }
                else {
                    // Initialize object parameters
                    var width           = ( ! isUD(o)) ? ( ! isUD(o.width)) ? o.width : __obj[0].offsetWidth : __obj[0].offsetWidth
                        ,height         = ( ! isUD(o)) ? ( ! isUD(o.height)) ? o.height : __obj[0].offsetHeight : __obj[0].offsetHeight
                        ,hasSpan        = (__obj.html().indexOf('span=') > 0) ? true : false
                    
                    // Initialize DOM objects
                        ,$ztable        = __obj.closest(".zTable")
                        ,$thead         = __obj.find("thead")
                        ,$ths           = $thead.find("tr:last-child th")
                        ,$tbody         = __obj.find("tbody")
                    
                    // Initialize variables 
                        ,tw             = new zsi.easyJsTemplateWriter()
                        ,cache          = []
                    ;
                    
                    var  colWidth       = (isUD(o.colWidth)) ? [] : o.colWidth;
                    if (isUD(o.colWidth)) { 
                        $.each(o.dataRows, function(i,v) {
                            colWidth.push(v.width);
                        });
                    }
                    var colWidthL       = colWidth.length;
                    
                    if (hasSpan) {
                        /* ----------------------------------- THEAD ----------------------------------- */
                        var $theadTr    = $thead.find("tr")
                            ,$tbodyTr   = $tbody.find("tr")
                            ,theadTrL   = $theadTr.length
                            ,tbodyTrL   = $tbodyTr.length
                            ,rowspan    = []
                            ,lastI      = 0
                        ;
                        
                        for (var i = 0; i < theadTrL; i++) {
                            var _$ths       = $theadTr.eq(i).find("th")
                                ,_thL       = _$ths.length
                                ,_temp      = {}
                                ,_temp2     = []
                                ,_index     = 0
                            ;
                            
                            for (var _i = 0; _i < _thL; _i++) {
                                var _$th    = _$ths.eq(_i)
                                    ,_newW  = 0;
                                
                                if ( ! isUD(_$th.attr("colspan"))) {
                                    var _cs         = parseInt(_$th.attr("colspan"), 10)
                                        ,_csMinus1  = _cs - 1;
                                        
                                    for (var _ctr = 1; _ctr <= _cs; _ctr++) {
                                        _index++;
                                        _temp[(_index - 1)] = _$th;
                                    }
                                    
                                    for (var x = _csMinus1, y = (_index - 1) - _csMinus1; x >= 0 && y < colWidthL; x--, y++) {
                                        if (lastI !== i) {
                                            for (var rowI = 0; rowI < rowspan.length; rowI++) {
                                                for (var a = 0; a < rowspan[rowI].length; a++) {
                                                    var _b = rowspan[rowI][a];
                                                    if (_b.i == y && _b.rowspan > 0) {
                                                        _b.rowspan--;
                                                        if ((_index + 1) - 1 < colWidthL) _index++;
                                                    }  
                                                }
                                            }
                                        }
                                        if (_index - 1 < colWidthL) _newW += parseInt(colWidth[y], 10);
                                    }
                                    
                                    if ( ! isUD(_$th.attr("rowspan"))) {
                                        for (var x = _csMinus1, y = (_index - 1) - _csMinus1; x >= 0 && y < colWidthL; x--, y++) {
                                            _temp2.push({ i : y , rowspan : parseInt(_$th.attr("rowspan"), 10) - 1 });
                                        }
                                    }
                                } else {
                                    if ((_index + 1) - 1 < colWidthL) { _index++; }
                                    
                                    if (lastI !== i) {
                                        for (var rowI = 0; rowI < rowspan.length; rowI++) {
                                            for (var a = 0; a < rowspan[rowI].length; a++) {
                                                var _b = rowspan[rowI][a];
                                                if (_b.i == (_index - 1) && _b.rowspan > 0) {
                                                    _b.rowspan--;
                                                    if ((_index + 1) - 1 < colWidthL) _index++;
                                                }  
                                            }
                                        }
                                    }
                                    if (_index - 1 < colWidthL) _newW = parseInt(colWidth[(_index - 1)], 10);
                                    
                                    if ( ! isUD(_$th.attr("rowspan"))) {
                                        _temp2.push({ i : _index - 1 , rowspan : parseInt(_$th.attr("rowspan"), 10) - 1 });
                                    }
                                }
                                _$th.css({ "min-width" : _newW , "width" : _newW });
                                _temp[(_index - 1)] = _$th;
                            }
                            
                            rowspan.push(_temp2);
                            cache.push(_temp);
                            lastI = i;
                        }
                        
                        /* ----------------------------------- TBODY ----------------------------------- */
                        rowspan    = [];
                        lastI      = 0;
                        for (var i = 0; i < tbodyTrL; i++) {
                            var _$tds       = $tbodyTr.eq(i).find("td")
                                ,_tdL       = _$tds.length
                                ,_temp      = {}
                                ,_temp2     = []
                                ,_index     = 0
                            ;
                            
                            for (var _i = 0; _i < _tdL; _i++) {
                                var _$td    = _$tds.eq(_i)
                                    ,_newW  = 0;
                                
                                if ( ! isUD(_$td.attr("colspan"))) {
                                    var _cs         = parseInt(_$td.attr("colspan"), 10)
                                        ,_csMinus1  = _cs - 1;
                                        
                                    for (var _ctr = 1; _ctr <= _cs; _ctr++) {
                                        _index++;
                                        _temp[(_index - 1)] = _$td;
                                    }
                                        
                                    //if ((_index + _cs) - 1 < colWidthL) { _index += _cs; }
                                    for (var x = _csMinus1, y = (_index - 1) - _csMinus1; x >= 0 && y < colWidthL; x--, y++) {
                                        if (lastI !== i) {
                                            for (var rowI = 0; rowI < rowspan.length; rowI++) {
                                                for (var a = 0; a < rowspan[rowI].length; a++) {
                                                    var _b = rowspan[rowI][a];
                                                    if (_b.i == y && _b.rowspan > 0) {
                                                        _b.rowspan--;
                                                        if ((_index + 1) - 1 < colWidthL) _index++;
                                                    }  
                                                }
                                            }
                                        }
                                        if (_index - 1 < colWidthL) _newW += parseInt(colWidth[y], 10);
                                    }
                                    
                                    if ( ! isUD(_$td.attr("rowspan"))) {
                                        for (var x = _csMinus1, y = (_index - 1) - _csMinus1; x >= 0 && y < colWidthL; x--, y++) {
                                            _temp2.push({ i : y , rowspan : parseInt(_$td.attr("rowspan"), 10) - 1 });
                                        }
                                    }
                                } else {
                                    if ((_index + 1) - 1 < colWidthL) { _index++; }
                                    
                                    if (lastI !== i) {
                                        for (var rowI = 0; rowI < rowspan.length; rowI++) {
                                            for (var a = 0; a < rowspan[rowI].length; a++) {
                                                var _b = rowspan[rowI][a];
                                                if (_b.i == (_index - 1) && _b.rowspan > 0) {
                                                    _b.rowspan--;
                                                    if ((_index + 1) - 1 < colWidthL) _index++;
                                                }  
                                            }
                                        }
                                    }
                                    if (_index - 1 < colWidthL) _newW = parseInt(colWidth[(_index - 1)], 10);
                                    
                                    if ( ! isUD(_$td.attr("rowspan"))) {
                                        _temp2.push({ i : _index - 1 , rowspan : parseInt(_$td.attr("rowspan"), 10) - 1 });
                                    }
                                }
                                
                                _$td.css({ "min-width" : _newW , "width" : _newW });
                                _temp[(_index - 1)] = _$td;
                            }
                            
                            rowspan.push(_temp2);
                            cache.push(_temp);
                            lastI = i;
                        }
                    } else {
                        $.each(colWidth, function(i,w) {
                            var _nth = i + 1;
                            $ztable.find("th:nth-child(" + _nth + ") , td:nth-child(" + _nth + ")")
                            .attr({ "colindex" : i })
                            .css({ "width" : w ,"min-width" : w });
                        });
                    }
                    
                    var _$crPanel   = $ztable.find(".crPanel");
                    if (_$crPanel.length === 0) {
                        var _cr = [];
                        var _posX = 0;
                        // Create the cr
                        tw.new().div({ class : "crPanel" , style : "left:" + __obj[0].offsetLeft + "px; top:" + __obj[0].offsetTop + "px;"}).in();
                        $.each(colWidth, function(i,w) {
                            _posX += w;
                            _cr.push({ 
                                x : _posX 
                               ,width : w
                            });
                            
                            tw.div({ 
                                class : (_posX >= width) ? "cr hidden" : "cr"
                                ,style : "left:" + _posX + "px; height : " + (height - 17) + "px; top:0;"
                            });
                        });
                        $ztable.append(tw.html());
                        
                        // Dynamic positioning and display of crs
                        _$crPanel       = $ztable.find(".crPanel");
                        var _$cr        = _$crPanel.find(".cr");
                        var _crL        = _cr.length;
                        var _objOffL    = __obj[0].offsetLeft;
                        $tbody.on("scroll", function() {
                            var _left = _objOffL - $tbody.scrollLeft();
                            
                            _$crPanel.css({ "left" : _left + "px" });
                            for (var i = 0; i < _crL; i++) {
                                var _info = _cr[i];
                                var _x = _info.x + _left;
                                if ( _x >= width || _x <= _objOffL) $(_$cr[i]).addClass("hidden");
                                else $(_$cr[i]).removeClass("hidden");
                            }
                        });
                        
                        // On click cr
                        var _$curCr
                            ,_crIndex
                            ,__cr
                            ,_limit
                            ,_pageX
                            ,_originX
                            ,_pageX2
                        _$cr.off("mousedown").on("mousedown", function(e) {
                            _$curCr     = $(this);
                            _crIndex    = _$curCr.index();
                            __cr        = _cr[_crIndex];
                            _limit      = (_crIndex === 0) ? 25 : _cr[_crIndex - 1].x + 25;
                            _pageX      = e.pageX;
                            _pageX2     = e.pageX;
                            _originX    = __cr.x;
                            
                            _$curCr.addClass("active");
                            $ztable.addClass("noSelect");
                        });
                        
                        // On move an release
                        $ztable.off("mousemove").on("mousemove", function(e) {
                            if ( ! isUD(_$curCr) && e.target.classList[0] !== "cr") {
                                var _x = (e.pageX - $(this).offset().left) + $tbody.scrollLeft();
                                if (_x > _limit) {
                                    _$curCr.css({ "left" : _x });
                                    _originX = _x;
                                    _pageX2 = e.pageX;
                                }
                            }
                        });
                        
                        // Review nalang sa mouse up ug down
                        $(window).on("mouseup", function(e) {
                            if ( ! isUD(_$curCr)) {
                                _$curCr.removeClass("active");
                                $ztable.removeClass("noSelect");
                                
                                var _newW = (_pageX2 >= _pageX) ? __cr.width + (_originX - __cr.x) : __cr.width - (__cr.x - _originX);
                                __cr.width = _newW;
                                
                                if (hasSpan) {
                                    for (var i = 0; i < cache.length; i++) {
                                        var _c = cache[i];
                                        for (var key in _c) {
                                            if (_crIndex === parseInt(key)) { 
                                                _c[key].css({ "width" : _newW ,"min-width" : _newW }); 
                                            }
                                        }
                                    }
                                } else {
                                    $ztable.find("th[colindex="+_crIndex+"] , td[colindex="+_crIndex+"]").css({ "width" : _newW ,"min-width" : _newW });
                                }
                                
                                // Adjust the cr position
                                _posX = 0;
                                for (var i = 0; i < _crL; i++) {
                                    var _info = _cr[i];
                                    
                                    _posX += _info.width;
                                    _info.x = _posX;
                                    
                                    if ( _info.x >= width || _info.x <= _objOffL) {
                                        $(_$cr[i]).addClass("hidden").css({ "left" : _info.x + "px" });
                                    } else {
                                        $(_$cr[i]).removeClass("hidden").css({ "left" : _info.x + "px" });
                                    }
                                }
                                
                                _$curCr = undefined; // Reset
                                
                                // Resize tbody and change color if there is a scroll
                                $tbody.css({
                                    width : width
                                    ,height : height - $thead.height()
                                });
                                
                                var _tbody = $tbody[0];
                                $thead.css({
                                    "width" : width - ((_tbody.scrollHeight > _tbody.offsetHeight) ? 17 : 0)
                                });
                            }
                        });
                    }
                    
                    o.cache = cache;
                    if(o.rowColSpan) __obj.rowColSpan(o.rowColSpan);
                }
                
                return __obj;
            };
            $.fn.addCover           = function(){
                if( ! this.hasClass("zCover")) this.append('<div class="zCover active"></div>');
                $.fn.removeCover = function(){
                    this.removeClass('active');
                }            
            }            
            $.fn.addScrollbar       = function(o) {
                var __obj   = this;
                if ( ! __obj.length) { console.error("Target not found."); return false; }
                if ( ! __obj.parent().hasClass("zTable")) { console.error("zTable div parent is not found."); return false; }
                else {
                    // Initialize object parameters
                    var width       = ( ! isUD(o)) ? ( ! isUD(o.width)) ? o.width : __obj[0].offsetWidth : __obj[0].offsetWidth
                        ,height     = ( ! isUD(o)) ? ( ! isUD(o.height)) ? o.height : __obj[0].offsetHeight : __obj[0].offsetHeight
                    
                    // Initialize DOM objects
                        ,$ztable        = __obj.closest(".zTable")
                        ,$thead         = __obj.find("thead")
                        ,$tbody         = __obj.find("tbody")
                    ;
                    
                    $tbody.css({
                        width : width
                        ,height : height - $thead.height()
                    }).on("scroll", function() {
                        $thead.scrollLeft($(this).scrollLeft());
                    });
                    
                    var _tbody = $tbody[0];
                    $thead.css({
                        "width" : width - ((_tbody.scrollHeight > _tbody.offsetHeight) ? 17 : 0)
                    });
                    
                    __obj.addColResize(o);
                    __obj.addClickHighlight();
                }
            
                return __obj;
            };
            $.fn.autoHideScroll     = function(o) {
                o = o || {};
                o.isHoverBR = o.isHoverBR || false;
                
                for (var i = 0; i < this.length; i++) {
                    var _this       = this[i];
                    var _$target    = $(_this);
                    var _offset     = _$target.offset();
                    var _cW         = _this.clientWidth;
                    var _cH         = _this.clientHeight;
                    
                    if ( ! isUD(_$target.data("autoHide"))) continue;
                    
                    if ((_cW || _cH) && (_$target.css("overflow") === "hidden" || _$target.css("overflow") === "auto")) {
                        _$target.scrollTop(0).scrollLeft(0);
                        if ( ! o.isHoverBR ) {
                            _$target.off("mouseover, mouseout").on("mouseover", function() { this.style.overflow = "scroll"; })
                            .mouseout(function() { this.style.overflow = "auto"; });
                        } else {
                            _$target.off("mousemove, mouseout").on("mousemove", function(e) {
                                var _x = e.pageX - _offset.left;
                                var _y = e.pageY - _offset.top;
                                if ((_cW - 17 <= _x && _cW >= _x) || (_cH - 17 <= _y && _cH >= _y)) {
                                    _this.style.overflow = "auto";
                                } else { _this.style.overflow = "hidden"; }
                            }).mouseout(function() { _this.style.overflow = "hidden"; });
                        }
                        _$target.data("autoHide",true);
                    } else { console.error("%o style height, width, and overflow are undefined.", _$target); }
                }
                
                return this;
            }; 
            $.fn.addClickHighlight  = function(){
                var $tr = this.find("tbody > tr");
                $tr.unbind("click");
                $tr.click(function(){
                   $tr.removeClass("active");
                   $(this).addClass("active"); 
                });    
                return this;
            };
            $.fn.center             = function(){
                this.css("position","fixed");
                this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) + $(window).scrollTop()) + "px");
                this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + $(window).scrollLeft()) + "px");
                return this;
            };
            $.fn.centerWidth        = function(){
                this.css("position","fixed");
                this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + $(window).scrollLeft()) + "px");
                return this;
            };
            $.fn.checkValueExists   = function(o){
                var _self   =   this;
                var _cls    =   "zDataExist";
                var _msg    =   "data already exist";
                var _time   =   1500;
                if( ! isUD(o.keyInputDelay) ) _time = o.keyInputDelay;
                $("." + _cls).remove();
                if(o.message) _msg = o.message;
                var _h = '<div class="'+ _cls +'">'+ _msg +'.</div>';
                $("body").append(_h);
                var _panel =$("." + _cls);
                if( isUD(o.isNotExistShow) ) o.isNotExistShow = false;
                if(typeof _self.tmr === ud) _self.tmr = null;
                this.on("keyup change",function(){
                  var _obj=$(this);
                  if($.trim(this.value)===""){
                     _panel.hide();
                     return false;
                  }
                  var l_value=$.trim(this.value);
                  if(zsi.timer) clearTimeout(zsi.timer);
                  zsi.timer = setTimeout(function(){              
                     var _opts  = {
                        left : _obj.offset().left
                        , top  : _obj.offset().top - _panel.innerHeight() - 3
                        , onHide : function(){
                            _obj.val(""); 
                              if( ! isUD(o.onHide) ) o.onHide(_obj.closest(".zRow"));
                          }
                      };
                      
                      if(o.time)  _opts.time = o.time;
                      
                      if( o.isNotExistShow===false && _self.length > 0 ){
                          
                          var _lineIndex = _self.index(_obj);
                          for(var i=0;i<_self.length;i++){
                              var input =_self[i];
                              if(_lineIndex !==i && $.trim(input.value) !==""  ){
                                  if(input.value.toLowerCase() === l_value.toLowerCase()){
                                       $("." + _cls).css({"z-index"      : zsi.getHighestZindex() + 1}).showAlert(_opts);    
                                  }
                              }
                              
                          }
                          _obj.removeClass("loadIconR" );
    
                      }
                       
                      if( ! isUD(o.isCheckOnDb) ) { 
                        if(o.isCheckOnDb ==false) return _self;
                      }
                        
                        
                     _obj.addClass("loadIconR" );
                     $.getJSON(base_url + "sql/exec?p=" + (typeof o.procedureName !== ud ? o.procedureName : "checkValueExists") +  " @code='" + o.code + "',@colName='" +  o.colName + "',@keyword='" +  l_value + "'"
                        , function(data) {
                              _obj.removeClass("loadIconR" );
                              if(data.rows[0].isExists.toUpperCase() === (o.isNotExistShow ? "N" : "Y")) {
                                 $("." + _cls).css({"z-index"      : zsi.getHighestZindex() + 1}).showAlert(_opts);           
                              }
            
                          }
                     );

                  }, _time);         
               });
            };
            $.fn.clearGrid          = function(){
                var _panel = ".zGridPanel";
                if(this.find(_panel).length >0)
                    this.find(_panel + " .zRows #table").html("");
                else 
                    $(this).children('tbody').html('');
            };
            $.fn.clearSelect        = function(hasOption,defaultText) {
              var _dt =  (defaultText ? defaultText : "");
              this.html(   (hasOption ? "<option>"  + _dt + "</option>" : _dt ));
            };
            $.fn.createDragScroll   = function(o){
                var x, y, top, left, down;
                var _$self = $(this); //scroll Area
                var _$zp = _$self.children(".zoomPanel");
                
                _$self.data("isDraggable", true);
                _$self.mousedown(function (e) {
                    e.preventDefault();
                    down = true;
                    x = e.pageX;
                    y = e.pageY;
                    top = $(this).scrollTop();
                    left = $(this).scrollLeft();
                });
                _$self.mouseleave(function (e) {
                    down = false;
                });
                
                $("body").mousemove(function (e) {
                    if(!_$self.data("isDraggable")) return;
                    if (down) {
                        var newX = e.pageX;
                        var newY = e.pageY;
                        _$self.scrollTop(top - newY + y);
                        _$self.scrollLeft(left - newX + x);

                    }
                });
                $("body").mouseup(function (e) { 
                    down = false; 
                });
                
                _$self.bind('mousewheel DOMMouseScroll', function(e) {
                    var evt=window.event || e;
                    var delta=evt.detail? evt.detail*(-120) : evt.wheelDelta; 
                    if( delta > 0 ) _$self.find("#zoomIn").click(); 
                    else {
                        var _e = evt.target;
                        if(evt.target.tagName.toLowerCase() !== "img") _e = $(_e).find("#targetImg").get(0);

                        if( _e.getBoundingClientRect().width > (_$self.width() / 2) ) _$self.find("#zoomOut").click();
                    }
                });
            
                if(o.isZoom || o.isZoom === true) _$zp.createZoomCtrl({});
                
                _$self.autoHideScroll({ isHoverBR : true });
                
                return _$self;
            };
            $.fn.createZoomCtrl     = function(o){
                var _clsFrame = ".imgFrame";
                var self = this;
                var _$frm = self.closest(_clsFrame);
                this.inVal = 0.03;
                 _$zp = self;
                var _getScaleValue =  function(transformValues){
                    var _r = 0;
                    var _t = transformValues;
                    if(_t.length > 0){
                        var a = _t[0];
                        var b = _t[1];
                        _r= Math.sqrt(a*a + b*b);
                    }
                    return _r;
                } 
                 
                var _onZoom = function(isIn){
                    var getVal  =   function(){
                        var _curVal = _getScaleValue(self.getCssTransformValue());
                        if(isIn){
                            _curVal +=  self.inVal;
                        }else {
                            _curVal  -= self.inVal;
                        }            
                        return _curVal;
                    };
                    self.css({transform : "scale(" + getVal() + ")"});
                    
                    //fix for google chrome
                    _$frm.css("overflow", "hidden");
                    setTimeout(function(){
                        _$frm.css("overflow", "auto");
                    },1);
                };
                var $p = this.parent();
                new zsi.easyJsTemplateWriter($p).div({class:"zoomCtrl"})
                    .in()
                    .bsButton({id:"zoomIn",class:"btn-default btn-sm",icon:"zoom-in"})
                    .bsButton({id:"zoomOut",class:"btn-default btn-sm",icon:"zoom-out"})
                    .bsButton({id:"refresh",class:"btn-default btn-sm",icon:"refresh"});
            
                $p.find("#zoomIn,#zoomOut,#refresh").click( function(){
                    if(this.id.toLowerCase() === "zoomin") _onZoom(true); else _onZoom(false);
                    if(this.id.toLowerCase() === "refresh") _$frm.resetDragScroll();
                });
            
                $p.children(".zoomCtrl").css({top: $p.offset().top,left: $p.offset().left  });
                
                return this;
            };
            $.fn.dataBind           = function(){
                var a = arguments;
                var p=a[0];
                if(this.hasClass("zGrid")) return $(this).dataBindGrid(p);
                if(this.parent().hasClass("zTable")) return $(this).loadTable(p);

                //dropdownlist
                if(typeof a[0] ==="string"){
			        var _url = zsi.config.baseURL;					
                     p={}; p.url = (_url ? _url :"/") + "selectoption/code/" + a[0];                      
                    if(typeof a[1] !==ud) p.onComplete = a[1];
                }
                var obj=this;
               $.getJSON(p.url, function( _data ) {
                    var _params ={
                           data             : _data.rows
                          ,selectedValue    : p.selectedValue
                          ,isRequired       : p.required
                          , onComplete      : p.onComplete
                          , onEachComplete  : p.onEachComplete
                          , onChange        : p.onChange
                    };
                    if(typeof p.text !== ud && typeof p.value !== ud ){
                        _params.text  = p.text;
                        _params.value = p.value;
                    }
                    obj.fillSelect(_params);
                    if(p.isUniqueOptions===true)  obj.setUniqueOptions();
               });
               return this;
            };
            $.fn.dataBind2          = function(){
                var _curHid,_curSpan;
                var _ctrlId= this.attr("name") + "_ddl";
                var _jCtrlId = "#" + _ctrlId;
                 $("body").append('<select id="' + _ctrlId + '" class="zDDList" size="15" ></select>');
                var a = arguments;
                var p=a[0];
                //dropdownlist
                if(typeof a[0] ==="string"){
                     p={}; p.url = zsi.config.baseURL + "selectoption/code/" + a[0]; 
                    if(typeof a[1] !==ud) p.onComplete = a[1];
                }
                var obj=this;
                if(typeof p.url !==ud){
                    $.getJSON(p.url, function( _data ) {
                        var _params ={
                               data             : _data.rows
                              ,selectedValue    : p.selectedValue
                              ,isRequired       : p.required
                              , onComplete      : p.onComplete
                        };
                        if(typeof p.text !== ud && typeof p.value !== ud ){
                            _params.text  = p.text;
                            _params.value = p.value;
                        }
                        
                        var _size = 15;
                        if(_data.rows.length <  _size + 1 )  _size = _data.rows.length + 1;
                        $(_jCtrlId).attr({size : _size }).fillSelect(_params);
                        //if(p.isUniqueOptions===true)  obj.setUniqueOptions();
                        
                    });
                }
                
                this.parent().find(".zDdlBtn").click(function(){
                    var _p = $(this).parent();
                    _curHid =  _p.find(":hidden");
                    _curSpan = _p.find("#text");
                    _select =   $(_jCtrlId);
                    _select.val(_curHid.val())
                    
                    if(typeof p.onClick !==ud ) p.onClick($(this.parentNode),_curHid,_select);

                    if(_select.find("option").length > 0){ 
                        
                        _select.css({
                            display:"block"
                            ,top:_p.offset().top + _p.innerHeight()
                            ,left:_p.offset().left
                        }).focus();
                        
                        if(_select.outerWidth() < _p.outerWidth() ) _select.css({width:_p.outerWidth()});

                        var _option = _select.find('[value="' + _curHid.val() + '"]');
                        if(_option.length > 0){
                            var _optionTop = _option.offset().top;
                            var _selectTop = _select.offset().top;
                            _select.scrollTop(_select.scrollTop() + (_optionTop - _selectTop));
                        }
                        else _select.scrollTop(0);
                    }

                });  
                
                 $(_jCtrlId).unbind().click(function(){
                    var _self = $(this);
                    _curHid.val( _self.val() );
                    _curSpan.html( _self.find("option:selected").text() );
                    _self.css({display:"none"});
                }).keyup(function(e){
                	var k = (e.keyCode ? e.keyCode : e.which);
                	if(k == '13'){
                	     $(this).css({display:"none"});
                	}
                });                
        
                $(document).on('wheel mouseup', function(e){
                    var _e = $(".zDDList");
                    if (!_e.is(e.target) && _e.has(e.target).length === 0) {
                        _e.hide();
                    }
                });  
               return this;
            }; 
            $.fn.dataBindGrid       = function(o){
                if ( ! isUD(o.ver) ) { if(o.ver===2) return this.dataBindGrid2(o); }
                this.arrowUp ="<span class=\"arrow-up\"></span>",
                this.arrowDown ="<span class=\"arrow-down\"></span>",
                this.arrows = this.arrowUp + this.arrowDown;   
                this.clsPanelR = ".right";
                this.clsPanelL = ".left";
                this.setPageCtrl = function(o,data){
                    var _self = $(this);
                    var _$pageNo;
                  
                    var _createPageList = function(_rows,_pages){
                        var opt ="";
                        for(var x=1;x<=_pages;x++){
                            opt += "<option value='" + x + "'>" + x + "</option>";
                        }
                        _$pageNo = _self.find("#pageNo").html(opt);
                        _self.find("#recordsNum").html(_rows.length);
                        _self.find("#of").html("of " + _pages);
                    };
                    
                    _createPageList(data.rows,data.returnValue);
                     
                    _$pageNo.change(function(){
                        __obj.pageParams = ",@pno=" + this.value ;
                        if(__obj.params.url) __obj.params.url  = __obj.url +  __obj.pageParams +  (typeof __obj.sortParams !== ud   ?  __obj.sortParams : "" );    
                        __obj.dataBindGrid(__obj.params);
                    });
                    
                    _self.find("#rpp").keyup(function(e){
                        var k = (e.keyCode ? e.keyCode : e.which);
                    	if(k == '13'){
                            o.rowsPerPage =  this.value ;
                            if(__obj.params.url) __obj.params.url  = __obj.url + (typeof __obj.pageParams !== ud ? __obj.pageParams : "")   +  (typeof __obj.sortParams !== ud   ?  __obj.sortParams : "" );    
                            __obj.params.callBack = function(o){
                                _createPageList(o.data.rows,o.data.returnValue);
                                __obj.params.callBack = null;
                            };
                            __obj.dataBindGrid(__obj.params);
                    	}
                    });  
            
                };
                this.onRequestDone = function(o){
                    var _Pnl =".zGridPanel";
                    var _PL  =  _Pnl  + ".left"
                    var _PR  =  _Pnl  + ".right"
                    var _row = ".zRows";
                    var _$pl =  this.children(_PL);
                    var _$pr =  this.children(_PR);
                    
                    this.left = { panel :_$pl, rows: _$pl.find(_row)}; 
                    this.right  = { panel :_$pr, rows: _$pr.find(_row)}; 
                    
                    if(o.params.onComplete){
                        this.__onComplete = o.params.onComplete;
                        this.__onComplete(o);
                    }
                    if(o.params.callBack) o.params.callBack(o);
                };
                this.setColumnResize = function(){
                    var  _self      = this
                        ,_clsGrp0   = "group0"
                        ,_grpItem   = "groupItem"
                    ;
                    
                    if( ! isUD(_self.params.resizable)  &&  _self.params.resizable===false) return;
                    $(".zHeaders .item .cr").unbind("mousedown").on('mousedown', function (e) {
                        var _curCol = $(e.target).parent();
                        
                        // if group0 found get last column element.
                        if(_curCol.hasClass(_clsGrp0)) {
                            var _gis =  _curCol.find("." + _grpItem);
                              _curCol = $(_gis[_gis.length-1]);
                        } 
                        //console.log(  _curCol.parent() );
                        zsi.tableResize = { 
                             curCol         : _curCol
                            ,curLastWidth   : parseFloat(_curCol.css("width"))
                            ,hdrLastWidth   : parseFloat(_curCol.closest(".zHeaders").css("width")) 
                            ,tblLastWidth   : parseFloat(_curCol.closest(".zGridPanel").find("#table").css("width"))
                            ,nextLastWidth  : parseFloat(_curCol.next().css("width"))
                            ,lastX          : e.clientX
                        };
                    });
                    
                    $(document).on('mousemove', function (e) {
                         if (typeof zsi.tableResize === ud || zsi.tableResize === null ) return;
                        var _tr = zsi.tableResize;
                        if( ! _self.is( _tr.curCol.closest(".zGrid")) ) return;  //check if zGrid object is the same.
                        
                        //find current column index
                        var  _groupIndex = -1
                            ,_grp0  =  _tr.curCol.closest("." + _clsGrp0);
                        if(_grp0.length > 0){
                            var  _zHeaders = _grp0.parent()
                                ,_gItems = _zHeaders.find("." + _grpItem);
                            for( var x=0; x < _gItems.length;x++){
                                if( ! $(_gItems[x]).hasClass(_clsGrp0)){
                                  _groupIndex++;
                                  if(_tr.curCol.is(_gItems[x]) ) break;
                                }  
                            }
                        }    

                        var  _cIndex = (_grp0.length > 0 ? _groupIndex : _tr.curCol.index() )
                            ,_ew     = (e.clientX  - _tr.lastX) //extra width
                            ,_rows   = _tr.curCol.closest(".zGridPanel").find(".zRows").eq(0)
                            ,_dr     = _self.params.dataRows
                            ,_cls    = "#table > .zRow > .zCell:nth-child"
                            ,_getCurrentCell = function(j){
                                var _r = [];
                                for(var x=0;x<j.length;x++){
                                    if( $(j[x]).closest(".zRows").is(_rows) )  _r.push(j[x]);
                                }
                                return $(_r);
                            };
                        
                        if( _tr.curLastWidth + _ew  < 25  )   return;
                        
                        _tr.curCol.css({width: _tr.curLastWidth + _ew });
                        if(o.width){  
                            if(_ew > 0) _tr.curCol.closest(".zHeaders").css({width: _tr.hdrLastWidth + _ew});
                        }
                        var _zCell1 =  _getCurrentCell(_rows.find(_cls + "(" +  ( _cIndex +  1) + ")"));
                        _zCell1.css({width: _tr.curLastWidth + _ew });
                        _zCell1.parent().parent().css({width: _tr.tblLastWidth + _ew});
                        
                        if(_dr[ _cIndex]    ) _dr[_cIndex].width =  (_tr.curLastWidth + _ew);
                    }).on('mouseup', function (e) {
                        zsi.tableResize = null;
                    });            
                };

                var __obj               = this
                    ,__o                = o
                    ,num_rows           = 0
                    ,ctr                = 0  
                    ,_gridWidth         = 0
                    ,_gridWidthLeft     = 0
                    ,_gridWidthRight    = 0
                    ,_ch                = o.dataRows
                    ,_chRight           = []
                    ,_chLeft            = []                    
                    ,_headers
                    ,_tbl
                    ,_tableRight
                    //,dataRows
                    ,_styles            = []
                    ,_isGroup           = false
                    ,bs                 = zsi.bs.ctrl
                    ,svn                = zsi.setValIfNull
                    ,clearTables        = function(){
                         __obj.find("div[id='table']").html("");
                    }
                    ,createColumnHeader = function(o){
                        if(o.headers.length===0) return;
                        o.headers.html(getdataRows(o.dataTable,o.startGroupId));
                        if(_isGroup) o.headers.append("<div>&nbsp;</div");
                        o.headers.find(".item .zSort a").click(function(){
                            var  $a = $(this)
                                ,_colNo = $a.attr("sortColNo")
                                ,_orderNo =0
                                ,_oldClass = $a.attr("class")
                            ;
                            __obj.left=_tableRight.offset().left - _gridWidthLeft;
                            __obj.find(".sPane").html(__obj.arrows);
                            
                            __obj.find(".zSort a").removeAttr("class");
                            $a.addClass(_oldClass);
                            
                            if(typeof $a.attr("class") === ud) $a.addClass("desc");
                            var className = $a.attr("class");
                            if(className.indexOf("asc") > -1){
                                $a.removeClass("asc");
                                $a.addClass("desc");
                                $a.find(".sPane").html(__obj.arrowDown);
                                _orderNo=1;
                            }
                            else{
                                $a.removeClass("desc");
                                $a.addClass("asc");
                                $a.find(".sPane").html(__obj.arrowUp);
                                _orderNo=0;
                            }
                            __obj.sortParams = ",@col_no=" + _colNo + ",@order_no=" + _orderNo;
                            if(__obj.params.url) __obj.params.url  = __obj.url +  __obj.sortParams +  (typeof __obj.pageParams !== ud ?  __obj.pageParams : "" );
                            
                            if(o.onSortClick) 
                                o.onSortClick(_colNo,_orderNo);
                            else 
                                __obj.dataBindGrid(__obj.params);
                            
                        });
                        if(_isGroup || o.width > __o.width ) o.headers.css({width:(o.width + 20 )});
                        if (__o.width) o.table.css("width",(o.width + 1 )  + "px");
                    }
                    ,trItem             = function(o){
                        if(o.panelType === "Y" && _chLeft.length > 0) return; 
                        var _dt =  (o.panelType ==="R"? _chRight : _chLeft ); 
                        var _table =  (o.panelType ==="R"? __obj.find(__obj.clsPanelR).find("#table") : __obj.find(__obj.clsPanelL).find("#table") ); 
                        
                        var r       = "";
                        
                        r +="<div rowObj class='zRow'>";
                            for(var x=0;x<_dt.length;x++){
                                var _content = "", _attr = "", _style = "", _class = "",_nd= (o.data===null ? " no-data ":"");
                                var _info = _dt[x]; 
                                if(o.data) {
                                    o.data.td = {};
                                    o.data.recordIndex = o.index;
                                }
                                if(_info.onRender)
                                    _content = _info.onRender(o.data);
                                else{
                                    if(typeof _info.type === ud)
    		                            _content = "<span class='text'>" + svn(o.data,_info.name)  + "</span>";
    		                        else{ 
    		                            
    		                            if(typeof _info.displayText!==ud){
                                            _content = bs({    name         : _info.name  
                                                                ,style      : _info.style 
                                                                ,type       : _info.type  
                                                                ,value      : svn(o.data ,_info.name ,_info.defaultValue ) 
                                                                ,displayText: svn(o.data  ,_info.displayText) 
                                                        });
    		                            }
    		                            else {
    		                                _content = bs({name:_info.name , style:_info.style ,type:_info.type  ,value: svn(o.data  ,_info.name  ,_info.defaultValue )});
    		                            }
    		                        }
    		                         
    		                        if(x===0 || x ===__o.selectorIndex ){
    		                          if(typeof __o.selectorType !==ud) 
    		                                _content += (o.data !==null ? bs({name: (__o.selectorType ==="checkbox" ? "cb" :  (__o.selectorType==="radio" ? "rad" : "ctrl" )  ),type:__o.selectorType}) : "" );
    		                        }
                                }
                                
                                if(o.data){
                                    _attr  = (typeof o.data.td.attr  === ud ? "" : " " + o.data.td.attr);
                                    _class = (typeof o.data.td.class === ud ? "" : " " + o.data.td.class );
                                    _style = (typeof o.data.td.style === ud ? "" : " style=\"" + o.data.td.style + "\"" );
                                }
                                _class +=  (typeof _info.class !== ud ? " " +  _info.class : "");
                                

                                if( (typeof _info.groupId !== ud ?_info.groupId : 0)  > 0 || _info.onRender || _isGroup === false)
                                    r +="<div class=\"zCell" + _nd +  _class + "\"  " + _attr  + " style=\"width:" + (_dt[x].width ) +  "px;"  + _dt[x].style + "\" >" + _content + "</div>";
                            }
                        r +="</div>";               

                        if( o.panelType ==="R" && ! isUD(__o.toggleMasterKey) ){
                            r +="<div id=\"childPanel" + zsi.replaceIllegalId(svn(o.data,__o.toggleMasterKey)) +   "\" class=\"zExtraRow\"><div class=\"zGrid\"></div></div>";                           
                        }
                        
                        _table.append(r);
                        var _row=$("div[rowObj]");_row.removeAttr("rowObj");
                        if ( ! isUD(__o.onEachComplete) ) {
                            _row.__onEachComplete =__o.onEachComplete;
                            _row.__onEachComplete(o);
                        }                        
                        
                    }
                    ,setRowClickEvent   = function(){
                        
                        var $rows = __obj.find(".zRow");
                        $rows.click(function(){
                            var _i = $(this).index();
                            $rows.removeClass("active");
                             __obj.find(".zRow:nth-child("  + (_i + 1) +  ")").addClass("active");
                        });
                        
                        //check on input change if current row is edited.
                        $rows.find("select, input").on("keyup change", function(){
                                var $zRow = $(this).closest(".zRow");
                                $zRow.find("#is_edited").val("Y");
                        });   
                        
                        
                    }
                    ,setScrollBars      = function(){
                        _tableRight.parent().scroll(function() {
                            var _left = _tableRight.offset().left;
                            var _top = _tableRight.offset().top;
                            var _headers = $(_tableRight.closest(".right").find(".zHeaders")[0]);
                            var _tblLeft = $(this).closest(".right").prev().find("#table");
                            _headers.offset({left:_left});
                            _tblLeft.offset({top:_top});
                        });                         
                    }
                    ,getdataRows= function(d, id){
                        var  hasChild = function (d,id){
                            for(var x=0; x<d.length;x++ ){
                                if(d[x].groupId===id) return true;
                            }
                            return false;
                        };
                        var loadChild = function (d,id){
                            var h=""; 
                            for(var x=0; x<d.length;x++ ){
                                if(typeof d[x].groupId === ud ||  d[x].groupId==id ) {
                                    var _hasSort = (typeof d[x].sortColNo !== ud ? true:false);
                                    var _minusSortWidth  = ( _hasSort ? 15:0);
                                    var _style = "",_styleTitle="";
                                    var _level = (typeof d[x].groupId !==ud ? " group" + d[x].groupId : "" );
                                    var _class = (typeof d[x].class !==ud ? " " + d[x].class : "" );
                                    var _id = (typeof d[x].id !==ud ? "id=\"" + d[x].id + "\"" : "" );
                                    var _titleId = (typeof d[x].id !==ud ? "id=\"title" + d[x].id + "\"" : "" );
                                    var _groupItem = (_isGroup ? " groupItem" : "" );
                                    if(typeof d[x].width !==ud){
                                        _style = "style=\"width:" +  d[x].width  + "px;"  + d[x].style + "\"";
                                       // _styleTitle = "style=\"width:" +  (d[x].width -  _minusSortWidth) + "px;"  + d[x].style + "\"";
                                        _styleTitle = "style=\""  + d[x].style + "\"";
                                    }
                                    
                                    h+= "<div " + _id + " class='item" + _groupItem + _level + _class + "' " + _style + ">";
                                    h+= "<div " + _titleId + " class='title" + ( _hasSort ? " hasSort":"") + "' " + _styleTitle + " ><span class=\"text\">" + d[x].text +  "</span></div>"; 
                                    if( isUD(o.resizable)  ||  o.resizable===true) h+= "<div class='cr'></div>";
                                    if(typeof d[x].groupId !== ud ) 
                                        h+= getdataRows(d,d[x].id) ;
                                    h+=getSortHeader(d[x].sortColNo);
                                    h+= "</div>";
                                   
                                }
                            }
                            return h;
                        };
                        
            
                        return loadChild(d,id);
            
                    }
                    ,getSortHeader   = function(sortColNo){
             
                        if(typeof sortColNo !== ud )
                            return  "<div class=\"zSort\">"
                                    + "<a href=\"javascript:void(0);\" sortColNo=\"" + sortColNo + "\" >"
                                        + "<span class=\"sPane\">" + __obj.arrows + "</span>"
                                    + "</a>"
                                    + "</div>";
                        else return "";
                    }
                    ,isFreezeItem       = function(o){
                        return  ( ((typeof o.isFreeze === ud) ||  o.isFreeze ===false) ? false:true ); 
                    }
                    ,createBlankRows =  function(o){
                        if(typeof o.blankRowsLimit !==ud ){
                            for(var x=0; x < o.blankRowsLimit;x++){
                                trItem({data:null,panelType:"L",index:x}); 
                                trItem({data:null,panelType:"R",index:x});
                            }
                        } 
                    }
                    ,rowsCompleted = function(){
                        //setRowsKeyUpChange();
                        createBlankRows(o);
                        setRowClickEvent();
                        setScrollBars();
                        __obj.addClickHighlight(); 
                        __obj.setColumnResize();
                    }
                ;
            
                $.each(o.dataRows,function(){
                    if(this.groupId > 0 || typeof this.groupId ===ud){ 
                        if(typeof this.groupId !==ud){ if(_isGroup===false) {_isGroup=true;}}
                        _styles.push(this);
                    }
                    
                    if( isFreezeItem(this) )
                        _chLeft.push(this);
                    else
                        _chRight.push(this);
                });
                


                if(typeof this.isInitiated === ud){
                    var _footer =  "<div class=\"zPageFooter\"><div class='pagestatus'>Number of records in a current page : <i id='recordsNum'> 0 </i></div>"
                                +  "<div class='pagectrl'>" + (isUD(o.rowsPerPage) ? "" : "<label> No. of Rows: </label> <input id='rpp' name='rpp' type='text' value='" + o.rowsPerPage  + "'>" ) 
                                +  "<label id='page'> Page </label> <select id='pageNo'></select>"
                                +  "<label id='of'> of 0 </label></div></div>"
                       ,_head = "";
                    
                    if(_chLeft.length > 0)
                        _head +="<div class=\"zGridPanel left\">"
                                    +"<div class=\"zHeaders\"></div>"
                                    +"<div class=\"zRows\">"
                                        +"<div id=\"table\"  ></div>"
                                    +"</div>"
                                    +"<div class=\"zFooter\"></div>"                
                                   +"</div>"
                               +"</div>"
                        
                     
                             
                    _head +="<div class=\"zGridPanel right\">"
                                +"<div class=\"zHeaders\"></div>"
                                +"<div class=\"zRows\">"
                                    +"<div id=\"table\" ></div>"
                                +"</div>"
                                +"<div class=\"zFooter\"></div>"                
                                +"</div>"
                            +"</div>"                                

                    this.params = o;
                    this.url = o.url;
                    this.isInitiated = true;
                    this.html( _head + (typeof o.isPaging !==ud ?  (o.isPaging===true ? _footer :"") :"") );
                    
                    o.isAsync = (typeof o.isAsync !== ud ? o.isAsync : false);
                    __obj.curPageNo = (o.isAsync ===true?1:0);
                    
                    var _panelRight = this.find(__obj.clsPanelR);
                    var _panelLeft = this.find(__obj.clsPanelL);
                    var _top =  "top:" + ((o.columnHeight / 2)-8) + "px;";
                    
                    for(i=0; i <_styles.length;i++){
                        _gridWidth += _styles[i].width;
                        
                        if(isFreezeItem(_styles[i]))   
                            _gridWidthLeft += _styles[i].width;
                        else
                            _gridWidthRight += _styles[i].width;
                    }
                    if(typeof o.startGroupId === ud) o.startGroupId=0;
                    
                    _tableRight =  _panelRight.find("#table");
                    _tableLeft  =  _panelLeft.find("#table");
                    __obj.find(".zRows").css("height", o.height + "px");
                    _panelLeft.css("width", _gridWidthLeft + "px");
                    _panelRight.css("width", (o.width - _gridWidthLeft -4  )  + "px");
                   
                    if(_chLeft.length > 0)
                        createColumnHeader({ 
                              headers       : _panelLeft.find(".zHeaders")
                             ,table         : _tableLeft
                             ,dataTable     : _chLeft
                             ,width         : _gridWidthLeft
                             ,startGroupId  : o.startGroupId
                        });
                     
                    createColumnHeader({
                          headers    : _panelRight.find(".zHeaders")
                         ,table      : _tableRight
                         ,dataTable  : _chRight
                         ,width      : _gridWidthRight
                         ,startGroupId  : o.startGroupId
                    });
                    
                    
                }
                else{
                    _panelLeft = this.find(".left").find("#table");
                    _tableRight = this.find(".right").find("#table");
                }

                if(typeof o.isNew !== ud){
                    if(o.isNew===true) clearTables();
                } 
                
                if(o.url || o.sqlCode){
                    if( (o.isAsync && __obj.curPageNo === 1) ||  ! o.isAsync ) clearTables();
                    var params ={
                       dataType: "json"
                      ,cache: false
                      ,success: function(data){
                                    var _noOfPage   = (data.returnValue > 0 ? data.returnValue : 0);
                                    var _ch,i,_trs;
                                    num_rows = data.rows.length;
                                    $.each(data.rows, function (i) {
                                        trItem({data:this,panelType:"L",index:i}); 
                                        trItem({data:this,panelType:"R",index:i});
                                    });
                                    
                                    if(o.isAsync && __obj.curPageNo < _noOfPage ){
                                            //fire onAsyncComplete
                                            data.pageNo = __obj.curPageNo
                                            if(o.onAsyncComplete) o.onAsyncComplete(data);
                                            //loop page numbers
                                             __obj.curPageNo++;
                                            __obj.pageParams = ",@pno=" + __obj.curPageNo ;
                                            if(__obj.params.url) __obj.params.url  = __obj.url + __obj.pageParams +  (typeof __obj.sortParams !== ud ?  __obj.sortParams : "" );    
                                            setScrollBars();
                                            __obj.dataBindGrid(__obj.params);
                                    }
                                    else{
                                        rowsCompleted();
                                        __obj.find("#recordsNum").html(num_rows);
                                         if(typeof __obj.isPageInitiated === ud){
                                            __obj.setPageCtrl(o,data);
                                            __obj.isPageInitiated=true;
                                         }
                                        
                                        if(__obj.left) _tableRight.parent().scrollLeft(Math.abs(__obj.left ));
                                        
                                        if(o.isAsync && o.onAsyncComplete) {
                                            data.pageNo = __obj.curPageNo;
                                            o.onAsyncComplete(data);
                                        }
                                        __obj.onRequestDone({params:o,data:data});
                                    }
                                   
                                   
                            }          
                    };
                    
                    if(typeof o.sqlCode!==ud)  {
                        if(typeof zsi.config.getDataURL===ud){
                            alert("zsi.config.getDataURL is not defined in AppStart JS.");
                            return;
                        }
                        params.url = zsi.config.getDataURL ;
                        params.data = JSON.stringify({sqlCode :o.sqlCode,parameters:o.parameters});
                        params.type = "POST";
                    }
                    else params.url = o.url + ( isUD(o.rowsPerPage) ? "" : ",@rpp=" +  o.rowsPerPage  )
            
                    __obj.bind('refresh',function() {
                        if(zsi.tmr) clearTimeout(zsi.tmr);
                        zsi.tmr =setTimeout(function(){              
                            __obj.dataBindGrid(o);
                        }, 1);   
                    });
            
                    $.ajax(params);
                }
                else if(typeof o.rows !== ud){
                    $.each(o.rows, function(i) {
                        trItem({data:this,panelType:"L",index:i}); 
                        trItem({data:this,panelType:"R",index:i});                            
                    });
                    rowsCompleted();
                    __obj.onRequestDone({params:o,data:o.rows});
                }  
                else{
                    if( isUD(o.blankRowsLimit) ) o.blankRowsLimit=5;
                    rowsCompleted();                  
                    __obj.onRequestDone({params:o});

                }
                
            };
            $.fn.dataBindGrid2      = function(o){
                var _obj                = this
                    ,_tw                = zsi.easyJsTemplateWriter
                    ,_o                 = o
                    ,num_rows           = 0
                    ,ctr                = 0  
                    ,_gridWidth         = 0
                    ,_gridWidthLeft     = 0
                    ,_gridWidthRight    = 0
                    ,_ch                = o.dataRows
                    ,_chRight           = []
                    ,_chLeft            = []                    
                    ,_headers
                    ,_tbl
                    ,_tableRight
                    //,dataRows
                    ,_styles            = []
                    ,_isGroup           = false
                    ,bs                 = zsi.bs.ctrl
                    ,svn                = zsi.setValIfNull
                    ,clearTables        = function(){
                         _obj.find("div[id='table']").html("");
                    }
                    ,createColumnHeader = function(o){
                        if(o.headers.length===0) return;
                        o.headers.html(getdataRows(o.dataTable,o.startGroupId));
                        if(_isGroup) o.headers.append("<div>&nbsp;</div");
                        o.headers.find(".item .zSort a").click(function(){
                            var  $a = $(this)
                                ,_colNo = $a.attr("sortColNo")
                                ,_orderNo =0
                                ,_oldClass = $a.attr("class")
                            ;
                            _obj.left=_tableRight.offset().left - _gridWidthLeft;
                            _obj.find(".sPane").html(_obj.arrows);
                            
                            _obj.find(".zSort a").removeAttr("class");
                            $a.addClass(_oldClass);
                            
                            if(typeof $a.attr("class") === ud) $a.addClass("desc");
                            var className = $a.attr("class");
                            if(className.indexOf("asc") > -1){
                                $a.removeClass("asc");
                                $a.addClass("desc");
                                $a.find(".sPane").html(_obj.arrowDown);
                                _orderNo=1;
                            }
                            else{
                                $a.removeClass("desc");
                                $a.addClass("asc");
                                $a.find(".sPane").html(_obj.arrowUp);
                                _orderNo=0;
                            }
                            _obj.params.parameters = {col_no : _colNo, order_no:_orderNo};
                            //if(o.onSortClick) 
                            //    o.onSortClick(_colNo,_orderNo);
                            //else 
                                _obj.dataBindGrid2(_obj.params);
                        });
                        if(_isGroup || o.width > _o.width ) o.headers.css({width:(o.width + 20 )});
                        if (_o.width) o.table.css("width",(o.width + 1 )  + "px");
                    }
                    ,trItem             = function(o){
                        if(o.panelType === "Y" && _chLeft.length > 0) return; 
                        var _dt =  (o.panelType ==="R"? _chRight : _chLeft ); 
                        var _table =  (o.panelType ==="R"? _obj.find(_obj.clsPanelR).find("#table") : _obj.find(_obj.clsPanelL).find("#table") ); 
                        var _$row =  $(new _tw().div({class:"zRow"}).html());
                        for(var x=0;x<_dt.length;x++){
                            var _info       = _dt[x] 
                                ,_style     = 'width:' + (_dt[x].width ) +  'px;'  + _dt[x].style  
                                ,_content   = '&nbsp;'
                                ,_$cell =  $(new _tw().div({class:"zCell" +  svn(_info," " + _info.class),style: _style}).html())
                            ;
                            if(o.data) {
                                o.data.recordIndex = o.index;
                            }
                            if(_info.onRender){
                                    _$cell.onRender = _info.onRender;
                                    _content = _$cell.onRender(o.data);
                            }
                            else{
                                if(typeof _info.type === ud){
                                     _content = new _tw().span({class:"text",value: svn(o.data,_info.name) }).html()
                                }
                                else{ 
                                    if(typeof _info.displayText !== ud ){
                                        _content = bs({    name         : _info.name  
                                                            ,style      : _info.style 
                                                            ,type       : _info.type  
                                                            ,value      : svn(o.data ,_info.name ,_info.defaultValue ) 
                                                            ,displayText: svn(o.data  ,_info.displayText) 
                                                    });
                                    }
                                    else {
                                        _content = bs({name:_info.name , style:_info.style ,type:_info.type  ,value: svn(o.data  ,_info.name  ,_info.defaultValue )});
                                    }
                                }
                                 
                                if(x===0 || x ===_o.selectorIndex ){
                                  if(typeof _o.selectorType !==ud) 
                                        _content += (o.data !==null ? bs({name: (_o.selectorType ==="checkbox" ? "cb" :  (_o.selectorType==="radio" ? "rad" : "ctrl" )  ),type:_o.selectorType}) : "" );
                                }                    
                            }
            
                            if( (typeof _info.groupId !== ud ? _info.groupId : 0)  > 0 || _info.onRender || _isGroup === false){
                                _$cell.html(_content);
                                _$row.append(_$cell);
                                
                                if( o.panelType ==="R" && ! isUD(_o.toggleMasterKey) ){
                                    _$cell.append(new _tw().div({id:"childPanel" + zsi.replaceIllegalId(svn(o.data,_o.toggleMasterKey)), class:"zExtraRow" }).in().div({class:"zGrid"}).html());
                                }                    
                            }
            
                        }
                        _table.append(_$row);
                        if ( ! isUD(_o.onEachComplete) ) {
                            _$row.onEachComplete  =  _o.onEachComplete;
                            _$row.onEachComplete(o);
                        }   
            
                        
                    }
                    ,setRowClickEvent   = function(){
                        
                        var $rows = _obj.find(".zRow");
                        $rows.click(function(){
                            var _i = $(this).index();
                            $rows.removeClass("active");
                             _obj.find(".zRow:nth-child("  + (_i + 1) +  ")").addClass("active");
                        });
                        
                        //check on input change if current row is edited.
                        $rows.find("select, input").on("keyup change", function(){
                                var $zRow = $(this).closest(".zRow");
                                $zRow.find("#is_edited").val("Y");
                        });   
                        
                        
                    }
                    ,setScrollBars      = function(){
                        _tableRight.parent().scroll(function() {
                            var _left = _tableRight.offset().left;
                            var _top = _tableRight.offset().top;
                            var _headers = $(_tableRight.closest(".right").find(".zHeaders")[0]);
                            var _tblLeft = $(this).closest(".right").prev().find("#table");
                            _headers.offset({left:_left});
                            _tblLeft.offset({top:_top});
                        });                         
                    }
                    ,getdataRows        = function(d, id){
                        var  hasChild = function (d,id){
                            for(var x=0; x<d.length;x++ ){
                                if(d[x].groupId===id) return true;
                            }
                            return false;
                        };
                        var loadChild = function (d,id){
                            var h=""; 
                            for(var x=0; x<d.length;x++ ){
                                if(typeof d[x].groupId === ud ||  d[x].groupId==id ) {
                                    var _hasSort = (typeof d[x].sortColNo !== ud ? true:false);
                                    var _minusSortWidth  = ( _hasSort ? 15:0);
                                    var _style = "",_styleTitle="";
                                    var _level = (typeof d[x].groupId !==ud ? " group" + d[x].groupId : "" );
                                    var _class = (typeof d[x].class !==ud ? " " + d[x].class : "" );
                                    var _id = (typeof d[x].id !==ud ? "id=\"" + d[x].id + "\"" : "" );
                                    var _titleId = (typeof d[x].id !==ud ? "id=\"title" + d[x].id + "\"" : "" );
                                    var _groupItem = (_isGroup ? " groupItem" : "" );
                                    if(typeof d[x].width !==ud){
                                        _style = "style=\"width:" +  d[x].width  + "px;"  + d[x].style + "\"";
                                       // _styleTitle = "style=\"width:" +  (d[x].width -  _minusSortWidth) + "px;"  + d[x].style + "\"";
                                        _styleTitle = "style=\""  + d[x].style + "\"";
                                    }
                                    
                                    h+= "<div " + _id + " class='item" + _groupItem + _level + _class + "' " + _style + ">";
                                    h+= "<div " + _titleId + " class='title" + ( _hasSort ? " hasSort":"") + "' " + _styleTitle + " ><span class=\"text\">" + d[x].text +  "</span></div>"; 
                                    if( isUD(o.resizable)  ||  o.resizable===true) h+= "<div class='cr'></div>";
                                    if(typeof d[x].groupId !== ud ) 
                                        h+= getdataRows(d,d[x].id) ;
                                    h+=getSortHeader(d[x].sortColNo);
                                    h+= "</div>";
                                   
                                }
                            }
                            return h;
                        };
                        
            
                        return loadChild(d,id);
            
                    }
                    ,getSortHeader      = function(sortColNo){
             
                        if(typeof sortColNo !== ud )
                            return  "<div class=\"zSort\">"
                                    + "<a href=\"javascript:void(0);\" sortColNo=\"" + sortColNo + "\" >"
                                        + "<span class=\"sPane\">" + _obj.arrows + "</span>"
                                    + "</a>"
                                    + "</div>";
                        else return "";
                    }
                    ,isFreezeItem       = function(o){
                        return  ( ((typeof o.isFreeze === ud) ||  o.isFreeze ===false) ? false:true ); 
                    }
                    ,createBlankRows    = function(o){
                        if(typeof o.blankRowsLimit !==ud ){
                            for(var x=0; x < o.blankRowsLimit;x++){
                                if(_chLeft.length > 0) { trItem({data:null,panelType:"L",index:x});} 
                                trItem({data:null,panelType:"R",index:x});
                            }
                        } 
                    }
                    ,rowsCompleted      = function(){
                        //setRowsKeyUpChange();
                        createBlankRows(o);
                        setRowClickEvent();
                        setScrollBars();
                        _obj.addClickHighlight(); 
                        _obj.setColumnResize();
                    }
                ;
                
                this.arrowUp ="<span class=\"arrow-up\"></span>";
                this.arrowDown ="<span class=\"arrow-down\"></span>";
                this.arrows = this.arrowUp + this.arrowDown;   
                this.clsPanelR = ".right";
                this.clsPanelL = ".left";
                this.setPageCtrl = function(o,data){
                    var _self = $(this);
                    var _$pageNo;
                  
                    var _createPageList = function(_rows,_pages){
                        var opt ="";
                        for(var x=1;x<=_pages;x++){
                            opt += "<option value='" + x + "'>" + x + "</option>";
                        }
                        _$pageNo = _self.find("#pageNo").html(opt);
                        _self.find("#recordsNum").html(_rows.length);
                        _self.find("#of").html("of " + _pages);
                    };
                    
                    _createPageList(data.rows,data.returnValue);
                     
                    _$pageNo.change(function(){
                         o.parameters.pno = this.value;
                        _obj.dataBindGrid2(_obj.params);
                    });
                    
                    _self.find("#rpp").keyup(function(e){
                        var k = (e.keyCode ? e.keyCode : e.which);
                    	if(k == '13'){
                            o.parameters.rpp = this.value;
                            _obj.params.callBack = function(o){
                                _createPageList(o.data.rows,o.data.returnValue);
                                _obj.params.callBack = null;
                            };
                            _obj.dataBindGrid2(_obj.params);
                    	}
                    });  
            
                };
                this.onRequestDone = function(o){
                    var  _Pnl =".zGridPanel"
                        ,_PL  =  _Pnl  + ".left"
                        ,_PR  =  _Pnl  + ".right"
                        ,_row = ".zRows"
                        ,_$pl =  this.children(_PL)
                        ,_$pr =  this.children(_PR)
                    ;
                    
                    this.left = { panel :_$pl, rows: _$pl.find(_row)}; 
                    this.right  = { panel :_$pr, rows: _$pr.find(_row)}; 
                    
                    if(o.params.onComplete){
                        this._onComplete = o.params.onComplete;
                        this._onComplete(o);
                    }
                    if(o.params.callBack) o.params.callBack(o);
                };
                this.setColumnResize = function(){
                    var  _self      = this
                        ,_clsGrp0   = "group0"
                        ,_grpItem   = "groupItem"
                    ;
                    
                    if( ! isUD(_self.params.resizable)  &&  _self.params.resizable===false) return;
                    $(".zHeaders .item .cr").unbind("mousedown").on('mousedown', function (e) {
                        var _curCol = $(e.target).parent();
                        
                        // if group0 found get last column element.
                        if(_curCol.hasClass(_clsGrp0)) {
                            var _gis =  _curCol.find("." + _grpItem);
                              _curCol = $(_gis[_gis.length-1]);
                        } 
                        //console.log(  _curCol.parent() );
                        zsi.tableResize = { 
                             curCol         : _curCol
                            ,curLastWidth   : parseFloat(_curCol.css("width"))
                            ,hdrLastWidth   : parseFloat(_curCol.closest(".zHeaders").css("width")) 
                            ,tblLastWidth   : parseFloat(_curCol.closest(".zGridPanel").find("#table").css("width"))
                            ,nextLastWidth  : parseFloat(_curCol.next().css("width"))
                            ,lastX          : e.clientX
                        };
                    });
                    
                    $(document).on('mousemove', function (e) {
                         if (typeof zsi.tableResize === ud || zsi.tableResize === null ) return;
                        var _tr = zsi.tableResize;
                        if( ! _self.is( _tr.curCol.closest(".zGrid")) ) return;  //check if zGrid object is the same.
                        
                        //find current column index
                        var  _groupIndex = -1
                            ,_grp0  =  _tr.curCol.closest("." + _clsGrp0);
                        if(_grp0.length > 0){
                            var  _zHeaders = _grp0.parent()
                                ,_gItems = _zHeaders.find("." + _grpItem);
                            for( var x=0; x < _gItems.length;x++){
                                if( ! $(_gItems[x]).hasClass(_clsGrp0)){
                                  _groupIndex++;
                                  if(_tr.curCol.is(_gItems[x]) ) break;
                                }  
                            }
                        }    
            
                        var  _cIndex = (_grp0.length > 0 ? _groupIndex : _tr.curCol.index() )
                            ,_ew     = (e.clientX  - _tr.lastX) //extra width
                            ,_rows   = _tr.curCol.closest(".zGridPanel").find(".zRows").eq(0)
                            ,_dr     = _self.params.dataRows
                            ,_cls    = "#table > .zRow > .zCell:nth-child"
                            ,_getCurrentCell = function(j){
                                var _r = [];
                                for(var x=0;x<j.length;x++){
                                    if( $(j[x]).closest(".zRows").is(_rows) )  _r.push(j[x]);
                                }
                                return $(_r);
                            };
                        
                        if( _tr.curLastWidth + _ew  < 25  )   return;
                        
                        _tr.curCol.css({width: _tr.curLastWidth + _ew });
                        
                        if(o.width){
                            if(_ew > 0) _tr.curCol.closest(".zHeaders").css({width: _tr.hdrLastWidth + _ew});
                        }    
                        var _zCell1 =  _getCurrentCell(_rows.find(_cls + "(" +  ( _cIndex +  1) + ")"));
                        _zCell1.css({width: _tr.curLastWidth + _ew });
                        _zCell1.parent().parent().css({width: _tr.tblLastWidth + _ew});
                        
                        if(_dr[ _cIndex]    ) _dr[_cIndex].width =  (_tr.curLastWidth + _ew);
                    }).on('mouseup', function (e) {
                        zsi.tableResize = null;
                    });            
                };
            
                $.each(o.dataRows,function(){
                    if(this.groupId > 0 || typeof this.groupId ===ud){ 
                        if(typeof this.groupId !==ud){ if(_isGroup===false) {_isGroup=true;}}
                        _styles.push(this);
                    }
                    
                    if( isFreezeItem(this) )
                        _chLeft.push(this);
                    else
                        _chRight.push(this);
                });
                
            
            
                if(typeof this.isInitiated === ud){
                    if( isUD(o.parameters) ) o.parameters = {};
                    var  _p     = o.parameters;
                         _p.rpp = ( ! isUD(o.rowsPerPage) ?  o.rowsPerPage :  ( ! isUD( _p.rpp) ?  _p.rpp : null ) );
                         _rpp   = ( _p.rpp !== null ? _p.rpp : 0 );
                     var _head = ""
                        ,_getHdr = function(type){
                            return new _tw().div({class:"zGridPanel " + type}).in().div({class:"zHeaders"}).div({class:"zRows"}).in().div({id:"table"}).out().div({class:"zFooter"}).html();
                        }
                        ,_getFtr = function(){
                             return (typeof o.isPaging !== ud && o.isPaging === true 
                                    ? new _tw().div({class:"zPageFooter "}).in().div({class:"pagestatus",value:"Number of records in a current page : <i id='recordsNum'> 0 </i>" })
                                            .div({class:"pagectrl",value:  ( _rpp===0 ? "" :  new _tw().label({value: "No. of Rows:"}).input({id:"rpp",name:"rpp", type:"text",value:_rpp}).html() )  
                                            +  new _tw().label({id:"page",value:"Page"}).select({id:"pageNo"}).label({id:"of",value:"of 0"}).html()
                                            }).html() 
                                    : "");
                        }          
                    ;
                    if(_chLeft.length > 0){ _head += _getHdr("left");} 
                    _head +=_getHdr("right"); 
                            
                    this.params = o;
                    this.url = o.url;
                    this.isInitiated = true;
                    this.html( _head + _getFtr() );
                    
                    o.isAsync = (typeof o.isAsync !== ud ? o.isAsync : false);
                    _obj.curPageNo = (o.isAsync ===true?1:0);
                    
                    var _panelRight = this.find(_obj.clsPanelR);
                    var _panelLeft = this.find(_obj.clsPanelL);
                    var _top =  "top:" + ((o.columnHeight / 2)-8) + "px;";
                    
                    for(i=0; i <_styles.length;i++){
                        _gridWidth += _styles[i].width;
                        
                        if(isFreezeItem(_styles[i]))   
                            _gridWidthLeft += _styles[i].width;
                        else
                            _gridWidthRight += _styles[i].width;
                    }
                    if(typeof o.startGroupId === ud) o.startGroupId=0;
                    
                    _tableRight =  _panelRight.find("#table");
                    _tableLeft  =  _panelLeft.find("#table");
                    _obj.find(".zRows").css("height", o.height + "px");
                    _panelLeft.css("width", _gridWidthLeft + "px");
                    _panelRight.css("width", (o.width - _gridWidthLeft -4  )  + "px");
                   
                    if(_chLeft.length > 0)
                        createColumnHeader({ 
                              headers       : _panelLeft.find(".zHeaders")
                             ,table         : _tableLeft
                             ,dataTable     : _chLeft
                             ,width         : _gridWidthLeft
                             ,startGroupId  : o.startGroupId
                        });
                     
                    createColumnHeader({
                          headers    : _panelRight.find(".zHeaders")
                         ,table      : _tableRight
                         ,dataTable  : _chRight
                         ,width      : _gridWidthRight
                         ,startGroupId  : o.startGroupId
                    });
                    
                    
                }
                else{
                    _panelLeft = this.find(".left").find("#table");
                    _tableRight = this.find(".right").find("#table");
                }
            
                if(typeof o.isNew !== ud){
                    if(o.isNew===true) clearTables();
                } 
                
                if(o.url || o.sqlCode){
                    if( (o.isAsync && _obj.curPageNo === 1) ||  ! o.isAsync ) clearTables();
                    var params ={
                       dataType: "json"
                      ,cache: false
                      ,success: function(data){
                                    var _noOfPage   = (data.returnValue > 0 ? data.returnValue : 0);
                                    var _ch,i,_trs;
                                    num_rows = data.rows.length;
                                    
                                    $.each(data.rows, function (i) {
                                        if(_chLeft.length > 0) { trItem({data:this,panelType:"L",index:i}); } 
                                        trItem({data:this,panelType:"R",index:i});
                                    });
                                    
                                    if(o.isAsync && _obj.curPageNo < _noOfPage ){
                                            //fire onAsyncComplete
                                            data.pageNo = _obj.curPageNo
                                            if(o.onAsyncComplete) o.onAsyncComplete(data);
                                            //loop page numbers
                                             _obj.curPageNo++;
                                            _o.parameters.pno = _obj.curPageNo; 
                                            setScrollBars();
                                            _obj.dataBindGrid2(_obj.params);
                                    }
                                    else{
                                        rowsCompleted();
                                        _obj.find("#recordsNum").html(num_rows);
                                         if(typeof _obj.isPageInitiated === ud){
                                            _obj.setPageCtrl(o,data);
                                            _obj.isPageInitiated=true;
                                         }
                                        
                                        if(_obj.left) _tableRight.parent().scrollLeft(Math.abs(_obj.left ));
                                        
                                        if(o.isAsync && o.onAsyncComplete) {
                                            data.pageNo = _obj.curPageNo;
                                            o.onAsyncComplete(data);
                                        }
                                        _obj.onRequestDone({params:o,data:data});
                                    }
                                   
                                   
                            }          
                    };
                    
                    if(typeof o.sqlCode !== ud)  {
                        if(typeof zsi.config.getDataURL===ud){
                            alert("zsi.config.getDataURL is not defined in AppStart JS.");
                            return;
                        }
                        params.url = zsi.config.getDataURL + "?ts=" + new Date().getTime();
                        params.data = JSON.stringify({sqlCode :o.sqlCode,parameters:o.parameters});
                        params.type = "POST";
                    }
                    else {
                        var _strUrl = o.url;
                        var _pg = o.parameters;
                        var _setComma = function(url){
                            return ( url.indexOf("@") > -1 ?  "," : " "); 
                        }
                        _strUrl += (_pg.rpp ? _setComma(_strUrl) + "@rpp=" +  _pg.rpp :"");
                        _strUrl += (_pg.pno ? _setComma(_strUrl) + "@pno=" +  _pg.pno :"");
                        params.url =_strUrl;
                    }
                    _obj.bind('refresh',function() {
                        if(zsi.tmr) clearTimeout(zsi.tmr);
                        zsi.tmr =setTimeout(function(){              
                            _obj.dataBindGrid2(o);
                        }, 1);   
                    });
            
                    $.ajax(params);
                }
                else if(typeof o.rows !== ud){
                    $.each(o.rows, function(i) {
                        if(_chLeft.length > 0) { trItem({data:this,panelType:"L",index:i}); } 
                        trItem({data:this,panelType:"R",index:i});                            
                    });
                    rowsCompleted();
                    _obj.onRequestDone({params:o,data:o.rows});
                }  
                else{
                    if( isUD(o.blankRowsLimit) ) o.blankRowsLimit=5;
                    rowsCompleted();                  
                    _obj.onRequestDone({params:o});
            
                }
                
            };
            $.fn.deleteData         = function(o){
                var ids = "";
                var cb = this.find("input[name='cb']:checked");
                var data = cb.getCheckBoxesValues();
                var procedure = (o.procedure ? o.procedure : "deleteData");  
                for (var x = 0; x < data.length; x++) {
                    if (ids !== "") ids += "/";
                    ids += data[x];
                }
                if (ids !== "") {
                    if (confirm("Are you sure you want to delete selected items?")) {
                        $.post(base_url + "sql/exec?p=" + procedure + " @pkey_ids='" + ids + "',@table_code='" + o.code + "'", function (d) {
                            o.onComplete(d);
                        }).fail(function (d) {
                            alert("Sorry, the curent transaction is not successfull.");
                        });
                    }
            
                }
            };
            $.fn.expandCollapse     = function(o){
                this.click(function(){ 
                    //console.log(_afterInitFunc);
                    var obj =this;
                    var span = $(this).find("span");
                    var spanCls ="";
                    
                    if(span.attr("class").indexOf("down") >-1)
                         span.removeClass("glyphicon glyphicon-collapse-down").addClass("glyphicon glyphicon-collapse-up");
                    else
                         span.removeClass("glyphicon glyphicon-collapse-up").addClass("glyphicon glyphicon-collapse-down");
                
                    var tr = $(this.parentNode.parentNode);
                    if(typeof tr.attr("extrarow") === ud ) {
                
                            tr.attr("extrarow","1");
                            tr.after("<tr class='trOpen extraRow " + tr.attr("class") + "'> <td colspan='" + tr.find("td").length + "'> "  + o.onInit(obj) +  " </td></tr>");
                            o.onAfterInit(tr.next());
                            
                    }else{
                       // contentFunc(obj); 
                        var trNext = tr.next();
                        if(trNext.attr("class").indexOf("trOpen")>-1) 
                            trNext.removeClass("trOpen").addClass("trClose");
                        else
                            trNext.removeClass("trClose").addClass("trOpen");
                    }
                   
                });
                
                return this;
            };
            $.fn.fillSelect         = function(o){
                var $ddl = this;
                if(typeof o.isRequired ===ud )  o.isRequired = false;
                if(typeof o.required !==ud )  o.isRequired = o.required;
                if(typeof o.selectedValue ===ud)  o.selectedValue="";
                this.clearSelect();
                
               if(o.isRequired===false){
                   $ddl.append('<option></option>');
               }
               $.each(o.data, function(index, optionData) {
                    var _value2 = (typeof this.value2===ud ? "": " value2=\"" +  this.value2 + "\"");
                    var _text ="",_value = "";
                    if(typeof o.text !== ud && typeof o.value !== ud ){
                        _value = this[o.value];
                        _text = this[o.text];            
                    }else{
                        _value = this.value;
                        _text = this.text;
                    }
                    
                    $ddl.append("<option " + _value2 + " value=\""  + _value +  "\">"  + _text + " </option>");
               }); 
               $(this).change(function(){ 
                    var _$self =  $(this);
                    if( ! isUD(o.onChange) ){ 
                        _$self.__onChange = o.onChange;   
                        _$self.__onChange({
                                 index : $(this).find(":selected").index() 
                                ,data  : o.data
                                //,object   :  $(this)
                                ,row :  $(this).closest(".zRow")
                        });
                   }
               })
                   
               setTimeout(function(){              
                    $.each($ddl,function(){
                        var _$ddl = $(this);
                        var _selectedValue  = _$ddl.attr("selectedvalue");
                        $.each($(this).find("option"),function(){
                            var _r=false;
                            if(_selectedValue)
                                _r=(this.value === _selectedValue); 
                            else
                                _r=(this.value === o.selectedValue); 
                            if(_r) $(this).prop("selected",true);            
                        });
                        
                        if(o.onEachComplete) {
                            _$ddl.bind("onEachComplete", o.onEachComplete);
                            _$ddl.trigger("onEachComplete",o.data);
                        }
                            
                    }); 
                    if(o.onComplete) {
                        $ddl.__onComplete = o.onComplete; 
                        $ddl.__onComplete(o.data);
                    }
                    
               }, 10);   
               return this;
            };
            $.fn.getCheckBoxesValues= function(){
                var _a = arguments;
                var _sel = ( _a.length > 0 ? _a[0] : "input[type=hidden]" );                 
                var _r = [];
                if(this){
                    $.each(this,function(){
                        _r.push( $(this.parentNode).children(_sel).val() );
                    });
                }
                return _r;    
            };            
            $.fn.getCssTransformValue = function(){
                var _t = this.css('transform');
                var _v = [];
                if(_t != "none"){
                    _v = _t.split('(')[1];
                    _v = _v.split(')')[0];
                    _v = _v.split(',');
                }
                return _v;
            }
            $.fn.jsonSubmit         = function(o) {
                var _param;
               if( typeof o.isSingleEntry != ud && o.isSingleEntry===true ){ 
                    var _arr = this.serializeArray();
                    o.parameters = {};
                    for (var x = 0; x < _arr.length; x++) {
                        o.parameters[_arr[x].name]=_arr[x].value;
                    }
                    _param=o;
                }
                else {
                    _param = this.hasClass("zGrid") > 0 ? this.toJSON2(o) :this.toJSON(o);
                }
                var p = {
                    type: 'POST'
                  , url: (typeof o.url!==ud?o.url:base_url + "data/update")
                  , data: JSON.stringify( _param)
                  , contentType: 'application/json'
                };
            
                if (typeof o.onError !== 'undefined') p.error = o.onError;
                if (typeof o.onComplete !== 'undefined') p.success = o.onComplete;
                $.ajax(p);
            };
            $.fn.loadTable          = function(o) {
                var __obj   = this;
                this.setPageCtrl = function(o,data){
                    var _self = $(this);
                    var _$pageNo;
                  
                    var _createPageList = function(_rows,_pages){
                        var opt ="";
                        for(var x=1;x<=_pages;x++){
                            opt += "<option value='" + x + "'>" + x + "</option>";
                        }
                        _$pageNo = _self.find("#pageNo").html(opt);
                        _self.find("#recordsNum").html(_rows.length);
                        _self.find("#of").html("of " + _pages);
                    };
                    
                    _createPageList(data.rows,data.returnValue);
                     
                    _$pageNo.change(function(){
                         o.parameters.pno = this.value;
                        _obj.loadTable(_obj.params);
                    });
                    
                    _self.find("#rpp").keyup(function(e){
                        var k = (e.keyCode ? e.keyCode : e.which);
                    	if(k == '13'){
                            o.parameters.rpp = this.value;
                            _obj.params.callBack = function(o){
                                _createPageList(o.data.rows,o.data.returnValue);
                                _obj.params.callBack = null;
                            };
                            _obj.loadTable(_obj.params);
                    	}
                    });                     
                }

                if ( ! __obj.length) { console.error("Target not found."); return false; }
                if ( ! __obj.parent().hasClass("zTable")) { console.error("zTable div parent is not found."); return false; }
                
                __obj.onComplete = o.onComplete;
                var isOnEC  = ( ! isUD(o.onEachComplete));
                if (isOnEC){    
                    var _strFunc = o.onEachComplete.toString();
                    var _args = _strFunc
                    .replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s))/mg,'')
                    .match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m)[1]
                    .split(/,/);
                    if (_args.length < 1) console.warn("You must implement these parameters: tr,data");
                }
                
                if ( ! __obj.find("thead").length) __obj.append("<thead/>"); 
                if ( ! __obj.find("tbody").length) __obj.append("<tbody/>"); 
                
                // Initialize object parameters
                var width           = o.width
                    ,height         = o.height
                    ,dataRows       = o.dataRows
                    ,dRowsLength    = dataRows.length
                    ,blankRowsLimit = o.blankRowsLimit
                
                // Initialize DOM objects
                    ,$ztable        = __obj.closest(".zTable")
                    ,$thead         = __obj.find("thead")
                    ,$ths           = $thead.find("th")
                    ,$tbody         = __obj.find("tbody")
                
                // Initialize variables 
                    ,tw             = new zsi.easyJsTemplateWriter()
                    ,bs             = zsi.bs.ctrl
                    ,svn            = zsi.setValIfNull
                ;
                
                // Set table width and height
                $ztable.css({
                    width : width
                    ,height : height
                });
                
                // Create table headers
                if ($ths.length === 0) {
                    tw.tr().in();
                    for (var i = 0; i < dRowsLength; i++) {
                        var _dr = dataRows[i];
                        tw.th({ 
                            value : _dr.text 
                            ,style : _dr.style + "min-width:" + _dr.width + "px;width:" + _dr.width + "px;"
                        });
                    }
                    $thead.html(tw.html());   
                    $ths = $thead.find("th");
                }
                
                if(typeof o.sortIndexes !== ud && typeof this.isInitiated === ud){    
                    // Add sorting functions
                    var indexes     = o.sortIndexes
                        ,arrowUp    = "<span class='arrow-up'></span>"
                        ,arrowDown  = "<span class='arrow-down'></span>"
                        ,arrows     = arrowUp + arrowDown
                    ;
                    
                    for (var x = 0; x < indexes.length; x++) {
                        $($ths[indexes[x]]).append(
                            tw.new().span({ class : "zSort" })
                            .in().a({ href : "javascript:void(0);" })
                            .in().span({ class : "sPane" , value : arrows }).html()
                        );
                    }
                    
                    var aObj    = __obj.find(".zSort a");
                    var url     = o.url; 
                    
                    aObj.click(function() {
                       if (typeof  o.parameters  === ud)   o.parameters = {};  
                        var _$self  = $(this);
                        var i       = aObj.index(this);
                        var _colNo = indexes[i];

                        $(".sPane").html(arrows);
                        
                        var className = _$self.attr("class");
                        
                        if (typeof className === ud) { 
                            aObj.removeAttr("class");
                            _$self.addClass("asc").find(".sPane").html(arrowUp);
                        } else {
                            if (className.indexOf("asc") > -1) {
                                _$self.removeClass("asc").addClass("desc").find(".sPane").html(arrowDown);
                                o.parameters.order_no = 1;
                            } else {
                                _$self.removeClass("desc").addClass("asc").find(".sPane").html(arrowUp);
                                o.parameters.order_no = 0;
                            }
                        }
                        o.parameters.col_no = _colNo;
                        o.parameters.order_no=_orderNo;
                        __obj.loadTable(o);
                    });
                    
                    this.isInitiated = true;
                }
                
                // Create table data
                var createTr = function(data) {
                    tw.new().tr().in()
                    .custom(function() {
                        for (var i = 0; i < dRowsLength; i++) {
                            var _info = dataRows[i];
                            var _td = {
                                style : _info.style + "min-width:" + _info.width + "px;width:" + _info.width + "px;"
                                ,attr : 'colindex="' + i + '"'
                            };
                            
                            if ( ! isUD(_info.attr)) _td.attr += _info.attr;
                            if ( ! isUD(_info.class)) _td.class = _info.class;
                            if (_info.onRender) {
                                _td.value = _info.onRender(data);
                            } else {
                                if (isUD(_info.type)) {
                                    _td.value = data[_info.name];
                                } else {
                                    if ( ! isUD(_info.displayText)) {
                                        _td.value = bs({ name        : _info.name  
                                                        ,style       : _info.style 
                                                        ,type        : _info.type  
                                                        ,value       : svn(data , _info.name , _info.defaultValue) 
                                                        ,displayText : svn(data , _info.displayText) 
                                                    });
                                    } else {
                                        _td.value = bs({name : _info.name , style : _info.style , type : _info.type , value : svn(data , _info.name , _info.defaultValue )});
                                    }
                                }
                                 
                                if (i === 0 || i === o.selectorIndex) {
                                    if ( ! isUD(o.selectorType)) {
                                        _td.value += (data !== null ? bs({name: (o.selectorType==="checkbox" ? "cb" : (o.selectorType==="radio" ? "rad" : "ctrl" )),type:o.selectorType}) : "" );
                                    }
                                }
                            }
                            this.td(_td);
                        }
                        return this;
                    });
                    
                    $tbody.append(tw.html());
                    if (isOnEC) {
                        o.onEachComplete($tbody.find("tr:last-child"),data);
                    }
                };
                
                if (typeof o.isNew !== ud) { if (o.isNew == true) __obj.clearGrid(); } 
                __obj.children("tbody").html("");
                
                if (o.url || o.data) {
                    if ($thead.length > 0) __obj.clearGrid(); 
                    var params = {
                        dataType : "json"
                        ,cache : false
                        ,success : function(data) {
                            var _num_rows = data.rows.length;
                            var _$recordsNum = __obj.find("#recordsNum");
                            
                            if (dRowsLength) {
                                $.each(data.rows, function() {
                                    createTr(this);
                                });
                            }
                            
                            // Set pagination
                            if (_$recordsNum.length) {
                                _obj.find("#recordsNum").html(num_rows);
                                 if(typeof _obj.isPageInitiated === ud){
                                    _obj.setPageCtrl(o,data);
                                    _obj.isPageInitiated=true;
                                 }
                                
                            }

                            if ( ! isUD(__obj.onComplete)) __obj.onComplete({params:o,data:data});
                            __obj.addScrollbar(o); // This must be after onComplete()
                        }          
                    };
                    
                    if (typeof o.data !== ud) {
                        if(typeof zsi.config.getDataURL === ud) {
                            alert("zsi.config.getDataURL is not defined in AppStart JS.");
                            return;
                        }
                        params.url = zsi.config.getDataURL;
                        params.data = JSON.stringify(o.data);
                        params.type = "POST";
                    } else params.url = o.url;
            
                    __obj.bind('refresh', function() {
                        if (zsi.tmr) clearTimeout(zsi.tmr);
                        zsi.tmr = setTimeout(function() {
                            __obj.loadTable(o);
                        }, 1);   
                    });
                    
                    $.ajax(params);
                } else if (o.rows.length && dRowsLength) {
                    $.each(o.rows, function() {
                        createTr(this);
                    });
                    
                    if ( ! isUD(__obj.onComplete)) __obj.onComplete({params:o,data:o});
                    __obj.addScrollbar(o); // This must be after onComplete()
                }
                return __obj;
            };
            $.fn.resetDragScroll    = function() {
                var _$imagePanel    = $(this);
                var _$zoomPanel     = _$imagePanel.find(".zoomPanel");
                var _$img           = _$imagePanel.find("img");
                
                var _scale = Math.min(_$imagePanel.width() / _$img.width(), _$imagePanel.height() / _$img.height());
                _$zoomPanel.css({ "transform" : "scale(" + _scale + ")" });
                _$imagePanel.scrollTop(0).scrollLeft(0);
            };
            $.fn.rowColSpan         = function(o){
                var _$tbl           = this
                    ,_$thead        = _$tbl.children("thead")
                    ,_$tbody        = _$tbl.children("tbody")
                    ,_cls           = "hasDuplicate"
                    ,_cls2          = "toBeRemove"
                    ,_isAllCols     = ( ! isUD(o.columns) ? false : true )
                    
                    ,_isGroupBy     = ( ! isUD(o.groupBy) ? true : false )
                    ,_colIndex      = (_isGroupBy ? o.groupBy.columnIndex : null )
                    ,_notInclude    = (_isGroupBy ? o.groupBy.notInclude : null )
                    ,_targets       = (_isGroupBy ? o.groupBy.targets : null )
                ;
                
                // To get number of columns in a row
                var _totalColumns = 0;
                _$thead.find("tr:first-child th").each(function() {
                    var colspan = $(this).attr("colspan");
                    if ( ! isUD(colspan)) { _totalColumns += parseInt(colspan, 10); }
                    else { _totalColumns++; }
                });
                
                var _markElements = function(els,spanType) {
                    //create list of elements
                    var list        = [];
                    var lastEl      = null;
                    var lastRefText = null;
                    var lastElExist = null; // For span with group by
                    var lastElExist2 = null; // For regular span
                    
                    loopEls : 
                    for (var x = 0; x < els.length; x++) {
                        var curEl       = els[x];
                        var $culEl      = $(curEl);
                        var isNotInclude = false;
                        
                        if (_isGroupBy) {
                            // Check if the current column is the same as notInclude array
                            loopNotInclude : 
                            for (var i = 0; i < _notInclude.length; i++) {
                                var _index = _notInclude[i];
                                if ($culEl.index() === _index) {
                                    isNotInclude = true;
                                    break loopNotInclude;
                                }
                            }
                            // If element is the same index of columnIndex parameter
                            if ($culEl.index() === _colIndex) isNotInclude;
                        }
                        
                        if ( ! isNotInclude && _isGroupBy) {
                            var $siblings   = $culEl.parent().find("td");
                            var curRefText  = $siblings[_colIndex].innerText;
                            var searchKey   = (lastElExist !== null) ? lastElExist : curEl;
                            var indexes     = list.findIndexes({ keyName:"key" , value:searchKey });
                            
                            if (lastRefText !== curRefText) {
                                lastElExist = curEl;
                                list.push({ key:curEl , items:[curEl] });
                            } else {
                                var _i      = indexes[0];
                                var item    = list[_i];
                                var isTarget = false;
                                
                                loopTargets : 
                                for (var i = 0; i < _targets.length; i++) {
                                    var _index = _targets[i];
                                    if ($culEl.index() === _index) {
                                        isTarget = true;
                                        break loopTargets;
                                    }
                                }
                                
                                if (isTarget) {
                                    lastElExist = curEl;
                                    list.push({ key:curEl , items:[curEl] });
                                } else {
                                    item.items.push(curEl);
                                }
                            }
                            
                            lastRefText = curRefText;
                        } else {
                            var nextEl      = els[x + 1];
                            var curVsNext   = (nextEl ? (curEl.innerText == nextEl.innerText? true : false ) : false); // Applicable to 1st row until 2nd to the last row
                            var curVsLast   = (lastEl ? (curEl.innerText == lastEl.innerText? true : false ) : false); // Applicable to last row until 2nd row
                            
                            if (curVsNext || curVsLast) {
                                var searchKey = lastElExist2;
                                if (lastElExist2 === null || (curVsNext && ! curVsLast)) {
                                    searchKey = curEl;
                                }
                                
                                var indexes = list.findIndexes({ keyName:"key" , value:searchKey });
                                if (indexes.length === 0) {
                                    // If curEl is not found in the list add it to list array
                                    lastElExist2 = curEl;
                                    list.push({ key:curEl , items:[curEl] });
                                } else {
                                    // Else use the found index and push the current found element
                                    var _i      = indexes[0];
                                    var item    = list[_i];
                                    item.items.push(curEl);
                                }
                            } else {
                                lastElExist2 = null;
                            }
                            
                            lastEl = curEl;    
                        }
                    }
                    
                    //add class, add rowspan on 1st found element.
                    $.each(list, function(i) {
                        var attr = {};
                        var items = this.items;
                        attr[spanType] = items.length;
                        $(items[0]).addClass(_cls).attr(attr);
                        
                        //start tagging elements - to be remove.
                        $.each(items, function(i) {
                            if ( ! $(this).hasClass(_cls) ) {
                                $(this).addClass(_cls2);
                            }
                        });
                    });
                };
                
                //rowspan
                if (o.type=="row") {
                    for (var i = 0; i < (_isAllCols ? _totalColumns : o.columns.length); i++) {
                        var index = (_isAllCols) ? i : o.columns[i];
                        var colElements = [];
                        
                        $.each(_$tbl.find("tbody > tr"), function() {
                            var $self = $(this);
                            var trCellLength = $self.find("td").length;
                            var extraCells = _totalColumns - trCellLength;
                            
                            colElements.push( $self.find("td").get(index - extraCells) );
                        });
                        _markElements(colElements,"rowspan");
                    }
                }
                
                //colspan
                if(o.type=="column"){
                    $.each(_$tbl.find("tr"),function(i){
                        var _$tr=$(this);
                        
                        if(_isAllCols) 
                            _markElements(_$tr.find("td"),"colspan");
                        else{
                            var _$arr=$([]);
                            $.each(o.columns,function(i){
                                _$arr.push(_$tr.find("td")[this]);
                            });
                            _markElements(_$arr,"colspan");
                        }
                    });
                }
                
                //remove elements.
                _$tbl.find("." + _cls2).remove();
            };
            $.fn.serializeExclude   = function(p_arr_exclude) {
              var _arr =  this.serializeArray();
               var str = '';
               $.each(_arr, function(i,data){
                  if ($.inArray(data['name'].toLowerCase(), p_arr_exclude)==-1) {
                     str += (str == '') ? data['name'] + '=' + data['value'] : '&' + data['name'] + '=' + data['value'];
                  }
               });
               return str;  
            };
            $.fn.setEventOnTRClickForSelection = function(tdIndex){
               this.find("tbody  > tr > td:not(:nth-child(1))").each(function(){
                  var tr = this.parentNode;
                  var box = $(tr).css("cursor","pointer").find("input[type='radio'],input[type='checkbox']");
                  this.onclick =function(){
                    if(box.attr("type") ==="checkbox" )
                        box.prop("checked", !box.prop("checked") );
                    else
                        box.prop("checked", true );
                    box.change();
                  };
              });   
            };    
            $.fn.setCheckEvent      = function(selector) {
                var o = this;
                if(o.length===0){
                    console.log(o.selector + " not found.");        
                    return;
                }
                
                var cb;
                if(typeof selector!==ud)
                    cb = $(selector);
                else    
                    cb=this.parent().parent().parent().parent().find("input[name='cb']");
            
                this.prop('checked',false);    
                
                o.change(function(){
                    if(this.checked)
                        cb.prop('checked',true).change();
                    else        
                        cb.prop('checked',false).change();
                });
            
                if( cb.length > 0 ) {
                    var checkAll = function(){
                         var countEmpty=0;
                         cb.each(function(){
                            if(!this.checked) countEmpty++;   
                         });
                         if(countEmpty===0) o.prop('checked',true);        
                    }
                        cb.change(function(){
                            if(this.checked===false) 
                                o.prop('checked',false);
                            else  
                                checkAll();
                        });
                    checkAll();
                }
            };
            $.fn.setCloseModalConfirm=function(){
                var event = $._data(this.get(0), 'events' ); 
                if(typeof event === ud || typeof event.hide ===ud){ //check if event functions exists.
                    this.on("hide.bs.modal", function (e) {
                        if( e.target.tagName.toUpperCase() !== "INPUT" ) {
                            if (confirm("You are about to close this window. Continue?")) {
                                return true;
                            }
                        }
                        return false;
                    });
                }
            };
            $.fn.setIdIfChecked     = function(id,primaryId){
                 $(this).find("input[name='cb']").change(function(){
                        var td  = this.parentNode;
                        var obj = $(td).find("#" + primaryId);
                        if(this.checked) 
                            obj.val(id);
                        else
                            obj.val('');
                });
            };
            $.fn.setUniqueOptions   = function(){
                var optionData=[];
                var obj = this;
                var options = $(obj).children("option");
                //functions
                var addSelectedData=function(o,data){
                    var isFound=false;
                    for(var x=0;x<data.length;x++){
                        if(data[x].value==o.value) {
                            isFound=true; 
                            break;
                        }
                    }
                    if(isFound===false){
                        data.push({value:o.value, text:o.text});
                    }
                }
                var getSelectedData=function(){
                    selectedData=[];
            
                   obj.each(function(){
                        if(this.value!=="")  {
                            addSelectedData({value:this.value, text:this.options[this.selectedIndex].text },selectedData);                
                        }
                    });
                    return selectedData;
                }
                var fillUnselectedData=function(selectedData){
                    var newData=[];
                    for(var x=0;x<optionData.length;x++){
                        var isFound=false;
                        for(var i=0;i<selectedData.length;i++){
                            if(optionData[x].value===selectedData[i].value) {
                                isFound=true;
                                break;
                            }  
                        }
                       if(isFound===false) addSelectedData(optionData[x],newData);
                    }
                    
                    obj.each(function(){
                        var ddl = this;
                        if(this.value===""){
                            $(this).clearSelect(); 
                             this.add(new Option("", ""), null);
                             $.each(newData, function() {
                                var l_option = new Option(unescape(this.text), this.value);
                                ddl.add(l_option, null);
                            });
                        }else{
                            //set new data
                            var selOpt = {value:this.value, text: this.options[this.selectedIndex].text};
                             $(this).clearSelect(); 
                             ddl.add(new Option("",""), null);
                             ddl.add(new Option(selOpt.text,selOpt.value), null);
                             $.each(newData, function() {
                                var l_option = new Option(unescape(this.text), this.value);
                                ddl.add(l_option, null);
                            });
                            $(this).val(selOpt.value);
                          
                        }
                    });
                     
                }
                
                options.each(function(){
                    if(this.value!=="") optionData.push({value :this.value, text: this.innerHTML});
                });
                
                this.change(function(){
                    fire();
                });
                function fire(){
                    var data = getSelectedData();
                    fillUnselectedData(data);
                }
                fire();
                return this;
            };
            $.fn.showAlert          = function(o){   
                    var _self = this;         
                    var _time = 1500;
                    _self.show();       
                    if( ! isUD(o) ){ 
                    if( o.top ) _self.css({left:o.left,top:o.top });
                    if( o.center ) _self.center();
                    if( o.time ) _time = o.time;
                    }
                    setTimeout(function(){
                       _self.hide("slow");
                       if( ! isUD(o.onHide) ) o.onHide();
                    }, _time);

            };
            $.fn.showPopup          = function(o){
                var _id;
                if ( isUD(o.id) ){ 
                    _id =  this.data("ctr") + 1 || 1 ;
                    this.data("ctr",_id);
                }
                else _id =  o.id;
                var _name = "popup" + _id;
                var _pId = "#" + _name;
            
                this.find(_pId).remove();
                this.append('<div id="' + _name + '" class="zPopup overlay" style="width:' + o.width + ';height:' + o.height + '">'
                                	+ '<div class="panel">'
                                	+   '<div class="header">'
                                    +		'<h2>'  + (o.title ? o.title :"")  + '</h2>'
                                    +		'<a class="close" href="javascript:void(0);" id="close">&times;</a>'
                                	+	'</div>'
                                	+	'<div class="content"><div class="body">' + o.body + '</div></div>'
                                	+ '</div>'
                                    +'</div>');
            
                $p = this.find(_pId);
                if( ! isUD(o.isAddCover) && o.isAddCover === true ) $p.addCover();
                $p.css({
                     "visibility"   : "visible"
                    ,"opacity"      : 1
                    ,"z-index"      : zsi.getHighestZindex() + 1
                });   
            
                $p.find("#close").click(function(e){
                    $(this).closest(".zPopup").remove();
                    if(typeof o.onClose !== ud ) o.onClose(this,o);
                });
                return this;
            };
            $.fn.showWaitingBox     = function(o) {
                o = o || {};
                var _$self = this;
                var _name = "_waitingBox";
                var _id = _$self.attr("id") + _name;
                var _$doc = $("body");
                var _wb = $("#" + _id);
                
                $.fn.hideWaitingBox = function() {
                    var _$self = this;
                    var _id = _$self.attr("id") + _name;
                    var _wb = $("#" + _id);
                    if(_wb.length > 0 ) _wb.hide();
                };
                var _rect = _$self.get(0).getBoundingClientRect();
                if ( _wb.length > 0) _wb.show();
                else{
                    var _html = new zsi.easyJsTemplateWriter()
                                .div({
                                     id     : _id
                                    ,class  : "waitingBox"
                                    ,style  : "display:block;"
                                            + "line-height:" + (o.height ? o.height : _rect.height) + "px;"
                                            + "height:" + (o.height ?  o.height : _rect.height) + "px;" 
                                            + "width:"  + (o.width ? o.width : _rect.width)  + "px;" 
                                            + "top:"    + (o.top ? o.top : _rect.top) +   "px;"
                                            + "left:"    + (o.left ? o.left : _rect.left) +   "px;"
                                            + "z-index: " + (zsi.getHighestZindex() + 1)
                                    }
                                )
                                    .in()
                                    .div({class:"label"})
                                        .in()
                                        .div({class:"img"})
                                        .div({class:"text",value: (o.text ? o.text : "loading..." ) })
                                .html();
                    
                    _wb = $(_html);
                    _$doc.append(_wb);
               }
            };
            $.fn.toJSON             = function(o) { //for multiple data only
                            console.log("toJSON");

                if (typeof o === ud) o={};
                var isExistOptionalItems = function (o, name) {
                    if (typeof o.optionalItems !== ud) {
                        if (o.optionalItems.indexOf(name) !== -1) return true;
                    }
                    return false;
                }
                
                var  evalCountArr = function(arr){
                    var arrNames = [];
                    alert("insufficient parameters.");
                    $.each(arr, function(){
                          if ( ! arrNames.isExists( {keyName:"name", value: this.name }) )
                                arrNames.push({name:this.name});
                    } );    
                    
                    console.log("parameters found: " + arrNames.length);
                    $.each(arrNames, function(){
                          var indexes =  arr.findIndexes( {keyName:"name", value: this.name });
                          console.log( this.name  + ":" + indexes.length);
                    } );
                
                }
                
                var arr = this.find('input, textarea, select').not(':checkbox').not((typeof o.notInclude !== ud?o.notInclude:"")).serializeArray();
                var json = [];
                var ctr = 0;
                //get objectNames
                var objNames = [];
                for (var x = 0; x < arr.length; x++) {
                    if (objNames.indexOf(arr[x].name) == -1) objNames.push(arr[x].name);
                }
                //start creating json
                for (x = 0; x < arr.length; x++) {
                    var item = {};
                    var isEmptyRows = [];
                    for (var y = 0; y < objNames.length; y++) {
                        var obj = arr[x + y];
                        if (typeof obj === ud) {
                            evalCountArr(arr);
                        }
                        var pName = arr[x + y].name;
                        item[pName] = arr[x + y].value || null;
                        if (!isExistOptionalItems(o, pName))
                            isEmptyRows.push(arr[x + y].value === "");
                    }
                    //detect empty rows
                    var countEmpty = 0;
                    for (var i = 0; i < isEmptyRows.length; i++) {
                        if (isEmptyRows[i]) countEmpty++;
                    }
                    if (countEmpty !== isEmptyRows.length)
                        json.push(item);
            
                    x = x + (objNames.length - 1);
                }
                if(typeof o.procedure !==ud) json={procedure: o.procedure, rows: json}; 
                if(typeof o.sqlCode !==ud) json={sqlCode: o.sqlCode, rows: json}; 
                return json;
            };
            $.fn.toJSON2            = function(o) { //for multiple data only
                if (typeof o === ud) o={};
                var isExistOptionalItems = function (o, name) {
                    if (typeof o.optionalItems !== ud) {
                        if (o.optionalItems.indexOf(name) !== -1) return true;
                    }
                    return false;
                }                
                var json = [];
                var ctr = 0;
                var _obj =this;
                $.each( this.find(".right .zRow"),function(i){
                    var $rowRight  =  $(this);
                    var $rowLeft = _obj.find(".left .zRow:eq(" + i + ")");
                    var arrLeft = $rowLeft.find('input, textarea, select').not(':checkbox').not((typeof o.notInclude !== ud?o.notInclude:"")).serializeArray();
                    var arrRight = $rowRight.find('input, textarea, select').not(':checkbox').not((typeof o.notInclude !== ud?o.notInclude:"")).serializeArray();
                    var info = {};
                    $.each(arrLeft,function(){
                        info[this.name] = (this.value ===""? null: this.value);
                    });
                    $.each(arrRight,function(){
                        info[this.name]= (this.value ===""? null: this.value);
                    });
                    if(Object.keys(info).length > 0 ) json.push(info);
                });
    
                //check error
                var _properties     = Object.keys(json[0]);
                var _brProperties   = Object.keys(json[json.length-1]);
                if(_properties.length!==_brProperties.length){
                    var _notExistInBlankRows = [],_notExistInRows=[];
                    console.log("Count Properties( Upper Bound Rows = " + _properties.length +  " : Lower Bound Rows = " + _brProperties.length + ")"  );
                    for(var x=0;x<_brProperties.length;x++){
                        if(_properties.indexOf(_brProperties[x]) < 0) _notExistInRows.push( _brProperties[x]);
                    };
                    for(var x=0;x<_properties.length;x++){
                        if(_brProperties.indexOf(_properties[x]) < 0) _notExistInBlankRows.push( _properties[x]);
                    };
                    if(_notExistInRows.length > 0)          console.log({notExistInRows     :_notExistInRows});
                    if(_notExistInBlankRows.length > 0 )    console.log({notExistInBlankRows:_notExistInBlankRows});
                }//end check error

                //exclude empty data 
                var _keys = Object.keys(json[0]);
                var _finalData = [];
                $.each(json,function(){
                    var info = this;
                    var ctr = 0;
                    for(var i=0;i < _keys.length;i++){
                         if (!isExistOptionalItems(o,  _keys[i])){    
                           if(info[_keys[i]]=== null  || info[_keys[i]]=== "") ctr +=1;
                         }
                    }
                    if(ctr!== (_keys.length -  (typeof o.optionalItems !== ud ? o.optionalItems.length : 0))) _finalData.push(this);
                });
                json=_finalData;
                if(typeof o.procedure !==ud) json = {procedure: o.procedure, rows: json}; 
                if(typeof o.sqlCode !==ud) json = {sqlCode: o.sqlCode, rows: json}; 
                if(typeof o.parentId !==ud) json.parentId= o.parentId
                return json;
            };              
        }            
        ,__setPrototypes            : function(){
            //note: date prototype has a problem in Google Chrome.
            String.prototype.isValidDate = function () {
                return isValidDate(this)
            };  
            String.prototype.toShortDate = function () {
                if(!isValidDate(this)) return "";
                var _date=new Date( Date.parse(this) );
                var m =  (_date.getMonth()+1) + "";
                var d = _date.getDate() + "";
                m = (m.length==1? "0"+m:m);
                d = (d.length==1? "0" +d:d);
                return m + '/' + d + '/' +  _date.getFullYear();
            };  
            String.prototype.toShortDateTime = function () {
              if(!isValidDate(this)) return "";
              var _date=new Date( Date.parse(this) );
              var h = _date.getHours();
              var m = _date.getMinutes();
              var ampm = h >= 12 ? 'PM' : 'AM';
              h = h % 12;
              h = h ? h : 12; // the hour '0' should be '12'
              m = m < 10 ? '0'+m : m;
              var strTime = h + ':' + m + ' ' + ampm;
              return _date.getMonth()+1 + "/" + _date.getDate() + "/" + _date.getFullYear() + " " + strTime;
            };
            String.prototype.toDateFormat = function () {
                return this.toShortDate();
            };
            //military date time format
            String.prototype.toMDateTimeFormat = function () {
                var ts=Date.parse(this);
                if(isNaN(ts)!==false) return "";
                var d  = new Date(ts)   
                var digit = function(n){
                    return n > 9 ? "" + n : "0" + n;
                }
                return  this.toShortDate() + " " + digit(d.getHours()) + ":" + digit(d.getMinutes()) + ":" + digit(d.getSeconds());
            }; 
            String.prototype.toMoney = function(){
                var res = "";
                if(isNaN(this)===false) res = parseFloat(this).toMoney();
                return res;
            };
            String.prototype.toJSON = function(){
                var ret = null;
                if(this !=="") ret= $.parseJSON(this);
                return ret; 
            };
            String.prototype.nl2br = function(){
                return this.replace(/\n/g, "<br />");
            };
            //Array Prototypes : 
            Array.prototype.findIndexes = function(o){
                var r =[];
                $.each(this,function(i) {
                      if ( this[o.keyName] === o.value ) {
                          r.push(i);
                          return true;
                      }
                });
                return r;
            };
            Array.prototype.groupBy = function(colNames){
                var _groups = [];
                var _setItem = function(name,value){
                     var _r=null;
                        $.each(_groups, function() { 
                            if(this.name === name) {
                                _r=this;
                                return false; 
                            }
                        });
                    if(_r){
                        _r.items.push(value);
                    }
                    else{
                        var _item = {name:name,items:[]};
                        _item.items.push(value);
                         _groups.push(_item);
                    }
                };
                
                $.each(this,function(){
                    var _self = this;
                    var _group ="";
                    $.each(colNames,function(){
                        if(_group !=="") _group += "_";
                        _group +=_self[this];
                    });
                    _setItem(_group,this);
                });
                return _groups;
            };
            Array.prototype.isExists = function(o){
                var r =false;
                $.each(this,function(){
                     if ( this[o.keyName] === o.value ) {
                         r = true;
                         return false;
                     }
                });
                return r;
            };
            Array.prototype.createNewCopy = function(){
                return $.extend(true,{}, this);
            };
            Array.prototype.removeAttr = function(name){
                    $.each(this,function(){
                        delete this[name]; 
                    });
                
            };
            //Number Prototypes : 
            Number.prototype.toMoney = function(){
                return this.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
            };
       }
        ,bs                         : {
             ctrl                   : function(o){
                var l_tag="input";
                var l_id = (typeof o.id !== ud ? o.id : o.name);
                var l_name =' name="' + o.name + '" id="' + l_id + '"';
            
                var l_type          = ' type="text"';
                var l_class         = ' class="form-control '  +  (typeof o.class!==ud ? o.class : '') + '" ';
                var l_endTag        ="";
                var l_value         ="";
                var l_in_value      ="";
                var l_selected_value="";
                var l_checked       ="";
                var l_style= (typeof o.style===ud?"":" style=\"" + o.style + "\"");
            
                var yesno = function(p){
                    var v ='N';
                    var str ='';
                    var cls = 'class="form-control"';
                    
                    if (typeof p.class !==ud) cls = 'class="' + p.class + '"';
                    str +='<select name="' + p.name + '" id="' + p.name + '" ' + cls +   '>';
                    if (typeof p.value !==ud) v = p.value;
                    if(typeof p.mandatory !==ud){
                        if(p.mandatory.toLowerCase()=='n') str += '<option value=""></option>';
                    }
                    str += '<option ' + (v=='Y' ? 'selected':'' ) +  ' value="Y">Yes</option>';
                    str += '<option ' + ( (v=='N' || v=='')  ? 'selected':'' ) +  ' value="N">No</option>';
                    str += '</select>';
                    return str;
                }    
            
                
                if(typeof o.value!==ud) l_value=' value="' + o.value + '"';
                if(typeof o.checked!==ud) {
                    if(o.checked) l_checked =' checked ';
                }
                
                
                if(typeof o.type!==ud){
                    var t = o.type.toLowerCase();
                    
                    if(t=='yesno') return yesno(o);
                    
                    if(t=='ddl') {
                        return "<input type='hidden' " + l_name + " " + l_value +  "><span id='text'>" + o.displayText + "</span> <div class='zDdlBtn' ><span class='caret'></span></div>";
                    }

                    
                    l_type=' type="' + o.type + '"';
            
                    if(t=="hidden") l_class='';
                    
                    if( ! (t=="hidden" || t=="input" || t=="checkbox" || t=="password"  || t=="email" || t=="radio") ) l_tag=t;        
                    
                    if(t=='select' || t =='textarea'){
                        l_type="";
                        l_endTag='</' + l_tag + '>';
                        if(t=='select'){
                            l_in_value ="<option></option>"
                            if(typeof o.value!==ud){
                                l_value="";
                                l_selected_value = (o.value !==""?" selectedvalue='" + o.value + "'" :"");
                            }
                        }
                        if(o.type =='textarea' && typeof o.value!==ud){
                            l_value="";
                            l_in_value=o.value;
                        }
                    }else if(t=="input") l_type=' type="text"';
                    
                }
               return '<' + l_tag + l_name + l_type + l_checked + l_class + l_value + l_selected_value + l_style +'>' + l_in_value + l_endTag;
            }    
            ,button                 : function(p){
                var l_icon ='';
                var l_class =' class="btn btn-primary btn-sm"';
                var l_type =' type="button"';
                var l_onclick='';
                
                if(typeof p.type !== ud) l_type = ' type="' + p.type + '"';
                if(typeof p.class !== ud) l_class = ' class="' + p.class + '"';
                if(typeof p.onclick !== ud) l_onclick = ' onclick="' + p.onclick + '"';
                switch(p.name.toLowerCase()){
                    case 'search': l_icon='search';break;
                    case 'add': 
                    case 'new': l_icon='plus-sign';break;
                    case 'delete': l_icon='trash';break;
                    case 'close': l_icon='off';break;
                    case 'save': l_icon='floppy-disk';break;
                    case 'reset': l_icon='retweet';break;
                    case 'login': l_icon='log-in';break;
                    default:break;
                }
                
                var l_span ='<span class="glyphicon glyphicon-' + l_icon + '"></span>';
                var result = '<button id="btn' + p.name + '" ' + l_class +  l_type + l_onclick + '>' + l_span + ' ' + p.text + '</button>';
                return result;
            }
        }
        ,collectData                : function(o){
            $.ajax({
                method : "POST"
                ,url : zsi.config.getDataURL 
                ,data :JSON.stringify(o )
                ,dataType : "json"
                ,success : o.onComplete
            });
        }     
        ,config                     : {}
        ,form                       : {
             __checkMandatory : function(oGroupN, oGroupT,groupIndex){
            var e = oGroupN.names;
            var d = oGroupT.titles;
            var l_irecords=[];
            var l_firstArrObj;
            
            zsi.form.__objMandatoryGroupIndexValues[groupIndex]="N";
               for(var x=0;x<e.length;x++){
                  var l_obj = document.getElementsByName(e[x]);
                 if(l_obj.length > 1){
                     /* collect row-index if the row has a value */
                     var l_index=0;
                     for(var i=0;i<l_obj.length;i++){
                        if(l_obj[i].type!="hidden"){
                           if(!l_firstArrObj) l_firstArrObj = l_obj[i];
                           if($.trim(l_obj[i].value)!=="") {
                             l_irecords[l_index]=i;
                             l_index++;
                             zsi.form.__objMandatoryGroupIndexValues[groupIndex]="Y";
                           }
                        }
                     }
            
                 }else{ /* single */
                     if(l_obj[0]){
                        if(l_obj[0].value===ud || $.trim(l_obj[0].value)===""){
                           l_obj[0].focus();
                           alert("Enter " + d[x] + ".");
                           return false;
                        }
                     }
                 }
            
               }
              /* multiple */
               if(oGroupN.type=="M"){
                  if(oGroupN.required_one){
                     if(oGroupN.required_one=="Y"){
                        if(l_irecords.length===0){
                           alert("Please enter at least 1 record.");
                           if(l_firstArrObj) l_firstArrObj.focus();
                           return false;
                        }
                     }
                  }
                  for(var x=0;x<e.length;x++){
                     var l_obj = document.getElementsByName(e[x]);
                     if(l_obj.length > 1){
                        //console.log(l_irecords.length);
                        for(var i=0;i<l_irecords.length;i++){
                           if(l_obj[l_irecords[i]].type!="hidden"){
                              if($.trim(l_obj[l_irecords[i]].value)==="") {
                                l_obj[l_irecords[i]].focus();
                                alert("Enter " + d[x] + ".");
                                return false;
                              }
                           }
                        }
                     }
                  }
               }
            
               return true;
             }
            ,__objMandatory:null
            ,__objMandatoryGroupIndexValues:[]
            ,checkNumber : function(e) {
               var keynum;
               var keychar;
               var numcheck;
               var allowedStr =''
            
               for (i=1;i<arguments.length;i++) {
                  allowedStr+=arguments[i];
               }
               if (window.event) {
                  //IE
                  keynum = e.keyCode;
               } else if (e.which) {
                  //Netscape,Firefox,Opera
                  keynum = e.which;
                  if (keynum==8) return true; //backspace
                  if (String.charCodeAt(keynum)=="91") return true;
               } else return true;
            
               keychar = String.fromCharCode(keynum);
            
               if (allowedStr.indexOf(keychar)!=-1) return true;
                  numcheck = /\d/;
                  return numcheck.test(keychar);
            }
            ,isValidNumberFormat : function(o) {
               var regex = /(?=.)^\$?(([1-9][0-9]{0,2}(,[0-9]{3})*)|[0-9]+)?(\.[0-9]{1,4})?$/;
               var val = o.value;
               if (val!=="") {
                  var ok = regex.test(val);
                   if (ok) 
                     return true;
                   else 
                     return false;
               }
            }
            ,checkNumberFormat : function(o){
               if(!zsi.form.isValidNumberFormat(o)){
                     alert("Please enter a valid number format.");
                     setTimeout(function(){o.focus()}, 0);
               }
            }
            ,checkMandatory : function(){
               var l_om = zsi.form.__objMandatory;
               if(typeof l_om === ud) return true;
               for(var x=0;x < l_om.groupNames.length;x++){  /*loop per group objects*/
                  if (!zsi.form.__checkMandatory( l_om.groupNames[x], l_om.groupTitles[x], x ))
                     return false;
               }
               /*check  required one indexes */
               if(l_om.required_one_indexes){
                  var roi=l_om.required_one_indexes;
                  var mgiv = zsi.form.__objMandatoryGroupIndexValues;
                  var countNoRecords=0;
                  for(var x=0;x < roi.length;x++){
                     for(var y=0;y < mgiv.length;y++){
                        if(roi[x]==y){
                           if(mgiv[y]=="N") countNoRecords++;
                        }
                     }
                  }
                  if(roi.length == countNoRecords){
                     alert("Please enter at least one record.");
                     return false;
                  }
               }
               return true;
            }
            ,markMandatory : function(om){
                //clear colored box;
                $("input,select,textarea").not("[type=hidden]").each(function(){
                  //  $(this).css("border","solid 1px #ccc");
                });
                zsi.form.__objMandatory=om;
                for(var x=0;x<om.groupNames.length;x++){
                   if(om.groupNames[x].names.length!=om.groupTitles[x].titles.length){
                      alert("Error!, parameters are not equal.");
                      return false;
                   }
                }
                var e;
            
               for(var gn=0;gn< om.groupNames.length;gn++){  /*loop per groupNames*/
                  e = om.groupNames[gn].names;
            
                  var border ="solid 1px #F3961C";
                  for(var x=0;x< e.length;x++){
                     var elements = document.getElementsByName(e[x]);
                     if(elements.length == 1){ /* single */
                        var o=$("#" + e[x]);
                         changeborder(o[0]);
                        o.on('change keyup blur', function() {
                           changeborder(this);
                        });
            
                     }else{ /* multiple */
                     $("*[name='" +  e[x] + "'][type!=hidden]").each(function(){
                         changeborder(this);
                        $(this).on('change keyup blur', function() {
                           if($(this).val()!=""){
                              $("*[name='" +  this.name + "'][type!=hidden]").each(function(){
                                 changeborder(this)
                              });
                           }
                           else{
                              /* check input elements if there's a value */
                              $("*[name='" +  this.name + "'][type!=hidden]").each(function(){
                                  changeborder(this);
                              });

                           }
                        });
            
                     });
            
                     }
                  }
               } /* end of group loop */
            
               function changeborder(o){
                  jo = $(o);
                  if(typeof jo.val() === ud || jo.val()===""){
                     jo.addClass("mandatory");
                  }else{
                     jo.removeClass("mandatory");
                  }
               }
            }
            ,checkDate : function(e, d){
             var l_format_msg=" must be in [mm/dd/yyyy] format.";
                for(var x=0;x<e.length;x++){
                   var l_obj = document.getElementsByName(e[x]);
            
                  if(l_obj.length > 1){
                      /* multiple */
                      var l_index=0;
                      for(var i=0;i<l_obj.length;i++){
                         if(l_obj[i].type!="hidden"){
                            if($.trim(l_obj[i].value)!=""){
                               if( isValidDate(l_obj[i].value)!=true){
                                  alert(d[x] + l_format_msg);
                                  l_obj[i].focus();
                                  return false;
                               }
                            }
                         }
                      }
            
                  }
                  else{ /* single */
                     if(l_obj[0]){
                        if($.trim(l_obj[0].value)!=""){
                           if( isValidDate(l_obj[0].value)!=true){
                             alert(d[x] + l_format_msg);
                             l_obj[0].focus();
                             return false;
                           }
                        }
                     }
            
                  }
            
                }
            
                return true;
              }
            ,setCriteria : function(p_inputName,p_desc, p_result){
               var input = $(p_inputName);
               if (input.prop("tagName")=="SELECT"){
                  if(input.find(":selected").text()){
                     if (p_result!="") p_result += ", ";
                     p_result += p_desc + ": " +  input.find(":selected").text();
                  }
               }
               else{
                  if(input.val()){
                     if (p_result!="") p_result += ", ";         
                     p_result += p_desc + ":" + input.val(); 
                  }
               }
               return p_result;
            }
            ,showAlert : function(p_class){   
               var box = $("." + p_class);         
               box.center();
               box.show();         
               setTimeout(function(){
                  box.hide("slow");
            
               }, 500);
            }
            ,deleteData : function (o) {
                var ids = "";
                var data = zsi.table.getCheckBoxesValues("input[name='cb']:checked");
                for (var x = 0; x < data.length; x++) {
                    if (ids !== "") ids += "/";
                    ids += data[x];
                }
                if (ids !== "") {
                    if (confirm("Are you sure you want to delete selected items?")) {
                        $.post(base_url + "sql/exec?p=deleteData @pkey_ids='" + ids + "',@table_code='" + o.code + "'", function (d) {
                            o.onComplete(d);
                        }).fail(function (d) {
                            alert("Sorry, the curent transaction is not successfull.");
                        });
                    }
            
                }
            }
        }
        ,getData                    : function(){
            if(typeof zsi.config.getDataURL===ud){
                alert("zsi.config.getDataURL is not defined in AppStart JS.");
                return;
            }
           var p ={
                 dataType   : "json"
                ,type       : "POST"
                ,url        : zsi.config.getDataURL 
                ,cache      : false
            }; 
            var a=arguments,_data;
            if( typeof a[0] ==="string"){
                _data = { sqlCode: a[0] };
                p.success =  a[1];
            }
            else{
                _data =  a[0];
                p.success = a[0].onComplete;
            }
            p.data = JSON.stringify(_data);
            $.ajax(p);
        }
        ,getHighestZindex           : function(){
            var _selector = "body > *";
            var _a = arguments;
            if(typeof _a[0] !== ud)  _selector = _a[0];         
            var _max = Math.max.apply(null,$.map($(_selector), function(e,n){
                   if($(e).css('position')=='absolute')
                        return parseInt($(e).css('z-index'))||1 ;
                   })
            );      
            return _max;
        }
        ,getTableLayoutsObjects     : function(code,callBack){
            var removeEmptyValues=function(info){
                var _r={};
                 var _keys = Object.keys(info);
                 for(var x=0;x<_keys.length;x++){
                     var _fn = _keys[x];
                     if(info[_fn] !== ""  ){
                         _r[_fn]  = info[_fn] ;
                     } 
                 } 
                 return _r;
            };
        
             $.get(base_url +"sql/proc?p=table_layout_sel @code='" + code + "'", function(data){
        
                    if(data.rows.length >0 ){
                        var _info = data.rows[0];
                        var _layoutInfo = removeEmptyValues(_info);
                            _layoutInfo.onComplete = new Function("d",  _layoutInfo.onComplete );

                        $.get(base_url +"sql/proc?p=table_layout_cols_sel @tableLayoutId='" + _layoutInfo.tableLayoutId + "'", function(data){
                                if(data.rows.length >0 ){
                                     var _rows = [];
                                     $.each( data.rows,function(){
                                           if(this.onRender) this.onRender = new Function("d",  this.onRender);
                                          _rows.push( removeEmptyValues(this) );
                                     });
                                     _layoutInfo.dataRows = _rows;
                                    callBack(_layoutInfo);
                                } else callBack(null);
                        });
                    }
             });
        
        }
        ,getUrlParamValue           : function(variable) {
        	var source = window.location.href; 
        	variable = variable.toLowerCase();
        	var qLoc =  source.indexOf("?");
        	if (qLoc >-1){
        			var param = source.split("?");
        		var result = param[1];  //right parameters  
        		if (result.indexOf("&") > -1){ 
        	 
        			var vars = result.split("&");
        			for (var i=0;i<vars.length;i++) {
        				var pair = vars[i].split("=");
        				if (pair[0].toLowerCase() == variable.toLowerCase()) {
        	
        					return pair[1];
        				}
        			}
        		}
        		else{
        			var pair = result.split("=");
        			if (pair[0].toLowerCase() == variable.toLowerCase()) {
        				return pair[1];
        			}
        	
        	
        		}
        	
        	}
        	return "";
        }
        /*initialize configuration settings*/
        ,init                       : function(o){
            zsi.initURLParameters();
            zsi.config =o;
            zsi.__monitorAjaxResponse();    
        }            
        ,initDatePicker             : function(){
           var inputDate =$('input[id*=date]').not("input[type='hidden']");
        
           inputDate.attr("placeholder","mm/dd/yyyy");
           inputDate.keyup(function(){      
                 if(this.value.length==2 || this.value.length==5 ) this.value += "/";
           });
           
           if(inputDate.length > 0){
              inputDate.datepicker({
                  format: 'mm/dd/yyyy'
                  ,autoclose:true
                  ,daysOfWeekDisabled: [0,6]
              }).on('show', function(e){
                  var l_dp     = $('.datepicker');
                   l_dp.css("z-index",zsi.getHighestZindex() + 1);
              });
           }
        }   
        ,initURLParameters          : function(){
          this.urlParam = {};
          var parts = window.location.search.substr(1).split("&");
          for (var i = 0; i < parts.length; i++) {
                        var temp = parts[i].split("=");
                        this.urlParam[decodeURIComponent(temp[0])] = decodeURIComponent(temp[1]);
          }     
        }          
        ,json                       : {
            groupByColumnIndex      : function(data,column_index){
               var _result ={};
               var _group=[];
            
                  $.each(data.rows, function () {
                        var _value = this.data[column_index];
                      if ($.inArray(_value, _group)==-1) {
                        _group.push(_value);
                        _result[_value]= [] 
                     }
                     _result[_value].push(this.data);
            
               });
               return _result;
            }  
        }
        ,url                        : {
            getQueryValue          : function (source,keyname) {
               source = source.toString().toLowerCase(); 
               keyname = keyname.toLowerCase();
               var qLoc =  source.indexOf("?");   
               if(qLoc>-1) source=source.substr(qLoc+1);
               if (source.indexOf("&") > -1){ 
                  var vars = source.split("&");
                  for (var i=0;i<vars.length;i++) {
                     var pair = vars[i].split("=");
                     if (pair[0] == keyname) {
            
                        return pair[1];
                     }
                  }
               }
               else{
                  var pair = source.split("=");
                  if (pair[0] == keyname) {
                     return pair[1];
                  }      
               }   
               return ""
            }
            ,removeQueryItem        : function (source,keyname) {
               source = source.toString().toLowerCase(); 
               keyname = keyname + "".toLowerCase();
               var qLoc =  source.indexOf("?");   
               if(qLoc>-1) source=source.substr(qLoc+1);
               var result = "";
            
               if (source.indexOf("&") > -1){ 
                  var pairs = source.split("&");
                  for (var i=0;i<pairs.length;i++) {
                      var l_keyname = pairs[i].split("=")[0];         
                     if(l_keyname !=keyname){ 
                        if(result)  result +="&"; 
                        result += pairs[i];
                     }
                  }
               }
               return result;
            }
        }
        ,table                      : {
             getCheckBoxesValues    : function(){
                var args = arguments;
                var result=null;
                var _hidden= "input[type=hidden]";
                var chkBoxName;
                switch(args.length) {
                    case 1: /* return type : Array */
                        var arrayItems = [];
                        var i=0;
                        chkBoxName=args[0];
                        $(chkBoxName).each(function(){
                           arrayItems[i]=$(this.parentNode).children(_hidden).val();
                           i++;
                        });
                        result = arrayItems;
                        break;
            
                    case 3: /* return type : string */
                        var params="";
                        chkBoxName=args[0];
                        var parameterValue         =args[1];
                        var separatorValue         =args[2];
                        
                        $(chkBoxName).each(function(){
                            var _value =   $(this.parentNode).children(_hidden).val();
                            if(_value == ud) _value = this.value; /* patch for no hidden field*/
                            if(params!=="") params = params + separatorValue;
                            params = params + parameterValue + _value;
                        });
                        result = params;
                        break;
            
                    default: break;
                }
               return result;
            }
            ,setCheckBox            : function(obj, cbValue){
               var _hidden= "input[type=hidden]";
                  var _input =   $(obj.parentNode).children(_hidden);
                  if(_input.attr("type")!='hidden') { alert(_hidden + " not found"); return;}
            
                   if(obj.checked){
                        _input.val(cbValue);
                  }
                  else{
                        _input.val("");
                  }
            }
        }
        ,tmr                        : null
        ,toDate                     : function(data) {

          return data;
        }
        ,toggleExtraRow             : function(o){
            o.parentId = zsi.replaceIllegalId(o.parentId);
            var _cpId = "#childPanel";
            var $span = $(o.object).find("span");
            var $cp = $(_cpId + o.parentId);
            var _Cls = "loaded";
            $cp.toggle(500, function () {
                var isVisible = $cp.is(":visible");
                if( isVisible )
                    $span.removeClass("glyphicon glyphicon-collapse-down").addClass("glyphicon glyphicon-collapse-up");
                else
                    $span.removeClass("glyphicon glyphicon-collapse-up").addClass("glyphicon glyphicon-collapse-down");
            });
        
            var isLoaded = $cp.hasClass(_Cls);
          
            if(!isLoaded){
                $cp.addClass(_Cls);
                
                if( ! isUD(o.onLoad) ) o.onLoad( $(_cpId + o.parentId + " .zGrid") );
            }
        
        }
        ,replaceIllegalId           : function(p){
            return (typeof p ==="number" ? p : p.replace(/^[^a-z]+|[^\w:.-]+/gi, "__"));
        }
        ,setValIfNull               : function(data,colName,defaultValue){
            var _d = (typeof defaultValue !== ud ? defaultValue : "" );   
            return (data ? (typeof data[colName]  !== ud ? data[colName] :  _d ) : _d);
        }
        ,ShowHideProgressWindow     : function (isShow){
            var pw = $(".progressWindow");
           if(isShow){
              pw.centerWidth();
              pw.css("display","block");
           }
           else{
              pw.hide();      
           }
         }
        ,ShowErrorWindow            : function(){
            var pw = $(".errorWindow");
            pw.centerWidth();
            pw.css("display","block");
            pw.css("z-index",zsi.getHighestZindex() + 1);
            setTimeout(function(){
                    pw.hide("slow");      
            },5000);   
         }
        ,initInputTypesAndFormats   : function(){
           $(".numeric").keypress(function(event){
              return zsi.form.checkNumber(event,'.,');
           });
            
           $(".format-decimal").blur(function(){
              var obj= this;
              zsi.form.checkNumberFormat(this);
           });
        }
        ,strExist                   : function(source,value){
          var _result=false;
          var i = source.toLowerCase().indexOf(value.toLowerCase());
          if (i>-1) _result=true;
          return _result;
        }
    }
    ,isValidDate = function(l_date){
        var ts=Date.parse(l_date);
        return (isNaN(ts)===false);
    }
;  

zsi.__setPrototypes();
zsi.__setExtendedJqFunctions();
/* Page Initialization */
$(document).ready(function(){
    zsi.initDatePicker();
    zsi.initInputTypesAndFormats();
});
                                                  
                                                  
            