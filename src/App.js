import React from "react";
const cardScores = {
  ER: 7,
  CL: 10,
  QU: 9,
  IN: 7,
  TH: 9,
  A: 2,
  B: 8,
  C: 8,
  D: 5,
  E: 2,
  F: 6,
  G: 6,
  H: 7,
  I: 2,
  J: 13,
  K: 8,
  L: 3,
  M: 5,
  N: 5,
  O: 2,
  P: 6,
  Q: 15,
  R: 5,
  S: 3,
  T: 3,
  U: 4,
  V: 11,
  W: 10,
  X: 12,
  Y: 4,
  Z: 14,
};

const cardsRegExp = (count) =>
  new RegExp(
    `^ *${new Array(count)
      .fill(Object.keys(cardScores).join("|"))
      .map((k) => `(-?(?:${k}))`)
      .join(" *")} *$`,
    "i"
  );

const CardInput = ({ cardCount, value, onChange }) => {
  const { points, error } = React.useMemo(() => {
    const [_, ...cards] =
      cardsRegExp(cardCount).exec((value || "").toUpperCase()) || [];
    const points =
      cards.length === 0
        ? false
        : cards
            .map((c) => cardScores[c] || -cardScores[c.slice(1)])
            .reduce((n, c) => n + c, 0);
    let error = cards.join(" ");
    if (cards.length === 0) {
      const max = (value || "").length;
      const min = Math.ceil(max / 2);
      error = new Array(max - min + 1)
        .fill(min)
        .map((a, i) => a + i)
        .map((n) => cardsRegExp(n).exec((value || "").toUpperCase()))
        .find(Boolean);
      if (error) error = error.slice(1).join(" ");
    }
    // FIXME: this onChange causes warnings
    onChange({ turn: value, score: points });
    return { points, error };
  }, [value]);

  return (
    <div className="CardInput">
      <input
        value={value}
        onInput={({ target: { value } }) =>
          onChange({ turn: value, score: points })
        }
      />
      <span>{points}</span>
      <code>{error}</code>
    </div>
  );
};

// const CardInput = ({ cardCount, value, onChange }) => {
//   const handleInput = React.useCallback(({ target: { value } }) => {
//     const [_, ...cards] =
//       cardsRegExp(cardCount).exec(
//         (value.replace(/\t/g, "") || "").toUpperCase()
//       ) || [];
//     console.log({ cards });
//     const turn = cards.length ? cards.join("\t") : value;
//     onChange({ turn, score: value.length });
//   }, []);

//   return (
//     <div className="CardInput">
//       <input value={value} onInput={handleInput} />
//     </div>
//   );
// };

const emptyPlayer = () => ({
  name: "",
  turns: new Array(8).fill(""),
  scores: new Array(8).fill(""),
});

const App = () => {
  const [players, setPlayers] = React.useState([emptyPlayer()]);
  React.useEffect(() => {
    try {
      const item = localStorage.getItem("Quiddler");
      if (item) setPlayers(JSON.parse(item));
    } catch (e) {
      setPlayers([]);
    }
  }, []);
  React.useEffect(() => {
    localStorage.setItem("Quiddler", JSON.stringify(players));
  }, [players]);
  const setPlayerName = React.useCallback(
    (index, { target: { value } }) => {
      const ps = players.slice();
      ps[index].name = value;
      setPlayers(ps);
    },
    [players]
  );
  const resetPlayers = () => setPlayers([emptyPlayer()]);

  return (
    <React.Fragment>
      <h1>Quiddler Counter</h1>
      <div
        className="grid"
        style={{
          gridTemplateColumns: `1.2em repeat(${players.length}, 14em) auto`,
        }}
      >
        <div />
        {players.map((player, i) => (
          <div key={i}>
            <input
              placeholder="name"
              value={player.name}
              onChange={(e) => setPlayerName(i, e)}
              style={{ textAlign: "center" }}
            />{" "}
            {player.scores.reduce((a, b) => a + b, 0)}
          </div>
        ))}
        <div>
          <button
            onClick={() =>
              setPlayers((ps) => [...ps, { name: "", turns: [], scores: [] }])
            }
          >
            + player
          </button>
          <button onClick={resetPlayers}>reset</button>
        </div>
        {new Array(10 - 3 + 1)
          .fill()
          .map((_, x) => x + 3)
          .map((cardCount, i) => (
            <React.Fragment key={i}>
              <div>{cardCount}</div>
              {players.map((player, i) => (
                <div
                  key={i}
                  className={
                    (cardCount - 3) % players.length === i ? "dealer" : ""
                  }
                >
                  <CardInput
                    cardCount={cardCount}
                    value={player.turns[cardCount - 3] || ""}
                    onChange={({ turn, score }) =>
                      setPlayers((players) => {
                        const ps = players.slice();
                        ps[i].turns[cardCount - 3] = turn;
                        ps[i].scores[cardCount - 3] = score;
                        return ps;
                      })
                    }
                  />
                </div>
              ))}
              <div />
            </React.Fragment>
          ))}
      </div>
    </React.Fragment>
  );
};
export default App;
