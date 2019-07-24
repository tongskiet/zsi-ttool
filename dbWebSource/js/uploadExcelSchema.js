 var bs = zsi.bs.ctrl;
var svn =  zsi.setValIfNull;
zsi.ready(function(){
    displayRecords();
  
});

$("#btnSave").click(function () {
   $("#grid").jsonSubmit({
             procedure: "excel_upload_upd"
            ,onComplete: function (data) {
                $("#grid").clearGrid();
                if(data.isSuccess===true) zsi.form.showAlert("alert");
                displayRecords();
            }
    });
});



 function displayRecords(){   
      var cb = bs({name:"cbFilter1",type:"checkbox"});
     $("#grid").dataBind({
	     url            : execURL + "excel_upload_sel"
	    ,width          : $(document).width()-35
	    ,height         : 450
        ,selectorType   : "checkbox"
        ,blankRowsLimit:5
       // ,isPaging : false
        ,dataRows : [
    	
    		   {text  : cb                      , width : 25        , style : "text-align:left;"       
            		    , onRender      :  function(d){ 
                		              return bs({name:"id"   ,value: svn (d,"id")    ,type:"hidden"})
                		                     +  (d !==null ? bs({name:"cb",type:"checkbox"}) : "" );
                    }
                }	
                ,{ text:"Seq #"                 , width:150          , style:"text-align:center;"        , type:"input"          ,name:"seq_no"}
            	,{ text:"Temporary Table"       , width:300          , style:"text-align:center;"        , type:"input"          ,name:"temp_table"}
            	,{ text:"Excel Column Range"    , width:180          , style:"text-align:center;"        , type:"input"          ,name:"excel_column_range"}
            	,{ text:"Load Name"             , width:230          , style:"text-align:center;"        , type:"input"          ,name:"load_name"}
            	,{ text:"Redirect Page"         , width:170          , style:"text-align:center;"        , type:"input"          ,name:"redirect_page"}
            	,{ text:"Insert Procedure"      , width:250          , style:"text-align:center;"        , type:"input"          ,name:"insert_proc"}
	    ]
	     
    });    
}
$("#btnDelete").click(function(){
    zsi.form.deleteData({
         code       : "ref-0012"
        ,onComplete : function(data){
                        displayRecords();
                      }
    });      
});           