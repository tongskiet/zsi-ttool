var  svn                        = zsi.setValIfNull
    ,bs                         = zsi.bs.ctrl
    ,bsButton                   = zsi.bs.button
    ,proc_url                   = base_url + "common/executeproc/"
    ,gMdlId                     = "modalCriteriaColums"
    ,gMdlWGR                    = "modalWireGaugeReferences"
    ,gtw                        = null
    ,g$mdl                      = null
    ,criteriaId                 = ""
    ,modalImageUpload           = "modalWindowImageUpload"
    ,modalIconUpload            = "modalWindowIconUpload"
    ,modalCriteriaImageUpload   = "modalwindowCriteriaImageUpload"
    ,modalChart                 = "modalWindowChart"
    ,gSpecsId                   = ""
    ,gTimeStamp                 = 0
    ,gClsMma                    ="mouse-move-area"
    ,gPrmRegion                 = ""
    ,gPrmNoYears                = ""
    ,gPrmChartType              = ""
    ,gPrmIncludeCYear           = "N"
    ,gAll                       = []
    ,gByRegion                  = []
    ,gByModelYear               = []
    ,gPrmCriteriaId             = null
    ,gPrmReportTypeId           = null
    ,gMYRange                   = ""
    ,gHarnessName               = ""
    ,gRegionNames               = []
    ,gModelYears                = []
    ,gMYFrom                    = ""
    ,gMYTo                      = ""
;

zsi.ready(function(){
  gtw = new zsi.easyJsTemplateWriter();
    getTemplates(function(){
        displayRecords();
    });
    
});

$(document).mousemove(function(e){
    var _$o = $(e.target);
    var _$mma = _$o.hasClass(gClsMma) ? _$o : _$o.closest("." + gClsMma);
    var _$imgBox = $("#img-box");
    if(_$mma.length >0  && _$mma.find("a").length > 0 ){
        _$imgBox.css({top:e.pageY + 20,left:e.pageX  - (_$imgBox.width() /2)   });
    }else{
        _$imgBox.css({display:"none"});
    }
});

function getTemplates(callback){
    new zsi.easyJsTemplateWriter("body")
    .bsModalBox({
          id        : gMdlId
        , sizeAttr  : "modal-full"
        , title     : "Criteria Columns"
        , body      : gtw.new().modalBody({gridId1:"gridCriteriaColumns",gridId2:"gridCriteriaColumnValues",onClickSave1:"submitData1();",onClickSave2:"submitData2();"}).html()  
    })
    .bsModalBox({
          id        : gMdlWGR
        , sizeAttr  : "modal-lg"
        , title     : "Wire Gauge References"
        , body      : gtw.new().modalBodyWGR({gridWGR:"gridWireGaugeReferences",onClickSaveWGR:"submitDataWGR();"}).html()  
    })
    .bsModalBox({
          id        : modalImageUpload
        , sizeAttr  : "modal-md"
        , title     : "Upload Image"
        , footer    : '<div class="col-11 ml-auto"><button type="button" onclick="uploadMenuImage(this);" class="btn btn-primary"><span class="fas fa-file-upload"></span> Upload</button>'
        //, body      : gtw.new().modalBody({gridId3:"gridUploadImage",uploadImage:"uploadImage();"}).html()  
    })
    
    .bsModalBox({
          id        : modalIconUpload
        , sizeAttr  : "modal-md"
        , title     : "Upload Image"
        , footer    : '<div class="col-11 ml-auto"><button type="button" onclick="saveFaIcon(this);" class="btn btn-primary"><span class="fas fa-file-upload"></span> Save</button>'
        //, body      : gtw.new().modalBody({gridId3:"gridUploadImage",uploadImage:"uploadImage();"}).html()  
    })

    .bsModalBox({
          id        : modalCriteriaImageUpload
        , sizeAttr  : "modal-md"
        , title     : "Upload Image"
        , footer    : '<div class="col-11 ml-auto"><button type="button" onclick="uploadCriteriaImage(this);" class="btn btn-primary"><span class="fas fa-file-upload"></span> Upload</button>'
        //, body      : gtw.new().modalBody({gridId3:"gridUploadImage",uploadImage:"uploadImage();"}).html()  
    })
    
    .bsModalBox({
          id        : modalChart
        , sizeAttr  : "modal-full"
        , title     : "Chart"
        , footer    : ""
         , body      : '<div class="d-flex  flex-wrap flex-md-nowrap align-items-center mb-1 justify-content-end">'
                            +'<div class="mr-auto py-2 font-weight-bold" id="chart_range"></div>'
                            +'<div class="btn-toolbar mb-2 mb-md-0" id="chart_filter">'
                                +'<div class="input-group ">'
                                    +'<div class="input-group-prepend">'
                                        +'<span class="input-group-text">Category :</span>'
                                    +'</div>'
                                    +'<select class="custom-select" id="category" style="width:120px">'
                                        +'<option selected>Choose...</option>'
                                        +'<option value="Per Model Year">Per Model Year</option>'
                                        +'<option value="Per Region">Per Region</option>'
                                        +'<option value="Per Vehicle Type">Per Vehicle Type</option>'
                                        +'<option value="Per OEM">Per OEM</option>'
                                    +'</select>'
                                    +'<div class="input-group-prepend">'
                                        +'<div class="input-group-text">'
                                            +'<input type="checkbox" id="include_cyear" aria-label="Checkbox to include current year">'
                                            +'<span class="pl-1">Include Current Year</span>'
                                        +'</div>'
                                    +'</div>'
                                    +'<div class="input-group-prepend">'
                                        +'<span class="input-group-text">No. of Years :</span>'
                                    +'</div>'
                                    +'<input type="number" min="1" max="10" step="1" value="" class="form-control" id="no_of_years" style="width:50px">'
                                    +'<div class="input-group-prepend">'
                                        +'<span class="input-group-text">Chart Type :</span>'
                                    +'</div>'
                                    +'<select class="custom-select" id="chart_type" style="width:120px">'
                                        +'<option selected>Choose...</option>'
                                        +'<option value="Pie Chart">Pie Chart</option>'
                                        +'<option value="Bar Graph" selected>Bar Graph</option>'
                                    +'</select>'
                                    +'<div class="input-group-append">'
                                        +'<button class="btn btn-dark" type="button" id="btnSearch" onclick="filterChart();">Go</button>'
                                    +'</div>'
                                +'</div>'
                            +'</div>'
                        +'</div>'
                        +'<div id="chart_container"></div>'
    });
    
    if(callback) callback();
    
}

function displayRecords(){ 
    var flag = "";
    $("#grid").dataBind({
             sqlCode        : "T72"
            ,width          : 660
    	    ,height         : $(document).height() - 250
    	    ,selectorType   : "checkbox"
            ,blankRowsLimit:5
            ,isPaging : false
            ,dataRows       :[
        		{ text:"Menu Name"         , width:250     , style:"text-align:left;"
        		    ,onRender : function(d){
        		        var _menuId = svn(d,"menu_id");
        		        var _specsId = svn(d,"specs_id");
        		        this.css('cursor', 'pointer');
        		        this.click(function(){
        		            if(_menuId && _specsId){
                                $(".criteria").show();
                                displayCriteria(_menuId,_specsId);
                            }
        		  	        else{
                                $(".criteria").hide();
                               //$("#gridCriteria").find(".zRows").html("");
                            }
        		        });
                        return  bs({name:"menu_id" ,type:"hidden" ,value:svn(d,"menu_id") })
		                      + bs({name:"specs_id" ,type:"hidden" ,value:svn(d,"specs_id") })
		                      + svn(d,"menu_name");
        		    }
        		}	 
        		,{ text:"Image 1"      , width:70     , style:"text-align:center;" 
        		    ,onRender : function(d){ 
        		        this.addClass(gClsMma);
                        var _mouseMoveEvent = "onmouseover='mouseover(\"" + svn(d,"image1_id") +  "\");' onmouseout=''";
        		        var _imgName       = "<a href='javascript:void(0);' " + _mouseMoveEvent + " class='btn btn-sm;'  onclick='showModalUploadImage(" + svn(d,"menu_id") + ",\"" + svn(d,"image1_id") + "\",\"image1_id\",\"" + svn(d,"menu_name") + "\");' ><span class='fas fa-file-upload' style='font-size:12pt;' ></span> </a>";
        		            return (d !== null ? _imgName : "");
        		    }
        		}	 	 	
        		,{ text:"Image 2"      , width:70     , style:"text-align:center;" 
        		    ,onRender : function(d){ 
        		        this.addClass(gClsMma);
                        var _mouseMoveEvent = "onmouseover='mouseover(\"" + svn(d,"image2_id") +  "\");' onmouseout='mouseout();'";
        		        var _imgName       = "<a href='javascript:void(0);' " + _mouseMoveEvent + " class='btn btn-sm;'  onclick='showModalUploadImage(" + svn(d,"menu_id") + ",\"" + svn(d,"image2_id") + "\",\"image2_id\",\"" + svn(d,"menu_name") + "\");' ><span class='fas fa-file-upload' style='font-size:12pt;' ></span> </a>";
        		        return (d !== null ? _imgName : "");
        		    }
        		}	 	 	
        		,{ text:"Image 3"      , width:70     , style:"text-align:center;" 
        		    ,onRender : function(d){ 
        		        this.addClass(gClsMma);
                        var _mouseMoveEvent = "onmouseover='mouseover(\"" + svn(d,"image3_id") +  "\");' onmouseout=''";
        		        var _imgName       = "<a href='javascript:void(0);' " + _mouseMoveEvent + " class='btn btn-sm;'  onclick='showModalUploadImage(" + svn(d,"menu_id") + ",\"" + svn(d,"image3_id") + "\",\"image3_id\",\"" + svn(d,"menu_name") + "\");' ><span class='fas fa-file-upload' style='font-size:12pt;' ></span> </a>";
        		            return (d !== null ? _imgName : "");
        		    }
        		}	 	 	
        		,{ text:"Image 4"      , width:70     , style:"text-align:center;" 
        		    ,onRender : function(d){ 
        		        this.addClass(gClsMma);
                        var _mouseMoveEvent = "onmouseover='mouseover(\"" + svn(d,"image4_id") +  "\");' onmouseout='mouseout();'";
        		        var _imgName       = "<a href='javascript:void(0);' " + _mouseMoveEvent + " class='btn btn-sm;'  onclick='showModalUploadImage(" + svn(d,"menu_id") + ",\"" + svn(d,"image4_id") + "\",\"image4_id\",\"" + svn(d,"menu_name") + "\");' ><span class='fas fa-file-upload' style='font-size:12pt;' ></span> </a>";
        		        return (d !== null ? _imgName : "");
        		    }
        		}	 	 	
        		,{ text:"Icon Name"      , width:80     , style:"text-align:center;" 
        		    ,onRender : function(d){ 
        		        var _faIcon = "<a href='javascript:void(0);' class='btn btn-sm;'  onclick='showModalAddIcon(" + svn(d,"menu_id") + ",\"" + svn(d,"fa_icon") + "\",\"" + svn(d,"menu_name") + "\");' ><span class='fas fa-plus-circle' style='font-size:12pt;' ></span> </a>";
        		        return (d !== null ? _faIcon : "");
        		}
        		}	 	 	
        		,{ text:"" ,width:35 , style:"text-align:left;"
        		        ,onRender   :   function(d){
        		            var _link = "<a href='javascript:void(0);' class='btn btn-sm'  onclick='showModalWireGaugeReferences(\""+ svn(d,"menu_id") +"\",\""+ svn(d,"specs_id") +"\",\""+ svn(d,"menu_name") +"\");'  ><i class='fas fa-link'></i> </a>";
        		            var _returnValue = (svn(d,"menu_id") === 1 ? _link : "");
        		            return (d !==null ? _returnValue : "" );
        		        }
        		}
        		
            ]
    });    
}

function mouseover(imgId){
    $("#img-box").css("display","block");
    $("#img-box img").attr("src",base_url + "file/viewImageDB?sqlCode=T83&imageId=" +  imgId  + "&ts=" + gTimeStamp );
}

function mouseoverCriteria(imgId){
    $("#img-box").css("display","block");
    $("#img-box img").attr("src",base_url + "file/viewImageDB?sqlCode=C89&imageId=" +  imgId  + "&ts=" + gTimeStamp );
}

function mouseout(){
    $("#img-box").css("display","none");
}

function showModalUploadImage(parentId,imageId,fieldName,menuName){
    var m=$('#' + modalImageUpload);
    m.find(".modal-title").text('Upload Image to' + ' » ' + menuName);
    m.modal("show");
    $.get(base_url + 'page/name/tmplImageDbUpload'
        ,function(data){
           m.find('.modal-body').html(data);
           m.find("form").attr("enctype","multipart/form-data");
           m.find("#parent_id").val(parentId);
           m.find("#image_id").val(imageId);
           m.find("#field_name").val(fieldName);
        }
    ); 
}

function showModalAddIcon(parentId,faIcon,menuName){
    var m=$('#' + modalIconUpload);
    m.find(".modal-title").text('Upload Icon to' + ' » ' + menuName);
    m.modal("show");
    $.get(base_url + 'page/name/tmplDBAddIcon'
        ,function(data){
           m.find('.modal-body').html(data);
           m.find("#parent_id").val(parentId);
           m.find("#fa_icon").val(faIcon);
        }
    ); 
}

function showModalUploadCriteriaImage(parentId,imageId,fieldName,title){
    var m=$('#' + modalCriteriaImageUpload);
    m.find(".modal-title").text('Upload Image to' + ' » ' + title);
    m.modal("show");
    $.get(base_url + 'page/name/tmplImageDbUpload'
        ,function(data){
           m.find('.modal-body').html(data);
           m.find("form").attr("enctype","multipart/form-data");
           m.find("#parent_id").val(parentId);
           m.find("#image_id").val(imageId);
           m.find("#field_name").val(fieldName);
        }
    ); 
}


