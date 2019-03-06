 var bs = zsi.bs.ctrl
    ,errorMsgList =[]
    ,svn =  zsi.setValIfNull
;
            
zsi.ready(function(){
    $("#user_id").dataBind( "users");
    displayRecords("");
    // $(".page").css("height",$(window).height()-300);
});


function getTemplate(){
    $.get(base_url + "templates/bsDialogBox.txt",function(d){
        var template = Handlebars.compile(d);     
        
        $("body").append(template(contextImageWindow));

    });    
    
}  

function displayRecords(params){   
    var cb = bs({name:"cbFilter1",type:"checkbox"});
    var rownum=0;
    errorMsgList=[];
    $("#grid").dataBind({
        url    : execURL + "error_logs_sel " + params
        ,width          : $(document).width() - 45
	    ,height         : $(document).height() - 290
	    //,selectorType   : "checkbox"
        //,blankRowsLimit:5
        //,isPaging : false
        ,dataRows : [ 
            {text  : cb                                , type  : "hidden"        , width    : 25        , style : "text-align:left;"       
        		    ,onRender   :   function(d){
                                            return     bs({name:"error_id",type:"hidden",value: d.error_id})
                                                    +  bs({name:"cb",type:"checkbox"});
                                            }
            }
            ,{text  : "Id"                            , type  : "hidden"        , width    : 40        , style : "text-align:center;"       
        		    ,onRender   :   function(d){ 
                                                errorMsgList.push(unescape(d.error_msg));
                                                var mouseEvent = "onmouseover='showErrorMsgBox(" + rownum + ");' ";
                                                var a= "<a href='javascript:void(0);' " + mouseEvent + "  class='btn btn-sm' >" + d.error_id + "</a>"; 
                                                rownum++;
                                                return a;                   
                                            }
            }
            ,{text  : "URL/Parameter(s)"            , type  : "hidden"        , width    : 510        , style : "text-align:left;"       
                    ,onRender   :   function(d){ return  unescape(d.page_url); }
            }
            ,{text  : "Number"                      , type  : "hidden"        , width    : 100        , style : "text-align:left;"       
                    ,onRender   :   function(d){ return d.error_no; }
            }
            ,{text  : "Type"                        , type  : "hidden"        , width    : 50        , style : "text-align:left;"       
                    ,onRender   :   function(d){ return  d.error_type; }
            }
            ,{text  : "Occurence"                   , type  : "hidden"        , width    : 100        , style : "text-align:left;"       
                    ,onRender   :   function(d){ return  d.occurence; }
            }
            ,{text  : "Created By"                  , type  : "hidden"        , width    : 100        , style : "text-align:left;"       
                    ,onRender   :   function(d){ return  d.created_by_name; }
            }
            ,{text  : "Created Date"                , type  : "hidden"        , width    : 120        , style : "text-align:left;"       
                    ,onRender   :   function(d){ return  d.created_date.toShortDateTime(); }
            }
            ,{text  : "Updated By"                  , type  : "hidden"        , width    : 100        , style : "text-align:left;"       
                    ,onRender   :   function(d){ return  d.updated_by_name; }
            }
            ,{text  : "Updated Date"                , type  : "hidden"        , width    : 120        , style : "text-align:left;"       
                    ,onRender   :   function(d){ return  d.updated_date.toShortDateTime(); }
            }

        ]
          ,onComplete: function(){
            $("#cbFilter1").setCheckEvent("#grid input[name='cb']");
        }

    });    
}
function showErrorMsgBox(index){
    var panel = $(".errorPanel");
    $(".errorBody").html( errorMsgList[index] );
    $(".errorBody").find("style").remove();
    panel.show();
}

 

$("#btnClose").click(function(){
   $(".errorPanel").hide(); 
});

$(".errorPanel").dblclick(function(){
   $(".errorPanel").hide(); 
});


$("#btnDelete").click(function(){
    zsi.form.deleteData({
         code: "sys-0007"
        ,onComplete: function(data){
            //displayRecords("");
            $("#grid").trigger("refresh");
        }
    });
});

$("#btnGo").click(function(){
    if($("#user_id").val()==="") return;
    displayRecords("@user_id="  + $("#user_id").val() );
});


$("#btnRefresh").click(function(){
    displayRecords("@user_id=" + userId);
});

$("#btnAllRefresh").click(function(){
    displayRecords("@all=1");
});
             