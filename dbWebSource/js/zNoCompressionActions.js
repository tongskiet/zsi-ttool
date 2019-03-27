var bs = zsi.bs.ctrl;
var svn =  zsi.setValIfNull;
zsi.ready(function(){
    $(".zPanel").css({
            height:$(window).height()-100
        });  
        
    displayRecords();
    
    $("#grid").colResizable({liveDrag:true,fixed:false,});
        
   

});

$("#btnSave").click(function () {
    $("#frm").jsonSubmit({
            procedure: "zNoCompressionActions_upd"
            , onComplete: function (data) {
                $("#grid").clearGrid();
                displayRecords();
            }
    });
     
});

function displayRecords(){   
    var cb = bs({name:"cbFilter1",type:"checkbox"});
        $("#grid").dataBind({
         url   : procURL + "zNoCompressionActions_sel"
        ,width          : 300
	    ,height         : 300
	    ,blankRowsLimit:5
        ,dataRows       : [
    		  { text: cb             , width:25  , style:"text-align:left;"   
    		     ,onRender : function(d){
                                return     bs({name:"id",type:"hidden",value: svn(d,"id") })
                                        +  (d !==null ? bs({name:"cb",type:"checkbox"}) : "" );
                            }             
    		 }	 
    		,{ text:"Action Name"      , width:227  , style:"text-align:center;" ,type:"input"  ,name:"actionname"}	 
	    ]      
	    ,onComplete: function(){
             $("#cbFilter1").setCheckEvent("#grid input[name='cb']");
        }
    });    
} 


$("#btnDelete").click(function(){
    zsi.form.deleteData({
         code       : "ref-0002"
        ,onComplete : function(data){
            displayRecords();
        }
    });   
 });     