import BlackKnight from "../pieces/BlackKnight"

export const findPieceAtPosition = ({ pieces, pos }) => {
  for (let i = 0; i < pieces.length; i++) {
    const piece = pieces[i]
    if (piece.indexOf(pos) === 2) {
      return { notation: piece, name: piece.slice(0, 1), index: i, position: pos }
    }
  }

  return null
}

type F = (move:Delta) => (pos:Piece, board: Board) => IsMoveValid

type D = (pos:Piece, board: Board) => IsMoveValid

//TODO: this could be better, like validAnd
const validOr = (cond1:F, cond2:F) => (move:Delta) => (pos:Piece, board: Board):IsMoveValid => {
  const xy1 = cond1(move)(pos,board)
  return xy1 ? xy1 : cond2(move)(pos,board)
}

const validAnd = (cond1:D, cond2:F) => (pos:Piece, board: Board):IsMoveValid => {
  const p = cond1(pos,board)
  if (!p) return null
  return cond2(p[0])(p[1],board)
}

const validTrue:F = (move:Delta) => (pos, board):IsMoveValid=> ([move,pos,board] as any)
const validFalse:D = (pos, board)=> (null as any)

const validAll = (...conds:D[]) => (pos:Piece, board: Board):IsMoveValid => {
  return conds.reduce((prev,val) => !prev(pos,board)? validFalse : val, conds[0])(pos,board)
}

// for the pawn
const validIfEnemy = (move:Delta) => (pos:Piece, board: Board):IsMoveValid => {
  const [x,y] = move
  const piece = board.pieces[pos.x+x+(pos.y+y)*8]
  return piece && piece.foe ? [move,pos,board] : null
}

// for the bishop, rogue, queen
const validIfEmpty = (move:Delta) => (pos:Piece, board: Board):IsMoveValid => {
  const [x,y] = move
  const piece = board.pieces[pos.x+x+(pos.y+y)*8]
  return !piece ? [move,pos,board] : null
}

const validIfEmptyAndRank1 = (move:Delta) => (pos:Piece, board: Board):IsMoveValid => {
  const [x,y] = move
  const piece = board.pieces[pos.x+x+(pos.y+y)*8]
  return !piece && pos.y === 1 ? [move,pos,board] : null
}

// for the pawn
const validIfPassant = (move:Delta) => (pos:Piece, board: Board):IsMoveValid => {
  const [x,y] = move
  if (board.passant !== pos.x+x) return null
  const piece = board.pieces[pos.x+x+(pos.y+y-1)*8]
  const isEnemy = piece && piece.foe

  return isEnemy ? [move,pos,board] : null
}

export const orderPieces = <T extends Pos>(pieces:T[]):T[] => {
  const emptyBoard = Array(8*8);
  pieces.forEach(p => {
    if (p) emptyBoard[p.x+p.y*8] = p
  })
  return emptyBoard
}

const asEnemyPieces = (pieces:Piece[]):Piece[] => {
  const emptyBoard = Array(8*8);
  pieces.forEach(p => {
    if (p) emptyBoard[p.x+(7-p.y)*8] = {
          x: p.x,
          y: 7-p.y,
          type: p.type,
          foe: !p.foe
    }
  })
  return emptyBoard
}

const validIfKingSafe = (move:Delta) => (piece:Piece, board: Board):IsMoveValid => {
  const orig = piece
  const dest = {x:piece.x + move[0], y:piece.y + move[1]}
  const king = piece.type == PieceType.King ? dest : board.pieces.find(p => p && !p.foe && p.type === PieceType.King)
  if (!king) return [move,piece,board] // we are safe if there is no king in the board

  const enemyBoard:Board = {
    pieces: asEnemyPieces(board.pieces),
  }
  enemyBoard.pieces[orig.x+(7-orig.y)*8] = null
  enemyBoard.pieces[dest.x+(7-dest.y)*8] = {
    x: dest.x,
    y: 7-dest.y,
    type: piece.type,
    foe: true
  }
  
  const foes = enemyBoard.pieces.filter( p => p && !p.foe )
  const safe = !foes.find( foe => {
    const attackOfFoe = orderPieces(threatsByType[foe.type](foe,enemyBoard))
    const check = !!attackOfFoe[king.x+(7-king.y)*8]
    return check
  } )

  return safe ? [move,piece,board] : null
}

