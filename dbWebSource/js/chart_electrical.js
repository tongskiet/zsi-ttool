var  svn                = zsi.setValIfNull
    ,bs                 = zsi.bs.ctrl
    ,bsButton           = zsi.bs.button
    ,proc_url           = base_url + "common/executeproc/"
    ,gCId               = zsi.getUrlParamValue("id")
    ,gCName             = zsi.getUrlParamValue("name")
    ,gMenu              = zsi.getUrlParamValue("menu")
    ,gRegionNames       = []
    ,gModelYears        = []
    ,gOEMs              = []
    ,gVehicleTypes      = []
    ,gCategories        = []
    ,gLocations         = []
    ,gMarket            = []
    ,gHarness           = []
    ,gMYFrom            = ""
    ,gMYTo              = ""
    ,gData              = []
    ,gLegendData        = []
    ,gCriteriaParams    = []
    ,gMathFunc          = []
    ,gPrmCategory       = ""
    ,gPrmSumUp          = ""
    ,gPrmGraphType      = ""
    ,gPrmIs3D           = false
    ,gIsStacked         = false
    ,gLists             = []
    ,gWinWidth          = 0
    ,gTW                = null
    ,gPCategory         = "";
    
zsi.ready(function(){
    gTW = new zsi.easyJsTemplateWriter();
    gWinWidth = $(window).width();
    var _mainHeight = $("main").height() - 60;
    var _chartHeight = _mainHeight / 2;
    
    $("#chart_div").css("height", _chartHeight);
    
    setPageTitle();
    setDefaultParams();
    displayChart();
});

function setPageTitle(){
    gMenu = removeSpecialChar(gMenu).toUpperCase();
    gCName = removeSpecialChar(gCName);
    
    $("#menu_name").text(gMenu);
    $("#criteria_name").text(gCName);
} 

function setDefaultParams(){
    gMYTo = new Date().getFullYear();
    gMYFrom = gMYTo - 2;
    gPrmSumUp = 1;
    gPrmCategory = "Model Year";
    gPrmGraphType = "pie";
    
    $("#my_from").val(gMYFrom);
    $("#my_to").val(gMYTo);
}

function filterGraphData(e){
    gData = [];
    gLegendData = [];
    gLists = [];
    gIsStacked = false;
    gMYFrom = parseInt($("#my_from").val());
    gMYTo = parseInt($("#my_to").val());
    gPrmSumUp = parseInt($("#sum_by").val());
    gPrmCategory = $("#category").val();
    gPrmGraphType = $("#graph_type").val();
    gPrmIs3D = $("#is_3D").is(":checked");
    gPrmSumUp = (gPrmSumUp ? gPrmSumUp : 1);
    
    if(gMYFrom > gMYTo){
        alert("Opps! Invalid range of year.");
    }else{
        displayChart();
    }
}

function removeSpecialChar(string){
    var _newStr = $.trim(unescape(string).replace(/_/g,"&").replace(/[^\x20-\x7E]/g, "-").replace(/---/g,"-"));
    return _newStr;
}

function getData(url, callback){
    $.get(execURL + url, function(data){
        gData = data.rows;

        // var _key = getDistinctKey(gData);
        // var _category = _key.category;
        // var _location = _key.location;
            
        //if(_location){
            //gLists = sortBy(gData.groupBy([_category]), "name").map(function(item) {
            //    return item.name;
            //});
            //getLegendData(function(){
            //    initGlobalData(_key, function(){
                //     callback();
                // });
            //});
        //}else{
            initGlobalData(function(){
                callback();
            });
        //}  
    });
}

function getLegendData(callback){
    $.get(execURL + "dynamic_legend_color_sel "+ (gLists.length > 0 ? "@list='" + gLists.join(",") + "'": "@criteria_id=" + gCId) 
    , function(data){
        gLegendData = $.merge(data.rows, gLegendData);
        
        if(callback) callback();
    });
}

function getCriteriaParams(callback){
    $.get(execURL + "dynamic_param_sel @criteria_id=" + gCId
    , function(data){
        gCriteriaParams = data.rows;
        
        if(callback) callback();
    });
}

function getMathFunc(callback){
    $.get(execURL + "dynamic_math_sel @criteria_id=" + gCId
    , function(data){
        gMathFunc = data.rows;
        
        if(callback) callback();
    });
}

function initGlobalData(callback){
    setCriteriaParams(function(){
        var _key = getDistinctKey(gData);
        var _category = _key.category;
        var _location = _key.location;
        var _harness = _key.harness_name;
        //var _category = keys.category;
        //var _location = keys.location;
        var _region = _key.region;
        var _modelYear = _key.model_year;
        var _vehicleType = _key.vehicle_type;
        var _oem = _key.oem;
        var _market = _key.market;
        
        $.map(gData, function(v, i){
            if(isDecimal(v[_category])){
                v[_category] = parseFloat(v[_category]).toFixed(2);
            }
    
            if(gLegendData.length > 0){
                var _res = gLegendData.filter(function (item) {
                	return item.alias == v[_category];
                });
                if(_res.length > 0){
                    v[_category] = (_res[0].legend_label) ? _res[0].legend_label : _res[0].alias;
                }
                
                if(_location){
                    var _res2 = gLegendData.filter(function (item) {
                    	return item.alias == v[_location];
                    });
                    if(_res2.length > 0){
                        v[_location] = (_res2[0].legend_label) ? _res2[0].legend_label : _res2[0].alias;
                    }
                }
            }
            return v;
        });
        
        gRegionNames = sortBy(gData.groupBy([_region]), "name");
        gModelYears = gData.groupBy([_modelYear], "name");
        gMarket = sortBy(gData.groupBy([_market]), "name");
        gOEMs = sortBy(gData.groupBy([_oem]), "name");
        gVehicleTypes = sortBy(gData.groupBy([_vehicleType]), "name");
        gHarness = sortBy(gData.groupBy([_harness]), "name");
        gLocations = $.map(sortBy(gData.groupBy([_location]), "name"), function(v, i){
                        if(v.name){
                            if(_location && gLegendData.length > 0){
                                var _res = gLegendData.filter(function (item) {
                                	return item.alias == v.name || item.legend_label == v.name;
                                });
                                if(_res.length > 0){
                                    if(_res[0].grayed_out==="Y"){
                                        v.color = "gray";
                                    }else{
                                        if(_res[0].color_code!==""){
                                            v.color = _res[0].color_code.toLowerCase();
                                        }
                                    }    
                                }    
                            }
                            return v;
                        }
                    });
        gCategories = $.map(sortBy(gData.groupBy([_category]), "name"), function(v, i){
                        if(v.name){
                            if(gLegendData.length > 0){
                                var _res = gLegendData.filter(function (item) {
                                	return item.alias == v.name || item.legend_label == v.name;
                                });
                                if(_res.length > 0){
                                    if(_res[0].grayed_out==="Y"){
                                        v.color = "gray";
                                    }else{
                                        if(_res[0].color_code!==""){
                                            v.color = _res[0].color_code.toLowerCase();
                                        }
                                    }    
                                }    
                            }  
                            return v;
                        }
                    });
         
        for (var _my = gMYFrom; _my <= gMYTo; _my++) {
            var _res = gModelYears.filter(function (item) {
            	return item.name == _my;
            });
    
            if(_res.length === 0){
                gModelYears.push({
                    name : _my.toString(),
                    items: []
                });
            }
        }
        gModelYears = chunkArray(sortBy(gModelYears, 'name'), gPrmSumUp);
        
        console.log("gData", gData);
        console.log("gModelYears", gModelYears);
        console.log("gRegionNames", gRegionNames);
        console.log("gLocations", gLocations);
        console.log("gCategories", gCategories);
        console.log("gHarness", gHarness);
        callback();    
    });
}

function setCriteriaParams(callback){
    var _ctr = 0;
    if(gCriteriaParams.length > 0){
        $.each(gCriteriaParams, function(i, v){
            var _paramLabel = $.trim(v.param_label).toUpperCase();
            var _columnName = $.trim(v.column_name).toLowerCase();
     
            if(!$("#param_box").html()){
                var _groupData = gData.groupBy([_columnName]);
                var _tw = new zsi.easyJsTemplateWriter("#param_box");
                    _tw.param({ param_label: _paramLabel, column_name: _columnName });
                    
                $("#" + _columnName).fillSelect({
                    data : _groupData,
                    text : "name",
                    value : "name"
                });
            }else{
                var _selectedValue = $.trim($("#" + _columnName).val());
                if(_selectedValue){
                    gData = gData.filter(function(item){
                        return item[_columnName] == _selectedValue;
                    });
                }
            }
            
            _ctr++;
            if(_ctr == gCriteriaParams.length){
                callback();   
            }
        });
    }else{
        callback();
    }
}

function setChartSettings(){
    var _url = "";
    var _result = {};
    var _staticMY = new Date().getFullYear() - 2;
    var _param = ",@byMy='Y'";
    var _chart = {default:"", pie:"", column:"", line: ""};
        _chart.default = "displayComPieChart(container)";
        _chart.column = "displayComStackColumnChart(container)";
        
    if(gPrmCategory==="Region"){
        _param = ",@byRegion='Y'";
        _chart.default = "displayComPieRegionChart(container)";
        _chart.column = "displayComOverallColumnChart(container)";
    }else if(gPrmCategory==="Vehicle Type"){
        _param = ",@byVehicle_type='Y'";
    }else if(gPrmCategory==="OEM"){
        _param = ",@byOEM='Y'";
    }else if(gPrmCategory==="Market"){
        _param = ",@byMarket='Y'";
        _chart.default = "displayComPieRegionChart(container)";
        _chart.column = "displayComOverallColumnChart(container)";
    }
   
    _url = "dynamic_summary_sel @table_view_name='dbo.wires_v',@criteria_id="+ gCId +",@model_year_fr="+ gMYFrom +",@model_year_to="+ gMYTo + _param;
    
    if(isContain(gMenu, "VEHICLE ARCHITECTURE") || isContain(gMenu, "GROUNDING DISTRIBUTION")){
        _url = "dynamic_summary_sel @criteria_id="+ gCId +",@model_year_fr="+ gMYFrom +",@model_year_to="+ gMYTo + _param;
    }
    else if(isContain(gMenu, "WIRES & CABLES")){
        if(isContain(gCName, "Overall wire usage lower than 0.5 CSA")){
            gIsStacked = true;
            _url = "dynamic_summary_sel @table_view_name='dbo.wires_v',@criteria_id="+ gCId +",@model_year_fr="+ gMYFrom +",@model_year_to="+ gMYTo + _param;
            //if(gPrmCategory!=="Region") _chart.default = "displayComOverallPieChart(container)";
        }
        // else if(isContain(gCName, "New Wire Sizes")){
      
        // }
        // else if(isContain(gCName, "Smaller wire sizes in High Flexible areas")){
        
        // }
        // else if(isContain(gCName, "Smaller wire sizes in Engine Compartment areas")){
        
        // }
        // else if(isContain(gCName, "PVC wires in Engine Compartment")){
       
        // }
        else if(isContain(gCName, "New Conductor Technology with lesser dimensions")){
            _url = "wire_tech_lower_upper_diameter @byMY="+ _staticMY +",@criteria_id="+ gCId;
            _chart.default = "displayWireTechDiameter(container)";
            _chart.column = "";
        }
        else if(isContain(gCName, "New Conductor Technology with lesser weight")){
            _url = "wire_tech_lower_upper_weight @model_year="+ _staticMY +",@criteria_id="+ gCId;
            _chart.default = "displayWireTechWeight(container)";
            _chart.column = "";
        } 
        // else if(isContain(gCName, "2.5 wire gauge for cigar lighters and power outlet")){

        // }
        // else if(isContain(gCName, "New Technology on wire Conductor")){
       
        // }
    }
    else if(isContain(gMenu, "POWER DISTRIBUTION")){
        _url = "dynamic_summary_sel @table_view_name='dbo.power_distributions_v',@criteria_id="+ gCId +",@model_year_fr="+ gMYFrom +",@model_year_to="+ gMYTo + _param;
    }
    else if(isContain(gMenu, "SAFETY CRITICAL CIRCUITS")){ 
        _url = "dynamic_cts_usage_summary @criteria_id="+ gCId +",@model_year_fr="+ gMYFrom +",@model_year_to="+ gMYTo + _param;
    }
    else if(isContain(gMenu, "NETWORK TOPOLOGY")){ 
        _url = "dynamic_summary_sel @table_view_name='dbo.network_topology_v',@criteria_id="+ gCId +",@model_year_fr="+ gMYFrom +",@model_year_to="+ gMYTo + _param;
    }

    _result.url = _url;
    _result.chart = _chart;
    
    return _result;
}

