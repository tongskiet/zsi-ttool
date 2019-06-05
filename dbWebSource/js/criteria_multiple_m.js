     var  svn              = zsi.setValIfNull
    ,bs                 = zsi.bs.ctrl
    ,bsButton           = zsi.bs.button
    ,proc_url           = base_url + "common/executeproc/"
    ,gMenuName          = zsi.getUrlParamValue("name")
    ,gMenuId            = zsi.getUrlParamValue("id")
    ,gMenuRows          = []
    ,gCriteriaRows      = [];
    
zsi.ready(function(){
    displayMenus();
});

function getMainMenu(callback){
    $.get(procURL + "trend_menus_sel @menu_type='M'", function(data){
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

function initScrollToSection() {
    var _$main = $('main');
    var _lastScrollTop = 0;
    
    var _$scrollMain = function(position){
        _$main.animate({
            scrollTop: (position > 0 ? position - 80 : position)
        });
    };
    
    _$main.scroll(function() {
        var _scrollTop = $(this).scrollTop();
        var _scrollHeight = $(this)[0].scrollHeight;
    	var _scrollPosition = $(this).height() + _scrollTop;
    	var _$activeSection = $(".section.active");
    	var _$lastSection = $(".section:last-child");
    	var _$prevSection = _$activeSection.prev();
    	var _$nextSection = _$activeSection.next();
    	var _$prevHeader = _$prevSection.find(".section-header");
    	var _$nextHeader = _$nextSection.find(".section-header");
    	
        if ($(this).scrollTop() >= 50) {    
            $('#btnGoTop').fadeIn(200);
        } else {
            $('#btnGoTop').fadeOut(200); 
        }

    	//if ((_scrollHeight - _scrollPosition) / _scrollHeight === 0) { //Scroll reach bottom page
    	if (_$lastSection.hasClass("active")) {
    	    $('#btnNext').fadeOut(200);
    	}else{
    	    $('#btnNext').fadeIn(200); 
    	}
    	
    	if (_scrollTop > _lastScrollTop){ // downscroll code
           if (_$nextSection.length > 0 && isSectionInView(_$nextHeader, true)){
                _$activeSection.removeClass("active");
                _$nextSection.addClass("active");
                    
                gMenuId = _$nextSection.attr('id').split("_")[1];
                setChartView();
            }
        } 
        else { // upscroll code
            if (_$prevSection.length > 0 && isSectionInView(_$prevHeader, true)){
                _$activeSection.removeClass("active");
                _$prevSection.addClass("active"); 
                    
                gMenuId = _$prevSection.attr('id').split("_")[1];
                setChartView();
            }
        }
        _lastScrollTop = _scrollTop;
    });
    
    $('#btnGoTop').click(function() { 
        _$scrollMain(0);
        
        $(".section").removeClass("active");
        $(".section:first-child").addClass("active");
        $(".section:last-child").removeClass("active");

        gMenuId = "";
        setChartView();
    });
    
    $('#btnNext').click(function() {
        var _$activeSection = $(".section.active");
        var _$nextsection = _$activeSection.next();
        
        if(_$nextsection.length > 0){
            _$scrollMain(_$main.scrollTop() + _$nextsection.offset().top);
    
            _$activeSection.removeClass("active");
            _$nextsection.addClass("active");
            
            gMenuId = _$nextsection.attr("id").split("_")[1];
            setChartView();
        }
    });
}

function displayMenus(){
    var _tw = new zsi.easyJsTemplateWriter();
    var _$menuElec = $("#menuMechanical");
        _$menuElec.html("");

    getMainMenu(function(rows){
        var _count = rows.length;
        var _mainH = "";
        var _ctr = 0;
        
        $(rows).each(function(i, v){
            var _mId = v.menu_id;
            var _mName = $.trim(v.menu_name);
            
            _mainH += _tw.section({
                title : _mName,
                id : "section_" + _mId,
                class : (i === 0 ? "active":""),
                header_id : "section_header_" + _mId,
                body_id : "section_body_"+ _mId
            }).html();

            _$menuElec.html(_mainH);
            
            setSubMenu(_mId, _mName, function(){
                _ctr++;
                if(_ctr === _count){  
                    initScrollToSection();
                    setChartView();
                }
            });
        });
    });
}    

function setSubMenu(mId, _mName, callback){
    var _tw = new zsi.easyJsTemplateWriter(); 
    var _mainHeight = $("main").height() - 200;
    var _cardHeight = _mainHeight / 2;    
    var _subH = "";
    
    getSubMenu(mId, function(rows){
        $(rows).each(function(i, v){
            if(v.pcriteria_id !== ""){
                var _cId = v.criteria_id;
                var _cTitle = $.trim(v.criteria_title);
                var _cLink = "chart_mechanical?menu="+ _mName.replace(/&/g, '_') +"&id="+ _cId +"&name="+ _cTitle.replace(/&/g, '_');
                
                _subH += _tw.section_card({
                      title     : _cTitle
                    , chart_id  : "chart_"+ mId +"_"+ _cId
                    , link      : _cLink
                    , body_style : "height:" +_cardHeight + "px"
                }).html();
            }
        });
        $("#section_body_"+ mId).html(_subH);
        callback();
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

                        