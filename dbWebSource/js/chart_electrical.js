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
    ,gPrmSubCategory    = ""
    ,gPrmSumUp          = ""
    ,gPrmGraphType      = ""
    ,gPrmIs3D           = false
    ,gIsStacked         = false
    ,gIsFullStacked     = false
    ,gLists             = []
    ,gWinWidth          = 0
    ,gTW                = null
    ,gPCategory         = ""
    ,boxPanel           ="#infoBoxPanel"
    ,gDataNCT           = [];
    
zsi.ready = function(){ 
    gTW = new zsi.easyJsTemplateWriter();
    gWinWidth = $(window).width();
    var _mainHeight = $("main").height() - 60;
    var _chartHeight = _mainHeight / 2;
    
    setPageTitle();
    setDefaultParams();
    displayChart();
    
    $("#chart_div").css("height", _chartHeight);
    
    $("#info").click(function() {
        if($(boxPanel).is(":hidden")){
            $(boxPanel).show();
        }else{
            $(boxPanel).hide();
        }
    
        var _groupYearData = gData.groupBy(["model_year"]);
        var _h="";
        $.each(_groupYearData, function(i,y){ 
            _h+= "<b> Model Year</b>: " + y.name + "<br />";
            $.each(y.items.groupBy(["project_name"]), function(i,x){ 
                _h+= "&nbsp;&nbsp;" + x.name.replace(y.name,"") + "<br />";
            });
            _h+= "" + '&nbsp' + "<br />";
        });
        $(boxPanel).find(".infoText").html(_h);
    });
    
    $(document).mouseup(function(e){
        if($(e.target).attr("id") !== "info" && $(e.target).closest(boxPanel).length === 0) $(boxPanel).hide();
    });
};

function getUserAccess(callBack){
    $.get(procURL + "user_role_access" 
    ,function(data){
        var info = data.rows[0];
        if(typeof callBack !== ud) callBack(info);
    });
}

function setPageTitle(){
    gMenu = removeSpecialChar(gMenu).toUpperCase();
    gCName = removeSpecialChar(gCName);
    
    $("#menu_name").text(gMenu);
    $("#criteria_name").text(gCName);
} 

function createTableFromJSON(json) {
    for (json, o = [], r = 0; r < json.length; r++)
        for (var t in json[r]) - 1 === o.indexOf(t) && o.push(t);
    var n = document.createElement("table"),
        a = n.insertRow(-1);
    for (r = 0; r < o.length; r++) {
        var i = document.createElement("th");
        var _title = o[r].replace(/_/g," ").toUpperCase();
        i.innerHTML = _title, a.appendChild(i);
    }
    for (r = 0; r < json.length; r++) {
        a = n.insertRow(-1);
        for (var c = 0; c < o.length; c++) {
            a.insertCell(-1).innerHTML = json[r][o[c]];
        }
    }
    return n.outerHTML;
}

function convertDecimalToString(value){
    return " " + parseFloat(value).toFixed(6);
}

