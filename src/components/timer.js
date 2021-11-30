import React, { useEffect, useState } from "react";

function Timer(props) {
    const [time, setTime] = useState(0);

    useEffect(() => {
        const startTime = new Date();

        // get seconds 
        const interval = setInterval(() => {
            let timeDiff = new Date() - startTime; //in ms

            timeDiff /= 1000;

            if (timeDiff >= 1000 || props.gameState !== null) {
                clearInterval(interval);
            } else {
                setTime(Math.round(timeDiff));   
            }
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, [props.gameState]);

    return (
        <div className="timer">{time}</div>
    )
}

export default Timer;