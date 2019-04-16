var  svn                        = zsi.setValIfNull
    ,bs                         = zsi.bs.ctrl
    ,bsButton                   = zsi.bs.button
    ,proc_url                   = base_url + "common/executeproc/"
    ,gMdlId                     = "modalCriteriaColums"
    ,gMdlRD                     = "modalRemoveDuplicate"
    ,gMdlWGR                    = "modalWireGaugeReferences"
    ,gtw                        = null
    ,g$mdl                      = null
    ,criteriaId                 = ""
    ,modalImageUploadE          = "modalWindowImageUploadElectrical"
    ,modalImageUploadM          = "modalWindowImageUploadMechanical"
    ,modalIconUpload            = "modalWindowIconUpload"
    ,modalCriteriaImageUpload   = "modalwindowCriteriaImageUpload"
    ,modalChart                 = "modalWindowChart"
    ,modalCriteriaColumnValues  = "modalWindowCriteriaColumnValues"
    ,gSpecsId                   = ""
    ,gTimeStamp                 = new Date().getTime()
    ,gClsMma                    ="mouse-move-area"
    ,gPrmRegion                 = ""
    ,gPrmNoYears                = ""
    ,gPrmChartType              = ""
    ,gPrmIncludeCYear           = "N"
    ,gAll                       = []
    ,gByRegion                  = []
    ,gByModelYear               = []
    ,gPrmCriteriaName           = ""
    ,gPrmCriteriaId             = null
    ,gPrmReportTypeId           = null
    ,gMYRange                   = ""
    ,gHarnessName               = ""
    ,gData                      = []
    ,gRegionNames               = []
    ,gModelYears                = []
    ,gMYFrom                    = ""
    ,gMYTo                      = ""
    ,gGridType                  = "E" // Init Electrical
    ,gMenuName                  = "" 
;

