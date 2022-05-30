
const App = board => () => {


  return (<>
    <vchessboard>
     <pieses>
       <For each={board.pieses}>{ (piese, i) =>
         <piese class={piese.klass} style={piese.style}/>
       }</For>
     </pieses>
    </vchessboard>
      </>)

}

export default App