function displayChart(){
    var _res = setChartSettings();
    if( _res.url!=="" ){
        getMathFunc(function(){
            getCriteriaParams(function(){
                getLegendData(function(){
                    getData(_res.url, function(){
                        $("#chart_wrapper_details, #btnReset").addClass("d-none");
                        $("#chart_div, #chart_details, #trends, #opportunities").empty().width("auto");
                        
                        // CHART SETTINGS
                        am4core.useTheme(am4themes_animated);
                        am4core.options.commercialLicense = true;
                        
                        var _graph = _res.chart.default;
                        if(gPrmGraphType==="bar"){
                            _graph = _res.chart.column;
                        }
                        var _fnName = new Function("container", _graph);
                            _fnName("chart_div");
                    });
                });
            });
        });
    }
}

//******************************* CHART FUNCTION *****************************//
function setLegend(charts){
    var _legend = [];
    var _chart = [];

    if(isUD(charts.className)){
        $.each(charts, function(i, v){
            var _cData = v.data;
            if( _cData.length > _legend.length ){
                _chart = v;
                _legend = _cData;
            }
        });
    }else{
        _chart = charts;
    }

    _chart.legend = new am4charts.Legend();
    _chart.legend.labels.template.fontSize = 10;
    _chart.legend.valueLabels.template.fontSize = 10;
    _chart.legend.itemContainers.template.paddingTop = 5;
    _chart.legend.itemContainers.template.paddingBottom = 5;
    _chart.legend.itemContainers.template.hoverable = false;
    _chart.legend.itemContainers.template.clickable = false;
    _chart.legend.itemContainers.template.focusable = false;
    _chart.legend.itemContainers.template.cursorOverStyle = am4core.MouseCursorStyle.default;
    
    var markerTemplate = _chart.legend.markers.template;
    markerTemplate.width = 10;
    markerTemplate.height = 10;
    markerTemplate.strokeWidth = 0;
    
    var _legendContainer = function(){
        var legendContainer = am4core.create("legend_div", am4core.Container);
        legendContainer.width = am4core.percent(100);
        legendContainer.height = am4core.percent(100);
        _chart.legend.parent = legendContainer;
    };
    var _$chart = $("#chart_div");
    var _$legend = $("#legend_div");
    var _$legendWrap = $(".legend-wrapper");
    
    _legendContainer();

    var _resizeLegend = function(ev) {
        if(_$chart.width() > $(".chart-wrapper").width()){
            _$legendWrap.css("bottom", 16);
        }else{
            _$legendWrap.css("bottom", 0);
            _$chart.width(_$chart.width() - 1);
        }
        
        setTimeout(function() {
            var _contHeight = _chart.legend.contentHeight;
            _$legend.height(_contHeight);
            _legendContainer();
            _$chart.css("margin-bottom", (_contHeight > 120 ? 120 : _contHeight ) + "px");
        }, 100);
    };
    _chart.events.once("datavalidated", _resizeLegend);
    //_chart.events.once("maxsizechanged", _resizeLegend);

    setTimeout(function() {
        if(gPrmCategory!=="Region" && $('main').height() < $('main').prop('scrollHeight') && charts.length <= 3 && $(window).height() <= 625){
            _$legendWrap.css("bottom", 0);
            _$chart.width(_$chart.width() - 13);
        }
    },250);
    
    if(charts.length === 3){
        $('.chart-wrapper').addClass("overflow-hidden");
    }else{
        $('.chart-wrapper').removeClass("overflow-hidden");
    }
}

function setCategoryColor(name){
    var _color = "";
    var _res = gLegendData.filter(function (item) {
    	return item.alias == name || item.legend_label == name;
    });
    
    if(_res.length > 0){
        if(_res[0].grayed_out==="Y"){
            _color = "gray";
        }else{
            if(_res[0].color_code!==""){
                _color = _res[0].color_code.toLowerCase();
            }
        }
    }
    return _color;
}

function setTrendResult(o){
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
            result += (lastObj.subs.length > 0 ? lastObj.subs[0].category : lastObj.category) +" - "+ status;
            //result += "% of Lower "+ wire_guage +" - "+ status;
            result += "<br>";
            
            if(lastValBW > secondValBW) {
                status = inc;
            }else{
                status = dec;
            }
            result += (secondObj.subs.length > 0 ? secondObj.subs[1].category : secondObj.category) +" - "+ status;
            //result += "% of Higer "+ wire_guage +" - "+ status;
            
        }
        
        var _tw = new zsi.easyJsTemplateWriter();
        $("div#trends").html(result);
    }
}

function setTrends(data, category){
    if(data.length > 0){
        var _trends = "";
        if(gPrmGraphType=="pie"){
            var _group = sortBy(data.groupBy(['category']), "name");
            $.each(_group, function(i, v) { 
                var _cat = v.name;
                var _res = data.filter(function (item) {
                	return item.category == _cat && item.value > 0;
                });

                if(_res.length >= 2){
                    if(gLegendData.length > 0){
                        var _res2 = gLegendData.filter(function (item) {
                        	return (item.alias == _cat || item.legend_label == _cat) && item.grayed_out === "Y";
                        });
                        if(_res2.length === 0) _trends += _cat + '<br>';
                    }else{
                        _trends += _cat + '<br>';
                    }
                }
            });
        }
        else{
            var _key = getDistinctKey(data);
            var _region = _key.region;
            var _group = sortBy(data.groupBy(['group']), "name");

            $.each(category, function(i, v){
                var _cat = v.name;
                var _catNew = _cat.replace(/ /g,"_");
                var _count = [];

                if(gPrmCategory==="Region" || gPrmCategory==="Market"){
                    $.each(_group, function(x, y){
                        var _res = y.items.filter(function (item) {
                        	return item[_catNew] > 0;
                        });
                        if(_res.length > 0) _count.push(x);
                    });
                    
                }else{
                    _count = data.filter(function (item) {
                    	return item[_catNew] > 0;
                    });
                }

                if(_count.length >= 2){
                    if(gLegendData.length > 0){
                        var _res2 = gLegendData.filter(function (item) {
                        	return (item.alias == _cat || item.legend_label == _cat) && item.grayed_out === "Y";
                        });
                        if(_res2.length === 0) _trends += _cat + '<br>';
                    }else{
                        _trends += _cat + '<br>';
                    }
                }
            });
        }
        $("div#trends").html( _trends );
    }
}

function setOpportunities(data, category){
    if(data.length > 0){
        var _html = "";
        var _key = getDistinctKey(gData);
        var _model_year = _key.model_year;
        var _region = _key.region;
        var _location = _key.location;
        var _groupObj = gModelYears
        
        if(gPrmCategory==="Region"){
           _groupObj = gRegionNames;
        }else if(gPrmCategory==="Vehicle Type"){
            _groupObj = gVehicleTypes;
        }else if(gPrmCategory==="OEM"){
            _groupObj = gOEMs;
        }else if(gPrmCategory==="Market"){
            _groupObj = gMarket;
        }
       
        if(gPrmGraphType=="pie"){
            category = data.groupBy(['category']);

            if(gPrmCategory==="Region" || gPrmCategory==="Market"){
                $.each(_groupObj, function(i, reg){
                    var _cArr = [];
                    var _gName = reg.name

                    $.each(category, function(i, v){
                        var _cName = v.name;
                        var _res = data.filter(function (item) {
                    	    return item.region == _gName &&  item.category == _cName && item.value > 0;
                        });
                        
                        if(_res.length <= 1){ 
                            if(gLegendData.length > 0){
                                var _res2 = gLegendData.filter(function (item) {
                                	return (item.alias == _cName || item.legend_label == _cName) && item.grayed_out !== "Y";
                                });
                                if(_res2.length > 0){
                                    _cArr.push(_cName);
                                }
                            }else{
                                 _cArr.push(_cName);
                            }
                        }
                    });  
                    _html += _gName +" - " + _cArr.join() + '<br>';
                });
            }else{
               $.each(_groupObj, function(i, g){
                    var _cArr = [];
                    var _gName = g.name
               
                    $.each(category, function(i, v){
                        var _cName = v.name;
                        var _res = data.filter(function (item) {
                    	    return item.group == _gName && item.category == _cName && item.value > 0;
                        });
                        
                        if(_res.length === 0){ 
                            if(gLegendData.length > 0){
                                var _res2 = gLegendData.filter(function (item) {
                                	return (item.alias == _cName || item.legend_label == _cName) && item.grayed_out !== "Y";
                                });
                                if(_res2.length > 0){
                                    _cArr.push(_cName);
                                }
                            }else{
                                 _cArr.push(_cName);
                            }
                        }
                    });  
                    _html += _gName +" - " + _cArr.join() + '<br>';
                });
            }
        }
        else{
            if(gPrmCategory==="Region" || gPrmCategory==="Market"){
                $.each(_groupObj, function(i, v){
                    var _cArr = [];
                    var _gName = v.name;
                    $.each(category, function(i, v){
                        var _cName = v.name;
                        var _cNameNew = v.name.replace(/ /g, '_');
                        var _res = data.filter(function (item) {
                        	return item.group == _gName && item[_cNameNew] > 0;
                        });
                        
                        if(_res.length <= 1){ 
                            if(gLegendData.length > 0){
                                var _res2 = gLegendData.filter(function (item) {
                                	return (item.alias == _cName || item.legend_label == _cName) && item.grayed_out !== "Y";
                                });
                                if(_res2.length > 0){
                                    _cArr.push(_cName);
                                }
                            }else{
                                 _cArr.push(_cName);
                            }
                        }
                    });
                    _html += _gName +" - " + _cArr.join() + '<br>';
                });
            }else{
                $.each(_groupObj, function(i, g){
                    var _cArr = [];
                    var _gName = g.name;
                    
                    $.each(category, function(i, v){
                        var _cName = v.name;
                        var _cNameNew = v.name.replace(/ /g, '_');
                        var _cParam = (_location ? _cName + "(" + _gName + ")" : _gName);
                        var _res = data.filter(function (item) {
                        	return item.category == _cParam && item[_cNameNew] > 0;
                        });
                        
                        if(_res.length === 0){ 
                            if(gLegendData.length > 0){
                                var _res2 = gLegendData.filter(function (item) {
                                	return (item.alias == _cName || item.legend_label == _cName) && item.grayed_out !== "Y";
                                });
                                if(_res2.length > 0){
                                    _cArr.push(_cName);
                                }
                            }else{
                                 _cArr.push(_cName);
                            }
                        }
                    });
                    _html += _gName +" - " + _cArr.join() + '<br>';
                });
            }
        }
        $("div#opportunities").html(_html);
    }
}

