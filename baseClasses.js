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
    return r;
}