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

function generateEquation(keyStage: 'KS1' | 'KS2', inputVal?: number): { a: number, op: string, b: number, c: number } {
  const isKS1 = keyStage === 'KS1';
  if (isKS1) {
    const ops = ['+', '-'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a = inputVal !== undefined ? inputVal : 0;
    let b = 0;
    let c = 0;

    if (op === '+') {
      if (inputVal === undefined) {
        a = Math.floor(Math.random() * 8) + 2; // 2-9
      }
      b = Math.floor(Math.random() * 8) + 2; // 2-9
      c = a + b;
    } else {
      // op === '-'
      if (inputVal === undefined) {
        a = Math.floor(Math.random() * 8) + 8; // 8-15
        b = Math.floor(Math.random() * 6) + 1; // 1-6
        c = a - b;
      } else {
        // a is fixed
        if (a <= 2) {
          // If a is too small for subtraction, force addition instead
          return { a, op: '+', b: Math.floor(Math.random() * 5) + 2, c: a + Math.floor(Math.random() * 5) + 2 };
        }
        b = Math.floor(Math.random() * (a - 1)) + 1; // 1 to a-1
        c = a - b;
      }
    }
    return { a, op, b, c };
  } else {
    // KS2
    const ops = ['+', '-', '×', '÷'];
    let op = ops[Math.floor(Math.random() * ops.length)];
    let a = inputVal !== undefined ? inputVal : 0;
    let b = 0;
    let c = 0;

    if (inputVal !== undefined) {
      // a is fixed
      if (op === '÷') {
        const divisors = [];
        for (let i = 2; i <= 12; i++) {
          if (a % i === 0 && a / i >= 2 && a / i !== a) {
            divisors.push(i);
          }
        }
        if (divisors.length > 0) {
          b = divisors[Math.floor(Math.random() * divisors.length)];
          c = a / b;
        } else {
          // Fallback to subtraction or addition
          op = Math.random() < 0.5 ? '-' : '+';
        }
      }

      if (op === '×') {
        if (a <= 12) {
          b = Math.floor(Math.random() * 10) + 2; // 2-11
        } else if (a <= 30) {
          b = Math.floor(Math.random() * 4) + 2; // 2-5
        } else {
          // Fallback to subtraction or addition because result will be too large
          op = Math.random() < 0.5 ? '-' : '+';
        }
      }

      if (op === '+') {
        b = Math.floor(Math.random() * 45) + 5; // 5-49
        c = a + b;
      } else if (op === '-') {
        if (a <= 5) {
          // Fallback to addition
          op = '+';
          b = Math.floor(Math.random() * 45) + 5;
          c = a + b;
        } else {
          b = Math.floor(Math.random() * (a - 2)) + 2; // 2 to a-2
          c = a - b;
        }
      }
      
      if (op === '×') {
        c = a * b;
      }
    } else {
      // Completely random
      if (op === '×') {
        a = Math.floor(Math.random() * 8) + 3; // 3-10
        b = Math.floor(Math.random() * 8) + 3; // 3-10
        c = a * b;
      } else if (op === '÷') {
        c = Math.floor(Math.random() * 8) + 3; // 3-10
        b = Math.floor(Math.random() * 8) + 3; // 3-10
        a = c * b;
      } else if (op === '+') {
        a = Math.floor(Math.random() * 35) + 12; // 12-46
        b = Math.floor(Math.random() * 35) + 12; // 12-46
        c = a + b;
      } else {
        a = Math.floor(Math.random() * 45) + 35; // 35-79
        b = Math.floor(Math.random() * 25) + 10; // 10-34
        c = a - b;
      }
    }
    return { a, op, b, c };
  }
}

/**
 * Generate a random math crossword puzzle for a given key stage.
 */
export function generateMathCrossword(keyStage: 'KS1' | 'KS2'): MathCrosswordPuzzle {
  const size = 14;
  const grid: MathCrosswordCell[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({
      value: '',
      isInput: false,
      isBlocked: true
    }))
  );

  // Generate 4 intersecting equations in a tree structure:
  // Eq 1 (Horizontal at Row 2): A1 [op1] B1 = C1
  // Eq 2 (Vertical at col 1): A1 [op2] B2 = C2
  // Eq 3 (Vertical at col_c1): C1 [op3] B3 = C3
  // Eq 4 (Horizontal at row_c3): C3 [op4] B4 = C4

  const eq1 = generateEquation(keyStage);
  const eq1Str = `${eq1.a}${eq1.op}${eq1.b}=${eq1.c}`;

  const eq2 = generateEquation(keyStage, eq1.a);
  const eq2Str = `${eq2.a}${eq2.op}${eq2.b}=${eq2.c}`;

  const eq3 = generateEquation(keyStage, eq1.c);
  const eq3Str = `${eq3.a}${eq3.op}${eq3.b}=${eq3.c}`;

  const eq4 = generateEquation(keyStage, eq3.c);
  const eq4Str = `${eq4.a}${eq4.op}${eq4.b}=${eq4.c}`;

  const eq1Cells = [];
  for (let idx = 0; idx < eq1Str.length; idx++) {
    eq1Cells.push({ r: 2, c: 1 + idx, char: eq1Str[idx] });
  }

  const eq2Cells = [];
  for (let idx = 0; idx < eq2Str.length; idx++) {
    eq2Cells.push({ r: 2 + idx, c: 1, char: eq2Str[idx] });
  }

  const col_c1 = 1 + eq1Str.indexOf('=') + 1;
  const eq3Cells = [];
  for (let idx = 0; idx < eq3Str.length; idx++) {
    eq3Cells.push({ r: 2 + idx, c: col_c1, char: eq3Str[idx] });
  }

  const c3_row = 2 + eq3Str.indexOf('=') + 1;
  const eq4Cells = [];
  for (let idx = 0; idx < eq4Str.length; idx++) {
    eq4Cells.push({ r: c3_row, c: col_c1 + idx, char: eq4Str[idx] });
  }

  // Populate equations in the grid
  const allCells = [...eq1Cells, ...eq2Cells, ...eq3Cells, ...eq4Cells];
  allCells.forEach(cell => {
    grid[cell.r][cell.c] = {
      value: cell.char,
      isInput: false,
      isBlocked: false
    };
  });

  // Now, we select which cells to make into input blanks (for the kids to solve)
  // 1. Hide b1 in Eq 1 (Horizontal)
  const b1Idx = eq1Str.indexOf(eq1.op) + 1;
  const b1Len = String(eq1.b).length;
  for (let i = 0; i < b1Len; i++) {
    const col = 1 + b1Idx + i;
    const originalValue = grid[2][col].value;
    grid[2][col] = {
      value: '',
      isInput: true,
      inputId: `eq1_num2_${i}`,
      correctDigit: originalValue,
      isBlocked: false
    };
  }

  // 2. Hide operator op2 in Eq 2 (Vertical at row = 2 + aLen, col = 1)
  const op2Idx = String(eq2.a).length;
  grid[2 + op2Idx][1] = {
    value: '',
    isInput: true,
    inputId: 'eq2_op',
    correctDigit: eq2.op,
    isBlocked: false
  };

  // 3. Hide result c2 in Eq 2
  const c2Idx = eq2Str.indexOf('=') + 1;
  const c2Len = String(eq2.c).length;
  for (let i = 0; i < c2Len; i++) {
    const row = 2 + c2Idx + i;
    const originalValue = grid[row][1].value;
    grid[row][1] = {
      value: '',
      isInput: true,
      inputId: `eq2_res_${i}`,
      correctDigit: originalValue,
      isBlocked: false
    };
  }

  // 4. Hide b3 in Eq 3 (Vertical)
  const b3Idx = eq3Str.indexOf(eq3.op) + 1;
  const b3Len = String(eq3.b).length;
  for (let i = 0; i < b3Len; i++) {
    const row = 2 + b3Idx + i;
    const originalValue = grid[row][col_c1].value;
    grid[row][col_c1] = {
      value: '',
      isInput: true,
      inputId: `eq3_num2_${i}`,
      correctDigit: originalValue,
      isBlocked: false
    };
  }

  // 5. Hide operator op4 in Eq 4 (Horizontal)
  const op4Idx = String(eq4.a).length;
  grid[c3_row][col_c1 + op4Idx] = {
    value: '',
    isInput: true,
    inputId: 'eq4_op',
    correctDigit: eq4.op,
    isBlocked: false
  };

  // 6. Hide result c4 in Eq 4 (Horizontal)
  const c4Idx = eq4Str.indexOf('=') + 1;
  const c4Len = String(eq4.c).length;
  for (let i = 0; i < c4Len; i++) {
    const col = col_c1 + c4Idx + i;
    const originalValue = grid[c3_row][col].value;
    grid[c3_row][col] = {
      value: '',
      isInput: true,
      inputId: `eq4_res_${i}`,
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
        row: 2,
        col: 1,
        text: `Solve Horizontal: ${eq1.a} ${eq1.op} [ ] = ${eq1.c}`,
        cells: eq1Cells
      },
      {
        id: 'eq2',
        type: 'vertical',
        row: 2,
        col: 1,
        text: `Determine Sign and Solve Vertical: ${eq2.a} [?] ${eq2.b} = [ ]`,
        cells: eq2Cells
      },
      {
        id: 'eq3',
        type: 'vertical',
        row: 2,
        col: col_c1,
        text: `Solve Vertical: ${eq3.a} ${eq3.op} [ ] = ${eq3.c}`,
        cells: eq3Cells
      },
      {
        id: 'eq4',
        type: 'horizontal',
        row: c3_row,
        col: col_c1,
        text: `Determine Sign and Solve Horizontal: ${eq4.a} [?] ${eq4.b} = [ ]`,
        cells: eq4Cells
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
