var g$iconName = $(".modal-content").find("#fa_icon_name");
var g$icon     = $(".modal-content").find("#fa_icon_id");

zsi.ready(function(){
    zsi.getData({
         sqlCode : "T72"
        ,onComplete : function(d) {
            var _d = d.rows[0];
            g$iconName.val(_d.fa_icon);
            g$icon.val(g$icon.attr("class",_d.fa_icon));
        }
    });

    g$iconName.keyup(function(){
        g$icon.val(g$icon.attr("class",g$iconName.val()));
    });    

 });  