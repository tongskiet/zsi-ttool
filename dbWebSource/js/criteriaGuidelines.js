var  svn           = zsi.setValIfNull
    ,bs            = zsi.bs.ctrl
    ,bsButton      = zsi.bs.button
    ,proc_url      = base_url + "common/executeproc/"
    ,gMdlId        = "modalCriteriaColums"
    ,gtw           = null
    ,g$mdl         = null
    ,criteriaId    = ""
;

zsi.ready(function(){
  gtw = new zsi.easyJsTemplateWriter();
    getTemplates(function(){
        displayRecords();
    });
});

function getTemplates(callback){
    new zsi.easyJsTemplateWriter("body")
    .bsModalBox({
          id        : gMdlId
        , sizeAttr  : "modal-full"
        , title     : "Criteria Columns"
        //, footer    : gtw.modalFooter({onClickSave:"submitData();"}).html()
        , body      : gtw.new().modalBody({gridId1:"gridCriteriaColumns",gridId2:"gridCriteriaColumnValues",onClickSave1:"submitData1();",onClickSave2:"submitData2();"}).html()  
    });
    
    if(callback) callback();
    
}

function displayRecords(){ 
    $("#grid").dataBind({
        url            : execURL + "trend_menus_sel "
            ,width          : 300
    	    ,height         : $(document).height() - 250
    	    ,selectorType   : "checkbox"
            ,blankRowsLimit:5
            ,isPaging : false
            ,dataRows       :[
        		{ text:"Menu Name"         , width:375     , style:"text-align:left;"
        		    ,onRender : function(d){ return svn(d,"menu_name")
        		                    + bs({name:"menu_id" ,type:"hidden" ,value:svn(d,"menu_id") })
        		                    + bs({name:"specs_id" ,type:"hidden" ,value:svn(d,"specs_id") });
        		    }
        		}	 
        		
            ]
            ,onComplete : function(){
                this.find(".zRow").click(function(){
                    var _menuId = $(this).find("#menu_id").val();
                    var _specs_id = $(this).find("#specs_id").val();
          
                    if(_menuId && _specs_id){
                       $(".criteria").show();
                       displayCriteria(_menuId,_specs_id);
                    }
                    else{
                       $("#gridCriteria").find(".zRows").html("");
                    }
                });
            }
    });    
}

function displayCriteria(menuId,specsId){
        $("#gridCriteria").dataBind({
             url: execURL + "criterias_sel @trend_menu_id=" + menuId 
            ,width          : 800
    	    ,height         : $(document).height() - 250
            ,blankRowsLimit : 10
            ,dataRows       :[
        		 { text: "Seq. No."   , width:65 , style:"text-align:left;" 
        		     ,onRender : function(d){return bs({name:"criteria_id"          ,type:"hidden"  ,value: svn(d,"criteria_id")})
        		                                +   bs({name:"trend_menu_id"        ,type:"hidden"  ,value: menuId})
        		                                +   bs({name:"is_edited",type:"hidden" })
        		                                +   bs({name:"seq_no" ,value: svn(d,"seq_no")}) ;
        		         	     }
        		 }
        		,{ text:"Criteria Title"   , width:450 , style:"text-align:left;" ,  type:"input"  ,  name:"criteria_title"	
        		   ,onRender: function(d){
        		        if(d){
        		            return '<input class="form-control" type="text" name="criteria_title" id="criteria_title" value="'+ d.criteria_title +'" style="text-align: left;'+ (!d.pcriteria_id ? 'font-weight:bold;' : '') +'">';   
        		        } else return '<input class="form-control" type="text" name="criteria_title" id="criteria_title" style="text-align: left;">';   
        		    }
        		}	 	 
        		
        		,{ text:"Group Criteria"    , width:150    , style:"text-align:center;"    
    		            ,onRender   :   function(d){ 
    		                    return bs({name:"pcriteria_id", type:"select", value: svn(d,"pcriteria_id")});
    		          }
    		    }
    
        		,{ text:"Active?"    , width:65  , style:"text-align:left;" ,  type:"yesno"  ,  name:"is_active"  ,  defaultValue   : "Y"}
        		,{ text:"" ,width:35 , style:"text-align:left;"
        		        ,onRender   :   function(d){
        		            var _link = "<a href='javascript:void(0);' class='btn btn-sm'  onclick='showModalCriteriaColumns(\""+ svn(d,"criteria_id") +"\",\""+ specsId +"\",\"" +  svn(d,"criteria_title")  + "\");'  ><i class='fas fa-link'></i> </a>";
        		            return (d !==null ? _link : "" );
        		        }
        		}
    	    ]
      	    ,onComplete : function(){
                $("input, select").on("change keyup ", function(){
                    $(this).closest(".zRow").find("#is_edited").val("Y");
                });  
                this.data("menuId",menuId);
                this.data("specsId",specsId);
            
                $.each( $("[name='criteria_id'") ,function(){
                    var _$select = $(this).closest(".zRow").find("select[name='pcriteria_id']");
                    _$select.dataBind({
                        url: execURL + "criteria_group_sel" + (this.value ? " @criteria_id=" + this.value : "")  
                            , text: "criteria_title"
                            , value: "criteria_id"
                    });


                });
    
    	    }
    
        });
     
}

