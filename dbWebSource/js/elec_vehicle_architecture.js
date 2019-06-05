  var  svn              = zsi.setValIfNull
    ,bs                 = zsi.bs.ctrl
    ,bsButton           = zsi.bs.button
    ,proc_url           = base_url + "common/executeproc/"
    ,gMenuName          = zsi.getUrlParamValue("name")
    ,gMenuId            = zsi.getUrlParamValue("id")
    ,gMenuType          = zsi.getUrlParamValue("type");
    
 zsi.ready(function(){
    displayMenus();
    setScrollToTop();
});

function setScrollToTop(){
    $('main').scroll(function() {
        if ($(this).scrollTop() >= 50) {    // If page is scrolled more than 50px
            $('#btnGoTop').fadeIn(200);     // Fade in the arrow
        } else {
            $('#btnGoTop').fadeOut(200);    // Else fade out the arrow
        }
    });
    
    $('#btnGoTop').click(function() {       // When arrow is clicked
        $('main').animate({
            scrollTop : 0                   // Scroll to top of body
        }, 500);
    });
}

function setTabSelection(){
    if(gMenuType==="E"){
        $('#nav-tab a[href="#nav-elec"]').tab('show');
    }else{
        $('#nav-tab a[href="#nav-mech"]').tab('show');
    } 
}

function getMainMenu(callback){
    $.get(procURL + "trend_menus_sel", function(data){
        callback(data.rows);
    });
}

function getSubMenu(id, callback){
    $.get(procURL + "criterias_sel @trend_menu_id="+ id, function(data){
        callback(data.rows);
    });
}

function displayMenus(){
    var _tw = new zsi.easyJsTemplateWriter();
    var _$menuElec = $("#menuElectrical");
    var _$menuMech = $("#menuMechanical");
        _$menuElec.html("");
        _$menuMech.html("");

    setTabSelection();
    getMainMenu(function(rows){
        $(rows.groupBy(["menu_type"])).each(function(i, v){
            var _mType = $.trim(v.name);
            var _mItems = v.items;
            var _mCount = _mItems.length;
            var _mainH = "";
            var _ctr = 0;
          
            $(_mItems).each(function(i, v){
                var _mId = v.menu_id;
                var _mName = $.trim(v.menu_name);
                
                _mainH += _tw.menu_title({
                    id : "section" + _mId,
                    title : _mName,
                    body_id : "section_content"+ _mId
                }).html();
                
       
                if(_mType === "E"){
                    _$menuElec.html(_mainH);
                }else{
                    _$menuMech.html(_mainH);
                }
                
                setSubMenu(_mId, _mType, function(){
                    _ctr++;
                    if(_ctr === _mCount){
                        if(gMenuId !== "") {
                            if(_mType === gMenuType) slideToSection(gMenuId);
                        }
                    }
                    
                });
            });
        });
    });
}    

function setSubMenu(mId, mType, callback){
    var _tw = new zsi.easyJsTemplateWriter(); 
    var _mainHeight = $("main").height() - 200;
    var _cardHeight = _mainHeight / 2;    
    var _subH = "";
    
    getSubMenu(mId, function(rows){
        $(rows).each(function(i, v){
            if(v.pcriteria_id !== ""){
                var _cTitle = $.trim(v.criteria_title);
                var _cLink = (mType === "E" ? "electrical" : "mechanical") + "_criteria";
                // var _cLink = _cTitle.toLowerCase().replace(/&/g,"and");
                //     _cLink = _cLink.replace(/ /g,"_");
                
                _subH += _tw.menu_card({
                      title     : _cTitle
                    , link      : _cLink + "?id="+ v.criteria_id +"&name="+ _cTitle
                    , body_style : "height:" +_cardHeight + "px"
                    //, img_src  : "/file/viewimagedb?sqlcode=t83&imageid=" + v.image3_id 
                    //, onClick       : "displaySubMenu(this,\""+ $.trim(this.menu_type) +"\","+this.menu_id+","+this.specs_id+")"
                }).html();
            }
        });
        $("#section_content"+ mId).html(_subH);
        
        callback();
    });
}

function slideToSection(id) {
    $('main').animate({
        scrollTop: $('#section'+ id).offset().top - 80
    });
}

         