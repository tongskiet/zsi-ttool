       var  svn              = zsi.setValIfNull
    ,bs                 = zsi.bs.ctrl
    ,bsButton           = zsi.bs.button
    ,proc_url           = base_url + "common/executeproc/"
    ,gMenuId            
    ,gMenuName          = ""
    ,gCriteriaRows      = []
    ,gMYRange           = ""
    ,gHarnessName       = ""
    ,gRegionNames       = []
    ,gModelYears        = []
    ,gMYFrom            = ""
    ,gMYTo              = ""
    ,gData              = []
    ,gPrmRegion         = ""
    ,gPrmNoYears        = ""
    ,gPrmChartType      = ""
    ,gPrmIncludeCYear   = "N"
    ,gPrmCategory       = ""
    ,gPrmSumUp          = ""
    ,gPrmGraphType      = ""
    ,gArrMY             = []
    ,gMaxMY             = new Date().getFullYear()
    ,gMinMY             = gMaxMY - 2;
    
zsi.ready(function(){
    for(var i=0; i<3; i++){
        gArrMY.push(gMaxMY--);
    }
    console.log(gArrMY)
    getMainMenu(function(mainRows){
        var _count = mainRows.length;
        var _ctr = 0;
        $.each(mainRows, function(i, v){
            getSubMenu(v.menu_id, function(subRows){
                _ctr++;
                v.items = subRows;
                
                if(_ctr === _count) {
                    gCriteriaRows = mainRows;
                    displayMenus(mainRows);
                    //$('#menuElectrical .collapsable').collapse();
                }
            });
        });
    });
    //displayMenus();
});

function toggleCollapse(e){
    $(e).toggleClass("collapsed");
    $(e).closest(".section-card").find(".collapse").slideToggle(function(){
        $(this).toggleClass("show");
    });
}

function filterGraphData(e){
    var _$form = $(e).closest(".form");
    gMYFrom = _$form.find("#date_from").val();
    gMYTo = _$form.find("#date_to").val();
    gPrmSumUp = _$form.find("#sum_up").val();
    gPrmCategory = _$form.find("#category").val();
    gPrmGraphType = _$form.find("#graph_type").val();
    
    var _cId = _$form.find("#criteria_id").val();
    var _cName = _$form.find("#criteria_name").val();
    var _menuId = _$form.find("#menu_id").val();
    var _menuName = _$form.find("#menu_name").val();
    var _chartId = "chart_"+ _menuId +"_"+ _cId;
    
    console.log("gMYFrom",gMYFrom);
    console.log("gMYTo",gMYTo);
    console.log("gPrmSumUp",gPrmSumUp);
    console.log("gPrmCategory",gPrmCategory);
    console.log("gPrmGraphType",gPrmGraphType);
    
    var _res = setChartSettings({
            criteriaId: _cId,
            criteriaName: _cName,
            menuName: _menuName
        });

    if(_res.url!==""){
        getDataByCriteriaId(_res.url, _cName, function(){
            setMYRange();
            
            var _fnName = new Function("container", _res.chart.default);
                _fnName(_chartId);
        });
    }
}

function downloadGraphData(e){
    
}

function getMainMenu(callback){
    $.get(procURL + "trend_menus_sel @menu_type='M'", function(data){
        callback(data.rows);
    });
}

function getSubMenu(id, callback){
    $.get(procURL + "criterias_sel @trend_menu_id="+ id, function(data){
        callback(data.rows);
    });
}

function displayMenus(rows){
    var _data = rows;
    var _cardHeight = $("main").height() - 115;
    //var _cardHeight = _mainHeight;
    
    var _createChart = function(o, toggle, callback){
        if(!isUD(o)){
            var _tw = new zsi.easyJsTemplateWriter();
            var _menuId = o.menu_id;
            var _menuName = o.menu_name;
            var _menuItems = o.items; 
            var _count = _menuItems.length;
            var _subBodyId = "section_body_"+ _menuId;
            var _ctr = 0;
            var _time = 500;
            var _mainH = _tw.section({
                title : _menuName,
                body_id : _subBodyId,
            }).html();
            
            $("#menuMechanical").append(_mainH);
            
            $.each(_menuItems, function(i, v){
                if(v.pcriteria_id !== ""){
                    var _cId = v.criteria_id;
                    var _cName = v.criteria_title;
                    var _cLink = "chart_mechanical?menu="+ _menuName.replace(/&/g, '_') +"&id="+ _cId +"&name="+ _cName.replace(/&/g, '_');
                    var _chartId = "chart_"+ _menuId +"_"+ _cId;
                    var _collapseId = "collapse_"+ _menuId +"_"+ _cId;
                    var _subH = _tw.section_card({
                          title         : _cName
                        , chart_id      : _chartId
                        , menu_id       : _menuId
                        , menu_name     : _menuName
                        , criteria_id   : _cId
                        , criteria_name : _cName
                        , collapse_id    : _collapseId
                        , collapse_class : (toggle? (i===1 ? "show":"") : "")
                        , aria_expanded  : (toggle? (i===1 ? true:false) : false)
                        , aria_collapsed : (toggle? (i===1 ? "collapsed":"") : "")
                        , body_style     : "height:" +_cardHeight + "px"
                    }).html();
                    
                    $("#"+ _subBodyId).append(_subH);
                    
                    setTimeout( function(){ 
                        var _res = setChartSettings({
                                criteriaId: _cId,
                                criteriaName: _cName,
                                menuName: _menuName
                            });
        
                        getDataByCriteriaId(_res.url, _cName, function(){
                            setMYRange();
                            
                            var _fnName = new Function("container", _res.chart.default);
                                _fnName(_chartId);
                        });
                        
                    },  _time);
                        _time += 500;
                
                    //callback();
                }
            });
        }
    };
    
    _createChart(_data.shift(), true);
    
    $("main").scroll(function() {
        var _scrollTop = $(this).scrollTop();
        var _scrollHeight = $(this)[0].scrollHeight;
    	var _scrollPosition = $(this).height() + _scrollTop;

    	if ((_scrollHeight - _scrollPosition) / _scrollHeight === 0) { //Scroll reach bottom page
	        _createChart(_data.shift(), false);
    	}
    	
    	if (_scrollTop >= 50) {    
            $('#btnGoTop').fadeIn(200);
        } else {
            $('#btnGoTop').fadeOut(200); 
        }
    });
    
    $('#btnGoTop').click(function(){ 
        $('main').animate({
            scrollTop: 0
        });
    });
    
    // getMainMenu(function(rows){
    //     var _count = rows.length;
    //     var _mainH = "";
    //     var _ctr = 0;
        
    //     $(rows).each(function(i, v){
    //         var _mId = v.menu_id;
    //         var _mName = $.trim(v.menu_name);
             
    //         _mainH += _tw.section({
    //             title : _mName,
    //             id : "section_" + _mId,
    //             class : (i === 0 ? "active":""),
    //             menu_id: _mId,
    //             header_id : "section_header_" + _mId,
    //             body_id : "section_body_"+ _mId
    //         }).html();

    //         _$menuElec.html(_mainH);
            
    //         setSubMenu(_mId, _mName, function(){
    //             _ctr++;
    //             if(_ctr === _count){
    //                 gMenuId = rows[0].menu_id;  
    //                 initScrollToSection();
    //                 setChartPerSection();
    //             }
    //         });
    //     });
    // });
}    

function setSubMenu(_mId, _mName, callback){
    var _tw = new zsi.easyJsTemplateWriter(); 
    var _mainHeight = $("main").height() - 200;
    var _cardHeight = _mainHeight / 2;    
    var _subH = "";
   
    getSubMenu(_mId, function(rows){
        $(rows).each(function(i, v){
            if(v.pcriteria_id !== ""){
                var _cId = v.criteria_id;
                var _cTitle = $.trim(v.criteria_title);
                var _cLink = "chart_electrical?menu="+ _mName.replace(/&/g, '_') +"&id="+ _cId +"&name="+ _cTitle.replace(/&/g, '_');
                 console.log(_mId);
                _subH += _tw.section_card({
                      title         : _cTitle
                    , menu_id       : _mId
                    , menu_name     : _mName
                    , chart_id      : "chart_"+ _mId +"_"+ _cId
                    , criteria_id   : _cId
                    , criteria_name : _cTitle
                    , link          : _cLink
                    , body_style    : "height:" +_cardHeight + "px"
                }).html();
            }
        });
        $("#section_body_"+ _mId).html(_subH);
        callback();
    });
}

function setChartPerSection(){
    var _time = 500;
    var _$section = $("#section_" + gMenuId);
    var _$sectionCard = _$section.find(".section-card");
    var _menuName = _$section.find(".menu-name").text();
    var _sCount = _$sectionCard.length;
    var _ctr = 0;
  
    if(!_$section.hasClass("shown")){
        _$section.addClass("shown");
        _$sectionCard.each(function(){
            var _cId = $(this).attr("cid");
            var _cName = $(this).find(".criteria-name").text();
            var _chartId = $(this).find(".section-card-body").attr("id");  
        
            setTimeout( function(){ 
                var _res = setChartSettings({
                        criteriaId: _cId,
                        criteriaName: _cName,
                        menuName: _menuName
                    });
    
                if(_res.url !== ""){
                    getDataByCriteriaId(_res.url, _cName, function(){
                        setMYRange();
                        
                        var _fnName = new Function("container", _res.chart.default);
                            _fnName(_chartId);
                    });
                }
            }, _time);
            
            _time += 500;
        });
    }
}

function setChartSettings(o){
    if(!$.isEmptyObject(o)){
        var _cId = o.criteriaId;
        var _cName = $.trim(o.criteriaName);
        var _menuName = $.trim(o.menuName).toUpperCase();
        var _url = "";
        var _result = {};
        var _chart = {default:"", pie:"", column:"", line: ""};
        var _staticMY = new Date().getFullYear() - 2;
        
        if(isContain(_menuName, "WIRES & CABLES")){
            
        }
        else if(isContain(_menuName, "INLINE CONNECTOR")){
            
        }
        else if(isContain(_menuName, "GROUND EYELET") || isContain(_menuName, "SPLICE") || isContain(_menuName, "BATTERY FUSE TERMINAL")){
            _url = "dynamic_cts_usage_summary @byMY='Y',@byRegion='Y',@criteria_id="+ _cId;
            _chart.default = "displayCommonPieChart(container)";
            _chart.pie = "displayPieGroundEyelet(container)";
            _chart.column = "displayColumnGroundEyelet(container)";
        }
        else if(isContain(_menuName, "COVERINGS")){
            
            _url = "dynamic_coverings_sel @byMY='Y',@byRegion='Y',@criteria_id="+ _cId;
            _chart.default = "displayChartCovering(container)";
            _chart.line = "displayChartCovering(container)";
        }
        else if(isContain(_menuName, "RETAINERS")){
            
            _url = "dynamic_retainers_sel @byMY='Y',@byRegion='Y',@criteria_id="+ _cId;
            _chart.default = "displayChartRetainer(container)";
            _chart.line = "displayChartRetainer(container)";
        }
        else if(isContain(_menuName, "GROMMETS")){
            
            _url = "dynamic_grommets_sel @byMY='Y',@byRegion='Y',@criteria_id="+ _cId;
            _chart.default = "displayCommonPieChart(container)";
            _chart.pie = "displayPieGrommets(container)";
            _chart.column = "displayColumnGrommets(container)";
        }
        else if(isContain(_menuName, "TROUGH/SHIELD/BRACKET")){
            
            _url = "dynamic_stc_sel @byMY='Y',@byRegion='Y',@criteria_id="+ _cId;
            _chart.default = "displayCommonPieChart(container)";
            _chart.pie = "displayPieSTC(container)";
            _chart.column = "displayColumnSTC(container)";
        }

        _result.url = _url;
        _result.chart = _chart;
       
        return _result;
    }
}

