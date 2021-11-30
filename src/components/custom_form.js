import React from "react";

function CustomForm({ setcustomLevel, setShowCustomForm, setMineLevel, custom}) {
    return (
        <>
            <h1>Set Custom Board:</h1>
            <div className="custom-form">
                <div>
                    <label htmlFor="height">Height:</label>
                    <input type="number" min="2" max="80" onChange={e => setcustomLevel(e, 0)} value={custom[0]} />
                    <label htmlFor="width">Width:</label>
                    <input type="number" min="2" max="80" onChange={e => setcustomLevel(e, 1)} value={custom[1]} />
                    <label htmlFor="bombs">Bombs:</label>
                    <input type="number" min="1" onChange={e => setcustomLevel(e, 2)} value={custom[2]} />
                </div>
                <button onClick={() => {setMineLevel("Custom"); setShowCustomForm(false)}}>Confirm</button>
                <button onClick={() => setShowCustomForm(false)}>Back</button>
            </div>
        </>
    )
}

export default CustomForm;