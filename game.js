var ctx;

var bg_canvas;
var bg_ctx;

var white="#fff";
var black="#000";
var pantoneFont="bold 15px sans-serif";

var p={};

var level={};

var init=function() {
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
    loadLevel(0,gameLoop);
}

var loadLevel=function(id,callback) {
    loadJSON("levels/"+id+".json",function(result) {
        bg_ctx.clearRect(0,0,bg_canvas.width,bg_canvas.height);
        bg_canvas.width=result.grid[0].length*100;
        bg_canvas.height=result.grid.length*140;
        level.grid=[];
        level.entities=[];
        for (var y=0; y<result.grid.length; y++) {
            level.grid.push([]);
            for (var x=0; x<result.grid[0].length; x++) {
                switch(result.grid[y].charAt(x)) {
                    case ' ':
                        level.grid[y].push(0);
                        break;
                    case 'm':
                        level.grid[y].push(1);
                        renderPantone(bg_ctx,black,"SOLID","BLACK",x*100,y*140,100,140);
                        break;
                    case 'p':
                        level.grid[y].push(0);
                        p=player(x*100+20,y*140+40)
                        level.entities.push(p);
                        break;
                }
                
            }
        }
        callback();
    });
}

var gameLoop=function() {
    update();
    render();
    window.requestAnimationFrame(gameLoop);
}

var update=function() {
    for (var i=0; i<level.entities.length; i++) {
        level.entities[i].update();
    }
}

var calcCenter=function() {
    var c={};
    if (level.grid[0].length*100<=window.innerWidth) {
        c.x=level.grid[0].length*50;
    } else {
        c.x=Math.max(Math.min(p.rect.getCenterX(),level.grid[0].length*100-window.innerWidth/2),window.innerWidth/2);
    }
    if (level.grid.length*140<=window.innerHeight) {
        c.y=level.grid.length*70;
    } else {
        c.y=Math.max(Math.min(p.rect.getCenterY(),level.grid.length*140-window.innerHeight/2),window.innerHeight/2);
    }
    return c;
}

var render=function() {
    ctx.canvas.width=window.innerWidth;
    ctx.canvas.height=window.innerHeight;
    var center=calcCenter();
    ctx.translate(window.innerWidth/2-center.x,window.innerHeight/2-center.y);
    ctx.drawImage(bg_canvas,0,0);
    for (var i=0; i<level.entities.length; i++) {
        level.entities[i].render(ctx);
    }
    ctx.translate(center.x-window.innerWidth/2,center.y-window.innerHeight/2);
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