zsi.ready(function(){
    displayMenus();
});

function displayMenus(){
    var _tw = new zsi.easyJsTemplateWriter(); 
    var _mainHeight = $("main").height() - 152;
    var _cardHeight = _mainHeight / 2;    
    var _$menu = $("#main-menu");
        _$menu.html("");

    $.get(execURL + "trend_menus_sel @menu_type='M'", function(data){
        var _dataRows = data.rows;
        var _h = "";
        var _ctr = 0;
        $.each(_dataRows, function(i, v){
            i++;
            var _menuName = $.trim(v.menu_name);
            var _menuLink = _menuName.toLowerCase().replace(/&/g,"and");
                _menuLink = _menuLink.replace(/ /g,"_");
            _h = _tw.main_menu_card({
                  title         : _menuName
                , link          : "criteria_single_m?id="+ v.menu_id +"&name="+ _menuName.replace(/&/g, '_') + "&c=" + i + "&mtype=M"
                , body_style    : "height:" +_cardHeight + "px"
                , img3_src       : "/file/viewimagedb?sqlcode=t83&imageid=" + v.image3_id
                , img4_src       : "/file/viewimagedb?sqlcode=t83&imageid=" + v.image4_id 
            }).html();
            _$menu.append(_h);
            _ctr++;

            if(_ctr === _dataRows.length){
                $(".animate").height(_cardHeight).removeClass("preload");
            } 
        });
        
    });
}             