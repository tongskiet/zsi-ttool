var  svn                        = zsi.setValIfNull
    ,bs                         = zsi.bs.ctrl
    ,bsButton                   = zsi.bs.button
    ,proc_url                   = base_url + "common/executeproc/"
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
    ,gColumnChartData              = []
;
 
zsi.ready(function(){
    if(gMenuId !== null && gMenuId !== "" && gSpecsId !== null && gSpecsId !== "" && (isNaN(gMenuId) === false && isNaN(gSpecsId) === false)){
         displaySubCategory(this,gMenuId, gSpecsId);
    }else{
         displayUserMenus();
    }
    
    // ===== Scroll to Top ==== 
    $(window).scroll(function() {
        if ($(this).scrollTop() >= 50) {        // If page is scrolled more than 50px
            $('#btnGoTop').fadeIn(200);    // Fade in the arrow
        } else {
            $('#btnGoTop').fadeOut(200);   // Else fade out the arrow
        }
    });
    $('#btnGoTop').click(function() {      // When arrow is clicked
        $('body,html').animate({
            scrollTop : 0                       // Scroll to top of body
        }, 500);
    });
});

function getMenuTypeTemplate(callBack){
    $.get(base_url + "page/name/tmplLeftNavE",function(d){
        if(callBack) callBack(d);
    });    
}

// this function uses a stored procedure action to get the "menus" for the users
function displayUserMenus(){
    var _tw = new zsi.easyJsTemplateWriter();    
    $.get(execURL + "trend_menus_sel", function(data){
        var d = data.rows;
        
        $(".users-menu-content").html(function(){
            $.each(d, function(){
                _tw.usersMenu({
                      link      : "#"
                    , imageId3  : this.image4_id 
                    , imageId4  : this.image3_id
                    , label     : this.menu_name
                    , labelBreakCSS:  "label-double"
                    , onClick   : "displaySubCategory(this," + this.menu_id+","+this.specs_id+")"
                });
            });
            return _tw.html();
        });
    });
}

function displaySubCategory(sel,menuId, specsId){
    var _tw = new zsi.easyJsTemplateWriter("#main_container");
    
    $.get(execURL + "criterias_sel @trend_menu_id=" + menuId, function(data){
        var _rows = data.rows;
        var _result = _rows.filter(function (item) {
                	return item.pcriteria_id === "";
                });
  
        if(_result.length === 0){
            displayUserMenus();
        }else{  
            $(".navbar-nav.users").css("display","none"); // these are the main users menu which i hide temporarily
            //$(".navbar-nav").last().after(function(){
                $.each(_result, function(){
                    var _cid = this.criteria_id;
                    var _chartCon = "chart_container_" + _cid;
                    var _data = _rows.filter(function (item) {
                    	return item.pcriteria_id === _cid;
                    });
                    
                    _tw.usersMenuGraph({
                          link      : "#"
                        , imageId3  : 33
                        , imageId4  : 32
                        , label     : this.criteria_title
                        , labelBreakCSS: "label-double"
                        , chartId   : _chartCon
                    });
            
                    if(_data.length > 0){
                        setChartTemplate(_data, _chartCon);
                    }
                });
                //return _tw.html();
           // }); 
           
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
        } 
    });
}   

//******************************* CHART FUNCTION *****************************//

function setChartTemplate(o, div){
    var _parentCid = o[0].pcriteria_id;
    var _chartCon = "#" + div;
    var _tw = new zsi.easyJsTemplateWriter(_chartCon).new();
    
    $.each(o, function(i, v){
        var _criteriaId = v.criteria_id;
        var _criteriaTitle = v.criteria_title;
        var _chartBody = "chartBody_" + _criteriaId;
                
        _tw.chart({
            card_id: _criteriaId,
            header_title: _criteriaTitle,
            body_id: _chartBody
        });

        var index = 0;
        var loadChart = function() {
            
            if (index < o.length) {
                if(_criteriaId === 7 || _criteriaId === 8 || _criteriaId === 9 || _criteriaId === 10 || _criteriaId === 38 || _criteriaId === 39 || _criteriaId === 40 || _criteriaId === 41 || _criteriaId === 14 || _criteriaId === 67 ||  _criteriaId === 74){
                    gtw = new zsi.easyJsTemplateWriter("#" + _chartBody).new();
                    gtw.chartDiv({ 
                        title: "", 
                        title_class:"d-none", 
                        header_id: "",
                        header_class: "d-none",
                        chart_my_id: "chartMY_" + _criteriaId,
                        chart_region_id: "chartRegion_" + _criteriaId,
                        chart_region_class: ( _criteriaId === 39 ||  _criteriaId === 40 || _criteriaId === 60 || _criteriaId === 67 || _criteriaId === 74 ? "d-none" : ""),
                        footer_id: "chartTrendResult",
                        footer_class: "d-none"
                    });
                    
                    am4core.useTheme(am4themes_animated);
                   
                    if(_criteriaId === 39){
                        displayNewWireTechDimension(_criteriaId);
                    }
                    else if(_criteriaId === 40){
                       displayNewWireTech(_criteriaId);
                    }
                    else if(_criteriaId === 67 || _criteriaId === 74){
                       displayChartRetainer(_criteriaId);
                    }
                    else{
                       getDataByCriteriaId(_criteriaId, function(){
                            setMYRange();
                            //setPieChartData();
                            //setColumnChartData();
                            
                            displayPieChart(function(){
                                displayColumnChart(function(){
                                    ++index;
                                });
                            });
                        });
                   }
               }
            } 
        };
        loadChart();
    });
}

function getDataByCriteriaId(criteriaId, callback){
    if($.trim(criteriaId)){  
        var _param = "";
        if(gPrmIncludeCYear==="Y") 
            _param += ",@no_years='"+ gPrmNoYears +"',@include_cyear='Y'";
        else if(gPrmIncludeCYear==="N" && gPrmNoYears!==""){
            _param += ",@no_years='"+ gPrmNoYears +"',@include_cyear='N'";
        }

        $.get(execURL + "dynamic_wires_usage_summary @byRegion='Y',@byMY='Y',@criteria_id="+ criteriaId + _param
        , function(data){
            gData = [];
            gPrmCriteriaId = criteriaId; //Re-set to maintain the value of gPrmCriteriaId 
            
            if(data.rows.length > 0) {
                gData = data.rows;
                
                if(criteriaId === 7){
                    gRegionNames = gData.groupBy(["region"]);
                    gModelYears = gData.groupBy(["model_year"]);
                }else{
                    gRegionNames = gData.groupBy(["REGION_NAME"]);
                    gModelYears = gData.groupBy(["MODEL_YEAR"]);
                }
                
                //sort by name
                if(gRegionNames.length > 0){
                    gRegionNames.sort(function(a, b) {
                      var nameA = a.name.toUpperCase(); // ignore upper and lowercase
                      var nameB = b.name.toUpperCase(); // ignore upper and lowercase
                      if (nameA < nameB) {
                        return -1;
                      }
                      if (nameA > nameB) {
                        return 1;
                      }
                    
                      // names must be equal
                      return 0;
                    });
                }
                //sort by name
                if(gModelYears.length > 0){
                    gModelYears.sort(function(a, b) {
                      var nameA = a.name.toUpperCase(); // ignore upper and lowercase
                      var nameB = b.name.toUpperCase(); // ignore upper and lowercase
                      if (nameA < nameB) {
                        return -1;
                      }
                      if (nameA > nameB) {
                        return 1;
                      }
                    
                      // names must be equal
                      return 0;
                    });
                }
            }
            if(callback) callback();
        });
    }
}

// function setPieChartData(callback){

//     if(gData.length > 0) {
        
//         gPieChartData = [];
//         if(gPrmCriteriaId === 7){
            
//         }
//         else if(gPrmCriteriaId === 8){
            
//         }
//     }

//     if(callback) callback();
// }

// function setColumnChartData(callback){
//     gColumnChartData = [];
//     if(gPrmCriteriaId === 7){
        
//     }
    
//     //console.log("gColumnChartData", gColumnChartData);
//     if(callback) callback();
// }

function displayPieChart(callback){
    if(gData.length > 0){
        
        if(gPrmCriteriaId === 7){
            displayPieSmallWires();
        }
        else if(gPrmCriteriaId === 8){
            displayPieNewWireSizes();
        }
        else if(gPrmCriteriaId === 9){
            displayPieSMHighFlex();
        }
        else if(gPrmCriteriaId === 10){
            displayPieSMEngineComp();
        }
        else if(gPrmCriteriaId === 10){
            displayPieSMEngineComp();
        }
        else if(gPrmCriteriaId === 38){
            displayPiePVCEngineComp();
        }
        else if(gPrmCriteriaId === 41){
            displayPieNewTechWireConductor();
        }
        else if(gPrmCriteriaId === 14){
            displayPieTwoWayConnector();
        }
    }
    if(callback) callback();
}

function displayColumnChart(callback){
    if(gData.length > 0){
        
        if(gPrmCriteriaId === 7){ 
            displayColumnSmallWires();
        }
        else if(gPrmCriteriaId === 8){
            displayColumnNewWireSizes();
        }
        else if(gPrmCriteriaId === 9){
            displayColumnSMHighFlex();
        }
        else if(gPrmCriteriaId === 10){
            displayColumnSMEngineComp();
        }
        else if(gPrmCriteriaId === 38){
            displayColumnPVCEngineComp();
        }
        else if(gPrmCriteriaId === 41){
            displayColumnNewTechWireConductor();
        }
        else if(gPrmCriteriaId === 14){
            displayColumnTwoWayConnector();
        }
    }
    
    if(callback) callback();
}

//--------------------------------- PIE CHART --------------------------------//

function displayPieSmallWires(){
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
    
    var container = am4core.create("chartMY_" + gPrmCriteriaId, am4core.Container);
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
    
        chart.legend = new am4charts.Legend();
        //chart.legend.height = 50;
        chart.legend.labels.template.fontSize = 12;
        chart.legend.valueLabels.template.fontSize = 12;
        chart.legend.itemContainers.template.paddingTop = 1;
        chart.legend.itemContainers.template.paddingBottom = 1;
        //chart.legend.labels.template.truncate = false;
        //chart.legend.labels.template.wrap = true;
        //chart.legend.itemContainers.template.paddingRight = 0;
        //chart.legend.itemContainers.template.paddingLeft = 0;
        
        var markerTemplate = chart.legend.markers.template;
        markerTemplate.width = 12;
        markerTemplate.height = 12;
        
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
        
        // pieSeries.labels.template.adapter.add("relativeRotation", function(relativeRotation, target) {
        //     if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
        //         return 90;
        //     }
        //     return relativeRotation;
        // });
        
        pieSeries.labels.template.adapter.add("radius", function(radius, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return 0;
            }
            return radius;
        });
        
        pieSeries.labels.template.adapter.add("fill", function(color, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return am4core.color("#000");
            }
            return color;
        });
    };

    $.each(gModelYears, function(i, v){
        var _my = v.name;
        var _res = _data.filter(function (item) {
        	return item.model_year == _my;
        });
        
        _createChart(_res, _my);
    });
}

function displayPieNewWireSizes(){
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
    
        chart.legend = new am4charts.Legend();
        chart.legend.labels.template.fontSize = 12;
        chart.legend.valueLabels.template.fontSize = 12;
        chart.legend.itemContainers.template.paddingTop = 1;
        chart.legend.itemContainers.template.paddingBottom = 1;
        
        var markerTemplate = chart.legend.markers.template;
        markerTemplate.width = 12;
        markerTemplate.height = 12;
        
        pieSeries.labels.template.adapter.add("radius", function(radius, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return 0;
            }
            return radius;
        });
        
        pieSeries.labels.template.adapter.add("fill", function(color, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return am4core.color("#000");
            }
            return color;
        });
    };

    $.each(gModelYears, function(i, v){
        var _my = v.name;
        var _res = _data.filter(function (item) {
        	return item.model_year == _my;
        });

        _createChart(_res, _my);
    });
}

function displayPieSMHighFlex(){
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
    
        chart.legend = new am4charts.Legend();
        chart.legend.labels.template.fontSize = 12;
        chart.legend.valueLabels.template.fontSize = 12;
        chart.legend.itemContainers.template.paddingTop = 1;
        chart.legend.itemContainers.template.paddingBottom = 1;
        
        var markerTemplate = chart.legend.markers.template;
        markerTemplate.width = 12;
        markerTemplate.height = 12;
        
        pieSeries.labels.template.adapter.add("radius", function(radius, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return 0;
            }
            return radius;
        });
        
        pieSeries.labels.template.adapter.add("fill", function(color, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return am4core.color("#000");
            }
            return color;
        });
    };

    $.each(gModelYears, function(i, v){
        var _my = v.name;
        var _res = _data.filter(function (item) {
        	return item.model_year == _my;
        });

        _createChart(_res, _my);
    });
}