const validIfShortCastle = (move:Delta) => (pos:Piece, board: Board):IsMoveValid => {
  // history ok?
  if (board.castle?.didMoveKing || board.castle?.didMoveShortTower) return null

  // pieces in place?
  const king  = board.pieces[4+0*8]
  const path5 = board.pieces[5+0*8]
  const path6 = board.pieces[6+0*8]
  const tower = board.pieces[7+0*8]

  if (!tower || tower.type != PieceType.Rook 
    || path5 || path6 
    || !king || king.type != PieceType.King) return null

  // path is safe?
  const enemyBoard:Board = {
    pieces: asEnemyPieces(board.pieces),
  }
  
  const foes = enemyBoard.pieces.filter( p => !p.foe )
  const pathSafe = !foes.find( foe => {
    const attackOfFoe = orderPieces(threatsByType[foe.type](foe,enemyBoard))
    const celd5 = !!attackOfFoe[5+7*8]
    const celd6 = !!attackOfFoe[6+7*8]
    return celd5 && celd6
  } )

  return pathSafe ? [move,pos,board] : null
}

const validIfLongCastle = (move:Delta) => (pos:Piece, board: Board):IsMoveValid => {
  if (board.castle?.didMoveKing || board.castle?.didMoveLongTower) return null
  const tower = board.pieces[0+0*8]
  const path1 = board.pieces[1+0*8]
  const path2 = board.pieces[2+0*8]
  const path3 = board.pieces[3+0*8]
  const king  = board.pieces[4+0*8]

  if (!tower || tower.type != PieceType.Rook 
    || path1 || path2 || path3 
    || !king || king.type != PieceType.King) return null
  
  const enemyBoard:Board = {
    pieces: asEnemyPieces(board.pieces),
  }

  const foes = enemyBoard.pieces.filter( p => !p.foe )

  const pathSafe = !foes.find( foe => {
    const attackOfFoe = orderPieces(threatsByType[foe.type](foe,enemyBoard))
    const celd1 = !!attackOfFoe[1+7*8]
    const celd2 = !!attackOfFoe[1+7*8]
    const celd3 = !!attackOfFoe[1+7*8]
    return celd1 || celd2 || celd3
  } )

  return pathSafe ? [move,pos,board] : null
}

const validIfInside = (move:Delta) => (pos:Piece, board: Board):IsMoveValid => {
  const x = pos.x + move[0]
  const y = pos.y + move[1]
  return x <= 7 && x >= 0 && y <= 7 && y >= 0 ? [move,pos,board] : null
}

const validIfNoFriend = (move:Delta) => (pos:Piece, board: Board):IsMoveValid =>  {
  const [x,y] = move
  const piece = board.pieces[pos.x+x+(pos.y+y)*8]
  const isFriend = piece && !piece.foe
  return !isFriend ? [move,pos,board] : null
}

type IsMoveValid = [move:Delta, pos:Piece, board: Board] | null
type Delta = [x:number,y:number]

interface Pos {
  x: number,
  y: number,
}

export enum PieceType {
  Pawn, Knigth, Rook, Bishop, Queen, King
}

export interface Piece {
  x: number, 
  y: number, 
  foe?: boolean,
  type: PieceType
}
export interface Board {
  pieces: Piece[];// pieces on board
  passant?: number; //did foe an en'passant on last move?
  castle?: {
    didMoveKing?: boolean; //is still posible to castle?
    didMoveShortTower?: boolean; //is still posible to castle?
    didMoveLongTower?: boolean; //is still posible to castle?
  };
}

const arraySizeSeven = [0,1,2,3,4,5,6]
const expandStepToPath = (v,i,a) => [...a].reverse().slice(-i-1).reverse()
const checkValidInTheMiddle = (validator:F) => x => x.slice(0,-1).map( x => validator(x) ).concat(validTrue(x[x.length-1])) 

const sevenWithClearPath = (direction: (i:number) => Delta) :D[] => 
  arraySizeSeven.map(direction)
    .map(expandStepToPath)
    .map(checkValidInTheMiddle(validIfEmpty))
    .map(x => x.reduce( (p,c) => validAll(p,c) ) )

const buildValidator = (type: PieceType, moveValidators: D[]) => (pos:Piece, board:Board):Pos[] => 
  moveValidators
    .map( v => v({...pos, type}, board))
    .filter(Boolean)
    .map( r => ({
      x: r[1].x + r[0][0],
      y: r[1].y + r[0][1],
    }))


