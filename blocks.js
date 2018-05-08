var rBlockColor="#888";
var rBlockText1="CART GRAY";
var rBlockText2="";

var poweredColor="#53f442";

var rollingBlock=function(x,y) {
    var r=entity(x,y,100,140);
    r.dx=0;
    r.dy=0;
    r.grounded=true;
    r.isPushed=false;
    r.isSolid=true;
    r.canBePowered=true;
    r.update=function() {
        this.rect.translate(this.dx,this.dy);
        this.grounded=false;
        var receivedBoost=false;
        for (var i=1; i<level.entities.length; i++) {
            if (level.entities[i].canBePushed&&level.entities[i]!=this&&level.entities[i].rect.intersects(this.rect)) {
                switch (level.entities[i].rect.eject(this.rect)) {
                    case 0:
                        this.hitFloor();
                        if (!receivedBoost) {
                            this.rect.translate(level.entities[i].dx,level.entities[i].dy);
                            receivedBoost=true;
                            if (!solid[level.grid[Math.floor((this.rect.getCenterX()+((level.entities[i].dx>0)?this.rect.w/2:-this.rect.w/2))/100)][Math.floor(this.rect.getCenterY()/140)]]) {
                                for (var j=0; j<level.entities.length; j++) {
                                    if (level.entities[j].canBePushed&&level.entities[j].rect.intersects(this.rect)&&level.entities[j].rect.getBottom()==this.rect.y&&!level.entities[j].receivedBoost) {
                                        level.entities[j].rect.translate(level.entities[i].dx,level.entities[i].dy);
                                    }
                                }
                            }
                        }
                        break;
                    case 1:
                        break;
                    case 2:
                    case 3:
                        if (Math.abs(this.rect.getCenterX()-level.entities[i].rect.getCenterX())>Math.abs(this.rect.getCenterX()+this.dx-level.entities[i].rect.getCenterX()-level.entities[i].dx)) {
                            var avgDx=(this.dx+level.entities[i].dx)/2;
                            this.dx=avgDx;
                            level.entities[i].dx=avgDx;
                            level.entities[i].isPushed=true;
                        }
                        break;
                }
            } else if (level.entities[i].isSolid&&level.entities[i]!=this&&level.entities[i].rect.intersects(this.rect)) {
                switch(level.entities[i].rect.eject(this.rect)) {
                    case 0:
                        this.hitFloor();
                        break;
                    case 1:
                        this.dy=(this.dy>0)?this.dy:0;
                        break;
                    case 2:
                        if (this.dx>0) {
                            this.dx=0;
                        }
                        break;
                    case 3:
                        if (this.dx<0) {
                            this.dx=0;
                        }
                        break;
                }
            }
        }
        for (var x=Math.floor(this.rect.x/100); x<=Math.floor(this.rect.getRight()/100); x++) {
            for (var y=Math.floor(this.rect.y/140); y<=Math.floor(this.rect.getBottom()/140); y++) {
                if (solid[level.grid[x][y]]) {
                    tileRect.x=x*100;
                    tileRect.y=y*140;
                    switch(tileRect.eject(this.rect)) {
                        case 0:
                            this.hitFloor();
                            if (level.grid[x][y]==4&&x==Math.floor(this.rect.getCenterX()/100)) {
                                this.dy=-18;
                                this.grounded=false;
                            }
                            break;
                        case 1:
                            this.dy=(this.dy>0)?this.dy:0;
                            break;
                        case 2:
                            if (this.dx>0) {
                                this.dx=0;
                            }
                            break;
                        case 3:
                            if (this.dx<0) {
                                this.dx=0;
                            }
                            break;
                    }
                }
            }
        }
        if (!containsSolidGround(this.rect.x+15,this.rect.getBottom()+1)&&!containsSolidGround(this.rect.getRight()-15,this.rect.getBottom()+1)) {
            if (this.grounded) {
                this.dy+=3;
                this.grounded=false;
            }
        }
        if (!this.grounded) {
            this.dy+=0.5;
        }
        if (this.rect.intersects(p.rect)) {
            switch(this.rect.eject(p.rect)) {
                case 0:
                    if (containsSolidGround(p.rect.getCenterX(),p.rect.y+p.rect.h/4)) {
                        p.die();
                    } else {
                        p.hitFloor();
                    }
                    break;
                case 1:
                    if (containsSolidGround(p.rect.getCenterX(),p.rect.getBottom()-p.rect.h/4)) {
                        p.die();
                    } else {
                        p.hitCeiling();
                    }
                    break;
                case 2:
                    if (p.grounded&&keys[3].isDown()) {
                        this.dx+=0.1;
                        this.isPushed=true;
                    }
                    break;
                case 3:
                    if (p.grounded&&keys[2].isDown()) {
                        this.dx-=0.1;
                        this.isPushed=true;
                    }
                    break;
            }
        }
        if (!this.isPushed&&this.grounded) {
            if (this.dx>0) {
                this.dx-=0.1;
                if (this.dx<0) {
                    this.dx=0;
                }
            } else if (this.dx<0) {
                this.dx+=0.1;
                if (this.dx>0) {
                    this.dx=0;
                }
            }
        }
        this.isPushed=false;
    }
    r.render=function(ctx) {
        renderPantone(ctx,this.powered?poweredColor:rBlockColor,rBlockText1,rBlockText2,this.rect.x,this.rect.y,100,120);
        ctx.fillStyle=black;
        this.fillWheel(ctx,this.rect.x+15,this.rect.getBottom()-10);
        this.fillWheel(ctx,this.rect.getRight()-15,this.rect.getBottom()-10);
        
    }
    r.fillWheel=function(ctx,x,y) {
        ctx.beginPath();
        ctx.moveTo(x+10,y);
        ctx.arc(x,y,10,0,2*Math.PI);
        ctx.fill();
    }
    r.hitFloor=function() {
        this.dy=0;
        this.grounded=true;
    }
    r.canBePushed=true;
    return r;
}

