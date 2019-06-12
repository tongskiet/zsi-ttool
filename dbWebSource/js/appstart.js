var  projectAccess = {}
    ,procURL = base_url + "sql/proc?p=" 
    ,execURL = base_url + "sql/exec?p="
    ,optionsURL  = base_url + "selectoption/code/" 
    ,bs = zsi.bs.ctrl
    ,svn = zsi.setValIfNull
    ,gMenu = "E" // Initialize Menu 
; 

var  gMenuCount     = zsi.getUrlParamValue("c")
    ,gMenuType      = zsi.getUrlParamValue("mtype")
;


//initialize Settings.
zsi.initDatePicker  = function(){
   var inputDate =$('input[id*=date]').not("input[type='hidden']");
   inputDate.attr("placeholder","mm/dd/yyyy");
   inputDate.keyup(function(){      
         if(this.value.length==2 || this.value.length==5 ) this.value += "/";
   });
   
   if(inputDate.length > 0){
       if(inputDate.datepicker){
          inputDate.datepicker({
              format: 'mm/dd/yyyy'
              ,autoclose:true
              //,daysOfWeekDisabled: [0,6]
          }).on('show', function(e){
              var l_dp     = $('.datepicker');
               l_dp.css("z-index",zsi.getHighestZindex() + 1);
          });
       }
   }
   
   //for datetime picker
   var $dtPicker = $('.zDateTimePicker');
   if( $dtPicker.length > 0) $dtPicker.datetimepicker({ format: "m/d/Y H:i"});
};   


$.fn.dateTimePicker=function(o){
    if(typeof o ===ud) o = {}; 
    if(typeof o.format !==ud)  o.format ="m/d/Y H:i";
    return  this.datetimepicker(o);
};
 
zsi.init({
      baseURL : base_url
     ,errorUpdateURL    :  base_url + "sql/logerror"
     ,sqlConsoleName    :  "runsql"
     ,excludeAjaxWatch  :  ["checkDataExist","searchdata"]
     ,getDataURL        :  base_url + "data/getRecords"
});

var isMenuItemsSaved = readCookie("isMenuItemsSaved");


$.ajaxSetup({ cache: false });

function toggleMenu(o){
	var ttmenu = document.querySelector(".tt-menu");
	if (ttmenu.getAttribute("class").indexOf("show") === -1){
		ttmenu.classList.add("show");

	}else{
		ttmenu.classList.remove("show");
	}
}
		
function displayTrendToolMenus(){ //load Main Menu
    var     _getUrl = window.location.href,
            _search = "page/zsiuserlogin"
            _count  = 1;

    //if (readCookie("zsi_login")==="Y" ||  (_getUrl.search(_search)==0)){ //condition to removed errors in the menu when you are in the second login page.
    
        var _tw = new zsi.easyJsTemplateWriter();   
        var _$menu = $("#topMainMenu");
        var _menu = "Menu";
        var _content = "Content";
        
        var _getMenuItems = function(d){
            var _h = "";
             $.each(d, function(){
                // console.log("menuType: ",this.menu_type);
                // console.log("menuId: ",this.menu_id);
                // console.log("specsId: ",this.specs_id);
               
                _h += _tw.ttStandardMenu({
                      link      : "#"
                    , imageId1  : this.image2_id 
                    , imageId2  : this.image1_id
                    , label     : this.menu_name.toUpperCase()
                    , labelBreakCSS:  ( this.menu_name.length < 10 ?  "label-single" : "label-double" )
                    , onClick       : "displayTrendToolSubMenu(this,\""+ $.trim(this.menu_type) +"\","+this.menu_id+",\""+ $.trim(this.menu_name) +"\"," + _count + ")"
                }).html();
                _count++;
            });
            _count=1;
            return _h;
        };
        _$menu.html("");
        $.get(execURL + "trend_menus_sel", function(data){
            var mnuGrps = data.rows.groupBy(["menu_type"]);
            $.each(mnuGrps, function(i, v){
                var _meneName = this.name.trim();
                var _title =  ( _meneName==="E" ? "ELECTRICAL" : "MECHANICAL");
                var _h= _tw.ttStandardMenuGroup({
                                id      : _title.toLowerCase() + _menu
                               ,title   : _title
                               ,style   : ""//(_meneName !== gMenu ? "display:none": "")
                               ,onclick : "ttSwitchMenu(\""+ _title +"\")"
                               ,tooltip : "Switch to " + (_title==="ELECTRICAL" ? "MECHANICAL" : "ELECTRICAL")
                               ,value   : _getMenuItems( this.items)
                        }).html();
                
               _$menu.append(_h);
    
            });
        });
   // }
}
// function displayTrendToolSubMenu(sel, menuType, menuId, specsId){ //Sub Menu base on Main Menu
//     var _tw = new zsi.easyJsTemplateWriter(); 
//     $.get(execURL + "criterias_sel @trend_menu_id=" + menuId + ",@main_only='Y'", function(data){
//         d = data.rows;
//         if(d.length == 0){
//           // displayTrendToolMenus()   
//         }
//         else{
//             if(menuType==="E"){
//                 window.location.href = "/page/userMenu_Electrical?mId=" + menuId + "&sId=" + specsId;
//             }
//             else if(menuType==="M"){
//                 window.location.href = "/page/userMenu_Mechanical?mId=" + menuId + "&sId=" + specsId;
//             }
            
