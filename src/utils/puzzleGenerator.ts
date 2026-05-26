/**
 * Puzzle generator for Math Crosswords, Word Crosswords, and Word Find puzzles.
 * Curated for KS1 and KS2 educational topics to support learning transitions.
 */

// Curated vocabulary categories for spelling and science crosswords/word find
export const WORD_CATEGORIES = {
  animals: {
    name: 'Animals & Nature 🐾',
    words: ['LION', 'BEAR', 'FROG', 'DUCK', 'BIRD', 'FISH', 'TIGER', 'ZEBRA', 'SHARK', 'RABBIT', 'OWL', 'DEER', 'FOX', 'WOLF', 'SPIDER', 'BEAVER'],
    clues: {
      LION: 'The king of the jungle with a big mane.',
      BEAR: 'A large furry mammal that loves honey.',
      FROG: 'A green amphibian that loves to hop and croak.',
      DUCK: 'A water bird that says "quack".',
      BIRD: 'An animal with feathers and wings that can fly.',
      FISH: 'It swims underwater and has gills.',
      TIGER: 'A big orange cat with black stripes.',
      ZEBRA: 'A horse-like animal with black and white stripes.',
      SHARK: 'A large ocean predator with sharp teeth.',
      RABBIT: 'It has long ears and loves to eat carrots.',
      OWL: 'A nocturnal bird known for being wise and saying "hoot".',
      DEER: 'A forest animal with antlers.',
      FOX: 'A clever reddish-brown animal with a bushy tail.',
      WOLF: 'A wild canine that lives in packs and howls at the moon.',
      SPIDER: 'An eight-legged creature that spins webs.',
      BEAVER: 'An animal with a flat tail that builds wooden dams.'
    }
  },
  science: {
    name: 'Science Exploration 🧪',
    words: ['SEED', 'LEAF', 'ROOT', 'STEM', 'RAIN', 'WIND', 'SNOW', 'BONE', 'BETA', 'HEART', 'BRAIN', 'LUNG', 'LIGHT', 'SOUND', 'HEAT', 'STAR'],
    clues: {
      SEED: 'A tiny plant package that grows in soil.',
      LEAF: 'The flat green part of a plant that catches sunlight.',
      ROOT: 'The part of a plant that grows down into the soil to drink water.',
      STEM: 'The main trunk or stalk of a plant.',
      RAIN: 'Water droplets falling from clouds.',
      WIND: 'Moving air that blows leaves off trees.',
      SNOW: 'Frozen white ice crystals falling from the sky.',
      BONE: 'A hard part of our skeleton.',
      BETA: 'A second letter of the Greek alphabet, often representing testing.',
      HEART: 'The muscle that pumps blood around your body.',
      BRAIN: 'The control center in your head for thinking.',
      LUNG: 'The organ in your chest that helps you breathe air.',
      LIGHT: 'It comes from the sun or lamps and helps us see.',
      SOUND: 'What we hear with our ears.',
      HEAT: 'Warmth that comes from fire or the sun.',
      STAR: 'A shining ball of gas in the night sky.'
    }
  },
  geography: {
    name: 'World Around Us 🌍',
    words: ['WORLD', 'MAP', 'FLAG', 'LAND', 'RIVER', 'LAKE', 'TOWN', 'CITY', 'LONDON', 'PARIS', 'EUROPE', 'ASIA', 'AFRICA', 'OCEAN', 'DESERT', 'MOUNTAIN'],
    clues: {
      WORLD: 'Our planet Earth.',
      MAP: 'A drawing of a place that shows roads, rivers, and cities.',
      FLAG: 'A piece of colored cloth that represents a country.',
      LAND: 'The solid part of the Earth, not covered by water.',
      RIVER: 'A long flowing stream of water.',
      LAKE: 'A large body of water surrounded by land.',
      TOWN: 'A place where people live, larger than a village.',
      CITY: 'A very large town, like London or New York.',
      LONDON: 'The capital city of England.',
      PARIS: 'The capital city of France, famous for the Eiffel Tower.',
      EUROPE: 'The continent containing the UK, France, and Spain.',
      ASIA: 'The largest continent, home to China and India.',
      AFRICA: 'The continent with elephants, lions, and the Sahara desert.',
      OCEAN: 'The vast body of salt water covering most of the Earth.',
      DESERT: 'A very dry, sandy region with almost no rain.',
      MOUNTAIN: 'A very high, rocky hill rising above the clouds.'
    }
  },
  spelling: {
    name: 'Vocabulary & Spelling ✍️',
    words: ['SPELL', 'WORD', 'READ', 'WRITE', 'BOOK', 'SCHOOL', 'LEARN', 'CLASS', 'STUDY', 'PENCIL', 'PAPER', 'HAPPY', 'SMILE', 'FRIEND', 'CHILD', 'SMART'],
    clues: {
      SPELL: 'To say or write the letters of a word in order.',
      WORD: 'A unit of language that carries meaning.',
      READ: 'To look at letters and understand them.',
      WRITE: 'To mark letters on paper with a pen or pencil.',
      BOOK: 'Pages bound together filled with stories or facts.',
      SCHOOL: 'A place where children go to learn.',
      LEARN: 'To get new knowledge or skills.',
      CLASS: 'A group of students learning together.',
      STUDY: 'To spend time learning about a subject.',
      PENCIL: 'A wooden writing tool containing lead.',
      PAPER: 'Thin sheets made from trees that we write on.',
      HAPPY: 'Feeling glad, cheerful, or pleased.',
      SMILE: 'A happy expression on your face.',
      FRIEND: 'Someone you like and enjoy playing with.',
      CHILD: 'A young human being, like you!',
      SMART: 'Clever, bright, or quick at learning.'
    }
  }
};

