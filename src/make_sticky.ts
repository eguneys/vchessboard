import { on, createEffect, createSignal, createMemo } from 'solid-js'
import { read, write, owrite } from './play'
import { Vec2 } from 'soli2d'

export function make_sticky_pos<Item>(make_position: (item: Item, v: Vec2) => Pos, f_reset: (_: Pos) => void) {

  let released_positions = new Map<Item, Array<Pos>>()

  let immediate


  function release_immediate(_p: Pos) {
    immediate = _p
  }

  function acquire_pos(item: Item, v: Vec2, instant_track: boolean = false) {
    if (immediate) {
      let res = immediate
      immediate = undefined
      return res
    }
    let _ = released_positions.get(item)
    if (!instant_track && _ && _.length > 0) {
      _.sort((a, b) => b.vs.distance(v) - a.vs.distance(v))
      return _.pop()
    } else {
      return make_position(item, v)
    }
  }

  return {
    reset_fix_all() {
      for (let poss of released_positions.values()) {
        poss.forEach(f_reset)
      }
    },
    release_immediate,
    acquire_pos,
    release_pos(item: Item, pos: Position) {
      let res = released_positions.get(item)
      if (!res) {
        res = []
        released_positions.set(item, res)
      }
      res.push(pos)
    },
  }
}
