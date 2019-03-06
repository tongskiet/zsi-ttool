 var bs = zsi.bs.ctrl;
var svn =  zsi.setValIfNull;



zsi.ready(function(){
    displayRecords();
});


$("#btnSave").click(function () {
    console.log("test");
   $("#grid").jsonSubmit({
             procedure: "select_options_upd"
            , onComplete: function (data) {
                $("#grid").clearGrid();
                if(data.isSuccess===true) zsi.form.showAlert("alert");
                displayRecords();
            }
    });
});
    
function displayRecords(){
     var cb = bs({name:"cbFilter1",type:"checkbox"});
     $("#grid").dataBind({
	     url            : execURL + "select_options_sel"
	    ,width          : $(document).width() - 35
	    ,height         : $(document).height() - 250
	    ,selectorType   : "checkbox"
        ,blankRowsLimit:5
        ,isPaging : false
        ,dataRows : [
                 {text  : cb                                                           , width : 25        , style : "text-align:left;"       
        		    , onRender      :  function(d){ 
                		                    return     bs({name:"select_id",type:"hidden",value: svn (d,"select_id")})
                                                      +  (d !==null ? bs({name:"cb",type:"checkbox"}) : "" );
                            }
            }	 
        		,{text  : "Code"                , name  : "code"                    , type  : "input"         , width : 150       , style : "text-align:left;"}
        		,{text  : "Table Name"          , name  : "table_name"              , type  : "input"         , width : 200       , style : "text-align:left;"}
        		,{text  : "Text"                , name  : "text"                    , type  : "input"         , width : 200       , style : "text-align:left;"}
        		,{text  : "Value"               , name  : "value"                   , type  : "input"         , width : 267       , style : "text-align:left;"}
        		,{text  : "Condition"           , name  : "condition_text"          , type  : "input"         , width : 180       , style : "text-align:left;"}
        		,{text  : "Order By"            , name  : "order_by"                , type  : "input"         , width : 200       , style : "text-align:left;"}
	    ]
    	     ,onComplete: function(){
                $("#cbFilter1").setCheckEvent("#grid input[name='cb']");
        }  
    });    
}
    

$("#btnDelete").click(function(){
    zsi.form.deleteData({
         code       : "sys-0008"
        ,onComplete : function(data){
                        displayRecords();
                      }
    });       
});
    
                              