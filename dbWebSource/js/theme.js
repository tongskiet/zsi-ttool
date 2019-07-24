var bs = zsi.bs.ctrl;
var svn =  zsi.setValIfNull;



zsi.ready(function(){
    displayRecords();
});


$("#btnSave").click(function () {
    //console.log("test");
   $("#grid").jsonSubmit({
             procedure: "themes_upd"
         
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
	     url            : execURL + "themes_sel"
	    ,width          : 500
	    ,height         : $(document).height() - 250
	    ,selectorType   : "checkbox"
        ,blankRowsLimit:5
        ,dataRows : [
                 {text  : cb                                                           , width : 25        , style : "text-align:left;"       
        		    , onRender      :  function(d){ 
                		                    return     bs({name:"theme_id",type:"hidden",value: svn (d,"theme_id")})
                                                      +  (d !==null ? bs({name:"cb",type:"checkbox"}) : "" );
                            }
                 }	 
        		,{text  : "Theme Name"           , name  : "theme_name"          , type  : "input"           , width : 400       , style : "text-align:left;"}
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
    
                                           