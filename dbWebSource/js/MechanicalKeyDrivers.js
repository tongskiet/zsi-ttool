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
                , link          : "criteria_single_m?id="+ v.menu_id +"&name="+ _menuName.replace(/&/g, '_')
                , body_style    : "height:" +_cardHeight + "px"
                , img_src       : "/file/viewimagedb?sqlcode=t83&imageid=" + v.image2_id
                , img2_src       : "/file/viewimagedb?sqlcode=t83&imageid=" + v.image1_id 
                , graph_src     : "/images/chart.png" //"/file/viewimagedb?sqlcode=t83&imageid=" + v.image3_id 
            }).html();
        });
         _$menu.append(_h);
    });
}        