const rulesBtn = document.getElementById('rules-btn');
const closeBtn = document.getElementById('close-btn');
const rules = document.getElementById('rules');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const diffBtn = document.getElementById('difficulty');
 const startBtn = document.querySelector('.start');
 const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const touchBtn = document.getElementById('touch');

    const brickHitSound = document.getElementById("brickHitSound");
let score = 0;
let lives = 3;
let brickRowCount = 9;
let brickColumnCount = 5;


isGameActive = false; // Set game active
const audioContext = new AudioContext();
let brickHitBuffer;
//Create ball props
const ball = {
    x : canvas.width/2,
    y : canvas.height/1.06,
    size : 9,
    speed : 0,
    dx : 0,
    dy : 0
}

// Starts the game
function startGame(){
    const startBtn = document.getElementById('start');
    console.log("Game Started!");
    startBtn.style.display = 'none';
    diffBtn.style.display = 'block';
    canvas.style.display = 'block';
    loadSounds(); 
}

// Hides Difficulty div
function hideDiff(){
    diffBtn.style.display = 'none';
}
// Easy Mode
function easyMode(){
    createEasyBricks();
    ball.speed = 2.5,
    ball.dx = 4,
    ball.dy = -4,
    hideDiff();
    isGameActive = true; // Set game active
    
    update();
}

// Medium Mode
function mediumMode(){
    createMediumBricks();
    ball.speed =3.0,
    ball.dx = 5.2,
    ball.dy = -5.2,
    hideDiff();
    isGameActive = true; // Set game active
    update();
}

// Difficulty Mode
function hardMode(){
    createHardBricks();
    ball.speed = 4.0,
    ball.dx = 5.9,
    ball.dy = -5.9,
    hideDiff();
    isGameActive = true; // Set game active
    update();
}


// Create Paddle Props
const paddle = {
    x: canvas.width/2 - 40,
    y: canvas.height - 20,
    w : 100,
    h : 9,
    speed : 8,
    dx: 0
}

// Create Brick Props
const brickInfo = {
    w : 65,
    h : 18,
    padding : 9,
    offsetX : 45,
    offsetY : 60,
    visible : true
}

//Create Bricks 
const bricks = [];
for(let i = 0;i<brickRowCount;i++){
    bricks[i] = [];
    for(let j = 0;j<brickColumnCount;j++){
        const x = i * (brickInfo.w + brickInfo.padding) + brickInfo.offsetX;
        const y = j * (brickInfo.h + brickInfo.padding) + brickInfo.offsetY;
        bricks[i][j] = {x,y, ...brickInfo}        
    }
}
function createEasyBricks() {
    brickRowCount = 5;
    brickColumnCount = 9;
    bricks.length = 0; // Clear existing bricks

    for (let i = 0; i < brickRowCount; i++) {
        bricks[i] = [];

        for (let j = 0; j < brickColumnCount; j++) {
            // Create a checkerboard pattern by making every alternate brick visible
            const isBrickVisible = (i + j) % 2 === 0;

            const x = j * (brickInfo.w + brickInfo.padding) + brickInfo.offsetX;
            const y = i * (brickInfo.h + brickInfo.padding) + brickInfo.offsetY;
            bricks[i][j] = { x, y, ...brickInfo, visible: isBrickVisible };
        }
    }
}

function createMediumBricks() {
    brickRowCount = 6; // Number of rows
    brickColumnCount = 10; // Number of columns
    bricks.length = 0; // Clear existing bricks

    for (let i = 0; i < brickRowCount; i++) {
        bricks[i] = [];
        for (let j = 0; j < brickColumnCount; j++) {
            const x = j * (brickInfo.w + brickInfo.padding) + brickInfo.offsetX; // Calculate x position
            const y = i * (brickInfo.h + brickInfo.padding) + brickInfo.offsetY; // Calculate y position
            
            // Create vertical stripes pattern
            const visible = j % 2 === 0; // Make every other column visible
            bricks[i][j] = { x, y, ...brickInfo, visible: visible };
        }
    }
}


function createHardBricks() {
  brickRowCount = 8;
  brickColumnCount = 7;
  bricks.length = 0; // Clear existing bricks

  for (let i = 0; i < brickRowCount; i++) {
    bricks[i] = [];
    for (let j = 0; j < brickColumnCount; j++) {
      const x = j * (brickInfo.w + brickInfo.padding) + brickInfo.offsetX;
      const y = i * (brickInfo.h + brickInfo.padding) + brickInfo.offsetY;
      bricks[i][j] = { x, y, ...brickInfo,   
 visible: Math.abs(i - j) <= 2 };
    }
  }
}

//Draw ball on canvas
function drawBall(){
    if (isGameActive) {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
        ctx.fillStyle = 'SaddleBrown';
        ctx.fill();
        ctx.closePath();
    }
}

//Draw paddle on canvas
function drawPaddle(){
    if (isGameActive) {
        ctx.beginPath();
        ctx.rect(paddle.x, paddle.y, paddle.w, paddle.h);
        ctx.fillStyle = 'DarkSlateGrey';
        ctx.fill();
        ctx.closePath();
    }
}