//         }
//     });
// }
function displayTrendToolSubMenu(sel, menuType, menuId, menuName, count){ //Sub Menu base on Main Menu
    var _tw = new zsi.easyJsTemplateWriter(); 
    $.get(execURL + "criterias_sel @trend_menu_id=" + menuId + ",@main_only='Y'", function(data){
        d = data.rows;
        if(d.length == 0){
           // displayTrendToolMenus()   
        }
        else{
            if(menuType==="E"){
                window.location.href = "/page/criteria_single_e?id=" + menuId +"&name="+ menuName.replace(/&/g, '_') + "&c=" + count + "&mtype=E";
            }
            else if(menuType==="M"){
                window.location.href = "/page/criteria_single_m?id=" + menuId +"&name="+ menuName.replace(/&/g, '_') + "&c=" + count + "&mtype=M";
            }
            
        }

    });
}
// function updateSelectedMainMenu(){
//      _getUrl = window.location.href
//     ,_search = "page/zsiuserlogin"
//     ;
    
//     if(_getUrl.search("page/criteria_single_e")>=0){
//         console.log("electrical" + gMenuCount);
//         $("#electricalMenu .menu-content .menu-item:nth-child(" + gMenuCount +") a").css("padding-top","23px");
//         $("#electricalMenu .menu-content .menu-item:nth-child(" + gMenuCount +") a .text .transparent-bg").css("background-color","rgba(00,00,00,0.5)");
//         $("#electricalMenu .menu-content .menu-item:nth-child(" + gMenuCount +") .imgFade").css("opacity","0");    
//     }
//     if(_getUrl.search("page/criteria_single_m")>=0){
//         console.log("mechanical" + gMenuCount);
//         $("#mechanicalMenu .menu-content .menu-item:nth-child(" + gMenuCount +") a").css("padding-top","23px");
//         $("#mechanicalMenu .menu-content .menu-item:nth-child(" + gMenuCount +") a .text .transparent-bg").css("background-color","rgba(00,00,00,0.5)");
//         $("#mechanicalMenu .menu-content .menu-item:nth-child(" + gMenuCount +") .imgFade").css("opacity","0");        
//     }
// }
$('.navbar-expand .navbar-nav .nav-item .dropdown-toggle').click(function(){
//   _getUrl = window.location.href
//     ,_search = "page/zsiuserlogin"
//     ;
    
    // if(_getUrl.search("page/criteria_single_e")>=0){
    //     console.log("electrical" + gMenuCount);
    //     $("#electricalMenu .menu-content .menu-item:nth-child(" + gMenuCount +") a").css("padding-top","23px");
    //     $("#electricalMenu .menu-content .menu-item:nth-child(" + gMenuCount +") a .text .transparent-bg").css("background-color","rgba(00,00,00,0.5)");
    //     $("#electricalMenu .menu-content .menu-item:nth-child(" + gMenuCount +") .imgFade").css("opacity","0");    
    // }
    // if(_getUrl.search("page/criteria_single_m")>=0){
    //     console.log("mechanical" + gMenuCount);
    //     $("#mechanicalMenu .menu-content .menu-item:nth-child(" + gMenuCount +") a").css("padding-top","23px");
    //     $("#mechanicalMenu .menu-content .menu-item:nth-child(" + gMenuCount +") a .text .transparent-bg").css("background-color","rgba(00,00,00,0.5)");
    //     $("#mechanicalMenu .menu-content .menu-item:nth-child(" + gMenuCount +") .imgFade").css("opacity","0");        
    // }
    console.log(gMenuType);
    if(gMenuType === "E"){
        console.log("electrical" + gMenuCount + "-" + gMenuType);
        $("#electricalMenu .menu-content .menu-item:nth-child(" + gMenuCount +") a").css("padding-top","23px");
        $("#electricalMenu .menu-content .menu-item:nth-child(" + gMenuCount +") a .text .transparent-bg").css("background-color","rgba(00,00,00,0.5)");
        $("#electricalMenu .menu-content .menu-item:nth-child(" + gMenuCount +") .imgFade").css("opacity","0");    
        
    }
    else if(gMenuType === "M"){
        console.log("mechanical" + gMenuCount + "-" + gMenuType);
        $("#mechanicalMenu .menu-content .menu-item:nth-child(" + gMenuCount +") a").css("padding-top","23px");
        $("#mechanicalMenu .menu-content .menu-item:nth-child(" + gMenuCount +") a .text .transparent-bg").css("background-color","rgba(00,00,00,0.5)");
        $("#mechanicalMenu .menu-content .menu-item:nth-child(" + gMenuCount +") .imgFade").css("opacity","0");        
    }
});

