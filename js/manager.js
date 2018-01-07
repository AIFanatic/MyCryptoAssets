// General Manager/Helpers
// - Manage side menu etc

function SlideToggle(elem){
    $(elem).animate({
        width: "toggle"
      });
}

function GetCoinFromID(id){
    return id.split("-")[0];
}

$(document).ready(function() {
    $('select').material_select();
});

var currentMenu = "portfolio";
var fadeSpeed = 250;

$( ".side-menu-btn" ).click(function() {
    var menuTag = $(this).attr("data-content");

    // Change side nav active/highlight
    $("#nav-"+currentMenu).removeClass("active");
    $(this).parent().addClass("active");

    // Hide and show main content
    $("#main-"+currentMenu).fadeOut(fadeSpeed, function(){
        // Change main content nav title
        $(".main-bar-main").text(menuTag);
        $("#main-"+menuTag).fadeIn(fadeSpeed);
    });

    // Hide side nav (mobile)
    $('.button-collapse').sideNav('hide');
    
    // Assign new menu
    currentMenu = menuTag;
});

$(document).on('click', '#main-portfolio li', function(){
    var info_box = $(this).children("div").children(".info-box");

    SlideToggle(info_box);
});