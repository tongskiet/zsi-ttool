 var gPrmRegion = "";
var gPrmNoYears = "";
var gPrmIncludeCYear = "N";
var gPrmChartType = "";
var gObjWireSummary= [];
var gObjWireSummaryByMY=[];
var gObjWireSummaryByRegion=[];

var gObjSWAll = [];
var gObjSWRegion = [];
var gObjSWModelYear = [];
var gObjWiresCountDtl = [];

var gObjSWDtlAll = [];
var gObjSWDtlRegion = [];
var gObjSWDtlModelYear = [];

var gAll = [];
var gByRegion = [];
var gByModelYear = [];

var gPrmCriteriaId = "";
var gPrmReportTypeId = "";
var gTW;

zsi.ready(function(){
    gTW = new zsi.easyJsTemplateWriter("#chart_container");
    
    getAllWires(function(){
        displaySWMap();
        am4core.unuseTheme(am4themes_dark); 
        am4core.useTheme(am4themes_animated); //Initialized amchart Theme
        
        displayChartWireSummary();
        
        //getSmallWires(function(){
            
            displayChartSmallWires();
            
            //getDataSmallWires(function(){    
                getSmallWires(function(){ //getDataSmallWiresDtl(function(){
                  displayChartSmallWiresDtl();
                });
            //});
        //});
    });
    
    // getDataWireSummary(function(){
    //     displayChartWireSummary();
        
    //     getDataSmallWires(function(){
    //         displayChartSmallWires();
            
    //         getDataSmallWiresDtl(function(){
    //           displayChartSmallWiresDtl();
    //         });
    //     });
    // });
    
    $("#btnSearch").click(function(){
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
            
            getAllWires(function(){
                displaySWMap();
                am4core.unuseTheme(am4themes_dark); 
                am4core.useTheme(am4themes_animated); //Initialized amchart Them
                
                //getDataWireSummary(function(){
                displayChartWireSummary();
                displayChartSmallWires();
                
                //getDataSmallWires(function(){    
                    getSmallWires(function(){ //getDataSmallWiresDtl(function(){
                       displayChartSmallWiresDtl();
                    });
                //});
            });
        }
    });
});

function getData(obj, callback){
    if( $.isEmptyObject(obj) === false ) {
        var _param = "";
        var _byregion = ( obj.byRegion === "Y" ? "Y" : "N" );
        var _byModelYear = ( obj.byModelYear === "Y" ? "Y" : "N" );
        var _criteriaID = ( obj.criterieId !=="" ? obj.criterieId : "7" );
        var _reportTypeID = ( obj.reportTypeId !=="" ? obj.reportTypeId : "1" );
        
        if(gPrmIncludeCYear==="Y") 
            _param += ",@no_years='"+ gPrmNoYears +"',@include_cyear='Y'";
        else if(gPrmIncludeCYear==="N" && gPrmNoYears!==""){
            _param += ",@no_years='"+ gPrmNoYears +"',@include_cyear='N'";
        }
        
        $.get(execURL + "dynamic_wires_usage_summary @byRegion='"+ _byregion +"',@byMY='"+ _byModelYear +"',@criteria_id="+ _criteriaID +",@report_type_id=" + _reportTypeID + _param
        , function(data){
            var dataRows = [];
            if(data.rows.length > 0){
              dataRows = data.rows;
            }
            if(callback) callback(dataRows);
        });
    }
}

function getDataAll(callback){
    getData({
        byRegion: "Y",
        byModelYear: "Y",
        criterieId: gPrmCriteriaId,
        reportTypeId: gPrmReportTypeId
    }, function(all){
        gAll = all;
        
        if(callback) callback(all);
    });
}

function getDataByRegion(callback){
    getData({
        byRegion: "Y",
        byModelYear: "N",
        criterieId: gPrmCriteriaId,
        reportTypeId: gPrmReportTypeId
    }, function(region){
        gByRegion = region;
        
        if(callback) callback(region);
    });
} 

