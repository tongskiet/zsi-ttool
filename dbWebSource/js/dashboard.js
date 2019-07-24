var bs = zsi.bs.ctrl
    ,svn =  zsi.setValIfNull
    ,item_cat_id = zsi.getUrlParamValue("item_cat_id")
    ,optionId = zsi.getUrlParamValue("option_id")
    ,g_warehouse_id = null
    ,option_id = (optionId ? optionId : "A")
    ,pageName = location.pathname.split('/').pop()
    ,g_column_name = ""
    ,g_keyword= ""
    ,g_tab_name = "ASSEMBLY" //Default Selected Tab
    ,g_item_inv_id = null
    ,status_id = ""
;
    const statusId = {
    stockQty: 23,
    forRepair: 24,
    beyondRepair: 60,
};

function setInputs(){
    $optionId = $("#option_id");
    $keyword  = $("#keyword");
    $column   = $("#column");
}

zsi.ready(function(){
    getTemplate();
    $(".pageTitle").html('<select name="dd_dashboard" id="dd_dashboard"> </select>');
    
    wHeight = $(window).height();
    setInputs();
    $optionId.fillSelect({
        data : [
             { text: "All", value: "A" }
            ,{ text: "For Reorder", value: "R" }
        ]
        ,selectedValue : option_id
        ,defauleValue  : "A"
        ,required      : true
    });
    $("#option_id").val("A");
    
    $.get(procURL + "user_info_sel", function(d) {
        if (d.rows !== null && d.rows.length > 0) {
            g_user_id = d.rows[0].user_id;
            g_organization_id = d.rows[0].organization_id;
            g_organization_name = d.rows[0].organizationName;
            g_warehouse_id = d.rows[0].warehouse_id;
            g_location_name = d.rows[0].warehouse_location;
            g_location_name = (g_location_name? " » " + g_location_name:"");
           
            $(".pageTitle").append(' for ' + g_organization_name + ' » <select name="dd_warehouses" id="dd_warehouses"></select>');
            $("#dd_dashboard").dataBind({
                url: procURL + "dd_dashboard_sel"
                , text: "page_title"
                , value: "page_name"
                , required :true
                , onComplete: function(){
                    $("#dd_dashboard").val(pageName);
                    $("#dd_dashboard").change(function(){
                        if(this.value){
                            if(this.value.toUpperCase()!== pageName.toUpperCase())
                                location.replace(base_url + "page/name/" + this.value);
                        } 
                    });
                }
            });
            $("select[name='dd_warehouses']").dataBind({
                url: execURL + "dd_warehouses_sel @user_id=" + g_user_id
                , text: "warehouse"
                , value: "warehouse_id"
                , required :true
                , onComplete: function(){
                    
                    g_warehouse_id = $("select[name='dd_warehouses'] option:selected" ).val();
                    
                    $("select[name='dd_warehouses']").change (function(){
                       if(this.value){
                            g_warehouse_id = this.value;
                            displayTabs(); 
                       }
                    });
                    displayTabs();
                }
            });  
        }
    });
    
});

var contextModalStockQty = {
    id: "modalSerial"
    , title: ""
    , sizeAttr: "fullWidth"
    , body: '<div id="tblSerial" class="zGrid detail ui-front"></div>'
};

// Get the template for the initialization of the modal windows.
function getTemplate(){
    $.get(base_url + "templates/bsDialogBox.txt",function(d){
        var template = Handlebars.compile(d);
        $("body").append(template(contextModalStockQty));
    });    
}

$("#btnGo").click(function(data){
    getFilterValue();
    displayItems(item_cat_id);
});

$("#btnClear").click(function(){
    g_keyword = "";
    g_column_name = "";
    $column.val('');
    $keyword.val('');
    displayItems(item_cat_id);
});

function getFilterValue(){
    option_id = ($optionId.val() ? $optionId.val(): "");
    g_keyword = $.trim($keyword.val());
    g_column_name = ($column.val() ? $column.val(): "");
}