function displayPieSMEngineComp(){
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
    
        chart.legend = new am4charts.Legend();
        chart.legend.labels.template.fontSize = 12;
        chart.legend.valueLabels.template.fontSize = 12;
        chart.legend.itemContainers.template.paddingTop = 1;
        chart.legend.itemContainers.template.paddingBottom = 1;
        
        var markerTemplate = chart.legend.markers.template;
        markerTemplate.width = 12;
        markerTemplate.height = 12;
        
        pieSeries.labels.template.adapter.add("radius", function(radius, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return 0;
            }
            return radius;
        });
        
        pieSeries.labels.template.adapter.add("fill", function(color, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return am4core.color("#000");
            }
            return color;
        });
    };

    $.each(gModelYears, function(i, v){
        var _my = v.name;
        var _res = _data.filter(function (item) {
        	return item.model_year == _my;
        });

        _createChart(_res, _my);
    });
}

function displayPiePVCEngineComp(){
    var _data = [];
    $.each(gModelYears, function(x, my) { 
        var _my = my.name;
        
        $.each(gData.groupBy(["WireInsulation"]), function(y, w) { 
            var _count = 0;
            var _harness = w.name;
            var _res = w.items.filter(function (item) {
            	return item.WireInsulation == _harness && item.MODEL_YEAR == _my;
            });
      
            _count = _res.reduce(function (accumulator, currentValue) {
                return accumulator + currentValue.wire_count;
            }, 0);
            
            _data.push({
                model_year: +_my,
                harness_name: _harness,
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
        pieSeries.dataFields.category = "harness_name";
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
    
        chart.legend = new am4charts.Legend();
        chart.legend.labels.template.fontSize = 12;
        chart.legend.valueLabels.template.fontSize = 12;
        chart.legend.itemContainers.template.paddingTop = 1;
        chart.legend.itemContainers.template.paddingBottom = 1;
        
        var markerTemplate = chart.legend.markers.template;
        markerTemplate.width = 12;
        markerTemplate.height = 12;
        
        pieSeries.labels.template.adapter.add("radius", function(radius, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return 0;
            }
            return radius;
        });
        
        pieSeries.labels.template.adapter.add("fill", function(color, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return am4core.color("#000");
            }
            return color;
        });
    };

    $.each(gModelYears, function(i, v){
        var _my = v.name;
        var _res = _data.filter(function (item) {
        	return item.model_year == _my;
        });

        _createChart(_res, _my);
    });
}

function displayPieNewTechWireConductor(){
    var _data = [];
    $.each(gModelYears, function(x, my) {
        $.each(gData.groupBy(["REGION_NAME"]), function(y, r) { 
            var _count = 0;
            var _my = my.name;
            var _region = r.name;
            var _res = r.items.filter(function (item) {
            	return item.REGION_NAME == _region && item.MODEL_YEAR == _my;
            });
      
            _count = _res.reduce(function (accumulator, currentValue) {
                return accumulator + currentValue.wire_count;
            }, 0);
            
            _data.push({
                model_year: +_my,
                region_name: _region,
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
        pieSeries.dataFields.category = "region_name";
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
    
        chart.legend = new am4charts.Legend();
        chart.legend.labels.template.fontSize = 12;
        chart.legend.valueLabels.template.fontSize = 12;
        chart.legend.itemContainers.template.paddingTop = 1;
        chart.legend.itemContainers.template.paddingBottom = 1;
        
        var markerTemplate = chart.legend.markers.template;
        markerTemplate.width = 12;
        markerTemplate.height = 12;
        
        pieSeries.labels.template.adapter.add("radius", function(radius, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return 0;
            }
            return radius;
        });
        
        pieSeries.labels.template.adapter.add("fill", function(color, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return am4core.color("#000");
            }
            return color;
        });
    };

    $.each(gModelYears, function(i, v){
        var _my = v.name;
        var _res = _data.filter(function (item) {
        	return item.model_year == _my;
        });

        _createChart(_res, _my);
    });
}

function displayPieTwoWayConnector(){
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
    
        chart.legend = new am4charts.Legend();
        chart.legend.labels.template.fontSize = 12;
        chart.legend.valueLabels.template.fontSize = 12;
        chart.legend.itemContainers.template.paddingTop = 1;
        chart.legend.itemContainers.template.paddingBottom = 1;
        
        var markerTemplate = chart.legend.markers.template;
        markerTemplate.width = 12;
        markerTemplate.height = 12;
        
        pieSeries.labels.template.adapter.add("radius", function(radius, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return 0;
            }
            return radius;
        });
        
        pieSeries.labels.template.adapter.add("fill", function(color, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return am4core.color("#000");
            }
            return color;
        });
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

function displayColumnSmallWires(){
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
        
    var chart = am4core.create("chartRegion_" + gPrmCriteriaId, am4charts.XYChart);
    chart.data = _data;
    chart.colors.step = 2;
    chart.padding(30, 30, 10, 30);

    var title = chart.titles.create();
    title.text =  "Overall Usage";
    title.fontSize = 12;
    title.fontWeight = 800;
    title.marginBottom = 10;
    
    chart.legend = new am4charts.Legend();
    chart.legend.itemContainers.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;
    chart.numberFormatter.numberFormat = "#";
    
    var markerTemplate = chart.legend.markers.template;
        markerTemplate.width = 18;
        markerTemplate.height = 18;
    
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
    setTrendResult(_data);
    
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

function displayColumnNewWireSizes(){
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
                    return accumulator + currentValue.wire_count;
                }, 0);

                _obj[_wireNew] = _count;
            });
            _data.push(_obj);
        });
    });

    var chart = am4core.create("chartRegion_" + gPrmCriteriaId, am4charts.XYChart);
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
    chart.legend = new am4charts.Legend();
    
    setLegendSize(chart);
    
    setWireTrend(_data);
}

function displayColumnSMHighFlex(){
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
    
    var chart = am4core.create("chartRegion_" + gPrmCriteriaId, am4charts.XYChart);
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
    chart.legend = new am4charts.Legend();
    
    setLegendSize(chart);
    
    setWireTrend(_data);
}

function displayColumnSMEngineComp(){
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
                    return accumulator + currentValue.wire_count;
                }, 0);

                _obj[_wireNew] = _count;
            });
            _data.push(_obj);
        });
    });
    
    var chart = am4core.create("chartRegion_" + gPrmCriteriaId, am4charts.XYChart);
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
    chart.legend = new am4charts.Legend();
    
    setLegendSize(chart);
    
    setWireTrend(_data);
}

function displayColumnPVCEngineComp(){
    console.log(gPrmCriteriaId);
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
                var _harness = w.name;
                var _harnessNew = _harness.replace(".","_");
                var _res = r.items.filter(function (item) {
                	return item.WireInsulation == _harness && item.MODEL_YEAR == _my;
                });
                
                _count = _res.reduce(function (accumulator, currentValue) {
                    return accumulator + currentValue.wire_count;
                }, 0);

                _obj[_harnessNew] = _count;
            });
            _data.push(_obj);
        });
    });
    
    var chart = am4core.create("chartRegion_" + gPrmCriteriaId, am4charts.XYChart);
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
    //valueAxis.max = 100;
    //valueAxis.strictMinMax = true;
    //valueAxis.calculateTotals = true;
    // valueAxis.renderer.labels.template.adapter.add("text", function(text) {
    //   return text + "%";
    // });
    
    // Create series
    var _createSeries = function(field, name) {
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.valueY = field;
        //series.dataFields.valueYShow = "totalPercent";
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
        var _harness = w.name;
        var _field = _harness.replace(".","_");
        
        _createSeries(_field, _harness);
    });  
    
    $.each(gRegionNames, function(i, r) { 
        var _region = "("+ r.name +")";
        
        _createLabel(gMYFrom + _region, gMYTo + _region, r.name);
    });
    
    //Add cursor
    chart.cursor = new am4charts.XYCursor();
    
    //Add legend
    chart.legend = new am4charts.Legend();
    
    setLegendSize(chart);
    
    var _trend = "";
    var lastObj = _data[_data.length - 1];
    $.each(lastObj, function(k, v){
        var _key = $.trim(k).toLowerCase();
        if( _key.indexOf("harness") > -1 && v !== 0){
            _trend += k + '<br>';
        }
    });
    
    var _tw = new zsi.easyJsTemplateWriter("#chartBody_" + gPrmCriteriaId)
            .out().trendResult({ trend: _trend });
}

function displayColumnNewTechWireConductor(){
    var _data = [];
    $.each(gData.groupBy(["REGION_NAME"]), function(i,r) { 
        var _obj = {};
        $.each(gModelYears, function(x, my) { 
            var _my = my.name;
            var _region = r.name;
            var _count = 0;
            
            var _res = r.items.filter(function (item) {
            	return item.MODEL_YEAR == _my;
            });
            
            _count = _res.reduce(function (accumulator, currentValue) {
                return accumulator + currentValue.wire_count;
            }, 0);
        
            _obj[_my] = _count;
            _obj.category = _region;
        });
        
        _data.push(_obj);
    });
    
    var chart = am4core.create("chartRegion_" + gPrmCriteriaId, am4charts.XYChart);
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
    
    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = "Count";
    valueAxis.min = 0;
    valueAxis.max = 100;
    valueAxis.strictMinMax = true;
    valueAxis.calculateTotals = true;
    valueAxis.renderer.labels.template.adapter.add("text", function(text) {
      return text + "%";
    });
    
    
    var _createSeries = function(field){
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.columns.template.width = am4core.percent(80);
        series.tooltipText = "[bold]{name}:[/] {valueY.totalPercent.formatNumber('#.00')}% - [bold]{valueY.formatNumber('#,###')}[/]";
        //series.columns.template.tooltipText = "{name}: {valueY.value}";
        series.name = field;
        series.dataFields.categoryX = "category";
        series.dataFields.valueY = field;
        series.dataFields.valueYShow = "totalPercent";
        series.stacked = false;
    };
   
    $.each(gModelYears, function(i, v){
        _createSeries(v.name);
    });
    
    //Add cursor
    chart.cursor = new am4charts.XYCursor();
    
    //Add legend
    chart.legend = new am4charts.Legend();
    
    setWireTrend(_data);
}

function displayColumnTwoWayConnector(){
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
    
    var chart = am4core.create("chartRegion_" + gPrmCriteriaId, am4charts.XYChart);
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
    chart.legend = new am4charts.Legend();
    
    setLegendSize(chart);
    setWireTrend(_data);
}

function setWireTrend(data){
    if(data.length > 0){
        var _trend = "";
        var lastObj = data[data.length - 1];
        $.each(lastObj, function(k, v){
            var _key = k.replace("_",".");
            if($.isNumeric( _key ) && v !== 0){
                _trend += _key + '<br>';
            }
        });
        
        var _tw = new zsi.easyJsTemplateWriter("#chartBody_" + gPrmCriteriaId)
                .out().trendResult({ trend: _trend });
    }
}

// ******************************** END CHART ********************************//

function displayChart(o){
    if(o.length > 0){
        var _parentCid = o[0].pcriteria_id;
        var _chartCon = "#chart_container_" + _parentCid;
        var _tw = new zsi.easyJsTemplateWriter(_chartCon).new();
        
        var ctr = 0;
        var _callBack = function(){
             
            ctr++;
            
            // if(o.length === ctr){
            //     return false;
            // }else{
               
            // }
        }; 
         
        var _createChart = function(criteriaId, callback){
            gPrmCriteriaId = criteriaId;
            gtw = new zsi.easyJsTemplateWriter("#chartBody_" + criteriaId).new();
            
            
            //console.log("criteriaId", criteriaId);
                
                //if(criteriaId === 7){
                    
                    // getAllWires(function(){
                    //     setMYRange();
    
                    //     displayChartWireSummary(function(){
                    //         displayChartSmallWires(function(){
                                
                    //             //console.log(gtw.html());
                    //             callback();
                    //             console.log("out");
                    //         });
                    //     }); 
                        
                        // setTimeout(function(){
                        //     getSmallWires(function(){ 
                        //         displayChartSmallWiresDtl(function(){
                        //             console.log("test");
                                    
                        //         });
                                
                        //         setTimeout(function(){
                        //             getSmallWiresDtl(function(){
                        //                 displayChartSmallWiresSubDtl();
                        //             });
                        //         }, 2500); 
                                
                        //     });
                        // }, 2500); 
                    //});
               
                //}else if(criteriaId == 12){
                //     displayNewWireTech(function(){
                //         callback(criteriaId);
                //         console.log("tech");
                //     });
                //}else{
                    //console.log("else");
                //    callback();
                //}
        };

        //if(o.length != ctr){
            $.each(o, function(i, v){
                var _criteriaId = v.criteria_id;
                var _criteriaTitle = v.criteria_title;
                
                _tw.chart({
                    card_id: _criteriaId,
                    header_title: _criteriaTitle,
                    //header_class: "criteriaId_" + _criteriaId,
                    body_id: "chartBody_" + _criteriaId
                });

                _createChart(_criteriaId);
            });
        //}
    }
}

