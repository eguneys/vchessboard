import './index.css'
import './theme.css'
//import '../assets/companion.css'
import '../assets/tatiana.css'
import { render } from 'solid-js/web'

import App from './view'

import { Board } from './board'

export default function VChessboard(element: HTMLElement, options = {}) {

  let board = new Board()
  render(App(board), element)

  return {
    get pieses() {
      return board.pieses
    },
    set pieses(pieses: Array<Piese>) {
      board.pieses = pieses
    },
    set squares(squares: Array<Square>) {
      board.squares = squares
    },
    set orientation(color: Color) {
      board.orientation = color
    },
    set instant_track(i_track: ITrack) {
      board.a_board.instant_track = i_track
    }
  }
}
