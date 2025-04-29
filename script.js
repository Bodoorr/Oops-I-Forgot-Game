// Global Variables:
let score = 0 // to define the score
let highScore = 0 // to define the high Score
let playerLives = 3 // define the player lives starting with 3
let currentLevel = 1 // starting with level 1
let gameState = 'running' // game states: running, paused, over
let cards = [] // array for cards
let pickedCards = [] // array for picked cards
let pickedCardIndices = [] // array for indices of picked cards
let matchedCardIndices = [] // array to track selected cards
let timer
// Generate Cards: generate the cards based on the current level
const generateCards = (level) => {
  cards = [] // reset cards
  let numberOfCards = 8 //first level
  if (level === 2) {
    //level 2
    numberOfCards = 12
  } else if (level === 3) {
    //level 3
    numberOfCards = 16
  } else if (level === 4) {
    //last level
    numberOfCards = 20
  }
  //   else {
  // // //   alert('Congrats! You passed all levels.')
  // // // }

  for (let i = 1; i <= numberOfCards / 2; i++) {
    cards.push(`Card ${i}`, `Card ${i}`) // Add pairs of cards
  }
  cards.sort(() => Math.random() - 0.5) // shuffle the cards
}

// Alert welcome message
alert("WELCOME! press 'Start Game' to begin.")

// Game Initialization
const initializeGame = () => {
  score = 0
  playerLives = 3
  currentLevel = 1
  gameState = 'running'
  pickedCards = [] // reset picked cards
  pickedCardIndices = []
  matchedCardIndices = []
  generateCards(currentLevel) // create cards for the level
  displayCards() // Display the cards on the game board
  updateDisplay()
  peekCards(() => {
    setTimer(currentLevel)
  })
}

// Hints function
const getHints = () => {
  const hintButton = document.getElementById('hintButton')
  hintButton.disabled = false
  hintButton.onclick = () => {
    if (gameState !== 'running') return
    const cardCounts = {}
    cards.forEach((card, index) => {
      if (
        pickedCardIndices.includes(index) ||
        matchedCardIndices.includes(index)
      )
        return
      cardCounts[card] = (cardCounts[card] || []).concat(index)
    })
    for (const indices of Object.values(cardCounts)) {
      if (indices.length > 1) {
        highlightCards(indices[0], indices[1])
        hintButton.disabled = true
        return
      }
    }
    alert('No hints available!') // If no pairs are found
  }
}

// Highlight matching cards
const highlightCards = (index1, index2) => {
  const buttons = document.querySelectorAll('#gameBoard button')
  buttons[index1].style.backgroundColor = 'yellow' // Highlight first card
  buttons[index2].style.backgroundColor = 'yellow' // Highlight second card

  setTimeout(() => {
    buttons[index1].style.backgroundColor = '' // Remove highlight
    buttons[index2].style.backgroundColor = '' // Remove highlight
  }, 1000) // Highlight for 1 second
}

// Updating display for score, lives and level
const updateDisplay = () => {
  document.getElementById('score').innerText = `Score: ${score}`
  document.getElementById('lives').innerText = `Lives: ${playerLives}`
  document.getElementById('level').innerText = `Level: ${currentLevel}`
}

// Display clickable cards
const displayCards = () => {
  const gameBoard = document.getElementById('gameBoard')
  gameBoard.innerHTML = '' // clear

  cards.forEach((card, index) => {
    const button = document.createElement('button')
    button.innerText = '?' // Placeholder text
    button.onclick = () => cardClick(card, index) // Click event for each card
    gameBoard.appendChild(button) // Add button to the game board
  })
}