function displayTabs(cbFunc){
    $.get(execURL + "item_categories_sel", function(data){
        var _rows      = data.rows;
        var tabList    = '<ul class="nav nav-tabs" role="tablist">';
        var tabContent = '<div class="tab-content">';
        var i,d;
        for(i=0; i < _rows.length; i++){
            d =_rows[i];
            var active      = (i===0 ? "active": "");
            tabList += '<li role="presentation" class="'+ active +'"><a id="'+ d.item_cat_id +'" href="#'+ d.item_cat_name +'" aria-controls="'+ d.item_cat_name +'" role="tab" data-toggle="tab">'+ d.item_cat_name +'</a></li>';
            tabContent += '<div role="tabpanel" class="tab-pane '+ active +'" id="'+ d.item_cat_name +'"><div class="zGrid" id="tabGrid'+   d.item_cat_id  +'" ></div></div>';
        }
        tabList += "</ul>";
        tabContent += "</div>";
        
        $("#tabWrapper").html(tabList + tabContent);
        
        var activeTabId = $("ul.nav-tabs").find("li.active a").attr("id");
        displayItems(activeTabId);
         
        $("a[role='tab']").click(function(){
            g_tab_name = $(this).text();
            item_cat_id = $(this).attr("id");
            displayItems(item_cat_id);
            console.log(g_tab_name);
        });
        
        //for(i=0; i < _rows.length; i++){
        //     d =_rows[i];
        //     displayItems(d.item_cat_id);
        //}
    });
} 

function displayItems(id){
    var counter = 0;
    var columnName = (g_column_name ? ",@col_name='"+ g_column_name +"'" : "");
    var keyword    = (g_keyword ? ",@keyword='"+ g_keyword +"'" : "");
    var _dataRows = [
    		{text  : "Part No."                    , type  : "label"       , width : 150       , style : "text-align:left;"     ,sortColNo: 2
    		    ,onRender : function(d){ return  svn(d,"part_no"); }
    		}
    		,{text  : "National Stock No."           , type  : "label"       , width : 150      , style : "text-align:left;"    ,sortColNo: 3
    		    ,onRender : function(d){ return svn(d,"national_stock_no"); }
    		}
    		,{text  : "Nomenclature"                   , type  : "label"       , width : 450       , style : "text-align:left;"    ,sortColNo: 4
    		    ,onRender : function(d){ return svn(d,"item_name"); }
    		}
            ,{text  : "Serviceable"                  , type  : "label"       , width : 100       , style : "text-align:center;" ,sortColNo: 5
                ,onRender : function(d){ 
                    var html = "";
                    if(svn(d,"with_serial") === "N" || svn(d,"stock_qty") === 0){
                        html = "<span>" + svn(d,"stock_qty").toLocaleString("en") + "</span>";
                    }
                    else{
                    html = "<a href='javascript:showModalSerial(\""
                            + statusId.stockQty + "\",\""
                            + svn(d,"part_no") + "\",\"" 
                            + svn(d,"item_inv_id") + "\");'>" 
                            + svn(d,"stock_qty").toLocaleString("en") + " </a>";
                    }
                    return html;
                }
            }

    		,{text  : "For Repair"                  , type  : "label"       , width : 150       , style : "text-align:center;" ,sortColNo: 6
                ,onRender : function(d){ 
                    var html = "";
                    if(svn(d,"with_serial") === "N" || svn(d,"for_repair") === 0){
                        html = "<span>" + svn(d,"for_repair").toLocaleString("en") + "</span>";
                    }
                    else{
                    html = "<a href='javascript:showModalSerial(\""
                            + statusId.forRepair + "\",\""
                            + svn(d,"part_no") + "\",\"" 
                            + svn(d,"item_inv_id") + "\");'>" 
                            + svn(d,"for_repair").toLocaleString("en") + " </a>";
                    }
                    return html;
                }
    		}
    		,{text  : "Total Stock Qty."         , type  : "label"       , width : 150       , style : "text-align:center;" ,sortColNo: 7
    		    ,onRender : function(d){ return svn(d,"ttl_stocks").toLocaleString("en"); }
    		}
            ,{text  : "Reorder Level"            , type  : "label"       , width : 100       , style : "text-align:center;"
    		    ,onRender : function(d){ return svn(d,"reorder_level"); }
    		}
    		,{text  : "Beyond Repair"            , type  : "label"       , width : 150       , style : "text-align:center;" 
                ,onRender : function(d){ 
                    var html = "";
                    if(svn(d,"with_serial") === "N" || svn(d,"beyond_repair") === 0){
                        html = "<span>" + svn(d,"beyond_repair").toLocaleString("en") + "</span>";
                    }
                    else{
                    html = "<a href='javascript:showModalSerial(\""
                            + statusId.beyondRepair + "\",\""
                            + svn(d,"part_no") + "\",\"" 
                            + svn(d,"item_inv_id") + "\");'>" 
                            + svn(d,"beyond_repair").toLocaleString("en") + " </a>";
                    }
                    return html;
                }
    		}
       		,{text  : "UOM"               , type  : "label"       , width : 100       , style : "text-align:center;"
    		    ,onRender : function(d){ return svn(d,"unit_of_measure"); }
    		}    
            ];
    $("#tabGrid" + id).dataBind({
	     url      : procURL + "items_inv_sel @item_cat_id=" + id + ",@warehouse_id=" + g_warehouse_id + ",@option_id='" + option_id +"'" + columnName + keyword
	    ,width    : $(document).width() - 25
	    ,height   : $(document).height() - 310
	    ,isPaging : true
        ,dataRows : _dataRows
    });    
}                   
        
