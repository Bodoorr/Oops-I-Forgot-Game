// Global Variables:
let score = 0 // Tracks the player's current score
let playerLives = 3 // Number of lives the player starts with
let currentLevel = 1 // Indicates the current game level (starts at level 1)
let gameState = 'running' // Represents the current state of the game: 'running', 'paused', or 'over'
let cards = [] // Array to hold the generated cards for the current level
let pickedCards = [] // Array to store the values of cards currently picked by the player
let pickedCardIndices = [] // Array to store the indices of the picked cards
let matchedCardIndices = [] // Array to keep track of the indices of cards that have been successfully matched
let timer // Variable to hold the timer interval reference
let timeLeft = 0 // Time left in seconds for the current level
let hintUsed = false // Flag to indicate whether a hint has been used in the current level
let playerName = 'Player' // Stores the player's name (default is 'Player' until changed)

// Generate Cards: generate the cards based on the current level
const generateCards = (level) => {
  cards = [] // Reset the cards array for the new level

  let numberOfCards = 8 // Default number of cards for level 1

  // Set number of cards based on the level
  if (level === 2) {
    numberOfCards = 12 // Level 2 has 12 cards (6 pairs)
  } else if (level === 3) {
    numberOfCards = 16 // Level 3 has 16 cards (8 pairs)
  } else if (level === 4) {
    numberOfCards = 20 // Level 4 has 20 cards (10 pairs)
  }

  // Generate pairs of cards
  for (let i = 1; i <= numberOfCards / 2; i++) {
    cards.push(`Card ${i}`, `Card ${i}`) // Add each pair (e.g., Card 1, Card 1)
  }

  // Shuffle the cards randomly using Fisher-Yates method
  cards.sort(() => Math.random() - 0.5)
}

// Game Initialization
const initializeGame = () => {
  // Show the main game content area
  document.getElementById('gameContent').style.display = 'block'

  // Prompt player for their name if it's not already set
  if (!playerName || playerName === 'Player') {
    playerName = prompt('Enter your name to start the game:') || 'Player'
    alert(`Welcome, ${playerName}! Press 'Start Game' to begin.`)
  }

  score = 0 // Reset score at the start of the game

  // Set player lives based on current level
  if (currentLevel === 1) playerLives = 3
  else if (currentLevel === 2 || currentLevel === 3) playerLives = 4
  else if (currentLevel === 4) playerLives = 5

  currentLevel = 1 // Start at level 1
  gameState = 'running' // Set game state to running

  // Reset card tracking arrays and hint usage
  pickedCards = []
  pickedCardIndices = []
  matchedCardIndices = []
  hintUsed = false

  // Generate and display cards for the current level
  generateCards(currentLevel)
  displayCards()

  // Update on-screen stats (score, lives, level)
  updateDisplay()

  // Show cards briefly before starting the timer
  peekCards(() => {
    setTimer(currentLevel) // Start level timer after preview
  })

  // Hide the start game button once the game begins
  document.getElementById('startGame').style.display = 'none'

  // Enable the hint functionality
  getHints()
}

// Hints function: Allows the player to use one hint per level
const getHints = () => {
  const hintButton = document.getElementById('hintButton')

  // Ensure the hint button element exists
  if (!hintButton) {
    console.error("Element with ID 'hintButton' not found.")
    return // Exit if hintButton is not found
  }

  // Reset hint button state and allow usage
  hintButton.disabled = false
  hintButton.innerText = 'Get Hint'
  hintUsed = false

  // Define what happens when the player clicks the hint button
  hintButton.onclick = () => {
    // Only allow hints when game is in running state
    if (gameState !== 'running') return

    // Prevent multiple hints per level
    if (hintUsed) {
      alert(`No hints left for this level!`)
      return
    }

    // Confirm player wants to use their single allowed hint
    const confirmUse = confirm(
      'You can only use one hint per level. Are you sure you want to use it?'
    )
    if (!confirmUse) return

    // Build a map of available (unpicked & unmatched) cards and their indices
    const cardCounts = {}
    cards.forEach((card, index) => {
      if (
        pickedCardIndices.includes(index) || // Ignore picked cards
        matchedCardIndices.includes(index) // Ignore already matched cards
      )
        return
      cardCounts[card] = (cardCounts[card] || []).concat(index)
    })

    // Find the first available pair and highlight them
    for (const indices of Object.values(cardCounts)) {
      if (indices.length > 1) {
        highlightCards(indices[0], indices[1]) // Highlight the pair as hint
        hintUsed = true
        hintButton.disabled = true // Disable hint button after use
        hintButton.innerText = 'Hint used'
        return
      }
    }

    // If no matching pair is found
    alert('No hints available!')
  }
}

