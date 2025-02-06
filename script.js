function welcomeGame() {
    //globals
    let gameRunning = true
    let score = 0
    let enemyCount = 0
    let enemyEls = []
    const sprites = ["https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExNzRndnZiMmM2MWN6MnFod2VpcjZ5d3UxcmVsZTB0YjluZjVwcTQ4diZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LtFo9eDzBUtbyK74E5/giphy.gif", "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExNWJna3I0ZXd4cjZuemoweGV6YnJ3NDZqY3Fqb2htMmRpNjNpazl4MSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xwsp8g4MIrK5G/giphy.gif", "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExMWpkczB3NjlxcGlpdmdvYXJyMTk4OHoxcnJpaXpoaDgybXI5eXN2eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/zg0wrBuqsQG72sRByD/giphy.gif"]
    let spriteCtr = 1
    const enemyGenTimeMinDefault = 1200
    let enemyGenTimeMin = enemyGenTimeMinDefault
    let audioPlaying = false
    const audio = new Audio('sylvan-game.wav');





    //elements
    const gameBoxEl = document.getElementById("game-box")
    const scoreEl = document.getElementById("score")
    const charEl = document.getElementById("game-character-sprite")
    const replaybtnEl = [...document.getElementsByClassName("play-again")];
    const replayModalEl = document.getElementById("replay-modal")
    const modalScoreEl = document.getElementById("modal-score")
    const addToLeaderboardModalEl = document.getElementById("add-to-leaderboard-modal")
    const audioBtnEl = document.getElementById("audio-btn")

    //listeners
    document.addEventListener("keydown", handleKey)
    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    replaybtnEl.forEach((btn) => { btn.addEventListener("click", startGame) })
    charEl.addEventListener("click", toggleCharacterSrc)
    audioBtnEl.addEventListener("click", toggleAudio)

    //audio
    function toggleAudio() {
        if (audioPlaying) {
            audioPlaying = false
            audio.pause()
            audioBtnEl.src = "https://static.vecteezy.com/system/resources/thumbnails/003/611/449/small/do-not-make-a-loud-noise-no-speaker-no-sound-icon-free-vector.jpg"
        } else {
            audioPlaying = true
            audioBtnEl.src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS49Jn2LHracg8eQTJn6MWx9V39QfA9rqmZwg&s"
            audio.loop = true;
            audio.play().then(() => {
                console.log('Audio started playing on loop.');
            }).catch(error => {
                console.error('Error playing audio:', error);
            });
        }
    }

    //enemies
    class Enemy {
        constructor() {
            this.height = 50;
            this.width = 50;
            this.id = enemyCount;
        }
        enemyCreate() {
            const enemy = document.createElement("img");
            enemy.classList.add("enemy");
            enemy.id = `enemy-${enemyCount}`;
            gameBoxEl.appendChild(enemy);
            enemyEls.push(enemy);  // Store the created enemy in the array
            enemyCount++;  // Increment the enemy counter

            // Assign a random sprite to the enemy
            if (Math.floor(Math.random() * 2)) {
                enemy.classList.add("cat");
                enemy.src = "https://i1.sndcdn.com/artworks-DF34XUmGTdotYGJ4-96UpXA-t500x500.jpg"
            }
            else {
                enemy.classList.add("flower");
                enemy.src = "https://e7.pngegg.com/pngimages/930/311/png-clipart-undertale-pixel-art-flowey-flower-bones-miscellaneous-text.png";
            }


            // Apply the move-left animation
            enemy.style.animation = `moveLeft ${1}s linear`;

            // Check for collision after every movement of the enemy
            const checkCollision = () => {
                if (this.isColliding(enemy, charEl)) {
                    collision(); // Call the collision function if they collide
                }
            };

            // Monitor the enemy's movement to check for collisions
            const enemyMoveInterval = setInterval(checkCollision, 20);  // Check every 20ms

            // Remove the enemy once it's out of view
            enemy.addEventListener('animationend', () => {
                gameBoxEl.removeChild(enemy);  // Remove the enemy from the DOM
                changeScore(1)
                clearInterval(enemyMoveInterval);  // Stop the collision check once enemy is removed
            });
        }

        // Collision detection function
        isColliding(enemy, character) {
            const enemyRect = enemy.getBoundingClientRect();
            const charRect = character.getBoundingClientRect();

            // Get computed transform values
            const transform = window.getComputedStyle(character).transform;

            if (transform && transform !== "none") {
                const matrix = new DOMMatrix(transform);
                const transformedTop = charRect.top + matrix.m42;  // Adjust for Y translation
                const transformedBottom = charRect.bottom + matrix.m42;

                return !(enemyRect.right < charRect.left ||
                    enemyRect.left > charRect.right ||
                    enemyRect.bottom < transformedTop ||
                    enemyRect.top > transformedBottom);
            } else {
                // Regular collision detection if no transform is applied
                return !(enemyRect.right < charRect.left ||
                    enemyRect.left > charRect.right ||
                    enemyRect.bottom < charRect.top ||
                    enemyRect.top > charRect.bottom);
            }
        }

    }
    const enemyInstance = new Enemy();

    function generateEnemies() {
        if (gameRunning === false) return; // Stop if location changes

        enemyGenTime = Math.floor(Math.random() * (700)) + enemyGenTimeMin;
        if (enemyGenTimeMin > 350) {
            enemyGenTimeMin -= 10
        }
        enemyInstance.enemyCreate()
        // Call this function again after enemyGenTime milliseconds
        setTimeout(generateEnemies, enemyGenTime);
    }

    // Start the enemy generation loop
    generateEnemies();
    //score
    function changeScore(num) {
        if (num) {
            score++
        } else {
            score = 0
        }
        scoreEl.innerHTML = score
    }



    //events

    function handleKey(e) {
        console.log(e.key)
        if (e.key === "ArrowUp") {
            handleSwipe("up")
        } else if (e.key === "ArrowDown") {
            handleSwipe("down")

        }
    }
    function collision() {
        enemyEls.forEach((el) => {
            el.remove();
        }); modalScoreEl.innerHTML = score
        replayModalEl.style.visibility = "visible"
        gameRunning = false
    }

    function startGame() {
        enemyGenTimeMin = enemyGenTimeMinDefault
        replayModalEl.style.visibility = "hidden"
        addToLeaderboardModalEl.style.visibility = "hidden"
        changeScore(0)  // Reset the score or whatever logic you need
        gameRunning = true
        generateEnemies()

    }


    function toggleCharacterSrc() {
        charEl.src = sprites[spriteCtr]
        spriteCtr++
        if (spriteCtr === 3) {
            spriteCtr = 0
        }
    }

    //swipe events
    function handleSwipe(direction) {
        if (direction === "up") {
            jumpCharacter();
        } else if (direction === "down") {
            diveCharacter();
        }
    }


    function getTouches(evt) {
        return evt.touches
    }

    function handleTouchStart(evt) {
        const firstTouch = getTouches(evt)[0];
        xDown = firstTouch.clientX;
        yDown = firstTouch.clientY;
    };

    function handleTouchMove(evt) {
        evt.preventDefault();  // Prevents screen from scrolling during touch
        if (!xDown || !yDown) {
            return;
        }

        var xUp = evt.touches[0].clientX;
        var yUp = evt.touches[0].clientY;

        var xDiff = xDown - xUp;
        var yDiff = yDown - yUp;

        if (Math.abs(xDiff) > Math.abs(yDiff)) {/*most significant*/
            if (xDiff > 0) {
                sendToServer({ type: "swipe", val: "left" })
            } else {
                sendToServer({ type: "swipe", val: "right" })
            }
        } else {
            if (yDiff > 0) {
                handleSwipe("up");
            } else {
                handleSwipe("down");
            }
        }
        /* reset values */
        xDown = null;
        yDown = null;
    }

    //animation
    function jumpCharacter() {
        resetAnimation(charEl, "jump")
    }


    function diveCharacter() {
        resetAnimation(charEl, "dive")
    }

    // Helper to Reset Animation (Allows it to trigger every time)
    function resetAnimation(element, animationClass) {
        element.classList.remove("jump", "dive");  // Remove any existing animation classes
        // Trigger reflow to restart animation
        void element.offsetWidth;
        element.classList.add(animationClass);  // Add new animation class
    }
}


welcomeGame()
