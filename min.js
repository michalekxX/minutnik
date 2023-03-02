
    //czas respow wzor/pobranie pakietu z serwera z danymi, jesli mamy w bestiariuszu.
    //contentactu - zmniejszanie, zamiast tworzenia na nowo
var arr_to_save = ["Rzadki", "Epicki", "Legendarny", "Mityczny"];
var arr_data = JSON.parse(localStorage.getItem("minutnik_data")) == undefined ? [] : JSON.parse(localStorage.getItem("minutnik_data"));
var pSP = window.game.parseServerPacket;
window.game.parseServerPacket = function(data){
    var rar = -1;
    if(data.code == 54){
        rar = arrayHaveThisType(window.game.monsters[data.id].name);
    }
    pSP(data);
    if(rar != -1) {
        arr_data.push(new newMob(data.id, window.game.monsters[data.id].short_name, rar));
        sendActu();
    }
}

var lM = window.map.loadMonsters;
window.map.loadMonsters = function(d){
    lM(d);
    for(var i in d){
        if(typeof(d[i]) == "object" && window.game.monsters[d[i].id].type > 0 && window.game.monsters[d[i].id].is_death == false){//type?
            for(var j = 0; j < arr_data.length; j++){
                if(arr_data[j].id == d[i].id){
                    arr_data.splice(j, 1);
                    j--;
                    sendActu();
                }
            }
        }
    }
}

function arrayHaveThisType(monster){
    for(var i = 0; i < arr_to_save.length; i++){
        if(monster.includes(arr_to_save[i])) return i;
    }
    return -1;
}

function calculateExpireTime(mob){
    //tutaj obliczamy, albo pobieramy czas, na razie wrzuce na sztywno.
    var time = Date.now() + 10 * 60 * 10**3;
    var time1 = new Date(Date.now() + 10 * 60 * 10**3);
    console.log(time1.toISOString().slice(0, 19).replace('T', ' '));
    return time;
}

function sendActu(){
    localStorage.setItem("minutnik_data", JSON.stringify(arr_data));
    if(!arr_data.length && $("#minutnik").length)
    {
        $("#minutnik").remove();
    }
}

function contentActu(){
    for(var i = 0; i < document.getElementById("window-mob").children.length; i++){
        if(typeof(i) == "number" && document.getElementById("window-mob").children[0].lastChild.outerText != "00:00:00"){
            var time = arr_data[i].expire_time - Date.now();
            time = time / 1000;
            var secs = time % 60;
            time = (time - secs) / 60;
            var mins = time % 60;
            var hrs = (time - mins) / 60;
            hrs = hrs < 10 ? "0" + hrs : hrs;
            mins = mins < 10 ? "0"+mins:mins;
            if(secs < 0){
                secs = "00";
            }else{
                secs = secs < 10 ? "0" + Math.floor(secs) : Math.floor(secs);
            }
            document.getElementById("window-mob").children[i].lastChild.innerHTML = hrs + ':'+mins + ':' + secs;
        }
    }
}

function refreshList(){
    $("#window-mob").children().remove()
    for(var j = 0; j < arr_data.length; j++){
        $("#window-mob").append('<div id="mob_g_'+arr_data[j].id +'" class ="store-offer premium-item" style = "width: auto !important; position:relative;font-size: 25px;display: flex;justify-content: space-between;" class="mob_'+arr_data[j].id+'">'+
          '<div>'+arr_data[j].name+'</div>'+
          '<div>'+arr_data[j].expire_time+'</div>'+
          '</div>');
    }
}

setInterval(function (){
    if(!arr_data.length) return;
    console.log('aktualizuje dane');
    var time_now = Date.now();
    for(var i = 0; i < arr_data.length; i++){
        if(arr_data[i].expire_time < (time_now - 30 * 10 ** 3)){
            $("#mob_g_"+arr_data[i].id).remove();
            arr_data.splice(i, 1);
            sendActu();
            i--;
        }
    }

    if(!$("#minutnik").length && arr_data.length){
        $(
`<div class = "draggable" id = "minutnik" style = "position:absolute; z-index:1000;transform:scale(0.6)">

<div class = "window-4-heading">
<div class="title-label overlock font-20">Minutnik</div>
<div class = "heading-close heading-4"></div>
</div>
<div id = "window-mob" style = "padding:20px;margin-top: -9px;width:461px; height:492px;background-image: url('https://alkatria.pl/templates/client/default/images/windows/window_equipment_empty.png')">

</div>
</div>
`).appendTo("#game");
}

    if(arr_data.length && document.getElementById("window-mob").children.length != arr_data.length){
        refreshList();
    }
    contentActu();
}, 1000);

class newMob{//tworzenie mobkow.
    constructor(id, name, rar){
        this.id = id;
        this.name = name;
        this.rarity = rar;
        this.expire_time = calculateExpireTime(this);
    }
}
