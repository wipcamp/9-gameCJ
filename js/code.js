var game = new Phaser.Game(800, 600, Phaser.AUTO, "game");
var main = { preload : preload , create: createGameplay , update : update};
game.state.add('main', main);
game.state.start('main');
function preload() {
    game.load.image('bullet', 'images/bullet.png');
    game.load.image('ship', 'images/ship.png');
	game.load.image('bot','images/brids.png');
    game.load.image('enemy_ship','images/enemyship.png');
    game.load.image('background','images/sea.png');
    game.load.image('laser','images/biglaser.png');
    game.load.image('bad','images/bad.png');
    game.load.image('fair','images/fair.png');
    game.load.image('good','images/good.png');
    game.load.image('perfect','images/perfect.png');
    game.load.spritesheet('up','images/up.png',320/2,155,3);
    game.load.spritesheet('down','images/down.png',320/2,155,3);
    game.load.spritesheet('right','images/right.png',320/2,154,3);
    game.load.spritesheet('left','images/left.png',315/2,154,3);
}


var checker;
var checkerSpeed=80;
var cursors;
var spaceButton;
var wave=[];
var waveCheckOrder=0;
var arrow=["up","down","right","left"];
var difficulty=1;
var arrowKeyDownTimer=0;
//var up,down,left,right;
var spaceKeyDownTimer=0;
var perfect;
var goodR,goodL;
var fairL,fairR;
//var upIn,downIn,leftIn,rightIn;
var wippo;
var floor;
var bg;
var bgSpeed=0;
var score;
var gamemode;
var specialGuageIsSpawned;
var specialGuage;

function createGameplay() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    this.myWorld = game.add.group();
    this.myWorld.enableBody = true;
    bg = this.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'background');
    bg.autoScroll(this.levelSpeed, 0);
    bg.fixedToCamera = true;
    spaceButton = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
    cursors = this.input.keyboard.createCursorKeys();
    //////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////
    checker = this.add.sprite(0,game.world.height*(4/5)+120, 'laser');
    game.physics.arcade.enable(checker);
    checker.anchor.set(0.5);
    checker.scale.setTo(0.05,0.6);
    checker.body.maxVelocity.set(1500);
    checker.body.collideWorldBounds = false;
    wippo = this.add.sprite(game.world.width/2,game.world.height*(4/5)+15 ,'ship');
    game.physics.arcade.enable(wippo);
    wippo.anchor.set(0.5);
    floor = this.add.sprite(0,game.world.height*(4/5)+50,'laser');
    game.physics.arcade.enable(floor);
    floor.scale.setTo(10,0.6);
    floor.body.collideWorldBounds = false;
    floor.body.immovable = true;
    gamemode="prepare";
    specialGuageIsSpawned=false;
    ///////////////////////////////////////////////////////////////
    game.time.events.add(Phaser.Timer.SECOND * 2, wippoLaunch, this);


    //wippo.events.onOutOfBounds.add(gameEnd(), this);

    score=0;
    /*this.score = 0;
    this.scoreText;
    this.scoreText = game.add.text(perfect.x, perfect.y-400, 'Score : ' + this.score, {
        fontSize: '20px',
        fill: '#ed3465'
    })*/


}
var summonCooldown=0;
function update() {
    /*if(!this.game.world.bounds.intersects(wippo)){
        console.log(true);
        wippo.kill();
        checker.body.velocity.x = 0;
    }*/
    bg.tilePosition.y += bgSpeed;
    if(gamemode=="ingame"){
        //this.scoreText.setText('Score : ' + this.score);
        collectArrow();
        game.world.wrap(checker, 16);
        checker.body.velocity.y=0;
        checker.body.velocity.x=checkerSpeed;
        if (spaceButton.isDown&&game.time.now > spaceKeyDownTimer)
        {
            checkAccuracy();
            clearWave();
            spaceKeyDownTimer = game.time.now + 1000;
            //pointSpeed+=10;
        }
        if(checker.x>game.world.width-5&&game.time.now > summonCooldown){
            summonWave(4);
            summonCooldown = game.time.now + 1500;
        }
    }else if(gamemode=="feverTime"){

    }else if(gamemode=="gameover"){
        if(bgSpeed>0){
            bgSpeed-=0.35;
        }
    }
        
    //game.physics.arcade.collide(wippo,floor);

}

