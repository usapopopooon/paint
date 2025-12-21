import { useState } from 'react'
import { Button } from './components/ui/button'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="dark min-h-screen bg-background flex flex-col items-center justify-center gap-8">
      <h1 className="text-4xl font-bold text-foreground">Paint</h1>
      <Button onClick={() => setCount((count) => count + 1)}>
        count is {count}
      </Button>
    </div>
  )
}

export default App