function getDataByCriteriaId(url, criteriaName, callback){
    if(url !== ""){
        var _param = "";
        var _url = url;
    
        // Set additional parameters
        if(gPrmIncludeCYear==="Y"){
            _param += ",@no_years='"+ gPrmNoYears +"',@include_cyear='Y'";
        }
        else if(gPrmIncludeCYear==="N" && gPrmNoYears!==""){
            _param += ",@no_years='"+ gPrmNoYears +"',@include_cyear='N'";
        }

        $.get(execURL + _url //+ param
            , function(data){
                gData = data.rows;
                
                if(isContain(criteriaName, "Overall")){
                    gRegionNames = gData.groupBy(["region"]);
                    gModelYears = gData.groupBy(["model_year"]);
                }else{
                    gRegionNames = gData.groupBy(["REGION_NAME"]);
                    gModelYears = gData.groupBy(["MODEL_YEAR"]);
                }
                
                gRegionNames = sortBy(gRegionNames, "name");
                gModelYears = sortBy(gModelYears, "name");
    
                callback();
        });
    }
}

//******************************* CHART FUNCTION *****************************//

function setLegendSize(chart){
    chart.legend = new am4charts.Legend();
    chart.legend.labels.template.fontSize = 10;
    chart.legend.valueLabels.template.fontSize = 10;
    chart.legend.itemContainers.template.dy = 10;
    chart.legend.itemContainers.template.paddingTop = 1;
    chart.legend.itemContainers.template.paddingBottom = 1;
    chart.legend.labels.template.truncate = false;
    chart.legend.labels.template.wrap = true;
        
    var markerTemplate = chart.legend.markers.template;
    markerTemplate.width = 10;
    markerTemplate.height = 10;
}

function setTrendResult(o, wire_guage, container){
    if(o.length > 0){
        var lastObj = o[o.length - 1];
        var secondObj = o[o.length - 2];
        
        var result = "";
        var status = "";
        var inc = "Increasing";
        var dec = "Decreasing";
    
        if( typeof(lastObj)!==ud && typeof(secondObj)!==ud ){
            var totalSWL = lastObj.total_small_wires;
            var totalBWL = lastObj.total_big_wires;
            var totalSWS = secondObj.total_small_wires;
            var totalBWS = secondObj.total_big_wires;
            
            var totalL = totalSWL + totalBWL; 
            var totalS = totalSWS + totalBWS; 
        
            var swTotalL = (totalSWL / totalL) * 100;  
            var bwTotalL = (totalBWL / totalL) * 100;  
            
            var swTotalS = (totalSWS / totalS) * 100;  
            var bwTotalS = (totalBWS / totalS) * 100; 
            
            var lastValSW = swTotalL.toFixed(2);
            var lastValBW = bwTotalL.toFixed(2);
            var secondValSW = swTotalS.toFixed(2);
            var secondValBW = bwTotalS.toFixed(2);
           
            if(lastValSW > secondValSW) {
                status = inc;
            }else{
                status = dec;
            }
            result += "% of Lower "+ wire_guage +" - "+ status;
            result += "<br>";
            
            if(lastValBW > secondValBW) {
                status = inc;
            }else{
                status = dec;
            }
            result += "% of Higer "+ wire_guage +" - "+ status;
            
        }
        
        var _tw = new zsi.easyJsTemplateWriter();
        
        $("#d_sub_criteria_" + gSubCriteriaId).append( _tw.trendResult({ trend: result }).html() );
    }
}

function setMYRange(){
    if(gModelYears.length > 0){
        var _res = getFirstAndLastItem(gModelYears, "name");
        var _from = _res.first;
        var _to = _res.last;
        
        gMYFrom = _from;
        gMYTo = _to;
        
        if(gModelYears.length > 1){
            gMYRange = "MY" + _from + " - MY" + _to;
        }else{
            gMYRange = "MY" + _from;
        }
    }
    $("#chart_range").html(gMYRange);
}

function sortBy(obj, key){
    obj.sort(function(a, b) {
      var nameA = a[key].toUpperCase(); // ignore upper and lowercase
      var nameB = b[key].toUpperCase(); // ignore upper and lowercase
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
    
      // names must be equal
      return 0;
    });
    
    return obj;
}
 
function getFirstAndLastItem(obj, key) {
    var firstItem = obj[0];
    var lastItem = obj[obj.length-1];
    
    if(key) {
        firstItem = firstItem[key];
        lastItem = lastItem[key];
    }
    
    var objOutput = {};
    objOutput.first = firstItem;
    objOutput.last = lastItem;
    
    return objOutput;
} 

function getDistinctKey(data){
    var _keys = {};
    var _value = "";
    var _category = "";
    var _location = "";
    var _specification = "";

    if(data.length > 0){
        $.each(Object.keys(data[0]), function(i, key){
            var _key = key.toUpperCase();
            if(_key !== "REGION" && _key !== "MODEL_YEAR"){
                if(isContain(_key, "LOCATION") || _key === "SL"){
                    _location = key;
                }
                else if(isContain(_key, "SPECIFIC")){
                   _specification = key;
                }
                else if(isContain(_key, "COUNT") || isContain(_key, "SUM")){
                    _value = key;
                }
                else{
                    _category = key;
                } 
            }
        });
    }
    _keys.value = _value;
    _keys.category = _category;
    _keys.location = _location;
    _keys.specification = _specification;
    
    return _keys; 
}

function isContain(string, contains){
    var _res = false;
    if (string.search(contains) > -1){
        _res = true;
    }
    return _res;
} 

function setWireTrend(data, pContainer){
    if(data.length > 0){
        var _trend = "";
        var lastObj = data[data.length - 1];
        $.each(lastObj, function(k, v){
            var _key = k.replace("_",".");
            if($.isNumeric( _key ) && v !== 0){
                _trend += _key + '<br>';
            }
        });
        
        var _tw = new zsi.easyJsTemplateWriter();
        $("#" + pContainer).append( _tw.trendResult({ trend: _trend }).html() );
                
    }
}

//------------------------------- COMMON CHARTS ------------------------------//
function displayCommonPieChart(container){
    var _data = [];
    var _dynamicKey = getDistinctKey(gData);
    var _value = _dynamicKey.value;
    var _category = _dynamicKey.category;
    var _dynamicObj = gData.groupBy([_category]);
    
    $.each(gModelYears, function(x, my) { 
        var _my = my.name;
        
        $.each(_dynamicObj, function(y, w) { 
            var _count = 0;
            var _cName = w.name;
            var _res = w.items.filter(function (item) {
            	return item[_category] == _cName && item.MODEL_YEAR == _my;
            });

            if(_value && _value !== ""){
                 _count = _res.reduce(function (accumulator, currentValue) {
                    return accumulator + currentValue[_value];
                }, 0);    
            }else{
                for(; _count < _res.length; ){
                    _count++;
                }
            }  
            
            _data.push({
                model_year: +_my,
                category: _cName,
                value: _count
            });
        });
        
    });

    // CHART SETTINGS
    am4core.useTheme(am4themes_animated);
    am4core.options.commercialLicense = true;
    
    var container = am4core.create(container, am4core.Container);
    container.width = am4core.percent(100);
    container.height = am4core.percent(100);
    container.layout = "horizontal";
    
    var _createChart = function(data, year){
        var chart = container.createChild(am4charts.PieChart);
        chart.data = data;
        chart.paddingTop= 15;
        chart.paddingBottom = 15;
        
        var title = chart.titles.create();
        title.text =  "MY" + year;
        title.fontSize = 10;
        title.fontWeight = 800;
        title.marginBottom = 0;
        
        // Add and configure Series
        var pieSeries = chart.series.push(new am4charts.PieSeries());
        pieSeries.dataFields.value = "value";
        pieSeries.dataFields.category = "category";
        pieSeries.slices.template.propertyFields.fill = "color";
        pieSeries.slices.template.propertyFields.isActive = "pulled";
        pieSeries.slices.template.strokeWidth = 0;
        pieSeries.paddingBottom = 10;
        pieSeries.colors.step = 2;
        
        pieSeries.ticks.template.disabled = true;
        pieSeries.alignLabels = false;
        pieSeries.labels.template.fontSize = 10;
        pieSeries.labels.template.text = "{value.percent.formatNumber('#.00')}%";
        pieSeries.labels.template.radius = am4core.percent(-40);
        //pieSeries.labels.template.relativeRotation = 90;
        pieSeries.labels.template.fill = am4core.color("white");
        pieSeries.legendSettings.valueText = "{valueY.close}";
        pieSeries.labels.template.adapter.add("text", function(text, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return "";
            }
            return text;
        });
        
        setLegendSize(chart);
    };

    $.each(gModelYears, function(i, v){
        var _my = v.name;
        var _res = _data.filter(function (item) {
        	return item.model_year == _my;
        });

        _createChart(_res, _my);
    });
}