// Highlight matching cards: Visually highlights a matching pair for the player
const highlightCards = (index1, index2) => {
  // Select all button elements within the game board (representing cards)
  const buttons = document.querySelectorAll('#gameBoard button')

  // Apply yellow background to both matched cards to highlight them
  buttons[index1].style.backgroundColor = 'yellow' // Highlight first card
  buttons[index2].style.backgroundColor = 'yellow' // Highlight second card

  // After 1 second, remove the highlight from both cards
  setTimeout(() => {
    buttons[index1].style.backgroundColor = '' // Remove highlight
    buttons[index2].style.backgroundColor = '' // Remove highlight
  }, 1000) // Duration of the highlight effect (1 second)
}

// Updating display for score, lives, and level
const updateDisplay = () => {
  // Update the displayed score
  document.getElementById('score').innerText = `Score: ${score}`
  // Update the displayed number of lives
  document.getElementById('lives').innerText = `Lives: ${playerLives}`
  // Update the displayed current level
  document.getElementById('level').innerText = `Level: ${currentLevel}`
}

// Display clickable cards on the game board
const displayCards = () => {
  // Get the game board element
  const gameBoard = document.getElementById('gameBoard')
  gameBoard.innerHTML = '' // Clear any existing cards

  // Loop through each card in the cards array
  cards.forEach((card, index) => {
    // Create a button element for each card
    const button = document.createElement('button')
    button.innerText = '?' // Use '?' as a placeholder to hide the card value
    button.onclick = () => cardClick(card, index) // Set click event handler
    gameBoard.appendChild(button) // Add the button to the game board
  })
}

// Card Click listener
const cardClick = (card, index) => {
  // Ignore clicks if the game is not running
  if (gameState !== 'running') return

  // Prevent clicking the same card again or a card that's already matched
  if (pickedCardIndices.includes(index) || matchedCardIndices.includes(index)) {
    alert('You already picked this card!') // Show alert if card is already selected
    return
  }

  const buttons = document.querySelectorAll('#gameBoard button')
  buttons[index].innerText = card // Reveal the clicked card
  pickedCards.push(card) // Store the revealed card
  pickedCardIndices.push(index) // Store the index of the revealed card

  // When two cards are selected
  if (pickedCards.length === 2) {
    const allButtons = document.querySelectorAll('#gameBoard button')
    // Disable all buttons temporarily during comparison
    allButtons.forEach((button) => (button.disabled = true))

    setTimeout(() => {
      // If the two picked cards match
      if (pickedCards[0] === pickedCards[1]) {
        score++ // Increase the score
        alert(`It's a match, ${playerName}!`)
        // Save the matched indices
        matchedCardIndices.push(pickedCardIndices[0], pickedCardIndices[1])

        const matchedPairs = matchedCardIndices.length / 2
        const totalPairs = cards.length / 2

        // If all pairs in the current level are matched
        if (matchedPairs === totalPairs) {
          if (currentLevel < 4) {
            // Reset card tracking arrays
            pickedCards = []
            pickedCardIndices = []
            matchedCardIndices = []

            currentLevel++ // Advance to next level
            generateCards(currentLevel) // Generate new cards

            // Set lives based on the level
            if (currentLevel === 1) playerLives = 3
            else if (currentLevel === 2 || currentLevel === 3) playerLives = 4
            else if (currentLevel === 4) playerLives = 5

            alert(
              `Level UP, ${playerName}! Get ready for level ${currentLevel}.`
            )
            displayCards() // Show new cards
            updateDisplay() // Update lives/score/level display
            getHints() // Re-enable hint
            peekCards(() => {
              setTimer(currentLevel) // Start timer for the new level
            })
          } else {
            // All levels completed
            gameState = 'over'
            alert(
              `🎉 Congratulations ${playerName}, you've completed all levels!`
            )
            endGame()
          }
        }
      } else {
        // If not a match
        playerLives-- // Decrease life
        alert(`Not a match, ${playerName}! You lost a life.`)
        // Hide the unmatched cards again
        pickedCardIndices.forEach((i) => {
          buttons[i].innerText = '?'
        })

        // If no lives left, end the game
        if (playerLives <= 0) {
          gameState = 'over'
          endGame()
        }
      }

      updateDisplay() // Refresh UI
      allButtons.forEach((button) => (button.disabled = false)) // Re-enable all buttons
      pickedCards = [] // Clear picked cards
      pickedCardIndices = [] // Clear picked indices
    }, 1000) // Wait 1 second before hiding/unlocking cards
  }
}

