  var  svn              = zsi.setValIfNull
    ,bs                 = zsi.bs.ctrl
    ,bsButton           = zsi.bs.button
    ,proc_url           = base_url + "common/executeproc/"
    ,gMenuName          = parseInt(zsi.getUrlParamValue("name"))
    ,gMenuId            = parseInt(zsi.getUrlParamValue("id"));
    
 zsi.ready(function(){
    displaySubMenus();
});

function displaySubMenus(){
    var _tw = new zsi.easyJsTemplateWriter(); 
    var _mainHeight = $("main").height() - 200;
    var _cardHeight = _mainHeight / 2;    
    var _$menu = $("#sub-menu");
        _$menu.html("");

    $.get(execURL + "criterias_sel @trend_menu_id="+ gMenuId, function(data){
        var _dataRows = data.rows;
        var _h = "";
        
        $.each(_dataRows, function(i, v){
            if(v.pcriteria_id!==""){
                var _cTitle = $.trim(v.criteria_title);
                var _cLink = _cTitle.toLowerCase().replace(/&/g,"and");
                    _cLink = _cLink.replace(/ /g,"_");
                    
                _h += _tw.sub_menu_card({
                          title     : _cTitle
                        , link      : "elec_" + _cLink + "?name="+ _cTitle +"&id="+ v.menu_id
                        , body_style : "height:" +_cardHeight + "px"
                        //, img_src  : "/file/viewimagedb?sqlcode=t83&imageid=" + v.image3_id 
                        //, onClick       : "displaySubMenu(this,\""+ $.trim(this.menu_type) +"\","+this.menu_id+","+this.specs_id+")"
                    }).html();
            }
        });
        
        _$menu.append(_h);
    });
}  