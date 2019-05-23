zsi.ready(function(){
    displayMenus();
});

function displayMenus(){
    var _tw = new zsi.easyJsTemplateWriter(); 
    var _mainHeight = $("main").height() - 170;
    var _cardHeight = _mainHeight / 2;    
    var _$menu = $("#main-menu");
        _$menu.html("");

    $.get(execURL + "trend_menus_sel @menu_type='M'", function(data){
        var _dataRows = data.rows;
        var _h = "";
        $.each(_dataRows, function(i, v){
            var _menuName = $.trim(v.menu_name);
            var _menuLink = _menuName.toLowerCase().replace(/&/g,"and");
                _menuLink = _menuLink.replace(/ /g,"_");
            _h += _tw.main_menu_card({
                  title         : _menuName
                , link          : "mech_" + _menuLink + "?name="+ _menuName +"&id="+ v.menu_id
                , body_style    : "height:" +_cardHeight + "px"
                , img_src       : "/file/viewimagedb?sqlcode=t83&imageid=" + v.image1_id 
                , graph_src     : "/file/viewimagedb?sqlcode=t83&imageid=" + v.image3_id 
                //, onClick       : "displaySubMenu(this,\""+ $.trim(this.menu_type) +"\","+this.menu_id+","+this.specs_id+")"
            }).html();
        });
         _$menu.append(_h);
    });
}  