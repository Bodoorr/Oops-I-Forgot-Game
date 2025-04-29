// Global Variables:
let score = 0 // to define the score
let playerLives = 3 // define the player lives starting with 3
let currentLevel = 1 // starting with level 1
let gameState = 'running' // game states: running, paused, over
let cards = [] // array for cards
let pickedCards = [] // array for picked cards
let pickedCardIndices = [] // array for indices of picked cards
let matchedCardIndices = [] // array to track selected cards
let timer
let timeLeft = 0
let hintUsed = false
let playerName = 'Player'

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
  for (let i = 1; i <= numberOfCards / 2; i++) {
    cards.push(`Card ${i}`, `Card ${i}`) // Add pairs of cards
  }
  cards.sort(() => Math.random() - 0.5) // shuffle the cards
}

// Game Initialization
const initializeGame = () => {
  document.getElementById('gameContent').style.display = 'block'
  if (!playerName || playerName === 'Player') {
    playerName = prompt('Enter your name to start the game:') || 'Player'
    alert(`Welcome, ${playerName}! Press 'Start Game' to begin.`)
  }
  score = 0
  if (currentLevel === 1) playerLives = 3
  else if (currentLevel === 2 || currentLevel === 3) playerLives = 4
  else if (currentLevel === 4) playerLives = 5
  currentLevel = 1
  gameState = 'running'
  pickedCards = [] // reset picked cards
  pickedCardIndices = []
  matchedCardIndices = []
  hintUsed = false
  generateCards(currentLevel) // create cards for the level
  displayCards() // Display the cards on the game board
  updateDisplay()
  peekCards(() => {
    setTimer(currentLevel)
  })
  document.getElementById('startGame').style.display = 'none'
  getHints()
}

// Hints function
// Hints function
const getHints = () => {
  const hintButton = document.getElementById('hintButton')
  if (!hintButton) {
    console.error("Element with ID 'hintButton' not found.")
    return // Exit if hintButton is not found
  }
  hintButton.disabled = false
  hintButton.innerText = 'Get Hint'
  hintUsed = false

  hintButton.onclick = () => {
    if (gameState !== 'running') return

    if (hintUsed) {
      alert(`No hints left for this level!`)
      return
    }

    const confirmUse = confirm(
      'You can only use one hint per level. Are you sure you want to use it?'
    )
    if (!confirmUse) return

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
        hintUsed = true
        hintButton.disabled = true
        hintButton.innerText = 'Hint used'
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
        alert(`It's a match, ${playerName}!`)
        matchedCardIndices.push(pickedCardIndices[0], pickedCardIndices[1])

        const matchedPairs = matchedCardIndices.length / 2
        const totalPairs = cards.length / 2

        if (matchedPairs === totalPairs) {
          if (currentLevel < 4) {
            pickedCards = []
            pickedCardIndices = []
            matchedCardIndices = []

            currentLevel++
            generateCards(currentLevel)
            if (currentLevel === 1) playerLives = 3
            else if (currentLevel === 2 || currentLevel === 3) playerLives = 4
            else if (currentLevel === 4) playerLives = 5

            alert(
              `Level UP, ${playerName}! Get ready for level ${currentLevel}.`
            )
            displayCards()
            updateDisplay()
            getHints()
            peekCards(() => {
              setTimer(currentLevel)
            })
          } else {
            gameState = 'over'
            alert(
              `🎉 Congratulations ${playerName}, you've completed all levels!`
            )
            endGame()
          }
        }
      } else {
        playerLives--
        alert(`Not a match, ${playerName}! You lost a life.`)
        pickedCardIndices.forEach((i) => {
          buttons[i].innerText = '?'
        })

        if (playerLives <= 0) {
          gameState = 'over'
          endGame()
        }
      }

      updateDisplay()
      allButtons.forEach((button) => (button.disabled = false))
      pickedCards = []
      pickedCardIndices = []
    }, 1000)
  }
}

// Pause Game
const pauseGame = () => {
  gameState = 'paused'
  clearInterval(timer)
  document.getElementById('pauseModal').style.display = 'block' // Show pause modal
  document.getElementById('gameContent').style.display = 'none'
  document.getElementById('test').style.display = 'none'
}

// Resume Game
const resumeGame = () => {
  gameState = 'running'
  document.getElementById('pauseModal').style.display = 'none' // Hide pause modal
  document.getElementById('gameContent').style.display = 'block'
  document.getElementById('test').style.display = 'block'
  alert('Game resumed')
  startTimer()
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

  const message =
    playerLives <= 0
      ? `Game Over, ${playerName}! You lost all your lives. Play again?`
      : `Well Done, ${playerName}! You've completed all levels. Replay? `

  document.getElementById('finalMessage').innerText = message
}

// Replay Game Function
const replayGame = () => {
  document.getElementById('endGameModal').style.display = 'none'
  document.getElementById('gameContent').style.display = 'block'
  initializeGame()
  document.getElementById('test').style.display = 'block'
}

// Exit Game Function
const exitGame = () => {
  alert(`Thank you for playing, ${playerName}!`)
  document.getElementById('endGameModal').style.display = 'none'
  document.getElementById('startGame').style.display = 'inline-block'
  document.getElementById('gameContent').style.display = 'none'
  clearInterval(timer)
}

//function for timer
// Global startTimer
const startTimer = () => {
  const timerDisplay = document.getElementById('timer')
  timerDisplay.innerText = `Time: ${formatTime(timeLeft)}`

  timer = setInterval(() => {
    timeLeft--
    timerDisplay.innerText = `Time: ${formatTime(timeLeft)}`

    if (timeLeft <= 0) {
      clearInterval(timer)
      gameState = 'over'
      alert("⏰ Time's up! You lost the game.")
      endGame()
    }
  }, 1000)
}

// Clean setTimer function
const setTimer = (level) => {
  clearInterval(timer)
  if (level === 1) timeLeft = 120
  else if (level === 2) timeLeft = 150
  else if (level === 3) timeLeft = 180
  else if (level === 4) timeLeft = 210

  startTimer()
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
document.addEventListener('DOMContentLoaded', () => {
  // Do NOT call getHints() here

  // Event listeners for buttons
  const startGameButton = document.getElementById('startGame')
  const pauseGameButton = document.getElementById('pauseGame')
  const quitGameButton = document.getElementById('quitGame')
  const resumeButton = document.getElementById('resumeButton')
  const replayButton = document.getElementById('replayButton')
  const exitButton = document.getElementById('exitButton')
  const quitButton = document.getElementById('quit')

  if (startGameButton) {
    startGameButton.onclick = initializeGame
  }
  if (pauseGameButton) {
    pauseGameButton.onclick = pauseGame
  }
  if (quitGameButton) {
    quitGameButton.onclick = quitGame
  }
  if (resumeButton) {
    resumeButton.onclick = resumeGame
  }
  if (replayButton) {
    replayButton.onclick = replayGame
  }
  if (exitButton) {
    exitButton.onclick = exitGame
  }
  if (quitButton) {
    quitButton.onclick = quitGame
  }
})
// Dark Mode Toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('darkModeToggle')

  // Load saved mode
  const isDark = localStorage.getItem('darkMode') === 'true'
  if (isDark) {
    document.body.classList.add('dark-mode')
    toggle.innerText = '☀️'
  }

  toggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode')
    const darkModeActive = document.body.classList.contains('dark-mode')
    localStorage.setItem('darkMode', darkModeActive)
    toggle.innerText = darkModeActive ? '☀️' : '🌙'
  })
})
