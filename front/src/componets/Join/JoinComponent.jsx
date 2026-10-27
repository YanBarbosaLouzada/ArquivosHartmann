import React, { useRef } from "react";
import { io } from "socket.io-client"
import "./JoinComponent.css"

// Deixa cada letra do título levemente torta (sempre igual, não muda a cada render)
const wobble = (i) => {
    const rot = ((i * 37) % 13) - 6;
    const ty = ((i * 53) % 9) - 4;
    return `rotate(${rot}deg) translateY(${ty}px)`;
};

export default function JoinComponent({ setChatVisibility, setSocket }) {
    const usernameRef = useRef(null);

    const handleSubmit = async () => {
        const username = usernameRef.current?.value.trim();
        if (!username) {
            return
        }
        const socket = io("http://localhost:8080/")
        socket.emit("set_username", username);
        setSocket(socket);
        setChatVisibility(true);
    }

    return (
        <div className="jn-root">
            {/* Tarja de cores no topo */}
            <div className="jn-bar" aria-hidden="true">
                <span /><span /><span /><span /><span />
            </div>

            <div className="jn-body">
                {/* Título torto, na fonte do site */}
                <h1 className="jn-title">
                    {"ENTRAR".split("").map((letra, i) => (
                        <span
                            className="jn-title__letter"
                            key={i}
                            style={{ transform: wobble(i) }}
                        >
                            {letra}
                        </span>
                    ))}
                </h1>

                <p className="jn-sub">identifique-se para acessar os registros</p>

                <label className="jn-label" htmlFor="jn-username">
                    seu nome
                </label>
                <input
                    id="jn-username"
                    ref={usernameRef}
                    className="jn-input"
                    type="text"
                    maxLength={24}
                    placeholder="como devemos te chamar?"
                    autoComplete="off"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSubmit();
                    }}
                    autoFocus
                />

                <button className="jn-button" onClick={handleSubmit}>
                    Entrar
                </button>
            </div>
        </div>
    )
}