function getDataByModelYear(callback){
    getData({
        byRegion: "N",
        byModelYear: "Y",
        criterieId: gPrmCriteriaId,
        reportTypeId: gPrmReportTypeId
    }, function(model_year){
        gByModelYear = model_year;
        
        if(callback) callback(model_year);
    });
}

function getAllWires(callback){
    gPrmCriteriaId = 7;
    gPrmReportTypeId = 1;
    
    getDataByRegion(function(){
        getDataByModelYear(function(){
            getDataAll(function(){
                if(callback) callback();
            });
        });
    });
}

function getSmallWires(callback){
    gPrmCriteriaId = 7;
    gPrmReportTypeId = 2;
    
    getDataByRegion(function(){
        getDataByModelYear(function(){
            getDataAll(function(){
                if(callback) callback();
            });
        });
    });
}

function getBigWires(callback){
    gPrmCriteriaId = 7;
    gPrmReportTypeId = 3;
    
    getDataByRegion(function(){
        getDataByModelYear(function(){
            getDataAll(function(){
                if(callback) callback();
            });
        });
    });
}

function getDataWireSummaryBy(category, callback){
    var param = "";
    if(category==="region"){
        param = "@byRegion='Y'";
    }else if(category==="model_year"){
        param = "@byMY='Y'";
    }else{
        param = "@byMY='Y',@byRegion='Y'";
    }
    
    if(gPrmIncludeCYear==="Y") 
        param += ",@no_years='"+ gPrmNoYears +"',@include_cyear='"+ gPrmIncludeCYear +"'";
    else if(gPrmIncludeCYear==="N" && gPrmNoYears!==""){
        param += ",@no_years='"+ gPrmNoYears +"'";
    }
    
    $.get(execURL + "overall_wires_usage_summary " + param, function(data){
        var dataRows = [];
        if(data.rows.length > 0){
           dataRows = data.rows;
        }
        if(callback) callback(dataRows);
    });
}

function getDataSmallWiresBy(category, callback){
    var param = "";
    if(category==="region"){
        param = "@byRegion='Y'";
    }else if(category==="model_year"){
        param = "@byMY='Y'";
    }else{
        param = "@byMY='Y',@byRegion='Y'";
    }
    
    if(gPrmIncludeCYear==="Y") 
        param += ",@no_years='"+ gPrmNoYears +"',@include_cyear='"+ gPrmIncludeCYear +"'";
    else if(gPrmIncludeCYear==="N" && gPrmNoYears!==""){
        param += ",@no_years='"+ gPrmNoYears +"'";
    }
    
    $.get(execURL + "wires_count_summary " + param, function(data){
        var dataRows = [];
        if(data.rows.length > 0){
           dataRows = data.rows;
        }
        if(callback) callback(dataRows);
    });
}

function getDataSmallWiresDtlBy(category, callback){
    var param = "";
    if(category==="region"){
        param = "@byRegion='Y'";
    }else if(category==="model_year"){
        param = "@byMY='Y'";
    }else{
        param = "@byMY='Y',@byRegion='Y'";
    }
    
    if(gPrmIncludeCYear==="Y") 
        param += ",@no_years='"+ gPrmNoYears +"',@include_cyear='"+ gPrmIncludeCYear +"'";
    else if(gPrmIncludeCYear==="N" && gPrmNoYears!==""){
        param += ",@no_years='"+ gPrmNoYears +"'";
    }
    
    $.get(execURL + "wires_count_dtl " + param, function(data){
        var dataRows = [];
        if(data.rows.length > 0){
           dataRows = data.rows;
        }
        if(callback) callback(dataRows);
    });
}

function getDataWireSummary(callback){
    getDataWireSummaryBy("model_year", function(model_year){
        gObjWireSummaryByMY = model_year;
        
        getDataWireSummaryBy("region", function(region){
            gObjWireSummaryByRegion = region;
                
            getDataWireSummaryBy("all", function(all){
                gObjWireSummary = all;
                
                if(callback) callback();
            });
        });
    });
}

