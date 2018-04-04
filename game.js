var ctx;

var bg_canvas;
var bg_ctx;

var levelTile_canvas;
var levelTile_ctx;

var white="#fff";
var black="#000";
var gold="#ffd700";
var red="#f00";
var spring="#00ff7f";
var pantoneFont="bold 15px sans-serif";

var resetCounter=0;

var p={};

var level={};
var levelNum=0;
var loading=false;

var debug=false;

var levelEndAnim=0;
var levelEndAnimDisplayed=false;
var waitCounter=0;

var solid=[false,true,true,true,true];

var init=function() {
    debug=false;
    var canvas=document.getElementById("canvas");
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;
    ctx=document.getElementById("canvas").getContext("2d");
    bg_canvas=document.createElement("canvas");
    bg_canvas.width=800;
    bg_canvas.height=600;
    bg_ctx=bg_canvas.getContext("2d");
    ctx.font=pantoneFont;
    bg_ctx.font=pantoneFont;
    levelTile_canvas=document.createElement("canvas");
    levelTile_canvas.width=100;
    levelTile_canvas.height=140;
    levelTile_ctx=levelTile_canvas.getContext("2d");
    loadLevel(levelNum,gameLoop);
}

var containsSolidGround=function(x,y) {
    if (solid[level.grid[Math.floor(x/100)][Math.floor(y/140)]]) {
        return true;
    }
    for (var i=0; i<level.entities.length; i++) {
        if (level.entities[i].isSolid&&level.entities[i].rect.contains(x,y)) {
            return true;
        }
    }
    return false;
}

var loadLevel=function(id,callback) {
    loadJSON("levels/"+id+".json",function(result) {
        bg_ctx.clearRect(0,0,bg_canvas.width,bg_canvas.height);
        bg_canvas.width=result.grid[0].length*100;
        bg_canvas.height=result.grid.length*140;
        level.grid=[];
        level.entities=[];
        var textId=0;
        for (var x=0; x<result.grid[0].length; x++) {
            level.grid.push([]);
            for (var y=0; y<result.grid.length; y++) {
                switch(result.grid[y].charAt(x)) {
                    case ' ':
                        level.grid[x].push(0);
                        break;
                    case 'm':
                        level.grid[x].push(1);
                        renderPantone(bg_ctx,black,"SOLID","BLACK",x*100,y*140,100,140);
                        break;
                    case 'p':
                        level.grid[x].push(0);
                        p=player(x*100+20,y*140+40)
                        level.entities.splice(0,0,p);
                        break;
                    case 'M':
                        level.grid[x].push(0);
                        level.entities.push(rollingBlock(x*100,y*140));
                        break;
                    case 'g':
                        level.grid[x].push(2);
                        renderPantone(bg_ctx,gold,"GOLDEN","GOAL",x*100,y*140,100,140);
                        break;
                    case 't':
                        level.grid[x].push(1);
                        renderPantone(bg_ctx,black,result.specialText[textId][0],result.specialText[textId][1],x*100,y*140,100,140);
                        textId++;
                        break;
                    case 'l':
                        level.grid[x].push(3);
                        renderPantone(bg_ctx,red,"LAVA RED","",x*100,y*140,100,140);
                        break;
                    case 's':
                        level.grid[x].push(4);
                        renderPantone(bg_ctx,spring,"SPRING","GREEN",x*100,y*140,100,140);
                        break;
                }
                
            }
        }
        level.width=level.grid.length;
        level.height=level.grid[0].length;
        callback();
    });
}

var gameLoop=function() {
    update();
    render();
    window.requestAnimationFrame(gameLoop);
}

