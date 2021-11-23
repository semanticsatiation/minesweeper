import './reset.css';

import './App.css';
import React, { useEffect, useState } from "react";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBomb, faDotCircle, faFlag } from '@fortawesome/free-solid-svg-icons';

const levelOptions = {
  Beginner: [8, 8, 10],
  Intermediate: [16, 16, 40],
  Expert: [30, 16, 99]
}

function App() {
  const [level, setLevel] = useState(null);

  const [board, setDimensions] = useState([0, 0, 0]);

  const [keyState, setKeyState] = useState("r")

  const [gameState, setGameState] = useState(null); // "win" or "lose"; null means game is still going. 

  const [tiles, setTiles] = useState({
    bombs: new Set([]),
    flagged: new Set([]),
    revealed: new Set([])
  });

  useEffect(() => {
    if (level !== null) {
      setDimensions(levelOptions[level]);
    }
  }, [level])

  useEffect(() => {
    if (gameState !== null) {
      revealBoard();
    }
  }, [gameState])

  useEffect(() => {
    window.addEventListener("keydown", setAction);
  })

  const revealBoard = () => {

  }

  const setAction = ({key}) => {
    let lowerKey = key.toLowerCase();

    if (["r", "f"].includes(lowerKey)) {
      setKeyState(lowerKey);
    }
  }

  const setTile = (index) => {
    if ((tiles.revealed.has(index) && keyState === "f") || (tiles.flagged.has(index) && keyState === "r")) {
      return;
    }

    if (tiles.flagged.has(index)) {
      setTiles({
        ...tiles,
        flagged: new Set([...tiles.flagged].filter(flagInd => flagInd !== index))
      });

      return;
    }

    // this is where we do the claculations for revelaing surrounding tiles
    if (tiles.bombs.has(index)) {
      setGameState("lose");
    } else if ((tiles.revealed.size + 1) === ((board[0] * board[1]) - board[2])) {
      setGameState("win");
    } else if (!tiles.revealed.has(index) || !tiles.flagged.has(index)) {
      if (keyState === "r") {
        setTiles({
          ...tiles,
          revealed: tiles.revealed.add(index)
        })
      } else {
        setTiles({
          ...tiles,
          flagged: tiles.flagged.add(index)
        })
      }
    }
  }

  const renderTile = (index) => {
    const {bombs, flagged, revealed} = tiles;

    if (bombs.has(index)) {
      console.log("1st");
      return (
        <FontAwesomeIcon icon={faBomb} />
      )
    } else if (flagged.has(index)) {
      console.log("2nd");
      return (
        <FontAwesomeIcon icon={faFlag} />
      )
    } else if (revealed.has(index)) {
      console.log("3rd");
      return(
        "1"
      )
    } else {
      console.log("4th");
      <FontAwesomeIcon icon={faDotCircle} />
    }
  }

  return (
    <div className="App">{
      level === null ? (
        <div className="intro">
          <h1>Select the difficulty</h1>
          <button onClick={() => setLevel("Beginner")}>Beginner</button>
          <button onClick={() => setLevel("Intermediate")}>Intermediate</button>
          <button onClick={() => setLevel("Expert")}>Expert</button>
        </div>
      ) : (
        <ul className="grid">{
          [...Array(board[0])].map((row, ri) => (
            <li className="row" key={ri}>{
                [...Array(board[1])].map((col, ci) => {
                  const index = (ri * board[1]) + ci;

                  return(
                    <button className={`${tiles.revealed.has(index) ? ("reveal") : ("")} mine`} key={ci} onClick={() => setTile(index)}>{
                      renderTile(index)
                    }</button>
                  )
                })
            }</li>
          ))
        }</ul>
      )
    }</div>
  );
}

export default App;