function getDataSmallWires(callback){
    getDataSmallWiresBy("model_year", function(model_year){
        gObjSWModelYear = model_year;
        
        getDataSmallWiresBy("region", function(region){
            gObjSWRegion = region;
                
            getDataSmallWiresBy("all", function(all){
                gObjSWAll = all;
                
                if(callback) callback(); 
            });
        });
    });
}

function getDataSmallWiresDtl(callback){
    getDataSmallWiresDtlBy("model_year", function(model_year){
        gObjSWDtlModelYear = model_year;
        
        getDataSmallWiresDtlBy("region", function(region){
            gObjSWDtlRegion = region;
                
            getDataSmallWiresDtlBy("all", function(all){
                gObjSWDtlAll = all;

                if(callback) callback(); 
            });
        });
    });
}

function displayChartWireSummary(){
    gTW.chartDiv({ 
        id:"chartWireSummary", 
        title:"Overall usage of all Wire sizes", 
        by_model_year_id: "chartWireSummaryByMY",
        by_region_id: "chartWireSummaryByRegion",
        each_model_year_id: "chartWireSummaryEachMY",
        each_region_id: "chartWireSummaryEachRegion",
        div_middle_id: "chartTrendResult"
    });
    
    if( gPrmChartType==="Pie Chart" ){
        $("#chartWireSummaryByMY, #chartWireSummaryByRegion").removeClass();
        displayWireSummaryByMYPie(function(){
            displayWireSummaryByRegionPie(function(){
                displayWireSummaryEachMYPie(function(){
                    displayWireSummaryEachRegionPie();
                });
            });
        });
    }else{
        displayWireSummaryByMYBar(function(){
            displayWireSummaryByRegionBar(function(){
                displayWireSummaryEachMYBar(function(){
                    displayWireSummaryEachRegionBar();
                });
            });
        });
    }
}

function displayChartSmallWires(){
    gTW.chartDiv({ 
        id:"chartSmallWire", 
        title:"Summary of Small Wires Below 0.50", 
        by_model_year_id: "chartSWByMY",
        by_region_id: "chartSWByRegion",
        each_model_year_id: "chartSWEachMY",
        each_region_id: "chartSWEachRegion",
        div_footer_id: "footerSWAll"
    });
    
    if( gPrmChartType==="Pie Chart" ){
        displaySWByModelYearPie(function(){
            displaySWByRegionPie(function(){
                displaySWAll(function(){
                    displaySWEachModelYearPie(function(){
                        displaySWEachRegionPie();
                    });
                });
            });
        });
    }else{
        displaySWByModelYearBar(function(){
            displaySWByRegionBar(function(){
                displaySWAll(function(){
                    displaySWEachModelYearBar(function(){
                        displaySWEachRegionBar();
                    });
                });
            });
        });
    }
}

function displayChartSmallWiresDtl(){
    gTW.chartDiv({ 
        id:"chartSWDtl", 
        title:"Summary of each Wire Sizes equal & below 0.50", 
        by_model_year_id: "chartSWDtlByMY",
        by_region_id: "chartSWDtlByRegion",
        each_model_year_id: "chartSWDtlEachMY",
        each_region_id: "chartSWDtlEachRegion"
    });
    
    displaySWDtlByMY(function(){
        displaySWDtlByRegion(function(){
            if( gPrmChartType==="Pie Chart" ){
                displaySWDtlEachMYPie(function(){
                    displaySWDtlEachRegionPie();
                });
            }else{
                displaySWDtlEachMYBar(function(){
                    displaySWDtlEachRegionBar();
                });
            }
        }); 
    });
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
        
        var _tw = new zsi.easyJsTemplateWriter("#chartTrendResult")
            .trendResult({ trend: result });
    }
}

function setDataSmallWires(data){
    var result = [];
    $.each(data.groupBy(["MODEL_YEAR"]), function(i,v) {
        var year = v.items[0].MODEL_YEAR;
        var jsonData = {};
            jsonData.year = year.toString();
            
        var res = data.filter(function (item) {
        	return item.MODEL_YEAR == year;
        });
        
        $.each(data.groupBy(["REGION_NAME"]), function(i,v) {
            var res2 = res.filter(function (item) {
            	return item.REGION_NAME ==  v.items[0].REGION_NAME;
            });

            if( res2.length > 0 ){
                jsonData["region" + i] = res2[0].total_small_wires;
            }else{
                jsonData["region" + i] = 0;
            }
        });
        result.push(jsonData);
    });
    
    return result;
}