function showModalCriteriaColumns(criteriaId,specsId,name) {
    $(".colval").hide();
    g$mdl = $("#" + gMdlId); 
    g$mdl.find(".modal-title").text("Criteria Columns  » " + name ) ;
    g$mdl.modal({ show: true, keyboard: false, backdrop: 'static' });
    displayCriteriaColumns(criteriaId,specsId);

}                   

function displayCriteriaColumns(criteriaId,specsId){
    $("#gridCriteriaColumns").dataBind({
         url    : execURL + "criteria_columns_sel @criteria_id=" + criteriaId 
        ,width          : 900
	    ,height         : 400
        ,blankRowsLimit :5
        ,dataRows       :[
    		 { text: "Column Name"   , width:300 , style:"text-align:left;" 
    		     ,onRender : function(d){return bs({name:"criteria_column_id"  ,type:"hidden",value: svn(d,"criteria_column_id")})
    		                                +   bs({name:"criteria_id"  ,type:"hidden",value: criteriaId })
    		                                +   bs({name:"is_edited",type:"hidden" })
    		                                +   bs({name:"column_name"  ,type:"select",value: svn(d,"column_name") });
    		                               
    		        }
    		 }
    		 ,{ text: "Operator Name" ,  width:150, style:"text-align:left;" 
    		     ,onRender: function(d){
    		         return bs({name:"operator_value",  type:"select", value: svn(d,"operator_value")});
    		     }
    		 }
    		 ,{ text: ""              ,width:25      , style:"text-align:left;"
    		        ,onRender   :   function(d){
                       return "<span class='lst-icon'> &nbsp;<span>";
        	        }
    		  }
    		 ,{ text: "Column Value1"     , width:150           , style:"text-align:left;" 
    		     ,onRender : function(d){
    		         if(svn(d,"operator_value") === ""){
    		           return bs({name:"column_value"      , type:"select" , value: svn(d,"column_value") ,class:"hide"});   
    		         } 
    		         else{
    		           return bs({name:"column_value"      , type:"select" , value: svn(d,"column_value")}); 
    		         } 
    		     }
    		 }
    		 ,{ text: "Column Value2"     , width:150          , style:"text-align:left;"  
    		     ,onRender : function(d){
    		         return bs({name:"column_value2"    , type:"select" , value: svn(d,"column_value2")}); 
    		     }
    		     
    		 }
    		 ,{ text: "Is Output?"      , name:"is_output"     , type:"yesno"   , defaultValue:"Y"  , width:100 , style:"text-align:center;" }
	    ]
	    ,onComplete : function(){
            var _this = this
                ,_setDdlvalues = function($zRow,harnessName){
                        if(harnessName === "") return;
                        $zRow.find("select[name='column_value']").dataBind({
                            url: execURL + "reference_table_column_values_sel @column_name=" + harnessName  
                                , text: "attribute_name"
                                , value: "attribute_id"
                                 , onEachComplete : function(data){
                                    //trigger display on each complete
                                    var _$self = $(this);
                                    var _optVal = _$self.closest(".zRow").find("select[name='operator_value']").attr("selectedvalue");
                                    //if(["IN","ISNULL",""].includes(_optVal) ) _$self.css({"display":"none"}); else _$self.css({"display":"unset"});
                                    switch(_optVal){
                                        case "IN" :
                                            _$self.css({"display":"none"});
                                            break;
                                        case "ISNULL" :
                                            _$self.css({"display":"none"});
                                            break;
                                        case " " :
                                            _$self.css({"display":"none"});
                                            break;
                                        default:
                                            break;
                                    }    
                                }                                
                                , onChange: function(){
                                    var __$zRow = this.closest(".zRow");
                                    var _val = this.find("option:selected").text();
                                }
                        });  
                        
                        $zRow.find("select[name='column_value2']").dataBind({
                            url: execURL + "reference_table_column_values_sel @column_name=" + harnessName  
                                , text: "attribute_name"
                                , value: "attribute_id"
                                , onEachComplete : function(data){
                                    //trigger display on each complete
                                    var _$self = $(this);
                                    var _optVal = _$self.closest(".zRow").find("select[name='operator_value']").attr("selectedvalue");
                                    if(_optVal!=="BETWEEN") _$self.css({"display":"none"}); else _$self.css({"display":"unset"});

                                    
                                }
                                , onChange: function(){
                                    var __$zRow = this.closest(".zRow");
                                    var _val = this.find("option:selected").text();
                                }
                        });  
	            }
                ,_displayListIcon   = function($zRow,value){
                    var _link = (value =="IN" ?  gtw.new().inList({p1: $zRow.find("#column_name").val() , p2: $zRow.find("#criteria_column_id").val() }).html() :"");
                    $zRow.find(".lst-icon").html(_link);
                }
	        ;
	        
	        _this.data("criteriaId", criteriaId);
             _this.data("specsId",specsId);
            _this.find("input, select").on("change keyup ", function(){
                $(this).closest(".zRow").find("#is_edited").val("Y");
            }); 

	        var _zRow = this.find(".zRow");

            
            _this.find("select[name='column_name']").dataBind({
                 url            : execURL + "reference_table_columns_sel @specs_id=" + specsId  
                ,text           : "table_column_name"
                ,value          : "column_name"
                ,onChange       :  function(){
                    var  _$self = this
                        ,_zRow = _$self.closest(".zRow")
                    ;
                        _setDdlvalues( _zRow , _$self.val());
                        _displayListIcon(_zRow,_$self.val());
                }
                ,onEachComplete : function(data){
                    var _$self = $(this);
                        _zRow  = _$self.closest(".zRow")
                    ;
                        _setDdlvalues(_zRow , _$self.val());
                }
            }); 

            _this.find("select[name='operator_value']").dataBind({
                 url: execURL + "operators_sel"
                ,text: "operator_name"
                ,value: "operator_value"
                ,onEachComplete : function(data){
                    _displayListIcon( $(this).closest(".zRow"), $(this).val() );
                      
                }
                ,onChange: function(){
                    var _$self = this;
                    var _$zRow = _$self.closest(".zRow");
                    var _$column_value1 = _$zRow.find("#column_value");
                    var _$column_value2 = _$zRow.find("#column_value2");
                    //var _optSelVal = _$zRow.find("select[name='operator_value']").attr("selectedvalue");
                    var _optVal = _$zRow.find("select[name='operator_value']").val();
                    
                    //trigger display upon user selection
                    if( ["IN","ISNULL",""].includes(_optVal) ) 
                        _$column_value1.css({"display":"none"}); 
                    else 
                        _$column_value1.css({"display":"unset"});
                        
                    if(_optVal  !== "BETWEEN" )
                        _$column_value2.css({"display":"none"}); 
                    else 
                        _$column_value2.css({"display":"unset"});
                    
                    if(_optVal !== "IN") $(".colval").hide(); 

                    _displayListIcon( this.closest(".zRow"), $(this).val() );
                }
             });  

    	}
    });    
}  

