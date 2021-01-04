const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

const Canvas = {
    HEIGHT: canvas.height,
    WIDTH: canvas.width
}

const Field = {
    WIDTH: 800,
    HEIGHT: 520,
    X_START: 100,
    Y_START: 0,
    X_END: 900,
    Y_END: 520
};


//******************************** On Startup ********************************//

let interval;
let time;
let distance;
let height;
let masterResetBool = false;
let speed;
let gravity;
let angle;
document.getElementById("launch").removeEventListener("click", launch);

//****************************************************************************//

//****************************** Input Functions *****************************//

let inputs = document.querySelectorAll("input");

function disableInputs() {
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].disabled = true;
    }
}

function enableInputs() {
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].disabled = false;
    }
}

//****************************************************************************//


//***************************  Instructional Modal ***************************//

function closeModal() {
    if (document.getElementById("launch-text").innerHTML === "Reset") {
        document.getElementById("launch").addEventListener("click", clickReset);
    } else {
        document.getElementById("launch").addEventListener("click", launch);
    }
    document.getElementById("reset").addEventListener("click", masterReset);
    document.getElementById("instructions-modal").classList.add("hidden");
    document.getElementById("content").classList.remove("opaque");
    enableInputs();
}

function openModal() {
    document.getElementById("launch").removeEventListener("click", launch);
    document.getElementById("launch").removeEventListener("click", clickReset);
    document.getElementById("reset").removeEventListener("click", masterReset);
    document.getElementById("instructions-modal").classList.remove("hidden");
    document.getElementById("content").classList.add("opaque");
    disableInputs();
}

document.getElementById("close-modal").addEventListener("click", closeModal);
document.getElementById("open-modal").addEventListener("click", openModal);

//****************************************************************************//

let ballX = Field.X_START;
let ballY = Field.Y_END;

//Ball object

class Ball {
    constructor(options) {
        this.pos = options.pos;
        this.vel = [0, 0];
        this.acc = [0, 0];
        this.radius = options.radius;
        this.fired = false;
    }

    setVelocity(velocity) {
        this.vel = velocity;
    }

    setAcceleration(acceleration) {
        this.acc = acceleration;
    }

    move() {
        this.pos[0] += this.vel[0];
        this.pos[1] -= this.vel[1];
    }

    accelerate() {
        this.vel[0] += this.acc[0];
        this.vel[1] -= this.acc[1];
    }

    draw() {
        context.beginPath();
        context.arc(this.pos[0], this.pos[1], this.radius, 0, Math.PI * 2);
        context.fillStyle = "#cf3e21";
        context.fill();
        context.closePath();
    }

    reset() {
        this.pos = [Field.X_START, Field.Y_END];
        this.vel = [0, 0];
        this.acc = [0, 0];
        this.radius = 10;
        this.fired = false;
    }
}

let ball = new Ball({
    pos: [ballX, ballY],
    radius: 10
});

//****************************** Physics *****************************//

function degreesToRadians(deg) {
    return (deg / 360) * (2 * Math.PI);
}

function handleAngle(cannonAngle = 45) {
    if (cannonAngle > 90) {
        cannonAngle = 90;
    } else if (cannonAngle < 0) {
        cannonAngle = 0;
    }
    return degreesToRadians(cannonAngle);
}

function handleSpeed(speedMPS) {
    let speedMPStoPxPFMult = 0.133333333 / 2;
    let speedPxPF = speedMPS * speedMPStoPxPFMult;
    return speedPxPF;
}

function getVelocityVector(speedMPS = 20, cannonAngle = 45) {
    let speedPxPF = handleSpeed(speedMPS);
    let angle = handleAngle(cannonAngle);
    let velocityPxPFX = speedPxPF * Math.cos(angle);
    let velocityPxPFY = speedPxPF * Math.sin(angle);
    return [velocityPxPFX, velocityPxPFY];
}

function handleGravity(gravityMPS) {
    let gravMPStoPxPFMult = 0.00444319 / 8;
    let gravityPxPF = gravityMPS * gravMPStoPxPFMult;
    return gravityPxPF;
}

function getGravityVector(gravityMPS = 9.80665) {
    let gravityPxPF = handleGravity(gravityMPS);
    let gravityPxPFX = 0;
    let gravityPxPFY = gravityPxPF;
    return [gravityPxPFX, gravityPxPFY];
}

function square(value) {
    return value * value;
}

//****************************************************************************//


//******************************* Angle Slider *******************************//

let angleSlider = document.getElementById("cannon-angle");
document.getElementById("cannon-angle-value").value = angleSlider.value;
angle = document.getElementById("cannon-angle-value").value;

document.getElementById("cannon-angle").addEventListener("input", () => {
    angle = document.getElementById("cannon-angle-value").value = angleSlider.value;
});

