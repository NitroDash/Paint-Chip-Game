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
var clear="rgba(0,0,0,0)";
var pauseBlack="rgba(0,0,0,0.5)";
var pantoneFont="bold 15px sans-serif";
var pauseFont="bold 30px sans-serif";

var resetCounter=0;

var p={};

var level={};
var levelNum=0;
var loading=false;

var paused=false;
var pauseMenu=0;
var pauseMenuSpot=0;

var pausedMenuOptions=[["Resume","Restart","Options","Controls","Restart Game"],["Back","Speedrun timer: Off","Player images: Yearbook staff"],["Back","Arrow keys/WASD: Move","Space: Jump","R: Hold to reset","Shift: Hold to pan camera","Escape: Pause"],["Are you sure? All progress will be lost","Yes","No"]];

var debug=false;

var levelEndAnim=0;
var levelEndAnimDisplayed=false;
var waitCounter=0;

var speedTimer=0;
var startTime=0;
var timerShown=false;

var useImages=true;

var solid=[false,true,true,true,true,true];

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
    loadLevel(levelNum,function() {
        startSegment();
        gameLoop();
    });
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
        level.powered=[];
        level.entities=[];
        if (result.last) {
            level.last=true;
        } else {
            level.last=false;
        }
        if (result.penultimate) {
            level.pen=true;
        } else {
            level.pen=false;
        }
        var textId=0;
        var playerAdded=false;
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
                        playerAdded=true;
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
                    case 'w':
                        level.grid[x].push(5);
                        renderPantone(bg_ctx,rBlockColor,"WIRE GRAY","",x*100,y*140,100,140);
                        break;
                    case 'b':
                        level.grid[x].push(5);
                        level.entities.splice(playerAdded?1:0,0,battery(x*100,y*140));
                        break;
                    case 'd':
                        level.grid[x].push(0);
                        level.entities.push(door(x*100,y*140,false));
                        break;
                    case 'D':
                        level.grid[x].push(0);
                        level.entities.push(door(x*100,y*140,true));
                        break;
                    case 'z':
                        level.grid[x].push(1);
                        level.entities.push(laserShooter(x*100,y*140,true,true));
                        break;
                    case '-':
                        level.grid[x].push(1);
                        level.entities.push(laserShooter(x*100,y*140,true,false));
                        break;
                }
                
            }
        }
        level.width=level.grid.length;
        level.height=level.grid[0].length;
        for (var x=0; x<level.width; x++) {
            level.powered.push([]);
            for (var y=0; y<level.height; y++) {
                level.powered[x].push(false);
            }
        }
        if (animLoaded!=levelNum%2) {
            animLoaded=levelNum%2;
            textures[0]=loadImage("images/"+anims[animLoaded].file,0);
            anims[animLoaded].reset();
            doneLoading=callback;
        } else {
            callback();
        }
    });
}