function displayCommonColumnChart(container){
    var _data = [];
    var _objKey = getDistinctKey(gData);
    var _value = _objKey.value;
    var _category = _objKey.category;
    var _location = _objKey.location;
    var _categoryObj = gData.groupBy([_category]);
    var _locationObj = gData.groupBy([_location]);
    var _hasLocation = (_location ? true: false);

    if(_hasLocation){
        $.each(gRegionNames, function(i, r) { 
            $.each(gModelYears, function(x, my) {
                var _regionName = r.name;
                var _modelYear = my.name;
                var _result = r.items.filter(function (item) {
                	return item.MODEL_YEAR == _modelYear;
                });
                
                $.each(_locationObj, function(y, l) {
                    var _specLocation = l.name;
                    var _json = {
                        REGION_NAME : _regionName,
                        MODEL_YEAR : +_modelYear,
                        category : _specLocation +"("+ _modelYear +"-"+ _regionName +")"
                    };
                    
                    $.each(_categoryObj, function(z, s) {
                        var _count = 0;
                        var _name = s.name;
                        var _nameNew = _name.replace(" ","_");
                        var _result2 = _result.filter(function (item) {
                        	return item[_location] == _specLocation && item[_category] == _name;
                        });

                        if(_value && _value !== ""){
                             _count = _result2.reduce(function (accumulator, currentValue) {
                                return accumulator + currentValue[_value];
                            }, 0)
                        }else{
                            for(; _count < _result2.length; ){
                                _count++;
                            }
                        }
                       
                        _json[_nameNew] = _count;
                    });
                    
                    _data.push(_json);
                }); 
            });
        });
    }
    else{
         $.each(gRegionNames, function(i,r) { 
            $.each(gModelYears, function(x, my) { 
                var _my = my.name;
                var _region = r.name;
                var _obj = {};
                _obj.year = +_my;
                _obj.region = _region;
                _obj.category = _my +"("+ _region +")";
                
                $.each(_categoryObj, function(y, w) { 
                    var _count = 0;
                    var _cName = w.name;
                    var _cNameNew = _cName.replace(" ","_");
                    var _res = r.items.filter(function (item) {
                    	return item[_category] == _cName && item.MODEL_YEAR == _my;
                    });
                    
                    if(_value && _value !== ""){
                         _count = _res.reduce(function (accumulator, currentValue) {
                            return accumulator + currentValue[_value];
                        }, 0);    
                    }else{
                        for(; _count < _res.length; ){
                            _count++;
                        }
                    }
    
                    _obj[_cNameNew] = _count;
                });
                _data.push(_obj);
            });
        });
    }
    
    am4core.useTheme(am4themes_animated);
    am4core.options.commercialLicense = true;

    var chart = am4core.create(container, am4charts.XYChart);
    chart.data = _data;
    chart.colors.step = 2;
    chart.padding(15, 15, 10, 15);

    if(_hasLocation){
        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "category";
        categoryAxis.renderer.minGridDistance = 20;
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.interactionsEnabled = false;
        categoryAxis.renderer.labels.template.fontSize = 10;
        categoryAxis.renderer.labels.template.valign = "top";
        categoryAxis.renderer.labels.template.location = 0;
        categoryAxis.renderer.labels.template.rotation = (_hasLocation ? 270: 0);
        categoryAxis.renderer.labels.template.adapter.add("textOutput", function(text) {
            return (!isUD(text) ? text.replace(/\(.*/, "") : text);
        });
    
        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        //valueAxis.title.text = "Count";
        valueAxis.min = 0;
        //valueAxis.max = 100;
        valueAxis.strictMinMax = true;
        valueAxis.calculateTotals = true;
        valueAxis.renderer.minGridDistance = 10;
        valueAxis.renderer.labels.template.adapter.add("text", function(text) {
          return text + "%";
        });
    
        // Create series
        var _createSeries = function(field, name) {
          var series = chart.series.push(new am4charts.ColumnSeries());
          series.dataFields.valueY = field;
          //series.dataFields.categoryXShow = "totalPercent";
          series.dataFields.categoryX = "category";
          series.name = name;
          series.tooltipText = "[bold]{name}:[/] {valueY.totalPercent.formatNumber('#.00')}% - [bold]{valueY.formatNumber('#,###')}[/]";
          series.tooltip.fontSize = 8;
          series.tooltip.paddingTop = 1;
          series.tooltip.paddingBottom= 1;
          series.tooltip.paddingBottom= 1;
          series.tooltip.dy = -10;
          series.tooltip.align = "top";
          series.stacked = (_hasLocation ? true: false);
          series.columns.template.width = am4core.percent(95);

        }
        
        var _createLabel = function(category, endCategory, label, opacity, dy) {
            var range = categoryAxis.axisRanges.create();
            range.category = category;
            range.endCategory = endCategory;
            range.label.dataItem.text = label;
            range.label.dy = dy;
            //range.label.fontSize = 10;
            range.label.fontWeight = "bold";
            range.label.valign = "bottom";
            range.label.location = 0.5;
            range.label.rotation = 0;
            range.axisFill.fill = am4core.color("#396478");
            range.axisFill.fillOpacity = opacity;
            range.locations.category = 0.1;
            range.locations.endCategory = 0.9;
        };
    }
    else{
        // Create axes
        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "category";
        categoryAxis.numberFormatter.numberFormat = "#";
        //categoryAxis.title.text = "Wire 0.50 and Below";
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.renderer.minGridDistance = 20;
        categoryAxis.renderer.labels.template.adapter.add("textOutput", function(text) {
            return (typeof(text)!=="undefined" ? text.replace(/\(.*/, "") : text);
        });
        
        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        //valueAxis.title.text = "Count";
        valueAxis.min = 0;
        valueAxis.max = 100;
        valueAxis.strictMinMax = true;
        valueAxis.calculateTotals = true;
        valueAxis.renderer.labels.template.adapter.add("text", function(text) {
          return text + "%";
        });
        
        // Create series
        var _createSeries = function(field, name) {
            var series = chart.series.push(new am4charts.ColumnSeries());
            series.dataFields.valueY = field;
            series.dataFields.valueYShow = "totalPercent";
            series.dataFields.categoryX = "category";
            series.name = name;
            series.tooltipText = "[bold]{name}:[/] {valueY.totalPercent.formatNumber('#.00')}% - [bold]{valueY.formatNumber('#,###')}[/]";
            series.tooltip.fontSize = 8;
            series.tooltip.dy = -10;
            //series.tooltip.align = "top";
            
            series.tooltip.valign  = "top";
            series.tooltip.tooltipPosition = "fixed";
            series.tooltip.background.filters.clear();
            //series.tooltip.pointerOrientation  = true;
            series.tooltip.fixedWidthGrid = true;
            series.tooltip.layout = "none";
            series.tooltip.pointerOrientation = "horizontal";
            //series.tooltip.label.minWidth = 40;
            //series.tooltip.label.minHeight = 40;
            series.tooltip.label.textAlign = "middle";
            series.tooltip.label.textValign = "middle";
        };
         
        var _createLabel = function(category, endCategory, label) {
            var range = categoryAxis.axisRanges.create();
            range.category = category;
            range.endCategory = endCategory;
            range.label.dataItem.text = label;
            range.label.dy = 18;
            range.label.fontWeight = "bold";
            range.axisFill.fill = am4core.color("#396478");
            range.axisFill.fillOpacity = 0.1;
            range.locations.category = 0.1;
            range.locations.endCategory = 0.9;
        };
    }
    
    $.each(_categoryObj, function(i, v) { 
        var _name = v.name;
        var _nameNew = _name.replace(" ","_");

        _createSeries(_nameNew, _name);
    }); 
    
    if(_hasLocation){
       var _specName = getFirstAndLastItem(_locationObj , "name");
        
        $.each(gModelYears, function(i, v) { 
            var _my = v.name;
            
            $.each(gRegionNames, function(i, r) { 
                var _reg = r.name;
                var _first = _specName.first + "("+ _my +"-"+ _reg +")";
                var _last = _specName.last + "("+ _my +"-"+ _reg +")";
                
                _createLabel(_first, _last, _my, 0, 10);
            });
        });
        
        $.each(gRegionNames, function(i, r) { 
            var _reg = r.name;
            var _first = _specName.first + "("+ gMYFrom +"-"+ _reg +")";
            var _last = _specName.last + "("+ gMYTo +"-"+ _reg +")";
            
            _createLabel(_first, _last, _reg, 0.1, 20);
        }); 
    }
    else{
        $.each(gRegionNames, function(i, r) { 
            var _region = "("+ r.name +")";
            
            _createLabel(gMYFrom + _region, gMYTo + _region, r.name,  0.1, 10);
        });
    }
    
    //Add cursor
    chart.cursor = new am4charts.XYCursor();
    chart.cursor.fullWidthLineX = false;
    chart.cursor.lineX.strokeWidth = 0;
    chart.cursor.lineX.fill = am4core.color("#000");
    chart.cursor.lineX.fillOpacity = 0.1;
    chart.cursor.behavior = "panX";
    chart.cursor.lineY.disabled = true;
    
    setLegendSize(chart);
    //setWireTrend(_data);
}

function displayCommonLineChart(container){
    
}

function displayCustomLineChart(container){
     var lowerLimit = 0;
    var upperLimit = 0;
    var _wireTypes = gData.groupBy(["wire_type"]);
    var _newData = $.each(_wireTypes, function(i, v){
        var _length = v.items.length;
        
        $.each(v.items, function(x, y){
            if(lowerLimit < y.wire_ll) lowerLimit = y.wire_ll;
            
            if(upperLimit < y.wire_ul) upperLimit = y.wire_ul;
        });
        
        var _sum = v.items.reduce(function (accumulator, currentValue) {
            return accumulator + currentValue.avg_weight;
        }, 0);
        
        var _ll = v.items.reduce(function (accumulator, currentValue) {
            return accumulator + currentValue.wire_ll;
        }, 0);
        
        var _ul = v.items.reduce(function (accumulator, currentValue) {
            return accumulator + currentValue.wire_ul;
        }, 0);
        
        lowerLimit = (_ll / _length);
        upperLimit = (_ul / _length);
        v.avg_weight = (_sum / _length);
    
        return v;
    });
    
    am4core.useTheme(am4themes_animated);   
      
    var chart = am4core.create(container, am4charts.XYChart);
    chart.data = _newData;
    chart.numberFormatter.numberFormat = "#.#####";
    
    // Create axes
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "name";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 20;
    categoryAxis.renderer.labels.template.horizontalCenter = "right";
    categoryAxis.renderer.labels.template.verticalCenter = "middle";
    categoryAxis.renderer.labels.template.rotation = 310;

    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    //valueAxis.max = 5;
    //valueAxis.title.text = "Avg. Weight";
    valueAxis.renderer.minGridDistance = 20;
    //valueAxis.renderer.numberFormatter.numberFormat = "#.#####";
    valueAxis.numberFormatter = new am4core.NumberFormatter();
    valueAxis.numberFormatter.numberFormat = "#.0000";
    
     var axisTooltip = valueAxis.tooltip;
    //axisTooltip.background.fill = am4core.color("#07BEB8");
    // axisTooltip.background.strokeWidth = 0;
    // axisTooltip.background.cornerRadius = 3;
    // axisTooltip.background.pointerLength = 0;
    // axisTooltip.dy = 5;
    axisTooltip.numberFormatter = new am4core.NumberFormatter();
    axisTooltip.numberFormatter.numberFormat = "#.#####";
    
    var axisTooltip = valueAxis.tooltip;
    
    // Create series
    var series = chart.series.push(new am4charts.LineSeries());
    series.dataFields.valueY = "avg_weight";
    series.dataFields.categoryX = "name";
    series.name = "Avg. Weight";
    series.tooltipText = "{name}: [bold]{valueY}[/]";
    series.strokeWidth = 2;
    
    // Add simple bullet
    var circleBullet = series.bullets.push(new am4charts.CircleBullet());
    circleBullet.circle.strokeWidth = 1;
    
    // Create value axis range
    var range = valueAxis.axisRanges.create();
    range.value = upperLimit;
    range.grid.stroke = am4core.color("#396478");
    range.grid.strokeWidth = 2;
    range.grid.strokeOpacity = 1;
    range.label.inside = true;
    range.label.text = "Upper Weight";
    range.label.fill = range.grid.stroke;
    //range.label.align = "right";
    range.label.verticalCenter = "bottom";
    
    var range2 = valueAxis.axisRanges.create();
    range2.value = lowerLimit;
    range2.grid.stroke = am4core.color("#A96478");
    range2.grid.strokeWidth = 2;
    range2.grid.strokeOpacity = 1;
    range2.label.inside = true;
    range2.label.text = "Lower Weight";
    range2.label.fill = range2.grid.stroke;
    //range2.label.align = "right";
    range2.label.verticalCenter = "bottom";
    
    // Add cursor
    chart.cursor = new am4charts.XYCursor();
}

//************************************ CHARTS ********************************//

// Retainer
function displayChartRetainer(container){
    var _data = [];
    var _objKey = getDistinctKey(gData);
    var _value = _objKey.value;
    var _category = _objKey.category;
    var _location = _objKey.location;
    var _categoryObj = gData.groupBy([_category]);
    var _locationObj = gData.groupBy([_location]);
    var _hasLocation = (_location ? true: false);
    
    if(_hasLocation){
        $.each(gRegionNames, function(i, r) { 
            $.each(gModelYears, function(x, my) {
                var _regionName = r.name;
                var _modelYear = my.name;
                var _result = r.items.filter(function (item) {
                	return item.MODEL_YEAR == _modelYear;
                });
                
                $.each(_locationObj, function(y, l) {
                    var _specLocation = l.name;
                    var _json = {
                        REGION_NAME : _regionName,
                        MODEL_YEAR : +_modelYear,
                        category : _specLocation +"("+ _modelYear +"-"+ _regionName +")"
                    };
                    
                    $.each(_categoryObj, function(z, s) {
                        var _count = 0;
                        var _name = s.name;
                        var _nameNew = _name.replace(" ","_");
                        var _result2 = _result.filter(function (item) {
                        	return item[_location] == _specLocation && item[_category] == _name;
                        });

                        if(_value && _value !== ""){
                             _count = _result2.reduce(function (accumulator, currentValue) {
                                return accumulator + currentValue[_value];
                            }, 0)
                        }else{
                            for(; _count < _result2.length; ){
                                _count++;
                            }
                        }
                       
                        _json[_nameNew] = _count;
                    });
                    
                    _data.push(_json);
                }); 
            });
        });
    }
    else{
         $.each(gRegionNames, function(i,r) { 
            $.each(gModelYears, function(x, my) { 
                var _my = my.name;
                var _region = r.name;
                var _obj = {};
                _obj.year = +_my;
                _obj.region = _region;
                _obj.category = _my +"("+ _region +")";
                
                $.each(_categoryObj, function(y, w) { 
                    var _count = 0;
                    var _cName = w.name;
                    var _cNameNew = _cName.replace(" ","_");
                    var _res = r.items.filter(function (item) {
                    	return item[_category] == _cName && item.MODEL_YEAR == _my;
                    });
                    
                    if(_value && _value !== ""){
                         _count = _res.reduce(function (accumulator, currentValue) {
                            return accumulator + currentValue[_value];
                        }, 0);    
                    }else{
                        for(; _count < _res.length; ){
                            _count++;
                        }
                    }
    
                    _obj[_cNameNew] = _count;
                });
                _data.push(_obj);
            });
        });
    }
    
    // Display Chart
    am4core.useTheme(am4themes_animated);
    
    var chart = am4core.create(container, am4charts.XYChart);
    chart.data = _data;
    chart.colors.step = 2;
    chart.padding(15, 15, 10, 15);

    if(_hasLocation){
        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "category";
        categoryAxis.renderer.minGridDistance = 20;
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.interactionsEnabled = false;
        categoryAxis.renderer.labels.template.fontSize = 10;
        categoryAxis.renderer.labels.template.valign = "top";
        categoryAxis.renderer.labels.template.location = 0;
        categoryAxis.renderer.labels.template.rotation = (_hasLocation ? 270: 0);
        categoryAxis.renderer.labels.template.adapter.add("textOutput", function(text) {
            return (!isUD(text) ? text.replace(/\(.*/, "") : text);
        });
    
        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        //valueAxis.title.text = "Count";
        valueAxis.min = 0;
        //valueAxis.max = 100;
        valueAxis.strictMinMax = true;
        valueAxis.calculateTotals = true;
        valueAxis.renderer.minGridDistance = 10;
        // valueAxis.renderer.labels.template.adapter.add("text", function(text) {
        //   return text + "%";
        // });
    
        // Create series
        var _createSeries = function(field, name) {
          var series = chart.series.push(new am4charts.ColumnSeries());
          series.dataFields.valueY = field;
          //series.dataFields.categoryXShow = "totalPercent";
          series.dataFields.categoryX = "category";
          series.name = name;
          series.tooltipText = "[bold]{name}:[/] {valueY.totalPercent.formatNumber('#.00')}% - [bold]{valueY.formatNumber('#,###')}[/]";
          series.tooltip.fontSize = 8;
          series.tooltip.paddingTop = 1;
          series.tooltip.paddingBottom= 1;
          series.tooltip.paddingBottom= 1;
          series.tooltip.dy = -10;
          series.tooltip.align = "top";
          series.stacked = (_hasLocation ? true: false);
          series.columns.template.width = am4core.percent(95);

        }
        
        var _createLabel = function(category, endCategory, label, opacity, dy) {
            var range = categoryAxis.axisRanges.create();
            range.category = category;
            range.endCategory = endCategory;
            range.label.dataItem.text = label;
            range.label.dy = dy;
            //range.label.fontSize = 10;
            range.label.fontWeight = "bold";
            range.label.valign = "bottom";
            range.label.location = 0.5;
            range.label.rotation = 0;
            range.axisFill.fill = am4core.color("#396478");
            range.axisFill.fillOpacity = opacity;
            range.locations.category = 0.1;
            range.locations.endCategory = 0.9;
        };
    }
    else{
        // Create axes
        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "category";
        categoryAxis.numberFormatter.numberFormat = "#";
        //categoryAxis.title.text = "Wire 0.50 and Below";
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.renderer.minGridDistance = 20;
        categoryAxis.renderer.labels.template.adapter.add("textOutput", function(text) {
            return (typeof(text)!=="undefined" ? text.replace(/\(.*/, "") : text);
        });
        
        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        //valueAxis.title.text = "Count";
        valueAxis.min = 0;
        valueAxis.max = 100;
        valueAxis.strictMinMax = true;
        valueAxis.calculateTotals = true;
        // valueAxis.renderer.labels.template.adapter.add("text", function(text) {
        //   return text + "%";
        // });
        
        // Create series
        var _createSeries = function(field, name) {
            var series = chart.series.push(new am4charts.ColumnSeries());
            series.dataFields.valueY = field;
            series.dataFields.valueYShow = "totalPercent";
            series.dataFields.categoryX = "category";
            series.name = name;
            series.tooltipText = "[bold]{name}:[/] {valueY.totalPercent.formatNumber('#.00')}% - [bold]{valueY.formatNumber('#,###')}[/]";
            series.tooltip.fontSize = 8;
            series.tooltip.dy = -10;
            //series.tooltip.align = "top";
            
            series.tooltip.valign  = "top";
            series.tooltip.tooltipPosition = "fixed";
            series.tooltip.background.filters.clear();
            //series.tooltip.pointerOrientation  = true;
            series.tooltip.fixedWidthGrid = true;
            series.tooltip.layout = "none";
            series.tooltip.pointerOrientation = "horizontal";
            //series.tooltip.label.minWidth = 40;
            //series.tooltip.label.minHeight = 40;
            series.tooltip.label.textAlign = "middle";
            series.tooltip.label.textValign = "middle";
        };
         
        var _createLabel = function(category, endCategory, label) {
            var range = categoryAxis.axisRanges.create();
            range.category = category;
            range.endCategory = endCategory;
            range.label.dataItem.text = label;
            range.label.dy = 18;
            range.label.fontWeight = "bold";
            range.axisFill.fill = am4core.color("#396478");
            range.axisFill.fillOpacity = 0.1;
            range.locations.category = 0.1;
            range.locations.endCategory = 0.9;
        };
    }
    
    $.each(_categoryObj, function(i, v) { 
        var _name = v.name;
        var _nameNew = _name.replace(" ","_");

        _createSeries(_nameNew, _name);
    }); 
    
    if(_hasLocation){
       var _specName = getFirstAndLastItem(_locationObj , "name");
        
        $.each(gModelYears, function(i, v) { 
            var _my = v.name;
            
            $.each(gRegionNames, function(i, r) { 
                var _reg = r.name;
                var _first = _specName.first + "("+ _my +"-"+ _reg +")";
                var _last = _specName.last + "("+ _my +"-"+ _reg +")";
                
                _createLabel(_first, _last, _my, 0, 10);
            });
        });
        
        $.each(gRegionNames, function(i, r) { 
            var _reg = r.name;
            var _first = _specName.first + "("+ gMYFrom +"-"+ _reg +")";
            var _last = _specName.last + "("+ gMYTo +"-"+ _reg +")";
            
            _createLabel(_first, _last, _reg, 0.1, 20);
        }); 
    }
    else{
        $.each(gRegionNames, function(i, r) { 
            var _region = "("+ r.name +")";
            
            _createLabel(gMYFrom + _region, gMYTo + _region, r.name,  0.1, 10);
        });
    }
    
    //Add cursor
    chart.cursor = new am4charts.XYCursor();
    chart.cursor.fullWidthLineX = false;
    chart.cursor.lineX.strokeWidth = 0;
    chart.cursor.lineX.fill = am4core.color("#000");
    chart.cursor.lineX.fillOpacity = 0.1;
    chart.cursor.behavior = "panX";
    chart.cursor.lineY.disabled = true;
    
    setLegendSize(chart);
}

// Covering
function displayChartCovering(container){
    if(gData.length > 0){
        var _data = [];
        var _objKey = getDistinctKey(gData);
        var _value = _objKey.value;
        var _category = _objKey.category;
        var _location = _objKey.location;
        var _categoryObj = gData.groupBy([_category]);
        var _locationObj = gData.groupBy([_location]);
        var _hasLocation = (_location ? true: false);

        if(_hasLocation){
            $.each(gRegionNames, function(i, r) { 
                $.each(gModelYears, function(x, my) {
                    var _regionName = r.name;
                    var _modelYear = my.name;
                    var _result = r.items.filter(function (item) {
                    	return item.MODEL_YEAR == _modelYear;
                    });
                    
                    $.each(_locationObj, function(y, l) {
                        var _specLocation = l.name;
                        var _json = {
                            REGION_NAME : _regionName,
                            MODEL_YEAR : +_modelYear,
                            category : _specLocation +"("+ _modelYear +"-"+ _regionName +")"
                        };
                        
                        $.each(_categoryObj, function(z, s) {
                            var _count = 0;
                            var _name = s.name;
                            var _nameNew = _name.replace(" ","_");
                            var _result2 = _result.filter(function (item) {
                            	return item[_location] == _specLocation && item[_category] == _name;
                            });
    
                            if(_value && _value !== ""){
                                 _count = _result2.reduce(function (accumulator, currentValue) {
                                    return accumulator + currentValue[_value];
                                }, 0)
                            }else{
                                for(; _count < _result2.length; ){
                                    _count++;
                                }
                            }
                           
                            _json[_nameNew] = _count;
                        });
                        
                        _data.push(_json);
                    }); 
                });
            });
        }
        else{
             $.each(gRegionNames, function(i,r) { 
                $.each(gModelYears, function(x, my) { 
                    var _my = my.name;
                    var _region = r.name;
                    var _obj = {};
                    _obj.year = +_my;
                    _obj.region = _region;
                    _obj.category = _my +"("+ _region +")";
                    
                    $.each(_categoryObj, function(y, w) { 
                        var _count = 0;
                        var _cName = w.name;
                        var _cNameNew = _cName.replace(" ","_");
                        var _res = r.items.filter(function (item) {
                        	return item[_category] == _cName && item.MODEL_YEAR == _my;
                        });
                        
                        if(_value && _value !== ""){
                             _count = _res.reduce(function (accumulator, currentValue) {
                                return accumulator + currentValue[_value];
                            }, 0);    
                        }else{
                            for(; _count < _res.length; ){
                                _count++;
                            }
                        }
        
                        _obj[_cNameNew] = _count;
                    });
                    _data.push(_obj);
                });
            });
        }
        
        // Display Chart
        am4core.useTheme(am4themes_animated);
        
        var chart = am4core.create(container, am4charts.XYChart);
        chart.data = _data;
        chart.colors.step = 2;
        chart.padding(15, 15, 10, 15);
    
        if(_hasLocation){
            var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            categoryAxis.dataFields.category = "category";
            categoryAxis.renderer.minGridDistance = 20;
            categoryAxis.renderer.grid.template.location = 0;
            categoryAxis.interactionsEnabled = false;
            categoryAxis.renderer.labels.template.fontSize = 10;
            categoryAxis.renderer.labels.template.valign = "top";
            categoryAxis.renderer.labels.template.location = 0;
            categoryAxis.renderer.labels.template.rotation = (_hasLocation ? 270: 0);
            categoryAxis.renderer.labels.template.adapter.add("textOutput", function(text) {
                return (!isUD(text) ? text.replace(/\(.*/, "") : text);
            });
        
            var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            //valueAxis.title.text = "Count";
            valueAxis.min = 0;
            //valueAxis.max = 100;
            valueAxis.strictMinMax = true;
            valueAxis.calculateTotals = true;
            valueAxis.renderer.minGridDistance = 10;
            valueAxis.renderer.labels.template.adapter.add("text", function(text) {
              return text + "%";
            });
        
            // Create series
            var _createSeries = function(field, name) {
              var series = chart.series.push(new am4charts.ColumnSeries());
              series.dataFields.valueY = field;
              //series.dataFields.categoryXShow = "totalPercent";
              series.dataFields.categoryX = "category";
              series.name = name;
              series.tooltipText = "[bold]{name}:[/] {valueY.totalPercent.formatNumber('#.00')}% - [bold]{valueY.formatNumber('#,###')}[/]";
              series.tooltip.fontSize = 8;
              series.tooltip.paddingTop = 1;
              series.tooltip.paddingBottom= 1;
              series.tooltip.paddingBottom= 1;
              series.tooltip.dy = -10;
              series.tooltip.align = "top";
              series.stacked = (_hasLocation ? true: false);
              series.columns.template.width = am4core.percent(95);
    
            }
            
            var _createLabel = function(category, endCategory, label, opacity, dy) {
                var range = categoryAxis.axisRanges.create();
                range.category = category;
                range.endCategory = endCategory;
                range.label.dataItem.text = label;
                range.label.dy = dy;
                //range.label.fontSize = 10;
                range.label.fontWeight = "bold";
                range.label.valign = "bottom";
                range.label.location = 0.5;
                range.label.rotation = 0;
                range.axisFill.fill = am4core.color("#396478");
                range.axisFill.fillOpacity = opacity;
                range.locations.category = 0.1;
                range.locations.endCategory = 0.9;
            };
        }
        else{
            // Create axes
            var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            categoryAxis.dataFields.category = "category";
            categoryAxis.numberFormatter.numberFormat = "#";
            //categoryAxis.title.text = "Wire 0.50 and Below";
            categoryAxis.renderer.grid.template.location = 0;
            categoryAxis.renderer.minGridDistance = 20;
            categoryAxis.renderer.labels.template.adapter.add("textOutput", function(text) {
                return (typeof(text)!=="undefined" ? text.replace(/\(.*/, "") : text);
            });
            
            var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            //valueAxis.title.text = "Count";
            valueAxis.min = 0;
            valueAxis.max = 100;
            valueAxis.strictMinMax = true;
            valueAxis.calculateTotals = true;
            valueAxis.renderer.labels.template.adapter.add("text", function(text) {
              return text + "%";
            });
            
            // Create series
            var _createSeries = function(field, name) {
                var series = chart.series.push(new am4charts.ColumnSeries());
                series.dataFields.valueY = field;
                series.dataFields.valueYShow = "totalPercent";
                series.dataFields.categoryX = "category";
                series.name = name;
                series.tooltipText = "[bold]{name}:[/] {valueY.totalPercent.formatNumber('#.00')}% - [bold]{valueY.formatNumber('#,###')}[/]";
                series.tooltip.fontSize = 8;
                series.tooltip.dy = -10;
                //series.tooltip.align = "top";
                
                series.tooltip.valign  = "top";
                series.tooltip.tooltipPosition = "fixed";
                series.tooltip.background.filters.clear();
                //series.tooltip.pointerOrientation  = true;
                series.tooltip.fixedWidthGrid = true;
                series.tooltip.layout = "none";
                series.tooltip.pointerOrientation = "horizontal";
                //series.tooltip.label.minWidth = 40;
                //series.tooltip.label.minHeight = 40;
                series.tooltip.label.textAlign = "middle";
                series.tooltip.label.textValign = "middle";
            };
             
            var _createLabel = function(category, endCategory, label) {
                var range = categoryAxis.axisRanges.create();
                range.category = category;
                range.endCategory = endCategory;
                range.label.dataItem.text = label;
                range.label.dy = 18;
                range.label.fontWeight = "bold";
                range.axisFill.fill = am4core.color("#396478");
                range.axisFill.fillOpacity = 0.1;
                range.locations.category = 0.1;
                range.locations.endCategory = 0.9;
            };
        }
        
        $.each(_categoryObj, function(i, v) { 
            var _name = v.name;
            var _nameNew = _name.replace(" ","_");
    
            _createSeries(_nameNew, _name);
        }); 
        
        if(_hasLocation){
           var _specName = getFirstAndLastItem(_locationObj , "name");
            
            $.each(gModelYears, function(i, v) { 
                var _my = v.name;
                
                $.each(gRegionNames, function(i, r) { 
                    var _reg = r.name;
                    var _first = _specName.first + "("+ _my +"-"+ _reg +")";
                    var _last = _specName.last + "("+ _my +"-"+ _reg +")";
                    
                    _createLabel(_first, _last, _my, 0, 10);
                });
            });
            
            $.each(gRegionNames, function(i, r) { 
                var _reg = r.name;
                var _first = _specName.first + "("+ gMYFrom +"-"+ _reg +")";
                var _last = _specName.last + "("+ gMYTo +"-"+ _reg +")";
                
                _createLabel(_first, _last, _reg, 0.1, 20);
            }); 
        }
        else{
            $.each(gRegionNames, function(i, r) { 
                var _region = "("+ r.name +")";
                
                _createLabel(gMYFrom + _region, gMYTo + _region, r.name,  0.1, 10);
            });
        }
        
        //Add cursor
        chart.cursor = new am4charts.XYCursor();
        chart.cursor.fullWidthLineX = false;
        chart.cursor.lineX.strokeWidth = 0;
        chart.cursor.lineX.fill = am4core.color("#000");
        chart.cursor.lineX.fillOpacity = 0.1;
        chart.cursor.behavior = "panX";
        chart.cursor.lineY.disabled = true;
        
        setLegendSize(chart);
        //setWireTrend(_data);
    }
}

// Ground Eyelet
function displayPieGroundEyelet(container){
    var _data = [];
    var _dynamicKey = getDistinctKey(gData);
    var _value = _dynamicKey.value;
    var _category = _dynamicKey.category;
    var _dynamicObj = gData.groupBy([_category]);
    
    $.each(gModelYears, function(x, my) { 
        var _my = my.name;

        $.each(_dynamicObj, function(y, w) { 
            var _count = 0;
            var _cName = w.name;
            //var _cNameNew = _cName.replace(".","_");
            var _res = w.items.filter(function (item) {
            	return item[_category] == _cName && item.MODEL_YEAR == _my;
            });

            if(_value && _value !== ""){
                 _count = _res.reduce(function (accumulator, currentValue) {
                    return accumulator + currentValue[_value];
                }, 0);    
            }else{
                for(; _count < _res.length; ){
                    _count++;
                }
            }
            
            _data.push({
                model_year: +_my,
                category: _cName,
                value: _count
            });
        });
        
    });

    var container = am4core.create(container, am4core.Container);
    container.width = am4core.percent(100);
    container.height = am4core.percent(100);
    container.layout = "horizontal";
    console.log("_data", _data);
    var _createChart = function(data, year){
        var chart = container.createChild(am4charts.PieChart);
        chart.data = data;
        chart.paddingTop= 15;
        chart.paddingBottom = 15;
        
        var title = chart.titles.create();
        title.text =  "MY" + year;
        //title.fontSize = 12;
        title.fontWeight = 800;
        title.marginBottom = 0;
        
        // Add and configure Series
        var pieSeries = chart.series.push(new am4charts.PieSeries());
        pieSeries.dataFields.value = "value";
        pieSeries.dataFields.category = "category";
        pieSeries.slices.template.propertyFields.fill = "color";
        pieSeries.slices.template.propertyFields.isActive = "pulled";
        pieSeries.slices.template.strokeWidth = 0;
        pieSeries.paddingBottom = 10;
        pieSeries.colors.step = 2;
        
        pieSeries.ticks.template.disabled = true;
        pieSeries.alignLabels = false;
        pieSeries.labels.template.fontSize = 12;
        pieSeries.labels.template.text = "{value.percent.formatNumber('#.00')}%";
        pieSeries.labels.template.radius = am4core.percent(-40);
        //pieSeries.labels.template.relativeRotation = 90;
        pieSeries.labels.template.fill = am4core.color("white");
        pieSeries.legendSettings.valueText = "{valueY.close}";
        pieSeries.labels.template.adapter.add("text", function(text, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return "";
            }
            return text;
        });
        
        setLegendSize(chart);
    };

    $.each(gModelYears, function(i, v){
        var _my = v.name;
        var _res = _data.filter(function (item) {
        	return item.model_year == _my;
        });

        _createChart(_res, _my);
    });
}

function displayColumnGroundEyelet(container){
    if(gData.length > 0){
        var _data = [];
        var _objKey = getDistinctKey(gData);
        var _value = _objKey.value;
        var _category = _objKey.category;
        var _location = _objKey.location;
        var _categoryObj = gData.groupBy([_category]);
        var _locationObj = gData.groupBy([_location]);
        var _hasLocation = (_location ? true: false);

        if(_hasLocation){
            $.each(gRegionNames, function(i, r) { 
                $.each(gModelYears, function(x, my) {
                    var _regionName = r.name;
                    var _modelYear = my.name;
                    var _result = r.items.filter(function (item) {
                    	return item.MODEL_YEAR == _modelYear;
                    });
                    
                    $.each(_locationObj, function(y, l) {
                        var _specLocation = l.name;
                        var _json = {
                            REGION_NAME : _regionName,
                            MODEL_YEAR : +_modelYear,
                            category : _specLocation +"("+ _modelYear +"-"+ _regionName +")"
                        };
                        
                        $.each(_categoryObj, function(z, s) {
                            var _count = 0;
                            var _name = s.name;
                            var _nameNew = _name.replace(" ","_");
                            var _result2 = _result.filter(function (item) {
                            	return item[_location] == _specLocation && item[_category] == _name;
                            });
    
                            if(_value && _value !== ""){
                                 _count = _result2.reduce(function (accumulator, currentValue) {
                                    return accumulator + currentValue[_value];
                                }, 0)
                            }else{
                                for(; _count < _result2.length; ){
                                    _count++;
                                }
                            }
                           
                            _json[_nameNew] = _count;
                        });
                        
                        _data.push(_json);
                    }); 
                });
            });
        }
        else{
             $.each(gRegionNames, function(i,r) { 
                $.each(gModelYears, function(x, my) { 
                    var _my = my.name;
                    var _region = r.name;
                    var _obj = {};
                    _obj.year = +_my;
                    _obj.region = _region;
                    _obj.category = _my +"("+ _region +")";
                    
                    $.each(_categoryObj, function(y, w) { 
                        var _count = 0;
                        var _cName = w.name;
                        var _cNameNew = _cName.replace(" ","_");
                        var _res = r.items.filter(function (item) {
                        	return item[_category] == _cName && item.MODEL_YEAR == _my;
                        });
                        
                        if(_value && _value !== ""){
                             _count = _res.reduce(function (accumulator, currentValue) {
                                return accumulator + currentValue[_value];
                            }, 0);    
                        }else{
                            for(; _count < _res.length; ){
                                _count++;
                            }
                        }
        
                        _obj[_cNameNew] = _count;
                    });
                    _data.push(_obj);
                });
            });
        }
        
        // Display Chart
        am4core.useTheme(am4themes_animated);
        
        var chart = am4core.create(container, am4charts.XYChart);
        chart.data = _data;
        chart.colors.step = 2;
        chart.padding(15, 15, 10, 15);
    
        if(_hasLocation){
            var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            categoryAxis.dataFields.category = "category";
            categoryAxis.renderer.minGridDistance = 20;
            categoryAxis.renderer.grid.template.location = 0;
            categoryAxis.interactionsEnabled = false;
            categoryAxis.renderer.labels.template.fontSize = 10;
            categoryAxis.renderer.labels.template.valign = "top";
            categoryAxis.renderer.labels.template.location = 0;
            categoryAxis.renderer.labels.template.rotation = (_hasLocation ? 270: 0);
            categoryAxis.renderer.labels.template.adapter.add("textOutput", function(text) {
                return (!isUD(text) ? text.replace(/\(.*/, "") : text);
            });
        
            var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            //valueAxis.title.text = "Count";
            valueAxis.min = 0;
            //valueAxis.max = 100;
            valueAxis.strictMinMax = true;
            valueAxis.calculateTotals = true;
            valueAxis.renderer.minGridDistance = 10;
            valueAxis.renderer.labels.template.adapter.add("text", function(text) {
              return text + "%";
            });
        
            // Create series
            var _createSeries = function(field, name) {
              var series = chart.series.push(new am4charts.ColumnSeries());
              series.dataFields.valueY = field;
              //series.dataFields.categoryXShow = "totalPercent";
              series.dataFields.categoryX = "category";
              series.name = name;
              series.tooltipText = "[bold]{name}:[/] {valueY.totalPercent.formatNumber('#.00')}% - [bold]{valueY.formatNumber('#,###')}[/]";
              series.tooltip.fontSize = 8;
              series.tooltip.paddingTop = 1;
              series.tooltip.paddingBottom= 1;
              series.tooltip.paddingBottom= 1;
              series.tooltip.dy = -10;
              series.tooltip.align = "top";
              series.stacked = (_hasLocation ? true: false);
              series.columns.template.width = am4core.percent(95);
    
            }
            
            var _createLabel = function(category, endCategory, label, opacity, dy) {
                var range = categoryAxis.axisRanges.create();
                range.category = category;
                range.endCategory = endCategory;
                range.label.dataItem.text = label;
                range.label.dy = dy;
                //range.label.fontSize = 10;
                range.label.fontWeight = "bold";
                range.label.valign = "bottom";
                range.label.location = 0.5;
                range.label.rotation = 0;
                range.axisFill.fill = am4core.color("#396478");
                range.axisFill.fillOpacity = opacity;
                range.locations.category = 0.1;
                range.locations.endCategory = 0.9;
            };
        }
        else{
            // Create axes
            var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            categoryAxis.dataFields.category = "category";
            categoryAxis.numberFormatter.numberFormat = "#";
            //categoryAxis.title.text = "Wire 0.50 and Below";
            categoryAxis.renderer.grid.template.location = 0;
            categoryAxis.renderer.minGridDistance = 20;
            categoryAxis.renderer.labels.template.adapter.add("textOutput", function(text) {
                return (typeof(text)!=="undefined" ? text.replace(/\(.*/, "") : text);
            });
            
            var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            //valueAxis.title.text = "Count";
            valueAxis.min = 0;
            valueAxis.max = 100;
            valueAxis.strictMinMax = true;
            valueAxis.calculateTotals = true;
            valueAxis.renderer.labels.template.adapter.add("text", function(text) {
              return text + "%";
            });
            
            // Create series
            var _createSeries = function(field, name) {
                var series = chart.series.push(new am4charts.ColumnSeries());
                series.dataFields.valueY = field;
                series.dataFields.valueYShow = "totalPercent";
                series.dataFields.categoryX = "category";
                series.name = name;
                series.tooltipText = "[bold]{name}:[/] {valueY.totalPercent.formatNumber('#.00')}% - [bold]{valueY.formatNumber('#,###')}[/]";
                series.tooltip.fontSize = 8;
                series.tooltip.dy = -10;
                //series.tooltip.align = "top";
                
                series.tooltip.valign  = "top";
                series.tooltip.tooltipPosition = "fixed";
                series.tooltip.background.filters.clear();
                //series.tooltip.pointerOrientation  = true;
                series.tooltip.fixedWidthGrid = true;
                series.tooltip.layout = "none";
                series.tooltip.pointerOrientation = "horizontal";
                //series.tooltip.label.minWidth = 40;
                //series.tooltip.label.minHeight = 40;
                series.tooltip.label.textAlign = "middle";
                series.tooltip.label.textValign = "middle";
            };
             
            var _createLabel = function(category, endCategory, label) {
                var range = categoryAxis.axisRanges.create();
                range.category = category;
                range.endCategory = endCategory;
                range.label.dataItem.text = label;
                range.label.dy = 18;
                range.label.fontWeight = "bold";
                range.axisFill.fill = am4core.color("#396478");
                range.axisFill.fillOpacity = 0.1;
                range.locations.category = 0.1;
                range.locations.endCategory = 0.9;
            };
        }
        
        $.each(_categoryObj, function(i, v) { 
            var _name = v.name;
            var _nameNew = _name.replace(" ","_");
    
            _createSeries(_nameNew, _name);
        }); 
        
        if(_hasLocation){
           var _specName = getFirstAndLastItem(_locationObj , "name");
            
            $.each(gModelYears, function(i, v) { 
                var _my = v.name;
                
                $.each(gRegionNames, function(i, r) { 
                    var _reg = r.name;
                    var _first = _specName.first + "("+ _my +"-"+ _reg +")";
                    var _last = _specName.last + "("+ _my +"-"+ _reg +")";
                    
                    _createLabel(_first, _last, _my, 0, 10);
                });
            });
            
            $.each(gRegionNames, function(i, r) { 
                var _reg = r.name;
                var _first = _specName.first + "("+ gMYFrom +"-"+ _reg +")";
                var _last = _specName.last + "("+ gMYTo +"-"+ _reg +")";
                
                _createLabel(_first, _last, _reg, 0.1, 20);
            }); 
        }
        else{
            $.each(gRegionNames, function(i, r) { 
                var _region = "("+ r.name +")";
                
                _createLabel(gMYFrom + _region, gMYTo + _region, r.name,  0.1, 10);
            });
        }
        
        //Add cursor
        chart.cursor = new am4charts.XYCursor();
        chart.cursor.fullWidthLineX = false;
        chart.cursor.lineX.strokeWidth = 0;
        chart.cursor.lineX.fill = am4core.color("#000");
        chart.cursor.lineX.fillOpacity = 0.1;
        chart.cursor.behavior = "panX";
        chart.cursor.lineY.disabled = true;
        
        setLegendSize(chart);
        //setWireTrend(_data);
    }
}

// Grommets
function displayPieGrommets(container){
    var _data = [];
    var _dynamicKey = getDistinctKey(gData);
    var _value = _dynamicKey.value;
    var _category = _dynamicKey.category;
    var _dynamicObj = gData.groupBy([_category]);
    
    $.each(gModelYears, function(x, my) { 
        var _my = my.name;
        $.each(_dynamicObj, function(y, w) {
            var _count = 0;
            var _name = w.name;
            //var _nameNew = _name.replace(".","_");
            var _res = w.items.filter(function (item) {
            	return item[_category] == _name && item.MODEL_YEAR == _my;
            });

            if(_value && _value !== ""){
                 _count = _res.reduce(function (accumulator, currentValue) {
                    return accumulator + currentValue[_value];
                }, 0);    
            }
            else{
                for(; _count < _res.length; ){
                    _count++;
                }
            }
            
            _data.push({
                model_year: +_my,
                category: _name,
                value: _count
            });
        });
        
    });

    var container = am4core.create(container, am4core.Container);
    container.width = am4core.percent(100);
    container.height = am4core.percent(100);
    container.layout = "horizontal";
    
    var _createChart = function(data, year){
        var chart = container.createChild(am4charts.PieChart);
        chart.data = data;
        chart.paddingTop= 15;
        chart.paddingBottom = 15;
        
        var title = chart.titles.create();
        title.text =  "MY" + year;
        //title.fontSize = 12;
        title.fontWeight = 800;
        title.marginBottom = 0;
        
        // Add and configure Series
        var pieSeries = chart.series.push(new am4charts.PieSeries());
        pieSeries.dataFields.value = "value";
        pieSeries.dataFields.category = "category";
        pieSeries.slices.template.propertyFields.fill = "color";
        pieSeries.slices.template.propertyFields.isActive = "pulled";
        pieSeries.slices.template.strokeWidth = 0;
        pieSeries.paddingBottom = 10;
        pieSeries.colors.step = 2;
        
        pieSeries.ticks.template.disabled = true;
        pieSeries.alignLabels = false;
        pieSeries.labels.template.fontSize = 12;
        pieSeries.labels.template.text = "{value.percent.formatNumber('#.00')}%";
        pieSeries.labels.template.radius = am4core.percent(-40);
        //pieSeries.labels.template.relativeRotation = 90;
        pieSeries.labels.template.fill = am4core.color("white");
        pieSeries.legendSettings.valueText = "{valueY.close}";
        pieSeries.labels.template.adapter.add("text", function(text, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return "";
            }
            return text;
        });
        
        setLegendSize(chart);
    };

    $.each(gModelYears, function(i, v){
        var _my = v.name;
        var _res = _data.filter(function (item) {
        	return item.model_year == _my;
        });

        _createChart(_res, _my);
    });
}

function displayColumnGrommets(container){
    if(gData.length > 0){
        var _data = [];
        var _objKey = getDistinctKey(gData);
        var _value = _objKey.value;
        var _category = _objKey.category;
        var _location = _objKey.location;
        var _categoryObj = gData.groupBy([_category]);
        var _locationObj = gData.groupBy([_location]);
        var _hasLocation = (_location ? true: false);

        if(_hasLocation){
            $.each(gRegionNames, function(i, r) { 
                $.each(gModelYears, function(x, my) {
                    var _regionName = r.name;
                    var _modelYear = my.name;
                    var _result = r.items.filter(function (item) {
                    	return item.MODEL_YEAR == _modelYear;
                    });
                    
                    $.each(_locationObj, function(y, l) {
                        var _specLocation = l.name;
                        var _json = {
                            REGION_NAME : _regionName,
                            MODEL_YEAR : +_modelYear,
                            category : _specLocation +"("+ _modelYear +"-"+ _regionName +")"
                        };
                        
                        $.each(_categoryObj, function(z, s) {
                            var _count = 0;
                            var _name = s.name;
                            var _nameNew = _name.replace(" ","_");
                            var _result2 = _result.filter(function (item) {
                            	return item[_location] == _specLocation && item[_category] == _name;
                            });
    
                            if(_value && _value !== ""){
                                 _count = _result2.reduce(function (accumulator, currentValue) {
                                    return accumulator + currentValue[_value];
                                }, 0)
                            }else{
                                for(; _count < _result2.length; ){
                                    _count++;
                                }
                            }
                           
                            _json[_nameNew] = _count;
                        });
                        
                        _data.push(_json);
                    }); 
                });
            });
        }
        else{
             $.each(gRegionNames, function(i,r) { 
                $.each(gModelYears, function(x, my) { 
                    var _my = my.name;
                    var _region = r.name;
                    var _obj = {};
                    _obj.year = +_my;
                    _obj.region = _region;
                    _obj.category = _my +"("+ _region +")";
                    
                    $.each(_categoryObj, function(y, w) { 
                        var _count = 0;
                        var _cName = w.name;
                        var _cNameNew = _cName.replace(" ","_");
                        var _res = r.items.filter(function (item) {
                        	return item[_category] == _cName && item.MODEL_YEAR == _my;
                        });
                        
                        if(_value && _value !== ""){
                             _count = _res.reduce(function (accumulator, currentValue) {
                                return accumulator + currentValue[_value];
                            }, 0);    
                        }else{
                            for(; _count < _res.length; ){
                                _count++;
                            }
                        }
        
                        _obj[_cNameNew] = _count;
                    });
                    _data.push(_obj);
                });
            });
        }
        
        // Display Chart
        am4core.useTheme(am4themes_animated);
        
        var chart = am4core.create(container, am4charts.XYChart);
        chart.data = _data;
        chart.colors.step = 2;
        chart.padding(15, 15, 10, 15);
    
        if(_hasLocation){
            var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            categoryAxis.dataFields.category = "category";
            categoryAxis.renderer.minGridDistance = 20;
            categoryAxis.renderer.grid.template.location = 0;
            categoryAxis.interactionsEnabled = false;
            categoryAxis.renderer.labels.template.fontSize = 10;
            categoryAxis.renderer.labels.template.valign = "top";
            categoryAxis.renderer.labels.template.location = 0;
            categoryAxis.renderer.labels.template.rotation = (_hasLocation ? 270: 0);
            categoryAxis.renderer.labels.template.adapter.add("textOutput", function(text) {
                return (!isUD(text) ? text.replace(/\(.*/, "") : text);
            });
        
            var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            //valueAxis.title.text = "Count";
            valueAxis.min = 0;
            //valueAxis.max = 100;
            valueAxis.strictMinMax = true;
            valueAxis.calculateTotals = true;
            valueAxis.renderer.minGridDistance = 10;
            valueAxis.renderer.labels.template.adapter.add("text", function(text) {
              return text + "%";
            });
        
            // Create series
            var _createSeries = function(field, name) {
              var series = chart.series.push(new am4charts.ColumnSeries());
              series.dataFields.valueY = field;
              //series.dataFields.categoryXShow = "totalPercent";
              series.dataFields.categoryX = "category";
              series.name = name;
              series.tooltipText = "[bold]{name}:[/] {valueY.totalPercent.formatNumber('#.00')}% - [bold]{valueY.formatNumber('#,###')}[/]";
              series.tooltip.fontSize = 8;
              series.tooltip.paddingTop = 1;
              series.tooltip.paddingBottom= 1;
              series.tooltip.paddingBottom= 1;
              series.tooltip.dy = -10;
              series.tooltip.align = "top";
              series.stacked = (_hasLocation ? true: false);
              series.columns.template.width = am4core.percent(95);
    
            }
            
            var _createLabel = function(category, endCategory, label, opacity, dy) {
                var range = categoryAxis.axisRanges.create();
                range.category = category;
                range.endCategory = endCategory;
                range.label.dataItem.text = label;
                range.label.dy = dy;
                //range.label.fontSize = 10;
                range.label.fontWeight = "bold";
                range.label.valign = "bottom";
                range.label.location = 0.5;
                range.label.rotation = 0;
                range.axisFill.fill = am4core.color("#396478");
                range.axisFill.fillOpacity = opacity;
                range.locations.category = 0.1;
                range.locations.endCategory = 0.9;
            };
        }
        else{
            // Create axes
            var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            categoryAxis.dataFields.category = "category";
            categoryAxis.numberFormatter.numberFormat = "#";
            //categoryAxis.title.text = "Wire 0.50 and Below";
            categoryAxis.renderer.grid.template.location = 0;
            categoryAxis.renderer.minGridDistance = 20;
            categoryAxis.renderer.labels.template.adapter.add("textOutput", function(text) {
                return (typeof(text)!=="undefined" ? text.replace(/\(.*/, "") : text);
            });
            
            var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            //valueAxis.title.text = "Count";
            valueAxis.min = 0;
            valueAxis.max = 100;
            valueAxis.strictMinMax = true;
            valueAxis.calculateTotals = true;
            valueAxis.renderer.labels.template.adapter.add("text", function(text) {
              return text + "%";
            });
            
            // Create series
            var _createSeries = function(field, name) {
                var series = chart.series.push(new am4charts.ColumnSeries());
                series.dataFields.valueY = field;
                series.dataFields.valueYShow = "totalPercent";
                series.dataFields.categoryX = "category";
                series.name = name;
                series.tooltipText = "[bold]{name}:[/] {valueY.totalPercent.formatNumber('#.00')}% - [bold]{valueY.formatNumber('#,###')}[/]";
                series.tooltip.fontSize = 8;
                series.tooltip.dy = -10;
                //series.tooltip.align = "top";
                
                series.tooltip.valign  = "top";
                series.tooltip.tooltipPosition = "fixed";
                series.tooltip.background.filters.clear();
                //series.tooltip.pointerOrientation  = true;
                series.tooltip.fixedWidthGrid = true;
                series.tooltip.layout = "none";
                series.tooltip.pointerOrientation = "horizontal";
                //series.tooltip.label.minWidth = 40;
                //series.tooltip.label.minHeight = 40;
                series.tooltip.label.textAlign = "middle";
                series.tooltip.label.textValign = "middle";
            };
             
            var _createLabel = function(category, endCategory, label) {
                var range = categoryAxis.axisRanges.create();
                range.category = category;
                range.endCategory = endCategory;
                range.label.dataItem.text = label;
                range.label.dy = 18;
                range.label.fontWeight = "bold";
                range.axisFill.fill = am4core.color("#396478");
                range.axisFill.fillOpacity = 0.1;
                range.locations.category = 0.1;
                range.locations.endCategory = 0.9;
            };
        }
        
        $.each(_categoryObj, function(i, v) { 
            var _name = v.name;
            var _nameNew = _name.replace(" ","_");
    
            _createSeries(_nameNew, _name);
        }); 
        
        if(_hasLocation){
           var _specName = getFirstAndLastItem(_locationObj , "name");
            
            $.each(gModelYears, function(i, v) { 
                var _my = v.name;
                
                $.each(gRegionNames, function(i, r) { 
                    var _reg = r.name;
                    var _first = _specName.first + "("+ _my +"-"+ _reg +")";
                    var _last = _specName.last + "("+ _my +"-"+ _reg +")";
                    
                    _createLabel(_first, _last, _my, 0, 10);
                });
            });
            
            $.each(gRegionNames, function(i, r) { 
                var _reg = r.name;
                var _first = _specName.first + "("+ gMYFrom +"-"+ _reg +")";
                var _last = _specName.last + "("+ gMYTo +"-"+ _reg +")";
                
                _createLabel(_first, _last, _reg, 0.1, 20);
            }); 
        }
        else{
            $.each(gRegionNames, function(i, r) { 
                var _region = "("+ r.name +")";
                
                _createLabel(gMYFrom + _region, gMYTo + _region, r.name,  0.1, 10);
            });
        }
        
        //Add cursor
        chart.cursor = new am4charts.XYCursor();
        chart.cursor.fullWidthLineX = false;
        chart.cursor.lineX.strokeWidth = 0;
        chart.cursor.lineX.fill = am4core.color("#000");
        chart.cursor.lineX.fillOpacity = 0.1;
        chart.cursor.behavior = "panX";
        chart.cursor.lineY.disabled = true;
        
        setLegendSize(chart);
        //setWireTrend(_data);
    }
}

// Trough Shield Bracket
function displayPieSTC(container){
    var _data = [];
    var _dynamicKey = getDistinctKey(gData);
    var _value = _dynamicKey.value;
    var _category = _dynamicKey.category;
    var _dynamicObj = gData.groupBy([_category]);
    var _chartArr = [];
        
    $.each(gModelYears, function(x, my) { 
        var _my = my.name;
        
        $.each(_dynamicObj, function(y, w) { 
            var _count = 0;
            var _cName = w.name;
            //var _cNameNew = _cName.replace(".","_");
            var _res = w.items.filter(function (item) {
            	return item[_category] == _cName && item.MODEL_YEAR == _my;
            });
            
            if(_value && _value !== ""){
                 _count = _res.reduce(function (accumulator, currentValue) {
                    return accumulator + currentValue[_value];
                }, 0);    
            }else{
                for(; _count < _res.length; ){
                    _count++;
                }
            }
            
            _data.push({
                model_year: +_my,
                category: _cName,
                value: _count
            });
        });
        
    });

    var container = am4core.create(container, am4core.Container);
    container.width = am4core.percent(100);
    container.height = am4core.percent(100);
    container.layout = "horizontal";
    
    var _createChart = function(data, year){
        var chart = container.createChild(am4charts.PieChart);
        chart.data = data;
        chart.paddingTop= 15;
        chart.paddingBottom = 15;
        
        var title = chart.titles.create();
        title.text =  "MY" + year;
        //title.fontSize = 12;
        title.fontWeight = 800;
        title.marginBottom = 0;
        
        // Add and configure Series
        var pieSeries = chart.series.push(new am4charts.PieSeries());
        pieSeries.dataFields.value = "value";
        pieSeries.dataFields.category = "category";
        pieSeries.dataFields.hidden = "hidden";
        pieSeries.slices.template.propertyFields.fill = "color";
        pieSeries.slices.template.propertyFields.isActive = "pulled";
        pieSeries.slices.template.strokeWidth = 0;
        pieSeries.paddingBottom = 10;
        pieSeries.colors.step = 2;
        
        pieSeries.ticks.template.disabled = true;
        pieSeries.alignLabels = false;
        pieSeries.labels.template.fontSize = 12;
        pieSeries.labels.template.text = "{value.percent.formatNumber('#.00')}%";
        pieSeries.labels.template.radius = am4core.percent(-40);
        //pieSeries.labels.template.relativeRotation = 90;
        pieSeries.labels.template.fill = am4core.color("white");
        pieSeries.legendSettings.valueText = "{valueY.close}";
        pieSeries.labels.template.adapter.add("text", function(text, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return "";
            }
            return text;
        });
        
        _chartArr.push(chart);
        
        if (year !== gMYFrom && year !== gMYTo) {
            setLegendSize(chart, function(legend){
                legend.itemContainers.template.events.on("up", (ev) => {
                    var category = ev.target.dataItem.name;

                    $.each(_chartArr, function(i, v){
                        var _chart = v;
                        _chart.data.forEach(function(item){
                            if(item.category === category){
                                item.hidden = !ev.target.isActive;
                            }
                        });
                        _chart.invalidateData();
                    });
                });
            });
        }
    };

    $.each(gModelYears, function(i, v){
        var _my = v.name;
        var _res = _data.filter(function (item) {
        	return item.model_year == _my;
        });

        _createChart(_res, _my);
    });
}

function displayColumnSTC(container){
    if(gData.length > 0){
        var _data = [];
        var _objKey = getDistinctKey(gData);
        var _value = _objKey.value;
        var _category = _objKey.category;
        var _location = _objKey.location;
        var _categoryObj = gData.groupBy([_category]);
        var _locationObj = gData.groupBy([_location]);
        var _hasLocation = (_location ? true: false);

        if(_hasLocation){
            $.each(gRegionNames, function(i, r) { 
                $.each(gModelYears, function(x, my) {
                    var _regionName = r.name;
                    var _modelYear = my.name;
                    var _result = r.items.filter(function (item) {
                    	return item.MODEL_YEAR == _modelYear;
                    });
                    
                    $.each(_locationObj, function(y, l) {
                        var _specLocation = l.name;
                        var _json = {
                            REGION_NAME : _regionName,
                            MODEL_YEAR : +_modelYear,
                            category : _specLocation +"("+ _modelYear +"-"+ _regionName +")"
                        };
                        
                        $.each(_categoryObj, function(z, s) {
                            var _count = 0;
                            var _name = s.name;
                            var _nameNew = _name.replace(" ","_");
                            var _result2 = _result.filter(function (item) {
                            	return item[_location] == _specLocation && item[_category] == _name;
                            });
    
                            if(_value && _value !== ""){
                                 _count = _result2.reduce(function (accumulator, currentValue) {
                                    return accumulator + currentValue[_value];
                                }, 0)
                            }else{
                                for(; _count < _result2.length; ){
                                    _count++;
                                }
                            }
                           
                            _json[_nameNew] = _count;
                        });
                        
                        _data.push(_json);
                    }); 
                });
            });
        }
        else{
             $.each(gRegionNames, function(i,r) { 
                $.each(gModelYears, function(x, my) { 
                    var _my = my.name;
                    var _region = r.name;
                    var _obj = {};
                    _obj.year = +_my;
                    _obj.region = _region;
                    _obj.category = _my +"("+ _region +")";
                    
                    $.each(_categoryObj, function(y, w) { 
                        var _count = 0;
                        var _cName = w.name;
                        var _cNameNew = _cName.replace(" ","_");
                        var _res = r.items.filter(function (item) {
                        	return item[_category] == _cName && item.MODEL_YEAR == _my;
                        });
                        
                        if(_value && _value !== ""){
                             _count = _res.reduce(function (accumulator, currentValue) {
                                return accumulator + currentValue[_value];
                            }, 0);    
                        }else{
                            for(; _count < _res.length; ){
                                _count++;
                            }
                        }
        
                        _obj[_cNameNew] = _count;
                    });
                    _data.push(_obj);
                });
            });
        }
        
        // Display Chart
        am4core.useTheme(am4themes_animated);
        
        var chart = am4core.create(container, am4charts.XYChart);
        chart.data = _data;
        chart.colors.step = 2;
        chart.padding(15, 15, 10, 15);
    
        if(_hasLocation){
            var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            categoryAxis.dataFields.category = "category";
            categoryAxis.renderer.minGridDistance = 20;
            categoryAxis.renderer.grid.template.location = 0;
            categoryAxis.interactionsEnabled = false;
            categoryAxis.renderer.labels.template.fontSize = 10;
            categoryAxis.renderer.labels.template.valign = "top";
            categoryAxis.renderer.labels.template.location = 0;
            categoryAxis.renderer.labels.template.rotation = (_hasLocation ? 270: 0);
            categoryAxis.renderer.labels.template.adapter.add("textOutput", function(text) {
                return (!isUD(text) ? text.replace(/\(.*/, "") : text);
            });
        
            var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            //valueAxis.title.text = "Count";
            valueAxis.min = 0;
            //valueAxis.max = 100;
            valueAxis.strictMinMax = true;
            valueAxis.calculateTotals = true;
            valueAxis.renderer.minGridDistance = 10;
            valueAxis.renderer.labels.template.adapter.add("text", function(text) {
              return text + "%";
            });
        
            // Create series
            var _createSeries = function(field, name) {
              var series = chart.series.push(new am4charts.ColumnSeries());
              series.dataFields.valueY = field;
              //series.dataFields.categoryXShow = "totalPercent";
              series.dataFields.categoryX = "category";
              series.name = name;
              series.tooltipText = "[bold]{name}:[/] {valueY.totalPercent.formatNumber('#.00')}% - [bold]{valueY.formatNumber('#,###')}[/]";
              series.tooltip.fontSize = 8;
              series.tooltip.paddingTop = 1;
              series.tooltip.paddingBottom= 1;
              series.tooltip.paddingBottom= 1;
              series.tooltip.dy = -10;
              series.tooltip.align = "top";
              series.stacked = (_hasLocation ? true: false);
              series.columns.template.width = am4core.percent(95);
    
            }
            
            var _createLabel = function(category, endCategory, label, opacity, dy) {
                var range = categoryAxis.axisRanges.create();
                range.category = category;
                range.endCategory = endCategory;
                range.label.dataItem.text = label;
                range.label.dy = dy;
                //range.label.fontSize = 10;
                range.label.fontWeight = "bold";
                range.label.valign = "bottom";
                range.label.location = 0.5;
                range.label.rotation = 0;
                range.axisFill.fill = am4core.color("#396478");
                range.axisFill.fillOpacity = opacity;
                range.locations.category = 0.1;
                range.locations.endCategory = 0.9;
            };
        }
        else{
            // Create axes
            var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            categoryAxis.dataFields.category = "category";
            categoryAxis.numberFormatter.numberFormat = "#";
            //categoryAxis.title.text = "Wire 0.50 and Below";
            categoryAxis.renderer.grid.template.location = 0;
            categoryAxis.renderer.minGridDistance = 20;
            categoryAxis.renderer.labels.template.adapter.add("textOutput", function(text) {
                return (typeof(text)!=="undefined" ? text.replace(/\(.*/, "") : text);
            });
            
            var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            //valueAxis.title.text = "Count";
            valueAxis.min = 0;
            valueAxis.max = 100;
            valueAxis.strictMinMax = true;
            valueAxis.calculateTotals = true;
            valueAxis.renderer.labels.template.adapter.add("text", function(text) {
              return text + "%";
            });
            
            // Create series
            var _createSeries = function(field, name) {
                var series = chart.series.push(new am4charts.ColumnSeries());
                series.dataFields.valueY = field;
                series.dataFields.valueYShow = "totalPercent";
                series.dataFields.categoryX = "category";
                series.name = name;
                series.tooltipText = "[bold]{name}:[/] {valueY.totalPercent.formatNumber('#.00')}% - [bold]{valueY.formatNumber('#,###')}[/]";
                series.tooltip.fontSize = 8;
                series.tooltip.dy = -10;
                //series.tooltip.align = "top";
                
                series.tooltip.valign  = "top";
                series.tooltip.tooltipPosition = "fixed";
                series.tooltip.background.filters.clear();
                //series.tooltip.pointerOrientation  = true;
                series.tooltip.fixedWidthGrid = true;
                series.tooltip.layout = "none";
                series.tooltip.pointerOrientation = "horizontal";
                //series.tooltip.label.minWidth = 40;
                //series.tooltip.label.minHeight = 40;
                series.tooltip.label.textAlign = "middle";
                series.tooltip.label.textValign = "middle";
            };
             
            var _createLabel = function(category, endCategory, label) {
                var range = categoryAxis.axisRanges.create();
                range.category = category;
                range.endCategory = endCategory;
                range.label.dataItem.text = label;
                range.label.dy = 18;
                range.label.fontWeight = "bold";
                range.axisFill.fill = am4core.color("#396478");
                range.axisFill.fillOpacity = 0.1;
                range.locations.category = 0.1;
                range.locations.endCategory = 0.9;
            };
        }
        
        $.each(_categoryObj, function(i, v) { 
            var _name = v.name;
            var _nameNew = _name.replace(" ","_");
    
            _createSeries(_nameNew, _name);
        }); 
        
        if(_hasLocation){
           var _specName = getFirstAndLastItem(_locationObj , "name");
            
            $.each(gModelYears, function(i, v) { 
                var _my = v.name;
                
                $.each(gRegionNames, function(i, r) { 
                    var _reg = r.name;
                    var _first = _specName.first + "("+ _my +"-"+ _reg +")";
                    var _last = _specName.last + "("+ _my +"-"+ _reg +")";
                    
                    _createLabel(_first, _last, _my, 0, 10);
                });
            });
            
            $.each(gRegionNames, function(i, r) { 
                var _reg = r.name;
                var _first = _specName.first + "("+ gMYFrom +"-"+ _reg +")";
                var _last = _specName.last + "("+ gMYTo +"-"+ _reg +")";
                
                _createLabel(_first, _last, _reg, 0.1, 20);
            }); 
        }
        else{
            $.each(gRegionNames, function(i, r) { 
                var _region = "("+ r.name +")";
                
                _createLabel(gMYFrom + _region, gMYTo + _region, r.name,  0.1, 10);
            });
        }
        
        //Add cursor
        chart.cursor = new am4charts.XYCursor();
        chart.cursor.fullWidthLineX = false;
        chart.cursor.lineX.strokeWidth = 0;
        chart.cursor.lineX.fill = am4core.color("#000");
        chart.cursor.lineX.fillOpacity = 0.1;
        chart.cursor.behavior = "panX";
        chart.cursor.lineY.disabled = true;
        
        setLegendSize(chart);
        //setWireTrend(_data);
    }
}