function filterChart(){
    gPrmNoYears = "";
    gPrmIncludeCYear = "";
    gPrmChartType = "";
    
    gPrmNoYears = $("#no_of_years").val();
    gPrmIncludeCYear = ( $('#include_cyear').is(":checked") ? "Y" : "N" );  
    gPrmChartType = $.trim($("#chart_type").val());
    gPrmChartType = (gPrmChartType.indexOf("Choose") > -1 ? "" : gPrmChartType);
    
    if(gPrmIncludeCYear==="Y" && gPrmNoYears===""){
        alert("Please enter no. of years.");
    }else{
        $("#chart_container").empty();
        
        displayChart();
    }
}

function getDataAll(callback){
    getData({
        byRegion: "Y",
        byModelYear: "Y",
        criterieId: gPrmCriteriaId,
        //reportTypeId: gPrmReportTypeId
    }, function(all){
        gAll = all;

        gRegionNames = all.groupBy(["REGION_NAME"]);
        gModelYears = all.groupBy(["MODEL_YEAR"]);

        if(callback) callback(all);
    });
}

// function getDataByRegion(callback){
//     getData({
//         byRegion: "Y",
//         byModelYear: "N",
//         criterieId: gPrmCriteriaId,
//         reportTypeId: gPrmReportTypeId
//     }, function(region){
//         gByRegion = region;
        
//         if(callback) callback(region);
//     });
// } 

// function getDataByModelYear(callback){
//     getData({
//         byRegion: "N",
//         byModelYear: "Y",
//         criterieId: gPrmCriteriaId,
//         reportTypeId: gPrmReportTypeId
//     }, function(model_year){
//         gByModelYear = model_year;
        
//         if(callback) callback(model_year);
//     });
// }

function getAllWires(callback){
    gPrmReportTypeId = 1;
    
    getDataAll(function(){
        //getDataByRegion(function(){
            // gByModelYear = [];
            // gAll.groupBy(["MODEL_YEAR"]).forEach(function(v){
            //     var obj = {};
            //     var totalWires = 0;
            //     var totalBigWires = 0;
            //     var totalSmallWires = 0;
               
            //     v.items.forEach(function(item){
            //         totalBigWires += item.total_big_wires;
            //         totalSmallWires += item.total_small_wires;
            //     }); 
            //     totalWires = totalSmallWires + totalBigWires;
               
            //     obj.MODEL_YEAR = +v.name;
            //     obj.total_big_wires = totalBigWires;
            //     obj.total_small_wires = totalSmallWires;
            //     obj.total_wire_count = totalWires;
                
            //     gByModelYear.push(obj);
            // });
            
            // gByRegion = [];
            // gAll.groupBy(["REGION_NAME"]).forEach(function(v){
            //     var obj = {};
            //     var totalWires = 0;
            //     var totalBigWires = 0;
            //     var totalSmallWires = 0;
               
            //     v.items.forEach(function(item){
            //         totalBigWires += item.total_big_wires;
            //         totalSmallWires += item.total_small_wires;
            //     }); 
            //     totalWires = totalSmallWires + totalBigWires;
               
            //     obj.REGION_NAME = v.name;
            //     obj.total_big_wires = totalBigWires;
            //     obj.total_small_wires = totalSmallWires;
            //     obj.total_wire_count = totalWires;
                
            //     gByRegion.push(obj);
            // });
            console.log("gByModelYear", gByModelYear);
            console.log("gByRegion", gByRegion);
            //getDataByModelYear(function(){
                if(callback) callback();
            //});
        //});
    });
}

// function getSmallWires(callback){
//     gPrmReportTypeId = 2;
    
//     getDataAll(function(){
//         getDataByRegion(function(){
//             getDataByModelYear(function(){
//                 if(callback) callback();
//             });
//         });
//     });
// }

// function getSmallWiresDtl(callback){
//     gPrmReportTypeId = 4;
    
//     getDataAll(function(){
//         getDataByRegion(function(){
//             getDataByModelYear(function(){
//                 if(callback) callback();
//             });
//         });
//     });
// }

function displayChartWireSummary(cb){
    gtw.chartDiv({ 
        id:"chartWireSummary", 
        title:"Summary", 
        by_model_year_id: "chartWireSummaryByMY",
        by_region_id: "chartWireSummaryByRegion",
        each_model_year_id: "chartWireSummaryEachMY",
        each_region_id: "chartWireSummaryEachRegion",
        div_header_id: "chartWireSummaryAll",
        div_header_class: "chart-div border-dark",
        div_middle_id: "chartTrendResult"
    });
    
    displayWireSummaryAll();
    
    if( gPrmChartType==="Pie Chart" ){
        $("#chartWireSummaryByMY, #chartWireSummaryByRegion").removeClass();
        displayWireSummaryByMYPie(function(){
            displayWireSummaryByRegionPie(function(){
                displayWireSummaryEachMYPie(function(){
                    displayWireSummaryEachRegionPie(function(){
                        cb();
                    });
                });
            });
        });
    }else{
        displayWireSummaryByMYBar(function(){
            displayWireSummaryByRegionBar(function(){
                cb();
                //displayWireSummaryEachMYBar(function(){
                //    displayWireSummaryEachRegionBar();
                //});
            });
        });
    }
}

function displayChartSmallWires(cb){
    gtw.chartDiv({ 
        id:"chartSmallWire", 
        title:"Details", 
        by_model_year_id: "chartSWByMY",
        by_region_id: "chartSWByRegion",
        each_model_year_id: "chartSWEachMY",
        each_region_id: "chartSWEachRegion",
        div_header_id: "chartSWAllBar",
        div_header_class: "chart-div border-dark",
        div_footer_id: "footerSWAll"
    });
    
    displaySWAll();
    
    if( gPrmChartType==="Pie Chart" ){
        displaySWByModelYearPie(function(){
            displaySWByRegionPie(function(){
                displaySWAll(function(){
                    displaySWEachModelYearPie(function(){
                        displaySWEachRegionPie(function(){
                            cb();
                        });
                    });
                });
            });
        });
    }else{
        displaySWByModelYearBar(function(){
            displaySWByRegionBar(function(){
                cb();
                //displaySWAll(function(){
                    //displaySWEachModelYearBar(function(){
                    //    displaySWEachRegionBar();
                    //});
                //});
            });
        });
    }
}

function displayChartSmallWiresDtl(){
    gtw.chartDiv({ 
        id:"chartSWDtl", 
        title:"Summary", 
        title_class: "",
        by_model_year_id: "chartSWDtlByMY",
        by_region_id: "chartSWDtlByRegion",
        each_model_year_id: "chartSWDtlEachMY",
        each_region_id: "chartSWDtlEachRegion",
        div_header_id: "chartSWDtlAll",
        div_header_class: "chart-div border-dark",
    });
    
    displaySWDtlAll();
    
    displaySWDtlByMY(function(){
        displaySWDtlByRegion(function(){
            if( gPrmChartType==="Pie Chart" ){
                displaySWDtlEachMYPie(function(){
                    displaySWDtlEachRegionPie();
                });
            }else{
                //displaySWDtlEachMYBar(function(){
                //    displaySWDtlEachRegionBar();
                //});
            }
        }); 
    });
}

function displayChartSmallWiresSubDtl(){
    
    function createTmpl(harness, name){
        gtw.chartDiv({ 
            id:"chartSWSubDtl" + harness, 
            title:"Summary", //+ name, 
            title_class: "",
            by_model_year_id: "chartSWSubDtlByMY" + harness,
            by_region_id: "chartSWSubDtlByRegion" + harness,
            sub_title_class: "d-none",
            each_model_year_id: "chartSWSubDtlEachMY" + harness,
            each_region_id: "chartSWSubDtlEachRegion" + harness
        });
        
        displaySWSubDtlByMY(function(){
            displaySWSubDtlByRegion(function(){
                if( gPrmChartType==="Pie Chart" ){
                    displaySWSubDtlEachMYPie(function(){
                        displaySWSubDtlEachRegionPie();
                    });
                }else{
                    displaySWSubDtlEachMYBar(function(){
                        displaySWSubDtlEachRegionBar();
                    });
                }
            }); 
        });
    }
    
    if(gAll.length > 0){
        if(typeof(gAll[0].HARNESS_NAME) !== ud) {
            var _harness = "_" + gAll[0].HARNESS_NAME.replace(/[^A-Z0-9]+/ig, "_");//replace(/\s+/g, '_');
            gHarnessName = _harness;
            //console.log(_harness);
            createTmpl(_harness, " of " + gAll[0].HARNESS_NAME);
            
            // gAll.groupBy(["HARNESS_NAME"]).forEach(function(v){
            //     var _harness = "_" + v.name.replace(/[^A-Z0-9]+/ig, "_");//replace(/\s+/g, '_');
            //     gHarnessName = _harness;
            //     console.log(_harness);
            //     //createTmpl(_harness, " of " + v.name);
            // });
            
        }else{
            //gHarnessName = "";
            //createTmpl("","");
        }
    }
    
}

function setLegendSize(chart){
    var markerTemplate = chart.legend.markers.template;
        markerTemplate.width = 20;
        markerTemplate.height = 20;
}

function setTrendResult(o){
    if(o.length > 0){
        var lastObj = o[o.length - 1];
        var secondObj = o[o.length - 2];
        
        var result = "";
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
                result += "% of Below 0.50 - " + inc;
            }else{
                result += "% of Below 0.50 - " + dec;
            }
            
            result += "<br>";
            
            if(lastValBW > secondValBW) {
                result += "% of Above 0.50 - " + inc;
            }else{
                result += "% of Above 0.50 - " + dec;
            }
        }
        
        // var _tw = new zsi.easyJsTemplateWriter().new()
        //     .trendResult({ trend: result });
        
        var _tw = new zsi.easyJsTemplateWriter("#chartBody_" + gPrmCriteriaId)
            .out().trendResult({ trend: result });
    }
}

function setMYRange(){
    if(gModelYears.length > 0){
        var _from = gModelYears[0].name;
        var _to = _from;
        
        if(gModelYears.length > 1){
            _to = gModelYears[gModelYears.length - 1].name;
            
            gMYRange = "MY" + _from + " - MY" + _to;
        }else{
            gMYRange = "MY" + _from;
        } 
        
        gMYFrom = _from;
        gMYTo = _to;
    }
    $("#chart_range").html(gMYRange);
}

// ---------------------- All Wires --------------------------//
function displayWireSummaryAll(callback){
    var _data = [];
    $.each(gAll.groupBy(["REGION_NAME"]), function(i, r) { 
        $.each(gModelYears, function(x, my) {
            var _region = r.name;
            var _my = my.name;
            var _big = 0; //Big Wires
            var _small = 0; //Small Wires
            var _res = r.items.filter(function (item) {
            	return item.MODEL_YEAR == _my;
            });

            if( _res.length > 0 ) {
                _big = _res[0].total_big_wires;
                _small = _res[0].total_small_wires;
            }
            
            _data.push({
                REGION_NAME : _region,
                MODEL_YEAR : +_my,
                category : _my +"("+ _region +")",
                total_big_wires :  +_big,
                total_small_wires :  +_small
            });
        });
    });
    
    var chart = am4core.create("chartWireSummaryAll", am4charts.XYChart);
    chart.data = _data;
    chart.colors.step = 2;
    chart.padding(30, 30, 10, 30);

    var title = chart.titles.create();
    title.text =  "Overall Usage";
    title.fontSize = 12;
    title.fontWeight = 800;
    title.marginBottom = 10;
    
    chart.legend = new am4charts.Legend();
    chart.legend.itemContainers.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;
    chart.numberFormatter.numberFormat = "#";
    
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
    //setTrendResult(_data);
    
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
    
    if(callback) callback();
}

