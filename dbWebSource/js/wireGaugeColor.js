var bs = zsi.bs.ctrl;
var svn =  zsi.setValIfNull;



zsi.ready(function(){
    displayRecords();
});


$("#btnSave").click(function () {
  //  console.log("test");
   $("#grid").jsonSubmit({
             procedure: "wire_gauge_color_upd"
            , onComplete: function (data) {
                $("#grid").clearGrid();
                if(data.isSuccess===true) zsi.form.showAlert("alert");
                displayRecords();
            }
    });
});
    
function displayRecords(){
     $("#grid").dataBind({
	     url            : execURL + "wire_gauge_color_sel"
	    ,width          : 300
	    ,height         : $(document).height() - 150
	   // ,selectorType   : "checkbox"
        ,blankRowsLimit : 5
        ,dataRows       : [
                            { text  : "Wire Gauge"      , name  : "wire_gauge"          ,   type    : "input"       ,  width : 100      , style :   "text-align:left;" }	 
            		        ,{text  : "Color"                                           ,   type    : "select"      ,  width : 150      , style :   "text-align:left;" 
            		              ,onRender   :   function(d){ 
    		                                        return  bs({name:"color_id"  , type:"select" , value: svn(d,"color_id")})
    		                                              + bs({name:"is_edited" , type:"hidden" , value: svn(d,"is_edited")}) ;
    		                                } 
            		        }
	                    ]
    	    ,onComplete: function(){
    	   $("input, select").on("change keyup ", function(){
                    $(this).closest(".zRow").find("#is_edited").val("Y");
                });       
              $("select[name='color_id']").dataBind({
                    url: execURL + "color_references_sel"
                        ,text   : "color_name"
                        ,value  : "color_id"
                });    
        }  
    });    
}
    
/*
$("#btnDelete").click(function(){
    zsi.form.deleteData({
         code       : "ref-0001"
        ,onComplete : function(data){
                        displayRecords();
                      }
    });       
});
  */  
                                          