if(isMenuItemsSaved ==="N"){
    if(isLocalStorageSupport()) localStorage.clear();
}


if(isLocalStorageSupport()) {
    loadPublicTemplates();
    var menuItems = localStorage.getItem("menuItems");
    if(menuItems)
        displayMenu( JSON.parse(menuItems));
    else
        loadMenu();
}
else 
    loadMenu();


function isLocalStorageSupport(){
    if(typeof(Storage) !== "undefined") return true; else return false;
}


function loadMenu(){
    //console.log(readCookie("zsi_login"));
    if (readCookie("zsi_login")!=="Y"){
        $.getJSON(procURL + "user_menus_sel", function(data){
            if(data.rows.length>0) saveLocalStorageAndDisplay(data);
        }); 
    }
    else{
        $.getJSON(base_url + "sql/exec?p=menus_sel", function(data){
             if(data.rows.length>0) saveLocalStorageAndDisplay(data);
             
        });
                    
    }

}

function loadPublicTemplates(){
    if(isLocalStorageSupport()) {
        var _name ="publicTemplates";
        var _tmpls = localStorage.getItem(_name);
        if(_tmpls === null)
            $.get(base_url + "page/tmplPublic", function(html){
                if(html.indexOf("</html>") < 0) localStorage.setItem(_name, html);
            });  
    }
}

function saveLocalStorageAndDisplay(data){
    
    if(isLocalStorageSupport()) { 
        localStorage.setItem("menuItems", JSON.stringify(data));
        if(isMenuItemsSaved ==="N") createCookie("isMenuItemsSaved","Y",10); 
    }
    displayMenu(data);
    
}

function displayMenu(data){
    var h = createMenuItems(data.rows,"");
    $("#menuPanel").html(h);
    //call highlight event;
    setCurrentMenuEvent();
    highlightCurrentMenu();
    AddSystemMenu();

}

function AddSystemMenu(){
    var ul =  $(".fa-cogs").closest("li").find("ul");
    var createLI  = function(link, text,icon){
        return '<li class="nav-item"><a href="/' + link + '"  class="nav-link"><i class="'+ icon +'"> </i> ' + text + '</a></li>';
    };
    
    ul.append( createLI('page'          ,'Pages'           ,'fab fa-leanpub'));
    ul.append( createLI('pagetemplate'  ,'Page Templates'  ,'far fa-newspaper'));
    ul.append( createLI('javascript'    ,'Javascripts'     ,'fab fa-js'));
    ul.append( createLI('sql'           ,'SQL Console'     ,'fas fa-database'));
}


function hasChild(data,menu_id){
    for(var x=0; x<data.length;x++ ){
        if(data[x].pmenu_id===menu_id) return true;
    }
    return false;
}


 
function loadChild(data,menu_id){
    var h="";
    for(var x=0; x<data.length;x++ ){
        if(data[x].pmenu_id==menu_id) {  
            var hc= hasChild(data, data[x].menu_id);
            var target = (data[x].page_name==="help"?"target=\"_blank\"":"");
            var params  = (typeof data[x].parameters!== ud ? (  data[x].parameters!=="" ?  "?" + data[x].parameters : "") : "" );
            h+= "<li class='nav-item" + ( hc===true ? " dropdown":"" ) + "'>"
            + "<a " + target + " href='"+  ( hc===true ? "#" : (data[x].page_name!=="" ? base_url + "page/" + data[x].page_name + params :"#" ) )  + "' class='nav-link"  + ( hc===true ? "  dropdown-toggle":"" ) + "' " + ( hc===true ?"data-toggle='dropdown'":"")  + ">" 
                + '<i class="'+ data[x].icon + '"> </i> ' + data[x].menu_name 
            +  "</a>" 
            + createMenuItems(data,data[x].menu_id) 
            + "</li>";
        }
    }
    return h;
}

