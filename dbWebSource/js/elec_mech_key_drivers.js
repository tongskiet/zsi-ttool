   var  svn              = zsi.setValIfNull
    ,bs                 = zsi.bs.ctrl
    ,bsButton           = zsi.bs.button
    ,proc_url           = base_url + "common/executeproc/"
    ,gMenuName          = zsi.getUrlParamValue("name")
    ,gMenuId            = zsi.getUrlParamValue("id")
    ,gMenuType          = zsi.getUrlParamValue("type")
    ,gMenuRows          = []
    ,gCriteriaRows      = [];
    
 zsi.ready(function(){
    setTabSelection();
    displayMenus();
});

function initScrollToSection() {
    var _$main = $('main');
    var _$tab = $('.tab-pane.active');
    var _lastScrollTop = 0;
    
    var _$scrollMain = function(position){
        _$main.animate({
            scrollTop: (position > 0 ? position - 80 : position)
        });
    };
    
    _$scrollMain($('.section.active').offset().top);
    
    _$main.scroll(function() {
        var _scrollTop = $(this).scrollTop();
        var _scrollHeight = $(this)[0].scrollHeight;
    	var _scrollPosition = $(this).height() + _scrollTop;
    	var _$activeSection = $(".section.active");
    	var _$prevSection = _$activeSection.prev();
    	var _$nextSection = _$activeSection.next();
    	
        if ($(this).scrollTop() >= 50) {    
            $('#btnGoTop').fadeIn(200);
        } else {
            $('#btnGoTop').fadeOut(200); 
        }
        
    	if ((_scrollHeight - _scrollPosition) / _scrollHeight === 0) {
    	    $('#btnNext').fadeOut(200);
    	}else{
    	    $('#btnNext').fadeIn(200); 
    	}
    	console.log(_$activeSection);
    	console.log(_$prevSection);
    	console.log(_$nextSection);
    	console.log(_scrollTop);
    	console.log(_scrollPosition );
    	console.log(_$prevSection.offset().top);
    	console.log(_$nextSection.offset().top);
    	console.log(_scrollTop + _$nextSection.offset().top);
    	
    	if (_scrollTop > _lastScrollTop){ // downscroll code
           if (isSectionInView(_$nextSection, true)){
                console.log("next");   
            }
        } 
        else { // upscroll code
            if (isSectionInView(_$prevSection, true)){
                console.log("prev");   
            }
        }
        _lastScrollTop = _scrollTop;
    	
    	
    // 	setTimeout(function(){
	   //     $(".section").each(function(i, e){
    //             if (isSectionInView($(e), true)) {
    //                 //var _$activeSection = $(this).attr("id");
    //                 //console.log(_$activeSection);
    //                 if( $(this).hasClass("active")){
    //                     var _$activeSection = $(this);
    //                     var _$nextsection = _$activeSection.next();
    //                     //var _nextId = _$nextsection.attr("id").split("_")[1];
                        
    //                     //console.log(_$nextsection.offset().top - 80)
                        
    //                     //console.log($('main').scrollTop() + _$nextsection.offset().top - 80);
                        
    //                     //     if ($(this).hasClass("active")){
    //                     //         $(this).addClass("shown");
    //                     //     }
                            
    //                     //     if(!$(this).hasClass("shown")){
    //                     //         gMenuId = $(this).attr('id').split("_")[1];
    //                     //         setChartView();
    //                     //     }
    //                 }
    //             }
    //         });
    // 	}, 900);
    });
    
    $('#btnGoTop').click(function() { 
        _$scrollMain(0);
        
        $(".section").removeClass("active");
        $(".section:first-child").removeClass("invisible").addClass("active");

        gMenuId = "";
        setChartView();
    });
    
    $('#btnNext').click(function() {
        var _$activeSection = $(".section.active");
        var _$nextsection = _$activeSection.next();
        
        if(_$nextsection.length > 0){
            _$scrollMain(_$main.scrollTop() + _$nextsection.offset().top);
    
            _$activeSection.removeClass("active");
            _$nextsection.removeClass("invisible").addClass("active");
            
            gMenuId = _$nextsection.attr("id").split("_")[1];
            setChartView();
        }
    });
}

function setTabSelection(){
    if(gMenuType==="E"){
        $('#nav-tab a[href="#nav-elec"]').tab('show');
    }else{
        $('#nav-tab a[href="#nav-mech"]').tab('show');
    } 
}

function getMainMenu(callback){
    $.get(procURL + "trend_menus_sel", function(data){
        gMenuRows = data.rows;
        callback(data.rows);
    });
}

function getSubMenu(id, callback){
    $.get(procURL + "criterias_sel @trend_menu_id="+ id, function(data){
        gCriteriaRows = data.rows;
        callback(data.rows);
    });
}