// Math Crossword structures
export interface MathCrosswordCell {
  value: string; // The character displayed ('5', '+', '=', etc.)
  isInput: boolean; // Whether the cell is an input field for the user
  inputId?: string; // ID to reference this input in state (e.g. "eq1_num2")
  correctDigit?: string; // The correct digit if this is an input cell
  isBlocked: boolean; // True if this cell is empty grid space
}

export interface MathCrosswordEquation {
  id: string;
  type: 'horizontal' | 'vertical';
  row: number;
  col: number;
  text: string;
  cells: { r: number; c: number; char: string }[];
}

export interface MathCrosswordPuzzle {
  grid: MathCrosswordCell[][];
  equations: MathCrosswordEquation[];
}

/**
 * Generate a random math crossword puzzle for a given key stage.
 */
export function generateMathCrossword(keyStage: 'KS1' | 'KS2'): MathCrosswordPuzzle {
  const size = 9;
  const grid: MathCrosswordCell[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({
      value: '',
      isInput: false,
      isBlocked: true
    }))
  );

  // Generate 2 crossing equations:
  // Eq 1: Horizontal at row 1: A [op1] B = C
  // Eq 2: Vertical at col 4: C [op2] D = E  (crossing at C)

  let a = 0, b = 0, c = 0, d = 0, e = 0;
  let op1 = '+', op2 = '-';

  if (keyStage === 'KS1') {
    // Keep addition and subtraction simple, results <= 20
    const ops1 = ['+', '-'];
    op1 = ops1[Math.floor(Math.random() * ops1.length)];
    if (op1 === '+') {
      a = Math.floor(Math.random() * 8) + 2; // 2-9
      b = Math.floor(Math.random() * 8) + 2; // 2-9
      c = a + b;
    } else {
      c = Math.floor(Math.random() * 8) + 8; // 8-15
      b = Math.floor(Math.random() * 6) + 1; // 1-6
      a = c + b; // a - b = c
    }

    const ops2 = ['+', '-'];
    op2 = ops2[Math.floor(Math.random() * ops2.length)];
    if (op2 === '+') {
      d = Math.floor(Math.random() * 5) + 1; // 1-5
      e = c + d;
    } else {
      d = Math.floor(Math.random() * c) + 1; // 1 to c
      e = c - d;
    }
  } else {
    // KS2: Multiplication / Division, results <= 100
    const ops1 = ['+', '-', '×'];
    op1 = ops1[Math.floor(Math.random() * ops1.length)];
    if (op1 === '×') {
      a = Math.floor(Math.random() * 8) + 2; // 2-9
      b = Math.floor(Math.random() * 8) + 2; // 2-9
      c = a * b; // max 81 (2 digits)
    } else if (op1 === '+') {
      a = Math.floor(Math.random() * 35) + 10; // 10 to 44
      b = Math.floor(Math.random() * 35) + 10; // 10 to 44
      c = a + b; // max 88 (2 digits)
    } else {
      a = Math.floor(Math.random() * 45) + 30; // 30 to 74
      b = Math.floor(Math.random() * 20) + 5;  // 5 to 24
      c = a - b; // max 69 (2 digits)
    }

    const ops2 = ['+', '-', '÷'];
    op2 = ops2[Math.floor(Math.random() * ops2.length)];
    if (op2 === '÷') {
      // Find a division that divides cleanly
      const possibleDivisors = [];
      for (let i = 2; i <= 10; i++) {
        if (c % i === 0 && c / i !== c) {
          possibleDivisors.push(i);
        }
      }
      if (possibleDivisors.length > 0) {
        d = possibleDivisors[Math.floor(Math.random() * possibleDivisors.length)];
        e = c / d;
      } else {
        // Fallback to subtraction
        op2 = '-';
        d = Math.floor(Math.random() * (c - 1)) + 1;
        e = c - d;
      }
    } else if (op2 === '+') {
      // Ensure e stays within 2 digits so equation never exceeds 8 characters
      const maxD = Math.max(5, 99 - c);
      d = Math.floor(Math.random() * (Math.min(30, maxD) - 5 + 1)) + 5;
      e = c + d;
    } else {
      d = Math.floor(Math.random() * (c - 1)) + 1;
      e = c - d;
    }
  }

  // Horizontal equation cells at row 1, col 0..4
  const eq1Str = `${a}${op1}${b}=${c}`;
  const eq1Cells = [];
  for (let idx = 0; idx < eq1Str.length; idx++) {
    eq1Cells.push({ r: 1, c: idx, char: eq1Str[idx] });
  }

  // Vertical equation cells at row 1..5, col (eq1Str.indexOf('=')) + 1 [which is where 'c' is]
  // Let's place 'c' at col 4
  const eq2Str = `${c}${op2}${d}=${e}`;
  const eq2Cells = [];
  const startCol = eq1Str.indexOf('=') + 1; // Index of the result 'c'
  for (let idx = 0; idx < eq2Str.length; idx++) {
    // Write vertically: row 1 + idx, col startCol
    eq2Cells.push({ r: 1 + idx, c: startCol, char: eq2Str[idx] });
  }

  // Populate horizontal equation in the grid
  eq1Cells.forEach(cell => {
    grid[cell.r][cell.c] = {
      value: cell.char,
      isInput: false,
      isBlocked: false
    };
  });

  // Populate vertical equation in the grid
  eq2Cells.forEach(cell => {
    grid[cell.r][cell.c] = {
      value: cell.char,
      isInput: false,
      isBlocked: false
    };
  });

  // Now, we select which cells to make into input blanks (for the kids to solve)
  // Let's hide:
  // - The second number of eq 1 (b)
  // - The operator of eq 2 (op2)
  // - The final answer of eq 2 (e)
  
  // Find coordinates for B in grid
  const bIndex = eq1Str.indexOf(op1) + 1;
  const bLen = String(b).length;
  for (let i = 0; i < bLen; i++) {
    const col = bIndex + i;
    const originalValue = grid[1][col].value;
    grid[1][col] = {
      value: '',
      isInput: true,
      inputId: `eq1_num2_${i}`,
      correctDigit: originalValue,
      isBlocked: false
    };
  }

  // Hide vertical operator op2 (row 2, col startCol)
  grid[2][startCol] = {
    value: '',
    isInput: true,
    inputId: 'eq2_op',
    correctDigit: op2,
    isBlocked: false
  };

  // Hide vertical result E
  const eIndex = eq2Str.indexOf('=') + 1;
  const eLen = String(e).length;
  for (let i = 0; i < eLen; i++) {
    const row = 1 + eIndex + i;
    const originalValue = grid[row][startCol].value;
    grid[row][startCol] = {
      value: '',
      isInput: true,
      inputId: `eq2_res_${i}`,
      correctDigit: originalValue,
      isBlocked: false
    };
  }

  return {
    grid,
    equations: [
      {
        id: 'eq1',
        type: 'horizontal',
        row: 1,
        col: 0,
        text: `Find B in: ${a} ${op1} [ ] = ${c}`,
        cells: eq1Cells
      },
      {
        id: 'eq2',
        type: 'vertical',
        row: 1,
        col: startCol,
        text: `Find D and E in: ${c} [op] ${d} = [ ]`,
        cells: eq2Cells
      }
    ]
  };
}