function sortBy(obj, key){
    obj.sort(function(a, b) {
        var _nameA = a[key]; // ignore upper and lowercase
        var _nameB = b[key]; // ignore upper and lowercase

        if (_nameA < _nameB) {
            return -1;
        }
        if (_nameA > _nameB) {
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
    var _model_year = "";
    var _region = "";
    var _oem = "";
    var _vehicle_type = "";
    var _market_name = ""
    var _project_id = "";
    var _project_name = "";
    var _harness_name = "";
    var _circuit_name = "";
    var _device_name = "";
    var _ctsgfr_code = "";

    if(data.length > 0){
        $.each(Object.keys(data[0]), function(i, key){
            var _key = key.toUpperCase();
            
            if(isContain(_key, "REGION") || isContain(_key, "REGION_NAME")){
                _region = key;
            }
            else if(isContain(_key, "MODEL_YEAR") || isContain(_key, "YEAR")){
                _model_year = key;
            }
            else if(isContain(_key, "VEHICLE_TYPE") || isContain(_key, "VEHICLE_TYPE_NAME")){
                _vehicle_type = key;
            }
            else if(isContain(_key, "OEM") || isContain(_key, "OEM_NAME")){
                _oem = key;
            }
            else if((isContain(_key, "LOCATION") || isContain(_key, "ALIAS") || _key === "SL" ) && !isContain(_key, "COUNT_LOCATION")){
                _location = key;
            }
            else if(isContain(_key, "MARKET") || isContain(_key, "MARKET_NAME")){
                _market_name = key;
            }
            else if(isContain(_key, "HARNESS") || isContain(_key, "HARNESS_NAME")){
                _harness_name = key;
            }
            else if(isContain(_key, "CIRCUIT_") || isContain(_key, "CIRCUIT_NAME")){
                _circuit_name = key;
            }
            else if(isContain(_key, "DEVICE") || isContain(_key, "DEVICE_NAME")){
                _device_name = key;
            }
            else if(isContain(_key, "CTSGFR_CODE") || isContain(_key, "CODE")){
                _ctsgfr_code = key;
            }
            else if(isContain(_key, "PROJECT_ID")){
                _project_id = key;
            }
            else if(isContain(_key, "PROJECT_NAME")){
                _project_name = key;
            }
            else if(isContain(_key, "COUNT") || isContain(_key, "SUM")){
                _value = key;
            }
            else if(isContain(_key, "SPECIAL_WIRE_COMPONENT_ASSEMBLIES")){
           
            }
            else{
                _category = key;
            }
        });
    }
    
    _loc = _location;
    _cat = _category;
    
    //Set Column Math count 
    var _third_level = "";
    if(gMathFunc.length > 0){
        //var _res = gMathFunc.filter(function(item){ return item.math_function == "SUM" })[0];
        var _data = sortBy(gMathFunc, "level_no").filter(function(item){ return item.math_function !== "SUM" });
            _value = gMathFunc.filter(function(item){ return item.math_function == "SUM" })[0];
            _value = (isUD(_value) ? "" : _value.column_name.toLowerCase());
        var _dataL = _data.length;
            _loc = "";
            _cat = "";
            _third_level = "";
            
        $.each(_data, function(i, v){
            var _columnName = $.trim(v.column_name).toLowerCase();
            
            if(i===0){
                if(_dataL > 1){
                    _loc = _columnName;
                }else{
                    _cat = _columnName;
                }
            }
            if(i===1){
                _cat = _columnName;
            } 
            if(i===2){
                _third_level = _columnName;
            }   
        });
    }
    
    _location = _loc;
    _category = _cat;   
    
    if(gPrmGraphType=="bar"){
        if(_loc!==""){
            _location = _cat;
            _category = _loc;
        }   
    }
    
    console.log("_location", _location);
    console.log("_category", _category);
    console.log("_third_level", _third_level);
    console.log("_value", _value);
    _keys.value = _value;
    _keys.category = _category;
    _keys.location = _location;
    _keys.model_year = _model_year;
    _keys.region = _region;
    _keys.oem = _oem;
    _keys.market = _market_name;
    _keys.vehicle_type = _vehicle_type;
    _keys.harness_name = _harness_name;
    _keys.third_level = _third_level;
    
    return _keys; 
}

function getCount(data, column){
    var _count = 0;
    if(column && column !== ""){
         _count = data.reduce(function (accumulator, currentValue) {
            return accumulator + currentValue[column];
        }, 0);    
    }else{
        for(; _count < data.length; ){
            _count++;
        }
    }
    return _count;
}

function isContain(string, contains){
    var _res = false;
    if (string.search(contains) > -1){
        _res = true;
    }
    return _res;
}  

//------------------------------- POPUP --------------------------------------//
function showChartDetails(o){
    console.log("o", o);
    var _key = getDistinctKey(gData);
    var _value = _key.value;
    var _category = _key.category;
    var _region = _key.region;
    var _modelYear = _key.model_year;
    var _vehicleType = _key.vehicle_type;
    var _oem = _key.oem;
    var _harness = _key.harness_name;
    var _market = _key.market;
    var _location = _key.location;
    var _harnessName = _key.harness_name;
    var _thirdLevel = _key.third_level;
    var _dummyData = [{
        "category": "Dummy",
        "disabled": true,
        "value": 1,
        "color": am4core.color("#dadada"),
        "opacity": 0.3,
        "strokeDasharray": "4,4",
        "tooltip": ""
    }]; 
    var _selectedKey = _modelYear;
    var _refData = gModelYears;
    
    if(gPrmCategory==="Region"){
        _selectedKey = _region;
    }else if(gPrmCategory==="Vehicle Type"){
        _selectedKey = _vehicleType;
        _refData = gVehicleTypes;
    }else if(gPrmCategory==="OEM"){
        _selectedKey = _oem;
        _refData = gOEMs;
    }else if(gPrmCategory==="Market"){
        _selectedKey = _market;
    }
   
    var _togglePieSlices = function(data, reset) {
        var _sliceData = [];
        for (var i = 0; i < data.length; i++) {
            if (i == o.selected) {
                for (var x = 0; x < data[i].subs.length; x++) {
                    _sliceData.push({
                        category: data[i].subs[x].category,
                        value: data[i].subs[x].value,
                        color: data[i].subs[x].color,
                        pulled: (reset ? false : true)
                    });
                }
            } else {
                _sliceData.push({
                    category: data[i].category,
                    value: data[i].value,
                    color: data[i].color,
                    pulled: (data[i].category == o.category ? (reset ? false:true) : false),
                    id: i
                });
            }
        }
        return _sliceData;
    };
    var _generateSunburstData = function(data){
        var _sunburstData = [];
        var _group = data[0].group;
        var _data = _refData.filter(function(item){ return item.name == _group });
            _data = _data[0].items;
            
        var _res = _data.filter(function (item) {
            if(gPrmCategory==="Region" || gPrmCategory==="Market"){
            	return item[_location] == o.category && item[_selectedKey] == data[0].region; 
        	}else if(gPrmCategory==="Model Year"){
        	    return item[_location] == o.category; 
        	}else{
        	    return item[_location] == o.category && item[_selectedKey] == _group; 
        	}
        });
        
        var _groupCat = _res.groupBy([_category]);
        var _catColor = o.data.filter(function(item) {return item.category == o.category });
        if( _catColor.length > 0 ){
            _catColor = _catColor[0].subs;
        }
        
        $.each(_groupCat, function(i, category){
            var _groupOem = category.items.groupBy([_oem]);
            //var _groupHarness = category.items.groupBy([_harnessName]);
            var _color = $.map(_catColor, function(v){  if(v.category == category.name) return v.color; });
            var _json = {
                name : category.name,
                children : [],
                color: (_color.length > 0) ? _color[0] : "undefined"
            };  
            
            $.each(_groupOem, function(i, oem){
            //$.each(_groupHarness, function(i, harness){
                var _groupHarness = oem.items.groupBy([_harnessName]);
                //var _groupOem = harness.items.groupBy([_oem]);
                var _jsonOEM = {
                    name : oem.name,
                    children : []
                };
                
                $.each(_groupHarness, function(i, harness){
                    _jsonOEM.children.push({
                        name : harness.name,
                        value :  getCount(harness.items, _value),
                    });
                });
                
                _json.children.push(_jsonOEM);
            });
            
            _sunburstData.push(_json);
        });
        
        return _sunburstData;
    };
    var _generateChartData = function(data){
        var _sData = [];
        var _cData = data.filter(function(item){ 
            if(_location){
                return item.category == gPCategory;
            }else{
                return item.category == o.category;
            }
        });
        var _sName = _cData[0].region
        var _group = _cData[0].group;
        
        var _data = _refData.filter(function(item){ return item.name == _group });
            _data = _data[0].items;
        var _res  = _data.filter(function(item){
            if(gPrmCategory==="Region" || gPrmCategory==="Market"){
                if(_location){
            	    return item[_location] == gPCategory && item[_category] == o.category && item[_selectedKey] == _sName; 
                }else{
                    return item[_category] == o.category && item[_selectedKey] == _sName; 
                }
        	}else if(gPrmCategory==="Model Year"){
        	    if(_location){
            	    return item[_location] == gPCategory && item[_category] == o.category; 
                }else{
                    return item[_category] == o.category; 
                } 
        	}else{
        	    if(_location){
            	    return item[_location] == gPCategory && item[_category] == o.category && item[_selectedKey] == _group; 
                }else{
                    return item[_category] == o.category && item[_selectedKey] == _group; 
                }
        	}
        });

        if(!_thirdLevel){
            var _colorData = (_location) ? _cData[0].subs : _cData;
            var _color = (_location) ? _cData[0].subs.filter(function(v){ return v.category == o.category }) :  _cData[0].color;
            
            var _groupOem = _res.groupBy([_oem]);
            $.each(_groupOem, function(i, oem){
                var _groupHarness = oem.items.groupBy([_harnessName]);
                var _json = {
                    name : oem.name,
                    children : [],
                    color: (_location) ? _color[0].color : _color
                };  
                
                $.each(_groupHarness, function(i, harness){
                    var _jsonHarness = {
                        name : harness.name,
                        value :  getCount(harness.items, _value),
                    };
                    
                    _json.children.push(_jsonHarness);
                });
                
                _sData.push(_json);
            });
        }else{
            $.each(sortBy(gData.groupBy([_thirdLevel]), "name"), function(i, v){
                var _name = v.name;
                var _res2 = _res.filter(function (item) {
                	return item[_thirdLevel] == _name;
                });
                
                _sData.push({
                   category: _name,
                   value: getCount(_res2, _value)
                });
            });
        }
   
        return _sData;
    };
    
    var _$btnReset = $("#btnReset");
    var _$chartDiv = $("#chart_div");
    var _$chartWrapDetails = $("#chart_wrapper_details");
    var _$selectGraph = $("#chart_details_graph");
    var _$chartWrapper = $(".chart-wrapper");
    var _chartDivCW = _$chartDiv.find("div:first-child").width();
    var _chartId = "#sunburst_details"; //Chart default Id
    
    if(_$selectGraph.val()==="bar"){
        _chartId = "#bar_details";
    }
    var _$chartDetails = $(_chartId);
    var _tw = new zsi.easyJsTemplateWriter(_chartId);
    
    var _displaySunburstDetails = function(){
        var _time = 300;
        if(_location){
            if(isUD(o.selected)){
                var _modal = "modalChart"
                var _chartDiv = "chart_details_single";
                var _chartData = [];
                
                if(o.data.length > 0){
                    _chartData = _generateChartData(o.data);
                }else{
                    _chartData = _dummyData;
                }
                
                new zsi.easyJsTemplateWriter("body")
                    .bsModalBox({
                          id        : _modal
                        , sizeAttr  : "modal-md"
                        , title     : "Sunburst"
                        , body      : gTW.new().div({ id: _chartDiv, style: "min-height: 400px" })
                                         .in().spinner().html() 
                    })
        
                $("#" + _modal).find(".modal-title").text(o.percentage +": "+ o.category +" » Details") ;
                $("#" + _modal).modal({ show: true, keyboard: false, backdrop: 'static' });
                
                if(_thirdLevel){
                    displayDetailsPie(_chartDiv, _chartData)
                }else{
                    displayDetailsSunburst(_chartDiv, _chartData);
                }
            }
            else{
                gPCategory = o.category;
                
                _$chartDetails.empty().css({
                    width : _$chartDiv.width(),
                    height : _$chartDiv.height()
                });
                
                $.each(o.charts, function(i, chart){
                    var _data = [];
                    var _cData = o.chartsData[i];
                    var _res = _cData.filter(function(item){ return item.value > 0 });
                    var _charDtlId = "chartDtl_"+ i;
                        _tw.div({ class: "", id: _charDtlId, style: "width:" + _chartDivCW + "px" })
                            .in().spinner().out();
                                
                    if(_cData.length > 0 && _res.length > 0){
                        chart.data = _togglePieSlices(_cData);
                        _data = _generateSunburstData(_cData);
                    }else{
                        chart.data = _dummyData;
                        _data = _dummyData;
                    }
                    
                    if(_data.length === 0){
                        _data = _dummyData;
                    }
                    
                    setTimeout(function(){
                        displayDetailsSunburst(_charDtlId, _data);
                    }, _time);
                       _time += 300;  
                });
                _$btnReset.removeClass("d-none");
                _$chartWrapDetails.removeClass("d-none");
            }
        }
        else{
            if(isUD(o.selected)){
                gPCategory = o.category;
                
                _$chartDetails.empty().css({
                    width : _$chartDiv.width(),
                    height : _$chartDiv.height()
                });
                
                $.each(o.charts, function(i, chart){
                    var _data = [];
                    var _cData = o.chartsData[i];
                    var _res = _cData.filter(function(item){ return item.value > 0 });
                    var _charDtlId = "chartDtl_"+ i;
                        _tw.div({ class: "", id: _charDtlId, style: "width:" + _chartDivCW + "px" })
                            .in().spinner().out();
                    
                    if(_cData.length > 0 && _res.length > 0){
                            chart.data = _togglePieSlices(_cData);
                            _data = _generateChartData(_cData);
                    }else{
                        chart.data = _dummyData;
                        _data = _dummyData;
                    }
            
                    if(_data.length === 0){
                        _data = _dummyData;
                    }
                        
                    setTimeout(function(){
                        displayDetailsSunburst(_charDtlId, _data);
                    }, _time);
                       _time += 300; 
                });
                
                _$btnReset.removeClass("d-none");
                _$chartWrapDetails.removeClass("d-none");
            }
        }
        
        if(o.charts.length === 3){
            _$chartWrapper.addClass("overflow-hidden");
        }else{
            _$chartWrapper.removeClass("overflow-hidden");
        }
    };
    var _displayBarDetails = function(){
        var _data = [];
        $.each(_refData, function(i, v) { 
            var _fName = v.name;
            var _fItems = v.items;
            
            $.each(gOEMs, function(i, oem) {
                var _oemName = oem.name;
                var _res = _fItems.filter(function (item) {
                	return item[_oem] == _oemName;
                });
            
                $.each(gHarness, function(i, harness) {
                    var _harnessName = harness.name;
                    var _json = {
                        group : _fName,
                        oem_name : _oemName,
                        category : _harnessName +"("+ _oemName +"-"+ _fName +")"
                    };
                    
                    $.each(gCategories, function(z, c) {
                        var _cName = c.name;
                        var _cNameNew = _cName.replace(/ /g,"_");
                        var _res2 = _res.filter(function (item) {
                        	return item[_harness] == _harnessName && item[_category] == _cName;
                        });
                        
                        _json[_cNameNew] = getCount(_res2, _value);
                    });

                    _data.push(_json);
                }); 
            });
        });

        displayDetailsBar("bar_details", _data);
    };
    
    // if(_$selectGraph.val()==="bar"){
    //     _displayBarDetails();
    // }else{
        _displaySunburstDetails();
    //}
    
    //MOUSE EVENTS
    //On Scroll
    _$chartWrapper.scrollLeft(_$chartWrapper.scrollLeft());
    _$chartWrapper.on('scroll', function() {
        _$chartWrapper.scrollLeft($(this).scrollLeft());
    });
    
    //On click btnReset: Reset Chart Data
    _$btnReset.unbind().click(function(e){
        e.preventDefault();
        o.selected = undefined;
        $.each(o.charts, function(i, chart){
            var _cData = o.chartsData[i];
            var _res = _cData.filter(function(item){ return item.value > 0 });
            
            if(_cData.length > 0 && _res.length > 0){
                chart.data = _togglePieSlices(_cData, true);
            }else{
                chart.data = _dummyData;
            }
        });
        
        _$chartDetails.empty().css({
            width : _$chartDiv.width(),
            height : _$chartDiv.height()
        });
        _$chartWrapDetails.addClass("d-none");
        
        $(this).addClass("d-none");
    });
    
    //On change chart selection
    _$selectGraph.change(function(){
        if(this.value==="sunburst"){
            $(_chartId).removeClass("d-none");
            $("#bar_details").addClass("d-none");
        }else{
            $(_chartId).addClass("d-none");
            $("#sunburst_details").removeClass("d-none");
            
            _displayBarDetails();
        }
    });
}

//-------------------------------- CHARTS DATA  ------------------------------//
function setPieChartData(callback){
    var _data = [];
    var _key = getDistinctKey(gData);
    var _value = _key.value;
    var _category = _key.category;
    var _region = _key.region;
    var _modelYear = _key.model_year;
    var _oem = _key.oem;
    var _market = _key.market;
    var _vehicleType = _key.vehicle_type;
    var _location = _key.location;
    var _categoryObj = gCategories;
    var _locationObj = gLocations;
    var _categoryKey = (_location ? _location: _category);
    var _categoryKeyObj = (_location ? _locationObj: _categoryObj);
    var _catLength = _categoryKeyObj.length;
    var _selectedKey = _modelYear; //Default key selected
    var _selectedCategory = gModelYears; //Default category selected
    
    if(gPrmCategory==="Region"){
        _selectedKey = _region;
        _selectedCategory = gRegionNames;
    }else if(gPrmCategory==="Vehicle Type"){
        _selectedKey = _vehicleType;
        _selectedCategory = gVehicleTypes;
    }else if(gPrmCategory==="OEM"){
        _selectedKey = _oem;
        _selectedCategory = gOEMs;
    }else if(gPrmCategory==="Market"){
        _selectedKey = _market;
        _selectedCategory = gMarket;
    }

    if(gPrmCategory==="Region" || gPrmCategory==="Market"){
        $.each(_selectedCategory, function(a, r) { 
            var _groupName = r.name;
            $.each(gModelYears, function(b, v) { 
                var _my = v.name
                var _items = v.items;
                $.each(_categoryKeyObj, function(i, w) { 
                    var _sub = [];
                    var _cName = w.name;
                    var _colorSet = new am4core.ColorSet();
                    var _cColor = isUD(w.color) ? _colorSet.getIndex(i) : w.color;
                    var _cItems = sortBy(w.items.groupBy([_category]), "name");
                    var _json = { group: _my };
                    var _res = _items.filter(function (item) {
                    	return item[_categoryKey] == _cName && item[_selectedKey] == _groupName; 
                    });

                    if(_res.length > 0 && _location){
                        $.each(_cItems, function(x, y){
                            var _subJson = {};
                            var _subName = y.name;
                            var _subColor = setCategoryColor(_subName);
                            var _res2 = _res.filter(function (item) {
                            	return item[_category] == _subName;
                            });
                        
                            _subJson.category = _subName;
                            _subJson.value = getCount(_res2, _value);
                            _subJson.color = (_subColor) ? _subColor : _colorSet.getIndex(_catLength + x);

                            _sub.push(_subJson);
                        });
                        _sub = sortBy(_sub, "category");
                    }
                    _json.region = _groupName;
                    _json.category = _cName;
                    _json.value = getCount(_res, _value);
                    _json.subs = _sub;
                    _json.color = _cColor;

                    _data.push(_json);
                });
            });
        });
    }
    else{
        $.each(_selectedCategory, function(i, v) { 
            var _group = v.name;
            var _items = v.items;
            
            $.each(_categoryKeyObj, function(i, w) { 
                var _sub = [];
                var _cName = w.name;
                var _colorSet = new am4core.ColorSet();
                var _cColor = isUD(w.color) ? _colorSet.getIndex(i) : w.color;
                var _cItems = sortBy(w.items.groupBy([_category]), "name");
                var _json = { group: _group };
                var _res = _items.filter(function (item) {
                	return item[_categoryKey] == _cName;
                });
                
                if(_res.length > 0 && _location){
                    $.each(_cItems, function(x, y){
                        var _subJson = {};
                        var _subName = y.name;
                        var _subColor = setCategoryColor(_subName);
                        var _res2 = _res.filter(function (item) {
                        	return item[_category] == _subName;
                        });

                        _subJson.category = _subName;
                        _subJson.value = getCount(_res2, _value);
                        _subJson.color = (_subColor) ? _subColor : _colorSet.getIndex(_catLength + x);
                        
                        _sub.push(_subJson);
                    });
                    _sub = sortBy(_sub, "category");
                }
                
                _json.category = _cName;
                _json.value = getCount(_res, _value);
                _json.subs = _sub;
                _json.color = _cColor;
   
                _data.push(_json);
            });
        });
    }

    callback({data: _data, location: _location, selectedKey: _selectedKey, selectedCategory: _selectedCategory});
}

function setColumnChartData(callback){
    var _data = [];
    var _key = getDistinctKey(gData);
    var _value = _key.value;
    var _category = _key.category;
    var _region = _key.region;
    var _modelYear = _key.model_year;
    var _oem = _key.oem;
    var _market = _key.market;
    var _vehicleType = _key.vehicle_type;
    var _location = _key.location;
    var _categoryObj = gCategories;
    var _locationObj = gLocations;
    var _categoryKey = (_location ? _location: _category);
    var _categoryKeyObj = (_location ? _locationObj: _categoryObj);
    var _selectedKey = _modelYear; //Default key selected
    var _selectedCategory = gModelYears; //Default category selected
    
    if(gPrmCategory==="Region"){
        _selectedKey = _region;
        _selectedCategory = gRegionNames;
    }else if(gPrmCategory==="Vehicle Type"){
        _selectedKey = _vehicleType;
        _selectedCategory = gVehicleTypes;
    }else if(gPrmCategory==="OEM"){
        _selectedKey = _oem;
        _selectedCategory = gOEMs;
    }else if(gPrmCategory==="Market"){
        _selectedKey = _market;
        _selectedCategory = gMarket;
    }
    
    if(isContain(gCName, "Overall wire usage lower than 0.5 CSA")){
        _category = _location;
        _categoryObj = _locationObj;
    }
    
    if(_location && !isContain(gCName, "Overall wire usage lower than 0.5 CSA")){
        $.each(_selectedCategory, function(x, v) {
            var _sName = v.name;
            var _sItems = v.items;
            
            $.each(_locationObj, function(y, l) {
                var _loc = l.name;
                var _res = _sItems.filter(function (item) {
                	return item[_location] == _loc;
                });
                var _json = {
                    group : _sName,
                    category : _loc +"("+ _sName +")"
                };
                
                $.each(_categoryObj, function(z, s) {
                    var _count = 0;
                    var _name = s.name;
                    var _nameNew = _name.replace(/ /g,"_");
                    var _res2 = _res.filter(function (item) {
                    	return item[_category] == _name;
                    });

                    _json[_nameNew] = getCount(_res2, _value);
                });
                
                _data.push(_json);
            }); 
        });
    }else{
        $.each(_selectedCategory, function(i, v) { 
            var _name = v.name;
            var _obj = {};
                _obj.category = _name;
            
            $.each(_categoryObj, function(y, w) { 
                var _cName = w.name;
                var _cNameNew = _cName.replace(/ /g,"_");
                var _res = v.items.filter(function (item) {
                	return item[_category] == _cName;
                });
                
                _obj[_cNameNew] = getCount(_res, _value);
            });
            _data.push(_obj);
        });
    }
    
    callback({data: _data, selectedKey: _selectedKey, selectedCategory: _selectedCategory, locationObj: _locationObj, categoryObj: _categoryObj, location: _location});
}

function setOverallColumnChartData(callback){
    var _data = [];
    var _key = getDistinctKey(gData);
    var _value = _key.value;
    var _category = _key.category;
    var _region = _key.region;
    var _modelYear = _key.model_year;
    var _oem = _key.oem;
    var _market = _key.market;
    var _vehicleType = _key.vehicle_type;
    var _location = _key.location;
    var _categoryObj = gCategories;
    var _locationObj = gLocations;
    var _selectedKey = _modelYear; //Default key selected
    var _selectedCategory = gModelYears; //Default category selected
    
    if(gPrmCategory==="Region"){
        _selectedKey = _region;
        _selectedCategory = gRegionNames;
    }else if(gPrmCategory==="Vehicle Type"){
        _selectedKey = _vehicleType;
        _selectedCategory = gVehicleTypes;
    }else if(gPrmCategory==="OEM"){
        _selectedKey = _oem;
        _selectedCategory = gOEMs;
    }else if(gPrmCategory==="Market"){
        _selectedKey = _market;
        _selectedCategory = gMarket;
    }
    
    if(isContain(gCName, "Overall wire usage lower than 0.5 CSA")){
        _category = _location;
        _categoryObj = _locationObj;
    }
    
    var _pCatObj = (gPrmCategory==="Region" ? gRegionNames : gMarket);
    
    if(_location && !isContain(gCName, "Overall wire usage lower than 0.5 CSA")){
        $.each(_pCatObj, function(i, r) { 
            var _gName = r.name;
            $.each(gModelYears, function(x, my) {
                var _my = my.name;
                var _res = r.items.filter(function (item) {
                	return isContain(_my, item[_modelYear]);
                });
     
                $.each(_locationObj, function(y, l) {
                    var _loc = l.name;
                    var _json = {
                        group : _gName,
                        model_year : _my,
                        category : _loc +"("+ _my +"-"+ _gName +")"
                    };
                    
                    $.each(_categoryObj, function(z, s) {
                        var _cName = s.name;
                        var _cNameNew = _cName.replace(/ /g,"_");
                        var _res2 = _res.filter(function (item) {
                        	return item[_location] == _loc && item[_category] == _cName;
                        });
                        
                        _json[_cNameNew] = getCount(_res2, _value);
                    });

                    _data.push(_json);
                }); 
            });
        });
    }
    else{
        $.each(_pCatObj, function(i,r) { 
            var _gName = r.name;
            $.each(gModelYears, function(x, my) { 
                var _my = my.name;
                var _obj = {};
                _obj.group = _gName;
                _obj.model_year = _my;
                _obj.category = _my +"("+ _gName +")";
                
                $.each(_categoryObj, function(y, w) { 
                    var _cName = w.name;
                    var _cNameNew = _cName.replace(/ /g,"_");
                    var _res = r.items.filter(function (item) {
                    	return item[_category] == _cName && isContain(_my, item[_modelYear]);
                    });
    
                    _obj[_cNameNew] = getCount(_res, _value);
                });
                _data.push(_obj);
            });
        });
    }
    callback({data: _data, selectedKey: _selectedKey, categoryObj: _categoryObj, locationObj: _locationObj, location: _location});
}

//------------------------------- COMMON CHARTS ------------------------------//
// PIE CHART
function displayComPieChart(container){
    setPieChartData(function(o){
        var _data = o.data;
        var _location = o.location;
        var _key = o.selectedKey;
        var _category = o.selectedCategory;
        var _charts = [];
        var _chartsData = [];
        var _createChart = function(data, name, isLegend, div){
            var chart = am4core.create(div, (gPrmIs3D ? am4charts.PieChart3D : am4charts.PieChart));
            //var chart = _container.createChild(am4charts.PieChart);
            chart.paddingTop= 15;
            chart.paddingBottom = 15;
            
            var selected;
            var generateChartData = function() {
                var chartData = [];
                for (var i = 0; i < data.length; i++) {
                    if (i == selected) {
                        for (var x = 0; x < data[i].subs.length; x++) {
                            chartData.push({
                                category: data[i].subs[x].category,
                                value: data[i].subs[x].value,
                                color: data[i].subs[x].color,
                                pulled: true
                            });
                        }
                    } else {
                        chartData.push({
                            category: data[i].category,
                            value: data[i].value,
                            color: data[i].color,
                            id: i
                        });
                    }
                }
                return chartData;
            };
            
            if(data.length > 0){
                chart.data = generateChartData();
            }else{
                /* Dummy innitial data data */
                chart.data = [{
                  "category": "Dummy",
                  "disabled": true,
                  "value": 1000,
                  "color": am4core.color("#dadada"),
                  "opacity": 0.3,
                  "strokeDasharray": "4,4",
                  "tooltip": ""
                }];   
            }
            
            var label = chart.createChild(am4core.Label);
            label.text = "[#212529]" + name +"[/]";
            label.fontSize = 15;
            label.align = "center";
            
            //Animate
            chart.hiddenState.properties.radius = am4core.percent(0);
            //chart.hiddenState.properties.endAngle = -90;
            
            // Add and configure Series
            var pieSeries = chart.series.push((gPrmIs3D ? new am4charts.PieSeries3D() : new am4charts.PieSeries()));
            pieSeries.dataFields.value = "value";
            pieSeries.dataFields.category = "category";
            pieSeries.paddingBottom = 10;
            pieSeries.colors.step = 2;
            
            pieSeries.dataFields.hiddenInLegend = "disabled";
            
             /* Set tup slice appearance */
            var slice = pieSeries.slices.template;
            slice.propertyFields.fill = "color";
            slice.propertyFields.fillOpacity = "opacity";
            //slice.propertyFields.stroke = "color";
            slice.propertyFields.strokeDasharray = "strokeDasharray";
            slice.propertyFields.tooltipText = "tooltip";
            slice.propertyFields.isActive = "pulled";
            slice.stroke = am4core.color("#dadada");
            slice.strokeWidth = 0.3;
            slice.strokeOpacity = 0.3;
            
            pieSeries.labels.template.propertyFields.disabled = "disabled";
            pieSeries.ticks.template.propertyFields.disabled = "disabled";
            pieSeries.ticks.template.disabled = true;
            pieSeries.alignLabels = false;
            pieSeries.labels.template.fontSize = 10;
            pieSeries.labels.template.text = "{value.percent.formatNumber('#.00')}%";
            pieSeries.labels.template.radius = am4core.percent(-40);
            //pieSeries.labels.template.relativeRotation = 90;
            pieSeries.labels.template.fill = am4core.color("white");
            // pieSeries.legendSettings.labelText = "{name}";
            pieSeries.legendSettings.valueText = "{valueY.close}";
            pieSeries.labels.template.adapter.add("text", function(text, target) {
                if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                    return "";
                }
                return text;
            });
            
            pieSeries.slices.template.events.on("hit", function(ev) {
                if(ev.target.dataItem.dataContext.category!=="Dummy"){
                    var series = ev.target.dataItem.component;
                    var category = ev.target.dataItem.category;
                    var percentage = parseFloat(ev.target.dataItem.values.value.percent).toFixed(1) + "%";
                    
                    series.slices.each(function(item) {
                        if (item.isActive && item != ev.target) {
                            item.isActive = false;
                        }
                    });

                    if(_location){
                        if (ev.target.dataItem.dataContext.id !== undefined ) {
                            selected = ev.target.dataItem.dataContext.id;
                            setLegend(chart);
                            //chart.data = generateChartData();
                        } else {
                            selected = undefined;
                        }
                    }
                    
                    showChartDetails({
                        baseId : ev.target.baseId,
                        charts : _charts,
                        chartsData : _chartsData,
                        data: data,
                        selected: selected,
                        category : category,
                        percentage: percentage,
                        group : name,
                    });
                }
            });
            
            _charts.push(chart);
            _chartsData.push(data);
        };
        
        var _key = getDistinctKey(gData);
        var _region = _key.region;
        var _modelYear = _key.model_year;
        var _dLength = _data.groupBy(["group"]).length;
        var _chartWidth = $(".chart-wrapper").width() / 3;
        var _container = "#"+ container;
        var _tw = new zsi.easyJsTemplateWriter(_container);
        
        $.each(_category, function(i, v){
            var _groupName = v.name;
            var _charId = "chart_"+ i;
                _tw.div({ class: "", id: _charId, style: "width:" + _chartWidth + "px" });
            
            var _res = (v.items.length === 0 ? [] : _data.filter(function (item) {
            	return item.group == _groupName;
            }));
          
            if($.isNumeric(_groupName)) _groupName = "MY"+ _groupName;

            _createChart(sortBy(_res, "category"), _groupName, (i === 0 ? true : false), _charId);
        });
        $(_container).width((_chartWidth * _dLength) - 1);
        
        setLegend(_charts);
        setTrends(_data, gModelYears);
        setOpportunities(_data, _category);
    });
}

function displayComPieRegionChart(container){
    setPieChartData(function(o){
        var _data = o.data;
        var _location = o.location;
        var _key = o.selectedKey;
        var _category = o.selectedCategory;   
        var _charts = [];
        var _chartsData = [];
        var _dummyData = [{
                  "category": "Dummy",
                  "disabled": true,
                  "value": 1000,
                  "color": am4core.color("#dadada"),
                  "opacity": 0.3,
                  "strokeDasharray": "4,4",
                  "tooltip": ""
                }];   
                
        var _createChart = function(data, name, isLegend, div){
            var chart = am4core.create(div, (gPrmIs3D ? am4charts.PieChart3D : am4charts.PieChart));
            //var chart = div.createChild(am4charts.PieChart);
            chart.paddingTop= 15;
            chart.paddingBottom = 15;
            
            var selected;
            var generateChartData = function() {
                var chartData = [];
                for (var i = 0; i < data.length; i++) {
                    if (i == selected) {
                        for (var x = 0; x < data[i].subs.length; x++) {
                            chartData.push({
                                category: data[i].subs[x].category,
                                value: data[i].subs[x].value,
                                color: data[i].subs[x].color,
                                pulled: true
                            });
                        }
                    } else {
                        chartData.push({
                            category: data[i].category,
                            value: data[i].value,
                            color: data[i].color,
                            id: i
                        });
                    }
                }
                return chartData;
            };
            
            var _res = data.filter(function(item) {return item.value > 0 });
            if(data.length > 0 && _res.length > 0){
                chart.data = generateChartData();
            }else{
                /* Dummy innitial data data */
                chart.data = _dummyData;
            }
            
            var label = chart.createChild(am4core.Label);
            label.text = "[#212529]" + name +"[/]";
            label.align = "center";
            label.isMeasured = false;
            label.x = am4core.percent(50);
            label.horizontalCenter = "middle";
            label.y = am4core.percent(95);
            
            var label = chart.createChild(am4core.Label);
            label.text = "[#212529][bold]" + label +"[/]";
            label.align = "center";
            label.isMeasured = false;
            label.x = am4core.percent(50);
            label.horizontalCenter = "middle";
            label.y = am4core.percent(96);
            
            //Animate
            chart.hiddenState.properties.radius = am4core.percent(0);
            //chart.hiddenState.properties.endAngle = -90;
            
            // Add and configure Series
            var pieSeries = chart.series.push((gPrmIs3D ? new am4charts.PieSeries3D() : new am4charts.PieSeries()));
            pieSeries.dataFields.value = "value";
            pieSeries.dataFields.category = "category";
            pieSeries.paddingBottom = 10;
            pieSeries.colors.step = 2;
            
            pieSeries.dataFields.hiddenInLegend = "disabled";
            
             /* Set tup slice appearance */
            var slice = pieSeries.slices.template;
            slice.propertyFields.fill = "color";
            slice.propertyFields.fillOpacity = "opacity";
            //slice.propertyFields.stroke = "color";
            slice.propertyFields.strokeDasharray = "strokeDasharray";
            slice.propertyFields.tooltipText = "tooltip";
            slice.propertyFields.isActive = "pulled";
            slice.stroke = am4core.color("#dadada");
            slice.strokeWidth = 0.3;
            slice.strokeOpacity = 0.3;
            
            pieSeries.labels.template.propertyFields.disabled = "disabled";
            pieSeries.ticks.template.propertyFields.disabled = "disabled";
            pieSeries.ticks.template.disabled = true;
            pieSeries.alignLabels = false;
            pieSeries.labels.template.fontSize = 10;
            pieSeries.labels.template.text = "{value.percent.formatNumber('#.00')}%";
            pieSeries.labels.template.radius = am4core.percent(-40);
            //pieSeries.labels.template.relativeRotation = 90;
            pieSeries.labels.template.fill = am4core.color("white");
            // pieSeries.legendSettings.labelText = "{name}";
            pieSeries.legendSettings.valueText = "{valueY.close}";
            pieSeries.labels.template.adapter.add("text", function(text, target) {
                if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                    return "";
                }
                return text;
            });

            pieSeries.slices.template.events.on("hit", function(ev) {
                if(ev.target.dataItem.dataContext.category!=="Dummy"){
                    var series = ev.target.dataItem.component;
                    var category = ev.target.dataItem.category;
                    var percentage = parseFloat(ev.target.dataItem.values.value.percent).toFixed(1) + "%";
                    
                    series.slices.each(function(item) {
                        if (item.isActive && item != ev.target) {
                            item.isActive = false;
                        }
                    });
                    //if(ev.target.dataItem.dataContext.id !== 0){
                    if(_location){
                        if (ev.target.dataItem.dataContext.id !== undefined ) {
                            selected = ev.target.dataItem.dataContext.id;
                            setLegend(chart);
                            //chart.data = generateChartData();
                        } else {
                            selected = undefined;
                        }
                    }
                    
                    showChartDetails({
                        baseId : ev.target.baseId,
                        charts : _charts,
                        chartsData : _chartsData,
                        data: data,
                        selected: selected,
                        category : category,
                        percentage: percentage,
                        group : name,
                    });
                }
            });
            
            _charts.push(chart);
            _chartsData.push(data);
        };
        
        var _key = getDistinctKey(gData);
        var _region = _key.region;
        var _modelYear = _key.model_year;
        var _dLength = _data.groupBy(["group","region"]).length
        var _myLength = gModelYears.length;
        var _chartWidth = $(".chart-wrapper").width() / 3;
        var _tw = new zsi.easyJsTemplateWriter("#"+ container);

        $.each(_category, function(i, v){
            var _cName = v.name;
            var _cNameNew = _cName.replace(/ /g,"_");
            var _chartDiv = "chart_"+ _cNameNew;
                _tw.div({ class: "d-flex position-relative border-right", id: _chartDiv, style: "width:" + (_chartWidth *_myLength)  + "px" })
                    .in().span({class: "position-absolute w-100 text-center font-weight-bold", value: _cName, style: "bottom:0"});
            
            $.each(gModelYears, function(i, my){
                var _name = my.name;
                var _chartSubDiv = "chart_"+ _cNameNew +"_"+ _name;
                var _result = _data.filter(function (item) {
                	return item.region == _cName && item.group == _name;// && item.value > 0;
                });
                _tw.div({ class: "h-100", id: _chartSubDiv, style: "width:" + _chartWidth + "px" });

                _createChart(sortBy(_result, "category"), _name, (i === 0 ? true : false), _chartSubDiv);
            });
            _tw.out();
        });
        $("#"+ container).width(_chartWidth * _dLength);
        
        setLegend(_charts);
        setTrends(_data, _category);
        setOpportunities(_data, _category);
    });
}

// COLUMN CHART
function displayComStackColumnChart(container){
    setColumnChartData(function(o){
        var _data = o.data;
        var _key = o.selectedKey;
        var _selectedCat = o.selectedCategory;
        var _locationObj = o.locationObj;
        var _category = o.categoryObj;
        var _location = o.location;
        console.log("_data", _data);

        var chart = am4core.create(container, (gPrmIs3D ? am4charts.XYChart3D : am4charts.XYChart));
        chart.data = _data;
        //chart.colors.step = 2;
        chart.padding(15, 15, 10, 15);
        chart.maskBullets = false;
        
        // Create axes
        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "category";
        categoryAxis.renderer.minGridDistance = 60;
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.interactionsEnabled = false;
        categoryAxis.renderer.labels.template.fontSize = 10;
        //categoryAxis.renderer.labels.template.rotation = (_location ? -30: 0);
        //categoryAxis.fontSize = 12;
        categoryAxis.renderer.labels.template.adapter.add("textOutput", function(text) {
            return (!isUD(text) ? text.replace(/\(.*/, "") : text);
        });
        
        //if(gPrmCategory==="Vehicle Type" || gPrmCategory==="OEM"){
            // categoryAxis.renderer.labels.template.rotation = 90;
            // categoryAxis.renderer.labels.template.verticalCenter = "middle";
            // categoryAxis.renderer.labels.template.horizontalCenter = "left";
            categoryAxis.renderer.labels.template.adapter.add("dy", function(dy, target) {
              if (target.dataItem && target.dataItem.index & 2 == 2) {
                return dy + 10;
              }
              return dy;
            });
        //}
        
        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.min = 0;
        valueAxis.calculateTotals = true;
        
        //valueAxis.renderer.minGridDistance = 20;
        //valueAxis.renderer.minWidth = 35;
        
        if(!isContain(gMenu, "RETAINERS")){
            categoryAxis.numberFormatter.numberFormat = "#";
            
            valueAxis.max = 100;
            valueAxis.strictMinMax = true;
            valueAxis.renderer.labels.template.adapter.add("text", function(text) {
              return text + "%";
            });
        }
        
        // Create series
        var _createSeries = function(field, name, color) {
            var series = chart.series.push((gPrmIs3D ? new am4charts.ColumnSeries3D() : new am4charts.ColumnSeries()));
            series.columns.template.tooltipText = "{name}: {valueY.totalPercent.formatNumber('#.00')}% - {valueY.formatNumber('#,###')}";
            series.columns.template.column.strokeOpacity = 0;
            series.name = name;
            series.dataFields.categoryX = "category";
            series.dataFields.valueY = field;
            series.dataItems.template.locations.categoryX = 0.5;
            series.stacked = gIsStacked;
            series.tooltip.pointerOrientation = "vertical";
            series.sequencedInterpolation = true;
            
            if(!isContain(gMenu, "RETAINERS")){
                series.dataFields.valueYShow = "totalPercent";
            }
            
            if(color) {
                series.columns.template.column.fill = color;
                series.tooltip.getFillFromObject = false;
                series.tooltip.background.fill = am4core.color(color);
            }
            
            series.columns.template.adapter.add("fill", function(fill, target) {
                if(target.dataItem.className === "LegendDataItem"){
                    if(name == target.dataItem.name){
                        return (color ? am4core.color(color) : fill);
                    }
                }
            });
           
            var valueLabel = series.bullets.push(new am4charts.LabelBullet());
            valueLabel.label.text = "{valueY.totalPercent.formatNumber('#.00')}%";
            valueLabel.fontSize = 10;
            if(gIsStacked){
                valueLabel.label.fill = am4core.color("#ffffff");
                valueLabel.locationY = 0.5;
            }else{
                valueLabel.dy = -10;
            }
        };
        
        var _createLabel = function(category, endCategory, label, dy) {
            var range = categoryAxis.axisRanges.create();
            range.category = category;
            range.endCategory = endCategory;
            range.label.dataItem.text = label;
            range.label.dy = dy;
            //range.label.fontSize = 10;
            range.label.fontWeight = "bold";
            range.label.valign = "bottom";
            range.label.location = 0.5;
            // range.label.rotation = 0;
            // range.axisFill.fill = am4core.color("#396478");
            // range.axisFill.fillOpacity = opacity;
            // range.locations.category = 0.1;
            // range.locations.endCategory = 0.9;
            
            range.grid.stroke = am4core.color("#396478");
            range.grid.strokeOpacity = 1;
            range.tick.length = 230;
            range.tick.disabled = false;
            range.tick.strokeOpacity = 0.6;
            //range.tick.stroke = am4core.color("#396478");
            range.tick.location = 0;
              
            range.locations.category = 0;
        };
        
        $.each(_category, function(i, v) { 
            var _name = v.name;
            var _nameNew = _name.replace(/ /g,"_");
            var _color = setCategoryColor(_name);
                _color = (_color) ? _color : chart.colors.getIndex(i);
                
            _createSeries(_nameNew, _name, _color);
        });
        
        if(_location && !isContain(gCName, "Overall wire usage lower than 0.5 CSA")){
            var _loc = getFirstAndLastItem(_locationObj , "name");
            
            $.each(_selectedCat, function(i, v) { 
                var _sName = v.name;
                var _first = _loc.first + "("+ _sName +")";
                var _last = _loc.last + "("+ _sName +")";
                
                _createLabel(_first, _last, _sName, 11);
            });
        }
        
        //Add cursor
        chart.scrollbarX = new am4core.Scrollbar();

        chart.cursor = new am4charts.XYCursor();
        chart.cursor.behavior = "panX";
        
        setLegend(chart);
        setTrends(_data, _category);
        setOpportunities(_data, _category);
    });
}

function displayComOverallColumnChart(container){
   setOverallColumnChartData(function(o){
        var _data = o.data;
        var _key = o.selectedKey;
        var _category = o.categoryObj;
        var _locationObj = o.locationObj;
        var _location = o.location;

        var chart = am4core.create(container, (gPrmIs3D ? am4charts.XYChart3D : am4charts.XYChart));
        chart.data = _data;
        //chart.colors.step = 2;
        chart.padding(15, 15, 10, 15);
        chart.maskBullets = false;

        if(_location){
            var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            categoryAxis.dataFields.category = "category";
            categoryAxis.renderer.minGridDistance = 60;
            categoryAxis.renderer.grid.template.location = 0;
            categoryAxis.interactionsEnabled = false;
            categoryAxis.renderer.labels.template.fontSize = 10;
            // categoryAxis.renderer.minGridDistance = 20;
            // categoryAxis.renderer.grid.template.location = 0;
            // categoryAxis.interactionsEnabled = false;
            // categoryAxis.renderer.labels.template.fontSize = 10;
            // categoryAxis.renderer.labels.template.valign = "top";
            // categoryAxis.renderer.labels.template.location = 0;
            //categoryAxis.renderer.labels.template.rotation = (_location ? 270: 0);
            categoryAxis.renderer.labels.template.adapter.add("textOutput", function(text) {
                return (!isUD(text) ? text.replace(/\(.*/, "") : text);
            });
            
            categoryAxis.renderer.labels.template.adapter.add("dy", function(dy, target) {
              if (target.dataItem && target.dataItem.index & 2 == 2) {
                return dy;
              }
              return dy - 9;
            });
        
            var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            //valueAxis.title.text = "Count";
            valueAxis.min = 0;
            valueAxis.calculateTotals = true;
            //valueAxis.renderer.minGridDistance = 10;
            
            if(!isContain(gMenu, "RETAINERS")){
                valueAxis.max = 100;
                valueAxis.strictMinMax = true;
                valueAxis.renderer.labels.template.adapter.add("text", function(text) {
                  return text + "%";
                });
            }
        
            // Create series
            var _createSeries = function(field, name, color) {
                var series = chart.series.push((gPrmIs3D ? new am4charts.ColumnSeries3D() : new am4charts.ColumnSeries()));
                series.columns.template.width = am4core.percent(80);
                series.columns.template.tooltipText = "[bold]{name}:[/] {valueY.formatNumber('#,###')} - [bold]{valueY.formatNumber('#,###')}[/]";
                series.columns.template.column.strokeOpacity = 0;
                series.name = name;
                series.dataFields.categoryX = "category";
                series.dataFields.valueY = field;
                series.dataItems.template.locations.categoryX = 0.5;
                series.stacked = gIsStacked;
                series.tooltip.pointerOrientation = "vertical";
                //series.sequencedInterpolation = true;
                
                if(!isContain(gMenu, "RETAINERS")){
                    series.dataFields.valueYShow = "totalPercent";
                }
                
                if(color) {
                    series.columns.template.column.fill = color;
                    series.tooltip.getFillFromObject = false;
                    series.tooltip.background.fill = am4core.color(color);
                }
            
                series.columns.template.adapter.add("fill", function(fill, target) {
                    if(target.dataItem.className == "LegendDataItem"){
                        if(name == target.dataItem.name){
                            return (color ? am4core.color(color) : fill);
                        }
                    }
                });
                
                var valueLabel = series.bullets.push(new am4charts.LabelBullet());
                valueLabel.label.text = "{valueY.totalPercent.formatNumber('#.00')}%";
                valueLabel.fontSize = 10;
                if(gIsStacked){
                    valueLabel.label.fill = am4core.color("#ffffff");
                    valueLabel.locationY = 0.5;
                }else{
                    valueLabel.dy = -10;
                }
            };
            
            var _createLabel = function(category, endCategory, label, dy) {
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
                // range.axisFill.fill = am4core.color("#396478");
                // range.axisFill.fillOpacity = opacity;
                // range.locations.category = 0.1;
                // range.locations.endCategory = 0.9;
                
                range.grid.stroke = am4core.color("#396478");
                range.grid.strokeOpacity = 1;
                range.tick.length = 230;
                range.tick.disabled = false;
                range.tick.strokeOpacity = 0.6;
                //range.tick.stroke = am4core.color("#396478");
                range.tick.location = 0;
                  
                range.locations.category = 0;
            };
        }
        else{
            var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            categoryAxis.dataFields.category = "category";
            categoryAxis.renderer.minGridDistance = 60;
            categoryAxis.renderer.grid.template.location = 0;
            categoryAxis.interactionsEnabled = false;
            categoryAxis.renderer.labels.template.fontSize = 10;
            categoryAxis.numberFormatter.numberFormat = "#";
            categoryAxis.renderer.labels.template.adapter.add("textOutput", function(text) {
                return (typeof(text)!=="undefined" ? text.replace(/\(.*/, "") : text);
            });
            
            var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.min = 0;
            valueAxis.calculateTotals = true;
            
            if(!isContain(gMenu, "RETAINERS")){
                valueAxis.max = 100;
                valueAxis.strictMinMax = true;
                valueAxis.renderer.labels.template.adapter.add("text", function(text) {
                  return text + "%";
                });
            }
            
            // Create series
            var _createSeries = function(field, name, color) {
                var series = chart.series.push((gPrmIs3D ? new am4charts.ColumnSeries3D() : new am4charts.ColumnSeries()));
                series.columns.template.tooltipText = "{name}: {valueY.totalPercent.formatNumber('#.00')}% - {valueY.formatNumber('#,###')}";
                series.columns.template.column.strokeOpacity = 0;
                series.name = name;
                series.dataFields.categoryX = "category";
                series.dataFields.valueY = field;
                series.dataItems.template.locations.categoryX = 0.5;
                series.stacked = gIsStacked;
                series.tooltip.pointerOrientation = "vertical";
                //series.sequencedInterpolation = true;
                
                if(!isContain(gMenu, "RETAINERS")){
                    series.dataFields.valueYShow = "totalPercent";
                }
                
                if(color) {
                    series.columns.template.column.fill = color;
                    series.tooltip.getFillFromObject = false;
                    series.tooltip.background.fill = am4core.color(color);
                }
            
                series.columns.template.adapter.add("fill", function(fill, target) {
                    if(target.dataItem.className === "LegendDataItem"){
                        if(name == target.dataItem.name){
                            return (color ? am4core.color(color) : fill);
                        }
                    }
                });
                
                var valueLabel = series.bullets.push(new am4charts.LabelBullet());
                valueLabel.label.text = "{valueY.totalPercent.formatNumber('#.00')}%";
                valueLabel.fontSize = 10;
                if(gIsStacked){
                    valueLabel.label.fill = am4core.color("#ffffff");
                    valueLabel.locationY = 0.5;
                }else{
                    valueLabel.dy = -10;
                }
            };
             
            var _createLabel = function(category, endCategory, label) {
                var range = categoryAxis.axisRanges.create();
                range.category = category;
                range.endCategory = endCategory;
                range.label.dataItem.text = label;
                range.label.dy = 20;
                range.label.fontWeight = "bold";
                // range.axisFill.fill = am4core.color("#396478");
                // range.axisFill.fillOpacity = 0.1;
                // range.locations.category = 0.1;
                // range.locations.endCategory = 0.9;
                
                range.grid.stroke = am4core.color("#396478");
                range.grid.strokeOpacity = 1;
                range.tick.length = 230;
                range.tick.disabled = false;
                range.tick.strokeOpacity = 0.6;
                //range.tick.stroke = am4core.color("#396478");
                range.tick.location = 0;
                  
                range.locations.category = 0;
            };
        }
    
        $.each(_category, function(i, v) { 
            var _name = v.name;
            var _field = _name.replace(/ /g,"_");
            var _color = setCategoryColor(_name);
                _color = (_color) ? _color : chart.colors.getIndex(i);
            
            _createSeries(_field, _name, _color);
        });
        
        var _my = getFirstAndLastItem(gModelYears , "name");
        var _myFirst = _my.first;
        var _myLast = _my.last;
        var _pCatObj = (gPrmCategory==="Region" ? gRegionNames : gMarket);
        
        if(_location && !isContain(gCName, "Overall wire usage lower than 0.5 CSA")){
            var _specName = getFirstAndLastItem(_locationObj , "name");
            
            $.each(gModelYears, function(i, v) { 
                var _my = v.name;
                
                $.each(_pCatObj, function(i, r) { 
                    var _reg = r.name;
                    var _first = _specName.first + "("+ _my +"-"+ _reg +")";
                    var _last = _specName.last + "("+ _my +"-"+ _reg +")";
                    
                    _createLabel(_first, _last, _my, 10);
                });
            });
            
            $.each(_pCatObj, function(i, r) { 
                var _reg = r.name;
                var _first = _specName.first + "("+ _myFirst +"-"+ _reg +")";
                var _last = _specName.last + "("+ _myLast +"-"+ _reg +")";
                
                _createLabel(_first, _last, _reg, 20);
            });
        }
        else{
            $.each(_pCatObj, function(i, r) { 
                var _region = "("+ r.name +")";
                
                _createLabel(_myFirst + _region, _myLast + _region, r.name, 10);
            });
        }
    
        //Add cursor
        chart.scrollbarX = new am4core.Scrollbar();
    
        chart.cursor = new am4charts.XYCursor();
        chart.cursor.behavior = "panX";
        
        setLegend(chart);
        setTrends(_data, _category);
        setOpportunities(_data, _category);
    });
}

//LINE CHART
function displayComLineChart(container){
    
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

//DRILLDOWN SECTION
function displayDetailsSunburst(container, data){
    var chart = am4core.create(container, am4plugins_sunburst.Sunburst);
    chart.padding(35,35,35,35);
    chart.radius = am4core.percent(98);
    chart.fontSize = 10;
    
    // Add multi-level data
    chart.data = data;
    
    chart.fontSize = 11;
    chart.innerRadius = am4core.percent(10);
    
    // Define data fields
    chart.dataFields.value = "value";
    chart.dataFields.name = "name";
    chart.dataFields.children = "children";
    chart.dataFields.color = "color";
    
    var level0SeriesTemplate = new am4plugins_sunburst.SunburstSeries();
    level0SeriesTemplate.hiddenInLegend = true;
    chart.seriesTemplates.setKey("0", level0SeriesTemplate)
    
    // this makes labels to be hidden if they don't fit
    level0SeriesTemplate.labels.template.truncate = true;
    level0SeriesTemplate.labels.template.hideOversized = true;
    level0SeriesTemplate.labels.template.text = "{name}";
     
    var slice = level0SeriesTemplate.slices.template;
    slice.propertyFields.tooltipText = "tooltip";

    level0SeriesTemplate.labels.template.adapter.add("rotation", function(rotation, target) {
      target.maxWidth = target.dataItem.slice.radius - target.dataItem.slice.innerRadius - 10;
      target.maxHeight = Math.abs(target.dataItem.slice.arc * (target.dataItem.slice.innerRadius + target.dataItem.slice.radius) / 2 * am4core.math.RADIANS);
    
      return rotation;
    })
    
    var level1SeriesTemplate = level0SeriesTemplate.clone();
    chart.seriesTemplates.setKey("1", level1SeriesTemplate)
    level1SeriesTemplate.fillOpacity = 0.75;
    level1SeriesTemplate.hiddenInLegend = true;
    
    var level2SeriesTemplate = level0SeriesTemplate.clone();
    chart.seriesTemplates.setKey("2", level2SeriesTemplate)
    level2SeriesTemplate.fillOpacity = 0.5;
    level2SeriesTemplate.hiddenInLegend = true;
}

function displayDetailsPie(container, data){
    var chart = am4core.create(container, (gPrmIs3D ? am4charts.PieChart3D : am4charts.PieChart));
    chart.data = data
    
    // Add and configure Series
    var pieSeries = chart.series.push((gPrmIs3D ? new am4charts.PieSeries3D() : new am4charts.PieSeries()));
    pieSeries.dataFields.value = "value";
    pieSeries.dataFields.category = "category";
    pieSeries.colors.step = 2;
    pieSeries.dataFields.hiddenInLegend = "disabled";
    
    pieSeries.ticks.template.disabled = true;
    pieSeries.alignLabels = false;
    pieSeries.labels.template.text = "{value.percent.formatNumber('#.0')}%";
    pieSeries.labels.template.radius = am4core.percent(-40);
    pieSeries.labels.template.fill = am4core.color("white");
    
    //Animate
    chart.hiddenState.properties.radius = am4core.percent(0);
    //chart.hiddenState.properties.endAngle = -90;
    
     /* Set tup slice appearance */
    var slice = pieSeries.slices.template;
    slice.propertyFields.fill = "color";
    slice.propertyFields.fillOpacity = "opacity";
    //slice.propertyFields.stroke = "color";
    slice.propertyFields.strokeDasharray = "strokeDasharray";
    slice.propertyFields.tooltipText = "tooltip";
    slice.propertyFields.isActive = "pulled";
    slice.stroke = am4core.color("#dadada");
    slice.strokeWidth = 0.3;
    slice.strokeOpacity = 0.3;
    
    pieSeries.labels.template.propertyFields.disabled = "disabled";
    pieSeries.ticks.template.propertyFields.disabled = "disabled";
    pieSeries.ticks.template.disabled = true;
    pieSeries.alignLabels = false;
    pieSeries.labels.template.fontSize = 10;
    pieSeries.labels.template.text = "{value.percent.formatNumber('#.00')}%";
    pieSeries.labels.template.radius = am4core.percent(-40);
    //pieSeries.labels.template.relativeRotation = 90;
    pieSeries.labels.template.fill = am4core.color("white");
    // pieSeries.legendSettings.labelText = "{name}";
    pieSeries.legendSettings.valueText = "{valueY.close}";
    pieSeries.labels.template.adapter.add("text", function(text, target) {
        if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
            return "";
        }
        return text;
    });
    
    //chart.legend = new am4charts.Legend();
}

function displayDetailsBar(container, data){
    var _key = getDistinctKey(gData);
    var _value = _key.value;
    var _category = _key.category;
    var _region = _key.region;
    var _modelYear = _key.model_year;
    var _oem = _key.oem;
    var _market = _key.market;
    var _harness = _key.harness_name;
    var _vehicleType = _key.vehicle_type;
    var _location = _key.location;
    var _categoryObj = gCategories;
    var _locationObj = gLocations;
    var _selectedKey = _modelYear; //Default key selected
    var _selectedCategory = gModelYears; //Default category selected
    
    if(gPrmCategory==="Region"){
        _selectedKey = _region;
        _selectedCategory = gRegionNames;
    }else if(gPrmCategory==="Vehicle Type"){
        _selectedKey = _vehicleType;
        _selectedCategory = gVehicleTypes;
    }else if(gPrmCategory==="OEM"){
        _selectedKey = _oem;
        _selectedCategory = gOEMs;
    }else if(gPrmCategory==="Market"){
        _selectedKey = _market;
        _selectedCategory = gHarness;
    }

    var chart = am4core.create(container, (gPrmIs3D ? am4charts.XYChart3D : am4charts.XYChart));
    chart.data = data;
    chart.padding(15, 15, 10, 15);
    chart.maskBullets = false;

    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "category";
    categoryAxis.renderer.minGridDistance = 60;
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.interactionsEnabled = false;
    categoryAxis.renderer.labels.template.fontSize = 10;
    categoryAxis.renderer.labels.template.adapter.add("textOutput", function(text) {
        return (!isUD(text) ? text.replace(/\(.*/, "") : text);
    });
    
    categoryAxis.renderer.labels.template.adapter.add("dy", function(dy, target) {
      if (target.dataItem && target.dataItem.index & 2 == 2) {
        return dy;
      }
      return dy - 9;
    });

    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    valueAxis.calculateTotals = true;
    
    if(!isContain(gMenu, "RETAINERS")){
        valueAxis.max = 100;
        valueAxis.strictMinMax = true;
        valueAxis.renderer.labels.template.adapter.add("text", function(text) {
          return text + "%";
        });
    }

    // Create series
    var _createSeries = function(field, name, color) {
        var series = chart.series.push((gPrmIs3D ? new am4charts.ColumnSeries3D() : new am4charts.ColumnSeries()));
        series.columns.template.width = am4core.percent(80);
        series.columns.template.tooltipText = "[bold]{name}:[/] {valueY.formatNumber('#,###')} - [bold]{valueY.formatNumber('#,###')}[/]";
        series.columns.template.column.strokeOpacity = 0;
        series.name = name;
        series.dataFields.categoryX = "category";
        series.dataFields.valueY = field;
        series.dataItems.template.locations.categoryX = 0.5;
        series.stacked = gIsStacked;
        series.tooltip.pointerOrientation = "vertical";
        series.sequencedInterpolation = true;

        if(color) {
            series.columns.template.column.fill = color;
            series.tooltip.getFillFromObject = false;
            series.tooltip.background.fill = am4core.color(color);
        }
    
        series.columns.template.adapter.add("fill", function(fill, target) {
            if(target.dataItem.className === "LegendDataItem"){
                if(name == target.dataItem.name){
                    return (color ? am4core.color(color) : fill);
                }
            }
        });
        
        var valueLabel = series.bullets.push(new am4charts.LabelBullet());
        valueLabel.label.text = "{valueY.totalPercent.formatNumber('#.00')}%";
        valueLabel.fontSize = 10;
        if(gIsStacked){
            valueLabel.label.fill = am4core.color("#ffffff");
            valueLabel.locationY = 0.5;
        }else{
            valueLabel.dy = -10;
        }
    };
    
    var _createLabel = function(category, endCategory, label, dy) {
        var range = categoryAxis.axisRanges.create();
        range.category = category;
        range.endCategory = endCategory;
        range.label.dataItem.text = label;
        range.label.dy = dy;
        range.label.fontWeight = "bold";
        range.label.valign = "bottom";
        range.label.location = 0.5;
        range.label.rotation = 0;
        
        range.grid.stroke = am4core.color("#396478");
        range.grid.strokeOpacity = 1;
        range.tick.length = 230;
        range.tick.disabled = false;
        range.tick.strokeOpacity = 0.6;
        range.tick.location = 0;
        
        range.locations.category = 0;
    };

    $.each(gCategories, function(i, v) { 
        var _name = v.name;
        var _field = _name.replace(/ /g,"_");
        var _color = setCategoryColor(_name);
            _color = (_color) ? _color : chart.colors.getIndex(i);
        
        _createSeries(_field, _name, _color);
    });
    
    // var _list = getFirstAndLastItem(gOEMs , "name");
    // var _oemFirst = _list.first;
    // var _oemLast = _list.last;
    // var _harnessList = getFirstAndLastItem(gHarness , "name");
    
    // $.each(gModelYears, function(i, v) { 
    //     var _my = v.name;
        
    //     $.each(_selectedCategory, function(i, r) { 
    //         var _reg = r.name;
    //         var _first = _specName.first + "("+ _my +"-"+ _reg +")";
    //         var _last = _specName.last + "("+ _my +"-"+ _reg +")";
            
    //         _createLabel(_first, _last, _my, 10);
    //     });
    // });
    
    // $.each(_selectedCategory, function(i, r) { 
    //     var _reg = r.name;
    //     var _first = _specName.first + "("+ _myFirst +"-"+ _reg +")";
    //     var _last = _specName.last + "("+ _myLast +"-"+ _reg +")";
        
    //     _createLabel(_first, _last, _reg, 20);
    // }); 
    

    //Add cursor
    chart.scrollbarX = new am4core.Scrollbar();

    chart.cursor = new am4charts.XYCursor();
    chart.cursor.behavior = "panX";
    chart.legend = new am4charts.Legend();
}

// Wires & Cables
// New Wire Tech Lesser Diameter 
function displayWireTechDiameter(container, callback){
    var lowerLimit = 0;
    var upperLimit = 0;
    var _wireTypes = gData.groupBy(["wire_type"]);
    var _newData = $.each(_wireTypes, function(i, v){
        var _length = v.items.length;
        
        $.each(v.items, function(x, y){
            if(lowerLimit < y.lower_dia) lowerLimit = y.lower_dia;
            
            if(upperLimit < y.upper_dia) upperLimit = y.upper_dia;
        });
        
        var _sum = v.items.reduce(function (accumulator, currentValue) {
            return accumulator + currentValue.avg_dia;
        }, 0);
        
        var _ll = v.items.reduce(function (accumulator, currentValue) {
            return accumulator + currentValue.lower_dia;
        }, 0);
        
        var _ul = v.items.reduce(function (accumulator, currentValue) {
            return accumulator + currentValue.upper_dia;
        }, 0);
        
        lowerLimit = (_ll / _length);
        upperLimit = (_ul / _length);
        v.avg_weight = (_sum / _length);
    
        return v;
    });
    
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
    valueAxis.max = upperLimit;
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
    series.name = "Avg. Diameter";
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
    range.label.text = "Upper Diameter";
    range.label.fill = range.grid.stroke;
    //range.label.align = "right";
    range.label.verticalCenter = "bottom";
    
    var range2 = valueAxis.axisRanges.create();
    range2.value = lowerLimit;
    range2.grid.stroke = am4core.color("#A96478");
    range2.grid.strokeWidth = 2;
    range2.grid.strokeOpacity = 1;
    range2.label.inside = true;
    range2.label.text = "Lower Diameter";
    range2.label.fill = range2.grid.stroke;
    //range2.label.align = "right";
    range2.label.verticalCenter = "bottom";
    
    // Add cursor
    chart.cursor = new am4charts.XYCursor();
    
    // Add legend
    //chart.legend = new am4charts.Legend();
}
// New Wire Tech Lesser Weight
function displayWireTechWeight(container, callback){
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
    
    // Add legend
    //chart.legend = new am4charts.Legend();
}

//********************************* END CHART ********************************//
function chunkArray(array, size){
    var _index = 0;
    var _arrLength = array.length;
    var _tmpArr = [];
    
    for (_index = 0; _index < _arrLength; _index += size) {
        var _chunk = array.slice(_index, _index+size);
        var _item = getFirstAndLastItem(_chunk, "name");
        var _name = "MY" + (_item.first!==_item.last ? _item.first + "-MY"+ _item.last : _item.first);
        var _items = [];
 
        $.each(_chunk, function(i, v){
            $.merge(_items, v.items);
        });

        _tmpArr.push({name: _name, items: _items});
    }

    return _tmpArr;
}
                            
function isDecimal(n){
    return $.isNumeric(n) && n.toString().indexOf(".")!=-1;
}
                      