var clearPoweredTiles=function() {
    for (var x=0; x<level.width; x++) {
        for (var y=0; y<level.height; y++) {
            level.powered[x][y]=false;
        }
    }
    for (var i=0; i<level.entities.length; i++) {
        level.entities[i].powered=false;
    }
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
            startSegment();
        }
        return;
    }
    if (keys[8].isPressed) {
        paused=!paused;
        pauseMenuSpot=0;
        pauseMenu=0;
    }
    if (paused) {
        if (keys[0].isPressed()) {
            pauseMenuSpot--;
            if (pauseMenuSpot<0) {
                pauseMenuSpot=pausedMenuOptions[pauseMenu].length-1;
            }
        }
        if (keys[1].isPressed()) {
            pauseMenuSpot++;
            if (pauseMenuSpot>=pausedMenuOptions[pauseMenu].length) {
                pauseMenuSpot=0;
            }
        }
        if (keys[4].isPressed) {
            switch (pauseMenu) {
                case 0:
                    switch (pauseMenuSpot) {
                        case 0:
                            paused=false;
                            break;
                        case 1:
                            startLevelLoad(0,0);
                            paused=false;
                            break;
                        case 2:
                            pauseMenu=1;
                            pauseMenuSpot=0;
                            break;
                        case 3:
                            pauseMenu=2;
                            pauseMenuSpot=0;
                            break;
                        case 4:
                            pauseMenu=3;
                            pauseMenuSpot=2;
                            break;
                    } 
                    break;
                case 1:
                    switch (pauseMenuSpot) {
                        case 0:
                            pauseMenu=0;
                            pauseMenuSpot=2;
                            break;
                        case 1:
                            pausedMenuOptions[1][1]=(timerShown)?"Speedrun timer: Off":"Speedrun timer: On";
                            timerShown=!timerShown;
                            break;
                        case 2:
                            pausedMenuOptions[1][2]=(useImages)?"Player images: Rectangle":"Player images: Yearbook staff";
                            useImages=!useImages;
                            break;
                    }
                    break;
                case 2:
                    switch (pauseMenuSpot) {
                        case 0:
                            pauseMenu=0;
                            pauseMenuSpot=3;
                            break;
                    }
                    break;
                case 3:
                    switch (pauseMenuSpot) {
                        case 1:
                            paused=false;
                            startLevelLoad(-levelNum,0);
                            speedTimer=0;
                            break;
                        case 2:
                            pauseMenu=0;
                            pauseMenuSpot=0;
                            break;
                    }
                    break;
            }
        }
    } else {
        clearPoweredTiles();
        for (var i=0; i<level.entities.length; i++) {
            level.entities[i].update();
            if (p.dead) {
                break;
            }
        }
        if (!keys[7].isDown) {
            p.camera.x=p.rect.getCenterX();
            p.camera.y=p.rect.getCenterY();
        }
        if (keys[5].isDown&&!level.last) {
            resetCounter++;
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
    for (var i=0; i<keys.length; i++) {
        keys[i].resetPress();
    }
}

var startLevelLoad=function(levelsIncremented,delay) {
    levelEndAnim=ctx.canvas.height/2;
    waitCounter=delay;
    levelEndAnimDisplayed=true;
    levelNum+=levelsIncremented;
    if (level.pen&&levelsIncremented==1) {
        renderPantone(levelTile_ctx,getRandomRGB(),"THE END","",0,0,100,140);
    } else {
        renderPantone(levelTile_ctx,getRandomRGB(),"LEVEL "+(levelNum+1),"",0,0,100,140);
    }
    endSegment();
}

var startSegment=function() {
    startTime=new Date().getTime();
}

var endSegment=function() {
    if (!level.last) {
        speedTimer+=new Date().getTime()-startTime;
    }
}

var getTimer=function() {
    if (level.last) {
        return speedTimer;
    }
    return speedTimer+new Date().getTime()-startTime;
}

var zeroPad=function(num,digits) {
    var s=""+num;
    while (s.length<digits) {
        s="0"+s;
    }
    return s;
}

var formatTimer=function() {
    var t=getTimer();
    var s="";
    if (t>=3600000) {
        s+=Math.floor(t/3600000)+":";
        t=t%3600000;
    }
    s+=zeroPad(Math.floor(t/60000),2);
    s+=":";
    t=t%60000;
    s+=zeroPad(Math.floor(t/1000),2);
    s+=".";
    t=t%1000;
    s+=zeroPad(t,3);
    return s;
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
    if (level.width*100<=window.innerWidth) {
        c.x=level.width*50;
    } else {
        c.x=Math.max(Math.min(p.camera.x,level.width*100-window.innerWidth/2),window.innerWidth/2);
    }
    if (level.height*140<=window.innerHeight) {
        c.y=level.height*70;
    } else {
        c.y=Math.max(Math.min(p.camera.y,level.height*140-window.innerHeight/2),window.innerHeight/2);
    }
    return c;
}

var render=function() {
    ctx.canvas.width=window.innerWidth;
    ctx.canvas.height=window.innerHeight;
    var center=calcCenter();
    ctx.translate(window.innerWidth/2-center.x,window.innerHeight/2-center.y);
    ctx.drawImage(bg_canvas,0,0);
    ctx.fillStyle=poweredColor;
    for (var x=0; x<level.width; x++) {
        for (var y=0; y<level.height; y++) {
            if (level.powered[x][y]) {
                ctx.fillRect(x*100+1,y*140+1,98,98);
            }
        }
    }
    for (var i=level.entities.length-1; i>=0; i--) {
        level.entities[i].render(ctx);
    }
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
    } else if (timerShown&&!paused) {
        ctx.font=pauseFont;
        ctx.fillStyle=white;
        ctx.fillRect(window.innerWidth-154,2,150,36);
        ctx.fillStyle=black;
        ctx.fillText(formatTimer(),window.innerWidth-151,30);
    }
    if (paused) {
        ctx.fillStyle=pauseBlack;
        ctx.fillRect(0,0,window.innerWidth,window.innerHeight);
        ctx.font=pauseFont;
        ctx.textAlign="center";
        ctx.textBaseline="middle";
        var centerX=window.innerWidth/2;
        var centerY=window.innerHeight/2-20*pausedMenuOptions[pauseMenu].length;
        ctx.fillStyle=white;
        ctx.fillRect(0,centerY+pauseMenuSpot*40-18,window.innerWidth,36);
        ctx.fillText("PAUSED",centerX,20);
        ctx.fillText("Press space to select",centerX,window.innerHeight-20);
        for (var i=0; i<pausedMenuOptions[pauseMenu].length; i++) {
            if (i==pauseMenuSpot) {
                ctx.fillStyle=black;
            } else {
                ctx.fillStyle=white;
            }
            ctx.fillText(pausedMenuOptions[pauseMenu][i],centerX,centerY+40*i);
        }
        ctx.textAlign="left";
        ctx.textBaseline="alphabetic";
        if (timerShown) {
            ctx.fillStyle=white;
            ctx.fillText(formatTimer(),window.innerWidth-151,30);
        }
    }
}

var renderPantone=function(ctx,color,text1,text2,x,y,w,h) {
    ctx.font=pantoneFont;
    ctx.fillStyle=white;
    ctx.fillRect(x,y+h-40,w,40);
    ctx.fillStyle=color;
    ctx.fillRect(x,y,w,h-40);
    ctx.fillStyle=black;
    ctx.fillText(text1,x+5,y+h-22);
    ctx.fillText(text2,x+5,y+h-4);
    ctx.strokeStyle=black;
    ctx.strokeRect(x,y,w,h);
}