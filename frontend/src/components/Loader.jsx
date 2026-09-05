const Loader = ({ fullScreen = false, label = "Loading" }) => {
  return (
    <div
      className={`${
        fullScreen ? "page-shell min-h-[60vh]" : ""
      } flex items-center justify-center`}
    >
      <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 shadow-sm">
        <span className="h-3 w-3 animate-pulse rounded-full bg-accent" />
        <span className="text-sm font-medium text-slate-600">{label}</span>
      </div>
    </div>
  );
};

export default Loader;
