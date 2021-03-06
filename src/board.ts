import { ticks } from './shared'
import { on, onCleanup, mapArray, createSignal, createMemo, createEffect } from 'solid-js'
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

const i_vpos_vs = (instant_v_pos: string) => {
  return Vec2.make(...instant_v_pos.split(';').map(_ => parseFloat(_)))
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

  let [color, pos] = square.split('@')
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


  let _instant_track = createSignal()

  let _pieses = createSignal()

  let free = [...Array(64).keys()].map(_ => make_position(-8, -8))
  let sticky_pos = make_sticky_pos(free)

  let m_pieses = createMemo(mapArray(() => read(_pieses)?.map(_ => [board.orientation, _]), ([orientation, _], i) => {
    let [piece, pos] = _.split('@')

    let v_pos = chess_pos_vs(pos)
    if (orientation === 'w') {
      v_pos.y = 7 - v_pos.y
    }
    let __instant_track = read(_instant_track)
    let [instant_pos, instant_v_pos] = __instant_track?.split('@') || []
    let instant_track = instant_pos === pos

    let _p = sticky_pos.acquire_pos(piece, Vec2.make(v_pos.x, v_pos.y), !!instant_track)


    if (instant_track) {
      _p.vs = i_vpos_vs(instant_v_pos)
    }
    let res = make_piece(board, _, v_pos, _p)


    onCleanup(() => {
      sticky_pos.release_pos(piece, _p)
    })
    return res
  }))

  createEffect(on(m_pieses, () => {
    sticky_pos.reset_fix_all()
  }))

  return {
    set instant_track(i_track: ITrack) {
      owrite(_instant_track, i_track)
    },
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

  const m_color_klass = color_klasses[piece[0]]
  const m_role_klass = role_klasses[piece[1]]
  const m_klass = createMemo(() => [m_color_klass, m_role_klass].join(' '))

  const m_style = createMemo(() => make_pos_style(_pos))

  createEffect(() => {
    let _pos0 = _pos.clone
    let _v_pos = v_pos

    let cancel = loop_for(ticks.half, (dt, dt0, _it) => {
      _pos.lerp_from0(_pos0, _v_pos, 0.1 + _it * 0.9)
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
