'use strict';

p5.disableFriendlyErrors = true

var ww;
var mp;
var mmp;
var wv;
var circs = [];
var bgc;
var uh;

window.br=252
window.bg=246
window.bb=238

var stop = false;
var stopBuffer;
var clearBuffer;
var clearState = false;
var liveBuffer;
var cnv;
var stx;
var dragged = false;
var first = true;
var mOutStopCounter;
var mousedOut = true;
var dragTimeCounter;
var selfOverrideC;
var selfOverrideThreshold;
var selfOverrideT;
var selfOverrideX;
window.firstDone = false;

function setup() {
  cnv = createCanvas(windowWidth, windowHeight);
  cnv.mouseOut(mOut);
  ww = createVector(windowWidth, windowHeight);
  bgc = color(window.br,window.bg,window.bb);
  background(bgc);
  mp = createVector(0,0);
  mmp = createVector(0,0);
  liveBuffer = 100;
  setOverride()
  newPage()
  strokeWeight(2.3)
  frameRate(50)
  stx = 0;
  window.stx = 0
  dragTimeCounter = 0
}

function setOverride() {
  selfOverrideThreshold = 4 + random(50);
  selfOverrideT = 0;
  selfOverrideC = 2 + random(5);
  selfOverrideX = randz(.4);
}

function newPage() {
  mOutStopCounter = 500
  stx = randz(.3)
  window.stx = stx
  stop = false
  clearState = false
  stopBuffer = 50
  clearBuffer = 12
  circs = [];
  background(bgc);
  newCircs()
}

function draw() {
  mOutStopCounter -= 1
  if (mOutStopCounter <= 0) {
    stopSpawn()
    if (circs.length==0) {
      window.firstDone = true;
    }
  }
  if (first) {
    background(bgc);
    first = false
  }
  // if (liveBuffer>0) {
  //   liveBuffer-=1
  //   stop=false
  // }
  if (clearState) {
    background(window.br,window.bg,window.bb,255*.2);
    clearBuffer -= 1;
    if (clearBuffer<=0) {
      newPage()
    }
    return
  }
  let c = color(window.br,window.bg,window.bb,1)
  if (circs.length>10) {
    background(c);
  }
  let toRemove = []
  for (c of circs) {
    c.update(stop)
    if (c.dead) {
      toRemove.push(c)
    } else {
      c.draw()
    }
  }
  for (c of toRemove) {
    circs.splice(circs.indexOf(c), 1)
  }
  stopBuffer -= 1
}

function mouseMoved() {
  // docs: moved AND no buttons pressed
  mousedOut = false
  // if (mOutStopCounter <=0) {
  //   cleanSlate()
  // }
  mOutStopCounter = 500
  mmp = createVector(mouseX/ww.x, mouseY/ww.y);
  mmp.sub(.5,.5)
  // if (stop && stopBuffer<=0) {
  //   clearState = true
  // }
  dragTimeCounter = 0
  dragged = false
}

function mouseDragged() {
  if (stopBuffer<=0 && circs.length==0) {
    cleanSlate()
  }
  // console.log(mouseX)
  dragTimeCounter += 1
  // console.log(dragTimeCounter)
  if (dragTimeCounter > 1) {
    dragged = true

    mousedOut = false
    if (mOutStopCounter <= 0) {
      cleanSlate()
    }
    mOutStopCounter = 500
    mmp = createVector(mouseX / ww.x, mouseY / ww.y);
    mmp.sub(.5, .5)
  }
}

function mouseReleased() {
  setTimeout(() => {
    dragged = false
  }, 100);
}

function mouseClicked() {
  // if (stop && stopBuffer <= 0) {
  //   clearState = true
  // }
  if (dragged) {
    return
  }

  cleanSlate()
  stopSpawn()
}

function cleanSlate() {
  if (stop && stopBuffer <= 0) {
    clearState = true
  } else {
    stopBuffer = 50
  }
}

function doubleClicked() {
  stopSpawn()
  if (stop && stopBuffer <= 0) {
    clearState = true
  } else {
    stopBuffer = 50
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  ww = createVector(windowWidth, windowHeight);
}

function mOut() {
  mousedOut = true
}

function stopSpawn() {
  stop = true
}


function randz(a) {
  return random(a*2) - a
}

function newCircs() {
  let balls = 30;
  let rt = random(balls*1.5);
  let rx = randz(.4);
  let rn = random(6) + 1;
  if (rt >= balls/2-rn-2) {
    rt = 0;
  } else {
    // console.log('should override', rt, rn)
  }
  let rxx = 0;
  for (let i=0; i<balls; i++) {
    if (rt != 0 && i>=rt && i<rt+rn) {
      // console.log(rx)
      if (rx) {
        // console.log('k')
      }
      rxx = rx;
    } else { 
      rxx = 0; 
    }
    circs.push(new Circ(i*10 + randz(10), rxx))
  }
}

class Circ {
  constructor(delay, xoverride) {
    this.new(delay, xoverride)
  }
  
  new(delay, xoverride) {
    this.delay = delay
    this.x = (random(1)-.5)*.05 + mmp.x*.7 + stx
    // console.log(xoverride, '<--')
    selfOverrideT += 1
    // console.log(selfOverrideT, selfOverrideThreshold)
    if (selfOverrideT > selfOverrideThreshold) {
      if (selfOverrideC > 0) {
        selfOverrideC -= 1
        xoverride = selfOverrideX
      } else {
        setOverride()
      }
    }
    if (xoverride) {
      // console.log('override')
      this.x = xoverride + randz(.1)
    }
    this.r = random(.3) + .1
    this.sr = this.r
    this.y = this.r*1.2 + .5
    this.sp = random(.05) + .001
    this.sp*=.5
    this.a = 0
    this.dead = false
  }
  
  update(dieOut) {
    if (this.delay>0) {
      if (dieOut) {
        this.dead = true
      } else {
        this.delay -= 1
      }
      return
    }
    this.r*=.97
    if (this.r<.004) {
      if (dieOut) {
        this.dead = true
        return
      }
      this.new(random(50))
      return
    }
    let b = atan2(this.x-mmp.x, this.y-mmp.y)
    this.a = this.a*.9 //+ b*.1 * (.5-dist(this.x,mmp.x,this.y,mmp.y))
    if (random(100)<70) {
      this.a += (random(1)-.5)*.3
    } else if (random(100)<95) {
      this.a *= .6
    }
    let sp = this.sp * .5 * min(this.sr, (this.r*1.25)/this.sr) + this.sp * .6
    let rd =  randz(PI/5)
    let dx = cos(this.a+PI/2 + rd) * sp;
    let dy = -sin(this.a+PI/2 + rd) * sp;
    if (dragged) {
      // console.log((dist(this.x, mmp.x, this.y, mmp.y) - .1))
      let dd = min(max((dist(this.x, this.y, mmp.x, mmp.y)),0)*2, 1)
      if (dd>.1) {
        // console.log(dd)
        dx = dx * (dd) - sin(b + rd) * sp * (1-dd);
        dy = dy * (dd) - cos(b + rd) * sp * (1-dd);
      } else {
        dx = dx * (dd) + cos(b + rd) * sp * (1 - dd);
        dy = dy * (dd) - sin(b + rd) * sp * (1 - dd);
      }
    }
    this.x += dx
    this.y += dy
  }
  
  draw() {
    stroke(bgc)
    fill(2,3,5)
    if (random(100)<100) {
      ellipse((this.x+.5)*windowWidth, 
              (this.y+.5)*windowHeight, 
              this.r*min(windowWidth, windowHeight)
      )
    }
  }
}
