var bs = zsi.bs.ctrl
    ,svn =  zsi.setValIfNull
    ,tableLayoutId=0
    ,selectorType = [ {text:"checkbox",value:"checkbox"},{text:"radio",value:"radio"}]    
    ,inputType = [ 
             {text:"input",value:"input"}
            ,{text:"hidden",value:"hidden"}
            ,{text:"yesno",value:"yesno"}
            ,{text:"select",value:"select"}
            ,{text:"textarea",value:"textarea"}
    ]
    ,dataTypes = [
             {text:"int"	        ,value:"int"            }				    	 
            ,{text:"varchar"     	,value:"varchar"        }			 
            ,{text:"char"           ,value:"char"	        }			 
            ,{text:"nchar"			,value:"nchar"	        }
            ,{text:"nvarchar"		,value:"nvarchar"       } 
            ,{text:"bigint"			,value:"bigint"	        }
            ,{text:"binary"			,value:"binary"	        }
            ,{text:"datetime"		,value:"datetime"       } 
            ,{text:"datetimeoffset"	,value:"datetimeoffset" }
            ,{text:"decimal"		,value:"decimal"		} 
    ]
    
      
;



 
$(document).ready(function(){
    displayRecords();
    displayColumns();
});

function displayRecords(){   
    var cb = bs({name:"cbFilter1",type:"checkbox"});    
    $("#grid1").dataBind(
        {
             url   : procURL + "table_layout_sel"
            ,width          :  $(document).width()-50
            ,height         : 300
            ,selectorType   : "checkbox"
            ,blankRowsLimit : 5
            ,dataRows       : [
        
        
    		 { text: cb                 , name  : "tableLayoutId"    , width :30   , type :"hidden"    , style :"text-align:left;"       , isFreeze:true  }
            ,{ text: "code"             , name  : "code"             , width :100  , type : "input"    , style : "text-align:left;"                       }
            ,{ text: "Parameter"        , name  : "url"              , width :80   , type : "input"    , style : "text-align:left;"                       }
            ,{ text: "Width"            , name  : "width"            , width :60   , type : "input"    , style : "text-align:left;"                       }
            ,{ text: "Height"           , name  : "height"           , width :60   , type : "input"    , style : "text-align:left;"                       }
            ,{ text: "Selector Index"   , name  : "selectorIndex"    , width :120  , type : "input"    , style : "text-align:left;"                       }
            ,{ text: "Selector Type"    , name  : "selectorType"     , width :120  , type : "select"   , style : "text-align:left;"                       }
            ,{ text: "Blank Rows"       , name  : "blankRowsLimit"   , width :80   , type : "input"    , style : "text-align:left;"                       }
            ,{ text: "Paging?"          , name  : "isPaging"         , width :60   , type : "yesno"    , style : "text-align:left;"                       }
            ,{ text: "startGroupId"     , name  : "startGroupId"     , width :100  , type : "input"    , style : "text-align:left;"                       }
            ,{ text: "Table Name"       , name  : "tableName"        , width :100  , type : "input"    , style : "text-align:left;"                       }
            ,{ text: "onComplete"       , name  : "onComplete"       , width :300  , type : "input"    , style : "text-align:left;"                       }
                ,{ 
                     text: "Create Table"     
                    ,width :100    
                    ,type : "input"    
                    ,style : "text-align:left;"                       
                    , onRender : function(d){
                        return (d !== null ?  "<a href=\"javascript:void(0);\" onclick=\"createTable("  +  d.tableLayoutId + ")\" class=\"btn btn-primary btn-xs\" >CreateTable</a>" : "");
                    }
                }
            ]
            ,onComplete : function(){
                
                var $zRow = $("#grid1").find(".zRows .zRow");
                
                $zRow.click(function(){
                    
                    var _i =$(this).index();
                    var _$Row =  $(this).closest(".zGrid").find(".left .zRows .zRow:eq(" + _i + ")");
                    tableLayoutId = _$Row.find("#tableLayoutId").val();
                     if(tableLayoutId) 
                        displayColumns();
                    else
                        $("#grid2").find(".zGridPanel .zRows #table").html("");
                        
                });
                $("#grid1").find("select[name='selectorType']").fillSelect({data: selectorType});
            }
    });      
}

