SVG.on(document, 'DOMContentLoaded', function() {
    var btn = document.getElementById('btn');
    btn.onclick = start;
    var draw = SVG('main').size('100%', '100%');
    Game.draw=draw;
    
});

function start(){
    var s = parseInt(document.getElementById('size').value);
    var r = parseInt(document.getElementById('rows').value);
    var p = document.getElementById('circle').checked;
    if(r>s) {
        alert('Podaj poprawne wartości!');
        return;
    }
    if(r==3&&s>3){
        alert("Ta opcja jest dostępna tylko na planszy 3x3!");
        return;
    }
    Game.start(s, r, p);
}

var Game = {
    draw: null,
    playing: 1, //1 - circle, 2 - cross
    turn: 1,
    delay: 700,
    rowToWin: 3,
    size: 3,
    start: function(s,r,p){
        Game.size = s;
        Game.rowToWin = r;
        Game.turn =1;
        
        Game.map=new Array();
        for(var i=0; i<Game.size; i++){
            Game.map[i] = new Array();
            for(var j=0; j<Game.size; j++){
                Game.map[i].push(0);
            }
        }

        Game.draw.clear();
        Graphics.drawMatrix(Game.draw);

        if(p)
            Game.playing =1;
        else {
            Game.playing =2;
            Game.doAMove();
        }
    },
    click: function(e){
        if(Game.turn!=Game.playing) return;
        var t = e.attr('id').split('-');
        if(Game.map[t[0]-1][t[1]-1]!=0){
            return;
        } else{
            Game.map[t[0]-1][t[1]-1]=Game.playing;
            if(Game.playing==1) Graphics.drawCircle(Game.draw, t[0], t[1]);
            else Graphics.drawCross(Game.draw, t[0], t[1]);
            if(Game.check()==Game.playing){
                Game.turn=-1;
                Graphics.drawLine(Game.draw, Game.win1[0]+1, Game.win1[1]+1,
                        Game.win2[0]+1, Game.win2[1]+1);
                setTimeout(function(){
                    alert("Wygrałeś!");
                },600);
            } else if(!Game.checkRemis()){
                Game.changeTurn();
                setTimeout(function(){
                    Game.doAMove();
                }, Game.delay);
            }
        }
    },
    changeTurn: function(){
        if(Game.turn==1) Game.turn = 2;
        else Game.turn = 1;
    },
    checkRemis: function(){
        for(var i=0; i<Game.size; i++){
            for(var j=0; j<Game.size; j++){
                if(Game.map[i][j]==0) return false;
            }
        }
        setTimeout('alert("Remis!")', 600);
        Game.turn=3;
        return true;
    },
    doAMove: function(){
        if(Game.turn==3) return;
        var pos = [0, 0];
        var val = -1;
        var tmp;
        for(var i=0; i<Game.size; i++){
            for(var j=0; j<Game.size; j++){
                tmp = Game.calcMove(i, j);
                if(tmp>val){
                    pos = new Array(i, j);
                    val = tmp;
                } else if(tmp==val&&Math.random()>0.6){
                    pos = new Array(i, j);
                    val = tmp;
                }
            }
        }
        if(Game.turn==1){ 
            Graphics.drawCircle(Game.draw, pos[0]+1, pos[1]+1);
        }
        else {
            Graphics.drawCross(Game.draw, pos[0]+1, pos[1]+1);
        }
        Game.map[pos[0]][pos[1]]=Game.turn;
        if(Game.check()==Game.turn){
            Graphics.drawLine(Game.draw, Game.win1[0]+1, Game.win1[1]+1,
                    Game.win2[0]+1, Game.win2[1]+1);
            setTimeout(function(){
                alert("Przegrałeś!");
            }, 600);
        } else if(!Game.checkRemis()){
            setTimeout(Game.changeTurn, Game.delay);
        };
    },
    calcMove: function(x,y){
        var val=0, t=0, p=0;
        let tmpX=0, tmpY=0, tmp=0;
        if(Game.map[x][y]!=0) return -1;
        for(var i=x-1; i<x+2&&i<Game.size; i++){
            for(var j=y-1; j<y+2&&j<Game.size; j++){
                if(i<0||j<0) continue;
                if(i==x&&j==y) continue;
                if(Game.map[i][j]==0) {
                    val+=5;
                }
                if(Game.map[i][j]==Game.turn) {
                    tmpX = i-(x-i);
                    tmpY = j-(y-j);
                    tmp=1;
                    while(tmpX>=0&&tmpX<Game.size&&tmpY>=0&&tmpY<Game.size){
                        if(Game.map[tmpX][tmpY]==Game.turn){
                            val+=20;
                            t+=2;
                            tmp++;
                        }
                        else if(Game.map[tmpX][tmpY]==Game.playing) break;
                        tmpX = tmpX-(x-i);
                        tmpY = tmpY-(y-j);
                    }
                    if(tmp+1>=Game.rowToWin) val+=1000;
                    t++;
                    val+=10;
                }
                if(Game.map[i][j]==Game.playing) {
                    tmpX = i-(x-i);
                    tmpY = j-(y-j);
                    while(tmpX>=0&&tmpX<Game.size&&tmpY>=0&&tmpY<Game.size){
                        if(Game.map[tmpX][tmpY]==Game.playing) {
                            val+=50;
                            p+=2;
                        }
                        else if(Game.map[tmpX][tmpY]==Game.turn) break;
                        tmpX = tmpX-(x-i);
                        tmpY = tmpY-(y-j);
                    }
                    val+=15;
                    p++;
                }
            }
        }
        val += t*20+p*30;
        return val;
    },
    win1: [0,0],
    win2: [0,0],
    check: function(){
        var lastType= -1;
        var c=0;
        for(var i=0; i<Game.size; i++){
            for(var j=0; j<Game.size; j++){
                if(Game.map[i][j]>0){
                    if(Game.map[i][j]==lastType){
                        c++;
                        if(c==Game.rowToWin){
                            Game.win2 = new Array(i, j);
                            return lastType;
                        }
                    } else{
                        Game.win1 = new Array(i, j);
                        c=1;
                    }
                }
                lastType = Game.map[i][j];
            }
            c=0;
            lastType = 0;
        }
        for(var j=0; j<Game.size; j++){
            for(var i=0; i<Game.size; i++){
                if(Game.map[i][j]>0){
                    if(Game.map[i][j]==lastType){
                        c++;
                        if(c==Game.rowToWin){
                            Game.win2 = new Array(i, j);
                            return lastType;
                        }
                    } else{
                        Game.win1 = new Array(i, j);
                        c=1;
                    }
                }
                lastType = Game.map[i][j];
            }
            c=0;
            lastType = 0;
        }
        for(var i=Game.size*-1; i<Game.size; i++){
            for(var j=0, i2=i; i2<Game.size&&j<Game.size; ){
                if(i2<0){
                    j++;
                    i2++;
                    continue;
                }
                if(Game.map[i2][j]>0){
                    if(Game.map[i2][j]==lastType){
                        c++;
                        if(c==Game.rowToWin){
                            Game.win2 = new Array(i2, j);
                            return lastType;
                        }
                    } else{
                        Game.win1 = new Array(i2, j);
                        c=1;
                    }
                }
                lastType = Game.map[i2][j];
                j++;
                i2++;
            }
            c=0;
            lastType = 0;
        }
        for(var i=Game.size*-1; i<Game.size; i++){
            for(var j=Game.size-1, i2=i; i2<Game.size&&j>=0; ){
                if(i2<0){
                    j--;
                    i2++;
                    continue;
                }
                if(Game.map[i2][j]>0){
                    if(Game.map[i2][j]==lastType){
                        c++;
                        if(c==Game.rowToWin){
                            Game.win2 = new Array(i2, j);
                            return lastType;
                        }
                    } else{
                        Game.win1 = new Array(i2, j);
                        c=1;
                    }
                }
                lastType = Game.map[i2][j];
                j--;
                i2++;
            }
            c=0;
            lastType = 0;
        }
        return 0;
    },
    
    map: [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ]
};