function checkAccuracy(){
    if (checkOverlap(checker, perfect))
    {
        statusText = game.add.image(game.world.width*(1/4),game.world.height*(3/4),'perfect');
        console.log("Perfect!");
        game.time.events.add(Phaser.Timer.SECOND * 2, function(){
            statusText.destroy();
        }, this);
        bgSpeed=40;
        difficulty++;
        score+=200;
    }
    else if (checkOverlap(checker, goodR)||checkOverlap(checker, goodL))
    {
        statusText = game.add.image(game.world.width*(1/4),game.world.height*(3/4),'good');
        console.log("Good!");
        game.time.events.add(Phaser.Timer.SECOND * 2, function(){
            statusText.destroy();
        }, this);
        bgSpeed=20;
    }
    else if (checkOverlap(checker, fairR)||checkOverlap(checker, fairL))
    {
        statusText = game.add.image(game.world.width*(1/4),game.world.height*(3/4),'fair');
        console.log("fair!");
        game.time.events.add(Phaser.Timer.SECOND * 2, function(){
            statusText.destroy();
        }, this);
        bgSpeed=5;
    }
    else
    {
        statusText = game.add.image(game.world.width*(1/4),game.world.height*(3/4),'bad');
        console.log("Bad");
        game.time.events.add(Phaser.Timer.SECOND * 2, function(){
            statusText.destroy();
        }, this);
        gameEnd();
      //bgSpeed=-0;
    }

}

var isHoldDown=false;
function collectArrow(){
    if(waveCheckOrder<wave.length&&!isHoldDown){
      if(cursors.up.isDown){
        isHoldDown=true;
        if(wave[waveCheckOrder].name=="up"){
            console.log("wave["+waveCheckOrder+"] is true");
            wave[waveCheckOrder].arrow.animations.play('correct');
            if(wave[waveCheckOrder].type == 2)
                wave[waveCheckOrder].arrow.alpha = 0.8;
            waveCheckOrder++;
            //animations
            }else{
                refreshWave();
            }
        }else if(cursors.down.isDown){
            isHoldDown=true;
            if(wave[waveCheckOrder].name=="down"){
            console.log("wave["+waveCheckOrder+"] is true");
            wave[waveCheckOrder].arrow.animations.play('correct');
            if(wave[waveCheckOrder].type == 2)
                wave[waveCheckOrder].arrow.alpha = 0.8;
            waveCheckOrder++;
          //animations
            }else{
                refreshWave();
            }
        }
        else if(cursors.right.isDown){
            isHoldDown=true;
            if(wave[waveCheckOrder].name=="right"){
                console.log("wave["+waveCheckOrder+"] is true");
                wave[waveCheckOrder].arrow.animations.play('correct');
                if(wave[waveCheckOrder].type == 2)
                    wave[waveCheckOrder].arrow.alpha = 0.8;
                waveCheckOrder++;
              //animations
            }else{
              refreshWave();
            }
        }else if(cursors.left.isDown){
            isHoldDown=true;
            if(wave[waveCheckOrder].name=="left"){
                console.log("wave["+waveCheckOrder+"] is true");
                wave[waveCheckOrder].arrow.animations.play('correct');
                if(wave[waveCheckOrder].type == 2)
                    wave[waveCheckOrder].arrow.alpha = 0.8;
                waveCheckOrder++;
              //animations
            }else{
              refreshWave();
            }
        }
    }else if(cursors.down.isUp&&cursors.up.isUp&&cursors.left.isUp&&cursors.right.isUp){
      isHoldDown=false;
    }
}

function refreshWave(){
    for(;waveCheckOrder>=0;waveCheckOrder--){
      /*if(wave[waveCheckOrder].name=="up"){
        wave[waveCheckOrder].up.animations.play('default');
      }else if(wave[waveCheckOrder].name=="down"){
        wave[waveCheckOrder].down.animations.play('default');
      }else if(wave[waveCheckOrder].name=="right"){
        wave[waveCheckOrder].right.animations.play('default');
      }else if(wave[waveCheckOrder].name=="left"){
        wave[waveCheckOrder].left.animations.play('default');
      }*/
      wave[waveCheckOrder].arrow.animations.play('default');
      if(wave[waveCheckOrder].type == 2)
        wave[waveCheckOrder].arrow.alpha = 0.8;
    }
    waveCheckOrder=0;
}

