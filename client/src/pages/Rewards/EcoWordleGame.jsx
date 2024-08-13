import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Text, TextInput, Button, Paper, Modal, Group, Center, useMantineTheme, Box } from '@mantine/core';

const WORDS = ["apple", "baker", "candy", "delta", "eagle", "flame", "grape", "house", "input", "jolly"];
const MAX_ATTEMPTS = 6;
const WORD_LENGTH = 5;
const LOCKOUT_KEY = 'wordleLockout';
const POINTS_KEY = 'userPoints';
const LEADERBOARD_KEY = 'leaderboard';
const VALID_WORD_REGEX = /^[a-zA-Z]{5}$/;

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
            marginBottom: '10px',
          }}
        >
          {Array.from({ length: WORD_LENGTH }).map((_, letterIndex) => (
            <Box
              key={letterIndex}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '5px',
                border: '2px solid #ccc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '5px',
                backgroundColor: guess[letterIndex]?.color || theme.colors.gray[0],
                fontSize: '20px',
                fontWeight: 'bold',
                color: theme.colors.dark[9],
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
    if (value.length <= WORD_LENGTH) {
      setCurrentGuess(value.toLowerCase());
    }
  };

  const handleSubmitGuess = () => {
    if (VALID_WORD_REGEX.test(currentGuess) && WORDS.includes(currentGuess)) {
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
        const newPoints = hintUsed ? points + 19 : points + 20;
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
      const newPoints = points - 1;
      setPoints(newPoints);
      localStorage.setItem(POINTS_KEY, newPoints);
    }
  };

  const updateLeaderboard = (newPoints) => {
    const newEntry = { points: newPoints, time: timer, date: new Date().toLocaleString() };
    const updatedLeaderboard = [...leaderboard, newEntry].sort((a, b) => b.points - a.points).slice(0, 5);
    setLeaderboard(updatedLeaderboard);
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updatedLeaderboard));
  };

  return (
    <Container>
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
            <Button onClick={handleSubmitGuess} disabled={currentGuess.length !== WORD_LENGTH} style={{ marginTop: '10px', marginRight: '10px' }}>
              Submit Guess
            </Button>
            <Button onClick={handleHint} color="yellow" disabled={hintUsed || points <= 0} style={{ marginTop: '10px', marginRight: '10px' }}>
              Use Hint (-1 Point)
            </Button>
            <Button onClick={handleLeaveGame} color="red" style={{ marginTop: '10px' }}>
              Leave Game
            </Button>
          </Center>
        </>
      )}
      {gameOver && (
        <Paper padding="md" style={{ textAlign: 'center', marginTop: '20px', borderRadius: '10px', backgroundColor: theme.colors.green[1] }}>
          {win ? <Text size="lg" weight={700} color={theme.colors.green[9]}>Congratulations! You guessed the word and earned {hintUsed ? 19 : 20} points!</Text> : <Text size="lg" weight={700} color={theme.colors.red[7]}>Game Over! The word was: {word}</Text>}
          <Button onClick={handleRestart} style={{ marginTop: '10px' }}>Play Again</Button>
        </Paper>
      )}
      <Modal opened={showLeaveModal} onClose={() => setShowLeaveModal(false)} title="Confirm Exit" centered>
        <Text>Are you sure you want to leave? The game will be locked for 4 hours.</Text>
        <Group position="center" style={{ marginTop: '20px' }}>
          <Button onClick={confirmLeaveGame} color="red">Yes, Leave</Button>
          <Button onClick={() => setShowLeaveModal(false)}>Cancel</Button>
        </Group>
      </Modal>
    </Container>
  );
}

export default EcoWordleGame;
