  var  svn                        = zsi.setValIfNull
    ,bs                         = zsi.bs.ctrl
    ,bsButton                   = zsi.bs.button
    ,proc_url                   = base_url + "common/executeproc/"
    ,gMenu                      = "M"
    ,gMenuId                    = parseInt(zsi.getUrlParamValue("mId"))
    ,gSpecsId                   = parseInt(zsi.getUrlParamValue("sId"))
    ,gPrmRegion                 = ""
    ,gPrmNoYears                = ""
    ,gPrmChartType              = ""
    ,gPrmIncludeCYear           = "N"
    ,gPrmCriteriaId             = null
    ,gPrmReportTypeId           = null
    ,gMYFrom                    = ""
    ,gMYTo                      = ""
    ,gMYRange                   = ""
    ,gRegionNames               = []
    ,gModelYears                = []
    ,gData                      = []
    ,gPieChartData              = []
    ,gColumnChartData           = []
    ,$gMainContainer            = null
    ,gTW                        = null
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

function setLegendSize(chart, callback){
    chart.legend = new am4charts.Legend();
    chart.legend.labels.template.fontSize = 10;
    chart.legend.valueLabels.template.fontSize = 10;
    chart.legend.itemContainers.template.dy = 10;
    chart.legend.itemContainers.template.paddingTop = 1;
    chart.legend.itemContainers.template.paddingBottom = 1;
        
    var markerTemplate = chart.legend.markers.template;
    markerTemplate.width = 10;
    markerTemplate.height = 10;
    
    if(callback) callback(chart.legend);
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

function sortBy(data, key){
    data.sort(function(a, b) {
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
    
    return data;
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
        var _subCName = $.trim(o.subCriteriaName).toUpperCase();
        var _url = "";
        var _result = {};
        var _chart = {pie:"", column:"", line: ""};

        if(isContain(_pCName, "WIRES AND CABLES")){
            
        }
        else if(isContain(_pCName, "INLINE CONNECTOR")){
            
        }
        else if(isContain(_pCName, "GROUND EYELET") || isContain(_pCName, "SPLICES") || isContain(_pCName, "BATTERY FUSE TERMINAL")){
            _url = "dynamic_cts_usage_summary @byMY='Y',@byRegion='Y',@criteria_id="+ _subCid;
            _chart.pie = "displayPieGroundEyelet(container)";
            _chart.column = "displayColumnGroundEyelet(container)";
        }
        else if(isContain(_pCName, "COVERINGS")){
            
            _url = "dynamic_coverings_sel @byMY='Y',@byRegion='Y',@criteria_id="+ _subCid;
            _chart.line = "displayChartCovering(container)";
        }
        else if(isContain(_pCName, "RETAINERS")){
            
            _url = "dynamic_retainers_sel @byMY='Y',@byRegion='Y',@criteria_id="+ _subCid;
            _chart.line = "displayChartRetainer(container)";
        }
        else if(isContain(_pCName, "GROMMETS")){
            
            _url = "dynamic_grommets_sel @byMY='Y',@byRegion='Y',@criteria_id="+ _subCid;
            _chart.pie = "displayPieGrommets(container)";
            _chart.column = "displayColumnGrommets(container)";
        }
        else if(isContain(_pCName, "TROUGH/SHIELD/BRACKET")){
            
            _url = "dynamic_stc_sel @byMY='Y',@byRegion='Y',@criteria_id="+ _subCid;
            _chart.pie = "displayPieSTC(container)";
            _chart.column = "displayColumnSTC(container)";
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

            gTW.chart({
                card_id: _subCid,
                header_title: _subCName,
                body_id: _subCDiv,
                card_class: "position-relative"
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
        }) 
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
                style: "min-height: calc(100vh - 115px)",
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
                        console.log("location", _specLocation)
                        console.log("_category", _category)
                        console.log("_result2", _result2)
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
    
    console.log("data", _data);
    
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
        setWireTrend(_data);
    }
    // if(gData.length > 0){
    //     var _data = [];
    //     var _objKey = getDistinctKey(gData);
    //     var _value = _objKey.value;
    //     var _category = _objKey.category;
    //     var _location = _objKey.location;
    //     var _specification = _objKey.specification;
        
    //     var _categoryObj = gData.groupBy([_category]);
    //     var _specObj = [];
    //     var _hasLocation = false;
        
    //     if(_location!==""){
    //         _hasLocation = true;
    //         _specObj = gData.groupBy([_specification]);
    //     }
        
    //     if(_hasLocation){
    //         $.each(gRegionNames, function(i, r) { 
    //             $.each(gModelYears, function(x, my) {
    //                 var _regionName = r.name;
    //                 var _modelYear = my.name;
    //                 var _result = r.items.filter(function (item) {
    //                 	return item.MODEL_YEAR == _modelYear;
    //                 });
                    
    //                 $.each(_specObj, function(y, l) {
    //                     var _specName = l.name;
    //                     var _json = {
    //                         REGION_NAME : _regionName,
    //                         MODEL_YEAR : +_modelYear,
    //                         category : _specName +"("+ _modelYear +"-"+ _regionName +")"
    //                     };
    
    //                     $.each(_categoryObj, function(z, s) {
    //                         var _count = 0;
    //                         var _cName = s.name;
    //                         var _cNameNew = _cName.replace(" ","_");
    //                         var _result2 = _result.filter(function (item) {
    //                         	return item[_specification] == _specName && item[_category] == _cName;
    //                         });
    
    //                         if(_value && _value !== ""){
    //                              _count = _result2.reduce(function (accumulator, currentValue) {
    //                                 return accumulator + currentValue[_value];
    //                             }, 0)
    //                         }else{
    //                             for(; _count < _result2.length; ){
    //                                 _count++;
    //                             }
    //                         }
                           
    //                         _json[_cNameNew] = _count;
    //                     });
                        
    //                     _data.push(_json);
    //                 }); 
    //             });
    //         });
    //     }
    //     else{
    //          $.each(gRegionNames, function(i,r) { 
    //             $.each(gModelYears, function(x, my) { 
    //                 var _my = my.name;
    //                 var _region = r.name;
    //                 var _obj = {};
    //                 _obj.year = +_my;
    //                 _obj.region = _region;
    //                 _obj.category = _my +"("+ _region +")";
                    
    //                 $.each(_categoryObj, function(y, w) { 
    //                     var _count = 0;
    //                     var _cName = w.name;
    //                     var _cNameNew = _cName.replace(" ","_");
    //                     var _res = r.items.filter(function (item) {
    //                     	return item[_category] == _cName && item.MODEL_YEAR == _my;
    //                     });
                        
    //                     if(_value && _value !== ""){
    //                          _count = _res.reduce(function (accumulator, currentValue) {
    //                             return accumulator + currentValue[_value];
    //                         }, 0);    
    //                     }else{
    //                         for(; _count < _res.length; ){
    //                             _count++;
    //                         }
    //                     }
        
    //                     _obj[_cNameNew] = _count;
    //                 });
    //                 _data.push(_obj);
    //             });
    //         });
    //     }
    //     // Display Chart
    //     am4core.useTheme(am4themes_animated);
        
    //     var chart = am4core.create(container, am4charts.XYChart);
    //     chart.data = _data;
    //     chart.colors.step = 2;
    //     chart.padding(15, 15, 10, 15);
    
    //     if(_hasLocation){
    //         var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    //         categoryAxis.dataFields.category = "category";
    //         categoryAxis.renderer.minGridDistance = 20;
    //         categoryAxis.renderer.grid.template.location = 0;
    //         categoryAxis.interactionsEnabled = false;
    //         categoryAxis.renderer.labels.template.fontSize = 10;
    //         categoryAxis.renderer.labels.template.valign = "top";
    //         categoryAxis.renderer.labels.template.location = 0;
    //         categoryAxis.renderer.labels.template.rotation = (_hasLocation ? 270: 0);
    //         categoryAxis.renderer.labels.template.adapter.add("textOutput", function(text) {
    //             return (!isUD(text) ? text.replace(/\(.*/, "") : text);
    //         });
        
    //         var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    //         //valueAxis.title.text = "Count";
    //         valueAxis.min = 0;
    //         //valueAxis.max = 100;
    //         valueAxis.strictMinMax = true;
    //         valueAxis.calculateTotals = true;
    //         valueAxis.renderer.minGridDistance = 10;
    //         valueAxis.renderer.labels.template.adapter.add("text", function(text) {
    //           return text + "%";
    //         });
        
    //         // Create series
    //         var _createSeries = function(field, name) {
    //           var series = chart.series.push(new am4charts.ColumnSeries());
    //           series.dataFields.valueY = field;
    //           //series.dataFields.categoryXShow = "totalPercent";
    //           series.dataFields.categoryX = "category";
    //           series.name = name;
    //           series.tooltipText = "[bold]{name}:[/] {valueY.totalPercent.formatNumber('#.00')}% - [bold]{valueY.formatNumber('#,###')}[/]";
    //           series.tooltip.fontSize = 8;
    //           series.tooltip.paddingTop = 1;
    //           series.tooltip.paddingBottom= 1;
    //           series.tooltip.paddingBottom= 1;
    //           series.tooltip.dy = -10;
    //           series.tooltip.align = "top";
    //           series.stacked = (_hasLocation ? true: false);
    //           series.columns.template.width = am4core.percent(95);

    //         }
            
    //         var _createLabel = function(category, endCategory, label, opacity, dy) {
    //             var range = categoryAxis.axisRanges.create();
    //             range.category = category;
    //             range.endCategory = endCategory;
    //             range.label.dataItem.text = label;
    //             range.label.dy = dy;
    //             //range.label.fontSize = 10;
    //             range.label.fontWeight = "bold";
    //             range.label.valign = "bottom";
    //             range.label.location = 0.5;
    //             range.label.rotation = 0;
    //             range.axisFill.fill = am4core.color("#396478");
    //             range.axisFill.fillOpacity = opacity;
    //             range.locations.category = 0.1;
    //             range.locations.endCategory = 0.9;
    //         };
    //     }
    //     else{
    //         // Create axes
    //         var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    //         categoryAxis.dataFields.category = "category";
    //         categoryAxis.numberFormatter.numberFormat = "#";
    //         //categoryAxis.title.text = "Wire 0.50 and Below";
    //         categoryAxis.renderer.grid.template.location = 0;
    //         categoryAxis.renderer.minGridDistance = 20;
    //         categoryAxis.renderer.labels.template.adapter.add("textOutput", function(text) {
    //             return (typeof(text)!=="undefined" ? text.replace(/\(.*/, "") : text);
    //         });
            
    //         var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    //         //valueAxis.title.text = "Count";
    //         valueAxis.min = 0;
    //         valueAxis.max = 100;
    //         valueAxis.strictMinMax = true;
    //         valueAxis.calculateTotals = true;
    //         valueAxis.renderer.labels.template.adapter.add("text", function(text) {
    //           return text + "%";
    //         });
            
    //         // Create series
    //         var _createSeries = function(field, name) {
    //             var series = chart.series.push(new am4charts.ColumnSeries());
    //             series.dataFields.valueY = field;
    //             series.dataFields.valueYShow = "totalPercent";
    //             series.dataFields.categoryX = "category";
    //             series.name = name;
    //             series.tooltipText = "[bold]{name}:[/] {valueY.totalPercent.formatNumber('#.00')}% - [bold]{valueY.formatNumber('#,###')}[/]";
    //             series.tooltip.fontSize = 8;
    //             series.tooltip.dy = -10;
    //             series.tooltip.align = "top";
    //         };
             
    //         var _createLabel = function(category, endCategory, label) {
    //             var range = categoryAxis.axisRanges.create();
    //             range.category = category;
    //             range.endCategory = endCategory;
    //             range.label.dataItem.text = label;
    //             range.label.dy = 18;
    //             range.label.fontWeight = "bold";
    //             range.axisFill.fill = am4core.color("#396478");
    //             range.axisFill.fillOpacity = 0.1;
    //             range.locations.category = 0.1;
    //             range.locations.endCategory = 0.9;
    //         };
    //     }
        
    //     $.each(_categoryObj, function(i, v) { 
    //         var _name = v.name;
    //         var _nameNew = _name.replace(" ","_");

    //         _createSeries(_nameNew, _name);
    //     }); 
        
    //     if(_hasLocation){
    //       var _specName = getFirstAndLastItem(_specObj , "name");
            
    //         $.each(gModelYears, function(i, v) { 
    //             var _my = v.name;
                
    //             $.each(gRegionNames, function(i, r) { 
    //                 var _reg = r.name;
    //                 var _first = _specName.first + "("+ _my +"-"+ _reg +")";
    //                 var _last = _specName.last + "("+ _my +"-"+ _reg +")";
                    
    //                 _createLabel(_first, _last, _my, 0, 10);
    //             });
    //         });
            
    //         $.each(gRegionNames, function(i, r) { 
    //             var _reg = r.name;
    //             var _first = _specName.first + "("+ gMYFrom +"-"+ _reg +")";
    //             var _last = _specName.last + "("+ gMYTo +"-"+ _reg +")";
                
    //             _createLabel(_first, _last, _reg, 0.1, 20);
    //         }); 
    //     }
    //     else{
    //         $.each(gRegionNames, function(i, r) { 
    //             var _region = "("+ r.name +")";
                
    //             _createLabel(gMYFrom + _region, gMYTo + _region, r.name,  0.1, 10);
    //         });
    //     }
        
    //     //Add cursor
    //     chart.cursor = new am4charts.XYCursor();
    //     chart.cursor.fullWidthLineX = false;
    //     chart.cursor.lineX.strokeWidth = 0;
    //     chart.cursor.lineX.fill = am4core.color("#000");
    //     chart.cursor.lineX.fillOpacity = 0.1;
    //     chart.cursor.behavior = "panX";
    //     chart.cursor.lineY.disabled = true;
        
    //     setLegendSize(chart);
    // }
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
        setWireTrend(_data);
    }
    // if(gData.length > 0){
    //     var _data = [];
    //     var _dynamicKey = getDistinctKey(gData);
    //     var _value = _dynamicKey.value;
    //     var _category = _dynamicKey.category;
    //     var _dynamicObj = gData.groupBy([_category]);
        
    //     $.each(gRegionNames, function(i,r) { 
    //         $.each(gModelYears, function(x, my) { 
    //             var _my = my.name;
    //             var _region = r.name;
    //             var _obj = {};
    //             _obj.year = +_my;
    //             _obj.region = _region;
    //             _obj.category = _my +"("+ _region +")";
                
    //             $.each(_dynamicObj, function(y, w) { 
    //                 var _count = 0;
    //                 var _cName = w.name;
    //                 var _cNameNew = _cName.replace(".","_");
    //                 var _res = r.items.filter(function (item) {
    //                 	return item[_category] == _cName && item.MODEL_YEAR == _my;
    //                 });
                    
    //                 if(_value && _value !== ""){
    //                      _count = _res.reduce(function (accumulator, currentValue) {
    //                         return accumulator + currentValue[_value];
    //                     }, 0);    
    //                 }else{
    //                     for(; _count < _res.length; ){
    //                         _count++;
    //                     }
    //                 }
    
    //                 _obj[_cNameNew] = _count;
    //             });
    //             _data.push(_obj);
    //         });
    //     });
        
    //     // Display Chart
    //     am4core.useTheme(am4themes_animated);
        
    //     var chart = am4core.create(container, am4charts.XYChart);
    //     chart.data = _data;
    //     chart.colors.step = 2;
    //     chart.maskBullets = false;
        
    //     // Create axes
    //     var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    //     categoryAxis.dataFields.category = "category";
    //     categoryAxis.numberFormatter.numberFormat = "#";
    //     //categoryAxis.title.text = "Wire 0.50 and Below";
    //     categoryAxis.renderer.grid.template.location = 0;
    //     categoryAxis.renderer.minGridDistance = 20;
    //     categoryAxis.renderer.labels.template.adapter.add("textOutput", function(text) {
    //         return (typeof(text)!=="undefined" ? text.replace(/\(.*/, "") : text);
    //     });
        
    //     var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    //     //valueAxis.title.text = "Count";
    //     valueAxis.min = 0;
    //     valueAxis.max = 100;
    //     valueAxis.strictMinMax = true;
    //     valueAxis.calculateTotals = true;
    //     valueAxis.renderer.labels.template.adapter.add("text", function(text) {
    //       return text + "%";
    //     });
        
    //     // Create series
    //     var _createSeries = function(field, name) {
    //         var series = chart.series.push(new am4charts.ColumnSeries());
    //         series.dataFields.valueY = field;
    //         series.dataFields.valueYShow = "totalPercent";
    //         series.dataFields.categoryX = "category";
    //         series.name = name;
    //         series.tooltipText = "[bold]{name}:[/] {valueY.totalPercent.formatNumber('#.00')}% - [bold]{valueY.formatNumber('#,###')}[/]";
    //     };
         
    //     var _createLabel = function(category, endCategory, label) {
    //         var range = categoryAxis.axisRanges.create();
    //         range.category = category;
    //         range.endCategory = endCategory;
    //         range.label.dataItem.text = label;
    //         range.label.dy = 18;
    //         range.label.fontWeight = "bold";
    //         range.axisFill.fill = am4core.color("#396478");
    //         range.axisFill.fillOpacity = 0.1;
    //         range.locations.category = 0.1;
    //         range.locations.endCategory = 0.9;
    //     };
    
    //     $.each(_dynamicObj, function(x, w) { 
    //         var _cName = w.name;
    //         var _cNameNew = _cName.replace(".","_");
            
    //         _createSeries(_cNameNew, _cName);
    //     });  
        
    //     $.each(gRegionNames, function(i, r) { 
    //         var _region = "("+ r.name +")";
            
    //         _createLabel(gMYFrom + _region, gMYTo + _region, r.name);
    //     });
        
    //     //Add cursor
    //     chart.cursor = new am4charts.XYCursor();
        
    //     setLegendSize(chart);
    //     setWireTrend(_data);
    // }
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
        setWireTrend(_data);
    }
    // if(gData.length > 0){
    //     var _data = [];
    //     var _dynamicKey = getDistinctKey(gData);
    //     var _value = _dynamicKey.value;
    //     var _category = _dynamicKey.category;
    //     var _dynamicObj = gData.groupBy([_category]);
        
    //     $.each(gRegionNames, function(i,r) { 
    //         $.each(gModelYears, function(x, my) { 
    //             var _my = my.name;
    //             var _region = r.name;
    //             var _obj = {};
    //             _obj.year = +_my;
    //             _obj.region = _region;
    //             _obj.category = _my +"("+ _region +")";
                
    //             $.each(_dynamicObj, function(y, w) { 
    //                 var _count = 0;
    //                 var _name = w.name;
    //                 var _nameNew = _name.replace(".","_");
    //                 var _res = r.items.filter(function (item) {
    //                 	return item[_category] == _name && item.MODEL_YEAR == _my;
    //                 });
                    
    //                 if(_value && _value !== ""){
    //                      _count = _res.reduce(function (accumulator, currentValue) {
    //                         return accumulator + currentValue[_value];
    //                     }, 0)
    //                 }else{
    //                     for(; _count < _res.length; ){
    //                         _count++;
    //                     }
    //                 }
    //                 _obj[_nameNew] = _count;
    //             });
    //             _data.push(_obj);
    //         });
    //     });
        
    //     // Display Chart
    //     am4core.useTheme(am4themes_animated);
        
    //     var chart = am4core.create(container, am4charts.XYChart);
    //     chart.data = _data;
    //     chart.colors.step = 2;
    //     chart.maskBullets = false;
        
    //     // Create axes
    //     var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    //     categoryAxis.dataFields.category = "category";
    //     categoryAxis.numberFormatter.numberFormat = "#";
    //     //categoryAxis.title.text = "Wire 0.50 and Below";
    //     categoryAxis.renderer.grid.template.location = 0;
    //     categoryAxis.renderer.minGridDistance = 20;
    //     categoryAxis.renderer.labels.template.adapter.add("textOutput", function(text) {
    //         return (typeof(text)!=="undefined" ? text.replace(/\(.*/, "") : text);
    //     });
        
    //     var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    //     //valueAxis.title.text = "Count";
    //     valueAxis.min = 0;
    //     valueAxis.max = 100;
    //     valueAxis.strictMinMax = true;
    //     valueAxis.calculateTotals = true;
    //     valueAxis.renderer.labels.template.adapter.add("text", function(text) {
    //       return text + "%";
    //     });
        
    //     // Create series
    //     var _createSeries = function(field, name) {
    //         var series = chart.series.push(new am4charts.ColumnSeries());
    //         series.dataFields.valueY = field;
    //         series.dataFields.valueYShow = "totalPercent";
    //         series.dataFields.categoryX = "category";
    //         series.name = name;
    //         series.tooltipText = "[bold]{name}:[/] {valueY.totalPercent.formatNumber('#.00')}% - [bold]{valueY.formatNumber('#,###')}[/]";
    //     };
         
    //     var _createLabel = function(category, endCategory, label) {
    //         var range = categoryAxis.axisRanges.create();
    //         range.category = category;
    //         range.endCategory = endCategory;
    //         range.label.dataItem.text = label;
    //         range.label.dy = 18;
    //         range.label.fontWeight = "bold";
    //         range.axisFill.fill = am4core.color("#396478");
    //         range.axisFill.fillOpacity = 0.1;
    //         range.locations.category = 0.1;
    //         range.locations.endCategory = 0.9;
    //     };
    
    //     $.each(_dynamicObj, function(x, w) { 
    //         var _name = w.name;
    //         var _nameNew = _name.replace(".","_");
            
    //         _createSeries(_nameNew, _name);
    //     });  
        
    //     $.each(gRegionNames, function(i, r) { 
    //         var _region = "("+ r.name +")";
            
    //         _createLabel(gMYFrom + _region, gMYTo + _region, r.name);
    //     });
        
    //     //Add cursor
    //     chart.cursor = new am4charts.XYCursor();
        
    //     setLegendSize(chart);
    //     setWireTrend(_data);
    // }
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
        setWireTrend(_data);
    }
    // if(gData.length > 0){
    //     var _data = [];
    //     var _dynamicKey = getDistinctKey(gData);
    //     var _value = _dynamicKey.value;
    //     var _category = _dynamicKey.category;
    //     var _dynamicObj = gData.groupBy([_category]);
        
    //     $.each(gRegionNames, function(i,r) { 
    //         $.each(gModelYears, function(x, my) { 
    //             var _my = my.name;
    //             var _region = r.name;
    //             var _obj = {};
    //             _obj.year = +_my;
    //             _obj.region = _region;
    //             _obj.category = _my +"("+ _region +")";
                
    //             $.each(_dynamicObj, function(y, w) { 
    //                 var _count = 0;
    //                 var _cName = w.name;
    //                 var _cNameNew = _cName.replace(".","_");
    //                 var _res = r.items.filter(function (item) {
    //                 	return item[_category] == _cName && item.MODEL_YEAR == _my;
    //                 });
                    
    //                 if(_value && _value !== ""){
    //                      _count = _res.reduce(function (accumulator, currentValue) {
    //                         return accumulator + currentValue[_value];
    //                     }, 0);    
    //                 }else{
    //                     for(; _count < _res.length; ){
    //                         _count++;
    //                     }
    //                 }
    
    //                 _obj[_cNameNew] = _count;
    //             });
    //             _data.push(_obj);
    //         });
    //     });
        
    //     // Display Chart
    //     am4core.useTheme(am4themes_animated);
        
    //     var chart = am4core.create(container, am4charts.XYChart);
    //     chart.data = _data;
    //     chart.colors.step = 2;
    //     chart.maskBullets = false;
        
    //     // Create axes
    //     var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    //     categoryAxis.dataFields.category = "category";
    //     categoryAxis.numberFormatter.numberFormat = "#";
    //     //categoryAxis.title.text = "Wire 0.50 and Below";
    //     categoryAxis.renderer.grid.template.location = 0;
    //     categoryAxis.renderer.minGridDistance = 20;
    //     categoryAxis.renderer.labels.template.adapter.add("textOutput", function(text) {
    //         return (typeof(text)!=="undefined" ? text.replace(/\(.*/, "") : text);
    //     });
        
    //     var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    //     //valueAxis.title.text = "Count";
    //     valueAxis.min = 0;
    //     valueAxis.max = 100;
    //     valueAxis.strictMinMax = true;
    //     valueAxis.calculateTotals = true;
    //     valueAxis.renderer.labels.template.adapter.add("text", function(text) {
    //       return text + "%";
    //     });
        
    //     // Create series
    //     var _createSeries = function(field, name) {
    //         var series = chart.series.push(new am4charts.ColumnSeries());
    //         series.dataFields.valueY = field;
    //         series.dataFields.valueYShow = "totalPercent";
    //         series.dataFields.categoryX = "category";
    //         series.name = name;
    //         series.tooltipText = "[bold]{name}:[/] {valueY.totalPercent.formatNumber('#.00')}% - [bold]{valueY.formatNumber('#,###')}[/]";
    //     };
         
    //     var _createLabel = function(category, endCategory, label) {
    //         var range = categoryAxis.axisRanges.create();
    //         range.category = category;
    //         range.endCategory = endCategory;
    //         range.label.dataItem.text = label;
    //         range.label.dy = 18;
    //         range.label.fontWeight = "bold";
    //         range.axisFill.fill = am4core.color("#396478");
    //         range.axisFill.fillOpacity = 0.1;
    //         range.locations.category = 0.1;
    //         range.locations.endCategory = 0.9;
    //     };
    
    //     $.each(_dynamicObj, function(x, w) { 
    //         var _cName = w.name;
    //         var _cNameNew = _cName.replace(".","_");
            
    //         _createSeries(_cNameNew, _cName);
    //     });  
        
    //     $.each(gRegionNames, function(i, r) { 
    //         var _region = "("+ r.name +")";
            
    //         _createLabel(gMYFrom + _region, gMYTo + _region, r.name);
    //     });
        
    //     //Add cursor
    //     chart.cursor = new am4charts.XYCursor();
        
    //     setLegendSize(chart);
    //     setWireTrend(_data);
    // }
}
   