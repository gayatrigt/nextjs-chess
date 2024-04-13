import Head from 'next/head';
import { useReducer } from 'react';
import Chess, { getDefaultLineup } from '../src/react-chess';
// import * as Ably from 'ably'
// import axios from 'axios';
import { Board, Piece, Pos, makeMove, move, translatePieces } from '../src/logic';

interface State {
  pieces: Piece[];
  whiteTurn: boolean;
  passant: number | undefined;
  atHand: Piece | undefined;
  validMoves: { x: number, y: number }[];
  castle: {
    [turn: number]: {}
  }
}
interface MovePiece {
  type: 'move';
  data: {
    eating: Piece;
    to: Pos;
  };
}

interface PickPiece {
  type: 'pick';
  data: {
    taking: Piece;
    from: Pos;
  };
}

type Action = PickPiece | MovePiece;

function toXY(s: string) {
  return {
    x: s.codePointAt(0) - 'a'.codePointAt(0),
    y: s.codePointAt(1) - '1'.codePointAt(0)
  }
}
function fromXY({ x, y }: { x: number, y: number }) {
  return String.fromCodePoint('a'.codePointAt(0) + x) + String.fromCharCode('1'.codePointAt(0) + y)
}


function updateState(state: State, action: Action): State {
  const board: Board = {
    pieces: state.pieces,
    passant: state.passant,
    castle: state.castle
  }

  switch (action.type) {
    case 'pick': {
      const { taking, from } = action.data
      console.log('picking', from, taking)

      const validMoves = move(from, board)

      return {
        ...state,
        atHand: taking,
        validMoves: validMoves,
      }
    }

    case 'move': {
      const { eating, to } = action.data
      console.log('moving', to, eating)

      const validMoves = move(state.atHand, board)

      // console.log("move", to, validMoves.map(m => m))

      const validAction = validMoves.find(m => m.x === to.x && m.y === to.y)
      if (!validAction) {
        console.log('invalid move')
        return state
      }

      const newBoard = makeMove(board, { from: state.atHand, dest: validAction })

      return {
        pieces: newBoard.pieces,
        whiteTurn: !state.whiteTurn,
        castle: newBoard.castle,
        passant: newBoard.passant,
        atHand: undefined,
        validMoves: [],
      };
    }
    default:
      throw new Error();
  }
}

function resetState(): State {
  return ({
    pieces: translatePieces(getDefaultLineup()),
    whiteTurn: true,
    castle: { [2]: {}, [3]: {} },
    atHand: undefined,
    passant: undefined,
    validMoves: []
  })
}

const isWhite = (group: number) => group === 2

function Demo() {
  const [state, dispatch] = useReducer(updateState, undefined, resetState)

  return (
    <div className="demo" style={{ width: 600, border: "10px solid white", background: "white" }}>
      <div style={{ color: "black", backgroundColor: "white", textAlign: "center", paddingBottom: "4px" }}> {state.whiteTurn ? 'White Plays' : 'Black Plays'}</div>

      <Chess
        pieces={state.pieces.filter(Boolean).map(p => `${p.name}@${fromXY(p)}`)}
        marks={state.validMoves}
        onClick={(pos) => {
          const piece = state.pieces[pos.x + (8 * pos.y)]
          // console.log('click', pos, piece)

          if (piece && state.whiteTurn === isWhite(piece.group)) {
            dispatch({ type: "pick", data: { from: pos, taking: piece, } })
            return true;
          }

          if (state.atHand) {
            const m = state.validMoves.find(m => m.x === pos.x && m.y === pos.y)
            if (!m) return false
            dispatch({ type: "move", data: { to: pos, eating: piece } })
          }

          return true
        }}
      />
    </div>
  )
}

export default function Home() {
  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
        {/* <meta charset="utf-8" /> */}
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>ajedrez</title>
      </Head>
      <main style={{
        display: "flex",
        placeContent: 'center',
        placeItems: "center",
        height: "100vh",
        width: "100vw",
        margin: 0,
        background: '#000'
      }}>
        <Demo />
      </main>
      {/* <button onClick={async () => {
        await axios.post('http://localhost:3001/login', { user: 'seba', password: 'sebasjm' }, { withCredentials: true })

        const client = new Ably.Realtime({
          authCallback: async (params, cb) => {
            const { data: channel } = await axios.post('http://localhost:3001/channel', {}, { withCredentials: true })
            console.log("refresh token", channel.token)
            cb(null, channel.token)
          }
        });
        handler.client = client

      }}>login</button>

      <button onClick={async () => {
        const channel = handler.client.channels.get('bin-eye-pal');
        channel.subscribe(function (message) {
          console.log("Received: " + message);
        });
      }}>suscribe</button>
      <button onClick={async () => {
        const channel = handler.client.channels.get('bin-eye-pal');
        channel.publish("example", "message data");
      }}>message</button> */}
    </div>
  )
}