function showModalSerial(status_id ,part_no ,item_inv_id) {
    g_item_inv_id = item_inv_id;
    if(status_id==statusId.stockQty){
        $("#modalSerial .modal-title").text('Serviceable Serial for Part No.' + ' » ' + part_no);
        $("#modalSerial").modal({ show: true, keyboard: false, backdrop: 'static' });
        displaySerial(status_id);
    }
    if(status_id==statusId.forRepair){
        $("#modalSerial .modal-title").text('For Repair Serial for Part No.' + ' » ' + part_no);
        $("#modalSerial").modal({ show: true, keyboard: false, backdrop: 'static' });
        displaySerial(status_id);
    }
    if(status_id==statusId.beyondRepair){
        $("#modalSerial .modal-title").text('Beyond Repair Serial for Part No.' + ' » ' + part_no);
        $("#modalSerial").modal({ show: true, keyboard: false, backdrop: 'static' });
        displaySerial(status_id);
    }
    
}

function displaySerial(status_id){
    var counter = 0;    
    var id = "";
    if(status_id==statusId.stockQty){
        id = 23;
    }
    else if(status_id==statusId.forRepair){
        id = 24;
    }
    else{
        id = 60;
    }

    $("#tblSerial").dataBind({
	     url        : procURL + "items_sel  @item_inv_id='" + (g_item_inv_id ? g_item_inv_id : null) + "',@status_id=" + id
        ,width      : $(document).width() - 45
	    ,height     : 400
	    ,isPaging : true
        ,dataRows   : [
        	    {text  : "&nbsp;"               , width : 25                    , style : "text-align:left;"
        	        ,onRender : function(d){ 
        	            counter++;
                        return '<input class="form-control" type="text" name="item_no" id="item_no" value="' + counter + '" readonly>';
                    }
        	    }        	     
        	   ,{text  :"Serial No."                , name  : "serial_no"               , width:250     , style : "text-align:left;" ,sortColNo: 1}
        	   ,{text  :"Manufacturer"              , name  : "manufacturer_name"       , width:300     , style : "text-align:left;" ,sortColNo: 2}
        	   ,{text  :"Dealer"                    , name  : "dealer_name"             , width:300     , style : "text-align:left;" ,sortColNo: 3}
        	   ,{text  :"Supply Source"             , name  : "supply_source_name"      , width:300     , style : "text-align:left;" ,sortColNo: 4}
        	   ,{text  :"Time Since New"            , name  : "time_since_new"          , width:200     , style : "text-align:right; padding-right:3px"}
        	   ,{text  :"Time Before Overhaul"      , name  : "time_before_overhaul"    , width:200     , style : "text-align:right; padding-right:3px"}
        	   ,{text  :"Time Since Overhaul"       , name  : "time_since_overhaul"     , width:200     , style : "text-align:right; padding-right:3px"}
        	   ,{text  :"Remaining Time"                                                , width:200     , style : "text-align:right; padding-right:3px"
        	       ,onRender: function(d){ return formatCurrency(svn(d,"remaining_time")); }
        	   }
        	   ,{text  :"Monitoring Type"           , name  : "monitoring_type"         , width:200     , style : "text-align:center;"}
	    ] 
    });  
}

function formatCurrency(number){
    var result = "";
    if(number!==""){
        result = parseFloat(number).toFixed(2).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
    }
    return result;
}                      