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
            return (horiz<=0)?2:3;
        }
    }
    r.getEjectDir=function(other) {
        var horiz=(other.getCenterX()>this.getCenterX())?this.getRight()-other.x:this.x-other.getRight();
        var vert=(other.getCenterY()>this.getCenterY())?this.getBottom()-other.y:this.y-other.getBottom();
        if (Math.abs(horiz)>Math.abs(vert)) {
            return (vert<=0)?0:1;
        } else {
            return (horiz<=0)?2:3;
        }
    }
    r.contains=function(x,y) {
        return (this.x<=x&&this.getRight()>=x&&this.y<=y&&this.getBottom()>=y);
    }
    return r;
}