//Draw Score on canvas
function drawScore(){
    ctx.font = '20px Arial',
    ctx.fillText(`Score : ${score}`,canvas.width-100,30);
}

function drawLives() {
            ctx.font = '20px Arial';
            ctx.fillText(`Lives: ${lives}`, canvas.width - 770, 30);
        }

//Move Paddle on canvas
function movePaddle() {
    paddle.x += paddle.dx;

    // Wall Detection
    if(paddle.x + paddle.w > canvas.width){
        paddle.x = canvas.width - paddle.w;
    }

    if(paddle.x < 0){
        paddle.x = 0;
    }
}

// Move ball on canvas
function moveBall(){
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision (right/left)
    if(ball.x + ball.size > canvas.width || ball.x - ball.size < 0){
        ball.dx*= -1;
        
    }

    // Wall collision (right/left)
    if(ball.y + ball.size > canvas.height || ball.y - ball.size < 0){
        ball.dy*= -1;
        
    }

    // Paddle collision
    if(ball.x - ball.size > paddle.x && ball.x + ball.size < paddle.x + paddle.w && ball.y + ball.size > paddle.y){
        ball.dy = -ball.speed;
     
    }

    // Brick collision
    bricks.forEach(column =>{
        column.forEach(brick =>{
            if(brick.visible){
                if(ball.x - ball.size > brick.x &&   //left brick side check
                   ball.x + ball.size < brick.x + brick.w &&  //right brick side check
                   ball.y + ball.size > brick.y &&   // top brick side check
                   ball.y - ball.size < brick.y + brick.h  //bottom brick side
                )
                {
                    ball.dy *= -1;
                    brick.visible = false;
                    
                    increaseScore();
                    playSound(brickHitBuffer); 
                }
                
            }
           
        });
    });
    
    if (ball.y + ball.size > canvas.height) {
                lives--;
                alert("You lost a life!");
                if (lives === 0) {
                    
                    document.querySelector(".lose").style.display = "block";
                    document.querySelector(".lose h3").textContent = `Your Score: ${score}`;
                    resetGame();
                    isGameActive = false;
                } else {
                    resetBall();
                }
            }
           

        function resetBall() {
            ball.x = canvas.width / 2;
            ball.y = canvas.height / 1.06;
            ball.dx = 4;
            ball.dy = -4;
        }
        function resetPaddle() {
            paddle.x = canvas.width / 2;
            paddle.y = canvas.height / 1.06;
            paddle.dx = 4;
            paddle.dy = -4;
        }
        function resetGame() {
            score = 0;
            lives = 3;
            resetBall(); // Reset ball position
            resetPaddle(); // Reset paddle position
            showAllBricks(); // Show all bricks again
             isGameActive = false; // End the game
             hideGameElements();
             update(); // Hide game elements
        }  
        function hideGameElements() {
    canvas.style.display = 'none'; // Hide the canvas
    document.querySelector('.start').style.display = 'none'; // Hide the start button
    document.querySelector('.difficulty').style.display = 'none'; // Hide the difficulty options
}
        

    // Hit bottom wall - Lose
    if(ball.y + ball.size > canvas.height){
        score = 0;
        
        showAllBricks();
        pauseBall();
        pausePaddle();
        
        document.querySelector(".lose").style.display = "block";
    }
}


// Pause the ball after losing
function pauseBall(){
    ball.speed = 0;
    ball.dx = 0;
    ball.dy = 0;
    
}

// Pause the ball after losing
function pausePaddle(){
    paddle.speed = 0;
    paddle.dx = 0;
    paddle.dy=0;
}

//Increase Score
function increaseScore(){
    score++;
    if (score === brickRowCount * brickColumnCount) {
                    
                    document.querySelector(".win").style.display = "block";
                    document.querySelector(".lose h3").textContent = `Your Score: ${score}`;
                    resetGame();
                    isGameActive = false;
                
            }
}


// Make all bricks appear 
function showAllBricks(){
    bricks.forEach(column =>{
        column.forEach(brick=>{
            brick.visible = true;
        });
    });
}

//Draw everything
function draw() {
    //clear canvas
    ctx.clearRect(0,0,canvas.width,canvas.height);

    if (isGameActive) {
    drawBall();
    drawPaddle();
  }
    
    drawScore();
    drawLives();
    drawBricks();
}
drawBricks();

function update() {
  if (!isGameActive) return;

  movePaddle();
  moveBall();
  draw();

    let allBricksBroken = true;
  for (let i = 0; i < brickRowCount; i++) {
    for (let j = 0; j < brickColumnCount; j++) {
      if (bricks[i][j].visible) {
        allBricksBroken = false;
        break;
      }
    }
    if (!allBricksBroken) break;
  }

  if (allBricksBroken) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.display = "none"; 
    // Hide the paddle and ball
    paddle.visible = false; // Add this property to the paddle
    ball.visible = false;
    
    document.querySelector(".win").style.display = "block";
    document.querySelector(".win h2").textContent = "YOU WIN! Congratulations";
    document.querySelector(".win h3").textContent = "All bricks destroyed!";
   
    isGameActive = false; // Stop the game loop
  } 
 
    requestAnimationFrame(update); // Continue the game loop if not won
  // Continue the game loop
}



