 var  svn               = zsi.setValIfNull
    ,bs                 = zsi.bs.ctrl
    ,bsButton           = zsi.bs.button
    ,proc_url           = base_url + "common/executeproc/"
    ,gMenuId            = zsi.getUrlParamValue("id")
    ,gMenuName          = zsi.getUrlParamValue("name")
    ,gData              = [];
    
zsi.ready=function(){
    gMenuName = $.trim(unescape(gMenuName).replace("_", "&")).toUpperCase();
    $("#criteria_title").text(gMenuName);
    
    initScrollToTop();
    displayCriteria();
};

function initScrollToTop(){
    $(window).resize(function() {
        resizeCard();
    });
    
    $('main').scroll(function() {
        if ($(this).scrollTop() >= 50) {    
            $('#btnGoTop').fadeIn(200);
        } else {
            $('#btnGoTop').fadeOut(200); 
        }
    });
    
    $('#btnGoTop').click(function() { 
        $('main').animate({
            scrollTop: 0
        });
    });
}

function resizeCard(){
    var _value = [];
    $(".flip-wrapper img").each(function() {
        var el = $(this).height(); 

        _value[_value.length] = el;
    });

    var _minValue = Math.min.apply(Math, _value);

    $(".flip-wrapper").css('height', _minValue);
}

function getSubMenu(callback){
    $.get(execURL + "criterias_sel @trend_menu_id="+ gMenuId, function(data){
        gData = data.rows;
        callback(data.rows);
    });
}

function displayCriteria(){
    var _tw = new zsi.easyJsTemplateWriter();
    var _$container = $("#criteria_content");
    var _mainHeight = $("main").height() - 180;
    var _cardHeight = _mainHeight / 2;
    
    if(gMenuId !== ""){
        getSubMenu(function(rows){
            var _h = "";
            var _count = rows.length;
            var _ctr = 0;
            
            $(rows).each(function(i, v){
                if(v.pcriteria_id !== ""){
                    var _cId = v.criteria_id;
                    var _cTitle = $.trim(v.criteria_title);
                    var _cLink = "chart_electrical?menu="+ gMenuName.replace(/&/g, '_') +"&id="+ _cId +"&name="+ _cTitle.replace(/&/g, '_') + "&c=" + gMenuCount + "&mtype=" + gMenuType;
                    
                    _h += _tw.criteria_card({
                          title     : _cTitle
                        , chart_id  : "chart_"+ _cId
                        , link      : _cLink
                        , img_src   : getImageUrl(this.image2_id)  
                        , img2_src  : getImageUrl(this.image1_id)

                    }).html();
                }
            });
            _$container.html(_h);
            
            resizeCard();
        });
    }
}
     