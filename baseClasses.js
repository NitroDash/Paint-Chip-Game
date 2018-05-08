var rect=function(x,y,w,h) {
    var r={};
    r.x=x;
    r.y=y;
    r.w=w;
    r.h=h;
    r.getRight=function() {
        return this.x+this.w;
    }
    r.getBottom=function() {
        return this.y+this.h;
    }
    r.getCenterX=function() {
        return this.x+this.w/2;
    }
    r.getCenterY=function() {
        return this.y+this.h/2;
    }
    r.intersects=function(other) {
        return (this.getRight()>=other.x&&other.getRight()>=this.x&&this.getBottom()>=other.y&&other.getBottom()>=this.y);
    }
    r.translate=function(dx,dy) {
        this.x+=dx;
        this.y+=dy;
    }
    r.eject=function(other) {
        var horiz=(other.getCenterX()>this.getCenterX())?this.getRight()-other.x:this.x-other.getRight();
        var vert=(other.getCenterY()>this.getCenterY())?this.getBottom()-other.y:this.y-other.getBottom();
        if (Math.abs(horiz)>Math.abs(vert)) {
            other.translate(0,vert);
            if (vert==0) {
                return (other.getCenterY()>this.getCenterY())?1:0;
            } else {
                return (vert<0)?0:1;
            }
        } else {
            other.translate(horiz,0);
            if (horiz==0) {
                return (other.getCenterX()>this.getCenterX())?3:2;
            }
            return (horiz<0)?2:3;
        }
    }
    r.getEjectDir=function(other) {
        var horiz=(other.getCenterX()>this.getCenterX())?this.getRight()-other.x:this.x-other.getRight();
        var vert=(other.getCenterY()>this.getCenterY())?this.getBottom()-other.y:this.y-other.getBottom();
        if (Math.abs(horiz)>Math.abs(vert)) {
            if (vert==0) {
                return (other.getCenterY()>this.getCenterY())?1:0;
            }
            return (vert<0)?0:1;
        } else {
            if (horiz==0) {
                return (other.getCenterX()>this.getCenterX())?3:2;
            }
            return (horiz<0)?2:3;
        }
    }
    r.contains=function(x,y) {
        return (this.x<=x&&this.getRight()>=x&&this.y<=y&&this.getBottom()>=y);
    }
    r.getHorizOverlap=function(other) {
        return Math.max(Math.min(this.getRight(),other.getRight())-Math.max(this.x,other.x),0);
    }
    r.getVertOverlap=function(other) {
        return Math.max(Math.min(this.getBottom(),other.getBottom())-Math.max(this.y,other.y),0);
    }
    r.intersectsWithinThreshold=function(other,horizThresh,vertThresh) {
        return (this.getRight()>=other.x-horizThresh&&other.getRight()>=this.x-horizThresh&&this.getBottom()>=other.y-vertThresh&&other.getBottom()>=this.y-vertThresh&&this.getHorizOverlap(other)+this.getVertOverlap(other)>0);
    }
    return r;
}

var imgMaps=[0,1,0,2,3];

var playerAnim=function(file,w,h,stepLength) {
    var a={};
    a.file=file;
    a.w=w;
    a.h=h;
    a.stepLength=stepLength;
    a.step=0;
    a.counter=0;
    a.reset=function() {
        this.step=0;
        this.counter=0;
    }
    a.advance=function() {
        if (this.step==4) {
            this.reset();
        }
        if (this.counter<=0) {
            this.step++;
            if (this.step>3) {
                this.step=0;
            }
            this.counter=this.stepLength;
        }
        this.counter--;
    }
    a.jump=function() {
        this.step=4;
    }
    a.getImgX=function() {
        return this.w*imgMaps[this.step];
    }
    a.getImgY=function() {
       return (p.dir)?0:this.h;
    }
    return a;
}

var anims=[
    playerAnim("testPerson.png",60,100,8),
    playerAnim("testPerson2.png",60,100,12)
];

var animLoaded=-1;