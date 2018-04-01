var entity=function(x,y,w,h) {
    var e={};
    e.rect=rect(x,y,w,h);
    e.update=function() {};
    e.render=function(ctx) {ctx.fillStyle=black;ctx.fillRect(this.rect.x,this.rect.y,this.rect.w,this.rect.h)};
    return e;
}

var keys=[keyGroup(38,87),keyGroup(40,83),keyGroup(65,37),keyGroup(39,68),keyboard(32)];

var tileRect=rect(0,0,100,140);

var player=function(x,y) {
    var p=entity(x,y,60,100);
    p.dx=0;
    p.dy=0;
    p.WALK_SPEED=4;
    p.JUMP_SPEED=-13;
    p.GRAVITY=0.5;
    p.grounded=true;
    p.update=function() {
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
                if (level.grid[x][y]==1) {
                    tileRect.x=x*100;
                    tileRect.y=y*140;
                    switch(tileRect.eject(this.rect)) {
                        case 0:
                            this.hitFloor();
                            break;
                        case 1:
                            this.hitCeiling();
                            break;
                    }
                }
            }
        }
        for (var i=1; i<level.entities.length; i++) {
            if (level.entities[i].rect.intersects(this.rect)) {
                switch(level.entities[i].rect.getEjectDir(this.rect)) {
                    case 0:
                        this.hitFloor();
                        break;
                }
            }
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
    return p;
}