function displayWireSummaryByMYBar(callback){
    var _data = gByModelYear;
    var chart = am4core.create("chartWireSummaryByMY", am4charts.XYChart);
    chart.data = _data;
    chart.colors.step = 2;
    chart.padding(30, 30, 10, 30);

    var title = chart.titles.create();
    title.text =  "Usage per Model year";
    title.fontSize = 12;
    title.fontWeight = 800;
    title.marginBottom = 10;
    
    chart.legend = new am4charts.Legend();
    chart.legend.itemContainers.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;
    chart.numberFormatter.numberFormat = "#";
    
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "MODEL_YEAR";
    //categoryAxis.title.text = "Wire Category";
    //categoryAxis.title.fontWeight = 800;
    categoryAxis.renderer.minGridDistance = 60;
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.interactionsEnabled = false;
    
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
    series1.dataFields.categoryX = "MODEL_YEAR";
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
    setTrendResult(_data);
    
    if(callback) callback();
}

function displayWireSummaryByMYPie(callback){
    gByModelYear.forEach(function(o){
        var _result = [];
        var _year = o.MODEL_YEAR;
        var _div = "chartWireSummaryByMY_" + _year;
        var _tw = new zsi.easyJsTemplateWriter("#chartWireSummaryByMY")
                .chartCard({ id: _div, title: _year, class:"w-100", header:"text-dark d-none" });
    
        _result.push({
            wire_size: "% of Below 0.50",
            total: o.total_small_wires
        }); 
        
        _result.push({
            wire_size: "% of Above 0.50",
            total:  o.total_big_wires
        });
        
        var chart = am4core.create(_div, am4charts.PieChart3D);
        chart.data = _result;
        
        var title = chart.titles.create();
        title.text =  _year;
        //title.fontSize = 12;
        title.fontWeight = 800;
        title.marginBottom = 0;
    
        var series = chart.series.push(new am4charts.PieSeries());
        series.dataFields.value = "total";
        series.dataFields.category = "wire_size";
        
        series.labels.template.disabled = true;
        series.ticks.template.disabled = true;
        
        // this creates initial animation
        series.hiddenState.properties.opacity = 1;
        series.hiddenState.properties.endAngle = -90;
        series.hiddenState.properties.startAngle = -90;
        
        chart.legend = new am4charts.Legend();
        chart.legend.position = "right";
        
        setLegendSize(chart);
    });
    
    setTrendResult(gByModelYear);
    
    if(callback) callback();
}

function displayWireSummaryByRegionBar(callback){
    var data = gByRegion;
    var chart = am4core.create("chartWireSummaryByRegion", am4charts.XYChart);
    chart.data = data;
    chart.colors.step = 2;
    chart.padding(30, 30, 10, 30);

    var title = chart.titles.create();
    title.text =  "Usage per Region";
    title.fontSize = 12;
    title.fontWeight = 800;
    title.marginBottom = 10;
    
    chart.legend = new am4charts.Legend();
    chart.legend.itemContainers.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;
    chart.numberFormatter.numberFormat = "#";
    
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "REGION_NAME";
    categoryAxis.renderer.minGridDistance = 60;
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.interactionsEnabled = false;
    
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
    series1.dataFields.categoryX = "REGION_NAME";
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
    
    if(callback) callback();  
}

function displayWireSummaryByRegionPie(callback){
    gByRegion.forEach(function(o){
        var _result = [];
        var _region = o.REGION_NAME;
        var _regionId = _region.split(" ").join("_");
        var _div = "chartWireSummaryByRegion_" + _regionId;
        var _tw = new zsi.easyJsTemplateWriter("#chartWireSummaryByRegion")
            .chartCard({ id: _div, title: _region, class:"w-100", header:"text-dark d-none" });
    
        _result.push({
            wire_size: "% of Below 0.50",
            total: o.total_small_wires
        }); 
        
        _result.push({
            wire_size: "% of Above 0.50",
            total:  o.total_big_wires
        });
        
        var chart = am4core.create(_div, am4charts.PieChart3D);
        chart.data = _result;
        
        var title = chart.titles.create();
        title.text =  _region;
        //title.fontSize = 12;
        title.fontWeight = 800;
        title.marginBottom = 0;
    
        var series = chart.series.push(new am4charts.PieSeries());
        series.dataFields.value = "total";
        series.dataFields.category = "wire_size";
        
        series.labels.template.disabled = true;
        series.ticks.template.disabled = true;
        
        // this creates initial animation
        series.hiddenState.properties.opacity = 1;
        series.hiddenState.properties.endAngle = -90;
        series.hiddenState.properties.startAngle = -90;
        
        chart.legend = new am4charts.Legend();
        chart.legend.position = "right";
        
        setLegendSize(chart);
    });
    
    if(callback) callback();
}

function displayWireSummaryEachMYBar(callback){
    gByModelYear.forEach(function(o){
        var result = [];
        var year = o.MODEL_YEAR;
        var divID = "chartWireSummaryEachMY_"+ year;
        var _tw = new zsi.easyJsTemplateWriter("#chartWireSummaryEachMY")
            .chartCard({ id: divID, title: year, class:"w-100 chart-div", header:"text-dark" });
        
        var res = gAll.filter(function (item) {
        	return item.MODEL_YEAR == year;
        });
      
        gByRegion.forEach(function(i){
            var jsonData = {};
            var region = i.REGION_NAME;
            var regionName = region.split(' ').join('_');
            var res2= res.filter(function (item) {
        	    return item.REGION_NAME == region;
            });
           
            jsonData.model_year = year;
            jsonData.region_name = region;
            
            if( res2.length > 0 ){
                jsonData.total_big_wires = res2[0].total_big_wires;
                jsonData.total_small_wires = res2[0].total_small_wires;
            }else{
                jsonData.total_big_wires = 0;
                jsonData.total_small_wires = 0;
            }

            result.push(jsonData);
        });

        var chart = am4core.create(divID, am4charts.XYChart);
        chart.data = result;
      
        chart.colors.step = 2;
        chart.padding(30, 30, 10, 30);
        
        chart.legend = new am4charts.Legend();
        chart.legend.itemContainers.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;
        chart.numberFormatter.numberFormat = "#";
        
        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "region_name";
        //categoryAxis.title.text = "Wire Category";
        //categoryAxis.title.fontWeight = 800;
        categoryAxis.renderer.minGridDistance = 60;
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.interactionsEnabled = false;
        
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
        series1.dataFields.categoryX = "region_name";
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
    });
    
    if(callback) callback();  
}

function displayWireSummaryEachMYPie(callback){
    gByModelYear.forEach(function(o){
        
        var year = o.MODEL_YEAR;
        var divParent = "chartWireSummaryEachMY_" + year;
        var _tw = new zsi.easyJsTemplateWriter("#chartWireSummaryEachMY")
                .chartCard({ id: divParent, title: year, class:"w-100", header:"text-dark" });
        
        gByRegion.forEach(function(i){
            var result = [];
            var region = i.REGION_NAME;
            var regionId = region.split(' ').join('_');
             var divChild = divParent + "_" + regionId;
            
            _tw = new zsi.easyJsTemplateWriter("#" + divParent)
                .div({ class: "col-6"})
                .in()
                    .chartCard({ id: divChild, title: region, class:"w-100", header:"d-none" });
            
            var res = gAll.filter(function (item) {
            	return item.MODEL_YEAR == year && item.REGION_NAME == region;
            });
            
            var total_big_wires = 0;
            var total_small_wires = 0;
            
            if( res.length > 0 ) {
                total_big_wires = res[0].total_big_wires;
                total_small_wires = res[0].total_small_wires;
            }
            
            result.push({
                wire_size: "% of Below 0.50",
                total: total_small_wires
            }); 
            
            result.push({
                wire_size: "% of Above 0.50",
                total: total_big_wires
            });
            
            var chart = am4core.create(divChild, am4charts.PieChart3D);
            chart.data = result;
            
            var title = chart.titles.create();
            title.text =  region;
            //title.fontSize = 12;
            title.fontWeight = 800;
            title.marginBottom = 0;
        
            var series = chart.series.push(new am4charts.PieSeries());
            series.dataFields.value = "total";
            series.dataFields.category = "wire_size";
            
            series.labels.template.disabled = true;
            series.ticks.template.disabled = true;
            
            // this creates initial animation
            series.hiddenState.properties.opacity = 1;
            series.hiddenState.properties.endAngle = -90;
            series.hiddenState.properties.startAngle = -90;
            
            chart.legend = new am4charts.Legend();
            chart.legend.position = "right";
            
            setLegendSize(chart);
        });
    });
    
    if(callback) callback();  
}

function displayWireSummaryEachRegionBar(callback){
    gByRegion.forEach(function(o){
        var result = [];
        var region = o.REGION_NAME;
        var regionName = region.split(' ').join('_');
        var divID = "chartWireSummaryEachRegion_"+ regionName;
        var _tw = new zsi.easyJsTemplateWriter("#chartWireSummaryEachRegion")
            .chartCard({ id: divID, title: region, class:"w-100 chart-div", header:"text-dark" });
        
        var res = gAll.filter(function (item) {
        	return item.REGION_NAME == region;
        });
      
        gByModelYear.forEach(function(i){
            var jsonData = {};
            var year = i.MODEL_YEAR;
            var res2= res.filter(function (item) {
        	    return item.MODEL_YEAR == year;
            });
           
            jsonData.model_year = year;
            jsonData.region_name = region;
            
            if( res2.length > 0 ){
                jsonData.total_big_wires = res2[0].total_big_wires;
                jsonData.total_small_wires = res2[0].total_small_wires;
            }else{
                jsonData.total_big_wires = 0;
                jsonData.total_small_wires = 0;
            }

            result.push(jsonData);
        });

        var chart = am4core.create(divID, am4charts.XYChart);
        chart.data = result;
      
        chart.colors.step = 2;
        chart.padding(30, 30, 10, 30);
        
        chart.legend = new am4charts.Legend();
        chart.legend.itemContainers.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;
        chart.numberFormatter.numberFormat = "#";
        
        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "model_year";
        //categoryAxis.title.text = "Wire Category";
        //categoryAxis.title.fontWeight = 800;
        categoryAxis.renderer.minGridDistance = 60;
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.interactionsEnabled = false;
        
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
        series1.dataFields.categoryX = "model_year";
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
    });
    
    if(callback) callback();  
}

function displayWireSummaryEachRegionPie(callback){
    gByRegion.forEach(function(o){
        var region = o.REGION_NAME;
        var regionId = region.split(' ').join('_');
        var divParent = "chartWireSummaryEachRegion_" + regionId;
        var _tw = new zsi.easyJsTemplateWriter("#chartWireSummaryEachRegion")
            .chartCard({ id: divParent, title: region, class:"w-100", header:"text-dark" });
        
        gByModelYear.forEach(function(i){
            var result = [];
            var year = i.MODEL_YEAR;
            var divChild = divParent + "_" + year;
            
            _tw = new zsi.easyJsTemplateWriter("#" + divParent)
                .div({ class: "col-6"})
                .in()
                    .chartCard({ id: divChild, title: year, class:"w-100", header:"d-none" });
            
            var res = gAll.filter(function (item) {
            	return item.MODEL_YEAR == year && item.REGION_NAME == region;
            });
            
            var total_big_wires = 0;
            var total_small_wires = 0;
            
            if( res.length > 0 ) {
                total_big_wires = res[0].total_big_wires;
                total_small_wires = res[0].total_small_wires;
            }
            
            result.push({
                wire_size: "% of Below 0.50",
                total: total_small_wires
            }); 
            
            result.push({
                wire_size: "% of Above 0.50",
                total: total_big_wires
            });
            
            var chart = am4core.create(divChild, am4charts.PieChart3D);
            chart.data = result;
            
            var title = chart.titles.create();
            title.text =  year;
            //title.fontSize = 12;
            title.fontWeight = 800;
            title.marginBottom = 0;
        
            var series = chart.series.push(new am4charts.PieSeries());
            series.dataFields.value = "total";
            series.dataFields.category = "wire_size";
            
            series.labels.template.disabled = true;
            series.ticks.template.disabled = true;
            
            // this creates initial animation
            series.hiddenState.properties.opacity = 1;
            series.hiddenState.properties.endAngle = -90;
            series.hiddenState.properties.startAngle = -90;
            
            chart.legend = new am4charts.Legend();
            chart.legend.position = "right";
            
            setLegendSize(chart);
        });
    });
    
    if(callback) callback();  
}

