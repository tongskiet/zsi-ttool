var bs = zsi.bs.ctrl;
var svn =  zsi.setValIfNull
    ,Pickr;




zsi.ready(function(){
    displayRecords();
  
});


$("#btnSave").click(function () {
  //  console.log("test");
   $("#grid").jsonSubmit({
             procedure: "color_references_upd"
            , onComplete: function (data) {
                $("#grid").clearGrid();
                if(data.isSuccess===true) zsi.form.showAlert("alert");
                displayRecords();
            }
    });
});
    
function displayRecords(){
    //type : "input" is optional in line 37, 38
     var cb = bs({name:"cbFilter1",type:"checkbox"});
     $("#grid").dataBind({
	     url            : execURL + "color_references_sel"
	    ,width          : 370
	    ,height         : $(document).height() - 300
	   // ,selectorType   : "checkbox"
        ,blankRowsLimit : 5
        ,isPaging       : false
        ,dataRows       : [
                            { text  : cb , width : 25  , style : "text-align:left;" , onRender  :  function(d)
                                                                                                    { return     bs({name:"color_id",type:"hidden",value: svn (d,"color_id")}) + (d !==null ? bs({name:"cb",type:"checkbox"}) : "" ); }
                            }	 
            		        ,{text  : "Color Code"         , name  : "color_code"             , type  : "input"         , width : 200       , style : "text-align:left;"}
            		        ,{text  : "Color"          , name  : "color_name"             , type  : "input"         , width : 100       , style : "text-align:left;"}
	                    ]
    	    ,onComplete: function(){
                $("#cbFilter1").setCheckEvent("#grid input[name='cb']");
        }  
    });    
}

    

$("#btnDelete").click(function(){
    zsi.form.deleteData({
         code       : "ref-0001"
        ,onComplete : function(data){
                        displayRecords();
                      }
    });       
});
    
                                           