// Card Click listener
const cardClick = (card, index) => {
  if (gameState !== 'running') return
  if (pickedCardIndices.includes(index) || matchedCardIndices.includes(index)) {
    alert('You already picked this card!') // Alert if the card is already picked
    return
  }
  const buttons = document.querySelectorAll('#gameBoard button')
  buttons[index].innerText = card
  pickedCards.push(card)
  pickedCardIndices.push(index)

  if (pickedCards.length === 2) {
    const allButtons = document.querySelectorAll('#gameBoard button')
    allButtons.forEach((button) => (button.disabled = true))

    setTimeout(() => {
      if (pickedCards[0] === pickedCards[1]) {
        score++
        highScore = Math.max(highScore, score) // to update the high score
        alert("It's a match!") // Alert for a match
        matchedCardIndices.push(pickedCardIndices[0], pickedCardIndices[1])
        const matchedPairs = matchedCardIndices.length / 2
        const totalPairs = cards.length / 2
        if (matchedPairs === totalPairs && currentLevel < 4) {
          pickedCards = []
          pickedCardIndices = []
          matchedCardIndices = []

          currentLevel++
          generateCards(currentLevel)

          playerLives = 3

          alert('Level UP!')
          displayCards()
          updateDisplay()
          getHints()
          peekCards(() => {
            setTimer(currentLevel) //timer for each level
          })
        } //level up condition
      } else {
        playerLives--
        alert('Not a match! You lost a life.')
        pickedCardIndices.forEach((i) => {
          buttons[i].innerText = '?'
        })
      }
      updateDisplay()
      if (playerLives <= 0) {
        gameState = 'over'
        endGame()
      }

      allButtons.forEach((button) => (button.disabled = false))
      pickedCards = [] // clear
      pickedCardIndices = []
    }, 1000)
  }
}

// Pause Game
const pauseGame = () => {
  gameState = 'paused'
  document.getElementById('pauseModal').style.display = 'block' // Show pause modal
  document.getElementById('game-container').style.display = 'none'
}

// Resume Game
const resumeGame = () => {
  gameState = 'running'
  document.getElementById('pauseModal').style.display = 'none' // Hide pause modal
  document.getElementById('game-container').style.display = 'block'
  alert('Game resumed')
}

// Quit Game
const quitGame = () => {
  document.getElementById('pauseModal').style.display = 'none'
  const confirmation = confirm('Are you sure you want to quit?')
  if (confirmation) {
    gameState = 'over'
    endGame()
  }
}

// End Game Function
const endGame = () => {
  document.getElementById('pauseModal').style.display = 'none'
  document.getElementById('finalScore').innerText = score
  document.getElementById('endGameModal').style.display = 'block' // Show end game modal
  document.getElementById('gameBoard').innerHTML = '' //remove all cards
  clearInterval(timer)
}

// Replay Game Function
const replayGame = () => {
  document.getElementById('endGameModal').style.display = 'none'
  initializeGame()
}

// Exit Game Function
const exitGame = () => {
  alert('Thank you for playing!')
  document.getElementById('endGameModal').style.display = 'none'
}

//function for timer
const setTimer = (level) => {
  clearInterval(timer) //to clear timer

  let timeLeft
  if (level === 1) timeLeft = 120 //level 1
  else if (level === 2) timeLeft = 150 //level 2
  else if (level === 3) timeLeft = 180 //level 3
  else if (level === 4) timeLeft = 210 //level 4

  const timerDisplay = document.getElementById('timer')
  timerDisplay.innerText = `Time: ${formatTime(timeLeft)}`

  timer = setInterval(() => {
    timeLeft--
    timerDisplay.innerText = `Time: ${formatTime(timeLeft)}`

    //condition
    if (timeLeft <= 0) {
      clearInterval(timer)
      gameState = 'over'
      alert("⏰ Time's up! You lost the game.")
      endGame()
    }
  }, 1000)
}

//format seconds to MM:SS (USE AI TO FIGURE THE CODE OUT)
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0')
  const secs = (seconds % 60).toString().padStart(2, '0')
  return `${mins}:${secs}`
}
//peek at cards function
const peekCards = (afterPeek) => {
  const buttons = document.querySelectorAll('#gameBoard button')

  //to show cards
  buttons.forEach((button, index) => {
    button.innerText = cards[index]
    button.disabled = true
  })

  setTimeout(() => {
    buttons.forEach((button) => {
      button.innerText = '?'
      button.disabled = false
    })
    if (afterPeek) afterPeek()
  }, 3000)
}

// Event listeners for buttons
document.getElementById('startGame').onclick = () => {
  initializeGame() // Start the game
}

document.getElementById('pauseGame').onclick = pauseGame
document.getElementById('quitGame').onclick = quitGame
document.getElementById('resumeButton').onclick = resumeGame
document.getElementById('replayButton').onclick = replayGame
document.getElementById('exitButton').onclick = exitGame
document.getElementById('quit').onclick = quitGame
// Initialize hints
getHints()
