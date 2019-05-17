var gAll = [];
var gRegionNames = [];
var gModelYears = [];

zsi.ready(function(){
    getAllWires(function(){
        displayMapChart();
    });
});

function getAllWires(callback){
    $.get(execURL + "dynamic_wires_usage_summary @byRegion='Y',@byMY='Y',@criteria_id=7"
    , function(data){
        if(data.rows.length > 0){
            gAll = data.rows;
            gRegionNames = gAll.groupBy(["region"]);
            gModelYears = gAll.groupBy(["model_year"]);
    
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

function displayMapChart(){
    // Set Chart data
    var _data = $.each(gAll.groupBy(["region"]), function(i, v) {
        var _region = $.trim(v.name);
        var _items = [];

        if( _region==="Asia Pacific" ){
            v.latitude = 47.212106;
            v.longitude = 103.183594;
            v.width = 130;
            v.height = 130;
        }
        
        if( _region==="Europe" ){
            v.latitude = 50.896104;
            v.longitude = 19.160156;
            v.width = 120;
            v.height = 120;
        }
        
        if( _region==="North America" ){
            v.latitude = 39.563353;
            v.longitude = -99.316406;
            v.width = 150;
            v.height = 150;
        }
        
        if(_region===""){
            v.latitude = 31.563353;
            v.longitude = -91.316406;
            v.width = 10;
            v.height = 10;
        }
        
        $.each(gModelYears, function(x, my) {
            var _count = 0;
            var _my = my.name;
            var _res = v.items.filter(function (item) {
            	return item.model_year == _my;
            });
            
             _count = _res.reduce(function (accumulator, currentValue) {
                return accumulator + currentValue.wire_count;
            }, 0);

            _items.push({
                category: _my,
                value: _count
            });
        });
        v.items = [];
        v.items = _items;
    
        return v;
    });
        
    am4core.ready(function() {
        am4core.useTheme(am4themes_animated);
        
        // Create map instance
        var chart = am4core.create("chart_map", am4maps.MapChart);
        
        // Set map definition
        chart.geodata = am4geodata_continentsLow;
        
        // Set projection
        chart.projection = new am4maps.projections.Miller();
        
        // Disable zoom and pan
        chart.maxZoomLevel = 1;
        chart.seriesContainer.draggable = false;
        chart.seriesContainer.resizable = false;
        
        // Create map polygon series
        var polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
        polygonSeries.exclude = ["antarctica"];
        polygonSeries.useGeodata = true;
        
        //Create an image series that will hold pie charts
        var pieSeries = chart.series.push(new am4maps.MapImageSeries());
        pieSeries.data = _data;
        
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
        pieSeriesTemplate.dataFields.category = "category";
        pieSeriesTemplate.dataFields.value = "value";
        pieSeriesTemplate.labels.template.disabled = true;
        pieSeriesTemplate.ticks.template.disabled = true;
    });
}