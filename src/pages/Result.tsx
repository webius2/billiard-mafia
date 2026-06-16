import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { calculateTeamPoints, getMVP, getRanking } from '../utils/gameLogic'
import { clearGame } from '../utils/storage'

export const Result = () => {
  const navigate = useNavigate()
  const game = useGameStore((state) => state.state.game)
  const resetGame = useGameStore((state) => state.resetGame)

  if (!game) return null

  const redPoints = calculateTeamPoints(game, 'red')
  const blackPoints = calculateTeamPoints(game, 'black')
  const winnerTeam = redPoints > blackPoints ? 'red' : blackPoints > redPoints ? 'black' : null
  const mvp = getMVP(game)
  const rankings = getRanking(game, 'wins')

  const handleBackHome = () => {
    resetGame()
    clearGame()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gang-black to-gang-dark-gray py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Winner */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gang-gold mb-4">🏆 ゲーム終了 🏆</h1>
          {winnerTeam ? (
            <div className="text-4xl font-bold mb-2">
              {winnerTeam === 'red' ? '🔴' : '⚫'}{' '}
              <span className={winnerTeam === 'red' ? 'text-red-400' : 'text-blue-400'}>
                {winnerTeam === 'red' ? 'レッドチーム' : 'ブラックチーム'}
              </span>
              {'の勝利！'}
            </div>
          ) : (
            <div className="text-4xl font-bold text-yellow-400">同点です！</div>
          )}
        </div>

        {/* Final Points */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Red Team */}
          <div className="bg-red-900 bg-opacity-30 border-2 border-red-500 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-red-400 mb-4">レッドチーム</h2>
            <div className="text-5xl font-bold text-gang-gold mb-6">{redPoints} ポイント</div>
            <div className="space-y-3">
              <h3 className="font-bold text-red-300">保有縄張り：</h3>
              {game.territories
                .filter((t: any) => t.owner === 'red')
                .map((t: any) => (
                  <div key={t.id} className="text-sm text-gray-300">
                    {t.name} ({t.points}pt)
                  </div>
                ))}
              {game.territories.filter((t: any) => t.owner === 'red').length === 0 && (
                <p className="text-sm text-gray-500">なし</p>
              )}
            </div>
          </div>

          {/* Black Team */}
          <div className="bg-blue-900 bg-opacity-30 border-2 border-blue-500 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-blue-400 mb-4">ブラックチーム</h2>
            <div className="text-5xl font-bold text-gang-gold mb-6">{blackPoints} ポイント</div>
            <div className="space-y-3">
              <h3 className="font-bold text-blue-300">保有縄張り：</h3>
              {game.territories
                .filter((t: any) => t.owner === 'black')
                .map((t: any) => (
                  <div key={t.id} className="text-sm text-gray-300">
                    {t.name} ({t.points}pt)
                  </div>
                ))}
              {game.territories.filter((t: any) => t.owner === 'black').length === 0 && (
                <p className="text-sm text-gray-500">なし</p>
              )}
            </div>
          </div>
        </div>

        {/* MVP */}
        {mvp && (
          <div className="bg-gang-dark-gray border-2 border-gang-gold rounded-lg p-6 mb-12 text-center">
            <h2 className="text-2xl font-bold text-gang-gold mb-4">🌟 MVP 🌟</h2>
            <p className="text-3xl font-bold text-gang-gold">{mvp.name}</p>
            <p className="text-lg text-gray-300 mt-2">
              勝利数：<span className="text-gang-gold font-bold">{mvp.wins}</span> 敗北数：
              <span className="text-gang-gold font-bold">{mvp.losses}</span>
            </p>
          </div>
        )}

        {/* Rankings */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gang-gold mb-4">🏅 最終成績ランキング</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Win Ranking */}
            <div className="bg-gang-dark-gray rounded-lg p-6">
              <h3 className="text-xl font-bold text-gang-gold mb-4">勝利数ランキング</h3>
              <ol className="space-y-3">
                {rankings.slice(0, 5).map((player, index) => (
                  <li key={player.id} className="flex justify-between items-center">
                    <span className="text-gray-300">
                      <span className="font-bold text-gang-gold">{index + 1}位</span> {player.name}
                    </span>
                    <span className="text-gang-gold font-bold">{player.wins}勝</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Win Rate Ranking */}
            <div className="bg-gang-dark-gray rounded-lg p-6">
              <h3 className="text-xl font-bold text-gang-gold mb-4">勝率ランキング</h3>
              <ol className="space-y-3">
                {getRanking(game, 'winRate')
                  .slice(0, 5)
                  .map((player, index) => (
                    <li key={player.id} className="flex justify-between items-center">
                      <span className="text-gray-300">
                        <span className="font-bold text-gang-gold">{index + 1}位</span> {player.name}
                      </span>
                      <span className="text-gang-gold font-bold">
                        {player.winRate.toFixed(1)}%
                      </span>
                    </li>
                  ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Full Rankings Table */}
        <div className="bg-gang-dark-gray rounded-lg overflow-hidden mb-12">
          <h2 className="text-xl font-bold text-gang-gold p-4 border-b border-gray-700">
            全プレイヤー成績
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gang-black">
                <tr>
                  <th className="px-4 py-2 text-left text-gang-gold">順位</th>
                  <th className="px-4 py-2 text-left text-gang-gold">プレイヤー</th>
                  <th className="px-4 py-2 text-left text-gang-gold">チーム</th>
                  <th className="px-4 py-2 text-center text-gang-gold">勝利</th>
                  <th className="px-4 py-2 text-center text-gang-gold">敗北</th>
                  <th className="px-4 py-2 text-center text-gang-gold">勝率</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((player, index) => (
                  <tr
                    key={player.id}
                    className={index % 2 === 0 ? 'bg-gang-dark-gray' : 'bg-gang-black bg-opacity-50'}
                  >
                    <td className="px-4 py-2 text-gang-gold font-bold">{index + 1}</td>
                    <td className="px-4 py-2 text-gray-300">{player.name}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded text-sm font-bold ${
                          player.team === 'red'
                            ? 'bg-red-900 text-red-300'
                            : 'bg-blue-900 text-blue-300'
                        }`}
                      >
                        {player.team === 'red' ? 'レッド' : 'ブラック'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center text-green-400 font-bold">
                      {player.wins}
                    </td>
                    <td className="px-4 py-2 text-center text-red-400 font-bold">{player.losses}</td>
                    <td className="px-4 py-2 text-center text-gang-gold font-bold">
                      {player.winRate.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleBackHome}
            className="bg-gang-gold text-gang-black font-bold py-3 px-8 rounded hover:bg-yellow-300 transition"
          >
            ホームに戻る
          </button>
          <button
            onClick={() => navigate('/setup')}
            className="bg-gang-dark-gray text-gang-gold font-bold py-3 px-8 rounded border-2 border-gang-gold hover:bg-gang-black transition"
          >
            新しいゲームを作成
          </button>
        </div>
      </div>
    </div>
  )
}