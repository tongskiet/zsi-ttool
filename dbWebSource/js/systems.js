var bs = zsi.bs.ctrl;
var svn =  zsi.setValIfNull;

zsi.ready(function(){
    displayRecords();
  
});

$("#btnSave").click(function () {
    $("#grid").jsonSubmit({
              procedure  : "systems_upd"
             ,onComplete : function (data) {
                $("#grid").clearGrid(); 
                  displayRecords();
             }
        });    
});
function displayRecords(){   
      var cb = bs({name:"cbFilter1",type:"checkbox"});
     $("#grid").dataBind({
	     url            : execURL + "systems_sel"
	    ,width          : 780
	    ,height         : 506
	    //,selectorType   : "checkbox"
        ,blankRowsLimit:5
       // ,isPaging : false
        ,dataRows : [
    		   {text  : cb                                 , width : 25        , style : "text-align:left;"       
            		    , onRender      :  function(d){ 
                		              return bs({name:"system_id"   ,value: svn (d,"system_id")    ,type:"hidden"})
                		                 +  (d !==null ? bs({name:"cb",type:"checkbox"}) : "" );
                    }
                }	 
            	,{ text:"System Name"                           , width:365       , style:"text-align:center;"        , type:"input"          ,name:"system_name"}
            	,{ text:"Description"                           , width:365       , style:"text-align:center;"        , type:"input"          ,name:"system_desc"}
	    ]
	      ,onComplete: function(){
                    $("#cbFilter1").setCheckEvent("#grid input[name='cb']");
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