function clearWave(){
    var waveLength=wave.length;
    for(var i=0;i<waveLength;i++){
      /*if(wave[wave.length-1].name=="up"){
        wave[wave.length-1].up.kill();
      }else if(wave[wave.length-1].name=="down"){
        wave[wave.length-1].down.kill();
      }else if(wave[wave.length-1].name=="right"){
        wave[wave.length-1].right.kill();
      }else if(wave[wave.length-1].name=="left"){
        wave[wave.length-1].left.kill();
      }*/
      wave[wave.length-1].arrow.destroy();
      wave.pop();
      waveCheckOrder=0;
      //waveCheck.pop();
    }
    //wave = [];
}
function summonWave(length){
    var l = wave.length;
    //var startPositon;
    /*if(length==3){
        x=game.world.width/2-50;
        y=game.world.height*3/5;
    }*/
    if(length%2==0){
      x=length/2;
      x=game.world.width/2-(50*x-25);
      y=game.world.height*3/5;
    }else{
      x=(length-1)/2;
      x=game.world.width/2-(50*x);
      y=game.world.height*3/5;
    }
    clearWave();
    for (var i = 0; i < length; i++){
        var rand = game.rnd.integerInRange(0, 3/*difficulty*/);
        console.log("rand = "+rand);
        wave.push(new arrowCreate(x,y,rand));
        console.log(wave[i].name);
        //waveCheck.push(false);
        //wave[i]=new arrowCreate(x,y,rand);
        x+=50;
        console.log("create arrow.");
    }
}
arrowCreate = function (x,y,rand) {
    this.type = game.rnd.integerInRange(0,2);
    if(this.type==1)
        this.type = 0;
    this.game = game;
    this.alive = true;
    if(this.type==0){
        var randomType = game.rnd.integerInRange(1,10);
        if(rand==0){
            this.arrow = game.add.sprite(x, y, 'up');
            this.arrow.anchor.set(0.5);
            this.arrow.scale.setTo(0.3, 0.3);
            this.name = "up";
            if(randomType<=7){
                this.arrow.animations.add('default',[0],1,true);
                this.arrow.animations.add('correct',[1],1,true);
                this.arrow.animations.play('default');
            }else if(randomType>7){
                this.arrow.animations.add('default',[2],1,true);
                this.arrow.animations.add('correct',[1],1,true);
                this.arrow.animations.play('default');
            }
            //this.up.name = index.toString();
        }else if(rand==1){
            this.arrow = game.add.sprite(x, y, 'down');
            this.arrow.anchor.set(0.5);
            this.arrow.scale.setTo(0.3, 0.3);
            this.name = "down";
            if(randomType<=7){
                this.arrow.animations.add('default',[0],1,true);
                this.arrow.animations.add('correct',[1],1,true);
                this.arrow.animations.play('default');
            }else if(randomType>7){
                this.arrow.animations.add('default',[2],1,true);
                this.arrow.animations.add('correct',[1],1,true);
                this.arrow.animations.play('default');
            }
            //this.down.name = index.toString();
        }else if(rand==2){
            this.arrow = game.add.sprite(x, y, 'right');
            this.arrow.anchor.set(0.5);
            this.arrow.scale.setTo(0.3, 0.3);
            this.name = "right";
            if(randomType<=7){
                this.arrow.animations.add('default',[0],1,true);
                this.arrow.animations.add('correct',[1],1,true);
                this.arrow.animations.play('default');
            }else if(randomType>7){
                this.arrow.animations.add('default',[2],1,true);
                this.arrow.animations.add('correct',[1],1,true);
                this.arrow.animations.play('default');
            }
            //this.right.name = index.toString();
        }else{
            this.arrow = game.add.sprite(x, y, 'left');
            this.arrow.anchor.set(0.5);
            this.arrow.scale.setTo(0.3, 0.3);
            this.name = "left";
            if(randomType<=7){
                this.arrow.animations.add('default',[0],1,true);
                this.arrow.animations.add('correct',[1],1,true);
                this.arrow.animations.play('default');
            }else if(randomType>7){
                this.arrow.animations.add('default',[2],1,true);
                this.arrow.animations.add('correct',[1],1,true);
                this.arrow.animations.play('default');
            }
            //this.left.name = index.toString();
        }
    }
    else if(this.type==1){
      this.arrow = game.add.sprite(x, y, 'left');

    }
    else if(this.type==2){
      if(rand==0){
          this.arrow = game.add.sprite(x, y, 'up');
          this.arrow.alpha = 0.8;
          this.arrow.anchor.set(0.5);
          this.arrow.scale.setTo(0.3, 0.3);
          this.name = "up";
          this.arrow.animations.add('default',[0],1,true);
          this.arrow.animations.add('correct',[1],1,true);
          this.arrow.animations.play('default');
          //this.up.name = index.toString();
      }else if(rand==1){
          this.arrow = game.add.sprite(x, y, 'down');
          this.arrow.alpha = 0.8;
          this.arrow.anchor.set(0.5);
          this.arrow.scale.setTo(0.3, 0.3);
          this.name = "down";
          this.arrow.animations.add('default',[0],1,true);
          this.arrow.animations.add('correct',[1],1,true);
          this.arrow.animations.play('default');
          //this.down.name = index.toString();
      }else if(rand==2){
          this.arrow = game.add.sprite(x, y, 'right');
          this.arrow.alpha = 0.8;
          this.arrow.anchor.set(0.5);
          this.arrow.scale.setTo(0.3, 0.3);
          this.name = "right";
          this.arrow.animations.add('default',[0],1,true);
          this.arrow.animations.add('correct',[1],1,true);
          this.arrow.animations.play('default');
          //this.right.name = index.toString();
      }else{
          this.arrow = game.add.sprite(x, y, 'left');
          this.arrow.alpha = 0.8;
          this.arrow.anchor.set(0.5);
          this.arrow.scale.setTo(0.3, 0.3);
          this.name = "left";
          this.arrow.animations.add('default',[0],1,true);
          this.arrow.animations.add('correct',[1],1,true);
          this.arrow.animations.play('default');
          //this.left.name = index.toString();
      }
      game.time.events.add(Phaser.Timer.SECOND * 2, function(){
        console.log("in time");
        if(this.arrow.frame==0){
            console.log("shark kill");
            this.arrow.alpha = 0.005;
        }
      }, this);
    }
}

