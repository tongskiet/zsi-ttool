var  svn                = zsi.setValIfNull
    ,bs                 = zsi.bs.ctrl
    ,bsButton           = zsi.bs.button
    ,proc_url           = base_url + "common/executeproc/"
    ,gCId               = zsi.getUrlParamValue("id")
    ,gCName             = zsi.getUrlParamValue("name")
    ,gMenu              = zsi.getUrlParamValue("menu")
    ,gCriteriaRows      = []
    ,gRegionNames       = []
    ,gModelYears        = []
    ,gOEMs              = []
    ,gVehicleTypes      = []
    ,gMYArr             = []
    ,gMYFrom            = ""
    ,gMYTo              = ""
    ,gData              = []
    ,gLegendData        = []
    ,gPrmChartType      = ""
    ,gPrmCategory       = ""
    ,gPrmSumUp          = ""
    ,gPrmGraphType      = ""
    ,gHasSub            = false
    ,gIsStacked         = false
    ,gLists             = []
    ,gWinWidth          = 0;
    
zsi.ready(function(){
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
    gLists = [];
    gHasSub = false;
    gIsStacked = false;
    gMYFrom = parseInt($("#my_from").val());
    gMYTo = parseInt($("#my_to").val());
    gPrmSumUp = parseInt($("#sum_by").val());
    gPrmCategory = $("#category").val();
    gPrmGraphType = $("#graph_type").val();
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

        var _objKey = getDistinctKey(gData);
        var _region = _objKey.region;
        var _modelYear = _objKey.model_year;
        var _oem = _objKey.oem;
        var _vehicle_type = _objKey.vehicle_type;
        gRegionNames = sortBy(gData.groupBy([_region]), "name");
        gModelYears = gData.groupBy([_modelYear], "name");
        gOEMs = sortBy(gData.groupBy([_oem]), "name");
        gVehicleTypes = sortBy(gData.groupBy([_vehicle_type]), "name");
         
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

        if(callback) callback();
    });
}

function getLegendData(callback){
    $.get(execURL + "dynamic_legend_color_sel "+ (gLists.length > 0 ? "@list='" + gLists.join(",") + "'": "@criteria_id=" + gCId) 
    , function(data){
        gLegendData = data.rows;
        console.log("gLegendData", gLegendData);
        if(callback) callback();
    });
}