function downloadGraphSummary(btn){
    var o = getPieChartData();
    var _selectedCategory = gModelYears; //Default category selected
    
    if(gPrmCategory==="Region"){
        _selectedCategory = gRegionNames;
    }else if(gPrmCategory==="Vehicle Type"){
        _selectedCategory = gVehicleTypes;
    }else if(gPrmCategory==="OEM"){
        _selectedCategory = gOEMs;
    }else if(gPrmCategory==="Market"){
        _selectedCategory = gMarket;
    }

    var _html = "<table>";
    var _data = o.data;
    var _location = o.location;
    var _length = _selectedCategory.length;
    var _categoryKeyObj = (_location ? gLocations: gCategories);
    var _projNames = gData.groupBy(["project_name"]);
    var _paramValue = $("#param_box").find("select").val();

    if(gPrmCategory==="Region" || gPrmCategory==="Market"){
        var _columnName = (gPrmCategory==="Region" ? "region_name" : "market_name");
        var _rowspan = (_location) ? 2 : 1;
        var _myLength = gModelYears.length;

        //Table Header
        if(isContain(gCName, "Power Distribution Box Counts")){
            //Table Header
            _html +="<thead>"
                    +"<tr>"
                        +"<th class='text-center' >Region</th>"
                        +"<th class='text-center'>Model Year</th>";
                        $.each(_categoryKeyObj, function(i, v){
                            var _title = "";
                            var _ret = _data.filter(function(item){
                                return item.category == v.name && item.color != "gray";
                            });
                            if(_ret.length > 0) _title = v.name;
                            _html += "<th class='text-center'>"+ _title +"</th>";
                        });
            _html += "<th class='text-center'>Total Count</th>"
                    +"</tr>"
                +"</thead>";
                
            //Table Body
            _html += "<tbody>"; 
                    $.each(_selectedCategory, function(i, rm){
                        var _rm = rm.name;
                        _html += "<tr>"
                                + "<td class='text-center' rowspan="+ _myLength +">"+ _rm +"</td>";
                        
                        $.each(gModelYears, function(i, my){
                            var _total = 0;
                            var _my = my.name;
                            _html += "<td class='text-right'>"+ _my +"</td>";
                            
                            $.each(_categoryKeyObj, function(i, x){
                                var _cValue = 0;
                                var _cName = x.name;
                                
                                $.each(_projNames, function(ii, vv){
                                    var _res = my.items.filter(function(item){ 
                                        return item[_columnName] == _rm && item.alias_name == _cName && item.project_name == vv.name;
                                    });
                                    
                                    if(_res.length > 0) _cValue++;
                                });
                                
                                $.map(_data, function(item){
                                    if(item.region == _rm && item.group == _my && item.category ==_cName){
                                        item.value = _cValue;
                                    }
                                    return item;
                                });
                                
                                var _res2 = _data.filter(function(item){
                                    return item.region == _rm && item.group == _my && item.category == _cName;
                                });
                                        
                                if(_res2.length > 0 && _res2[0].color!="gray"){
                                        _total += _cValue;
                                        _html += "<td class='text-right'>"+ _cValue +"</td>";
                                }else{
                                    if(_res2.length > 0) _cValue = _res2[0].value;
                                    
                                    _total += _cValue;
                                    _html += "<td class='text-right'>"+ _cValue +"</td>";
                                }
                            });
                            
                            _html += "<th class='text-right'>"+ _total +"</th>";
                            _html += "</tr>";
                        }); 
                    });
            _html += "</tbody>";
            
        }else{
            //Table Header
            _html +="<thead>"
                    +"<tr>"
                        +"<th class='text-center' rowspan="+_rowspan+">Region</th>"
                        +"<th class='text-center' rowspan="+_rowspan+">Model Year</th>";
                        $.each(_categoryKeyObj, function(i, v){
                            var _rSpan = (_location ? (v.color=="gray") ? 2 : 1 : 1);
                            var _cSpan = (_location ? (v.color=="gray") ? 1 : gCategories.length : 1);
                            
                            if(isContain(gCName, "Dedicated Grounding Design Strategy")){
                                _rSpan = 2;
                                _cSpan = 1;
                            }
                            if(isContain(gCName, "Power Distribution Box Counts")){
                                _cSpan = 1;
                            }
                            if(isContain(gCName, "Power Distribution Boxes Dimensions")){
                                _cSpan = v.items.groupBy([o.category]).length;
                            }
                            _html += "<th class='text-center' rowspan="+_rSpan+" colspan="+ _cSpan +">"+ v.name +"</th>";
                        });
                _html += "<th class='text-center' rowspan="+_rowspan+">Total Count</th>"
                    +"</tr>"
                    +"<tr>";
                    if(_location && !isContain(gCName, "Dedicated Grounding Design Strategy")){
                        $.each(_categoryKeyObj, function(i, v){
                            if(v.color!="gray"){
                                if(isContain(gCName, "Power Distribution Boxes Dimensions")){
                                    var _res = v.items.groupBy([o.category]);
                                    $.each(_res, function(i, c){
                                        _html += "<th class='text-center'>"+ c.name +"</th>";
                                    });
                                }else{
                                    $.each(gCategories, function(i, c){
                                        _html += "<th class='text-center'>"+ c.name +"</th>";
                                    });
                                }
                            }
                        });
                    }
            _html += "</tr>"
                +"</thead>";
               
            //Table Body
            _html += "<tbody>"; 
                    $.each(_selectedCategory, function(i, rm){
                        var _rm = rm.name;
                        _html += "<tr>"
                                + "<td class='text-center' rowspan="+ _myLength +">"+ _rm +"</td>";
                        
                        $.each(gModelYears, function(i, my){
                            var _total = 0;
                            var _my = my.name;
                            _html += "<td class='text-right'>"+ _my +"</td>";
                            
                            $.each(_categoryKeyObj, function(i, x){
                                var _cValue = 0;
                                var _cName = x.name;
                                var _res2 = _data.filter(function(item){
                                    return item.region == _rm && item.group == _my && item.category == _cName;
                                });
                                        
                                if(_location && !isContain(gCName, "Dedicated Grounding Design Strategy")){
                                    if(x.color!="gray"){
                                        if(isContain(gCName, "Power Distribution Boxes Dimensions")){
                                            var _res = x.items.groupBy([o.category]);
                                            $.each(_res, function(i, y){
                                                var _sValue = 0;
                                                var _sName = y.name;
                                                
                                                if(_res2.length > 0){
                                                    var _res3 = _res2[0].subs.filter(function(item){
                                                        return item.category == _sName;
                                                    });
                                                    
                                                    if(_res3.length > 0) _sValue = _res3[0].value;
                                                }
                                                _total += _sValue;
                                                
                                                _html += "<td class='text-right'>"+ _sValue +"</td>";
                                            });
                                        }else{
                                            $.each(gCategories, function(i, y){
                                                var _sValue = 0;
                                                var _sName = y.name;
                                                
                                                if(_res2.length > 0){
                                                    var _res3 = _res2[0].subs.filter(function(item){
                                                        return item.category == _sName;
                                                    });
                                                    
                                                    if(_res3.length > 0) _sValue = _res3[0].value;
                                                }
                                                _total += _sValue;
                                                
                                                _html += "<td class='text-right'>"+ _sValue +"</td>";
                                            });
                                        }
                                    }else{
                                        if(_res2.length > 0) _cValue = _res2[0].value;
                                        
                                        _total += _cValue;
                                        _html += "<td class='text-right'>"+ _cValue +"</td>";
                                    }
                                }else{
                                    if(_res2.length > 0) _cValue = _res2[0].value;
                                    
                                    _total += _cValue;
                                    _html += "<td class='text-right'>"+ _cValue +"</td>";
                                }
                            });
                            
                            _html += "<th class='text-right'>"+ _total +"</th>";
                            _html += "</tr>";
                        }); 
                    });
            _html += "</tbody>";
        }
    }
    else{
        //Table Header    
        _html +="<thead>"
                    +"<tr>"
                        +"<th class='text-center' rowspan=2>Criteria</th>"
                        +"<th class='text-center' colspan="+ _length +">"+ gPrmCategory +"</th>"
                    +"</tr>"
                    +"<tr>";
                    $.each(_selectedCategory, function(i, v){
                         _html += "<th class='text-center'>"+ v.name +"</th>";
                    });
            _html += "</tr>";
            
            if(isContain(gCName, "New Conductor Technology")){
                var _title = (isContain(gCName, "lesser weight")) ? "AVG WEIGHT" : "AVG DIA";
                _html += "<tr>"
                        +"<th class='text-center'>"+ _paramValue +"</th>";
                        $.each(_selectedCategory, function(i, v){
                            _html += "<th class='text-center' >"+ _title +"</th>";
                        });
                _html += "</tr>";
            }
            
            _html += "</thead>";
               
            var _thead = _html; 
            //Table Body
            _html +="<tbody>"; 
                $.each(_categoryKeyObj, function(i, cat){
                    var _total = 0;
                    var _ctr = 0;
                    var _cName = cat.name;
                    var _cItems = cat.items;
                    var _ret = _data.filter(function(item){
                        return item.category ==_cName && item.color != "gray";
                    });
                    
                    if(isContain(gCName, "Power Distribution Box Counts")){
                        if(i > 0) _html += _thead;
                        
                        _html += "<tr>"
                            +"<th>"+ _cName +"</th>";
                        
                        $.each(_selectedCategory, function(i, v){
                            var _val = 0;
                            if(_ret.length > 0){
                                $.each(_projNames, function(ii, vv){
                                    var _res2 = v.items.filter(function(item){
                                        return item.alias_name == _cName && item.project_name == vv.name;
                                    });
                                    
                                    if(_res2.length > 0) _val++;
                                });
                                
                                $.map(_data, function(item){
                                    if(item.group == v.name && item.category ==_cName){
                                        item.value = _val;
                                    }
                                    return item;
                                });
                            }
                             
                            _total += _val;
                            _html += "<th class='text-right'>"+ _val +"</th>";
                            
                            _ctr++;
                            if(_ctr === _length){
                                _html +="</tr>";
                                
                                if(_location && _ret.length > 0){
                                    $.each(_cItems, function(i, x){
                                        _html += "<tr>"
                                                +"<td colspan='"+ (_length + 1) +"'>"+ x.second_label +"</td>";
                                        _html += "</tr>";
                                    });
                                }
                            }
                        });
                    }else if(isContain(gCName, "New Conductor Technology")){
                        _html += "<tr>"
                            +"<td>"+ _cName +"</td>";
                            
                        $.each(_selectedCategory, function(i, v){
                            var _val = 0;
                            var _res = gDataNCT.filter(function(item){ 
                                return item.group == v.name && item.category == _cName;
                            });
                            if( _res.length > 0 ) _val = _res[0].value;
                            
                            _html += "<td class='text-right'>"+ convertDecimalToString(_val) +"</td>";
                        });
                    }else{   
                        _html += "<tr>"
                            +"<th>"+ _cName +"</th>";
                            
                        $.each(_selectedCategory, function(i, v){
                            var _val = 0;
                            var _res = _data.filter(function(item){
                                return item.group == v.name && item.category == _cName;
                            });
                            
                            if(_res.length > 0) _val = _res[0].value;
                            
                            _total += _val;
                            _html += "<th class='text-right'>"+ _val +"</th>";
                            
                            _ctr++;
                            if(_ctr === _length){
                                _html +="</tr>";
                                
                                if(_location && _ret.length > 0 && !isContain(gCName, "Dedicated Grounding Design Strategy")){
                                    $.each(gCategories, function(i, x){
                                        var sName = x.name;
                                        var _getHtml = function(){
                                            _html += "<tr>"
                                                +"<td>"+ sName +"</td>";
                                                
                                                $.each(_selectedCategory, function(i, y){
                                                    var _sVal = 0;
                                                    var _res2 = _data.filter(function(item){
                                                        return item.group == y.name && item.category == _cName && item.subs.length > 0;
                                                    });
                                                    
                                                    if(_res2.length > 0){
                                                        var _res3 = _res2[0].subs.filter(function(item){
                                                            return item.category == sName;
                                                        });
                                                        if(_res3.length > 0) _sVal = _res3[0].value;
                                                    }
                                                    _html += "<td class='text-right'>"+ _sVal +"</td>";
                                                });
                                            _html += "</tr>";
                                        };
                                        
                                        if(isContain(gCName,"Power Distribution Boxes Dimensions")){
                                            var _result = _cItems.filter(function(item){
                                               return item[o.category] == sName;
                                            });
                                            if(_result.length > 0){
                                                _getHtml();
                                            }
                                        }else{
                                            _getHtml();
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
        _html += "</tbody>";
        
        //Table Footer
        if(isContain(gCName, "New Conductor Technology")){
            var _lower = "LOWER DIAMETER LIMIT";
            var _upper = "UPPER DIAMETER LIMIT";
            
            if(isContain(gCName, "lesser weight")){
                _lower = "WIRE LL";
                _upper = "WIRE UL"
            }
            
            _html += "<tfoot>"
                + "<tr>"
                + "<th>"+ _lower +"</th>";
                $.each(_selectedCategory, function(i, z){
                    var _val = 0;
                    var _res = gDataNCT.filter(function(item){ return item.group == z.name });
                    if( _res.length > 0) _val = _res[0].lower;
                    
                    _html += "<th class='text-right'>"+ convertDecimalToString(_val) +"</th>";
                });
            _html += "</tr>"
                    + "<tr>"
                + "<th>"+ _upper +"</th>";
                $.each(_selectedCategory, function(i, z){
                    var _val = 0;
                    var _res = gDataNCT.filter(function(item){ return item.group == z.name });
                    if( _res.length > 0) _val = _res[0].upper;
                    
                    _html += "<th class='text-right'>"+ convertDecimalToString(_val) +"</th>";
                });
            _html += "</tr></tfoot>";
        }else{
            _html += "<tfoot>"
                + "<tr>"
                + "<th>TOTAL COUNT</th>";
                $.each(_selectedCategory, function(i, z){
                    var _totalVal = 0;
                    var _res4 = _data.filter(function(item){
                        return item.group == z.name;
                    });
                    if(isContain(gCName, "Power Distribution Box Counts") || isContain(gCName, "Multi-weld Eyelets crimping specifications")){
                        $.each(_res4, function(i, v){
                           _totalVal += v.value; 
                        });
                    }else{
                        _totalVal = getCount(_res4, "value");
                    }
                    _html += "<th class='text-right'>"+ _totalVal +"</th>";
                });
            _html += "</tr></tfoot>";
       }
    }
    _html += "</table>";
    
    zsi.htmlToExcel({
      html     : _html
      ,fileName : gCName +" - Summary"
    });
}

function downloadGraphData(btn){
    getUserAccess(function(info){
        if(info.is_admin!=="Y"){
            gData.forEach(function(v){ delete v.line_no });
        }
        zsi.htmlToExcel({
           html     : createTableFromJSON(gData)
          ,fileName : gCName + " - Reference_Data"
        });
    });
}

function setDefaultParams(){
    gMYTo = new Date().getFullYear();
    gMYFrom = gMYTo - 2;
    gPrmSumUp = 1;
    gPrmCategory = "Model Year";
    gPrmGraphType = "";
    
    $("#my_from").val(gMYFrom);
    $("#my_to").val(gMYTo);
}

function filterGraphData(e){
    gData = [];
    gLegendData = [];
    gLists = [];
    gIsStacked = false;
    gIsFullStacked = false;
    gMYFrom = parseInt($("#my_from").val());
    gMYTo = parseInt($("#my_to").val());
    gPrmSumUp = parseInt($("#sum_by").val());
    gPrmCategory = $("#category").val();
    gPrmSubCategory = $("#sub_category").val();
    gPrmGraphType = $("#graph_type").val();
    gPrmIs3D = $("#is_3D").is(":checked");
    gPrmSumUp = (gPrmSumUp ? gPrmSumUp : 1);
 
    if(gMYFrom > gMYTo){
        alert("Opps! Invalid range of year.");
    }else if(gPrmGraphType==="map" && gPrmCategory!=="Region" && gPrmCategory!=="Market"){
        alert("Map graph is not applicable for this category.");
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

        initGlobalData(function(){
            var _setSubCategory = function(category){
                var _d = [];
                var _$subCategory = $("#sub_category");
                var _$subCategoryWrap = $("#wrap_sub_category");
                var _selected = _$subCategory.val();
                if( category !== "Model Year" ){
                    if( category === "Region" ){
                        _d = gRegionNames;
                    }else if( category === "Market" ){
                        _d = gMarket;
                    }else if( category === "Vehicle Type" ){
                        _d = gVehicleTypes;
                    }else if( category === "OEM" ){
                        _d = gOEMs;
                    }
                    
                    _$subCategory.fillSelect({
                        data : _d,
                        text : "name",
                        value : "name",
                        selectedValue : _selected,
                        onComplete: function(){}
                    });
                    _$subCategoryWrap.removeClass("d-none");
                }else{
                    _$subCategory.val("");
                    _$subCategoryWrap.addClass("d-none");
                }
            };
            
            //Display Sub Category
            _setSubCategory(gPrmCategory);
            $("#category").unbind().change(function(){
                _setSubCategory($.trim(this.value));
            });
            
            callback();
        });  
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
        
        //GET CHART LIST
        $.get(procURL + "criteria_graphs_sel @criteria_id=" + gCId
        , function(d){
            if(d.rows.length > 0){
                var _charts = sortBy(d.rows, "seq_no");
                    _charts = $.map(_charts, function(v){
                        v.graph_type = $.trim(v.graph_type);
                        return v;
                    });
                    
                gPrmGraphType = (!gPrmGraphType) ? _charts[0].graph_type : gPrmGraphType;
                
                $("#graph_type").fillSelect({
                    data : _charts,
                    text : "graph_type",
                    value : "graph_type",
                    selectedValue : gPrmGraphType,
                    onComplete: function(){
                        $(this).find("option").each(function() {
                            var _$this = $(this);
                            if(this.text){
                                _$this.text(this.text.charAt(0).toUpperCase() + this.text.slice(1));
                            }else{
                                _$this.remove();
                            }
                        });
                    }
                });
            }
            if(callback) callback();
        });
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
        var _region = _key.region;
        var _modelYear = _key.model_year;
        var _vehicleType = _key.vehicle_type;
        var _oem = _key.oem;
        var _market = _key.market;
    
        if(isContain(gCName, "New Conductor Technology with lesser weight")){
            gData = gData.filter(function(item){ return $.trim(item.conductor_type)=="BARE COPPER" });
        }
 
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
            
            if(gMenu==="WIRES & CABLES" && (!isUD(v.qweight) || !isUD(v.avg_weight))){
                v.qweight = convertDecimalToString(v.qweight);
                v.avg_weight = convertDecimalToString(v.avg_weight);
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
                            v.color = getCategoryColor(v.name);
                            if(v.name===">= 5 CSA"){
                                v.color = "gray";
                            }
                        }
                        return v;
                    });
        gCategories = $.map(sortBy(gData.groupBy([_category]), "name"), function(v, i){
                        if(v.name){
                            v.color = getCategoryColor(v.name);
                            if(v.name===">= 5 CSA"){
                                v.color = "gray";
                            }
                        }
                        return v;
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
        
        // console.log("gModelYears", gModelYears);
        // console.log("gRegionNames", gRegionNames);
        // console.log("gLocations", gLocations);
        // console.log("gCategories", gCategories);
        // console.log("gHarness", gHarness);
        // console.log("gData", gData);
        
        callback();    
    });
}

function setCriteriaParams(callback){
    var _ctr = 0;
    if(gCriteriaParams.length > 0){
        $.each(gCriteriaParams, function(i, v){
            var _selectedValue = "";
            var _paramLabel = $.trim(v.param_label).toUpperCase();
            var _columnName = $.trim(v.column_name).toLowerCase();
            var _groupData = sortBy(gData.groupBy([_columnName]), "name").filter(function(item){ return item.name !== "" });
            
            if(!$("#param_box").html()){
                var _tw = new zsi.easyJsTemplateWriter("#param_box");
                    _tw.param({ param_label: _paramLabel, column_name: _columnName });
                    
                if(isContain(gCName, "New Conductor Technology with lesser weight") || isContain(gCName, "New Conductor Technology with lesser dimensions")){
                    _selectedValue = "0.75";
            
                    //$("#option_box").find("select:not(#my_from, #my_to), input").attr("disabled", true);
                    $("#option_box").find("#sum_by, #category").attr("disabled", true);
                    $("#param_box").find("select, input").attr("disabled", false);
                }
                if(isContain(gCName, "Fuse to Wire Matching")){
                    _selectedValue = "10";
                }
            }
            if(!_selectedValue) _selectedValue = $.trim($("#" + _columnName).val());
            
            var _res = _groupData.filter(function(item){ return item.name == _selectedValue});
            if(_selectedValue && _res.length > 0){
                gData = gData.filter(function(item){
                    return item[_columnName] == _selectedValue;
                });
            }
            
            $("#" + _columnName).fillSelect({
                data : _groupData,
                text : "name",
                value : "name",
                selectedValue : _selectedValue,
                onComplete: function(){
                    if(isContain(gCName, "Dedicated Grounding Design Strategy")){
                        $("option:first-child", this).text("ALL DEVICES");
                    }
                    
                    if(isContain(gCName, "Power Distribution Boxes")){
                        $("option:first-child", this).text("ALL");
                    }
                }
            });
            
            _ctr++;
            if(_ctr == gCriteriaParams.length){
                callback();   
            }
        });
    }else{
        callback();
    }
}

function getChartSettings(){
    var _url = "";
    var _result = {};
    var _param = ",@byMy='Y'";
    var _graph = "";
    var _chart = {};
    var _$legendWrapper = $(".legend-wrapper");
        _$legendWrapper.show(); 

        _chart.default = "displayComPieChart(container)";
        _chart.column = "displayComColumnChart(container)";
        _chart.bar = "displayComBarChart(container)";
        _chart.line = "displayComLineChart(container)";
        _chart.map = "displayComMapChart(container)";
        
    if(gPrmCategory==="Region" || gPrmCategory==="Market" || gPrmSubCategory!==""){
        _chart.default = "displayComPieRegionChart(container)";
        _chart.column = "displayComColumnRegionChart(container)";
        _chart.bar = "displayComBarRegionChart(container)";
        _chart.line = "displayComLineRegionChart(container)";
    }
    
    if(isContain(gMenu, "WIRES & CABLES")){
        if(isContain(gCName, "New Conductor Technology with lesser dimensions")){
            _chart.default = "displayNCTLesserDimensions(container)";
            _chart.column = "";
            _chart.bar = "";
            _chart.line = "displayNCTLesserDimensions(container)";
            
            _$legendWrapper.hide(); 
        }
        else if(isContain(gCName, "New Conductor Technology with lesser weight")){
            _chart.default = "displayNCTLesserWeight(container)";
            _chart.column = "";
            _chart.bar = "";
            _chart.line = "displayNCTLesserWeight(container)";
            
            _$legendWrapper.hide(); 
        }
    }
    
    if(gPrmGraphType==="column" || gPrmGraphType==="bar" || gPrmGraphType==="stacked" || gPrmGraphType==="stacked Full"){
        _graph = _chart.column;
        if(gPrmGraphType==="bar"){
            _graph = _chart.bar;
        }
        
        if(gPrmGraphType==="stacked" || gPrmGraphType==="stacked Full"){
            gIsStacked = true;
            
            if(gPrmGraphType==="stacked Full"){
                gIsFullStacked = true;
            }
        }
    }else if(gPrmGraphType==="line" || gPrmGraphType==="area" || gPrmGraphType==="scatter"){
        _graph = _chart.line;    
    }else if(gPrmGraphType==="map"){
        _graph = _chart.map; 
    }else{
        _graph = _chart.default;
    }
    
    if(gPrmCategory==="Region"){
        _param = ",@byRegion='Y',@region_id='"+ gPrmSubCategory +"'";
    }else if(gPrmCategory==="Vehicle Type"){
        _param = ",@byVehicle_type='Y',@Vehicle_type_id='"+ gPrmSubCategory +"'";
    }else if(gPrmCategory==="OEM"){
        _param = ",@byOEM='Y',@oem_id='"+ gPrmSubCategory +"'";
    }else if(gPrmCategory==="Market"){
        _param = ",@byMarket='Y',@market_id='"+ gPrmSubCategory +"'";
    }
    
    _result.url = "dynamic_summary_sel @criteria_id="+ gCId +",@model_year_fr="+ gMYFrom +",@model_year_to="+ gMYTo + _param;
    _result.chart = _graph;
    
    return _result;
}

function displayChart(){
    getMathFunc(function(){
        getCriteriaParams(function(){
            getLegendData(function(){
                
                var _res = getChartSettings();
                getData(_res.url, function(){
                    $("#chart_wrapper_details, #btnReset").addClass("d-none");
                    $("#chart_div, #chart_details, #trends, #opportunities, #sunburst_details, #bar_details, #sub_legend_div").empty().width("auto").height("auto");
                    $("#sunburst_details, #bar_details").addClass("d-none").removeClass("d-flex");
                    $("#chart_details_graph").val("sunburst");
                    
                    if(gData.length > 0){
                        // CHART SETTINGS
                        am4core.useTheme(am4themes_animated);
                        am4core.options.commercialLicense = true;
                        
                        var _fnName = new Function("container", _res.chart);
                            _fnName("chart_div");
                    }else{
                        new zsi.easyJsTemplateWriter("#chart_div").noData();
                    }
                });
            });
        });
    });
}

//******************************* CHART FUNCTION *****************************//
function removeDuplicateLegend(chart, cb){
    if(gPrmGraphType==="pie" && isContain(gCName, "Power Distribution Box Counts")){
        var _lData = chart.legend.data;
        var _group = gData.groupBy(["project_name"]);
        var _newLegend = [];
        console.log(_lData)
        _lData.map(function(item){
            $.each(_group, function(i, v){
                if(item.category.indexOf(v.name) !== -1){
                    item.dataContext.category = v.name;
                }
            });
            item.dataContext.fill = item.dataContext.color;
            _newLegend.push(item.dataContext)
            return item;
        });
       
        chart.legend.data = _newLegend.getUniqueRows(["category"]);
        
        setTimeout(function() {
            cb(chart.legend.contentHeight);
        }, 100);
    }
}

function setLegend(charts){
    var _legend = [];
    var _chart = [];
    var _ctr = 0;

    if(isUD(charts.className)){
        $.each(charts, function(i, v){
            var _cData = v.data;
            var _res = _cData.filter(function(item){ return item.category!=="Dummy" });
            if(_res.length > 0 && _cData.length >= _legend.length){
                _chart = v;
                _legend = _cData;
            }
            _ctr++;
            
            if(_ctr === charts.length && _chart.length === 0){
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
    
    var _$chart = $("#chart_div");
    var _$legend = $("#legend_div");
    var _$legendWrap = $(".legend-wrapper");
    var _legendContainer = function(){
        var legendContainer = am4core.create("legend_div", am4core.Container);
        legendContainer.width = am4core.percent(100);
        legendContainer.height = am4core.percent(100);
        _chart.legend.parent = legendContainer;
    };
    var _resizeLegend = function(ev) {
        setTimeout(function() {
            var _contHeight = _chart.legend.contentHeight;
            _$legend.height(_contHeight);
            _legendContainer();
            _$chart.css("margin-bottom", (_contHeight > 120 ? 120 : _contHeight ) + "px");
            
            removeDuplicateLegend(_chart, function(h){
                //_$legend.height(h);
                //_legendContainer();
                //_$chart.css("margin-bottom", (h > 120 ? 120 : h ) + "px");
            });
        }, 100);
    };
    
    if(isContain(gCName, "Power Distribution Box Counts")){
        //_chart.legend.data = o.legend;
    }
    
    _legendContainer();
    _chart.events.once("datavalidated", _resizeLegend);
    _chart.events.once("maxsizechanged", _resizeLegend);

    setTimeout(function() {
        if(gPrmCategory!=="Region" && $('main').height() < $('main').prop('scrollHeight') && charts.length <= 3 && $(window).height() <= 625){
            _$legendWrap.css("bottom", 0);
            _$chart.width(_$chart.width() - 13);
        }
    },250);
   
    if(charts.length > 3){
        _$legendWrap.css("bottom", 16);
        $('.chart-wrapper').removeClass("overflow-hidden");
    }else{
        _$legendWrap.css("bottom", 0);
        $('.chart-wrapper').addClass("overflow-hidden");
    }
}

function setSubLegend(chart, o){
    console.log(o);
    /* Create legend */
    chart.legend = new am4charts.Legend();
    chart.legend.labels.template.fontSize = 10;
    chart.legend.valueLabels.template.fontSize = 10;
    chart.legend.itemContainers.template.paddingTop = 5;
    chart.legend.itemContainers.template.paddingBottom = 5;
    chart.legend.itemContainers.template.hoverable = false;
    chart.legend.itemContainers.template.clickable = false;
    chart.legend.itemContainers.template.focusable = false;
    chart.legend.itemContainers.template.cursorOverStyle = am4core.MouseCursorStyle.default;
    
    var markerTemplate = chart.legend.markers.template;
    markerTemplate.width = 10;
    markerTemplate.height = 10;
    markerTemplate.strokeWidth = 0;
    
    /* Create a separate container to put legend in */
    var _subLegendId = "sub_legend_div";
    var _legendContainer = function(){
        var legendContainer = am4core.create(_subLegendId, am4core.Container);
        legendContainer.width = am4core.percent(100);
        legendContainer.height = am4core.percent(100);
        chart.legend.parent = legendContainer;
    };
    var _resizeLegend = function(ev) {
        setTimeout(function() {
            _legendContainer();
            document.getElementById(_subLegendId).style.height = chart.legend.contentHeight + "px";
        }, 100);
    };
    
    if(isContain(gCName, "Power Distribution Box Counts")){
        chart.legend.data = o.legend;
    }
    
    _legendContainer();
    chart.events.on("datavalidated", _resizeLegend);
    chart.events.on("maxsizechanged", _resizeLegend);
}

function getCategoryColor(name){
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

function setTrends(data, category){
    var _aTrends=[];
    var _aBestpractice=[];
    var _aEvolution=[];
    var _display = function($obj,arr){
        $obj.empty();
        $.each(arr,function(i,v){    
            if(gPrmCategory==="Region" || gPrmCategory==="Market"){
                var _ctgry = (gPrmCategory==="Region" ? gRegionNames : gMarket);
                $.each(_ctgry, function(ii, vv){
                    var _name = vv.name;
                    if(!isUD(v[_name])){
                        var _res = v[_name].map(function (item) {
                                        	return '<li>' + item + '</li>';
                                        }).join('');

                        var _html = '<ul class="mb-0">' + _res + '</ul>';
                        if(gPrmSubCategory==="" && _res!=="") _html = _name + _html;
                        
                        $obj.append(_html);
                    }
                });
            }else{
                if(gPrmSubCategory!=="" || gPrmCategory==="Model Year"){
                    $obj.append(v + "<br />");
                }
            }
        });
    }    

    if(data.length > 0){
        var _group = [];
        var _group2 = [];
        var _aTmpTrends = [];
        var _aTmpBestpractice=[];
        var _aTmpEvolution=[];
        var _column = "";
        
        if(gPrmGraphType=="pie"){
            _column = "region";
            _group = data.groupBy(["group"]).sortBy("name");
            var _getCriteriaPrecentage = function(data){
                var arr=[];
                $.each(data,function(i,v){
                    var _total = 0
                  
                    $.each(this.items,function(i,v){
                         _total +=this.value;
                    });
                
                    $.each(this.items,function(i,v){
                        var _legend = gLegendData.filter(function(x){  
                      			return x.alias == v.category || x.legend_label == v.category ;
                        })[0];
                      
                        //collect only non-grayout
                        if(_legend){
                            if((_legend.grayed_out!=="Y") && this.value > 0 ){
                                arr.push({
                                     "category": this.category,
                                     "group": this.group,
                                     "percent": (this.value/_total) * 100,
                                     "count": this.value
                                });
                            }
                        }
                        else{
                            if(this.value > 0){ 
                                arr.push({
                                     "category": this.category,
                                     "group": this.group,
                                     "percent": (this.value/_total) * 100,
                                     "count": this.value
                                });
                            }
                        }
                    });
                });
                return arr;
            };
        }
        else{
            _column = "group";
            _group = data;
            var _getCriteriaPrecentage = function(data){
                var arr=[];
                $.each(data,function(i,v){
                    var _total = 0
                    
                    $.each(category,function(ii,vv){
                        _total += v[vv.name.replace(/ /g, "_")];
                    });
                
                    $.each(category,function(ii,vv){
                        var _cName = vv.name;
                        var _cNameNew = _cName.replace(/ /g, "_");
                        var _legend = gLegendData.filter(function(x){  
                      			return x.alias == _cName || x.legend_label == _cName;
                        })[0];
       
                        //collect only non-grayout
                        if(_legend){
                            if((_legend.grayed_out!=="Y") && v[_cNameNew] > 0 ){
                                arr.push({
                                     "category": _cName, 
                                     "group": v.category,
                                     "percent": (v[_cNameNew]/_total) * 100,
                                     "count": v[_cNameNew]
                                });
                            }
                        }
                        else{
                            if(v[_cNameNew] > 0){ 
                                arr.push({
                                     "category": _cName, 
                                     "group": v.category,
                                     "percent": (v[_cNameNew]/_total) * 100,
                                     "count": v[_cNameNew]
                                });
                            }
                        }
                    });
                });

                return arr;
            };
        }
        
        if(gPrmCategory==="Region" || gPrmCategory==="Market"){
            var _tmpJson = [];
            var _getDataByRegion = function(name, items){
                var _jsonTrend = {};
                var _jsonBestpractice = {};
                var _jsonEvolution = {};
                var _tmpObj = [];
                    _aTmpTrends = [];
                    _aTmpBestpractice = [];
                    _aTmpEvolution = [];
                    
                var _items = (gPrmGraphType=="pie" ? items.groupBy(["group"]).sortBy("name") : items);
                var _items2 = [];
                
                if(_items.length > 3){
                    _items2 = _items.slice(_items.length-3,_items.length);
                }else{
                    _items2 = _items;
                }
            
                if(_items.length > 2) 
                    _items = _items.slice(_items.length-2, _items.length);

                var _trendCriteria              = _getCriteriaPrecentage(_items);
                var _bestPracticeCriteria       = _getCriteriaPrecentage(_items2); 
                var _evolution                  = _bestPracticeCriteria;
                
                var _trendGroupCategory         = _trendCriteria.groupBy(["category"]);
                var _bestPracticeGroupCategory  = _bestPracticeCriteria.groupBy(["category"]);
                var _evolutionGroupCategory     = _bestPracticeGroupCategory;
                
                //-----------------Trends----------------//
                $.each(_trendGroupCategory,function(i,v){
                    //compare 2 data for trends
                    if(v.items.length > 1){
                        var info1 = v.items[v.items.length-2];
                        var info2 = v.items[v.items.length-1];
                		if(parseFloat(info2.percent) > parseFloat(info1.percent)){
                		     _aTmpTrends.push(v.name);
                        }else if(parseFloat(info2.percent) === parseFloat(info1.percent) && parseFloat(info2.count) > parseFloat(info1.count)){
                            _aTmpTrends.push(v.name);
                        }
                    }
                });
                _jsonTrend[name] = _aTmpTrends;
                _aTrends.push(_jsonTrend);
                
                //----------------Best Practice---------------//
                $.each(_bestPracticeGroupCategory,function(i,v){
                     //get temporary best practice data; 
                    if(v.items.length > 1){
                	    _tmpObj.push(v.name); 
                    }
                });
                
                //get final best practice data; 
                $.each(_tmpObj,function(i1,v1){
                    var isFound = false;
                    $.each(_aTmpTrends,function(i2,v2){
                        if( v1 ==v2 ){
                            isFound=true;
                            return false;
                        }
                    });     
                    if( ! isFound) _aTmpBestpractice.push(v1);
                });
                _jsonBestpractice[name] = _aTmpBestpractice;
                _aBestpractice.push(_jsonBestpractice);

                //------------------Evolution----------------//
                _tmpJson.push({
                    name : name,
                    items : _evolutionGroupCategory
                });
                
                $.each(_evolutionGroupCategory,function(i,v){
                    if(v.items.length === 1){
                	    _aTmpEvolution.push(v.name); 
                    }
                });
                
                _jsonEvolution[name] = _aTmpEvolution;
                _aEvolution.push(_jsonEvolution);
            };
            
            _group = data.groupBy([_column]).sortBy("name");
            $.each(_group, function(i, v){
                _getDataByRegion(v.name, v.items);
            });
            
            //------------------Evolution For Region/Market----------------//
            $.each(_aEvolution,function(i, v){
                var _region = Object.keys(v)[0];
                var _items = v[_region];
                var _target = _tmpJson.filter(function(item){ return item.name === _region})[0];

                $.each(_tmpJson,function(ii, vv){
                    var _tmpRegion = vv.name;
                    var _tmpItems = vv.items;
                    
                    if(_tmpRegion !== _region){
                        $.each(_tmpItems, function(ti, tv){
                            var _cName = tv.name;
                            var _cItems = tv.items;
                            var _res = _target.items.filter(function(item){ return item.name === _cName && item.items.length > 1});

                            if(_items.indexOf(_cName) === -1 && _res.length === 0 ){
                                _items.push(_cName);
                            }
                        });
                    }
                });
            });
        }else{ 
            if(_group.length > 3){
                _group2 = _group.slice(_group.length-3,_group.length);
            }else{
                _group2 = _group;
            }
            
            if(_group.length > 2) 
                _group = _group.slice(_group.length-2,_group.length);

            var _trendCriteria              = _getCriteriaPrecentage(_group);
            var _bestPracticeCriteria       = _getCriteriaPrecentage(_group2); 
            var _evolution                  = _bestPracticeCriteria;
      
            var _trendGroupCategory         = _trendCriteria.groupBy(["category"]);
            var _bestPracticeGroupCategory  = _bestPracticeCriteria.groupBy(["category"]);
            var _evolutionGroupCategory     = _bestPracticeGroupCategory;

            //-----------------Trends----------------//
            $.each(_trendGroupCategory,function(i,v){
                //compare 2 data for trends
                if(v.items.length > 1){
                    var info1 = v.items[v.items.length-2];
                    var info2 = v.items[v.items.length-1];
                
            		if(info2.percent > info1.percent){
        		        _aTrends.push(v.name);
                    }else if(info2.percent == info1.percent && info2.count > info1.count){
                        _aTrends.push(v.name);
                    }
                }
            });
            
            //----------------Best Practice---------------//
            $.each(_bestPracticeGroupCategory,function(i,v){
                 //get temporary best practice data; 
                if(v.items.length > 1){
            	    _aTmpBestpractice.push(v.name); 
                }
            });
            
            //get final best practice data; 
            $.each(_aTmpBestpractice,function(i1,v1){
                var isFound = false;
                $.each(_aTrends,function(i2,v2){
                    if( v1 ==v2 ){
                        isFound=true;
                        return false;
                    }
                });     
                if( ! isFound) _aBestpractice.push(v1);
            });
            
            //------------------Evolution----------------//
            $.each(_evolutionGroupCategory,function(i,v){
                if(v.items.length === 1){
            	    _aEvolution.push(v.name); 
                }
            });
        }

        _display( $("div#trends"),_aTrends );
        _display( $("div#bestpractice"),_aBestpractice );   
        _display( $("div#opportunities"),_aEvolution ); 
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
    var _third_level = "";

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
    
    if(!isContain(gCName, "Airbag Module/SRS harness partitioning") && !isContain(gCName, "Power Distribution Box Counts") && 
        !isContain(gCName, "Multi-weld Eyelets crimping specifications") && !isContain(gCName, "Centralized Smart Junction Boxes/ Body Controller") && 
        !isContain(gCName,"PCM/ECM Harness Partitioning")){
        //Set Column Math count 
        if(gMathFunc.length > 0){
            //var _res = gMathFunc.filter(function(item){ return item.math_function == "SUM" })[0];
            var _data = sortBy(gMathFunc, "level_no");
            
                if(gMathFunc.length > 1){
                    _data = _data.filter(function(item){ return item.math_function !== "SUM"});
                }    
                
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
    }
    
    if(isContain(gCName, "Overall wire usage lower than 0.5 CSA")){
        _loc = "";
    }
    
    if(isContain(gCName, "Multi-weld Eyelets Crimping Specifications")){
        _loc = _location;
    }
    
    if(isContain(gCName, "Multi-Crimped Eyelet Circuit Combinations")){
        _cat = "second_label";
    }
    
    if(isContain(gCName, "Front Door Inline Strategies")){
        _cat = _device_name;
    }
    
    if(isContain(gCName, "New Conductor Technology")){
        _cat = "wire_type";
    } 
    
    _location = _loc;
    _category = _cat;   
    
    if(_loc!=="" && (gPrmGraphType!=="pie" && gPrmGraphType!=="map")){
        _location = _cat;
        _category = _loc;
    }  

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
    if(isContain(gCName, "Multi-weld Eyelets crimping specifications") || isContain(gCName, "Power Distribution Box Counts") ||
        isContain(gCName, "Multi-Crimped Eyelet Circuit Combinations")){
            
        var _unique = data.getUniqueRows(["second_label"]);
        // if(isContain(gCName, "Multi-Crimped Eyelet Circuit Combinations")){
        //     _unique = data.getUniqueRows(["ctsgfr_code"]);
        // }
        
        if(isContain(gCName, "Power Distribution Box Counts")){
            var _projNames = gData.groupBy(["project_name"]);
            $.each(_projNames, function(i, v){
                var _res = _unique.filter(function(item){ 
                    return item.project_name == v.name;
                });
                
                if(_res.length > 0) _count++;
            }); 
        }else{
            _count = _unique.length;
        }
    }else{
        if(column && column !== ""){
            _count = data.reduce(function (accumulator, currentValue) {
                return parseFloat(accumulator) + parseFloat(currentValue[column]);
            }, 0);    
        }else{
            for(; _count < data.length; ){
                _count++;
            }
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
    
    if(gPrmSubCategory!==""){
        _refData = gModelYears;
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
            if(gPrmCategory==="Region" || gPrmCategory==="Market" || gPrmSubCategory!==""){
            	return item[_location] == o.category && item[_selectedKey] == data[0].region; 
        	}else if(gPrmCategory==="Model Year"){
        	    return item[_location] == o.category; 
        	}else{
        	    return item[_location] == o.category && item[_selectedKey] == _group; 
        	}
        });
        
        var _groupCat = sortBy(_res.groupBy([_category]), "name");
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
            if(gPrmCategory==="Region" || gPrmCategory==="Market" || gPrmSubCategory!==""){
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
    var _$legendWrapper = $(".legend-wrapper");
    var _chartDivCW = _$chartDiv.find("div:first-child").width();
    var _$sunburstDtl = $("#sunburst_details"); //Chart default Id
    var _$barDtl = $("#bar_details"); //Chart default Id
    var _$selectedCategory = $("#selected_category");
    var _$chartDtlDiv = _$sunburstDtl; //Default Detail Graph
    var _chartDtlId = "";
    var _tw = null;
    var _sValue = "";
  
    var _setChartDtlId = function(callback){
        _sValue = $.trim(_$selectGraph.val());
        if( _sValue === "bar"){
            _chartDtlId = "bar_details";
            _$chartDtlDiv = _$barDtl;  
        }else{
            _chartDtlId = "sunburst_details";
            _$chartDtlDiv = _$sunburstDtl;
        }
        _tw = new zsi.easyJsTemplateWriter("#" + _chartDtlId);
        
        callback();
    };
    var _displaySunburstDetails = function(isPopup){
        if(_location){
            if(isUD(o.selected) && isPopup){
                //Show POPUP Details
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
                        , sizeAttr  : "modal-lg"
                        , title     : "Sunburst"
                        , body      : gTW.new().div({ id: _chartDiv, style: "min-height: calc(100vh - 165px)" })
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
                
                _$chartDtlDiv.empty().css({
                    width : _$chartDiv.width(),
                    height : _$chartDiv.height()
                });
                
                $.each(o.charts, function(i, chart){
                    var _hasDummy = false;
                    var _data = [];
                    var _cData = o.chartsData[i];
                    var _res = _cData.filter(function(item){ return item.value > 0 });
                   
                    if(_cData.length > 0 && _res.length > 0){
                        chart.data = _togglePieSlices(_cData);
                        _data = _generateSunburstData(_cData);
                    }else{
                        chart.data = _dummyData;
                        _data = _dummyData;
                        _hasDummy = true;
                    }
                    
                    if(_data.length === 0){
                        _data = _dummyData;
                        _hasDummy = true;
                    }
                    
                    if(_sValue === "sunburst"){
                        var _contnr = "chart_dtl_"+ i;
                        _tw.div({ class: "", id: _contnr, style: "width:" + _chartDivCW + "px" })
                            .in().spinner().out();
                            
                        setTimeout(function(){
                            displayDetailsSunburst(_contnr, _data, _hasDummy);
                        }, 300);
                    }
                });
                
                _$legendWrapper.css("bottom", (o.charts.length > 3 ? 16 : 0) + "px");
            }
        }
        else{
            if(isUD(o.selected)){
                gPCategory = o.category;
                
                _$chartDtlDiv.empty().css({
                    width : _$chartDiv.width(),
                    height : _$chartDiv.height()
                });
           
                var _ctr = 0;
                $.each(o.charts, function(i, chart){
                    var _hasDummy = false;
                    var _data = [];
                    var _cData = o.chartsData[i];
                    var _res = _cData.filter(function(item){ return item.value > 0 });
 
                    if(_cData.length > 0 && _res.length > 0){
                            chart.data = _togglePieSlices(_cData);
                            _data = _generateChartData(_cData);
                    }else{
                        chart.data = _dummyData;
                        _data = _dummyData;
                        _hasDummy = true;
                    }
            
                    if(_data.length === 0){
                        _data = _dummyData;
                        _hasDummy = true;
                    }
              
                    if(_sValue === "sunburst"){
                        var _contnr = "chart_dtl_"+ i;
                        _tw.div({ class: "", id: _contnr, style: "width:" + _chartDivCW + "px" })
                            .in().spinner().out();
                        
                        setTimeout(function(){
                            displayDetailsSunburst(_contnr, _data, _hasDummy);
                        }, 300); 
                    }
                    _ctr++;
                    
                    if(_ctr === o.charts.length){
                        //Show POPUP Details
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
                                , sizeAttr  : "modal-lg"
                                , title     : "Sunburst"
                                , body      : gTW.new().div({ id: _chartDiv, style: "min-height: calc(100vh - 165px)" })
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
                });
            }
        }
    };
    var _displayColumnDetails = function(container){
        _$chartDtlDiv.empty().css({
            width : _$chartWrapper.width(),
            height : _$chartWrapper.height()
        });
        
        var _data = [];
        var _groupCat = gCategories;
        var _keyToFilter = (_location ? _location : _category);
        var _dataToFilter = (_location ? gLocations : gCategories);
        var _catKey = (_location ? (isUD(o.selected) ? gPCategory : o.category) : o.category);
        var _catColor = o.data.filter(function(item) {return item.category == o.category });
            _groupCat = _dataToFilter.filter(function(item, i){ return $.trim(item.name) == _catKey })[0].items;
            _groupCat = sortBy(_groupCat.groupBy([_category]), "name");
        
        if( _catColor.length > 0 ){
            $.map(_groupCat, function(v){
                if(_location){
                    $.each(_catColor[0].subs, function(i, x){
                        if(v.name == x.category){
                            v.color = x.color;
                        } 
                    });
                }else{
                    if(v.name == _catColor[0].category){
                        v.color = _catColor[0].color;
                    } 
                }
                return v;
            });
        }
        
        if(gPrmCategory==="Region" || gPrmCategory==="Market" || gPrmSubCategory!==""){
            var _selectedCategory = (gPrmCategory==="Region" ? gRegionNames : gMarket);
            var _loopByCat = function(gName, items){
                $.each(gModelYears, function(x, my) {
                    var _my = my.name;
                    var _res = items.filter(function (item) {
                    	return isContain(_my, item[_modelYear]) && item[_keyToFilter] == _catKey;
                    });
         
                    $.each(gOEMs, function(y, oem) {
                        var _oemName = oem.name;
                        var _json = {
                            group : gName,
                            model_year : _my,
                            category : _oemName +"("+ _my +"-"+ gName +")"
                        };
                        
                        $.each(_groupCat, function(z, s) {
                            var _cName = s.name;
                            var _cNameNew = _cName.replace(/ /g,"_");
                            var _res2 = _res.filter(function (item) {
                            	return item[_oem] == _oemName && item[_category] == _cName;
                            });
                            
                            _json[_cNameNew] = getCount(_res2, _value);
                        });
    
                        _data.push(_json);
                    }); 
                });
            };
            
            if(gPrmSubCategory!==""){
                if(gPrmCategory==="Vehicle Type"){
                    _selectedCategory = gVehicleTypes;
                }else if(gPrmCategory==="OEM"){
                    _selectedCategory = gOEMs;
                }
                _selectedCategory = _selectedCategory.filter(function(item){ return item.name == gPrmSubCategory });
            }
            
            $.each(_selectedCategory, function(i, r) { 
                _loopByCat(r.name, r.items);
            });   
                
            _tw.spinner().out();
            setTimeout(function(){
                displayDetailsRegionColumn(container, _data, _groupCat);
            }, 300);
        }else{
            $.each(_refData, function(i, v) { 
                var _fName = v.name;
                var _fItems = v.items.filter(function(item){ return item[_keyToFilter] == _catKey });
               
                $.each(gOEMs, function(i, oem) {
                    var _oemName = oem.name;
                    var _res = _fItems.filter(function (item) {
                    	return item[_oem] == _oemName;
                    });
                    var _json = {
                        group : _fName,
                        category : _oemName +"("+ _fName +")"
                    };
                            
                    $.each(_groupCat, function(z, s) {
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
            
            _tw.spinner().out();
            setTimeout(function(){
                displayDetailsColumn(container, _data, _groupCat); 
            }, 300);
        }
    };
    var _setSelectedChartDetails = function(callback){
         _setChartDtlId(function(){
            if(_$chartWrapDetails.hasClass("d-none")){
                _$selectGraph.val("sunburst"); //  Set Default Chart Details
            }
            
            if(_sValue==="bar"){
                _displayColumnDetails("bar_details");
                _$sunburstDtl.addClass("d-none").removeClass("d-flex");
            }
            else{
                _$barDtl.addClass("d-none").removeClass("d-flex");
     
                if(o.charts.length <= 3){
                    _$chartWrapper.addClass("overflow-hidden");
                }else{
                    _$chartWrapper.removeClass("overflow-hidden");
                }
            }
            
            _$btnReset.removeClass("d-none");
            _$chartWrapDetails.removeClass("d-none");
            _$chartDtlDiv.addClass("d-flex").removeClass("d-none");
        
            callback();
        });
    };
    
    _$selectedCategory.text(o.category).css("background-color", o.color);
    
    _setChartDtlId(function(){
        _setSelectedChartDetails(function(){
            _displaySunburstDetails(true);
        });
    });
    
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
        
        $(this).addClass("d-none");
        
        _$chartDtlDiv.empty().css({
            width : _$chartDiv.width(),
            height : _$chartDiv.height()
        });
        _$selectGraph.val("sunburst"); //  Set Default Chart Details
        _$chartWrapDetails.addClass("d-none");
        
        o.chart.events.once("datavalidated", function(){
            setTimeout(function(){
                var _lHeight = o.chart.legend.contentHeight;
                $("#legend_div").height(_lHeight);
                _$legendWrapper.css("bottom", (o.charts.length > 3 ? 16 : 0) + "px");
                _$chartDiv.css("margin-bottom",  _lHeight + "px");
            }, 100);
        });
    });
    
    //On change chart selection
    _$selectGraph.removeClass("d-none");
    _$selectGraph.unbind().change(function(){
        _setChartDtlId(function(){
            _setSelectedChartDetails(function(){
                if(_sValue === "sunburst" && !isUD(o.selected)) _displaySunburstDetails(false); 
            });
        });
    });
}

//-------------------------------- CHARTS DATA  ------------------------------//
function getChartDetails(){
    var _result = {};
    var _key = getDistinctKey(gData);
    var _selectedKey = _key.model_year; //Default key selected
    var _selectedCategory = gModelYears; //Default category selected
        _result = _key;

    if(gPrmCategory==="Region"){
        _selectedKey = _key.region;
        _selectedCategory = gRegionNames;
    }else if(gPrmCategory==="Vehicle Type"){
        _selectedKey = _key.vehicle_type;
        _selectedCategory = gVehicleTypes;
    }else if(gPrmCategory==="OEM"){
        _selectedKey = _key.oem;
        _selectedCategory = gOEMs;
    }else if(gPrmCategory==="Market"){
        _selectedKey = _key.market;
        _selectedCategory = gMarket;
    }
    
    if(gPrmSubCategory!==""){
        _selectedCategory = _selectedCategory.filter(function(item){ return item.name == gPrmSubCategory });
    }
    
    _result.selectedKey = _selectedKey;
    _result.selectedCategory = _selectedCategory;
    _result.categoryObj = gCategories;
    _result.locationObj = gLocations;
    _result.valueFormat = (gMenu==="COVERINGS" ? "#,###.000" : "#,###");
    
    return _result;
}

function getPieChartData(callback){
    var _obj = getChartDetails();
    var _categoryKey = (_obj.location ?_obj.location:_obj.category);
    var _categoryKeyObj = (_obj.location ? gLocations: gCategories);
    var _catLength = _categoryKeyObj.length;
    var _getData = function(){
        var _data = [];
        $.each(_obj.selectedCategory, function(i, v) { 
            var _group = v.name;
            var _items = v.items;
            
            $.each(_categoryKeyObj, function(i, w) { 
                var _sub = [];
                var _cName = w.name;
                var _colorSet = new am4core.ColorSet();
                var _cColor = (w.color) ? w.color : _colorSet.getIndex(i);
                var _cItems = sortBy(w.items.groupBy([_obj.category]), "name");
                var _json = { group: _group };
                var _res = _items.filter(function (item) {
                	return item[_categoryKey] == _cName;
                });
                
                if(_res.length > 0 && _obj.location){
                    $.each(_cItems, function(x, y){
                        var _subJson = {};
                        var _subName = y.name;
                        var _subColor = getCategoryColor(_subName);
                        var _res2 = _res.filter(function (item) {
                        	return item[_obj.category] == _subName;
                        });

                        _subJson.category = _subName;
                        _subJson.value = getCount(_res2, _obj.value);
                        _subJson.color = (_subColor) ? _subColor : _colorSet.getIndex(_catLength + x);
                        
                        _sub.push(_subJson);
                    });
                    _sub = sortBy(_sub, "category");
                }
                
                _json.category = _cName;
                _json.value = getCount(_res, _obj.value);
                _json.subs = _sub;
                _json.color = _cColor;
   
                _data.push(_json);
            });
        });
        return _data;
    };
    var _getDataByRegion = function(){
        var _data = [];
        $.each(_obj.selectedCategory, function(a, r) {
            $.each(gModelYears, function(b, v) { 
                var _group = r.name;
                var _my = v.name
                var _items = v.items;
                $.each(_categoryKeyObj, function(i, w) { 
                    var _sub = [];
                    var _cName = w.name;
                    var _colorSet = new am4core.ColorSet();
                    var _cColor = (w.color) ? w.color : _colorSet.getIndex(i);
                    var _cItems = sortBy(w.items.groupBy([_obj.category]), "name");
                    var _json = { group: _my };
                    var _res = _items.filter(function (item) {
                    	return item[_categoryKey] == _cName && item[_obj.selectedKey] == _group; 
                    });

                    if(_res.length > 0 && _obj.location){
                        $.each(_cItems, function(x, y){
                            var _subJson = {};
                            var _subName = y.name;
                            var _subColor = getCategoryColor(_subName);
                            var _res2 = _res.filter(function (item) {
                            	return item[_obj.category] == _subName;
                            });
                            
                            _subJson.category = _subName;
                            _subJson.value = getCount(_res2, _obj.value);
                            _subJson.color = (_subColor) ? _subColor : _colorSet.getIndex(_catLength + x);

                            _sub.push(_subJson);
                        });
                        _sub = sortBy(_sub, "category");
                    }
                    
                    _json.region = _group;
                    _json.category = _cName;
                    _json.value = getCount(_res, _obj.value);
                    _json.subs = _sub;
                    _json.color = _cColor;

                    _data.push(_json);
                });
            });
        });
        return _data;
    };
    console.log("_obj", _obj);

    if(gPrmCategory==="Region" || gPrmCategory==="Market" || gPrmSubCategory!==""){
        _obj.data = _getDataByRegion();
    }else{
        _obj.data = _getData();
    }
    _obj.pieDummyData = [{
        "category": "Dummy",
        "disabled": true,
        "value": 1000,
        "color": am4core.color("#dadada"),
        "opacity": 0.3,
        "strokeDasharray": "4,4",
        "tooltip": ""
    }]; 

    return _obj;
}

function getColumnChartData(callback){
    var _obj = getChartDetails();
    var _getData = function(){
        var _data = [];
        $.each(_obj.selectedCategory, function(i, v) { 
            var _name = v.name;
            var _json = {};
                _json.category = _name;
            
            $.each(gCategories, function(y, w) { 
                var _cName = w.name;
                var _cNameNew = _cName.replace(/ /g,"_");
                var _res = v.items.filter(function (item) {
                	return item[_obj.category] == _cName;
                });
                
                _json[_cNameNew] = getCount(_res, _obj.value);
            });
            _data.push(_json);
        });
        return _data;
    };
    var _getDataByRegion = function(){
        var _data = [];
        $.each(_obj.selectedCategory, function(i,r) { 
            $.each(gModelYears, function(x, my) { 
                var _group = r.name;
                var _my = my.name;
                var _json = {};
                    _json.group = _group;
                    _json.model_year = _my;
                    _json.category = _my +"("+ _group +")";
                
                $.each(gCategories, function(y, w) { 
                    var _cName = w.name;
                    var _cNameNew = _cName.replace(/ /g,"_");
                    var _res = my.items.filter(function (item) {
                    	return item[_obj.selectedKey] == _group && item[_obj.category] == _cName;
                    });
    
                    _json[_cNameNew] = getCount(_res, _obj.value);
                });
                _data.push(_json);
            });
        });
        return _data;
    };
    
    if(gPrmCategory==="Region" || gPrmCategory==="Market" || gPrmSubCategory!==""){
        _obj.data = _getDataByRegion();
    }else{
        _obj.data = _getData();
    }
    
    return _obj;
}

//------------------------------- COMMON CHARTS ------------------------------//
// PIE CHART
function displayComPieChart(container){
    var _o = getPieChartData();
    var _charts = [];
    var _chartsData = [];
    var _createChart = function(data, name, isLegend, div){
        var chart = am4core.create(div, (gPrmIs3D ? am4charts.PieChart3D : am4charts.PieChart));
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
            chart.data = _o.pieDummyData;
        }
        
        var label = chart.createChild(am4core.Label);
        label.text = "[#212529]" + name +"[/]";
        label.fontSize = 15;
        label.align = "center";
        
        //Animate
        chart.hiddenState.properties.radius = am4core.percent(0);
        
        // Add and configure Series
        var pieSeries = chart.series.push((gPrmIs3D ? new am4charts.PieSeries3D() : new am4charts.PieSeries()));
        pieSeries.dataFields.value = "value";
        pieSeries.dataFields.category = "category";
        pieSeries.paddingBottom = 10;
        pieSeries.colors.step = 2;
        pieSeries.tooltip.label.wrap = true;
        pieSeries.tooltip.label.maxWidth = 300;
        
        pieSeries.dataFields.hiddenInLegend = "disabled";
        
         /* Set tup slice appearance */
        var slice = pieSeries.slices.template;
        slice.propertyFields.fill = "color";
        slice.propertyFields.fillOpacity = "opacity";
        slice.propertyFields.strokeDasharray = "strokeDasharray";
        slice.propertyFields.tooltipText = "tooltip";
        slice.propertyFields.isActive = "pulled";
        slice.stroke = am4core.color("#dadada");
        slice.strokeWidth = 0.3;
        slice.strokeOpacity = 0.3;
        slice.tooltipText = "{category}: {value.percent.formatNumber('#.##')}% ({value.value.formatNumber('"+ _o.valueFormat +"')})";
        
        pieSeries.labels.template.propertyFields.disabled = "disabled";
        pieSeries.ticks.template.propertyFields.disabled = "disabled";
        pieSeries.ticks.template.disabled = true;
        pieSeries.alignLabels = false;
        pieSeries.labels.template.fontSize = 10;
        pieSeries.labels.template.text = "{value.percent.formatNumber('#.##')}%";
        pieSeries.labels.template.radius = am4core.percent(-40);
        pieSeries.labels.template.fill = am4core.color("white");
        pieSeries.legendSettings.valueText = "{valueY.close}";
        pieSeries.labels.template.adapter.add("text", function(text, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return "";
            }
            return text;
        });
        
        // Set mouse style on hover
        pieSeries.slices.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;
        pieSeries.slices.template.events.on("hit", function(ev) {
            if(ev.target.dataItem.dataContext.category!=="Dummy"){
                var color = ev.target.fill;
                var series = ev.target.dataItem.component;
                var category = ev.target.dataItem.category;
                var percentage = parseFloat(ev.target.dataItem.values.value.percent).toFixed(1) + "%";
                
                series.slices.each(function(item) {
                    if (item.isActive && item != ev.target) {
                        item.isActive = false;
                    }
                });

                if(_o.location){
                    if (ev.target.dataItem.dataContext.id !== undefined ) {
                        selected = ev.target.dataItem.dataContext.id;
                        setLegend(chart);
                    } else {
                        selected = undefined;
                    }
                }

                showChartDetails({
                    charts : _charts,
                    chartsData : _chartsData,
                    chart: chart,
                    data: data,
                    selected: selected,
                    category : category,
                    percentage: percentage,
                    group : name,
                    color : color
                });
            }
        });
        
        _charts.push(chart);
        _chartsData.push(data);
    };
    
    var _dLength = _o.data.groupBy(["group"]).length;
    var _chartWidth = $(".chart-wrapper").width() / 3;
    var _container = "#"+ container;
    var _tw = new zsi.easyJsTemplateWriter(_container);
    
    $.each(_o.selectedCategory, function(i, v){
        var _group = v.name;
        var _charId = "chart_"+ i;
            _tw.div({ class: "", id: _charId, style: "width:" + _chartWidth + "px" });
        
        var _res = (v.items.length === 0 ? [] : _o.data.filter(function (item) {
        	return item.group == _group;
        }));
      
        if($.isNumeric(_group)) _group = "MY"+ _group;

        _createChart(sortBy(_res, "category"), _group, (i === 0 ? true : false), _charId);
    });
    $(_container).width((_chartWidth * _dLength) - 1);
    console.log("o", _o);
    setLegend(_charts);
    setTrends(_o.data, gModelYears);
}

function displayComPieRegionChart(container){
    var _o = getPieChartData();
    var _charts = [];
    var _chartsData = [];  
    var _createChart = function(data, name, isLegend, div){
        var chart = am4core.create(div, (gPrmIs3D ? am4charts.PieChart3D : am4charts.PieChart));
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
            chart.data = _o.pieDummyData;
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
        
        // Add and configure Series
        var pieSeries = chart.series.push((gPrmIs3D ? new am4charts.PieSeries3D() : new am4charts.PieSeries()));
        pieSeries.dataFields.value = "value";
        pieSeries.dataFields.category = "category";
        pieSeries.paddingBottom = 10;
        pieSeries.colors.step = 2;
        pieSeries.tooltip.label.wrap = true;
        pieSeries.tooltip.label.width = 300;
        pieSeries.dataFields.hiddenInLegend = "disabled";
        
         /* Set tup slice appearance */
        var slice = pieSeries.slices.template;
        slice.propertyFields.fill = "color";
        slice.propertyFields.fillOpacity = "opacity";
        slice.propertyFields.strokeDasharray = "strokeDasharray";
        slice.propertyFields.tooltipText = "tooltip";
        slice.propertyFields.isActive = "pulled";
        slice.stroke = am4core.color("#dadada");
        slice.strokeWidth = 0.3;
        slice.strokeOpacity = 0.3;
        slice.tooltipText = "{category}: {value.percent.formatNumber('#.##')}% ({value.value.formatNumber('"+ _o.valueFormat +"')})";
        
        pieSeries.labels.template.propertyFields.disabled = "disabled";
        pieSeries.ticks.template.propertyFields.disabled = "disabled";
        pieSeries.ticks.template.disabled = true;
        pieSeries.alignLabels = false;
        pieSeries.labels.template.fontSize = 10;
        pieSeries.labels.template.text = "{value.percent.formatNumber('#.##')}%";
        pieSeries.labels.template.radius = am4core.percent(-40);
        pieSeries.labels.template.fill = am4core.color("white");
        pieSeries.legendSettings.valueText = "{valueY.close}";
        pieSeries.labels.template.adapter.add("text", function(text, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return "";
            }
            return text;
        });
        
        // Set mouse style on hover
        pieSeries.slices.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;
        pieSeries.slices.template.events.on("hit", function(ev) {
            if(ev.target.dataItem.dataContext.category!=="Dummy"){
                var color = ev.target.fill;
                var series = ev.target.dataItem.component;
                var category = ev.target.dataItem.category;
                var percentage = parseFloat(ev.target.dataItem.values.value.percent).toFixed(1) + "%";
                
                series.slices.each(function(item) {
                    if (item.isActive && item != ev.target) {
                        item.isActive = false;
                    }
                });
      
                if(_o.location){
                    if (ev.target.dataItem.dataContext.id !== undefined ) {
                        selected = ev.target.dataItem.dataContext.id;
                        setLegend(chart);
                    } else {
                        selected = undefined;
                    }
                }
                
                showChartDetails({
                    charts : _charts,
                    chartsData : _chartsData,
                    chart: chart,
                    data: data,
                    selected: selected,
                    category : category,
                    percentage: percentage,
                    group : name,
                    color : color
                });
            }
        });
        
        _charts.push(chart);
        _chartsData.push(data);
    };
    
    var _dLength = _o.data.groupBy(["group","region"]).length
    var _chartWidth = $(".chart-wrapper").width() / 3;
    var _container = "#"+ container;
    var _tw = new zsi.easyJsTemplateWriter(_container);
    
    $.each(_o.selectedCategory, function(i, v){
        var _cName = v.name;
        var _cNameNew = _cName.replace(/ /g,"_");
        var _chartDiv = "chart_"+ _cNameNew;
            _tw.div({ class: "d-flex position-relative " + (gPrmSubCategory===""?"border-right":""), id: _chartDiv, style: "width:" + (_chartWidth * gModelYears.length)  + "px" })
                .in().span({class: "position-absolute w-100 text-center font-weight-bold", value: _cName, style: "bottom:0"});
        
        $.each(gModelYears, function(i, my){
            var _name = my.name;
            var _chartSubDiv = "chart_"+ _cNameNew +"_"+ _name;
            var _result = _o.data.filter(function (item) {
            	return item.region == _cName && item.group == _name;// && item.value > 0;
            });
            _tw.div({ class: "h-100", id: _chartSubDiv, style: "width:" + _chartWidth + "px" });

            _createChart(sortBy(_result, "category"), _name, (i === 0 ? true : false), _chartSubDiv);
        });
        _tw.out();
    });
    $(_container).width(_chartWidth * _dLength);
    console.log("o", _o);
    setLegend(_charts);
    setTrends(_o.data, _o.selectedCategory);
}

// COLUMN CHART
function displayComColumnChart(container){
    var o = getColumnChartData();
    var chart = am4core.create(container, (gPrmIs3D ? am4charts.XYChart3D : am4charts.XYChart));
    chart.data = o.data;
    chart.padding(35, 0, 0, 0);
    chart.maskBullets = false;

    // Create axes
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "category";
    categoryAxis.renderer.minGridDistance = 60;
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.interactionsEnabled = false;
    categoryAxis.renderer.startLocation = 0;
    categoryAxis.renderer.cellStartLocation = 0.2;
    categoryAxis.renderer.cellEndLocation = 0.8;
    
    var label = categoryAxis.renderer.labels.template;
    label.wrap = true;
    label.maxWidth = 100;
    label.fontSize = 10;
    label.textAlign = "middle";
    
    if(gPrmCategory!=="Model Year"){
        categoryAxis.renderer.labels.template.adapter.add("dy", function(dy, target) {
          if (target.dataItem && target.dataItem.index & 2 == 2) {
            return dy + 10;
          }
          return dy;
        });
    }
    
    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    valueAxis.calculateTotals = true;
    
    if(gIsFullStacked || !gIsStacked){
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
        series.columns.template.tooltipText = "{name}: {valueY.totalPercent.formatNumber('#.##')}% ({valueY.formatNumber('"+ o.valueFormat +"')})";
        series.columns.template.fillOpacity = 1;
        series.columns.template.column.strokeOpacity = 0;
        series.name = name;
        series.dataFields.categoryX = "category";
        series.dataFields.valueY = field;
        series.dataItems.template.locations.categoryX = 0.5;
        series.stacked = gIsStacked;
        series.tooltip.pointerOrientation = "vertical";
        series.sequencedInterpolation = true;
        series.fill = color;
        series.stroke = color;
        
        if(gIsFullStacked || !gIsStacked){
            series.dataFields.valueYShow = "totalPercent";
        }
         
        if(o.location){
            // Set mouse style on hover
            series.columns.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;
            series.columns.template.events.on("hit", function(ev) {
                o.target = ev.target;
                displayDDColumn(o);   
            });
        }
       
        var valueLabel = series.bullets.push(new am4charts.LabelBullet());
        valueLabel.label.text = "{valueY.totalPercent.formatNumber('#.##')}%";
        valueLabel.fontSize = 10;
        
        if(gIsStacked){
            valueLabel.label.fill = am4core.color("#ffffff");
            valueLabel.locationY = 0.5;
        }else{
            valueLabel.dy = -10;
        }
    };

    $.each(o.categoryObj, function(i, v) {
        var _cName = v.name;
        var _cNameNew = _cName.replace(/ /g,"_");
        var _color = (v.color) ? v.color : chart.colors.getIndex(i);
            
        _createSeries(_cNameNew, _cName, _color);
    });
    
    //Add cursor
    chart.cursor = new am4charts.XYCursor();
    chart.cursor.behavior = "panX";
    
    setLegend(chart);
    setTrends(o.data, o.categoryObj);
}

function displayComColumnRegionChart(container){
    var o = getColumnChartData();
    var chart = am4core.create(container, (gPrmIs3D ? am4charts.XYChart3D : am4charts.XYChart));
    chart.data = o.data;
    chart.padding(35, 0, 0, 0);
    chart.maskBullets = false;

    // Create axes
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
        
    if(gIsFullStacked || !gIsStacked){
        valueAxis.max = 100;
        valueAxis.strictMinMax = true;
        valueAxis.renderer.labels.template.adapter.add("text", function(text) {
          return text + "%";
        });
    }
        
    // Create series
    var _createSeries = function(field, name, color) {
        var series = chart.series.push((gPrmIs3D ? new am4charts.ColumnSeries3D() : new am4charts.ColumnSeries()));
        series.columns.template.tooltipText = "{name}: {valueY.totalPercent.formatNumber('#.##')}% ({valueY.formatNumber('"+ o.valueFormat +"')})";
        series.columns.template.column.strokeOpacity = 0;
        series.name = name;
        series.dataFields.categoryX = "category";
        series.dataFields.valueY = field;
        series.dataItems.template.locations.categoryX = 0.5;
        series.stacked = gIsStacked;
        series.tooltip.pointerOrientation = "vertical";
        series.sequencedInterpolation = true;
        series.fill = color;
        series.stroke = color;
        
        if(gIsFullStacked || !gIsStacked){
            series.dataFields.valueYShow = "totalPercent";
        }
        
        if(o.location){
            // Set mouse style on hover
            series.columns.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;
            series.columns.template.events.on("hit", function(ev) {
                o.target = ev.target;
                displayDDColumnRegion(o);   
            });
        }
        
        var valueLabel = series.bullets.push(new am4charts.LabelBullet());
        valueLabel.label.text = "{valueY.totalPercent.formatNumber('#.##')}%";
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
        range.label.dy = 11;
        range.label.fontWeight = "bold";
        range.grid.stroke = am4core.color("#396478");
        range.grid.strokeOpacity = 1;
        range.tick.length = 230;
        range.tick.disabled = false;
        range.tick.strokeOpacity = 0.6;
        range.tick.location = 0;
        range.locations.category = 0;
    };

    $.each(o.categoryObj, function(i, v) { 
        var _name = v.name;
        var _field = _name.replace(/ /g,"_");
        var _color = (v.color) ? v.color : chart.colors.getIndex(i);
        
        _createSeries(_field, _name, _color);
    });
    
    var _my = getFirstAndLastItem(gModelYears , "name");
    var _myFirst = _my.first;
    var _myLast = _my.last;
    $.each(o.selectedCategory, function(i, v) { 
        var _group = "("+ v.name +")";
        
        _createLabel(_myFirst + _group, _myLast + _group, v.name, 10);
    });

    //Add cursor
    chart.scrollbarX = new am4core.Scrollbar();

    chart.cursor = new am4charts.XYCursor();
    chart.cursor.behavior = "panX";
    
    setLegend(chart);
    setTrends(o.data, o.categoryObj);
}

// BAR CHART
function displayComBarChart(container){
    var o = getColumnChartData();
    var chart = am4core.create(container, (gPrmIs3D ? am4charts.XYChart3D : am4charts.XYChart));
    chart.data = o.data;
    chart.padding(35, 0, 0, 0);
    chart.maskBullets = false;

    // Create axes
    var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "category";
    categoryAxis.renderer.minGridDistance = 60;
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.inversed = true;
    categoryAxis.renderer.labels.template.fontSize = 10;
    
    var label = categoryAxis.renderer.labels.template;
    label.wrap = true;
    label.maxWidth = 200;
    //label.fontWeight = "bold";
    
    var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    valueAxis.calculateTotals = true;
    valueAxis.renderer.labels.template.fontSize = 10;
    
    if(gIsFullStacked || !gIsStacked){
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
        series.columns.template.tooltipText = "{name}: {valueX.totalPercent.formatNumber('#.##')}% ({valueX.formatNumber('"+ o.valueFormat +"')})";
        series.columns.template.column.strokeOpacity = 0;
        series.name = name;
        series.dataFields.categoryY = "category";
        series.dataFields.valueX = field;
        series.dataItems.template.locations.categoryY = 0.5;
        series.stacked = gIsStacked;
        series.sequencedInterpolation = true;
        series.fill = color;
        series.stroke = color;
        
        if(gIsFullStacked || !gIsStacked){
            series.dataFields.valueXShow = "totalPercent";
        }
        
        if(o.location){
            // Set mouse style on hover
            series.columns.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;
            series.columns.template.events.on("hit", function(ev) {
                o.target = ev.target;
                displayDDBar(o);   
            });
        }
       
        var valueLabel = series.bullets.push(new am4charts.LabelBullet());
        valueLabel.label.text = "{valueX.totalPercent.formatNumber('#.##')}%";
        valueLabel.fontSize = 10;
        
        if(gIsStacked){
            valueLabel.label.fill = am4core.color("#ffffff");
            valueLabel.locationX = 0.5;
        }else{
            valueLabel.label.horizontalCenter = "left";
            valueLabel.label.dx = 10;
        }
    };
    
    $.each(o.categoryObj, function(i, v) {
        var _cName = v.name;
        var _cNameNew = _cName.replace(/ /g,"_");
        var _color = (v.color) ? v.color : chart.colors.getIndex(i);
            
        _createSeries(_cNameNew, _cName, _color);
    });

    //Add cursor
    chart.scrollbarY = new am4core.Scrollbar();
    
    setLegend(chart);
    setTrends(o.data, o.categoryObj);
}

function displayComBarRegionChart(container){
    var o = getColumnChartData();
    var chart = am4core.create(container, (gPrmIs3D ? am4charts.XYChart3D : am4charts.XYChart));
    chart.data = o.data;
    chart.padding(35, 0, 0, 0);
    chart.maskBullets = false;
    
    var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "category";
    categoryAxis.renderer.minGridDistance = 60;
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.interactionsEnabled = false;
    categoryAxis.renderer.inversed = true;
    categoryAxis.numberFormatter.numberFormat = "#";
    categoryAxis.renderer.labels.template.dx = 5;
    categoryAxis.renderer.labels.template.fontSize = 10;
    categoryAxis.renderer.labels.template.adapter.add("textOutput", function(text) {
        return (typeof(text)!=="undefined" ? text.replace(/\(.*/, "") : text);
    });
    
    var label = categoryAxis.renderer.labels.template;
    
    var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    valueAxis.calculateTotals = true;
    valueAxis.renderer.labels.template.fontSize = 10;
    
    if(gIsFullStacked || !gIsStacked){
        valueAxis.max = 100;
        valueAxis.strictMinMax = true;
        valueAxis.renderer.labels.template.adapter.add("text", function(text) {
          return text + "%";
        });
    }
    
    var _createSeries = function(field, name, color) {
        var series = chart.series.push((gPrmIs3D ? new am4charts.ColumnSeries3D() : new am4charts.ColumnSeries()));
        series.columns.template.tooltipText = "{name}: {valueX.totalPercent.formatNumber('#.##')}% ({valueX.formatNumber('"+ o.valueFormat +"')})";
        series.columns.template.column.strokeOpacity = 0;
        series.name = name;
        series.dataFields.categoryY = "category";
        series.dataFields.valueX = field;
        series.dataItems.template.locations.categoryY = 0.5;
        series.stacked = gIsStacked;
        series.sequencedInterpolation = true;
        series.fill = color;
        series.stroke = color;
        
        if(gIsFullStacked || !gIsStacked){
            series.dataFields.valueXShow = "totalPercent";
        }
        
        if(o.location){
            // Set mouse style on hover
            series.columns.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;
            series.columns.template.events.on("hit", function(ev) {
                o.target = ev.target;
                displayDDBarRegion(o);   
            });
        }
        
        var valueLabel = series.bullets.push(new am4charts.LabelBullet());
        valueLabel.label.text = "{valueX.totalPercent.formatNumber('#.##')}%";
        valueLabel.fontSize = 10;
        
        if(gIsStacked){
            valueLabel.label.fill = am4core.color("#ffffff");
            valueLabel.locationX = 0.5;
        }else{
            valueLabel.label.horizontalCenter = "left";
            valueLabel.label.dx = 10;
        }
    };
    
    var _createLabel = function(category, endCategory, label, dx) {
        var range = categoryAxis.axisRanges.create();
        range.category = category;
        range.endCategory = endCategory;
        range.label.text = label;
        range.label.disabled = false;
        range.label.location = 0.5;
        range.label.dx = dx;
        range.label.rotation = 90;
        range.label.fontWeight = "bold";
        range.label.fontSize = 10;
        range.label.horizontalCenter = "middle";
        range.label.inside = true;
        range.grid.stroke = am4core.color("#396478");
        range.grid.strokeOpacity = 1;
        range.tick.length = 500;
        range.tick.disabled = false;
        range.tick.strokeOpacity = 0.6;
        range.tick.stroke = am4core.color("#396478");
        range.tick.location = 0;
        range.locations.category = 0;
    };

    $.each(o.categoryObj, function(i, v) { 
        var _name = v.name;
        var _field = _name.replace(/ /g,"_");
        var _color = (v.color) ? v.color : chart.colors.getIndex(i);
        
        _createSeries(_field, _name, _color);
    });
    
    var _my = getFirstAndLastItem(gModelYears , "name");
    var _myFirst = _my.first;
    var _myLast = _my.last;
    $.each(o.selectedCategory, function(i, v) { 
        var _group = "("+ v.name +")";
        
        _createLabel(_myFirst + _group, _myLast + _group, v.name, -56);
    });
        
    //Add cursor
    chart.scrollbarY = new am4core.Scrollbar();
    
    setLegend(chart);
    setTrends(o.data, o.categoryObj);
}

// LINE CHART
function displayComLineChart(container){
    var o = getColumnChartData();
    var _chart = am4core.create(container, (gPrmIs3D ? am4charts.XYChart3D : am4charts.XYChart));
    _chart.data = o.data;
    _chart.padding(25, 0, 0, 0);
    
    // Create category axis
    var categoryAxis = _chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "category";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.interactionsEnabled = false;
    categoryAxis.renderer.labels.template.fontSize = 10;
    
    if(gPrmCategory!=="Model Year"){
        categoryAxis.renderer.labels.template.adapter.add("dy", function(dy, target) {
          if (target.dataItem && target.dataItem.index & 2 == 2) {
            return dy + 10;
          }
          return dy;
        });
    }
    
    if(gPrmGraphType==="area"){
        categoryAxis.startLocation = 0.5;
        categoryAxis.endLocation = 0.5;
    }
    
    // Create value axis
    var valueAxis = _chart.yAxes.push(new am4charts.ValueAxis());
    
    var _createSeries = function(field, name, color) {
        // Create series
        var series = _chart.series.push(new am4charts.LineSeries());
        series.dataFields.valueY = field;
        series.dataFields.categoryX = "category";
        series.name = name;
        series.strokeWidth = 3;
        
        series.tooltipText = "{name}: {valueY.formatNumber('"+ o.valueFormat +"')}";
        series.legendSettings.valueText = "{valueY}";
        series.fill = color;
        series.stroke = color;
        // Set mouse style on hover
        
        if(gPrmGraphType==="line"){
            var bullet = series.bullets.push(new am4charts.CircleBullet());
            bullet.circle.radius = 8;
            bullet.circle.stroke = am4core.color("#fff");
            bullet.circle.strokeWidth = 3;
            
            if(o.location){
                bullet.cursorOverStyle = am4core.MouseCursorStyle.pointer;
                bullet.events.on('hit', function(ev){
                    o.target = ev.target;
                    //o.target.fill = ev.target.background.fill;
                    displayDDLine(o);   
                });
            }
        }
        
        if(gPrmGraphType==="area"){
            series.fillOpacity = 0.5;
        }
        
        if(gPrmGraphType==="scatter"){
            series.bullets.push(new am4charts.CircleBullet());
            series.strokeOpacity = 0;
        }
    };
    
    $.each(o.categoryObj, function(i, v) {
        var _cName = v.name;
        var _cNameNew = _cName.replace(/ /g,"_");
        var _color = (v.color) ? v.color : _chart.colors.getIndex(i);
            
        _createSeries(_cNameNew, _cName, _color);
    });
    
    // Add chart cursor
    _chart.cursor = new am4charts.XYCursor();
    _chart.cursor.behavior = "zoomY";

    var scrollbarX = new am4core.Scrollbar();
    _chart.scrollbarX = scrollbarX;
    
    // Add legend
    setLegend(_chart);
    setTrends(o.data, o.categoryObj);
}

function displayComLineRegionChart(container){
    var o = getColumnChartData();
    var _chart = am4core.create(container, (gPrmIs3D ? am4charts.XYChart3D : am4charts.XYChart));
    _chart.data = o.data;
    _chart.padding(25, 0, 0, 0);

    // Create category axis
    var categoryAxis = _chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "category";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.interactionsEnabled = false;
    categoryAxis.renderer.labels.template.fontSize = 10;
    categoryAxis.renderer.labels.template.adapter.add("textOutput", function(text) {
        return (typeof(text)!=="undefined" ? text.replace(/\(.*/, "") : text);
    });
    
    if(gPrmGraphType==="area"){
        categoryAxis.startLocation = 0.5;
        categoryAxis.endLocation = 0.5;
    }
    
    // Create value axis
    var valueAxis = _chart.yAxes.push(new am4charts.ValueAxis());

    var _createSeries = function(field, name, color) {
        // Create series
        var series = _chart.series.push(new am4charts.LineSeries());
        series.dataFields.valueY = field;
        series.dataFields.categoryX = "category";
        series.name = name;
        series.strokeWidth = 3;
        series.tooltipText = "{name}: {valueY.formatNumber('"+ o.valueFormat +"')}";
        series.legendSettings.valueText = "{valueY}";
        series.fill = color;
        series.stroke = color;
        
        if(gPrmGraphType==="line"){
            var bullet = series.bullets.push(new am4charts.CircleBullet());
            bullet.circle.radius = 8;
            bullet.circle.stroke = am4core.color("#fff");
            bullet.circle.strokeWidth = 2;
            
            if(o.location){
                bullet.cursorOverStyle = am4core.MouseCursorStyle.pointer;
                bullet.events.on('hit', function(ev){
                    o.target = ev.target;
                    //o.target.fill = ev.target.background.fill;
                    displayDDLineRegion(o);   
                });
            }
        }
        
        if(gPrmGraphType==="area"){
            series.fillOpacity = 0.5;
        }
        
        if(gPrmGraphType==="scatter"){
            series.bullets.push(new am4charts.CircleBullet());
            series.strokeOpacity = 0;
        }
    };
    
    var _createLabel = function(category, endCategory, label) {
        var range = categoryAxis.axisRanges.create();
        range.category = category;
        range.endCategory = endCategory;
        range.label.dataItem.text = label;
        range.label.dy = 11;
        range.label.fontWeight = "bold";
        range.grid.stroke = am4core.color("#396478");
        range.grid.strokeOpacity = 1;
        range.tick.length = 230;
        range.tick.disabled = false;
        range.tick.strokeOpacity = 0.6;
        range.tick.location = 0;
        range.locations.category = 0;
    };
    
    $.each(o.categoryObj, function(i, v) { 
        var _name = v.name;
        var _field = _name.replace(/ /g,"_");
        var _color = (v.color) ? v.color : _chart.colors.getIndex(i);
        
        _createSeries(_field, _name, _color);
    });
    
    var _my = getFirstAndLastItem(gModelYears , "name");
    var _myFirst = _my.first;
    var _myLast = _my.last;
    $.each(o.selectedCategory, function(i, v) { 
        var _group = "("+ v.name +")";
        
        _createLabel(_myFirst + _group, _myLast + _group, v.name, 10);
    });
    
    // Add chart cursor
    _chart.cursor = new am4charts.XYCursor();
    _chart.cursor.behavior = "zoomY";

    var scrollbarX = new am4core.Scrollbar();
    _chart.scrollbarX = scrollbarX;
    
    // Add legend
    setLegend(_chart);
    setTrends(o.data, o.categoryObj);
}

//MAP CHART
function displayComMapChart(container){
    var _o = getChartDetails();
    var _categoryKey = (_o.location ? _o.location: _o.category);
    var _categoryKeyObj = (_o.location ? gLocations: gCategories);
    var _catLength = _categoryKeyObj.length;
    var _data = $.each(_o.selectedCategory, function(i, v) {
        var _region = $.trim(v.name);
        var _items = [];

        if( _region==="Asia Pacific" || _region==="Asia"){
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
        
        $.each(_categoryKeyObj, function(i, w) { 
            var _sub = [];
            var _cName = w.name;
            var _colorSet = new am4core.ColorSet();
            var _cColor = (w.color) ? w.color : _colorSet.getIndex(i);
            var _cItems = sortBy(w.items.groupBy([_o.category]), "name");
            var _json = { group: _region };
            var _res = v.items.filter(function (item) {
            	return item[_categoryKey] == _cName;
            });
            
            if(_res.length > 0 && _o.location){
                $.each(_cItems, function(x, y){
                    var _subJson = {};
                    var _subName = y.name;
                    var _subColor = getCategoryColor(_subName);
                    var _res2 = _res.filter(function (item) {
                    	return item[_o.category] == _subName;
                    });

                    _subJson.category = _subName;
                    _subJson.value = getCount(_res2, _o.value);
                    _subJson.color = (_subColor) ? _subColor : _colorSet.getIndex(_catLength + x);
                    
                    _sub.push(_subJson);
                });
                _sub = sortBy(_sub, "category");
            }
            
            _json.category = _cName;
            _json.value = getCount(_res, _o.value);
            _json.subs = _sub;
            _json.color = _cColor;

            _items.push(_json);
        });
        
        v.items = [];
        v.items = _items;
    
        return v;
    });

    // Create map instance
    var chart = am4core.create(container, am4maps.MapChart);
    chart.padding(35, 0, 0, 0);
    
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
    pieSeriesTemplate.labels.template.text = "{value.percent.formatNumber('#.##')}%";
    
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
            
            // series.slices.each(function(item) {
            //     if (item.isActive && item != ev.target) {
            //         item.isActive = false;
            //     }
            // });
            
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
            
            // pieSeries.data.map(function (item) {
            //     return item.items.forEach(function(v){
            //         if(v.category === category){
            //             v.pulled = true;
            //         }else{
            //             v.pulled = false;
            //         }
            //         return v;
            //     })
            // });
            //pieSeries.invalidateData();
        }
    });

    setTrends(_data);
}

//PIE DRILLDOWN SECTION
function displayDetailsSunburst(container, data, hasDummy){
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
    level0SeriesTemplate.tooltip.label.wrap = true;
    level0SeriesTemplate.tooltip.label.maxWidth = 300;
    chart.seriesTemplates.setKey("0", level0SeriesTemplate)
    
    // this makes labels to be hidden if they don't fit
    level0SeriesTemplate.labels.template.truncate = true;
    level0SeriesTemplate.labels.template.hideOversized = true;
    level0SeriesTemplate.labels.template.text = "{name}";
    
    if(hasDummy){
        level0SeriesTemplate.slices.template.tooltipText = "";
    }

    level0SeriesTemplate.labels.template.adapter.add("rotation", function(rotation, target) {
      target.maxWidth = target.dataItem.slice.radius - target.dataItem.slice.innerRadius - 10;
      target.maxHeight = Math.abs(target.dataItem.slice.arc * (target.dataItem.slice.innerRadius + target.dataItem.slice.radius) / 2 * am4core.math.RADIANS);
    
      return rotation;
    })
    
    var level1SeriesTemplate = level0SeriesTemplate.clone();
    chart.seriesTemplates.setKey("1", level1SeriesTemplate)
    level1SeriesTemplate.fillOpacity = 0.75;
    level1SeriesTemplate.hiddenInLegend = true;
    level1SeriesTemplate.tooltip.label.wrap = true;
    level1SeriesTemplate.tooltip.label.maxWidth = 300;
    
    var level2SeriesTemplate = level0SeriesTemplate.clone();
    chart.seriesTemplates.setKey("2", level2SeriesTemplate)
    level2SeriesTemplate.fillOpacity = 0.5;
    level2SeriesTemplate.hiddenInLegend = true;
    level2SeriesTemplate.tooltip.label.wrap = true;
    level2SeriesTemplate.tooltip.label.maxWidth = 300;
}

function displayDetailsPie(container, data){
    var chart = am4core.create(container, (gPrmIs3D ? am4charts.PieChart3D : am4charts.PieChart));
    chart.data = data
    
    // Add and configure Series
    var pieSeries = chart.series.push((gPrmIs3D ? new am4charts.PieSeries3D() : new am4charts.PieSeries()));
    pieSeries.dataFields.value = "value";
    pieSeries.dataFields.category = "category";
    pieSeries.colors.step = 2;
    pieSeries.tooltip.label.wrap = true;
    pieSeries.tooltip.label.maxWidth = 300;
    
    pieSeries.ticks.template.disabled = true;
    pieSeries.alignLabels = false;
    pieSeries.labels.template.text = "{value.percent.formatNumber('#.##')}%";
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
    pieSeries.labels.template.text = "{value.percent.formatNumber('#.##')}%";
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
        var series = ev.target.dataItem.component;
        series.slices.each(function(item) {
            if (item.isActive && item != ev.target) {
                item.isActive = false;
            }
        })
    });
}

function displayDetailsColumn(container, data, groupCategory){
    var o = getColumnChartData();
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
    valueAxis.max = 100;
    valueAxis.strictMinMax = true;
    valueAxis.renderer.labels.template.adapter.add("text", function(text) {
      return text + "%";
    });

    // Create series
    var _createSeries = function(field, name, color) {
        var series = chart.series.push((gPrmIs3D ? new am4charts.ColumnSeries3D() : new am4charts.ColumnSeries()));
        series.columns.template.width = am4core.percent(80);
        series.columns.template.tooltipText = "{name}: {valueY.totalPercent.formatNumber('#.##')}% ({valueY.formatNumber('"+ o.valueFormat +"')})";
        //series.columns.template.tooltipText = "[bold]{name}:[/] {valueY.formatNumber('#,###')} - [bold]{valueY.formatNumber('#,###')}[/]";
        series.columns.template.column.strokeOpacity = 0;
        series.name = name;
        series.dataFields.categoryX = "category";
        series.dataFields.valueY = field;
        series.dataItems.template.locations.categoryX = 0.5;
        series.stacked = true;
        series.tooltip.pointerOrientation = "vertical";
        series.sequencedInterpolation = true;
        series.dataFields.valueYShow = "totalPercent";
        series.fill = color;
        series.stroke = color;
        
        var valueLabel = series.bullets.push(new am4charts.LabelBullet());
        valueLabel.label.text = "{valueY.totalPercent.formatNumber('#.##')}%";
        valueLabel.fontSize = 10;
        valueLabel.label.fill = am4core.color("#ffffff");
        valueLabel.locationY = 0.5;
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
  
    $.each(groupCategory, function(i, v) { 
        var _name = v.name;
        var _field = _name.replace(/ /g,"_");
        var _color = v.color;
        
        _createSeries(_field, _name, _color);
    });
    
    var _index = getFirstAndLastItem(gOEMs, "name");
    
    $.each(o.selectedCategory, function(i, v) { 
        var _sName = v.name;
        var _first = _index.first + "("+ _sName +")";
        var _last = _index.last + "("+ _sName +")";
        
        _createLabel(_first, _last, _sName, 11);
    });
    
    //Add cursor
    chart.scrollbarX = new am4core.Scrollbar();

    chart.cursor = new am4charts.XYCursor();
    chart.cursor.behavior = "panX";
}

function displayDetailsRegionColumn(container, data, groupCategory){
    var o = getColumnChartData();
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
    valueAxis.max = 100;
    valueAxis.strictMinMax = true;
    valueAxis.renderer.labels.template.adapter.add("text", function(text) {
      return text + "%";
    });

    var _createSeries = function(field, name, color) {
        var series = chart.series.push((gPrmIs3D ? new am4charts.ColumnSeries3D() : new am4charts.ColumnSeries()));
        series.columns.template.width = am4core.percent(80);
        series.columns.template.tooltipText = "{name}: {valueY.totalPercent.formatNumber('#.##')}% ({valueY.formatNumber('"+ o.valueFormat +"')})";
        //series.columns.template.tooltipText = "[bold]{name}:[/] {valueY.formatNumber('#,###')} - [bold]{valueY.formatNumber('#,###')}[/]";
        series.columns.template.column.strokeOpacity = 0;
        series.name = name;
        series.dataFields.categoryX = "category";
        series.dataFields.valueY = field;
        series.dataItems.template.locations.categoryX = 0.5;
        series.stacked = true;
        series.tooltip.pointerOrientation = "vertical";
        series.sequencedInterpolation = true;
        series.dataFields.valueYShow = "totalPercent";
        series.fill = color;
        series.stroke = color;
        
        var valueLabel = series.bullets.push(new am4charts.LabelBullet());
        valueLabel.label.text = "{valueY.totalPercent.formatNumber('#.##')}%";
        valueLabel.fontSize = 10;
        valueLabel.label.fill = am4core.color("#ffffff");
        valueLabel.locationY = 0.5;
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
    
    $.each(groupCategory, function(i, v) { 
        var _name = v.name;
        var _field = _name.replace(/ /g,"_");
        var _color = v.color;
        
        _createSeries(_field, _name, _color);
    });
        
    var _my = getFirstAndLastItem(gModelYears , "name");
    var _myFirst = _my.first;
    var _myLast = _my.last;
   // var _pCatObj = (gPrmCategory==="Region" ? gRegionNames : gMarket);
    var _index = getFirstAndLastItem(gOEMs , "name");
    
    $.each(gModelYears, function(i, v) { 
        var _myName = v.name;
        
        $.each(o.selectedCategory, function(i, r) { 
            var _reg = r.name;
            var _first = _index.first + "("+ _myName +"-"+ _reg +")";
            var _last = _index.last + "("+ _myName +"-"+ _reg +")";
            
            _createLabel(_first, _last, _myName, 10);
        });
    });
    
    $.each(o.selectedCategory, function(i, r) { 
        var _reg = r.name;
        var _first = _index.first + "("+ _myFirst +"-"+ _reg +")";
        var _last = _index.last + "("+ _myLast +"-"+ _reg +")";
        
        _createLabel(_first, _last, _reg, 20);
    }); 
    
    //Add cursor
    chart.scrollbarX = new am4core.Scrollbar();

    chart.cursor = new am4charts.XYCursor();
    chart.cursor.behavior = "panX";
}

//COLUMN DRILLDOWN SECTION
function getColumnChartDataDD(o){
    var _obj = o;
    var _category = o.target.dataItem.component.name;
    var _color = o.target.fill;
    var _getData = function(){
        var _data = [];
        $.each(o.selectedCategory, function(i, v) { 
            var _name = v.name;
            var _json = {
                category : _name
            };
            
            $.each(o.locationObj, function(y, w) { 
                var _cName = w.name;
                var _cNameNew = _cName.replace(/ /g,"_");
                var _res = v.items.filter(function (item) {
                	return item[o.category] == _category && item[o.location] == _cName;
                });
                if( _res.length > 0 )
                    _json[_cNameNew] = getCount(_res, o.value);
            });
            _data.push(_json);
        });
        return _data;
    };
    var _getDataByRegion = function(){
        var _data = [];
        $.each(o.selectedCategory, function(i,r) {
            $.each(gModelYears, function(x, my) { 
                var _group = r.name;
                var _my = my.name;
                var _myItems = my.items;
                var _json = {};
                _json.group = _group;
                _json.model_year = _my;
                _json.category = _my +"("+ _group +")";
                
                $.each(gLocations, function(y, w) { 
                    var _cName = w.name;
                    var _cNameNew = _cName.replace(/ /g,"_");
                    var _res = _myItems.filter(function (item) {
                    	return item[o.location] == _cName && item[o.selectedKey] == _group && item[o.category] == _category;
                    });
                    if( _res.length > 0 )
                        _json[_cNameNew] = getCount(_res, o.value);
                });
                _data.push(_json);
            });
        });
        return _data;
    };
    var _getLegend = function(){
        var _legend = [];
        var _result = o.categoryObj.filter(function(item){ return item.name == _category });
        if( _result.length > 0){
            if(isContain(gCName, "Power Distribution Box Counts")){
                var _res = _result[0].items.getUniqueRows(["project_name"]);
                if( _res.length > 0){
                    $.each(_res, function(i, v){
                        _legend.push({
                            name: v.project_name,
                            fill: "undefined"
                        });
                    });
                }
            }
        }
        return _legend;
    };
    var _getSubDD = function(){
        var _data = [];
        var _result = o.categoryObj.filter(function(item){ return item.name == _category });
        if( _result.length > 0){
            _tmp = _result[0].items.groupBy([o.location]);
            $.each(_tmp, function(i, v){
                var _res2 =  _obj.locationObj.filter(function(item){ return item.name == v.name });
                v.color = ( _res2.length > 0) ? _res2[0].color : "";
                    
                _data.push(v);
            });
        }
        return _data;
    };
    
    var _$selectedCategory = $("#selected_category");
    var _$optionBox = $("#chart_details_graph");
    var _$chartWrapper = $(".chart-wrapper");
    var _container = "bar_details";
    var _$container = $("#" + _container);
        _$selectedCategory.text(_category).css("background-color", _color);
        _$optionBox.addClass("d-none");
        _$chartWrapper.removeClass("d-none");
        _$container.removeClass("d-none").height(_$chartWrapper.height());
    
    if(gPrmCategory==="Region" || gPrmCategory==="Market" || gPrmSubCategory!==""){
        _obj.subData = _getDataByRegion();
    }else{
        _obj.subData = _getData();
    }
    _obj.container = _container;
    _obj.legend = _getLegend();
    _obj.locationObjSelected = _getSubDD();
    return _obj;
}

function displayDDColumn(o){
    var _o = getColumnChartDataDD(o);
    var chart = am4core.create(_o.container, (gPrmIs3D ? am4charts.XYChart3D : am4charts.XYChart));
    chart.data = _o.subData;
    chart.padding(15, 15, 10, 15);
    chart.maskBullets = false;

    // Create axes
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "category";
    categoryAxis.renderer.minGridDistance = 60;
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.interactionsEnabled = false;
    categoryAxis.renderer.labels.template.fontSize = 10;
    
    if(gPrmCategory!=="Model Year" && gPrmSubCategory===""){
        categoryAxis.renderer.labels.template.adapter.add("dy", function(dy, target) {
          if (target.dataItem && target.dataItem.index & 2 == 2) {
            return dy + 10;
          }
          return dy;
        });
    }
    
    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    valueAxis.calculateTotals = true;
    
    if(gIsFullStacked || !gIsStacked){
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
        series.columns.template.tooltipText = "{name}: {valueY.totalPercent.formatNumber('#.##')}% ({valueY.formatNumber('"+ o.valueFormat +"')})";
        series.columns.template.column.strokeOpacity = 0;
        series.name = name;
        series.dataFields.categoryX = "category";
        series.dataFields.valueY = field;
        series.dataItems.template.locations.categoryX = 0.5;
        series.stacked = gIsStacked;
        series.tooltip.pointerOrientation = "vertical";
        series.sequencedInterpolation = true;
        series.fill = color;
        series.stroke = color;
        
        if(gIsFullStacked || !gIsStacked){
            series.dataFields.valueYShow = "totalPercent";
        }
        
        var valueLabel = series.bullets.push(new am4charts.LabelBullet());
        valueLabel.label.text = "{valueY.totalPercent.formatNumber('#.##')}%";
        valueLabel.fontSize = 10;
        
        if(gIsStacked){
            valueLabel.label.fill = am4core.color("#ffffff");
            valueLabel.locationY = 0.5;
        }else{
            valueLabel.dy = -10;
        }
    };
    
    
    $.each(_o.locationObjSelected, function(i, v) { 
        var _name = v.name;
        var _nameNew = _name.replace(/ /g,"_");
        var _color = (_color) ? _color : chart.colors.getIndex(i);
        
        if(isContain(gCName, "Power Distribution Box Counts")){
            $.map(_o.legend,function(item){
                if(_name.indexOf(item.name) !== -1) item.fill = _color;
                return item;
            });
        }
            
        _createSeries(_nameNew, _name, _color);
    });
    
    //Add cursor
    chart.scrollbarX = new am4core.Scrollbar();

    chart.cursor = new am4charts.XYCursor();
    chart.cursor.behavior = "panX";
    
    setSubLegend(chart, _o);
}

function displayDDColumnRegion(o){
    var _o = getColumnChartDataDD(o);
    var chart = am4core.create(_o.container, (gPrmIs3D ? am4charts.XYChart3D : am4charts.XYChart));
    chart.data = _o.subData;
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

    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    valueAxis.calculateTotals = true;
    
    if(gIsFullStacked || !gIsStacked){
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
        series.columns.template.tooltipText = "{name}: {valueY.totalPercent.formatNumber('#.##')}% ({valueY.formatNumber('"+ o.valueFormat +"')})";
        series.columns.template.column.strokeOpacity = 0;
        series.name = name;
        series.dataFields.categoryX = "category";
        series.dataFields.valueY = field;
        series.dataItems.template.locations.categoryX = 0.5;
        series.stacked = gIsStacked;
        series.tooltip.pointerOrientation = "vertical";
        series.sequencedInterpolation = true;
        series.fill = color;
        series.stroke = color;
    
        if(gIsFullStacked || !gIsStacked){
            series.dataFields.valueYShow = "totalPercent";
        }
        
        var valueLabel = series.bullets.push(new am4charts.LabelBullet());
        valueLabel.label.text = "{valueY.totalPercent.formatNumber('#.##')}%";
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
    
    $.each(_o.locationObjSelected, function(i, v) { 
        var _name = v.name;
        var _nameNew = _name.replace(/ /g,"_");
        var _color = (_color) ? _color : chart.colors.getIndex(i);
  
        if(isContain(gCName, "Power Distribution Box Counts")){
            $.map(_o.legend,function(item){
                if(_name.indexOf(item.name) !== -1) item.fill = _color; 
                return item;
            });
        }
        
        _createSeries(_nameNew, _name, _color);
    });
    
    var _my = getFirstAndLastItem(gModelYears , "name");
    var _myFirst = _my.first;
    var _myLast = _my.last;
    $.each(_o.selectedCategory, function(i, v) { 
        var _group = "("+ v.name +")";
        
        _createLabel(_myFirst + _group, _myLast + _group, v.name, 10);
    });

    //Add cursor
    chart.scrollbarX = new am4core.Scrollbar();

    chart.cursor = new am4charts.XYCursor();
    chart.cursor.behavior = "panX";
    
    setSubLegend(chart, _o);
}

//BAR DRILLDOWN SECTION
function displayDDBar(o){
    var _o = getColumnChartDataDD(o);
    var chart = am4core.create(_o.container, (gPrmIs3D ? am4charts.XYChart3D : am4charts.XYChart));
    chart.data = _o.subData;
    chart.padding(15, 15, 10, 15);
    chart.maskBullets = false;

    // Create axes
    var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "category";
    categoryAxis.renderer.minGridDistance = 60;
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.inversed = true;
    categoryAxis.renderer.labels.template.fontSize = 10;
    
    var label = categoryAxis.renderer.labels.template;
    label.wrap = true;
    label.maxWidth = 200;
    //label.fontWeight = "bold";
    
    var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    valueAxis.calculateTotals = true;
    valueAxis.renderer.labels.template.fontSize = 10;
    
    if(gIsFullStacked || !gIsStacked){
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
        series.columns.template.tooltipText = "{name}: {valueX.totalPercent.formatNumber('#.##')}% ({valueX.formatNumber('"+ o.valueFormat +"')})";
        series.columns.template.column.strokeOpacity = 0;
        series.name = name;
        series.dataFields.categoryY = "category";
        series.dataFields.valueX = field;
        series.dataItems.template.locations.categoryY = 0.5;
        series.stacked = gIsStacked;
        series.sequencedInterpolation = true;
        series.fill = color;
        series.stroke = color;
        
        if(gIsFullStacked || !gIsStacked){
            series.dataFields.valueXShow = "totalPercent";
        }
       
        var valueLabel = series.bullets.push(new am4charts.LabelBullet());
        valueLabel.label.text = "{valueX.totalPercent.formatNumber('#.##')}%";
        valueLabel.fontSize = 10;
        
        if(gIsStacked){
            valueLabel.label.fill = am4core.color("#ffffff");
            valueLabel.locationX = 0.5;
        }else{
            valueLabel.label.horizontalCenter = "left";
            valueLabel.label.dx = 10;
        }
    };

    $.each(_o.locationObjSelected, function(i, v) { 
        var _name = v.name;
        var _nameNew = _name.replace(/ /g,"_");
        var _color = (_color) ? _color : chart.colors.getIndex(i);
  
        if(isContain(gCName, "Power Distribution Box Counts")){
            $.map(_o.legend,function(item){
                if(_name.indexOf(item.name) !== -1) item.fill = _color; 
                return item;
            });
        }
        
        _createSeries(_nameNew, _name, _color);
    });
    
    //Add cursor
    chart.scrollbarY = new am4core.Scrollbar();
    
    setSubLegend(chart, _o);
}

function displayDDBarRegion(o){
    var _o = getColumnChartDataDD(o);
    var chart = am4core.create(_o.container, (gPrmIs3D ? am4charts.XYChart3D : am4charts.XYChart));
    chart.data = _o.subData;
    chart.padding(15, 15, 10, 15);
    chart.maskBullets = false;
    
    var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "category";
    categoryAxis.renderer.minGridDistance = 60;
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.interactionsEnabled = false;
    categoryAxis.renderer.inversed = true;
    categoryAxis.numberFormatter.numberFormat = "#";
    categoryAxis.renderer.labels.template.fontSize = 10;
    categoryAxis.renderer.labels.template.adapter.add("textOutput", function(text) {
        return (typeof(text)!=="undefined" ? text.replace(/\(.*/, "") : text);
    });
    
    var label = categoryAxis.renderer.labels.template;
    
    var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    valueAxis.calculateTotals = true;
    valueAxis.renderer.labels.template.fontSize = 10;
    
    if(gIsFullStacked || !gIsStacked){
        valueAxis.max = 100;
        valueAxis.strictMinMax = true;
        valueAxis.renderer.labels.template.adapter.add("text", function(text) {
          return text + "%";
        });
    }
    
    var _createSeries = function(field, name, color) {
        var series = chart.series.push((gPrmIs3D ? new am4charts.ColumnSeries3D() : new am4charts.ColumnSeries()));
        series.columns.template.tooltipText = "{name}: {valueX.totalPercent.formatNumber('#.##')}% ({valueX.formatNumber('"+ o.valueFormat +"')})";
        series.columns.template.column.strokeOpacity = 0;
        series.name = name;
        series.dataFields.categoryY = "category";
        series.dataFields.valueX = field;
        series.dataItems.template.locations.categoryY = 0.5;
        series.stacked = gIsStacked;
        series.sequencedInterpolation = true;
        series.fill = color;
        series.stroke = color;
        
        if(gIsFullStacked || !gIsStacked){
            series.dataFields.valueXShow = "totalPercent";
        }
        
        var valueLabel = series.bullets.push(new am4charts.LabelBullet());
        valueLabel.label.text = "{valueX.totalPercent.formatNumber('#.##')}%";
        valueLabel.fontSize = 10;
        
        if(gIsStacked){
            valueLabel.label.fill = am4core.color("#ffffff");
            valueLabel.locationX = 0.5;
        }else{
            valueLabel.label.horizontalCenter = "left";
            valueLabel.label.dx = 10;
        }
    };
    
    var _createLabel = function(category, endCategory, label, dx) {
        var range = categoryAxis.axisRanges.create();
        range.category = category;
        range.endCategory = endCategory;
        range.label.text = label;
        range.label.disabled = false;
        range.label.location = 0.5;
        range.label.dx = dx;
        range.label.rotation = 90;
        range.label.fontWeight = "bold";
        range.label.fontSize = 10;
        range.label.horizontalCenter = "middle";
        range.label.inside = true;
        range.grid.stroke = am4core.color("#396478");
        range.grid.strokeOpacity = 1;
        range.tick.length = 500;
        range.tick.disabled = false;
        range.tick.strokeOpacity = 0.6;
        range.tick.stroke = am4core.color("#396478");
        range.tick.location = 0;
        range.locations.category = 0;
    };
    
    $.each(_o.locationObjSelected, function(i, v) { 
        var _name = v.name;
        var _nameNew = _name.replace(/ /g,"_");
        var _color = (_color) ? _color : chart.colors.getIndex(i);
  
        if(isContain(gCName, "Power Distribution Box Counts")){
            $.map(_o.legend,function(item){
                if(_name.indexOf(item.name) !== -1) item.fill = _color; 
                return item;
            });
        }
        
        _createSeries(_nameNew, _name, _color);
    });
    
    var _my = getFirstAndLastItem(gModelYears , "name");
    var _myFirst = _my.first;
    var _myLast = _my.last;
    $.each(_o.selectedCategory, function(i, v) { 
        var _group = "("+ v.name +")";
        
        _createLabel(_myFirst + _group, _myLast + _group, v.name, -73);
    });

    //Add cursor
    chart.scrollbarY = new am4core.Scrollbar();
    
    setSubLegend(chart, _o);
}

//LINE DRILLDOWN SECTION
function displayDDLine(o){
    var _o = getColumnChartDataDD(o);
    var _chart = am4core.create(_o.container, (gPrmIs3D ? am4charts.XYChart3D : am4charts.XYChart));
    _chart.data = _o.subData;
    _chart.maskBullets = false;
    
    // Create category axis
    var categoryAxis = _chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "category";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.interactionsEnabled = false;
    categoryAxis.renderer.labels.template.fontSize = 10;
    
    if(gPrmCategory!=="Model Year"){
        categoryAxis.renderer.labels.template.adapter.add("dy", function(dy, target) {
          if (target.dataItem && target.dataItem.index & 2 == 2) {
            return dy + 10;
          }
          return dy;
        });
    }
    
    if(gPrmGraphType==="area"){
        categoryAxis.startLocation = 0.5;
        categoryAxis.endLocation = 0.5;
    }
    
    // Create value axis
    var valueAxis = _chart.yAxes.push(new am4charts.ValueAxis());
    
    var _createSeries = function(field, name, color) {
        // Create series
        var series = _chart.series.push(new am4charts.LineSeries());
        series.dataFields.valueY = field;
        series.dataFields.categoryX = "category";
        series.name = name;
        series.strokeWidth = 3;
        
        series.tooltipText = "{name}: {valueY.formatNumber('"+ o.valueFormat +"')}";
        series.legendSettings.valueText = "{valueY}";
        series.fill = color;
        series.stroke = color;

        if(gPrmGraphType==="line"){
            var bullet = series.bullets.push(new am4charts.CircleBullet());
            bullet.circle.radius = 8;
            bullet.circle.stroke = am4core.color("#fff");
            bullet.circle.strokeWidth = 3;
            series.strokeOpacity = 1;
        }
        
        if(gPrmGraphType==="area"){
            series.fillOpacity = 0.5;
        }
        
        if(gPrmGraphType==="scatter"){
            series.bullets.push(new am4charts.CircleBullet());
            series.strokeOpacity = 0;
        }
    };
    
    $.each(_o.locationObjSelected, function(i, v) { 
        var _name = v.name;
        var _nameNew = _name.replace(/ /g,"_");
        var _color = (_color) ? _color : _chart.colors.getIndex(i);
  
        if(isContain(gCName, "Power Distribution Box Counts")){
            $.map(_o.legend,function(item){
                if(_name.indexOf(item.name) !== -1) item.fill = _color; 
                return item;
            });
        }
        
        _createSeries(_nameNew, _name, _color);
    });
    
    // Add chart cursor
    _chart.cursor = new am4charts.XYCursor();
    _chart.cursor.behavior = "zoomY";

    var scrollbarX = new am4core.Scrollbar();
    _chart.scrollbarX = scrollbarX;
    
    setSubLegend(_chart, _o);
}

function displayDDLineRegion(o){
    var _o = getColumnChartDataDD(o);
    var _chart = am4core.create(_o.container, (gPrmIs3D ? am4charts.XYChart3D : am4charts.XYChart));
    _chart.data = _o.subData;
    _chart.maskBullets = false;
    
    // Create category axis
    var categoryAxis = _chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "category";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.interactionsEnabled = false;
    categoryAxis.renderer.labels.template.fontSize = 10;
    categoryAxis.renderer.labels.template.adapter.add("textOutput", function(text) {
        return (typeof(text)!=="undefined" ? text.replace(/\(.*/, "") : text);
    });
    
    if(gPrmGraphType==="area"){
        categoryAxis.startLocation = 0.5;
        categoryAxis.endLocation = 0.5;
    }
    
    // Create value axis
    var valueAxis = _chart.yAxes.push(new am4charts.ValueAxis());

    var _createSeries = function(field, name, color) {
        // Create series
        var series = _chart.series.push(new am4charts.LineSeries());
        series.dataFields.valueY = field;
        series.dataFields.categoryX = "category";
        series.name = name;
        series.strokeWidth = 3;
        series.tooltipText = "{name}: {valueY.formatNumber('"+ o.valueFormat +"')}";
        series.legendSettings.valueText = "{valueY}";
        series.fill = color;
        series.stroke = color;
        
        if(gPrmGraphType==="line"){
            var bullet = series.bullets.push(new am4charts.CircleBullet());
            bullet.circle.radius = 8;
            bullet.circle.stroke = am4core.color("#fff");
            bullet.circle.strokeWidth = 3;
        }
        
        if(gPrmGraphType==="area"){
            series.fillOpacity = 0.5;
        }
        
        if(gPrmGraphType==="scatter"){
            series.bullets.push(new am4charts.CircleBullet());
            series.strokeOpacity = 0;
        }
    };
    
    var _createLabel = function(category, endCategory, label) {
        var range = categoryAxis.axisRanges.create();
        range.category = category;
        range.endCategory = endCategory;
        range.label.dataItem.text = label;
        range.label.dy = 11;
        range.label.fontWeight = "bold";
        range.grid.stroke = am4core.color("#396478");
        range.grid.strokeOpacity = 1;
        range.tick.length = 230;
        range.tick.disabled = false;
        range.tick.strokeOpacity = 0.6;
        range.tick.location = 0;
        range.locations.category = 0;
    };
    
    $.each(_o.locationObjSelected, function(i, v) { 
        var _name = v.name;
        var _nameNew = _name.replace(/ /g,"_");
        var _color = (_color) ? _color : _chart.colors.getIndex(i);
  
        if(isContain(gCName, "Power Distribution Box Counts")){
            $.map(_o.legend,function(item){
                if(_name.indexOf(item.name) !== -1) item.fill = _color; 
                return item;
            });
        }
        
        _createSeries(_nameNew, _name, _color);
    });
    
    var _my = getFirstAndLastItem(gModelYears , "name");
    var _myFirst = _my.first;
    var _myLast = _my.last;
    $.each(_o.selectedCategory, function(i, v) { 
        var _group = "("+ v.name +")";
        
        _createLabel(_myFirst + _group, _myLast + _group, v.name, 10);
    });
    
    // Add chart cursor
    _chart.cursor = new am4charts.XYCursor();
    _chart.cursor.behavior = "zoomY";

    var scrollbarX = new am4core.Scrollbar();
    _chart.scrollbarX = scrollbarX;
    
    setSubLegend(_chart, _o);
}

// Wires & Cables
// New Conductor Technology with Lesser Dimensions
function displayNCTLesserDimensions(container, callback){
    gDataNCT = [];
    var _trendData = [];
    var _createChart = function(model_year, items, chartId){
        var _data = [];
        var _tmp = [];
        var _wireTypes = items.groupBy(["wire_type"]);
        var lowerLimit = (items.length > 0 ? items[0].lower_dia : 0);
        var upperLimit = (items.length > 0 ? items[0].upper_dia : 0);
        var valueMax = upperLimit;
        
        $.each(_wireTypes, function(i, v){
            var _wType = v.name;
            var _wLength = v.items.length;
            var _res = items.filter(function(item){ 
                return item.wire_type == _wType;  
            });
            
            var _avg = _res.reduce(function (accumulator, currentValue) {
                    return parseFloat(accumulator) + parseFloat(currentValue.avg_dia);
                }, 0);
            _avg  = (_avg / _res.length);
            _avg = (isNaN(_avg) ? 0 : _avg);
            
            _data.push({
                category : _wType,
                [model_year] : _avg
            });
            
            if(lowerLimit > _avg){
                _tmp.push({
                    group: model_year,
                    category: _wType,
                    value : _avg
                });
            }
            
            if(_avg > valueMax) valueMax = _avg;
                
            gDataNCT.push({
                group: model_year,
                category: _wType,
                value : _avg,
                lower: lowerLimit,
                upper: upperLimit
            });
        }); 
     
        _trendData.push({
            group : model_year,
            items: _tmp
        });
  
        var chart = am4core.create(chartId, am4charts.XYChart);
        chart.data = _data;
        chart.numberFormatter.numberFormat = "#.000000";
        chart.padding(40, 0, 0, 0);
        
        // Create axes
        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "category";
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.renderer.minGridDistance = 20;
        categoryAxis.renderer.labels.template.horizontalCenter = "right";
        categoryAxis.renderer.labels.template.verticalCenter = "middle";
        categoryAxis.renderer.labels.template.rotation = 310;
    
        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.min = 0;
        valueAxis.max = valueMax;
        //valueAxis.title.text = "Avg. Weight";
        valueAxis.renderer.minGridDistance = 20;
        //valueAxis.renderer.numberFormatter.numberFormat = "#.#####";
        valueAxis.numberFormatter = new am4core.NumberFormatter();
        valueAxis.numberFormatter.numberFormat = "#.000000";
        
        var axisTooltip = valueAxis.tooltip;
    
        axisTooltip.numberFormatter = new am4core.NumberFormatter();
        axisTooltip.numberFormatter.numberFormat = "#.000000";
        
        var axisTooltip = valueAxis.tooltip;
        
        //Create Series
        var series = chart.series.push(new am4charts.LineSeries());
        series.dataFields.categoryX = "category";
        series.dataFields.valueY = model_year;
        series.strokeWidth = 2;
        series.name = model_year;
        series.tooltipText = "{name}: [bold]{valueY}[/]";
        
        if(gPrmGraphType==="scatter"){
            series.strokeOpacity = 0;
            series.bullets.push(new am4charts.CircleBullet());
        }
    
        // Add simple bullet
        // var circleBullet = series.bullets.push(new am4charts.CircleBullet());
        // circleBullet.circle.strokeWidth = 1;
        
        // Create value axis range
        var range = valueAxis.axisRanges.create();
        range.value = upperLimit;
        range.grid.stroke = am4core.color("#A96478");
        range.grid.strokeWidth = 2;
        range.grid.strokeOpacity = 1;
        range.label.inside = true;
        range.label.text = "Upper Diameter Limit";
        range.label.fill = range.grid.stroke;
        range.label.verticalCenter = "bottom";
        
        var range2 = valueAxis.axisRanges.create();
        range2.value = lowerLimit;
        range2.grid.stroke = am4core.color("#396478");
        range2.grid.strokeWidth = 2;
        range2.grid.strokeOpacity = 1;
        range2.label.inside = true;
        range2.label.text = "Lower Diameter Limit";
        range2.label.fill = range2.grid.stroke;
        range2.label.verticalCenter = "top";
        
        // Add legend
        chart.legend = new am4charts.Legend();
    
        // Add cursor
        chart.cursor = new am4charts.XYCursor();
    };
    
    var _chartWidth = $(".chart-wrapper").width();
    var _container = "#"+ container;
    var _tw = new zsi.easyJsTemplateWriter(_container);
 
    $.each(gModelYears, function(i, v){
        var _my = v.name;
        var _items = v.items;
        var _charId = "chart_"+ i;
            _tw.div({ id: _charId, style: "width:" + _chartWidth + "px" });

        _createChart(_my, _items, _charId);
    });
    $(_container).width((_chartWidth * gModelYears.length) - 1);
    
    setCustomTrend(_trendData);
}

// New Conductor Technology with Lesser Weight
function displayNCTLesserWeight(container, callback){
    gDataNCT = [];
    var _trendData = [];
    var _createChart = function(model_year, items, chartId){
        var _data = [];
        var _tmp = [];
        var _dataRes = items.filter(function(item){ return $.trim(item.conductor_type)=="BARE COPPER" });
        var _wireTypes = items.groupBy(["wire_type"]);
        var lowerLimit = _dataRes.reduce(function (accumulator, currentValue) {
                        return accumulator + currentValue.wire_ll;
                    }, 0);
            lowerLimit = (lowerLimit / _dataRes.length);
        
        var upperLimit = _dataRes.reduce(function (accumulator, currentValue) {
                        return accumulator + currentValue.wire_ul;
                    }, 0);
            upperLimit = (upperLimit / _dataRes.length);
        var valueMax = upperLimit;
        
        $.each(_wireTypes, function(i, v){
            if(v.name){
                var _wType = v.name;
                var _wLength = v.items.length;
                var _res = items.filter(function(item){ 
                    return item.wire_type == _wType;  
                });
                var _avg = _res.reduce(function (accumulator, currentValue) {
                        return parseFloat(accumulator) + parseFloat(currentValue.qweight);
                    }, 0);
                    
                _avg = (_avg / _res.length);
                _avg = (isNaN(_avg) ? 0 : _avg);
                
                _data.push({
                    category : _wType,
                    [model_year] : _avg
                });
                
                if(lowerLimit > _avg){
                    _tmp.push({
                        group: model_year,
                        category: _wType,
                        value : _avg
                    });
                }
                
                if(_avg > valueMax) valueMax = _avg;
                
                gDataNCT.push({
                    group: model_year,
                    category: _wType,
                    value : _avg,
                    lower: lowerLimit,
                    upper: upperLimit
                });
            }
        }); 
        
        _trendData.push({
            group : model_year,
            items: _tmp
        });

        var chart = am4core.create(chartId, am4charts.XYChart);
        chart.data = _data;
        chart.numberFormatter.numberFormat = "#.000000";
        chart.padding(40, 0, 0, 0);
       
        // Create axes
        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "category";
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.renderer.minGridDistance = 20;
        categoryAxis.renderer.labels.template.horizontalCenter = "right";
        categoryAxis.renderer.labels.template.verticalCenter = "middle";
        categoryAxis.renderer.labels.template.rotation = 310;
    
        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.min = 0;
        valueAxis.max = valueMax;
        //valueAxis.extraMax = 0.2;
        //valueAxis.logarithmic = true;
        //valueAxis.maximum = 1;
        //valueAxis.title.text = "Avg. Weight";
        valueAxis.renderer.minGridDistance = 20;
        //valueAxis.renderer.numberFormatter.numberFormat = "#.#####";
        valueAxis.numberFormatter = new am4core.NumberFormatter();
        valueAxis.numberFormatter.numberFormat = "#.000000";
        
        var axisTooltip = valueAxis.tooltip;
    
        axisTooltip.numberFormatter = new am4core.NumberFormatter();
        axisTooltip.numberFormatter.numberFormat = "#.000000";
        
        var axisTooltip = valueAxis.tooltip;
        
        //Create Series
        var series = chart.series.push(new am4charts.LineSeries());
        series.dataFields.categoryX = "category";
        series.dataFields.valueY = model_year;
        series.strokeWidth = 2;
        series.name = model_year;
        series.tooltipText = "{name}: [bold]{valueY}[/]";
    
        if(gPrmGraphType==="scatter"){
            series.strokeOpacity = 0;
            series.bullets.push(new am4charts.CircleBullet());
        }
    
        // Add simple bullet
        //var circleBullet = series.bullets.push(new am4charts.CircleBullet());
        //circleBullet.circle.strokeWidth = 1;
        
        // Create value axis range
        var range = valueAxis.axisRanges.create();
        range.value = upperLimit;
        range.grid.stroke = am4core.color("#A96478");
        range.grid.strokeWidth = 2;
        range.grid.strokeOpacity = 1;
        range.label.inside = true;
        range.label.text = "Upper Weight";
        range.label.fill = range.grid.stroke;
        range.label.verticalCenter = "bottom";

        var range2 = valueAxis.axisRanges.create();
        range2.value = lowerLimit;
        range2.grid.stroke = am4core.color("#396478");
        range2.grid.strokeWidth = 2;
        range2.grid.strokeOpacity = 1;
        range2.label.inside = true;
        range2.label.text = "Lower Weight";
        range2.label.fill = range2.grid.stroke;
        range2.label.verticalCenter = "top";
        
        // Add legend
        chart.legend = new am4charts.Legend();
    
        // Add cursor
        chart.cursor = new am4charts.XYCursor();
    };
    
    var _chartWidth = $(".chart-wrapper").width();
    var _container = "#"+ container;
    var _tw = new zsi.easyJsTemplateWriter(_container);
    
    $.each(gModelYears, function(i, v){
        var _my = v.name;
        var _items = v.items;
        var _charId = "chart_"+ i;
            _tw.div({ id: _charId, style: "width:" + _chartWidth + "px" });

        _createChart(_my, _items, _charId);
    });
    $(_container).width((_chartWidth * gModelYears.length) - 1);

    setCustomTrend(_trendData);
}

function setCustomTrend(data){
    var _group1 = data;
    var _group2 = data;
    var _dLength = data.length;
    var _tmpObj1 = [];
    var _tmpObj2 = [];
    var _aTrends=[];
    var _aBestpractice=[];
    var _aTmpBestpractice=[];
    var _aEvolution=[];

    if(data.length > 3){
        _group1 = data.slice(_dLength-3, _dLength);
    }
    _group1.forEach(function(v){
        $.merge(_tmpObj1, v.items);
    });

    if(data.length > 2) {
        _group2 = data.slice(_dLength-2, _dLength);
    }
    _group2.forEach(function(v){
        $.merge(_tmpObj2, v.items);
    });
    
    var _evo = _tmpObj1.groupBy(["category"]);
    var _trend = _tmpObj2.groupBy(["category"]);
    var _bp = _trend;
    var _display = function($obj,arr){
        $obj.empty();
        $.each(arr,function(i,v){
            if(gPrmSubCategory!=="" || gPrmCategory==="Model Year"){
                $obj.append(v + "<br />");
            }
        });
    };    
    //-----------------Trends----------------//
    $.each(_trend,function(i,v){
        //compare 2 data for trends
        if(v.items.length > 1){
            var info1 = v.items[v.items.length-2];
            var info2 = v.items[v.items.length-1];
        
    		if(info2.value > info1.value){
    		     _aTrends.push(v.name);
            }
        }
    });
            
    //----------------Best Practice---------------//
    $.each(_bp,function(i,v){
         //get temporary best practice data; 
        if(v.items.length > 1){
    	    _aTmpBestpractice.push(v.name); 
        }
    });
    
    //get final best practice data; 
    $.each(_aTmpBestpractice,function(i1,v1){
        var isFound = false;
        $.each(_aTrends,function(i2,v2){
            if( v1==v2 ){
                isFound=true;
                return false;
            }
        });     
        if( ! isFound) _aBestpractice.push(v1);
    });
    
    //------------------Evolution----------------//
    $.each(_evo,function(i,v){
        if(v.items.length === 1){
    	    _aEvolution.push(v.name); 
        }
    });
    
    _display( $("div#trends"), _aTrends );
    _display( $("div#bestpractice"), _aBestpractice );   
    _display( $("div#opportunities"), _aEvolution ); 
}

//********************************* END CHART ********************************//
function isString(string){
   return (typeof string === 'string' || string instanceof String);
}

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
                     