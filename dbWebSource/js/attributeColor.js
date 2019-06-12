var bs = zsi.bs.ctrl;

zsi.ready(function(){
  //  $("select[name='table_columns']").dataBind( "table_columns");
   $("select[name='table_columns']").dataBind({
                  url: base_url + "selectoption/code/table_columns"
                , isUniqueOptions:true
                , onComplete: function(){
                    $("select[name='table_columns']").setUniqueOptions();
                }
            });
      $("#btnGo").click(function(){
        displayRecords();
    });
});



function setNullIfEmpty(id){
      return ($("#" + id).val()===""?"null":$("#" + id).val());
}
function displayRecords(){
     $("#grid").dataBind({
	   //  url            : execURL + "attribute_color_sel"
	   //                           + "@column_name='" + setNullIfEmpty("table_columns") + "'"
         sqlCode        : "A107"
        ,parameters    : {column_name :  setNullIfEmpty("table_columns") }	                              
	    ,width          : 370
	    ,height         : $(document).height() - 250
        ,dataRows       : [
                            {text  : "Value"         , name  : "attribute_name"             , type  : "input"         , width : 200       , style : "text-align:left;"}
            		        ,{text  : "Color"        , width : 100       , style : "text-align:left;"
        		               ,onRender : function(d){ 
                                    return  bs({name:"color_code",type:"select",value:d.color_code})  
                                            + bs({name:"is_edited",type:"hidden",value:d.id_edited}) ;
                                           
                                }         
            		        }
	                    ]
    	    ,onComplete: function(){
                $("input[name='cb'], input").on("keyup change", function(){
                    var $zRow = $(this).closest(".zRow");
                    $zRow.find("#is_edited").val("Y");
                });  
                
           
              $("select[name='color_code']").dataBind({
                    url :execURL + " color_references_sel"
                    ,text:"color_name"
                    ,value:"color_id"
              });
        }  
    });    
}  
$("#btnSave").click(function () {
  //  console.log("test");
   $("#grid").jsonSubmit({
             procedure: "attribute_color_upd"
            , onComplete: function (data) {
                $("#grid").clearGrid();
                if(data.isSuccess===true) zsi.form.showAlert("alert");
                displayRecords();
            }
    });
});  