zsi.ready(function(){
     $(".zPanel").css({
            height:$(window).height()-100
        });  
        
  gtw = new zsi.easyJsTemplateWriter();
    getTemplates(function(){
        displayRecords();
        displayRecordsMech();
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
        , body      : gtw.new().modalBody({gridId1:"gridCriteriaColumns",onClickSave1:"submitData1();"}).html()  
    })
    .bsModalBox({
          id        : gMdlRD
        , sizeAttr  : "modal-md"
        , title     : "Remove Duplicate"
        , body      : gtw.new().modalBodyRD({gridRD:"gridRD",onClickSaveRD:"submitDataRD();"}).html()  
    })
    .bsModalBox({
          id        : gMdlWGR
        , sizeAttr  : "modal-full"
        , title     : "Wire Gauge References"
        , body      : gtw.new().modalBodyWGR({gridWGR:"gridWireGaugeReferences",onClickSaveWGR:"submitDataWGR();"}).html()  
    })
    .bsModalBox({
          id        : modalImageUploadE
        , sizeAttr  : "modal-md"
        , title     : "Upload Image"
        , footer    : '<div class="col-11 ml-auto"><button type="button" onclick="uploadMenuImageE(this);" class="btn btn-primary"><span class="fas fa-file-upload"></span> Upload</button>'
        //, body      : gtw.new().modalBody({gridId3:"gridUploadImage",uploadImage:"uploadImage();"}).html()  
    })
    .bsModalBox({
          id        : modalImageUploadM
        , sizeAttr  : "modal-md"
        , title     : "Upload Image"
        , footer    : '<div class="col-11 ml-auto"><button type="button" onclick="uploadMenuImageM(this);" class="btn btn-primary"><span class="fas fa-file-upload"></span> Upload</button>'
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
        , body      : //div class="d-flex  flex-wrap flex-md-nowrap align-items-center mb-1 justify-content-end">'
                      //    +'<div class="mr-auto py-2 font-weight-bold" id="chart_range"></div>'
                      //    +'<div class="btn-toolbar mb-2 mb-md-0" id="chart_filter">'
                      //        +'<div class="input-group ">'
                      //            +'<div class="input-group-prepend">'
                      //                +'<span class="input-group-text">Category :</span>'
                      //            +'</div>'
                      //            +'<select class="custom-select" id="category" style="width:120px">'
                      //                +'<option selected>Choose...</option>'
                      //                +'<option value="Per Model Year">Per Model Year</option>'
                      //                +'<option value="Per Region">Per Region</option>'
                      //                +'<option value="Per Vehicle Type">Per Vehicle Type</option>'
                      //                +'<option value="Per OEM">Per OEM</option>'
                      //            +'</select>'
                      //            +'<div class="input-group-prepend">'
                      //                +'<div class="input-group-text">'
                      //                    +'<input type="checkbox" id="include_cyear" aria-label="Checkbox to include current year">'
                      //                    +'<span class="pl-1">Include Current Year</span>'
                      //                +'</div>'
                      //            +'</div>'
                      //            +'<div class="input-group-prepend">'
                      //                +'<span class="input-group-text">No. of Years :</span>'
                      //            +'</div>'
                      //            +'<input type="number" min="1" max="10" step="1" value="" class="form-control" id="no_of_years" style="width:50px">'
                      //            +'<div class="input-group-prepend">'
                      //                +'<span class="input-group-text">Chart Type :</span>'
                      //            +'</div>'
                      //            +'<select class="custom-select" id="chart_type" style="width:120px">'
                      //                +'<option selected>Choose...</option>'
                      //                +'<option value="Pie Chart">Pie Chart</option>'
                      //                +'<option value="Bar Graph" selected>Bar Graph</option>'
                      //            +'</select>'
                      //            +'<div class="input-group-append">'
                      //                +'<button class="btn btn-dark" type="button" id="btnSearch" onclick="filterChart();">Go</button>'
                      //            +'</div>'
                      //        +'</div>'
                      //    +'</div>'
                      //+'</div>'
                        '<div id="chart_container"></div>'
    })
    
    .bsModalBox({
          id        : modalCriteriaColumnValues
        , sizeAttr  : "modal-md"
        , title     : "Criteria Column Values"
        , body      : gtw.new().modalInList({gridCricolVal:"gridCriteriaColumnValues",saveCriColVal:"submitData2();"}).html()  
        //, footer   : '<div class="col-11 ml-auto"><button type="button" onclick="submitData2(this);" class="btn btn-primary"><span class="fas fa-file-upload"></span> Save</button>'
    });
    
    if(callback) callback();
    
}

function displayRecords(menuType){ 
    var flag = "";
    $("#grid").dataBind({
             sqlCode        : "T72"
             ,parameters     : {menu_type : "E" }
            ,width          : 660
    	    ,height         : 200
    	    ,selectorType   : "checkbox"
            //,blankRowsLimit:5
            ,isPaging : false
            ,dataRows       :[
        		{ text:"Electrical Menu"         , width:250     , style:"text-align:left;"
        		    ,onRender : function(d){
        		        var _menuId = svn(d,"menu_id");
        		        var _specsId = svn(d,"specs_id");
        		        this.css('cursor', 'pointer');
        		        this.click(function(){
        		            if(_menuId && _specsId){
                                $(".criteria").show();
                                displayCriteria(_menuId,_specsId);
                                gGridType = "E";
                                gMenuName = svn(d,"menu_name");
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
        		        var _imgName        = "<a href='javascript:void(0);' " + _mouseMoveEvent + " class='btn btn-sm;' onclick='showModalUploadImageE(" + svn(d,"menu_id") + ",\"" + svn(d,"image1_id") + "\",\"image1_id\",\"" + svn(d,"menu_name") + "\");' ><span class='fas fa-file-upload' style='font-size:12pt;' ></span> popover</a>";
        		            return (d !== null ? _imgName : "");
        		    }
        		}	 	 	
        		,{ text:"Image 2"      , width:70     , style:"text-align:center;" 
        		    ,onRender : function(d){ 
        		        this.addClass(gClsMma);
                        var _mouseMoveEvent = "onmouseover='mouseover(\"" + svn(d,"image2_id") +  "\");' onmouseout='mouseout();'";
        		        var _imgName       = "<a href='javascript:void(0);' " + _mouseMoveEvent + " class='btn btn-sm;'  onclick='showModalUploadImageE(" + svn(d,"menu_id") + ",\"" + svn(d,"image2_id") + "\",\"image2_id\",\"" + svn(d,"menu_name") + "\");' ><span class='fas fa-file-upload' style='font-size:12pt;' ></span> </a>";
        		        return (d !== null ? _imgName : "");
        		    }
        		}	 	 	
        		,{ text:"Image 3"      , width:70     , style:"text-align:center;" 
        		    ,onRender : function(d){ 
        		        this.addClass(gClsMma);
                        var _mouseMoveEvent = "onmouseover='mouseover(\"" + svn(d,"image3_id") +  "\");' onmouseout=''";
        		        var _imgName       = "<a href='javascript:void(0);' " + _mouseMoveEvent + " class='btn btn-sm;'  onclick='showModalUploadImageE(" + svn(d,"menu_id") + ",\"" + svn(d,"image3_id") + "\",\"image3_id\",\"" + svn(d,"menu_name") + "\");' ><span class='fas fa-file-upload' style='font-size:12pt;' ></span> </a>";
        		            return (d !== null ? _imgName : "");
        		    }
        		}	 	 	
        		,{ text:"Image 4"      , width:70     , style:"text-align:center;" 
        		    ,onRender : function(d){ 
        		        this.addClass(gClsMma);
                        var _mouseMoveEvent = "onmouseover='mouseover(\"" + svn(d,"image4_id") +  "\");' onmouseout='mouseout();'";
        		        var _imgName       = "<a href='javascript:void(0);' " + _mouseMoveEvent + " class='btn btn-sm;'  onclick='showModalUploadImageE(" + svn(d,"menu_id") + ",\"" + svn(d,"image4_id") + "\",\"image4_id\",\"" + svn(d,"menu_name") + "\");' ><span class='fas fa-file-upload' style='font-size:12pt;' ></span> </a>";
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
            ,onComplete : function(o){
                this.data("menuType",menuType);
            }
    });    
}

function displayRecordsMech(menuType){ 
    var flag = "";
    $("#gridMech").dataBind({
             sqlCode        : "T72"
             ,parameters     : {menu_type : "M" }
            ,width          : 660
    	    ,height         : 250
    	    ,selectorType   : "checkbox"
            //,blankRowsLimit:5
            ,isPaging : false
            ,dataRows       :[
        		{ text:"Mechanical Menu"         , width:250     , style:"text-align:left;"
        		    ,onRender : function(d){
        		        var _menuId = svn(d,"menu_id");
        		        var _specsId = svn(d,"specs_id");
        		        this.css('cursor', 'pointer');
        		        this.click(function(){
        		            if(_menuId && _specsId){
                                $(".criteria").show();
                                displayCriteria(_menuId,_specsId);
                                gGridType = "M";
                                gMenuName = svn(d,"menu_name");
                            }
        		  	        else{
                                $(".criteria").hide();
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
        		        var _imgName       = "<a href='javascript:void(0);' " + _mouseMoveEvent + " class='btn btn-sm;'  onclick='showModalUploadImageM(" + svn(d,"menu_id") + ",\"" + svn(d,"image1_id") + "\",\"image1_id\",\"" + svn(d,"menu_name") + "\");' ><span class='fas fa-file-upload' style='font-size:12pt;' ></span> </a>";
        		            return (d !== null ? _imgName : "");
        		    }
        		}	 	 	
        		,{ text:"Image 2"      , width:70     , style:"text-align:center;" 
        		    ,onRender : function(d){ 
        		        this.addClass(gClsMma);
                        var _mouseMoveEvent = "onmouseover='mouseover(\"" + svn(d,"image2_id") +  "\");' onmouseout='mouseout();'";
        		        var _imgName       = "<a href='javascript:void(0);' " + _mouseMoveEvent + " class='btn btn-sm;'  onclick='showModalUploadImageM(" + svn(d,"menu_id") + ",\"" + svn(d,"image2_id") + "\",\"image2_id\",\"" + svn(d,"menu_name") + "\");' ><span class='fas fa-file-upload' style='font-size:12pt;' ></span> </a>";
        		        return (d !== null ? _imgName : "");
        		    }
        		}	 	 	
        		,{ text:"Image 3"      , width:70     , style:"text-align:center;" 
        		    ,onRender : function(d){ 
        		        this.addClass(gClsMma);
                        var _mouseMoveEvent = "onmouseover='mouseover(\"" + svn(d,"image3_id") +  "\");' onmouseout=''";
        		        var _imgName       = "<a href='javascript:void(0);' " + _mouseMoveEvent + " class='btn btn-sm;'  onclick='showModalUploadImageM(" + svn(d,"menu_id") + ",\"" + svn(d,"image3_id") + "\",\"image3_id\",\"" + svn(d,"menu_name") + "\");' ><span class='fas fa-file-upload' style='font-size:12pt;' ></span> </a>";
        		            return (d !== null ? _imgName : "");
        		    }
        		}	 	 	
        		,{ text:"Image 4"      , width:70     , style:"text-align:center;" 
        		    ,onRender : function(d){ 
        		        this.addClass(gClsMma);
                        var _mouseMoveEvent = "onmouseover='mouseover(\"" + svn(d,"image4_id") +  "\");' onmouseout='mouseout();'";
        		        var _imgName       = "<a href='javascript:void(0);' " + _mouseMoveEvent + " class='btn btn-sm;'  onclick='showModalUploadImageM(" + svn(d,"menu_id") + ",\"" + svn(d,"image4_id") + "\",\"image4_id\",\"" + svn(d,"menu_name") + "\");' ><span class='fas fa-file-upload' style='font-size:12pt;' ></span> </a>";
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
            ,onComplete : function(o){
                this.data("menuType",menuType);
            }
    });    
}

function mouseover(imgId){
    $("#img-box").css("display","block");
    $("#img-box img").attr("src",base_url + "file/viewImageDB?sqlCode=T83&imageId=" +  imgId  + "&ts=" + gTimeStamp );
}

function mouseoverCriteria(imgId){
    console.log("imgId",imgId);
    $("#img-box").css("display","block");
    $("#img-box img").attr("src",base_url + "file/viewImageDB?sqlCode=C89&imageId=" +  imgId  + "&ts=" + gTimeStamp );
}

function mouseout(){
    $("#img-box").css("display","none");
}

function showModalUploadImageE(parentId,imageId,fieldName,menuName){
    var m=$('#' + modalImageUploadE);
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

function showModalUploadImageM(parentId,imageId,fieldName,menuName){
    var m=$('#' + modalImageUploadM);
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
	    //,width          : $("#gridWireGaugeReferences").closest(".modal-body").width() 
	    ,height         : $(document).height() - 200
	    ,selectorIndex  : 1
	    ,startGroupId   : 0
        ,blankRowsLimit : 5
        ,dataRows       : [
                            {  id:  1  ,groupId: 0      , text  : "Wire Gauge"          }	 
            		        ,{ id:  2  ,groupId: 0      , text  : "Color"               }
            		        ,{ id:  3  ,groupId: 0      , text  : "JASO"                }	 
    		                ,{ id:  4  ,groupId: 0      , text  : "ISO"                 }	 
    		                ,{ id:  5  ,groupId: 0      , text  : "SAE"                 }	 
    		                ,{ id:  6  ,groupId: 0      , text  : "Combined"   }	 
    		                
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
                                , text      : "<div class='centr'>Lower Diameter</div>"     
            		            , name      : "jaso_lower_limit"  
            		            , type      : "input"           
            		            , width     : 140      
            		            , style     : "text-align:center;"  
            		            , onRender  :   function(d){ 
    		                        return  bs({name:"jaso_lower_limit"      , class : "numeric text-center",   type    : "input"          ,   value: svn(d,"jaso_lower_limit")});
    		                        }
            		            
            		        }
            		        ,{  id          : 103
                                , groupId   : 3    		      
                                , text      : "<div class='centr'>Upper Diameter</div>"     
            		            , name      : "jaso_upper_limit"  
            		            , type      : "input"           
            		            , width     : 140      
            		            , style     : "text-align:center;"  
            		            , onRender  :   function(d){ 
    		                        return  bs({name:"jaso_upper_limit"      , class : "numeric text-center",   type    : "input"          ,   value: svn(d,"jaso_upper_limit")});
    		                        }
            		            
            		        }
            		        ,{  id          : 104
                                , groupId   : 4    		      
                                , text      : "<div class='centr'>Lower Diameter</div>"     
            		            , width     : 140      
            		            , style     : "text-align:center;"  
            		            , onRender  :   function(d){ 
            	                    return  bs({name:"iso_lower_limit"      , class : "numeric text-center",   type    : "input"          ,   value: svn(d,"iso_lower_limit")});
    		                        } 
            		        }
            		        ,{  id          : 105
                                , groupId   : 4  		      
                                , text      : "<div class='centr'>Upper Diameter</div>"     
            		            , type      : "input"           
            		            , width     : 140      
            		            , style     : "text-align:center;"  
            		            , onRender  :   function(d){ 
    		                        return  bs({name:"iso_upper_limit"      , class : "numeric text-center",   type    : "input"          ,   value: svn(d,"iso_upper_limit")});
    		                       } 
            		        }
            		        ,{  id          : 102
                                , groupId   : 5    		      
                                , text      : "<div class='centr'>Lower Diameter</div>"     
            		            , name      : "sae_lower_limit"  
            		            , type      : "input"           
            		            , width     : 140      
            		            , style     : "text-align:center;"  
            		            , onRender  :   function(d){ 
    		                        return  bs({name:"jsae_lower_limit"      , class : "numeric text-center",   type    : "input"          ,   value: svn(d,"sae_lower_limit")});
    		                        }
            		            
            		        }
            		        ,{  id          : 103
                                , groupId   : 5    		      
                                , text      : "<div class='centr'>Upper Diameter</div>"     
            		            , name      : "sae_upper_limit"  
            		            , type      : "input"           
            		            , width     : 140      
            		            , style     : "text-align:center;"  
            		            , onRender  :   function(d){ 
    		                        return  bs({name:"sae_upper_limit"      , class : "numeric text-center",   type    : "input"          ,   value: svn(d,"sae_upper_limit")});
    		                        }
            		            
            		        }
    		                ,{  id          : 106
                                , groupId   : 6    		      
                                , text      : "<div class='centr'>Lower Diameter</div>"     
            		            , width     : 140      
            		            , style     : "text-align:center;"  
            		            , onRender  :   function(d){ 
    		                        return  bs({name:"combined_lower_limit"      , class : "numeric text-center",   type    : "input"          ,   value: svn(d,"combined_lower_limit")});
    		                        } 
            		        }
            		        ,{  id          : 107
                                , groupId   : 6  		      
                                , text      : "<div class='centr'>Upper Diameter</div>"     
            		            , type      : "input"           
            		            , width     : 140      
            		            , style     : "text-align:center;"  
            		            , onRender  :   function(d){ 
    		                        return  bs({name:"combined_upper_limit"      , class : "numeric text-center",   type    : "input"          ,   value: svn(d,"combined_upper_limit")})
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
                $("input[name='iso_lower_limit']").keyup(function(){
                    
                });
                $("input[name='iso_upper_limit']").keyup(function(){
                    
                });
                zsi.initInputTypesAndFormats();
        }  
    });    
}

function submitDataWGR(){
    var _$grid =  $("#gridWireGaugeReferences");
       _$grid.jsonSubmit({
             procedure: "wire_gauge_references_upd"
            ,onComplete: function (data) {
                if(data.isSuccess===true) {
                    zsi.form.showAlert("alert");
                    displayWireGaugeReferences(_$grid.data("menuId"), _$grid.data("specsId"));
                }
            }
        });
}  

function uploadMenuImageE(obj){
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
                $.get(base_url  + "sql/exec?p=dbo.trend_menu_image_upd @tren_menu_id=" + _parent_id 
                                + ",@" + _field_name + "=" + data.image_id 
                                + ",@user_id=" + userId 
                                
                ,function(data){
                    zsi.form.showAlert("alert");
                    $('#' + modalImageUploadE).modal('toggle');
                    //refresh latest records:
                    //displayRecords();
                    $("#grid").trigger('refesh');
                    //$("#gridMech").trigger('refesh');

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

function uploadMenuImageM(obj){
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
                $.get(base_url  + "sql/exec?p=dbo.trend_menu_image_upd @tren_menu_id=" + _parent_id 
                                + ",@" + _field_name + "=" + data.image_id 
                                + ",@user_id=" + userId 
                                
                ,function(data){
                    zsi.form.showAlert("alert");
                    $('#' + modalImageUploadM).modal('toggle');
                    //refresh latest records:
                    //displayRecords();
                    //$("#grid").trigger('refesh');
                    $("#gridMech").trigger('refesh');

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
    var _$grid = $("#gridCriteria");
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
                $.get(base_url  + "sql/exec?p=dbo.criteria_image_upd @criteria_id=" + _parent_id 
                                + ",@" + _field_name + "=" + data.image_id 
                                + ",@user_id=" + userId 
                                
                ,function(data){
                    zsi.form.showAlert("alert");
                    $('#' + modalCriteriaImageUpload).modal('toggle');
                    //refresh latest records:
                    displayCriteriaColumns(_$grid.data("menuId"), _$grid.data("specsId"));
                    //$("#gridCriteria").trigger('refresh');
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
    		                                +   bs({name:"is_edited",type:"hidden" })
    		                                +   bs({name:"seq_no" ,value: svn(d,"seq_no")}) ;
    		         	     }
    		 }
    		,{ text:"Trend Menu"    , width:150    , style:"text-align:center;"    
		            ,onRender   :   function(d){ 
		                    var _trendMenuSelect = bs({name:"trend_menu_id"   ,type:"select"  ,value: menuId})
		                    var _trendMenuHide   = bs({name:"trend_menu_id"   ,type:"hidden"  ,value: menuId})
		                    return (d !== null && svn(d,"pcriteria_id") == "" ? _trendMenuSelect : _trendMenuHide );
		          }
		    }
    		,{ text:"Criteria Title"   , width:420 , style:"text-align:left;" ,  type:"input"  ,  name:"criteria_title"	
    		   ,onRender: function(d){
    		       var _link = "<a href='javascript:void(0);' class='btn btn-sm position-absolute p-1' onclick='showModalChart(\""+ svn(d,"criteria_id") +"\",\"" +  svn(d,"criteria_title")  + "\");'  ><i class='fas fa-chart-bar'></i> </a>";
    		        if(d){
    		            return (d.pcriteria_id!=="" ? _link : "")
    		                + '<input class="form-control text-left pl-4" type="text" name="criteria_title" id="criteria_title" value="'+ d.criteria_title +'" style="'+ (!d.pcriteria_id ? 'font-weight:bold;' : '') +'">';
    		        } else return '<input class="form-control text-left" type="text" name="criteria_title" id="criteria_title">';   
    		    }
    		}	 	 
    		
    		,{ text:"Group Criteria"    , width:150    , style:"text-align:center;"    
		            ,onRender   :   function(d){ 
		                    return bs({name:"pcriteria_id", type:"select", value: svn(d,"pcriteria_id")});
		          }
		    }

    		,{ text:"Active?"    , width:65  , style:"text-align:left;" ,  type:"yesno"  ,  name:"is_active"  ,  defaultValue   : "Y"}
    		,{ text:"CC" ,width:35 , style:"text-align:left;"
    		        ,onRender   :   function(d){
    		            var _pcriteriaId = svn(d,"pcriteria_id");
    		            var _link = "<a href='javascript:void(0);' class='btn btn-sm' data-toggle='tooltip' data-placement='left' title='Criteria Columns'  onclick='showModalCriteriaColumns(\""+ svn(d,"criteria_id") +"\",\""+ specsId +"\",\"" +  svn(d,"criteria_title")  + "\");'  ><i class='fas fa-link'></i> </a>";
    		            return (d !==null && _pcriteriaId !== "" ? _link : "" );
    		        }
    		}
    		,{ text:"RD" ,width:35 , style:"text-align:left;"
    		        ,onRender   :   function(d){
    		            var _pcriteriaId = svn(d,"pcriteria_id");
    		            var _link = "<a href='javascript:void(0);' class='btn btn-sm' data-toggle='tooltip' data-placement='left' title='Remove Duplicate' onclick='showModalRemoveDup(\""+ svn(d,"criteria_id") +"\",\""+ specsId +"\",\"" +  svn(d,"criteria_title")  + "\");'  ><i class='fas fa-link'></i> </a>";
    		            return (d !==null && _pcriteriaId !== "" ? _link : "" );
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
	    ]
  	    ,onComplete : function(){
  	        this.find('[data-toggle="tooltip"]').tooltip(); 
            $("input, select").on("change keyup ", function(){
                $(this).closest(".zRow").find("#is_edited").val("Y");
            });  
            this.data("menuId",menuId);
            this.data("specsId",specsId);
            this.find("select[name='trend_menu_id']").dataBind({
                 url    : execURL + "trend_menus_dd_sel"
                ,text   : "menu_name"
                ,value  : "menu_id"
            });    
      
            $.each( $("[name='criteria_id'") ,function(){
                var _$select = $(this).closest(".zRow").find("select[name='pcriteria_id']");
                _$select.dataBind({
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

function showModalRemoveDup(criteriaId,specsId,name) {
    $(".colval").hide();
    g$mdl = $("#" + gMdlRD); 
    g$mdl.find(".modal-title").text("Remove Duplicate  » " + name ) ;
    g$mdl.modal({ show: true, keyboard: false, backdrop: 'static' });
    displayRemoveDuplicate(criteriaId,specsId);
}  

function showModalCriteriaColumnValues(colName,criteriaColId,specsId) {
    g$mdl = $("#" + modalCriteriaColumnValues); 
    g$mdl.find(".modal-title").text("Criteria Column Values  » " + colName ) ;
    g$mdl.modal({ show: true, keyboard: false, backdrop: 'static' });
    displayCriteriaColumnValues(colName,criteriaColId,specsId);

}  

function displayCriteriaColumns(criteriaId,specsId){
    $("#gridCriteriaColumns").dataBind({
         sqlCode        : "C9"
        ,parameters     : { criteria_id : criteriaId }
        ,width          : $("#frm_modalCriteriaColums").width() - 80
	    ,height         : 400
        ,blankRowsLimit :5
        ,dataRows       :[
    		 { text: "Column Name"              , width:250     , style:"text-align:left;" 
    		     ,onRender : function(d){
    		         return bs({name:"criteria_column_id"  ,type:"hidden",value: svn(d,"criteria_column_id")})
    		                                +   bs({name:"criteria_id"  ,type:"hidden",value: criteriaId })
    		                                +   bs({name:"is_edited",type:"hidden" })
    		                                +   bs({name:"column_name"  ,type:"select",value: svn(d,"column_name") });
    		                               
    		        }
    		 }
    		 ,{ text: "Alias Name"              ,  width:125    , style:"text-align:left;" 
    		     ,onRender: function(d){
    		         return bs({name:"alias_name",  type:"input", value: svn(d,"alias_name")});
    		     }
    		 }
    		 ,{ text: "Operator Name"           ,  width:125    , style:"text-align:left;" 
    		     ,onRender: function(d){
    		         return bs({name:"operator_value",  type:"select", value: svn(d,"operator_value")});
    		     }
    		 }
    		 ,{ text: "List Values"             ,width:80      , style:"text-align:center;"
    		        ,onRender   :   function(d){
    		           return "<span class='lst-icon'> &nbsp;<span>";
                    }
    		  }
    		 ,{ text: "Column Value1"           , width:130     , style:"text-align-last:center;" 
    		     ,onRender : function(d){
    		         if(svn(d,"operator_value") === ""){
    		           return bs({name:"column_value"      , type:"select" , value: svn(d,"column_value") ,class:"hide"});   
    		         } 
    		         else{
    		           return bs({name:"column_value"      , type:"select" , value: svn(d,"column_value")}); 
    		         } 
    		     }
    		 }
    		 ,{ text: "Column Value2"           , width:130     , style:"text-align-last:center;"  
    		     ,onRender : function(d){
    		         return bs({name:"column_value2"    , type:"select" , value: svn(d,"column_value2")}); 
    		     }
    		     
    		 }
    		 ,{ text: "Column Value3"           , width:130     , style:"text-align-last:center;"  
    		     ,onRender : function(d){
    		         return bs({name:"column_value3"    , type:"input" , value: svn(d,"column_value3")}); 
    		     }
    		     
    		 }
    		 ,{ text: "Math Function"           , width:100     , style:"text-align:left;"  
    		     ,onRender : function(d){
    		         return bs({name:"math_function"    , type:"select" , value: svn(d,"math_function")}); 
    		     }
    		     
    		 }
    		 ,{ text: "Display on Chart"    , name:"is_output"          , type:"yesno"   , defaultValue:"Y"  , width:110   , style:"text-align-last:center;" }
    		 ,{ text: "Is From To"          , name:"is_fromto"          , type:"yesno"   , defaultValue:"Y"  , width:100   , style:"text-align-last:center;" }
    		 ,{ text: "Logical Operator"    , width:130                 , style:"text-align-last:center;"                 
    		     ,onRender: function(d){
    		         return bs({ name:"logical_operator"   , type:"select" , value: svn(d,"logical_operator")})
    		     }
    		 }
    		 ,{ text: "Color Preference"    , width:180                 , style:"text-align-last:center;" 
    		     ,onRender: function(d){
    		        return bs({name:"color_pref"    , type:"select" , value: svn(d,"color_pref")}); 
    		     }
    		 }

	    ]
	    ,onComplete : function(){
	        var  _this = this
	            ,_zRow = this.find(".zRow")
                ,_setDdlvalues = function($zRow,harnessName){
                        if(harnessName === "") return;
                        $zRow.find("select[name='column_value']").dataBind({
                            url: execURL + "reference_table_column_values_sel @specs_id=" + specsId + ",@column_name=" + harnessName  
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
                                        case "NOT IN" :
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
                            url: execURL + "reference_table_column_values_sel @specs_id=" + specsId + ",@column_name=" + harnessName  
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
                    var _colName = $zRow.find("select[name='column_name']").val();
                    var _criteriaColId = $zRow.find("#criteria_column_id").val();
                    console.log("specsId",specsId);
                    var _href = "<a href='javascript:void(0);' class='btn btn-sm'  onclick='showModalCriteriaColumnValues(\""+ _colName +"\",\""+ _criteriaColId +"\",\""+ specsId +"\");'  ><i class='fas fa-link'></i> </a>";
                    var _link = ( (value =="IN" || value =="NOT IN") ?  _href : "");
                    $zRow.find(".lst-icon").html(_link);
                }
	        ;

	        _this.data("criteriaId", criteriaId);
            _this.data("specsId",specsId);
            _this.find("input, select").on("change keyup ", function(){
                $(this).closest(".zRow").find("#is_edited").val("Y");
            }); 

            _this.find("select[name='logical_operator']").fillSelect({data : 
                [  {text : "AND", value : "AND"}
                  ,{text : "OR" , value : "OR"}
                ]
            });
	       
	        _this.find("select[name='color_pref']").dataBind({
                 url    : execURL + "color_references_sel"
                ,text   : "color_name"
                ,value  : "color_id"
            });   
           
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
                    var _optVal = _$zRow.find("select[name='operator_value']").val();
                    //trigger display upon user selection
                    if( ["IN","NOT IN","ISNULL",""].includes(_optVal) ) 
                        _$column_value1.css({"display":"none"}); 
                    else 
                        _$column_value1.css({"display":"unset"});
                        
                    if(_optVal  !== "BETWEEN" )
                        _$column_value2.css({"display":"none"}); 
                    else 
                        _$column_value2.css({"display":"unset"});
                    
                    if(_optVal !== "IN" || _optVal !== "NOT IN") $(".colval").hide(); 
                    _displayListIcon( this.closest(".zRow"), $(this).val() );
                }
             });  

    	
	         $("select[name='math_function']").dataBind( "mathfunction");        
	    }
    });    
}  

function displayRemoveDuplicate(criteriaId,specsId){
    $("#gridRD").dataBind({
         sqlCode        : "C102"
        ,parameters     : { criteria_id : criteriaId}
        //,width          : 250
	   // ,height         : 200
	    ,blankRowsLimit : 5
        ,dataRows       :[
    		 { text:   "Column Name"    , width:250  , style:"text-align:left;"   
    		    ,onRender : function(d){
                     return bs({name:"criteria_rd_id"   ,type:"hidden"      ,value: svn(d,"criteria_rd_id")})
                        +   bs({name:"criteria_id"      ,type:"hidden"      ,value: criteriaId })
                        +   bs({name:"is_edited"        ,type:"hidden" })
                        +   bs({name:"column_name"      ,type:"select"      ,value: svn(d,"column_name")}); 
                }             
    		 }	 
	    ]
	    ,onComplete : function(o){
	        var _zRow = this.find(".zRow")
             _zRow.find("select[name='column_name']").dataBind({
                 url            : execURL + "reference_table_columns_sel @specs_id=" + specsId  
                ,text           : "table_column_name"
                ,value          : "column_name"
            }); 
           
	    }
    });        
}

function displayCriteriaColumnValues(colName,criteriaColId,specsId){
    $("#gridCriteriaColumnValues").dataBind({
         sqlCode        : "C7"
        ,parameters     : { criteria_column_id : criteriaColId}
        ,width          : 350
	    //,height         : 400
        ,blankRowsLimit :5
        ,dataRows       :[
    		 { text:   "Attribute Value"    , width:300  , style:"text-align:left;"   
    		    ,onRender : function(d){
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
                this.data("specsId", specsId);
                this.find("input, select").on("change keyup ", function(){
                    $(this).closest(".zRow").find("#is_edited").val("Y");
                });  
                this.find("select[name='attribute_value']").dataBind({
                    url: execURL + "reference_table_column_values_sel @specs_id=" + specsId + ",@column_name='" + colName + "'"  
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

function submitDataRD(){
    var _$grid =  $("#gridRD");
       _$grid.jsonSubmit({
             procedure: "criteria_rd_columns_upd"
            ,onComplete: function (data) {
                if(data.isSuccess===true) {
                    zsi.form.showAlert("alert");
                    $("#frm_modalRemoveDuplicate").find(".close").click();
                }
            }
            
        });
}   

function submitData2(){
    var _$grid = $("#gridCriteriaColumnValues");
        _$grid.jsonSubmit({
             procedure: "criteria_column_values_upd"
            ,onComplete: function (data) {
            if(data.isSuccess===true) zsi.form.showAlert("alert");
            displayCriteriaColumnValues(_$grid.data("colName"),_$grid.data("criteriaColId"),_$grid.data("specsId"));
            $("#frm_modalWindowCriteriaColumnValues").find(".close").click();
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

// ---------------------------------- CHART ----------------------------------//

function showModalChart(criteriaId, name) {
    gPrmCriteriaId = criteriaId;
    gPrmCriteriaName = name;
    g$mdl = $("#" + modalChart); 
    g$mdl.find(".modal-title").text( name ) ;
    g$mdl.modal({ show: true, keyboard: false, backdrop: 'static' });
    
    gtw = new zsi.easyJsTemplateWriter("#chart_container").new();
    
    if(gGridType==="E"){
        displayChartElectrical(criteriaId);
    }
    else if(gGridType==="M"){
        displayChartMechanical(criteriaId);
    }
} 

function displayChartElectrical(criteriaId){
    var _menu = $.trim(gMenuName);
    var _subMenu = $.trim(gPrmCriteriaName);
   
    getDataByCriteriaId(criteriaId, function(){
        setMYRange();
        if(_menu === "Vehicle Architecture"){
        
        }
        else if(_menu === "Wires & Cables"){
            
            if(_subMenu.search("Overall wire usage lower than 0.5 CSA") > -1){
                setCharTemplate(criteriaId, 2, function(container){
                    displayPieSmallWires(container[0]);
                    displayColumnSmallWires(container[1]);
                });
            }
            else if(_subMenu.search("New Wire Sizes") > -1){
                setCharTemplate(criteriaId, 2, function(container){
                    displayPieNewWireSizes(container[0]);
                    displayColumnNewWireSizes(container[1]);
                });
            }
            else if(_subMenu.search("Smaller wire sizes in High Flexible areas") > -1){
                setCharTemplate(criteriaId, 2, function(container){
                    displayPieSMHighFlex(container[0]);
                    displayColumnSMHighFlex(container[1]);
                });
            }
            else if(_subMenu.search("Smaller wire sizes in Engine Compartment areas") > -1){
                setCharTemplate(criteriaId, 2, function(container){
                    displayPieSMEngineComp(container[0]);
                    displayColumnSMEngineComp(container[1]);
                });
            }
            else if(_subMenu.search("PVC wires in Engine Compartment") > -1){
                setCharTemplate(criteriaId, 2, function(container){
                    displayPiePVCEngineComp(container[0]);
                    displayColumnPVCEngineComp(container[1]);
                });
            }
            else if(_subMenu.search("New Conductor Technology with lesser dimensions") > -1){
               setCharTemplate(criteriaId, 1, function(container){
                    displayWireTechDiameter(container[0]);
                });
            }
            else if(_subMenu.search("New Conductor Technology with lesser weight") > -1){
                setCharTemplate(criteriaId, 1, function(container){
                    displayWireTechWeight(container[0]);
                });
            } 
            else if(_subMenu.search("New Technology on wire Conductor") > -1){
                setCharTemplate(criteriaId, 2, function(container){
                    displayPieNewTechWireConductor(container[0]);
                    displayColumnNewTechWireConductor(container[1]);
                });
            } 
            else if(_subMenu.search("Overall wire usage lower than 1.0 CSA - Marc") > -1){
                setCharTemplate(criteriaId, 2, function(container){
                    displayPieOverallCSAMarc(container[0]);
                    displayColumnOverallCSAMarc(container[1]);
                });
            }
            else{
                
            }
        }
        else if(_menu === "Power Distribution"){
        
        }
        else if(_menu === "Grounding Distribution"){
            
        }
        else if(_menu === "Safety Critical Circuits"){
            
        }
        else if(_menu === "Network Topology"){
            // setCharTemplate(criteriaId, 2, function(container){
            //     displayPieNetworkTopology(container[0]);
            //     displayColumnNetworkTopology(container[1]);
            // });
        }
    });
}

function displayChartMechanical(criteriaId){
    var _menu = $.trim(gMenuName);
    var _subMenu = $.trim(gPrmCriteriaName);
    
    getDataByCriteriaId(criteriaId, function(){
        setMYRange();
        if(_menu === "Coverings"){
        
        }    
        else if(_menu === "Ground Eyelet"){ 
            setCharTemplate(criteriaId, 2, function(container){
                displayPieGroundEyelet(container[0]);
                displayColumnGroundEyelet(container[1]);
            })
        }    
        else if(_menu === "Coverings"){
            
        }
        else if(_menu === "Clips & Retainers"){
            setCharTemplate(criteriaId, 1, function(container){
                displayChartRetainer(container[0]);
            })
        }
        else if(_menu === "Grommets"){
            setCharTemplate(criteriaId, 2, function(container){
                displayPieGrommets(container[0]);
                displayColumnGrommets(container[1]);
            });
        }
        else if(_menu === "Though Shield Bracket"){
            setCharTemplate(criteriaId, 2, function(container){
                displayPieSTC(container[0]);
                displayColumnSTC(container[1]);
            });
        }
    });
}

// ----------------------------- CHART FUNCTIONS ---------------------------- //

function setLegendSize(chart){
    chart.legend = new am4charts.Legend();
    chart.legend.labels.template.fontSize = 10;
    chart.legend.valueLabels.template.fontSize = 10;
    chart.legend.itemContainers.template.dy = 10;
    chart.legend.itemContainers.template.paddingTop = 1;
    chart.legend.itemContainers.template.paddingBottom = 1;
        
    var markerTemplate = chart.legend.markers.template;
    markerTemplate.width = 10;
    markerTemplate.height = 10;
}

function setTrendResult(o, wire_guage){
    if(o.length > 0){
        var lastObj = o[o.length - 1];
        var secondObj = o[o.length - 2];
        
        var result = "";
        var status = "";
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
                status = inc;
            }else{
                status = dec;
            }
            result += "% of Lower "+ wire_guage +" - "+ status
            result += "<br>";
            
            if(lastValBW > secondValBW) {
                status = inc;
            }else{
                status = dec;
            }
            result += "% of Higer "+ wire_guage +" - "+ status
            
        }
        
        var _tw = new zsi.easyJsTemplateWriter();
        
        $("#chart_container").append( _tw.trendResult({ trend: result }).html() );
    }
}

function setWireTrend(data){
    if(data.length > 0){
        var _trend = "";
        var lastObj = data[data.length - 1];
        $.each(lastObj, function(k, v){
            var _key = $.trim(k.replace("_","."));
            if($.isNumeric( _key ) && v !== 0){// || _key.indexOf(".") !== -1){
                _trend += _key + '<br>';
            }
        });
        
        var _tw = new zsi.easyJsTemplateWriter()
        $("#chart_container").append( _tw.trendResult({ trend: _trend }).html() );
                
    }
}

function setTypeTrend(data){
    if(data.length > 0){
        var _trend = "";
        var lastObj = data[data.length - 1];
        $.each(lastObj, function(k, v){
            var _key = $.trim(k.replace("_","."));
            if(!isContain(_key, "region") && !isContain(_key, "category") && !isContain(_key, "year")){// || _key.indexOf(".") !== -1){
                _trend += _key + '<br>';
            }
        });
        
        var _tw = new zsi.easyJsTemplateWriter()
        $("#chart_container").append( _tw.trendResult({ trend: _trend }).html() );
                
    }
}

function setMYRange(){
    if(gModelYears.length > 0){
        var _res = getFirstAndLastItem(gModelYears, "name");
        var _from = _res.first;
        var _to = _res.last;
        
        gMYFrom = _from;
        gMYTo = _to;
        
        if(gModelYears.length > 1){
            gMYRange = "MY" + _from + " - MY" + _to;
        }else{
            gMYRange = "MY" + _from;
        }
    }
    $("#chart_range").html(gMYRange);
}

function sortBy(obj, key){
    obj.sort(function(a, b) {
      var nameA = a[key].toUpperCase(); // ignore upper and lowercase
      var nameB = b[key].toUpperCase(); // ignore upper and lowercase
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
    
      // names must be equal
      return 0;
    });
    
    return obj;
}

function isContain(string, value){
    var _res = false;
    if (string.search(value) > -1){
        _res = true;
    }
    return _res;
} 
 
function getFirstAndLastItem(obj, key) {
    var firstItem = obj[0];
    var lastItem = obj[obj.length-1];
    
    if(key) {
        firstItem = firstItem[key];
        lastItem = lastItem[key];
    }
    
    var objOutput = {};
    objOutput.first = firstItem;
    objOutput.last = lastItem;
    
    return objOutput;
} 

function getDistinctKey(data){
    var _key = "";
    if(data.length > 0){
        $.each(Object.keys(data[0]), function(i, key){
           if(key !== "location" && key !== "location_dtl" && key !== "REGION_NAME" && key !== "MODEL_YEAR"){
               _key = key;
           }
        });
    }
    return _key;
}

function setCriteriaUrl(criteriaId){
    var _url = "";
    var _staticMY = new Date().getFullYear() - 2;
    var _menuName = $.trim(gMenuName);
    
    // Set URL For ELECTRICAL
    if(gGridType === "E"){
        if(_menuName === "Wires & Cables"){
            if(gPrmCriteriaName.search("New Conductor Technology with lesser dimensions") > -1){
                _url = "wire_tech_lower_upper_diameter @byMY="+ _staticMY +",@criteria_id="+ criteriaId;
            }
            else if(gPrmCriteriaName.search("New Conductor Technology with lesser weight") > -1){
                _url = "wire_tech_lower_upper_weight @model_year="+ _staticMY +",@criteria_id="+ criteriaId;
            }
            else{
                _url = "dynamic_wires_usage_summary @byRegion='Y',@byMY='Y',@criteria_id="+ criteriaId;
            }
        }
        else if(_menuName === "Network Topology"){
            _url = "dynamic_network_topology_sel @byMY='Y',@byRegion='Y',@criteria_id="+ criteriaId
        }
    }
    
    // Set URL For MECHANICAL
    if(gGridType === "M"){
        if(_menuName === "Ground Eyelet"){
            _url = "dynamic_cts_usage_summary @byMY='Y',@byRegion='Y',@criteria_id="+ criteriaId;
        }
        else if(_menuName === "Coverings"){
         
        }    
        else if(_menuName === "Clips & Retainers"){
            _url = "dynamic_retainers_sel @byMY='Y',@byRegion='Y',@criteria_id="+ criteriaId;
        }
        else if(_menuName === "Grommets"){
            _url = "dynamic_grommets_sel @byMY='Y',@byRegion='Y',@criteria_id="+ criteriaId;
        } 
        else if(_menuName === "Splice"){
            _url = "";
        }
        else if(_menuName === "Though Shield Bracket"){
            _url = "dynamic_stc_sel @byMY='Y',@byRegion='Y',@criteria_id="+ criteriaId;
        }
    }
    
    return _url;
}

function getDataByCriteriaId(criteriaId, callback){
    if($.trim(criteriaId)){  
        var _url = setCriteriaUrl(criteriaId);
        var _param = "";
         
        // Set additional parameters
        if(gPrmIncludeCYear==="Y") 
            _param += ",@no_years='"+ gPrmNoYears +"',@include_cyear='Y'";
        else if(gPrmIncludeCYear==="N" && gPrmNoYears!==""){
            _param += ",@no_years='"+ gPrmNoYears +"',@include_cyear='N'";
        }

        $.get(execURL + _url //+ param
        , function(data){
            gData = data.rows;
            gPrmCriteriaId = criteriaId;
            
            if(gPrmCriteriaName.search("Overall") > -1){
                gRegionNames = gData.groupBy(["region"]);
                gModelYears = gData.groupBy(["model_year"]);
            }else{
                gRegionNames = gData.groupBy(["REGION_NAME"]);
                gModelYears = gData.groupBy(["MODEL_YEAR"]);
            }
            
            gRegionNames = sortBy(gRegionNames, "name");
            gModelYears = sortBy(gModelYears, "name");
                
            //sort by name
            // if(gRegionNames.length > 0){
            //     gRegionNames.sort(function(a, b) {
            //       var nameA = a.name.toUpperCase(); // ignore upper and lowercase
            //       var nameB = b.name.toUpperCase(); // ignore upper and lowercase
            //       if (nameA < nameB) {
            //         return -1;
            //       }
            //       if (nameA > nameB) {
            //         return 1;
            //       }
                
            //       // names must be equal
            //       return 0;
            //     });
            // }
            // //sort by name
            // if(gModelYears.length > 0){
                //     gModelYears.sort(function(a, b) {
                //       var nameA = a.name.toUpperCase(); // ignore upper and lowercase
                //       var nameB = b.name.toUpperCase(); // ignore upper and lowercase
                //       if (nameA < nameB) {
                //         return -1;
                //       }
                //       if (nameA > nameB) {
                //         return 1;
                //       }
                    
                //       // names must be equal
                //       return 0;
                //     });
                // }
           
            callback();
        });
    }
}

function setCharTemplate(criteriaId, graphs,callback){
    var _tw = new zsi.easyJsTemplateWriter();
    var _container = [];
    $("#chart_container").html(function(){
        for(var i=1; i <= graphs; i++){
            var _chartId = "chart_"+ criteriaId +"_"+ i;
            _container.push(_chartId);
            
            _tw.chartCard({ 
                id: _chartId,
                header:"d-none"
            });
        }
        return _tw.html();
    });
    
    callback(_container);
}

// -------------------------------- ELECTRICAL ------------------------------ //

//           ***** PIE CHART *****              

function displayPieSmallWires(container){
    //Set Data
    var _data = [];
    $.each(gData.groupBy(["model_year"]), function(i, my) { 
        var _my = my.name;
        var _items = my.items;
        var _big = 0; //Big Wires
        var _small = 0; //Small Wires
        var _subBig = [];
        var _subSmall = [];
        
        $.each(_items.groupBy(["alias_name"]), function(x, group){
            var _alias = group.name.toLowerCase();
            var _sum = group.items.reduce(function (accumulator, currentValue) {
                return accumulator + currentValue.wire_count;
            }, 0);
  
            var _sub = [];
            $.each(group.items.groupBy(['wire_gauge']), function(y, wire){
                var _sumWire = wire.items.reduce(function (accumulator, currentValue) {
                    return accumulator + currentValue.wire_count;
                }, 0);
                
                _sub.push({
                    type: wire.name,
                    percent: _sumWire
                });
            });
  
            if(_alias.indexOf("other") != -1){
                _big = _sum;
                _subBig = [];
            }
            if(_alias.indexOf("small") != -1){
                _small = _sum;
                _subSmall = _sub;
            }
        });
        
        _data.push({
            type: "Wire sizes above 0.50 CSA",
            model_year : +_my,
            percent :  +_big,
            subs : _subBig
        },{
            type: "Wire sizes below 0.50 CSA",
            model_year : +_my,
            percent :  +_small,
            subs : _subSmall
        });
    });
    
    var container = am4core.create(container, am4core.Container);
    container.width = am4core.percent(100);
    container.height = am4core.percent(100);
    container.layout = "horizontal";
    
    var _createChart = function(data, year){
        var chart = container.createChild(am4charts.PieChart);
        //chart.width = am4core.percent(80);
        chart.paddingTop= 15;
        chart.paddingBottom = 15;
        var title = chart.titles.create();
        title.text =  "MY" + year;
        //title.fontSize = 12;
        title.fontWeight = 800;
        title.marginBottom = 0;
        
        //var types = data;
        // Add data
        var selected;
        var generateChartData = function() {
            var chartData = [];
            for (var i = 0; i < data.length; i++) {
                if (i == selected) {
                    for (var x = 0; x < data[i].subs.length; x++) {
                        chartData.push({
                            type: data[i].subs[x].type,
                            percent: data[i].subs[x].percent,
                            color: data[i].color,
                            pulled: true
                        });
                    }
                } else {
                    chartData.push({
                        type: data[i].type,
                        percent: data[i].percent,
                        color: data[i].color,
                        id: i
                    });
                }
            }
            return chartData;
        };
        
        chart.data = generateChartData();
    
        // Add and configure Series
        var pieSeries = chart.series.push(new am4charts.PieSeries());
        pieSeries.dataFields.value = "percent";
        pieSeries.dataFields.category = "type";
        pieSeries.slices.template.propertyFields.fill = "color";
        pieSeries.slices.template.propertyFields.isActive = "pulled";
        pieSeries.slices.template.strokeWidth = 0;
        pieSeries.paddingBottom = 10;
        pieSeries.maxHeight = "80%";
        pieSeries.colors.step = 2;
        
        pieSeries.ticks.template.disabled = true;
        pieSeries.alignLabels = false;
        pieSeries.labels.template.fontSize = 12;
        pieSeries.labels.template.text = "{value.percent.formatNumber('#.00')}%";
        pieSeries.labels.template.radius = am4core.percent(-40);
        //pieSeries.labels.template.relativeRotation = 90;
        pieSeries.labels.template.fill = am4core.color("white");
    
        chart.legend = new am4charts.Legend();
        //chart.legend.height = 50;
        chart.legend.labels.template.fontSize = 12;
        chart.legend.valueLabels.template.fontSize = 12;
        chart.legend.itemContainers.template.paddingTop = 1;
        chart.legend.itemContainers.template.paddingBottom = 1;
        //chart.legend.labels.template.truncate = false;
        //chart.legend.labels.template.wrap = true;
        //chart.legend.itemContainers.template.paddingRight = 0;
        //chart.legend.itemContainers.template.paddingLeft = 0;
        
        var markerTemplate = chart.legend.markers.template;
        markerTemplate.width = 12;
        markerTemplate.height = 12;
        
        pieSeries.slices.template.events.on("hit", function(event) {
            if(event.target.dataItem.dataContext.id !== 0){
                if (event.target.dataItem.dataContext.id !== undefined ) {
                    selected = event.target.dataItem.dataContext.id;
                } else {
                    selected = undefined;
                }
                chart.data = generateChartData();
            }
            
        });
        
        // pieSeries.labels.template.adapter.add("relativeRotation", function(relativeRotation, target) {
        //     if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
        //         return 90;
        //     }
        //     return relativeRotation;
        // });
        
        pieSeries.labels.template.adapter.add("radius", function(radius, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return 0;
            }
            return radius;
        });
        
        pieSeries.labels.template.adapter.add("fill", function(color, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return am4core.color("#000");
            }
            return color;
        });
    };

    $.each(gModelYears, function(i, v){
        var _my = v.name;
        var _res = _data.filter(function (item) {
        	return item.model_year == _my;
        });
        
        _createChart(_res, _my);
    });
}

function displayPieNewWireSizes(container){
    var _data = [];
    $.each(gModelYears, function(x, my) { 
        var _my = my.name;
        
        $.each(gData.groupBy(["New_Wires"]), function(y, w) { 
            var _count = 0;
            var _wire = w.name;
            var _wireNew = _wire.replace(".","_");

            var _res = w.items.filter(function (item) {
            	return item.New_Wires == _wire && item.MODEL_YEAR == _my;
            });

            _count = _res.reduce(function (accumulator, currentValue) {
                return accumulator + currentValue.COUNT_WIRE_GAUGE;
            }, 0);
            
            _data.push({
                model_year: +_my,
                wire_guage: _wire,
                wire_count: _count
            });
        });
        
    });

    var container = am4core.create(container, am4core.Container);
    container.width = am4core.percent(100);
    container.height = am4core.percent(100);
    container.layout = "horizontal";
    
    var _createChart = function(data, year){
        var chart = container.createChild(am4charts.PieChart);
        chart.data = data;
        chart.paddingTop= 15;
        chart.paddingBottom = 15;
        
        var title = chart.titles.create();
        title.text =  "MY" + year;
        //title.fontSize = 12;
        title.fontWeight = 800;
        title.marginBottom = 0;
        
        // Add and configure Series
        var pieSeries = chart.series.push(new am4charts.PieSeries());
        pieSeries.dataFields.value = "wire_count";
        pieSeries.dataFields.category = "wire_guage";
        pieSeries.slices.template.propertyFields.fill = "color";
        pieSeries.slices.template.propertyFields.isActive = "pulled";
        pieSeries.slices.template.strokeWidth = 0;
        pieSeries.paddingBottom = 10;
        pieSeries.colors.step = 2;
        
        pieSeries.ticks.template.disabled = true;
        pieSeries.alignLabels = false;
        pieSeries.labels.template.fontSize = 12;
        pieSeries.labels.template.text = "{value.percent.formatNumber('#.00')}%";
        pieSeries.labels.template.radius = am4core.percent(-40);
        //pieSeries.labels.template.relativeRotation = 90;
        pieSeries.labels.template.fill = am4core.color("white");
    
        chart.legend = new am4charts.Legend();
        chart.legend.labels.template.fontSize = 12;
        chart.legend.valueLabels.template.fontSize = 12;
        chart.legend.itemContainers.template.paddingTop = 1;
        chart.legend.itemContainers.template.paddingBottom = 1;
        
        var markerTemplate = chart.legend.markers.template;
        markerTemplate.width = 12;
        markerTemplate.height = 12;
        
        pieSeries.labels.template.adapter.add("radius", function(radius, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return 0;
            }
            return radius;
        });
        
        pieSeries.labels.template.adapter.add("fill", function(color, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return am4core.color("#000");
            }
            return color;
        });
    };

    $.each(gModelYears, function(i, v){
        var _my = v.name;
        var _res = _data.filter(function (item) {
        	return item.model_year == _my;
        });

        _createChart(_res, _my);
    });
}

function displayPieSMHighFlex(container){
    var _data = [];
    $.each(gModelYears, function(x, my) { 
        var _my = my.name;
        
        $.each(gData.groupBy(["Wires"]), function(y, w) { 
            var _count = 0;
            var _wire = w.name;
            var _wireNew = _wire.replace(".","_");

            var _res = w.items.filter(function (item) {
            	return item.Wires == _wire && item.MODEL_YEAR == _my;
            });

            _count = _res.reduce(function (accumulator, currentValue) {
                return accumulator + currentValue.COUNT_WIRE_GAUGE;
            }, 0);
            
            _data.push({
                model_year: +_my,
                wire_guage: _wire,
                wire_count: _count
            });
        });
        
    });

    var container = am4core.create(container, am4core.Container);
    container.width = am4core.percent(100);
    container.height = am4core.percent(100);
    container.layout = "horizontal";
    
    var _createChart = function(data, year){
        var chart = container.createChild(am4charts.PieChart);
        chart.data = data;
        chart.paddingTop= 15;
        chart.paddingBottom = 15;
        
        var title = chart.titles.create();
        title.text =  "MY" + year;
        //title.fontSize = 12;
        title.fontWeight = 800;
        title.marginBottom = 0;
        
        // Add and configure Series
        var pieSeries = chart.series.push(new am4charts.PieSeries());
        pieSeries.dataFields.value = "wire_count";
        pieSeries.dataFields.category = "wire_guage";
        pieSeries.slices.template.propertyFields.fill = "color";
        pieSeries.slices.template.propertyFields.isActive = "pulled";
        pieSeries.slices.template.strokeWidth = 0;
        pieSeries.paddingBottom = 10;
        pieSeries.colors.step = 2;
        
        pieSeries.ticks.template.disabled = true;
        pieSeries.alignLabels = false;
        pieSeries.labels.template.fontSize = 12;
        pieSeries.labels.template.text = "{value.percent.formatNumber('#.00')}%";
        pieSeries.labels.template.radius = am4core.percent(-40);
        //pieSeries.labels.template.relativeRotation = 90;
        pieSeries.labels.template.fill = am4core.color("white");
    
        chart.legend = new am4charts.Legend();
        chart.legend.labels.template.fontSize = 12;
        chart.legend.valueLabels.template.fontSize = 12;
        chart.legend.itemContainers.template.paddingTop = 1;
        chart.legend.itemContainers.template.paddingBottom = 1;
        
        var markerTemplate = chart.legend.markers.template;
        markerTemplate.width = 12;
        markerTemplate.height = 12;
        
        pieSeries.labels.template.adapter.add("radius", function(radius, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return 0;
            }
            return radius;
        });
        
        pieSeries.labels.template.adapter.add("fill", function(color, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return am4core.color("#000");
            }
            return color;
        });
    };

    $.each(gModelYears, function(i, v){
        var _my = v.name;
        var _res = _data.filter(function (item) {
        	return item.model_year == _my;
        });

        _createChart(_res, _my);
    });
}

function displayPieSMEngineComp(container){
    var _data = [];
    $.each(gModelYears, function(x, my) { 
        var _my = my.name;
        
        $.each(gData.groupBy(["WireGauge"]), function(y, w) { 
            var _count = 0;
            var _wire = w.name;
            var _wireNew = _wire.replace(".","_");

            var _res = w.items.filter(function (item) {
            	return item.WireGauge == _wire && item.MODEL_YEAR == _my;
            });
          
            _count = _res.reduce(function (accumulator, currentValue) {
                return accumulator + currentValue.COUNT_WIRE_GAUGE;
            }, 0);
            
            _data.push({
                model_year: +_my,
                wire_guage: _wire,
                wire_count: _count
            });
        });
        
    });

    var container = am4core.create(container, am4core.Container);
    container.width = am4core.percent(100);
    container.height = am4core.percent(100);
    container.layout = "horizontal";
    
    var _createChart = function(data, year){
        var chart = container.createChild(am4charts.PieChart);
        chart.data = data;
        chart.paddingTop= 15;
        chart.paddingBottom = 15;
        
        var title = chart.titles.create();
        title.text =  "MY" + year;
        //title.fontSize = 12;
        title.fontWeight = 800;
        title.marginBottom = 0;
        
        // Add and configure Series
        var pieSeries = chart.series.push(new am4charts.PieSeries());
        pieSeries.dataFields.value = "wire_count";
        pieSeries.dataFields.category = "wire_guage";
        pieSeries.slices.template.propertyFields.fill = "color";
        pieSeries.slices.template.propertyFields.isActive = "pulled";
        pieSeries.slices.template.strokeWidth = 0;
        pieSeries.paddingBottom = 10;
        pieSeries.colors.step = 2;
        
        pieSeries.ticks.template.disabled = true;
        pieSeries.alignLabels = false;
        pieSeries.labels.template.fontSize = 12;
        pieSeries.labels.template.text = "{value.percent.formatNumber('#.00')}%";
        pieSeries.labels.template.radius = am4core.percent(-40);
        //pieSeries.labels.template.relativeRotation = 90;
        pieSeries.labels.template.fill = am4core.color("white");
    
        chart.legend = new am4charts.Legend();
        chart.legend.labels.template.fontSize = 12;
        chart.legend.valueLabels.template.fontSize = 12;
        chart.legend.itemContainers.template.paddingTop = 1;
        chart.legend.itemContainers.template.paddingBottom = 1;
        
        var markerTemplate = chart.legend.markers.template;
        markerTemplate.width = 12;
        markerTemplate.height = 12;
        
        pieSeries.labels.template.adapter.add("radius", function(radius, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return 0;
            }
            return radius;
        });
        
        pieSeries.labels.template.adapter.add("fill", function(color, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return am4core.color("#000");
            }
            return color;
        });
    };

    $.each(gModelYears, function(i, v){
        var _my = v.name;
        var _res = _data.filter(function (item) {
        	return item.model_year == _my;
        });

        _createChart(_res, _my);
    });
}

function displayPiePVCEngineComp(container){
    var _data = [];
    $.each(gModelYears, function(x, my) { 
        var _my = my.name;
        
        $.each(gData.groupBy(["WireInsulation"]), function(y, w) { 
            var _count = 0;
            var _wire = w.name;
            var _wireNew = _wire.replace(".","_");

            var _res = w.items.filter(function (item) {
            	return item.WireInsulation == _wire && item.MODEL_YEAR == _my;
            });
          
            _count = _res.reduce(function (accumulator, currentValue) {
                return accumulator + currentValue.COUNT_WIRE_INSULATION;
            }, 0);
            
            _data.push({
                model_year: +_my,
                wire_guage: _wire,
                wire_count: _count
            });
        });
        
    });

    var container = am4core.create(container, am4core.Container);
    container.width = am4core.percent(100);
    container.height = am4core.percent(100);
    container.layout = "horizontal";
    
    var _createChart = function(data, year){
        var chart = container.createChild(am4charts.PieChart);
        chart.data = data;
        chart.paddingTop= 15;
        chart.paddingBottom = 15;
        
        var title = chart.titles.create();
        title.text =  "MY" + year;
        //title.fontSize = 12;
        title.fontWeight = 800;
        title.marginBottom = 0;
        
        // Add and configure Series
        var pieSeries = chart.series.push(new am4charts.PieSeries());
        pieSeries.dataFields.value = "wire_count";
        pieSeries.dataFields.category = "wire_guage";
        pieSeries.slices.template.propertyFields.fill = "color";
        pieSeries.slices.template.propertyFields.isActive = "pulled";
        pieSeries.slices.template.strokeWidth = 0;
        pieSeries.paddingBottom = 10;
        pieSeries.colors.step = 2;
        
        pieSeries.ticks.template.disabled = true;
        pieSeries.alignLabels = false;
        pieSeries.labels.template.fontSize = 12;
        pieSeries.labels.template.text = "{value.percent.formatNumber('#.00')}%";
        pieSeries.labels.template.radius = am4core.percent(-40);
        //pieSeries.labels.template.relativeRotation = 90;
        pieSeries.labels.template.fill = am4core.color("white");
    
        chart.legend = new am4charts.Legend();
        chart.legend.labels.template.fontSize = 12;
        chart.legend.valueLabels.template.fontSize = 12;
        chart.legend.itemContainers.template.paddingTop = 1;
        chart.legend.itemContainers.template.paddingBottom = 1;
        
        var markerTemplate = chart.legend.markers.template;
        markerTemplate.width = 12;
        markerTemplate.height = 12;
        
        pieSeries.labels.template.adapter.add("radius", function(radius, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return 0;
            }
            return radius;
        });
        
        pieSeries.labels.template.adapter.add("fill", function(color, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return am4core.color("#000");
            }
            return color;
        });
    };

    $.each(gModelYears, function(i, v){
        var _my = v.name;
        var _res = _data.filter(function (item) {
        	return item.model_year == _my;
        });

        _createChart(_res, _my);
    });
    // var _data = [];
    // $.each(gModelYears, function(x, my) { 
    //     var _my = my.name;
        
    //     $.each(gData.groupBy(["WireInsulation"]), function(y, w) { 
    //         var _count = 0;
    //         var _harness = w.name;
    //         var _res = w.items.filter(function (item) {
    //         	return item.WireInsulation == _harness && item.MODEL_YEAR == _my;
    //         });
      
    //         _count = _res.reduce(function (accumulator, currentValue) {
    //             return accumulator + currentValue.COUNT_WIRE_GAUGE;
    //         }, 0);
            
    //         _data.push({
    //             model_year: +_my,
    //             harness_name: _harness,
    //             wire_count: _count
    //         });
    //     });
        
    // });

    // var container = am4core.create(container, am4core.Container);
    // container.width = am4core.percent(100);
    // container.height = am4core.percent(100);
    // container.layout = "horizontal";
    
    // var _createChart = function(data, year){
    //     var chart = container.createChild(am4charts.PieChart);
    //     chart.data = data;
    //     chart.paddingTop= 15;
    //     chart.paddingBottom = 15;
        
    //     var title = chart.titles.create();
    //     title.text =  "MY" + year;
    //     //title.fontSize = 12;
    //     title.fontWeight = 800;
    //     title.marginBottom = 0;
        
    //     // Add and configure Series
    //     var pieSeries = chart.series.push(new am4charts.PieSeries());
    //     pieSeries.dataFields.value = "wire_count";
    //     pieSeries.dataFields.category = "harness_name";
    //     pieSeries.slices.template.propertyFields.fill = "color";
    //     pieSeries.slices.template.propertyFields.isActive = "pulled";
    //     pieSeries.slices.template.strokeWidth = 0;
    //     pieSeries.paddingBottom = 10;
    //     pieSeries.colors.step = 2;
        
    //     pieSeries.ticks.template.disabled = true;
    //     pieSeries.alignLabels = false;
    //     pieSeries.labels.template.fontSize = 12;
    //     pieSeries.labels.template.text = "{value.percent.formatNumber('#.00')}%";
    //     pieSeries.labels.template.radius = am4core.percent(-40);
    //     //pieSeries.labels.template.relativeRotation = 90;
    //     pieSeries.labels.template.fill = am4core.color("white");
    
    //     chart.legend = new am4charts.Legend();
    //     chart.legend.labels.template.fontSize = 12;
    //     chart.legend.valueLabels.template.fontSize = 12;
    //     chart.legend.itemContainers.template.paddingTop = 1;
    //     chart.legend.itemContainers.template.paddingBottom = 1;
        
    //     var markerTemplate = chart.legend.markers.template;
    //     markerTemplate.width = 12;
    //     markerTemplate.height = 12;
        
    //     pieSeries.labels.template.adapter.add("radius", function(radius, target) {
    //         if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
    //             return 0;
    //         }
    //         return radius;
    //     });
        
    //     pieSeries.labels.template.adapter.add("fill", function(color, target) {
    //         if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
    //             return am4core.color("#000");
    //         }
    //         return color;
    //     });
    // };

    // $.each(gModelYears, function(i, v){
    //     var _my = v.name;
    //     var _res = _data.filter(function (item) {
    //     	return item.model_year == _my;
    //     });

    //     _createChart(_res, _my);
    // });
}

function displayPieNewTechWireConductor(container){
    var _data = [];
    $.each(gModelYears, function(x, my) { 
        var _my = my.name;
        
        $.each(gData.groupBy(["WireGauge"]), function(y, w) { 
            var _count = 0;
            var _wire = w.name;
            var _wireNew = _wire.replace(".","_");

            var _res = w.items.filter(function (item) {
            	return item.WireGauge == _wire && item.MODEL_YEAR == _my;
            });
          
            _count = _res.reduce(function (accumulator, currentValue) {
                return accumulator + currentValue.COUNT_WIRE_GAUGE;
            }, 0);
            
            _data.push({
                model_year: +_my,
                wire_guage: _wire,
                wire_count: _count
            });
        });
        
    });

    var container = am4core.create(container, am4core.Container);
    container.width = am4core.percent(100);
    container.height = am4core.percent(100);
    container.layout = "horizontal";
    
    var _createChart = function(data, year){
        var chart = container.createChild(am4charts.PieChart);
        chart.data = data;
        chart.paddingTop= 15;
        chart.paddingBottom = 15;
        
        var title = chart.titles.create();
        title.text =  "MY" + year;
        //title.fontSize = 12;
        title.fontWeight = 800;
        title.marginBottom = 0;
        
        // Add and configure Series
        var pieSeries = chart.series.push(new am4charts.PieSeries());
        pieSeries.dataFields.value = "wire_count";
        pieSeries.dataFields.category = "wire_guage";
        pieSeries.slices.template.propertyFields.fill = "color";
        pieSeries.slices.template.propertyFields.isActive = "pulled";
        pieSeries.slices.template.strokeWidth = 0;
        pieSeries.paddingBottom = 10;
        pieSeries.colors.step = 2;
        
        pieSeries.ticks.template.disabled = true;
        pieSeries.alignLabels = false;
        pieSeries.labels.template.fontSize = 12;
        pieSeries.labels.template.text = "{value.percent.formatNumber('#.00')}%";
        pieSeries.labels.template.radius = am4core.percent(-40);
        //pieSeries.labels.template.relativeRotation = 90;
        pieSeries.labels.template.fill = am4core.color("white");
    
        chart.legend = new am4charts.Legend();
        chart.legend.labels.template.fontSize = 12;
        chart.legend.valueLabels.template.fontSize = 12;
        chart.legend.itemContainers.template.paddingTop = 1;
        chart.legend.itemContainers.template.paddingBottom = 1;
        
        var markerTemplate = chart.legend.markers.template;
        markerTemplate.width = 12;
        markerTemplate.height = 12;
        
        pieSeries.labels.template.adapter.add("radius", function(radius, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return 0;
            }
            return radius;
        });
        
        pieSeries.labels.template.adapter.add("fill", function(color, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return am4core.color("#000");
            }
            return color;
        });
    };

    $.each(gModelYears, function(i, v){
        var _my = v.name;
        var _res = _data.filter(function (item) {
        	return item.model_year == _my;
        });

        _createChart(_res, _my);
    });
    
    // var _data = [];
    // $.each(gModelYears, function(x, my) {
    //     $.each(gData.groupBy(["REGION_NAME"]), function(y, r) { 
    //         var _count = 0;
    //         var _my = my.name;
    //         var _region = r.name;
    //         var _res = r.items.filter(function (item) {
    //         	return item.REGION_NAME == _region && item.MODEL_YEAR == _my;
    //         });
      
    //         _count = _res.reduce(function (accumulator, currentValue) {
    //             return accumulator + currentValue.wire_count;
    //         }, 0);
            
    //         _data.push({
    //             model_year: +_my,
    //             region_name: _region,
    //             wire_count: _count
    //         });
    //     });
    // });

    // var container = am4core.create("chartMY_" + gPrmCriteriaId, am4core.Container);
    // container.width = am4core.percent(100);
    // container.height = am4core.percent(100);
    // container.layout = "horizontal";
    
    // var _createChart = function(data, year){
    //     var chart = container.createChild(am4charts.PieChart);
    //     chart.data = data;
    //     chart.paddingTop= 15;
    //     chart.paddingBottom = 15;
        
    //     var title = chart.titles.create();
    //     title.text =  "MY" + year;
    //     //title.fontSize = 12;
    //     title.fontWeight = 800;
    //     title.marginBottom = 0;
        
    //     // Add and configure Series
    //     var pieSeries = chart.series.push(new am4charts.PieSeries());
    //     pieSeries.dataFields.value = "wire_count";
    //     pieSeries.dataFields.category = "region_name";
    //     pieSeries.slices.template.propertyFields.fill = "color";
    //     pieSeries.slices.template.propertyFields.isActive = "pulled";
    //     pieSeries.slices.template.strokeWidth = 0;
    //     pieSeries.paddingBottom = 10;
    //     pieSeries.colors.step = 2;
        
    //     pieSeries.ticks.template.disabled = true;
    //     pieSeries.alignLabels = false;
    //     pieSeries.labels.template.fontSize = 12;
    //     pieSeries.labels.template.text = "{value.percent.formatNumber('#.00')}%";
    //     pieSeries.labels.template.radius = am4core.percent(-40);
    //     //pieSeries.labels.template.relativeRotation = 90;
    //     pieSeries.labels.template.fill = am4core.color("white");
    
    //     chart.legend = new am4charts.Legend();
    //     chart.legend.labels.template.fontSize = 12;
    //     chart.legend.valueLabels.template.fontSize = 12;
    //     chart.legend.itemContainers.template.paddingTop = 1;
    //     chart.legend.itemContainers.template.paddingBottom = 1;
        
    //     var markerTemplate = chart.legend.markers.template;
    //     markerTemplate.width = 12;
    //     markerTemplate.height = 12;
        
    //     pieSeries.labels.template.adapter.add("radius", function(radius, target) {
    //         if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
    //             return 0;
    //         }
    //         return radius;
    //     });
        
    //     pieSeries.labels.template.adapter.add("fill", function(color, target) {
    //         if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
    //             return am4core.color("#000");
    //         }
    //         return color;
    //     });
    // };

    // $.each(gModelYears, function(i, v){
    //     var _my = v.name;
    //     var _res = _data.filter(function (item) {
    //     	return item.model_year == _my;
    //     });

    //     _createChart(_res, _my);
    // });
}

function displayPieTwoWayConnector(container){
    var _data = [];
    $.each(gModelYears, function(x, my) { 
        var _my = my.name;
        
        $.each(gData.groupBy(["Wires"]), function(y, w) { 
            var _count = 0;
            var _wire = w.name;
            var _res = w.items.filter(function (item) {
            	return item.Wires == _wire && item.MODEL_YEAR == _my;
            });
      
            _count = _res.reduce(function (accumulator, currentValue) {
                return accumulator + currentValue.wire_count;
            }, 0);
            
            _data.push({
                model_year: +_my,
                wire_guage: _wire,
                wire_count: _count
            });
        });
    });

    var container = am4core.create("chartMY_" + gPrmCriteriaId, am4core.Container);
    container.width = am4core.percent(100);
    container.height = am4core.percent(100);
    container.layout = "horizontal";
    
    var _createChart = function(data, year){
        var chart = container.createChild(am4charts.PieChart);
        chart.data = data;
        chart.paddingTop= 15;
        chart.paddingBottom = 15;
        
        var title = chart.titles.create();
        title.text =  "MY" + year;
        //title.fontSize = 12;
        title.fontWeight = 800;
        title.marginBottom = 0;
        
        // Add and configure Series
        var pieSeries = chart.series.push(new am4charts.PieSeries());
        pieSeries.dataFields.value = "wire_count";
        pieSeries.dataFields.category = "wire_guage";
        pieSeries.slices.template.propertyFields.fill = "color";
        pieSeries.slices.template.propertyFields.isActive = "pulled";
        pieSeries.slices.template.strokeWidth = 0;
        pieSeries.paddingBottom = 10;
        pieSeries.colors.step = 2;
        
        pieSeries.ticks.template.disabled = true;
        pieSeries.alignLabels = false;
        pieSeries.labels.template.fontSize = 12;
        pieSeries.labels.template.text = "{value.percent.formatNumber('#.00')}%";
        pieSeries.labels.template.radius = am4core.percent(-40);
        //pieSeries.labels.template.relativeRotation = 90;
        pieSeries.labels.template.fill = am4core.color("white");
    
        chart.legend = new am4charts.Legend();
        chart.legend.labels.template.fontSize = 12;
        chart.legend.valueLabels.template.fontSize = 12;
        chart.legend.itemContainers.template.paddingTop = 1;
        chart.legend.itemContainers.template.paddingBottom = 1;
        
        var markerTemplate = chart.legend.markers.template;
        markerTemplate.width = 12;
        markerTemplate.height = 12;
        
        pieSeries.labels.template.adapter.add("radius", function(radius, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return 0;
            }
            return radius;
        });
        
        pieSeries.labels.template.adapter.add("fill", function(color, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return am4core.color("#000");
            }
            return color;
        });
    };

    $.each(gModelYears, function(i, v){
        var _my = v.name;
        var _res = _data.filter(function (item) {
        	return item.model_year == _my;
        });

        _createChart(_res, _my);
    });
}

function displayPieOverallCSAMarc(container){
    //Set Data
    var _data = [];
    $.each(gData.groupBy(["model_year"]), function(i, my) { 
        var _my = my.name;
        var _items = my.items;
        var _big = 0; //Big Wires
        var _small = 0; //Small Wires
        var _subBig = [];
        var _subSmall = [];
        
        $.each(_items.groupBy(["alias_name"]), function(x, group){
            var _alias = group.name.toLowerCase();
            var _sum = group.items.reduce(function (accumulator, currentValue) {
                return accumulator + currentValue.wire_count;
            }, 0);
  
            var _sub = [];
            $.each(group.items.groupBy(['wire_gauge']), function(y, wire){
                var _sumWire = wire.items.reduce(function (accumulator, currentValue) {
                    return accumulator + currentValue.wire_count;
                }, 0);
                
                _sub.push({
                    type: wire.name,
                    percent: _sumWire
                });
            });
  
            if(_alias.indexOf("big") != -1){
                _big = _sum;
                _subBig = [];
            }
            if(_alias.indexOf("small") != -1){
                _small = _sum;
                _subSmall = _sub;
            }
        });
        
        _data.push({
            type: "Wire sizes higher 1.0 CSA",
            model_year : +_my,
            percent :  +_big,
            subs : _subBig
        },{
            type: "Wire sizes lower 1.0 CSA",
            model_year : +_my,
            percent :  +_small,
            subs : _subSmall
        });
    });
    
    var container = am4core.create(container, am4core.Container);
    container.width = am4core.percent(100);
    container.height = am4core.percent(100);
    container.layout = "horizontal";
    
    var _createChart = function(data, year){
        var chart = container.createChild(am4charts.PieChart);
        //chart.width = am4core.percent(80);
        chart.paddingTop= 15;
        chart.paddingBottom = 15;
        var title = chart.titles.create();
        title.text =  "MY" + year;
        //title.fontSize = 12;
        title.fontWeight = 800;
        title.marginBottom = 0;
        
        //var types = data;
        // Add data
        var selected;
        var generateChartData = function() {
            var chartData = [];
            for (var i = 0; i < data.length; i++) {
                if (i == selected) {
                    for (var x = 0; x < data[i].subs.length; x++) {
                        chartData.push({
                            type: data[i].subs[x].type,
                            percent: data[i].subs[x].percent,
                            color: data[i].color,
                            pulled: true
                        });
                    }
                } else {
                    chartData.push({
                        type: data[i].type,
                        percent: data[i].percent,
                        color: data[i].color,
                        id: i
                    });
                }
            }
            return chartData;
        };
        
        chart.data = generateChartData();
    
        // Add and configure Series
        var pieSeries = chart.series.push(new am4charts.PieSeries());
        pieSeries.dataFields.value = "percent";
        pieSeries.dataFields.category = "type";
        pieSeries.slices.template.propertyFields.fill = "color";
        pieSeries.slices.template.propertyFields.isActive = "pulled";
        pieSeries.slices.template.strokeWidth = 0;
        pieSeries.paddingBottom = 10;
        pieSeries.maxHeight = "80%";
        pieSeries.colors.step = 2;
        
        pieSeries.ticks.template.disabled = true;
        pieSeries.alignLabels = false;
        pieSeries.labels.template.fontSize = 12;
        pieSeries.labels.template.text = "{value.percent.formatNumber('#.00')}%";
        pieSeries.labels.template.radius = am4core.percent(-40);
        //pieSeries.labels.template.relativeRotation = 90;
        pieSeries.labels.template.fill = am4core.color("white");
    
        chart.legend = new am4charts.Legend();
        //chart.legend.height = 50;
        chart.legend.labels.template.fontSize = 12;
        chart.legend.valueLabels.template.fontSize = 12;
        chart.legend.itemContainers.template.paddingTop = 1;
        chart.legend.itemContainers.template.paddingBottom = 1;
        
        var markerTemplate = chart.legend.markers.template;
        markerTemplate.width = 12;
        markerTemplate.height = 12;
        
        pieSeries.slices.template.events.on("hit", function(event) {
            if(event.target.dataItem.dataContext.id !== 0){
                if (event.target.dataItem.dataContext.id !== undefined ) {
                    selected = event.target.dataItem.dataContext.id;
                } else {
                    selected = undefined;
                }
                chart.data = generateChartData();
            }
            
        });
        
        pieSeries.labels.template.adapter.add("radius", function(radius, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return 0;
            }
            return radius;
        });
        
        pieSeries.labels.template.adapter.add("fill", function(color, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return am4core.color("#000");
            }
            return color;
        });
    };

    $.each(gModelYears, function(i, v){
        var _my = v.name;
        var _res = _data.filter(function (item) {
        	return item.model_year == _my;
        });
        
        _createChart(_res, _my);
    });
}

//            ***** COLUMN CHART *****  

function displayColumnSmallWires(container){
    //Set Data
    var _data = [];
    $.each(gData.groupBy(["region"]), function(i, region) { 
        $.each(gModelYears, function(x, my) {
            var _region = region.name;
            var _my = my.name;
            var _big = 0; //Big Wires
            var _small = 0; //Small Wires
            var _res = region.items.filter(function (item) {
            	return item.model_year == _my;
            });
          
            if( _res.length > 0 ) {
                $.each(_res, function(i, v){
                    var _alias = v.alias_name.toLowerCase();
                    if(_alias.indexOf("other") != -1){
                        _big += v.wire_count;
                    }
                    if(_alias.indexOf("small") != -1){
                        _small += v.wire_count;
                    }
                });
            }
            
            _data.push({
                region : _region,
                model_year : +_my,
                category : _my +"("+ _region +")",
                total_big_wires :  +_big,
                total_small_wires :  +_small
            });
        });
    });
        
    var chart = am4core.create(container, am4charts.XYChart);
    chart.data = _data;
    chart.colors.step = 2;
    chart.padding(30, 30, 10, 30);

    var title = chart.titles.create();
    title.text =  "Overall Usage";
    title.fontSize = 12;
    title.fontWeight = 800;
    title.marginBottom = 10;
    
    //chart.legend = new am4charts.Legend();
    //chart.legend.itemContainers.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;
    chart.numberFormatter.numberFormat = "#";
    
    // var markerTemplate = chart.legend.markers.template;
    //     markerTemplate.width = 18;
    //     markerTemplate.height = 18;
    
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
    setTrendResult(_data, "0.50");
    
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
}

function displayColumnNewWireSizes(container){
    var _data = [];
    $.each(gData.groupBy(["REGION_NAME"]), function(i,r) { 
        $.each(gModelYears, function(x, my) { 
            var _my = my.name;
            var _region = r.name;
            var _obj = {};
            _obj.year = +_my;
            _obj.region = _region;
            _obj.category = _my +"("+ _region +")";
            
            $.each(gData.groupBy(["New_Wires"]), function(y, w) { 
                var _count = 0;
                var _wire = w.name;
                var _wireNew = _wire.replace(".","_");
                var _res = r.items.filter(function (item) {
                	return item.New_Wires == _wire && item.MODEL_YEAR == _my;
                });
                
                _count = _res.reduce(function (accumulator, currentValue) {
                    return accumulator + currentValue.COUNT_WIRE_GAUGE;
                }, 0);

                _obj[_wireNew] = _count;
            });
            _data.push(_obj);
        });
    });

    var chart = am4core.create(container, am4charts.XYChart);
    chart.data = _data;
    chart.colors.step = 2;
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
    //valueAxis.title.text = "Count";
    valueAxis.min = 0;
    valueAxis.max = 100;
    valueAxis.strictMinMax = true;
    valueAxis.calculateTotals = true;
    valueAxis.renderer.labels.template.adapter.add("text", function(text) {
      return text + "%";
    });
    
    // Create series
    var _createSeries = function(field, name) {
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.valueY = field;
        series.dataFields.valueYShow = "totalPercent";
        series.dataFields.categoryX = "category";
        series.name = name;
        //series.tooltip.disabled = true;
        series.tooltipText = "[bold]{name}:[/] {valueY.totalPercent.formatNumber('#.00')}% - [bold]{valueY.formatNumber('#,###')}[/]";
        //series.fill = color;

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
     
    var _createLabel = function(category, endCategory, label) {
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

    $.each(gData.groupBy(["New_Wires"]), function(x, w) { 
        var _wire = w.name;
        var _wireNew = _wire.replace(".","_");
        var _field = _wireNew;
        
        _createSeries(_field, _wire);
    });  
    
    $.each(gRegionNames, function(i, r) { 
        var _region = "("+ r.name +")";
        
        _createLabel(gMYFrom + _region, gMYTo + _region, r.name);
    });
    
    //Add cursor
    chart.cursor = new am4charts.XYCursor();
    
    setLegendSize(chart);
    setWireTrend(_data);
}

function displayColumnSMHighFlex(container){
    var _data = [];
    $.each(gData.groupBy(["REGION_NAME"]), function(i,r) { 
        $.each(gModelYears, function(x, my) { 
            var _my = my.name;
            var _region = r.name;
            var _obj = {};
            _obj.year = +_my;
            _obj.region = _region;
            _obj.category = _my +"("+ _region +")";
            
            $.each(gData.groupBy(["Wires"]), function(y, w) { 
                var _count = 0;
                var _wire = w.name;
                var _wireNew = _wire.replace(".","_");
                var _res = r.items.filter(function (item) {
                	return item.Wires == _wire && item.MODEL_YEAR == _my;
                });
                
                _count = _res.reduce(function (accumulator, currentValue) {
                    return accumulator + currentValue.COUNT_WIRE_GAUGE;
                }, 0);

                _obj[_wireNew] = _count;
            });
            _data.push(_obj);
        });
    });
    
    var chart = am4core.create(container, am4charts.XYChart);
    chart.data = _data;
    chart.colors.step = 2;
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
    valueAxis.min = 0;
    valueAxis.max = 100;
    valueAxis.strictMinMax = true;
    valueAxis.calculateTotals = true;
    valueAxis.renderer.labels.template.adapter.add("text", function(text) {
      return text + "%";
    });
    
    // Create series
    var _createSeries = function(field, name) {
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.valueY = field;
        series.dataFields.valueYShow = "totalPercent";
        series.dataFields.categoryX = "category";
        series.name = name;
        //series.tooltip.disabled = true;
        series.tooltipText = "[bold]{name}:[/] {valueY.totalPercent.formatNumber('#.00')}% - [bold]{valueY.formatNumber('#,###')}[/]";
        //series.fill = color;

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
     
    var _createLabel = function(category, endCategory, label) {
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

    $.each(gData.groupBy(["Wires"]), function(x, w) { 
        var _wire = w.name;
        var _wireNew = _wire.replace(".","_");
        var _field = _wireNew;
        
        _createSeries(_field, _wire);
    });  
    
    $.each(gRegionNames, function(i, r) { 
        var _region = "("+ r.name +")";
        
        _createLabel(gMYFrom + _region, gMYTo + _region, r.name);
    });
    
    //Add cursor
    chart.cursor = new am4charts.XYCursor();
    
    setLegendSize(chart);
    setWireTrend(_data);
}

function displayColumnSMEngineComp(container){
    var _data = [];
    $.each(gData.groupBy(["REGION_NAME"]), function(i,r) { 
        $.each(gModelYears, function(x, my) { 
            var _my = my.name;
            var _region = r.name;
            var _obj = {};
            _obj.year = +_my;
            _obj.region = _region;
            _obj.category = _my +"("+ _region +")";
            
            $.each(gData.groupBy(["WireGauge"]), function(y, w) { 
                var _count = 0;
                var _wire = w.name;
                var _wireNew = _wire.replace(".","_");
                var _res = r.items.filter(function (item) {
                	return item.WireGauge == _wire && item.MODEL_YEAR == _my;
                });
                
                _count = _res.reduce(function (accumulator, currentValue) {
                    return accumulator + currentValue.COUNT_WIRE_GAUGE;
                }, 0);

                _obj[_wireNew] = _count;
            });
            _data.push(_obj);
        });
    });
    
    var chart = am4core.create(container, am4charts.XYChart);
    chart.data = _data;
    chart.colors.step = 2;
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
    valueAxis.min = 0;
    valueAxis.max = 100;
    valueAxis.strictMinMax = true;
    valueAxis.calculateTotals = true;
    valueAxis.renderer.labels.template.adapter.add("text", function(text) {
      return text + "%";
    });
    
    // Create series
    var _createSeries = function(field, name) {
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.valueY = field;
        series.dataFields.valueYShow = "totalPercent";
        series.dataFields.categoryX = "category";
        series.name = name;
        series.tooltipText = "[bold]{name}:[/] {valueY.totalPercent.formatNumber('#.00')}% - [bold]{valueY.formatNumber('#,###')}[/]";
    };
     
    var _createLabel = function(category, endCategory, label) {
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

    $.each(gData.groupBy(["WireGauge"]), function(x, w) { 
        var _wire = w.name;
        var _wireNew = _wire.replace(".","_");
        var _field = _wireNew;
        
        _createSeries(_field, _wire);
    });  
    
    $.each(gRegionNames, function(i, r) { 
        var _region = "("+ r.name +")";
        
        _createLabel(gMYFrom + _region, gMYTo + _region, r.name);
    });
    
    //Add cursor
    chart.cursor = new am4charts.XYCursor();
    
    setLegendSize(chart);
    setWireTrend(_data);
}

function displayColumnPVCEngineComp(container){
    var _data = [];
    $.each(gData.groupBy(["REGION_NAME"]), function(i,r) { 
        $.each(gModelYears, function(x, my) { 
            var _my = my.name;
            var _region = r.name;
            var _obj = {};
            _obj.year = +_my;
            _obj.region = _region;
            _obj.category = _my +"("+ _region +")";
            
            $.each(gData.groupBy(["WireInsulation"]), function(y, w) { 
                var _count = 0;
                var _wire = w.name;
                var _wireNew = _wire.replace(".","_");
                var _res = r.items.filter(function (item) {
                	return item.WireInsulation == _wire && item.MODEL_YEAR == _my;
                });
                
                _count = _res.reduce(function (accumulator, currentValue) {
                    return accumulator + currentValue.COUNT_WIRE_INSULATION;
                }, 0);

                _obj[_wireNew] = _count;
            });
            _data.push(_obj);
        });
    });
    
    var chart = am4core.create(container, am4charts.XYChart);
    chart.data = _data;
    chart.colors.step = 2;
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
    valueAxis.min = 0;
    valueAxis.max = 100;
    valueAxis.strictMinMax = true;
    valueAxis.calculateTotals = true;
    valueAxis.renderer.labels.template.adapter.add("text", function(text) {
      return text + "%";
    });
    
    // Create series
    var _createSeries = function(field, name) {
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.valueY = field;
        series.dataFields.valueYShow = "totalPercent";
        series.dataFields.categoryX = "category";
        series.name = name;
        series.tooltipText = "[bold]{name}:[/] {valueY.totalPercent.formatNumber('#.00')}% - [bold]{valueY.formatNumber('#,###')}[/]";
    };
     
    var _createLabel = function(category, endCategory, label) {
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

    $.each(gData.groupBy(["WireInsulation"]), function(x, w) { 
        var _wire = w.name;
        var _wireNew = _wire.replace(".","_");
        var _field = _wireNew;
        
        _createSeries(_field, _wire);
    });  
    
    $.each(gRegionNames, function(i, r) { 
        var _region = "("+ r.name +")";
        
        _createLabel(gMYFrom + _region, gMYTo + _region, r.name);
    });
    
    //Add cursor
    chart.cursor = new am4charts.XYCursor();
    
    setLegendSize(chart);
    setWireTrend(_data);
}

function displayColumnNewTechWireConductor(container){
    var _data = [];
    $.each(gData.groupBy(["REGION_NAME"]), function(i,r) { 
        $.each(gModelYears, function(x, my) { 
            var _my = my.name;
            var _region = r.name;
            var _obj = {};
            _obj.year = +_my;
            _obj.region = _region;
            _obj.category = _my +"("+ _region +")";
            
            $.each(gData.groupBy(["WireGauge"]), function(y, w) { 
                var _count = 0;
                var _wire = w.name;
                var _wireNew = _wire.replace(".","_");
                var _res = r.items.filter(function (item) {
                	return item.WireGauge == _wire && item.MODEL_YEAR == _my;
                });
                
                _count = _res.reduce(function (accumulator, currentValue) {
                    return accumulator + currentValue.COUNT_WIRE_GAUGE;
                }, 0);

                _obj[_wireNew] = _count;
            });
            _data.push(_obj);
        });
    });
    
    var chart = am4core.create(container, am4charts.XYChart);
    chart.data = _data;
    chart.colors.step = 2;
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
    valueAxis.min = 0;
    valueAxis.max = 100;
    valueAxis.strictMinMax = true;
    valueAxis.calculateTotals = true;
    valueAxis.renderer.labels.template.adapter.add("text", function(text) {
      return text + "%";
    });
    
    // Create series
    var _createSeries = function(field, name) {
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.valueY = field;
        series.dataFields.valueYShow = "totalPercent";
        series.dataFields.categoryX = "category";
        series.name = name;
        series.tooltipText = "[bold]{name}:[/] {valueY.totalPercent.formatNumber('#.00')}% - [bold]{valueY.formatNumber('#,###')}[/]";
    };
     
    var _createLabel = function(category, endCategory, label) {
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

    $.each(gData.groupBy(["WireGauge"]), function(x, w) { 
        var _wire = w.name;
        var _wireNew = _wire.replace(".","_");
        var _field = _wireNew;
        
        _createSeries(_field, _wire);
    });  
    
    $.each(gRegionNames, function(i, r) { 
        var _region = "("+ r.name +")";
        
        _createLabel(gMYFrom + _region, gMYTo + _region, r.name);
    });
    
    //Add cursor
    chart.cursor = new am4charts.XYCursor();
    
    setLegendSize(chart);
    setWireTrend(_data);
}

function displayColumnTwoWayConnector(container){
    var _data = [];
    $.each(gData.groupBy(["REGION_NAME"]), function(i,r) { 
        $.each(gModelYears, function(x, my) { 
            var _my = my.name;
            var _region = r.name;
            var _obj = {};
            _obj.year = +_my;
            _obj.region = _region;
            _obj.category = _my +"("+ _region +")";
            
            $.each(gData.groupBy(["Wires"]), function(y, w) { 
                var _count = 0;
                var _wire = w.name;
                var _wireNew = _wire.replace(".","_");
                var _res = r.items.filter(function (item) {
                	return item.Wires == _wire && item.MODEL_YEAR == _my;
                });
                
                _count = _res.reduce(function (accumulator, currentValue) {
                    return accumulator + currentValue.wire_count;
                }, 0);

                _obj[_wireNew] = _count;
            });
            _data.push(_obj);
        });
    });
    
    var chart = am4core.create(container, am4charts.XYChart);
    chart.data = _data;
    chart.colors.step = 2;
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
    valueAxis.min = 0;
    valueAxis.max = 100;
    valueAxis.strictMinMax = true;
    valueAxis.calculateTotals = true;
    valueAxis.renderer.labels.template.adapter.add("text", function(text) {
      return text + "%";
    });
    
    // Create series
    var _createSeries = function(field, name) {
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.valueY = field;
        series.dataFields.valueYShow = "totalPercent";
        series.dataFields.categoryX = "category";
        series.name = name;
        series.tooltipText = "[bold]{name}:[/] {valueY.totalPercent.formatNumber('#.00')}% - [bold]{valueY.formatNumber('#,###')}[/]";
    };
     
    var _createLabel = function(category, endCategory, label) {
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

    $.each(gData.groupBy(["Wires"]), function(x, w) { 
        var _wire = w.name;
        var _field = _wire.replace(".","_");
        
        _createSeries(_field, _wire);
    });  
    
    $.each(gRegionNames, function(i, r) { 
        var _region = "("+ r.name +")";
        
        _createLabel(gMYFrom + _region, gMYTo + _region, r.name);
    });
    
    //Add cursor
    chart.cursor = new am4charts.XYCursor();
    
    setLegendSize(chart);
    setWireTrend(_data);
}

function displayColumnOverallCSAMarc(container){
    //Set Data
    var _data = [];
    $.each(gData.groupBy(["region"]), function(i, region) { 
        $.each(gModelYears, function(x, my) {
            var _region = region.name;
            var _my = my.name;
            var _big = 0; //Big Wires
            var _small = 0; //Small Wires
            var _res = region.items.filter(function (item) {
            	return item.model_year == _my;
            });
          
            if( _res.length > 0 ) {
                $.each(_res, function(i, v){
                    var _alias = v.alias_name.toLowerCase();
                    if(_alias.indexOf("big") != -1){
                        _big += v.wire_count;
                    }
                    if(_alias.indexOf("small") != -1){
                        _small += v.wire_count;
                    }
                });
            }
            
            _data.push({
                region : _region,
                model_year : +_my,
                category : _my +"("+ _region +")",
                total_big_wires :  +_big,
                total_small_wires :  +_small
            });
        });
    });
        
    var chart = am4core.create(container, am4charts.XYChart);
    chart.data = _data;
    chart.colors.step = 2;
    chart.padding(30, 30, 10, 30);

    var title = chart.titles.create();
    title.text =  "Overall Usage";
    title.fontSize = 12;
    title.fontWeight = 800;
    title.marginBottom = 10;
    
    //chart.legend = new am4charts.Legend();
    //chart.legend.itemContainers.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;
    chart.numberFormatter.numberFormat = "#";
    
    // var markerTemplate = chart.legend.markers.template;
    //     markerTemplate.width = 18;
    //     markerTemplate.height = 18;
    
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
    series1.name = "% of Lower 1.0";
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
    series2.name = "% of Higher 1.0";
    series2.dataFields.valueY = "total_big_wires";
    series2.fill = chart.colors.next();
    series2.stroke = series2.fill;
    
    setLegendSize(chart);
    setTrendResult(_data, "1.0");
    
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
}

// New Wire Tech Lesser Diameter 
function displayWireTechDiameter(container, callback){
    // var wireLL = gData.reduce(function(prev, curr) {
    //                 return prev.lower_dia < curr.lower_dia ? prev.lower_dia : curr.lower_dia;
    //             });
    // var wireUL = gData.reduce(function(prev, curr) {
    //                 return prev.upper_dia < curr.upper_dia ? prev.upper_dia : curr.upper_dia;
    //             });
    var lowerLimit = 0;
    var upperLimit = 0;
    var _wireTypes = gData.groupBy(["wire_type"]);
    var _newData = $.each(_wireTypes, function(i, v){
        var _length = v.items.length;
        
        $.each(v.items, function(x, y){
            if(lowerLimit < y.lower_dia) lowerLimit = y.lower_dia;
            
            if(upperLimit < y.upper_dia) upperLimit = y.upper_dia;
        });
        
        var _sum = v.items.reduce(function (accumulator, currentValue) {
            return accumulator + currentValue.avg_dia;
        }, 0);
        
        var _ll = v.items.reduce(function (accumulator, currentValue) {
            return accumulator + currentValue.lower_dia;
        }, 0);
        
        var _ul = v.items.reduce(function (accumulator, currentValue) {
            return accumulator + currentValue.upper_dia;
        }, 0);
        
        lowerLimit = (_ll / _length);
        upperLimit = (_ul / _length);
        v.avg_weight = (_sum / _length);
    
        return v;
    });
    
    am4core.useTheme(am4themes_animated);
    
    var chart = am4core.create(container, am4charts.XYChart);
    chart.data = _newData;
    chart.numberFormatter.numberFormat = "#.#####";
    
    // Create axes
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "name";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 20;
    categoryAxis.renderer.labels.template.horizontalCenter = "right";
    categoryAxis.renderer.labels.template.verticalCenter = "middle";
    categoryAxis.renderer.labels.template.rotation = 310;

    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    valueAxis.max = upperLimit;
    //valueAxis.title.text = "Avg. Weight";
    valueAxis.renderer.minGridDistance = 20;
    //valueAxis.renderer.numberFormatter.numberFormat = "#.#####";
    valueAxis.numberFormatter = new am4core.NumberFormatter();
    valueAxis.numberFormatter.numberFormat = "#.0000";
    
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
    series.dataFields.categoryX = "name";
    series.name = "Avg. Diameter";
    series.tooltipText = "{name}: [bold]{valueY}[/]";
    series.strokeWidth = 2;
    
    // Add simple bullet
    var circleBullet = series.bullets.push(new am4charts.CircleBullet());
    circleBullet.circle.strokeWidth = 1;

    // Create value axis range
    var range = valueAxis.axisRanges.create();
    range.value = upperLimit;
    range.grid.stroke = am4core.color("#396478");
    range.grid.strokeWidth = 2;
    range.grid.strokeOpacity = 1;
    range.label.inside = true;
    range.label.text = "Upper Diameter";
    range.label.fill = range.grid.stroke;
    //range.label.align = "right";
    range.label.verticalCenter = "bottom";
    
    var range2 = valueAxis.axisRanges.create();
    range2.value = lowerLimit;
    range2.grid.stroke = am4core.color("#A96478");
    range2.grid.strokeWidth = 2;
    range2.grid.strokeOpacity = 1;
    range2.label.inside = true;
    range2.label.text = "Lower Diameter";
    range2.label.fill = range2.grid.stroke;
    //range2.label.align = "right";
    range2.label.verticalCenter = "bottom";
    
    // Add cursor
    chart.cursor = new am4charts.XYCursor();
    
    // Add legend
    //chart.legend = new am4charts.Legend();
}

// New Wire Tech Lesser Weight
function displayWireTechWeight(container, callback){
    var lowerLimit = 0;
    var upperLimit = 0;
    var _wireTypes = gData.groupBy(["wire_type"]);
    var _newData = $.each(_wireTypes, function(i, v){
        var _length = v.items.length;
        
        $.each(v.items, function(x, y){
            if(lowerLimit < y.wire_ll) lowerLimit = y.wire_ll;
            
            if(upperLimit < y.wire_ul) upperLimit = y.wire_ul;
        });
        
        var _sum = v.items.reduce(function (accumulator, currentValue) {
            return accumulator + currentValue.avg_weight;
        }, 0);
        
        var _ll = v.items.reduce(function (accumulator, currentValue) {
            return accumulator + currentValue.wire_ll;
        }, 0);
        
        var _ul = v.items.reduce(function (accumulator, currentValue) {
            return accumulator + currentValue.wire_ul;
        }, 0);
        
        lowerLimit = (_ll / _length);
        upperLimit = (_ul / _length);
        v.avg_weight = (_sum / _length);
    
        return v;
    });
    
    am4core.useTheme(am4themes_animated);   
      
    var chart = am4core.create(container, am4charts.XYChart);
    chart.data = _newData;
    chart.numberFormatter.numberFormat = "#.#####";
    
    // Create axes
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "name";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 20;
    categoryAxis.renderer.labels.template.horizontalCenter = "right";
    categoryAxis.renderer.labels.template.verticalCenter = "middle";
    categoryAxis.renderer.labels.template.rotation = 310;

    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    //valueAxis.max = 5;
    //valueAxis.title.text = "Avg. Weight";
    valueAxis.renderer.minGridDistance = 20;
    //valueAxis.renderer.numberFormatter.numberFormat = "#.#####";
    valueAxis.numberFormatter = new am4core.NumberFormatter();
    valueAxis.numberFormatter.numberFormat = "#.0000";
    
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
    series.dataFields.categoryX = "name";
    series.name = "Avg. Weight";
    series.tooltipText = "{name}: [bold]{valueY}[/]";
    series.strokeWidth = 2;
    
    // Add simple bullet
    var circleBullet = series.bullets.push(new am4charts.CircleBullet());
    circleBullet.circle.strokeWidth = 1;
    
    // Create value axis range
    var range = valueAxis.axisRanges.create();
    range.value = upperLimit;
    range.grid.stroke = am4core.color("#396478");
    range.grid.strokeWidth = 2;
    range.grid.strokeOpacity = 1;
    range.label.inside = true;
    range.label.text = "Upper Weight";
    range.label.fill = range.grid.stroke;
    //range.label.align = "right";
    range.label.verticalCenter = "bottom";
    
    var range2 = valueAxis.axisRanges.create();
    range2.value = lowerLimit;
    range2.grid.stroke = am4core.color("#A96478");
    range2.grid.strokeWidth = 2;
    range2.grid.strokeOpacity = 1;
    range2.label.inside = true;
    range2.label.text = "Lower Weight";
    range2.label.fill = range2.grid.stroke;
    //range2.label.align = "right";
    range2.label.verticalCenter = "bottom";
    
    // Add cursor
    chart.cursor = new am4charts.XYCursor();
    
    // Add legend
    //chart.legend = new am4charts.Legend();
}

// Network Topology
function displayPieNetworkTopology(container){
    var _data = [];
    $.each(gModelYears, function(x, my) { 
        var _my = my.name;
        
        $.each(gData.groupBy(["RET"]), function(y, w) { 
            var _count = 0;
            var _ret = w.name;
            var _retNew = _ret.replace(".","_");

            var _res = w.items.filter(function (item) {
            	return item.RET == _ret && item.MODEL_YEAR == _my;
            });

            _count = _res.reduce(function (accumulator, currentValue) {
                return accumulator + currentValue.COUNT_RING_EYELET_TYPE;
            }, 0);
            
            _data.push({
                model_year: +_my,
                wire_guage: _ret,
                wire_count: _count
            });
        });
        
    });

    var container = am4core.create(container, am4core.Container);
    container.width = am4core.percent(100);
    container.height = am4core.percent(100);
    container.layout = "horizontal";
    
    var _createChart = function(data, year){
        var chart = container.createChild(am4charts.PieChart);
        chart.data = data;
        chart.paddingTop= 15;
        chart.paddingBottom = 15;
        
        var title = chart.titles.create();
        title.text =  "MY" + year;
        //title.fontSize = 12;
        title.fontWeight = 800;
        title.marginBottom = 0;
        
        // Add and configure Series
        var pieSeries = chart.series.push(new am4charts.PieSeries());
        pieSeries.dataFields.value = "wire_count";
        pieSeries.dataFields.category = "wire_guage";
        pieSeries.slices.template.propertyFields.fill = "color";
        pieSeries.slices.template.propertyFields.isActive = "pulled";
        pieSeries.slices.template.strokeWidth = 0;
        pieSeries.paddingBottom = 10;
        pieSeries.colors.step = 2;
        
        pieSeries.ticks.template.disabled = true;
        pieSeries.alignLabels = false;
        pieSeries.labels.template.fontSize = 12;
        pieSeries.labels.template.text = "{value.percent.formatNumber('#.00')}%";
        pieSeries.labels.template.radius = am4core.percent(-40);
        //pieSeries.labels.template.relativeRotation = 90;
        pieSeries.labels.template.fill = am4core.color("white");
    
        chart.legend = new am4charts.Legend();
        chart.legend.labels.template.fontSize = 12;
        chart.legend.valueLabels.template.fontSize = 12;
        chart.legend.itemContainers.template.paddingTop = 1;
        chart.legend.itemContainers.template.paddingBottom = 1;
        
        var markerTemplate = chart.legend.markers.template;
        markerTemplate.width = 12;
        markerTemplate.height = 12;
        
        pieSeries.labels.template.adapter.add("radius", function(radius, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return 0;
            }
            return radius;
        });
        
        pieSeries.labels.template.adapter.add("fill", function(color, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return am4core.color("#000");
            }
            return color;
        });
    };

    $.each(gModelYears, function(i, v){
        var _my = v.name;
        var _res = _data.filter(function (item) {
        	return item.model_year == _my;
        });

        _createChart(_res, _my);
    });
}

function displayColumnNetworkTopology(container, callback){
    if(gData.length > 0){
         var _data = [];
        $.each(gData.groupBy(["REGION_NAME"]), function(i,r) { 
            $.each(gModelYears, function(x, my) { 
                var _my = my.name;
                var _region = r.name;
                var _obj = {};
                _obj.year = +_my;
                _obj.region = _region;
                _obj.category = _my +"("+ _region +")";
                
                $.each(gData.groupBy(["RET"]), function(y, w) { 
                    var _count = 0;
                    var _ret = w.name;
                    var _retNew = _ret.replace(".","_");
                    var _res = r.items.filter(function (item) {
                    	return item.RET == _ret && item.MODEL_YEAR == _my;
                    });
                    
                    _count = _res.reduce(function (accumulator, currentValue) {
                        return accumulator + currentValue.COUNT_RING_EYELET_TYPE;
                    }, 0);
    
                    _obj[_retNew] = _count;
                });
                _data.push(_obj);
            });
        });
        
        // Display Chart
        am4core.useTheme(am4themes_animated);
        
        var chart = am4core.create(container, am4charts.XYChart);
        chart.data = _data;
        chart.colors.step = 2;
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
        //valueAxis.title.text = "Count";
        valueAxis.min = 0;
        valueAxis.max = 100;
        valueAxis.strictMinMax = true;
        valueAxis.calculateTotals = true;
        valueAxis.renderer.labels.template.adapter.add("text", function(text) {
          return text + "%";
        });
        
        // Create series
        var _createSeries = function(field, name) {
            var series = chart.series.push(new am4charts.ColumnSeries());
            series.dataFields.valueY = field;
            series.dataFields.valueYShow = "totalPercent";
            series.dataFields.categoryX = "category";
            series.name = name;
            series.tooltipText = "[bold]{name}:[/] {valueY.totalPercent.formatNumber('#.00')}% - [bold]{valueY.formatNumber('#,###')}[/]";
        };
         
        var _createLabel = function(category, endCategory, label) {
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
    
        $.each(gData.groupBy(["RET"]), function(x, w) { 
            var _ret = w.name;
            var _retNew = _ret.replace(".","_");
            var _field = _retNew;
            
            _createSeries(_field, _ret);
        });  
        
        $.each(gRegionNames, function(i, r) { 
            var _region = "("+ r.name +")";
            
            _createLabel(gMYFrom + _region, gMYTo + _region, r.name);
        });
        
        //Add cursor
        chart.cursor = new am4charts.XYCursor();
        
        setLegendSize(chart);
        setWireTrend(_data);
    }
}

// -------------------------------- MECHANICAL ------------------------------ //

// Retainer
function displayChartRetainer(container, callback){
    if(gData.length > 0){
        var _region = gData.groupBy(["REGION_NAME"]);
        var _modelYear = gData.groupBy(["MODEL_YEAR"]);
        var _locationDtl = gData.groupBy(["location_dtl"]);
        
        var _dynamicKey = getDistinctKey(gData);
        var _dynamicObj = gData.groupBy([_dynamicKey]);
        
        var _data = [];
        $.each(_region, function(i, r) { 
            
            $.each(_modelYear, function(x, my) {
                var _regionName = r.name;
                var _modelYear = my.name;
                var _result = r.items.filter(function (item) {
                	return item.MODEL_YEAR == _modelYear;
                });
                
                $.each(_locationDtl, function(y, l) {
                    var _locationDtl = l.name;
                    var _json = {
                        REGION_NAME : _regionName,
                        MODEL_YEAR : +_modelYear,
                        category : _locationDtl +"("+ _modelYear +"-"+ _regionName +")"
                    };

                    $.each(_dynamicObj, function(z, s) {
                        
                        var _name = s.name;
                        var _nameNew = _name.replace(" ","_");
                        
                        var _result2 = _result.filter(function (item) {
                        	return item.location_dtl == _locationDtl && item[_dynamicKey] == _name;
                        });
                        
                        var _count = 0;
                        for(; _count < _result2.length; ){
                            _count++;
                        }
                       
                        _json[_nameNew] = _count;
                    });
                    
                    _data.push(_json);
                }); 
            });
        });
        
        // Display Chart
        am4core.useTheme(am4themes_animated);
        
        var chart = am4core.create(container, am4charts.XYChart);
        chart.data = _data;
        chart.colors.step = 2;
        chart.padding(15, 15, 10, 15);
    
        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "category";
        categoryAxis.renderer.minGridDistance = 20;
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.interactionsEnabled = false;
        categoryAxis.renderer.labels.template.fontSize = 10;
        categoryAxis.renderer.labels.template.valign = "top";
        categoryAxis.renderer.labels.template.location = 0;
        categoryAxis.renderer.labels.template.rotation = 270;
        categoryAxis.renderer.labels.template.adapter.add("textOutput", function(text) {
            return (!isUD(text) ? text.replace(/\(.*/, "") : text);
        });
    
        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        //valueAxis.title.text = "Count";
        valueAxis.min = 0;
        //valueAxis.max = 100;
        valueAxis.strictMinMax = true;
        valueAxis.calculateTotals = true;
        valueAxis.renderer.minGridDistance = 10;
        valueAxis.renderer.labels.template.adapter.add("text", function(text) {
          return text + "%";
        });
    
        // Create series
        var _createSeries = function(field, name) {
          var series = chart.series.push(new am4charts.ColumnSeries());
          series.dataFields.valueY = field;
          //series.dataFields.categoryXShow = "totalPercent";
          series.dataFields.categoryX = "category";
          series.name = name;
          series.tooltipText = "[bold]{name}:[/] {valueY.totalPercent.formatNumber('#.00')}% - [bold]{valueY.formatNumber('#,###')}[/]";
          series.tooltip.fontSize = 10;
          series.tooltip.dy = 0;
          series.tooltip.align = "top";
          series.stacked = true;
          series.columns.template.width = am4core.percent(95);
        }
        
        var _createLabel = function(category, endCategory, label, opacity, dy) {
            var range = categoryAxis.axisRanges.create();
            range.category = category;
            range.endCategory = endCategory;
            range.label.dataItem.text = label;
            range.label.dy = dy;
            //range.label.fontSize = 10;
            range.label.fontWeight = "bold";
            range.label.valign = "bottom";
            range.label.location = 0.5;
            range.label.rotation = 0;
            range.axisFill.fill = am4core.color("#396478");
            range.axisFill.fillOpacity = opacity;
            range.locations.category = 0.1;
            range.locations.endCategory = 0.9;
        };
    
        $.each(_dynamicObj, function(i, v) { 
            var _name = v.name;
            var _nameNew = _name.replace(" ","_");
            
            _createSeries(_nameNew, _name);
        }); 
        
        var _mYear = getFirstAndLastItem(_modelYear , "name");
        var _locDtl = getFirstAndLastItem(_locationDtl , "name");
        
        $.each(_modelYear, function(i, v) { 
            var _my = v.name;
            
            $.each(_region, function(i, r) { 
                var _reg = r.name;
                var _first = _locDtl.first + "("+ _my +"-"+ _reg +")";
                var _last = _locDtl.last + "("+ _my +"-"+ _reg +")";
                
                _createLabel(_first, _last, _my, 0, 10);
            });
        });
        
        $.each(_region, function(i, r) { 
            var _reg = r.name;
            var _first = _locDtl.first + "("+ _mYear.first +"-"+ _reg +")";
            var _last = _locDtl.last + "("+ _mYear.last +"-"+ _reg +")";
            
            _createLabel(_first, _last, _reg, 0.1, 20);
        });
        
        //Add cursor
        chart.cursor = new am4charts.XYCursor();
        
        //Add legend
        chart.legend = new am4charts.Legend();
        chart.legend.labels.template.fontSize = 10;
        chart.legend.valueLabels.template.fontSize = 10;
        chart.legend.itemContainers.template.dy = 10;
        chart.legend.itemContainers.template.paddingTop = 1;
        chart.legend.itemContainers.template.paddingBottom = 1;
        
        var markerTemplate = chart.legend.markers.template;
        markerTemplate.width = 10;
        markerTemplate.height = 10;
    }
}

// Ground Eyelet
function displayPieGroundEyelet(container){
    var _data = [];
    $.each(gModelYears, function(x, my) { 
        var _my = my.name;
        
        $.each(gData.groupBy(["RET"]), function(y, w) { 
            var _count = 0;
            var _ret = w.name;
            var _retNew = _ret.replace(".","_");

            var _res = w.items.filter(function (item) {
            	return item.RET == _ret && item.MODEL_YEAR == _my;
            });

            _count = _res.reduce(function (accumulator, currentValue) {
                return accumulator + currentValue.COUNT_RING_EYELET_TYPE;
            }, 0);
            
            _data.push({
                model_year: +_my,
                wire_guage: _ret,
                wire_count: _count
            });
        });
        
    });

    var container = am4core.create(container, am4core.Container);
    container.width = am4core.percent(100);
    container.height = am4core.percent(100);
    container.layout = "horizontal";
    
    var _createChart = function(data, year){
        var chart = container.createChild(am4charts.PieChart);
        chart.data = data;
        chart.paddingTop= 15;
        chart.paddingBottom = 15;
        
        var title = chart.titles.create();
        title.text =  "MY" + year;
        //title.fontSize = 12;
        title.fontWeight = 800;
        title.marginBottom = 0;
        
        // Add and configure Series
        var pieSeries = chart.series.push(new am4charts.PieSeries());
        pieSeries.dataFields.value = "wire_count";
        pieSeries.dataFields.category = "wire_guage";
        pieSeries.slices.template.propertyFields.fill = "color";
        pieSeries.slices.template.propertyFields.isActive = "pulled";
        pieSeries.slices.template.strokeWidth = 0;
        pieSeries.paddingBottom = 10;
        pieSeries.colors.step = 2;
        
        pieSeries.ticks.template.disabled = true;
        pieSeries.alignLabels = false;
        pieSeries.labels.template.fontSize = 12;
        pieSeries.labels.template.text = "{value.percent.formatNumber('#.00')}%";
        pieSeries.labels.template.radius = am4core.percent(-40);
        //pieSeries.labels.template.relativeRotation = 90;
        pieSeries.labels.template.fill = am4core.color("white");
    
        chart.legend = new am4charts.Legend();
        chart.legend.labels.template.fontSize = 12;
        chart.legend.valueLabels.template.fontSize = 12;
        chart.legend.itemContainers.template.paddingTop = 1;
        chart.legend.itemContainers.template.paddingBottom = 1;
        
        var markerTemplate = chart.legend.markers.template;
        markerTemplate.width = 12;
        markerTemplate.height = 12;
        
        pieSeries.labels.template.adapter.add("radius", function(radius, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return 0;
            }
            return radius;
        });
        
        pieSeries.labels.template.adapter.add("fill", function(color, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return am4core.color("#000");
            }
            return color;
        });
    };

    $.each(gModelYears, function(i, v){
        var _my = v.name;
        var _res = _data.filter(function (item) {
        	return item.model_year == _my;
        });

        _createChart(_res, _my);
    });
}

function displayColumnGroundEyelet(container, callback){
    if(gData.length > 0){
         var _data = [];
        $.each(gData.groupBy(["REGION_NAME"]), function(i,r) { 
            $.each(gModelYears, function(x, my) { 
                var _my = my.name;
                var _region = r.name;
                var _obj = {};
                _obj.year = +_my;
                _obj.region = _region;
                _obj.category = _my +"("+ _region +")";
                
                $.each(gData.groupBy(["RET"]), function(y, w) { 
                    var _count = 0;
                    var _ret = w.name;
                    var _retNew = _ret.replace(".","_");
                    var _res = r.items.filter(function (item) {
                    	return item.RET == _ret && item.MODEL_YEAR == _my;
                    });
                    
                    _count = _res.reduce(function (accumulator, currentValue) {
                        return accumulator + currentValue.COUNT_RING_EYELET_TYPE;
                    }, 0);
    
                    _obj[_retNew] = _count;
                });
                _data.push(_obj);
            });
        });
        
        // Display Chart
        am4core.useTheme(am4themes_animated);
        
        var chart = am4core.create(container, am4charts.XYChart);
        chart.data = _data;
        chart.colors.step = 2;
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
        //valueAxis.title.text = "Count";
        valueAxis.min = 0;
        valueAxis.max = 100;
        valueAxis.strictMinMax = true;
        valueAxis.calculateTotals = true;
        valueAxis.renderer.labels.template.adapter.add("text", function(text) {
          return text + "%";
        });
        
        // Create series
        var _createSeries = function(field, name) {
            var series = chart.series.push(new am4charts.ColumnSeries());
            series.dataFields.valueY = field;
            series.dataFields.valueYShow = "totalPercent";
            series.dataFields.categoryX = "category";
            series.name = name;
            //series.tooltip.disabled = true;
            series.tooltipText = "[bold]{name}:[/] {valueY.totalPercent.formatNumber('#.00')}% - [bold]{valueY.formatNumber('#,###')}[/]";
            //series.fill = color;
    
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
         
        var _createLabel = function(category, endCategory, label) {
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
    
        $.each(gData.groupBy(["RET"]), function(x, w) { 
            var _ret = w.name;
            var _retNew = _ret.replace(".","_");
            var _field = _retNew;
            
            _createSeries(_field, _ret);
        });  
        
        $.each(gRegionNames, function(i, r) { 
            var _region = "("+ r.name +")";
            
            _createLabel(gMYFrom + _region, gMYTo + _region, r.name);
        });
        
        //Add cursor
        chart.cursor = new am4charts.XYCursor();
        
        //Add legend
        //chart.legend = new am4charts.Legend();
        
        setLegendSize(chart);
        
        setWireTrend(_data);
    }
}

// Grommets
function displayPieGrommets(container){
    var _data = [];
    $.each(gModelYears, function(x, my) { 
        var _my = my.name;
        var _dynamicKey = getDistinctKey(gData);
        var _dynamicObj = gData.groupBy([_dynamicKey]);
        
        $.each(_dynamicObj, function(y, w) { 
            var _grommet = w.name;
            var _grommetNew = _grommet.replace(".","_");

            var _res = w.items.filter(function (item) {
            	return item[_dynamicKey] == _grommet && item.MODEL_YEAR == _my;
            });

           var _count = 0;
            for(; _count < _res.length; ){
                _count++;
            }
            
            _data.push({
                model_year: +_my,
                grommet_type: _grommet,
                count: _count
            });
        });
        
    });

    var container = am4core.create(container, am4core.Container);
    container.width = am4core.percent(100);
    container.height = am4core.percent(100);
    container.layout = "horizontal";
    
    var _createChart = function(data, year){
        var chart = container.createChild(am4charts.PieChart);
        chart.data = data;
        chart.paddingTop= 15;
        chart.paddingBottom = 15;
        
        var title = chart.titles.create();
        title.text =  "MY" + year;
        //title.fontSize = 12;
        title.fontWeight = 800;
        title.marginBottom = 0;
        
        // Add and configure Series
        var pieSeries = chart.series.push(new am4charts.PieSeries());
        pieSeries.dataFields.value = "count";
        pieSeries.dataFields.category = "grommet_type";
        pieSeries.slices.template.propertyFields.fill = "color";
        pieSeries.slices.template.propertyFields.isActive = "pulled";
        pieSeries.slices.template.strokeWidth = 0;
        pieSeries.paddingBottom = 10;
        pieSeries.colors.step = 2;
        
        pieSeries.ticks.template.disabled = true;
        pieSeries.alignLabels = false;
        pieSeries.labels.template.fontSize = 12;
        pieSeries.labels.template.text = "{value.percent.formatNumber('#.00')}%";
        pieSeries.labels.template.radius = am4core.percent(-40);
        //pieSeries.labels.template.relativeRotation = 90;
        pieSeries.labels.template.fill = am4core.color("white");
    
        chart.legend = new am4charts.Legend();
        chart.legend.labels.template.fontSize = 12;
        chart.legend.valueLabels.template.fontSize = 12;
        chart.legend.itemContainers.template.paddingTop = 1;
        chart.legend.itemContainers.template.paddingBottom = 1;
        
        var markerTemplate = chart.legend.markers.template;
        markerTemplate.width = 12;
        markerTemplate.height = 12;
        
        pieSeries.labels.template.adapter.add("radius", function(radius, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return 0;
            }
            return radius;
        });
        
        pieSeries.labels.template.adapter.add("fill", function(color, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return am4core.color("#000");
            }
            return color;
        });
    };

    $.each(gModelYears, function(i, v){
        var _my = v.name;
        var _res = _data.filter(function (item) {
        	return item.model_year == _my;
        });

        _createChart(_res, _my);
    });
}

function displayColumnGrommets(container, callback){
    if(gData.length > 0){
        var _data = [];
        var _dynamicKey = getDistinctKey(gData);
        var _dynamicObj = gData.groupBy([_dynamicKey]);
        
        $.each(gData.groupBy(["REGION_NAME"]), function(i,r) { 
            $.each(gModelYears, function(x, my) { 
                var _my = my.name;
                var _region = r.name;
                var _obj = {};
                _obj.year = +_my;
                _obj.region = _region;
                _obj.category = _my +"("+ _region +")";
                
                $.each(_dynamicObj, function(y, w) { 
                    var _grommet = w.name;
                    var _grommetNew = _grommet.replace(".","_");
                    var _res = r.items.filter(function (item) {
                    	return item[_dynamicKey] == _grommet && item.MODEL_YEAR == _my;
                    });
                    
                    var _count = 0;
                    for(; _count < _res.length; ){
                        _count++;
                    }
    
                    _obj[_grommetNew] = _count;
                });
                _data.push(_obj);
            });
        });
        
        // Display Chart
        am4core.useTheme(am4themes_animated);
        
        var chart = am4core.create(container, am4charts.XYChart);
        chart.data = _data;
        chart.colors.step = 2;
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
        //valueAxis.title.text = "Count";
        valueAxis.min = 0;
        valueAxis.max = 100;
        valueAxis.strictMinMax = true;
        valueAxis.calculateTotals = true;
        valueAxis.renderer.labels.template.adapter.add("text", function(text) {
          return text + "%";
        });
        
        // Create series
        var _createSeries = function(field, name) {
            var series = chart.series.push(new am4charts.ColumnSeries());
            series.dataFields.valueY = field;
            series.dataFields.valueYShow = "totalPercent";
            series.dataFields.categoryX = "category";
            series.name = name;
            series.tooltipText = "[bold]{name}:[/] {valueY.totalPercent.formatNumber('#.00')}% - [bold]{valueY.formatNumber('#,###')}[/]";
        };
         
        var _createLabel = function(category, endCategory, label) {
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
    
        $.each(_dynamicObj, function(x, w) { 
            var _grommet = w.name;
            var _grommetNew = _grommet.replace(".","_");
            var _field = _grommetNew;
            
            _createSeries(_field, _grommet);
        });  
        
        $.each(gRegionNames, function(i, r) { 
            var _region = "("+ r.name +")";
            
            _createLabel(gMYFrom + _region, gMYTo + _region, r.name);
        });
        
        //Add cursor
        chart.cursor = new am4charts.XYCursor();
        
        setLegendSize(chart);
        setWireTrend(_data);
    }
}

// Though Shield Bracket
function displayPieSTC(container){
    var _data = [];
    $.each(gModelYears, function(x, my) { 
        var _my = my.name;
        var _dynamicKey = getDistinctKey(gData);
        var _dynamicObj = gData.groupBy([_dynamicKey]);
        
        $.each(_dynamicObj, function(y, w) { 
            var _grommet = w.name;
            var _grommetNew = _grommet.replace(".","_");

            var _res = w.items.filter(function (item) {
            	return item[_dynamicKey] == _grommet && item.MODEL_YEAR == _my;
            });

           var _count = 0;
            for(; _count < _res.length; ){
                _count++;
            }
            
            _data.push({
                model_year: +_my,
                grommet_type: _grommet,
                count: _count
            });
        });
        
    });

    var container = am4core.create(container, am4core.Container);
    container.width = am4core.percent(100);
    container.height = am4core.percent(100);
    container.layout = "horizontal";
    
    var _createChart = function(data, year){
        var chart = container.createChild(am4charts.PieChart);
        chart.data = data;
        chart.paddingTop= 15;
        chart.paddingBottom = 15;
        
        var title = chart.titles.create();
        title.text =  "MY" + year;
        //title.fontSize = 12;
        title.fontWeight = 800;
        title.marginBottom = 0;
        
        // Add and configure Series
        var pieSeries = chart.series.push(new am4charts.PieSeries());
        pieSeries.dataFields.value = "count";
        pieSeries.dataFields.category = "grommet_type";
        pieSeries.slices.template.propertyFields.fill = "color";
        pieSeries.slices.template.propertyFields.isActive = "pulled";
        pieSeries.slices.template.strokeWidth = 0;
        pieSeries.paddingBottom = 10;
        pieSeries.colors.step = 2;
        
        pieSeries.ticks.template.disabled = true;
        pieSeries.alignLabels = false;
        pieSeries.labels.template.fontSize = 12;
        pieSeries.labels.template.text = "{value.percent.formatNumber('#.00')}%";
        pieSeries.labels.template.radius = am4core.percent(-40);
        //pieSeries.labels.template.relativeRotation = 90;
        pieSeries.labels.template.fill = am4core.color("white");
    
        chart.legend = new am4charts.Legend();
        chart.legend.labels.template.fontSize = 12;
        chart.legend.valueLabels.template.fontSize = 12;
        chart.legend.itemContainers.template.paddingTop = 1;
        chart.legend.itemContainers.template.paddingBottom = 1;
        
        var markerTemplate = chart.legend.markers.template;
        markerTemplate.width = 12;
        markerTemplate.height = 12;
        
        pieSeries.labels.template.adapter.add("radius", function(radius, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return 0;
            }
            return radius;
        });
        
        pieSeries.labels.template.adapter.add("fill", function(color, target) {
            if (target.dataItem && (target.dataItem.values.value.percent < 10)) {
                return am4core.color("#000");
            }
            return color;
        });
    };

    $.each(gModelYears, function(i, v){
        var _my = v.name;
        var _res = _data.filter(function (item) {
        	return item.model_year == _my;
        });

        _createChart(_res, _my);
    });
}

function displayColumnSTC(container, callback){
    if(gData.length > 0){
        var _data = [];
        var _dynamicKey = getDistinctKey(gData);
        var _dynamicObj = gData.groupBy([_dynamicKey]);
        
        $.each(gData.groupBy(["REGION_NAME"]), function(i,r) { 
            $.each(gModelYears, function(x, my) { 
                var _my = my.name;
                var _region = r.name;
                var _obj = {};
                _obj.year = +_my;
                _obj.region = _region;
                _obj.category = _my +"("+ _region +")";
                
                $.each(_dynamicObj, function(y, w) { 
                    var _grommet = w.name;
                    var _grommetNew = _grommet.replace(".","_");
                    var _res = r.items.filter(function (item) {
                    	return item[_dynamicKey] == _grommet && item.MODEL_YEAR == _my;
                    });
                    
                    var _count = 0;
                    for(; _count < _res.length; ){
                        _count++;
                    }
    
                    _obj[_grommetNew] = _count;
                });
                _data.push(_obj);
            });
        });
        
        // Display Chart
        am4core.useTheme(am4themes_animated);
        
        var chart = am4core.create(container, am4charts.XYChart);
        chart.data = _data;
        chart.colors.step = 2;
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
        //valueAxis.title.text = "Count";
        valueAxis.min = 0;
        valueAxis.max = 100;
        valueAxis.strictMinMax = true;
        valueAxis.calculateTotals = true;
        valueAxis.renderer.labels.template.adapter.add("text", function(text) {
          return text + "%";
        });
        
        // Create series
        var _createSeries = function(field, name) {
            var series = chart.series.push(new am4charts.ColumnSeries());
            series.dataFields.valueY = field;
            series.dataFields.valueYShow = "totalPercent";
            series.dataFields.categoryX = "category";
            series.name = name;
            series.tooltipText = "[bold]{name}:[/] {valueY.totalPercent.formatNumber('#.00')}% - [bold]{valueY.formatNumber('#,###')}[/]";
        };
         
        var _createLabel = function(category, endCategory, label) {
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
    
        $.each(_dynamicObj, function(x, w) { 
            var _grommet = w.name;
            var _grommetNew = _grommet.replace(".","_");
            var _field = _grommetNew;
            
            _createSeries(_field, _grommet);
        });  
        
        $.each(gRegionNames, function(i, r) { 
            var _region = "("+ r.name +")";
            
            _createLabel(gMYFrom + _region, gMYTo + _region, r.name);
        });
        
        //Add cursor
        chart.cursor = new am4charts.XYCursor();
        
        setLegendSize(chart);
        setWireTrend(_data);
    }
}

                                       