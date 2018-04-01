var rBlockColor="#888";
var rBlockText1="CART GRAY";
var rBlockText2="";

var rollingBlock=function(x,y) {
    var r=entity(x,y,100,140);
    r.dx=0;
    r.dy=0;
    r.grounded=true;
    r.isPushed=false;
    r.update=function() {
        this.rect.translate(this.dx,this.dy);
        this.grounded=false;
        var receivedBoost=false;
        for (var i=1; i<level.entities.length; i++) {
            if (level.entities[i].pushIfClear&&level.entities[i]!=this&&level.entities[i].rect.intersects(this.rect)) {
                switch (level.entities[i].rect.eject(this.rect)) {
                    case 0:
                        this.hitFloor();
                        if (!receivedBoost) {
                            this.rect.translate(level.entities[i].dx,level.entities[i].dy);
                            receivedBoost=true;
                        }
                        break;
                    case 1:
                        break;
                    case 2:
                    case 3:
                        var avgDx=(this.dx+level.entities[i].dx)/2;
                        this.dx=avgDx;
                        level.entities[i].dx=avgDx;
                        level.entities[i].isPushed=true;
                        break;
                }
            }
        }
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
        if (!this.grounded) {
            this.dy+=0.5;
        }
        if (this.rect.intersects(p.rect)) {
            switch(this.rect.eject(p.rect)) {
                case 0:
                    p.hitFloor();
                    break;
                case 1:
                    p.hitCeiling();
                    break;
                case 2:
                    if (p.grounded) {
                        this.dx+=0.1;
                        this.isPushed=true;
                    }
                    break;
                case 3:
                    if (p.grounded) {
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
        renderPantone(ctx,rBlockColor,rBlockText1,rBlockText2,this.rect.x,this.rect.y,100,120);
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
    r.pushIfClear=function(x,y,dir) {
        if (level.grid[Math.floor(x/100)][Math.floor(y/140)]==1) {
            return false;
        }
        for (var i=0; i<level.entities.length; i++) {
            if (level.entities[i].rect.contains(x,y)&&level.entities[i].pushIfClear) {
                if (level.entities[i].pushIfClear(x+100*dir,y,dir)) {
                    this.dx+=0.1*dir;
                    this.isPushed=true;
                    level.entities[i].rect.eject(this.rect);
                    return true;
                }
            }
        }
        this.dx+=0.1*dir;
        this.isPushed=true;
        return true;
    }
    return r;
}