function showModalWireGaugeReferences(menuId,specsId,menuName) {
  //  $(".colval").hide();
    g$mdl = $("#" + gMdlWGR); 
    g$mdl.find(".modal-title").text("Menu Name  » " + menuName ) ;
    g$mdl.modal({ show: true, keyboard: false, backdrop: 'static' });
    displayWireGaugeReferences(menuId,specsId);

}  

function displayWireGaugeReferences(menuId,specsId){
     var rownum=0;
     $("#gridWireGaugeReferences").dataBind({
	     url            : execURL + "wire_gauge_references_sel"
	    ,width          : $("#gridWireGaugeReferences").closest(".modal-body").width() 
	    ,height         : $(document).height() - 200
	    ,selectorIndex  : 1
	    ,startGroupId   : 0
        ,blankRowsLimit : 5
        ,dataRows       : [
                            {  id:  1  ,groupId: 0      , text  : "<div class='centered'>Wire Gauge </div>"           , style :   "text-align:center;"}	 
            		        ,{ id:  2  ,groupId: 0      , text  : "<div class='centered'>Color</div>"                 , style :   "text-align:left;" }
            		        ,{ id:  3  ,groupId: 0      , text  : "<div class='centr'>JASO</div>"                     , style :   "text-align:center;" }	 
    		                ,{ id:  4  ,groupId: 0      , text  : "<div class='centr'>ISO</div>"                      , style :   "text-align:center;" }	 
    		                
    		                ,{  id          : 100
                                , groupId   : 1    		      
                                , text      : ""     
            		            , name      : "wire_gauge"  
            		            , type      : "input"           
            		            , width     : 150      
            		            , style     : "text-align:left;"  
            		            
            		        }
            		        ,{  id          : 101
                                , groupId   : 2    		      
                                , text      : ""     
            		            , name      : "color_id"  
            		            , type      : "select"           
            		            , width     : 130      
            		            , style     : "text-align:left;"  
            		        }
            		        
            		        ,{  id          : 102
                                , groupId   : 3    		      
                                , text      : "<div class='centr'>LL</div>"     
            		            , name      : "jaso_lower_limit"  
            		            , type      : "input"           
            		            , width     : 120      
            		            , style     : "text-align:center;"  
            		            , onRender  :   function(d){ 
    		                        return  bs({name:"jaso_lower_limit"      , class : "numeric text-center",   type    : "input"          ,   value: svn(d,"jaso_lower_limit")});
    		                        }
            		            
            		        }
            		        ,{  id          : 103
                                , groupId   : 3    		      
                                , text      : "<div class='centr'>UL</div>"     
            		            , name      : "jaso_upper_limit"  
            		            , type      : "input"           
            		            , width     : 105      
            		            , style     : "text-align:center;"  
            		            , onRender  :   function(d){ 
    		                        return  bs({name:"jaso_upper_limit"      , class : "numeric text-center",   type    : "input"          ,   value: svn(d,"jaso_upper_limit")});
    		                        }
            		            
            		        }
            		        ,{  id          : 104
                                , groupId   : 4    		      
                                , text      : "<div class='centr'>LL</div>"     
            		            , width     : 105      
            		            , style     : "text-align:center;"  
            		            , onRender  :   function(d){ 
    		                        return  bs({name:"iso_lower_limit"      , class : "numeric text-center",   type    : "input"          ,   value: svn(d,"iso_upper_limit")});
    		                        } 
            		        
            		            
            		        }
            		        ,{  id          : 105
                                , groupId   : 4  		      
                                , text      : "<div class='centr'>UL</div>"     
            		            , type      : "input"           
            		            , width     : 105      
            		            , style     : "text-align:center;"  
            		            , onRender  :   function(d){ 
    		                        return  bs({name:"iso_upper_limit"      , class : "numeric text-center",   type    : "input"          ,   value: svn(d,"iso_upper_limit")})
    		                                + bs({name:"is_edited" , type:"hidden" , value: svn(d,"is_edited")}) ;
    		                       } 
            		        }
    		    
            		        
	                    ]
    	    ,onComplete: function(){
        	    $("input, select").on("change keyup ", function(){
                        $(this).closest(".zRow").find("#is_edited").val("Y");
                });       
                $("select[name='color_id']").dataBind({
                    url: execURL + "color_references_sel"
                        ,text   : "color_name"
                        ,value  : "color_id"
                });    
                zsi.initInputTypesAndFormats();
        }  
    });    
}

function submitDataWGR(){
    var _$grid =  $("#gridWireGaugeReferences");
       _$grid.jsonSubmit({
             procedure: "wire_gauge_references_upd"
           // ,optionalItems: ["is_output"]
         //   ,notInclude: "#column_value_select, #column_value_select2"
            ,onComplete: function (data) {
                if(data.isSuccess===true) {
                    zsi.form.showAlert("alert");
                    displayWireGaugeReferences(_$grid.data("menuId"), _$grid.data("specsId"));
                }
            }
            
        });
}  
/*
 $("#btnSave").click(function () {
   $("#grid").jsonSubmit({
             procedure: "wire_gauge_references_upd"
            , onComplete: function (data) {
                $("#grid").clearGrid();
                if(data.isSuccess===true) zsi.form.showAlert("alert");
                displayRecords();
            }
    });
});
*/

function uploadMenuImage(obj){
    var _frm = $(obj).closest(".modal-content").find("form");

    var _file= _frm.find("#file").get(0);
    var _parent_id =_frm.find("#parent_id").val();
    var _field_name =_frm.find("#field_name").val();
           
    if( _file.files.length<1 ) { 
         alert("Please select image.");
        return;
    }
    var formData = new FormData( _frm.get(0));
    $.ajax({
        url: base_url + 'file/UploadImageDb',  //server script to process data
        type: 'POST',

        //Ajax events
        success: completeHandler = function(data) {
            if(data.isSuccess){
                console.log("data",data);
                $.get(base_url  + "sql/exec?p=dbo.trend_menu_image_upd @tren_menu_id=" + _parent_id 
                                + ",@" + _field_name + "=" + data.image_id 
                                + ",@user_id=" + userId 
                                
                ,function(data){
                    zsi.form.showAlert("alert");
                    $('#' + modalImageUpload).modal('toggle');
                    //refresh latest records:
                    displayRecords();
                    gTimeStamp = new Date().getTime();
                });

                    
            }else
                alert(data.errMsg);
            
        },
        error: errorHandler = function() {
            console.log("error");
        },
        // Form data
        data: formData,
        //Options to tell JQuery not to process data or worry about content-type
        cache: false,
        contentType: false,
        processData: false
    }, 'json');
}

function saveFaIcon(obj){
    var _frm = $(obj).closest(".modal-content").find("form");

    var _faIcon     = _frm.find("#fa_icon_name").val();
    var _parentId   = _frm.find("#parent_id").val();
 
     $.get(base_url  + "sql/exec?p=dbo.trend_menu_image_upd @tren_menu_id=" + _parentId 
                    + ",@fa_icon='" + _faIcon + "'"
                    + ",@user_id=" + userId 
                    
    ,function(data){
        zsi.form.showAlert("alert");
        $('#' + modalIconUpload).modal('toggle');
        displayRecords();
    });
                
}

function uploadCriteriaImage(obj){
    var _frm = $(obj).closest(".modal-content").find("form");

    var _file= _frm.find("#file").get(0);
    var _parent_id =_frm.find("#parent_id").val();
    var _field_name =_frm.find("#field_name").val();
           
    if( _file.files.length<1 ) { 
         alert("Please select image.");
        return;
    }
    var formData = new FormData( _frm.get(0));
    $.ajax({
        url: base_url + 'file/UploadImageDb',  //server script to process data
        type: 'POST',

        //Ajax events
        success: completeHandler = function(data) {
            if(data.isSuccess){
                console.log("data",data);
                $.get(base_url  + "sql/exec?p=dbo.criteria_image_upd @criteria_id=" + _parent_id 
                                + ",@" + _field_name + "=" + data.image_id 
                                + ",@user_id=" + userId 
                                
                ,function(data){
                    zsi.form.showAlert("alert");
                    $('#' + modalCriteriaImageUpload).modal('toggle');
                    //refresh latest records:
                    displayRecords();
                    gTimeStamp = new Date().getTime();
                });

                    
            }else
                alert(data.errMsg);
            
        },
        error: errorHandler = function() {
            console.log("error");
        },
        // Form data
        data: formData,
        //Options to tell JQuery not to process data or worry about content-type
        cache: false,
        contentType: false,
        processData: false
    }, 'json');
}