var spreadPower=function(x,y) {
    if (level.grid[x]&&level.grid[x][y]==5&&!level.powered[x][y]) {
        level.powered[x][y]=true;
        spreadPower(x-1,y);
        spreadPower(x+1,y);
        spreadPower(x,y-1);
        spreadPower(x,y+1);
        tileRect.x=x*100;
        tileRect.y=y*140;
        for (var i=1; i<level.entities.length; i++) {
            if (!level.entities[i].powered&&level.entities[i].canBePowered&&level.entities[i].rect.intersectsWithinThreshold(tileRect,2,0)) {
                spreadPowerEntity(level.entities[i]);
                tileRect.x=x*100;
                tileRect.y=y*140;
            }
        }
    }
}

var spreadPowerEntity=function(e) {
    e.powered=true;
    for (var i=1; i<level.entities.length; i++) {
        if (!level.entities[i].powered&&level.entities[i].canBePowered&&level.entities[i].rect.intersectsWithinThreshold(e.rect,5,0)) {
            spreadPowerEntity(level.entities[i]);
        }
    }
    for (var x=Math.floor(e.rect.x/100)-1; x<=Math.floor(e.rect.getRight()/100); x++) {
        for (var y=Math.floor(e.rect.y/140)-1; y<=Math.floor(e.rect.getBottom()/140); y++) {
            tileRect.x=x*100;
            tileRect.y=y*140;
            if (tileRect.intersectsWithinThreshold(e.rect,2,0)) {
                spreadPower(x,y);
            }
        }
    }
}

var battery=function(x,y) {
    var b=entity(x,y,100,140);
    b.isSolid=true;
    b.canBePowered=true;
    b.update=function() {
        this.powered=true;
        spreadPowerEntity(this);
    }
    b.render=function(ctx) {
        renderPantone(ctx,poweredColor,"BATTERY","GREEN",this.rect.x,this.rect.y,this.rect.w,this.rect.h);
    }
    return b;
}

var door=function(x,y,isOpen) {
    var d=entity(x,y,100,140);
    d.defaultOpen=isOpen;
    d.isSolid=!isOpen;
    d.canBePowered=true;
    d.update=function() {
        this.isSolid=!this.isOpen();
        if (this.isSolid&&p.rect.intersects(this.rect)) {
            this.rect.eject(p.rect);
        }
    }
    d.isOpen=function() {
        return d.defaultOpen!=d.powered;
    }
    d.render=function(ctx) {
        if (this.isSolid) {
            renderPantone(ctx,black,"CLOSED","DOOR",this.rect.x,this.rect.y,this.rect.w,this.rect.h);
        } else {
            renderPantone(ctx,clear,"OPEN","DOOR",this.rect.x,this.rect.y,this.rect.w,this.rect.h);
        }
    }
    return d;
}

