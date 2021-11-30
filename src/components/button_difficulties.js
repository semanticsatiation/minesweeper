import React from "react";

function ButtonDifficulties({setMineLevel, setShowCustomForm}) {
    return (
        <>
            <h1>Select the difficulty</h1>
            <div className="level-buttons">
                <button onClick={() => setMineLevel("Beginner")}>Beginner</button>
                <button onClick={() => setMineLevel("Intermediate")}>Intermediate</button>
                <button onClick={() => setMineLevel("Expert")}>Expert</button>
                <button onClick={() => setShowCustomForm(true)}>Custom</button>
            </div>
        </>
    )
}

export default ButtonDifficulties;