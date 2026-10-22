function ScorePanel() {
  return (
    <section className="grid grid-cols-2 gap-4">
      <div className="card">
        <p className="stat-label">CURRENT SCORE</p>
        <p className="stat-value">000</p>
      </div>

      <div className="card">
        <p className="stat-label">HIGH SCORE</p>
        <p className="stat-value">000</p>
      </div>
    </section>
  );
}

export default ScorePanel;