// ---------------------- Small Wires: report_type_id(1) --------------------------//

function displaySWAll(callback){
    var _result = [];
    $.each(gAll.groupBy(["REGION_NAME"]), function(i,v) { 
        var _obj = {};
            _obj.category = v.name;

        gByModelYear.forEach(function(x) {
            var _my = x.MODEL_YEAR;
            var _cat = 0; //Small Wires
            
            var res = v.items.filter(function (item) {
            	return item.MODEL_YEAR == _my;
            });
            
            if( res.length > 0 ) {
                _cat = res[0].total_small_wires;
            }
            
            _obj["cat_" + _my] =  +_cat ;
        });
        
        _result.push(_obj);
    });

    var chart = am4core.create("chartSWAllBar", am4charts.XYChart);
    chart.data = _result;
    chart.maskBullets = false;
    //chart.colors.step = 3;

    // Create axes
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "category";
    categoryAxis.numberFormatter.numberFormat = "#";
    //categoryAxis.title.text = "Wire 0.50 and Below";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 20;
    categoryAxis.renderer.cellStartLocation = 0.1;
    categoryAxis.renderer.cellEndLocation = 0.9;
    categoryAxis.renderer.labels.template.fontWeight = "bold";
    categoryAxis.renderer.labels.template.dy = 15;
    
    var  valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = "Count";
    
    // Create series
    var createSeries = function(field, name) {
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.valueY = field;
        series.dataFields.categoryX = "category";
        series.name = name;
        series.tooltipText = "[bold]{name}:[/] {valueY.formatNumber('#,###')}";
        
        // var bullet = series.bullets.push(new am4charts.LabelBullet());
        // bullet.label.text = "{valueY.formatNumber('#,###')}";
        // bullet.locationY = 0.5;
        // bullet.label.fill = am4core.color("#ffffff");
        // bullet.interactionsEnabled = false;
        
        var bullet2 = series.bullets.push(new am4charts.LabelBullet());
        bullet2.label.text = name;
        bullet2.label.truncate = false;
        bullet2.label.hideOversized = false;
        bullet2.label.verticalCenter = "bottom";
        bullet2.label.dy = 18;
        bullet2.locationY = 1;
     }

    gByModelYear.forEach(function(x) {
        var _name = x.MODEL_YEAR;
        var _field = "cat_"+ _name;
        
        createSeries(_field, _name);
    });
    
    // Add cursor
    chart.cursor = new am4charts.XYCursor();
    
    // Add legend
    chart.legend = new am4charts.Legend();
    
    setLegendSize(chart);
    
    if(callback) callback();
}

function displaySWByModelYearPie(callback){
    var chart = am4core.create("chartSWByMY", am4charts.PieChart3D);
    chart.data = gByModelYear;
    chart.numberFormatter.numberFormat = "#";
    
    var series = chart.series.push(new am4charts.PieSeries());
    series.dataFields.value = "total_small_wires"; //"small_wire_count";
    series.dataFields.category = "MODEL_YEAR";
    
    // this creates initial animation
    series.hiddenState.properties.opacity = 1;
    series.hiddenState.properties.endAngle = -90;
    series.hiddenState.properties.startAngle = -90;
    
    chart.legend = new am4charts.Legend();
    setLegendSize(chart);
    
    if(callback) callback();
}

function displaySWByModelYearBar(callback){
    var chart = am4core.create("chartSWByMY", am4charts.XYChart);
    chart.data = gByModelYear;

    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.dataFields.category = "MODEL_YEAR";
    categoryAxis.renderer.minGridDistance = 60;
    categoryAxis.title.text = "Usage per Model Year";
    categoryAxis.numberFormatter.numberFormat = "#";
    
    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    
    var series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.categoryX = "MODEL_YEAR";
    series.dataFields.valueY = "total_small_wires"; //small_wire_count
    series.tooltipText = "{valueY.value.formatNumber('#,###')}"
    series.columns.template.strokeOpacity = 0;
    
    chart.cursor = new am4charts.XYCursor();

    // as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
    series.columns.template.adapter.add("fill", function (fill, target) {
    	return chart.colors.getIndex(target.dataItem.index);
    });
    
    if(callback) callback();
}

function displaySWByRegionPie(callback){
    var chart = am4core.create("chartSWByRegion", am4charts.PieChart3D);
    chart.data = gByRegion;
    
    var series = chart.series.push(new am4charts.PieSeries());
    series.dataFields.value = "total_small_wires"; //"small_wire_count";
    series.dataFields.category = "REGION_NAME";
    
    // this creates initial animation
    series.hiddenState.properties.opacity = 1;
    series.hiddenState.properties.endAngle = -90;
    series.hiddenState.properties.startAngle = -90;
    
    chart.legend = new am4charts.Legend();
    
    setLegendSize(chart);
    
    if(callback) callback();
}

function displaySWByRegionBar(callback){
    var chart = am4core.create("chartSWByRegion", am4charts.XYChart);
    chart.data = gByRegion;

    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.dataFields.category = "REGION_NAME";
    categoryAxis.renderer.minGridDistance = 60;
    categoryAxis.title.text = "Usage per Region";
    categoryAxis.numberFormatter.numberFormat = "#";
    
    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    
    var series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.categoryX = "REGION_NAME";
    series.dataFields.valueY = "total_small_wires";
    series.tooltipText = "{valueY.value.formatNumber('#,###')}"
    series.columns.template.strokeOpacity = 0;
    
    chart.cursor = new am4charts.XYCursor();

    // as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
    series.columns.template.adapter.add("fill", function (fill, target) {
    	return chart.colors.getIndex(target.dataItem.index);
    });
    
    if(callback) callback();
}
 
// function displaySWAll(callback){
//     var _result = [];
//     $.each(gByModelYear.groupBy(["MODEL_YEAR"]), function(i,v) {
//         var year = v.name;
//         var jsonData = {};
//             jsonData.year = year.toString();
            
//         var res = gAll.filter(function (item) {
//         	return item.MODEL_YEAR == year;
//         });
        
//         $.each(gByRegion.groupBy(["REGION_NAME"]), function(i,v) {
//             var res2 = res.filter(function (item) {
//             	return item.REGION_NAME ==  v.name;
//             });

//             if( res2.length > 0 ){
//                 jsonData["region" + i] = res2[0].total_small_wires;
//             }else{
//                 jsonData["region" + i] = 0;
//             }
//         });
//         _result.push(jsonData);
//     });
    
//     var _tw = new zsi.easyJsTemplateWriter("#footerSWAll")
//             .chartCardWrapper({ id:"chartSWAll", title:"Overall" });
            
//      // Create chart instance
//     var chart = am4core.create("chartSWAll", am4charts.XYChart);
//     chart.data = _result;

//     // Create axes
//     var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
//     categoryAxis.dataFields.category = "year";
//     categoryAxis.numberFormatter.numberFormat = "#";
//     categoryAxis.title.text = "Region";
//     categoryAxis.renderer.grid.template.location = 0;
//     categoryAxis.renderer.minGridDistance = 20;
    
//     var  valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
//     valueAxis.title.text = "Count";
    
//     // Create series
//     function createSeries(field, name) {
//         var series = chart.series.push(new am4charts.ColumnSeries());
//         series.dataFields.valueY = field;
//         series.dataFields.categoryX = "year";
//         series.name = name;
//         series.columns.template.tooltipText = "{name}: [bold]{valueY.formatNumber('#,###')}[/]";
//         series.tooltip.pointerOrientation = "vertical";
        
//         var valueLabel = series.bullets.push(new am4charts.LabelBullet());
//           valueLabel.label.text = "{valueX.formatNumber('#,###')}";
//           valueLabel.label.verticalCenter = "bottom";
//           //valueLabel.label.horizontalCenter = "bottom";
//           //valueLabel.label.dx = 10;
//           //valueLabel.label.hideOversized = false;
//           //valueLabel.label.truncate = false;
        
//           var categoryLabel = series.bullets.push(new am4charts.LabelBullet());
//           categoryLabel.label.text = "{name}";
//           categoryLabel.label.verticalCenter = "bottom";
//           //categoryLabel.label.horizontalCenter = "bottom";
//           //categoryLabel.label.dx = -10;
//           categoryLabel.label.fill = am4core.color("#fff");
//           //categoryLabel.label.hideOversized = false;
//           //categoryLabel.label.truncate = false;
//      }

//     $.each(gByRegion.groupBy(["REGION_NAME"]), function(i,v) { 
//         createSeries("region" + i, v.name);
//     });

//     chart.legend = new am4charts.Legend();

//     setLegendSize(chart);
    
//     if(callback) callback();
// }

function displaySWEachModelYearPie(callback){
    gByModelYear.forEach(function(o){
        var result = [];
        var _year = o.MODEL_YEAR;
        var _divID = "chartSWEachMY_"+ _year;
        var _tw = new zsi.easyJsTemplateWriter("#chartSWEachMY")
            .chartCard({ id: _divID, title: _year, class:"w-100", header:"text-dark" });
    
        var res = gAll.filter(function (item) {
        	return item.MODEL_YEAR == _year;
        });

        gByRegion.forEach(function(i){
            var jsonData = {};
            var res2= res.filter(function (item) {
        	    return item.REGION_NAME == i.REGION_NAME;
            });
           
            jsonData.model_year = _year;
            jsonData.region_name = i.REGION_NAME;
            
            if( res2.length > 0 ){
                jsonData.small_wire_count = res2[0].total_small_wires;
            }else{
                jsonData.small_wire_count = 0;
            }

            result.push(jsonData);
        });
        
        var chart = am4core.create(_divID, am4charts.PieChart3D);
        chart.data = result;

        var series = chart.series.push(new am4charts.PieSeries());
        series.dataFields.value = "small_wire_count";
        series.dataFields.category = "region_name";
        
        series.labels.template.disabled = true;
        series.ticks.template.disabled = true;
        series.fill = am4core.color("white");
        
        // this creates initial animation
        series.hiddenState.properties.opacity = 1;
        series.hiddenState.properties.endAngle = -90;
        series.hiddenState.properties.startAngle = -90;
        
        chart.legend = new am4charts.Legend();
        chart.legend.position = "right";
        
        setLegendSize(chart);
    });
    
    if(callback) callback();
}

function displaySWEachRegionPie(callback){
    gByRegion.forEach(function(o){
        var result = [];
        var regionName = o.REGION_NAME.split(' ').join('_');
        var divID = "chartSWEachRegion_"+ regionName;
        var _tw = new zsi.easyJsTemplateWriter("#chartSWEachRegion")
            .chartCard({ id: divID, title: o.REGION_NAME, class:"w-100", header:"text-dark", style:"" });
        
        var res = gAll.filter(function (item) {
        	return item.REGION_NAME == o.REGION_NAME;
        });
        
        gByModelYear.forEach(function(i){
            var jsonData = {};
            var res2= res.filter(function (item) {
        	    return item.MODEL_YEAR == i.MODEL_YEAR;
            });
           
            jsonData.model_year = i.MODEL_YEAR;
            jsonData.region_name = o.REGION_NAME;
            
            if( res2.length > 0 ){
                jsonData.small_wire_count = res2[0].total_small_wires;
            }else{
                jsonData.small_wire_count = 0;
            }

            result.push(jsonData);
        });
      
        var chart = am4core.create(divID, am4charts.PieChart3D);
        chart.data = result;
        chart.numberFormatter.numberFormat = "#.";

        var series = chart.series.push(new am4charts.PieSeries());
        series.dataFields.value = "small_wire_count";
        series.dataFields.category = "model_year";
        
        series.labels.template.disabled = true;
        series.ticks.template.disabled = true;
        
        // this creates initial animation
        series.hiddenState.properties.opacity = 1;
        series.hiddenState.properties.endAngle = -90;
        series.hiddenState.properties.startAngle = -90;
        
        chart.legend = new am4charts.Legend();
        chart.legend.position = "right";
        
        setLegendSize(chart);
    });
    
    if(callback) callback();
}