var Graphics = {
    drawMatrix: function(draw){
        for(var x=1; x<=Game.size; x++){
            for(var y=1; y<=Game.size; y++){
                draw.rect(400/Game.size, 400/Game.size).attr({
                    x: 100+(x-1)*(400/Game.size), y: 100+(y-1)*(400/Game.size),
                    fill: '#fff', stroke: '#000',
                    id: x+'-'+y
                }).click(function(){Game.click(this);});
            }
        }
    },

    drawCircle: function(draw, x, y){
        draw.circle(((400/Game.size)/5.0)*4).attr({ 
            cx: 100+(x-1)*(400/Game.size)+(400/Game.size/2), 
            cy: 100+(y-1)*(400/Game.size)+(400/Game.size/2),
            fill: '#fff', stroke: '#000', 'stroke-width': 5, 
            opacity: 0.0
        }).animate(500).attr({opacity: 1});
    },
    
    drawCross: function(draw, x, y){
        draw.line(
                100+(x-1)*(400/Game.size)+(400/Game.size/10), 
                100+(y-1)*(400/Game.size)+(400/Game.size/10), 
                100+(x-1)*(400/Game.size)+(400/Game.size/10)*9, 
                100+(y-1)*(400/Game.size)+(400/Game.size/10)*9).stroke({width: 5})
                .attr({opacity: 0.0}).animate(250).attr({opacity: 1});
        draw.line(
                100+(x-1)*(400/Game.size)+(400/Game.size/10)*9, 
                100+(y-1)*(400/Game.size)+(400/Game.size/10), 
                100+(x-1)*(400/Game.size)+(400/Game.size/10), 
                100+(y-1)*(400/Game.size)+(400/Game.size/10)*9).stroke({width: 5})
                .attr({opacity: 0.0}).delay(250).animate(250).attr({opacity: 1});
    },
    
    drawLine: function(draw,x,y,x2,y2){
        draw.line(
                100+(x-1)*(400/Game.size)+(400/Game.size/2),
                100+(y-1)*(400/Game.size)+(400/Game.size/2),
                100+(x2-1)*(400/Game.size)+(400/Game.size/2),
                100+(y2-1)*(400/Game.size)+(400/Game.size/2)).stroke({width: 5}).attr({'stroke-linecap': 'round'});
    }
};