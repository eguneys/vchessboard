import { ticks } from './shared'
import { onCleanup, mapArray, createSignal, createMemo, createEffect } from 'solid-js'
import { make_array, make_position } from './make_util'
import { loop_for, read, write, owrite } from './play'
import { make_sticky_pos } from './make_sticky'
import { Vec2 } from 'soli2d'

type Pos = string
type Piece = string
type Piese = string

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const ranks = ['1', '2', '3', '4', '5', '6', '7', '8']
const roles = ['k', 'q', 'r', 'b', 'n', 'p']
const colors = ['w', 'b']

const poss = files.flatMap(file => ranks.map(rank => file + rank))

const pieces = colors.flatMap(color => roles.map(role => color + role))

const pieses = poss.flatMap(pos => pieces.map(piece => [piece, pos].join('@')))

const chess_pos_vs = pos => 
Vec2.make(files.indexOf(pos[0]), ranks.indexOf(pos[1]))


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

  get ranks() {
    return this.m_ranks()
  }

  get orientation() {
    return read(this._orientation)
  }

  set orientation(color: Color) {
    return owrite(this._orientation, color)
  }

  constructor() {
    this._orientation = createSignal('w')
    this.m_ranks = createMemo(() => read(this._orientation) === 'b' ? ranks : ranks.slice(0).reverse())

    this.a_board = make_board(this)
    this.a_squares = make_squares(this)
  }

}

function make_squares(board: Board) {

  let _squares = createSignal()
  let m_squares = createMemo(mapArray(() => read(_squares)?.map(_ => [board.orientation, _]), ([orientation, _]) => {

    let [klass, pos] = _.split('@')

    let v_pos = chess_pos_vs(pos)
    if (orientation === 'w') {
      v_pos.y = 7 - v_pos.y
    }

    return make_square(board, _, v_pos)
  }))

  return {
    get squares() {
      return m_squares()
    },
    set squares(squares: Array<Square>) {
      owrite(_squares, squares)
    }
  }
}

function make_square(board: Board, square: Square, v_pos: Vec2) {

  let [color, pos] = square_pp(square)
  let _pos = make_position(v_pos.x, v_pos.y)

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

  let _pieses = createSignal()

  let sticky_pos = make_sticky_pos((p: OPiese, v: Vec2) => make_position(v.x, v.y))
  pieces.forEach(_ => poss.forEach(() => sticky_pos.release_pos(_, make_position(-8, -8))))

  let m_pieses = createMemo(mapArray(() => read(_pieses)?.map(_ => [board.orientation, _]), ([orientation, _]) => {
    let [piece, pos] = _.split('@')

    let v_pos = chess_pos_vs(pos)
    if (orientation === 'w') {
      v_pos.y = 7 - v_pos.y
    }
    let instant_track = pos.includes('~')
    let _p = sticky_pos.acquire_pos(piece, Vec2.make(v_pos.x, v_pos.y), instant_track)
    

    let res = make_piece(board, _, v_pos, _p)


    onCleanup(() => {
      sticky_pos.release_pos(piece, _p)
    })
    return res
  }))

  return {
    set pieses(pieses: Array<Piese>) {
      owrite(_pieses, pieses)
    },
    get pieses() {
      return m_pieses()
    }
  }
}

const color_klasses = { w: 'white', b: 'black' }
const role_klasses = { b: 'bishop', 'n': 'knight', 'k': 'king', 'q': 'queen', 'r': 'rook', 'p': 'pawn' }
function make_piece(board: Board, piece: Piece, v_pos, _pos: Pos) {

  let _pos0 = _pos.clone
  const m_color_klass = color_klasses[piece[0]]
  const m_role_klass = role_klasses[piece[1]]
  const m_klass = createMemo(() => [m_color_klass, m_role_klass].join(' '))

  const m_style = createMemo(() => make_pos_style(_pos))

  createEffect(() => {
    let cancel = loop_for(ticks.thirds, (dt, dt0, _it) => {
      _pos.lerp_from0(_pos0, v_pos, 0.2 + _it * 0.8)
    })
    onCleanup(() => {
      cancel()
    })
  })



  return {
    get style() {
      return m_style()
    },
    get klass() {
      return m_klass()
    }
  }
}
