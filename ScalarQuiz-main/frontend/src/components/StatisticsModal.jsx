import Modal from './Modal.jsx';

export default function StatisticsModal({ stats, onClose }) {
  const domainEntries = Object.entries(stats.domainAverages || {});

  return (
    <Modal title={`Statistics - ${stats.username}`} onClose={onClose}>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Achievements panel */}
        <div className="rounded-xl border-2 border-primary-light p-5">
          <h3 className="mb-3 font-display text-base font-bold text-primary"> Achievements</h3>
          <p className="mb-3 font-semibold text-success">Points: {stats.achievementPoints}</p>
          {stats.earnedBadges.length === 0 ? (
            <p className="text-sm text-muted">No badges yet!</p>
          ) : (
            <ul className="space-y-2">
              {stats.earnedBadges.map((badge) => (
                <li key={badge} className="text-sm text-ink">
                  {badge}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Performance panel */}
        <div className="rounded-xl border-2 border-primary-light p-5">
          <h3 className="mb-3 font-display text-base font-bold text-primary">Performance</h3>
          <p className="mb-3 text-sm font-bold text-ink">Total Quizzes: {stats.totalQuizzesTaken}</p>
          {domainEntries.length === 0 ? (
            <p className="text-sm text-muted">No quiz data yet!</p>
          ) : (
            <ul className="space-y-2">
              {domainEntries.map(([domain, avg]) => (
                <li key={domain} className="text-sm text-ink">
                  {domain}: <span className="font-semibold">{avg.toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}