function displayCriteria(menuId,specsId){
        $("#gridCriteria").dataBind({
             sqlCode        : "C12"
            ,parameters     : {
                                trend_menu_id: menuId
                            }
            ,width          : 1025
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
        		,{ text:"Image 1"      , width:100     , style:"text-align:center;" 
        		    ,onRender : function(d){ 
        		        this.addClass(gClsMma);
                        var _mouseMoveEvent = "onmouseover='mouseoverCriteria(\"" + svn(d,"image1_id") +  "\");' onmouseout='mouseout();'";
        		        var _image1       = "<a href='javascript:void(0);' " + _mouseMoveEvent + " class='btn btn-sm;'  onclick='showModalUploadCriteriaImage(" + svn(d,"criteria_id") + ",\"" + svn(d,"image1_id") + "\",\"image1_id\",\"" + svn(d,"criteria_title") + "\");' ><span class='fas fa-file-upload' style='font-size:12pt;' ></span> </a>";
        		        if(svn(d,"pcriteria_id"))
        		            return "";
        		        else if(d !==null)
        		            return _image1;
        		        else 
        		            return "";
        		    }
        		}	 	 	
        		,{ text:"Image 2"      , width:100     , style:"text-align:center;" 
        		    ,onRender : function(d){ 
        		        this.addClass(gClsMma);
                        var _mouseMoveEvent = "onmouseover='mouseover(\"" + svn(d,"image2_id") +  "\");' onmouseout='mouseout();'";
        		        var _image2         = "<a href='javascript:void(0);' " + _mouseMoveEvent + " class='btn btn-sm;'  onclick='showModalUploadCriteriaImage(" + svn(d,"criteria_id") + ",\"" + svn(d,"image2_id") + "\",\"image2_id\",\"" + svn(d,"criteria_title") + "\");' ><span class='fas fa-file-upload' style='font-size:12pt;' ></span> </a>";
        		        if(svn(d,"pcriteria_id"))
        		            return "";
        		        else if(d !==null)
        		            return _image2;
        		        else 
        		            return "";
        		    }
        		}	 	 	
                ,{ text:"" ,width:35 , style:"text-align:left;"
    		        ,onRender   :   function(d){
    		            var _link = "<a href='javascript:void(0);' class='btn btn-sm'  onclick='showModalChart(\""+ svn(d,"criteria_id") +"\",\"" +  svn(d,"criteria_title")  + "\");'  ><i class='fas fa-chart-bar'></i> </a>";
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
                        //url: execURL + "criteria_group_sel" + (this.value ? " @criteria_id=" + this.value : "")  
                              sqlCode       : "C11"
                            , parameters    : {criteria_id : this.value}
                            , text          : "criteria_title"
                            , value         : "criteria_id"
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
         sqlCode        : "C9"
        ,parameters     : {
                            criteria_id : criteriaId 
                        }
        ,width          : 950
	    ,height         : 400
        ,blankRowsLimit :5
        ,dataRows       :[
    		 { text: "Column Name"   , width:250 , style:"text-align:left;" 
    		     ,onRender : function(d){return bs({name:"criteria_column_id"  ,type:"hidden",value: svn(d,"criteria_column_id")})
    		                                +   bs({name:"criteria_id"  ,type:"hidden",value: criteriaId })
    		                                +   bs({name:"is_edited",type:"hidden" })
    		                                +   bs({name:"column_name"  ,type:"select",value: svn(d,"column_name") });
    		                               
    		        }
    		 }
    		 ,{ text: "Operator Name" ,  width:140, style:"text-align:left;" 
    		     ,onRender: function(d){
    		         return bs({name:"operator_value",  type:"select", value: svn(d,"operator_value")});
    		     }
    		 }
    		 ,{ text: ""              ,width:25      , style:"text-align:left;"
    		        ,onRender   :   function(d){
                       return "<span class='lst-icon'> &nbsp;<span>";
        	        }
    		  }
    		 ,{ text: "Column Value1"     , width:130           , style:"text-align:left;" 
    		     ,onRender : function(d){
    		         if(svn(d,"operator_value") === ""){
    		           return bs({name:"column_value"      , type:"select" , value: svn(d,"column_value") ,class:"hide"});   
    		         } 
    		         else{
    		           return bs({name:"column_value"      , type:"select" , value: svn(d,"column_value")}); 
    		         } 
    		     }
    		 }
    		 ,{ text: "Column Value2"     , width:130          , style:"text-align:left;"  
    		     ,onRender : function(d){
    		         return bs({name:"column_value2"    , type:"select" , value: svn(d,"column_value2")}); 
    		     }
    		     
    		 }
    		 ,{ text: "Column Value3"     , width:130          , style:"text-align:left;"  
    		     ,onRender : function(d){
    		         return bs({name:"column_value3"    , type:"input" , value: svn(d,"column_value3")}); 
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
         sqlCode        : "C7"
        ,parameters     : {
                            criteria_column_id : criteriaColId
                        }
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

// ---------------------------------- CHART ----------------------------------------//

function showModalChart(criteriaId,name) {
    gPrmCriteriaId = criteriaId;
    g$mdl = $("#" + modalChart); 
    g$mdl.find(".modal-title").text( name ) ;
    g$mdl.modal({ show: true, keyboard: false, backdrop: 'static' });
    
    if($.trim(name) === "New Wire Tech"){
        $("#chart_filter").hide();
        displayNewWireTech();
    }else{
        $("#chart_filter").show();
        displayChart();
    }
    gtw = new zsi.easyJsTemplateWriter("#chart_container").new();
} 

function displayChart(){
    am4core.useTheme(am4themes_animated);
    
    //gtw.chartFilter({ model_year: gMYRange });
    getAllWires(function(){
        setMYRange();
        //gtw.div({class:"font-weight-bold", value:gMYRange})
        displayChartWireSummary();
        displayChartSmallWires();
         
        setTimeout(function(){
            getSmallWires(function(){ 
                displayChartSmallWiresDtl();
                
                setTimeout(function(){
                    getSmallWiresDtl(function(){
                        displayChartSmallWiresSubDtl();
                    });
                }, 2500); 
            });
        }, 2500);  
    });
}

function filterChart(){
    gPrmNoYears = "";
    gPrmIncludeCYear = "";
    gPrmChartType = "";
    
    gPrmNoYears = $("#no_of_years").val();
    gPrmIncludeCYear = ( $('#include_cyear').is(":checked") ? "Y" : "N" );  
    gPrmChartType = $.trim($("#chart_type").val());
    gPrmChartType = (gPrmChartType.indexOf("Choose") > -1 ? "" : gPrmChartType);
    
    if(gPrmIncludeCYear==="Y" && gPrmNoYears===""){
        alert("Please enter no. of years.");
    }else{
        $("#chart_container").empty();
        
        displayChart();
    }
}

function getData(obj, callback){
    if( $.isEmptyObject(obj) === false ) {
        var _param = "";
        var _byregion = ( obj.byRegion === "Y" ? "Y" : "N" );
        var _byModelYear = ( obj.byModelYear === "Y" ? "Y" : "N" );
        var _criteriaID = ( obj.criterieId !=="" ? obj.criterieId : "7" );
        var _reportTypeID = ( obj.reportTypeId !=="" ? obj.reportTypeId : "1" );
        
        if(gPrmIncludeCYear==="Y") 
            _param += ",@no_years='"+ gPrmNoYears +"',@include_cyear='Y'";
        else if(gPrmIncludeCYear==="N" && gPrmNoYears!==""){
            _param += ",@no_years='"+ gPrmNoYears +"',@include_cyear='N'";
        }
        
        $.get(execURL + "dynamic_wires_usage_summary @byRegion='"+ _byregion +"',@byMY='"+ _byModelYear +"',@criteria_id="+ _criteriaID +",@report_type_id=" + _reportTypeID + _param
        , function(data){
            var dataRows = [];
            if(data.rows.length > 0){
              dataRows = data.rows;
            }
            if(callback) callback(dataRows);
        });
        
        // var _param = {
        //     byRegion: _byregion,
        //     byMY: _byModelYear,
        //     criteria_id: _criteriaID,
        //     report_type_id: _reportTypeID
        // };
        
        // if(gPrmIncludeCYear==="Y"){ 
        //     _param.no_years = gPrmNoYears;
        //     _param.include_cyear = "Y";
        // }else if(gPrmIncludeCYear==="N" && gPrmNoYears!==""){
        //     _param.no_years = gPrmNoYears;
        //     _param.include_cyear = "N";
        // }
        
        // zsi.getData({
        //     sqlCode : "D15"
        //     ,parameters : _param
        //     ,onComplete : function(d) {
        //         var dataRows = [];
        //         if(data.rows.length > 0){
        //             dataRows = data.rows;
        //         }
        //         if(callback) callback(dataRows);
        //     }
        // });
    }
}

function getDataAll(callback){
    getData({
        byRegion: "Y",
        byModelYear: "Y",
        criterieId: gPrmCriteriaId,
        reportTypeId: gPrmReportTypeId
    }, function(all){
        gAll = all;
        
        gRegionNames = all.groupBy(["REGION_NAME"]);
        gModelYears = all.groupBy(["MODEL_YEAR"]);

        if(callback) callback(all);
    });
}

function getDataByRegion(callback){
    getData({
        byRegion: "Y",
        byModelYear: "N",
        criterieId: gPrmCriteriaId,
        reportTypeId: gPrmReportTypeId
    }, function(region){
        gByRegion = region;
        
        if(callback) callback(region);
    });
} 

function getDataByModelYear(callback){
    getData({
        byRegion: "N",
        byModelYear: "Y",
        criterieId: gPrmCriteriaId,
        reportTypeId: gPrmReportTypeId
    }, function(model_year){
        gByModelYear = model_year;
        
        if(callback) callback(model_year);
    });
}

function getAllWires(callback){
    gPrmReportTypeId = 1;
    
    getDataAll(function(){
        //getDataByRegion(function(){
            gByModelYear = [];
            gAll.groupBy(["MODEL_YEAR"]).forEach(function(v){
                var obj = {};
                var totalWires = 0;
                var totalBigWires = 0;
                var totalSmallWires = 0;
               
                v.items.forEach(function(item){
                    totalBigWires += item.total_big_wires;
                    totalSmallWires += item.total_small_wires;
                }); 
                totalWires = totalSmallWires + totalBigWires;
               
                obj.MODEL_YEAR = +v.name
                obj.total_big_wires = totalBigWires
                obj.total_small_wires = totalSmallWires
                obj.total_wire_count = totalWires
                
                gByModelYear.push(obj);
            });
            
            gByRegion = [];
            gAll.groupBy(["REGION_NAME"]).forEach(function(v){
                var obj = {};
                var totalWires = 0;
                var totalBigWires = 0;
                var totalSmallWires = 0;
               
                v.items.forEach(function(item){
                    totalBigWires += item.total_big_wires;
                    totalSmallWires += item.total_small_wires;
                }); 
                totalWires = totalSmallWires + totalBigWires;
               
                obj.REGION_NAME = v.name
                obj.total_big_wires = totalBigWires
                obj.total_small_wires = totalSmallWires
                obj.total_wire_count = totalWires
                
                gByRegion.push(obj);
            });
            
            //getDataByModelYear(function(){
                if(callback) callback();
            //});
        //});
    });
}

function getSmallWires(callback){
    gPrmReportTypeId = 2;
    
    getDataAll(function(){
        getDataByRegion(function(){
            getDataByModelYear(function(){
                if(callback) callback();
            });
        });
    });
}

function getSmallWiresDtl(callback){
    gPrmReportTypeId = 4;
    
    getDataAll(function(){
        getDataByRegion(function(){
            getDataByModelYear(function(){
                if(callback) callback();
            });
        });
    });
}

function displayChartWireSummary(){
    gtw.chartDiv({ 
        id:"chartWireSummary", 
        title:"Summary", 
        by_model_year_id: "chartWireSummaryByMY",
        by_region_id: "chartWireSummaryByRegion",
        each_model_year_id: "chartWireSummaryEachMY",
        each_region_id: "chartWireSummaryEachRegion",
        div_header_id: "chartWireSummaryAll",
        div_header_class: "chart-div border-dark",
        div_middle_id: "chartTrendResult"
    });
    
    displayWireSummaryAll();
    
    if( gPrmChartType==="Pie Chart" ){
        $("#chartWireSummaryByMY, #chartWireSummaryByRegion").removeClass();
        displayWireSummaryByMYPie(function(){
            displayWireSummaryByRegionPie(function(){
                displayWireSummaryEachMYPie(function(){
                    displayWireSummaryEachRegionPie();
                });
            });
        });
    }else{
        displayWireSummaryByMYBar(function(){
            displayWireSummaryByRegionBar(function(){
                //displayWireSummaryEachMYBar(function(){
                //    displayWireSummaryEachRegionBar();
                //});
            });
        });
    }
}

function displayChartSmallWires(){
    gtw.chartDiv({ 
        id:"chartSmallWire", 
        title:"Details", 
        by_model_year_id: "chartSWByMY",
        by_region_id: "chartSWByRegion",
        each_model_year_id: "chartSWEachMY",
        each_region_id: "chartSWEachRegion",
        div_header_id: "chartSWAllBar",
        div_header_class: "chart-div border-dark",
        div_footer_id: "footerSWAll"
    });
    
    displaySWAll();
    
    if( gPrmChartType==="Pie Chart" ){
        displaySWByModelYearPie(function(){
            displaySWByRegionPie(function(){
                displaySWAll(function(){
                    displaySWEachModelYearPie(function(){
                        displaySWEachRegionPie();
                    });
                });
            });
        });
    }else{
        displaySWByModelYearBar(function(){
            displaySWByRegionBar(function(){
                //displaySWAll(function(){
                    //displaySWEachModelYearBar(function(){
                    //    displaySWEachRegionBar();
                    //});
                //});
            });
        });
    }
}

function displayChartSmallWiresDtl(){
    gtw.chartDiv({ 
        id:"chartSWDtl", 
        title:"Summary", 
        title_class: "",
        by_model_year_id: "chartSWDtlByMY",
        by_region_id: "chartSWDtlByRegion",
        each_model_year_id: "chartSWDtlEachMY",
        each_region_id: "chartSWDtlEachRegion",
        div_header_id: "chartSWDtlAll",
        div_header_class: "chart-div border-dark",
    });
    
    displaySWDtlAll();
    
    displaySWDtlByMY(function(){
        displaySWDtlByRegion(function(){
            if( gPrmChartType==="Pie Chart" ){
                displaySWDtlEachMYPie(function(){
                    displaySWDtlEachRegionPie();
                });
            }else{
                //displaySWDtlEachMYBar(function(){
                //    displaySWDtlEachRegionBar();
                //});
            }
        }); 
    });
}

function displayChartSmallWiresSubDtl(){
    
    function createTmpl(harness, name){
        gtw.chartDiv({ 
            id:"chartSWSubDtl" + harness, 
            title:"Summary", //+ name, 
            title_class: "",
            by_model_year_id: "chartSWSubDtlByMY" + harness,
            by_region_id: "chartSWSubDtlByRegion" + harness,
            each_model_year_id: "chartSWSubDtlEachMY" + harness,
            each_region_id: "chartSWSubDtlEachRegion" + harness
        });
        
        displaySWSubDtlByMY(function(){
            displaySWSubDtlByRegion(function(){
                if( gPrmChartType==="Pie Chart" ){
                    displaySWSubDtlEachMYPie(function(){
                        displaySWSubDtlEachRegionPie();
                    });
                }else{
                    displaySWSubDtlEachMYBar(function(){
                        displaySWSubDtlEachRegionBar();
                    });
                }
            }); 
        });
    }
    
    if(gAll.length > 0){
        if(typeof(gAll[0].HARNESS_NAME) !== ud) {
            var _harness = "_" + gAll[0].HARNESS_NAME.replace(/[^A-Z0-9]+/ig, "_");//replace(/\s+/g, '_');
            gHarnessName = _harness;
            //console.log(_harness);
            createTmpl(_harness, " of " + gAll[0].HARNESS_NAME);
            
            // gAll.groupBy(["HARNESS_NAME"]).forEach(function(v){
            //     var _harness = "_" + v.name.replace(/[^A-Z0-9]+/ig, "_");//replace(/\s+/g, '_');
            //     gHarnessName = _harness;
            //     console.log(_harness);
            //     //createTmpl(_harness, " of " + v.name);
            // });
            
        }else{
            //gHarnessName = "";
            //createTmpl("","");
        }
    }
    
}

function setLegendSize(chart){
    var markerTemplate = chart.legend.markers.template;
        markerTemplate.width = 20;
        markerTemplate.height = 20;
}

function setTrendResult(o){
    if(o.length > 0){
        var lastObj = o[o.length - 1];
        var secondObj = o[o.length - 2];
        
        var result = "";
        var inc = "Increasing";
        var dec = "Decreasing";
    
        if( typeof(lastObj)!==ud && typeof(secondObj)!==ud ){
            var totalSWL = lastObj.total_small_wires;
            var totalBWL = lastObj.total_big_wires;
            var totalSWS = secondObj.total_small_wires;
            var totalBWS = secondObj.total_big_wires;
            
            var totalL = totalSWL + totalBWL; 
            var totalS = totalSWS + totalBWS; 
        
            var swTotalL = (totalSWL / totalL) * 100;  
            var bwTotalL = (totalBWL / totalL) * 100;  
            
            var swTotalS = (totalSWS / totalS) * 100;  
            var bwTotalS = (totalBWS / totalS) * 100; 
            
            var lastValSW = swTotalL.toFixed(2);
            var lastValBW = bwTotalL.toFixed(2);
            var secondValSW = swTotalS.toFixed(2);
            var secondValBW = bwTotalS.toFixed(2);
           
            if(lastValSW > secondValSW) {
                result += "% of Below 0.50 - " + inc;
            }else{
                result += "% of Below 0.50 - " + dec;
            }
            
            result += "<br>";
            
            if(lastValBW > secondValBW) {
                result += "% of Above 0.50 - " + inc;
            }else{
                result += "% of Above 0.50 - " + dec;
            }
        }
        
        var _tw = new zsi.easyJsTemplateWriter("#chartTrendResult")
            .trendResult({ trend: result });
    }
}

function setMYRange(){
    if(gModelYears.length > 0){
        var _from = gModelYears[0].name;
        var _to = _from;
        
        if(gModelYears.length > 1){
            _to = gModelYears[gModelYears.length - 1].name;
            
            gMYRange = "MY" + _from + " - MY" + _to;
        }else{
            gMYRange = "MY" + _from;
        } 
        
        gMYFrom = _from;
        gMYTo = _to;
    }
    $("#chart_range").html(gMYRange);
}

// ---------------------- All Wires --------------------------//
function displayWireSummaryAll(callback){
    var _data = [];
    $.each(gAll.groupBy(["REGION_NAME"]), function(i, r) { 
        $.each(gModelYears, function(x, my) {
            var _region = r.name;
            var _my = my.name;
            var _big = 0; //Big Wires
            var _small = 0; //Small Wires
            var _res = r.items.filter(function (item) {
            	return item.MODEL_YEAR == _my;
            });

            if( _res.length > 0 ) {
                _big = _res[0].total_big_wires;
                _small = _res[0].total_small_wires;
            }
            
            _data.push({
                REGION_NAME : _region,
                MODEL_YEAR : +_my,
                category : _my +"("+ _region +")",
                total_big_wires :  +_big,
                total_small_wires :  +_small
            });
        });
    });
    
    var chart = am4core.create("chartWireSummaryAll", am4charts.XYChart);
    chart.data = _data;
    chart.colors.step = 2;
    chart.padding(30, 30, 10, 30);

    var title = chart.titles.create();
    title.text =  "Usage per Model year";
    title.fontSize = 12;
    title.fontWeight = 800;
    title.marginBottom = 10;
    
    chart.legend = new am4charts.Legend();
    chart.legend.itemContainers.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;
    chart.numberFormatter.numberFormat = "#";
    
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "category";
    //categoryAxis.title.text = "Wire Category";
    //categoryAxis.title.fontWeight = 800;
    categoryAxis.renderer.minGridDistance = 60;
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.interactionsEnabled = false;
    categoryAxis.renderer.labels.template.adapter.add("textOutput", function(text) {
        return (typeof(text)!=="undefined" ? text.replace(/\(.*/, "") : text);
    });
    
    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    valueAxis.max = 100;
    valueAxis.strictMinMax = true;
    valueAxis.calculateTotals = true;
    
    valueAxis.renderer.minGridDistance = 20;
    valueAxis.renderer.minWidth = 35;
    valueAxis.renderer.labels.template.adapter.add("text", function(text) {
      return text + "%";
    });
    
    var series1 = chart.series.push(new am4charts.ColumnSeries());
    series1.columns.template.tooltipText = "{name}: {valueY.totalPercent.formatNumber('#.00')}% - [bold]{valueY.formatNumber('#,###')}[/]";
    series1.columns.template.column.strokeOpacity = 1;
    series1.name = "% of Below 0.50";
    series1.dataFields.categoryX = "category";
    series1.dataFields.valueY = "total_small_wires";
    series1.dataFields.valueYShow = "totalPercent";
    series1.dataItems.template.locations.categoryX = 0.5;
    series1.stacked = true;
    series1.tooltip.pointerOrientation = "vertical";
    series1.tooltip.dy = - 20;
    
    var bullet1 = series1.bullets.push(new am4charts.LabelBullet());
    bullet1.label.text = "{valueY.totalPercent.formatNumber('#.00')}%";
    bullet1.locationY = 0.5;
    bullet1.label.fill = am4core.color("#ffffff");
    bullet1.interactionsEnabled = false;
    
    var series2 = chart.series.push(series1.clone());
    series2.name = "% of Above 0.50";
    series2.dataFields.valueY = "total_big_wires";
    series2.fill = chart.colors.next();
    series2.stroke = series2.fill;
    
    setLegendSize(chart);
    //setTrendResult(_data);
    
    var createLabel = function(category, endCategory, label) {
        var range = categoryAxis.axisRanges.create();
        range.category = category;
        range.endCategory = endCategory;
        range.label.dataItem.text = label;
        range.label.dy = 15;
        range.label.fontWeight = "bold";
        range.axisFill.fill = am4core.color("#396478");
        range.axisFill.fillOpacity = 0.1;
        range.locations.category = 0.1;
        range.locations.endCategory = 0.9;
    };
    
    $.each(gRegionNames, function(i, r) { 
        var _region = "("+ r.name +")";

        createLabel(gMYFrom + _region, gMYTo + _region, r.name);
    });
    
    if(callback) callback();
}

function displayWireSummaryByMYBar(callback){
    var _data = gByModelYear;
    var chart = am4core.create("chartWireSummaryByMY", am4charts.XYChart);
    chart.data = _data;
    chart.colors.step = 2;
    chart.padding(30, 30, 10, 30);

    var title = chart.titles.create();
    title.text =  "Usage per Model year";
    title.fontSize = 12;
    title.fontWeight = 800;
    title.marginBottom = 10;
    
    chart.legend = new am4charts.Legend();
    chart.legend.itemContainers.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;
    chart.numberFormatter.numberFormat = "#";
    
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "MODEL_YEAR";
    //categoryAxis.title.text = "Wire Category";
    //categoryAxis.title.fontWeight = 800;
    categoryAxis.renderer.minGridDistance = 60;
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.interactionsEnabled = false;
    
    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    valueAxis.max = 100;
    valueAxis.strictMinMax = true;
    valueAxis.calculateTotals = true;
    
    valueAxis.renderer.minGridDistance = 20;
    valueAxis.renderer.minWidth = 35;
    valueAxis.renderer.labels.template.adapter.add("text", function(text) {
      return text + "%";
    });
    
    var series1 = chart.series.push(new am4charts.ColumnSeries());
    series1.columns.template.tooltipText = "{name}: {valueY.totalPercent.formatNumber('#.00')}% - [bold]{valueY.formatNumber('#,###')}[/]";
    series1.columns.template.column.strokeOpacity = 1;
    series1.name = "% of Below 0.50";
    series1.dataFields.categoryX = "MODEL_YEAR";
    series1.dataFields.valueY = "total_small_wires";
    series1.dataFields.valueYShow = "totalPercent";
    series1.dataItems.template.locations.categoryX = 0.5;
    series1.stacked = true;
    series1.tooltip.pointerOrientation = "vertical";
    series1.tooltip.dy = - 20;
    
    var bullet1 = series1.bullets.push(new am4charts.LabelBullet());
    bullet1.label.text = "{valueY.totalPercent.formatNumber('#.00')}%";
    bullet1.locationY = 0.5;
    bullet1.label.fill = am4core.color("#ffffff");
    bullet1.interactionsEnabled = false;
    
    var series2 = chart.series.push(series1.clone());
    series2.name = "% of Above 0.50";
    series2.dataFields.valueY = "total_big_wires";
    series2.fill = chart.colors.next();
    series2.stroke = series2.fill;
    
    setLegendSize(chart);
    setTrendResult(_data);
    
    if(callback) callback();
}

function displayWireSummaryByMYPie(callback){
    gByModelYear.forEach(function(o){
        var _result = [];
        var _year = o.MODEL_YEAR;
        var _div = "chartWireSummaryByMY_" + _year;
        var _tw = new zsi.easyJsTemplateWriter("#chartWireSummaryByMY")
                .chartCard({ id: _div, title: _year, class:"w-100", header:"text-dark d-none" });
    
        _result.push({
            wire_size: "% of Below 0.50",
            total: o.total_small_wires
        }); 
        
        _result.push({
            wire_size: "% of Above 0.50",
            total:  o.total_big_wires
        });
        
        var chart = am4core.create(_div, am4charts.PieChart3D);
        chart.data = _result;
        
        var title = chart.titles.create();
        title.text =  _year;
        //title.fontSize = 12;
        title.fontWeight = 800;
        title.marginBottom = 0;
    
        var series = chart.series.push(new am4charts.PieSeries());
        series.dataFields.value = "total";
        series.dataFields.category = "wire_size";
        
        series.labels.template.disabled = true;
        series.ticks.template.disabled = true;
        
        // this creates initial animation
        series.hiddenState.properties.opacity = 1;
        series.hiddenState.properties.endAngle = -90;
        series.hiddenState.properties.startAngle = -90;
        
        chart.legend = new am4charts.Legend();
        chart.legend.position = "right";
        
        setLegendSize(chart);
    });
    
    setTrendResult(gByModelYear);
    
    if(callback) callback();
}

function displayWireSummaryByRegionBar(callback){
    var data = gByRegion;
    var chart = am4core.create("chartWireSummaryByRegion", am4charts.XYChart);
    chart.data = data;
    chart.colors.step = 2;
    chart.padding(30, 30, 10, 30);

    var title = chart.titles.create();
    title.text =  "Usage per Region";
    title.fontSize = 12;
    title.fontWeight = 800;
    title.marginBottom = 10;
    
    chart.legend = new am4charts.Legend();
    chart.legend.itemContainers.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;
    chart.numberFormatter.numberFormat = "#";
    
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "REGION_NAME";
    categoryAxis.renderer.minGridDistance = 60;
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.interactionsEnabled = false;
    
    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    valueAxis.max = 100;
    valueAxis.strictMinMax = true;
    valueAxis.calculateTotals = true;
    
    valueAxis.renderer.minGridDistance = 20;
    valueAxis.renderer.minWidth = 35;
    valueAxis.renderer.labels.template.adapter.add("text", function(text) {
      return text + "%";
    });
    
    var series1 = chart.series.push(new am4charts.ColumnSeries());
    series1.columns.template.tooltipText = "{name}: {valueY.totalPercent.formatNumber('#.00')}% - [bold]{valueY.formatNumber('#,###')}[/]";
    series1.columns.template.column.strokeOpacity = 1;
    series1.name = "% of Below 0.50";
    series1.dataFields.categoryX = "REGION_NAME";
    series1.dataFields.valueY = "total_small_wires";
    series1.dataFields.valueYShow = "totalPercent";
    series1.dataItems.template.locations.categoryX = 0.5;
    series1.stacked = true;
    series1.tooltip.pointerOrientation = "vertical";
    series1.tooltip.dy = - 20;
    
    var bullet1 = series1.bullets.push(new am4charts.LabelBullet());
    bullet1.label.text = "{valueY.totalPercent.formatNumber('#.00')}%";
    bullet1.locationY = 0.5;
    bullet1.label.fill = am4core.color("#ffffff");
    bullet1.interactionsEnabled = false;
    
    var series2 = chart.series.push(series1.clone());
    series2.name = "% of Above 0.50";
    series2.dataFields.valueY = "total_big_wires";
    series2.fill = chart.colors.next();
    series2.stroke = series2.fill;
    
    setLegendSize(chart);
    
    if(callback) callback();  
}

function displayWireSummaryByRegionPie(callback){
    gByRegion.forEach(function(o){
        var _result = [];
        var _region = o.REGION_NAME;
        var _regionId = _region.split(" ").join("_");
        var _div = "chartWireSummaryByRegion_" + _regionId;
        var _tw = new zsi.easyJsTemplateWriter("#chartWireSummaryByRegion")
            .chartCard({ id: _div, title: _region, class:"w-100", header:"text-dark d-none" });
    
        _result.push({
            wire_size: "% of Below 0.50",
            total: o.total_small_wires
        }); 
        
        _result.push({
            wire_size: "% of Above 0.50",
            total:  o.total_big_wires
        });
        
        var chart = am4core.create(_div, am4charts.PieChart3D);
        chart.data = _result;
        
        var title = chart.titles.create();
        title.text =  _region;
        //title.fontSize = 12;
        title.fontWeight = 800;
        title.marginBottom = 0;
    
        var series = chart.series.push(new am4charts.PieSeries());
        series.dataFields.value = "total";
        series.dataFields.category = "wire_size";
        
        series.labels.template.disabled = true;
        series.ticks.template.disabled = true;
        
        // this creates initial animation
        series.hiddenState.properties.opacity = 1;
        series.hiddenState.properties.endAngle = -90;
        series.hiddenState.properties.startAngle = -90;
        
        chart.legend = new am4charts.Legend();
        chart.legend.position = "right";
        
        setLegendSize(chart);
    });
    
    if(callback) callback();
}

function displayWireSummaryEachMYBar(callback){
    gByModelYear.forEach(function(o){
        var result = [];
        var year = o.MODEL_YEAR;
        var divID = "chartWireSummaryEachMY_"+ year;
        var _tw = new zsi.easyJsTemplateWriter("#chartWireSummaryEachMY")
            .chartCard({ id: divID, title: year, class:"w-100 chart-div", header:"text-dark" });
        
        var res = gAll.filter(function (item) {
        	return item.MODEL_YEAR == year;
        });
      
        gByRegion.forEach(function(i){
            var jsonData = {};
            var region = i.REGION_NAME;
            var regionName = region.split(' ').join('_');
            var res2= res.filter(function (item) {
        	    return item.REGION_NAME == region;
            });
           
            jsonData.model_year = year;
            jsonData.region_name = region;
            
            if( res2.length > 0 ){
                jsonData.total_big_wires = res2[0].total_big_wires;
                jsonData.total_small_wires = res2[0].total_small_wires;
            }else{
                jsonData.total_big_wires = 0;
                jsonData.total_small_wires = 0;
            }

            result.push(jsonData);
        });

        var chart = am4core.create(divID, am4charts.XYChart);
        chart.data = result;
      
        chart.colors.step = 2;
        chart.padding(30, 30, 10, 30);
        
        chart.legend = new am4charts.Legend();
        chart.legend.itemContainers.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;
        chart.numberFormatter.numberFormat = "#";
        
        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "region_name";
        //categoryAxis.title.text = "Wire Category";
        //categoryAxis.title.fontWeight = 800;
        categoryAxis.renderer.minGridDistance = 60;
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.interactionsEnabled = false;
        
        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.min = 0;
        valueAxis.max = 100;
        valueAxis.strictMinMax = true;
        valueAxis.calculateTotals = true;
        
        valueAxis.renderer.minGridDistance = 20;
        valueAxis.renderer.minWidth = 35;
        valueAxis.renderer.labels.template.adapter.add("text", function(text) {
          return text + "%";
        });
        
        var series1 = chart.series.push(new am4charts.ColumnSeries());
        series1.columns.template.tooltipText = "{name}: {valueY.totalPercent.formatNumber('#.00')}% - [bold]{valueY.formatNumber('#,###')}[/]";
        series1.columns.template.column.strokeOpacity = 1;
        series1.name = "% of Below 0.50";
        series1.dataFields.categoryX = "region_name";
        series1.dataFields.valueY = "total_small_wires";
        series1.dataFields.valueYShow = "totalPercent";
        series1.dataItems.template.locations.categoryX = 0.5;
        series1.stacked = true;
        series1.tooltip.pointerOrientation = "vertical";
        series1.tooltip.dy = - 20;
        
        var bullet1 = series1.bullets.push(new am4charts.LabelBullet());
        bullet1.label.text = "{valueY.totalPercent.formatNumber('#.00')}%";
        bullet1.locationY = 0.5;
        bullet1.label.fill = am4core.color("#ffffff");
        bullet1.interactionsEnabled = false;
        
        
        var series2 = chart.series.push(series1.clone());
        series2.name = "% of Above 0.50";
        series2.dataFields.valueY = "total_big_wires";
        series2.fill = chart.colors.next();
        series2.stroke = series2.fill;
        
        setLegendSize(chart);
    });
    
    if(callback) callback();  
}

function displayWireSummaryEachMYPie(callback){
    gByModelYear.forEach(function(o){
        
        var year = o.MODEL_YEAR;
        var divParent = "chartWireSummaryEachMY_" + year;
        var _tw = new zsi.easyJsTemplateWriter("#chartWireSummaryEachMY")
                .chartCard({ id: divParent, title: year, class:"w-100", header:"text-dark" });
        
        gByRegion.forEach(function(i){
            var result = [];
            var region = i.REGION_NAME;
            var regionId = region.split(' ').join('_');
             var divChild = divParent + "_" + regionId;
            
            _tw = new zsi.easyJsTemplateWriter("#" + divParent)
                .div({ class: "col-6"})
                .in()
                    .chartCard({ id: divChild, title: region, class:"w-100", header:"d-none" });
            
            var res = gAll.filter(function (item) {
            	return item.MODEL_YEAR == year && item.REGION_NAME == region;
            });
            
            var total_big_wires = 0;
            var total_small_wires = 0;
            
            if( res.length > 0 ) {
                total_big_wires = res[0].total_big_wires;
                total_small_wires = res[0].total_small_wires;
            }
            
            result.push({
                wire_size: "% of Below 0.50",
                total: total_small_wires
            }); 
            
            result.push({
                wire_size: "% of Above 0.50",
                total: total_big_wires
            });
            
            var chart = am4core.create(divChild, am4charts.PieChart3D);
            chart.data = result;
            
            var title = chart.titles.create();
            title.text =  region;
            //title.fontSize = 12;
            title.fontWeight = 800;
            title.marginBottom = 0;
        
            var series = chart.series.push(new am4charts.PieSeries());
            series.dataFields.value = "total";
            series.dataFields.category = "wire_size";
            
            series.labels.template.disabled = true;
            series.ticks.template.disabled = true;
            
            // this creates initial animation
            series.hiddenState.properties.opacity = 1;
            series.hiddenState.properties.endAngle = -90;
            series.hiddenState.properties.startAngle = -90;
            
            chart.legend = new am4charts.Legend();
            chart.legend.position = "right";
            
            setLegendSize(chart);
        });
    });
    
    if(callback) callback();  
}

function displayWireSummaryEachRegionBar(callback){
    gByRegion.forEach(function(o){
        var result = [];
        var region = o.REGION_NAME;
        var regionName = region.split(' ').join('_');
        var divID = "chartWireSummaryEachRegion_"+ regionName;
        var _tw = new zsi.easyJsTemplateWriter("#chartWireSummaryEachRegion")
            .chartCard({ id: divID, title: region, class:"w-100 chart-div", header:"text-dark" });
        
        var res = gAll.filter(function (item) {
        	return item.REGION_NAME == region;
        });
      
        gByModelYear.forEach(function(i){
            var jsonData = {};
            var year = i.MODEL_YEAR;
            var res2= res.filter(function (item) {
        	    return item.MODEL_YEAR == year;
            });
           
            jsonData.model_year = year;
            jsonData.region_name = region;
            
            if( res2.length > 0 ){
                jsonData.total_big_wires = res2[0].total_big_wires;
                jsonData.total_small_wires = res2[0].total_small_wires;
            }else{
                jsonData.total_big_wires = 0;
                jsonData.total_small_wires = 0;
            }

            result.push(jsonData);
        });

        var chart = am4core.create(divID, am4charts.XYChart);
        chart.data = result;
      
        chart.colors.step = 2;
        chart.padding(30, 30, 10, 30);
        
        chart.legend = new am4charts.Legend();
        chart.legend.itemContainers.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;
        chart.numberFormatter.numberFormat = "#";
        
        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "model_year";
        //categoryAxis.title.text = "Wire Category";
        //categoryAxis.title.fontWeight = 800;
        categoryAxis.renderer.minGridDistance = 60;
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.interactionsEnabled = false;
        
        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.min = 0;
        valueAxis.max = 100;
        valueAxis.strictMinMax = true;
        valueAxis.calculateTotals = true;
        
        valueAxis.renderer.minGridDistance = 20;
        valueAxis.renderer.minWidth = 35;
        valueAxis.renderer.labels.template.adapter.add("text", function(text) {
          return text + "%";
        });
        
        var series1 = chart.series.push(new am4charts.ColumnSeries());
        series1.columns.template.tooltipText = "{name}: {valueY.totalPercent.formatNumber('#.00')}% - [bold]{valueY.formatNumber('#,###')}[/]";
        series1.columns.template.column.strokeOpacity = 1;
        series1.name = "% of Below 0.50";
        series1.dataFields.categoryX = "model_year";
        series1.dataFields.valueY = "total_small_wires";
        series1.dataFields.valueYShow = "totalPercent";
        series1.dataItems.template.locations.categoryX = 0.5;
        series1.stacked = true;
        series1.tooltip.pointerOrientation = "vertical";
        series1.tooltip.dy = - 20;
        
        var bullet1 = series1.bullets.push(new am4charts.LabelBullet());
        bullet1.label.text = "{valueY.totalPercent.formatNumber('#.00')}%";
        bullet1.locationY = 0.5;
        bullet1.label.fill = am4core.color("#ffffff");
        bullet1.interactionsEnabled = false;
        
        
        var series2 = chart.series.push(series1.clone());
        series2.name = "% of Above 0.50";
        series2.dataFields.valueY = "total_big_wires";
        series2.fill = chart.colors.next();
        series2.stroke = series2.fill;
        
        setLegendSize(chart);
    });
    
    if(callback) callback();  
}

function displayWireSummaryEachRegionPie(callback){
    gByRegion.forEach(function(o){
        var region = o.REGION_NAME;
        var regionId = region.split(' ').join('_');
        var divParent = "chartWireSummaryEachRegion_" + regionId;
        var _tw = new zsi.easyJsTemplateWriter("#chartWireSummaryEachRegion")
            .chartCard({ id: divParent, title: region, class:"w-100", header:"text-dark" });
        
        gByModelYear.forEach(function(i){
            var result = [];
            var year = i.MODEL_YEAR;
            var divChild = divParent + "_" + year;
            
            _tw = new zsi.easyJsTemplateWriter("#" + divParent)
                .div({ class: "col-6"})
                .in()
                    .chartCard({ id: divChild, title: year, class:"w-100", header:"d-none" });
            
            var res = gAll.filter(function (item) {
            	return item.MODEL_YEAR == year && item.REGION_NAME == region;
            });
            
            var total_big_wires = 0;
            var total_small_wires = 0;
            
            if( res.length > 0 ) {
                total_big_wires = res[0].total_big_wires;
                total_small_wires = res[0].total_small_wires;
            }
            
            result.push({
                wire_size: "% of Below 0.50",
                total: total_small_wires
            }); 
            
            result.push({
                wire_size: "% of Above 0.50",
                total: total_big_wires
            });
            
            var chart = am4core.create(divChild, am4charts.PieChart3D);
            chart.data = result;
            
            var title = chart.titles.create();
            title.text =  year;
            //title.fontSize = 12;
            title.fontWeight = 800;
            title.marginBottom = 0;
        
            var series = chart.series.push(new am4charts.PieSeries());
            series.dataFields.value = "total";
            series.dataFields.category = "wire_size";
            
            series.labels.template.disabled = true;
            series.ticks.template.disabled = true;
            
            // this creates initial animation
            series.hiddenState.properties.opacity = 1;
            series.hiddenState.properties.endAngle = -90;
            series.hiddenState.properties.startAngle = -90;
            
            chart.legend = new am4charts.Legend();
            chart.legend.position = "right";
            
            setLegendSize(chart);
        });
    });
    
    if(callback) callback();  
}

// ---------------------- Small Wires: report_type_id(1) --------------------------//

function displaySWAll(callback){
    var _result = [];
    $.each(gAll.groupBy(["REGION_NAME"]), function(i,v) { 
        var _obj = {};
            _obj.category = v.name;

        gByModelYear.forEach(function(x) {
            var _my = x.MODEL_YEAR;
            var _cat = 0; //Small Wires
            
            var res = v.items.filter(function (item) {
            	return item.MODEL_YEAR == _my;
            });
            
            if( res.length > 0 ) {
                _cat = res[0].total_small_wires;
            }
            
            _obj["cat_" + _my] =  +_cat ;
        });
        
        _result.push(_obj);
    });

    var chart = am4core.create("chartSWAllBar", am4charts.XYChart);
    chart.data = _result;
    chart.maskBullets = false;
    //chart.colors.step = 3;

    // Create axes
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "category";
    categoryAxis.numberFormatter.numberFormat = "#";
    //categoryAxis.title.text = "Wire 0.50 and Below";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 20;
    categoryAxis.renderer.cellStartLocation = 0.1;
    categoryAxis.renderer.cellEndLocation = 0.9;
    categoryAxis.renderer.labels.template.fontWeight = "bold";
    categoryAxis.renderer.labels.template.dy = 15;
    
    var  valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = "Count";
    
    // Create series
    var createSeries = function(field, name) {
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.valueY = field;
        series.dataFields.categoryX = "category";
        series.name = name;
        series.tooltipText = "[bold]{name}:[/] {valueY.formatNumber('#,###')}";
        
        // var bullet = series.bullets.push(new am4charts.LabelBullet());
        // bullet.label.text = "{valueY.formatNumber('#,###')}";
        // bullet.locationY = 0.5;
        // bullet.label.fill = am4core.color("#ffffff");
        // bullet.interactionsEnabled = false;
        
        var bullet2 = series.bullets.push(new am4charts.LabelBullet());
        bullet2.label.text = name;
        bullet2.label.truncate = false;
        bullet2.label.hideOversized = false;
        bullet2.label.verticalCenter = "bottom";
        bullet2.label.dy = 18;
        bullet2.locationY = 1;
     }

    gByModelYear.forEach(function(x) {
        var _name = x.MODEL_YEAR;
        var _field = "cat_"+ _name;
        
        createSeries(_field, _name);
    });
    
    // Add cursor
    chart.cursor = new am4charts.XYCursor();
    
    // Add legend
    chart.legend = new am4charts.Legend();
    
    setLegendSize(chart);
    
    if(callback) callback();
}

function displaySWByModelYearPie(callback){
    var chart = am4core.create("chartSWByMY", am4charts.PieChart3D);
    chart.data = gByModelYear;
    chart.numberFormatter.numberFormat = "#";
    
    var series = chart.series.push(new am4charts.PieSeries());
    series.dataFields.value = "total_small_wires"; //"small_wire_count";
    series.dataFields.category = "MODEL_YEAR";
    
    // this creates initial animation
    series.hiddenState.properties.opacity = 1;
    series.hiddenState.properties.endAngle = -90;
    series.hiddenState.properties.startAngle = -90;
    
    chart.legend = new am4charts.Legend();
    setLegendSize(chart);
    
    if(callback) callback();
}

function displaySWByModelYearBar(callback){
    var chart = am4core.create("chartSWByMY", am4charts.XYChart);
    chart.data = gByModelYear;

    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.dataFields.category = "MODEL_YEAR";
    categoryAxis.renderer.minGridDistance = 60;
    categoryAxis.title.text = "Usage per Model Year";
    categoryAxis.numberFormatter.numberFormat = "#";
    
    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    
    var series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.categoryX = "MODEL_YEAR";
    series.dataFields.valueY = "total_small_wires"; //small_wire_count
    series.tooltipText = "{valueY.value.formatNumber('#,###')}"
    series.columns.template.strokeOpacity = 0;
    
    chart.cursor = new am4charts.XYCursor();

    // as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
    series.columns.template.adapter.add("fill", function (fill, target) {
    	return chart.colors.getIndex(target.dataItem.index);
    });
    
    if(callback) callback();
}

function displaySWByRegionPie(callback){
    var chart = am4core.create("chartSWByRegion", am4charts.PieChart3D);
    chart.data = gByRegion;
    
    var series = chart.series.push(new am4charts.PieSeries());
    series.dataFields.value = "total_small_wires"; //"small_wire_count";
    series.dataFields.category = "REGION_NAME";
    
    // this creates initial animation
    series.hiddenState.properties.opacity = 1;
    series.hiddenState.properties.endAngle = -90;
    series.hiddenState.properties.startAngle = -90;
    
    chart.legend = new am4charts.Legend();
    
    setLegendSize(chart);
    
    if(callback) callback();
}

function displaySWByRegionBar(callback){
    var chart = am4core.create("chartSWByRegion", am4charts.XYChart);
    chart.data = gByRegion;

    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.dataFields.category = "REGION_NAME";
    categoryAxis.renderer.minGridDistance = 60;
    categoryAxis.title.text = "Usage per Region";
    categoryAxis.numberFormatter.numberFormat = "#";
    
    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    
    var series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.categoryX = "REGION_NAME";
    series.dataFields.valueY = "total_small_wires";
    series.tooltipText = "{valueY.value.formatNumber('#,###')}"
    series.columns.template.strokeOpacity = 0;
    
    chart.cursor = new am4charts.XYCursor();

    // as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
    series.columns.template.adapter.add("fill", function (fill, target) {
    	return chart.colors.getIndex(target.dataItem.index);
    });
    
    if(callback) callback();
}
 
// function displaySWAll(callback){
//     var _result = [];
//     $.each(gByModelYear.groupBy(["MODEL_YEAR"]), function(i,v) {
//         var year = v.name;
//         var jsonData = {};
//             jsonData.year = year.toString();
            
//         var res = gAll.filter(function (item) {
//         	return item.MODEL_YEAR == year;
//         });
        
//         $.each(gByRegion.groupBy(["REGION_NAME"]), function(i,v) {
//             var res2 = res.filter(function (item) {
//             	return item.REGION_NAME ==  v.name;
//             });

//             if( res2.length > 0 ){
//                 jsonData["region" + i] = res2[0].total_small_wires;
//             }else{
//                 jsonData["region" + i] = 0;
//             }
//         });
//         _result.push(jsonData);
//     });
    
//     var _tw = new zsi.easyJsTemplateWriter("#footerSWAll")
//             .chartCardWrapper({ id:"chartSWAll", title:"Overall" });
            
//      // Create chart instance
//     var chart = am4core.create("chartSWAll", am4charts.XYChart);
//     chart.data = _result;

//     // Create axes
//     var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
//     categoryAxis.dataFields.category = "year";
//     categoryAxis.numberFormatter.numberFormat = "#";
//     categoryAxis.title.text = "Region";
//     categoryAxis.renderer.grid.template.location = 0;
//     categoryAxis.renderer.minGridDistance = 20;
    
//     var  valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
//     valueAxis.title.text = "Count";
    
//     // Create series
//     function createSeries(field, name) {
//         var series = chart.series.push(new am4charts.ColumnSeries());
//         series.dataFields.valueY = field;
//         series.dataFields.categoryX = "year";
//         series.name = name;
//         series.columns.template.tooltipText = "{name}: [bold]{valueY.formatNumber('#,###')}[/]";
//         series.tooltip.pointerOrientation = "vertical";
        
//         var valueLabel = series.bullets.push(new am4charts.LabelBullet());
//           valueLabel.label.text = "{valueX.formatNumber('#,###')}";
//           valueLabel.label.verticalCenter = "bottom";
//           //valueLabel.label.horizontalCenter = "bottom";
//           //valueLabel.label.dx = 10;
//           //valueLabel.label.hideOversized = false;
//           //valueLabel.label.truncate = false;
        
//           var categoryLabel = series.bullets.push(new am4charts.LabelBullet());
//           categoryLabel.label.text = "{name}";
//           categoryLabel.label.verticalCenter = "bottom";
//           //categoryLabel.label.horizontalCenter = "bottom";
//           //categoryLabel.label.dx = -10;
//           categoryLabel.label.fill = am4core.color("#fff");
//           //categoryLabel.label.hideOversized = false;
//           //categoryLabel.label.truncate = false;
//      }

//     $.each(gByRegion.groupBy(["REGION_NAME"]), function(i,v) { 
//         createSeries("region" + i, v.name);
//     });

//     chart.legend = new am4charts.Legend();

//     setLegendSize(chart);
    
//     if(callback) callback();
// }

function displaySWEachModelYearPie(callback){
    gByModelYear.forEach(function(o){
        var result = [];
        var _year = o.MODEL_YEAR;
        var _divID = "chartSWEachMY_"+ _year;
        var _tw = new zsi.easyJsTemplateWriter("#chartSWEachMY")
            .chartCard({ id: _divID, title: _year, class:"w-100", header:"text-dark" });
    
        var res = gAll.filter(function (item) {
        	return item.MODEL_YEAR == _year;
        });

        gByRegion.forEach(function(i){
            var jsonData = {};
            var res2= res.filter(function (item) {
        	    return item.REGION_NAME == i.REGION_NAME;
            });
           
            jsonData.model_year = _year;
            jsonData.region_name = i.REGION_NAME;
            
            if( res2.length > 0 ){
                jsonData.small_wire_count = res2[0].total_small_wires;
            }else{
                jsonData.small_wire_count = 0;
            }

            result.push(jsonData);
        });
        
        var chart = am4core.create(_divID, am4charts.PieChart3D);
        chart.data = result;

        var series = chart.series.push(new am4charts.PieSeries());
        series.dataFields.value = "small_wire_count";
        series.dataFields.category = "region_name";
        
        series.labels.template.disabled = true;
        series.ticks.template.disabled = true;
        series.fill = am4core.color("white");
        
        // this creates initial animation
        series.hiddenState.properties.opacity = 1;
        series.hiddenState.properties.endAngle = -90;
        series.hiddenState.properties.startAngle = -90;
        
        chart.legend = new am4charts.Legend();
        chart.legend.position = "right";
        
        setLegendSize(chart);
    });
    
    if(callback) callback();
}

function displaySWEachRegionPie(callback){
    gByRegion.forEach(function(o){
        var result = [];
        var regionName = o.REGION_NAME.split(' ').join('_');
        var divID = "chartSWEachRegion_"+ regionName;
        var _tw = new zsi.easyJsTemplateWriter("#chartSWEachRegion")
            .chartCard({ id: divID, title: o.REGION_NAME, class:"w-100", header:"text-dark", style:"" });
        
        var res = gAll.filter(function (item) {
        	return item.REGION_NAME == o.REGION_NAME;
        });
        
        gByModelYear.forEach(function(i){
            var jsonData = {};
            var res2= res.filter(function (item) {
        	    return item.MODEL_YEAR == i.MODEL_YEAR;
            });
           
            jsonData.model_year = i.MODEL_YEAR;
            jsonData.region_name = o.REGION_NAME;
            
            if( res2.length > 0 ){
                jsonData.small_wire_count = res2[0].total_small_wires;
            }else{
                jsonData.small_wire_count = 0;
            }

            result.push(jsonData);
        });
      
        var chart = am4core.create(divID, am4charts.PieChart3D);
        chart.data = result;
        chart.numberFormatter.numberFormat = "#.";

        var series = chart.series.push(new am4charts.PieSeries());
        series.dataFields.value = "small_wire_count";
        series.dataFields.category = "model_year";
        
        series.labels.template.disabled = true;
        series.ticks.template.disabled = true;
        
        // this creates initial animation
        series.hiddenState.properties.opacity = 1;
        series.hiddenState.properties.endAngle = -90;
        series.hiddenState.properties.startAngle = -90;
        
        chart.legend = new am4charts.Legend();
        chart.legend.position = "right";
        
        setLegendSize(chart);
    });
    
    if(callback) callback();
}

function displaySWEachModelYearBar(callback){
    gByModelYear.forEach(function(o){
        var _result = [];
        var _year = o.MODEL_YEAR;
        var _divID = "chartSWEachMY_"+ _year;
        var _tw = new zsi.easyJsTemplateWriter("#chartSWEachMY")
            .chartCard({ id: _divID, title: _year, class:"w-100", header:"text-dark" });
    
        var res = gAll.filter(function (item) {
        	return item.MODEL_YEAR == _year;
        });

        gByRegion.forEach(function(i){
            var jsonData = {};
            var res2= res.filter(function (item) {
        	    return item.REGION_NAME == i.REGION_NAME;
            });
           
            jsonData.model_year = _year;
            jsonData.region_name = i.REGION_NAME;
            
            if( res2.length > 0 ){
                jsonData.small_wire_count = res2[0].total_small_wires;
            }else{
                jsonData.small_wire_count = 0;
            }

            _result.push(jsonData);
        });

        var chart = am4core.create(_divID, am4charts.XYChart);
        chart.data = _result;

        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.dataFields.category = "region_name";
        categoryAxis.renderer.minGridDistance = 60;
        //categoryAxis.title.text = "Wire Guages";
        
        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.categoryX = "region_name";
        series.dataFields.valueY = "small_wire_count";
        series.tooltipText = "{valueY.value}"
        series.columns.template.strokeOpacity = 0;
        
        chart.cursor = new am4charts.XYCursor();
        
        // as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
        series.columns.template.adapter.add("fill", function (fill, target) {
        	return chart.colors.getIndex(target.dataItem.index);
        });
    });
    
    if(callback) callback();
}

function displaySWEachRegionBar(callback){
    gByRegion.forEach(function(o){
        var _result = [];
        var regionName = o.REGION_NAME.split(' ').join('_');
        var _divID = "chartSWEachRegion_"+ regionName;
        var _tw = new zsi.easyJsTemplateWriter("#chartSWEachRegion")
            .chartCard({ id: _divID, title: o.REGION_NAME, class:"w-100", header:"text-dark", style:"" });
        
        var res = gAll.filter(function (item) {
        	return item.REGION_NAME == o.REGION_NAME;
        });
        
        gByModelYear.forEach(function(i){
            var jsonData = {};
            var res2= res.filter(function (item) {
        	    return item.MODEL_YEAR == i.MODEL_YEAR;
            });
           
            jsonData.model_year = i.MODEL_YEAR;
            jsonData.region_name = o.REGION_NAME;
            
            if( res2.length > 0 ){
                jsonData.small_wire_count = res2[0].total_small_wires;
            }else{
                jsonData.small_wire_count = 0;
            }

            _result.push(jsonData);
        });

        var chart = am4core.create(_divID, am4charts.XYChart);
        chart.data = _result;

        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.dataFields.category = "model_year";
        categoryAxis.renderer.minGridDistance = 60;
        //categoryAxis.title.text = "Wire Guages";
        categoryAxis.numberFormatter.numberFormat = "#";
        
        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.categoryX = "model_year";
        series.dataFields.valueY = "small_wire_count";
        series.tooltipText = "{valueY.value.formatNumber('#,###')}"
        series.columns.template.strokeOpacity = 0;
        
        chart.cursor = new am4charts.XYCursor();
        
        // as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
        series.columns.template.adapter.add("fill", function (fill, target) {
        	return chart.colors.getIndex(target.dataItem.index);
        });
    });
    
    if(callback) callback();
}

// ---------------------- Small Wire Details: report_type_id(2) -------------------//

function displaySWDtlAll(callback){
    var _data = [];
    $.each(gAll.groupBy(["REGION_NAME"]), function(i,r) { 
        $.each(gModelYears, function(x, my) { 
            var _my = my.name;
            var _region = r.name;
            var _obj = {};
            _obj.year = +_my;
            _obj.region = _region;
            _obj.category = _my +"("+ _region +")";
            
            $.each(gAll.groupBy(["wires"]), function(y, w) { 
                var _count = 0;
                var _wire = w.name;
                var _wireNew = _wire.replace(".","_");
                var _res = r.items.filter(function (item) {
                	return item.wires == _wire && item.MODEL_YEAR == _my;
                });
                
                if( _res.length > 0 ) {
                    _count = _res[0].total_small_wires;
                }
                _obj[_wireNew] =  +_count ;
            });
            _data.push(_obj);
        });
    });
    
    var chart = am4core.create("chartSWDtlAll", am4charts.XYChart);
    chart.data = _data;
    chart.maskBullets = false;
    
    // Create axes
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "category";
    categoryAxis.numberFormatter.numberFormat = "#";
    //categoryAxis.title.text = "Wire 0.50 and Below";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 20;
    categoryAxis.renderer.labels.template.adapter.add("textOutput", function(text) {
        return (typeof(text)!=="undefined" ? text.replace(/\(.*/, "") : text);
    });
    
    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = "Count";
    
    // Create series
    var createSeries = function(field, name, color) {
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.valueY = field;
        series.dataFields.categoryX = "category";
        series.name = name;
        //series.tooltip.disabled = true;
        series.tooltipText = "[bold]{name}:[/] {valueY.formatNumber('#,###')}";
        series.fill = color;

        // var bullet = series.bullets.push(new am4charts.LabelBullet());
        // bullet.label.text = "{valueY.formatNumber('#,###')}";
        // bullet.locationY = 0.5;
        // //bullet.label.fill = am4core.color("#ffffff");
        // bullet.interactionsEnabled = false;
        // bullet.label.truncate = false;
        // bullet.label.hideOversized = false;
        // bullet.label.dy = -20;
        // //bullet.locationY = 0;
        // bullet.label.verticalCenter = "bottom";
        // //bullet.rotation = 270;
        // //bullet.valign = "middle";
        
        // var bullet2 = series.bullets.push(new am4charts.LabelBullet());
        // bullet2.label.text = name;
        // bullet2.label.truncate = false;
        // bullet2.label.hideOversized = false;
        // bullet2.label.verticalCenter = "bottom";
        // bullet2.label.dy = 15;
        // bullet2.locationX = 0.5;
        // bullet2.locationY = 1;
        // bullet2.rotation = 270;
    };
     
    var createLabel = function(category, endCategory, label) {
        var range = categoryAxis.axisRanges.create();
        range.category = category;
        range.endCategory = endCategory;
        range.label.dataItem.text = label;
        range.label.dy = 18;
        range.label.fontWeight = "bold";
        range.axisFill.fill = am4core.color("#396478");
        range.axisFill.fillOpacity = 0.1;
        range.locations.category = 0.1;
        range.locations.endCategory = 0.9;
    };

    var colorSet = new am4core.ColorSet();
    $.each(gAll.groupBy(["wires"]), function(x, w) { 
        var _wire = w.name;
        var _wireNew = _wire.replace(".","_");
        var _field = _wireNew;
        
        createSeries(_field, _wire, colorSet.next());
    });  
    
    $.each(gRegionNames, function(i, r) { 
        var _region = "("+ r.name +")";

        createLabel(gMYFrom + _region, gMYTo + _region, r.name);
    });
    
    //Add cursor
    chart.cursor = new am4charts.XYCursor();
    
    //Add legend
    chart.legend = new am4charts.Legend();
    
    setLegendSize(chart);
    
    if(callback) callback();
}

function displaySWDtlByMY(callback){
    var _result = [];
    $.each(gByModelYear.groupBy(["MODEL_YEAR"]), function(i,v) { 
        var _modelYear = v.name;
        var _jsonData = {};
            _jsonData.model_year = _modelYear
        
        $.each(gAll.groupBy(["wires"]), function(i,v) {
            var wire = v.name;
            var wireNew = wire.replace(".","_");
            var res = gByModelYear.filter(function (item) {
            	return item.MODEL_YEAR == _modelYear && item.wires == wire;
            });
            
            if( res.length > 0 ) {
                _jsonData[wireNew] =  res[0].total_small_wires;
            }else{
                _jsonData[wireNew] = 0
            }
        });
        
        _result.push(_jsonData);
    });

    var chart = am4core.create("chartSWDtlByMY", am4charts.XYChart);
    chart.data = _result;
    //chart.colors.step = 3;
    
    // Create axes
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "model_year";
    categoryAxis.numberFormatter.numberFormat = "#";
    categoryAxis.title.text = "Wire Guages";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 20;
    
    var  valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = "Count";
    
    // Create series
    var createSeries = function(field, name) {
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.valueY = field;
        series.dataFields.categoryX = "model_year";
        series.name = name;
        series.tooltipText = "{name}: [bold]{valueY.formatNumber('#,###')}[/]";
     }

    $.each(gAll.groupBy(["wires"]), function(i,v) { 
        var _field = v.name.replace(".","_");
        var _name = v.name;
        
        createSeries(_field, _name);
    });
    
    // Add cursor
    chart.cursor = new am4charts.XYCursor();
    
    // Add legend
    chart.legend = new am4charts.Legend();
    
    setLegendSize(chart);
    
    var _trend = "";
    var lastObj = _result[_result.length - 1];
    $.each(lastObj, function(k, v){
        var _key = k.replace("_",".");
        if($.isNumeric( _key ) && v !== 0){
            _trend += _key + '<br>';
        }
    });
    
    var _tw = new zsi.easyJsTemplateWriter("#chartSWDtlByMY")
            .out().trendResult({ trend: _trend });
    
    if(callback) callback();
}
 
function displaySWDtlByRegion(callback){
    var _result = [];
    $.each(gByRegion.groupBy(["REGION_NAME"]), function(i,v) { 
        var _region = v.name;
        var _jsonData = {};
            _jsonData.region = _region
        
        $.each(gAll.groupBy(["wires"]), function(i,v) { 
            var wire = v.name;
            var wireNew = wire.replace(".","_");
            var res = gByRegion.filter(function (item) {
            	return item.REGION_NAME == _region && item.wires == wire;
            });
            
            if( res.length > 0 ) {
                _jsonData[wireNew] =  res[0].total_small_wires;
            }else{
                _jsonData[wireNew] = 0
            }
        });
        
        _result.push(_jsonData);
    });
    
    var chart = am4core.create("chartSWDtlByRegion", am4charts.XYChart);
    chart.data = _result;
    //chart.colors.step = 3;
    
    // Create axes
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "region";
    categoryAxis.title.text = "Wire Guages";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 20;
    
    var  valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = "Count";
    
    // Create series
    var createSeries = function(field, name) {
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.valueY = field;
        series.dataFields.categoryX = "region";
        series.name = name;
        series.tooltipText = "{name}: [bold]{valueY}[/]";
     }

    $.each(gAll.groupBy(["wires"]), function(i,v) { 
        var _field = v.name.replace(".","_");
        var _name = v.name;
        
        createSeries(_field, _name);
    });
    
    // Add cursor
    chart.cursor = new am4charts.XYCursor();
    
    // Add legend
    chart.legend = new am4charts.Legend();
    
    setLegendSize(chart);
    
    var _trend = "";
    var _lastObj = _result[_result.length - 1];
    $.each(_lastObj, function(k, v){
        var _key = k.replace("_",".");
        if($.isNumeric( _key ) && v !== 0){
            _trend += _key + '<br>';
        }
    });
    
    var _tw = new zsi.easyJsTemplateWriter("#chartSWDtlByRegion")
            .out().trendResult({ trend: _trend });
    
    if(callback) callback();
}

function displaySWDtlEachMYBar(callback){
    $.each(gByModelYear.groupBy(["MODEL_YEAR"]), function(i,v) { 
        var _result = [];
        var _modelYear = v.name;
        var _divID = "chartSWDtlEachMY_"+ _modelYear;
        var _tw = new zsi.easyJsTemplateWriter("#chartSWDtlEachMY")
            .chartCard({ id: _divID, title: _modelYear, class:"w-100", header:"text-dark"});
        
        $.each(gAll.groupBy(["wires"]), function(i,v) { 
            var _wireGuage = v.name;
            var _jsonData = {};
                _jsonData.model_year = _modelYear
                _jsonData.wire_guage = _wireGuage;
                
            var res = gByModelYear.filter(function (item) {
            	return item.MODEL_YEAR == _modelYear && item.wires == _wireGuage;
            });
            
            if( res.length > 0 ) {
                _jsonData.small_wire_count = res[0].total_small_wires;
            }else{
                _jsonData.small_wire_count = 0
            }
            
            _result.push(_jsonData);
        });

        var chart = am4core.create(_divID, am4charts.XYChart);
        chart.data = _result;
        //chart.padding(40, 40, 40, 40);

        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.dataFields.category = "wire_guage";
        categoryAxis.renderer.minGridDistance = 60;
        categoryAxis.title.text = "Wire Guages";
        
        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.categoryX = "wire_guage";
        series.dataFields.valueY = "small_wire_count";
        series.tooltipText = "{valueY.value}"
        series.columns.template.strokeOpacity = 0;
        
        chart.cursor = new am4charts.XYCursor();
        
        // as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
        series.columns.template.adapter.add("fill", function (fill, target) {
        	return chart.colors.getIndex(target.dataItem.index);
        });
    });
    
    if(callback) callback();
}

function displaySWDtlEachRegionBar(callback){
    $.each(gByRegion.groupBy(["REGION_NAME"]), function(i,v) { 
        var _result = [];
        var _region = v.name;
        var _regionNew = _region.split(' ').join('_');
        var _divID = "chartSWDtlEachRegion_"+ _regionNew;
        var _tw = new zsi.easyJsTemplateWriter("#chartSWDtlEachRegion")
            .chartCard({ id: _divID, title: _region, class:"w-100", header:"text-dark"});
        
        $.each(gAll.groupBy(["wires"]), function(i,v) { 
            var _wireGuage = v.name;
            var _jsonData = {};
                _jsonData.region = _region
                _jsonData.wire_guage = _wireGuage;
                
            var res = gByRegion.filter(function (item) {
            	return item.REGION_NAME == _region && item.wires == _wireGuage;
            });
            
            if( res.length > 0 ) {
                _jsonData.small_wire_count = res[0].total_small_wires;
            }else{
                _jsonData.small_wire_count = 0
            }
            
            _result.push(_jsonData);
        });

        var chart = am4core.create(_divID, am4charts.XYChart);
        chart.data = _result;
        //chart.padding(40, 40, 40, 40);

        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.dataFields.category = "wire_guage";
        categoryAxis.renderer.minGridDistance = 60;
        categoryAxis.title.text = "Wire Guages";
        
        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.categoryX = "wire_guage";
        series.dataFields.valueY = "small_wire_count";
        series.tooltipText = "{valueY.value}"
        series.columns.template.strokeOpacity = 0;
        
        chart.cursor = new am4charts.XYCursor();
        
        // as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
        series.columns.template.adapter.add("fill", function (fill, target) {
        	return chart.colors.getIndex(target.dataItem.index);
        });
    });
    
    if(callback) callback();
}

function displaySWDtlEachMYPie(callback){
    $.each(gByModelYear.groupBy(["MODEL_YEAR"]), function(i,v) { 
        var _result = [];
        var _modelYear = v.name;
        var _divID = "chartSWDtlEachMY_"+ _modelYear;
        var _tw = new zsi.easyJsTemplateWriter("#chartSWDtlEachMY")
            .chartCard({ id: _divID, title: _modelYear, class:"w-100", header:"text-dark"});
        
        $.each(gAll.groupBy(["wires"]), function(i,v) { 
            var _wireGuage = v.name;
            var _jsonData = {};
                _jsonData.model_year = _modelYear
                _jsonData.wire_guage = _wireGuage;
                
            var res = gByModelYear.filter(function (item) {
            	return item.MODEL_YEAR == _modelYear && item.wires == _wireGuage;
            });
            
            if( res.length > 0 ) {
                _jsonData.small_wire_count = res[0].total_small_wires;
            }else{
                _jsonData.small_wire_count = 0
            }
            
            _result.push(_jsonData);
        });

        var chart = am4core.create(_divID, am4charts.PieChart3D);
        chart.data = _result;

        var series = chart.series.push(new am4charts.PieSeries());
        series.dataFields.value = "small_wire_count";
        series.dataFields.category = "wire_guage";
        
        series.labels.template.disabled = true;
        series.ticks.template.disabled = true;
        
        // this creates initial animation
        series.hiddenState.properties.opacity = 1;
        series.hiddenState.properties.endAngle = -90;
        series.hiddenState.properties.startAngle = -90;
        
        chart.legend = new am4charts.Legend();
        //chart.legend.position = "right";
        
        setLegendSize(chart);
    });
    
    if(callback) callback();
}

function displaySWDtlEachRegionPie(callback){
    $.each(gByRegion.groupBy(["REGION_NAME"]), function(i,v) { 
        var _result = [];
        var _region = v.name;
        var _divID = "chartSWDtlEachRegion_"+ _region.split(' ').join('_');;
        var _tw = new zsi.easyJsTemplateWriter("#chartSWDtlEachRegion")
            .chartCard({ id: _divID, title: _region, class:"w-100", header:"text-dark"});
        
        $.each(gAll.groupBy(["wires"]), function(i,v) { 
            var _wireGuage = v.name;
            var _jsonData = {};
                _jsonData.region = _region
                _jsonData.wire_guage = _wireGuage;
                
            var res = gByRegion.filter(function (item) {
            	return item.REGION_NAME == _region && item.wires == _wireGuage;
            });
            
            if( res.length > 0 ) {
                _jsonData.small_wire_count = res[0].total_small_wires;
            }else{
                _jsonData.small_wire_count = 0
            }
            
            _result.push(_jsonData);
        });

        var chart = am4core.create(_divID, am4charts.PieChart3D);
        chart.data = _result;

        var series = chart.series.push(new am4charts.PieSeries());
        series.dataFields.value = "small_wire_count";
        series.dataFields.category = "wire_guage";

        series.labels.template.disabled = true;
        series.ticks.template.disabled = true;
        
        // this creates initial animation
        series.hiddenState.properties.opacity = 1;
        series.hiddenState.properties.endAngle = -90;
        series.hiddenState.properties.startAngle = -90;
        
        chart.legend = new am4charts.Legend();
        //chart.legend.position = "right";
        
        setLegendSize(chart);
    });
    
    if(callback) callback();
}

// -------------------- Small Wire Sub Details: report_type_id(3)------------------//

function displaySWSubDtlByMY(callback){
    var _result = [];
    $.each(gByModelYear.groupBy(["MODEL_YEAR"]), function(i,v) { 
        var _modelYear = v.name;
        var _jsonData = {};
            _jsonData.model_year = _modelYear
        
        $.each(gAll.groupBy(["WIRE_GAUGE"]), function(i,v) {
            var wire = v.name;
            var wireNew = wire.replace(".","_");
            var res = gByModelYear.filter(function (item) {
            	return item.MODEL_YEAR == _modelYear && item.WIRE_GAUGE == wire;
            });
            
            if( res.length > 0 ) {
                _jsonData[wireNew] =  res[0].wire_count;
            }else{
                _jsonData[wireNew] = 0
            }
        });
        
        _result.push(_jsonData);
    });

    var chart = am4core.create("chartSWSubDtlByMY" + gHarnessName, am4charts.XYChart);
    chart.data = _result;
    //chart.colors.step = 3;
    
    // Create axes
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "model_year";
    categoryAxis.numberFormatter.numberFormat = "#";
    categoryAxis.title.text = "Wire Guages";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 20;
    
    var  valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = "Count";
    
    // Create series
    var createSeries = function(field, name) {
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.valueY = field;
        series.dataFields.categoryX = "model_year";
        series.name = name;
        series.tooltipText = "{name}: [bold]{valueY.formatNumber('#,###')}[/]";
     }

    $.each(gAll.groupBy(["WIRE_GAUGE"]), function(i,v) { 
        var _field = v.name.replace(".","_");
        var _name = v.name;
        
        createSeries(_field, _name);
    });
    
    // Add cursor
    chart.cursor = new am4charts.XYCursor();
    
    // Add legend
    chart.legend = new am4charts.Legend();
    
    setLegendSize(chart);
    
    var _trend = "";
    var lastObj = _result[_result.length - 1];
    $.each(lastObj, function(k, v){
        var _key = k.replace("_",".");
        if($.isNumeric( _key ) && v !== 0){
            _trend += _key + '<br>';
        }
    });
    
    var _tw = new zsi.easyJsTemplateWriter("#chartSWSubDtlByMY" + gHarnessName)
            .out().trendResult({ trend: _trend });
    
    if(callback) callback();
}
 
function displaySWSubDtlByRegion(callback){
    var _result = [];
    $.each(gByRegion.groupBy(["REGION_NAME"]), function(i,v) { 
        var _region = v.name;
        var _jsonData = {};
            _jsonData.region = _region
        
        $.each(gAll.groupBy(["WIRE_GAUGE"]), function(i,v) { 
            var wire = v.name;
            var wireNew = wire.replace(".","_");
            var res = gByRegion.filter(function (item) {
            	return item.REGION_NAME == _region && item.WIRE_GAUGE == wire;
            });
            
            if( res.length > 0 ) {
                _jsonData[wireNew] =  res[0].wire_count;
            }else{
                _jsonData[wireNew] = 0
            }
        });
        
        _result.push(_jsonData);
    });
    
    var chart = am4core.create("chartSWSubDtlByRegion" + gHarnessName, am4charts.XYChart);
    chart.data = _result;
    //chart.colors.step = 3;
    
    // Create axes
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "region";
    categoryAxis.title.text = "Wire Guages";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 20;
    
    var  valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = "Count";
    
    // Create series
    var createSeries = function(field, name) {
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.valueY = field;
        series.dataFields.categoryX = "region";
        series.name = name;
        series.tooltipText = "{name}: [bold]{valueY}[/]";
     }

    $.each(gAll.groupBy(["WIRE_GAUGE"]), function(i,v) { 
        var _field = v.name.replace(".","_");
        var _name = v.name;
        
        createSeries(_field, _name);
    });
    
    // Add cursor
    chart.cursor = new am4charts.XYCursor();
    
    // Add legend
    chart.legend = new am4charts.Legend();
    
    setLegendSize(chart);
    
    var _trend = "";
    var _lastObj = _result[_result.length - 1];
    $.each(_lastObj, function(k, v){
        var _key = k.replace("_",".");
        if($.isNumeric( _key ) && v !== 0){
            _trend += _key + '<br>';
        }
    });
    
    var _tw = new zsi.easyJsTemplateWriter("#chartSWSubDtlByRegion" + gHarnessName)
            .out().trendResult({ trend: _trend });
    
    if(callback) callback();
}

function displaySWSubDtlEachMYBar(callback){
    $.each(gByModelYear.groupBy(["MODEL_YEAR"]), function(i,v) { 
        var _result = [];
        var _modelYear = v.name;
        var _divID = "chartSWSubDtlEachMY_"+ _modelYear  + gHarnessName;
        var _tw = new zsi.easyJsTemplateWriter("#chartSWSubDtlEachMY" + gHarnessName)
            .chartCard({ id: _divID, title: _modelYear, class:"w-100", header:"text-dark"});
        
        $.each(gAll.groupBy(["WIRE_GAUGE"]), function(i,v) { 
            var _wireGuage = v.name;
            var _jsonData = {};
                _jsonData.model_year = _modelYear
                _jsonData.wire_guage = _wireGuage;
                
            var res = gByModelYear.filter(function (item) {
            	return item.MODEL_YEAR == _modelYear && item.WIRE_GAUGE == _wireGuage;
            });
            
            if( res.length > 0 ) {
                _jsonData.wire_count = res[0].wire_count;
            }else{
                _jsonData.wire_count = 0
            }
            
            _result.push(_jsonData);
        });

        var chart = am4core.create(_divID, am4charts.XYChart);
        chart.data = _result;
        //chart.padding(40, 40, 40, 40);

        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.dataFields.category = "wire_guage";
        categoryAxis.renderer.minGridDistance = 60;
        categoryAxis.title.text = "Wire Guages";
        
        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.categoryX = "wire_guage";
        series.dataFields.valueY = "wire_count";
        series.tooltipText = "{valueY.value}"
        series.columns.template.strokeOpacity = 0;
        
        chart.cursor = new am4charts.XYCursor();
        
        // as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
        series.columns.template.adapter.add("fill", function (fill, target) {
        	return chart.colors.getIndex(target.dataItem.index);
        });
    });
    
    if(callback) callback();
}

function displaySWSubDtlEachRegionBar(callback){
    $.each(gByRegion.groupBy(["REGION_NAME"]), function(i,v) { 
        var _result = [];
        var _region = v.name;
        var _regionNew = _region.split(' ').join('_');
        var _divID = "chartSWSubDtlEachRegion_"+ _regionNew + gHarnessName;
        var _tw = new zsi.easyJsTemplateWriter("#chartSWSubDtlEachRegion" + gHarnessName)
            .chartCard({ id: _divID, title: _region, class:"w-100", header:"text-dark"});
        
        $.each(gAll.groupBy(["WIRE_GAUGE"]), function(i,v) { 
            var _wireGuage = v.name;
            var _jsonData = {};
                _jsonData.region = _region
                _jsonData.wire_guage = _wireGuage;
                
            var res = gByRegion.filter(function (item) {
            	return item.REGION_NAME == _region && item.WIRE_GAUGE == _wireGuage;
            });
            
            if( res.length > 0 ) {
                _jsonData.wire_count = res[0].wire_count;
            }else{
                _jsonData.wire_count = 0
            }
            
            _result.push(_jsonData);
        });

        var chart = am4core.create(_divID, am4charts.XYChart);
        chart.data = _result;
        //chart.padding(40, 40, 40, 40);

        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.dataFields.category = "wire_guage";
        categoryAxis.renderer.minGridDistance = 60;
        categoryAxis.title.text = "Wire Guages";
        
        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.categoryX = "wire_guage";
        series.dataFields.valueY = "wire_count";
        series.tooltipText = "{valueY.value}"
        series.columns.template.strokeOpacity = 0;
        
        chart.cursor = new am4charts.XYCursor();
        
        // as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
        series.columns.template.adapter.add("fill", function (fill, target) {
        	return chart.colors.getIndex(target.dataItem.index);
        });
    });
    
    if(callback) callback();
}

function displaySWSubDtlEachMYPie(callback){
    $.each(gByModelYear.groupBy(["MODEL_YEAR"]), function(i,v) { 
        var _result = [];
        var _modelYear = v.name;
        var _divID = "chartSWSubDtlEachMY_"+ _modelYear + gHarnessName;
        var _tw = new zsi.easyJsTemplateWriter("#chartSWSubDtlEachMY" + gHarnessName)
            .chartCard({ id: _divID, title: _modelYear, class:"w-100", header:"text-dark"});
        
        $.each(gAll.groupBy(["WIRE_GAUGE"]), function(i,v) { 
            var _wireGuage = v.name;
            var _jsonData = {};
                _jsonData.model_year = _modelYear
                _jsonData.wire_guage = _wireGuage;
                
            var res = gByModelYear.filter(function (item) {
            	return item.MODEL_YEAR == _modelYear && item.WIRE_GAUGE == _wireGuage;
            });
            
            if( res.length > 0 ) {
                _jsonData.wire_count = res[0].wire_count;
            }else{
                _jsonData.wire_count = 0
            }
            
            _result.push(_jsonData);
        });

        var chart = am4core.create(_divID, am4charts.PieChart3D);
        chart.data = _result;

        var series = chart.series.push(new am4charts.PieSeries());
        series.dataFields.value = "wire_count";
        series.dataFields.category = "wire_guage";
        
        series.labels.template.disabled = true;
        series.ticks.template.disabled = true;
        
        // this creates initial animation
        series.hiddenState.properties.opacity = 1;
        series.hiddenState.properties.endAngle = -90;
        series.hiddenState.properties.startAngle = -90;
        
        chart.legend = new am4charts.Legend();
        //chart.legend.position = "right";
        
        setLegendSize(chart);
    });
    
    if(callback) callback();
}

function displaySWSubDtlEachRegionPie(callback){
    $.each(gByRegion.groupBy(["REGION_NAME"]), function(i,v) { 
        var _result = [];
        var _region = v.name;
        var _regionNew = _region.split(' ').join('_');
        var _divID = "chartSWSubDtlEachRegion_"+ _regionNew + gHarnessName;
        var _tw = new zsi.easyJsTemplateWriter("#chartSWSubDtlEachRegion" + gHarnessName)
            .chartCard({ id: _divID, title: _region, class:"w-100", header:"text-dark"});
        
        $.each(gAll.groupBy(["WIRE_GAUGE"]), function(i,v) { 
            var _wireGuage = v.name;
            var _jsonData = {};
                _jsonData.region = _region
                _jsonData.wire_guage = _wireGuage;
                
            var res = gByRegion.filter(function (item) {
            	return item.REGION_NAME == _region && item.WIRE_GAUGE == _wireGuage;
            });
            
            if( res.length > 0 ) {
                _jsonData.wire_count = res[0].wire_count;
            }else{
                _jsonData.wire_count = 0
            }
            
            _result.push(_jsonData);
        });

        var chart = am4core.create(_divID, am4charts.PieChart3D);
        chart.data = _result;

        var series = chart.series.push(new am4charts.PieSeries());
        series.dataFields.value = "wire_count";
        series.dataFields.category = "wire_guage";

        series.labels.template.disabled = true;
        series.ticks.template.disabled = true;
        
        // this creates initial animation
        series.hiddenState.properties.opacity = 1;
        series.hiddenState.properties.endAngle = -90;
        series.hiddenState.properties.startAngle = -90;
        
        chart.legend = new am4charts.Legend();
        //chart.legend.position = "right";
        
        setLegendSize(chart);
    });
    
    if(callback) callback();
}

//------------------- New Wire Tech ---------------------------------//

function getDataNewWireTech(callback){
    var _my = new Date().getFullYear() - 2;
    var _wireGuage = "0.75";
    $.get(execURL + "wire_tech_lower_upper_limits @model_year="+ _my +",@wire_gauge='"+ _wireGuage +"'"
    , function(data){
        var dataRows = [];
        if(data.rows.length > 0){
          dataRows = data.rows;
        }
        if(callback) callback(dataRows);
    });
}

function displayNewWireTech(){
    am4core.useTheme(am4themes_animated);
    getDataNewWireTech(function(data){
        var chartId = "chartNewWireTech";
        gtw.div({id:chartId, class:"chart-div", style:"max-height: 550px"});
    
        var chart = am4core.create(chartId, am4charts.XYChart);
        
        var wireLL = data.reduce(function(prev, curr) {
                        return prev.wire_ll < curr.wire_ll ? prev.wire_ll : curr.wire_ll;
                    });
                    
        var wireUL = data.reduce(function(prev, curr) {
                        return prev.wire_ul < curr.wire_ul ? prev.wire_ul : curr.wire_ul;
                    });

        // Add data
        chart.data = data;
        
        chart.numberFormatter.numberFormat = "#.#####";
        
        // Create axes
        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "wire_type";
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.renderer.minGridDistance = 20;
        categoryAxis.renderer.labels.template.horizontalCenter = "right";
        categoryAxis.renderer.labels.template.verticalCenter = "middle";
        categoryAxis.renderer.labels.template.rotation = 310;

        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.min = 0.0000;
        valueAxis.max = wireUL;
        valueAxis.title.text = "Avg. Weight";
        valueAxis.renderer.minGridDistance = 10;
        //valueAxis.renderer.numberFormatter.numberFormat = "#.#####";
        valueAxis.numberFormatter = new am4core.NumberFormatter();
        valueAxis.numberFormatter.numberFormat = "#.#####";
        
         var axisTooltip = valueAxis.tooltip;
        //axisTooltip.background.fill = am4core.color("#07BEB8");
        // axisTooltip.background.strokeWidth = 0;
        // axisTooltip.background.cornerRadius = 3;
        // axisTooltip.background.pointerLength = 0;
        // axisTooltip.dy = 5;
        axisTooltip.numberFormatter = new am4core.NumberFormatter();
        axisTooltip.numberFormatter.numberFormat = "#.#####";
        
        var axisTooltip = valueAxis.tooltip;
        
        // Create series
        var series = chart.series.push(new am4charts.LineSeries());
        series.dataFields.valueY = "avg_weight";
        series.dataFields.categoryX = "wire_type";
        series.name = "Avg. Weight";
        series.tooltipText = "{name}: [bold]{valueY}[/]";
        
        // Create value axis range
        var range = valueAxis.axisRanges.create();
        range.value = wireUL;
        range.grid.stroke = am4core.color("#396478");
        range.grid.strokeWidth = 2;
        range.grid.strokeOpacity = 1;
        range.label.inside = true;
        range.label.text = "Upper Limit";
        range.label.fill = range.grid.stroke;
        //range.label.align = "right";
        range.label.verticalCenter = "bottom";
        
        var range2 = valueAxis.axisRanges.create();
        range2.value = wireLL;
        range2.grid.stroke = am4core.color("#A96478");
        range2.grid.strokeWidth = 2;
        range2.grid.strokeOpacity = 1;
        range2.label.inside = true;
        range2.label.text = "Lower Limit";
        range2.label.fill = range2.grid.stroke;
        //range2.label.align = "right";
        range2.label.verticalCenter = "bottom";
        
        // Add cursor
        chart.cursor = new am4charts.XYCursor();
        
        // Add legend
        //chart.legend = new am4charts.Legend();
    });
}
     