// Word Crossword interfaces
export interface WordCrosswordCell {
  letter: string; // The correct letter
  displayLetter: string; // The letter to show (blank for input)
  isInput: boolean;
  cellNum?: number; // Number displayed in the top corner of the cell
  isBlocked: boolean;
  wordIds: string[]; // IDs of equations/words crossing this cell
}

export interface WordCrosswordPlaced {
  word: string;
  clue: string;
  direction: 'horizontal' | 'vertical';
  row: number;
  col: number;
  cellNum: number;
}

export interface WordCrosswordPuzzle {
  grid: WordCrosswordCell[][];
  placedWords: WordCrosswordPlaced[];
}

/**
 * Generate a random word crossword puzzle from a category.
 */
export function generateWordCrossword(categoryKey: keyof typeof WORD_CATEGORIES): WordCrosswordPuzzle {
  const category = WORD_CATEGORIES[categoryKey];
  const size = 10;
  
  // Initialize empty grid
  const grid: WordCrosswordCell[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({
      letter: '',
      displayLetter: '',
      isInput: false,
      isBlocked: true,
      wordIds: []
    }))
  );

  // Shuffle category words
  const words = [...category.words].sort(() => Math.random() - 0.5).slice(0, 5);
  const placedWords: WordCrosswordPlaced[] = [];
  let cellNumberCounter = 1;

  // Let's place the first word horizontally in the center
  const firstWord = words[0];
  const firstRow = 4;
  const firstCol = Math.max(0, Math.floor((size - firstWord.length) / 2));
  
  placedWords.push({
    word: firstWord,
    clue: (category.clues as any)[firstWord],
    direction: 'horizontal',
    row: firstRow,
    col: firstCol,
    cellNum: cellNumberCounter++
  });

  // Write first word to grid
  for (let i = 0; i < firstWord.length; i++) {
    grid[firstRow][firstCol + i] = {
      letter: firstWord[i],
      displayLetter: '', // Blank initially for child to fill
      isInput: true,
      isBlocked: false,
      wordIds: [firstWord]
    };
  }
  // Assign grid cell number
  grid[firstRow][firstCol].cellNum = 1;

  // Simple crossing logic for remaining 3-4 words
  for (let w = 1; w < words.length; w++) {
    const currentWord = words[w];
    let placed = false;

    // Try to find a matching letter between the current word and already placed words
    for (const placedWord of placedWords) {
      if (placed) break;

      for (let i = 0; i < placedWord.word.length; i++) {
        if (placed) break;
        const letter = placedWord.word[i];

        for (let j = 0; j < currentWord.length; j++) {
          if (placed) break;
          
          if (currentWord[j] === letter) {
            // Found a intersection! Let's try to place it perpendicularly.
            if (placedWord.direction === 'horizontal') {
              // Place vertically
              const startRow = placedWord.row - j;
              const col = placedWord.col + i;

              // Check if fits on grid and doesn't collide improperly
              if (startRow >= 0 && startRow + currentWord.length < size) {
                let canPlace = true;
                for (let k = 0; k < currentWord.length; k++) {
                  const r = startRow + k;
                  // Don't collide except at the intersection cell
                  if (k !== j && !grid[r][col].isBlocked) {
                    canPlace = false;
                  }
                  // Avoid adjacent parallel cells to avoid crowded text
                  if (k !== j && (!grid[r][col - 1]?.isBlocked || !grid[r][col + 1]?.isBlocked)) {
                    canPlace = false;
                  }
                }

                if (canPlace) {
                  const cNum = cellNumberCounter++;
                  placedWords.push({
                    word: currentWord,
                    clue: (category.clues as any)[currentWord],
                    direction: 'vertical',
                    row: startRow,
                    col: col,
                    cellNum: cNum
                  });

                  for (let k = 0; k < currentWord.length; k++) {
                    const r = startRow + k;
                    grid[r][col] = {
                      letter: currentWord[k],
                      displayLetter: '',
                      isInput: true,
                      isBlocked: false,
                      wordIds: [...grid[r][col].wordIds, currentWord]
                    };
                  }
                  grid[startRow][col].cellNum = cNum;
                  placed = true;
                }
              }
            } else {
              // PlacedWord is vertical, place currentWord horizontally
              const row = placedWord.row + i;
              const startCol = placedWord.col - j;

              if (startCol >= 0 && startCol + currentWord.length < size) {
                let canPlace = true;
                for (let k = 0; k < currentWord.length; k++) {
                  const c = startCol + k;
                  if (k !== j && !grid[row][c].isBlocked) {
                    canPlace = false;
                  }
                  if (k !== j && (!grid[row - 1]?.[c].isBlocked || !grid[row + 1]?.[c].isBlocked)) {
                    canPlace = false;
                  }
                }

                if (canPlace) {
                  const cNum = cellNumberCounter++;
                  placedWords.push({
                    word: currentWord,
                    clue: (category.clues as any)[currentWord],
                    direction: 'horizontal',
                    row: row,
                    col: startCol,
                    cellNum: cNum
                  });

                  for (let k = 0; k < currentWord.length; k++) {
                    const c = startCol + k;
                    grid[row][c] = {
                      letter: currentWord[k],
                      displayLetter: '',
                      isInput: true,
                      isBlocked: false,
                      wordIds: [...grid[row][c].wordIds, currentWord]
                    };
                  }
                  grid[row][startCol].cellNum = cNum;
                  placed = true;
                }
              }
            }
          }
        }
      }
    }
  }

  return {
    grid,
    placedWords
  };
}

