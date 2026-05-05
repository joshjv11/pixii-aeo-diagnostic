type TopNavProps = {
  onMenuToggle: () => void;
  sidebarWidth: number;
};

export default function TopNav({ onMenuToggle, sidebarWidth }: TopNavProps) {
  return (
    <header
      className="flex justify-between items-center h-16 px-4 md:px-8 bg-white/80 backdrop-blur-md border-b border-tertiary-fixed fixed top-0 right-0 z-40"
      style={{
        left: sidebarWidth,
        transition: "left 0.28s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      {/* Mobile hamburger */}
      <button
        type="button"
        aria-label="Open navigation menu"
        onClick={onMenuToggle}
        className="md:hidden text-secondary hover:text-on-background transition-colors p-1 -ml-1"
      >
        <span
          aria-hidden="true"
          className="material-symbols-outlined text-[24px]"
          style={{ fontVariationSettings: "'FILL' 0" }}
        >
          menu
        </span>
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Notifications (coming soon)"
          title="Coming soon"
          disabled
          className="text-secondary transition-colors duration-200 opacity-40 cursor-not-allowed"
        >
          <span
            aria-hidden="true"
            className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            notifications
          </span>
        </button>
        <button
          type="button"
          aria-label="Help (coming soon)"
          title="Coming soon"
          disabled
          className="text-secondary transition-colors duration-200 opacity-40 cursor-not-allowed"
        >
          <span
            aria-hidden="true"
            className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            help_outline
          </span>
        </button>
      </div>
    </header>
  );
}