function displayCriteriaColumnValues(colName,criteriaColId){
    $(".colval").show();
    $("#gridCriteriaColumnValues").dataBind({
         url    : execURL + "criteria_column_values_sel "  + ( criteriaColId !==""  ?  "@criteria_column_id=" + criteriaColId  :"")
        ,width          : 350
	    ,height         : 400
        ,blankRowsLimit :5
        ,dataRows       :[
    		 { text:   "Attribute Value"    , width:300  , style:"text-align:left;"   
    		     ,onRender : function(d){
    		         console.log("d",d);
                                 return bs({name:"criteria_column_value_id"  ,type:"hidden",value: svn(d,"criteria_column_value_id")})
    		                                +   bs({name:"criteria_column_id"  ,type:"hidden",value: criteriaColId })
    		                                +   bs({name:"is_edited",type:"hidden" })
                                            +   bs({name:"attribute_value"    , type:"select" , value: svn(d,"attribute_value")}); 
                            }             
    		 }	 

	    ]
	    ,onComplete : function(){
                this.data("colName", colName);
                this.data("criteriaColId", criteriaColId);
                this.find("input, select").on("change keyup ", function(){
                    $(this).closest(".zRow").find("#is_edited").val("Y");
                });  
                this.find("select[name='attribute_value']").dataBind({
                    url: execURL + "reference_table_column_values_sel @column_name='" + colName + "'"  
                        ,text   : "attribute_name"
                        ,value  : "attribute_id"
                });  
	    }
    });    
}

function submitData1(){
    var _$grid =  $("#gridCriteriaColumns");
       _$grid.jsonSubmit({
             procedure: "criteria_columns_upd"
            ,optionalItems: ["is_output"]
            ,notInclude: "#column_value_select, #column_value_select2"
            ,onComplete: function (data) {
                if(data.isSuccess===true) {
                    zsi.form.showAlert("alert");
                    displayCriteriaColumns(_$grid.data("criteriaId"), _$grid.data("specsId"));
                }
            }
            
        });
}   

$("#btnSave").click(function () {
    var _$grid = $("#gridCriteria");
        _$grid.jsonSubmit({
             procedure: "criterias_upd"
            ,optionalItems: ["is_active"]
            ,onComplete: function (data) {
            if(data.isSuccess===true) zsi.form.showAlert("alert");
            displayRecords();
            displayCriteria(_$grid.data("menuId"),_$grid.data("specsId"));
            }
        });
});

function submitData2(){
    var _$grid = $("#gridCriteriaColumnValues");
        _$grid.jsonSubmit({
             procedure: "criteria_column_values_upd"
            ,onComplete: function (data) {
            if(data.isSuccess===true) zsi.form.showAlert("alert");
            displayCriteriaColumnValues(_$grid.data("colName"),_$grid.data("criteriaColId"));
            }
        });
}