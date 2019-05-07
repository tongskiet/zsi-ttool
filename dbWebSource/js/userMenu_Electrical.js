 var  svn                        = zsi.setValIfNull
    ,bs                         = zsi.bs.ctrl
    ,bsButton                   = zsi.bs.button
    ,proc_url                   = base_url + "common/executeproc/"
    ,gMenu                      = "E"
    ,gMenuId                    = parseInt(zsi.getUrlParamValue("mId"))
    ,gSpecsId                   = parseInt(zsi.getUrlParamValue("sId"))
    ,gtw                        = null
    ,gPrmRegion                 = ""
    ,gPrmNoYears                = ""
    ,gPrmChartType              = ""
    ,gPrmIncludeCYear           = "N"
    ,gAll                       = []
    ,gByRegion                  = []
    ,gByModelYear               = []
    ,gPrmCriteriaId             = null
    ,gPrmReportTypeId           = null
    ,gMYRange                   = ""
    ,gHarnessName               = ""
    ,gRegionNames               = []
    ,gModelYears                = []
    ,gMYFrom                    = ""
    ,gMYTo                      = ""
    ,gData                      = []
    ,gPieChartData              = []
    ,gColumnChartData           = []
    ,$gMainContainer     
    ,gTW 
    ,gSubCriteriaId             = ""
    ,gSubCriteriaName           = ""
;
 
zsi.ready(function(){
    //Init main container and template writer
    gTW = new zsi.easyJsTemplateWriter();
    $gMainContainer = $("#main_container");
    
    if(gMenuId !== null && gMenuId !== "" && gSpecsId !== null && gSpecsId !== "" && (isNaN(gMenuId) === false && isNaN(gSpecsId) === false)){
         displaySubCategory(gMenuId, gSpecsId, function(data){
             displayChartByCriteria(data);
         });
    }else{
         displayUserMenus();
    }
    
    $(window).on('beforeunload', function() {
        $(window).scrollTop(0);
    });
    // ===== Scroll to Top ==== 
    $(window).scroll(function() {
        if ($(this).scrollTop() >= 50) {    // If page is scrolled more than 50px
            $('#btnGoTop').fadeIn(200);     // Fade in the arrow
        } else {
            $('#btnGoTop').fadeOut(200);    // Else fade out the arrow
        }
    });
    $('#btnGoTop').click(function() {       // When arrow is clicked
        $('body,html').animate({
            scrollTop : 0                   // Scroll to top of body
        }, 500);
    });
});

// this function uses a stored procedure action to get the "menus" for the users
function displayUserMenus(){
    gTW.new();    
    $.get(execURL + "trend_menus_sel @menu_type='E'", function(data){
        var _rows = data.rows;
        $gMainContainer.html(function(){
            $.each(_rows, function(){
                gTW.usersMenu({
                      link      : "#"
                    , imageId3  : "/file/viewimagedb?sqlcode=t83&imageid=" + this.image4_id 
                    , imageId4  : "/file/viewimagedb?sqlcode=t83&imageid=" + this.image3_id
                    , label     : this.menu_name
                    , labelBreakCSS:  "label-double"
                    , onClick   : "displaySubCategory(this," + this.menu_id+","+this.specs_id+")"
                });
            });
            return gTW.html();
        });
    });
}

function displaySubCategory(menuId, specsId, callback){
    gTW.new();
    $gMainContainer.empty();
   
    $.get(execURL + "criterias_sel @trend_menu_id=" + menuId, function(data){
        var _rows = data.rows;
        var _criteria = _rows.filter(function (item) {
                	return item.pcriteria_id === "";
                });

        if(_criteria.length === 0){
            displayUserMenus();
        }else{  
           
            $gMainContainer.html(function(){   
                $.each(_criteria, function(){
                    gTW.usersMenuGraph({
                          link      : "#"
                        , imageId3  : "/file/viewimagedb?sqlcode=t83&imageid=33"
                        , imageId4  : "/file/viewimagedb?sqlcode=t83&imageid=32"
                        , label     : this.criteria_title
                        , labelBreakCSS: "label-double"
                        , criteriaId   : this.criteria_id
                        , criteriaName   : this.criteria_title
                    });
                });
                return gTW.html();
            });
        } 
        
        callback(_rows);
    });
}   

//******************************* CHART FUNCTION *****************************//