var update=function() {
    if (loading) {return;}
    if (waitCounter>0) {waitCounter--;return;}
    if (levelEndAnim>0) {
        levelEndAnim-=10;
        if (levelEndAnim<=0) {
            levelEndAnim=0;
            loading=true;
            waitCounter=40;
            loadLevel(levelNum,function() {
                loading=false;
            });
        }
        return;
    } else if (levelEndAnim<=0&&levelEndAnimDisplayed) {
        levelEndAnim-=10;
        if (levelEndAnim<-ctx.canvas.height/2) {
            levelEndAnim=0;
            levelEndAnimDisplayed=false;
        }
        return;
    }
    for (var i=0; i<level.entities.length; i++) {
        level.entities[i].update();
        if (p.dead) {
            break;
        }
    }
    keys[4].isPressed=false;
    if (keys[5].isDown) {
        resetCounter+=1;
        if (resetCounter>=50) {
            startLevelLoad(0,0);
            resetCounter=0;
        }
    } else {
        resetCounter-=2;
        if (resetCounter<0){
            resetCounter=0;
        }
    }
}

var startLevelLoad=function(levelsIncremented,delay) {
    levelEndAnim=ctx.canvas.height/2;
    waitCounter=delay;
    levelEndAnimDisplayed=true;
    levelNum+=levelsIncremented;
    renderPantone(levelTile_ctx,getRandomRGB(),"LEVEL "+(levelNum+1),"",0,0,100,140);
}

var RGBChars=['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];

var getRandomRGB=function() {
    var ans="#";
    for (var i=0; i<6; i++) {
        ans+=RGBChars[Math.floor(Math.random()*16)];
    }
    return ans;
}

var calcCenter=function() {
    var c={};
    if (level.grid.length*100<=window.innerWidth) {
        c.x=level.grid.length*50;
    } else {
        c.x=Math.max(Math.min(p.rect.getCenterX(),level.grid.length*100-window.innerWidth/2),window.innerWidth/2);
    }
    if (level.grid[0].length*140<=window.innerHeight) {
        c.y=level.grid[0].length*70;
    } else {
        c.y=Math.max(Math.min(p.rect.getCenterY(),level.grid[0].length*140-window.innerHeight/2),window.innerHeight/2);
    }
    return c;
}

var render=function() {
    ctx.canvas.width=window.innerWidth;
    ctx.canvas.height=window.innerHeight;
    var center=calcCenter();
    ctx.translate(window.innerWidth/2-center.x,window.innerHeight/2-center.y);
    ctx.drawImage(bg_canvas,0,0);
    for (var i=1; i<level.entities.length; i++) {
        level.entities[i].render(ctx);
    }
    p.render(ctx);
    ctx.translate(center.x-window.innerWidth/2,center.y-window.innerHeight/2);
    if (resetCounter>0) {
        ctx.fillStyle=white;
        ctx.fillRect(2,2,54,16);
        ctx.fillStyle=black;
        ctx.fillRect(4,4,50,12);
        ctx.fillStyle="#f00";
        ctx.fillRect(4,4,resetCounter,12);
    }
    if (levelEndAnimDisplayed) {
        for (var x=Math.floor(ctx.canvas.width/2)%100-100; x<ctx.canvas.width; x+=100) {
            for (var y=ctx.canvas.height/2+Math.abs(levelEndAnim); y<ctx.canvas.height; y+=140) {
                ctx.drawImage(levelTile_canvas,x,y);
            }
            for (var y=ctx.canvas.height/2-Math.abs(levelEndAnim)-140; y>-140; y-=140) {
                ctx.drawImage(levelTile_canvas,x,y);
            }
        }
    }
}

var renderPantone=function(ctx,color,text1,text2,x,y,w,h) {
    ctx.font=pantoneFont;
    ctx.fillStyle=white;
    ctx.fillRect(x,y,w,h);
    ctx.fillStyle=color;
    ctx.fillRect(x,y,w,h-40);
    ctx.fillStyle=black;
    ctx.fillText(text1,x+5,y+h-22);
    ctx.fillText(text2,x+5,y+h-4);
    ctx.strokeStyle=black;
    ctx.strokeRect(x,y,w,h);
}