var entity=function(x,y,w,h) {
    var e={};
    e.rect=rect(x,y,w,h);
    e.update=function() {};
    e.render=function(ctx) {ctx.fillStyle=black;ctx.fillRect(this.rect.x,this.rect.y,this.rect.w,this.rect.h)};
    return e;
}

var keys=[keyGroup(38,87),keyGroup(40,83),keyGroup(65,37),keyGroup(39,68),keyboard(32)];

var player=function(x,y) {
    var p=entity(x,y,60,100);
    p.dx=0;
    p.dy=0;
    p.WALK_SPEED=4;
    p.update=function() {
        if (keys[2].isDown()) {
            this.dx=-this.WALK_SPEED;
        } else if (keys[3].isDown()) {
            this.dx=this.WALK_SPEED;
        } else {
            this.dx=0;
        }
        this.rect.translate(this.dx,this.dy);
    };
    return p;
}