function createMenuItems(data, menu_id){
    var html="";
    var cls = (parseInt("0" +menu_id)===0?"navbar-nav": "dropdown-menu");
    var hc= hasChild(data,menu_id); 
    if(hc) html +="<ul class='"+ cls + "'>";
        html +=loadChild(data,menu_id);
    if(hc) html +="</ul>";
    return html;
}

function setCurrentMenuEvent(){
    var pClass= "ul.nav > li.dropdown";
    var cClass= "ul.nav > li.dropdown > ul.dropdown-menu > li.dropdown";
    
    $(pClass + " > a").click(function(){
        var pim =$(pClass).index(this.parentNode);
        createCookie("parentIndexMenu",pim,1);
    });
    
    $(cClass + " > a").click(function(){
        var cim =$(cClass).index(this.parentNode);
        createCookie("childIndexMenu",cim,1);
    });

}

function setCurrentMenuEvent(){
    var pClass= "ul.nav > li.dropdown";
    var cClass= "ul.nav > li.dropdown > ul.dropdown-menu > li.dropdown";
    
    $(pClass + " > a").click(function(){
        var pim =$(pClass).index(this.parentNode);
        createCookie("parentIndexMenu",pim,1);
        highlightCurrentMenu();
    });
    
    $(cClass + " > a").click(function(){
        var cim =$(cClass).index(this.parentNode);
        createCookie("childIndexMenu",cim,1);
        highlightCurrentMenu();
    });
}

function highlightCurrentMenu(){
    var pClass= "ul.nav > li.dropdown";
    var cClass= "ul.nav > li.dropdown > ul.dropdown-menu > li.dropdown";
    var pHClass="zParentHighLight";
    var cHClass="zChildHighLight";

    var pim = readCookie("parentIndexMenu");
    var cim = readCookie("childIndexMenu");

    if(pim){
        $(pClass).removeClass(pHClass);
        $($(pClass).get(pim)).addClass(pHClass);
    }
    
    if(cim){
        $(cClass).removeClass(cHClass);
        $($(cClass).get(cim)).addClass(cHClass);    
    }
    
    $("a.navbar-brand").click(function(){
        //remove cookie
          createCookie("parentIndexMenu",-1,0);
          createCookie("childIndexMenu",-1,0);
    });
}


function getPageURL(pageName){
    return base_url + "page/" + pageName;
}

function getImageURL(fileName){
    return base_url + "file/viewImage?fileName="  + fileName; 
}

function getProjectImageURL(id,fileName){
    return base_url + "file/viewImage?fileName=projects/" + id + "/"  + fileName; 
}

function getOptionsURL(code){
    return base_url + "selectoption/code/" + code ;
}

$(document).ready(function(){
   displayTrendToolMenus();
});

$(document).on("click", function(event){
    if($(event.target).closest('.dropdown-toggle').length || $(event.target).closest('#topMainMenu').length){
        return;
    }else{
        $("#topMainMenu").removeClass("show");
    }
});


zsi.ready = function(callBack){
   $(document).ready(function(){
        //getProjectAccess(callBack);
        
        callBack();
        
   });
   
};

/*--[cookie]--*/
function createCookie(name,value,days) {
    var expires;
    if (days) {
    	var date = new Date();
    	date.setTime(date.getTime()+(days*24*60*60*1000));
    	expires = "; expires="+date.toGMTString();
    }
    else expires = "";
    document.cookie = name+"="+value+expires+"; path=/";
}
function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
    	var c = ca[i];
    	while (c.charAt(0)==' ') c = c.substring(1,c.length);
    	if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
function deleteCookie(name) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function ttSwitchMenu(val){ // trend tool menu switch
    $("#" + val.toLowerCase() + "Menu").hide();
    if(val==="ELECTRICAL"){
        $("#mechanicalMenu").fadeIn();
    }else{
        $("#electricalMenu").fadeIn();
    }
}
function isTeamMemberOrAdmin(){
    return true;
    /*
    var _pa = projectAccess; 
    if((_pa.isProjTeamMember==="Y") || (_pa.isAdmin==="Y") || (_pa.is_zsi==="Y" ))
        return true;
    else
        return false;
        */
} 
                     