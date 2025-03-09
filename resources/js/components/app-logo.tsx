export default function AppLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md">
        <img src="/images/plp.png" alt="Pamantasan ng Lungsod ng Pasig Logo" className="h-fit w-fit scale-125 rounded-full dark:bg-white" />
      </div>
      <div className="hidden flex-1 text-left text-sm sm:grid">
        <span className="mb-0.5 truncate leading-none font-semibold">PLP - QMS</span>
      </div>
    </div>
  );
}