const pawnMoves = [
    validIfEmpty([0,1]),
    validOr(validIfPassant, validIfEnemy)([1,1]),
    validOr(validIfPassant, validIfEnemy)([-1,1]),
    validAll(validIfEmpty([0,1]), validIfEmptyAndRank1([0,2])),
  ]
 .map(x => validAnd(x,validIfNoFriend))
 .map(x => validAnd(x,validIfInside));

const pawnMovesWithKingSafe = pawnMoves.map(x => validAnd(x,validIfKingSafe))

const knigthMoves = ([
    [+1,+2],
    [+1,-2],
    [-1,+2],
    [-1,-2],
    [+2,+1],
    [+2,-1],
    [-2,+1],
    [-2,-1],
  ] as Delta[])
 .map(x => validIfNoFriend(x))
 .map(x => validAnd(x,validIfInside))

const knigthMovesWithKingSafe = knigthMoves.map(x => validAnd(x,validIfKingSafe))

const rookMoves = [
    ...sevenWithClearPath( i => [   0, i+1]),
    ...sevenWithClearPath( i => [ i+1,   0]),
    ...sevenWithClearPath( i => [-i-1,   0]),
    ...sevenWithClearPath( i => [   0,-i-1]),
  ]
    .map(x => validAnd(x,validIfNoFriend))
    .map(x => validAnd(x,validIfInside))

const rookMovesWithKingSafe = rookMoves.map(x => validAnd(x,validIfKingSafe))

const bishopMoves = [
  ...sevenWithClearPath( i => [ i+1, i+1]),
  ...sevenWithClearPath( i => [ i+1,-i-1]),
  ...sevenWithClearPath( i => [-i-1, i+1]),
  ...sevenWithClearPath( i => [-i-1,-i-1]),
  ]
  .map(x => validAnd(x,validIfNoFriend))
  .map(x => validAnd(x,validIfInside))

const bishopMovesWithKingSafe = bishopMoves.map(x => validAnd(x,validIfKingSafe))

const queenMoves = [...rookMoves, ...bishopMoves]

const queenMovesWithKingSafe = queenMoves.map(x => validAnd(x,validIfKingSafe))

const kingMoves = ([
    [+1,+1],
    [+1, 0],
    [+1,-1],
    [ 0,-1],
    [-1,-1],
    [-1, 0],
    [-1,+1],
    [ 0,+1],
  ] as Delta[])
  .map(x => validIfNoFriend(x))
  .map(x => validAnd(x,validIfInside))

const kingMovesWithKingSafe = kingMoves
  .concat( validIfLongCastle([-2,0]) )
  .concat( validIfShortCastle([2,0]) )
  .map(x => validAnd(x,validIfKingSafe))

export const moves: {[k:string]: ((pos:Pos, board:Board) => Pos[])} = {
  p: buildValidator(PieceType.Pawn, pawnMovesWithKingSafe),
  n: buildValidator(PieceType.Knigth, knigthMovesWithKingSafe),
  r: buildValidator(PieceType.Rook, rookMovesWithKingSafe),
  b: buildValidator(PieceType.Bishop, bishopMovesWithKingSafe),
  q: buildValidator(PieceType.Queen, queenMovesWithKingSafe),
  k: buildValidator(PieceType.King, kingMovesWithKingSafe),
}

export const threats: {[k:string]: ((pos:Pos, board:Board) => Pos[])} = {
  p: buildValidator(PieceType.Pawn, pawnMoves),
  n: buildValidator(PieceType.Knigth, knigthMoves),
  r: buildValidator(PieceType.Rook, rookMoves),
  b: buildValidator(PieceType.Bishop, bishopMoves),
  q: buildValidator(PieceType.Queen, queenMoves),
  k: buildValidator(PieceType.King, kingMoves),
}

export const swap = ({x,y}:{x:number,y:number}, swap: boolean) => ({x,y: swap ? y : 7-y})

const threatsByType = [
  threats.p,
  threats.n,
  threats.r,
  threats.b,
  threats.q,
  threats.k,
]

export const pieceTypeByName = (str:string) => {
  switch (str.toLowerCase()) {
    case 'b': return PieceType.Bishop;
    case 'k': return PieceType.King;
    case 'n': return PieceType.Knigth;
    case 'r': return PieceType.Rook;
    case 'q': return PieceType.Queen;
    case 'p': return PieceType.Pawn;
    default: null
  }
}