function displaySWEachModelYearBar(callback){
    gByModelYear.forEach(function(o){
        var _result = [];
        var _year = o.MODEL_YEAR;
        var _divID = "chartSWEachMY_"+ _year;
        var _tw = new zsi.easyJsTemplateWriter("#chartSWEachMY")
            .chartCard({ id: _divID, title: _year, class:"w-100", header:"text-dark" });
    
        var res = gAll.filter(function (item) {
        	return item.MODEL_YEAR == _year;
        });

        gByRegion.forEach(function(i){
            var jsonData = {};
            var res2= res.filter(function (item) {
        	    return item.REGION_NAME == i.REGION_NAME;
            });
           
            jsonData.model_year = _year;
            jsonData.region_name = i.REGION_NAME;
            
            if( res2.length > 0 ){
                jsonData.small_wire_count = res2[0].total_small_wires;
            }else{
                jsonData.small_wire_count = 0;
            }

            _result.push(jsonData);
        });

        var chart = am4core.create(_divID, am4charts.XYChart);
        chart.data = _result;

        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.dataFields.category = "region_name";
        categoryAxis.renderer.minGridDistance = 60;
        //categoryAxis.title.text = "Wire Guages";
        
        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.categoryX = "region_name";
        series.dataFields.valueY = "small_wire_count";
        series.tooltipText = "{valueY.value}"
        series.columns.template.strokeOpacity = 0;
        
        chart.cursor = new am4charts.XYCursor();
        
        // as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
        series.columns.template.adapter.add("fill", function (fill, target) {
        	return chart.colors.getIndex(target.dataItem.index);
        });
    });
    
    if(callback) callback();
}

function displaySWEachRegionBar(callback){
    gByRegion.forEach(function(o){
        var _result = [];
        var regionName = o.REGION_NAME.split(' ').join('_');
        var _divID = "chartSWEachRegion_"+ regionName;
        var _tw = new zsi.easyJsTemplateWriter("#chartSWEachRegion")
            .chartCard({ id: _divID, title: o.REGION_NAME, class:"w-100", header:"text-dark", style:"" });
        
        var res = gAll.filter(function (item) {
        	return item.REGION_NAME == o.REGION_NAME;
        });
        
        gByModelYear.forEach(function(i){
            var jsonData = {};
            var res2= res.filter(function (item) {
        	    return item.MODEL_YEAR == i.MODEL_YEAR;
            });
           
            jsonData.model_year = i.MODEL_YEAR;
            jsonData.region_name = o.REGION_NAME;
            
            if( res2.length > 0 ){
                jsonData.small_wire_count = res2[0].total_small_wires;
            }else{
                jsonData.small_wire_count = 0;
            }

            _result.push(jsonData);
        });

        var chart = am4core.create(_divID, am4charts.XYChart);
        chart.data = _result;

        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.dataFields.category = "model_year";
        categoryAxis.renderer.minGridDistance = 60;
        //categoryAxis.title.text = "Wire Guages";
        categoryAxis.numberFormatter.numberFormat = "#";
        
        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.categoryX = "model_year";
        series.dataFields.valueY = "small_wire_count";
        series.tooltipText = "{valueY.value.formatNumber('#,###')}"
        series.columns.template.strokeOpacity = 0;
        
        chart.cursor = new am4charts.XYCursor();
        
        // as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
        series.columns.template.adapter.add("fill", function (fill, target) {
        	return chart.colors.getIndex(target.dataItem.index);
        });
    });
    
    if(callback) callback();
}

// ---------------------- Small Wire Details: report_type_id(2) -------------------//

