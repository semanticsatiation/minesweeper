import './stylesheets/reset.css';
import './stylesheets/App.css';
import React, { useEffect, useState } from "react";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBomb, faFlag, faMousePointer, faMouse} from '@fortawesome/free-solid-svg-icons';
import Timer from './components/timer';
import ButtonDifficulties from './components/button_difficulties';
import CustomForm from './components/custom_form';

const arraysEqual = (a, b) => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

const defaultOptions = {
    revealed: [],
    bombsRevealed: false,
    flaggedSet: new Set([]),
    bombsSet: new Set([]),
}

let revealedSet = new Set([]);

function App() {
  const [levelOptions, setLevelOptions] = useState({
    Beginner: [8, 8, 10],
    Intermediate: [16, 16, 40],
    Expert: [16, 30, 99],
    Custom: [2, 2, 1]
  });

  const [resetGame, setResetGame] = useState(false);

  const [level, setLevel] = useState(null);

  const [board, setDimensions] = useState([0, 0, 0]);

  const [gameState, setGameState] = useState(null); // "win" or "lose"; null means game is still going. 

  const [tiles, setTiles] = useState({...defaultOptions});

  const [showCustomForm, setShowCustomForm] = useState(false);

  useEffect(() => {
    if (level !== null || resetGame) {

      const currentLevel = levelOptions[level];

      // make sure if the bomb exceeds the tile amount, that we always set it 1 less
      // than the amount of the tiles present on the board

      const bombIsOver = currentLevel[2] > currentLevel[0] * currentLevel[1];

      const upcomingBoard = bombIsOver ? ([...currentLevel.slice(0, 2), (currentLevel[0] * currentLevel[1]) - 1]) : (currentLevel);

      const arr = Array.from(Array(upcomingBoard[0] * upcomingBoard[1]).keys());

      revealedSet = new Set([]);

      shuffleArray(arr);

      setResetGame(false);
      setGameState(null);
      setDimensions(upcomingBoard);
      setTiles({
        ...defaultOptions,
        bombsSet: new Set(arr.slice(0, upcomingBoard[2]))
      })
    }
  }, [level, resetGame])

  useEffect(() => {
    if (gameState === "lose") {
      setTiles({
        ...tiles,
        flaggedSet: new Set([]),
        bombsRevealed: true
      });
    }
  }, [gameState])

  useEffect(() => {
    if (level != null && tiles.revealed.length === ((board[0] * board[1]) - board[2])) {
      setGameState("win");
    }
  }, [tiles])

  const handleRightClick = (e, pos) => {
    e.preventDefault();

    if (hasNum(tiles.flaggedSet, pos)) {
      const updateFlaggedSet = new Set([...tiles.flaggedSet]);

      updateFlaggedSet.delete(calcNum(pos));

      setTiles({
        ...tiles,
        flaggedSet: updateFlaggedSet
      });
    } else {
      setTiles({
        ...tiles,
        flaggedSet: new Set([...tiles.flaggedSet, calcNum(pos)])
      });
    }
  }

  const setTile = (pos) => {
    if (hasNum(revealedSet, pos) || hasNum(tiles.flaggedSet, pos)) {
      return;
    }

    if (hasNum(tiles.bombsSet, pos)) {
      setGameState("lose");
    } else if (!hasNum(revealedSet, pos) || !hasNum(tiles.flaggedSet, pos)) {
      let tileValues = [];

      const bombsNearby = surroundingTiles(pos).filter((pos) => hasNum(tiles.bombsSet, pos)).length;

      if (bombsNearby > 0) {
        if (!hasNum(revealedSet, pos)) {
          revealedSet.add(calcNum(pos));
          tileValues.push([...pos, bombsNearby]);
        }
      } else {
        let neighbors = [pos, ...surroundingTiles(pos)];
        
        while (neighbors.length > 0) {
          let neighbor = neighbors.pop();

          let bombCount = surroundingTiles(neighbor).filter((pos) => hasNum(tiles.bombsSet, pos)).length;

          if (bombCount) {
            if (!hasNum(revealedSet, neighbor)) {
              revealedSet.add(calcNum(neighbor));
              tileValues.push([...neighbor, bombCount]);
            }
          } else {
            if (!hasNum(revealedSet, neighbor)) {
              tileValues.push([...neighbor, bombCount]);
            }

            if (!hasNum(revealedSet, neighbor)) {
              neighbors = [...neighbors, ...surroundingTiles(neighbor)];
            }

            revealedSet.add(calcNum(neighbor));
          }
        }
      }

      const newFlagSet = new Set([...tiles.flaggedSet]);

      revealedSet.forEach(seen => newFlagSet.delete(seen));
      
      setTiles({
        ...tiles,
        flaggedSet: newFlagSet,
        // remove any flags from squares that have just been revealed
        
        revealed: [...tiles.revealed, ...tileValues]
      });
    }
  }

  const hasNum = (search, target) => (
    search.has(calcNum(target))
  )

  const calcNum = (target, currentBoard = {}) => {
    let cb = board;

    if (currentBoard.hasOwnProperty("b")) {
      cb = currentBoard.b;
    }
    return ((target[0] * cb[1]) + target[1]);
  }

  const surroundingTiles = (pos) => {
    const [r, c] = pos;

    return (
      [
        [r - 1, c], [r + 1, c],
        [r, c - 1], [r, c + 1],
        [r - 1, c - 1], [r - 1, c + 1],
        [r + 1, c - 1], [r + 1, c + 1]
      ].filter((arr) =>[...Array(board[0]).keys()].includes(arr[0]) && [...Array(board[1]).keys()].includes(arr[1]))
    )
  }

  const renderTile = (pos) => {
    const {bombsSet, flaggedSet, revealed} = tiles;

    if (hasNum(bombsSet, pos) && tiles.bombsRevealed) {
      return (
        <FontAwesomeIcon icon={faBomb} />
      )
    } else if (hasNum(flaggedSet, pos)) {
      return (
        <FontAwesomeIcon className="flag" icon={faFlag} />
      )
    } else {
      if (hasNum(revealedSet, pos)) {
        const foundEle = revealed.find(arr => arraysEqual([arr[0], arr[1]], pos));

        return (
          `${foundEle[2] === 0 ? ("") : (foundEle[2])}`
        )
      } else {
        return ("")
      }
    }
  }

  const renderEndGame = () => {
    let result = null;
    let className = null;

    if (gameState === "win") {
      className = "win"
      result = "YOU WIN!";
    } else if (gameState === "lose") {
      className = "lose";
      result = "YOU LOSE!";
    }

    return (<div className={`end-game-result ${className}`}>{result}</div>);
  }

  const setcustomLevel = (e, pos) => {

    let num = parseInt(e.target.value);

    const custom = levelOptions["Custom"];

    let action = (newNum) => [newNum, ...custom.slice(1)]

    if (pos === 1) {
      action = (newNum) => [custom[0], newNum, custom[2]]
    } else if (pos === 2) {
      action = (newNum) => [...custom.slice(0, 2), newNum]
    }

    if (isNaN(num)) {
      if ([0, 1].includes(pos)) {
        num = 2;
      } else {
        num = 1;
      }
    } else {
      if ([0, 1].includes(pos) && num > 80) {
        num = 80
      }
      
      if ([0, 1].includes(pos) && num <= 1) {
        num = 2;
      } else if (pos === 2 && num <= 1) {
        num = 1;
      }
    }

    setLevelOptions({
      ...levelOptions,
      Custom: action(num)
    });
  }

  const setMineLevel = (newLevel) => {
    if (level === newLevel) {
      setResetGame(true);
    } else {
      setLevel(newLevel);
    }
  }

  return (
    level === null ? (
      <div className="menu-container">
        <div className="menu">
          {
            showCustomForm ? (
              <CustomForm setcustomLevel={setcustomLevel} setShowCustomForm={setShowCustomForm} setMineLevel={setMineLevel} custom={levelOptions["Custom"]}/>
            ) : (
              <ButtonDifficulties setShowCustomForm={setShowCustomForm} setMineLevel={setMineLevel}/>
            )
          }
        </div>
      </div>
    ) : (
      <div className="App">{
            <div className="game-container">
              <header className="game-header">
                <div className="flag-counter">{board[2] - tiles.flaggedSet.size}</div>
                <div className="flag-container">
                  <FontAwesomeIcon className="flag" icon={faFlag} />
                  <span>:</span>
                  <div className="flag-instructions">
                    <FontAwesomeIcon icon={faMouse} />
                    <div className="mouse">
                      <FontAwesomeIcon icon={faMousePointer} />
                    </div>
                  </div>
                </div>
                <div>{<Timer gameState={gameState} />}</div>
              </header>

            {renderEndGame()}
            {
              gameState != null ? (
                <div className="end-game-menu">{
                  showCustomForm ? (
                    <CustomForm setcustomLevel={setcustomLevel} setShowCustomForm={setShowCustomForm} setMineLevel={setMineLevel} custom={levelOptions["Custom"]} />
                  ) : (
                      <ButtonDifficulties setShowCustomForm={setShowCustomForm} setMineLevel={setMineLevel} />
                    )
                }</div>
              ) : (null)
            }
              <ul className="grid">{
                [...Array(board[0])].map((row, ri) => (
                  <li className="row" key={ri}>{
                    [...Array(board[1])].map((col, ci) => {
                      const pos = [ri, ci];
                      return (
                        <button className={`${hasNum(revealedSet, pos) ? ("reveal") : ("")} ${hasNum(revealedSet, pos) || gameState !== null ? ("disable") : ("")} mine`} key={ci} onContextMenu={e => handleRightClick(e, pos)} onClick={() => setTile(pos)}>{
                          renderTile(pos)
                        }</button>
                      )
                    })
                  }</li>
                ))
              }</ul>
            </div>
      }</div>
    )
  );
}

export default App;
