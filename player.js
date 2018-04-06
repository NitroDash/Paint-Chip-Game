var entity=function(x,y,w,h) {
    var e={};
    e.rect=rect(x,y,w,h);
    e.update=function() {};
    e.render=function(ctx) {ctx.fillStyle=black;ctx.fillRect(this.rect.x,this.rect.y,this.rect.w,this.rect.h)};
    return e;
}

var keys=[keyGroup(38,87),keyGroup(40,83),keyGroup(65,37),keyGroup(39,68),keyboard(32),keyboard(82),keyboard(78)];

var tileRect=rect(0,0,100,140);

var player=function(x,y) {
    var p=entity(x,y,60,100);
    p.dx=0;
    p.dy=0;
    p.WALK_SPEED=4;
    p.JUMP_SPEED=-13;
    p.GRAVITY=0.5;
    p.grounded=true;82
    p.endLevelAnim=false;
    p.endLevelAnimCounter=0;
    p.dead=false;
    p.update=function() {
        if (this.dead) {
            this.dy+=this.GRAVITY;
            this.rect.translate(this.dx,this.dy);
            if (this.rect.y>level.height*140) {
                startLevelLoad(0,0);
                this.dead=false;
            }
            return;
        }
        if (this.endLevelAnim) {
            if (this.endLevelAnimCounter<level.width+level.height-1) {
                if (this.endLevelAnimCounter>=0) {
                    for (var y=Math.max(0,this.endLevelAnimCounter-level.width+1); y<Math.min(this.endLevelAnimCounter+1,level.height); y++) {
                        if (level.grid[this.endLevelAnimCounter-y][y]==1) {
                            renderPantone(bg_ctx,gold,"GOLDEN","GOAL",(this.endLevelAnimCounter-y)*100,y*140,100,140);
                        }
                    }
                }
                this.endLevelAnimCounter*=-1;
                if (this.endLevelAnimCounter>=0) {
                    this.endLevelAnimCounter++;
                }
            } else {
                startLevelLoad(1,30);
            }
            return;
        }
        if (keys[2].isDown()) {
            this.dx=-this.WALK_SPEED;
        } else if (keys[3].isDown()) {
            this.dx=this.WALK_SPEED;
        } else {
            this.dx=0;
        }
        if (this.grounded) {
            if (keys[4].isPressed) {
                this.dy=this.JUMP_SPEED;
            }
        } else {
            this.dy+=this.GRAVITY;
        }
        this.rect.translate(this.dx,this.dy);
        this.grounded=false;
        for (var x=Math.floor(this.rect.x/100); x<=Math.floor(this.rect.getRight()/100); x++) {
            for (var y=Math.floor(this.rect.y/140); y<=Math.floor(this.rect.getBottom()/140); y++) {
                if (solid[level.grid[x][y]]) {
                    tileRect.x=x*100;
                    tileRect.y=y*140;
                    if (level.grid[x][y]==3&&(Math.floor(this.rect.getCenterY()/140)==y||(Math.floor(this.rect.getCenterX()/100)==x))) {
                        this.die();
                        return;
                    }
                    switch(tileRect.eject(this.rect)) {
                        case 0:
                            this.hitFloor();
                            if (level.grid[x][y]==2&&tileRect.contains(this.rect.getCenterX(),this.rect.getBottom()+1)) {
                                this.endLevelAnim=true;
                                this.endLevelAnimCounter=0;
                            }
                            if (level.grid[x][y]==4&&tileRect.contains(this.rect.getCenterX(),this.rect.getBottom()+1)) {
                                this.dy=1.4*this.JUMP_SPEED;
                                this.grounded=false;
                            }
                            break;
                        case 1:
                            this.hitCeiling();
                            break;
                    }
                }
            }
        }
        for (var i=1; i<level.entities.length; i++) {
            if (level.entities[i].isSolid&&level.entities[i].rect.intersects(this.rect)) {
                switch(level.entities[i].rect.getEjectDir(this.rect)) {
                    case 0:
                        if (this.rect.getHorizOverlap(level.entities[i].rect)>5) {
                            this.hitFloor();
                        }
                        break;
                }
            }
        }
        if (keys[6].isDown&&debug) {
            startLevelLoad(1,0);
        }
    };
    p.hitFloor=function() {
        if (this.dy>=0) {
            this.grounded=true;
            this.dy=0;
        }
    }
    p.hitCeiling=function() {
        this.dy=(this.dy>0)?this.dy:0;
    }
    p.die=function() {
        this.dx=0;
        this.dy=this.JUMP_SPEED;
        this.dead=true;
    }
    p.render=function(ctx) {
        ctx.fillStyle="#00f";
        ctx.fillRect(this.rect.x,this.rect.y,this.rect.w,this.rect.h);
    }
    return p;
}