function displaySWDtlAll(callback){
    var _data = [];
    $.each(gAll.groupBy(["REGION_NAME"]), function(i,r) { 
        $.each(gModelYears, function(x, my) { 
            var _my = my.name;
            var _region = r.name;
            var _obj = {};
            _obj.year = +_my;
            _obj.region = _region;
            _obj.category = _my +"("+ _region +")";
            
            $.each(gAll.groupBy(["wires"]), function(y, w) { 
                var _count = 0;
                var _wire = w.name;
                var _wireNew = _wire.replace(".","_");
                var _res = r.items.filter(function (item) {
                	return item.wires == _wire && item.MODEL_YEAR == _my;
                });
                
                if( _res.length > 0 ) {
                    _count = _res[0].total_small_wires;
                }
                _obj[_wireNew] =  +_count;
            });
            _data.push(_obj);
        });
    });
    
    var chart = am4core.create("chartSWDtlAll", am4charts.XYChart);
    chart.data = _data;
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
    
    // Create series
    var createSeries = function(field, name, color) {
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.valueY = field;
        series.dataFields.categoryX = "category";
        series.name = name;
        //series.tooltip.disabled = true;
        series.tooltipText = "[bold]{name}:[/] {valueY.formatNumber('#,###')}";
        series.fill = color;

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
     
    var createLabel = function(category, endCategory, label) {
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
    $.each(gAll.groupBy(["wires"]), function(x, w) { 
        var _wire = w.name;
        var _wireNew = _wire.replace(".","_");
        var _field = _wireNew;
        
        createSeries(_field, _wire, colorSet.next());
    });  
    
    $.each(gRegionNames, function(i, r) { 
        var _region = "("+ r.name +")";

        createLabel(gMYFrom + _region, gMYTo + _region, r.name);
    });
    
    //Add cursor
    chart.cursor = new am4charts.XYCursor();
    
    //Add legend
    chart.legend = new am4charts.Legend();
    
    setLegendSize(chart);
    
    if(callback) callback();
}

function displaySWDtlByMY(callback){
    var _result = [];
    $.each(gByModelYear.groupBy(["MODEL_YEAR"]), function(i,v) { 
        var _modelYear = v.name;
        var _jsonData = {};
            _jsonData.model_year = _modelYear
        
        $.each(gAll.groupBy(["wires"]), function(i,v) {
            var wire = v.name;
            var wireNew = wire.replace(".","_");
            var res = gByModelYear.filter(function (item) {
            	return item.MODEL_YEAR == _modelYear && item.wires == wire;
            });
            
            if( res.length > 0 ) {
                _jsonData[wireNew] =  res[0].total_small_wires;
            }else{
                _jsonData[wireNew] = 0
            }
        });
        
        _result.push(_jsonData);
    });

    var chart = am4core.create("chartSWDtlByMY", am4charts.XYChart);
    chart.data = _result;
    //chart.colors.step = 3;
    
    // Create axes
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "model_year";
    categoryAxis.numberFormatter.numberFormat = "#";
    categoryAxis.title.text = "Wire Guages";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 20;
    
    var  valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = "Count";
    
    // Create series
    var createSeries = function(field, name) {
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.valueY = field;
        series.dataFields.categoryX = "model_year";
        series.name = name;
        series.tooltipText = "{name}: [bold]{valueY.formatNumber('#,###')}[/]";
     }

    $.each(gAll.groupBy(["wires"]), function(i,v) { 
        var _field = v.name.replace(".","_");
        var _name = v.name;
        
        createSeries(_field, _name);
    });
    
    // Add cursor
    chart.cursor = new am4charts.XYCursor();
    
    // Add legend
    chart.legend = new am4charts.Legend();
    
    setLegendSize(chart);
    
    var _trend = "";
    var lastObj = _result[_result.length - 1];
    $.each(lastObj, function(k, v){
        var _key = k.replace("_",".");
        if($.isNumeric( _key ) && v !== 0){
            _trend += _key + '<br>';
        }
    });
    
    var _tw = new zsi.easyJsTemplateWriter("#chartSWDtlByMY")
            .out().trendResult({ trend: _trend });
    
    if(callback) callback();
}
 
function displaySWDtlByRegion(callback){
    var _result = [];
    $.each(gByRegion.groupBy(["REGION_NAME"]), function(i,v) { 
        var _region = v.name;
        var _jsonData = {};
            _jsonData.region = _region
        
        $.each(gAll.groupBy(["wires"]), function(i,v) { 
            var wire = v.name;
            var wireNew = wire.replace(".","_");
            var res = gByRegion.filter(function (item) {
            	return item.REGION_NAME == _region && item.wires == wire;
            });
            
            if( res.length > 0 ) {
                _jsonData[wireNew] =  res[0].total_small_wires;
            }else{
                _jsonData[wireNew] = 0
            }
        });
        
        _result.push(_jsonData);
    });
    
    var chart = am4core.create("chartSWDtlByRegion", am4charts.XYChart);
    chart.data = _result;
    //chart.colors.step = 3;
    
    // Create axes
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "region";
    categoryAxis.title.text = "Wire Guages";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 20;
    
    var  valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = "Count";
    
    // Create series
    var createSeries = function(field, name) {
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.valueY = field;
        series.dataFields.categoryX = "region";
        series.name = name;
        series.tooltipText = "{name}: [bold]{valueY}[/]";
     }

    $.each(gAll.groupBy(["wires"]), function(i,v) { 
        var _field = v.name.replace(".","_");
        var _name = v.name;
        
        createSeries(_field, _name);
    });
    
    // Add cursor
    chart.cursor = new am4charts.XYCursor();
    
    // Add legend
    chart.legend = new am4charts.Legend();
    
    setLegendSize(chart);
    
    var _trend = "";
    var _lastObj = _result[_result.length - 1];
    $.each(_lastObj, function(k, v){
        var _key = k.replace("_",".");
        if($.isNumeric( _key ) && v !== 0){
            _trend += _key + '<br>';
        }
    });
    
    var _tw = new zsi.easyJsTemplateWriter("#chartSWDtlByRegion")
            .out().trendResult({ trend: _trend });
    
    if(callback) callback();
}

function displaySWDtlEachMYBar(callback){
    $.each(gByModelYear.groupBy(["MODEL_YEAR"]), function(i,v) { 
        var _result = [];
        var _modelYear = v.name;
        var _divID = "chartSWDtlEachMY_"+ _modelYear;
        var _tw = new zsi.easyJsTemplateWriter("#chartSWDtlEachMY")
            .chartCard({ id: _divID, title: _modelYear, class:"w-100", header:"text-dark"});
        
        $.each(gAll.groupBy(["wires"]), function(i,v) { 
            var _wireGuage = v.name;
            var _jsonData = {};
                _jsonData.model_year = _modelYear
                _jsonData.wire_guage = _wireGuage;
                
            var res = gByModelYear.filter(function (item) {
            	return item.MODEL_YEAR == _modelYear && item.wires == _wireGuage;
            });
            
            if( res.length > 0 ) {
                _jsonData.small_wire_count = res[0].total_small_wires;
            }else{
                _jsonData.small_wire_count = 0
            }
            
            _result.push(_jsonData);
        });

        var chart = am4core.create(_divID, am4charts.XYChart);
        chart.data = _result;
        //chart.padding(40, 40, 40, 40);

        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.dataFields.category = "wire_guage";
        categoryAxis.renderer.minGridDistance = 60;
        categoryAxis.title.text = "Wire Guages";
        
        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.categoryX = "wire_guage";
        series.dataFields.valueY = "small_wire_count";
        series.tooltipText = "{valueY.value}"
        series.columns.template.strokeOpacity = 0;
        
        chart.cursor = new am4charts.XYCursor();
        
        // as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
        series.columns.template.adapter.add("fill", function (fill, target) {
        	return chart.colors.getIndex(target.dataItem.index);
        });
    });
    
    if(callback) callback();
}

function displaySWDtlEachRegionBar(callback){
    $.each(gByRegion.groupBy(["REGION_NAME"]), function(i,v) { 
        var _result = [];
        var _region = v.name;
        var _regionNew = _region.split(' ').join('_');
        var _divID = "chartSWDtlEachRegion_"+ _regionNew;
        var _tw = new zsi.easyJsTemplateWriter("#chartSWDtlEachRegion")
            .chartCard({ id: _divID, title: _region, class:"w-100", header:"text-dark"});
        
        $.each(gAll.groupBy(["wires"]), function(i,v) { 
            var _wireGuage = v.name;
            var _jsonData = {};
                _jsonData.region = _region
                _jsonData.wire_guage = _wireGuage;
                
            var res = gByRegion.filter(function (item) {
            	return item.REGION_NAME == _region && item.wires == _wireGuage;
            });
            
            if( res.length > 0 ) {
                _jsonData.small_wire_count = res[0].total_small_wires;
            }else{
                _jsonData.small_wire_count = 0
            }
            
            _result.push(_jsonData);
        });

        var chart = am4core.create(_divID, am4charts.XYChart);
        chart.data = _result;
        //chart.padding(40, 40, 40, 40);

        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.dataFields.category = "wire_guage";
        categoryAxis.renderer.minGridDistance = 60;
        categoryAxis.title.text = "Wire Guages";
        
        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.categoryX = "wire_guage";
        series.dataFields.valueY = "small_wire_count";
        series.tooltipText = "{valueY.value}"
        series.columns.template.strokeOpacity = 0;
        
        chart.cursor = new am4charts.XYCursor();
        
        // as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
        series.columns.template.adapter.add("fill", function (fill, target) {
        	return chart.colors.getIndex(target.dataItem.index);
        });
    });
    
    if(callback) callback();
}

function displaySWDtlEachMYPie(callback){
    $.each(gByModelYear.groupBy(["MODEL_YEAR"]), function(i,v) { 
        var _result = [];
        var _modelYear = v.name;
        var _divID = "chartSWDtlEachMY_"+ _modelYear;
        var _tw = new zsi.easyJsTemplateWriter("#chartSWDtlEachMY")
            .chartCard({ id: _divID, title: _modelYear, class:"w-100", header:"text-dark"});
        
        $.each(gAll.groupBy(["wires"]), function(i,v) { 
            var _wireGuage = v.name;
            var _jsonData = {};
                _jsonData.model_year = _modelYear
                _jsonData.wire_guage = _wireGuage;
                
            var res = gByModelYear.filter(function (item) {
            	return item.MODEL_YEAR == _modelYear && item.wires == _wireGuage;
            });
            
            if( res.length > 0 ) {
                _jsonData.small_wire_count = res[0].total_small_wires;
            }else{
                _jsonData.small_wire_count = 0
            }
            
            _result.push(_jsonData);
        });

        var chart = am4core.create(_divID, am4charts.PieChart3D);
        chart.data = _result;

        var series = chart.series.push(new am4charts.PieSeries());
        series.dataFields.value = "small_wire_count";
        series.dataFields.category = "wire_guage";
        
        series.labels.template.disabled = true;
        series.ticks.template.disabled = true;
        
        // this creates initial animation
        series.hiddenState.properties.opacity = 1;
        series.hiddenState.properties.endAngle = -90;
        series.hiddenState.properties.startAngle = -90;
        
        chart.legend = new am4charts.Legend();
        //chart.legend.position = "right";
        
        setLegendSize(chart);
    });
    
    if(callback) callback();
}

function displaySWDtlEachRegionPie(callback){
    $.each(gByRegion.groupBy(["REGION_NAME"]), function(i,v) { 
        var _result = [];
        var _region = v.name;
        var _divID = "chartSWDtlEachRegion_"+ _region.split(' ').join('_');;
        var _tw = new zsi.easyJsTemplateWriter("#chartSWDtlEachRegion")
            .chartCard({ id: _divID, title: _region, class:"w-100", header:"text-dark"});
        
        $.each(gAll.groupBy(["wires"]), function(i,v) { 
            var _wireGuage = v.name;
            var _jsonData = {};
                _jsonData.region = _region
                _jsonData.wire_guage = _wireGuage;
                
            var res = gByRegion.filter(function (item) {
            	return item.REGION_NAME == _region && item.wires == _wireGuage;
            });
            
            if( res.length > 0 ) {
                _jsonData.small_wire_count = res[0].total_small_wires;
            }else{
                _jsonData.small_wire_count = 0
            }
            
            _result.push(_jsonData);
        });

        var chart = am4core.create(_divID, am4charts.PieChart3D);
        chart.data = _result;

        var series = chart.series.push(new am4charts.PieSeries());
        series.dataFields.value = "small_wire_count";
        series.dataFields.category = "wire_guage";

        series.labels.template.disabled = true;
        series.ticks.template.disabled = true;
        
        // this creates initial animation
        series.hiddenState.properties.opacity = 1;
        series.hiddenState.properties.endAngle = -90;
        series.hiddenState.properties.startAngle = -90;
        
        chart.legend = new am4charts.Legend();
        //chart.legend.position = "right";
        
        setLegendSize(chart);
    });
    
    if(callback) callback();
}

// -------------------- Small Wire Sub Details: report_type_id(3)------------------//

function displaySWSubDtlByMY(callback){
    var _result = [];
    $.each(gByModelYear.groupBy(["MODEL_YEAR"]), function(i,v) { 
        var _modelYear = v.name;
        var _jsonData = {};
            _jsonData.model_year = _modelYear
        
        $.each(gAll.groupBy(["WIRE_GAUGE"]), function(i,v) {
            var wire = v.name;
            var wireNew = wire.replace(".","_");
            var res = gByModelYear.filter(function (item) {
            	return item.MODEL_YEAR == _modelYear && item.WIRE_GAUGE == wire;
            });
            
            if( res.length > 0 ) {
                _jsonData[wireNew] =  res[0].wire_count;
            }else{
                _jsonData[wireNew] = 0
            }
        });
        
        _result.push(_jsonData);
    });

    var chart = am4core.create("chartSWSubDtlByMY" + gHarnessName, am4charts.XYChart);
    chart.data = _result;
    //chart.colors.step = 3;
    
    // Create axes
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "model_year";
    categoryAxis.numberFormatter.numberFormat = "#";
    categoryAxis.title.text = "Wire Guages";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 20;
    
    var  valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = "Count";
    
    // Create series
    var createSeries = function(field, name) {
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.valueY = field;
        series.dataFields.categoryX = "model_year";
        series.name = name;
        series.tooltipText = "{name}: [bold]{valueY.formatNumber('#,###')}[/]";
     }

    $.each(gAll.groupBy(["WIRE_GAUGE"]), function(i,v) { 
        var _field = v.name.replace(".","_");
        var _name = v.name;
        
        createSeries(_field, _name);
    });
    
    // Add cursor
    chart.cursor = new am4charts.XYCursor();
    
    // Add legend
    chart.legend = new am4charts.Legend();
    
    setLegendSize(chart);
    
    var _trend = "";
    var lastObj = _result[_result.length - 1];
    $.each(lastObj, function(k, v){
        var _key = k.replace("_",".");
        if($.isNumeric( _key ) && v !== 0){
            _trend += _key + '<br>';
        }
    });
    
    var _tw = new zsi.easyJsTemplateWriter("#chartSWSubDtlByMY" + gHarnessName)
            .out().trendResult({ trend: _trend });
    
    if(callback) callback();
}
 
function displaySWSubDtlByRegion(callback){
    var _result = [];
    $.each(gByRegion.groupBy(["REGION_NAME"]), function(i,v) { 
        var _region = v.name;
        var _jsonData = {};
            _jsonData.region = _region
        
        $.each(gAll.groupBy(["WIRE_GAUGE"]), function(i,v) { 
            var wire = v.name;
            var wireNew = wire.replace(".","_");
            var res = gByRegion.filter(function (item) {
            	return item.REGION_NAME == _region && item.WIRE_GAUGE == wire;
            });
            
            if( res.length > 0 ) {
                _jsonData[wireNew] =  res[0].wire_count;
            }else{
                _jsonData[wireNew] = 0
            }
        });
        
        _result.push(_jsonData);
    });
    
    var chart = am4core.create("chartSWSubDtlByRegion" + gHarnessName, am4charts.XYChart);
    chart.data = _result;
    //chart.colors.step = 3;
    
    // Create axes
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "region";
    categoryAxis.title.text = "Wire Guages";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 20;
    
    var  valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = "Count";
    
    // Create series
    var createSeries = function(field, name) {
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.valueY = field;
        series.dataFields.categoryX = "region";
        series.name = name;
        series.tooltipText = "{name}: [bold]{valueY}[/]";
     }

    $.each(gAll.groupBy(["WIRE_GAUGE"]), function(i,v) { 
        var _field = v.name.replace(".","_");
        var _name = v.name;
        
        createSeries(_field, _name);
    });
    
    // Add cursor
    chart.cursor = new am4charts.XYCursor();
    
    // Add legend
    chart.legend = new am4charts.Legend();
    
    setLegendSize(chart);
    
    var _trend = "";
    var _lastObj = _result[_result.length - 1];
    $.each(_lastObj, function(k, v){
        var _key = k.replace("_",".");
        if($.isNumeric( _key ) && v !== 0){
            _trend += _key + '<br>';
        }
    });
    
    var _tw = new zsi.easyJsTemplateWriter("#chartSWSubDtlByRegion" + gHarnessName)
            .out().trendResult({ trend: _trend });
    
    if(callback) callback();
}

function displaySWSubDtlEachMYBar(callback){
    $.each(gByModelYear.groupBy(["MODEL_YEAR"]), function(i,v) { 
        var _result = [];
        var _modelYear = v.name;
        var _divID = "chartSWSubDtlEachMY_"+ _modelYear  + gHarnessName;
        var _tw = new zsi.easyJsTemplateWriter("#chartSWSubDtlEachMY" + gHarnessName)
            .chartCard({ id: _divID, title: _modelYear, class:"w-100", header:"text-dark"});
        
        $.each(gAll.groupBy(["WIRE_GAUGE"]), function(i,v) { 
            var _wireGuage = v.name;
            var _jsonData = {};
                _jsonData.model_year = _modelYear
                _jsonData.wire_guage = _wireGuage;
                
            var res = gByModelYear.filter(function (item) {
            	return item.MODEL_YEAR == _modelYear && item.WIRE_GAUGE == _wireGuage;
            });
            
            if( res.length > 0 ) {
                _jsonData.wire_count = res[0].wire_count;
            }else{
                _jsonData.wire_count = 0
            }
            
            _result.push(_jsonData);
        });

        var chart = am4core.create(_divID, am4charts.XYChart);
        chart.data = _result;
        //chart.padding(40, 40, 40, 40);

        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.dataFields.category = "wire_guage";
        categoryAxis.renderer.minGridDistance = 60;
        categoryAxis.title.text = "Wire Guages";
        
        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.categoryX = "wire_guage";
        series.dataFields.valueY = "wire_count";
        series.tooltipText = "{valueY.value}"
        series.columns.template.strokeOpacity = 0;
        
        chart.cursor = new am4charts.XYCursor();
        
        // as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
        series.columns.template.adapter.add("fill", function (fill, target) {
        	return chart.colors.getIndex(target.dataItem.index);
        });
    });
    
    if(callback) callback();
}

function displaySWSubDtlEachRegionBar(callback){
    $.each(gByRegion.groupBy(["REGION_NAME"]), function(i,v) { 
        var _result = [];
        var _region = v.name;
        var _regionNew = _region.split(' ').join('_');
        var _divID = "chartSWSubDtlEachRegion_"+ _regionNew + gHarnessName;
        var _tw = new zsi.easyJsTemplateWriter("#chartSWSubDtlEachRegion" + gHarnessName)
            .chartCard({ id: _divID, title: _region, class:"w-100", header:"text-dark"});
        
        $.each(gAll.groupBy(["WIRE_GAUGE"]), function(i,v) { 
            var _wireGuage = v.name;
            var _jsonData = {};
                _jsonData.region = _region
                _jsonData.wire_guage = _wireGuage;
                
            var res = gByRegion.filter(function (item) {
            	return item.REGION_NAME == _region && item.WIRE_GAUGE == _wireGuage;
            });
            
            if( res.length > 0 ) {
                _jsonData.wire_count = res[0].wire_count;
            }else{
                _jsonData.wire_count = 0
            }
            
            _result.push(_jsonData);
        });

        var chart = am4core.create(_divID, am4charts.XYChart);
        chart.data = _result;
        //chart.padding(40, 40, 40, 40);

        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.dataFields.category = "wire_guage";
        categoryAxis.renderer.minGridDistance = 60;
        categoryAxis.title.text = "Wire Guages";
        
        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.categoryX = "wire_guage";
        series.dataFields.valueY = "wire_count";
        series.tooltipText = "{valueY.value}"
        series.columns.template.strokeOpacity = 0;
        
        chart.cursor = new am4charts.XYCursor();
        
        // as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
        series.columns.template.adapter.add("fill", function (fill, target) {
        	return chart.colors.getIndex(target.dataItem.index);
        });
    });
    
    if(callback) callback();
}

function displaySWSubDtlEachMYPie(callback){
    $.each(gByModelYear.groupBy(["MODEL_YEAR"]), function(i,v) { 
        var _result = [];
        var _modelYear = v.name;
        var _divID = "chartSWSubDtlEachMY_"+ _modelYear + gHarnessName;
        var _tw = new zsi.easyJsTemplateWriter("#chartSWSubDtlEachMY" + gHarnessName)
            .chartCard({ id: _divID, title: _modelYear, class:"w-100", header:"text-dark"});
        
        $.each(gAll.groupBy(["WIRE_GAUGE"]), function(i,v) { 
            var _wireGuage = v.name;
            var _jsonData = {};
                _jsonData.model_year = _modelYear
                _jsonData.wire_guage = _wireGuage;
                
            var res = gByModelYear.filter(function (item) {
            	return item.MODEL_YEAR == _modelYear && item.WIRE_GAUGE == _wireGuage;
            });
            
            if( res.length > 0 ) {
                _jsonData.wire_count = res[0].wire_count;
            }else{
                _jsonData.wire_count = 0
            }
            
            _result.push(_jsonData);
        });

        var chart = am4core.create(_divID, am4charts.PieChart3D);
        chart.data = _result;

        var series = chart.series.push(new am4charts.PieSeries());
        series.dataFields.value = "wire_count";
        series.dataFields.category = "wire_guage";
        
        series.labels.template.disabled = true;
        series.ticks.template.disabled = true;
        
        // this creates initial animation
        series.hiddenState.properties.opacity = 1;
        series.hiddenState.properties.endAngle = -90;
        series.hiddenState.properties.startAngle = -90;
        
        chart.legend = new am4charts.Legend();
        //chart.legend.position = "right";
        
        setLegendSize(chart);
    });
    
    if(callback) callback();
}

function displaySWSubDtlEachRegionPie(callback){
    $.each(gByRegion.groupBy(["REGION_NAME"]), function(i,v) { 
        var _result = [];
        var _region = v.name;
        var _regionNew = _region.split(' ').join('_');
        var _divID = "chartSWSubDtlEachRegion_"+ _regionNew + gHarnessName;
        var _tw = new zsi.easyJsTemplateWriter("#chartSWSubDtlEachRegion" + gHarnessName)
            .chartCard({ id: _divID, title: _region, class:"w-100", header:"text-dark"});
        
        $.each(gAll.groupBy(["WIRE_GAUGE"]), function(i,v) { 
            var _wireGuage = v.name;
            var _jsonData = {};
                _jsonData.region = _region
                _jsonData.wire_guage = _wireGuage;
                
            var res = gByRegion.filter(function (item) {
            	return item.REGION_NAME == _region && item.WIRE_GAUGE == _wireGuage;
            });
            
            if( res.length > 0 ) {
                _jsonData.wire_count = res[0].wire_count;
            }else{
                _jsonData.wire_count = 0
            }
            
            _result.push(_jsonData);
        });

        var chart = am4core.create(_divID, am4charts.PieChart3D);
        chart.data = _result;

        var series = chart.series.push(new am4charts.PieSeries());
        series.dataFields.value = "wire_count";
        series.dataFields.category = "wire_guage";

        series.labels.template.disabled = true;
        series.ticks.template.disabled = true;
        
        // this creates initial animation
        series.hiddenState.properties.opacity = 1;
        series.hiddenState.properties.endAngle = -90;
        series.hiddenState.properties.startAngle = -90;
        
        chart.legend = new am4charts.Legend();
        //chart.legend.position = "right";
        
        setLegendSize(chart);
    });
    
    if(callback) callback();
}

//------------------- New Wire Tech Lesser Weight ---------------------------------//

function getDataNewWireTech(callback){
    var _my = new Date().getFullYear() - 2;
    var _wireGuage = "0.75";
    $.get(execURL + "wire_tech_weight_lower_upper_limits @model_year="+ _my +",@wire_gauge='"+ _wireGuage +"'"
    , function(data){
        var dataRows = [];
        if(data.rows.length > 0){
          dataRows = data.rows;
        }
        if(callback) callback(dataRows);
    });
}

function displayNewWireTech(criteriaId){
    am4core.useTheme(am4themes_animated);
    getDataNewWireTech(function(data){
        var chartId = "chartMY_" + criteriaId;
        //gtw.div({id:chartId, class:"chart-div", style:"max-height: 550px"});
    
        var chart = am4core.create(chartId, am4charts.XYChart);
        
        var wireLL = data.reduce(function(prev, curr) {
                        return prev.wire_ll < curr.wire_ll ? prev.wire_ll : curr.wire_ll;
                    });
                    
        var wireUL = data.reduce(function(prev, curr) {
                        return prev.wire_ul < curr.wire_ul ? prev.wire_ul : curr.wire_ul;
                    });

        // Add data
        chart.data = data;
  
        
        chart.numberFormatter.numberFormat = "#.#####";
        
        // Create axes
        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "wire_type";
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.renderer.minGridDistance = 20;
        categoryAxis.renderer.labels.template.horizontalCenter = "right";
        categoryAxis.renderer.labels.template.verticalCenter = "middle";
        categoryAxis.renderer.labels.template.rotation = 310;

        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.min = 0.0000;
        valueAxis.max = wireUL;
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
        series.dataFields.categoryX = "wire_type";
        series.name = "Avg. Weight";
        series.tooltipText = "{name}: [bold]{valueY}[/]";
        
        // Create value axis range
        var range = valueAxis.axisRanges.create();
        range.value = wireUL;
        range.grid.stroke = am4core.color("#396478");
        range.grid.strokeWidth = 2;
        range.grid.strokeOpacity = 1;
        range.label.inside = true;
        range.label.text = "Upper Weight";
        range.label.fill = range.grid.stroke;
        //range.label.align = "right";
        range.label.verticalCenter = "bottom";
        
        var range2 = valueAxis.axisRanges.create();
        range2.value = wireLL;
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
    });
}

//------------------- New Wire Tech Lesser Weight ---------------------------------//

function getDataNewWireTechDimension(criteriaId, callback){
    var _my = new Date().getFullYear() - 2;
    var _wireGuage = "0.75";
    $.get(execURL + "wire_tech_lower_upper_diameter @byMY="+ _my +",@criteria_id="+ criteriaId 
    , function(data){
        var dataRows = [];
        if(data.rows.length > 0){
          dataRows = data.rows;
        }
        if(callback) callback(dataRows);
    });
}

function displayNewWireTechDimension(criteriaId){
    am4core.useTheme(am4themes_animated);
    getDataNewWireTechDimension(criteriaId, function(data){
        var lowerLimit = 0;
        var upperLimit = 0;
        var chartId = "chartMY_" + criteriaId;
        var chart = am4core.create(chartId, am4charts.XYChart);
        var newData = $.each(data.groupBy(["wire_type"]), function(i, v){
            $.each(v.items, function(x, y){
                if(lowerLimit < y.lower_dia) lowerLimit = y.lower_dia;
                
                if(upperLimit < y.upper_dia) upperLimit = y.upper_dia;
            });
            
            var _sum = v.items.reduce(function (accumulator, currentValue) {
                return accumulator + currentValue.avg_dia;
            }, 0);
            
            v.avg_dia = (_sum / v.items.length);
            
            return v;
        });
                    
        // Add data
        chart.data = newData;
        
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
        valueAxis.min = 0.0000;
        valueAxis.max = 5;
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
        series.dataFields.valueY = "avg_dia";
        series.dataFields.categoryX = "name";
        series.name = "Avg. Weight";
        series.tooltipText = "{name}: [bold]{valueY}[/]";
        
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
    });
}

//------------------- MECHANICAL (Retainer) ---------------------------------//

function firstAndLast(array, key) {
    var firstItem = array[0];
    var lastItem = array[array.length-1];
    
    if(key) {
        firstItem = firstItem[key];
        lastItem = lastItem[key];
    }
    
    var objOutput = {};
    objOutput.first = firstItem;
    objOutput.last = lastItem;
    
    return objOutput;
} 

function dynamicObjectKey(data){
    var _dynamicKey = "";
    $.each(Object.keys(data[0]), function(i, key){
       if(key !== "location" && key !== "location_dtl" && key !== "REGION_NAME" && key !== "MODEL_YEAR"){
           _dynamicKey = key;
       }
    });
   
    return _dynamicKey;
}

function getRetainerData(criteriaId, callback){
    $.get(execURL + "dynamic_retainers_sel @byMY='Y',@byRegion='Y',@criteria_id=" + criteriaId 
    , function(data){
        if(callback) callback(data.rows);
    });
}

function displayChartRetainer(criteriaId){
    getRetainerData(criteriaId, function(data){
        
        var _region = data.groupBy(["REGION_NAME"]);
        var _modelYear = data.groupBy(["MODEL_YEAR"]);
        var _locationDtl = data.groupBy(["location_dtl"]);
        
        var _dynamicKey = dynamicObjectKey(data);
        var _dynamicObj = data.groupBy([_dynamicKey]);
       
        console.log("_dynamicKey", _dynamicKey);
        console.log("_dynamicObjByKey", _dynamicObj);
        
        gModelYears = _modelYear;
        setMYRange();
        
        var _data = [];
        $.each(_region, function(i, r) { 
            
            $.each(_modelYear, function(x, my) {
                var _regionName = r.name;
                var _modelYear = my.name;
                var _result = r.items.filter(function (item) {
                	return item.MODEL_YEAR == _modelYear;
                });
                
                $.each(_locationDtl, function(y, l) {
                    var _locationDtl = l.name;
                    var _json = {
                        REGION_NAME : _regionName,
                        MODEL_YEAR : +_modelYear,
                        category : _locationDtl +"("+ _modelYear +"-"+ _regionName +")"
                    };
                     
                   
                    $.each(_dynamicObj, function(z, s) {
                        
                        var _name = s.name;
                        var _nameNew = _name.replace(" ","_");
                        
                        var _result2 = _result.filter(function (item) {
                        	return item.location_dtl == _locationDtl && item[_dynamicKey] == _name;
                        });
                        
                        var _count = 0;
                        for(; _count < _result2.length; ){
                            _count++;
                        }
                       
                        _json[_nameNew] = _count;
                    });
                    
                    _data.push(_json);
                }); 
            });
        });
        
        // Display Chart
        am4core.useTheme(am4themes_animated);
        
        var chart = am4core.create("chartMY_" + criteriaId, am4charts.XYChart);
        chart.data = _data;
        chart.colors.step = 2;
        chart.padding(15, 15, 10, 15);

        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "category";
        categoryAxis.renderer.minGridDistance = 20;
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.interactionsEnabled = false;
        categoryAxis.renderer.labels.template.fontSize = 10;
        categoryAxis.renderer.labels.template.valign = "top";
        categoryAxis.renderer.labels.template.location = 0;
        categoryAxis.renderer.labels.template.rotation = 270;
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
          series.dataFields.categoryX = "category";
          series.name = name;
          series.tooltipText = "[bold]{name}:[/] {valueY.totalPercent.formatNumber('#.00')}% - [bold]{valueY.formatNumber('#,###')}[/]";
          series.tooltip.fontSize = 10;
          series.tooltip.dy = 0;
          series.tooltip.align = "top";
          series.stacked = true;
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
    
        $.each(_dynamicObj, function(i, v) { 
            var _name = v.name;
            var _nameNew = _name.replace(" ","_");
            
            _createSeries(_nameNew, _name);
        }); 
        
        var _mYear = firstAndLast(_modelYear , "name");
        var _locDtl = firstAndLast(_locationDtl , "name");
        
        $.each(_modelYear, function(i, v) { 
            var _my = v.name;
            
            $.each(_region, function(i, r) { 
                var _reg = r.name;
                var _first = _locDtl.first + "("+ _my +"-"+ _reg +")";
                var _last = _locDtl.last + "("+ _my +"-"+ _reg +")";
                
                _createLabel(_first, _last, _my, 0, 10);
            });
        });
        
        $.each(_region, function(i, r) { 
            var _reg = r.name;
            var _first = _locDtl.first + "("+ _mYear.first +"-"+ _reg +")";
            var _last = _locDtl.last + "("+ _mYear.last +"-"+ _reg +")";
            
            _createLabel(_first, _last, _reg, 0.1, 20);
        });
        
        //Add cursor
        chart.cursor = new am4charts.XYCursor();
        
        //Add legend
        chart.legend = new am4charts.Legend();
        chart.legend.labels.template.fontSize = 10;
        chart.legend.valueLabels.template.fontSize = 10;
        chart.legend.itemContainers.template.dy = 10;
        chart.legend.itemContainers.template.paddingTop = 1;
        chart.legend.itemContainers.template.paddingBottom = 1;
        
        var markerTemplate = chart.legend.markers.template;
        markerTemplate.width = 10;
        markerTemplate.height = 10;
    });
}


  