function checkOverlap(spriteA, spriteB) {
    var boundsA = spriteA.getBounds();
    var boundsB = spriteB.getBounds();
    return Phaser.Rectangle.intersects(boundsA, boundsB);
}
wippoLaunch = function (){
    floor.body.velocity.y = 400;
    console.log("launch");
    wippo.body.velocity.y = -150;
    bgSpeed=60;
    game.time.events.add(Phaser.Timer.SECOND * 2, gameBegin, this);
}
gameBegin = function (){
    wippo.body.velocity.y = 0;
    bgSpeed=20;
    perfect = this.add.sprite(game.world.width/2,game.world.height*(4/5)+90,'laser');
    perfect.scale.setTo(0.4,0.6);
    goodR = this.add.sprite(perfect.x+perfect.width,game.world.height*(4/5)+90,'laser');
    goodR.scale.setTo(0.4,0.6);
    goodL = this.add.sprite(perfect.x-goodR.width,game.world.height*(4/5)+90,'laser');
    goodL.scale.setTo(0.4,0.6);
    fairR = this.add.sprite(goodR.x+goodR.width,game.world.height*(4/5)+90,'laser');
    fairR.scale.setTo(0.4,0.6);
    fairL = this.add.sprite(goodL.x-fairR.width,game.world.height*(4/5)+90,'laser');
    fairL.scale.setTo(0.4,0.6);
    summonWave(3);
    checker.reset(0,game.world.height*(4/5)+120);
    gamemode = "ingame";
}
gameEnd = function (){
    //playDeathAnimation
    gamemode="dying";
    wippo.body.velocity.y=200;
    perfect.destroy();
    goodR.destroy();
    goodL.destroy();
    fairR.destroy();
    fairL.destroy();
    checker.destroy();
    clearWave();
    //game.time.events.add(Phaser.Timer.SECOND * 3, toResultPage = function(){game.state.start(createResult)}, this);
}