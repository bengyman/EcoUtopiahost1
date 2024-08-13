import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Text, TextInput, Button, Paper, Modal, Group, Center, useMantineTheme, Box } from '@mantine/core';

const WORDS = ["apple", "baker", "candy", "delta", "eagle", "flame", "grape", "house", "input", "jolly"];
const MAX_ATTEMPTS = 6;
const WORD_LENGTH = 5;
const LOCKOUT_KEY = 'wordleLockout';
const POINTS_KEY = 'userPoints';
const LEADERBOARD_KEY = 'leaderboard';
const VALID_WORD_REGEX = /^[a-zA-Z]{5}$/; // Regex for validating a 5-letter word

const getRandomWord = () => {
  const shuffledWords = WORDS.sort(() => Math.random() - 0.5);
  return shuffledWords[Math.floor(Math.random() * shuffledWords.length)];
};

const WordleGrid = ({ guesses }) => {
  const theme = useMantineTheme();
  return (
    <Center style={{ flexDirection: 'column', marginTop: '20px' }}>
      {guesses.map((guess, rowIndex) => (
        <Group
          key={rowIndex}
          position="center"
          style={{
            marginBottom: '10px', // Add margin to separate rows
          }}
        >
          {Array.from({ length: WORD_LENGTH }).map((_, letterIndex) => (
            <Box
              key={letterIndex}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '10px',
                border: `2px solid ${theme.colors.gray[3]}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '5px', // Separate the letters horizontally
                backgroundColor: guess[letterIndex]?.color || theme.colors.gray[0], // Assuming guess contains color info
                fontSize: '20px',
                fontWeight: 'bold',
                color: theme.colors.dark[9],
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)', // Add shadow for depth
                transition: 'background-color 0.3s ease', // Smooth transition
                cursor: 'default',
              }}
            >
              {guess[letterIndex]?.char || ''}
            </Box>
          ))}
        </Group>
      ))}
    </Center>
  );
};

function EcoWordleGame() {
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const [word, setWord] = useState(getRandomWord());
  const [guesses, setGuesses] = useState(Array(MAX_ATTEMPTS).fill(Array(WORD_LENGTH).fill({ char: '', color: '' })));
  const [currentGuess, setCurrentGuess] = useState("");
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [points, setPoints] = useState(Number(localStorage.getItem(POINTS_KEY) || 0));
  const [timer, setTimer] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [leaderboard, setLeaderboard] = useState(JSON.parse(localStorage.getItem(LEADERBOARD_KEY)) || []);

  useEffect(() => {
    const lockoutTime = localStorage.getItem(LOCKOUT_KEY);
    if (lockoutTime && new Date() < new Date(lockoutTime)) {
      alert("The game is locked for 4 hours.");
      navigate('/viewrewards');
    }
  }, [navigate]);

  useEffect(() => {
    if (currentAttempt === MAX_ATTEMPTS && !win) {
      setGameOver(true);
    }
  }, [currentAttempt, win]);

  useEffect(() => {
    if (!gameOver) {
      const interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameOver]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (VALID_WORD_REGEX.test(value)) { // Ensure the input is a valid 5-letter word
      setCurrentGuess(value.toLowerCase());
    }
  };

  const handleSubmitGuess = () => {
    if (VALID_WORD_REGEX.test(currentGuess) && WORDS.includes(currentGuess)) { // Validate the guess
      const updatedGuesses = [...guesses];
      const guessArray = Array.from(currentGuess).map((char, index) => ({
        char,
        color: word[index] === char ? theme.colors.green[7] : word.includes(char) ? theme.colors.yellow[7] : theme.colors.gray[7]
      }));
      updatedGuesses[currentAttempt] = guessArray;
      setGuesses(updatedGuesses);

      if (currentGuess === word) {
        setWin(true);
        setGameOver(true);
        const newPoints = points + 20; // Updated points for a correct guess
        setPoints(newPoints);
        localStorage.setItem(POINTS_KEY, newPoints);
        updateLeaderboard(newPoints);
      } else {
        setCurrentAttempt(currentAttempt + 1);
        setCurrentGuess("");
      }
    } else {
      alert("Invalid guess! Ensure it's a valid 5-letter word.");
    }
  };

  const handleRestart = () => {
    setWord(getRandomWord());
    setGuesses(Array(MAX_ATTEMPTS).fill(Array(WORD_LENGTH).fill({ char: '', color: '' })));
    setCurrentGuess("");
    setCurrentAttempt(0);
    setGameOver(false);
    setWin(false);
    setTimer(0);
    setHintUsed(false);
  };

  const handleLeaveGame = () => {
    setShowLeaveModal(true);
  };

  const confirmLeaveGame = () => {
    localStorage.setItem(LOCKOUT_KEY, new Date(new Date().getTime() + 4 * 60 * 60 * 1000)); // 4-hour lockout
    navigate('/viewrewards');
  };

  const handleHint = () => {
    if (!hintUsed && points > 0) {
      for (let i = 0; i < WORD_LENGTH; i++) {
        if (!currentGuess.includes(word[i])) {
          setCurrentGuess((prev) => prev + word[i]);
          break;
        }
      }
      setHintUsed(true);
      setPoints((prev) => prev - 1);
      localStorage.setItem(POINTS_KEY, points - 1);
    }
  };

  const updateLeaderboard = (newPoints) => {
    const newEntry = { points: newPoints, time: timer, date: new Date().toLocaleString() };
    const updatedLeaderboard = [...leaderboard, newEntry].sort((a, b) => b.points - a.points).slice(0, 5);
    setLeaderboard(updatedLeaderboard);
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updatedLeaderboard));
  };

  return (
    <Container style={{ backgroundColor: theme.colors.gray[0], padding: '40px', borderRadius: '10px', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)' }}>
      <Text align="center" size="xl" weight={700} style={{ margin: '20px 0', color: theme.colors.green[9] }}>
        EcoWordle Game
      </Text>
      <Text align="center" size="sm" style={{ color: theme.colors.gray[6] }}>Timer: {timer}s</Text>
      <WordleGrid guesses={guesses} />
      {!gameOver && (
        <>
          <TextInput
            value={currentGuess}
            onChange={handleInputChange}
            placeholder="Enter your guess"
            disabled={gameOver}
            size="md"
            radius="md"
            style={{ marginTop: '20px', fontWeight: 'bold' }}
            variant="filled"
          />
          <Center>
            <Button onClick={handleSubmitGuess} disabled={currentGuess.length !== WORD_LENGTH} style={{ marginTop: '10px', marginRight: '10px', backgroundColor: theme.colors.blue[6], color: 'white', border: 'none', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)', transition: 'background-color 0.3s ease' }}>
              Submit Guess
            </Button>
            <Button onClick={handleHint} color="yellow" disabled={hintUsed || points <= 0} style={{ marginTop: '10px', marginRight: '10px', backgroundColor: theme.colors.yellow[5], color: 'black', border: 'none', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)', transition: 'background-color 0.3s ease' }}>
              Use Hint (-1 Point)
            </Button>
            <Button onClick={handleLeaveGame} color="red" style={{ marginTop: '10px', backgroundColor: theme.colors.red[6], color: 'white', border: 'none', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)', transition: 'background-color 0.3s ease' }}>
              Leave Game
            </Button>
          </Center>
        </>
      )}
      {gameOver && (
        <Paper padding="md" style={{ textAlign: 'center', marginTop: '20px', borderRadius: '10px', backgroundColor: theme.colors.green[1] }}>
          {win ? <Text size="lg" weight={700} color={theme.colors.green[9]}>Congratulations! You guessed the word and earned 20 points!</Text> : <Text size="lg" weight={700} color={theme.colors.red[7]}>Game Over! The word was: {word}</Text>}
          <Button onClick={handleRestart} style={{ marginTop: '10px', backgroundColor: theme.colors.green[6], color: 'white', border: 'none', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)', transition: 'background-color 0.3s ease' }}>Play Again</Button>
        </Paper>
      )}
      <Modal opened={showLeaveModal} onClose={() => setShowLeaveModal(false)} title="Leave Game" centered>
        <Text>Are you sure you want to leave the game? You will be locked out for 4 hours.</Text>
        <Group position="right" style={{ marginTop: '20px' }}>
          <Button onClick={confirmLeaveGame} color="red" style={{ backgroundColor: theme.colors.red[6], color: 'white' }}>Leave</Button>
          <Button onClick={() => setShowLeaveModal(false)}>Cancel</Button>
        </Group>
      </Modal>
    </Container>
  );
}

export default EcoWordleGame;