function displayMenus(){
    var _tw = new zsi.easyJsTemplateWriter();
    var _$menuElec = $("#menuElectrical");
    var _$menuMech = $("#menuMechanical");
        _$menuElec.html("");
        _$menuMech.html("");

    getMainMenu(function(rows){
        $(rows.groupBy(["menu_type"])).each(function(i, v){
            var _mType = $.trim(v.name);
            var _mItems = v.items;
            var _mCount = _mItems.length;
            var _mainH = "";
            var _ctr = 0;
          
            if(_mType === gMenuType){
            
                $(_mItems).each(function(i, v){
                    var _mId = v.menu_id;
                    var _mName = $.trim(v.menu_name);
                    _mainH += _tw.section({
                        title : _mName,
                        id : "section_" + _mId,
                        class : (gMenuId!=="" ? (_mId==gMenuId ? "active" : "") : (i > 0 ? "":"active")),
                        header_id : "section_header_" + _mId,
                        body_id : "section_body_"+ _mId
                    }).html();
                    
                    if(_mType === "E"){
                        _$menuElec.html(_mainH);
                    }else{
                        _$menuMech.html(_mainH);
                    }
                    
                    setSubMenu(_mId, _mName, _mType, function(){
                        _ctr++;
                        if(_ctr === _mCount){  
                            initScrollToSection();
                            setChartView();
                        }
                    });
                });
            }
        });
    });
}    

function setSubMenu(mId, _mName, mType, callback){
    var _tw = new zsi.easyJsTemplateWriter(); 
    var _mainHeight = $("main").height() - 200;
    var _cardHeight = _mainHeight / 2;    
    var _subH = "";
    
    getSubMenu(mId, function(rows){
        $(rows).each(function(i, v){
            if(v.pcriteria_id !== ""){
                var _cId = v.criteria_id;
                var _cTitle = $.trim(v.criteria_title);
                var _cLink = "chart_" + (mType === "E" ? "electrical" : "mechanical");
                // var _cLink = _cTitle.toLowerCase().replace(/&/g,"and");
                //     _cLink = _cLink.replace(/ /g,"_");
                
                _subH += _tw.section_card({
                      title     : _cTitle
                    , chart_id  : "chart_"+ mId +"_"+ _cId
                    , link      : _cLink + "?type="+ mType +"&cat="+ _mName.replace(/&/g, '_') +"&id="+ _cId +"&name="+ _cTitle.replace(/&/g, '_')
                    , body_style : "height:" +_cardHeight + "px"
                }).html();
            }
        });
        $("#section_body_"+ mId).html(_subH);
        callback(rows);
    });
}

function setChartView(){
    var _time = 500;
    var _$section = (gMenuId!=="" ? $("#section_" + gMenuId) : $(".section:first-child"));
    
    if(!_$section.hasClass("shown")){
        _$section.addClass("shown");
        _$section.find(".section-card").each(function(){
            var _chartId = $(this).find(".section-card-body").attr("id");  
        
            setTimeout( function(){ displayChart(_chartId); }, _time);
            _time += 500;
        });
    }
}

function displayChart(chart_id){
    // Themes begin
    am4core.useTheme(am4themes_animated);

    am4core.options.commercialLicense = true;
    
    // Create chart instance
    var container = am4core.create(chart_id, am4core.Container);
    container.width = am4core.percent(100);
    container.height = am4core.percent(100);
    container.layout = "horizontal";
    
    function createChart(data) {
    
      // Create chart
      var chart = container.createChild(am4charts.PieChart);
    
      // Add data
      chart.data = data;
    
      // Add and configure Series
      var pieSeries = chart.series.push(new am4charts.PieSeries());
      pieSeries.dataFields.value = "litres";
      pieSeries.dataFields.category = "country";
      pieSeries.labels.template.disabled = true;
      pieSeries.ticks.template.disabled = true;
      
    };
    
    createChart([{
      "country": "Lithuania",
      "litres": 501
    }, {
      "country": "Czechia",
      "litres": 301
    }, {
      "country": "Ireland",
      "litres": 201
    }, {
      "country": "Germany",
      "litres": 165
    }, {
      "country": "Australia",
      "litres": 139
    }, {
      "country": "Austria",
      "litres": 128
    }, {
      "country": "UK",
      "litres": 99
    }, {
      "country": "Belgium",
      "litres": 60
    }, {
      "country": "The Netherlands",
      "litres": 50
    }]);
    
    createChart([{
      "country": "Lithuania",
      "litres": 250
    }, {
      "country": "Czechia",
      "litres": 360
    }, {
      "country": "Ireland",
      "litres": 150
    }, {
      "country": "Germany",
      "litres": 200
    }]);
    
    createChart([{
      "country": "Czechia",
      "litres": 301
    }, {
      "country": "Ireland",
      "litres": 600
    }, {
      "country": "Germany",
      "litres": 240
    }, {
      "country": "Austria",
      "litres": 128
    }, {
      "country": "UK",
      "litres": 99
    }, {
      "country": "Belgium",
      "litres": 60
    }]);
} 

function isSectionInView(elem, partial)
{
    var container = $("main");
    var contHeight = container.height();
    var contTop = container.scrollTop();
    var contBottom = contTop + contHeight ;
 
    var elemTop = $(elem).offset().top - container.offset().top;
    var elemBottom = elemTop + $(elem).height();
    
    var isTotal = (elemTop >= 0 && elemBottom <=contHeight);
    var isPart = ((elemTop < 0 && elemBottom > 0 ) || (elemTop > 0 && elemTop <= container.height())) && partial ;
    
    return  isTotal  || isPart ;
}

                  