import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { saveGame } from '../utils/storage'
import { Player, Territory } from '../types'

export const Round = () => {
  const navigate = useNavigate()
  const game = useGameStore((state) => state.state.game)
  const updateGame = useGameStore((state) => state.updateGame)

  const [step, setStep] = useState<'select-attacker' | 'select-territory' | 'select-players' | 'result'>('select-attacker')
  const [selectedAttacker, setSelectedAttacker] = useState<'red' | 'black' | null>(null)
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null)
  const [selectedAttackerPlayer, setSelectedAttackerPlayer] = useState<Player | null>(null)
  const [selectedDefenderPlayer, setSelectedDefenderPlayer] = useState<Player | null>(null)

  if (!game) return null

  const handleSelectAttacker = (team: 'red' | 'black') => {
    setSelectedAttacker(team)
    setStep('select-territory')
  }

  const handleSelectTerritory = (territory: Territory) => {
    setSelectedTerritory(territory)
    setStep('select-players')
  }

  const handlePlayerSelected = (attackerPlayer: Player, defenderPlayer: Player) => {
    setSelectedAttackerPlayer(attackerPlayer)
    setSelectedDefenderPlayer(defenderPlayer)
    setStep('result')
  }

  const handleResult = (isAttackerWin: boolean) => {
    if (!selectedAttacker || !selectedTerritory || !selectedAttackerPlayer || !selectedDefenderPlayer) return

    const updatedGame = { ...game, round: game.round + 1 }

    // Update territory owner
    const territoryIndex = updatedGame.territories.findIndex((t) => t.id === selectedTerritory)
    if (isAttackerWin) {
      updatedGame.territories[territoryIndex].owner = selectedAttacker
    }

    // Update player stats
    const attackerTeam = selectedAttacker === 'red' ? updatedGame.redTeam : updatedGame.blackTeam
    const defenderTeam = selectedAttacker === 'red' ? updatedGame.blackTeam : updatedGame.redTeam

    const attackerPlayerIndex = attackerTeam.findIndex((p) => p.id === selectedAttackerPlayer.id)
    const defenderPlayerIndex = defenderTeam.findIndex((p) => p.id === selectedDefenderPlayer.id)

    if (isAttackerWin) {
      attackerTeam[attackerPlayerIndex].wins += 1
      defenderTeam[defenderPlayerIndex].losses += 1
    } else {
      attackerTeam[attackerPlayerIndex].losses += 1
      defenderTeam[defenderPlayerIndex].wins += 1
    }

    // Decrease appearances
    attackerTeam[attackerPlayerIndex].appearancesLeft -= 1
    defenderTeam[defenderPlayerIndex].appearancesLeft -= 1

    // Add to history
    updatedGame.history.push({
      round: updatedGame.round,
      attacker: selectedAttackerPlayer.id,
      defender: selectedDefenderPlayer.id,
      territory: selectedTerritory,
      result: isAttackerWin ? 'attacker-win' : 'defender-win',
    })

    updateGame(updatedGame)
    saveGame(updatedGame)
    navigate('/game')
  }

  return (
    <div className="min-h-screen bg-gang-black py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gang-gold mb-8 text-center">Round {game.round + 1}</h1>

        {/* Step 1: Select Attacker */}
        {step === 'select-attacker' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gang-gold">①襲撃側を選択</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => handleSelectAttacker('red')}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-8 px-6 rounded-lg text-xl transition"
              >
                🔴 レッド
              </button>
              <button
                onClick={() => handleSelectAttacker('black')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-8 px-6 rounded-lg text-xl transition"
              >
                ⚫ ブラック
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Select Territory */}
        {step === 'select-territory' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gang-gold">②襲撃先を選択</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {game.territories.map((territory) => (
                <button
                  key={territory.id}
                  onClick={() => handleSelectTerritory(territory.id)}
                  className={`p-4 rounded-lg border-2 hover:scale-105 transition ${
                    territory.owner === 'red'
                      ? 'bg-red-900 bg-opacity-30 border-red-500'
                      : territory.owner === 'black'
                      ? 'bg-blue-900 bg-opacity-30 border-blue-500'
                      : 'bg-gang-dark-gray border-gray-600 hover:border-gang-gold'
                  }`}
                >
                  <h3 className="text-lg font-bold text-gang-gold">{territory.name}</h3>
                  <p className="text-2xl font-bold text-gang-gold">{territory.points}pt</p>
                  <p className="text-sm text-gray-300">
                    {territory.owner === 'red'
                      ? 'レッド領土'
                      : territory.owner === 'black'
                      ? 'ブラック領土'
                      : '中立'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Select Players */}
        {step === 'select-players' && (
          <PlayerSelection
            game={game}
            attackerTeam={selectedAttacker === 'red' ? game.redTeam : game.blackTeam}
            defenderTeam={selectedAttacker === 'red' ? game.blackTeam : game.redTeam}
            attackerTeamName={selectedAttacker === 'red' ? 'レッド' : 'ブラック'}
            defenderTeamName={selectedAttacker === 'red' ? 'ブラック' : 'レッド'}
            selectedTerritory={game.territories.find((t) => t.id === selectedTerritory)}
            onPlayerSelected={handlePlayerSelected}
          />
        )}

        {/* Step 4: Result */}
        {step === 'result' && (
          <div className="space-y-6">
            <div className="bg-gang-dark-gray rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gang-gold mb-4">試合結果を入力</h2>
              <p className="text-lg text-gray-300 mb-2">
                <span className="text-gang-gold font-bold">{selectedAttackerPlayer?.name}</span> vs{' '}
                <span className="text-gang-gold font-bold">{selectedDefenderPlayer?.name}</span>
              </p>
              <p className="text-gray-400">
                {game.territories.find((t) => t.id === selectedTerritory)?.name}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => handleResult(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-6 rounded-lg text-lg transition"
              >
                ✅ 襲撃成功
                <p className="text-sm mt-2">{selectedAttackerPlayer?.name}が勝利</p>
              </button>
              <button
                onClick={() => handleResult(false)}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-6 px-6 rounded-lg text-lg transition"
              >
                🛡️ 防衛成功
                <p className="text-sm mt-2">{selectedDefenderPlayer?.name}が防衛</p>
              </button>
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              if (step === 'select-attacker') {
                navigate('/game')
              } else if (step === 'select-territory') {
                setStep('select-attacker')
                setSelectedAttacker(null)
              } else if (step === 'select-players') {
                setStep('select-territory')
                setSelectedTerritory(null)
              } else {
                setStep('select-players')
              }
            }}
            className="bg-gang-dark-gray text-gang-gold font-bold py-2 px-6 rounded border-2 border-gang-gold hover:bg-gang-black transition"
          >
            戻る
          </button>
        </div>
      </div>
    </div>
  )
}

interface PlayerSelectionProps {
  game: any
  attackerTeam: Player[]
  defenderTeam: Player[]
  attackerTeamName: string
  defenderTeamName: string
  selectedTerritory: any
  onPlayerSelected: (attacker: Player, defender: Player) => void
}

const PlayerSelection = ({
  attackerTeam,
  defenderTeam,
  attackerTeamName,
  defenderTeamName,
  onPlayerSelected,
}: PlayerSelectionProps) => {
  const [selectedAttacker, setSelectedAttacker] = useState<Player | null>(null)
  const [selectedDefender, setSelectedDefender] = useState<Player | null>(null)

  const canSelect = selectedAttacker && selectedDefender && selectedAttacker.appearancesLeft > 0 && selectedDefender.appearancesLeft > 0

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gang-gold">③出場者を選択</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Attacker Selection */}
        <div>
          <h3 className="text-xl font-bold text-red-400 mb-3">襲撃側（{attackerTeamName}）</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {attackerTeam.map((player) => (
              <button
                key={player.id}
                onClick={() => setSelectedAttacker(player)}
                disabled={player.appearancesLeft === 0}
                className={`w-full p-3 rounded text-left font-bold transition ${
                  selectedAttacker?.id === player.id
                    ? 'bg-red-600 text-white'
                    : player.appearancesLeft === 0
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gang-dark-gray text-gray-300 hover:bg-red-900 hover:text-white'
                }`}
              >
                <div className="flex justify-between">
                  <span>{player.name}</span>
                  <span className="text-sm">残り {player.appearancesLeft}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Defender Selection */}
        <div>
          <h3 className="text-xl font-bold text-blue-400 mb-3">防衛側（{defenderTeamName}）</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {defenderTeam.map((player) => (
              <button
                key={player.id}
                onClick={() => setSelectedDefender(player)}
                disabled={player.appearancesLeft === 0}
                className={`w-full p-3 rounded text-left font-bold transition ${
                  selectedDefender?.id === player.id
                    ? 'bg-blue-600 text-white'
                    : player.appearancesLeft === 0
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gang-dark-gray text-gray-300 hover:bg-blue-900 hover:text-white'
                }`}
              >
                <div className="flex justify-between">
                  <span>{player.name}</span>
                  <span className="text-sm">残り {player.appearancesLeft}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Confirm Button */}
      <button
        onClick={() => {
          if (canSelect) {
            onPlayerSelected(selectedAttacker!, selectedDefender!)
          }
        }}
        disabled={!canSelect}
        className={`w-full py-4 rounded-lg font-bold text-lg transition ${
          canSelect
            ? 'bg-gang-gold text-gang-black hover:bg-yellow-300'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        }`}
      >
        選択を確定
      </button>
    </div>
  )
}