document.getElementById("cannon-angle-value").addEventListener("input", () => {
    angle = document.getElementById("cannon-angle-value").value;
    if (angle > 90) {
        angle = document.getElementById("cannon-angle-value").value = 90;
    } else if (angle < 0) {
        angle = document.getElementById("cannon-angle-value").value = 0;
    } else if (angle === "") {
        angle = angleSlider.value;
    }
    document.getElementById("cannon-angle").value = angle;
});


//****************************************************************************//


//****************************** Gravity Slider ******************************//

let gravitySlider = document.getElementById("gravity");
document.getElementById("gravity-value").value = gravitySlider.value;
gravity = document.getElementById("gravity-value").value;

document.getElementById("gravity").addEventListener("input", () => {
    gravity = document.getElementById("gravity-value").value = gravitySlider.value;
});

document.getElementById("gravity-value").addEventListener("input", () => {
    gravity = document.getElementById("gravity-value").value;
    if (gravity === "") {
        gravity = gravitySlider.value;
    }
    document.getElementById("gravity").value = gravity;
});


//****************************************************************************//


//***************************** Speed Slider ******************************//

let speedSlider = document.getElementById("speed");
document.getElementById("speed-value").value = speedSlider.value;
speed = document.getElementById("speed-value").value;

document.getElementById("speed").addEventListener("input", () => {
    speed = document.getElementById("speed-value").value = speedSlider.value;
});

document.getElementById("speed-value").addEventListener("input", () => {
    speed = document.getElementById("speed-value").value;
    if (speed === "") {
        speed = speedSlider.value;
    }
    document.getElementById("speed").value = speed;
});

//****************************************************************************//

function drawStage() {
    context.beginPath();
    context.rect(Field.X_START, Field.Y_START, Field.WIDTH, Field.HEIGHT);
    context.fillStyle = "skyblue";
    context.fill();
    context.closePath();

    context.beginPath();
    context.rect(Field.X_START, Field.Y_END, Field.WIDTH, 100);
    context.fillStyle = "green";
    context.fill();
    context.closePath();
}

function drawCannon(launchAngle = 45) {
    const cannonLeftWheelCenterX = 85;
    const cannonLeftWheelCenterY = 555;

    //Left wheel
    context.beginPath();
    context.arc(cannonLeftWheelCenterX, cannonLeftWheelCenterY, 10, 0, Math.PI * 2);
    context.fillStyle = "#61492f";
    context.fill();
    context.closePath();

    //Right wheel
    context.beginPath();
    context.arc(cannonLeftWheelCenterX + 30, cannonLeftWheelCenterY, 10, 0, Math.PI * 2);
    context.fillStyle = "#61492f";
    context.fill();
    context.closePath();

    //Base
    context.beginPath();
    context.rect(cannonLeftWheelCenterX, cannonLeftWheelCenterY - 5, 30, 10);
    context.fillStyle = "#61492f";
    context.fill();
    context.closePath();

    //Body
    context.beginPath();
    context.rect(cannonLeftWheelCenterX + 10, cannonLeftWheelCenterY - 35, 10, 30);
    context.fillStyle = "#61492f";
    context.fill();
    context.closePath();

    //Cannon
    const cannonRadius = 40;
    let topLipAngle = degreesToRadians(launchAngle + 15);
    let adjustCannonTopX = (cannonRadius * Math.cos(topLipAngle));
    let adjustCannonTopY = (cannonRadius * Math.sin(topLipAngle));
    let lowerLipAngle = degreesToRadians(launchAngle - 15);
    let adjustCannonBottomX = (cannonRadius * Math.cos(lowerLipAngle));
    let adjustCannonBottomY = (cannonRadius * Math.sin(lowerLipAngle));
    const bezierRadius = 50;
    let topBezierAngle = degreesToRadians(launchAngle + 145);
    let adjustBezierTopX = (bezierRadius * Math.cos(topBezierAngle));
    let adjustBezierTopY = (bezierRadius * Math.sin(topBezierAngle));
    let bottomBezierAngle = degreesToRadians(launchAngle + 215);
    let adjustBezierBottomX = (bezierRadius * Math.cos(bottomBezierAngle));
    let adjustBezierBottomY = (bezierRadius * Math.sin(bottomBezierAngle));
    (-40, 5)
    context.beginPath();
    context.moveTo(Field.X_START + adjustCannonTopX, Field.Y_END - adjustCannonTopY);
    context.bezierCurveTo(Field.X_START + adjustBezierTopX, Field.Y_END - adjustBezierTopY, Field.X_START + adjustBezierBottomX, Field.Y_END - adjustBezierBottomY, Field.X_START + adjustCannonBottomX, Field.Y_END - adjustCannonBottomY);
    context.strokeStyle = "#1f37d1";
    context.stroke();
    context.fillStyle = "#1f37d1";
    context.fill();
    context.closePath();
}