// ---------------------- All Wires --------------------------//
function displaySWMap(){
    am4core.useTheme(am4themes_dark);
    
    var chart = am4core.create("chart_map", am4maps.MapChart);

    /* Set map definition */
    chart.geodata = am4geodata_continentsLow;
    // chart.geodata = am4geodata_region_world_asiaLow;
    // chart.geodata = am4geodata_worldLow;

    // Set projection
    chart.projection = new am4maps.projections.Miller();
    // chart.projection = new am4maps.projections.Mercator();
    
    // Export
    //chart.exporting.menu = new am4core.ExportMenu();
    
    // Zoom control
    chart.zoomControl = new am4maps.ZoomControl();
    
    // Create map polygon series
    var polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
    polygonSeries.exclude = ["antarctica"];
    polygonSeries.useGeodata = true;
    polygonSeries.hiddenInLegend = true;
    polygonSeries.include = ["AU"];
    // ----------------------------------------------------------
    // Series for Asia map
    var asiaSeries = chart.series.push(new am4maps.MapPolygonSeries());
    asiaSeries.name = "Asia Pacific";
    asiaSeries.geodata = am4geodata_region_world_asiaLow;
    asiaSeries.fill = am4core.color("#96BDC6");
    asiaSeries.events.on("over", over);
    asiaSeries.events.on("out", out); 
    var auData = am4geodata_worldLow.features.filter(function (item) {
                	return item.id === "AU";
                });
    asiaSeries.geodata.features.push(auData[0])
    //$.merge(asiaSeries.geodata.features, am4geodata_australiaLow.features);
    
    var polygonTemplate = asiaSeries.mapPolygons.template;
    polygonTemplate.tooltipText = "{series.name}: [bold]{name}[/]";
    polygonTemplate.fill = am4core.color("#96BDC6");
    polygonTemplate.fillOpacity = 0.6;
    polygonTemplate.strokeOpacity = 1;
    
    var hs = polygonTemplate.states.create("highlight");
    hs.properties.fillOpacity = 1;
    //hs.properties.fill = am4core.color("#CC0000");
    
    // ----------------------------------------------------------
    // Series for Europe map
    var europeSeries = chart.series.push(new am4maps.MapPolygonSeries());
    europeSeries.name = "Europe";
    europeSeries.geodata = am4geodata_region_world_europeLow;
    europeSeries.fill = am4core.color("#845EC2");
    europeSeries.events.on("over", over);
    europeSeries.events.on("out", out);
    
    var polygonTemplate = europeSeries.mapPolygons.template;
    polygonTemplate.tooltipText = "{series.name}: [bold]{name}[/]";
    polygonTemplate.fill = am4core.color("#845EC2");
    polygonTemplate.fillOpacity = 0.6;
    polygonTemplate.strokeOpacity = 1;
    
    var hs = polygonTemplate.states.create("highlight");
     hs.properties.fillOpacity = 1;
    
    // ----------------------------------------------------------
    // Series for North America map
    var northAmSeries = chart.series.push(new am4maps.MapPolygonSeries());
    northAmSeries.name = "North America";
    northAmSeries.geodata = am4geodata_region_world_northAmericaLow;
    northAmSeries.fill = am4core.color("#99C78F");
    northAmSeries.events.on("over", over);
    northAmSeries.events.on("out", out);
    
    var polygonTemplate = northAmSeries.mapPolygons.template;
    polygonTemplate.tooltipText = "{series.name}: [bold]{name}[/]";
    polygonTemplate.fill = am4core.color("#99C78F");
    polygonTemplate.fillOpacity = 0.6;
    polygonTemplate.strokeOpacity = 1;
    
    var hs = polygonTemplate.states.create("highlight");
    hs.properties.fillOpacity = 1;
    
    // ----------------------------------------------------------
    am4core.useTheme(am4themes_animated);
    
    // Create an image series that will hold pie charts
    var pieSeries = chart.series.push(new am4maps.MapImageSeries());
    pieSeries.name = "Toggle Pie Chart";
    pieSeries.hiddenInLegend = true;
    
    var pieTemplate = pieSeries.mapImages.template;
    pieTemplate.propertyFields.latitude = "latitude";
    pieTemplate.propertyFields.longitude = "longitude";
    
    var pieChartTemplate = pieTemplate.createChild(am4charts.PieChart);
    pieChartTemplate.adapter.add("data", function(data, target) {
      if (target.dataItem) {
        return target.dataItem.dataContext.items;
      }
      else {
        return [];
      }
    });
    pieChartTemplate.propertyFields.width = "width";
    pieChartTemplate.propertyFields.height = "height";
    pieChartTemplate.horizontalCenter = "middle";
    pieChartTemplate.verticalCenter = "middle";
    pieChartTemplate.numberFormatter.numberFormat = "#";
    
    var pieTitle = pieChartTemplate.titles.create();
    pieTitle.text = "{name}";
    
    var pieSeriesTemplate = pieChartTemplate.series.push(new am4charts.PieSeries);
    pieSeriesTemplate.dataFields.category = "MODEL_YEAR";
    pieSeriesTemplate.dataFields.value = "total_wire_count";
    pieSeriesTemplate.labels.template.disabled = true;
    pieSeriesTemplate.ticks.template.disabled = true;
    
    // Put a thick white border around each Slice
    pieSeriesTemplate.slices.template.stroke = am4core.color("#ffffff");
    pieSeriesTemplate.slices.template.strokeWidth = 2;
    pieSeriesTemplate.slices.template.strokeOpacity = 0.3;
    pieSeriesTemplate.slices.template.tooltipText = "[bold]{category}[/]: {value.percent.formatNumber('#.0')}% ({value.value.formatNumber('#,###')})";
    
    // Set Pie Chart data
    var _data = $.each(gAll.groupBy(["REGION_NAME"]), function(i, v) {
        if( v.name==="Asia Pacific" ){
            v.latitude = 47.212106;
            v.longitude = 103.183594;
            v.width = 100;
            v.height = 100;
        }
        
        if( v.name==="Europe" ){
            v.latitude = 50.896104;
            v.longitude = 19.160156;
            v.width = 90;
            v.height = 90;
        }
        
        if( v.name==="North America" ){
            v.latitude = 39.563353;
            v.longitude = -99.316406;
            v.width = 120;
            v.height = 120;
        }
        
        gByModelYear.forEach(function(o) {
            var res = v.items.filter(function (item) {
            	return item.MODEL_YEAR == o.MODEL_YEAR;
            });
            
            if(!res.length){
                v.items.push({
                    REGION_NAME: v.name,
                    MODEL_YEAR: o.MODEL_YEAR,
                    total_big_wires: 0,
                    total_small_wires: 0,
                    total_wire_count: 0
                });
            }
        });
        return v;
    });
    
    pieSeries.data = _data;
    
    // Center on Pacic
    //chart.deltaLongitude = -160;
    
    // This auto-generates a legend according to each series' name and fill
    chart.legend = new am4maps.Legend();
    
    // Legend styles
    chart.legend.width = am4core.percent(90);
    chart.legend.valign = "middle";
    chart.legend.parent = chart.chartContainer;
    chart.legend.background.fill = am4core.color("#fff");
    chart.legend.background.fillOpacity = 0.05;
    chart.legend.width = 155;
    chart.legend.align = "left";
    chart.legend.padding(10, 10, 5, 10);
    chart.legend.marginLeft = 10;
    
    var markerTemplate = chart.legend.markers.template;
        markerTemplate.width = 20;
        markerTemplate.height = 20;

    var legendTitle = chart.legend.createChild(am4core.Label);
    legendTitle.text = "Regions";
    legendTitle.padding(5, 0, 5, 0);
    legendTitle.fontWeight = 800;
   
    function over(ev) {
      ev.target.mapPolygons.each(function(polygon) {
        polygon.setState("highlight");
      });
    }
    
    function out(ev) {
      ev.target.mapPolygons.each(function(polygon) {
        polygon.setState("default");
      });
    }
   
    // ------------------------------------------------------
    // // Create map polygon series
    // var series1 = chart.series.push(new am4maps.MapPolygonSeries());
    
    // // Exclude Antartica
    // series1.exclude = ["AQ"];
    
    // // Make map load polygon (like country names) data from GeoJSON
    //  series1.name = "Asia Pacific";
    // series1.useGeodata = true;
    // //series1.include = am4geodata_worldLow;
    // series1.mapPolygons.template.tooltipText = "{name}";
    // series1.mapPolygons.template.fill = am4core.color("#74B266");
    
    // // Configure series
    // // var polygonTemplate = series1.mapPolygons.template;
    // // polygonTemplate.tooltipText = "{name}";
    // // polygonTemplate.fill = am4core.color("#74B266");
    
    // // Create hover state and set alternative fill color
    // var hs = series1.mapPolygons.template.states.create("hover");
    // hs.properties.fill = am4core.color("#367B25");
    // -----------------------------------------------------
    /* Northern Europe */
    // var series1 = chart.series.push(new am4maps.MapPolygonSeries());
    // series1.name = "Northern Europe";
    // series1.useGeodata = true;
    // series1.include = ["FI", "DK", "SE", "NO", "LT", "LV", "EE", "IS"];
    // series1.mapPolygons.template.tooltipText = "{name}";
    // series1.mapPolygons.template.fill = am4core.color("#96BDC6");
    // series1.fill = am4core.color("#96BDC6");
    
    // /* Central Europe */
    // var series2 = chart.series.push(new am4maps.MapPolygonSeries());
    // series2.name = "Central Europe";
    // series2.useGeodata = true;
    // series2.include = ["AT", "CZ", "DE", "HU", "LI", "PL", "SK", "SI", "CH"];
    // series2.mapPolygons.template.tooltipText = "{name}";
    // series2.mapPolygons.template.fill = am4core.color("#81968F");
    // series2.fill = am4core.color("#81968F");
    
    // /* Eastern Europe */
    // var series3 = chart.series.push(new am4maps.MapPolygonSeries());
    // series3.name = "Eastern Europe";
    // series3.useGeodata = true;
    // series3.include = ["MD", "BY", "UA"];
    // series3.mapPolygons.template.tooltipText = "{name}";
    // series3.mapPolygons.template.fill = am4core.color("#CFB9A5");
    // series3.fill = am4core.color("#CFB9A5");
    
    // /* Southeast Europe */
    // var series4 = chart.series.push(new am4maps.MapPolygonSeries());
    // series4.name = "Southeast Europe";
    // series4.useGeodata = true;
    // series4.include = ["AL", "BA", "BG", "HR", "GR", "XK", "MK", "ME", "RO", "RS"];
    // series4.mapPolygons.template.tooltipText = "{name}";
    // series4.mapPolygons.template.fill = am4core.color("#E8CCBF");
    // series4.fill = am4core.color("#E8CCBF");
    
    // /* Western Europe */
    // var series5 = chart.series.push(new am4maps.MapPolygonSeries());
    // series5.name = "Western Europe";
    // series5.useGeodata = true;
    // series5.include = ["BE", "FR", "IE", "IT", "LU", "MC", "NL", "GB", "ES", "PT", "AD"];
    // series5.mapPolygons.template.tooltipText = "{name}";
    // series5.mapPolygons.template.fill = am4core.color("#99C78F");
    // series5.fill = am4core.color("#99C78F");
    
    // chart.legend = new am4maps.Legend();
    // chart.legend.position = "right";
    // chart.legend.align = "right";
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

    //chart.scrollbarX = new am4core.Scrollbar();
    
    //chart.cursor = new am4charts.XYCursor();
    //chart.cursor.behavior = "panX";
    
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
    var result = gByRegion;
    var chart = am4core.create("chartWireSummaryByRegion", am4charts.XYChart);
    chart.data = result;
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

// ---------------------- Small Wires --------------------------//

function displaySWByModelYearPie(callback){
    var chart = am4core.create("chartSWByMY", am4charts.PieChart3D);
    chart.data = gByModelYear; //gObjSWModelYear;
    chart.numberFormatter.numberFormat = "#";
    
    var series = chart.series.push(new am4charts.PieSeries());
    series.dataFields.value = "total_small_wires"; //"small_wire_count";
    series.dataFields.category = "MODEL_YEAR";
    //series.slices.template.tooltipText = "{category}: {value.value.totalPercent.formatNumber('#.00')}% [bold]{value.formatNumber('#,###')}[/]";
    
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
    chart.data = gByRegion; //gObjSWRegion;

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
 
function displaySWAll(callback){
    var _tw = new zsi.easyJsTemplateWriter("#footerSWAll")
            .chartCardWrapper({ id:"chartSWAll", title:"Overall" });
            
     // Create chart instance
    var chart = am4core.create("chartSWAll", am4charts.XYChart);
    chart.data = setDataSmallWires(gAll);

    // Create axes
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "year";
    categoryAxis.numberFormatter.numberFormat = "#";
    categoryAxis.title.text = "Region";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 20;
    
    var  valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = "Count";
    
    // Create series
    function createSeries(field, name) {
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.valueY = field;
        series.dataFields.categoryX = "year";
        series.name = name;
        series.columns.template.tooltipText = "{name}: [bold]{valueY.formatNumber('#,###')}[/]";
        series.tooltip.pointerOrientation = "vertical";
        
        var valueLabel = series.bullets.push(new am4charts.LabelBullet());
          valueLabel.label.text = "{valueX.formatNumber('#,###')}";
          valueLabel.label.verticalCenter = "bottom";
          //valueLabel.label.horizontalCenter = "bottom";
          //valueLabel.label.dx = 10;
          //valueLabel.label.hideOversized = false;
          //valueLabel.label.truncate = false;
        
          var categoryLabel = series.bullets.push(new am4charts.LabelBullet());
          categoryLabel.label.text = "{name}";
          categoryLabel.label.verticalCenter = "bottom";
          //categoryLabel.label.horizontalCenter = "bottom";
          //categoryLabel.label.dx = -10;
          categoryLabel.label.fill = am4core.color("#fff");
          //categoryLabel.label.hideOversized = false;
          //categoryLabel.label.truncate = false;
     }

    $.each(gAll.groupBy(["REGION_NAME"]), function(i,v) { 
        createSeries("region" + i, v.items[0].REGION_NAME);
    });

    chart.legend = new am4charts.Legend();

    setLegendSize(chart);
    
    if(callback) callback();
}

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

        // var title = chart.titles.create();
        // title.text =  o.MODEL_YEAR;
        // title.fontSize = 14;
        // title.marginBottom = 0;

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
        
        // var title = chart.titles.create();
        // title.text =  o.REGION_NAME;
        // title.fontSize = 14;
        // title.marginBottom = 0;

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

// ---------------------- Small Wire Details --------------------------//

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
    // Add data
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
    function createSeries(field, name) {
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
        var key = k.replace("_",".");
        if($.isNumeric( key )) _trend += key + '<br>';
    });
    
    var _tw = new zsi.easyJsTemplateWriter("#chartSWDtlByMY")
            .out().trendResult({ trend: _trend });

    // Add legend events
    // chart.legend.itemContainers.template.events.on("hit", function(ev) {
    //   alert("Clicked on " + ev.target.dataItem.dataContext.name);
    // });
    
    if(callback) callback();
}
 
function displaySWDtlByRegion(callback){
    var _result = [];
    $.each(gByRegion.groupBy(["REGION_NAME"]), function(i,v) { 
        console.log(v);
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
    // Add data
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
    function createSeries(field, name) {
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
        var key = k.replace("_",".");
        if($.isNumeric( key )) _trend += key + '<br>';
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
        // Add data
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
        // Add data
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
            var _wireGuage = v.wires;
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

            