import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { calculateTeamPoints } from '../utils/gameLogic'
import { saveGame } from '../utils/storage'

export const Game = () => {
  const navigate = useNavigate()
  const game = useGameStore((state) => state.state.game)
  const updateGame = useGameStore((state) => state.updateGame)

  const [showRoundModal, setShowRoundModal] = useState(false)

  useEffect(() => {
    if (!game) {
      navigate('/')
    }
  }, [game, navigate])

  if (!game) return null

  const redPoints = calculateTeamPoints(game, 'red')
  const blackPoints = calculateTeamPoints(game, 'black')

  const handleNextRound = () => {
    navigate('/round')
  }

  const handleEndGame = () => {
    const updatedGame = { ...game, finished: true }
    updateGame(updatedGame)
    saveGame(updatedGame)
    navigate('/result')
  }

  return (
    <div className="min-h-screen bg-gang-black py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gang-gold mb-2">{game.name}</h1>
          <p className="text-2xl text-gray-300">Round {game.round}</p>
        </div>

        {/* Team Points */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Red Team */}
          <div className="bg-red-900 bg-opacity-30 border-2 border-red-500 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-red-400 mb-4">レッドチーム</h2>
            <div className="text-4xl font-bold text-gang-gold mb-4">{redPoints} ポイント</div>
            <div className="space-y-2">
              {game.redTeam.map((player) => (
                <div key={player.id} className="text-sm text-gray-300">
                  <span>{player.name}</span>
                  <span className="ml-2">W:{player.wins} L:{player.losses}</span>
                  <span className="ml-2 text-blue-300">({player.appearancesLeft})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Black Team */}
          <div className="bg-blue-900 bg-opacity-30 border-2 border-blue-500 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-blue-400 mb-4">ブラックチーム</h2>
            <div className="text-4xl font-bold text-gang-gold mb-4">{blackPoints} ポイント</div>
            <div className="space-y-2">
              {game.blackTeam.map((player) => (
                <div key={player.id} className="text-sm text-gray-300">
                  <span>{player.name}</span>
                  <span className="ml-2">W:{player.wins} L:{player.losses}</span>
                  <span className="ml-2 text-blue-300">({player.appearancesLeft})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Territory Map */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gang-gold mb-4">縄張り状況</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {game.territories.map((territory) => (
              <div
                key={territory.id}
                className={`p-4 rounded-lg border-2 text-center ${
                  territory.owner === 'red'
                    ? 'bg-red-900 bg-opacity-30 border-red-500'
                    : territory.owner === 'black'
                    ? 'bg-blue-900 bg-opacity-30 border-blue-500'
                    : 'bg-gang-dark-gray border-gray-600'
                }`}
              >
                <h3 className="text-lg font-bold text-gang-gold mb-2">{territory.name}</h3>
                <p className="text-2xl font-bold text-gang-gold mb-2">{territory.points}pt</p>
                <p className="text-sm text-gray-300">
                  {territory.owner === 'red'
                    ? 'レッド'
                    : territory.owner === 'black'
                    ? 'ブラック'
                    : '中立'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Match History */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gang-gold mb-4">試合履歴</h2>
          <div className="bg-gang-dark-gray rounded-lg p-6 max-h-80 overflow-y-auto">
            {game.history.length === 0 ? (
              <p className="text-gray-400 text-center">まだ試合がありません</p>
            ) : (
              <div className="space-y-3">
                {[...game.history].reverse().map((record, index) => {
                  const attacker = [...game.redTeam, ...game.blackTeam].find(
                    (p) => p.id === record.attacker
                  )
                  const defender = [...game.redTeam, ...game.blackTeam].find(
                    (p) => p.id === record.defender
                  )
                  const territory = game.territories.find((t) => t.id === record.territory)

                  return (
                    <div
                      key={index}
                      className="border-l-4 border-gang-gold pl-4 py-2 text-sm"
                    >
                      <p className="text-gang-gold font-bold">Round {record.round}</p>
                      <p className="text-gray-300">
                        {attacker?.name} vs {defender?.name}
                      </p>
                      <p className={`font-bold ${record.result === 'attacker-win' ? 'text-green-400' : 'text-orange-400'}`}>
                        {record.result === 'attacker-win'
                          ? `${attacker?.name}が勝利`
                          : `${defender?.name}が防衛`}
                      </p>
                      <p className="text-gray-400">{territory?.name}を奪取</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleNextRound}
            className="bg-gang-gold text-gang-black font-bold py-3 px-8 rounded hover:bg-yellow-300 transition"
          >
            ラウンド進行
          </button>
          <button
            onClick={handleEndGame}
            className="bg-red-600 text-white font-bold py-3 px-8 rounded hover:bg-red-700 transition"
          >
            ゲーム終了
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-gang-dark-gray text-gang-gold font-bold py-3 px-8 rounded border-2 border-gang-gold hover:bg-gang-black transition"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    </div>
  )
}