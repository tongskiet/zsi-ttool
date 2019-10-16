var gAll = [];
var gRegionNames = [];
var gModelYears = [];

zsi.ready = function(){
    //displayGraph();
    getAllWires(function(){
        displayMapChart();
    });
};

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

function getAllWires(callback){
    $.get(execURL + "dynamic_summary_sel @byRegion='Y',@byMY='Y',@criteria_id=7,@table_view_name='dbo.wires_v'"
    , function(data){
        if(data.rows.length > 0){
            gAll = data.rows;
    
            gRegionNames = sortBy(gAll.groupBy(["region_name"]), "name");
            gModelYears = sortBy(gAll.groupBy(["model_year"]), "name");
        }
        if(callback) callback();
    });
}

function displayMapChart(){
    // Set Chart data
    var _color = ["#283250","#902c2d","#d5433d","#f05440", "#fe5043", "#fe5b4f"];
    var _data = $.each(gAll.groupBy(["region_name"]), function(i, v) {
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
            
            for(; _count < _res.length; ){
                _count++;
            }
            
            //  _count = _res.reduce(function (accumulator, currentValue) {
            //     return accumulator + currentValue.wire_count;
            // }, 0);

            _items.push({
                category: _my,
                value: _count,
                color: _color[x]
            });
        });
        v.items = [];
        v.items = _items;
    
        return v;
    });
        
    am4core.ready(function() {
        am4core.useTheme(am4themes_animated);
        am4core.options.commercialLicense = true;
        
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
        
        //Animate
        pieChartTemplate.hiddenState.properties.radius = am4core.percent(0);
        pieChartTemplate.hiddenState.properties.endAngle = -90;
        
        var label = pieChartTemplate.createChild(am4core.Label);
        label.text = "{name}";
        label.align = "center";
        
        // var pieTitle = pieChartTemplate.titles.create();
        // pieTitle.text = "{name}";
        
        var pieSeriesTemplate = pieChartTemplate.series.push(new am4charts.PieSeries);
        pieSeriesTemplate.dataFields.category = "category";
        pieSeriesTemplate.dataFields.value = "value";
        pieSeriesTemplate.dataFields.isActive = "isActive";
        pieSeriesTemplate.labels.template.disabled = true;
        pieSeriesTemplate.ticks.template.disabled = true;
        pieSeriesTemplate.labels.template.text = "{value.percent.formatNumber('#.00')}%";
        
        var slice = pieSeriesTemplate.slices.template;
        slice.propertyFields.fill = "color";
        slice.propertyFields.fillOpacity = "opacity";
        //slice.propertyFields.stroke = "color";
        slice.propertyFields.strokeDasharray = "strokeDasharray";
        slice.propertyFields.tooltipText = "tooltip";
        slice.propertyFields.isActive = "pulled";
        slice.stroke = am4core.color("#dadada");
        slice.strokeWidth = 0.3;
        slice.strokeOpacity = 0.3;
    
        // Set mouse style on hover
        pieSeriesTemplate.slices.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;
        //One pulled slice
        pieSeriesTemplate.slices.template.events.on("hit", function(ev) {
            if(ev.target.dataItem.dataContext.category!=="Dummy"){
                var series = ev.target.dataItem.component;
                var category = ev.target.dataItem.category;
                var percentage = parseFloat(ev.target.dataItem.values.value.percent).toFixed(1) + "%";
                
                pieChartTemplate.clones.each(function(clone){
                    clone.series.each(function(item){
                       item.slices.each(function(slice){
                           var _ctgry = slice.dataItem.category;
                           if(_ctgry === category){
                               slice.isActive = true;
                           }else{
                               slice.isActive = false;
                           }
                       });
                    });
                });
            }
        });
    });
} 