function createTable(id){
    
    $.get(
         execURL + "createTable @id=" + id
        , function(data){
             if(data.isSuccess===true) zsi.form.showAlert("alert");
        }
    );    
    
}

function displayColumns(){   
      var cb = bs({name:"cbFilter2",type:"checkbox"});    
    $("#grid2").dataBind({
         url   : procURL + "table_layout_cols_sel @tableLayoutId=" + tableLayoutId
        ,width           : $(document).width()-50
        ,height         : $(document).height()-636
        ,selectorType   : "checkbox"
        ,blankRowsLimit : (tableLayoutId < 1 ? 0 : tableLayoutId )
        ,dataRows       : [
    		 { text: cb                 
    		    , width :30     
    		    , type :"hidden"    
    		    , style :"text-align:left;"       
    		    , isFreeze:true
    		    ,onRender :  function(d){  
    		                    return bs({name:"tableLayoutColId",type:"hidden", value:svn(d,"tableLayoutColId") })
                                  +   bs({name:"tableLayoutId",type:"hidden",value:tableLayoutId})
                                  +   (d !== null ? bs({name:"cb",type:"checkbox"}) : "");
    		                }    		 
    		 }
            ,{ text: "Seq #"            , name  : "seqNo"           , width :40     , type : "input"    , style : "text-align:center;"  }
            ,{ text: "Id"               , name  : "id"              , width :50     , type : "input"    , style : "text-align:center;"  }
            ,{ text: "GroupId"          , name  : "groupId"         , width :60     , type : "input"    , style : "text-align:center;"  }
            ,{ text: "Text"             , name  : "text"            , width :100    , type : "input"    , style : "text-align:left;"    }
            ,{ text: "Name"             , name  : "name"            , width :100    , type : "input"    , style : "text-align:left;"    }
            ,{ text: "Width"            , name  : "width"           , width :50     , type : "input"    , style : "text-align:left;"    }
            ,{ text: "Style"            , name  : "style"           , width :150    , type : "input"    , style : "text-align:left;"    }
            ,{ text: "Type"             , name  : "type"            , width :80     , type : "select"   , style : "text-align:left;"    }
            ,{ text: "Freeze?"          , name  : "isFreeze"        , width :60     , type : "yesno"    , style : "text-align:left;"    }
            ,{ text: "SortColNo"        , name  : "sortColNo"       , width :100    , type : "input"    , style : "text-align:left;"    }
            ,{ text: "Identity?"        , name  : "isIdentity"      , width :100    , type : "yesno"    , style : "text-align:left;"    }
            ,{ text: "Data Type"        , name  : "colDataType"     , width :100    , type : "select"   , style : "text-align:left;"    }
            ,{ text: "Size"             , name  : "colSize"         , width :50     , type : "input"    , style : "text-align:left;"    }
            ,{ text: "Nullable?"        , name  : "isNullable"      , width :100    , type : "yesno"    , style : "text-align:left;"    , defaultValue:"Y" }
            ,{ text: "On Render"        , name  : "onRender"        , width :300    , type : "input"    , style : "text-align:left;"    }

        ]
        ,onComplete : function(){
            $("#grid2").find("select[name='type']").fillSelect({data: inputType});
             $("#grid2").find("select[name='colDataType']").fillSelect({data: dataTypes});
        }
        
        
        });    
}



$("#btnSave1").click(function () {
    //if( zsi.form.checkMandatory()!==true) return false;
    
    $("#grid1").jsonSubmit({
             procedure  : "table_layout_upd"
             ,optionalItems: ["isPaging"]
            ,onComplete : function (data) {
                 if(data.isSuccess===true) zsi.form.showAlert("alert");
                 displayRecords();
            }
    });
     
});                                 
$("#btnSave2").click(function () {
    //if( zsi.form.checkMandatory()!==true) return false;
    
    $("#grid2").jsonSubmit({
             procedure  : "table_layout_cols_upd"
             ,optionalItems: ["tableLayoutId","isFreeze","isNullable","isIdentity"]
            ,onComplete : function (data) {
                 if(data.isSuccess===true) zsi.form.showAlert("alert");
                 displayColumns();
            }
    });
     
});                                 
         