// Pause Game
const pauseGame = () => {
  gameState = 'paused' // Set game state to paused
  clearInterval(timer) // Stop the timer
  document.getElementById('pauseModal').style.display = 'block' // Show pause modal
  document.getElementById('gameContent').style.display = 'none' // Hide game content
  document.getElementById('test').style.display = 'none' // Hide any additional elements (like timer display)
}

// Resume Game
const resumeGame = () => {
  gameState = 'running' // Resume game state
  document.getElementById('pauseModal').style.display = 'none' // Hide pause modal
  document.getElementById('gameContent').style.display = 'block' // Show game content
  document.getElementById('test').style.display = 'block' // Show additional elements (e.g., timer)
  alert('Game resumed') // Notify user
  startTimer() // Restart the timer
}

// Quit Game
const quitGame = () => {
  document.getElementById('pauseModal').style.display = 'none' // Hide pause modal
  const confirmation = confirm('Are you sure you want to quit?') // Ask for confirmation
  if (confirmation) {
    gameState = 'over' // End the game
    endGame() // Call end game logic
  }
}

// End Game Function
const endGame = () => {
  document.getElementById('pauseModal').style.display = 'none' // Hide pause modal
  document.getElementById('finalScore').innerText = score // Show final score
  document.getElementById('endGameModal').style.display = 'block' // Display end game modal
  document.getElementById('gameBoard').innerHTML = '' // Clear the game board
  clearInterval(timer) // Stop the timer

  // Set final message based on whether player won or lost
  const message =
    playerLives <= 0
      ? `Game Over, ${playerName}! You lost all your lives. Play again?`
      : `Well Done, ${playerName}! You've completed all levels. Replay? `

  document.getElementById('finalMessage').innerText = message // Display final message
}

// Replay Game Function
const replayGame = () => {
  document.getElementById('endGameModal').style.display = 'none' // Hide end game modal
  document.getElementById('gameContent').style.display = 'block' // Show game content
  initializeGame() // Restart the game from level 1
  document.getElementById('test').style.display = 'block' // Show additional elements (e.g., timer)
}

// Exit Game Function
const exitGame = () => {
  alert(`Thank you for playing, ${playerName}!`) // Farewell message
  document.getElementById('endGameModal').style.display = 'none' // Hide end game modal
  document.getElementById('startGame').style.display = 'inline-block' // Show start button
  document.getElementById('gameContent').style.display = 'none' // Hide game content
  clearInterval(timer) // Ensure timer is cleared
}
// Function for starting the countdown timer
const startTimer = () => {
  const timerDisplay = document.getElementById('timer') // Get the timer display element
  timerDisplay.innerText = `Time: ${formatTime(timeLeft)}` // Initialize timer display

  // Start countdown interval that updates every second
  timer = setInterval(() => {
    timeLeft-- // Decrease time left by 1 second
    timerDisplay.innerText = `Time: ${formatTime(timeLeft)}` // Update timer display

    // If time runs out
    if (timeLeft <= 0) {
      clearInterval(timer) // Stop the timer
      gameState = 'over' // Set game state to over
      alert("⏰ Time's up! You lost the game.") // Notify player
      endGame() // Trigger end game logic
    }
  }, 1000) // Run every 1 second
}