function drawRightSidebar() {
    context.beginPath();
    context.rect(Field.X_END, Field.Y_START, 100, Field.HEIGHT);
    context.fillStyle = "#eee";
    context.fill();
    context.closePath();
}

//********************************** Grid ************************************//

function drawGrid() {
    const GRID_SIZE = 40;
    const X_AXIS_DISTANCE_BETWEEN_GRID_LINES = 0;
    const Y_AXIS_DISTANCE_BETWEEN_GRID_LINES = 0;
    const X_AXIS_STARTING_POINT = { number: 5 };
    const Y_AXIS_STARTING_POINT = { number: 5 };

    const NUM_LINES_X = Math.floor(Field.HEIGHT / GRID_SIZE);
    const NUM_LINES_Y = Math.floor(Field.WIDTH / GRID_SIZE);

    // Draw vertical lines
    for (let i = 0; i <= NUM_LINES_X; i++) {
        context.beginPath();
        context.lineWidth = 1;

        if (i === X_AXIS_DISTANCE_BETWEEN_GRID_LINES) {
            context.strokeStyle = "#000000";
        } else {
            context.strokeStyle = "#e9e9e9";
        }

        context.moveTo(Field.X_START, Field.Y_END - (GRID_SIZE * i));
        context.lineTo(Field.X_END, Field.Y_END - (GRID_SIZE * i));
        context.stroke();
    }

    // Draw horizontal lines
    for (let i = 0; i <= NUM_LINES_Y; i++) {
        context.beginPath();
        context.lineWidth = 1;

        if (i === Y_AXIS_DISTANCE_BETWEEN_GRID_LINES) {
            context.strokeStyle = "#000000";
        } else {
            context.strokeStyle = "#e9e9e9";
        }

        context.moveTo(Field.X_START + (GRID_SIZE * i), Field.Y_START);
        context.lineTo(Field.X_START + (GRID_SIZE * i), Field.Y_END);
        context.stroke();
    }
    
    // Positive X axis marks
    for (let i = 1; i <= NUM_LINES_Y - Y_AXIS_DISTANCE_BETWEEN_GRID_LINES; i++) {
        context.font = "9px Arial";
        context.textAlign = "end";
        context.fillText(X_AXIS_STARTING_POINT.number * i, Field.X_START + (GRID_SIZE * i), Field.Y_END + 10);
    }

    // Positive Y axis marks
    for (let i = 1; i <= NUM_LINES_X - X_AXIS_DISTANCE_BETWEEN_GRID_LINES; i++) {
        context.font = "9px Arial";
        context.textAlign = "end";
        context.fillText(Y_AXIS_STARTING_POINT.number * i, Field.X_START - 2, Field.Y_END - (GRID_SIZE * i) + 8);
    }
}

//****************************************************************************//


//********************************* Show Time ********************************//

function getTime(speed, angle, gravity) {
    if (gravity === "0") {
        return 0;
    }

    let velocityForTime = getVelocityVector(speed, angle);
    let gravityForTime = getGravityVector(gravity);

    return (velocityForTime[1] / gravityForTime[1]);
}

function drawTime(time) {
    context.font = "24px Arial";
    context.textAlign = "center";
    context.fillStyle = "black";
    context.fillText(`Air time: ${(time / 60).toFixed(3)} seconds`, (Field.X_START + Field.X_END) / 2, ((Field.Y_START + Field.Y_END) / 2) - 30);
}

//****************************************************************************//


//******************************* Show Distance ******************************//

function getDistance(speed, angle, gravity) {
    if (gravity === "0") {
        return 0;
    }

    let timeForDistance = getTime(speed, angle, gravity);
    let velocityForDistance = getVelocityVector(speed, angle);

    return (timeForDistance * velocityForDistance[0]);
}

function drawDistance(distance) {
    context.font = "24px Arial";
    context.textAlign = "center";
    context.fillStyle = "black";
    context.fillText(`Horizontal distance traveled: ${(distance / 4).toFixed(3)} meters`, (Field.X_START + Field.X_END) / 2, (Field.Y_START + Field.Y_END) / 2);
}

//****************************************************************************//


//****************************** Show Max Height *****************************//

function getMaxHeight(speed, angle, gravity) {
    if (gravity === "0") {
        return 0;
    }

    let velocityForDistance = getVelocityVector(speed, angle);
    let gravityForTime = getGravityVector(gravity);

    return (square(velocityForDistance[1]) / (2 * gravityForTime[1]));
}

function drawMaxHeight(height) {
    context.font = "24px Arial";
    context.textAlign = "center";
    context.fillStyle = "black";
    context.fillText(`Maximum height: ${(height / 8).toFixed(3)} meters`, (Field.X_START + Field.X_END) / 2, ((Field.Y_START + Field.Y_END) / 2) + 30);
}