function setLegendSize(chart){
    chart.legend = new am4charts.Legend();
    chart.legend.labels.template.fontSize = 10;
    chart.legend.valueLabels.template.fontSize = 10;
    chart.legend.itemContainers.template.dy = 10;
    chart.legend.itemContainers.template.paddingTop = 1;
    chart.legend.itemContainers.template.paddingBottom = 1;
        
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
            if(_key !== "REGION_NAME" && _key !== "MODEL_YEAR"){
                if(_key === "LOCATION"){
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

function getDataByCriteriaId(url, subCriteriaName, callback){
    if(_url !== ""){
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
                
                if(isContain(subCriteriaName, "Overall")){
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

function setChartSettings(o){
    if(!$.isEmptyObject(o)){
        var _pCid = o.pCriteriaId; //Parent Criteria Id
        var _pCName = $.trim(o.pCriteriaName).toUpperCase();
        var _subCid = o.subCriteriaId;
        var _subCName = $.trim(o.subCriteriaName);
        var _url = "";
        var _result = {};
        var _chart = {pie:"", column:"", line: ""};
        var _staticMY = new Date().getFullYear() - 2;

        if(isContain(_pCName, "VEHICLE ARCHITECTURE")){
        
        }
        else if(isContain(_pCName, "WIRES AND CABLES")){
            _url = "dynamic_wires_usage_summary @byRegion='Y',@byMY='Y',@criteria_id="+ _subCid;
            
            if(isContain(_subCName, "Overall wire usage lower than 0.5 CSA")){
                _chart.pie = "displayPieSmallWires(container)";
                _chart.column = "displayColumnSmallWires(container)";
            }
            else if(isContain(_subCName, "New Wire Sizes")){
                _chart.pie = "displayPieNewWireSizes(container)";
                _chart.column = "displayColumnNewWireSizes(container)";
            }
            else if(isContain(_subCName, "Smaller wire sizes in High Flexible areas")){
                _chart.pie = "displayPieSMHighFlex(container)";
                _chart.column = "displayColumnSMHighFlex(container)";
            }
            else if(isContain(_subCName, "Smaller wire sizes in Engine Compartment areas")){
                _chart.pie = "displayPieSMEngineComp(container)";
                _chart.column = "displayColumnSMEngineComp(container)";
            }
            else if(isContain(_subCName, "PVC wires in Engine Compartment")){
                _chart.pie = "displayPiePVCEngineComp(container)";
                _chart.column = "displayColumnPVCEngineComp(container)";
            }
            else if(isContain(_subCName, "New Conductor Technology with lesser dimensions")){
                _url = "wire_tech_lower_upper_diameter @byMY="+ _staticMY +",@criteria_id="+ _subCid;
                _chart.line = "displayWireTechDiameter(container)";
            }
            else if(isContain(_subCName, "New Conductor Technology with lesser weight")){
                _url = "wire_tech_lower_upper_weight @model_year="+ _staticMY +",@criteria_id="+ _subCid;
                _chart.line = "displayWireTechWeight(container)";
            } 
            else if(isContain(_subCName, "New Technology on wire Conductor")){
                _chart.pie = "displayPieNewTechWireConductor(container)";
                _chart.column = "displayColumnNewTechWireConductor(container)";
            } 
            else if(isContain(_subCName, "Overall wire usage lower than 1.0 CSA")){
                _chart.pie = "displayPieOverallCSAMarc(container)";
                _chart.column = "displayColumnOverallCSAMarc(container)";
            }
            else{
                
            }
        }
        else if(isContain(_pCName, "POWER DISTRIBUTION")){
            _url = "dynamic_power_distributions_sel @byMY='Y',@byRegion='Y',@criteria_id="+ _subCid;
            _chart.pie = "displayPiePowerDistribution(container)";
            _chart.column = "displayColumnPowerDistribution(container)";
        }
        else if(isContain(_pCName, "GROUNDING DISTRIBUTION")){
            
        }
        else if(isContain(_pCName, "NETWORK DISTRIBUTION")){
            _url = "dynamic_network_topology_sel @byMY='Y',@byRegion='Y',@criteria_id="+ _subCid;
            _chart.pie = "displayPieNetworkTopology(container)";
            _chart.column = "displayColumnNetworkTopology(container)";
        }
        else{
            
        }

        _result.url = _url;
        _result.chart = _chart;
       
        return _result;
    }
}

function displayChartByCriteria(data){
    var _promises = [];
    $gMainContainer.find(".d-criteria").each(function(){
        var _d = new $.Deferred;
        var _pCid = $(this).attr("id");
        var _pCName = $(this).attr("name");
        var _$chartContainer = $(this).find(".users-menu-graph");
        var _subCriterias = data.filter(function (item) {
        	return item.pcriteria_id == _pCid;
        });

        gTW.new();
        $.each(_subCriterias, function(i, v){
            var _subCid = v.criteria_id;
            var _subCName = v.criteria_title;
            var _subCDiv = "d_sub_criteria_" + _subCid;
            
            //var _loadChart = function() {
                //if (_index < _subClength) {
                    gTW.chart({
                        card_id: _subCid,
                        header_title: _subCName,
                        body_id: _subCDiv
                    });
                    
                    _$chartContainer.append(gTW.html());
                        
                    var _res = setChartSettings({
                        pCriteriaId : _pCid,
                        pCriteriaName : _pCName,
                        subCriteriaId: _subCid,
                        subCriteriaName: _subCName,
                        subCriteriaDiv: _subCDiv
                    });
                    
                    if(_res.url !== ""){
                        getDataByCriteriaId(_res.url, _subCName, function(){
                            gSubCriteriaId = _subCid;
                            setMYRange();
                            
                            displayChartBySubCriteria(_res, function(){
                                _d.resolve();
                            })
                        });
                    }else{
                        _d.resolve();
                    }
                    _promises.push(_d.promise());
                //}
               
            //};
            //_loadChart();
        });
    });
    
    $.when.apply($, _promises).done(function(){
        // Show div on scroll
        $('.aniview').AniView({
            animateThreshold: 200,
            scrollPollInterval: 20
        });
        
        // Initialize sticky div
        $(".users-menu-item").stick_in_parent({
            //parent: ".userForm",
            //spacer: ".manual_spacer"
        });  
         //console.log(arguments)
    });
}

function displayChartBySubCriteria(data, callback){
    gTW.new();
    
    var _res = data;
    var _keys = Object.keys(_res.chart);
    for (var _key of _keys) {
        var _value = _res.chart[_key];
        var _chartId = _key +"_"+ gSubCriteriaId;
        
        if (_value !== "") {
            
            gTW.chartCard({ 
                id: _chartId,
                style: "min-height: 320px",
                header:"d-none"
            });
            $("#d_sub_criteria_" + gSubCriteriaId).append(gTW.html());
            
            // Call function name
            var _fnName = new Function("container", _value);
                _fnName(_chartId);
        }
    }
    
    callback();
}

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
    
    // var _data = [];
    // $.each(gModelYears, function(x, my) {
    //     $.each(gData.groupBy(["REGION_NAME"]), function(y, r) { 
    //         var _count = 0;
    //         var _my = my.name;
    //         var _region = r.name;
    //         var _res = r.items.filter(function (item) {
    //         	return item.REGION_NAME == _region && item.MODEL_YEAR == _my;
    //         });
      
    //         _count = _res.reduce(function (accumulator, currentValue) {
    //             return accumulator + currentValue.wire_count;
    //         }, 0);
            
    //         _data.push({
    //             model_year: +_my,
    //             region_name: _region,
    //             wire_count: _count
    //         });
    //     });
    // });

    // var container = am4core.create("chartMY_" + gPrmCriteriaId, am4core.Container);
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
    //     pieSeries.dataFields.category = "region_name";
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
    setTrendResult(_data, "0.50", );
    
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
    
    setWireTrend(_data);
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
    
    setWireTrend(_data);
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
    
    setWireTrend(_data);
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
    
    setWireTrend(_data);
    
    // var _data = [];
    // $.each(gData.groupBy(["REGION_NAME"]), function(i,r) { 
    //     $.each(gModelYears, function(x, my) { 
    //         var _my = my.name;
    //         var _region = r.name;
    //         var _obj = {};
    //         _obj.year = +_my;
    //         _obj.region = _region;
    //         _obj.category = _my +"("+ _region +")";
            
    //         $.each(gData.groupBy(["WireInsulation"]), function(y, w) { 
    //             var _count = 0;
    //             var _harness = w.name;
    //             var _harnessNew = _harness.replace(".","_");
    //             var _res = r.items.filter(function (item) {
    //             	return item.WireInsulation == _harness && item.MODEL_YEAR == _my;
    //             });
                
    //             _count = _res.reduce(function (accumulator, currentValue) {
    //                 return accumulator + currentValue.COUNT_WIRE_GAUGE;
    //             }, 0);

    //             _obj[_harnessNew] = _count;
    //         });
    //         _data.push(_obj);
    //     });
    // });
    
    // var chart = am4core.create(container, am4charts.XYChart);
    // chart.data = _data;
    // chart.colors.step = 2;
    // chart.maskBullets = false;
    
    // // Create axes
    // var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    // categoryAxis.dataFields.category = "category";
    // categoryAxis.numberFormatter.numberFormat = "#";
    // //categoryAxis.title.text = "Wire 0.50 and Below";
    // categoryAxis.renderer.grid.template.location = 0;
    // categoryAxis.renderer.minGridDistance = 20;
    // categoryAxis.renderer.labels.template.adapter.add("textOutput", function(text) {
    //     return (typeof(text)!=="undefined" ? text.replace(/\(.*/, "") : text);
    // });
    
    // var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    // valueAxis.title.text = "Count";
    // valueAxis.min = 0;
    // //valueAxis.max = 100;
    // //valueAxis.strictMinMax = true;
    // //valueAxis.calculateTotals = true;
    // // valueAxis.renderer.labels.template.adapter.add("text", function(text) {
    // //   return text + "%";
    // // });
    
    // // Create series
    // var _createSeries = function(field, name) {
    //     var series = chart.series.push(new am4charts.ColumnSeries());
    //     series.dataFields.valueY = field;
    //     //series.dataFields.valueYShow = "totalPercent";
    //     series.dataFields.categoryX = "category";
    //     series.name = name;
    //     series.tooltipText = "[bold]{name}:[/] {valueY.totalPercent.formatNumber('#.00')}% - [bold]{valueY.formatNumber('#,###')}[/]";
    // };
     
    // var _createLabel = function(category, endCategory, label) {
    //     var range = categoryAxis.axisRanges.create();
    //     range.category = category;
    //     range.endCategory = endCategory;
    //     range.label.dataItem.text = label;
    //     range.label.dy = 18;
    //     range.label.fontWeight = "bold";
    //     range.axisFill.fill = am4core.color("#396478");
    //     range.axisFill.fillOpacity = 0.1;
    //     range.locations.category = 0.1;
    //     range.locations.endCategory = 0.9;
    // };

    // var colorSet = new am4core.ColorSet();
    // $.each(gData.groupBy(["WireInsulation"]), function(x, w) { 
    //     var _harness = w.name;
    //     var _field = _harness.replace(".","_");
        
    //     _createSeries(_field, _harness);
    // });  
    
    // $.each(gRegionNames, function(i, r) { 
    //     var _region = "("+ r.name +")";
        
    //     _createLabel(gMYFrom + _region, gMYTo + _region, r.name);
    // });
    
    // //Add cursor
    // chart.cursor = new am4charts.XYCursor();
    
    // //Add legend
    // chart.legend = new am4charts.Legend();
    
    // setLegendSize(chart);
    
    // var _trend = "";
    // var lastObj = _data[_data.length - 1];
    // $.each(lastObj, function(k, v){
    //     var _key = $.trim(k).toLowerCase();
    //     if( _key.indexOf("harness") > -1 && v !== 0){
    //         _trend += k + '<br>';
    //     }
    // });
    
    // var _tw = new zsi.easyJsTemplateWriter()
    // $("#chart_container").append( _tw.trendResult({ trend: _trend }).html() );
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
    
    setWireTrend(_data);
    
    // var _data = [];
    // $.each(gData.groupBy(["REGION_NAME"]), function(i,r) { 
    //     var _obj = {};
    //     $.each(gModelYears, function(x, my) { 
    //         var _my = my.name;
    //         var _region = r.name;
    //         var _count = 0;
            
    //         var _res = r.items.filter(function (item) {
    //         	return item.MODEL_YEAR == _my;
    //         });
            
    //         _count = _res.reduce(function (accumulator, currentValue) {
    //             return accumulator + currentValue.wire_count;
    //         }, 0);
        
    //         _obj[_my] = _count;
    //         _obj.category = _region;
    //     });
        
    //     _data.push(_obj);
    // });
    
    // var chart = am4core.create(container, am4charts.XYChart);
    // chart.data = _data;
    // chart.colors.step = 2;
    // chart.maskBullets = false;
    
    // // Create axes
    // var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    // categoryAxis.dataFields.category = "category";
    // categoryAxis.numberFormatter.numberFormat = "#";
    // //categoryAxis.title.text = "Wire 0.50 and Below";
    // categoryAxis.renderer.grid.template.location = 0;
    // categoryAxis.renderer.minGridDistance = 20;
    
    // var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    // valueAxis.title.text = "Count";
    // valueAxis.min = 0;
    // valueAxis.max = 100;
    // valueAxis.strictMinMax = true;
    // valueAxis.calculateTotals = true;
    // valueAxis.renderer.labels.template.adapter.add("text", function(text) {
    //   return text + "%";
    // });
    
    
    // var _createSeries = function(field){
    //     var series = chart.series.push(new am4charts.ColumnSeries());
    //     series.columns.template.width = am4core.percent(80);
    //     series.tooltipText = "[bold]{name}:[/] {valueY.totalPercent.formatNumber('#.00')}% - [bold]{valueY.formatNumber('#,###')}[/]";
    //     //series.columns.template.tooltipText = "{name}: {valueY.value}";
    //     series.name = field;
    //     series.dataFields.categoryX = "category";
    //     series.dataFields.valueY = field;
    //     series.dataFields.valueYShow = "totalPercent";
    //     series.stacked = false;
    // };
   
    // $.each(gModelYears, function(i, v){
    //     _createSeries(v.name);
    // });
    
    // //Add cursor
    // chart.cursor = new am4charts.XYCursor();
    
    // //Add legend
    // chart.legend = new am4charts.Legend();
    
    // setWireTrend(_data);
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
    setWireTrend(_data);
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
        var _dynamicKey = getDistinctKey(gData);
        var _value = _dynamicKey.value;
        var _category = _dynamicKey.category;
        var _dynamicObj = gData.groupBy([_category]);
        
        $.each(gRegionNames, function(i, r) { 
            $.each(gModelYears, function(x, my) { 
                var _my = my.name;
                var _region = r.name;
                var _obj = {};
                _obj.year = +_my;
                _obj.region = _region;
                _obj.category = _my +"("+ _region +")";
                
                $.each(_dynamicObj, function(y, w) { 
                    var _count = 0;
                    var _cName = w.name;
                    var _cNameNew = _cName.replace(".","_");
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
        
        // Display Chart
        am4core.useTheme(am4themes_animated);
        
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
    
        $.each(_dynamicObj, function(x, w) { 
            var _cName = w.name;
            var _cNameNew = _cName.replace(".","_");
            
            _createSeries(_cNameNew, _cName);
        });  
        
        $.each(gRegionNames, function(i, r) { 
            var _region = "("+ r.name +")";
            
            _createLabel(gMYFrom + _region, gMYTo + _region, r.name);
        });
        
        //Add cursor
        chart.cursor = new am4charts.XYCursor();
        
        setLegendSize(chart);
        setWireTrend(_data);
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
        var _dynamicKey = getDistinctKey(gData);
        var _value = _dynamicKey.value;
        var _category = _dynamicKey.category;
        var _dynamicObj = gData.groupBy([_category]);
        
        $.each(gRegionNames, function(i, r) { 
            $.each(gModelYears, function(x, my) { 
                var _my = my.name;
                var _region = r.name;
                var _obj = {};
                _obj.year = +_my;
                _obj.region = _region;
                _obj.category = _my +"("+ _region +")";
                
                $.each(_dynamicObj, function(y, w) { 
                    var _count = 0;
                    var _cName = w.name;
                    var _cNameNew = _cName.replace(".","_");
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
        
        // Display Chart
        am4core.useTheme(am4themes_animated);
        
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
    
        $.each(_dynamicObj, function(x, w) { 
            var _cName = w.name;
            var _cNameNew = _cName.replace(".","_");
            
            _createSeries(_cNameNew, _cName);
        });  
        
        $.each(gRegionNames, function(i, r) { 
            var _region = "("+ r.name +")";
            
            _createLabel(gMYFrom + _region, gMYTo + _region, r.name);
        });
        
        //Add cursor
        chart.cursor = new am4charts.XYCursor();
        
        setLegendSize(chart);
        setWireTrend(_data);
    }
}

// ******************************** END CHART ********************************//
    