// Word Find (Word Search) interfaces
export interface WordFindCell {
  letter: string;
  row: number;
  col: number;
  isFound: boolean;
  isSelected?: boolean;
}

export interface WordFindPuzzle {
  grid: WordFindCell[][];
  words: string[];
  wordLocations: Record<string, { r: number; c: number }[]>;
}

/**
 * Generate a random 10x10 Word Find (Word Search) grid.
 */
export function generateWordFind(categoryKey: keyof typeof WORD_CATEGORIES): WordFindPuzzle {
  const category = WORD_CATEGORIES[categoryKey];
  const size = 10;
  
  // Select 6 random words
  const words = [...category.words].sort(() => Math.random() - 0.5).slice(0, 6);
  
  const grid: string[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => '')
  );

  const wordLocations: Record<string, { r: number; c: number }[]> = {};

  const directions = [
    [0, 1],   // Horizontal right
    [1, 0],   // Vertical down
    [1, 1],   // Diagonal down-right
    [-1, 1]   // Diagonal up-right
  ];

  words.forEach(word => {
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 100) {
      attempts++;
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const dr = dir[0];
      const dc = dir[1];

      // Random starting position
      const startRow = Math.floor(Math.random() * size);
      const startCol = Math.floor(Math.random() * size);

      // Check if it fits
      const endRow = startRow + dr * (word.length - 1);
      const endCol = startCol + dc * (word.length - 1);

      if (endRow >= 0 && endRow < size && endCol >= 0 && endCol < size) {
        // Check for collisions
        let collision = false;
        for (let i = 0; i < word.length; i++) {
          const r = startRow + dr * i;
          const c = startCol + dc * i;
          if (grid[r][c] !== '' && grid[r][c] !== word[i]) {
            collision = true;
            break;
          }
        }

        if (!collision) {
          const coords = [];
          for (let i = 0; i < word.length; i++) {
            const r = startRow + dr * i;
            const c = startCol + dc * i;
            grid[r][c] = word[i];
            coords.push({ r, c });
          }
          wordLocations[word] = coords;
          placed = true;
        }
      }
    }
  });

  // Fill in random uppercase letters
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const finalGrid: WordFindCell[][] = grid.map((row, r) =>
    row.map((cell, c) => {
      const letter = cell !== '' ? cell : alphabet[Math.floor(Math.random() * alphabet.length)];
      return {
        letter,
        row: r,
        col: c,
        isFound: false
      };
    })
  );

  return {
    grid: finalGrid,
    words,
    wordLocations
  };
}