//****************************************************************************//


//**************************** No Landing Warning ****************************//

function drawNoLandingWarning() {
    context.font = "24px Arial";
    context.textAlign = "center";
    context.fillStyle = "red";
    context.fillText("WARNING: Ball will never land.", (Field.X_START + Field.X_END) / 2, ((Field.Y_START + Field.Y_END) / 2));

    context.font = "24px Arial";
    context.textAlign = "center";
    context.fillStyle = "red";
    context.fillText("Press Master Reset to perform another simulation.", (Field.X_START + Field.X_END) / 2, ((Field.Y_START + Field.Y_END) / 2) + 30);
}

//****************************************************************************//


//******************************** Master Reset ******************************//

function masterReset() {
    masterResetBool = true;

    if (document.getElementById("launch-text").innerHTML === "Reset") {
        resetButtonToLaunchButton();
    } else {
        document.getElementById("launch").classList.remove("launch-container-active");
        document.getElementById("launch").addEventListener("click", launch);
    }

    ball.reset();
    ball.pos = [100, 521];
    enableInputs();
}

//****************************************************************************//


//********************************** Reset ***********************************//

function clickReset() {
    resetButtonToLaunchButton();
    ball.reset();
    enableInputs();
    draw();
}

function launchButtonToResetButton() {
    let launch = document.getElementById("launch");
    launch.classList.remove("launch-container-active");
    launch.classList.add("launch-container-reset");
    document.getElementById("launch-text").innerHTML = "Reset";
    
    if (document.getElementById("instructions-modal").classList[0] === "hidden") {
        launch.addEventListener("click", clickReset);
    }
}

function resetButtonToLaunchButton() {
    document.getElementById("launch").removeEventListener("click", clickReset);
    document.getElementById("launch").addEventListener("click", launch);
    document.getElementById("launch-text").innerHTML = "Launch<br>Ball";
    document.getElementById("launch").classList.remove("launch-container-reset");
}

//****************************************************************************//


//********************************** Launch **********************************//

function launch() {
    if (document.getElementById("cannon-angle-value").value === "") {
        document.getElementById("cannon-angle-value").value = 45;
        angle = 45;
    }

    if (document.getElementById("gravity-value").value === "") {
        document.getElementById("gravity-value").value = 9.80665;
        gravity = 9.80665;
    }

    if (document.getElementById("speed-value").value === "") {
        document.getElementById("speed-value").value = 20;
        speed = 20;
    }

    document.getElementById("launch").classList.add("launch-container-active");
    document.getElementById("reset").addEventListener("click", masterReset);
    document.getElementById("reset").classList.remove("opaque");

    disableInputs();
    ball.fired = true;
    masterResetBool = false;
    time = getTime(speed, angle, gravity);
    distance = getDistance(speed, angle, gravity);
    height = getMaxHeight(speed, angle, gravity);
    draw();
}

//****************************************************************************//


//*********************************** Draw ***********************************//

function draw() {
    context.clearRect(0, 0, Canvas.WIDTH, Canvas.HEIGHT);
    drawStage();
    drawCannon(parseInt(angle));
    ball.draw();
    drawGrid();
    drawRightSidebar();
    if (ball.pos[0] === Field.X_START && ball.pos[1] === Field.Y_END) {
        document.getElementById("reset").removeEventListener("click", masterReset);

        if (ball.fired === true) {
            document.getElementById("launch").removeEventListener("click", launch);

            if (ball.vel[0] === 0 && ball.vel[1] < 0) {
                ball.pos = [100, 521];
            } else {
                ball.vel = getVelocityVector(speed, angle);
            }

            ball.acc = getGravityVector(gravity);
            ball.move();
            ball.accelerate();
        }

        if (masterResetBool === false) {
            interval = requestAnimationFrame(draw);
        }
    }  else if (ball.pos[1] >= Field.Y_END) {
        document.getElementById("reset").removeEventListener("click", masterReset);
        document.getElementById("reset").classList.add("opaque");

        drawTime(time);
        drawDistance(distance);
        drawMaxHeight(height);
        launchButtonToResetButton();
        cancelAnimationFrame(interval);

        if (masterResetBool === true) {
            clickReset();
            masterResetBool = false;
        }
    } else if (ball.pos[0] >= Field.X_START && ball.pos[1] < Field.Y_END) {
        if (document.getElementById("instructions-modal").classList[0] === "hidden") {
            document.getElementById("reset").addEventListener("click", masterReset);
        }

        if (masterResetBool === false) {
            ball.move();
            ball.accelerate();
            requestAnimationFrame(draw);
        }

        if (gravity == 0) {
            drawNoLandingWarning();
        }
    }
}

//****************************************************************************//

draw();