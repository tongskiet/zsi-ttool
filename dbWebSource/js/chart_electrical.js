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
    ,gLists             = [];
    
zsi.ready(function(){
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
    gPrmSumUp = "year";
    gPrmCategory = "Model Year";
    gPrmGraphType = "pie";
    
    $("#my_from").val(gMYFrom);
    $("#my_to").val(gMYTo);
}

function filterGraphData(e){
    gHasSub = false;
    gIsStacked = false;
    gMYFrom = $("#my_from").val();
    gMYTo = $("#my_to").val();
    gPrmSumUp = $("#sum_by").val();
    gPrmCategory = $("#category").val();
    gPrmGraphType = $("#graph_type").val();

    displayChart();
}

function removeSpecialChar(string){
    var _newStr = $.trim(unescape(string).replace(/_/g,"&").replace(/[^\x20-\x7E]/g, "-").replace(/---/g,"-"));
    return _newStr;
}

function getData(url, callback){
    $.get(execURL + url
        , function(data){
            gData = data.rows;
            
            var _objKey = getDistinctKey(gData);
            var _region = _objKey.region;
            var _modelYear = _objKey.model_year;
            gRegionNames = sortBy(gData.groupBy([_region]), "name");
            gModelYears = sortBy(gData.groupBy([_modelYear]), "name");

            var i = 0;
            for (var _my = gMYFrom; _my <= gMYTo; _my++) {
                
                if(isUD(gModelYears[i])){
                    gModelYears.push({
                        name : _my.toString(),
                        items: []
                    });
                }
                i++;
            }
            callback();
    });
}

function getLegendData(callback){
    $.get(execURL + "dynamic_legend_color_sel "+ (gLists.length > 0 ? "@list='" + gLists.join(",") + "'": "@criteria_id=" + gCId) 
        , function(data){
            gLegendData = data.rows;
            
            callback();
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
        _chart.default = "displayComRegionPieChart(container)";
        _chart.column = "displayComRegionColumnChart(container)";
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
        //_url = "dynamic_summary_sel @table_view_name='dbo.wires_v',@criteria_id="+ gCId +",@model_year_fr="+ gMYFrom +",@model_year_to="+ gMYTo + _param;
        
        if(isContain(gCName, "Overall wire usage lower than 0.5 CSA")){
            _chart.default = "displayComOverallPieChart(container)";
            gIsStacked = true;
            //_chart.column = "displayComRegionColumnChart(container)";
        }
        // else if(isContain(gCName, "New Wire Sizes")){
        //     //_chart.default = "displayComPieChart(container)";
        //     // _chart.pie = "displayComPieChart(container)";
        //     //_chart.column = "displayComColumnChart(container)";
        // }
        // else if(isContain(gCName, "Smaller wire sizes in High Flexible areas")){
        //     //_chart.default = "displayComPieChart(container)";
        //     // _chart.pie = "displayComPieChart(container)";
        //     // _chart.column = "displayComColumnChart(container)";
        // }
        // else if(isContain(gCName, "Smaller wire sizes in Engine Compartment areas")){
        //   // _chart.default = "displayComPieChart(container)";
        //     // _chart.pie = "displayComPieChart(container)";
        //      //_chart.column = "displayComColumnChart(container)";
        // }
        // else if(isContain(gCName, "PVC wires in Engine Compartment")){
        //     //_chart.default = "displayComPieChart(container)";
        //     // _chart.pie = "displayComPieChart(container)";
        //     //_chart.column = "displayComColumnChart(container)";
        // }
        else if(isContain(gCName, "New Conductor Technology with lesser dimensions")){
            _url = "wire_tech_lower_upper_diameter @byMY="+ _staticMY +",@criteria_id="+ gCId;
            _chart.default = "displayWireTechDiameter(container)";
            _chart.column = "";
            // _chart.line = "displayWireTechDiameter(container)";
        }
        else if(isContain(gCName, "New Conductor Technology with lesser weight")){
            _url = "wire_tech_lower_upper_weight @model_year="+ _staticMY +",@criteria_id="+ gCId;
            _chart.default = "displayWireTechWeight(container)";
            _chart.column = "";
            // _chart.line = "displayWireTechWeight(container)";
        } 
        // else if(isContain(gCName, "2.5 wire gauge for cigar lighters and power outlet")){
        //     //_chart.default = "displayComPieChart(container)";
        //     // _chart.pie = "displayComPieChart(container)";
        //     //_chart.column = "displayComColumnChart(container)";
        // }
        // else if(isContain(gCName, "New Technology on wire Conductor")){
        //     //_chart.default = "displayComPieChart(container)";
        //     // _chart.pie = "displayComPieChart(container)";
        //     //_chart.column = "displayComColumnChart(container)";
        // }
    }
    else if(isContain(gMenu, "POWER DISTRIBUTION")){
        _url = "dynamic_summary_sel @table_view_name='dbo.power_distributions_v',@criteria_id="+ gCId +",@model_year_fr="+ gMYFrom +",@model_year_to="+ gMYTo + _param;
        //_chart.default = "displayComPieChart(container)";
        // _chart.pie = "displayComPieChart(container)";
        //_chart.column = "displayComColumnChart(container)";
    }
    else if(isContain(gMenu, "SAFETY CRITICAL CIRCUITS")){ 
        _url = "dynamic_cts_usage_summary @criteria_id="+ gCId +",@model_year_fr="+ gMYFrom +",@model_year_to="+ gMYTo + _param;
        //_chart.default = "displayComPieChart(container)";
        // _chart.pie = "displayPieNetworkTopology(container)";
        //_chart.column = "displayComColumnChart(container)";
    }
    else if(isContain(gMenu, "NETWORK TOPOLOGY")){ 
        _url = "dynamic_network_topology_sel @criteria_id="+ gCId + _param;
        //_chart.default = "displayComPieChart(container)";
        // _chart.pie = "displayPieNetworkTopology(container)";
        //_chart.column = "displayComColumnChart(container)";
    }

    _result.url = _url;
    _result.chart = _chart;
    return _result;
}

function displayChart(){
    var _res = setChartSettings();
    if( _res.url!=="" ){
        getData(_res.url, function(){
            getLegendData(function(){
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

function setLegendSize(chart){
    chart.legend = new am4charts.Legend();
    chart.legend.labels.template.fontSize = 10;
    chart.legend.valueLabels.template.fontSize = 10;
    // chart.legend.itemContainers.template.hoverable = false;
    // chart.legend.itemContainers.template.clickable = false;
    // chart.legend.itemContainers.template.focusable = false;
    // chart.legend.itemContainers.template.cursorOverStyle = am4core.MouseCursorStyle.default;

    var markerTemplate = chart.legend.markers.template;
    markerTemplate.width = 10;
    markerTemplate.height = 10;

    var legendContainer = am4core.create("legend_div", am4core.Container);
    legendContainer.width = am4core.percent(100);
    legendContainer.height = am4core.percent(100);
    chart.legend.parent = legendContainer;
        
    chart.events.on("datavalidated", resizeLegend);
    chart.events.on("maxsizechanged", resizeLegend);
    
    function resizeLegend(ev) {
      document.getElementById("legend_div").style.height = chart.legend.contentHeight + "px";
    }
        
    // chart.legend.itemContainers.template.events.on("hit", (ev) => {
    //   var category = ev.target.dataItem.name;
  
    //   //chart.data.forEach(item => item.pieData.find(i => i.category === category).hidden = !ev.target.isActive);
    // //   pieSeries.validateData();
    // });
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
    var _model_year = "";
    var _region = "";
    var _oem = "";
    var _vehicle_type = "";

    if(data.length > 0){
        $.each(Object.keys(data[0]), function(i, key){
            var _key = key.toUpperCase();
            if(isContain(_key, "REGION")){
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
            else if(isContain(_key, "LOCATION") || _key === "SL"){
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
        });
    }
    _keys.value = _value;
    _keys.category = _category;
    _keys.location = _location;
    _keys.specification = _specification;
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

// SET CHART DATA
function setPieChartData(callback){
    var _data = [];
    var _key = getDistinctKey(gData);
    var _value = _key.value;
    var _category = _key.category;
    var _region = _key.region;
    var _modelYear = _key.model_year;
    var _oem = _key.oem;
    var _vehicleType = _key.vehicle_type;
    var _categoryObj =  sortBy(gData.groupBy([_category]), "name");
       
    var _selectedKey = _modelYear; //Default key selected
    var _selectedCategory = gModelYears; //Default category selected

    if(gPrmCategory==="Region"){
        gHasSub = true;
        _selectedKey = _region;
        _selectedCategory = gRegionNames;
    }else if(gPrmCategory==="Vehicle Type"){
        _selectedKey = _vehicleType;
    }else if(gPrmCategory==="OEM"){
        _selectedKey = _oem;
    }
   
    $.each(_selectedCategory, function(x, v) { 
        var _group = v.name;
        var _items = v.items;
        
        $.each(_categoryObj, function(y, w) { 
            var _count = 0;
            var _cName = w.name;
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
            if(gHasSub){
                $.each(_res.groupBy(['wire_gauge']), function(y, wire){
                    var _sumWire = wire.items.reduce(function (accumulator, currentValue) {
                        return accumulator + currentValue[_value];
                    }, 0);
                    
                    _sub.push({
                        category: wire.name,
                        value: _sumWire,
                        color: ""
                    });
                });
            }
            _json.category = _cName;
            _json.value = _count;
            _json.subs = _sub;
            
            if(gLegendData.length > 0){
                var _result = gLegendData.filter(function (item) {
                	return item["alias"] == _cName;
                });
                if(_result.length > 0){
                    _json.category = _result[0].legend_label;
                    _json.color = (_result[0].color_code !=="" ? _result[0].color_code.toLowerCase() : "gray");
                }
            }

            _data.push(_json);
        });
    });
    callback({data: _data.sort(), selectedKey: _selectedKey, selectedCategory: _selectedCategory});
}

function setRegionPieChartData(callback){
    var _data = [];
    var _key = getDistinctKey(gData);
    var _value = _key.value;
    var _category = _key.category;
    var _region = _key.region;
    var _modelYear = _key.model_year;
    var _oem = _key.oem;
    var _vehicleType = _key.vehicle_type;
    var _categoryObj =  sortBy(gData.groupBy([_category]), "name");
       
    var _selectedKey = _modelYear; //Default key selected
    var _selectedCategory = gModelYears; //Default category selected

    if(gPrmCategory==="Region"){
        gHasSub = true;
        _selectedKey = _region;
        _selectedCategory = gRegionNames;
    }else if(gPrmCategory==="Vehicle Type"){
        _selectedKey = _vehicleType;
    }else if(gPrmCategory==="OEM"){
        _selectedKey = _oem;
    }

    $.each(gRegionNames, function(x, r) { 
        var _group = r.name;
        var _items = r.items;
        
        $.each(gModelYears, function(i, my) { 
            var _count = 0;
            var _cName = my.name;
            var _json = { group: _group };
            
            var _res = _items.filter(function (item) {
            	return item[_modelYear] == _cName;
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

            var _list = [];
            var _sub = [];
            var _colorSet = new am4core.ColorSet();
            if(gHasSub){
                $.each(_categoryObj, function(i, v){
                    var _subJson = {};
                    var _subName = v.name;
                    var _res2 = _items.filter(function (item) {
                    	return item[_modelYear] == _cName &&  item[_category] == _subName;
                    });
                   
                    var _sum = _res2.reduce(function (accumulator, currentValue) {
                        return accumulator + currentValue[_value];
                    }, 0);
                    
                    _subJson.category = _subName;
                    _subJson.value = _sum;
                    
                    if(gLegendData.length > 0){
                        var _result = gLegendData.filter(function (item) {
                        	return item["alias"] == _subName;
                        });
                        if(_result.length > 0){
                            _subJson.category = _result[0].legend_label;
                          
                            if(_result[0].grayed_out==="Y"){
                                _subJson.color = "gray";
                            }else{
                                if(_result[0].color_code!==""){
                                    _subJson.color = _result[0].color_code.toLowerCase();
                                }else{
                                    _subJson.color = _colorSet.next().alternative;
                                }
                            }
                        }
                    }
                    _sub.push(_subJson);
                });
            }
            _json.category = _cName;
            _json.value = _count;
            _json.subs = _sub;

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
    var _categoryObj =  sortBy(gData.groupBy([_category]), "name");
       
    var _selectedKey = _modelYear; //Default key selected
    var _selectedCategory = gModelYears; //Default category selected

    if(gPrmCategory==="Region"){
        gHasSub = true;
        _selectedKey = _region;
        _selectedCategory = gRegionNames;
    }else if(gPrmCategory==="Vehicle Type"){
        _selectedKey = _vehicleType;
    }else if(gPrmCategory==="OEM"){
        _selectedKey = _oem;
    }

    if(gPrmCategory==="Region"){
        console.log("Per Region")
        $.each(gRegionNames, function(x, r) { 
            var _group = r.name;
            var _items = r.items;
            
            $.each(gModelYears, function(i, my) { 
                var _count = 0;
                var _cName = my.name;
                var _json = { group: _group };
                
                var _res = _items.filter(function (item) {
                	return item[_modelYear] == _cName;
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

                var _list = [];
                var _sub = [];
                var _colorSet = new am4core.ColorSet();
                if(gHasSub){
                    gLists = _res.map(function(item) {
                        return item[_category];
                    });
                    
                    getLegendData(function(){
                        $.each(_categoryObj, function(i, v){
                            var _subJson = {};
                            var _subName = v.name;
                            var _res2 = _items.filter(function (item) {
                            	return item[_modelYear] == _cName &&  item[_category] == _subName;
                            });
                           
                            var _sum = _res2.reduce(function (accumulator, currentValue) {
                                return accumulator + currentValue[_value];
                            }, 0);
                            
                            _subJson.category = _subName;
                            _subJson.value = _sum;
                            
                            if(gLegendData.length > 0){
                                var _result = gLegendData.filter(function (item) {
                                	return item["alias"] == _subName;
                                });
                                if(_result.length > 0){
                                    _subJson.category = _result[0].legend_label;
                                  
                                    if(_result[0].grayed_out==="Y"){
                                        _subJson.color = "gray";
                                    }else{
                                        if(_result[0].color_code!==""){
                                            _subJson.color = _result[0].color_code.toLowerCase();
                                        }else{
                                            _subJson.color = _colorSet.next().alternative;
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
                _json.subs = _sub;
    
                _data.push(_json);
            });
        });
    }
    else{
        $.each(_selectedCategory, function(x, v) { 
            var _group = v.name;
            var _items = v.items;
            
            $.each(_categoryObj, function(y, w) { 
                var _count = 0;
                var _cName = w.name;
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
                            var _wire = wire.name;
                            var _sumWire = wire.items.reduce(function (accumulator, currentValue) {
                                return accumulator + currentValue[_value];
                            }, 0);
    
                            _subJson.category = _wire;
                            _subJson.value = _sumWire;
                            
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
                                        }else{
                                            _subJson.color = _colorSet.next().alternative;
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
                _json.subs = _sub;
                
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
    callback({data: _data.sort(), selectedKey: _selectedKey, selectedCategory: _selectedCategory});
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
    var _categoryObj = sortBy(gData.groupBy([_category]), "name");
    var _selectedKey = _modelYear; //Default key selected
    var _selectedCategory = gModelYears; //Default category selected

    if(gPrmCategory==="Region"){
        _selectedKey = _region;
        _selectedCategory = gRegionNames;
    }else if(gPrmCategory==="Vehicle Type"){
        _selectedKey = _vehicleType;
        _selectedCategory = gModelYears;
    }else if(gPrmCategory==="OEM"){
        _selectedKey = _oem;
        _selectedCategory = gModelYears;
    }

    $.each(_selectedCategory, function(i, v) { 
        var _name = v.name;
        var _obj = {};
            _obj.category = _name;
        
        $.each(_categoryObj, function(y, w) { 
            var _count = 0;
            var _cName = w.name;
            var _res = v.items.filter(function (item) {
            	return item[_category] == _cName && item[_selectedKey] == _name;
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
                    //_obj.color = (_result[0].color_code !=="" ? _result[0].color_code.toLowerCase() : "gray");
                    //w.name = _cNameNew;
                }
            }
            _obj[_cNameNew] = _count;
        });
        _data.push(_obj);
    });

    callback({data: _data.sort(), selectedKey: _selectedKey, categoryObj: _categoryObj});
}

function setStackedColumnChartData(callback){
    var _data = [];
    var _key = getDistinctKey(gData);
    var _value = _key.value;
    var _category = _key.category;
    var _region = _key.region;
    var _modelYear = _key.model_year;
    var _oem = _key.oem;
    var _vehicleType = _key.vehicle_type;
    var _categoryObj = sortBy(gData.groupBy([_category]), "name");
    var _selectedKey = _modelYear; //Default key selected
    var _selectedCategory = gModelYears; //Default category selected

    if(gPrmCategory==="Region"){
        _selectedKey = _region;
        _selectedCategory = gRegionNames;
    }else if(gPrmCategory==="Vehicle Type"){
        _selectedKey = _vehicleType;
        _selectedCategory = gModelYears;
    }else if(gPrmCategory==="OEM"){
        _selectedKey = _oem;
        _selectedCategory = gModelYears;
    }

    $.each(_selectedCategory, function(i, v) { 
        var _name = v.name;
        var _obj = {};
            _obj.category = _name;
        
        $.each(_categoryObj, function(y, w) { 
            var _count = 0;
            var _cName = w.name;
            var _res = v.items.filter(function (item) {
            	return item[_category] == _cName && item[_selectedKey] == _name;
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
                    //_obj.color = (_result[0].color_code !=="" ? _result[0].color_code.toLowerCase() : "gray");
                    //w.name = _cNameNew;
                }
            }
            _obj[_cNameNew] = _count;
        });
        _data.push(_obj);
    });

    callback({data: _data.sort(), selectedKey: _selectedKey, categoryObj: _categoryObj});
}

//------------------------------- COMMON CHARTS ------------------------------//
// PIE CHART
function displayComPieChart(container){
    setPieChartData(function(o){
        var _data = o.data;
        var _key = o.selectedKey;
        var _category = o.selectedCategory;
console.log("_data",_data);
        // CHART SETTINGS
        am4core.useTheme(am4themes_animated);
        am4core.options.commercialLicense = true;
        
        var _tw = new zsi.easyJsTemplateWriter();
            _tw.div();
        
        var _container = am4core.create(container, am4core.Container);
        _container.width = am4core.percent(100);
        _container.height = am4core.percent(100);
        _container.layout = "horizontal";
        
        var _createChart = function(data, name, isLegend){
            var chart = _container.createChild(am4charts.PieChart);
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
            slice.propertyFields.stroke = "color";
            slice.propertyFields.strokeDasharray = "strokeDasharray";
            slice.propertyFields.tooltipText = "tooltip";
            
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
            
            if(isLegend) setLegendSize(chart);
        };

        $.each(_category, function(i, v){
            var _groupName = v.name;
            var _result = (v.items.length === 0 ? [] : _data.filter(function (item) {
            	return item.group == _groupName;
            }));
            
            if(Number.isInteger(parseInt(_groupName))) _groupName = "MY"+ _groupName;

            _createChart(sortBy(_result, "category"), _groupName, (i === 0 ? true : false));
        });
    });
}

function displayComRegionPieChart(container){
    $("#chart_div").empty();
    gHasSub = true;
    setRegionPieChartData(function(o){
        var _data = o.data;
        var _key = o.selectedKey;
        var _category = o.selectedCategory;
console.log("RegionPie",_data);
        // CHART SETTINGS
        am4core.useTheme(am4themes_animated);
        am4core.options.commercialLicense = true;
        
        //  var _container = am4core.create(container, am4core.Container);
        // _container.width = am4core.percent(100);
        // _container.height = am4core.percent(100);
        // _container.layout = "horizontal";
        
        var _charts = [];
        var _createChart = function(data, name, isLegend, div){
            var chart = am4core.create(div, am4charts.PieChart);
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
            slice.propertyFields.stroke = "color";
            slice.propertyFields.strokeDasharray = "strokeDasharray";
            slice.propertyFields.tooltipText = "tooltip";
            slice.propertyFields.isActive = "pulled";
            
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
                    if(gPrmCategory==="Region"){
                        if (event.target.dataItem.dataContext.id !== undefined ) {
                            selected = event.target.dataItem.dataContext.id;
                        } else {
                            selected = undefined;
                        }
                        chart.data = generateChartData();
                    }else{
                        if(event.target.dataItem.dataContext.id !== 0){
                            if (event.target.dataItem.dataContext.id !== undefined ) {
                                selected = event.target.dataItem.dataContext.id;
                            } else {
                                selected = undefined;
                            }
                            chart.data = generateChartData();
                        }
                    }
                }
            });
            _charts.push(chart)
            //if(isLegend) setLegendSize(chart);
        };

        var _tw = new zsi.easyJsTemplateWriter("#"+ container);
        $.each(_category, function(i, v){
            var _charId = "chart_"+ i;
            _tw.div({ class: "flex-fill", id: _charId });
            
            var _groupName = v.name;
            var _result = (v.items.length === 0 ? [] : _data.filter(function (item) {
            	return item.group == _groupName;
            }));
          
            if(Number.isInteger(parseInt(_groupName))) _groupName = "MY"+ _groupName;

            _createChart(sortBy(_result, "category"), _groupName, (i === 0 ? true : false), _charId);
        });
        
        // $.each(_charts, function(i, v){
        //   console.log(v.data) 
        // });
    });
}

function displayComOverallPieChart(container){
    $("#chart_div").empty();
    gHasSub = true;
    setOverallPieChartData(function(o){
        var _data = o.data;
        var _key = o.selectedKey;
        var _category = o.selectedCategory;
console.log("_data",_data);
        // CHART SETTINGS
        am4core.useTheme(am4themes_animated);
        am4core.options.commercialLicense = true;
        
        //  var _container = am4core.create(container, am4core.Container);
        // _container.width = am4core.percent(100);
        // _container.height = am4core.percent(100);
        // _container.layout = "horizontal";
        
        var _charts = [];
        var _createChart = function(data, name, isLegend, div){
            var chart = am4core.create(div, am4charts.PieChart);
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
            slice.propertyFields.stroke = "color";
            slice.propertyFields.strokeDasharray = "strokeDasharray";
            slice.propertyFields.tooltipText = "tooltip";
            slice.propertyFields.isActive = "pulled";
            
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
                    if(gPrmCategory==="Region"){
                        if (event.target.dataItem.dataContext.id !== undefined ) {
                            selected = event.target.dataItem.dataContext.id;
                        } else {
                            selected = undefined;
                        }
                        chart.data = generateChartData();
                    }else{
                        if(event.target.dataItem.dataContext.id !== 0){
                            if (event.target.dataItem.dataContext.id !== undefined ) {
                                selected = event.target.dataItem.dataContext.id;
                            } else {
                                selected = undefined;
                            }
                            chart.data = generateChartData();
                        }
                    }
                }
            });
            _charts.push(chart)
            //if(isLegend) setLegendSize(chart);
        };

        var _tw = new zsi.easyJsTemplateWriter("#"+ container);
        $.each(_category, function(i, v){
            var _charId = "chart_"+ i;
            _tw.div({ class: "flex-fill", id: _charId });
            
            var _groupName = v.name;
            var _result = (v.items.length === 0 ? [] : _data.filter(function (item) {
            	return item.group == _groupName;
            }));
          
            if(Number.isInteger(parseInt(_groupName))) _groupName = "MY"+ _groupName;

            _createChart(sortBy(_result, "category"), _groupName, (i === 0 ? true : false), _charId);
        });
        
        // $.each(_charts, function(i, v){
        //   console.log(v.data) 
        // });
    });
}

// COLUMN CHART
function displayComColumnChart(container){
    setColumnChartData(function(o){
        var _data = o.data;
        var _key = o.selectedKey;
        var _category = o.categoryObj;

        // CHART SETTINGS
        am4core.useTheme(am4themes_animated);
        am4core.options.commercialLicense = true;
    
        var chart = am4core.create(container, am4charts.XYChart);
        chart.data = _data;
        chart.colors.step = 2;
        chart.padding(15, 15, 10, 15);
        
        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "category";
        categoryAxis.renderer.minGridDistance = 60;
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.interactionsEnabled = false;
        categoryAxis.numberFormatter.numberFormat = "#";
        categoryAxis.fontSize = 15;
        categoryAxis.renderer.labels.template.adapter.add("textOutput", function(text) {
            return (typeof(text)!=="undefined" ? (Number.isInteger(parseInt(text)) ? "MY"+ text: text) : text);
        });
        
        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.tooltip.disabled = true;
        valueAxis.renderer.grid.template.strokeOpacity = 0.05;
        valueAxis.renderer.minGridDistance = 20;
        valueAxis.interactionsEnabled = false;
        valueAxis.min = 0;
        valueAxis.renderer.minWidth = 35;
        
        // Create series
        var _createSeries = function(field, name) {
            var series = chart.series.push(new am4charts.ColumnSeries());
            series.columns.template.width = am4core.percent(80);
            series.columns.template.tooltipText = "[bold]{name}:[/] {valueY.formatNumber('#,###')}";
            series.name = name;
            series.dataFields.categoryX = "category";
            series.dataFields.valueY = field;
            series.dataItems.template.locations.categoryX = 0.5;
            series.tooltip.pointerOrientation = "vertical";
            series.tooltip.dy = - 20;
        };
        
        $.each(_category, function(i, v) { 
            var _name = v.name;
            var _nameNew = _name.replace(/ /g,"_");
            
            _createSeries(_nameNew, _name);
        });
        
        //Add cursor
        chart.scrollbarX = new am4core.Scrollbar();
        
        setLegendSize(chart);
    });
    //setWireTrend(_data);
}

function displayComStackColumnChart(container){
    setColumnChartData(function(o){
        var _data = o.data;
        var _key = o.selectedKey;
        var _category = o.categoryObj;

        // CHART SETTINGS
        am4core.useTheme(am4themes_animated);
        am4core.options.commercialLicense = true;
    
        var chart = am4core.create(container, am4charts.XYChart);
        chart.data = _data;
        chart.colors.step = 2;
        chart.padding(15, 15, 10, 15);
        
        // Create axes
        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "category";
        categoryAxis.renderer.minGridDistance = 60;
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.interactionsEnabled = false;
        categoryAxis.numberFormatter.numberFormat = "#";
        categoryAxis.fontSize = 15;
        categoryAxis.renderer.labels.template.adapter.add("textOutput", function(text) {
            return (typeof(text)!=="undefined" ? (Number.isInteger(parseInt(text)) ? "MY"+ text: text) : text);
        });
        
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
        var _createSeries = function(field, name) {
            var series = chart.series.push(new am4charts.ColumnSeries());
            series.columns.template.tooltipText = "{name}: {valueY.totalPercent.formatNumber('#.00')}% - {valueY.formatNumber('#,###')}";
            series.columns.template.column.strokeOpacity = 1;
            series.name = name;
            series.dataFields.categoryX = "category";
            series.dataFields.valueY = field;
            series.dataFields.valueYShow = "totalPercent";
            series.dataItems.template.locations.categoryX = 0.5;
            series.stacked = gIsStacked;
            series.tooltip.pointerOrientation = "vertical";
            series.tooltip.dy = - 20;
            
            var bullet1 = series.bullets.push(new am4charts.LabelBullet());
            bullet1.label.text = "{valueY.totalPercent.formatNumber('#.00')}%";
            bullet1.locationY = 0.5;
            bullet1.label.fill = am4core.color("#ffffff");
            bullet1.interactionsEnabled = false;
        };
        
        $.each(_category, function(i, v) { 
            var _name = v.name;
            var _nameNew = _name.replace(/_/g," ");
    
            if(gLegendData.length > 0){
                var _result = gLegendData.filter(function (item) {
                	return item["alias"].toUpperCase() == _name.toUpperCase();
                });
                if(_result.length > 0){
                    
                    _name = _result[0].legend_label;
                    _nameNew = _name.replace(/ /g,"_");
                }
            }

            _createSeries(_nameNew, _name);
        });
        
        //Add cursor
        chart.scrollbarX = new am4core.Scrollbar();

        chart.cursor = new am4charts.XYCursor();
        chart.cursor.behavior = "panX";
        
        setLegendSize(chart);
    });
    //setWireTrend(_data);
}

function displayComRegionColumnChart(container){
    var _data = [];
    var _objKey = getDistinctKey(gData);
    var _value = _objKey.value;
    var _category = _objKey.category;
    var _location = _objKey.location;
    var _region = _objKey.region;
    var _model_year = _objKey.model_year;
    var _categoryObj = gData.groupBy([_category]);
    var _locationObj = gData.groupBy([_location]);
    var _hasLocation = (_location ? true: false);

    if(_hasLocation){
        $.each(gRegionNames, function(i, r) { 
            $.each(gModelYears, function(x, my) {
                var _regionName = r.name;
                var _modelYear = my.name;
                var _result = r.items.filter(function (item) {
                	return item[_model_year] == _modelYear;
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
                    	return item[_category] == _cName && item[_model_year] == _my;
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
            series.columns.template.width = am4core.percent(80);
            series.columns.template.tooltipText = "[bold]{name}:[/] {valueY.formatNumber('#,###')} - [bold]{valueY.formatNumber('#,###')}[/]";
            series.columns.template.column.strokeOpacity = 1;
            series.name = name;
            series.dataFields.categoryX = "category";
            series.dataFields.valueY = field;
            series.dataFields.valueYShow = "totalPercent";
            series.dataItems.template.locations.categoryX = 0.5;
            series.stacked = gIsStacked;
            series.tooltip.pointerOrientation = "vertical";
            series.tooltip.dy = - 20;
            
            var bullet1 = series.bullets.push(new am4charts.LabelBullet());
            bullet1.label.text = "{valueY.totalPercent.formatNumber('#.00')}%";
            bullet1.locationY = 0.5;
            bullet1.label.fill = am4core.color("#ffffff");
            bullet1.interactionsEnabled = false;
        //   var series = chart.series.push(new am4charts.ColumnSeries());
        //   series.dataFields.valueY = field;
        //   //series.dataFields.categoryXShow = "totalPercent";
        //   series.dataFields.categoryX = "category";
        //   series.name = name;
          
        //   series.tooltipText = "[bold]{name}:[/] {valueY.totalPercent.formatNumber('#.00')}% - [bold]{valueY.formatNumber('#,###')}[/]";
        //   series.tooltip.fontSize = 8;
        //   series.tooltip.paddingTop = 1;
        //   series.tooltip.paddingBottom= 1;
        //   series.tooltip.paddingBottom= 1;
        //   series.tooltip.dy = -10;
        //   series.tooltip.align = "top";
        //   series.stacked = gIsStacked;//(_hasLocation ? true: false);
        //   series.columns.template.width = am4core.percent(95);

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
        var _createSeries = function(field, name) {
            var series = chart.series.push(new am4charts.ColumnSeries());
            series.columns.template.tooltipText = "{name}: {valueY.totalPercent.formatNumber('#.00')}% - {valueY.formatNumber('#,###')}";
            series.columns.template.column.strokeOpacity = 1;
            series.name = name;
            series.dataFields.categoryX = "category";
            series.dataFields.valueY = field;
            series.dataFields.valueYShow = "totalPercent";
            series.dataItems.template.locations.categoryX = 0.5;
            series.stacked = gIsStacked;
            series.tooltip.pointerOrientation = "vertical";
            series.tooltip.dy = - 20;
            
            // var columnTemplate = categoryAxis.columns.template;
            // columnTemplate.width = am4core.percent(80);
            // columnTemplate.propertyFields.fill = "color";
            
            var bullet1 = series.bullets.push(new am4charts.LabelBullet());
            bullet1.label.text = "{valueY.totalPercent.formatNumber('#.00')}%";
            bullet1.locationY = 0.5;
            bullet1.label.fill = am4core.color("#ffffff");
            bullet1.interactionsEnabled = false;
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
        var _nameNew = _name.replace(/ /g,"_");

        if(gLegendData.length > 0){
            var _result = gLegendData.filter(function (item) {
            	return item["alias"].toUpperCase() == _name.toUpperCase();
            });
            if(_result.length > 0){
                
                _name = _result[0].legend_label;
                //_nameNew = _name.replace(/ /g,"_");
            }
        }

        _createSeries(_nameNew, _name);
        // var _name = v.name;
        // var _nameNew = _name.replace(" ","_");

        // _createSeries(_nameNew, _name);
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
    chart.scrollbarX = new am4core.Scrollbar();

    chart.cursor = new am4charts.XYCursor();
    chart.cursor.behavior = "panX";
    
    //setLegendSize(chart);
    //setWireTrend(_data);
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
    
    // CHART SETTINGS
    am4core.useTheme(am4themes_animated);
    am4core.options.commercialLicense = true; 
      
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
//--------------------------------- PIE CHART --------------------------------//

function displayPieSmallWires(container){
    //Set Data
    var _data = [];
    $.each(gData.groupBy(["model_year"]), function(i, my) { 
        var _my = my.name;
        var _items = my.items;
        var _big = 0; //Big Wires
        var _small = 0; //Small Wires
        var _subBig = [];
        var _subSmall = [];
        
        $.each(_items.groupBy(["alias_name"]), function(x, group){
            var _alias = group.name.toLowerCase();
            var _sum = group.items.reduce(function (accumulator, currentValue) {
                return accumulator + currentValue.wire_count;
            }, 0);
  
            var _sub = [];
            $.each(group.items.groupBy(['wire_gauge']), function(y, wire){
                var _sumWire = wire.items.reduce(function (accumulator, currentValue) {
                    return accumulator + currentValue.wire_count;
                }, 0);
                
                _sub.push({
                    type: wire.name,
                    percent: _sumWire
                });
            });
  
            if(_alias.indexOf("other") != -1){
                _big = _sum;
                _subBig = [];
            }
            if(_alias.indexOf("small") != -1){
                _small = _sum;
                _subSmall = _sub;
            }
        });
        
        _data.push({
            type: "Wire sizes above 0.50 CSA",
            model_year : +_my,
            percent :  +_big,
            subs : _subBig
        },{
            type: "Wire sizes below 0.50 CSA",
            model_year : +_my,
            percent :  +_small,
            subs : _subSmall
        });
    });
    
    var container = am4core.create(container, am4core.Container);
    container.width = am4core.percent(100);
    container.height = am4core.percent(100);
    container.layout = "horizontal";
    
    var _createChart = function(data, year){
        var chart = container.createChild(am4charts.PieChart);
        //chart.width = am4core.percent(80);
        chart.paddingTop= 15;
        chart.paddingBottom = 15;
        var title = chart.titles.create();
        title.text =  "MY" + year;
        //title.fontSize = 12;
        title.fontWeight = 800;
        title.marginBottom = 0;
        
        //var types = data;
        // Add data
        var selected;
        var generateChartData = function() {
            var chartData = [];
            for (var i = 0; i < data.length; i++) {
                if (i == selected) {
                    for (var x = 0; x < data[i].subs.length; x++) {
                        chartData.push({
                            type: data[i].subs[x].type,
                            percent: data[i].subs[x].percent,
                            color: data[i].color,
                            pulled: true
                        });
                    }
                } else {
                    chartData.push({
                        type: data[i].type,
                        percent: data[i].percent,
                        color: data[i].color,
                        id: i
                    });
                }
            }
            return chartData;
        };
        
        chart.data = generateChartData();
        // Add and configure Series
        var pieSeries = chart.series.push(new am4charts.PieSeries());
        pieSeries.dataFields.value = "percent";
        pieSeries.dataFields.category = "type";
        pieSeries.slices.template.propertyFields.fill = "color";
        pieSeries.slices.template.propertyFields.isActive = "pulled";
        pieSeries.slices.template.strokeWidth = 0;
        pieSeries.paddingBottom = 10;
        pieSeries.maxHeight = "80%";
        pieSeries.colors.step = 2;
        
        pieSeries.ticks.template.disabled = true;
        pieSeries.alignLabels = false;
        pieSeries.labels.template.fontSize = 12;
        pieSeries.labels.template.text = "{value.percent.formatNumber('#.00')}%";
        pieSeries.labels.template.radius = am4core.percent(-40);
        //pieSeries.labels.template.relativeRotation = 90;
        pieSeries.labels.template.fill = am4core.color("white");
        //pieSeries.legendSettings.labelText = "Series: [bold {color}]{name}[/]";
        pieSeries.legendSettings.valueText = "{valueY.close}";
        // chart.legend = new am4charts.Legend();
        // //chart.legend.height = 50;
        // chart.legend.labels.template.fontSize = 12;
        // chart.legend.valueLabels.template.fontSize = 12;
        // chart.legend.itemContainers.template.paddingTop = 1;
        // chart.legend.itemContainers.template.paddingBottom = 1;
        //chart.legend.labels.template.truncate = false;
        //chart.legend.labels.template.wrap = true;
        //chart.legend.itemContainers.template.paddingRight = 0;
        //chart.legend.itemContainers.template.paddingLeft = 0;
        
        // var markerTemplate = chart.legend.markers.template;
        // markerTemplate.width = 12;
        // markerTemplate.height = 12;
        
        pieSeries.slices.template.events.on("hit", function(event) {
            if(event.target.dataItem.dataContext.id !== 0){
                if (event.target.dataItem.dataContext.id !== undefined ) {
                    selected = event.target.dataItem.dataContext.id;
                } else {
                    selected = undefined;
                }
                chart.data = generateChartData();
            }
            
        });
        
        pieSeries.labels.template.adapter.add("text", function(text, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return "";
            }
            return text;
        });
        
        // pieSeries.labels.template.adapter.add("relativeRotation", function(relativeRotation, target) {
        //     if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
        //         return 90;
        //     }
        //     return relativeRotation;
        // });
        
        // pieSeries.labels.template.adapter.add("radius", function(radius, target) {
        //     if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
        //         return 0;
        //     }
        //     return radius;
        // });
        
        // pieSeries.labels.template.adapter.add("fill", function(color, target) {
        //     if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
        //         return am4core.color("#000");
        //     }
        //     return color;
        // });
        
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

function displayPieNewWireSizes(container){
    var _data = [];
    $.each(gModelYears, function(x, my) { 
        var _my = my.name;
        
        $.each(gData.groupBy(["New_Wires"]), function(y, w) { 
            var _count = 0;
            var _wire = w.name;
            var _wireNew = _wire.replace(".","_");

            var _res = w.items.filter(function (item) {
            	return item.New_Wires == _wire && item.MODEL_YEAR == _my;
            });

            _count = _res.reduce(function (accumulator, currentValue) {
                return accumulator + currentValue.COUNT_WIRE_GAUGE;
            }, 0);
            
            _data.push({
                model_year: +_my,
                wire_guage: _wire,
                wire_count: _count
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
        pieSeries.dataFields.value = "wire_count";
        pieSeries.dataFields.category = "wire_guage";
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
    
        // chart.legend = new am4charts.Legend();
        // chart.legend.labels.template.fontSize = 12;
        // chart.legend.valueLabels.template.fontSize = 12;
        // chart.legend.itemContainers.template.paddingTop = 1;
        // chart.legend.itemContainers.template.paddingBottom = 1;
        
        // var markerTemplate = chart.legend.markers.template;
        // markerTemplate.width = 12;
        // markerTemplate.height = 12;
        
        pieSeries.labels.template.adapter.add("text", function(text, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return "";
            }
            return text;
        });
        
        // pieSeries.labels.template.adapter.add("radius", function(radius, target) {
        //     if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
        //         return 0;
        //     }
        //     return radius;
        // });
        
        // pieSeries.labels.template.adapter.add("fill", function(color, target) {
        //     if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
        //         return am4core.color("#000");
        //     }
        //     return color;
        // });
        
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

function displayPieSMHighFlex(container){
    var _data = [];
    $.each(gModelYears, function(x, my) { 
        var _my = my.name;
        
        $.each(gData.groupBy(["Wires"]), function(y, w) { 
            var _count = 0;
            var _wire = w.name;
            var _wireNew = _wire.replace(".","_");

            var _res = w.items.filter(function (item) {
            	return item.Wires == _wire && item.MODEL_YEAR == _my;
            });

            _count = _res.reduce(function (accumulator, currentValue) {
                return accumulator + currentValue.COUNT_WIRE_GAUGE;
            }, 0);
            
            _data.push({
                model_year: +_my,
                wire_guage: _wire,
                wire_count: _count
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
        pieSeries.dataFields.value = "wire_count";
        pieSeries.dataFields.category = "wire_guage";
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
        // chart.legend = new am4charts.Legend();
        // chart.legend.labels.template.fontSize = 12;
        // chart.legend.valueLabels.template.fontSize = 12;
        // chart.legend.itemContainers.template.paddingTop = 1;
        // chart.legend.itemContainers.template.paddingBottom = 1;
        
        // var markerTemplate = chart.legend.markers.template;
        // markerTemplate.width = 12;
        // markerTemplate.height = 12;
        
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

function displayPieSMEngineComp(container){
    var _data = [];
    $.each(gModelYears, function(x, my) { 
        var _my = my.name;
        
        $.each(gData.groupBy(["WireGauge"]), function(y, w) { 
            var _count = 0;
            var _wire = w.name;
            var _wireNew = _wire.replace(".","_");

            var _res = w.items.filter(function (item) {
            	return item.WireGauge == _wire && item.MODEL_YEAR == _my;
            });
          
            _count = _res.reduce(function (accumulator, currentValue) {
                return accumulator + currentValue.COUNT_WIRE_GAUGE;
            }, 0);
            
            _data.push({
                model_year: +_my,
                wire_guage: _wire,
                wire_count: _count
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
        pieSeries.dataFields.value = "wire_count";
        pieSeries.dataFields.category = "wire_guage";
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
        // chart.legend = new am4charts.Legend();
        // chart.legend.labels.template.fontSize = 12;
        // chart.legend.valueLabels.template.fontSize = 12;
        // chart.legend.itemContainers.template.paddingTop = 1;
        // chart.legend.itemContainers.template.paddingBottom = 1;
        
        // var markerTemplate = chart.legend.markers.template;
        // markerTemplate.width = 12;
        // markerTemplate.height = 12;
        
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

function displayPiePVCEngineComp(container){
    var _data = [];
    $.each(gModelYears, function(x, my) { 
        var _my = my.name;
        
        $.each(gData.groupBy(["WireInsulation"]), function(y, w) { 
            var _count = 0;
            var _wire = w.name;
            var _wireNew = _wire.replace(".","_");

            var _res = w.items.filter(function (item) {
            	return item.WireInsulation == _wire && item.MODEL_YEAR == _my;
            });
          
            _count = _res.reduce(function (accumulator, currentValue) {
                return accumulator + currentValue.COUNT_WIRE_INSULATION;
            }, 0);
            
            _data.push({
                model_year: +_my,
                wire_guage: _wire,
                wire_count: _count
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
        pieSeries.dataFields.value = "wire_count";
        pieSeries.dataFields.category = "wire_guage";
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
        // chart.legend = new am4charts.Legend();
        // chart.legend.labels.template.fontSize = 12;
        // chart.legend.valueLabels.template.fontSize = 12;
        // chart.legend.itemContainers.template.paddingTop = 1;
        // chart.legend.itemContainers.template.paddingBottom = 1;
        
        // var markerTemplate = chart.legend.markers.template;
        // markerTemplate.width = 12;
        // markerTemplate.height = 12;
        
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
    // var _data = [];
    // $.each(gModelYears, function(x, my) { 
    //     var _my = my.name;
        
    //     $.each(gData.groupBy(["WireInsulation"]), function(y, w) { 
    //         var _count = 0;
    //         var _harness = w.name;
    //         var _res = w.items.filter(function (item) {
    //         	return item.WireInsulation == _harness && item.MODEL_YEAR == _my;
    //         });
      
    //         _count = _res.reduce(function (accumulator, currentValue) {
    //             return accumulator + currentValue.COUNT_WIRE_GAUGE;
    //         }, 0);
            
    //         _data.push({
    //             model_year: +_my,
    //             harness_name: _harness,
    //             wire_count: _count
    //         });
    //     });
        
    // });

    // var container = am4core.create(container, am4core.Container);
    // container.width = am4core.percent(100);
    // container.height = am4core.percent(100);
    // container.layout = "horizontal";
    
    // var _createChart = function(data, year){
    //     var chart = container.createChild(am4charts.PieChart);
    //     chart.data = data;
    //     chart.paddingTop= 15;
    //     chart.paddingBottom = 15;
        
    //     var title = chart.titles.create();
    //     title.text =  "MY" + year;
    //     //title.fontSize = 12;
    //     title.fontWeight = 800;
    //     title.marginBottom = 0;
        
    //     // Add and configure Series
    //     var pieSeries = chart.series.push(new am4charts.PieSeries());
    //     pieSeries.dataFields.value = "wire_count";
    //     pieSeries.dataFields.category = "harness_name";
    //     pieSeries.slices.template.propertyFields.fill = "color";
    //     pieSeries.slices.template.propertyFields.isActive = "pulled";
    //     pieSeries.slices.template.strokeWidth = 0;
    //     pieSeries.paddingBottom = 10;
    //     pieSeries.colors.step = 2;
        
    //     pieSeries.ticks.template.disabled = true;
    //     pieSeries.alignLabels = false;
    //     pieSeries.labels.template.fontSize = 12;
    //     pieSeries.labels.template.text = "{value.percent.formatNumber('#.00')}%";
    //     pieSeries.labels.template.radius = am4core.percent(-40);
    //     //pieSeries.labels.template.relativeRotation = 90;
    //     pieSeries.labels.template.fill = am4core.color("white");
    
    //     chart.legend = new am4charts.Legend();
    //     chart.legend.labels.template.fontSize = 12;
    //     chart.legend.valueLabels.template.fontSize = 12;
    //     chart.legend.itemContainers.template.paddingTop = 1;
    //     chart.legend.itemContainers.template.paddingBottom = 1;
        
    //     var markerTemplate = chart.legend.markers.template;
    //     markerTemplate.width = 12;
    //     markerTemplate.height = 12;
        
    //     pieSeries.labels.template.adapter.add("radius", function(radius, target) {
    //         if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
    //             return 0;
    //         }
    //         return radius;
    //     });
        
    //     pieSeries.labels.template.adapter.add("fill", function(color, target) {
    //         if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
    //             return am4core.color("#000");
    //         }
    //         return color;
    //     });
    // };

    // $.each(gModelYears, function(i, v){
    //     var _my = v.name;
    //     var _res = _data.filter(function (item) {
    //     	return item.model_year == _my;
    //     });

    //     _createChart(_res, _my);
    // });
}

function displayPieNewTechWireConductor(container){
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

function displayPieTwoWayConnector(container){
    var _data = [];
    $.each(gModelYears, function(x, my) { 
        var _my = my.name;
        
        $.each(gData.groupBy(["Wires"]), function(y, w) { 
            var _count = 0;
            var _wire = w.name;
            var _res = w.items.filter(function (item) {
            	return item.Wires == _wire && item.MODEL_YEAR == _my;
            });
      
            _count = _res.reduce(function (accumulator, currentValue) {
                return accumulator + currentValue.wire_count;
            }, 0);
            
            _data.push({
                model_year: +_my,
                wire_guage: _wire,
                wire_count: _count
            });
        });
    });

    var container = am4core.create("chartMY_" + gPrmCriteriaId, am4core.Container);
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
        pieSeries.dataFields.value = "wire_count";
        pieSeries.dataFields.category = "wire_guage";
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
        // chart.legend = new am4charts.Legend();
        // chart.legend.labels.template.fontSize = 12;
        // chart.legend.valueLabels.template.fontSize = 12;
        // chart.legend.itemContainers.template.paddingTop = 1;
        // chart.legend.itemContainers.template.paddingBottom = 1;
        
        // var markerTemplate = chart.legend.markers.template;
        // markerTemplate.width = 12;
        // markerTemplate.height = 12;
        
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

function displayPieOverallCSAMarc(container){
    //Set Data
    var _data = [];
    $.each(gData.groupBy(["model_year"]), function(i, my) { 
        var _my = my.name;
        var _items = my.items;
        var _big = 0; //Big Wires
        var _small = 0; //Small Wires
        var _subBig = [];
        var _subSmall = [];
        
        $.each(_items.groupBy(["alias_name"]), function(x, group){
            var _alias = group.name.toLowerCase();
            var _sum = group.items.reduce(function (accumulator, currentValue) {
                return accumulator + currentValue.wire_count;
            }, 0);
  
            var _sub = [];
            $.each(group.items.groupBy(['wire_gauge']), function(y, wire){
                var _sumWire = wire.items.reduce(function (accumulator, currentValue) {
                    return accumulator + currentValue.wire_count;
                }, 0);
                
                _sub.push({
                    type: wire.name,
                    percent: _sumWire
                });
            });
  
            if(_alias.indexOf("big") != -1){
                _big = _sum;
                _subBig = [];
            }
            if(_alias.indexOf("small") != -1){
                _small = _sum;
                _subSmall = _sub;
            }
        });
        
        _data.push({
            type: "Wire sizes higher 1.0 CSA",
            model_year : +_my,
            percent :  +_big,
            subs : _subBig
        },{
            type: "Wire sizes lower 1.0 CSA",
            model_year : +_my,
            percent :  +_small,
            subs : _subSmall
        });
    });
    
    var container = am4core.create(container, am4core.Container);
    container.width = am4core.percent(100);
    container.height = am4core.percent(100);
    container.layout = "horizontal";
    
    var _createChart = function(data, year){
        var chart = container.createChild(am4charts.PieChart);
        //chart.width = am4core.percent(80);
        chart.paddingTop= 15;
        chart.paddingBottom = 15;
        var title = chart.titles.create();
        title.text =  "MY" + year;
        //title.fontSize = 12;
        title.fontWeight = 800;
        title.marginBottom = 0;
        
        //var types = data;
        // Add data
        var selected;
        var generateChartData = function() {
            var chartData = [];
            for (var i = 0; i < data.length; i++) {
                if (i == selected) {
                    for (var x = 0; x < data[i].subs.length; x++) {
                        chartData.push({
                            type: data[i].subs[x].type,
                            percent: data[i].subs[x].percent,
                            color: data[i].color,
                            pulled: true
                        });
                    }
                } else {
                    chartData.push({
                        type: data[i].type,
                        percent: data[i].percent,
                        color: data[i].color,
                        id: i
                    });
                }
            }
            return chartData;
        };
        
        chart.data = generateChartData();
    
        // Add and configure Series
        var pieSeries = chart.series.push(new am4charts.PieSeries());
        pieSeries.dataFields.value = "percent";
        pieSeries.dataFields.category = "type";
        pieSeries.slices.template.propertyFields.fill = "color";
        pieSeries.slices.template.propertyFields.isActive = "pulled";
        pieSeries.slices.template.strokeWidth = 0;
        pieSeries.paddingBottom = 10;
        pieSeries.maxHeight = "80%";
        pieSeries.colors.step = 2;
        
        pieSeries.ticks.template.disabled = true;
        pieSeries.alignLabels = false;
        pieSeries.labels.template.fontSize = 12;
        pieSeries.labels.template.text = "{value.percent.formatNumber('#.00')}%";
        pieSeries.labels.template.radius = am4core.percent(-40);
        //pieSeries.labels.template.relativeRotation = 90;
        pieSeries.labels.template.fill = am4core.color("white");
        pieSeries.legendSettings.valueText = "{valueY.close}";
        // chart.legend = new am4charts.Legend();
        // //chart.legend.height = 50;
        // chart.legend.labels.template.fontSize = 12;
        // chart.legend.valueLabels.template.fontSize = 12;
        // chart.legend.itemContainers.template.paddingTop = 1;
        // chart.legend.itemContainers.template.paddingBottom = 1;
        
        // var markerTemplate = chart.legend.markers.template;
        // markerTemplate.width = 12;
        // markerTemplate.height = 12;
        
        pieSeries.slices.template.events.on("hit", function(event) {
            if(event.target.dataItem.dataContext.id !== 0){
                if (event.target.dataItem.dataContext.id !== undefined ) {
                    selected = event.target.dataItem.dataContext.id;
                } else {
                    selected = undefined;
                }
                chart.data = generateChartData();
            }
            
        });
        
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

//------------------------------- COLUMN CHART -------------------------------//

function displayColumnSmallWires(container){
    //Set Data
    var _data = [];
    $.each(gData.groupBy(["region"]), function(i, region) { 
        $.each(gModelYears, function(x, my) {
            var _region = region.name;
            var _my = my.name;
            var _big = 0; //Big Wires
            var _small = 0; //Small Wires
            var _res = region.items.filter(function (item) {
            	return item.model_year == _my;
            });
          
            if( _res.length > 0 ) {
                $.each(_res, function(i, v){
                    var _alias = v.alias_name.toLowerCase();
                    if(_alias.indexOf("other") != -1){
                        _big += v.wire_count;
                    }
                    if(_alias.indexOf("small") != -1){
                        _small += v.wire_count;
                    }
                });
            }
            
            _data.push({
                region : _region,
                model_year : +_my,
                category : _my +"("+ _region +")",
                total_big_wires :  +_big,
                total_small_wires :  +_small
            });
        });
    });
        
    var chart = am4core.create(container, am4charts.XYChart);
    chart.data = _data;
    chart.colors.step = 2;
    chart.padding(30, 30, 10, 30);

    var title = chart.titles.create();
    title.text =  "Overall Usage";
    title.fontSize = 12;
    title.fontWeight = 800;
    title.marginBottom = 10;
    
    //chart.legend = new am4charts.Legend();
    //chart.legend.itemContainers.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;
    chart.numberFormatter.numberFormat = "#";
    
    // var markerTemplate = chart.legend.markers.template;
    //     markerTemplate.width = 18;
    //     markerTemplate.height = 18;
    
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "category";
    //categoryAxis.title.text = "Wire Category";
    //categoryAxis.title.fontWeight = 800;
    categoryAxis.renderer.minGridDistance = 60;
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.interactionsEnabled = false;
    categoryAxis.renderer.labels.template.adapter.add("textOutput", function(text) {
        return (typeof(text)!=="undefined" ? text.replace(/\(.*/, "") : text);
    });
    
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
    
    var series1 = chart.series.push(new am4charts.ColumnSeries());
    series1.columns.template.tooltipText = "{name}: {valueY.totalPercent.formatNumber('#.00')}% - [bold]{valueY.formatNumber('#,###')}[/]";
    series1.columns.template.column.strokeOpacity = 1;
    series1.name = "% of Below 0.50";
    series1.dataFields.categoryX = "category";
    series1.dataFields.valueY = "total_small_wires";
    series1.dataFields.valueYShow = "totalPercent";
    series1.dataItems.template.locations.categoryX = 0.5;
    series1.stacked = true;
    series1.tooltip.pointerOrientation = "vertical";
    series1.tooltip.dy = - 20;
    
    var bullet1 = series1.bullets.push(new am4charts.LabelBullet());
    bullet1.label.text = "{valueY.totalPercent.formatNumber('#.00')}%";
    bullet1.locationY = 0.5;
    bullet1.label.fill = am4core.color("#ffffff");
    bullet1.interactionsEnabled = false;
    
    var series2 = chart.series.push(series1.clone());
    series2.name = "% of Above 0.50";
    series2.dataFields.valueY = "total_big_wires";
    series2.fill = chart.colors.next();
    series2.stroke = series2.fill;
    
    setLegendSize(chart);
    setTrendResult(_data, "0.50");
    
    var createLabel = function(category, endCategory, label) {
        var range = categoryAxis.axisRanges.create();
        range.category = category;
        range.endCategory = endCategory;
        range.label.dataItem.text = label;
        range.label.dy = 15;
        range.label.fontWeight = "bold";
        range.axisFill.fill = am4core.color("#396478");
        range.axisFill.fillOpacity = 0.1;
        range.locations.category = 0.1;
        range.locations.endCategory = 0.9;
    };
    
    $.each(gRegionNames, function(i, r) { 
        var _region = "("+ r.name +")";
        createLabel(gMYFrom + _region, gMYTo + _region, r.name);
    });
}

function displayColumnNewWireSizes(container){
    var _data = [];
    $.each(gData.groupBy(["REGION_NAME"]), function(i,r) { 
        $.each(gModelYears, function(x, my) { 
            var _my = my.name;
            var _region = r.name;
            var _obj = {};
            _obj.year = +_my;
            _obj.region = _region;
            _obj.category = _my +"("+ _region +")";
            
            $.each(gData.groupBy(["New_Wires"]), function(y, w) { 
                var _count = 0;
                var _wire = w.name;
                var _wireNew = _wire.replace(".","_");
                var _res = r.items.filter(function (item) {
                	return item.New_Wires == _wire && item.MODEL_YEAR == _my;
                });
                
                _count = _res.reduce(function (accumulator, currentValue) {
                    return accumulator + currentValue.COUNT_WIRE_GAUGE;
                }, 0);

                _obj[_wireNew] = _count;
            });
            _data.push(_obj);
        });
    });

    var chart = am4core.create(container, am4charts.XYChart);
    chart.data = _data;
    chart.colors.step = 2;
    chart.maskBullets = false;
    
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
        //series.tooltip.disabled = true;
        series.tooltipText = "[bold]{name}:[/] {valueY.totalPercent.formatNumber('#.00')}% - [bold]{valueY.formatNumber('#,###')}[/]";
        //series.fill = color;

        // var bullet = series.bullets.push(new am4charts.LabelBullet());
        // bullet.label.text = "{valueY.formatNumber('#,###')}";
        // bullet.locationY = 0.5;
        // //bullet.label.fill = am4core.color("#ffffff");
        // bullet.interactionsEnabled = false;
        // bullet.label.truncate = false;
        // bullet.label.hideOversized = false;
        // bullet.label.dy = -20;
        // //bullet.locationY = 0;
        // bullet.label.verticalCenter = "bottom";
        // //bullet.rotation = 270;
        // //bullet.valign = "middle";
        
        // var bullet2 = series.bullets.push(new am4charts.LabelBullet());
        // bullet2.label.text = name;
        // bullet2.label.truncate = false;
        // bullet2.label.hideOversized = false;
        // bullet2.label.verticalCenter = "bottom";
        // bullet2.label.dy = 15;
        // bullet2.locationX = 0.5;
        // bullet2.locationY = 1;
        // bullet2.rotation = 270;
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

    var colorSet = new am4core.ColorSet();
    $.each(gData.groupBy(["New_Wires"]), function(x, w) { 
        var _wire = w.name;
        var _wireNew = _wire.replace(".","_");
        var _field = _wireNew;
        
        _createSeries(_field, _wire);
    });  
    
    $.each(gRegionNames, function(i, r) { 
        var _region = "("+ r.name +")";
        
        _createLabel(gMYFrom + _region, gMYTo + _region, r.name);
    });
    
    //Add cursor
    chart.cursor = new am4charts.XYCursor();
    
    //Add legend
    //chart.legend = new am4charts.Legend();
    
    setLegendSize(chart);
    
    //setWireTrend(_data);
}

function displayColumnSMHighFlex(container){
    var _data = [];
    $.each(gData.groupBy(["REGION_NAME"]), function(i,r) { 
        $.each(gModelYears, function(x, my) { 
            var _my = my.name;
            var _region = r.name;
            var _obj = {};
            _obj.year = +_my;
            _obj.region = _region;
            _obj.category = _my +"("+ _region +")";
            
            $.each(gData.groupBy(["Wires"]), function(y, w) { 
                var _count = 0;
                var _wire = w.name;
                var _wireNew = _wire.replace(".","_");
                var _res = r.items.filter(function (item) {
                	return item.Wires == _wire && item.MODEL_YEAR == _my;
                });
                
                _count = _res.reduce(function (accumulator, currentValue) {
                    return accumulator + currentValue.COUNT_WIRE_GAUGE;
                }, 0);

                _obj[_wireNew] = _count;
            });
            _data.push(_obj);
        });
    });
    
    var chart = am4core.create(container, am4charts.XYChart);
    chart.data = _data;
    chart.colors.step = 2;
    chart.maskBullets = false;
    
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
    valueAxis.title.text = "Count";
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
        //series.tooltip.disabled = true;
        series.tooltipText = "[bold]{name}:[/] {valueY.totalPercent.formatNumber('#.00')}% - [bold]{valueY.formatNumber('#,###')}[/]";
        //series.fill = color;

        // var bullet = series.bullets.push(new am4charts.LabelBullet());
        // bullet.label.text = "{valueY.formatNumber('#,###')}";
        // bullet.locationY = 0.5;
        // //bullet.label.fill = am4core.color("#ffffff");
        // bullet.interactionsEnabled = false;
        // bullet.label.truncate = false;
        // bullet.label.hideOversized = false;
        // bullet.label.dy = -20;
        // //bullet.locationY = 0;
        // bullet.label.verticalCenter = "bottom";
        // //bullet.rotation = 270;
        // //bullet.valign = "middle";
        
        // var bullet2 = series.bullets.push(new am4charts.LabelBullet());
        // bullet2.label.text = name;
        // bullet2.label.truncate = false;
        // bullet2.label.hideOversized = false;
        // bullet2.label.verticalCenter = "bottom";
        // bullet2.label.dy = 15;
        // bullet2.locationX = 0.5;
        // bullet2.locationY = 1;
        // bullet2.rotation = 270;
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

    var colorSet = new am4core.ColorSet();
    $.each(gData.groupBy(["Wires"]), function(x, w) { 
        var _wire = w.name;
        var _wireNew = _wire.replace(".","_");
        var _field = _wireNew;
        
        _createSeries(_field, _wire);
    });  
    
    $.each(gRegionNames, function(i, r) { 
        var _region = "("+ r.name +")";
        
        _createLabel(gMYFrom + _region, gMYTo + _region, r.name);
    });
    
    //Add cursor
    chart.cursor = new am4charts.XYCursor();
    
    //Add legend
    //chart.legend = new am4charts.Legend();
    
    setLegendSize(chart);
    
    //setWireTrend(_data);
}

function displayColumnSMEngineComp(container){
    var _data = [];
    $.each(gData.groupBy(["REGION_NAME"]), function(i,r) { 
        $.each(gModelYears, function(x, my) { 
            var _my = my.name;
            var _region = r.name;
            var _obj = {};
            _obj.year = +_my;
            _obj.region = _region;
            _obj.category = _my +"("+ _region +")";
            
            $.each(gData.groupBy(["WireGauge"]), function(y, w) { 
                var _count = 0;
                var _wire = w.name;
                var _wireNew = _wire.replace(".","_");
                var _res = r.items.filter(function (item) {
                	return item.WireGauge == _wire && item.MODEL_YEAR == _my;
                });
                
                _count = _res.reduce(function (accumulator, currentValue) {
                    return accumulator + currentValue.COUNT_WIRE_GAUGE;
                }, 0);

                _obj[_wireNew] = _count;
            });
            _data.push(_obj);
        });
    });
    
    var chart = am4core.create(container, am4charts.XYChart);
    chart.data = _data;
    chart.colors.step = 2;
    chart.maskBullets = false;
    
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
    valueAxis.title.text = "Count";
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

    var colorSet = new am4core.ColorSet();
    $.each(gData.groupBy(["WireGauge"]), function(x, w) { 
        var _wire = w.name;
        var _wireNew = _wire.replace(".","_");
        var _field = _wireNew;
        
        _createSeries(_field, _wire);
    });  
    
    $.each(gRegionNames, function(i, r) { 
        var _region = "("+ r.name +")";
        
        _createLabel(gMYFrom + _region, gMYTo + _region, r.name);
    });
    
    //Add cursor
    chart.cursor = new am4charts.XYCursor();
    
    //Add legend
    //chart.legend = new am4charts.Legend();
    
    setLegendSize(chart);
    
    //setWireTrend(_data);
}

function displayColumnPVCEngineComp(container){
    var _data = [];
    $.each(gData.groupBy(["REGION_NAME"]), function(i,r) { 
        $.each(gModelYears, function(x, my) { 
            var _my = my.name;
            var _region = r.name;
            var _obj = {};
            _obj.year = +_my;
            _obj.region = _region;
            _obj.category = _my +"("+ _region +")";
            
            $.each(gData.groupBy(["WireInsulation"]), function(y, w) { 
                var _count = 0;
                var _wire = w.name;
                var _wireNew = _wire.replace(".","_");
                var _res = r.items.filter(function (item) {
                	return item.WireInsulation == _wire && item.MODEL_YEAR == _my;
                });
                
                _count = _res.reduce(function (accumulator, currentValue) {
                    return accumulator + currentValue.COUNT_WIRE_INSULATION;
                }, 0);

                _obj[_wireNew] = _count;
            });
            _data.push(_obj);
        });
    });
    
    var chart = am4core.create(container, am4charts.XYChart);
    chart.data = _data;
    chart.colors.step = 2;
    chart.maskBullets = false;
    
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
    valueAxis.title.text = "Count";
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

    var colorSet = new am4core.ColorSet();
    $.each(gData.groupBy(["WireInsulation"]), function(x, w) { 
        var _wire = w.name;
        var _wireNew = _wire.replace(".","_");
        var _field = _wireNew;
        
        _createSeries(_field, _wire);
    });  
    
    $.each(gRegionNames, function(i, r) { 
        var _region = "("+ r.name +")";
        
        _createLabel(gMYFrom + _region, gMYTo + _region, r.name);
    });
    
    //Add cursor
    chart.cursor = new am4charts.XYCursor();
    
    //Add legend
    //chart.legend = new am4charts.Legend();
    
    setLegendSize(chart);
    
    //setWireTrend(_data);
}

function displayColumnNewTechWireConductor(container){
    var _data = [];
    $.each(gData.groupBy(["REGION_NAME"]), function(i,r) { 
        $.each(gModelYears, function(x, my) { 
            var _my = my.name;
            var _region = r.name;
            var _obj = {};
            _obj.year = +_my;
            _obj.region = _region;
            _obj.category = _my +"("+ _region +")";
            
            $.each(gData.groupBy(["WireGauge"]), function(y, w) { 
                var _count = 0;
                var _wire = w.name;
                var _wireNew = _wire.replace(".","_");
                var _res = r.items.filter(function (item) {
                	return item.WireGauge == _wire && item.MODEL_YEAR == _my;
                });
                
                _count = _res.reduce(function (accumulator, currentValue) {
                    return accumulator + currentValue.COUNT_WIRE_GAUGE;
                }, 0);

                _obj[_wireNew] = _count;
            });
            _data.push(_obj);
        });
    });
    
    var chart = am4core.create(container, am4charts.XYChart);
    chart.data = _data;
    chart.colors.step = 2;
    chart.maskBullets = false;
    
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
    valueAxis.title.text = "Count";
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

    var colorSet = new am4core.ColorSet();
    $.each(gData.groupBy(["WireGauge"]), function(x, w) { 
        var _wire = w.name;
        var _wireNew = _wire.replace(".","_");
        var _field = _wireNew;
        
        _createSeries(_field, _wire);
    });  
    
    $.each(gRegionNames, function(i, r) { 
        var _region = "("+ r.name +")";
        
        _createLabel(gMYFrom + _region, gMYTo + _region, r.name);
    });
    
    //Add cursor
    chart.cursor = new am4charts.XYCursor();
    
    //Add legend
    //chart.legend = new am4charts.Legend();
    
    setLegendSize(chart);
    
    //setWireTrend(_data);
}

function displayColumnTwoWayConnector(container){
    var _data = [];
    $.each(gData.groupBy(["REGION_NAME"]), function(i,r) { 
        $.each(gModelYears, function(x, my) { 
            var _my = my.name;
            var _region = r.name;
            var _obj = {};
            _obj.year = +_my;
            _obj.region = _region;
            _obj.category = _my +"("+ _region +")";
            
            $.each(gData.groupBy(["Wires"]), function(y, w) { 
                var _count = 0;
                var _wire = w.name;
                var _wireNew = _wire.replace(".","_");
                var _res = r.items.filter(function (item) {
                	return item.Wires == _wire && item.MODEL_YEAR == _my;
                });
                
                _count = _res.reduce(function (accumulator, currentValue) {
                    return accumulator + currentValue.wire_count;
                }, 0);

                _obj[_wireNew] = _count;
            });
            _data.push(_obj);
        });
    });
    
    var chart = am4core.create(container, am4charts.XYChart);
    chart.data = _data;
    chart.colors.step = 2;
    chart.maskBullets = false;
    
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
    valueAxis.title.text = "Count";
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

    var colorSet = new am4core.ColorSet();
    $.each(gData.groupBy(["Wires"]), function(x, w) { 
        var _wire = w.name;
        var _field = _wire.replace(".","_");
        
        _createSeries(_field, _wire);
    });  
    
    $.each(gRegionNames, function(i, r) { 
        var _region = "("+ r.name +")";
        
        _createLabel(gMYFrom + _region, gMYTo + _region, r.name);
    });
    
    //Add cursor
    chart.cursor = new am4charts.XYCursor();
    
    //Add legend
    //chart.legend = new am4charts.Legend();
    
    setLegendSize(chart);
    //setWireTrend(_data);
}

function displayColumnOverallCSAMarc(container){
    //Set Data
    var _data = [];
    $.each(gData.groupBy(["region"]), function(i, region) { 
        $.each(gModelYears, function(x, my) {
            var _region = region.name;
            var _my = my.name;
            var _big = 0; //Big Wires
            var _small = 0; //Small Wires
            var _res = region.items.filter(function (item) {
            	return item.model_year == _my;
            });
          
            if( _res.length > 0 ) {
                $.each(_res, function(i, v){
                    var _alias = v.alias_name.toLowerCase();
                    if(_alias.indexOf("big") != -1){
                        _big += v.wire_count;
                    }
                    if(_alias.indexOf("small") != -1){
                        _small += v.wire_count;
                    }
                });
            }
            
            _data.push({
                region : _region,
                model_year : +_my,
                category : _my +"("+ _region +")",
                total_big_wires :  +_big,
                total_small_wires :  +_small
            });
        });
    });
        
    var chart = am4core.create(container, am4charts.XYChart);
    chart.data = _data;
    chart.colors.step = 2;
    chart.padding(30, 30, 10, 30);

    var title = chart.titles.create();
    title.text =  "Overall Usage";
    title.fontSize = 12;
    title.fontWeight = 800;
    title.marginBottom = 10;
    
    //chart.legend = new am4charts.Legend();
    //chart.legend.itemContainers.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;
    chart.numberFormatter.numberFormat = "#";
    
    // var markerTemplate = chart.legend.markers.template;
    //     markerTemplate.width = 18;
    //     markerTemplate.height = 18;
    
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "category";
    //categoryAxis.title.text = "Wire Category";
    //categoryAxis.title.fontWeight = 800;
    categoryAxis.renderer.minGridDistance = 60;
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.interactionsEnabled = false;
    categoryAxis.renderer.labels.template.adapter.add("textOutput", function(text) {
        return (typeof(text)!=="undefined" ? text.replace(/\(.*/, "") : text);
    });
    
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
    
    var series1 = chart.series.push(new am4charts.ColumnSeries());
    series1.columns.template.tooltipText = "{name}: {valueY.totalPercent.formatNumber('#.00')}% - [bold]{valueY.formatNumber('#,###')}[/]";
    series1.columns.template.column.strokeOpacity = 1;
    series1.name = "% of Lower 1.0";
    series1.dataFields.categoryX = "category";
    series1.dataFields.valueY = "total_small_wires";
    series1.dataFields.valueYShow = "totalPercent";
    series1.dataItems.template.locations.categoryX = 0.5;
    series1.stacked = true;
    series1.tooltip.pointerOrientation = "vertical";
    series1.tooltip.dy = - 20;
    
    var bullet1 = series1.bullets.push(new am4charts.LabelBullet());
    bullet1.label.text = "{valueY.totalPercent.formatNumber('#.00')}%";
    bullet1.locationY = 0.5;
    bullet1.label.fill = am4core.color("#ffffff");
    bullet1.interactionsEnabled = false;
    
    var series2 = chart.series.push(series1.clone());
    series2.name = "% of Higher 1.0";
    series2.dataFields.valueY = "total_big_wires";
    series2.fill = chart.colors.next();
    series2.stroke = series2.fill;
    
    setLegendSize(chart);
    setTrendResult(_data, "1.0");
    
    var createLabel = function(category, endCategory, label) {
        var range = categoryAxis.axisRanges.create();
        range.category = category;
        range.endCategory = endCategory;
        range.label.dataItem.text = label;
        range.label.dy = 15;
        range.label.fontWeight = "bold";
        range.axisFill.fill = am4core.color("#396478");
        range.axisFill.fillOpacity = 0.1;
        range.locations.category = 0.1;
        range.locations.endCategory = 0.9;
    };
    
    $.each(gRegionNames, function(i, r) { 
        var _region = "("+ r.name +")";
        createLabel(gMYFrom + _region, gMYTo + _region, r.name);
    });
}

//--------------------------------- LINE CHART -------------------------------//

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
    
    // Add legend
    //chart.legend = new am4charts.Legend();
}

//-------------------------- END WIRES AND CABLES CHART-----------------------//

// Power Distribution
function displayPiePowerDistribution(container){
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

function displayColumnPowerDistribution(container, callback){
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

// Grounding Distribution
function displayPieChart(container){
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

function displayColumnChart(container){
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

// Network Topology
function displayPieNetworkTopology(container){
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

function displayColumnNetworkTopology(container, callback){
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

// ******************************** END CHART ********************************//
              