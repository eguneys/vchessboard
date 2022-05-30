import { ticks } from './shared'
import { onCleanup, mapArray, createSignal, createMemo, createEffect } from 'solid-js'
import { make_array, make_position } from './make_util'
import { loop_for, read, write, owrite } from './play'

type Pos = string
type Piece = string
type Piese = string

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const ranks = ['1', '2', '3', '4', '5', '6', '7', '8']
const roles = ['k', 'q', 'r', 'b', 'n', 'p']

const poss = files.flatMap(file => ranks.map(rank => file + rank))

function square_pp(square: Square) {
  return square.split('@')
}

function make_piese(piece: Piece, pos: Pos) {
  return [piece, pos].join('@')
}

function piese_pp(piese: Piese) {
  return piese.split('@')
}

function pos_vs(pos: Pos) {
  return [files.indexOf(pos[0]), 7-ranks.indexOf(pos[1])]
}


function make_pos_style(_pos: Position) {
  return {
    transform: `translate(calc(100% * ${_pos.x}), calc(100% * ${_pos.y}))`
  }
}

export class Board {

  get pieses() {
    return this.a_board.pieses
  }

  set pieses(pieses: Array<Piese>) {
    this.a_board.pieses = pieses
  }

  get squares() {
    return this.a_squares.squares
  }

  set squares(squares: Array<Square>) {
    this.a_squares.squares = squares
  }

  get empties() {
    return this.a_empties()
  }

  constructor() {
    this.a_board = make_board(this)
    this.a_squares = make_squares(this)
  }

}

function make_squares(board: Board) {

  let _squares = createSignal()
  let m_squares = createMemo(mapArray(_squares[0], _ => make_square(board, _)))

  return {
    get squares() {
      return m_squares()
    },
    set squares(squares: Array<Square>) {
      owrite(_squares, squares)
    }
  }
}

function make_square(board: Board, square: Square) {

  let [color, pos] = square_pp(square)
  let _pos = make_position(...pos_vs(pos))

  let m_style = createMemo(() => make_pos_style(_pos))

  let m_klass = createMemo(() => [
    color
  ].join(' '))

  return {
    get klass() {
      return m_klass()
    },
    get style() {
      return m_style()
    }
  }
}

function make_board(board: Board) {

  let a_pieses = createSignal()

  let _m_poss_by_piece = createMemo(mapArray(a_pieses[0], piese_pp))
  let _m_pieces = createMemo(() => _m_poss_by_piece().map(_ => _[0]))

  let m_pieses = createMemo(() => {
    let _poss_by_piece = _m_poss_by_piece()
    return mapArray(_m_pieces, _ => make_piece(board, ..._poss_by_piece.find(_a => _a[0] === _)))()
  })

  let released_positions = new Map<Piece, Array<Pos>>()

  createEffect(() => {
    let pieces = m_pieses()
    let cancel = loop_for(ticks.half, (dt, dt0, i) => {
      pieces.forEach(_ => _.settle_loop(dt, dt0, i))
    })
    onCleanup(() => {
      cancel()
    })
  })

  return {
    acquire_pos(piece: Piece) {
      let _ = released_positions.get(piece)
      if (_ && _.length > 0) {
        return _.pop()
      } else {
        return make_position(-1, 3.5)
      }
    },
    release_pos(piece: Piece, pos: Position) {
      let res = released_positions.get(piece)

      if (!res) {
        res = []
        released_positions.set(piece, res)
      }
      res.push(pos)
    },
    set pieses(pieses: Array<Piese>) {
      owrite(a_pieses, pieses)
    },
    get pieses() {
      return m_pieses()
    }
  }
}

const color_klasses = { w: 'white', b: 'black' }
const role_klasses = { b: 'bishop', 'n': 'knight', 'k': 'king', 'q': 'queen', 'r': 'rook', 'p': 'pawn' }
function make_piece(board: Board, piece: Piece, pos: Pos) {

  let v_pos = pos_vs(pos)

  let _pos = board.a_board.acquire_pos(piece)

  onCleanup(() => {
    board.a_board.release_pos(piece, _pos)
  })

  const m_color_klass = color_klasses[piece[0]]
  const m_role_klass = role_klasses[piece[1]]
  const m_klass = createMemo(() => [m_color_klass, m_role_klass].join(' '))

  const m_style = createMemo(() => make_pos_style(_pos))

  return {
    settle_loop(dt, dt0, i) {
      _pos.lerp(v_pos[0], v_pos[1], i)
    },
    get style() {
      return m_style()
    },
    get klass() {
      return m_klass()
    }
  }
}
