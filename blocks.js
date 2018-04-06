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
                                    if (level.entities[j].rect.intersects(this.rect)&&level.entities[j].rect.getBottom()==this.rect.y&&!level.entities[j].receivedBoost) {
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
        tileRect.y=y*100;
        for (var i=1; i<level.entities.length; i++) {
            if (!level.entities[i].powered&&level.entities[i].rect.intersects(tileRect)) {
                spreadPowerEntity(level.entities[i]);
            }
        }
    }
}

var spreadPowerEntity=function(e) {
    e.powered=true;
    for (var i=1; i<level.entities.length; i++) {
        if (!level.entities[i].powered&&level.entities[i].rect.intersectsWithinThreshold(e.rect,5)) {
            spreadPowerEntity(level.entities[i]);
        }
    }
    for (var x=Math.floor(e.rect.x/100); x<=Math.floor(e.rect.getRight()/100); x++) {
        for (var y=Math.floor(e.rect.y/140); y<=Math.floor(e.rect.getBottom()/140); y++) {
            spreadPower(x,y);
        }
    }
}

var battery=function(x,y) {
    var b=entity(x,y,100,140);
    b.isSolid=true;
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
            renderPantone(ctx,white,"OPEN","DOOR",this.rect.x,this.rect.y,this.rect.w,this.rect.h);
        }
    }
    return d;
}