var laserShooter=function(x,y,horiz,vert) {
    var l=entity(x,y,100,140);
    l.x=Math.floor(x/100);
    l.y=Math.floor(y/140);
    l.firstUpdated=false;
    l.horiz=horiz;
    l.vert=vert;
    l.onFirstUpdate=function() {
        this.firstUpdated=true;
        this.lasers=[];
        if (this.horiz) {
            if (level.grid[this.x-1]&&!solid[level.grid[this.x-1][this.y]]) {
                this.lasers.push(horizLaser(this.rect.x,this.rect.getCenterY(),-1));
            }
            if (level.grid[this.x+1]&&!solid[level.grid[this.x+1][this.y]]) {
                this.lasers.push(horizLaser(this.rect.getRight(),this.rect.getCenterY(),1));
            }
        }
        if (this.vert) {
            if (!solid[level.grid[this.x][this.y-1]]) {
                this.lasers.push(vertLaser(this.rect.getCenterX(),this.rect.y,-1));
            }
            if (!solid[level.grid[this.x][this.y+1]]) {
                this.lasers.push(vertLaser(this.rect.getCenterX(),this.rect.getBottom(),1));
            }
        }
        for (var i=0; i<this.lasers.length; i++) {
            level.entities.push(this.lasers[i]);
        }
    }
    l.isSolid=true;
    l.canBePowered=true;
    l.update=function() {
        if (!this.firstUpdated) {this.onFirstUpdate();}
        for (var i=0; i<this.lasers.length; i++) {
            this.lasers[i].powered=this.powered;
        }
    }
    l.render=function(ctx) {
        renderPantone(ctx,this.powered?poweredColor:rBlockColor,"LASER","TURRET",this.rect.x,this.rect.y,this.rect.w,this.rect.h);
    }
    return l;
}

var horizLaser=function(x,y,dx) {
    var l=entity(x,y-3,0,6);
    l.dx=dx;
    l.x=x;
    l.endX=-100;
    y=Math.floor(y/140);
    for (var X=(l.dx>0)?Math.floor(x/100):Math.floor(x/100)-1; X>=0&&X<level.width; X+=l.dx) {
        if (solid[level.grid[X][y]]) {
            l.endX=(l.dx>0)?X*100:(X+1)*100;
            break;
        }
    }
    if (l.endX==-100) {
        l.endX=(l.dx>0)?level.width*100:0;
    }
    l.update=function() {
        if (this.powered) {
            this.rect.x=(this.dx>0)?this.x:this.endX;
            this.rect.w=Math.abs(this.x-this.endX);
            for (var i=1; i<level.entities.length; i++) {
                if (level.entities[i].isSolid&&level.entities[i].rect.intersectsWithinThreshold(this.rect,-1,0)) {
                    if (this.dx>0) {
                        this.rect.w=Math.abs(level.entities[i].rect.x-this.x);
                    } else {
                        this.rect.x=level.entities[i].rect.getRight();
                        this.rect.w=Math.abs(this.rect.x-this.x);
                    }
                }
            }
            if (this.rect.w>0&&this.rect.intersects(p.rect)) {
                p.die();
            }
        } else {
            this.rect.x=this.x;
            this.rect.w=0;
        }
    }
    l.render=function(ctx) {
        ctx.fillStyle=red;
        ctx.fillRect(this.rect.x,this.rect.y,this.rect.w,this.rect.h);
    }
    return l;
}

var vertLaser=function(x,y,dy) {
    var l=entity(x-3,y,6,0);
    l.dy=dy;
    l.y=y;
    l.endY=-100;
    x=Math.floor(x/100);
    for (var Y=(l.dy>0)?Math.floor(y/140):Math.floor(y/140)-1; Y>=0&&Y<level.height; Y+=l.dy) {
        if (solid[level.grid[x][Y]]) {
            l.endY=(l.dy>0)?Y*140:(Y+1)*140;
            break;
        }
    }
    if (l.endY==-100) {
        l.endY=(l.dy>0)?level.height*140:-200;
    }
    l.update=function() {
        if (this.powered) {
            this.rect.y=(this.dy>0)?this.y:this.endY;
            this.rect.h=Math.abs(this.y-this.endY);
            for (var i=1; i<level.entities.length; i++) {
                if (level.entities[i].isSolid&&level.entities[i].rect.intersectsWithinThreshold(this.rect,0,-1)) {
                    if (this.dy>0) {
                        this.rect.h=Math.abs(level.entities[i].rect.y-this.y);
                    } else {
                        this.rect.y=level.entities[i].rect.getBottom();
                        this.rect.h=Math.abs(this.rect.y-this.y);
                    }
                }
            }
            if (this.rect.h>0&&this.rect.intersects(p.rect)) {
                p.die();
            }
        } else {
            this.rect.y=this.y;
            this.rect.h=0;
        }
    }
    l.render=function(ctx) {
        ctx.fillStyle=red;
        ctx.fillRect(this.rect.x,this.rect.y,this.rect.w,this.rect.h);
    }
    return l;
}