// Function to set the timer based on the current level
const setTimer = (level) => {
  clearInterval(timer) // Clear any existing timer to avoid multiple timers running

  // Set time limit depending on level
  if (level === 1) timeLeft = 120 // Level 1: 2 minutes
  else if (level === 2) timeLeft = 150 // Level 2: 2.5 minutes
  else if (level === 3) timeLeft = 180 // Level 3: 3 minutes
  else if (level === 4) timeLeft = 210 // Level 4: 3.5 minutes

  startTimer() // Start the countdown with the set time
}
// Function to format time from seconds to MM:SS format (USE AI TO FIGURE THE CODE OUT)
const formatTime = (seconds) => {
  // Calculate the minutes by dividing seconds by 60 and rounding down
  const mins = Math.floor(seconds / 60)
    .toString() // Convert minutes to a string
    .padStart(2, '0') // Ensure the minutes part is always 2 digits, padding with '0' if necessary

  // Calculate the remaining seconds after subtracting full minutes
  const secs = (seconds % 60).toString().padStart(2, '0') // Ensure the seconds part is always 2 digits, padding with '0' if necessary

  // Return the formatted time as "MM:SS"
  return `${mins}:${secs}`
}

// Function to peek at cards for a brief moment before they are flipped back
const peekCards = (afterPeek) => {
  const buttons = document.querySelectorAll('#gameBoard button') // Get all buttons (cards)

  // Show the cards (replace '?' with the actual card values)
  buttons.forEach((button, index) => {
    button.innerText = cards[index] // Set the button text to the card value
    button.disabled = true // Disable the buttons to prevent interaction while peeking
  })

  // After 3 seconds, flip the cards back to their placeholder state
  setTimeout(() => {
    buttons.forEach((button) => {
      button.innerText = '?' // Reset the button text to the placeholder '?'
      button.disabled = false // Re-enable the buttons for interaction
    })

    // If an "afterPeek" function is provided, execute it
    if (afterPeek) afterPeek()
  }, 3000) // Show the cards for 3 seconds
}

// Event listener for when the DOM content has fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Event listeners for buttons
  const startGameButton = document.getElementById('startGame') // Get the start game button
  const pauseGameButton = document.getElementById('pauseGame') // Get the pause game button
  const quitGameButton = document.getElementById('quitGame') // Get the quit game button
  const resumeButton = document.getElementById('resumeButton') // Get the resume button
  const replayButton = document.getElementById('replayButton') // Get the replay button
  const exitButton = document.getElementById('exitButton') // Get the exit button
  const quitButton = document.getElementById('quit') // Get the quit button (different from quitGameButton)

  // Assign event listeners to the buttons, linking each to its respective function
  if (startGameButton) {
    startGameButton.onclick = initializeGame // Start the game
  }
  if (pauseGameButton) {
    pauseGameButton.onclick = pauseGame // Pause the game
  }
  if (quitGameButton) {
    quitGameButton.onclick = quitGame // Quit the game
  }
  if (resumeButton) {
    resumeButton.onclick = resumeGame // Resume the game from pause
  }
  if (replayButton) {
    replayButton.onclick = replayGame // Replay the game from the beginning
  }
  if (exitButton) {
    exitButton.onclick = exitGame // Exit the game
  }
  if (quitButton) {
    quitButton.onclick = quitGame // Quit the game (this is a separate quit button, distinct from quitGameButton)
  }
})

// Dark Mode Toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('darkModeToggle') // Get the dark mode toggle button

  // Load saved mode from localStorage
  const isDark = localStorage.getItem('darkMode') === 'true' // Check if dark mode is saved in localStorage
  if (isDark) {
    document.body.classList.add('dark-mode') // Apply dark mode class to body
    toggle.innerText = '☀️' // Change button text to sun (light mode indicator)
  }

  // Event listener for dark mode toggle button click
  toggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode') // Toggle the 'dark-mode' class on body
    const darkModeActive = document.body.classList.contains('dark-mode') // Check if dark mode is now active
    localStorage.setItem('darkMode', darkModeActive) // Save the dark mode state in localStorage
    toggle.innerText = darkModeActive ? '☀️' : '🌙' // Change button text based on dark mode state (sun for light mode, moon for dark mode)
  })
})