function setChartSettings(){
    var _url = "";
    var _result = {};
    var _chart = {default:"", pie:"", column:"", line: ""};
    var _staticMY = new Date().getFullYear() - 2;
    var _param = ",@byMy='Y'";
    
    _chart.default = "displayComPieChart(container)";
    _chart.column = "displayComStackColumnChart(container)";
        
    if(gPrmCategory==="Region"){
        _param = ",@byRegion='Y'";
        _chart.default = "displayComOverallPieChart(container)";
        _chart.column = "displayComOverallColumnChart(container)";
    }else if(gPrmCategory==="Vehicle Type"){
        _param = ",@byVehicle_type='Y'";
    }else if(gPrmCategory==="OEM"){
        _param = ",@byOEM='Y'";
    }
   
    _url = "dynamic_summary_sel @table_view_name='dbo.wires_v',@criteria_id="+ gCId +",@model_year_fr="+ gMYFrom +",@model_year_to="+ gMYTo + _param;
    
    if(isContain(gMenu, "VEHICLE ARCHITECTURE") || isContain(gMenu, "GROUNDING DISTRIBUTION")){
        _url = "dynamic_summary_sel @criteria_id="+ gCId +",@model_year_fr="+ gMYFrom +",@model_year_to="+ gMYTo + _param;
    }
    else if(isContain(gMenu, "WIRES & CABLES")){
        if(isContain(gCName, "Overall wire usage lower than 0.5 CSA")){
            gIsStacked = true;
            _chart.default = "displayComOverallPieChart(container)";
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
        getLegendData(function(){
            getData(_res.url, function(){
                $("#chart_div").empty().width("auto");
                
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
    }
}

//******************************* CHART FUNCTION *****************************//
function setLegend(charts){
    var _legend = [];
    var _chart = [];

    if(isUD(charts.className)){
        $.each(charts, function(i, v){
            var _cData = v.data;
            if(_cData.length > 0 && _cData.length > _legend.length){
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
    
    var _$legend = $("#legend_div");
    var _resizeLegend = function(ev) {
        var _contHeight = _chart.legend.contentHeight;

        if(_$legend.height() !== _contHeight){
            console.log("_resizeLegend");
            _$legend.height(_contHeight);
            $("#chart_div").css("margin-bottom", (_contHeight > 120 ? 120 : _contHeight));
            $(".legend-wrapper").css("bottom", (charts.length > 3 ? 16: 0));

            setTimeout(function() {
                _legendContainer();
            }, 300);
         }
    }; 
    _legendContainer();
    _chart.events.on("datavalidated", _resizeLegend);
    //_chart.events.on("maxsizechanged", _resizeLegend);
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
            var _group = sortBy(data.groupBy([_region]), "name");
            
            $.each(category, function(i, v){
                var _cat = v.name;
                var _catNew = _cat.replace(/ /g,"_");
                var _count = [];

                if(gLegendData.length > 0){
                    var _res = gLegendData.filter(function (item) {
                    	return (item.alias == _cat);
                    });
                    if(_res.length > 0) _catNew = _res[0].legend_label.replace(/ /g,"_");
                }

                if(gPrmCategory==="Region"){
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
                    _catNew = _catNew.replace(/_/g," ");
                    
                    if(gLegendData.length > 0){
                        var _res2 = gLegendData.filter(function (item) {
                        	return item.alias == _cat && item.grayed_out !== "Y";
                        });
                        if(_res2.length > 0) _trends += _catNew + '<br>';
                    }else{
                        _trends += _catNew + '<br>';
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
        if(gPrmGraphType=="pie"){
            
        }
        else{
            if(gPrmCategory==="Region"){
                var _key = getDistinctKey(gData);
                var _model_year = _key.model_year;
                var _region = _key.region;
                var _sCat = _model_year;
                var _sCatObj = gModelYears
                if(gPrmCategory==="Region"){
                    _sCat = _region;
                    _sCatObj = gRegionNames;
                }
                
                var _arr = [];
                $.each(category, function(i, v){
                    var _catgry = v.name.replace(/ /g,"_");
                    
                    if(gLegendData.length > 0){
                        var _res = gLegendData.filter(function (item) {
                        	return item.alias == _catgry && item.grayed_out !== "Y";
                        });
                        if(_res.length > 0){
                            _arr.push(v)
                        }
                    }else{
                        _arr.push(v)
                    }
                });
                
                $.each(_sCatObj, function(i, v){
                    var _cArr = [];
                    var _cName = v.name;
                    
                    $.each(_arr, function(i, vv){
                        var _res = vv.items.filter(function (item) {
                    	    return item[_sCat] == v.name;
                        });
                        
                        if(_res.length <= 1){ 
                            _cArr.push(vv.name);
                        }
                    });
                    _html += _cName +" - " + _cArr.join() + '<br>';
                });
            }
        }
        $("div#opportunities").html(_html);
    }
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
    var _model_year = "";
    var _region = "";
    var _oem = "";
    var _vehicle_type = "";

    if(data.length > 0){
        $.each(Object.keys(data[0]), function(i, key){
            var _key = key.toUpperCase();
            
            
            if(isContain(_key, "REGION") || isContain(_key, "MARKET")){
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
            else if((isContain(_key, "LOCATION") || _key === "SL") && !isContain(_key, "COUNT_LOCATION")){
                _location = key;
            }
            else if(isContain(_key, "COUNT") || isContain(_key, "SUM")){
                _value = key;
            }
            else{
                _category = key;
            }
        });
    }
    _keys.value = _value;
    _keys.category = _category;
    _keys.location = _location;
    _keys.model_year = _model_year;
    _keys.region = _region;
    _keys.oem = _oem;
    _keys.vehicle_type = _vehicle_type;
    
    return _keys; 
}

function isContain(string, contains){
    var _res = false;
    if (string.search(contains) > -1){
        _res = true;
    }
    return _res;
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
    var _vehicleType = _key.vehicle_type;
    var _location = _key.location;
    var _categoryObj = sortBy(gData.groupBy([_category]), "name");
    var _locationObj = sortBy(gData.groupBy([_location]), "name");
    var _selectedKey = _modelYear; //Default key selected
    var _selectedCategory = gModelYears; //Default category selected
    var _hasLocation = (_location ? true : false);
        _category = (_location ? _location: _category);
        _categoryObj = (_location ? _locationObj: _categoryObj);

    if(gPrmCategory==="Model Year"){
        gHasSub = true;
        _selectedKey = _modelYear;
        _selectedCategory = gModelYears;
    }else if(gPrmCategory==="Region"){
        gHasSub = true;
        _selectedKey = _region;
        _selectedCategory = gRegionNames;
    }else if(gPrmCategory==="Vehicle Type"){
        _selectedKey = _vehicleType;
        _selectedCategory = gVehicleTypes;
    }else if(gPrmCategory==="OEM"){
        _selectedKey = _oem;
        _selectedCategory = gOEMs;
    }

    $.each(_selectedCategory, function(x, v) { 
        var _group = v.name;
        var _items = v.items;
        
        $.each(_categoryObj, function(y, w) { 
            var _count = 0;
            var _cName = (isDecimal(w.name) ? parseFloat(w.name).toFixed(2) : w.name);
            var _json = { group: _group };
            var _res = _items.filter(function (item) {
            	return item[_category] == _cName;
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
            
            _json.category = _cName;
            _json.value = _count;
            
            if(gLegendData.length > 0){
                var _result = gLegendData.filter(function (item) {
                	return item["alias"] == _cName;
                });
                if(_result.length > 0){
                    _json.category = _result[0].legend_label;
                  
                    if(_result[0].grayed_out==="Y"){
                        _json.color = "gray";
                    }else{
                        if(_result[0].color_code!==""){
                            _json.color = _result[0].color_code.toLowerCase();
                        }
                    }
                }
            }

            _data.push(_json);
        });
    });
    callback({data: _data.sort(), selectedKey: _selectedKey, selectedCategory: _selectedCategory});
}

function setOverallPieChartData(callback){
    var _data = [];
    var _key = getDistinctKey(gData);
    var _value = _key.value;
    var _category = _key.category;
    var _region = _key.region;
    var _modelYear = _key.model_year;
    var _oem = _key.oem;
    var _vehicleType = _key.vehicle_type;
    var _location = _key.location;
    var _categoryObj = sortBy(gData.groupBy([_category]), "name");
    var _locationObj = sortBy(gData.groupBy([_location]), "name");
    var _selectedKey = _modelYear; //Default key selected
    var _selectedCategory = gModelYears; //Default category selected
        _category = (_location ? _location: _category);
        _categoryObj = (_location ? _locationObj: _categoryObj);

    if(gPrmCategory==="Region"){
        gHasSub = true;
        _selectedKey = _region;
        _selectedCategory = gRegionNames;
    }else if(gPrmCategory==="Vehicle Type"){
        _selectedKey = _vehicleType;
        _selectedCategory = gVehicleTypes;
    }else if(gPrmCategory==="OEM"){
        _selectedKey = _oem;
        _selectedCategory = gOEMs;
    }

    if(gPrmCategory==="Region"){
        
        // TRIED BUT DID NOT WORK
        // $.each(_selectedCategory, function(i, v) { 
        //     var _group = v.name;
        //     var _items = v.items;
            
        //     $.each(_categoryObj, function(i, cat) {
        //         var _cName = (isDecimal(cat.name) ? parseFloat(cat.name).toFixed(2) : cat.name);
            
        //         $.each(gModelYears, function(i, my) { 
        //             var _count = 0;
        //             var _my = my.name;
        //             var _json = { group: _group };
        //             var _res = _items.filter(function (item) {
        //             	return item[_category] == _cName && "MY"+ item[_modelYear] == _my;
        //             });
                    
        //             if(_value && _value !== ""){
        //                 _count = _res.reduce(function (accumulator, currentValue) {
        //                     return accumulator + currentValue[_value];
        //                 }, 0);    
        //             }else{
        //                 for(; _count < _res.length; ){
        //                     _count++;
        //                 }
        //             }
                    
        //             var _sub = [];
        //             var _colorSet = new am4core.ColorSet();
        //             if(gHasSub){
        //                 gLists = _res.map(function(item) {
        //                     return item['wire_gauge'];
        //                 });
                        
        //                 getLegendData(function(){
        //                     $.each(_res.groupBy(['wire_gauge']), function(y, wire){
        //                         var _subJson = {};
        //                         var _wire = (isDecimal(wire.name) ? parseFloat(wire.name).toFixed(2) : wire.name);
        //                         var _sumWire = wire.items.reduce(function (accumulator, currentValue) {
        //                             return accumulator + currentValue[_value];
        //                         }, 0);
        
        //                         _subJson.category = _wire;
        //                         _subJson.value = _sumWire;
        //                         _subJson.color = _colorSet.next();
                                
        //                         if(gLegendData.length > 0){
        //                             var _result = gLegendData.filter(function (item) {
        //                             	return item["alias"] == _wire;
        //                             });
                                    
        //                             if(_result.length > 0){
        //                                 _subJson.category = _result[0].legend_label;
                                        
        //                                 if(_result[0].grayed_out==="Y"){
        //                                     _subJson.color = "gray";
        //                                 }else{
        //                                     if(_result[0].color_code!==""){
        //                                         _subJson.color = _result[0].color_code.toLowerCase();
        //                                     }
        //                                 }
        //                             }
        //                         }
        //                         _sub.push(_subJson);
        //                     });
        //                 }); 
        //             }
                    
        //             _json.category = _cName;
        //             _json.value = _count;
        //             _json.subs = sortBy(_sub, "category");
                    
        //             if(gLegendData.length > 0){
        //                 var _result = gLegendData.filter(function (item) {
        //                 	return item["alias"] == _cName;
        //                 });

        //                 if(_result.length > 0){
        //                     _json.category = _result[0].legend_label;
                            
        //                     if(_result[0].grayed_out==="Y"){
        //                         _json.color = "gray";
        //                     }else{
        //                         if(_result[0].color_code!==""){
        //                             _json.color = _result[0].color_code.toLowerCase();
        //                         }
        //                     }
        //                 }
        //             }
        //             _data.push(_json);
        //         });
        //     });
        // });
            
        //----------------------------------------------------------------------
        console.log();
        $.each(gRegionNames, function(x, r) { 
            var _regionName = r.name;
            var _items = r.items;
            $.each(gModelYears, function(x, v) { 
                var _my = v.name
                $.each(_categoryObj, function(y, w) { 
                    var _count = 0;
                    var _cName = (isDecimal(w.name) ? parseFloat(w.name).toFixed(2) : w.name);
                    var _json = { group: _my };
                    var _res = _items.filter(function (item) {
                        
                    	return item[_category] == _cName && "MY"+item[_modelYear] == _my; 
                    });
        console.log("_res",_res);
                    if(_value && _value !== ""){
                         _count = _res.reduce(function (accumulator, currentValue) {
                            return accumulator + currentValue[_value];
                        }, 0);    
                    }else{
                        for(; _count < _res.length; ){
                            _count++;
                        }
                    }  
                    
                    _json.region = _regionName;
                    _json.category = _cName;
                    _json.value = _count;
                    
                    if(gLegendData.length > 0){
                        var _result = gLegendData.filter(function (item) {
                        	return item["alias"] == _cName;
                        });
                        if(_result.length > 0){
                            _json.category = _result[0].legend_label;
                          
                            if(_result[0].grayed_out==="Y"){
                                _json.color = "gray";
                            }else{
                                if(_result[0].color_code!==""){
                                    _json.color = _result[0].color_code.toLowerCase();
                                }
                            }
                        }
                    }
                    _data.push(_json);
                });
            });
        });
        
        //----------------------------------------------------------------------
        // $.each(gRegionNames, function(x, r) { 
        //     var _group = r.name;
        //     var _items = r.items;
            
        //     $.each(gModelYears, function(i, my) { 
        //         var _count = 0;
        //         var _cName = my.name;
        //         var _json = { group: _group };
        //         var _res = _items.filter(function (item) {
        //         	return isContain(_cName, item[_modelYear]);
        //         });

        //         if(_value && _value !== ""){
        //             _count = _res.reduce(function (accumulator, currentValue) {
        //                 return accumulator + currentValue[_value];
        //             }, 0);    
        //         }else{
        //             for(; _count < _res.length; ){
        //                 _count++;
        //             }
        //         }  

        //         var _list = [];
        //         var _sub = [];
        //         var _colorSet = new am4core.ColorSet();
                
        //         if(gHasSub){
        //             $.each(_categoryObj, function(i, v){
        //                 var _subJson = {};
        //                 var _subName = (isDecimal(v.name) ? parseFloat(v.name).toFixed(2) : v.name);
        //                 var _res2 = _items.filter(function (item) {
        //                 	return isContain(_cName, item[_modelYear]) &&  item[_category] == _subName;
        //                 });
                       
        //                 var _sum = _res2.reduce(function (accumulator, currentValue) {
        //                     return accumulator + currentValue[_value];
        //                 }, 0);
                        
        //                 _subJson.category = _subName;
        //                 _subJson.value = _sum;
                        
        //                 if(gLegendData.length > 0){
        //                     var _result = gLegendData.filter(function (item) {
        //                     	return item["alias"] == _subName;
        //                     });
        //                     if(_result.length > 0){
        //                         _subJson.category = _result[0].legend_label;
                              
        //                         if(_result[0].grayed_out==="Y"){
        //                             _subJson.color = "gray";
        //                         }else{
        //                             if(_result[0].color_code!==""){
        //                                 _subJson.color = _result[0].color_code.toLowerCase();
        //                             }
        //                         }
        //                     }
        //                 }
        //                 _sub.push(_subJson);
        //             });
        //         }
        //         _json.category = _cName;
        //         _json.value = _count;
        //         _json.subs = sortBy(_sub, "category");
    
        //         _data.push(_json);
        //     });
        // });
    }
    else{
        $.each(_selectedCategory, function(x, v) { 
            var _group = v.name;
            var _items = v.items;
           
            $.each(_categoryObj, function(y, w) { 
                var _count = 0;
                var _cName = (isDecimal(w.name) ? parseFloat(w.name).toFixed(2) : w.name);
                var _json = { group: _group };
                var _res = _items.filter(function (item) {
                	return item[_category] == _cName;
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
                        
                var _sub = [];
                var _colorSet = new am4core.ColorSet();
                
                if(gHasSub){
                    gLists = _res.map(function(item) {
                        return item['wire_gauge'];
                    });
                    
                    getLegendData(function(){
                        $.each(_res.groupBy(['wire_gauge']), function(y, wire){
                            var _subJson = {};
                            var _wire = (isDecimal(wire.name) ? parseFloat(wire.name).toFixed(2) : wire.name);
                            var _sumWire = wire.items.reduce(function (accumulator, currentValue) {
                                return accumulator + currentValue[_value];
                            }, 0);
    
                            _subJson.category = _wire;
                            _subJson.value = _sumWire;
                            _subJson.color = _colorSet.next();
                            
                            if(gLegendData.length > 0){
                                var _result = gLegendData.filter(function (item) {
                                	return item["alias"] == _wire;
                                });
                                
                                if(_result.length > 0){
                                    _subJson.category = _result[0].legend_label;
                                    
                                    if(_result[0].grayed_out==="Y"){
                                        _subJson.color = "gray";
                                    }else{
                                        if(_result[0].color_code!==""){
                                            _subJson.color = _result[0].color_code.toLowerCase();
                                        }
                                    }
                                }
                            }
                            _sub.push(_subJson);
                        });
                    }); 
                }
                _json.category = _cName;
                _json.value = _count;
                _json.subs = sortBy(_sub, "category");
               
                if(gLegendData.length > 0){
                    var _result = gLegendData.filter(function (item) {
                    	return item["alias"] == _cName;
                    });
        
                    if(_result.length > 0){
                        _json.category = _result[0].legend_label;
                        
                        if(_result[0].grayed_out==="Y"){
                            _json.color = "gray";
                        }else{
                            if(_result[0].color_code!==""){
                                _json.color = _result[0].color_code.toLowerCase();
                            }
                        }
                    }
                }
                _data.push(_json);
            });
        });
    }

    callback({data: _data, selectedKey: _selectedKey, selectedCategory: _selectedCategory});
}

function setColumnChartData(callback){
    var _data = [];
    var _key = getDistinctKey(gData);
    var _value = _key.value;
    var _category = _key.category;
    var _region = _key.region;
    var _modelYear = _key.model_year;
    var _oem = _key.oem;
    var _vehicleType = _key.vehicle_type;
    var _location = _key.location;
    var _categoryObj = sortBy(gData.groupBy([_category]), "name");
    var _locationObj = sortBy(gData.groupBy([_location]), "name");
    var _selectedKey = _modelYear; //Default key selected
    var _selectedCategory = gModelYears; //Default category selected
        _category = (_location ? _location: _category);
        _categoryObj = (_location ? _locationObj: _categoryObj);

    if(gPrmCategory==="Region"){
        _selectedKey = _region;
        _selectedCategory = gRegionNames;
    }else if(gPrmCategory==="Vehicle Type"){
        _selectedKey = _vehicleType;
        _selectedCategory = gVehicleTypes;
    }else if(gPrmCategory==="OEM"){
        _selectedKey = _oem;
        _selectedCategory = gOEMs;
    }

    $.each(_selectedCategory, function(i, v) { 
        var _name = v.name;
        var _obj = {};
            _obj.category = _name;
        
        $.each(_categoryObj, function(y, w) { 
            var _count = 0;
            var _cName = (isDecimal(w.name) ? parseFloat(w.name).toFixed(2) : w.name);
            var _res = v.items.filter(function (item) {
            	return item[_category] == _cName;
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
            
            var _cNameNew = _cName.replace(/ /g,"_");
            if(gLegendData.length > 0){
                var _result = gLegendData.filter(function (item) {
                	return item["alias"].toUpperCase() == _cName.toUpperCase();
                });
                if(_result.length > 0){
                    _cNameNew = _result[0].legend_label.replace(/ /g,"_");
                  
                    // if(_result[0].grayed_out==="Y"){
                    //     _obj.color = am4core.color("gray");
                    // }else{
                    //     if(_result[0].color_code!==""){
                    //         _obj.color = am4core.color(_result[0].color_code.toLowerCase());
                    //     }
                    // }
                    //_obj.color = (_result[0].color_code !=="" ? _result[0].color_code.toLowerCase() : "gray");
                    //w.name = _cNameNew;
                }
            }
            _obj[_cNameNew] = _count;
        });
        _data.push(_obj);
    });
    callback({data: _data, selectedKey: _selectedKey, categoryObj: _categoryObj});
}

function setOverallColumnChartData(callback){
    var _data = [];
    var _key = getDistinctKey(gData);
    var _value = _key.value;
    var _category = _key.category;
    var _region = _key.region;
    var _modelYear = _key.model_year;
    var _oem = _key.oem;
    var _vehicleType = _key.vehicle_type;
    var _location = _key.location;
    var _categoryObj = sortBy(gData.groupBy([_category]), "name");
    var _locationObj = sortBy(gData.groupBy([_location]), "name");
    var _selectedKey = _modelYear; //Default key selected
    var _selectedCategory = gModelYears; //Default category selected
    var _hasLocation = (_location ? true: false);
    
    if(gPrmCategory==="Region"){
        _selectedKey = _region;
        _selectedCategory = gRegionNames;
    }else if(gPrmCategory==="Vehicle Type"){
        _selectedKey = _vehicleType;
        _selectedCategory = gVehicleTypes;
    }else if(gPrmCategory==="OEM"){
        _selectedKey = _oem;
        _selectedCategory = gOEMs;
    }

console.log("_hasLocation",_hasLocation)
    if(_hasLocation){
        $.each(gRegionNames, function(i, r) { 
            $.each(gModelYears, function(x, my) {
                var _regionName = r.name;
                var _my = my.name;
                var _result = r.items.filter(function (item) {
                	return isContain(_my, item[_modelYear]);
                });
     
                $.each(_locationObj, function(y, l) {
                    var _specLocation = l.name;
                    var _json = {
                        REGION_NAME : _regionName,
                        MODEL_YEAR : _my,
                        category : _specLocation +"("+ _my +"-"+ _regionName +")"
                    };
                    
                    $.each(_categoryObj, function(z, s) {
                        var _count = 0;
                        var _name = (isDecimal(s.name) ? parseFloat(s.name).toFixed(2) : s.name);
                        var _nameNew = _name.replace(/ /g,"_");
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
                        
                        if(gLegendData.length > 0){
                            var _result3 = gLegendData.filter(function (item) {
                            	return item["alias"].toUpperCase() == _cName.toUpperCase();
                            });
                            if(_result3.length > 0){
                                _nameNew = _result3[0].legend_label.replace(/ /g,"_");
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
                var _regionName = r.name;
                var _obj = {};
                _obj.year = _my;
                _obj.region = _regionName;
                _obj.category = _my +"("+ _regionName +")";
                
                $.each(_categoryObj, function(y, w) { 
                    var _count = 0;
                    var _cName = (isDecimal(w.name) ? parseFloat(w.name).toFixed(2) : w.name);
                    var _cNameNew = _cName.replace(/ /g,"_");
                    var _res = r.items.filter(function (item) {
                    	return item[_category] == _cName && isContain(_my, item[_modelYear]);
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
                    
                    if(gLegendData.length > 0){
                        var _result = gLegendData.filter(function (item) {
                        	return item["alias"].toUpperCase() == _cName.toUpperCase();
                        });
                        if(_result.length > 0){
                            _cNameNew = _result[0].legend_label.replace(/ /g,"_");
                        }
                    }
    
                    _obj[_cNameNew] = _count;
                });
                _data.push(_obj);
            });
        });
    }
    callback({data: _data, selectedKey: _selectedKey, categoryObj: _categoryObj, locationObj: _locationObj,hasLocation: _hasLocation});
}

//------------------------------- COMMON CHARTS ------------------------------//
// PIE CHART
function displayComPieChart(container){
    setPieChartData(function(o){
        var _data = o.data;
        var _key = o.selectedKey;
        var _category = o.selectedCategory;
    
    console.log("_data",_data);
        
        var _charts = [];
        var _createChart = function(data, name, isLegend, div){
            //var chart = _container.createChild(am4charts.PieChart);
            var chart = am4core.create(div, am4charts.PieChart);
            chart.paddingTop= 15;
            chart.paddingBottom = 15;
            
            if(data.length > 0){
                chart.data = data;
            }else{
                /* Dummy innitial data data */
                chart.data = [{
                  "country": "Dummy",
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
            
            // Add and configure Series
            var pieSeries = chart.series.push(new am4charts.PieSeries());
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
            slice.stroke = am4core.color("#dadada");
            slice.strokeWidth = 0.1;
            slice.strokeOpacity = 0.1;
            
            pieSeries.labels.template.propertyFields.disabled = "disabled";
            pieSeries.ticks.template.propertyFields.disabled = "disabled";
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
            
            //One pulled slice
            pieSeries.slices.template.events.on("hit", function(ev) {
                var series = ev.target.dataItem.component;
                series.slices.each(function(item) {
                    if (item.isActive && item != ev.target) {
                        item.isActive = false;
                    }
                });
            });
            
            _charts.push(chart);
        };

        var _chartWidth = gWinWidth / 4;
        var _conWidth = 0;
        var _container = "#"+ container;
        var _tw = new zsi.easyJsTemplateWriter(_container);
        $.each(_category, function(i, v){
            var _charId = "chart_"+ i;
            _conWidth += _chartWidth;
            _tw.div({ class: "", id: _charId, style: "width:" + _chartWidth + "px" });
            
            var _groupName = v.name;
            var _result = (v.items.length === 0 ? [] : _data.filter(function (item) {
            	return item.group == _groupName;
            }));
            
            if($.isNumeric(_groupName)) _groupName = "MY"+ _groupName;

            _createChart(sortBy(_result, "category"), _groupName, (i === 0 ? true : false), _charId);
        });
        $(_container).width(_conWidth - 10);
        
        setLegend(_charts);
        setTrends(_data, _category);
    });
}

function displayComOverallPieChart(container){
    gHasSub = true;
    setOverallPieChartData(function(o){
        var _data = o.data;
        var _key = o.selectedKey;
        var _category = o.selectedCategory;
    
    console.log("_data", _data);    
        var _charts = [];
        var _createChart = function(data, name, isLegend, div){
            var chart = am4core.create(div, am4charts.PieChart);
            //var chart = _container.createChild(am4charts.PieChart);
            chart.paddingTop= 15;
            chart.paddingBottom = 15;
            
            var selected;
            var generateChartData = function() {
                setLegend(chart);
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
            var pieSeries = chart.series.push(new am4charts.PieSeries());
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
            slice.strokeWidth = 0.1;
            slice.strokeOpacity = 0.1;
            
            pieSeries.labels.template.propertyFields.disabled = "disabled";
            pieSeries.ticks.template.propertyFields.disabled = "disabled";
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
            
            pieSeries.slices.template.events.on("hit", function(event) {
                if(event.target.dataItem.dataContext.category!=="Dummy"){
                    //if(gPrmCategory==="Region"){
                    console.log(event.target.dataItem.dataContext.id);
                        if (event.target.dataItem.dataContext.id !== undefined ) {
                            selected = event.target.dataItem.dataContext.id;
                        } else {
                            selected = undefined;
                        }
                        chart.data = generateChartData();
                    // }else{
                    //     if(event.target.dataItem.dataContext.id !== 0){
                    //         if (event.target.dataItem.dataContext.id !== undefined ) {
                    //             selected = event.target.dataItem.dataContext.id;
                    //         } else {
                    //             selected = undefined;
                    //         }
                    //         chart.data = generateChartData();
                    //     }
                    // }
                }
            });
            
            _charts.push(chart)
        };

        var _winWidth = $(window).width();
        var _chartWidth = _winWidth / 4;
        var _conWidth = 0;
        var _container = "#"+ container;
        var _tw = new zsi.easyJsTemplateWriter(_container);
        
        $.each(gRegionNames, function(i, v){
            var _region = v.name;
            
            
            $.each(gModelYears, function(i, my){
                var _charId = "chart_"+ i + "_" + _region.replace(/ /g,"_");
                _conWidth += _chartWidth;
                _tw.div({ class: "", id: _charId, style: "width:" + _chartWidth + "px" });
                var _my = my.name;
                var _result = (v.items.length === 0 ? [] : _data.filter(function (item) {
                	return item.region == _region && item.group == _my;
                }));
              
                if($.isNumeric(_my)) _my = "MY"+ _my;
    console.log("_result", _result)
                _createChart(sortBy(_result, "category"), _my, (i === 0 ? true : false), _charId);
            });
        });
        $(_container).width(_conWidth - 10);
        
        setLegend(_charts);
        setTrends(_data, gModelYears);
    });
}

// COLUMN CHART
function displayComStackColumnChart(container){
    setColumnChartData(function(o){
        var _data = o.data;
        var _key = o.selectedKey;
        var _category = o.categoryObj;
    
    console.log("_data",_data);
    
        var chart = am4core.create(container, am4charts.XYChart);
        chart.data = _data;
        chart.colors.step = 2;
        chart.padding(15, 15, 10, 15);
        chart.maskBullets = false;
        
        // Create axes
        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "category";
        categoryAxis.renderer.minGridDistance = 60;
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.interactionsEnabled = false;
        categoryAxis.numberFormatter.numberFormat = "#";
        //categoryAxis.fontSize = 12;
        categoryAxis.renderer.labels.template.adapter.add("textOutput", function(text) {
            return (typeof(text)!=="undefined" ? ($.isNumeric(text) ? "MY"+ text: text) : text);
        });
        
        if(gPrmCategory==="Vehicle Type" || gPrmCategory==="OEM"){
            // categoryAxis.renderer.labels.template.rotation = 90;
            // categoryAxis.renderer.labels.template.verticalCenter = "middle";
            // categoryAxis.renderer.labels.template.horizontalCenter = "left";
            categoryAxis.renderer.labels.template.adapter.add("dy", function(dy, target) {
              if (target.dataItem && target.dataItem.index & 2 == 2) {
                return dy + 20;
              }
              return dy;
            });
        }
        
        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.min = 0;
        valueAxis.max = 100;
        valueAxis.strictMinMax = true;
        valueAxis.calculateTotals = true;
        
        valueAxis.renderer.minGridDistance = 20;
        valueAxis.renderer.minWidth = 35;
        valueAxis.renderer.labels.template.adapter.add("text", function(text) {
          return text + "%";
        });
        
        // Create series
        var _createSeries = function(field, name, color) {
            var series = chart.series.push(new am4charts.ColumnSeries());
            series.columns.template.tooltipText = "{name}: {valueY.totalPercent.formatNumber('#.00')}% - {valueY.formatNumber('#,###')}";
            series.columns.template.column.strokeOpacity = 0;
            series.name = name;
            series.dataFields.categoryX = "category";
            series.dataFields.valueY = field;
            series.dataFields.valueYShow = "totalPercent";
            series.dataItems.template.locations.categoryX = 0.5;
            series.stacked = gIsStacked;
            series.tooltip.pointerOrientation = "vertical";
            
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

        $.each(_category, function(i, v) { 
            var _name = (isDecimal(v.name) ? parseFloat(v.name).toFixed(2) : v.name);
            var _nameNew = _name.replace(/ /g,"_");
            var _color = "";
            
            if(gLegendData.length > 0){
                var _res = gLegendData.filter(function (item) {
                	return item["alias"].toUpperCase() == _name.toUpperCase();
                });
                if(_res.length > 0){
                    _name = _res[0].legend_label;
                    _nameNew = _name.replace(/ /g,"_");
                    
                    if(_res[0].grayed_out==="Y"){
                        _color = "gray";
                    }else{
                        if(_res[0].color_code!==""){
                             _color = _res[0].color_code.toLowerCase();
                        }
                    } 
                }
            }
            _createSeries(_nameNew, _name, _color);
        });
        
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
        var _hasLocation = o.hasLocation;
        
    console.log("_data", _data);

        var chart = am4core.create(container, am4charts.XYChart);
        chart.data = _data;
        chart.colors.step = 2;
        chart.padding(15, 15, 10, 15);
        chart.maskBullets = false;
        
    console.log("_hasLocation", _hasLocation);
    
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
            var _createSeries = function(field, name, color) {
                var series = chart.series.push(new am4charts.ColumnSeries());
                series.columns.template.width = am4core.percent(80);
                series.columns.template.tooltipText = "[bold]{name}:[/] {valueY.formatNumber('#,###')} - [bold]{valueY.formatNumber('#,###')}[/]";
                series.columns.template.column.strokeOpacity = 0;
                series.name = name;
                series.dataFields.categoryX = "category";
                series.dataFields.valueY = field;
                series.dataFields.valueYShow = "totalPercent";
                series.dataItems.template.locations.categoryX = 0.5;
                series.stacked = gIsStacked;
                series.tooltip.pointerOrientation = "vertical";
                
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
            var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            categoryAxis.dataFields.category = "category";
            categoryAxis.renderer.minGridDistance = 60;
            categoryAxis.renderer.grid.template.location = 0;
            categoryAxis.interactionsEnabled = false;
            categoryAxis.numberFormatter.numberFormat = "#";
            categoryAxis.renderer.labels.template.adapter.add("textOutput", function(text) {
                return (typeof(text)!=="undefined" ? text.replace(/\(.*/, "") : text);
            });
            
            var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.min = 0;
            valueAxis.max = 100;
            valueAxis.strictMinMax = true;
            valueAxis.calculateTotals = true;
            valueAxis.renderer.labels.template.adapter.add("text", function(text) {
              return text + "%";
            });
            
            // Create series
            var _createSeries = function(field, name, color) {
                var series = chart.series.push(new am4charts.ColumnSeries());
                series.columns.template.tooltipText = "{name}: {valueY.totalPercent.formatNumber('#.00')}% - {valueY.formatNumber('#,###')}";
                series.columns.template.column.strokeOpacity = 0;
                series.name = name;
                series.dataFields.categoryX = "category";
                series.dataFields.valueY = field;
                series.dataFields.valueYShow = "totalPercent";
                series.dataItems.template.locations.categoryX = 0.5;
                series.stacked = gIsStacked;
                series.tooltip.pointerOrientation = "vertical";
                
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
                // var columnTemplate = categoryAxis.columns.template;
                // columnTemplate.width = am4core.percent(80);
                // columnTemplate.propertyFields.fill = "color";
                
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
                range.label.dy = 18;
                range.label.fontWeight = "bold";
                range.axisFill.fill = am4core.color("#396478");
                range.axisFill.fillOpacity = 0.1;
                range.locations.category = 0.1;
                range.locations.endCategory = 0.9;
            };
        }
    
        $.each(_category, function(i, v) { 
            var _name = (isDecimal(v.name) ? parseFloat(v.name).toFixed(2) : v.name);
            var _field = _name.replace(/ /g,"_");
            var _color = "";

            if(gLegendData.length > 0){
                var _res = gLegendData.filter(function (item) {
                	return item["alias"].toUpperCase() == _field.toUpperCase();
                });
                if(_res.length > 0){
                    _name = _res[0].legend_label;
                    _field = _name.replace(/ /g,"_");
                    
                    if(_res[0].grayed_out==="Y"){
                        _color = "gray";
                    }else{
                        if(_res[0].color_code!==""){
                             _color = _res[0].color_code.toLowerCase();
                        }
                    } 
                }
            }
            _createSeries(_field, _name, _color);
        });
        
        var _my = getFirstAndLastItem(gModelYears , "name");
        var _myFirst = _my.first;
        var _myLast = _my.last;
        
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
                var _first = _specName.first + "("+ _myFirst +"-"+ _reg +")";
                var _last = _specName.last + "("+ _myLast +"-"+ _reg +")";
                
                _createLabel(_first, _last, _reg, 0.1, 20);
            }); 
        }
        else{
            $.each(gRegionNames, function(i, r) { 
                var _region = "("+ r.name +")";
                
                _createLabel(_myFirst + _region, _myLast + _region, r.name,  0.1, 10);
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
    return $.isNumeric(n) && n.indexOf(".")!=-1;
}
