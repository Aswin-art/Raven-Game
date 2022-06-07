/**@type {HTMLCanvasElement} */

const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

const collisionCanvas = document.getElementById('collisionCanvas')
const collisionCtx = collisionCanvas.getContext('2d')

collisionCanvas.width = window.innerWidth
collisionCanvas.height = window.innerHeight

let gameFrame = 0
let lasttime = 0
let ravenInterval = 1000
let nextRaven = 0

let gameOver = false
let score = 0
let time = 0

let explosionInterval = 200
let nextExplosion = 0


// Raven Class
let ravens = []
class Raven{
    constructor(){
        this.image = new Image()
        this.image.src = './assets/images/raven.png'
        this.spriteWidth = 271
        this.spriteHeight = 194
        this.width = this.spriteWidth / 2
        this.height = this.spriteHeight / 2
        this.x = canvas.width
        this.y = Math.random() * (canvas.height - this.height)
        this.directionX = Math.random() * 4 + 1
        this.directionY = Math.random() * 3 - 1.5
        this.angle = 0
        this.angleSpeed = Math.random() * .3
        this.frame = 0
        this.flapSpeed = Math.floor(Math.random() * 4 + 2)
        this.delete = false
        this.randomColor = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)]
        this.color = 'rgb(' + this.randomColor[0] + ',' + this.randomColor[1] + ',' + this.randomColor[2] + ')'
    }

    draw(ctx){
        collisionCtx.fillStyle = this.color
        collisionCtx.fillRect(this.x, this.y, this.width, this.height)
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height)
    }

    update(){
        this.angle += this.angleSpeed
        this.x -= this.directionX
        this.y += this.directionY + Math.sin(this.angle)

        if(gameFrame % this.flapSpeed == 0){
            if(this.frame < 5){
                this.frame++
            }else{
                this.frame = 0
            }
        }

        if(this.y + this.height > canvas.height || this.y < 0){
            this.directionY = -this.directionY
        }

        if(this.x < 0 - this.width){
            this.delete = true
            gameOver = true
        }
    }
}


// Explosion Class
let explosions = []
class Explosion{
    constructor(x, y, size){
        this.x = x
        this.y = y
        this.size = size
        this.spriteWidth = 200
        this.spriteHeight = 179
        this.image = new Image()
        this.image.src = './assets/images/boom.png'
        this.frame = 0
        this.delete = false
    }

    draw(ctx){
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.size, this.size)
    }

    update(deltatime){
        nextExplosion += deltatime
        if(nextExplosion > explosionInterval){
            if(this.frame > 5){
                this.delete = true
            }else{
                this.frame++
            }

            nextExplosion = 0
        }
    }
}

// Event Handler
window.addEventListener('mousedown', (e) => {
    const detectImageData = collisionCtx.getImageData(e.x, e.y, 1, 1)
    const data = detectImageData.data
    ravens.forEach(raven => {
        if(data[0] == raven.randomColor[0] && data[1] == raven.randomColor[1] && data[2] == raven.randomColor[2]){
            raven.delete = true
            explosions.push(new Explosion(raven.x, raven.y, raven.width))
            score++
        }
    })
})

// Function for draw score
function drawScore(){
    ctx.font = '20px Arial'
    ctx.fillStyle = 'white'
    ctx.fillText('Your Score: ' + score, 10, 30)
}

// Function for draw time
function drawTime(time){
    ctx.font = '20px Arial'
    ctx.fillStyle = 'white'
    ctx.fillText('Time: ' + time, 10, 60)
}

// Function for GameOver
function drawGameOver(){
    document.getElementById('gameover').style.display = 'flex'
    document.getElementById('score').innerText = score
    const highScore = localStorage.getItem('highScore')
    if(highScore < score){
        localStorage.setItem('highScore', score)
    }
}

function animate(timestamp){
    if(!gameOver){
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        collisionCtx.clearRect(0, 0, collisionCanvas.width, collisionCanvas.height)
        let deltatime = timestamp - lasttime
        lasttime = timestamp
        nextRaven += deltatime

        if(nextRaven > ravenInterval){
            ravens.push(new Raven())
            nextRaven = 0
        }

        ravens.sort(function(a, b){
            return a.width - b.width
        })
        ravens.forEach(raven => raven.update())
        ravens.forEach(raven => raven.draw(ctx))
        ravens = ravens.filter((raven) => !raven.delete)

        explosions.forEach(explosion => explosion.update(deltatime))
        explosions.forEach(explosion => explosion.draw(ctx))
        explosions = explosions.filter(explosion =>  !explosion.delete)

        drawScore()
        drawTime(time)

        gameFrame++
        requestAnimationFrame(animate)
    }else{
        drawGameOver()
    }
}

// Function to play game
function play(){
    if(localStorage.getItem('name')){
        setInterval(() => {
            if(time == 60){
                gameOver = true
            }else{
                time++
            }
        }, 1000);
        
        localStorage.setItem('highScore', 0)
        menu.style.display = 'none'
        animate(0)
    }

    return
}


// DOM Element
const menu = document.getElementById('playScreen')
const input = document.getElementById('input-text')
const button = document.getElementById('btn')
button.addEventListener('click', play)
input.addEventListener('change', (e) => {
    localStorage.setItem('name', e.target.value)
})
