export function MeasurementDiagram({ className = "" }: { className?: string }) {
  return (
    <div className={`border border-line bg-cream px-4 py-6 ${className}`}>
      <svg
        viewBox="0 0 260 400"
        className="w-full h-auto max-w-[220px] mx-auto text-ink"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        role="img"
        aria-label="Diagram showing where on the body to take each measurement"
      >
        {/* body outline */}
        <circle cx="130" cy="28" r="16" />
        <line x1="118" y1="43" x2="114" y2="54" />
        <line x1="142" y1="43" x2="146" y2="54" />

        {/* shoulders */}
        <line x1="98" y1="54" x2="162" y2="54" className="text-moss-deep" />

        {/* torso sides */}
        <polyline points="98,54 92,140 100,180" />
        <polyline points="162,54 168,140 160,180" />

        {/* arms */}
        <polyline points="98,54 68,118 60,172" className="text-moss-deep" />
        <polyline points="162,54 192,118 200,172" />

        {/* legs */}
        <line x1="100" y1="180" x2="94" y2="368" />
        <line x1="122" y1="196" x2="118" y2="368" className="text-moss-deep" />
        <line x1="160" y1="180" x2="166" y2="368" />
        <line x1="138" y1="196" x2="142" y2="368" />
        <line x1="86" y1="371" x2="102" y2="371" />
        <line x1="158" y1="371" x2="174" y2="371" />

        {/* chest measurement */}
        <line x1="70" y1="86" x2="190" y2="86" strokeDasharray="4 4" className="text-accent" />
        {/* waist measurement */}
        <line x1="72" y1="140" x2="188" y2="140" strokeDasharray="4 4" className="text-accent" />
        {/* hip measurement */}
        <line x1="78" y1="180" x2="182" y2="180" strokeDasharray="4 4" className="text-accent" />
        {/* height measurement */}
        <line x1="30" y1="12" x2="30" y2="378" strokeDasharray="4 4" />
        <line x1="24" y1="12" x2="36" y2="12" />
        <line x1="24" y1="378" x2="36" y2="378" />

        {/* labels + leader lines */}
        <g className="text-[9px] uppercase tracking-[0.05em]" stroke="none" fill="currentColor">
          <text x="4" y="198" textAnchor="middle" transform="rotate(-90 12 198)">
            Height
          </text>
          <text x="196" y="52">Shoulder</text>
          <text x="196" y="90">Chest</text>
          <text x="196" y="144">Waist</text>
          <text x="188" y="184">Hips</text>
          <text x="204" y="220">Sleeve</text>
          <text x="126" y="290">Inseam</text>
        </g>
        <line x1="162" y1="54" x2="192" y2="49" strokeDasharray="2 3" />
        <line x1="198" y1="172" x2="204" y2="216" strokeDasharray="2 3" />
        <line x1="122" y1="230" x2="126" y2="280" strokeDasharray="2 3" />
      </svg>
      <p className="text-[11px] text-ink-soft text-center mt-4 leading-relaxed">
        Measure over light clothing, keeping the tape snug but not tight.
      </p>
    </div>
  );
}