// Event listeners for paddle movement
document.addEventListener('keydown', (e) => {
  if (e.key === 'Right' || e.key === 'ArrowRight') {
    paddle.dx = paddle.speed;
  } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
    paddle.dx = -paddle.speed;
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'Right' || e.key === 'ArrowRight' || e.key === 'Left' || e.key === 'ArrowLeft') {
    paddle.dx = 0;
  }
});

// Initialize the game
requestAnimationFrame(update); // Start the update loop

update();
draw();

leftBtn.addEventListener('click', () => {
    paddle.dx = -10; // Move one step to the left
    setTimeout(() => {
        paddle.dx = 0; // Stop the movement after a short delay
    }, 200); // Adjust the delay as needed
});

rightBtn.addEventListener('click', () => {
    paddle.dx = 10; // Move one step to the right
    setTimeout(() => {
        paddle.dx = 0; // Stop the movement after a short delay
    }, 200); // Adjust the delay as needed
});

if (isMobileView()) {
    startBtn.classList.add("hidden-mobile");
}
if (isMobileView()) {
    startBtn.classList.remove("hidden-mobile");
}
//Keydown event
function keyDown(e){
    if(e.key === 'Right' || e.key === 'ArrowRight') {
        paddle.dx = paddle.speed;
    }
    else if(e.key === 'Left' || e.key === 'ArrowLeft'){
        paddle.dx = -paddle.speed;
    }
}

function keyUp(e){
    if(e.key === 'Right' || e.key === 'ArrowRight' || e.key === 'Left' || e.key === 'ArrowLeft') {
        paddle.dx = 0;
    }

}

//Keyboard event handlers
document.addEventListener('keydown',keyDown);
document.addEventListener('keyup',keyUp);



// Touch event handling
// Add touch functionality for paddle movement
// Touch event handling
// Add touch functionality for paddle movement
let isTouching = false;

canvas.addEventListener('touchstart', (e) => {
    isTouching = true;
    movePaddleTouch(e);
});

canvas.addEventListener('touchmove', (e) => {
    if (isTouching) {
        movePaddleTouch(e);
    }
});

canvas.addEventListener('touchend', () => {
    isTouching = false;
});

// Function to move the paddle based on touch
function movePaddleTouch(e) {
    const touch = e.touches[0];
    const touchX = touch.clientX - canvas.getBoundingClientRect().left;
    
    // Set the paddle position to the touch position, keeping it within the canvas bounds
    paddle.x = touchX - paddle.w / 2;
}

// You can also add a touchend event that stops the paddle movement
canvas.addEventListener('touchend', () => {
    paddle.dx = 0; // Stop moving the paddle when touch ends
});

//Rules and close event handlers
rulesBtn.addEventListener('click',()=>
rules.classList.add('show'));


closeBtn.addEventListener('click',()=>
rules.classList.remove('show'));

// Function to check if the view is mobile
function isMobileView() {
    return window.innerWidth <= 576; // Adjust this value for your mobile breakpoint
}

// Function to toggle arrow buttons based on the view
function toggleArrowButtons() {
    const touchButtons = document.getElementById('touch');
    if (isMobileView()) {
        touchButtons.style.display = 'flex'; // Show the buttons
    } else {
        touchButtons.style.display = 'none'; // Hide the buttons
    }
}

// Call the function on load
toggleArrowButtons();

// Add an event listener to handle window resize
window.addEventListener('resize', toggleArrowButtons);

function isMobileView() {
    return window.innerWidth <= 768;  // Adjust this value for your mobile breakpoint
}

rulesBtn.addEventListener("click", () => {
  
    if (isMobileView()) {
        startBtn.classList.add("hidden-mobile");
    }
});

closeBtn.addEventListener("click", () => {

    if (isMobileView()) {
        startBtn.classList.remove("hidden-mobile");
    }
});

function drawBricks() {
    bricks.forEach((column, rowIndex) => {
        column.forEach(brick => {
            ctx.beginPath();
            ctx.rect(brick.x, brick.y, brick.w, brick.h);
            // Set different colors for each row
            if (brick.visible) {
                if (rowIndex % 3 === 0) {
                    ctx.fillStyle = '#DC143C'; // Red color for every third row
                } else if (rowIndex % 3 === 1) {
                    ctx.fillStyle = 'Indigo'; // Green color for every second row
                } else {
                    ctx.fillStyle = 'Teal'; // Blue color for every other row
                }
            } else {
                ctx.fillStyle = 'transparent';
            }
            ctx.fill();
            ctx.closePath();
        });
    });
}
createEasyBricks();

async function loadSounds() {
    const brickHitResponse = await fetch('bricks-104933.mp3');
    const brickHitArrayBuffer = await brickHitResponse.arrayBuffer();
    brickHitBuffer = await audioContext.decodeAudioData(brickHitArrayBuffer);
    }
    function playSound(buffer) {
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start();
      }