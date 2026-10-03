import { TicketCheck } from 'lucide-react';

import type { CheckinPassStats } from './date-utils';

interface CheckinPassesProps {
  passes: CheckinPassStats;
}

const CheckinPasses: React.FC<CheckinPassesProps> = ({ passes }) => (
  <section className="dashboard-panel checkin-passes-panel" aria-labelledby="checkin-passes-title">
    <div className="checkin-passes-icon"><TicketCheck /></div>
    <div className="checkin-passes-main">
      <p className="eyebrow">STREAK REWARD</p>
      <h2 id="checkin-passes-title">Check-in Passes</h2>
      <p>Every 7-day natural streak earns 1 pass. Make-up entries keep your check-in streak intact but do not count toward pass rewards.</p>
    </div>
    <div className="checkin-passes-stats">
      <strong>{passes.available}</strong>
      <span>available</span>
      <small>{passes.earned} earned · {passes.used} used</small>
    </div>
  </section>
);

export default CheckinPasses;
