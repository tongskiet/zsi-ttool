 var bs = zsi.bs.ctrl;
var svn =  zsi.setValIfNull;

zsi.ready(function(){
    displayRecords();
});


 $("#btnSave").click(function () {
         $("#frm").jsonSubmit({
              procedure: "tables_upd"
               ,optionalItems: ["table_name","table_key_name"]
            , onComplete: function (data) {
                displayRecords();
            }
        });
        
      
});


function displayRecords(){
    var cb = bs({name:"cbFilter1",type:"checkbox"});
          $("#grid").dataBind({
	     url            : execURL + "tables_sel"
	    ,width          : $(document).width() - 500
	    ,height         : $(document).height() - 250
	    ,selectorType   : "checkbox"
        ,blankRowsLimit:5
        ,isPaging : false
        ,dataRows : [
                 {text  : " "                                                         , type  : "hidden"            , width    : 25        , style : "text-align:left;"       
        		    , onRender      :  function(d){ 
                		                   return     bs({name:"table_id",type:"hidden",value: svn (d,"table_id")})
                                                    +  bs({name:"cb",type:"checkbox"});
                            }
            }	 
        		,{text  : "Code"                    , name  : "table_code"            , type  : "input"             , width : 200       , style : "text-align:left;"}
        		,{text  : "Table Name"              , name  : "table_name"            , type  : "select"            , width : 300       , style : "text-align:left;"}
        		,{text  : "Primary Key"             , name  : "table_key_name"        , type  : "select"            , width : 300       , style : "text-align:left;"}
        	
	    ]
	     ,onComplete: function(){
             var objTable =$("select[name='table_name']");
           objTable.change(function(){
               
                var tr= this.parentNode.parentNode ;
                    if(this.value!=="")
                        $(tr).find("#table_key_name").dataBind({ url :execURL + "table_column_options_sel '" + this.value + "'"});  
               
           });
           
             objTable.dataBind({ 
                 url : execURL + "table_options_sel"
                 ,onComplete : function(){
                    $ddl = $("select[name='table_name']");
                    $.each($ddl,function(){
                        var tr= this.parentNode.parentNode ;
                        if(this.value!=="")
                        $(tr).find("#table_key_name").dataBind({ url : execURL + "table_column_options_sel '" + this.value + "'"});
                    });
                       
                        
                 }
             });

       }
    });    
    
   
}
   
  
$("#btnDelete").click(function(){
    zsi.form.deleteData({
         code       : "sys-0011"
        ,onComplete : function(data){
                        displayRecords();
                      }
    });   

});     
                                            