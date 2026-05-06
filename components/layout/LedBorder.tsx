"use client";

export function LedBorder() {
  return (
    <div className="led-frame" aria-hidden="true">
      {/* Top edge */}
      <div className="led-edge led-top">
        <div className="led-orb led-orb-h" style={{ animationDelay: "0s" }} />
      </div>
      {/* Right edge */}
      <div className="led-edge led-right">
        <div className="led-orb led-orb-v" style={{ animationDelay: "1.5s" }} />
      </div>
      {/* Bottom edge — orb reversed */}
      <div className="led-edge led-bottom">
        <div className="led-orb led-orb-h-rev" style={{ animationDelay: "3s" }} />
      </div>
      {/* Left edge — orb reversed */}
      <div className="led-edge led-left">
        <div className="led-orb led-orb-v-rev" style={{ animationDelay: "4.5s" }} />
      </div>
    </div>
  );
}
