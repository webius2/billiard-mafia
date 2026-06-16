import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { Home } from './pages/Home'
import { Rules } from './pages/Rules'
import { Setup } from './pages/Setup'
import { Game } from './pages/Game'
import { Round } from './pages/Round'
import { Result } from './pages/Result'
import { useGameStore } from './store/gameStore'
import { loadGame } from './utils/storage'

function App() {
  const setGame = useGameStore((state) => state.setGame)

  // Load game from localStorage on mount
  useEffect(() => {
    const savedGame = loadGame()
    if (savedGame) {
      setGame(savedGame)
    }
  }, [setGame])

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="/game" element={<Game />} />
            <Route path="/round" element={<Round />} />
            <Route path="/result" element={<Result />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
